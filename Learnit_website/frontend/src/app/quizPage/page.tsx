'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizPage from './quizPage';
import { Skeleton } from '@/components/ui/skeleton';
import { getSavedQuestionsForDocument, setCurrentDocument } from '../services/documentStorage';
import { auth } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Import the correct type definitions
import { Flashcard } from './flashcards/flashcard-types';
import { MCQ } from './MCQS/mcq-types';
import { MatchingQuestion } from './matching-questions/matching-question-type';
import { TrueFalseQuestion } from './trueOrFalse/true-false-type';
import { FillInBlanksQuestion } from './fillblanks/fill-blanks-type';

const QuizPageRoute = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get('docId');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  // Question state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [matchingQuestions, setMatchingQuestions] = useState<MatchingQuestion[]>([]);
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<TrueFalseQuestion[]>([]);
  const [fillInBlanksQuestions, setFillInBlanksQuestions] = useState<FillInBlanksQuestion[]>([]);

  useEffect(() => {
    const loadSavedQuestions = async () => {
      setIsLoading(true);
      
      try {
        if (!docId) {
          setError("Document ID is missing. Please select a document from your history.");
          setIsLoading(false);
          return;
        }
        
        // Set current document
        setCurrentDocument(docId);
        
        // Try to get saved questions from localStorage first
        const savedQuestions = getSavedQuestionsForDocument(docId);
        
        if (savedQuestions) {
          // Set questions from local storage - Transform to match expected types
          setFlashcards(savedQuestions.flashcards?.map((card: any, index: number) => ({
            front: card.question || card.front || `Question ${index + 1}`,
            question: card.question || card.front || `Question ${index + 1}`,
            answer: card.answer || card.back || ''
          })) || []);
          
          setMcqs(savedQuestions.mcqs?.map((mcq: any, index: number) => ({
            question: mcq.question || `Question ${index + 1}`,
            options: mcq.options || [],
            correctAnswer: typeof mcq.correctAnswer === 'number' 
              ? mcq.correctAnswer 
              : mcq.options?.indexOf(mcq.correctAnswer) || 0
          })) || []);
          
          setMatchingQuestions(savedQuestions.matchingQuestions?.map((q: any, index: number) => {
            // Handle different formats of matching questions
            let leftItems: string[] = [];
            let rightItems: string[] = [];
            let correctMatches: number[] = [];
            
            if (q.pairs) {
              // If we have pairs, extract left/right items
              leftItems = q.pairs.map((p: any) => p.left);
              rightItems = q.pairs.map((p: any) => p.right);
              correctMatches = rightItems.map((_: any, i: number) => i); // Default to matching by index
            } else if (q.leftItems && q.rightItems) {
              // Direct arrays
              leftItems = q.leftItems;
              rightItems = q.rightItems;
              correctMatches = q.correctMatches || rightItems.map((_: any, i: number) => i);
            }
            
            return {
              id: index + 1,
              question: q.question || `Matching Set ${index + 1}`,
              leftItems,
              rightItems,
              correctMatches
            };
          }) || []);
          
          setTrueFalseQuestions(savedQuestions.trueFalseQuestions?.map((tf: any, index: number) => ({
            id: index + 1,
            question: tf.statement || tf.question || `Statement ${index + 1}`,
            isTrue: !!tf.isTrue,
            explanation: tf.explanation || ''
          })) || []);
          
          setFillInBlanksQuestions(savedQuestions.fillInBlanksQuestions?.map((fib: any, index: number) => {
            const blanks = fib.blanks || [];
            const text = fib.text || '';
            
            // Generate a text with blanks (if not provided)
            let textWithBlanks = text;
            blanks.forEach((blank: string, i: number) => {
              textWithBlanks = textWithBlanks.replace(blank, `[BLANK_${i}]`);
            });
            
            return {
              id: `fib-${index + 1}`,
              question: fib.question || `Fill in the blanks ${index + 1}`,
              correctAnswers: blanks,
              textWithBlanks: textWithBlanks,
              completeText: text
            };
          }) || []);
          
          setFileName(savedQuestions.documentId || "document.pdf");
          
          // Create a dummy file since we don't have the original
          setFile(new File([""], savedQuestions.documentId || "document.pdf", { type: "application/pdf" }));
          setIsLoading(false);
        } else {
          // If not in localStorage, try to fetch from API
          const userId = auth.currentUser?.uid;
          
          if (!userId) {
            setError("Please log in to view saved questions.");
            setIsLoading(false);
            return;
          }
          
          // Fetch from API
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pdftoflashcard.onrender.com/api';
          const apiUrl = `${API_BASE_URL}/saved-questions/${userId}/${docId}`;
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const apiSavedQuestions = await response.json();
            
            // Process and convert the data to match the expected types (code repeats from above)
            setFlashcards(apiSavedQuestions.flashcards?.map((card: any, index: number) => ({
              front: card.question || card.front || `Question ${index + 1}`,
              question: card.question || card.front || `Question ${index + 1}`,
              answer: card.answer || card.back || ''
            })) || []);
            
            setMcqs(apiSavedQuestions.mcqs?.map((mcq: any, index: number) => ({
              question: mcq.question || `Question ${index + 1}`,
              options: mcq.options || [],
              correctAnswer: typeof mcq.correctAnswer === 'number' 
                ? mcq.correctAnswer 
                : mcq.options?.indexOf(mcq.correctAnswer) || 0
            })) || []);
            
            setMatchingQuestions(apiSavedQuestions.matchingQuestions?.map((q: any, index: number) => {
              // Handle different formats of matching questions
              let leftItems: string[] = [];
              let rightItems: string[] = [];
              let correctMatches: number[] = [];
              
              if (q.pairs) {
                // If we have pairs, extract left/right items
                leftItems = q.pairs.map((p: any) => p.left);
                rightItems = q.pairs.map((p: any) => p.right);
                correctMatches = rightItems.map((_: any, i: number) => i); // Default to matching by index
              } else if (q.leftItems && q.rightItems) {
                // Direct arrays
                leftItems = q.leftItems;
                rightItems = q.rightItems;
                correctMatches = q.correctMatches || rightItems.map((_: any, i: number) => i);
              }
              
              return {
                id: index + 1,
                question: q.question || `Matching Set ${index + 1}`,
                leftItems,
                rightItems,
                correctMatches
              };
            }) || []);
            
            setTrueFalseQuestions(apiSavedQuestions.trueFalseQuestions?.map((tf: any, index: number) => ({
              id: index + 1,
              question: tf.statement || tf.question || `Statement ${index + 1}`,
              isTrue: !!tf.isTrue,
              explanation: tf.explanation || ''
            })) || []);
            
            setFillInBlanksQuestions(apiSavedQuestions.fillInBlanksQuestions?.map((fib: any, index: number) => {
              const blanks = fib.blanks || [];
              const text = fib.text || '';
              
              // Generate a text with blanks (if not provided)
              let textWithBlanks = text;
              blanks.forEach((blank: string, i: number) => {
                textWithBlanks = textWithBlanks.replace(blank, `[BLANK_${i}]`);
              });
              
              return {
                id: `fib-${index + 1}`,
                question: fib.question || `Fill in the blanks ${index + 1}`,
                correctAnswers: blanks,
                textWithBlanks: textWithBlanks,
                completeText: text
              };
            }) || []);
            
            setFileName(apiSavedQuestions.documentId || "document.pdf");
            
            // Create a dummy file
            setFile(new File([""], apiSavedQuestions.documentId || "document.pdf", { type: "application/pdf" }));
            
            // Save to localStorage for future use
            const STORAGE_KEYS = {
              SAVED_QUESTIONS: 'quizitt_saved_questions_'
            };
            
            const savedKey = `${STORAGE_KEYS.SAVED_QUESTIONS}${docId}`;
            localStorage.setItem(savedKey, JSON.stringify(apiSavedQuestions));
          } else {
            setError("No saved questions found for this document.");
          }
        }
      } catch (error) {
        console.error("Error loading saved questions:", error);
        setError("Error loading saved questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedQuestions();
  }, [docId]);

  // Handle going back to the main page
  const handleBackToUpload = () => {
    // Clear saved questions for this document from localStorage
    if (docId) {
      const STORAGE_KEYS = {
        SAVED_QUESTIONS: 'quizitt_saved_questions_'
      };
      const savedKey = `${STORAGE_KEYS.SAVED_QUESTIONS}${docId}`;
      localStorage.removeItem(savedKey);
    }
    router.push('/pdfquizgenerator');
  };

  // This would normally call an API to generate more questions
  const handleGenerateMore = async (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', quantity: number): Promise<void> => {
    toast.info(`Generating more ${type} would normally call an API in production.`);
    return Promise.resolve();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <Skeleton className="w-full h-8 mb-4" />
            <Skeleton className="w-3/4 h-6 mb-6" />
            <div className="space-y-4">
              <Skeleton className="w-full h-40" />
              <Skeleton className="w-full h-40" />
              <Skeleton className="w-full h-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizPage 
      file={file}
      flashcards={flashcards}
      mcqs={mcqs}
      matchingQuestions={matchingQuestions}
      trueFalseQuestions={trueFalseQuestions}
      fillInBlanksQuestions={fillInBlanksQuestions}
      onBackToUpload={handleBackToUpload}
      onGenerateMore={handleGenerateMore}
      fileContent={fileContent}
      error={error || undefined}
    />
  );
};

export default QuizPageRoute; 