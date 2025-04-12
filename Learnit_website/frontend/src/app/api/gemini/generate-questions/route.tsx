import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { FillInBlanksQuestion } from '@/app/quizPage/fillblanks/fill-blanks-type';
import crypto from 'crypto';
import { processDocumentWithGemini } from '@/utils/documentProcessor';

// Define request and response types
interface RequestBody {
  quantities: {
    flashcards?: number;
    mcqs?: number;
    matching?: number;
    trueFalse?: number;
    fillInBlanks?: number;
  };
  fileContent: string;
  fileName: string;
  fileType: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface MatchingQuestion {
  id: number;
  question: string;
  leftItems: string[];
  rightItems: string[];
  correctMatches: number[];
}

interface TrueFalseQuestion {
  id: number;
  question: string;
  isTrue: boolean;
}

interface ResponseBody {
  flashcards: Flashcard[];
  mcqs: MCQ[];
  matchingQuestions: MatchingQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  fillInBlanksQuestions: FillInBlanksQuestion[];
}

// Initialize the Gemini API with environment variable
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
  // Don't throw here - let the API route handle it gracefully
}

// Create a safe initialization of the Gemini client
const getGenAI = () => {
  if (!API_KEY) {
    return null;
  }
  try {
    return new GoogleGenerativeAI(API_KEY);
  } catch (error) {
    console.error('Failed to initialize Gemini API client:', error);
    return null;
  }
};

// Function to extract text from PDF - keeping for backward compatibility
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Regular PDF extraction first
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    const textContent = pdfData.text;
    
    console.log('PDF extraction successful, length:', textContent.length);
    
    // If text is minimal or appears to be scanned, add a warning
    if (textContent.trim().length < 100 || 
        textContent.replace(/[^a-zA-Z0-9]/g, '').length < textContent.length * 0.1) {
      console.log('PDF appears to be scanned, content may be limited');
      return textContent || "This appears to be a scanned document with limited text content.";
    }
    
    return textContent;
  } catch (error) {
    console.error('PDF processing failed:', error);
    return "Error extracting PDF content. The file may be corrupted or in an unsupported format.";
  }
}

// Simple in-memory cache
interface CacheEntry {
  timestamp: number;
  data: ResponseBody;
}

// Cache with 24-hour expiry
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const responseCache = new Map<string, CacheEntry>();

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  factor: number; // Exponential factor
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 500, // 500ms
  maxDelay: 5000, // 5 seconds
  factor: 2
};

// Function to generate a cache key
function generateCacheKey(prompt: string): string {
  return crypto.createHash('md5').update(prompt).digest('hex');
}

// Function to check if the cache is valid
function getCachedResponse(key: string): ResponseBody | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  // Check if cache entry is expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
    responseCache.delete(key);
    return null;
  }
  
  return cached.data;
}

// Function to set cache
function setCachedResponse(key: string, data: ResponseBody): void {
  responseCache.set(key, {
    timestamp: Date.now(),
    data
  });
  
  // Clean up old cache entries periodically
  if (responseCache.size > 100) { // Arbitrary limit to prevent memory leaks
    const keysToDelete = [];
    
    for (const [cacheKey, entry] of responseCache.entries()) {
      if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
        keysToDelete.push(cacheKey);
      }
    }
    
    keysToDelete.forEach(key => responseCache.delete(key));
  }
}

// Function to make a request with retry logic
async function requestWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig
): Promise<T> {
  let lastError: any;
  let delay = config.initialDelay;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < config.maxAttempts) {
        // Calculate backoff delay
        delay = Math.min(delay * config.factor, config.maxDelay);
        
        // Add jitter to prevent synchronized retries
        const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
        const actualDelay = Math.floor(delay * jitter);
        
        console.log(`Attempt ${attempt} failed. Retrying after ${actualDelay}ms...`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
  }
  
  throw lastError;
}

// Split content into chunks for parallel processing
function splitContentIntoChunks(text: string, chunkSize: number = 4000): string[] {
  const chunks = [];
  
  // Prefer to split on paragraph or sentence boundaries
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length < chunkSize) {
      currentChunk += paragraph + '\n\n';
    } else {
      // If current paragraph would overflow the chunk, push current chunk and start a new one
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      // If single paragraph > chunkSize, split by sentences
      if (paragraph.length > chunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        currentChunk = '';
        
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length < chunkSize) {
            currentChunk += sentence + ' ';
          } else {
            chunks.push(currentChunk.trim());
            currentChunk = sentence + ' ';
          }
        }
      } else {
        currentChunk = paragraph + '\n\n';
      }
    }
  }
  
  // Add the last chunk if not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Process a single content chunk
async function processContentChunk(
  model: any,
  chunk: string,
  fileName: string,
  fileType: string,
  quantities: any,
  safetySettings: any
): Promise<ResponseBody> {
  // Create a modified prompt for this chunk
  const promptForChunk = `
  You are an educational content creator. Based on the following content, generate educational quiz questions in JSON format.

  File name: ${fileName}
  File type: ${fileType}

  Content: 
  ${chunk}

  ${chunk.trim().length < 50 ? 
    "This is a very short input, possibly just a single word or phrase. Please generate questions about this concept, using your knowledge to expand on the topic and create meaningful educational content related to it." : 
    "Create questions based on the document content."}

  Create the following types of questions:

  1. ${quantities.flashcards} Flashcards (question and answer pairs)
  2. ${quantities.mcqs} Multiple Choice Questions with 4 options each
  3. ${quantities.matching} Matching Questions (with at least 4 pairs to match)
  4. ${quantities.trueFalse} True/False Questions
  5. ${quantities.fillInBlanks} Fill-in-the-blanks Questions

  The questions should cover the main concepts and important information related to the topic.
  If the input is very short, use your knowledge to create educational questions about that topic.

  Return your response in the following JSON format exactly. Do not include any explanations or markdown formatting, just the raw JSON:

  {
    "flashcards": [
      { "question": "...", "answer": "..." },
      ...
    ],
    "mcqs": [
      { "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0 },
      ...
    ],
    "matchingQuestions": [
      { 
        "id": 1, 
        "question": "...", 
        "leftItems": ["...", "...", "...", "..."], 
        "rightItems": ["...", "...", "...", "..."], 
        "correctMatches": [0, 1, 2, 3] 
      },
      ...
    ],
    "trueFalseQuestions": [
      { "id": 1, "question": "...", "isTrue": true },
      ...
    ],
    "fillInBlanksQuestions": [
      {
        "id": "fib-1",
        "question": "Complete the sentence:",
        "textWithBlanks": "Text with [BLANK_0] and [BLANK_1] placeholders",
        "correctAnswers": ["answer1", "answer2"],
        "completeText": "Text with answer1 and answer2 placeholders",
        "explanation": "Explanation of the correct answers",
        "difficulty": "easy"
      },
      ...
    ]
  }
  `;

  const cacheKey = generateCacheKey(promptForChunk);
  const cachedResponse = getCachedResponse(cacheKey);
  
  if (cachedResponse) {
    console.log('Returning cached response for chunk');
    return cachedResponse;
  }

  const result = await requestWithRetry(async () => {
    return model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptForChunk }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  });
  
  if (!result || !result.response) {
    throw new Error('Gemini API returned empty response');
  }
  
  const response = result.response;
  const text = response.text();
  
  // Extract and parse JSON directly
  let parsedResponse: ResponseBody;
  
  try {
    // Try to parse as JSON directly
    parsedResponse = JSON.parse(text.trim());
  } catch (directParseError) {
    // Try to extract JSON with a more efficient regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (jsonError) {
        throw new Error(`Failed to parse JSON response: ${jsonError}`);
      }
    } else {
      throw new Error('No valid JSON found in response');
    }
  }
  
  // Cache the successful response
  setCachedResponse(cacheKey, parsedResponse);
  
  return parsedResponse;
}

// Function to merge multiple response bodies
function mergeResponses(responses: ResponseBody[]): ResponseBody {
  const merged: ResponseBody = {
    flashcards: [],
    mcqs: [],
    matchingQuestions: [],
    trueFalseQuestions: [],
    fillInBlanksQuestions: []
  };
  
  // Merge all arrays and remove duplicates
  for (const response of responses) {
    merged.flashcards.push(...(response.flashcards || []));
    merged.mcqs.push(...(response.mcqs || []));
    merged.matchingQuestions.push(...(response.matchingQuestions || []));
    merged.trueFalseQuestions.push(...(response.trueFalseQuestions || []));
    merged.fillInBlanksQuestions.push(...(response.fillInBlanksQuestions || []));
  }
  
  // Remove duplicate flashcards (based on question)
  merged.flashcards = Array.from(
    new Map(merged.flashcards.map(fc => [fc.question, fc])).values()
  );
  
  // Remove duplicate MCQs
  merged.mcqs = Array.from(
    new Map(merged.mcqs.map(mcq => [mcq.question, mcq])).values()
  );
  
  // Ensure unique IDs for matching questions
  merged.matchingQuestions = merged.matchingQuestions.map((q, index) => ({
    ...q,
    id: index + 1
  }));
  
  // Ensure unique IDs for true/false questions
  merged.trueFalseQuestions = merged.trueFalseQuestions.map((q, index) => ({
    ...q,
    id: index + 1
  }));
  
  // Ensure unique IDs for fill-in-blanks questions
  merged.fillInBlanksQuestions = merged.fillInBlanksQuestions.map((q, index) => ({
    ...q,
    id: `fib-${index + 1}`
  }));
  
  return merged;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Gemini client
    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API client initialization failed. Check your API key.' },
        { status: 500 }
      );
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body format' }, { status: 400 });
    }

    const { fileContent, fileName, fileType, quantities } = body;

    // Log API request for debugging
    console.log(`Processing file: ${fileName}, type: ${fileType}`);
    
    // Validate input
    if (!fileContent) {
      console.error('Missing file content');
      return NextResponse.json({ error: 'File content is required' }, { status: 400 });
    }

    if (!fileName) {
      console.error('Missing file name');
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Create a model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Configure safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Extract text using the new document processor
    let textContent = '';
    
    try {
      // Use the new document processor with Gemini API and fallback
      textContent = await processDocumentWithGemini(fileContent, fileName, fileType);
      
      // Add explicit check for empty/minimal content
      if (!textContent || textContent.trim().length === 0) {
        console.warn('Extracted content is empty');
        textContent = "No text content could be extracted from this file. Please try a different file format.";
      }
      
    } catch (error) {
      // Handle extraction error
      console.error('Error extracting file content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown extraction error occurred';
      return NextResponse.json(
        { error: `Failed to extract content from ${fileName}. Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Default quantities if not provided
    const defaultQuantities = {
      flashcards: quantities?.flashcards || 5,
      mcqs: quantities?.mcqs || 5,
      matching: quantities?.matching || 2,
      trueFalse: quantities?.trueFalse || 5,
      fillInBlanks: quantities?.fillInBlanks || 5
    };

    try {
      console.log('Preparing to process content with Gemini API...');
      
      // If text is very short, don't split into chunks
      if (textContent.length < 3000) {
        // For short content, just process normally with a single request
        const result = await processContentChunk(
          model, 
          textContent, 
          fileName, 
          fileType, 
          defaultQuantities,
          safetySettings
        );
        
        return NextResponse.json(result, { 
          status: 200,
          headers: {
            'Cache-Control': 'max-age=3600, must-revalidate',
            'Content-Type': 'application/json'
          }
        });
      }
      
      // For longer content, split into chunks and process in parallel
      console.log('Splitting content into chunks for parallel processing');
      const chunks = splitContentIntoChunks(textContent);
      console.log(`Split content into ${chunks.length} chunks for parallel processing`);
      
      // Calculate how many questions to generate per chunk
      const chunksCount = chunks.length;
      const chunkQuantities = {
        flashcards: Math.ceil(defaultQuantities.flashcards / chunksCount),
        mcqs: Math.ceil(defaultQuantities.mcqs / chunksCount),
        matching: Math.max(1, Math.floor(defaultQuantities.matching / chunksCount)),
        trueFalse: Math.ceil(defaultQuantities.trueFalse / chunksCount),
        fillInBlanks: Math.ceil(defaultQuantities.fillInBlanks / chunksCount)
      };
      
      // Process all chunks in parallel
      const chunkPromises = chunks.map(chunk => 
        processContentChunk(
          model, 
          chunk, 
          fileName, 
          fileType, 
          chunkQuantities,
          safetySettings
        )
      );
      
      // Wait for all chunks to be processed
      const chunkResults = await Promise.all(chunkPromises);
      
      // Merge all responses
      const mergedResult = mergeResponses(chunkResults);
      
      // Limit results to requested quantities
      if (mergedResult.flashcards.length > defaultQuantities.flashcards) {
        mergedResult.flashcards = mergedResult.flashcards.slice(0, defaultQuantities.flashcards);
      }
      
      if (mergedResult.mcqs.length > defaultQuantities.mcqs) {
        mergedResult.mcqs = mergedResult.mcqs.slice(0, defaultQuantities.mcqs);
      }
      
      if (mergedResult.matchingQuestions.length > defaultQuantities.matching) {
        mergedResult.matchingQuestions = mergedResult.matchingQuestions.slice(0, defaultQuantities.matching);
      }
      
      if (mergedResult.trueFalseQuestions.length > defaultQuantities.trueFalse) {
        mergedResult.trueFalseQuestions = mergedResult.trueFalseQuestions.slice(0, defaultQuantities.trueFalse);
      }
      
      if (mergedResult.fillInBlanksQuestions.length > defaultQuantities.fillInBlanks) {
        mergedResult.fillInBlanksQuestions = mergedResult.fillInBlanksQuestions.slice(0, defaultQuantities.fillInBlanks);
      }
      
      // Return the merged results
      console.log('Sending successful response to client');
      return NextResponse.json(mergedResult, { 
        status: 200,
        headers: {
          'Cache-Control': 'max-age=3600, must-revalidate',
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      // Handle Gemini API error
      console.error("Gemini API error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini API error occurred';
      
      // Default fallback data
      const fallbackData: ResponseBody = {
        flashcards: [
          { question: "What does this document cover?", answer: "Content from the uploaded file" }
        ],
        mcqs: [
          { 
            question: "What is contained in this document?", 
            options: ["File content", "Random data", "Empty data", "Unknown"], 
            correctAnswer: 0 
          }
        ],
        matchingQuestions: [
          {
            id: 1,
            question: "Match items from the document:",
            leftItems: ["Item 1", "Item 2", "Item 3", "Item 4"],
            rightItems: ["Description 1", "Description 2", "Description 3", "Description 4"],
            correctMatches: [0, 1, 2, 3]
          }
        ],
        trueFalseQuestions: [
          { id: 1, question: "This is content from the uploaded file.", isTrue: true }
        ],
        fillInBlanksQuestions: [
          {
            id: "fib-1",
            question: "Complete the sentence about the document:",
            textWithBlanks: "This document contains [BLANK_0] from the uploaded [BLANK_1].",
            correctAnswers: ["content", "file"],
            completeText: "This document contains content from the uploaded file.",
            explanation: "This is a simple fill-in-the-blanks question about the document.",
            difficulty: "easy"
          }
        ]
      };
      
      return NextResponse.json(
        fallbackData,
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}