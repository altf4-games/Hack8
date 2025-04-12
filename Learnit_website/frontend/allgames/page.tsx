'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, BookOpen, Brain, Grid2X2, Upload, FileText, RefreshCw, ArrowLeft, Crown, Lock, ChevronRight } from 'lucide-react';
// Import the Flashcards component
import Flashcards, { Flashcard } from './games/flashcard/FlashCards';
import { FlashcardGenerator } from './games/flashcard/flashcard-utils';

// Define types for the processed data
interface GameItem {
  count: number;
  sample: string;
}

interface ProcessedData {
  fileName: string;
  fileSize: number;
  games: {
    flashcards: GameItem;
  };
  flashcards?: Flashcard[];
}

interface GeminiResponse {
  flashcards: Flashcard[];
}

// Supported file types for document upload
const SUPPORTED_FILE_TYPES = [
  '.pdf', '.ppt', '.pptx',
  '.doc', '.docx',
  '.txt', '.rtf',
  '.xls', '.xlsx', '.csv'
];

const AIGamesPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [inputMode, setInputMode] = useState('file');
  const [customText, setCustomText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showUploadSection, setShowUploadSection] = useState(true);
  
  // Function to handle subscription redirection
  const handleSubscribeClick = () => {
    router.push('/subscriptions');
  };
  
  // Check auth state on component mount
  useEffect(() => {
    // Simulating auth check - replace with your actual auth logic
    const checkAuth = setTimeout(() => {
      setIsAuthLoading(false);
      // For demo purposes, assume user is logged in
      setIsLoggedIn(true);
    }, 1000);
    
    return () => clearTimeout(checkAuth);
  }, []);

  // Update upload section visibility when data is processed
  useEffect(() => {
    if (processedData) {
      // Hide upload section when data is processed
      setShowUploadSection(false);
    }
  }, [processedData]);

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave event
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Show pro subscription message instead of processing
    toast.info("This feature requires a Pro subscription");
    setFileError(null);
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Show pro subscription message instead of processing
    toast.info("This feature requires a Pro subscription");
    setFileError(null);
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    // Show pro subscription message instead of processing
    toast.info("This feature requires a Pro subscription");
    setFileError(null);
  };

  // Check if file type is supported
  const checkFileType = (file: File) => {
    const fileName = file.name.toLowerCase();
    return SUPPORTED_FILE_TYPES.some(ext => fileName.endsWith(ext));
  };

  // Reset to upload - redirects to subscription page in this version
  const handleResetToUpload = () => {
    toast.info("This feature requires a Pro subscription");
  };

  // Handle game selection - redirects to subscription page in this version
  const handleGameSelect = (gameType: string) => {
    toast.info("This feature requires a Pro subscription");
  };

  // Handle Try it Now button click
  const handleTryItNowClick = () => {
    toast.info("This feature requires a Pro subscription");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Render top banner for Pro Subscription
  const renderProBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl mb-8 shadow-lg"
    >
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Crown className="h-6 w-6 mr-2 text-yellow-300" />
          <div>
            <h3 className="font-bold text-lg">Coming Soon: Pro Feature</h3>
            <p>AI Games will be available exclusively for Pro subscribers</p>
          </div>
        </div>
        <Button 
          onClick={handleSubscribeClick}
          className="bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-1"
        >
          Upgrade to Pro <ChevronRight size={16} />
        </Button>
      </div>
    </motion.div>
  );

  // Render upload/processing section
  const renderUploadSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10 relative"
    >
      {/* Overlay for Pro feature */}
      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <p className="text-gray-800 dark:text-white font-bold mb-2">Pro Feature</p>
          <Button onClick={handleSubscribeClick} className="bg-blue-600">
            Upgrade to Pro
          </Button>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Upload Your Learning Material
      </h2>
      
      <Tabs 
        defaultValue="file" 
        onValueChange={(value) => setInputMode(value)}
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload size={16} />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText size={16} />
            Enter Text
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="file">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`border-4 border-dashed rounded-xl p-8 text-center transition-all h-64 flex flex-col items-center justify-center ${
              isDragging 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-300 dark:border-gray-700"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-blue-500 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Drag & Drop Your Document
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Supported formats: PDF, PPT, Word, Excel, Text
            </p>
            {fileError && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mb-2"
              >
                {fileError}
              </motion.p>
            )}
            <Button 
              onClick={handleTryItNowClick} 
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Choose File
            </Button>
            <input 
              type="file" 
              accept={SUPPORTED_FILE_TYPES.join(',')} 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileInput}
            />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="text">
          <div className="h-64 flex flex-col">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your content here..."
              className="w-full h-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            {fileError && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-2"
              >
                {fileError}
              </motion.p>
            )}
            <Button 
              onClick={handleTextSubmit} 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={!customText.trim() || isProcessing}
            >
              Process Content
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );

  // Render game cards
  const renderGameCards = () => {
    // Default game data
    const gameData = [
      {
        id: 'flashcards',
        title: 'Flashcards',
        description: 'Test your knowledge with AI-generated flashcards',
        icon: <BookOpen className="h-8 w-8 text-blue-500" />,
        comingSoon: true
      },
      {
        id: 'Cricket',
        title: 'Cricket',
        description: 'Answer Questions to score better!',
        icon: <Brain className="h-8 w-8 text-indigo-500" />,
        comingSoon: true
      },
      {
        id: 'Sail the Ship',
        title: 'Sail the Ship',
        description: 'Dont Let The Ship Sink!',
        icon: <BookOpen className="h-8 w-8 text-green-500" />,
        comingSoon: true
      },
      {
        id: 'Poki Battle',
        title: 'Poki Battle',
        description: 'Answer Questions to Fight Poki Monkeys',
        icon: <Grid2X2 className="h-8 w-8 text-purple-500" />,
        comingSoon: true
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {gameData.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Card 
              className="h-full cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
              onClick={() => handleGameSelect(game.id)}
            >
              {/* Overlay for Pro feature */}
              <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  {game.icon}
                  
                  {game.comingSoon && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs font-bold rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {processedData && game.id === 'flashcards' && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {processedData.games.flashcards.count} flashcards available
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gray-400 hover:bg-gray-500"
                  onClick={handleSubscribeClick}
                >
                  Pro Feature
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 sm:text-5xl sm:tracking-tight">
            <span className="block">AI-Powered Learning Games</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl">
            Transform any document into interactive learning experiences with the power of AI
          </p>
        </motion.div>
        
        {/* Pro Banner */}
        {renderProBanner()}
        
        {/* Main content */}
        <div>
          {isAuthLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Upload section */}
              {renderUploadSection()}
              
              {/* Games section */}
              <div className="mb-12">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                >
                  Available Games
                </motion.h2>
                {renderGameCards()}
              </div>
              
              {/* Pro subscription info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800 mb-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-500" />
                      Unlock with Pro Subscription
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Get access to AI-powered learning games and many more features.
                    </p>
                  </div>
                  <Button 
                    onClick={handleSubscribeClick}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    View Plans
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGamesPage;