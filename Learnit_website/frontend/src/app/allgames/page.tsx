'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, BookOpen, Brain, Grid2X2, Upload, FileText, TestTube, RefreshCw, ArrowLeft, ChevronRight, Beaker } from 'lucide-react';
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
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showLabSimulation, setShowLabSimulation] = useState(true);
  
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
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (checkFileType(selectedFile)) {
        setFile(selectedFile);
        setFileError(null);
        toast.success(`File "${selectedFile.name}" selected successfully!`);
      } else {
        setFileError("Unsupported file type. Please use PDF, PPT, Word, Excel, or Text files.");
        toast.error("Unsupported file type");
      }
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (checkFileType(selectedFile)) {
        setFile(selectedFile);
        setFileError(null);
        toast.success(`File "${selectedFile.name}" selected successfully!`);
      } else {
        setFileError("Unsupported file type. Please use PDF, PPT, Word, Excel, or Text files.");
        toast.error("Unsupported file type");
      }
    }
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (customText.trim().length > 0) {
      toast.success("Text content received! Processing...");
      // Process the text content
    } else {
      setFileError("Please enter some text content before submitting.");
      toast.error("Empty content");
    }
  };

  // Check if file type is supported
  const checkFileType = (file: File) => {
    const fileName = file.name.toLowerCase();
    return SUPPORTED_FILE_TYPES.some(ext => fileName.endsWith(ext));
  };

  // Reset to upload
  const handleResetToUpload = () => {
    setShowUploadSection(true);
    setShowLabSimulation(false);
    setActiveGame(null);
    setProcessedData(null);
    setFile(null);
    setCustomText('');
    setFileError(null);
  };

  // Handle game selection
  const handleGameSelect = (gameType: string) => {
    if (gameType === 'labsim') {
      setActiveGame('labsim');
      setShowLabSimulation(true);
      setShowUploadSection(false);
    } else {
      toast.info(`Starting ${gameType} game mode`);
      setActiveGame(gameType);
    }
  };

  // Handle Try it Now button click
  const handleTryItNowClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Render lab simulation section
  const renderLabSimulation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Beaker className="h-6 w-6 mr-2 text-green-500" />
          Chemistry Lab Simulation
        </h2>
        <Button 
          variant="outline" 
          onClick={handleResetToUpload}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          Experience an interactive chemistry lab simulation where you can conduct experiments in a virtual environment.
        </p>
      </div>
      
      <div className="relative pt-4 pb-8 overflow-hidden rounded-lg">
        <iframe 
          frameBorder="0" 
          src="https://itch.io/embed-upload/13358418?color=333333" 
          allowFullScreen 
          className="mx-auto w-full rounded-lg shadow-lg"
          style={{ height: "740px" }}
        >
          <a href="https://chirags.itch.io/lab-sim">Play Lab Sim on itch.io</a>
        </iframe>
      </div>
      
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">How to use the lab simulation:</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
          <li>Navigate the lab environment using your mouse and keyboard</li>
          <li>Interact with lab equipment by clicking on them</li>
          <li>Follow the on-screen instructions to complete experiments</li>
          <li>Watch chemical reactions in real-time</li>
          <li>Learn about chemical properties and reactions through hands-on experience</li>
        </ul>
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10"
    >
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
    // Updated game data
    const gameData = [
      {
        id: 'labsim',
        title: 'Chemistry Lab Simulation',
        description: 'Interactive 3D chemistry lab with real experiments',
        icon: <TestTube className="h-8 w-8 text-green-500" />,
        featured: true
      },
      {
        id: 'flashcards',
        title: 'Flashcards',
        description: 'Test your knowledge with AI-generated flashcards',
        icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      },
      {
        id: 'Cricket',
        title: 'Cricket',
        description: 'Answer Questions to score better!',
        icon: <Brain className="h-8 w-8 text-indigo-500" />,
      },
      {
        id: 'Sail the Ship',
        title: 'Sail the Ship',
        description: 'Dont Let The Ship Sink!',
        icon: <BookOpen className="h-8 w-8 text-orange-500" />,
      },
      {
        id: 'Poki Battle',
        title: 'Poki Battle',
        description: 'Answer Questions to Fight Poki Monkeys',
        icon: <Grid2X2 className="h-8 w-8 text-purple-500" />,
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
              className={`h-full cursor-pointer hover:shadow-lg transition-all relative overflow-hidden ${
                game.featured ? 'border-2 border-green-500' : ''
              }`}
              onClick={() => handleGameSelect(game.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  {game.icon}
                  
                  {game.featured && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs font-bold rounded-full">
                      Featured
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
                  className={`w-full ${
                    game.id === 'labsim' 
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {game.id === 'labsim' ? 'Play Now' : 'Start Game'}
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-700 sm:text-5xl sm:tracking-tight">
            <span className="block">Interactive Learning Games</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl">
            Experience chemistry through interactive simulations and games
          </p>
        </motion.div>
        
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
              {/* Lab Simulation Display */}
              {showLabSimulation && renderLabSimulation()}
              
              {/* Upload section */}
              {showUploadSection && renderUploadSection()}
              
              {/* Games section */}
              <div className="mb-12">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"
                >
                  <Grid2X2 className="h-6 w-6 mr-2 text-blue-500" />
                  Available Learning Games
                </motion.h2>
                {renderGameCards()}
              </div>
              
              {/* Feature info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800 mb-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Beaker className="h-5 w-5 text-green-500" />
                      Interactive Chemistry Learning
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Experience chemistry concepts through hands-on virtual experiments and games.
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleGameSelect('labsim')}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    Try Lab Simulation
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