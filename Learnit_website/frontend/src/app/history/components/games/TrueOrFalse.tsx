'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, RefreshCw, Trophy, Check, X } from 'lucide-react';
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

interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  answered?: boolean;
  userAnswer?: boolean;
}

interface TrueFalseGameProps {
  gameData: GameContent;
  onClose: () => void;
}

const TrueFalseGame: React.FC<TrueFalseGameProps> = ({ gameData, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Simulate fetching game data
  useEffect(() => {
    const fetchGameData = async () => {
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in a real app, this would come from your API
      const mockQuestions: TrueFalseQuestion[] = [
        { 
          id: '1', 
          statement: 'The First Law of Thermodynamics states that energy cannot be created or destroyed, only transferred or transformed.',
          isTrue: true,
          explanation: 'This is correct. The First Law of Thermodynamics is the principle of conservation of energy.'
        },
        { 
          id: '2', 
          statement: 'Sound travels faster in water than in air.',
          isTrue: true,
          explanation: 'Correct. Sound travels at approximately 343 m/s in air, but about 1,480 m/s in water.'
        },
        { 
          id: '3', 
          statement: 'Humans have 5 senses: sight, hearing, smell, taste, and touch.',
          isTrue: false,
          explanation: 'False. Humans have more than 5 senses, including balance (equilibrioception), temperature (thermoception), pain (nociception), and body position (proprioception).'
        },
        { 
          id: '4', 
          statement: 'The Great Wall of China is visible from the Moon with the naked eye.',
          isTrue: false,
          explanation: 'False. The Great Wall of China cannot be seen from the Moon with the naked eye. Its barely visible even from low Earth orbit.'
        },
        { 
          id: '5', 
          statement: 'DNA stands for Deoxyribonucleic Acid.',
          isTrue: true,
          explanation: 'Correct. DNA (Deoxyribonucleic Acid) is the molecule that carries genetic information in all living organisms.'
        },
        { 
          id: '6', 
          statement: 'All mammals give birth to live young.',
          isTrue: false,
          explanation: 'False. While most mammals give birth to live young, monotremes like the platypus and echidna lay eggs.'
        },
      ];
      
      setQuestions(mockQuestions);
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

  const currentQuestion = questions[currentQuestionIndex];

  // Handle answering a question
  const handleAnswer = (answer: boolean) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Create a copy of the questions array
    const updatedQuestions = [...questions];
    const updatedQuestion = {...updatedQuestions[currentQuestionIndex]};
    
    // Update the question with the user's answer
    updatedQuestion.answered = true;
    updatedQuestion.userAnswer = answer;
    updatedQuestions[currentQuestionIndex] = updatedQuestion;
    
    // Update the questions array
    setQuestions(updatedQuestions);
    
    // Check if the answer is correct
    if (answer === currentQuestion.isTrue) {
      setScore(prev => prev + 1);
      toast.success("Correct!");
    } else {
      toast.error("Incorrect!");
    }
    
    // Show explanation
    setShowExplanation(true);
  };

  // Move to the next question
  const handleNextQuestion = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex === questions.length - 1) {
      // Last question completed
      setGameCompleted(true);
      handleGameCompletion();
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
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
    // Reset the questions
    setQuestions(questions.map(q => ({
      ...q,
      answered: undefined,
      userAnswer: undefined
    })));
    
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowExplanation(false);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress
  const progress = questions.length > 0 
    ? (questions.filter(q => q.answered).length / questions.length) * 100 
    : 0;

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
          <p className="text-gray-500 dark:text-gray-400">Determine if each statement is true or false</p>
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
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
            <p className="text-xl font-bold">{score}/{questions.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Question</p>
            <p className="text-xl font-bold">{currentQuestionIndex + 1}/{questions.length}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
            <p className="text-xl font-bold">{formatTime(timeElapsed)}</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
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
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You scored {score} out of {questions.length}
            {score === questions.length ? " - Perfect score!" : ""}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Final Score</p>
              <p className="text-2xl font-bold">{score}/{questions.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
              <p className="text-2xl font-bold">
                {Math.round((score / questions.length) * 100)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
              <p className="text-2xl font-bold">{questions.length}</p>
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
        // Current question card
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {currentQuestionIndex + 1}
                  </span>
                  True or False?
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-lg font-medium mb-8">
                  {currentQuestion?.statement}
                </p>
                
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      currentQuestion?.userAnswer === currentQuestion?.isTrue
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    <p className="font-medium mb-1">
                      {currentQuestion?.userAnswer === currentQuestion?.isTrue ? 'Correct!' : 'Incorrect!'}
                    </p>
                    <p>
                      This statement is <strong>{currentQuestion?.isTrue ? 'TRUE' : 'FALSE'}</strong>.
                    </p>
                    <p className="mt-2">{currentQuestion?.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                {!currentQuestion?.answered ? (
                  <>
                    <Button 
                      onClick={() => handleAnswer(false)} 
                      variant="outline" 
                      className="w-full mr-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
                    >
                      <X className="h-5 w-5 mr-2 text-red-500" />
                      False
                    </Button>
                    <Button 
                      onClick={() => handleAnswer(true)} 
                      variant="outline" 
                      className="w-full ml-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
                    >
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      True
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleNextQuestion} 
                    className="w-full"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Complete Game' : 'Next Question'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TrueFalseGame;