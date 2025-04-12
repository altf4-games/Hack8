'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Filter, Search, RefreshCw, Upload, FileText } from 'lucide-react';
import Link from 'next/link';

// Import game components - adjust paths as needed
import Flashcards from './components/games/flashcards';
import QuizChallenge from './components/games/QuizChallenge';
import MatchingGame from './components/games/MatchingGames';
import TrueFalseGame from './components/games/TrueOrFalse';

// Define types
interface GameContent {
  id: string;
  title: string;
  source: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  lastPlayed?: string;
  completionRate?: number;
  content?: any; // Content generated from the file
}

// Constants
const SUPPORTED_FILE_TYPES = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', 
  '.xls', '.xlsx', '.txt', '.rtf', '.csv'
];

// File Upload Component
const FileUploadSection: React.FC<{
  onFileProcessed: (gameData: GameContent) => void;
}> = ({ onFileProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'reading' | 'extracting' | 'generating'>('idle');
  const [processingFilename, setProcessingFilename] = useState<string>('');
  const [extractedTextPreview, setExtractedTextPreview] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [customText, setCustomText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };
  
  const handleTryItNowClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      processTextInput(customText);
    } else {
      setFileError("Please enter some text to generate a quiz.");
    }
  };
  
  // Validate file type
  const validateAndProcessFile = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
      setFileError(`Unsupported file type. Please upload one of: ${SUPPORTED_FILE_TYPES.join(', ')}`);
      return;
    }
    
    setFileError(null);
    processFile(file);
  };
  
  // Process the file
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus('reading');
    setProcessingFilename(file.name);
    
    try {
      // Simulate file reading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStatus('extracting');
      // Simulate text extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const extractedText = `Sample extracted content from ${file.name}...`;
      setExtractedTextPreview(extractedText.substring(0, 100) + '...');
      
      setProcessingStatus('generating');
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a new game based on the file
      const newGameId = `${getGameTypeFromFileName(file.name)}-${Date.now()}`;
      const newGame: GameContent = {
        id: newGameId,
        title: file.name.split('.')[0],
        source: file.name,
        difficulty: getDifficultyFromFileSize(file.size),
        createdAt: new Date().toISOString(),
        completionRate: 0,
        content: { text: extractedText } // You would store actual content here
      };
      
      onFileProcessed(newGame);
      toast.success(`Generated game from ${file.name}`);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setFileError("Error processing file. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus('idle');
      setExtractedTextPreview(null);
    }
  };
  
  // Process text input
  const processTextInput = async (text: string) => {
    setIsProcessing(true);
    setProcessingStatus('generating');
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a new game based on the text input
      const newGameId = `quiz-${Date.now()}`;
      const newGame: GameContent = {
        id: newGameId,
        title: `Quiz ${new Date().toLocaleString()}`,
        source: 'Text Input',
        difficulty: 'Medium',
        createdAt: new Date().toISOString(),
        completionRate: 0,
        content: { text } // You would store actual content here
      };
      
      onFileProcessed(newGame);
      toast.success('Generated game from text input');
      
    } catch (error) {
      console.error("Error processing text:", error);
      setFileError("Error processing text. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus('idle');
    }
  };
  
  // Helper functions
  const getGameTypeFromFileName = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension === 'pdf' || extension === 'txt') return 'flash';
    if (extension === 'doc' || extension === 'docx') return 'quiz';
    if (extension === 'ppt' || extension === 'pptx') return 'match';
    return 'tf';
  };
  
  const getDifficultyFromFileSize = (size: number): 'Easy' | 'Medium' | 'Hard' => {
    if (size < 100000) return 'Easy';
    if (size < 500000) return 'Medium';
    return 'Hard';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Upload Files to Create Games
      </h2>
      
      <Tabs 
        defaultValue="file" 
        onValueChange={(value) => setInputMode(value as 'file' | 'text')}
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="text">Enter Text</TabsTrigger>
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
            {!isProcessing ? (
              <>
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                >
                  <Upload className="h-16 w-16 text-blue-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Drag & Drop Your Documents
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Supported formats: PDF, PPT, Word, Excel, Text
                </p>
                {fileError && (
                  <p className="text-red-500 text-sm mb-2">{fileError}</p>
                )}
                <input 
                  type="file" 
                  accept={SUPPORTED_FILE_TYPES.join(',')} 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />
                <Button 
                  onClick={handleTryItNowClick} 
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Choose File
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {`Processing "${processingFilename}"`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {processingStatus === 'reading' && "Reading content..."}
                    {processingStatus === 'extracting' && "Extracting content..."}
                    {processingStatus === 'generating' && "Generating game..."}
                  </p>
                  {extractedTextPreview && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded max-h-24 overflow-y-auto text-sm text-left">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Preview:</p>
                      {extractedTextPreview}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="text">
          <div className="h-64 flex flex-col">
            {!isProcessing ? (
              <>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste or type your content here..."
                  className="w-full h-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
                {fileError && (
                  <p className="text-red-500 text-sm mt-2">{fileError}</p>
                )}
                <Button 
                  onClick={handleCustomTextSubmit} 
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!customText.trim() || isProcessing}
                >
                  Generate Game
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    Processing your text input
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {processingStatus === 'generating' && "Generating game..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Game List Component
const GamesList: React.FC<{
  games: GameContent[];
  isLoading: boolean;
  onGameSelect: (gameId: string) => void;
}> = ({ games, isLoading, onGameSelect }) => {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading your games...</span>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No games found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Upload a file or enter text to create your first game
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {games.map((game) => {
        const gameType = game.id.split('-')[0];
        let typeColor = '';
        let typeIcon = '';
        let typeLabel = '';
        
        switch (gameType) {
          case 'flash':
            typeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
            typeIcon = '🎴';
            typeLabel = 'Flashcards';
            break;
          case 'quiz':
            typeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
            typeIcon = '❓';
            typeLabel = 'Quiz';
            break;
          case 'match':
            typeColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            typeIcon = '🔄';
            typeLabel = 'Matching';
            break;
          case 'tf':
            typeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
            typeIcon = '✓✗';
            typeLabel = 'True/False';
            break;
          default:
            typeColor = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
            typeIcon = '🎮';
            typeLabel = 'Game';
        }
        
        return (
          <motion.div 
            key={game.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full overflow-hidden cursor-pointer" onClick={() => onGameSelect(game.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{game.title}</CardTitle>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
                    {typeIcon} {typeLabel}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <span>From: {game.source}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                    <span className="font-medium">{game.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span>{formatRelativeTime(game.createdAt)}</span>
                  </div>
                  {game.lastPlayed && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Last played:</span>
                      <span>{formatRelativeTime(game.lastPlayed)}</span>
                    </div>
                  )}
                  {game.completionRate !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                        <span className="font-medium">{game.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${game.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 dark:bg-gray-800 p-4">
                <Button 
                  className={`w-full ${
                    gameType === 'flash' ? 'bg-purple-600 hover:bg-purple-700' :
                    gameType === 'quiz' ? 'bg-blue-600 hover:bg-blue-700' :
                    gameType === 'match' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {game.lastPlayed ? 'Continue Playing' : 'Start Game'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Main AllGamesPage Component
const AllGamesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<GameContent[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameContent[]>([]);
  const [sortOption, setSortOption] = useState('newest');
  const [showUploadSection, setShowUploadSection] = useState(false);

  // Simulate fetching games data
  useEffect(() => {
    const fetchGames = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock data - this would come from your actual API
      const mockGames: GameContent[] = [
        {
          id: 'flash-1',
          title: 'Biology Fundamentals',
          source: 'biology-textbook.pdf',
          difficulty: 'Medium',
          createdAt: '2025-03-01T12:00:00Z',
          lastPlayed: '2025-03-08T15:30:00Z',
          completionRate: 75
        },
        {
          id: 'quiz-1',
          title: 'World History Quiz',
          source: 'history-notes.docx',
          difficulty: 'Hard',
          createdAt: '2025-03-05T09:15:00Z',
          lastPlayed: '2025-03-09T10:45:00Z',
          completionRate: 60
        },
        {
          id: 'match-1',
          title: 'Chemistry Elements',
          source: 'chemistry-lecture.pdf',
          difficulty: 'Medium',
          createdAt: '2025-02-28T14:20:00Z',
          lastPlayed: '2025-03-07T16:10:00Z',
          completionRate: 90
        },
        {
          id: 'tf-1',
          title: 'Physics Concepts',
          source: 'physics-class-notes.txt',
          difficulty: 'Easy',
          createdAt: '2025-03-02T11:30:00Z',
          lastPlayed: '2025-03-10T09:20:00Z',
          completionRate: 85
        },
        {
          id: 'flash-2',
          title: 'Programming Basics',
          source: 'coding-tutorial.pdf',
          difficulty: 'Easy',
          createdAt: '2025-03-06T16:45:00Z',
          completionRate: 0
        },
        {
          id: 'quiz-2',
          title: 'Literature Analysis',
          source: 'literature-essay.docx',
          difficulty: 'Hard',
          createdAt: '2025-03-04T13:50:00Z',
          lastPlayed: '2025-03-06T14:15:00Z',
          completionRate: 45
        }
      ];
      
      setGames(mockGames);
      setFilteredGames(mockGames);
      setIsLoading(false);
    };
    
    fetchGames();
  }, []);

  // Filter and sort games based on search query and active tab
  useEffect(() => {
    let filtered = [...games];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by game type
    if (activeTab !== 'all') {
      const gameTypeMapping: Record<string, string> = {
        'flashcards': 'flash',
        'quiz': 'quiz',
        'matching': 'match',
        'trueFalse': 'tf'
      };
      
      filtered = filtered.filter(game => 
        game.id.startsWith(gameTypeMapping[activeTab])
      );
    }
    
    // Sort games
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'completion':
          return (b.completionRate || 0) - (a.completionRate || 0);
        case 'difficulty': {
          const difficultyRank: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
        }
        default:
          return 0;
      }
    });
    
    setFilteredGames(filtered);
  }, [games, searchQuery, activeTab, sortOption]);

  // Handle starting a game
  const handleStartGame = (gameId: string) => {
    setActiveGame(gameId);
    toast.success(`Loading ${gameId.split('-')[0]} game...`);
  };

  // Handle file processed
  const handleFileProcessed = (newGame: GameContent) => {
    setGames(prevGames => [newGame, ...prevGames]);
    setShowUploadSection(false);
    toast.success('New game created successfully!');
  };

  // Render game component based on activeGame
  const renderGameComponent = () => {
    if (!activeGame) return null;
    
    const gameType = activeGame.split('-')[0];
    const gameData = games.find(game => game.id === activeGame);
    
    if (!gameData) return null;
    
    switch (gameType) {
      case 'flash':
        return <Flashcards gameData={gameData} onClose={() => setActiveGame(null)} />;
      case 'quiz':
        return <QuizChallenge gameData={gameData} onClose={() => setActiveGame(null)} />;
      case 'match':
        return <MatchingGame gameData={gameData} onClose={() => setActiveGame(null)} />;
      case 'tf':
        return <TrueFalseGame gameData={gameData} onClose={() => setActiveGame(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Learning Games</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore and play all your personalized AI-generated learning games in one place.
          </p>
        </motion.div>

        {/* Active Game Display */}
        {activeGame ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {games.find(game => game.id === activeGame)?.title}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveGame(null)}
                  className="flex items-center space-x-2"
                >
                  <span>Back to Games</span>
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                {renderGameComponent()}
              </div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {showUploadSection ? (
              <motion.div
                key="upload-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create New Game
                  </h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUploadSection(false)}
                  >
                    Back to Games
                  </Button>
                </div>
                <FileUploadSection onFileProcessed={handleFileProcessed} />
              </motion.div>
            ) : (
              <motion.div
                key="games-list-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Games Filter and Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
    {/* Tabs for filtering */}
    <Tabs 
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full md:w-auto min-w-[300px]"
    >
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="flashcards">
          🎴 Flash
        </TabsTrigger>
        <TabsTrigger value="quiz">
          ❓ Quiz
        </TabsTrigger>
        <TabsTrigger value="matching">
          🔄 Match
        </TabsTrigger>
        <TabsTrigger value="trueFalse">
          ✓✗ T/F
        </TabsTrigger>
      </TabsList>
    </Tabs>
    
    {/* Search and filter actions */}
    <div className="flex flex-row gap-2 w-full md:w-auto">
      <div className="relative flex-grow md:w-60">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="completion">Completion</option>
        <option value="difficulty">Difficulty</option>
      </select>
      
      <Button
        onClick={() => setShowUploadSection(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        <span>New</span>
      </Button>
    </div>
  </div>
  
  {/* Games list */}
  <GamesList 
    games={filteredGames} 
    isLoading={isLoading} 
    onGameSelect={handleStartGame}
  />
  
  {/* Empty state with refresh button when search returns no results */}
  {!isLoading && filteredGames.length === 0 && searchQuery && (
    <div className="text-center p-8">
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        No games found matching "{searchQuery}"
      </p>
      <Button
        variant="outline"
        onClick={() => setSearchQuery('')}
        className="inline-flex items-center"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        <span>Clear search</span>
      </Button>
    </div>
  )}
</div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AllGamesPage;
                  