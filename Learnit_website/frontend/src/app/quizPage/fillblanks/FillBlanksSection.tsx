'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FillInBlanksQuestion } from './fill-blanks-type';
import { FillInBlanksGenerator } from './FillBlanks-utils';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Trophy, BookOpen } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, resetConsecutiveCorrectCounter } from '@/utils/soundEffects';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useShortcuts } from '../../../contexts/ShortcutsContext';

interface FillInBlanksSectionProps {
  fillInBlanksQuestions: FillInBlanksQuestion[];
  onGenerateMore?: (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', count: number) => Promise<void>;
  isGenerating?: boolean;
}

export const FillInBlanksSection: React.FC<FillInBlanksSectionProps> = ({ fillInBlanksQuestions }) => {
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string[] }>({});
  const [feedback, setFeedback] = useState<{ [questionId: string]: boolean[] }>({});
  const [showExplanations, setShowExplanations] = useState<{ [questionId: string]: boolean }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  
  const totalQuestions = fillInBlanksQuestions.length;
  const currentQuestion = fillInBlanksQuestions[currentQuestionIndex];
  
  // Calculate progress
  const progressPercentage = (totalAttempted / totalQuestions) * 100;
  
  // Generate feedback based on score
  useEffect(() => {
    if (totalAttempted === 0) return;
    
    const scorePercentage = (score / totalAttempted) * 100;
    
    if (scorePercentage >= 90) {
      setFeedbackMessage("Excellent! You're mastering this!");
    } else if (scorePercentage >= 70) {
      setFeedbackMessage("Great job! Keep it up!");
    } else if (scorePercentage >= 50) {
      setFeedbackMessage("Good progress. Let's keep practicing!");
    } else {
      setFeedbackMessage("Keep going! You'll improve with practice.");
    }
  }, [score, totalAttempted]);

  // Get the shortcut context
  const { shouldShowShortcuts } = useShortcuts();
  
  // Add keyboard navigation
  useKeyboardNavigation({
    onNext: () => moveToQuestion(currentQuestionIndex + 1),
    onPrev: () => moveToQuestion(currentQuestionIndex - 1),
    canGoNext: currentQuestionIndex < totalQuestions - 1,
    canGoPrev: currentQuestionIndex > 0
  });

  // Add swipe navigation
  useSwipeNavigation({
    onNext: () => moveToQuestion(currentQuestionIndex + 1),
    onPrev: () => moveToQuestion(currentQuestionIndex - 1),
    canGoNext: currentQuestionIndex < totalQuestions - 1,
    canGoPrev: currentQuestionIndex > 0,
    minSwipeDistance: 50
  });

  const handleAnswerChange = (questionId: string, blankIndex: number, value: string) => {
    setUserAnswers(prev => {
      const questionAnswers = prev[questionId] || Array(
        fillInBlanksQuestions.find(q => q.id === questionId)?.correctAnswers.length || 0
      ).fill('');
      
      const newAnswers = [...questionAnswers];
      newAnswers[blankIndex] = value;
      
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
    
    // Only clear feedback if the question was previously checked
    if (checkedQuestions.has(questionId)) {
      setFeedback(prev => ({
        ...prev,
        [questionId]: []
      }));
    }
  };

  const checkAnswer = (questionId: string) => {
    const question = fillInBlanksQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const answers = userAnswers[questionId] || [];
    
    // Check if all blanks are filled
    const allBlanksFilled = answers.length === question.correctAnswers.length && 
                           answers.every(answer => answer.trim() !== '');
    
    if (!allBlanksFilled) {
      // If not all blanks are filled, don't proceed with checking
      setFeedback(prev => ({
        ...prev,
        [questionId]: [] // Clear any existing feedback
      }));
      return;
    }

    // Mark this question as checked
    setCheckedQuestions(prev => new Set(prev).add(questionId));
    
    // Check the answers if all blanks are filled
    const results = FillInBlanksGenerator.checkAnswers(question, answers);
    
    setFeedback(prev => ({
      ...prev,
      [questionId]: results
    }));

    // Only update score if this is the first time checking or if answers changed
    if (!checkedQuestions.has(questionId)) {
      const correctAnswers = results.filter(result => result === true).length;
      const totalBlanks = results.length;
      
      setScore(prev => prev + correctAnswers);
      setTotalAttempted(prev => prev + totalBlanks);
      
      // Play sound based on overall correctness
      if (correctAnswers === totalBlanks) {
        playCorrectSound();
      } else if (correctAnswers > 0) {
        // Partially correct - still play positive sound
        playCorrectSound();
      } else {
        playIncorrectSound();
      }
    }

    // Show explanation automatically when checking answer
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const toggleExplanation = (questionId: string) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  const moveToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
      // Don't reset streak when navigating
    }
  };

  const renderTextWithInputs = (question: FillInBlanksQuestion) => {
    const parts = question.textWithBlanks.split(/(\[BLANK_\d+\])/g);
    
    return parts.map((part, index) => {
      const blankMatch = part.match(/\[BLANK_(\d+)\]/);
      
      if (blankMatch) {
        const blankIndex = parseInt(blankMatch[1], 10);
        const questionAnswers = userAnswers[question.id] || [];
        const currentAnswer = questionAnswers[blankIndex] || '';
        const feedbackForBlank = feedback[question.id]?.[blankIndex];
        
        let inputClassName = "px-2 py-1 mx-1 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 w-36 inline-flex transition-all duration-200";
        
        // Add conditional styling based on feedback
        if (feedbackForBlank === true) {
          inputClassName += " bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 focus:ring-green-500";
        } else if (feedbackForBlank === false) {
          inputClassName += " bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 focus:ring-red-500";
        } else {
          inputClassName += " border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500";
        }
        
        return (
          <Input
            key={`q${question.id}-blank-${blankIndex}`}
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, blankIndex, e.target.value)}
            className={inputClassName}
            placeholder={`Answer ${blankIndex + 1}`}
            aria-label={`Blank ${blankIndex + 1}`}
          />
        );
      }
      
      return <span key={`q${question.id}-text-${index}`}>{part}</span>;
    });
  };

  // Function to determine if a question has all blanks filled
  const areAllBlanksFilled = (questionId: string) => {
    const question = fillInBlanksQuestions.find(q => q.id === questionId);
    if (!question) return false;
    
    const answers = userAnswers[questionId] || [];
    return answers.length === question.correctAnswers.length && 
           answers.every(answer => answer.trim() !== '');
  };

  if (fillInBlanksQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">No fill-in-the-blanks questions available.</p>
      </div>
    );
  }

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

      <div className="space-y-6">
        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <h2 className="text-xl font-bold">Your Progress</h2>
            </div>
            <div className="text-lg font-semibold">
              Score: {score}/{totalAttempted}
              <span className="text-sm ml-2">
                ({totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%)
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-4 bg-blue-200/30 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>{totalAttempted === 0 ? "Start answering!" : `Attempted: ${totalAttempted} blanks`}</span>
            <span>Total Questions: {totalQuestions}</span>
          </div>
          
          {/* Feedback message */}
          {feedbackMessage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 font-medium text-white/90 text-center"
            >
              {feedbackMessage}
            </motion.div>
          )}
        </motion.div>
        
        {/* Question Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-2">
          {fillInBlanksQuestions.map((_, index) => (
            <Button
              key={`nav-${index}`}
              variant={currentQuestionIndex === index ? "default" : "outline"}
              size="sm"
              onClick={() => moveToQuestion(index)}
              className={`min-w-8 h-8 rounded-full ${
                currentQuestionIndex === index ? "bg-blue-600 text-white" : ""
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        
        {/* Current Question */}
        <motion.div
          key={`question-card-${currentQuestionIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {/* Question Header */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Question {currentQuestionIndex + 1}</h3>
                {currentQuestion.difficulty && (
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    ${currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                    ${currentQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                  `}>
                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Question Content */}
            <div className="p-6">
              <div className="mb-4 font-medium text-lg">{currentQuestion.question}</div>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {renderTextWithInputs(currentQuestion)}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => checkAnswer(currentQuestion.id)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Check Answer
                </Button>
                
                <Button 
                  onClick={() => toggleExplanation(currentQuestion.id)}
                  variant="outline"
                  size="lg"
                  className="border-gray-300 dark:border-gray-600"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {showExplanations[currentQuestion.id] ? 'Hide Explanation' : 'Show Explanation'}
                </Button>
              </div>
              
              {/* Input validation message */}
              {!areAllBlanksFilled(currentQuestion.id) && checkedQuestions.has(currentQuestion.id) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <AlertCircle className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
                  <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Please fill in all the blanks before checking your answer.
                  </span>
                </motion.div>
              )}
              
              {/* Result feedback - only show if all answers have been filled and checked */}
              {feedback[currentQuestion.id]?.length > 0 && areAllBlanksFilled(currentQuestion.id) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {feedback[currentQuestion.id].every(result => result === true) ? (
                    <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
                      <span className="text-green-800 dark:text-green-200 font-medium">Perfect! All answers are correct.</span>
                    </div>
                  ) : feedback[currentQuestion.id].some(result => result === true) ? (
                    <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <AlertCircle className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
                      <span className="text-yellow-800 dark:text-yellow-200 font-medium">Almost there! Some answers are correct, but not all.</span>
                    </div>
                  ) : (
                    <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <XCircle className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
                      <span className="text-red-800 dark:text-red-200 font-medium">Try again! Review your answers.</span>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Show correct answers if user has submitted an incorrect answer */}
              {feedback[currentQuestion.id]?.length > 0 && 
                feedback[currentQuestion.id].some(result => result === false) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <h4 className="text-md font-medium text-blue-700 dark:text-blue-300 mb-2">Correct Answer:</h4>
                  <p className="text-gray-700 dark:text-gray-300">{currentQuestion.completeText}</p>
                </motion.div>
              )}
              
              {/* Explanation section */}
              {showExplanations[currentQuestion.id] && currentQuestion.explanation && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Explanation:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={() => moveToQuestion(currentQuestionIndex - 1)}
                variant="outline"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={() => moveToQuestion(currentQuestionIndex + 1)}
                variant="outline"
                disabled={currentQuestionIndex === totalQuestions - 1}
              >
                Next
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};