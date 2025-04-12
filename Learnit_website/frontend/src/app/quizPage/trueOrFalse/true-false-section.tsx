'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { TrueFalseQuestion } from './true-false-type';
import { CheckCircle, XCircle, Trophy, AlertTriangle } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, resetConsecutiveCorrectCounter } from '@/utils/soundEffects';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useShortcuts } from '../../../contexts/ShortcutsContext';

interface TrueFalseSectionProps {
  trueFalseQuestions: TrueFalseQuestion[];
  onGenerateMore?: (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', count: number) => Promise<void>;
  isGenerating?: boolean;
}

export const TrueFalseSection: React.FC<TrueFalseSectionProps> = ({ trueFalseQuestions, isGenerating }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, boolean>>({});

  // Get the shortcut context
  const { shouldShowShortcuts } = useShortcuts();

  // Add loading state handling
  if (!trueFalseQuestions || trueFalseQuestions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <h3 className="text-xl font-bold">Loading True/False Questions</h3>
            <p className="text-white/80">Questions will appear here as they are generated...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate performance feedback based on current score
  const getPerformanceFeedback = () => {
    // If no questions answered yet, show an encouraging message instead
    if (answeredQuestions.length === 0) {
      return { message: "Let's get started!", color: "text-blue-500", icon: <Trophy className="w-5 h-5" /> };
    }
    
    const percentage = (score / answeredQuestions.length) * 100;
    
    if (percentage >= 90) return { message: "Outstanding!", color: "text-emerald-500", icon: <Trophy className="w-5 h-5" /> };
    if (percentage >= 75) return { message: "Great job!", color: "text-green-500", icon: <CheckCircle className="w-5 h-5" /> };
    if (percentage >= 50) return { message: "Good effort!", color: "text-blue-500", icon: <CheckCircle className="w-5 h-5" /> };
    if (percentage >= 25) return { message: "Keep trying!", color: "text-amber-500", icon: <AlertTriangle className="w-5 h-5" /> };
    return { message: "You can do better!", color: "text-rose-500", icon: <XCircle className="w-5 h-5" /> };
  };

  const performanceFeedback = getPerformanceFeedback();
  const progressPercentage = (answeredQuestions.length / trueFalseQuestions.length) * 100;

  const nextQuestion = () => {
    if (currentIndex < trueFalseQuestions.length - 1) {
      setSlideDirection("right");
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setSlideDirection("left");
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAnswerSelect = (answer: boolean) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(answer);
      setShowResult(true);
      
      // If this question hasn't been answered before
      if (!answeredQuestions.includes(currentIndex)) {
        setAnsweredQuestions([...answeredQuestions, currentIndex]);
        
        // Store the correctness of the answer
        const isCorrect = answer === trueFalseQuestions[currentIndex].isTrue;
        setQuestionAnswers({
          ...questionAnswers,
          [currentIndex]: isCorrect
        });
        
        // Update score if correct
        if (isCorrect) {
          setScore(score + 1);
          playCorrectSound();
        } else {
          playIncorrectSound();
        }
      }
    }
  };

  const cardVariants = {
    enterFromRight: {
      x: 300,
      opacity: 0,
      scale: 0.8,
    },
    enterFromLeft: {
      x: -300,
      opacity: 0,
      scale: 0.8,
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exitToLeft: {
      x: -300,
      opacity: 0,
      scale: 0.8,
    },
    exitToRight: {
      x: 300,
      opacity: 0,
      scale: 0.8,
    },
  };

  // Add null check for currentQuestion
  const currentQuestion = trueFalseQuestions[currentIndex];
  if (!currentQuestion) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-xl font-bold">No Questions Available</h3>
            <p className="text-white/80">Please wait while questions are being generated...</p>
          </div>
        </div>
      </div>
    );
  }

  // Add keyboard navigation
  useKeyboardNavigation({
    onNext: nextQuestion,
    onPrev: prevQuestion,
    canGoNext: currentIndex < trueFalseQuestions.length - 1,
    canGoPrev: currentIndex > 0
  });

  // Add swipe navigation
  useSwipeNavigation({
    onNext: nextQuestion,
    onPrev: prevQuestion,
    canGoNext: currentIndex < trueFalseQuestions.length - 1,
    canGoPrev: currentIndex > 0,
    minSwipeDistance: 50
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
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

      {/* Scoreboard */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6 mb-6 border border-blue-400"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-white/20 rounded-full p-3">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Score</h3>
              <p className="text-blue-100">
                {answeredQuestions.length === 0 
                  ? "Answer questions to track your progress!" 
                  : "Keep going, you're doing great!"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-blue-200">Score</p>
              <p className="text-3xl font-bold">{score}/{answeredQuestions.length || 0}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-200">Progress</p>
              <p className="text-3xl font-bold">{Math.round(progressPercentage)}%</p>
            </div>
            
            <div className="text-center hidden md:block">
              <p className="text-sm text-blue-200">Feedback</p>
              <div className={`flex items-center space-x-1 text-lg font-bold ${performanceFeedback.color}`}>
                {performanceFeedback.icon}
                <span>{performanceFeedback.message}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
          />
        </div>
        
        {/* Mobile feedback */}
        <div className={`md:hidden flex items-center justify-center space-x-1 mt-3 text-lg font-bold ${performanceFeedback.color}`}>
          {performanceFeedback.icon}
          <span>{performanceFeedback.message}</span>
        </div>
      </motion.div>

      {/* Main question card */}
      <motion.div 
        key="true-false-section"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            variants={cardVariants}
            initial={slideDirection === "right" ? "enterFromRight" : "enterFromLeft"}
            animate="center"
            exit={slideDirection === "right" ? "exitToLeft" : "exitToRight"}
            transition={{ 
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 min-h-[450px] flex flex-col"
          >
            <div className="mb-8">
              <span className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm">
                Question {currentIndex + 1} of {trueFalseQuestions.length}
              </span>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-4 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
              {/* True Button */}
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                className={`p-8 rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden ${
                  selectedAnswer === true
                    ? selectedAnswer === currentQuestion.isTrue
                      ? "bg-green-50 dark:bg-green-900/30 border-green-500 shadow-lg"
                      : "bg-red-50 dark:bg-red-900/30 border-red-500 shadow-lg"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-md"
                }`}
                onClick={() => handleAnswerSelect(true)}
              >
                {selectedAnswer === true && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    className={`absolute inset-0 ${
                      selectedAnswer === currentQuestion.isTrue
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
                
                <div className="flex items-center justify-center relative z-10">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15,
                      delay: 0.1
                    }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800 dark:text-white">TRUE</h4>
                  </motion.div>
                  
                  {selectedAnswer === true && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute top-2 right-2"
                    >
                      {selectedAnswer === currentQuestion.isTrue ? (
                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* False Button */}
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                className={`p-8 rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden ${
                  selectedAnswer === false
                    ? selectedAnswer === currentQuestion.isTrue
                      ? "bg-green-50 dark:bg-green-900/30 border-green-500 shadow-lg"
                      : "bg-red-50 dark:bg-red-900/30 border-red-500 shadow-lg"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-md"
                }`}
                onClick={() => handleAnswerSelect(false)}
              >
                {selectedAnswer === false && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    className={`absolute inset-0 ${
                      selectedAnswer === currentQuestion.isTrue
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
                
                <div className="flex items-center justify-center relative z-10">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15,
                      delay: 0.3
                    }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                      <XCircle className="h-12 w-12 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800 dark:text-white">FALSE</h4>
                  </motion.div>
                  
                  {selectedAnswer === false && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute top-2 right-2"
                    >
                      {selectedAnswer === currentQuestion.isTrue ? (
                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className={`mt-8 p-6 rounded-xl border-2 shadow-md ${
                  selectedAnswer === currentQuestion.isTrue
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700"
                    : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700"
                }`}
              >
                <div className="flex items-start space-x-4">
                  {selectedAnswer === currentQuestion.isTrue ? (
                    <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full mt-1">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full mt-1">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  
                  <div>
                    <h4 className={`font-bold text-lg mb-2 ${
                      selectedAnswer === currentQuestion.isTrue
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}>
                      {selectedAnswer === currentQuestion.isTrue
                        ? "Correct! Great job!"
                        : "Incorrect! Keep trying!"
                      }
                    </h4>
                    <p className="text-gray-700 dark:text-gray-200">
                      The statement is <span className="font-bold">{currentQuestion.isTrue ? "TRUE" : "FALSE"}</span>.
                    </p>
                    {currentQuestion.explanation && (
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {currentQuestion.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8 px-4">
          <Button 
            className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md ${
              currentIndex > 0 
                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={prevQuestion}
            disabled={currentIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <div className="flex space-x-2">
            {trueFalseQuestions.map((_, index) => {
              const isAnswered = answeredQuestions.includes(index);
              const isCorrect = questionAnswers[index];
              
              return (
                <motion.div 
                  key={index} 
                  whileHover={{ scale: 1.2 }}
                  className={`h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? "w-10 bg-blue-500" 
                      : isAnswered
                        ? isCorrect
                          ? "w-3 bg-green-500" 
                          : "w-3 bg-red-500"
                        : "w-3 bg-gray-300 dark:bg-gray-600"
                  }`}
                ></motion.div>
              );
            })}
          </div>
          
          <Button 
            className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md ${
              currentIndex < trueFalseQuestions.length - 1 
                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={nextQuestion}
            disabled={currentIndex === trueFalseQuestions.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};