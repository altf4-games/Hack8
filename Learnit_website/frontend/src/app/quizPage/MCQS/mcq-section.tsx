import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { MCQ } from './mcq-types';
import { Check, X, Trophy, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { playCorrectSound, playIncorrectSound, resetConsecutiveCorrectCounter } from '@/utils/soundEffects';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useShortcuts } from '../../../contexts/ShortcutsContext';

interface MCQSectionProps {
  mcqs: MCQ[];
  onGenerateMore?: (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', count: number) => Promise<void>;
  isGenerating?: boolean;
}

export const MCQSection: React.FC<MCQSectionProps> = ({ mcqs }) => {
  const [currentMCQIndex, setCurrentMCQIndex] = useState<number>(0);
  const [selectedMCQAnswer, setSelectedMCQAnswer] = useState<number | null>(null);
  const [showMCQCorrectAnswer, setShowMCQCorrectAnswer] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [correctQuestions, setCorrectQuestions] = useState<number[]>([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'error'>('success');

  // Get the shortcut context
  const { shouldShowShortcuts } = useShortcuts();

  const getProgressPercentage = () => {
    return (answeredQuestions.length / mcqs.length) * 100;
  };

  const getScorePercentage = () => {
    if (answeredQuestions.length === 0) return 0;
    return (score / answeredQuestions.length) * 100;
  };

  const updateFeedback = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) {
      setFeedbackMessage("Excellent work! Keep it up!");
      setFeedbackType('success');
    } else if (percentage >= 60) {
      setFeedbackMessage("Good job! You're doing well.");
      setFeedbackType('success');
    } else if (percentage >= 40) {
      setFeedbackMessage("Good effort! Keep practicing to improve.");
      setFeedbackType('warning');
    } else if (percentage > 0) {
      setFeedbackMessage("Don't worry, learning takes time. Try again!");
      setFeedbackType('error');
    } else {
      setFeedbackMessage("Let's start answering questions!");
      setFeedbackType('success');
    }
  };

  useEffect(() => {
    updateFeedback();
  }, [score, answeredQuestions]);

  const nextMCQ = () => {
    if (currentMCQIndex < mcqs.length - 1) {
      setSelectedMCQAnswer(null);
      setShowMCQCorrectAnswer(false);
      setTimeout(() => {
        setCurrentMCQIndex(currentMCQIndex + 1);
      }, 300);
    }
  };

  const prevMCQ = () => {
    if (currentMCQIndex > 0) {
      setSelectedMCQAnswer(null);
      setShowMCQCorrectAnswer(false);
      setTimeout(() => {
        setCurrentMCQIndex(currentMCQIndex - 1);
      }, 300);
    }
  };

  const handleMCQAnswerSelect = (index: number) => {
    setSelectedMCQAnswer(index);
    setShowMCQCorrectAnswer(true);
    
    // Update answered questions
    if (!answeredQuestions.includes(currentMCQIndex)) {
      setAnsweredQuestions([...answeredQuestions, currentMCQIndex]);
      
      // Update correct/incorrect tracking
      if (index === mcqs[currentMCQIndex].correctAnswer) {
        setScore(score + 1);
        setCorrectQuestions([...correctQuestions, currentMCQIndex]);
        playCorrectSound();
      } else {
        setIncorrectQuestions([...incorrectQuestions, currentMCQIndex]);
        playIncorrectSound();
      }
    }
  };

  // Helper function to determine dot color based on answer status
  const getDotColor = (index: number) => {
    if (correctQuestions.includes(index)) {
      return "bg-green-500";
    } else if (incorrectQuestions.includes(index)) {
      return "bg-red-500";
    } else if (index === currentMCQIndex) {
      return "bg-blue-500";
    } else {
      return "bg-gray-300 dark:bg-gray-600";
    }
  };

  // Helper function to determine dot width 
  const getDotWidth = (index: number) => {
    return index === currentMCQIndex ? "w-8" : "w-2";
  };

  // Helper function to get tooltip text for dots
  const getDotTooltip = (index: number) => {
    if (correctQuestions.includes(index)) {
      return "Correct";
    } else if (incorrectQuestions.includes(index)) {
      return "Incorrect";
    } else if (answeredQuestions.includes(index)) {
      return "Answered";
    } else {
      return "Not answered yet";
    }
  };

  // Calculate current question score
  const currentQuestionAnswered = answeredQuestions.includes(currentMCQIndex);
  const currentQuestionCorrect = correctQuestions.includes(currentMCQIndex);

  // Add keyboard navigation
  useKeyboardNavigation({
    onNext: nextMCQ,
    onPrev: prevMCQ,
    canGoNext: currentMCQIndex < mcqs.length - 1,
    canGoPrev: currentMCQIndex > 0
  });

  // Add swipe navigation
  useSwipeNavigation({
    onNext: nextMCQ,
    onPrev: prevMCQ,
    canGoNext: currentMCQIndex < mcqs.length - 1,
    canGoPrev: currentMCQIndex > 0,
    minSwipeDistance: 50
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
      {/* Add keyboard shortcut hint - only show on desktop and if shortcuts haven't been used */}
      {shouldShowShortcuts && (
        <div className="hidden md:block text-center mb-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Shift+A</kbd> for previous, <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Shift+D</kbd> for next</p>
        </div>
      )}

      {/* Add swipe hint for mobile */}
      <div className="md:hidden text-center mb-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Swipe left/right to navigate between questions</p>
      </div>

      {/* Scoreboard and Progress Section - Styled like MatchingSection */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-4 md:p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-indigo-100 text-sm md:text-base">
              Question {currentMCQIndex + 1} of {mcqs.length}
            </p>
          </div>
          
          <div className="flex items-center bg-white/20 rounded-xl px-4 py-2">
            <Award className="w-5 h-5 mr-2 text-yellow-300" />
            <span className="font-bold">{score}/{answeredQuestions.length}</span>
            <span className="mx-2 text-indigo-200">•</span>
            <span className="font-bold">{getScorePercentage().toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-indigo-100 mb-1">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2 bg-white/30" />
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentMCQIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <span className="inline-block bg-gradient-to-r from-blue-400 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Question {currentMCQIndex + 1} of {mcqs.length}
                </span>
                
                <div className="flex space-x-1 items-center">
                  {correctQuestions.includes(currentMCQIndex) ? (
                    <span className="flex items-center text-xs text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      <Check className="h-3 w-3 mr-1" />
                      Correct
                    </span>
                  ) : incorrectQuestions.includes(currentMCQIndex) ? (
                    <span className="flex items-center text-xs text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                      <X className="h-3 w-3 mr-1" />
                      Incorrect
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                      <span className="h-2 w-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
                      Pending
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4">
                {mcqs[currentMCQIndex]?.question}
              </h3>
            </div>
            
            <div className="space-y-3">
              {mcqs[currentMCQIndex]?.options.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: selectedMCQAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedMCQAnswer === null ? 0.98 : 1 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMCQAnswer === index
                      ? index === mcqs[currentMCQIndex].correctAnswer
                        ? "bg-green-50 dark:bg-green-900/30 border-green-500 shadow-md"
                        : "bg-red-50 dark:bg-red-900/30 border-red-500 shadow-md"
                      : selectedMCQAnswer !== null && index === mcqs[currentMCQIndex].correctAnswer
                      ? "bg-green-50 dark:bg-green-900/30 border-green-500 shadow-md"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                  }`}
                  onClick={() => !selectedMCQAnswer && handleMCQAnswerSelect(index)}
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 font-medium transition-colors ${
                      selectedMCQAnswer === index
                        ? index === mcqs[currentMCQIndex].correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : selectedMCQAnswer !== null && index === mcqs[currentMCQIndex].correctAnswer
                        ? "bg-green-500 text-white"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-800 dark:text-white">{option}</span>
                    
                    {selectedMCQAnswer !== null && (
                      <span className="ml-auto">
                        {index === mcqs[currentMCQIndex].correctAnswer && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          >
                            <Check className="w-6 h-6 text-green-500" />
                          </motion.div>
                        )}
                        {selectedMCQAnswer === index && index !== mcqs[currentMCQIndex].correctAnswer && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          >
                            <X className="w-6 h-6 text-red-500" />
                          </motion.div>
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Feedback Section - Styled like MatchingSection */}
            {showMCQCorrectAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`mt-8 p-4 rounded-lg border ${
                  currentQuestionCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 ${
                    currentQuestionCorrect
                      ? 'bg-green-100 dark:bg-green-800'
                      : 'bg-red-100 dark:bg-red-800'
                  }`}>
                    {currentQuestionCorrect ? (
                      <Award className="w-6 h-6 text-green-600 dark:text-green-300" />
                    ) : (
                      <Award className="w-6 h-6 text-red-600 dark:text-red-300" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      currentQuestionCorrect
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      {currentQuestionCorrect 
                        ? "Great job! You got it right!" 
                        : "Don't worry, learning takes practice."}
                    </h4>
                    {!currentQuestionCorrect && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Correct answer: {mcqs[currentMCQIndex].options[mcqs[currentMCQIndex].correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Controls - Styled like MatchingSection */}
      <div className="flex justify-between items-center mt-6 mb-8">
        <Button 
          variant="outline"
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            currentMCQIndex > 0 
              ? "border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20" 
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={prevMCQ}
          disabled={currentMCQIndex === 0}
        >
          <ChevronLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </Button>
        
        <div className="flex space-x-1">
          {mcqs.map((_, index) => (
            <div 
              key={index} 
              className={`h-3 rounded-full transition-all cursor-pointer ${
                index === currentMCQIndex 
                  ? "w-10 bg-gradient-to-r from-indigo-500 to-purple-500" 
                  : correctQuestions.includes(index)
                  ? "w-3 bg-green-500"
                  : incorrectQuestions.includes(index)
                  ? "w-3 bg-red-500"
                  : "w-3 bg-gray-300 dark:bg-gray-600"
              }`}
              onClick={() => {
                setSelectedMCQAnswer(null);
                setShowMCQCorrectAnswer(false);
                setCurrentMCQIndex(index);
              }}
              title={getDotTooltip(index)}
            ></div>
          ))}
        </div>
        
        <Button 
          variant="outline"
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            currentMCQIndex < mcqs.length - 1 
              ? "border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20" 
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={nextMCQ}
          disabled={currentMCQIndex === mcqs.length - 1}
        >
          <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </Button>
      </div>
      
      {/* Quiz completion trophy (shows when all questions are answered) */}
      {answeredQuestions.length === mcqs.length && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-lg text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Quiz Completed!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">You scored {score} out of {mcqs.length} questions.</p>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full mb-4 overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(score / mcqs.length) * 100}%` }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
            
            <p className={`font-medium ${
              getScorePercentage() >= 80 ? "text-green-600 dark:text-green-400" : 
              getScorePercentage() >= 60 ? "text-yellow-600 dark:text-yellow-400" : 
              "text-red-600 dark:text-red-400"
            }`}>
              {getScorePercentage() >= 80 ? "Excellent work! 🎉" : 
               getScorePercentage() >= 60 ? "Good job! 👍" : 
               "Keep practicing! 💪"}
            </p>
            
            {/* Color-coded question breakdown */}
            <div className="mt-4 grid grid-cols-5 gap-2 w-full max-w-xs">
              {mcqs.map((_, index) => (
                <div
                  key={index}
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs text-white font-medium cursor-pointer ${
                    correctQuestions.includes(index) 
                      ? "bg-green-500" 
                      : incorrectQuestions.includes(index)
                      ? "bg-red-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={() => {
                    setSelectedMCQAnswer(null);
                    setShowMCQCorrectAnswer(false);
                    setCurrentMCQIndex(index);
                  }}
                  title={`Question ${index + 1}: ${getDotTooltip(index)}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};