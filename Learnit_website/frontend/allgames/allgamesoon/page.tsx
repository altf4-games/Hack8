'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, BookOpen, Brain, Grid2X2, Upload, FileText, RefreshCw, ArrowLeft } from 'lucide-react';
// Import the Flashcards component
import Flashcards , { Flashcard } from '../games/flashcard/FlashCards';
import { FlashcardGenerator } from '../games/flashcard/flashcard-utils';

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

// Near the top of the file, add the debounce utility function and cache management:
const useDebounce = (value: any, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Interface for cache entry
interface CacheEntry {
  timestamp: number;
  data: any;
}

// Cache with properly typed object
type CacheStore = Record<string, CacheEntry>;

// Cache management utility - reuse keys from document storage
const CACHE_KEYS = {
  PROCESSED_DOCS: 'flashcards-processed-docs'
};

// Function to check if we have cached results for a file
const getProcessedDocCache = (fileName: string, fileSize: number, lastModified: number): any | null => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEYS.PROCESSED_DOCS);
    if (!cachedData) return null;
    
    const cache = JSON.parse(cachedData) as CacheStore;
    const cacheKey = `${fileName}-${fileSize}-${lastModified}`;
    
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < 24 * 60 * 60 * 1000)) {
      return cache[cacheKey].data;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking document cache:', error);
    return null;
  }
};

// Function to save processed results for a file
const saveProcessedDocCache = (fileName: string, fileSize: number, lastModified: number, data: any): void => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEYS.PROCESSED_DOCS) || '{}';
    const cache = JSON.parse(cachedData) as CacheStore;
    const cacheKey = `${fileName}-${fileSize}-${lastModified}`;
    
    // Add new cache entry
    cache[cacheKey] = {
      timestamp: Date.now(),
      data
    };
    
    // Clean up old entries if there are too many (keep most recent 10)
    const entries = Object.entries(cache);
    if (entries.length > 10) {
      const sortedEntries = entries.sort(
        (a, b) => (b[1].timestamp - a[1].timestamp)
      );
      const newCache: CacheStore = {};
      sortedEntries.slice(0, 10).forEach(([key, value]) => {
        newCache[key] = value;
      });
      localStorage.setItem(CACHE_KEYS.PROCESSED_DOCS, JSON.stringify(newCache));
    } else {
      localStorage.setItem(CACHE_KEYS.PROCESSED_DOCS, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('Error saving document cache:', error);
  }
};

// Add MCQ interface
interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
}

// Client-side utility for shuffling MCQs
const shuffleMCQOptions = (mcq: MCQ): MCQ => {
  // Create a copy of the MCQ to avoid mutating the original
  const shuffledMCQ = { ...mcq };
  
  // Create an array of indices to shuffle
  const indices = shuffledMCQ.options.map((_: string, index: number) => index);
  
  // Fisher-Yates shuffle algorithm
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // Remap options and find new correct answer index
  const newOptions = indices.map((index: number) => shuffledMCQ.options[index]);
  const newCorrectAnswerIndex = indices.indexOf(shuffledMCQ.correctAnswer);
  
  return {
    ...shuffledMCQ,
    options: newOptions,
    correctAnswer: newCorrectAnswerIndex
  };
};

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (checkFileType(droppedFile)) {
        setFile(droppedFile);
        setFileError(null);
        processDocument(droppedFile);
      } else {
        setFileError(`Unsupported file type. Please upload one of these formats: ${SUPPORTED_FILE_TYPES.join(', ')}`);
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
        processDocument(selectedFile);
      } else {
        setFileError(`Unsupported file type. Please upload one of these formats: ${SUPPORTED_FILE_TYPES.join(', ')}`);
      }
    }
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (!customText.trim()) {
      setFileError("Please enter some text content first.");
      return;
    }
    
    // Create a virtual file for processing
    const textBlob = new Blob([customText], { type: 'text/plain' });
    const textFile = new File([textBlob], "custom-text.txt", { type: 'text/plain' });
    setFile(textFile);
    setFileError(null);
    processDocument(textFile);
  };

  // Check if file type is supported
  const checkFileType = (file: File) => {
    const fileName = file.name.toLowerCase();
    return SUPPORTED_FILE_TYPES.some(ext => fileName.endsWith(ext));
  };

  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      
      // Use appropriate reader method based on file type
      const fileExt = file.name.toLowerCase().split('.').pop() || '';
      const textFileTypes = ['txt', 'csv', 'rtf', 'md', 'json', 'html', 'xml', 'js', 'css', 'ts'];
      
      if (textFileTypes.includes(fileExt) || file.type.startsWith('text/')) {
        // For text files, use readAsText which is faster
        reader.readAsText(file);
      } else {
        // For binary files (PDFs, images, etc.), use readAsDataURL
        reader.readAsDataURL(file);
      }
    });
  };

  // Process document with Gemini AI
  const processDocument = async (documentFile: File) => {
    setIsProcessing(true);
    setProcessingStatus('reading');
    
    try {
      // Check cache first to avoid redundant processing
      const cachedResults = getProcessedDocCache(
        documentFile.name,
        documentFile.size,
        documentFile.lastModified
      );
      
      if (cachedResults) {
        console.log('Using cached results for', documentFile.name);
        // Use the cached results directly
        setProcessingStatus('generating');
        
        // Wait a moment for UI to show processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a proper processed data object
        const processedDataFromCache: ProcessedData = {
          fileName: documentFile.name,
          fileSize: documentFile.size,
          games: {
            flashcards: {
              count: cachedResults.flashcards.length,
              sample: "Key concepts from your document transformed into flashcards"
            }
          },
          flashcards: cachedResults.flashcards
        };
        
        // Set flashcards from cache
        setProcessedData(processedDataFromCache);
        
        // Process MCQs client-side if they exist
        if (cachedResults.mcqs && Array.isArray(cachedResults.mcqs)) {
          const mcqs = cachedResults.mcqs.map((mcq: MCQ) => shuffleMCQOptions(mcq));
          
          // Update the processed data with MCQs
          setProcessedData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              mcqs
            };
          });
        }

        setIsProcessing(false);
        setProcessingStatus('idle');
        
        return;
      }
      
      // Simulate file reading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStatus('extracting');
      // Simulate content extraction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProcessingStatus('generating');
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, call your Gemini API here
      // Try to use real API if possible, otherwise use mock data
      let flashcards = [];
      let allResults = null;
      
      try {
        const fileContent = await readFileContent(documentFile);
        
        // Prepare request payload
        const payload = {
          fileContent: fileContent,
          fileName: documentFile.name,
          fileType: documentFile.type,
          quantities: {
            flashcards: 10
          }
        };
        
        // Make API call to your backend that will call Gemini API
        const response = await fetch('/api/gemini/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      
        if (response.ok) {
          const data = await response.json();
          
          // Process MCQs client-side to reduce server load
          if (data.mcqs && Array.isArray(data.mcqs)) {
            data.mcqs = data.mcqs.map((mcq: MCQ) => shuffleMCQOptions(mcq));
          }
          
          flashcards = FlashcardGenerator.processFlashcards(data.flashcards);
          allResults = data;
          
          // Cache the results for future use
          saveProcessedDocCache(
            documentFile.name,
            documentFile.size, 
            documentFile.lastModified,
            data
          );
        } else {
          // Fallback to demo data if API call fails
          flashcards = FlashcardGenerator.getDemoFlashcards();
        }
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback to demo data
        flashcards = FlashcardGenerator.getDemoFlashcards();
      }
      
      // Set state with processed results
      setProcessedData({
        fileName: documentFile.name,
        fileSize: documentFile.size,
        games: {
          flashcards: {
            count: flashcards.length,
            sample: "Key concepts from your document transformed into flashcards"
          }
        },
        flashcards: flashcards
      });
      
      if (allResults && allResults.mcqs) {
        setProcessedData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            mcqs: allResults.mcqs
          };
        });
      }
      
      setIsProcessing(false);
      setProcessingStatus('idle');
    } catch (error) {
      console.error("Error processing document:", error);
      setIsProcessing(false);
      setProcessingStatus('idle');
    }
  };

  // Handle generate more flashcards
  const handleGenerateMoreFlashcards = async (quantity: number): Promise<void> => {
    if (!file) {
      toast.error("No document available to generate flashcards from");
      return Promise.reject(new Error("No document available"));
    }
    
    try {
      setIsProcessing(true);
      setProcessingStatus('generating');
      
      // In a real app, call your Gemini API here
      // For now, just simulate the API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check cache first
      const cachedResults = getProcessedDocCache(
        file.name,
        file.size,
        file.lastModified
      );
      
      // If we have cached data with enough flashcards, use that instead
      if (cachedResults && cachedResults.flashcards && cachedResults.flashcards.length >= quantity) {
        const newFlashcards = cachedResults.flashcards.slice(0, quantity);
        setProcessedData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            flashcards: [...(prev.flashcards || []), ...newFlashcards]
          };
        });
        
        setIsProcessing(false);
        setProcessingStatus('idle');
        return Promise.resolve();
      }
      
      // Generate additional flashcards
      let newFlashcards = [];
      
      try {
        const fileContent = await readFileContent(file);
        
        // Prepare request payload
        const payload = {
          fileContent: fileContent,
          fileName: file.name,
          fileType: file.type,
          quantities: {
            flashcards: quantity
          }
        };
        
        // Make API call to your backend that will call Gemini API
        const response = await fetch('/api/gemini/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      
        if (response.ok) {
          const data = await response.json();
          newFlashcards = FlashcardGenerator.processFlashcards(data.flashcards);
          
          // Update cache with new data
          saveProcessedDocCache(
            file.name,
            file.size,
            file.lastModified,
            data
          );
        } else {
          // Fallback to demo data if API call fails
          newFlashcards = FlashcardGenerator.getDemoFlashcards().slice(0, quantity);
        }
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback to demo data
        newFlashcards = FlashcardGenerator.getDemoFlashcards().slice(0, quantity);
      }
      
      setProcessedData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          flashcards: [...(prev.flashcards || []), ...newFlashcards]
        };
      });
      
      setIsProcessing(false);
      setProcessingStatus('idle');
      return Promise.resolve();
    } catch (error) {
      console.error("Error generating more flashcards:", error);
      setIsProcessing(false);
      setProcessingStatus('idle');
      return Promise.reject(error);
    }
  };

  // Handle reset to upload new document
  const handleResetToUpload = () => {
    setShowUploadSection(true);
    setProcessedData(null);
    setFile(null);
    setActiveGame(null);
    setCustomText('');
  };

  // Handle game selection
  const handleGameSelect = (gameType: string) => {
    if (!file && !customText.trim() && !processedData) {
      toast.error("Please upload a document or enter text first before starting a game");
      return;
    }
    
    // If document hasn't been processed yet, process it first
    if (!processedData) {
      toast.info("Processing your content first...");
      if (file) {
        processDocument(file);
      } else if (customText.trim()) {
        // Create a virtual file for processing
        const textBlob = new Blob([customText], { type: 'text/plain' });
        const textFile = new File([textBlob], "custom-text.txt", { type: 'text/plain' });
        processDocument(textFile);
      }
      // Set the active game to display after processing
      setActiveGame(gameType);
      return;
    }
    
    // If already processed, start the game
    setActiveGame(gameType);
    toast.info(`Opening ${gameType} game...`);
  };

  // Handle Try it Now button click
  const handleTryItNowClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  // Render processing indicator
  const renderProcessingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10"
    >
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ 
              rotate: 360,
              borderColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#3B82F6'] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 rounded-full border-4 border-t-transparent"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="absolute inset-0 flex items-center justify-center text-blue-500"
          >
            {processingStatus === 'reading' && <FileText size={20} />}
            {processingStatus === 'extracting' && <BookOpen size={20} />}
            {processingStatus === 'generating' && <Brain size={20} />}
          </motion.div>
        </div>
        
        <div className="text-center">
          <h3 className="font-bold text-gray-800 dark:text-white text-xl">
            {file ? `Processing "${file.name}"` : "Processing your input"}
          </h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 mt-2"
          >
            {processingStatus === 'reading' && "Reading content..."}
            {processingStatus === 'extracting' && "Extracting key information..."}
            {processingStatus === 'generating' && "Creating AI-powered learning games..."}
          </motion.p>
          
          <motion.div
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden"
          >
            <motion.div
              className="bg-blue-600 h-2.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ 
                width: processingStatus === 'reading' ? "33%" : 
                       processingStatus === 'extracting' ? "66%" : 
                       processingStatus === 'generating' ? "90%" : "100%" 
              }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  // Render document info and reset button
  const renderDocumentInfo = () => {
    if (!processedData) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {processedData.fileName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(processedData.fileSize / 1024).toFixed(2)} KB • {processedData.games.flashcards.count} flashcards
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToUpload}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            New Document
          </Button>
        </div>
      </motion.div>
    );
  };

  // Render game cards
  const renderGameCards = () => {
    // Default game data when no document is processed yet
    const defaultGameData = [
      {
        id: 'Cricket',
        title: 'Cricket',
        description: 'Answer Questions to score better!',
        icon: <BookOpen className="h-8 w-8 text-blue-500" />,
        disabled: !processedData,
        comingSoon: true

      },
      {
        id: 'Sail the Ship',
        title: 'Sail the Ship',
        description: 'Dont Let The Ship Sink!',
        icon: <Brain className="h-8 w-8 text-indigo-500" />,
        disabled: !processedData,
        comingSoon: true
      },
      {
        id: 'Poki Battle',
        title: 'Poki Battle',
        description: 'Answer Questions to Fight Poki Monkeys',
        icon: <Grid2X2 className="h-8 w-8 text-purple-500" />,
        disabled: !processedData,
        comingSoon: true
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {defaultGameData.map((game) => (
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
              className={`h-full cursor-pointer hover:shadow-lg transition-all ${
                game.disabled ? 'opacity-60' : ''
              }`}
              onClick={() => !game.disabled && !game.comingSoon && handleGameSelect(game.id)}
            >
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
                  className={`w-full ${game.disabled || game.comingSoon ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
                  disabled={game.disabled || game.comingSoon}
                >
                  {game.comingSoon ? 'Coming Soon' : 'Start Learning'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render active game content
  const renderGameContent = () => {
    if (!processedData || !activeGame) return null;
    
    switch (activeGame) {
      case 'flashcards':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h2>
              <Button 
                onClick={() => setActiveGame(null)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Games
              </Button>
            </div>
            
            <Flashcards 
              initialFlashcards={processedData.flashcards || []}
              onGenerateMore={handleGenerateMoreFlashcards}
              isProcessing={isProcessing}
            />
          </motion.div>
        );
      default:
        return (
          <div className="text-center p-12">
            <h3 className="text-xl font-bold mb-4">Game not found</h3>
            <p className="mb-4">The selected game could not be loaded</p>
            <Button onClick={() => setActiveGame(null)}>
              Back to Games
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 sm:text-5xl sm:tracking-tight">
            <span className="block">AI-Powered Learning Games</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl">
            Transform any document into interactive learning experiences with the power of AI
          </p>
        </motion.div>
        
        {/* Main content */}
        <div>
          {isAuthLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Show game content if a game is active */}
              {activeGame ? (
                <motion.div
                  key="game-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderGameContent()}
                </motion.div>
              ) : (
                <motion.div
                  key="main-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Document info after processing */}
                  {processedData && renderDocumentInfo()}
                  
                  {/* Upload section or processing indicator */}
                  {isProcessing ? (
                    renderProcessingIndicator()
                  ) : (
                    showUploadSection && renderUploadSection()
                  )}
                  
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
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGamesPage;