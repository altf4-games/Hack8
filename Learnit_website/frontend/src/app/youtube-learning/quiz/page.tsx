'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, X, ChevronLeft, ChevronRight, BookOpen, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface VideoData {
  transcript: string;
  title: string;
  videoId: string;
}

export default function VideoQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('videoId');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // Get saved video data
        const savedData = localStorage.getItem('current_video_transcript');
        if (!savedData) {
          toast.error('No video data found');
          router.push('/youtube-learning');
          return;
        }

        const videoData: VideoData = JSON.parse(savedData);
        
        // Generate quiz questions
        const response = await fetch('/api/gemini/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: videoData.transcript,
            title: videoData.title,
            type: 'youtube'
          }),
        });

        if (!response.ok) throw new Error('Failed to generate quiz');
        
        const data = await response.json();
        setQuestions(data.questions);

        // Generate AI summary in parallel
        generateSummary(videoData);

      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadQuiz();
    }
  }, [videoId, router]);

  const generateSummary = async (videoData: VideoData) => {
    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: videoData.transcript,
          title: videoData.title,
          type: 'youtube'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setAiSummary('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showAnswer) return;
    setSelectedAnswer(index);
    setShowAnswer(true);

    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600 dark:text-gray-400">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    Score: {score}/{questions.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-lg font-medium mb-4">
                      {questions[currentQuestionIndex].question}
                    </p>

                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full justify-start h-auto py-3 px-4 text-left ${
                            selectedAnswer === index
                              ? index === questions[currentQuestionIndex].correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : showAnswer && index === questions[currentQuestionIndex].correctAnswer
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : ""
                          }`}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                            {showAnswer && (
                              <span className="ml-auto">
                                {index === questions[currentQuestionIndex].correctAnswer ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : selectedAnswer === index ? (
                                  <X className="h-5 w-5 text-red-500" />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>

                    {showAnswer && questions[currentQuestionIndex].explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Explanation:</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {questions[currentQuestionIndex].explanation}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Summary Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="flex flex-col items-center justify-center p-4 space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    <p className="text-sm text-gray-500">Generating summary...</p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{aiSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}