'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCw, Check, X } from 'lucide-react';

// Types
interface GameData {
  id: string;
  title: string;
  source: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  lastPlayed?: string;
  completionRate?: number;
}

interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  mastered: boolean;
}

interface FlashcardsProps {
  gameData: GameData;
  onClose: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ gameData, onClose }) => {
  // Sample flashcards data - in a real app, this would come from an API
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate fetching flashcards
    const loadFlashcards = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data based on the game title
      const mockFlashcards: FlashcardItem[] = [];
      
      if (gameData.title.includes('Biology')) {
        mockFlashcards.push(
          { id: 1, front: "What is photosynthesis?", back: "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.", mastered: false },
          { id: 2, front: "What is cellular respiration?", back: "The process by which cells break down glucose and other molecules to generate ATP, releasing carbon dioxide and water.", mastered: false },
          { id: 3, front: "What is DNA?", back: "Deoxyribonucleic acid, a molecule composed of two polynucleotide chains that coil around each other to form a double helix carrying genetic instructions.", mastered: false },
          { id: 4, front: "What is natural selection?", back: "The process whereby organisms better adapted to their environment tend to survive and produce more offspring.", mastered: false },
          { id: 5, front: "What is homeostasis?", back: "The tendency toward a relatively stable equilibrium between interdependent elements, especially as maintained by physiological processes.", mastered: false }
        );
      } else if (gameData.title.includes('Programming')) {
        mockFlashcards.push(
          { id: 1, front: "What is a variable?", back: "A storage location paired with an associated symbolic name, which contains some known or unknown quantity of information referred to as a value.", mastered: false },
          { id: 2, front: "What is a function?", back: "A block of organized, reusable code that is used to perform a single, related action.", mastered: false },
          { id: 3, front: "What is an algorithm?", back: "A step-by-step procedure for solving a problem or accomplishing a task.", mastered: false },
          { id: 4, front: "What is object-oriented programming?", back: "A programming paradigm based on the concept of 'objects', which can contain data and code: data in the form of fields, and code, in the form of procedures.", mastered: false },
          { id: 5, front: "What is debugging?", back: "The process of finding and resolving bugs (defects or problems that prevent correct operation) within computer programs.", mastered: false }
        );
      } else {
        // Default flashcards if the game title doesn't match
        mockFlashcards.push(
          { id: 1, front: "Term 1", back: "Definition 1", mastered: false },
          { id: 2, front: "Term 2", back: "Definition 2", mastered: false },
          { id: 3, front: "Term 3", back: "Definition 3", mastered: false },
          { id: 4, front: "Term 4", back: "Definition 4", mastered: false },
          { id: 5, front: "Term 5", back: "Definition 5", mastered: false }
        );
      }

      setFlashcards(mockFlashcards);
      setIsLoading(false);
      updateProgress(mockFlashcards);
    };

    loadFlashcards();
  }, [gameData.title]);

  const updateProgress = (cards: FlashcardItem[]) => {
    const masteredCount = cards.filter(card => card.mastered).length;
    setProgress((masteredCount / cards.length) * 100);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkMastered = () => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex].mastered = true;
    setFlashcards(updatedFlashcards);
    updateProgress(updatedFlashcards);
    handleNext();
  };

  const handleMarkNotMastered = () => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex].mastered = false;
    setFlashcards(updatedFlashcards);
    updateProgress(updatedFlashcards);
    handleNext();
  };

  const handleReset = () => {
    const resetFlashcards = flashcards.map(card => ({
      ...card,
      mastered: false
    }));
    setFlashcards(resetFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    updateProgress(resetFlashcards);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {Math.round(progress)}% mastered
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-grow mb-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-flipped' : '-front')}
            initial={{ rotateY: isFlipped ? -90 : 0, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 0 : 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ perspective: 1000 }}
            className="h-full"
          >
            <Card 
              className="h-64 md:h-80 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={handleFlip}
            >
              <CardContent className="p-6 flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <div className="absolute top-4 right-4 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {isFlipped ? 'Answer' : 'Question'}
                  </div>
                  <p className="text-xl md:text-2xl font-medium">
                    {isFlipped ? flashcards[currentIndex].back : flashcards[currentIndex].front}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {flashcards[currentIndex].mastered ? 
                      '✓ Marked as mastered' : 
                      'Click to flip card'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
          >
            <RotateCw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleMarkNotMastered}
          >
            <X className="h-4 w-4 mr-1" /> Not mastered
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={handleMarkMastered}
          >
            <Check className="h-4 w-4 mr-1" /> Mastered
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;