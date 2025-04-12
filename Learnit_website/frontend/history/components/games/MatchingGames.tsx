'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';

// Define types
interface GameContent {
  id: string;
  title: string;
  source: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  lastPlayed?: string;
  completionRate?: number;
}

interface MatchItem {
  id: string;
  term: string;
  definition: string;
  isMatched: boolean;
}

interface MatchingGameProps {
  gameData: GameContent;
  onClose: () => void;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ gameData, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Simulate fetching game data
  useEffect(() => {
    const fetchGameData = async () => {
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in a real app, this would come from your API
      const mockItems: MatchItem[] = [
        { id: '1a', term: 'Photosynthesis', definition: 'Process by which plants convert light energy to chemical energy', isMatched: false },
        { id: '2a', term: 'Mitochondria', definition: 'Organelle that generates energy for the cell', isMatched: false },
        { id: '3a', term: 'DNA', definition: 'Molecule that carries genetic information', isMatched: false },
        { id: '4a', term: 'Chloroplast', definition: 'Organelle where photosynthesis occurs', isMatched: false },
        { id: '5a', term: 'Cell membrane', definition: 'Barrier that separates the interior of a cell from the outside environment', isMatched: false },
        { id: '6a', term: 'Nucleus', definition: 'Control center of the cell containing DNA', isMatched: false },
      ];
      
      setItems(mockItems);
      setTotalPairs(mockItems.length);
      setLoading(false);
    };
    
    fetchGameData();
  }, []);

  // Start timer when game starts
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Handle term or definition selection
  const handleItemClick = (id: string) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (selectedItem === null) {
      // First selection
      setSelectedItem(id);
    } else if (selectedItem !== id) {
      // Second selection
      const firstItem = items.find(item => item.id === selectedItem);
      const secondItem = items.find(item => item.id === id);
      
      if (!firstItem || !secondItem) return;
      
      setAttempts(prev => prev + 1);
      
      // Check if they match
      if (firstItem.term === secondItem.term || firstItem.definition === secondItem.definition) {
        // Items match
        toast.success("Match found!");
        setMatchedPairs(prev => [...prev, firstItem.id, secondItem.id]);
        setScore(prev => prev + 1);
        
        // Check if game is complete
        if (score + 1 === totalPairs) {
          setGameCompleted(true);
          handleGameCompletion();
        }
      } else {
        // No match
        toast.error("Not a match, try again!");
      }
      
      // Reset selection
      setSelectedItem(null);
    }
  };

  // Handle game completion
  const handleGameCompletion = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Reset the game
  const resetGame = () => {
    setSelectedItem(null);
    setMatchedPairs([]);
    setScore(0);
    setAttempts(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
    
    // Reset the matched status of all items
    setItems(items.map(item => ({ ...item, isMatched: false })));
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate accuracy
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  // Shuffle items for display
  const shuffledItems = [...items]
    .map(item => ({ id: item.id, content: item.term, type: 'term', isMatched: matchedPairs.includes(item.id) }))
    .concat(
      items.map(item => ({ id: `${item.id}-def`, content: item.definition, type: 'definition', isMatched: matchedPairs.includes(item.id) }))
    )
    .sort(() => Math.random() - 0.5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading game...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Game header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{gameData.title}</h3>
          <p className="text-gray-500 dark:text-gray-400">Match the terms with their definitions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetGame} disabled={!gameStarted}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
      
      {/* Game progress */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Matches</p>
            <p className="text-xl font-bold">{score}/{totalPairs}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
            <p className="text-xl font-bold">{accuracy}%</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Attempts</p>
            <p className="text-xl font-bold">{attempts}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
            <p className="text-xl font-bold">{formatTime(timeElapsed)}</p>
          </div>
        </div>
        <Progress value={(score / totalPairs) * 100} className="h-2" />
      </div>
      
      {/* Game completed view */}
      {gameCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-700 rounded-lg p-6 text-center shadow-sm"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Game Completed!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Great job! You've matched all the pairs.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Final Score</p>
              <p className="text-2xl font-bold">{score}/{totalPairs}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
              <p className="text-2xl font-bold">{accuracy}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Attempts</p>
              <p className="text-2xl font-bold">{attempts}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={resetGame}>
              Play Again
            </Button>
            <Button variant="outline" onClick={onClose}>
              Back to Games
            </Button>
          </div>
        </motion.div>
      ) : (
        // Game board
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shuffledItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer h-full ${
                  item.isMatched 
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-900' 
                    : selectedItem === item.id 
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900' 
                      : ''
                }`}
                onClick={() => !item.isMatched && handleItemClick(item.id)}
              >
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <p className={`text-center ${item.type === 'term' ? 'font-semibold' : ''}`}>
                    {item.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchingGame;