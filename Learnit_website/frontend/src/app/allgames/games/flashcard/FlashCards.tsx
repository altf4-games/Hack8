'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Flashcard type definition (matches the one from HeroSection)
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

interface FlashcardsProps {
  initialFlashcards?: Flashcard[];
  documentId?: string;
  onGenerateMore?: (quantity: number) => Promise<void>;
  isProcessing?: boolean;
}

const Flashcards: React.FC<FlashcardsProps> = ({
  initialFlashcards = [],
  documentId,
  onGenerateMore,
  isProcessing = false
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update flashcards if initialFlashcards prop changes
  useEffect(() => {
    if (initialFlashcards && initialFlashcards.length > 0) {
      setFlashcards(initialFlashcards);
      setCurrentIndex(0);
      setFlipped(false);
    }
  }, [initialFlashcards]);

  // If no documentId is provided, try to fetch flashcards from API
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!documentId || flashcards.length > 0) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/flashcards/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.flashcards && data.flashcards.length > 0) {
            setFlashcards(data.flashcards);
          }
        }
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        toast.error("Failed to load flashcards. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [documentId, flashcards.length]);

  // Handle card flip
  const handleFlip = () => {
    setFlipped(!flipped);
  };

  // Navigate to the next card
  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 200);
  };

  // Navigate to the previous card
  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }, 200);
  };

  // Shuffle the flashcards
  const shuffleCards = () => {
    setFlipped(false);
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    toast.success("Flashcards shuffled!");
  };

  // Reset to the beginning
  const resetCards = () => {
    setFlipped(false);
    setCurrentIndex(0);
    toast.info("Starting from the first card");
  };

  // Handle generating more flashcards
  const handleGenerateMore = async () => {
    if (!onGenerateMore) {
      toast.error("Cannot generate more flashcards - function not provided");
      return;
    }

    try {
      setGeneratingMore(true);
      await onGenerateMore(5); // Request 5 more flashcards
      toast.success("Added 5 new flashcards!");
    } catch (error) {
      console.error("Failed to generate more flashcards:", error);
      toast.error("Failed to generate additional flashcards");
    } finally {
      setGeneratingMore(false);
    }
  };

  // If no cards are available yet
  if (flashcards.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white pb-6">
            <CardTitle>Flashcards</CardTitle>
            <CardDescription className="text-purple-100">
              Loading your personalized flashcards...
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex justify-center items-center min-h-64">
            {loading || isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  {isProcessing ? "Processing your document..." : "Loading flashcards..."}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No flashcards available yet. Upload a document to create personalized flashcards.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white pb-6">
          <CardTitle>Flashcards</CardTitle>
          <CardDescription className="text-purple-100">
            Card {currentIndex + 1} of {flashcards.length} • Click card to flip
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="relative mx-auto max-w-2xl" style={{ perspective: "1000px" }}>
            <motion.div
              className="w-full h-64 cursor-pointer rounded-lg shadow-md p-6 bg-white dark:bg-gray-700 flex items-center justify-center"
              onClick={handleFlip}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className={`absolute inset-0 backface-hidden p-6 flex flex-col items-center justify-center text-center ${
                  flipped ? "hidden" : ""
                }`}
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Question
                </h3>
                <p className="text-gray-600 dark:text-gray-200 text-lg">
                  {flashcards[currentIndex]?.front || "No question available"}
                </p>
              </div>

              <div
                className={`absolute inset-0 backface-hidden p-6 flex flex-col items-center justify-center text-center ${
                  !flipped ? "hidden" : ""
                }`}
                style={{ transform: "rotateY(180deg)" }}
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Answer
                </h3>
                <p className="text-gray-600 dark:text-gray-200 text-lg">
                  {flashcards[currentIndex]?.back || "No answer available"}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button
              onClick={prevCard}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              disabled={flashcards.length <= 1}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={shuffleCards}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              disabled={flashcards.length <= 1}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={resetCards}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              disabled={currentIndex === 0}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={nextCard}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              disabled={flashcards.length <= 1}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-gray-50 dark:bg-gray-800 p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (onGenerateMore) {
                handleGenerateMore();
              }
            }}
            disabled={!onGenerateMore || generatingMore}
            className="flex items-center gap-2"
          >
            {generatingMore ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              "Generate More Cards"
            )}
          </Button>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('mode', 'study');
                  window.history.pushState({}, '', url);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Study Mode
            </Button>
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('mode', 'test');
                  window.history.pushState({}, '', url);
                }
              }}
              variant="outline"
            >
              Test Mode
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Flashcards;