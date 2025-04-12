'use client'
import React, { useState, useCallback, useRef, useEffect, FC } from 'react';
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, FileText, RefreshCw, Save, AlertCircle, ChevronRight, ChevronLeft, Download, CheckCircle, XCircle, Menu, X, BookOpen, Users, Award, BookMarked } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import HowItWorksSection from '../howItworks/page';
import FeaturesSection from '../featuresSection/page';
import TestimonialsSection from '../testimonialSection/page';
import CTASection from '../ctaSection/page';
import HeroSection from '../heroSection/page';
import DocumentHistorySidebar from './recentDocuments/RecentDocument';
import QuizPage from '../quizPage/quizPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSavedQuestionsForDocument } from '../services/documentStorage';
import { Flashcard } from '../quizPage/flashcards/flashcard-types';
import { MCQ } from '../quizPage/MCQS/mcq-types';
import { MatchingQuestion } from '../quizPage/matching-questions/matching-question-type';
import { TrueFalseQuestion } from '../quizPage/trueOrFalse/true-false-type';
import { FillInBlanksQuestion } from '../quizPage/fillblanks/fill-blanks-type';
import { processDocumentWithGemini } from '@/utils/documentProcessor';

// Ensure the PDF worker is properly set up
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

// Define TypeScript interfaces for our data
interface FlashCard {
  question: string;
  answer: string;
}

interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GeneratedQuestions {
  flashcards: FlashCard[];
  mcqs: MultipleChoiceQuestion[];
}

const PDFQuizGenerator = () => {
    // Refs
    const dropAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // State
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingProgress, setProcessingProgress] = useState<number>(0);
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestions | null>(null);
    const [activeTab, setActiveTab] = useState<string>('upload');
    const [pdfText, setPdfText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
    const [showFlashcardAnswer, setShowFlashcardAnswer] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [userMCQAnswers, setUserMCQAnswers] = useState<{[key: number]: string}>({});
    const [mcqSubmitted, setMcqSubmitted] = useState<boolean>(false);
    const [mcqScore, setMcqScore] = useState<number>(0);
    
    // Quiz page specific state
    const [showQuizPage, setShowQuizPage] = useState<boolean>(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [matchingQuestions, setMatchingQuestions] = useState<MatchingQuestion[]>([]);
    const [trueFalseQuestions, setTrueFalseQuestions] = useState<TrueFalseQuestion[]>([]);
    const [fillInBlanksQuestions, setFillInBlanksQuestions] = useState<FillInBlanksQuestion[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
    const [documentFileContent, setDocumentFileContent] = useState<string>("");

    // Toggle theme
    const toggleTheme = useCallback(() => {
      setIsDarkMode(prev => !prev);
      document.documentElement.classList.toggle('dark');
    }, []);
  
    // Effect to initialize theme based on system preference
    useEffect(() => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }, []);
  
    // Handle drag events
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);
  
    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);
  
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);
  
    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.type === 'application/pdf') {
          setFile(droppedFile);
          setFileName(droppedFile.name);
          setError(null);
        } else {
          setError('Please upload a PDF file');
        }
      }
    }, []);
  
    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === 'application/pdf') {
          setFile(selectedFile);
          setFileName(selectedFile.name);
          setError(null);
        } else {
          setError('Please upload a PDF file');
        }
      }
    }, []);
  
    // Trigger file input click
    const handleUploadClick = useCallback(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, []);
  
    // Extract text from PDF
    const extractTextFromPDF = useCallback(async (pdfFile: File) => {
      setIsLoading(true);
      try {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert file to base64'));
            }
          };
          reader.onerror = () => reject(reader.error);
        });
        
        reader.readAsDataURL(pdfFile);
        const base64Content = await base64Promise;
        
        // Use the new document processor
        const extractedText = await processDocumentWithGemini(
          base64Content,
          pdfFile.name,
          pdfFile.type,
          (progress: number) => setProcessingProgress(Math.floor(progress * 0.5)) // First 50% for PDF extraction
        );
        
        setPdfText(extractedText);
        return extractedText;
      } catch (err) {
        console.error("Error extracting text from PDF:", err);
        setError('Failed to process PDF. Please try another file.');
        return '';
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    // Generate questions from text using a mock function (would connect to API in production)
    const generateQuestionsFromText = useCallback(async (text: string) => {
      setIsProcessing(true);
      
      try {
        // Simulate API call with timeouts
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingProgress(60);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setProcessingProgress(75);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        setProcessingProgress(90);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProcessingProgress(100);
        
        // Mock generated questions
        // In a real application, this would come from an API
        const mockQuestions: GeneratedQuestions = {
          flashcards: [
            {
              question: "What is the main purpose of quizitt?",
              answer: "To transform PDFs into interactive quizzes, including flashcards and multiple-choice questions for enhanced learning."
            },
            {
              question: "What are the three steps to generate questions with quizitt?",
              answer: "1. Upload your PDF, 2. Generate Questions, 3. Study & Download."
            },
            {
              question: "What types of questions does quizitt generate?",
              answer: "Flashcards and multiple-choice questions."
            },
            {
              question: "Who are the target users for quizitt?",
              answer: "Students and educators who want to create study materials from PDF documents."
            },
            {
              question: "What technology powers quizitt?",
              answer: "AI algorithms that analyze PDF content to automatically create relevant questions."
            }
          ],
          mcqs: [
            {
              question: "What is the main feature of quizitt?",
              options: [
                "Editing PDF documents",
                "Transforming PDFs into interactive quizzes",
                "Creating PDF documents from scratch",
                "Translating PDF documents"
              ],
              correctAnswer: "Transforming PDFs into interactive quizzes"
            },
            {
              question: "Which of the following is NOT a feature mentioned in the quizitt website?",
              options: [
                "AI-Generated Questions",
                "Interactive Flashcards",
                "Multiple-Choice Tests",
                "Video Tutorials"
              ],
              correctAnswer: "Video Tutorials"
            },
            {
              question: "How many steps are involved in the quizitt process?",
              options: [
                "Two",
                "Three",
                "Four",
                "Five"
              ],
              correctAnswer: "Three"
            },
            {
              question: "According to the testimonials, who found the tool helpful for creating quiz materials from lecture notes?",
              options: [
                "Dr. Sarah Johnson",
                "Alex Rodriguez",
                "Prof. Michael Brown",
                "None of the above"
              ],
              correctAnswer: "Prof. Michael Brown"
            },
            {
              question: "What type of content does quizitt analyze?",
              options: [
                "Only images",
                "Only text documents",
                "PDF documents",
                "Audio files"
              ],
              correctAnswer: "PDF documents"
            }
          ]
        };
        
        // Convert to the expected types for QuizPage
        const convertedFlashcards: Flashcard[] = mockQuestions.flashcards.map((card, index) => ({
          front: card.question,
          question: card.question,
          answer: card.answer
        }));
        
        const convertedMcqs: MCQ[] = mockQuestions.mcqs.map((mcq, index) => {
          const correctAnswerText = mcq.correctAnswer;
          const correctAnswerIndex = mcq.options.indexOf(correctAnswerText);
          return {
            question: mcq.question,
            options: mcq.options,
            correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0
          };
        });
        
        // Set the generated questions in the generator's state
        setGeneratedQuestions(mockQuestions);
        
        // Also set the typed state for QuizPage
        setFlashcards(convertedFlashcards);
        setMcqs(convertedMcqs);
        
        // Reset UI state
        setCurrentFlashcardIndex(0);
        setShowFlashcardAnswer(false);
        setUserMCQAnswers({});
        setMcqSubmitted(false);
        setActiveTab('flashcards');
        
        return mockQuestions;
      } catch (err) {
        console.error("Error generating questions:", err);
        setError('Failed to generate questions. Please try again.');
        return null;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    }, []);
    const handleDocumentSelect = (documentId: string) => {
      console.log(`Selected document: ${documentId}`);
      setSelectedDocumentId(documentId);
      
      // Try to get saved questions from localStorage
      const savedQuestions = getSavedQuestionsForDocument(documentId);
      if (savedQuestions) {
        handleLoadSavedQuestions(documentId, savedQuestions);
      }
    };
    // Process PDF and generate questions
    const processPDF = useCallback(async () => {
      if (!file) {
        setError('Please upload a PDF file first');
        return;
      }
      
      setError(null);
      const extractedText = await extractTextFromPDF(file);
      if (extractedText) {
        await generateQuestionsFromText(extractedText);
      }
    }, [file, extractTextFromPDF, generateQuestionsFromText]);
  
    // Reset state
    const handleReset = useCallback(() => {
      setFile(null);
      setFileName('');
      setPdfText('');
      setGeneratedQuestions(null);
      setError(null);
      setActiveTab('upload');
      setProcessingProgress(0);
    }, []);
  
    // Handle flashcard navigation
    const goToPreviousFlashcard = useCallback(() => {
      setShowFlashcardAnswer(false);
      setCurrentFlashcardIndex(prev => 
        prev > 0 ? prev - 1 : generatedQuestions?.flashcards.length ? generatedQuestions.flashcards.length - 1 : 0
      );
    }, [generatedQuestions?.flashcards.length]);
  
    const goToNextFlashcard = useCallback(() => {
      setShowFlashcardAnswer(false);
      setCurrentFlashcardIndex(prev => 
        generatedQuestions?.flashcards.length && prev < generatedQuestions.flashcards.length - 1 ? prev + 1 : 0
      );
    }, [generatedQuestions?.flashcards.length]);
  
    // Toggle flashcard answer
    const toggleFlashcardAnswer = useCallback(() => {
      setShowFlashcardAnswer(prev => !prev);
    }, []);
  
    // Handle MCQ answer selection
    const handleMCQAnswerSelection = useCallback((questionIndex: number, answer: string) => {
      if (!mcqSubmitted) {
        setUserMCQAnswers(prev => ({
          ...prev,
          [questionIndex]: answer
        }));
      }
    }, [mcqSubmitted]);
  
    // Submit MCQ answers
    const submitMCQAnswers = useCallback(() => {
      if (generatedQuestions?.mcqs) {
        let score = 0;
        
        // Get the MCQ questions with the correct types
        const convertedMcqs: MCQ[] = mcqs;
        
        // Use the converted MCQs for scoring
        convertedMcqs.forEach((mcq, index) => {
          if (userMCQAnswers[index] === mcq.options[mcq.correctAnswer]) {
            score++;
          }
        });
        
        setMcqScore(score);
        setMcqSubmitted(true);
      }
    }, [generatedQuestions?.mcqs, mcqs, userMCQAnswers]);
  
    // Reset MCQ quiz
    const resetMCQQuiz = useCallback(() => {
      setUserMCQAnswers({});
      setMcqSubmitted(false);
      setMcqScore(0);
    }, []);
  
    // Download flashcards as PDF (mock function)
    const downloadFlashcards = useCallback(() => {
      alert('This would download the flashcards as a PDF in a real application.');
    }, []);
  
    // Download MCQs as PDF (mock function)
    const downloadMCQs = useCallback(() => {
      alert('This would download the multiple-choice questions as a PDF in a real application.');
    }, []);
  
    // Handle loading saved questions
    const handleLoadSavedQuestions = (docId: string, savedQuestions: any) => {
      console.log('Loading saved questions for document:', docId);
      
      // Update state with saved questions
      if (savedQuestions) {
        setSelectedDocumentId(docId);
        
        // Convert flashcards to expected format
        setFlashcards(savedQuestions.flashcards?.map((card: any, index: number) => ({
          front: card.question || card.front || `Question ${index + 1}`,
          question: card.question || card.front || `Question ${index + 1}`,
          answer: card.answer || card.back || ''
        })) || []);
        
        // Convert MCQs to expected format - important: convert correctAnswer to number index
        setMcqs(savedQuestions.mcqs?.map((mcq: any, index: number) => ({
          question: mcq.question || `Question ${index + 1}`,
          options: mcq.options || [],
          correctAnswer: typeof mcq.correctAnswer === 'number' 
            ? mcq.correctAnswer 
            : mcq.options?.indexOf(mcq.correctAnswer) || 0
        })) || []);
        
        // Convert matching questions to expected format
        setMatchingQuestions(savedQuestions.matchingQuestions?.map((q: any, index: number) => {
          // Handle different formats of matching questions
          let leftItems: string[] = [];
          let rightItems: string[] = [];
          let correctMatches: number[] = [];
          
          if (q.pairs) {
            // If we have pairs, extract left/right items
            leftItems = q.pairs.map((p: any) => p.left);
            rightItems = q.pairs.map((p: any) => p.right);
            correctMatches = rightItems.map((_: any, i: number) => i);
          } else if (q.leftItems && q.rightItems) {
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
        
        // Convert true/false questions to expected format
        setTrueFalseQuestions(savedQuestions.trueFalseQuestions?.map((tf: any, index: number) => ({
          id: index + 1,
          question: tf.statement || tf.question || `Statement ${index + 1}`,
          isTrue: !!tf.isTrue,
          explanation: tf.explanation || ''
        })) || []);
        
        // Convert fill-in-blanks questions to expected format
        setFillInBlanksQuestions(savedQuestions.fillInBlanksQuestions?.map((fib: any, index: number) => {
          const blanks = fib.blanks || [];
          const text = fib.text || '';
          
          // Generate textWithBlanks if not provided
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
        
        // We don't have the actual file, so create a placeholder
        const dummyFile = new File([""], savedQuestions.documentId || "document.pdf", { type: "application/pdf" });
        setFile(dummyFile);
        setFileName(savedQuestions.documentId || "document.pdf");
        
        // Show quiz page
        setShowQuizPage(true);
      }
    };

    // Handle going back to upload page
    const handleBackToUpload = () => {
      setShowQuizPage(false);
      setFile(null);
      setSelectedDocumentId("");
      setFlashcards([]);
      setMcqs([]);
      setMatchingQuestions([]);
      setTrueFalseQuestions([]);
      setFillInBlanksQuestions([]);
      setActiveTab('upload');
    };

    // Handle generating more questions
    const handleGenerateMore = async (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', quantity: number): Promise<void> => {
      // This would be implemented to call your API for generating more questions
      console.log(`Generating more ${type} questions, quantity: ${quantity}`);
      
      // Mock implementation - in a real app, this would call an API
      if (type === 'mcqs') {
        // Example of adding mock MCQs with proper type conversion
        const newMcqs: MCQ[] = Array(quantity).fill(0).map((_, i) => ({
          question: `New MCQ question ${i+1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0 // Index of correct answer
        }));
        setMcqs([...mcqs, ...newMcqs]);
      }
      
      return Promise.resolve();
    };

    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="dark:bg-gray-900 min-h-screen">
          
          {/* Conditional rendering for landing page vs application */}
          {(!showQuizPage && activeTab === 'upload' && flashcards.length === 0) ? (
            // Landing page sections
            <>
              <div className="relative">
                <DocumentHistorySidebar
                  onSelectDocument={handleDocumentSelect}
                  currentDocumentId={selectedDocumentId}
                  navbarHeight={64}
                  onLoadSavedQuestions={handleLoadSavedQuestions}
                />
              </div>
              <HeroSection></HeroSection>
              <FeaturesSection></FeaturesSection>
              <HowItWorksSection></HowItWorksSection>
              <TestimonialsSection></TestimonialsSection>
              <CTASection></CTASection>
            </>
          ) : showQuizPage || flashcards.length > 0 ? (
            // Render quiz page if showQuizPage is true or we have flashcards
            <div className="min-h-screen">
              <QuizPage 
                file={file}
                flashcards={flashcards}
                mcqs={mcqs}
                matchingQuestions={matchingQuestions}
                trueFalseQuestions={trueFalseQuestions}
                fillInBlanksQuestions={fillInBlanksQuestions}
                onBackToUpload={handleBackToUpload}
                onGenerateMore={handleGenerateMore}
                fileContent={documentFileContent}
              />
            </div>
          ) : (
            // Main application
            <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                    PDF Quiz Generator
                  </h1>
                  <TabsList className="mb-4 md:mb-0">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    {generatedQuestions && (
                      <>
                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                        <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
                      </>
                    )}
                  </TabsList>
                </div>
                
                <TabsContent value="upload" className="mt-2">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Upload PDF Document</CardTitle>
                      <CardDescription>
                        Upload your study material to generate flashcards and quiz questions
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div
                        ref={dropAreaRef}
                        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                          isDragging 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 dark:border-gray-700'
                        } ${
                          error ? 'border-red-500 dark:border-red-800' : ''
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                        
                        <div className="space-y-4">
                          {!file ? (
                            <>
                              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Drag & Drop your PDF here
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400">
                                or
                              </p>
                              <Button 
                                onClick={handleUploadClick}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                              >
                                Select PDF
                              </Button>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {fileName}
                              </h3>
                              <div className="flex justify-center space-x-3">
                                <Button 
                                  variant="outline" 
                                  onClick={handleReset}
                                  className="dark:border-gray-700 dark:text-gray-300"
                                >
                                  Change File
                                </Button>
                                <Button 
                                  onClick={processPDF}
                                  disabled={isLoading || isProcessing}
                                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                >
                                  {(isLoading || isProcessing) ? (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    'Generate Questions'
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {(isLoading || isProcessing) && (
                        <div className="mt-6 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {isLoading ? 'Extracting text from PDF...' : 'Generating questions...'}
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {processingProgress}%
                            </span>
                          </div>
                          <Progress value={processingProgress} className="w-full" />
                        </div>
                      )}
                      
                      {error && (
                        <Alert variant="destructive" className="mt-6">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {generatedQuestions && (
                  <>
                    <TabsContent value="flashcards" className="mt-2">
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Flashcards</CardTitle>
                            <Button variant="outline" onClick={downloadFlashcards}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {generatedQuestions.flashcards.length > 0 ? (
                            <div className="relative">
                              <div
                                className="min-h-[300px] bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-center cursor-pointer"
                                onClick={toggleFlashcardAnswer}
                              >
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={showFlashcardAnswer ? 'answer' : 'question'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center p-4"
                                  >
                                    {showFlashcardAnswer ? (
                                      <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Answer</h3>
                                        <p className="text-xl font-medium text-gray-900 dark:text-white">
                                          {generatedQuestions.flashcards[currentFlashcardIndex].answer}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {currentFlashcardIndex + 1}/{generatedQuestions.flashcards.length}</h3>
                                        <p className="text-xl font-medium text-gray-900 dark:text-white">
                                          {generatedQuestions.flashcards[currentFlashcardIndex].question}
                                        </p>
                                      </div>
                                    )}
                                  </motion.div>
                                </AnimatePresence>
                                <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
                                  Click to flip
                                </div>
                              </div>
                              
                              <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={goToPreviousFlashcard}>
                                  <ChevronLeft className="h-4 w-4 mr-2" />
                                  Previous
                                </Button>
                                <Button variant="outline" onClick={goToNextFlashcard}>
                                  Next
                                  <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-gray-500 dark:text-gray-400">No flashcards generated yet.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="mcq" className="mt-2">
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Multiple Choice Questions</CardTitle>
                            <Button variant="outline" onClick={downloadMCQs}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {generatedQuestions.mcqs.length > 0 ? (
                            <div>
                              {generatedQuestions.mcqs.map((mcq, questionIndex) => (
                                <div key={questionIndex} className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                                    Question {questionIndex + 1}: {mcq.question}
                                  </h3>
                                  <div className="space-y-3">
                                    {mcq.options.map((option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                                          userMCQAnswers[questionIndex] === option
                                            ? mcqSubmitted
                                              ? option === mcq.correctAnswer
                                                ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                                                : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                                              : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                                            : mcqSubmitted && option === mcq.correctAnswer
                                              ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                                              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                        } border`}
                                        onClick={() => handleMCQAnswerSelection(questionIndex, option)}
                                      >
                                        <div className="flex-grow">
                                          <p className="text-gray-900 dark:text-white">{option}</p>
                                        </div>
                                        {mcqSubmitted && (
                                          <div className="ml-3">
                                            {option === mcq.correctAnswer ? (
                                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            ) : userMCQAnswers[questionIndex] === option ? (
                                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            ) : null}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="mt-8 flex justify-between">
                                {mcqSubmitted ? (
                                  <>
                                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                                      Your Score: {mcqScore}/{generatedQuestions.mcqs.length} ({Math.round((mcqScore / generatedQuestions.mcqs.length) * 100)}%)
                                    </div>
                                    <Button onClick={resetMCQQuiz}>
                                      Try Again
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    onClick={submitMCQAnswers}
                                    className="ml-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                  >
                                    Submit Answers
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-gray-500 dark:text-gray-400">No multiple choice questions generated yet.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>
          )}
          
        </div>
      </div>
    );
  };
  
  export default PDFQuizGenerator;