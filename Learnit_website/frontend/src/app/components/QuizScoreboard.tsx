import React from 'react';
import { Button } from "@/components/ui/button";
import { ButtonStreakIndicator } from './ButtonStreakIndicator';

interface QuizScoreboardProps {
  title: string;
  onGenerateMore: (quantity: number) => void;
  isGenerating: boolean;
  quantity?: number;
}

/**
 * A consistent scoreboard component for use across all question types
 * Displays a title, streak indicator, and generate more button
 * This is the only place where the question type name should appear
 */
export const QuizScoreboard: React.FC<QuizScoreboardProps> = ({ 
  title, 
  onGenerateMore, 
  isGenerating,
  quantity = 5
}) => {
  return (
    <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
      <div className="flex items-center space-x-1 sm:space-x-3">
        <ButtonStreakIndicator />
        <Button 
          onClick={() => onGenerateMore(quantity)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm transition-all duration-300"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span>Generating...</span>
          ) : (
            <>
              <span className="hidden sm:inline">Generate {quantity} More</span>
              <span className="sm:hidden">Add {quantity}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}; 