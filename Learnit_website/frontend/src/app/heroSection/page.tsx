// components/HeroSection.tsx
'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import QuizPage from '../quizPage/quizPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { MCQ } from '../quizPage/MCQS/mcq-types';
import { MCQGenerator } from '../quizPage/MCQS/mcq-utils';
import { Flashcard } from '../quizPage/flashcards/flashcard-types';
import { FlashcardGenerator } from '../quizPage/flashcards/flashcard-utils';
import { TrueFalseQuestion } from '../quizPage/trueOrFalse/true-false-type';
import { TrueFalseQuestionGenerator } from '../quizPage/trueOrFalse/true-false-utils';
import { MatchingQuestion } from '../quizPage/matching-questions/matching-question-type';
import { MatchingQuestionGenerator } from '../quizPage/matching-questions/matching-question-utils';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FillInBlanksQuestion } from '../quizPage/fillblanks/fill-blanks-type';
// Import our document storage service
import { addDocument, 
  getRecentDocuments,
  getCurrentDocument,
  setCurrentDocument, 
  migrateSessionToLocalStorage,
  handleUserLogin,
  handleUserLogout,
  recordQuizGeneration,
  getStreakInfo,
  saveQuizState,
  getSavedQuizState,
  clearSavedQuizState,
  uploadDocumentToMongoDB,
  updateDocumentInMongoDB,
  saveQuestionsForDocument,
  saveQuestionDirectlyToMongoDB,
  getCachedApiResponse,
  cacheApiResponse,
  hasReachedDailyLimit,
  getRemainingDailyUses } from '../services/documentStorage';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pdftoflashcard.onrender.com/api';

interface GeminiRequest {
  fileContent: string;
  fileName: string;
  fileType: string;
  customPrompt?: string;
  quantities?: {
    flashcards: number;
    mcqs: number;
    matching: number;
    trueFalse: number;
  }
}

interface GeminiResponse {
  flashcards: Flashcard[];
  mcqs: MCQ[];
  matchingQuestions: MatchingQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  fillInBlanksQuestions: FillInBlanksQuestion[];
}

const SUPPORTED_FILE_TYPES = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.csv'];

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAZMjzJiFYIbd0DiqNX_HykaUxwxGvrLE';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [matchingQuestions, setMatchingQuestions] = useState<MatchingQuestion[]>([]);
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<TrueFalseQuestion[]>([]);
  const [fillInBlanksQuestions, setFillInBlankQuestions] = useState<FillInBlanksQuestion[]>([]);

  const [showQuizPage, setShowQuizPage] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'reading' | 'extracting' | 'generating'>('idle');
  const [extractedTextPreview, setExtractedTextPreview] = useState<string | null>(null);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [processedFiles, setProcessedFiles] = useState<number>(0);
  const [processingFilename, setProcessingFilename] = useState<string>('');
  const [useCustomPrompt, setUseCustomPrompt] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [questionQuantities, setQuestionQuantities] = useState({
    flashcards: 5,
    mcqs: 5,
    matching: 2,
    trueFalse: 5,
    fillInBlanks: 5
  });
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [customText, setCustomText] = useState<string>('');
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [userStreak, setUserStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);
  const [remainingUses, setRemainingUses] = useState<number>(5);
  
  const [loadingMessages, setLoadingMessages] = useState<string[]>([
    "Collecting facts from your document...",
    "Organizing key concepts...",
    "Crafting challenging questions...",
    "Designing multiple choice options...",
    "Creating matching pairs...",
    "Building true/false statements...",
    "Generating interactive quiz elements...",
    "Preparing your personalized learning materials..."
  ]);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(loadingMessages[0]);
  
  const [loadingProgress, setLoadingProgress] = useState({
    flashcards: 0,
    mcqs: 0,
    matching: 0,
    trueFalse: 0,
    fillInBlanks: 0
  });
  
  useEffect(() => {
    setIsProcessing(processingStatus !== 'idle');
  }, [processingStatus]);
  
  // Demo data fallbacks
  const demoFlashcards = FlashcardGenerator.getDemoFlashcards();
  const demoMCQs = MCQGenerator.getDemoMCQs();
  const demoMatchingQuestions = MatchingQuestionGenerator.getDemoMatchingQuestions();
  const demoTrueFalseQuestions = TrueFalseQuestionGenerator.getDemoTrueFalseQuestions();

  // Near the top of the component after useState declarations, add this debounce hook
  const useDebounce = (value: any, delay: number = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  // Near the generateQuestions function, add client-side shuffling
  const shuffleMCQOptions = (mcq: any) => {
    const shuffledMCQ = { ...mcq };
    const indices = shuffledMCQ.options.map((_: any, index: number) => index);
    
    // Fisher-Yates shuffle algorithm
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const newOptions = indices.map((index: number) => shuffledMCQ.options[index]);
    const newCorrectAnswerIndex = indices.indexOf(shuffledMCQ.correctAnswer);
    
    return {
      ...shuffledMCQ,
      options: newOptions,
      correctAnswer: newCorrectAnswerIndex
    };
  };

  // Replace the existing generateQuestions function with this optimized one
  const generateQuestions = async (
    fileContent: string, 
    file: File, 
    fileType: string, 
    questionQuantities: any,
    customPrompt?: string
  ): Promise<any> => {
    try {
      setProcessingStatus('generating');
      
      // Create a cache key based on file and request parameters
      const cacheKey = `${file.name}-${file.size}-${file.lastModified}-${JSON.stringify(questionQuantities)}`;
      
      // Check if we have a cached response
      const cachedResponse = getCachedApiResponse('/api/gemini/generate-questions', {
        fileContent,
        fileName: file.name,
        fileType: fileType,
        quantities: questionQuantities,
        customPrompt
      }, { cacheKey });
      
      if (cachedResponse) {
        console.log("Using cached API response");
        
        // Process MCQs client-side to shuffle options
        if (cachedResponse.mcqs && Array.isArray(cachedResponse.mcqs)) {
          cachedResponse.mcqs = cachedResponse.mcqs.map((mcq: any) => shuffleMCQOptions(mcq));
        }
        
        return cachedResponse;
      }
      
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent,
          fileName: file.name,
          fileType: fileType,
          quantities: questionQuantities,
          customPrompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error calling Gemini API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process MCQs client-side to shuffle options
      if (data.mcqs && Array.isArray(data.mcqs)) {
        data.mcqs = data.mcqs.map((mcq: any) => shuffleMCQOptions(mcq));
      }
      
      // Cache the API response for future use
      cacheApiResponse('/api/gemini/generate-questions', {
        fileContent,
        fileName: file.name,
        fileType: fileType,
        quantities: questionQuantities,
        customPrompt
      }, data, { cacheKey });
      
      return data;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Check daily usage limit and remaining uses
    setHasReachedLimit(hasReachedDailyLimit());
    setRemainingUses(getRemainingDailyUses());
    
    // Try to migrate any pending document data from session storage
    migrateSessionToLocalStorage();
    
    // Load recent documents
    setRecentDocuments(getRecentDocuments(5));
    
    // Load streak info
    setUserStreak(getStreakInfo());
    setStartTime(Date.now());
  
    // Check for saved quiz state
    const savedQuiz = getSavedQuizState();
    if (savedQuiz) {
      // Restore the quiz state
      setFile(savedQuiz.file);
      setFlashcards(savedQuiz.flashcards || []);
      setMcqs(savedQuiz.mcqs || []);
      setMatchingQuestions(savedQuiz.matchingQuestions || []);
      setTrueFalseQuestions(savedQuiz.trueFalseQuestions || []);
      setFillInBlankQuestions(savedQuiz.fillInBlanksQuestions || []);
      
      // Show the quiz page
      setShowQuizPage(true);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAuthLoading(false);
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      
      if (currentUser) {
        // User logged in - update storage
        handleUserLogin(currentUser.uid);
        
        // Process any pending files
        if (pendingFiles) {
          processMultipleFiles(pendingFiles);
          setPendingFiles(null);
        }
      } else {
        // User logged out
        handleUserLogout();
      }
    });
  
    return () => unsubscribe();
  }, [pendingFiles]);
  
  const saveCurrentQuizState = () => {
    if (!file) return; // Don't save if there's no file
    
    const quizData = {
      file: file,
      flashcards: flashcards,
      mcqs: mcqs,
      matchingQuestions: matchingQuestions,
      trueFalseQuestions: trueFalseQuestions,
      fillInBlanksQuestions: fillInBlanksQuestions
    };
    
    // Save to local storage immediately
    saveQuizState(quizData);
    
    // Get the current document
    const currentDoc = getCurrentDocument();
    if (currentDoc) {
      // Save to MongoDB asynchronously without waiting
      const questions = {
        flashcards: flashcards,
        mcqs: mcqs,
        matchingQuestions: matchingQuestions,
        trueFalseQuestions: trueFalseQuestions,
        fillInBlanksQuestions: fillInBlanksQuestions
      };
      
      // Save to localStorage immediately
      saveQuestionsForDocument(currentDoc.id, questions);
      
      // Save to MongoDB in the background
      saveQuestionDirectlyToMongoDB(currentDoc.id, questions)
        .then(success => {
          if (success) {
            console.log('Successfully saved questions to MongoDB');
          } else {
            console.warn('Failed to save questions to MongoDB');
          }
        })
        .catch(error => {
          console.error('Error saving to MongoDB:', error);
        });
    }
  };
  const handleAuthRequiredAction = () => {
    if (!isLoggedIn && !isAuthLoading) {
      if (file) {
        // Store file info in session storage for recovery after login
        sessionStorage.setItem('pendingFileName', file.name);
        sessionStorage.setItem('pendingFileSize', file.size.toString());
        sessionStorage.setItem('pendingFileType', file.type);
      }
      
      toast.info("Just one more step to create your quiz!", {
        description: "Please log in to continue processing your document"
      });
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (hasReachedLimit) {
      toast.error("You've reached your daily usage limit. Upgrade to Pro for unlimited usage!");
      router.push('/subscriptions');
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setPendingFiles(e.dataTransfer.files);
      
      if (!handleAuthRequiredAction()) return;
    }
  };
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (hasReachedLimit) {
        toast.error("You've reached your daily usage limit. Upgrade to Pro for unlimited usage!");
        router.push('/subscriptions');
        return;
      }
      setFile(e.target.files[0]);
      setPendingFiles(e.target.files);
      
      if (!handleAuthRequiredAction()) return;
    }
  };

  const handleCustomTextSubmit = async () => {
    if (!customText.trim()) {
      setFileError("Please enter some text content first.");
      return;
    }
    
    if (hasReachedLimit) {
      toast.error("You've reached your daily usage limit. Upgrade to Pro for unlimited usage!");
      router.push('/subscriptions');
      return;
    }
    
    try {
      setIsGenerating(true);
      setProcessingStatus('reading');
      
      // Create a unique filename based on timestamp and content preview
      const timestamp = new Date().getTime();
      const contentPreview = customText.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `custom_text_${contentPreview}_${timestamp}.txt`;
      
      // Create a virtual file for processing
      const textBlob = new Blob([customText], { type: 'text/plain' });
      const textFile = new File([textBlob], fileName, { type: 'text/plain' });
      setFile(textFile);
      setFileError(null);
      
      // Process the custom text with custom prompt if provided
      await processDocument(textFile);
      
      // Clear the custom prompt after successful processing
      if (useCustomPrompt) {
        setCustomPrompt('');
        setUseCustomPrompt(false);
      }
    } catch (error) {
      console.error("Error processing custom text:", error);
      setFileError("Error processing your text. Please try again.");
      setIsGenerating(false);
      setProcessingStatus('idle');
    }
  };
  

  const checkFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return SUPPORTED_FILE_TYPES.some(ext => fileName.endsWith(ext));
  };

  // Update the readFileContent to use worker
  const readFileContent = (file: File): Promise<string> => {
    // Create worker lazily only when in browser context
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        // Create a worker instance
        const worker = new Worker('/fileProcessingWorker.js');
        
        return new Promise((resolve, reject) => {
          worker.onmessage = (event) => {
            if (event.data.error) {
              reject(new Error(event.data.error));
              worker.terminate(); // Clean up the worker
            } else {
              resolve(event.data.content);
              worker.terminate(); // Clean up the worker
            }
          };
          
          worker.onerror = (error) => {
            reject(new Error(`Worker error: ${error.message}`));
            worker.terminate(); // Clean up the worker
          };
          
          // Send file to worker
          worker.postMessage({ file });
        });
      } catch (error) {
        console.error("Worker error, falling back to main thread file reading:", error);
        // Fallback to the original method if worker fails
        return fallbackReadFileContent(file);
      }
    } else {
      // Fall back to standard method for environments without Worker support
      return fallbackReadFileContent(file);
    }
  };
  
  // The original method as a fallback
  const fallbackReadFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const getFileType = (fileName: string): string => {
    const lowerCaseName = fileName.toLowerCase();
    const extension = lowerCaseName.split('.').pop() || '';
    
    if (extension === 'pdf') return 'pdf';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['txt', 'rtf', 'md'].includes(extension)) return 'text';
    return 'unknown';
  };

  const processMultipleFiles = async (files: FileList) => {
    setFileError(null);
    setApiError(null);
    
    const fileArray = Array.from(files);
    const allMcqs: MCQ[] = [];
    const allFlashcards: Flashcard[] = [];
    const allMatchingQuestions: MatchingQuestion[] = [];
    const allTrueFalseQuestions: TrueFalseQuestion[] = [];
    const allFillInBlanksQuestions: FillInBlanksQuestion[] = [];
    
    const supportedFiles = fileArray.filter(file => checkFileType(file));
    
    if (supportedFiles.length === 0) {
      setFileError(`No supported files found. Please upload one of these formats: ${SUPPORTED_FILE_TYPES.join(', ')}`);
      return;
    }
    
    setTotalFiles(supportedFiles.length);
    setProcessedFiles(0);
    setProcessingStatus('reading');
    
    try {
      for (let i = 0; i < supportedFiles.length; i++) {
        const currentFile = supportedFiles[i];
        setFile(currentFile);
        setProcessingFilename(currentFile.name);
        setProcessedFiles(i);
        
        const previewText = `Processing file ${i+1} of ${supportedFiles.length}: ${currentFile.name}...`;
        setExtractedTextPreview(previewText);
        
        // Generate questions with Gemini API - one call per file
        setProcessingStatus('generating');
        console.log(`Sending request to Gemini API (${i+1}/${supportedFiles.length}): ${currentFile.name}`);
        const generatedQuestions = await generateQuestionsWithGemini(currentFile);
        console.log(`Successfully received response from Gemini API for file ${i+1}`);
        
        // Only after questions are generated, save document to MongoDB
        console.log('Now saving to MongoDB...');
        // Upload document to MongoDB
        const uploadedDoc = await uploadDocumentToMongoDB(
          currentFile,
          user?.uid || 'anonymous',
          previewText
        );
        
        // Add to local storage as well
        const newDoc = addDocument(currentFile, previewText);
        
        // Update the MongoDB document with generated questions
        if (generatedQuestions) {
          await updateDocumentInMongoDB(uploadedDoc._id, {
            questions: {
              flashcards: generatedQuestions.flashcards,
              mcqs: generatedQuestions.mcqs,
              matchingQuestions: generatedQuestions.matchingQuestions,
              trueFalseQuestions: generatedQuestions.trueFalseQuestions,
              fillInBlanksQuestions: generatedQuestions.fillInBlanksQuestions
            }
          });
        }
        
        allFlashcards.push(...(generatedQuestions?.flashcards || []));
        allMcqs.push(...(generatedQuestions?.mcqs || []));
        allMatchingQuestions.push(...(generatedQuestions?.matchingQuestions || []));
        allTrueFalseQuestions.push(...(generatedQuestions?.trueFalseQuestions || []));
        allFillInBlanksQuestions.push(...(generatedQuestions?.fillInBlanksQuestions || []));
        
        // Record this generation in user progress
        const endTime = Date.now();
        const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);
        
        // Check if newDoc is not null before using it
        if (newDoc && generatedQuestions) {
          recordQuizGeneration(newDoc.id, {
            flashcards: generatedQuestions.flashcards.length,
            mcqs: generatedQuestions.mcqs.length,
            matching: generatedQuestions.matchingQuestions.length,
            trueFalse: generatedQuestions.trueFalseQuestions.length,
            fillInBlanks: generatedQuestions.fillInBlanksQuestions?.length || 0
          }, timeSpentSeconds);
        }
      }
      
      // Update recent documents list
      setRecentDocuments(getRecentDocuments(5));
      
      // Update streak info
      setUserStreak(getStreakInfo());
      
      setFlashcards(allFlashcards);
      setMcqs(allMcqs);
      setMatchingQuestions(allMatchingQuestions);
      setTrueFalseQuestions(allTrueFalseQuestions);
      setFillInBlankQuestions(allFillInBlanksQuestions);
      saveCurrentQuizState();
  
      setShowQuizPage(true);
    } catch (error) {
      console.error("Error processing files:", error);
      setApiError("An error occurred while processing your files. Please try again.");
      
      setFlashcards(demoFlashcards);
      setMcqs(demoMCQs);
      setMatchingQuestions(demoMatchingQuestions);
      setTrueFalseQuestions(demoTrueFalseQuestions);
      saveCurrentQuizState();
  
      setShowQuizPage(true);
    } finally {
      setProcessingStatus('idle');
      setTotalFiles(0);
      setProcessedFiles(0);
    }
  };


  const generateQuestionsWithGemini = async (file: File) => {
    try {
      const fileContent = await readFileContent(file);
      const fileType = getFileType(file.name);
      
      // Check if content is too large FIRST, before making any API calls
      // A rough estimate is 4 characters per token
      const isContentTooLarge = fileContent.length > 2800000; // ~700K tokens
      console.log(`Document size check: ${fileContent.length} characters, Too large? ${isContentTooLarge}`);
      
      if (isContentTooLarge) {
        // Handle large content by chunking
        console.log("Document too large, processing in chunks...");
        setCurrentLoadingMessage("Document is very large. Processing in chunks...");
        
        // Define chunk size (approx. 150K tokens per chunk)
        const CHUNK_SIZE = 600000; // ~150K tokens per chunk
        
        // Split content into manageable chunks
        const chunks = [];
        for (let i = 0; i < fileContent.length; i += CHUNK_SIZE) {
          chunks.push(fileContent.slice(i, i + CHUNK_SIZE));
        }
        
        console.log(`Document split into ${chunks.length} chunks`);
        
        // Initialize combined results
        const combinedResults: GeminiResponse = {
          flashcards: [],
          mcqs: [],
          matchingQuestions: [],
          trueFalseQuestions: [],
          fillInBlanksQuestions: []
        };
        
        // Create the base prompt template
        const basePromptTemplate = (content: string) => `
        You are an educational content creator. Based on the following content, generate educational quiz questions in JSON format.

        File name: ${file.name}
        File type: ${fileType}

        Content: 
        ${content}

        Create the following types of questions:

        1. ${questionQuantities.flashcards} Flashcards (question and answer pairs)
        2. ${questionQuantities.mcqs} Multiple Choice Questions with 4 options each
        3. ${questionQuantities.matching} Matching Questions (with at least 4 pairs to match)
        4. ${questionQuantities.trueFalse} True/False Questions
        5. ${questionQuantities.fillInBlanks || 5} Fill-in-the-blanks Questions

        The questions should cover the main concepts and important information related to the topic.
        
        dont give me any questions about the file name or file type or its properties.o ranything about pdfs or documents
        `;

        // Add custom prompt if provided
        const finalPromptTemplate = (content: string) => 
          customPrompt 
            ? `${basePromptTemplate(content)}\n\nAdditional Instructions:\n${customPrompt}\n\n`
            : basePromptTemplate(content);

        const jsonFormatInstructions = `\n\nThe questions should be in the following JSON format exactly. Do not include any explanations or markdown formatting, just the raw JSON:
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
        }`;

        // Process each chunk with appropriate context
        for (let i = 0; i < chunks.length; i++) {
          setCurrentLoadingMessage(`Processing document chunk ${i+1} of ${chunks.length}...`);
          
          const chunkPrompt = finalPromptTemplate(
            `[THIS IS CHUNK ${i+1} OF ${chunks.length}]\n\n${chunks[i]}`
          ) + jsonFormatInstructions + `\n\nIMPORTANT: This is chunk ${i+1} of ${chunks.length}. Focus on generating questions ONLY from this section of the document.`;
          
          try {
            const streamingResponse = await model.generateContentStream({
              contents: [{ role: 'user', parts: [{ text: chunkPrompt }] }],
              safetySettings,
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              },
            });
            
            // Process streaming response as in the original function
            let aggregatedResponse = '';
            const partialResponses: GeminiResponse = {
              flashcards: [],
              mcqs: [],
              matchingQuestions: [],
              trueFalseQuestions: [],
              fillInBlanksQuestions: []
            };
            
            for await (const chunk of streamingResponse.stream) {
              const chunkText = chunk.text();
              aggregatedResponse += chunkText;
              
              // Try to extract partial content as it arrives
              try {
                const partial = manuallyExtractQuestions(aggregatedResponse);
                
                // Update UI with partial results as they become available
                if (partial.flashcards?.length && partial.flashcards.length > partialResponses.flashcards.length) {
                  partialResponses.flashcards = partial.flashcards;
                  setCurrentLoadingMessage(`Generated ${partial.flashcards.length} flashcards so far...`);
                  
                  // Update loading progress
                  const progress = Math.min(100, Math.round((partial.flashcards.length / questionQuantities.flashcards) * 100));
                  setLoadingProgress(prev => ({...prev, flashcards: progress}));
                  
                  // Show flashcards as soon as we have any
                  if (partial.flashcards.length > 0) {
                    const processedFlashcards = FlashcardGenerator.processFlashcards(partial.flashcards);
                    setFlashcards(processedFlashcards);
                    
                    // If we don't have any questions showing yet, show the quiz page with partial results
                    if (!showQuizPage) {
                      setCurrentLoadingMessage("Showing flashcards while generating more questions...");
                      setShowQuizPage(true);
                    }
                  }
                }
                
                if (partial.mcqs?.length && partial.mcqs.length > partialResponses.mcqs.length) {
                  partialResponses.mcqs = partial.mcqs;
                  setCurrentLoadingMessage(`Generated ${partial.mcqs.length} multiple choice questions...`);
                  
                  // Update loading progress
                  const progress = Math.min(100, Math.round((partial.mcqs.length / questionQuantities.mcqs) * 100));
                  setLoadingProgress(prev => ({...prev, mcqs: progress}));
                  
                  // Update MCQs as soon as we have any
                  if (partial.mcqs.length > 0) {
                    const processedMCQs = partial.mcqs.map(mcq => MCQGenerator.shuffleMCQOptions(mcq));
                    setMcqs(processedMCQs);
                    
                    // Update saved quiz state with new MCQs
                    saveCurrentQuizState();
                  }
                }
                
                if (partial.matchingQuestions?.length && partial.matchingQuestions.length > partialResponses.matchingQuestions.length) {
                  partialResponses.matchingQuestions = partial.matchingQuestions;
                  setCurrentLoadingMessage(`Created ${partial.matchingQuestions.length} matching questions...`);
                  
                  // Update loading progress
                  const progress = Math.min(100, Math.round((partial.matchingQuestions.length / questionQuantities.matching) * 100));
                  setLoadingProgress(prev => ({...prev, matching: progress}));
                  
                  // Update matching questions as soon as we have any
                  if (partial.matchingQuestions.length > 0) {
                    const processedMatchingQuestions = partial.matchingQuestions.map(q => {
                      const shuffledIndices = [...Array(q.rightItems.length).keys()];
                      for (let i = shuffledIndices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
                      }
                      
                      const shuffledRightItems = shuffledIndices.map(i => q.rightItems[i]);
                      const newCorrectMatches = q.correctMatches.map(originalIndex => 
                        shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
                      );
                      
                      return {
                        ...q,
                        rightItems: shuffledRightItems,
                        correctMatches: newCorrectMatches
                      };
                    });
                    
                    setMatchingQuestions(processedMatchingQuestions);
                    saveCurrentQuizState();
                  }
                }
                
                if (partial.trueFalseQuestions?.length && partial.trueFalseQuestions.length > partialResponses.trueFalseQuestions.length) {
                  partialResponses.trueFalseQuestions = partial.trueFalseQuestions;
                  setCurrentLoadingMessage(`Added ${partial.trueFalseQuestions.length} true/false questions...`);
                  
                  // Update loading progress
                  const progress = Math.min(100, Math.round((partial.trueFalseQuestions.length / questionQuantities.trueFalse) * 100));
                  setLoadingProgress(prev => ({...prev, trueFalse: progress}));
                  
                  // Update true/false questions as soon as we have any
                  if (partial.trueFalseQuestions.length > 0) {
                    const processedTrueFalseQuestions = TrueFalseQuestionGenerator.balanceTrueFalseQuestions(partial.trueFalseQuestions);
                    setTrueFalseQuestions(processedTrueFalseQuestions);
                    saveCurrentQuizState();
                  }
                }
                
                if (partial.fillInBlanksQuestions?.length && partial.fillInBlanksQuestions.length > partialResponses.fillInBlanksQuestions.length) {
                  partialResponses.fillInBlanksQuestions = partial.fillInBlanksQuestions;
                  setCurrentLoadingMessage(`Created ${partial.fillInBlanksQuestions.length} fill-in-blanks questions...`);
                  
                  // Update loading progress
                  const progress = Math.min(100, Math.round((partial.fillInBlanksQuestions.length / questionQuantities.fillInBlanks) * 100));
                  setLoadingProgress(prev => ({...prev, fillInBlanks: progress}));
                  
                  // Update fill-in-blanks as soon as we have any
                  if (partial.fillInBlanksQuestions.length > 0) {
                    setFillInBlankQuestions(partial.fillInBlanksQuestions);
                    saveCurrentQuizState();
                  }
                }
              } catch (e) {
                // Ignore errors during partial extraction
              }
            }
            
            setCurrentLoadingMessage("Finalizing your quiz questions...");
            
            // Use manual extraction for the final response instead of JSON parsing
            const extractedQuestions = manuallyExtractQuestions(aggregatedResponse);
            console.log('Manually extracted questions from Gemini API response');
            
            // Default fallback data
            const fallbackData: GeminiResponse = {
              flashcards: [
                { question: "What does this document cover?", answer: "Content from the uploaded file", front: "What does this document cover?" }
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
                { id: 1, question: "This is content from the uploaded file.", isTrue: true, explanation: "This is a basic true/false question about the document content." }
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
            
            // Use extracted questions if available, otherwise use fallback data
            const validatedResponse: GeminiResponse = {
              flashcards: extractedQuestions.flashcards.length > 0 ? extractedQuestions.flashcards : fallbackData.flashcards,
              mcqs: extractedQuestions.mcqs.length > 0 ? extractedQuestions.mcqs : fallbackData.mcqs,
              matchingQuestions: extractedQuestions.matchingQuestions.length > 0 ? extractedQuestions.matchingQuestions : fallbackData.matchingQuestions,
              trueFalseQuestions: extractedQuestions.trueFalseQuestions.length > 0 ? extractedQuestions.trueFalseQuestions : fallbackData.trueFalseQuestions,
              fillInBlanksQuestions: extractedQuestions.fillInBlanksQuestions.length > 0 ? extractedQuestions.fillInBlanksQuestions : fallbackData.fillInBlanksQuestions
            };
            
            const processedFlashcards = FlashcardGenerator.processFlashcards(validatedResponse.flashcards);
            let processedMCQs = validatedResponse.mcqs.map((mcq: MCQ) => MCQGenerator.shuffleMCQOptions(mcq));
            
            if (!MCQGenerator.validateMCQs(processedMCQs)) {
              processedMCQs = MCQGenerator.getDemoMCQs();
            }
            
            const processedMatchingQuestions = validatedResponse.matchingQuestions.map((q: MatchingQuestion) => {
              const shuffledIndices = [...Array(q.rightItems.length).keys()];
              for (let i = shuffledIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
              }
              
              const shuffledRightItems = shuffledIndices.map(i => q.rightItems[i]);
              const newCorrectMatches = q.correctMatches.map((originalIndex: number) => 
                shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
              );
              
              return {
                ...q,
                rightItems: shuffledRightItems,
                correctMatches: newCorrectMatches
              };
            });
            
            const processedTrueFalseQuestions = TrueFalseQuestionGenerator.balanceTrueFalseQuestions(
              validatedResponse.trueFalseQuestions
            );
            
            return {
              flashcards: processedFlashcards,
              mcqs: processedMCQs,
              matchingQuestions: processedMatchingQuestions,
              trueFalseQuestions: processedTrueFalseQuestions,
              fillInBlanksQuestions: validatedResponse.fillInBlanksQuestions || []
            };
          } catch (error) {
            console.error(`Error processing chunk ${i+1}:`, error);
            // Continue with other chunks even if one fails
          }
        }
        
        setCurrentLoadingMessage("Finalizing combined results...");
        
        // Limit to requested quantities
        const processedFlashcards = FlashcardGenerator.processFlashcards(
          combinedResults.flashcards.slice(0, questionQuantities.flashcards * 2)
        );
        
        let processedMCQs = combinedResults.mcqs
          .slice(0, questionQuantities.mcqs * 2)
          .map((mcq: MCQ) => MCQGenerator.shuffleMCQOptions(mcq));
        
        if (!MCQGenerator.validateMCQs(processedMCQs)) {
          processedMCQs = MCQGenerator.getDemoMCQs();
        }
        
        const processedMatchingQuestions = combinedResults.matchingQuestions
          .slice(0, questionQuantities.matching * 2)
          .map((q: MatchingQuestion) => {
            // Existing matching question processing
            const shuffledIndices = [...Array(q.rightItems.length).keys()];
            for (let i = shuffledIndices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
            }
            
            const shuffledRightItems = shuffledIndices.map(i => q.rightItems[i]);
            const newCorrectMatches = q.correctMatches.map((originalIndex: number) => 
              shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
            );
            
            return {
              ...q,
              rightItems: shuffledRightItems,
              correctMatches: newCorrectMatches
            };
          });
        
        const processedTrueFalseQuestions = TrueFalseQuestionGenerator.balanceTrueFalseQuestions(
          combinedResults.trueFalseQuestions.slice(0, questionQuantities.trueFalse * 2)
        );
        
        return {
          flashcards: processedFlashcards,
          mcqs: processedMCQs,
          matchingQuestions: processedMatchingQuestions,
          trueFalseQuestions: processedTrueFalseQuestions,
          fillInBlanksQuestions: combinedResults.fillInBlanksQuestions.slice(0, questionQuantities.fillInBlanks * 2) || []
        };
      }
      
      // For normal-sized documents, continue with regular processing
      // Create a prompt for Gemini
      const basePromptTemplate = (content: string) => `
      You are an educational content creator. Based on the following content, generate educational quiz questions in JSON format.

      File name: ${file.name}
      File type: ${fileType}

      Content: 
      ${content}

      Create the following types of questions:

      1. ${questionQuantities.flashcards} Flashcards (question and answer pairs)
      2. ${questionQuantities.mcqs} Multiple Choice Questions with 4 options each
      3. ${questionQuantities.matching} Matching Questions (with at least 4 pairs to match)
      4. ${questionQuantities.trueFalse} True/False Questions
      5. ${questionQuantities.fillInBlanks || 5} Fill-in-the-blanks Questions

      The questions should cover the main concepts and important information related to the topic.

      dont give me any questions about the file name or file type or its properties.o ranything about pdfs or documents
      `;

      // Add custom prompt if provided
      const finalPromptTemplate = (content: string) => 
        customPrompt 
          ? `${basePromptTemplate(content)}\n\nAdditional Instructions:\n${customPrompt}\n\n`
          : basePromptTemplate(content);

      const jsonFormatInstructions = `\n\nThe questions should be in the following JSON format exactly. Do not include any explanations or markdown formatting, just the raw JSON:
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
      }`;

      const prompt = finalPromptTemplate(fileContent) + jsonFormatInstructions;

      // Stream the response
      console.log("Document size within limits, processing normally");
      const streamingResponse = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      // Initialize containers for streamed content
      const partialResponses: GeminiResponse = {
        flashcards: [],
        mcqs: [],
        matchingQuestions: [],
        trueFalseQuestions: [],
        fillInBlanksQuestions: []
      };

      let aggregatedResponse = '';

      // Update loading message to indicate streaming
      setCurrentLoadingMessage("Receiving quiz questions in real-time...");

      // Process chunks as they arrive
      for await (const chunk of streamingResponse.stream) {
        const chunkText = chunk.text();
        aggregatedResponse += chunkText;
        
        // Try to extract partial content as it arrives
        try {
          const partial = manuallyExtractQuestions(aggregatedResponse);
          
          // Update UI with partial results as they become available
          if (partial.flashcards?.length && partial.flashcards.length > partialResponses.flashcards.length) {
            partialResponses.flashcards = partial.flashcards;
            setCurrentLoadingMessage(`Generated ${partial.flashcards.length} flashcards so far...`);
            
            // Update loading progress
            const progress = Math.min(100, Math.round((partial.flashcards.length / questionQuantities.flashcards) * 100));
            setLoadingProgress(prev => ({...prev, flashcards: progress}));
            
            // Show flashcards as soon as we have any
            if (partial.flashcards.length > 0) {
              const processedFlashcards = FlashcardGenerator.processFlashcards(partial.flashcards);
              setFlashcards(processedFlashcards);
              
              // If we don't have any questions showing yet, show the quiz page with partial results
              if (!showQuizPage) {
                setCurrentLoadingMessage("Showing flashcards while generating more questions...");
                setShowQuizPage(true);
              }
            }
          }
          
          if (partial.mcqs?.length && partial.mcqs.length > partialResponses.mcqs.length) {
            partialResponses.mcqs = partial.mcqs;
            setCurrentLoadingMessage(`Generated ${partial.mcqs.length} multiple choice questions...`);
            
            // Update loading progress
            const progress = Math.min(100, Math.round((partial.mcqs.length / questionQuantities.mcqs) * 100));
            setLoadingProgress(prev => ({...prev, mcqs: progress}));
            
            // Update MCQs as soon as we have any
            if (partial.mcqs.length > 0) {
              const processedMCQs = partial.mcqs.map(mcq => MCQGenerator.shuffleMCQOptions(mcq));
              setMcqs(processedMCQs);
              
              // Update saved quiz state with new MCQs
              saveCurrentQuizState();
            }
          }
          
          if (partial.matchingQuestions?.length && partial.matchingQuestions.length > partialResponses.matchingQuestions.length) {
            partialResponses.matchingQuestions = partial.matchingQuestions;
            setCurrentLoadingMessage(`Created ${partial.matchingQuestions.length} matching questions...`);
            
            // Update loading progress
            const progress = Math.min(100, Math.round((partial.matchingQuestions.length / questionQuantities.matching) * 100));
            setLoadingProgress(prev => ({...prev, matching: progress}));
            
            // Update matching questions as soon as we have any
            if (partial.matchingQuestions.length > 0) {
              const processedMatchingQuestions = partial.matchingQuestions.map(q => {
                const shuffledIndices = [...Array(q.rightItems.length).keys()];
                for (let i = shuffledIndices.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
                }
                
                const shuffledRightItems = shuffledIndices.map(i => q.rightItems[i]);
                const newCorrectMatches = q.correctMatches.map(originalIndex => 
                  shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
                );
                
                return {
                  ...q,
                  rightItems: shuffledRightItems,
                  correctMatches: newCorrectMatches
                };
              });
              
              setMatchingQuestions(processedMatchingQuestions);
              saveCurrentQuizState();
            }
          }
          
          if (partial.trueFalseQuestions?.length && partial.trueFalseQuestions.length > partialResponses.trueFalseQuestions.length) {
            partialResponses.trueFalseQuestions = partial.trueFalseQuestions;
            setCurrentLoadingMessage(`Added ${partial.trueFalseQuestions.length} true/false questions...`);
            
            // Update loading progress
            const progress = Math.min(100, Math.round((partial.trueFalseQuestions.length / questionQuantities.trueFalse) * 100));
            setLoadingProgress(prev => ({...prev, trueFalse: progress}));
            
            // Update true/false questions as soon as we have any
            if (partial.trueFalseQuestions.length > 0) {
              const processedTrueFalseQuestions = TrueFalseQuestionGenerator.balanceTrueFalseQuestions(partial.trueFalseQuestions);
              setTrueFalseQuestions(processedTrueFalseQuestions);
              saveCurrentQuizState();
            }
          }
          
          if (partial.fillInBlanksQuestions?.length && partial.fillInBlanksQuestions.length > partialResponses.fillInBlanksQuestions.length) {
            partialResponses.fillInBlanksQuestions = partial.fillInBlanksQuestions;
            setCurrentLoadingMessage(`Created ${partial.fillInBlanksQuestions.length} fill-in-blanks questions...`);
            
            // Update loading progress
            const progress = Math.min(100, Math.round((partial.fillInBlanksQuestions.length / questionQuantities.fillInBlanks) * 100));
            setLoadingProgress(prev => ({...prev, fillInBlanks: progress}));
            
            // Update fill-in-blanks as soon as we have any
            if (partial.fillInBlanksQuestions.length > 0) {
              setFillInBlankQuestions(partial.fillInBlanksQuestions);
              saveCurrentQuizState();
            }
          }
        } catch (e) {
          // Ignore errors during partial extraction
        }
      }

      setCurrentLoadingMessage("Finalizing your quiz questions...");

      // Use manual extraction for the final response instead of JSON parsing
      const extractedQuestions = manuallyExtractQuestions(aggregatedResponse);
      console.log('Manually extracted questions from Gemini API response');

      // Default fallback data
      const fallbackData: GeminiResponse = {
        flashcards: [
          { question: "What does this document cover?", answer: "Content from the uploaded file", front: "What does this document cover?" }
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
          { id: 1, question: "This is content from the uploaded file.", isTrue: true, explanation: "This is a basic true/false question about the document content." }
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

      // Use extracted questions if available, otherwise use fallback data
      const validatedResponse: GeminiResponse = {
        flashcards: extractedQuestions.flashcards.length > 0 ? extractedQuestions.flashcards : fallbackData.flashcards,
        mcqs: extractedQuestions.mcqs.length > 0 ? extractedQuestions.mcqs : fallbackData.mcqs,
        matchingQuestions: extractedQuestions.matchingQuestions.length > 0 ? extractedQuestions.matchingQuestions : fallbackData.matchingQuestions,
        trueFalseQuestions: extractedQuestions.trueFalseQuestions.length > 0 ? extractedQuestions.trueFalseQuestions : fallbackData.trueFalseQuestions,
        fillInBlanksQuestions: extractedQuestions.fillInBlanksQuestions.length > 0 ? extractedQuestions.fillInBlanksQuestions : fallbackData.fillInBlanksQuestions
      };

      const processedFlashcards = FlashcardGenerator.processFlashcards(validatedResponse.flashcards);
      let processedMCQs = validatedResponse.mcqs.map((mcq: MCQ) => MCQGenerator.shuffleMCQOptions(mcq));

      if (!MCQGenerator.validateMCQs(processedMCQs)) {
        processedMCQs = MCQGenerator.getDemoMCQs();
      }

      const processedMatchingQuestions = validatedResponse.matchingQuestions.map((q: MatchingQuestion) => {
        const shuffledIndices = [...Array(q.rightItems.length).keys()];
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        
        const shuffledRightItems = shuffledIndices.map(i => q.rightItems[i]);
        const newCorrectMatches = q.correctMatches.map((originalIndex: number) => 
          shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
        );
        
        return {
          ...q,
          rightItems: shuffledRightItems,
          correctMatches: newCorrectMatches
        };
      });

      const processedTrueFalseQuestions = TrueFalseQuestionGenerator.balanceTrueFalseQuestions(
        validatedResponse.trueFalseQuestions
      );

      return {
        flashcards: processedFlashcards,
        mcqs: processedMCQs,
        matchingQuestions: processedMatchingQuestions,
        trueFalseQuestions: processedTrueFalseQuestions,
        fillInBlanksQuestions: validatedResponse.fillInBlanksQuestions || []
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      setApiError("Failed to generate questions with Gemini API. Using demo questions instead.");
      
      return {
        flashcards: demoFlashcards,
        mcqs: demoMCQs,
        matchingQuestions: demoMatchingQuestions,
        trueFalseQuestions: demoTrueFalseQuestions,
        fillInBlanksQuestions: []
      };
    }
  };

  // Enhanced manual extraction function with better regex patterns
  const manuallyExtractQuestions = (responseText: string): GeminiResponse => {
    console.log("Using direct manual extraction of JSON data");
    
    const result: GeminiResponse = {
      flashcards: [],
      mcqs: [],
      matchingQuestions: [],
      trueFalseQuestions: [],
      fillInBlanksQuestions: []
    };
    
    try {
      // Extract flashcards with a more flexible regex that handles various formatting
      const flashcardRegex = /"question"[\s:]*"([^"]+)"[\s,]*"answer"[\s:]*"([^"]+)"/g;
      let match;
      while ((match = flashcardRegex.exec(responseText)) !== null) {
        result.flashcards.push({
          question: match[1],
          answer: match[2],
          front: match[1]
        });
      }
      
      // Extract MCQs with more flexible pattern to handle variations
      const mcqRegex = /"question"[\s:]*"([^"]+)"[\s,]*"options"[\s:]*\[([\s\S]*?)\][\s,]*"correctAnswer"[\s:]*(\d+)/g;
      const optionRegex = /"([^"]+)"/g;
      
      while ((match = mcqRegex.exec(responseText)) !== null) {
        const optionsText = match[2];
        const options: string[] = [];
        
        let optionMatch;
        while ((optionMatch = optionRegex.exec(optionsText)) !== null) {
          options.push(optionMatch[1]);
        }
        
        if (options.length > 0) {
          result.mcqs.push({
            question: match[1],
            options: options,
            correctAnswer: parseInt(match[3])
          });
        }
      }
      
      // Extract matching questions with a more flexible approach
      const matchingIdRegex = /"id"[\s:]*(\d+)[\s,]*"question"[\s:]*"([^"]+)"[\s,]*"leftItems"[\s:]*\[([\s\S]*?)\][\s,]*"rightItems"[\s:]*\[([\s\S]*?)\]/g;
      while ((match = matchingIdRegex.exec(responseText)) !== null) {
        const id = parseInt(match[1]);
        const question = match[2];
        
        // Extract left items
        const leftItemsText = match[3];
        const leftItems: string[] = [];
        let itemMatch;
        const itemRegex = /"([^"]+)"/g;
        while ((itemMatch = itemRegex.exec(leftItemsText)) !== null) {
          leftItems.push(itemMatch[1]);
        }
        
        // Extract right items
        const rightItemsText = match[4];
        const rightItems: string[] = [];
        itemRegex.lastIndex = 0; // Reset regex
        while ((itemMatch = itemRegex.exec(rightItemsText)) !== null) {
          rightItems.push(itemMatch[1]);
        }
        
        if (leftItems.length > 0 && rightItems.length > 0) {
          // Create default correct matches if not found
          const correctMatches = Array.from({ length: Math.min(leftItems.length, rightItems.length) }, (_, i) => i);
          
          result.matchingQuestions.push({
            id,
            question,
            leftItems,
            rightItems,
            correctMatches
          });
        }
      }
      
      // Extract true/false questions with a more flexible regex
      const trueFalseRegex = /"question"[\s:]*"([^"]+)"[\s,]*"isTrue"[\s:]*(?:"|')?([Tt]rue|[Ff]alse)(?:"|')?/g;
      while ((match = trueFalseRegex.exec(responseText)) !== null) {
        result.trueFalseQuestions.push({
          id: result.trueFalseQuestions.length + 1,
          question: match[1],
          isTrue: match[2].toLowerCase() === 'true',
          explanation: `True/false statement about the document`
        });
      }
      
      // Extract fill-in-blanks questions
      const fillBlanksRegex = /"textWithBlanks"[\s:]*"([^"]+)"[\s,]*"correctAnswers"[\s:]*\[([\s\S]*?)\]/g;
      let fbIndex = 1;
      while ((match = fillBlanksRegex.exec(responseText)) !== null) {
        const textWithBlanks = match[1];
        
        // Extract correct answers
        const answersText = match[2];
        const answers: string[] = [];
        let answerMatch;
        const answerRegex = /"([^"]+)"/g;
        while ((answerMatch = answerRegex.exec(answersText)) !== null) {
          answers.push(answerMatch[1]);
        }
        
        if (answers.length > 0) {
          // Extract question if available
          let question = "Complete the sentence:";
          const questionMatch = responseText.substring(Math.max(0, match.index - 100), match.index).match(/"question"[\s:]*"([^"]+)"/);
          if (questionMatch) {
            question = questionMatch[1];
          }
          
          result.fillInBlanksQuestions.push({
            id: `fib-${fbIndex++}`,
            question,
            textWithBlanks,
            correctAnswers: answers,
            completeText: textWithBlanks.replace(/\[BLANK_\d+\]/g, (_, i) => answers[parseInt(i)] || "___"),
            explanation: "Fill in the blanks with the correct terms",
            difficulty: "medium"
          });
        }
      }
      
      console.log(`Manually extracted: ${result.flashcards.length} flashcards, ${result.mcqs.length} MCQs, ${result.matchingQuestions.length} matching questions, ${result.trueFalseQuestions.length} true/false questions, ${result.fillInBlanksQuestions.length} fill-in-blanks`);
      
      return result;
    } catch (e) {
      console.error("Error in manual extraction:", e);
      return result;
    }
  };

  const handleTryItNowClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateMore = (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', quantity: number): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      if (!file) {
        toast.error("No document found. Please upload a document first.");
        reject(new Error("No document found"));
        return;
      }
      
      if (hasReachedLimit) {
        toast.error("You've reached your daily usage limit. Upgrade to Pro for unlimited usage!");
        router.push('/subscriptions');
        reject(new Error("Daily limit reached"));
        return;
      }
      
      try {
        setIsGenerating(true);
        
        // Generate more questions with Gemini API first
        console.log(`Sending request to Gemini API for ${quantity} additional ${type} questions...`);
        const generatedQuestions = await generateQuestions(
          file.name, 
          file, 
          getFileType(file.name), 
          { ...questionQuantities, [type]: quantity },
          useCustomPrompt ? customPrompt : undefined
        );
        console.log(`Successfully received ${quantity} additional ${type} questions from Gemini API`);
        
        // Update state and only then save to storage
        console.log('Updating state with new questions...');
        
        if (type === 'flashcards') {
          // Make sure we process flashcards before adding them
          const newFlashcards = FlashcardGenerator.processFlashcards(generatedQuestions.flashcards);
          setFlashcards(prev => {
            // We now display even a single flashcard
            const updated = [...prev, ...newFlashcards];
            setTimeout(() => saveCurrentQuizState(), 0);
            return updated;
          });
        } else if (type === 'mcqs') {
          const newMCQs = generatedQuestions.mcqs.map((mcq: MCQ) => MCQGenerator.shuffleMCQOptions(mcq));
          setMcqs(prev => {
            const updated = [...prev, ...newMCQs];
            setTimeout(() => saveCurrentQuizState(), 0);
            return updated;
          });
        } else if (type === 'matching') {
          const newMatchingQuestions = generatedQuestions.matchingQuestions.map((q: MatchingQuestion) => {
            const shuffledIndices = [...Array(q.rightItems.length).keys()];
            for (let i = shuffledIndices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
            }
            
            const shuffledRightItems = shuffledIndices.map(i => q.rightItems[i]);
            const newCorrectMatches = q.correctMatches.map((originalIndex: number) => 
              shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
            );
            
            return {
              ...q,
              rightItems: shuffledRightItems,
              correctMatches: newCorrectMatches
            };
          });
          setMatchingQuestions(prev => {
            const updated = [...prev, ...newMatchingQuestions];
            setTimeout(() => saveCurrentQuizState(), 0);
            return updated;
          });
        } else if (type === 'trueFalse') {
          const newTrueFalseQuestions = TrueFalseQuestionGenerator.balanceTrueFalseQuestions(
            generatedQuestions.trueFalseQuestions
          );
          setTrueFalseQuestions(prev => {
            const updated = [...prev, ...newTrueFalseQuestions];
            setTimeout(() => saveCurrentQuizState(), 0);
            return updated;
          });
        } else if (type === 'fillInBlanks') {
          const newFillInBlanksQuestions = generatedQuestions.fillInBlanksQuestions || [];
          setFillInBlankQuestions(prev => {
            const updated = [...prev, ...newFillInBlanksQuestions];
            setTimeout(() => saveCurrentQuizState(), 0);
            return updated;
          });
        }
        
        toast.success(`Successfully generated ${quantity} additional ${type} questions!`);
        resolve();
      } catch (error) {
        console.error(`Error generating more ${type}:`, error);
        toast.error(`Failed to generate additional ${type} questions. Please try again.`);
        reject(error);
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const processDocument = async (documentFile: File) => {
    try {
      setProcessingStatus('reading');
      
      // Read file content
      const fileContent = await readFileContent(documentFile);
      
      // Generate questions with Gemini API - this is the only API call we make
      setProcessingStatus('generating');
      console.log('Sending request to Gemini API for document: ' + documentFile.name);
      const generatedQuestions = await generateQuestionsWithGemini(documentFile);
      console.log('Successfully received response from Gemini API');
      
      // Set the questions state with the response data immediately
      if (generatedQuestions) {
        const processedFlashcards = FlashcardGenerator.processFlashcards(generatedQuestions.flashcards || []);
        setFlashcards(processedFlashcards);
        setMcqs(generatedQuestions.mcqs);
        setMatchingQuestions(generatedQuestions.matchingQuestions);
        setTrueFalseQuestions(generatedQuestions.trueFalseQuestions);
        setFillInBlankQuestions(generatedQuestions.fillInBlanksQuestions || []);
      } else {
        // Use demo questions if nothing was generated
        setFlashcards(demoFlashcards);
        setMcqs(demoMCQs);
        setMatchingQuestions(demoMatchingQuestions);
        setTrueFalseQuestions(demoTrueFalseQuestions);
      }
      
      // Show quiz page immediately
      setShowQuizPage(true);
      
      // Save document and questions in the background
      console.log('Saving document and questions in the background...');
      const previewText = `Processed document: ${documentFile.name}`;
      
      // Upload document to MongoDB if user is logged in (in the background)
      if (isLoggedIn) {
        uploadDocumentToMongoDB(
          documentFile,
          user?.uid || 'anonymous',
          previewText
        ).then(() => {
          // Add to local storage after MongoDB upload
          addDocument(documentFile, previewText);
        }).catch(error => {
          console.error('Error saving document:', error);
        });
      }
      
      // Save quiz state in the background
      setTimeout(() => saveCurrentQuizState(), 0);
      
      setProcessingStatus('idle');
    } catch (error) {
      console.error("Error processing document:", error);
      setFileError("Error processing your document. Please try again.");
      setProcessingStatus('idle');
      
      // Fall back to demo questions
      setFlashcards(demoFlashcards);
      setMcqs(demoMCQs);
      setMatchingQuestions(demoMatchingQuestions);
      setTrueFalseQuestions(demoTrueFalseQuestions);
      
      // Show quiz page with demo questions
      setShowQuizPage(true);
    }
  };

  // Add a function to cycle through loading messages
  useEffect(() => {
    if (isProcessing) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setCurrentLoadingMessage(loadingMessages[messageIndex]);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing, loadingMessages]);

  // Add API pre-warming
  useEffect(() => {
    // Pre-warm API connection
    const warmUpConnection = async () => {
      try {
        // Make a minimal request to warm up the connection
        await fetch('/api/gemini/warm-up', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ warmup: true })
        });
        console.log("API connection pre-warmed");
      } catch (e) {
        // Ignore errors, this is just for connection warming
        console.log("Failed to pre-warm API connection, but continuing anyway");
      }
    };
    
    warmUpConnection();
  }, []);

  return (
    <AnimatePresence mode="sync">
      {!showQuizPage ? (
        <motion.div 
          key="hero"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-12 lg:mb-0 lg:max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                    Transform Your Documents into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Interactive Quizzes</span>
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Upload any document or enter text directly and our AI will instantly generate customized 
                    <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-medium px-2">Games and quiz</span> 
                    questions to enhance your learning experience.
                  </p>

                  {hasReachedLimit ? (
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-bold text-white mb-2">Daily Usage Limit Reached</h3>
                      <p className="text-white/90 mb-4">You've used all 5 of your daily generations. Upgrade to Pro for unlimited usage!</p>
                      <Button 
                        className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold py-6"
                        onClick={() => router.push('/subscriptions')}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button 
                          className="text-lg py-6 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          onClick={() => inputMode === 'file' ? handleTryItNowClick() : setInputMode('text')}
                        >
                          Try it Now
                        </Button>
                        <input 
                          type="file" 
                          accept={SUPPORTED_FILE_TYPES.join(',')} 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleFileInput}
                          multiple
                        />
                        <Button 
                          variant="outline" 
                          className="text-lg py-6 px-8 dark:text-white dark:border-gray-600 relative overflow-hidden group bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-400"
                          onClick={() => window.location.href = '/allgames'}
                        >
                          <div className="absolute -right-1 -top-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-bl-md shadow-md transform rotate-0 scale-100 group-hover:scale-110 transition-transform">PRO</div>
                            <span className="mr-2 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">All Games</span>
                          <span className="absolute inset-0 w-4 h-full bg-gradient-to-r from-transparent via-purple-100 dark:via-purple-900/20 to-transparent -translate-x-full animate-shimmer group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          </Button>
                                                  <Button 
                          variant="outline" 
                          className="text-lg py-6 px-8 dark:text-white dark:border-gray-600 relative overflow-hidden group bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-400"
                          onClick={() => window.location.href = '/explore'}
                        >
                          <div className="absolute -right-1 -top-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-bl-md shadow-md transform rotate-0 scale-100 group-hover:scale-110 transition-transform">PRO</div>
                            <span className="mr-2 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">Explore</span>
                          <span className="absolute inset-0 w-4 h-full bg-gradient-to-r from-transparent via-purple-100 dark:via-purple-900/20 to-transparent -translate-x-full animate-shimmer group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        </Button>
                      </div>
                      {isLoggedIn && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {remainingUses} {remainingUses === 1 ? 'use' : 'uses'} remaining today
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:w-1/2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative">
                  <div className="absolute -top-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    AI-Powered
                  </div>
                  
                  {!file ? (
                    <div>
                      {isLoggedIn && (
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={useCustomPrompt} 
                              onCheckedChange={setUseCustomPrompt} 
                              id="custom-prompt-toggle"
                              disabled={hasReachedLimit}
                            />
                            <label 
                              htmlFor="custom-prompt-toggle" 
                              className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                              Use Custom Prompt
                            </label>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Customize how questions are generated
                          </div>
                        </div>
                      )}
                      
                      {useCustomPrompt && isLoggedIn && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6"
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Enter your custom prompt:
                          </label>
                          <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="E.g., Focus on specific topics, create questions suitable for beginners, emphasize key concepts..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            rows={4}
                            disabled={hasReachedLimit}
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Your instructions to the AI about what kind of questions to generate
                          </p>
                        </motion.div>
                      )}
                      
                      <Tabs 
                        defaultValue="file" 
                        onValueChange={(value) => setInputMode(value as 'file' | 'text')}
                        className="w-full mb-6"
                      >
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="file">Upload File</TabsTrigger>
                          <TabsTrigger value="text">Enter Text</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="file">
                          <motion.div
                            whileHover={{ scale: hasReachedLimit ? 1 : 1.01 }}
                            className={`border-4 border-dashed rounded-xl p-8 text-center transition-all h-64 flex flex-col items-center justify-center relative ${
                              isDragging 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                : "border-gray-300 dark:border-gray-700"
                            } ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onDragOver={hasReachedLimit ? undefined : handleDragOver}
                            onDragLeave={hasReachedLimit ? undefined : handleDragLeave}
                            onDrop={hasReachedLimit ? undefined : handleDrop}
                          >
                            {hasReachedLimit && (
                              <div className="absolute inset-0 bg-black/30 dark:bg-white/30 rounded-xl flex items-center justify-center z-50">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-300 mb-4">Daily limit reached</p>
                                  <Button 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    onClick={() => router.push('/subscriptions')}
                                  >
                                    Get Pro Access
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <motion.div 
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-16 w-16 text-blue-500 mb-4" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                />
                              </svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                              Drag & Drop Your Documents
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              Supported formats: PDF, PPT, Word, Excel, Text
                            </p>
                            {fileError && <p className="text-red-500 text-sm mb-2">{fileError}</p>}
                            {apiError && <p className="text-red-500 text-sm mb-2">{apiError}</p>}
                            <Button 
                              onClick={hasReachedLimit ? undefined : handleTryItNowClick} 
                              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                              disabled={hasReachedLimit}
                            >
                              Choose Files
                            </Button>
                          </motion.div>
                        </TabsContent>
                            
                            <TabsContent value="text">
                              <div className="h-64 flex flex-col">
                                <textarea
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  placeholder="Paste or type your content here..."
                                  className="w-full h-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                  disabled={hasReachedLimit}
                                />
                                {fileError && (
                                  <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-500 text-sm mt-2"
                                  >
                                    {fileError}
                                  </motion.p>
                                )}
                                <Button 
                                  onClick={hasReachedLimit ? () => router.push('/subscriptions') : handleCustomTextSubmit} 
                                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                                  disabled={!customText.trim() || isGenerating}
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Generating Quiz...
                                    </>
                                  ) : hasReachedLimit ? (
                                    'Get Pro Access'
                                  ) : (
                                    'Generate Quiz'
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      ) : (
                        <div className="h-64">
                          {isProcessing && (
                            <div className="flex flex-col items-center justify-center p-8 space-y-4 h-64">
                              <div className="w-full">
                                {totalFiles > 1 && inputMode === 'file' && (
                                  <div className="mb-2">
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                      <span>Processing files: {processedFiles}/{totalFiles}</span>
                                      <span>{Math.round((processedFiles/totalFiles) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                      <div 
                                        className="bg-blue-500 h-2.5 rounded-full" 
                                        style={{ width: `${(processedFiles/totalFiles) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                              />
                              
                              <div className="text-center">
                                <h3 className="font-bold text-gray-800 dark:text-white">
                                  {inputMode === 'file' 
                                    ? (totalFiles > 1 
                                      ? `Processing ${processedFiles+1}/${totalFiles}: "${processingFilename}"`
                                      : `Processing "${file?.name}"`)
                                    : "Processing your text input"}
                                </h3>
                                <motion.p 
                                  key={currentLoadingMessage}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.5 }}
                                  className="text-gray-600 dark:text-gray-400"
                                >
                                  {currentLoadingMessage}
                                </motion.p>
                                {extractedTextPreview && (
                                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded max-h-24 overflow-y-auto text-sm text-left">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Preview:</p>
                                    {extractedTextPreview}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quizPage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              <QuizPage 
              file={file}
              flashcards={flashcards}
              mcqs={mcqs}
              matchingQuestions={matchingQuestions}
              trueFalseQuestions={trueFalseQuestions}
              fillInBlanksQuestions={fillInBlanksQuestions}
              onBackToUpload={() => {
                setShowQuizPage(false);
                setFile(null);
                setProcessingStatus('idle');
                setExtractedTextPreview(null);
                setCustomText('');
                clearSavedQuizState();
              }}
              onGenerateMore={handleGenerateMore}
              fileContent={extractedTextPreview || ''}
              error={fileError || apiError || undefined}
              loadingProgress={loadingProgress}
              />
            </motion.div>
          )}
        </AnimatePresence>
      );
  };

  export default HeroSection;