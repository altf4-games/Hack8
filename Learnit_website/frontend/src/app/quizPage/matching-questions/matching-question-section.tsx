import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { MatchingQuestion } from './matching-question-type';
import { Progress } from "@/components/ui/progress";
import { Award, Check, X, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, resetConsecutiveCorrectCounter } from '@/utils/soundEffects';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useShortcuts } from '../../../contexts/ShortcutsContext';

interface MatchingSectionProps {
  matchingQuestions: MatchingQuestion[];
  onGenerateMore?: (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', count: number) => Promise<void>;
  isGenerating?: boolean;
}

export const MatchingSection: React.FC<MatchingSectionProps> = ({ matchingQuestions }) => {
  const [currentMatchingIndex, setCurrentMatchingIndex] = useState<number>(0);
  const [selectedMatches, setSelectedMatches] = useState<number[]>([]);
  const [activeLeftItem, setActiveLeftItem] = useState<number | null>(null);
  const [matchingCompleted, setMatchingCompleted] = useState<boolean>(false);
  const [matchingResults, setMatchingResults] = useState<boolean[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [questionsCompleted, setQuestionsCompleted] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'error'>('success');

  // Get the shortcut context
  const { shouldShowShortcuts } = useShortcuts();

  useEffect(() => {
    // Calculate overall progress
    const totalQuestions = matchingQuestions.length;
    const progress = (questionsCompleted / totalQuestions) * 100;
    setOverallScore(Math.round(progress));
  }, [questionsCompleted, matchingQuestions.length]);

  const handleLeftItemClick = (index: number) => {
    if (matchingCompleted) return;
    setActiveLeftItem(index);
  };

  const handleRightItemClick = (index: number) => {
    if (activeLeftItem === null || matchingCompleted) return;
    
    const newSelectedMatches = [...selectedMatches];
    newSelectedMatches[activeLeftItem] = index;
    setSelectedMatches(newSelectedMatches);
    
    if (newSelectedMatches.filter(match => match !== undefined).length === matchingQuestions[currentMatchingIndex].leftItems.length) {
      const results = newSelectedMatches.map((match, idx) => 
        match === matchingQuestions[currentMatchingIndex].correctMatches[idx]
      );
      setMatchingResults(results);
      setMatchingCompleted(true);
      setQuestionsCompleted(prev => prev + 1);
      
      // Calculate score for this question
      const correctCount = results.filter(Boolean).length;
      const totalItems = results.length;
      const percentCorrect = (correctCount / totalItems) * 100;
      
      // Set feedback message and type based on performance
      if (percentCorrect === 100) {
        setFeedbackMessage('Perfect! You matched everything correctly!');
        setFeedbackType('success');
        playCorrectSound();
      } else if (percentCorrect >= 70) {
        setFeedbackMessage('Great job! You got most matches right.');
        setFeedbackType('success');
        playCorrectSound();
      } else if (percentCorrect >= 50) {
        setFeedbackMessage('Good effort! Keep practicing to improve.');
        setFeedbackType('warning');
        playIncorrectSound();
      } else {
        setFeedbackMessage("Don't worry, learning takes time. Try again!");
        setFeedbackType('error');
        playIncorrectSound();
      }
      
      setShowFeedback(true);
    }
    
    setActiveLeftItem(null);
  };

  const resetMatching = () => {
    setSelectedMatches([]);
    setActiveLeftItem(null);
    setMatchingCompleted(false);
    setMatchingResults([]);
    setShowFeedback(false);
  };

  const nextMatching = () => {
    if (currentMatchingIndex < matchingQuestions.length - 1) {
      resetMatching();
      // Don't reset streak when navigating
      setCurrentMatchingIndex(currentMatchingIndex + 1);
    }
  };

  const prevMatching = () => {
    if (currentMatchingIndex > 0) {
      resetMatching();
      // Don't reset streak when navigating
      setCurrentMatchingIndex(currentMatchingIndex - 1);
    }
  };

  // Calculate percentage of questions completed
  const progressPercentage = ((currentMatchingIndex + 1) / matchingQuestions.length) * 100;

  // Calculate correct answers for current question
  const correctAnswers = matchingResults.filter(Boolean).length;
  const totalAnswers = matchingResults.length;
  const currentQuestionScore = matchingCompleted && totalAnswers > 0 
    ? Math.round((correctAnswers / totalAnswers) * 100) 
    : 0;

  // Add keyboard navigation
  useKeyboardNavigation({
    onNext: nextMatching,
    onPrev: prevMatching,
    canGoNext: currentMatchingIndex < matchingQuestions.length - 1 && matchingCompleted,
    canGoPrev: currentMatchingIndex > 0
  });

  // Add swipe navigation
  useSwipeNavigation({
    onNext: nextMatching,
    onPrev: prevMatching,
    canGoNext: currentMatchingIndex < matchingQuestions.length - 1 && matchingCompleted,
    canGoPrev: currentMatchingIndex > 0,
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

      {/* Scoreboard and Progress Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl shadow-lg p-4 md:p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <p className="text-teal-100 text-sm md:text-base">
              Complete the set to continue
            </p>
          </div>
          
          <div className="flex items-center bg-white/20 rounded-xl px-4 py-2">
            <Award className="w-5 h-5 mr-2 text-yellow-300" />
            <span className="font-bold">{matchingCompleted ? correctAnswers : 0}/{totalAnswers || matchingQuestions[currentMatchingIndex]?.leftItems.length}</span>
            <span className="mx-2 text-indigo-200">•</span>
            <span className="font-bold">{currentQuestionScore}%</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-indigo-100 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-white/30" />
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentMatchingIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {matchingQuestions[currentMatchingIndex]?.question}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Match each item on the left with its corresponding item on the right.
              </p>
            </div>
            
            {/* Matching Items */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
              {/* Left Items */}
              <div className="w-full md:w-1/2 space-y-3">
                {matchingQuestions[currentMatchingIndex]?.leftItems.map((item, index) => {
                  const matchedRightIndex = selectedMatches[index];
                  return (
                    <motion.div
                      key={`left-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer relative ${
                        activeLeftItem === index
                          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-md"
                          : matchedRightIndex !== undefined
                          ? matchingCompleted
                            ? matchingResults[index]
                              ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                              : "bg-red-50 dark:bg-red-900/30 border-red-500"
                            : "bg-purple-50 dark:bg-purple-900/30 border-purple-500"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                      onClick={() => handleLeftItemClick(index)}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-800 dark:text-white">{item}</span>
                        
                        {matchedRightIndex !== undefined && !matchingCompleted && (
                          <span 
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full shadow-md border border-white"
                            style={{ 
                              backgroundColor: `hsl(${(matchedRightIndex * 36) % 360}, 80%, 60%)` 
                            }}
                          />
                        )}
                        
                        {matchingCompleted && (
                          <span className="ml-auto">
                            {matchingResults[index] ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                              >
                                <Check className="w-6 h-6 text-green-500" />
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                              >
                                <X className="w-6 h-6 text-red-500" />
                              </motion.div>
                            )}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Right Items */}
              <div className="w-full md:w-1/2 space-y-3 mt-3 md:mt-0">
                {matchingQuestions[currentMatchingIndex]?.rightItems.map((item, index) => {
                  const isMatched = selectedMatches.includes(index);
                  const matchedLeftIndex = selectedMatches.findIndex(match => match === index);
                  return (
                    <motion.div
                      key={`right-${index}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer relative ${
                        isMatched
                          ? matchingCompleted
                            ? matchingResults[matchedLeftIndex]
                              ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                              : "bg-red-50 dark:bg-red-900/30 border-red-500"
                            : "bg-purple-50 dark:bg-purple-900/30 border-purple-500"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                      }`}
                      onClick={() => handleRightItemClick(index)}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white text-sm font-medium mr-3">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-gray-800 dark:text-white">{item}</span>
                        
                        {isMatched && !matchingCompleted && (
                          <span 
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full shadow-md border border-white"
                            style={{ 
                              backgroundColor: `hsl(${(index * 36) % 360}, 80%, 60%)` 
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Feedback Section */}
            {matchingCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`mt-8 p-4 rounded-lg border ${
                  feedbackType === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : feedbackType === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 ${
                    feedbackType === 'success' 
                      ? 'bg-green-100 dark:bg-green-800' 
                      : feedbackType === 'warning'
                      ? 'bg-yellow-100 dark:bg-yellow-800'
                      : 'bg-red-100 dark:bg-red-800'
                  }`}>
                    {feedbackType === 'success' ? (
                      <Award className={`w-6 h-6 text-green-600 dark:text-green-300`} />
                    ) : feedbackType === 'warning' ? (
                      <Award className={`w-6 h-6 text-yellow-600 dark:text-yellow-300`} />
                    ) : (
                      <Award className={`w-6 h-6 text-red-600 dark:text-red-300`} />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      feedbackType === 'success' 
                        ? 'text-green-800 dark:text-green-300' 
                        : feedbackType === 'warning'
                        ? 'text-yellow-800 dark:text-yellow-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      {feedbackMessage}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      You got {correctAnswers} out of {totalAnswers} matches correct.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={resetMatching}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  
                  {currentMatchingIndex < matchingQuestions.length - 1 && (
                    <Button
                      className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                      onClick={nextMatching}
                    >
                      Next Question
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6 mb-8">
        <Button 
          variant="outline"
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            currentMatchingIndex > 0 
              ? "border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20" 
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={prevMatching}
          disabled={currentMatchingIndex === 0}
        >
          <ArrowLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </Button>
        
        <div className="flex space-x-1">
          {matchingQuestions.map((_, index) => (
            <div 
              key={index} 
              className={`h-3 rounded-full transition-all ${
                index === currentMatchingIndex 
                  ? "w-10 bg-gradient-to-r from-indigo-500 to-purple-500" 
                  : index < currentMatchingIndex
                  ? "w-3 bg-indigo-300 dark:bg-indigo-700"
                  : "w-3 bg-gray-300 dark:bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
        
        <Button 
          variant="outline"
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            currentMatchingIndex < matchingQuestions.length - 1 
              ? "border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20" 
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={nextMatching}
          disabled={currentMatchingIndex === matchingQuestions.length - 1 || !matchingCompleted}
        >
          <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </Button>
      </div>
    </div>
  );
};