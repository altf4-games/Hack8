import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define interfaces for quiz types
interface Flashcard {
  question: string;
  answer: string;
}

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
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
  explanation: string;
}

interface FillInBlanksQuestion {
  id: string;
  question: string;
  textWithBlanks: string;
  correctAnswers: string[];
  completeText: string;
  explanation: string;
  difficulty: string;
}

// Define the structure of response chunk from Gemini API
interface QuizChunk {
  mcqs?: MCQ[];
  trueFalseQuestions?: TrueFalseQuestion[];
  fillInBlanksQuestions?: FillInBlanksQuestion[];
  matchingQuestions?: MatchingQuestion[];
  flashcards?: Flashcard[];
}

// Initialize Gemini API
const getGenAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
    return null;
  }
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini API client:', error);
    return null;
  }
};

// Split content into manageable chunks
function splitTranscript(transcript: string, maxChunkSize: number = 4000): string[] {
  const chunks = [];
  const sentences = transcript.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < maxChunkSize) {
      currentChunk += sentence + ' ';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, title } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json(
        { error: 'Failed to initialize Gemini API' },
        { status: 500 }
      );
    }

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

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chunks = splitTranscript(transcript);
    const chunkResults: QuizChunk[] = [];

    for (const chunk of chunks) {
      const prompt = `You are an educational content creator. Generate comprehensive quiz questions based on this YouTube video transcript chunk. The video title is "${title}".

Content:
${chunk}

Create a diverse set of educational questions that test understanding of the key concepts. Include:
1. Multiple choice questions (with explanations for correct answers)
2. True/False questions (with explanations)
3. Fill-in-the-blank questions
4. Matching questions (with related concepts)
5. Flashcard-style questions

Return your response in this exact JSON format:
{
  "mcqs": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ],
  "trueFalseQuestions": [
    {
      "id": 1,
      "question": "...",
      "isTrue": true,
      "explanation": "..."
    }
  ],
  "fillInBlanksQuestions": [
    {
      "id": "fib-1",
      "question": "Complete this statement:",
      "textWithBlanks": "... [BLANK_0] ... [BLANK_1] ...",
      "correctAnswers": ["...", "..."],
      "completeText": "... full text ...",
      "explanation": "...",
      "difficulty": "medium"
    }
  ],
  "matchingQuestions": [
    {
      "id": 1,
      "question": "Match these related concepts:",
      "leftItems": ["...", "...", "...", "..."],
      "rightItems": ["...", "...", "...", "..."],
      "correctMatches": [0, 1, 2, 3]
    }
  ],
  "flashcards": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}`;

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          safetySettings,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
        });

        if (!result.response) {
          throw new Error('Empty response from Gemini API');
        }

        const text = result.response.text();
        let parsedResponse: QuizChunk;

        try {
          parsedResponse = JSON.parse(text.trim()) as QuizChunk;

          // Ensure all arrays exist to prevent type errors
          parsedResponse.mcqs = parsedResponse.mcqs || [];
          parsedResponse.trueFalseQuestions = parsedResponse.trueFalseQuestions || [];
          parsedResponse.fillInBlanksQuestions = parsedResponse.fillInBlanksQuestions || [];
          parsedResponse.matchingQuestions = parsedResponse.matchingQuestions || [];
          parsedResponse.flashcards = parsedResponse.flashcards || [];

          chunkResults.push(parsedResponse);
        } catch (parseError) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]) as QuizChunk;

            // Ensure all arrays exist to prevent type errors
            parsedResponse.mcqs = parsedResponse.mcqs || [];
            parsedResponse.trueFalseQuestions = parsedResponse.trueFalseQuestions || [];
            parsedResponse.fillInBlanksQuestions = parsedResponse.fillInBlanksQuestions || [];
            parsedResponse.matchingQuestions = parsedResponse.matchingQuestions || [];
            parsedResponse.flashcards = parsedResponse.flashcards || [];

            chunkResults.push(parsedResponse);
          } else {
            throw new Error('Failed to parse JSON response');
          }
        }
      } catch (error) {
        console.error('Error processing chunk:', error);
        // Continue with other chunks if one fails
      }
    }

    // Merge results from all chunks with explicit typing
    interface MergedQuiz {
      mcqs: MCQ[];
      trueFalseQuestions: TrueFalseQuestion[];
      fillInBlanksQuestions: FillInBlanksQuestion[];
      matchingQuestions: MatchingQuestion[];
      flashcards: Flashcard[];
    }

    const mergedQuiz: MergedQuiz = {
      mcqs: [],
      trueFalseQuestions: [],
      fillInBlanksQuestions: [],
      matchingQuestions: [],
      flashcards: []
    };

    // Process each chunk result with proper type checking
    chunkResults.forEach((result: QuizChunk, index: number) => {
      // Merge MCQs with type checking
      if (result.mcqs && Array.isArray(result.mcqs)) {
        const validMcqs = result.mcqs.filter((mcq): mcq is MCQ => 
          mcq && 
          typeof mcq.question === 'string' &&
          Array.isArray(mcq.options) &&
          typeof mcq.correctAnswer === 'number' &&
          typeof mcq.explanation === 'string'
        );
        mergedQuiz.mcqs.push(...validMcqs);
      }
      
      // Merge True/False questions with type checking
      if (result.trueFalseQuestions && Array.isArray(result.trueFalseQuestions)) {
        result.trueFalseQuestions.forEach((q, i) => {
          if (q && 
              typeof q.question === 'string' && 
              typeof q.isTrue === 'boolean' && 
              typeof q.explanation === 'string') {
            mergedQuiz.trueFalseQuestions.push({
              id: index * 100 + i + 1,
              question: q.question,
              isTrue: q.isTrue,
              explanation: q.explanation
            });
          }
        });
      }

      // Merge Fill-in-the-blank questions with type checking
      if (result.fillInBlanksQuestions && Array.isArray(result.fillInBlanksQuestions)) {
        result.fillInBlanksQuestions.forEach((q, i) => {
          if (q && 
              typeof q.question === 'string' &&
              typeof q.textWithBlanks === 'string' &&
              Array.isArray(q.correctAnswers) &&
              typeof q.completeText === 'string' &&
              typeof q.explanation === 'string' &&
              typeof q.difficulty === 'string') {
            mergedQuiz.fillInBlanksQuestions.push({
              id: `fib-${index * 100 + i + 1}`,
              question: q.question,
              textWithBlanks: q.textWithBlanks,
              correctAnswers: q.correctAnswers,
              completeText: q.completeText,
              explanation: q.explanation,
              difficulty: q.difficulty
            });
          }
        });
      }

      // Merge Matching questions with type checking
      if (result.matchingQuestions && Array.isArray(result.matchingQuestions)) {
        result.matchingQuestions.forEach((q, i) => {
          if (q && 
              typeof q.question === 'string' &&
              Array.isArray(q.leftItems) &&
              Array.isArray(q.rightItems) &&
              Array.isArray(q.correctMatches)) {
            mergedQuiz.matchingQuestions.push({
              id: index * 100 + i + 1,
              question: q.question,
              leftItems: q.leftItems,
              rightItems: q.rightItems,
              correctMatches: q.correctMatches
            });
          }
        });
      }

      // Merge Flashcards with type checking
      if (result.flashcards && Array.isArray(result.flashcards)) {
        const validFlashcards = result.flashcards.filter((card): card is Flashcard =>
          card &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string'
        );
        mergedQuiz.flashcards.push(...validFlashcards);
      }
    });

    // Limit number of questions per type
    mergedQuiz.mcqs = mergedQuiz.mcqs.slice(0, 10);
    mergedQuiz.trueFalseQuestions = mergedQuiz.trueFalseQuestions.slice(0, 5);
    mergedQuiz.fillInBlanksQuestions = mergedQuiz.fillInBlanksQuestions.slice(0, 5);
    mergedQuiz.matchingQuestions = mergedQuiz.matchingQuestions.slice(0, 3);
    mergedQuiz.flashcards = mergedQuiz.flashcards.slice(0, 10);

    return NextResponse.json(mergedQuiz);
  } catch (error) {
    console.error('Error in generate-quiz API:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}