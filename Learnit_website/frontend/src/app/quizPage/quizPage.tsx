'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Add alert component import
import { useRouter } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';
import { setSoundEffectsEnabled, areSoundEffectsEnabled, resetConsecutiveCorrectCounter } from '@/utils/soundEffects';
import { ShortcutsProvider } from '@/contexts/ShortcutsContext';
import { QuizScoreboard } from '../components/QuizScoreboard';
import { MCQ } from './MCQS/mcq-types';
import { Flashcard } from './flashcards/flashcard-types';
import { TrueFalseQuestion } from './trueOrFalse/true-false-type';
import { MatchingQuestion } from './matching-questions/matching-question-type';
import { FlashcardSection } from './flashcards/flashcard-section';
import { TrueFalseSection } from './trueOrFalse/true-false-section';
import { MatchingSection } from './matching-questions/matching-question-section';
import { MCQSection } from './MCQS/mcq-section';
import { AudiobookSection } from './audiobook/AudioBook';
import { FillInBlanksSection } from './fillblanks/FillBlanksSection';
import { FillInBlanksQuestion } from './fillblanks/fill-blanks-type';
// Define TypeScript interfaces
interface QuizPageProps {
  file: File | null;
  flashcards: Flashcard[];
  mcqs: MCQ[];
  matchingQuestions: MatchingQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  fillInBlanksQuestions: FillInBlanksQuestion[]; // Add this line
  onBackToUpload: () => void;
  onGenerateMore?: (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', quantity: number) => Promise<void>;
  onGenerateAudio?: () => Promise<void>;
  isGeneratingAudio?: boolean;
  fileContent: string;
  error?: string; // Add error prop to handle document content errors
  isYouTubeQuiz?: boolean; // Add this property for YouTube quiz integration
  loadingProgress?: {
    flashcards: number;
    mcqs: number;
    matching: number;
    trueFalse: number;
    fillInBlanks: number;
  };
}

const QuizPage: React.FC<QuizPageProps> = ({ 
  file, 
  flashcards, 
  mcqs, 
  matchingQuestions, 
  trueFalseQuestions,
  fillInBlanksQuestions, // Add this line with default value
  onBackToUpload,
  onGenerateMore,
  onGenerateAudio = async () => {},
  isGeneratingAudio = false,
  fileContent = "",
  error = "", // Add error prop with default empty string
  isYouTubeQuiz = false, // Default value for isYouTubeQuiz
  loadingProgress = {
    flashcards: 100,
    mcqs: 100,
    matching: 100,
    trueFalse: 100,
    fillInBlanks: 100
  }
}) => {
  const [activeTab, setActiveTab] = useState<"flashcards" | "mcq" | "matching" | "truefalse" | "fillInBlanks" | "audiobook">("flashcards");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Initialize sound preference on component mount
  useEffect(() => {
    setSoundEnabled(areSoundEffectsEnabled());
  }, []);
  
  // Toggle sound effects
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setSoundEffectsEnabled(newState);
  };

  // Handler for generating more questions
  const handleGenerateMore = async (
    type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', 
    quantity: number
  ) => {
    if (!onGenerateMore) return;
    
    setIsGenerating(true);
    try {
      await onGenerateMore(type, quantity);
    } catch (error) {
      console.error(`Error generating more ${type} questions:`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Tab change handler
  const handleTabChange = (tab: "flashcards" | "mcq" | "matching" | "truefalse" | "fillInBlanks" | "audiobook" ) => {
    setActiveTab(tab);
    // Don't reset the streak when switching between question types
    // This allows users to build up a streak across all question types
  };

  // If there's an error, show error message instead of quiz content
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4 max-w-[75%]">
              <Button 
                variant="ghost" 
                onClick={onBackToUpload}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">
                {file?.name || "Study Session"}
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Document Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center mt-8">
              <Button onClick={onBackToUpload} className="bg-blue-500 hover:bg-blue-600 text-white">
                Return to Upload Page
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ShortcutsProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 lg:py-16 px-2 sm:px-4 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4 max-w-[75%]">
              <Button 
                variant="ghost" 
                onClick={onBackToUpload}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">
                {file?.name || "Study Session"}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="px-2 sm:px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="flex flex-nowrap justify-start sm:justify-center gap-1 sm:gap-2 md:gap-3 w-full min-w-full">
              <Button 
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center
                  ${
                    activeTab === "flashcards" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
                onClick={() => handleTabChange("flashcards")}
              >
                <span className="hidden sm:inline">Flashcards</span>
                <span className="sm:hidden">Cards</span>
              </Button>
              <Button 
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center
                  ${
                    activeTab === "mcq" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
                onClick={() => handleTabChange("mcq")}
              >
                <span className="hidden sm:inline">Multiple Choice</span>
                <span className="sm:hidden">MCQ</span>
              </Button>
              <Button 
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center
                  ${
                    activeTab === "matching" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
                onClick={() => handleTabChange("matching")}
              >
                <span className="hidden sm:inline">Match Items</span>
                <span className="sm:hidden">Match</span>
              </Button>
              <Button 
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center
                  ${
                    activeTab === "truefalse" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
                onClick={() => handleTabChange("truefalse")}
              >
                <span className="hidden sm:inline">True/False</span>
                <span className="sm:hidden">T/F</span>
              </Button>
              <Button 
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center
                  ${
                    activeTab === "fillInBlanks" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
                onClick={() => handleTabChange("fillInBlanks")}
              >
                <span className="hidden sm:inline">Fill in Blanks</span>
                <span className="sm:hidden">Blanks</span>
              </Button>
              <Button 
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center
                  ${
                    activeTab === "audiobook" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
                onClick={() => handleTabChange("audiobook")}
              >
                <span className="hidden sm:inline">Audiobook</span>
                <span className="sm:hidden">Audio</span>
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* FLASHCARDS TAB */}
              {activeTab === "flashcards" && (
                <motion.div
                  key="flashcards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add loading progress bar for flashcards if not at 100% */}
                  {loadingProgress.flashcards < 100 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Loading flashcards...</span>
                        <span>{loadingProgress.flashcards}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${loadingProgress.flashcards}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <QuizScoreboard
                    title="Flashcards"
                    onGenerateMore={(quantity) => handleGenerateMore('flashcards', quantity)}
                    isGenerating={isGenerating}
                    quantity={5}
                  />
                  <FlashcardSection 
                    flashcards={flashcards}
                  />
                </motion.div>
              )}

              {/* MCQ TAB */}
              {activeTab === "mcq" && (
                <motion.div
                  key="mcq"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add loading progress bar for MCQs if not at 100% */}
                  {loadingProgress.mcqs < 100 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Loading multiple choice questions...</span>
                        <span>{loadingProgress.mcqs}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${loadingProgress.mcqs}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <QuizScoreboard
                    title="Multiple Choice Questions"
                    onGenerateMore={(quantity) => handleGenerateMore('mcqs', quantity)}
                    isGenerating={isGenerating}
                    quantity={5}
                  />
                  <MCQSection 
                    mcqs={mcqs}
                  />
                </motion.div>
              )}
              
              {/* MATCHING QUESTIONS TAB */}
              {activeTab === "matching" && (
                <motion.div
                  key="matching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add loading progress bar for matching questions if not at 100% */}
                  {loadingProgress.matching < 100 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Loading matching questions...</span>
                        <span>{loadingProgress.matching}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${loadingProgress.matching}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <QuizScoreboard
                    title="Matching Questions"
                    onGenerateMore={(quantity) => handleGenerateMore('matching', quantity)}
                    isGenerating={isGenerating}
                    quantity={3}
                  />
                  <MatchingSection 
                    matchingQuestions={matchingQuestions}
                  />
                </motion.div>
              )}
              
              {/* TRUE/FALSE TAB */}
              {activeTab === "truefalse" && (
                <motion.div
                  key="truefalse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add loading progress bar for true/false questions if not at 100% */}
                  {loadingProgress.trueFalse < 100 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Loading true/false questions...</span>
                        <span>{loadingProgress.trueFalse}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${loadingProgress.trueFalse}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <QuizScoreboard
                    title="True/False Questions"
                    onGenerateMore={(quantity) => handleGenerateMore('trueFalse', quantity)}
                    isGenerating={isGenerating}
                    quantity={5}
                  />
                  <TrueFalseSection 
                    trueFalseQuestions={trueFalseQuestions}
                  />
                </motion.div>
              )}
              {/* Fill in the blanks */}
              {/* FILL IN BLANKS TAB */}
              {activeTab === "fillInBlanks" && (
                <motion.div
                  key="fillInBlanks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add loading progress bar for fill-in-blanks questions if not at 100% */}
                  {loadingProgress.fillInBlanks < 100 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Loading fill-in-the-blanks questions...</span>
                        <span>{loadingProgress.fillInBlanks}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${loadingProgress.fillInBlanks}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <QuizScoreboard
                    title="Fill in the Blanks"
                    onGenerateMore={(quantity) => handleGenerateMore('fillInBlanks', quantity)}
                    isGenerating={isGenerating}
                    quantity={5}
                  />
                  <FillInBlanksSection 
                    fillInBlanksQuestions={fillInBlanksQuestions}
                  />
                </motion.div>
              )}
              {/* AUDIOBOOK TAB */}
              {activeTab === "audiobook" && (
                <motion.div
                  key="audiobook"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AudiobookSection
                    fileContent={fileContent}
                    fileName={file?.name || "Document"}
                    isGenerating={isGeneratingAudio}
                    flashcards={flashcards}
                    mcqs={mcqs}
                    trueFalseQuestions={trueFalseQuestions}
                    onGenerateAudio={onGenerateAudio}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </ShortcutsProvider>
  );
};

export default QuizPage;