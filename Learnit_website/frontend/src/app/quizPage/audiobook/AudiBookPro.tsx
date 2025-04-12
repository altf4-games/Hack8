'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LockKeyhole, Crown } from "lucide-react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// Import the proper types from their respective files that your original component uses
import { Flashcard } from "../flashcards/flashcard-types";
import { MCQ } from "../MCQS/mcq-types";
import { TrueFalseQuestion } from "../trueOrFalse/true-false-type";

// Import the AudiobookSection component that was provided
import { AudiobookSection } from './AudioBook'; // Adjust the import path as needed

interface ProAudiobookWrapperProps {
  fileContent: string;
  fileName: string;
  isGenerating: boolean;
  flashcards: Flashcard[];
  mcqs: MCQ[];
  trueFalseQuestions: TrueFalseQuestion[];
  onGenerateAudio?: () => Promise<void>;
  geminiApiKey?: string;
  geminiApiEndpoint?: string;
}

const ProAudiobookWrapper: React.FC<ProAudiobookWrapperProps> = (props) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative">
      {/* Pro Feature Overlay Card */}
      {!showPreview && (
        <Card className="w-full border-2 border-yellow-400 dark:border-yellow-600">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Audiobook Feature</CardTitle>
            <CardDescription className="text-base">
              Coming Soon - Available exclusively for Pro users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 py-2 px-3 rounded-md">
              <LockKeyhole className="h-4 w-4" />
              <span>Pro Feature</span>
            </div>
            
            <div className="space-y-3">
              <p>Transform your document into an interactive audiobook with:</p>
              <ul className="space-y-2 text-left mx-auto max-w-xs">
                <li className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>Full audio narration of your content</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>Audio versions of all flashcards and quiz questions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>Playback speed control and section navigation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>Downloadable audio files for offline learning</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Link href="/subscriptions" className="w-full">
              <Button className="w-full">Upgrade to Pro</Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={() => setShowPreview(true)}
              className="text-sm"
            >
              Preview Feature
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Preview Mode Banner */}
      {showPreview && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-yellow-800 dark:text-yellow-200">
              <span className="font-medium">Preview Mode:</span> Upgrade to Pro to unlock full functionality
            </span>
          </div>
          <Link href="/subscriptions">
            <Button size="sm" variant="outline" className="border-yellow-300 dark:border-yellow-700">
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      {/* Conditionally rendered preview of AudiobookSection */}
      {showPreview && (
        <div className="pointer-events-none opacity-70 filter saturate-50">
          <AudiobookSection {...props} />
        </div>
      )}
    </div>
  );
};

export default ProAudiobookWrapper;