'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

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

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizChallengeProps {
  gameData: GameData;
  onClose: () => void;
}

const QuizChallenge: React.FC<QuizChallengeProps> = ({ gameData, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    // Simulate fetching quiz questions
    const fetchQuestions = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data based on the game title
      const mockQuestions: QuizQuestion[] = [];
      
      if (gameData.title.includes('History')) {
        mockQuestions.push(
          {
            id: 1,
            question: "When did World War II end?",
            options: ["1943", "1945", "1947", "1950"],
            correctAnswer: 1,
            explanation: "World War II ended in 1945 with the surrender of Japan following the atomic bombings of Hiroshima and Nagasaki."
          },
          {
            id: 2,
            question: "Who was the first President of the United States?",
            options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
            correctAnswer: 2,
            explanation: "George Washington was the first President of the United States, serving from 1789 to 1797."
          },
          {
            id: 3,
            question: "The Renaissance period began in which country?",
            options: ["France", "England", "Spain", "Italy"],
            correctAnswer: 3,
            explanation: "The Renaissance began in Italy in the 14th century before spreading to the rest of Europe."
          },
          {
            id: 4,
            question: "Which ancient civilization built the pyramids at Giza?",
            options: ["Mesopotamians", "Egyptians", "Greeks", "Romans"],
            correctAnswer: 1,
            explanation: "The pyramids at Giza were built by the ancient Egyptians as tombs for their pharaohs."
          },
          {
            id: 5,
            question: "When did the Berlin Wall fall?",
            options: ["1985", "1989", "1991", "1993"],
            correctAnswer: 1,
            explanation: "The Berlin Wall fell on November 9, 1989, marking a pivotal moment in the end of the Cold War."
          }
        );
      } else if (gameData.title.includes('Literature')) {
        mockQuestions.push(
          {
            id: 1,
            question: "Who wrote 'Pride and Prejudice'?",
            options: ["Charlotte Brontë", "Jane Austen", "Virginia Woolf", "Emily Dickinson"],
            correctAnswer: 1,
            explanation: "Jane Austen wrote 'Pride and Prejudice', which was published in 1813."
          },
          {
            id: 2,
            question: "Which Shakespeare play features the character Hamlet?",
            options: ["Macbeth", "Romeo and Juliet", "Hamlet", "King Lear"],
            correctAnswer: 2,
            explanation: "The character Hamlet appears in Shakespeare's play of the same name, 'Hamlet'."
          },
          {
            id: 3,
            question: "What is the name of the protagonist in 'The Great Gatsby'?",
            options: ["Jay Gatsby", "Nick Carraway", "Tom Buchanan", "George Wilson"],
            correctAnswer: 0,
            explanation: "Jay Gatsby is the titular protagonist of F. Scott Fitzgerald's novel 'The Great Gatsby'."
          },
          {
            id: 4,
            question: "Who wrote '1984'?",
            options: ["Aldous Huxley", "Ray Bradbury", "George Orwell", "Kurt Vonnegut"],
            correctAnswer: 2,
            explanation: "George Orwell wrote '1984', a dystopian novel published in 1949."
          },
          {
            id: 5,
            question: "Which of the following is NOT a play by Tennessee Williams?",
            options: ["A Streetcar Named Desire", "The Glass Menagerie", "Death of a Salesman", "Cat on a Hot Tin Roof"],
            correctAnswer: 2,
            explanation: "'Death of a Salesman' was written by Arthur Miller, not Tennessee Williams."
          }
        );
      } else {
        // Default questions if the game title doesn't match
        mockQuestions.push(
          {
            id: 1,
            question: "Question 1",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Explanation for Question 1"
          },
          {
            id: 2,
            question: "Question 2",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 1,
            explanation: "Explanation for Question 2"
          },
          {
            id: 3,
            question: "Question 3",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 2,
            explanation: "Explanation for Question 3"
          },
          {
            id: 4,
            question: "Question 4",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 3,
            explanation: "Explanation for Question 4"
          },
          {
            id: 5,
            question: "Question 5",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Explanation for Question 5"
          }
        );
      }

      setQuestions(mockQuestions);
      setIsLoading(false);
      setTimerActive(true);
    };

    fetchQuestions();
  }, [gameData.title]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && !isAnswered && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isAnswered) {
      handleSubmit();
    }

    return () => clearInterval(interval);
  }, [timerActive, isAnswered, timeRemaining]);

  const handleOptionSelect = (index: number) => {
    if (!isAnswered) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null || timeRemaining === 0) {
      setIsAnswered(true);
      setTimerActive(false);
      
      const currentQuestionData = questions[currentQuestion];
      if (selectedOption === currentQuestionData.correctAnswer) {
        setScore(score + 1);
        toast.success('Correct answer!');
      } else {
        toast.error('Incorrect answer!');
      }
    } else {
      toast.warning('Please select an answer');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeRemaining(30);
      setTimerActive(true);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeRemaining(30);
    setTimerActive(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading quiz questions...</p>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    let feedbackMessage = '';
    let icon = null;
    
    if (percentage >= 80) {
      feedbackMessage = 'Excellent! You have a great understanding of this topic!';
      icon = <Trophy className="h-12 w-12 text-yellow-500 mb-4" />;
    } else if (percentage >= 60) {
      feedbackMessage = 'Good job! You have a solid grasp of this material.';
      icon = <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />;
    } else if (percentage >= 40) {
      feedbackMessage = 'You\'re making progress, but there\'s room for improvement.';
      icon = <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />;
    } else {
      feedbackMessage = 'Keep studying! You\'ll get better with practice.';
      icon = <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />;
    }

    return (
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {icon}
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">
            Your score: <span className="font-bold">{score}/{questions.length}</span> ({Math.round(percentage)}%)
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{feedbackMessage}</p>

          <div className="w-full max-w-md mb-8">
            <Progress value={percentage} className="h-3" />
          </div>

          <Button 
            onClick={handleRestartQuiz} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Restart Quiz
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm font-medium">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
          timeRemaining > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
          timeRemaining > 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        }`}>
          Time: {timeRemaining}s
        </div>
      </div>

      <Progress value={(currentQuestion / questions.length) * 100} className="h-2 mb-6" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQuestionData.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedOption?.toString()} 
            onValueChange={(value) => handleOptionSelect(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestionData.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer transition-colors ${
                  isAnswered && index === currentQuestionData.correctAnswer
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                    : isAnswered && index === selectedOption && index !== currentQuestionData.correctAnswer
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                    : selectedOption === index
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`} 
                  disabled={isAnswered}
                />
                <Label 
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
                {isAnswered && index === currentQuestionData.correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {isAnswered && index === selectedOption && index !== currentQuestionData.correctAnswer && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        {isAnswered && (
          <CardFooter className="bg-blue-50 dark:bg-blue-900/20 border-t p-4">
            <div className="flex items-start space-x-3">
              <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Explanation:</span> {currentQuestionData.explanation}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="flex justify-center">
        {!isAnswered ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
          >
            Submit Answer
          </Button>
        ) : (
          <Button 
            onClick={handleNextQuestion} 
            className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizChallenge;