import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Flashcard } from './flashcard-types';
import { CheckCircle, XCircle } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, resetConsecutiveCorrectCounter } from '@/utils/soundEffects';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useShortcuts } from '../../../contexts/ShortcutsContext';

interface FlashcardSectionProps {
  flashcards: Flashcard[];
  onGenerateMore?: (type: 'flashcards' | 'mcqs' | 'matching' | 'trueFalse' | 'fillInBlanks', count: number) => Promise<void>;
  isGenerating?: boolean;
}

export const FlashcardSection: React.FC<FlashcardSectionProps> = ({ flashcards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempted, setAttempted] = useState<number[]>([]);
  const [correct, setCorrect] = useState<number[]>([]);

  // Get the shortcut context
  const { shouldShowShortcuts } = useShortcuts();

  // Card variants for slide animation
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
      rotateY: isFlipped ? 180 : 0,
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

  // Reset feedback when changing cards
  useEffect(() => {
    setFeedback(null);
  }, [currentCardIndex]);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setSlideDirection("right");
      setCurrentCardIndex(currentCardIndex + 1);
      // Don't reset streak when navigating
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setSlideDirection("left");
      setCurrentCardIndex(currentCardIndex - 1);
      // Don't reset streak when navigating
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (attempted.includes(currentCardIndex)) return;

    setAttempted([...attempted, currentCardIndex]);
    
    if (isCorrect) {
      setScore(score + 1);
      setCorrect([...correct, currentCardIndex]);
      setFeedback("Well done! That's correct!");
      playCorrectSound();
    } else {
      setFeedback("Better try again. Keep practicing!");
      playIncorrectSound();
    }
    
    // Auto-flip to show answer if not already flipped
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  // Generate a color based on percentage correct
  const getScoreColor = () => {
    const percentage = attempted.length > 0 ? (score / attempted.length) * 100 : 0;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Add keyboard navigation
  useKeyboardNavigation({
    onNext: nextCard,
    onPrev: prevCard,
    canGoNext: currentCardIndex < flashcards.length - 1,
    canGoPrev: currentCardIndex > 0
  });

  // Add swipe navigation
  useSwipeNavigation({
    onNext: nextCard,
    onPrev: prevCard,
    canGoNext: currentCardIndex < flashcards.length - 1,
    canGoPrev: currentCardIndex > 0,
    minSwipeDistance: 50
  });

  return (
    <motion.div 
      key="flashcards"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center"
    >
      {/* Add keyboard shortcut hint - only show on desktop and if shortcuts haven't been used */}
      {shouldShowShortcuts && (
        <div className="hidden md:block text-center mb-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Shift+A</kbd> for previous, <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Shift+D</kbd> for next</p>
        </div>
      )}

      {/* Add swipe hint for mobile */}
      <div className="md:hidden text-center mb-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Swipe left/right to navigate between cards</p>
      </div>

      <div className="w-full max-w-md mx-auto mb-6">
        <div className="relative perspective" style={{ perspective: '1000px', height: '24rem' }}>
          <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
            <motion.div 
              key={currentCardIndex}
              custom={slideDirection}
              variants={cardVariants}
              initial={slideDirection === "right" ? "enterFromRight" : "enterFromLeft"}
              animate="center"
              exit={slideDirection === "right" ? "exitToLeft" : "exitToRight"}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.6
              }}
              className="absolute inset-0 w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of card (Question) */}
              <div 
                className={`absolute inset-0 backface-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl shadow-lg p-8 flex flex-col justify-between ${
                  isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
                onClick={flipCard}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-center">
                  <span className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                    QUESTION {currentCardIndex + 1}
                  </span>
                </div>
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-center flex-grow flex items-center justify-center"
                >
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {flashcards[currentCardIndex]?.question}
                  </h3>
                </motion.div>

                <div className="text-center">
                  <motion.div 
                    animate={{ y: [0, 5, 0] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-blue-500 dark:text-blue-400 flex items-center justify-center gap-2"
                  >
                    <span className="text-sm">Tap to flip</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
              
              {/* Back of card (Answer) */}
              <div 
                className={`absolute inset-0 backface-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-xl shadow-lg p-8 flex flex-col justify-between ${
                  !isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex justify-center">
                  <span className="inline-block bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                    ANSWER
                  </span>
                </div>
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-center flex-grow flex flex-col justify-center"
                >
                  <p className="text-xl text-gray-800 dark:text-white mb-4">
                    {flashcards[currentCardIndex]?.answer}
                  </p>

                  {/* Feedback message */}
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-4 py-2 rounded-lg mx-auto inline-block ${
                        feedback.includes("Well done") 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {feedback}
                    </motion.div>
                  )}
                </motion.div>

                {/* Bottom section with feedback buttons and flip hint */}
                <div className="flex flex-col gap-4">
                  {/* Did you get it right? Buttons */}
                  {!attempted.includes(currentCardIndex) && (
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={() => handleAnswer(true)}
                        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-4"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>I got it right</span>
                      </Button>
                      <Button
                        onClick={() => handleAnswer(false)}
                        className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-4"
                      >
                        <XCircle className="h-5 w-5" />
                        <span>I got it wrong</span>
                      </Button>
                    </div>
                  )}

                  {/* Tap to flip back hint */}
                  <div onClick={flipCard} className="text-center">
                    <motion.div 
                      animate={{ y: [0, 5, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-purple-500 dark:text-purple-400 flex items-center justify-center gap-2"
                    >
                      <span className="text-sm">Tap to flip back</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card navigation and status */}
        <div className="flex justify-between items-center mt-6 px-4">
          <Button 
            className={`h-12 w-12 rounded-full flex items-center justify-center ${
              currentCardIndex > 0 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <div className="text-center">
            <span className="text-lg font-medium text-gray-800 dark:text-white">
              {currentCardIndex + 1} / {flashcards.length}
            </span>
            <div className="flex space-x-1 mt-2 overflow-hidden">
              {flashcards.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentCardIndex 
                      ? "w-6 bg-blue-500" 
                      : correct.includes(index)
                        ? "w-3 bg-green-500"
                        : attempted.includes(index)
                          ? "w-3 bg-red-400"
                          : "w-3 bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
              ))}
            </div>
          </div>
          
          <Button 
            className={`h-12 w-12 rounded-full flex items-center justify-center ${
              currentCardIndex < flashcards.length - 1 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={nextCard}
            disabled={currentCardIndex === flashcards.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Card status indicator */}
      <div className="flex justify-center mb-4 w-full max-w-md mx-auto">
        {attempted.includes(currentCardIndex) && (
          <span className={`text-sm px-3 py-1 rounded-full ${
            correct.includes(currentCardIndex) 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          }`}>
            {correct.includes(currentCardIndex) ? "Answered Correctly" : "Needs Review"}
          </span>
        )}
      </div>
      
      {/* Scoreboard - Now positioned below the flashcard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Your Score</h3>
            <p className={`text-2xl font-bold ${getScoreColor()}`}>
              {score}/{attempted.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {Math.round((attempted.length / flashcards.length) * 100)}%
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${(attempted.length / flashcards.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-center mt-2 mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tap the card to flip and reveal the answer
        </p>
      </div>
    </motion.div>
  );
};