'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { useAuth } from '@/app/contexts/AuthContext/auth-type';
import ActivityTimeline from './ActivityTimeline';
import { FlashcardSection } from '../quizPage/flashcards/flashcard-section';
import { MCQSection } from '../quizPage/MCQS/mcq-section';
import { TrueFalseSection } from '../quizPage/trueOrFalse/true-false-section';
import { MatchingSection } from '../quizPage/matching-questions/matching-question-section';
import { FillInBlanksSection } from '../quizPage/fillblanks/FillBlanksSection';
import { Metadata } from 'next';
import Head from 'next/head';

import { 
  getDocumentState, 
  getRecentDocuments, 
  getStreakInfo, 
  getUserProgress,
  getGitHubStyleActivity,
  UserProgress,
  UploadedDocument,
  setCurrentDocument
} from '../services/documentStorage';

interface UserStats {
  documentsUploaded: number;
  quizzesCompleted: number;
  totalScore: number;
  streakDays: number;
  averageScore: number;
  timeSpent: string;
}

// Simplified cell data structure for GitHub-style calendar
interface ActivityCell {
  date: string;
  count: number;
  level: number; // 0-4 for intensity
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    documentsUploaded: 0,
    quizzesCompleted: 0,
    totalScore: 0,
    streakDays: 0,
    averageScore: 0,
    timeSpent: "00:00:00"
  });
  const [activityCells, setActivityCells] = useState<ActivityCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentDocuments, setRecentDocuments] = useState<UploadedDocument[]>([]);

  // Format time function
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get day of week (0-6, where 0 is Sunday)
  const getDayOfWeek = (dateString: string): number => {
    return new Date(dateString).getDay();
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get document data from localStorage
        const documentState = getDocumentState();
        const userProgress = getUserProgress();
        const { currentStreak } = getStreakInfo();
        const documents = documentState.documents;
        
        // Get recent documents
        const recentDocs = getRecentDocuments(5);
        setRecentDocuments(recentDocs);
        
        // Process quiz data from userProgress
        const quizData = userProgress?.generations || [];
        
        // Calculate stats
        const totalDocs = documents.length;
        const totalQuizzes = quizData.length;
        
        // Mock score and time data (would be stored in userProgress in a real app)
        const totalScore = quizData.length > 0 ? 
          quizData.reduce((sum, quiz) => sum + (70 + Math.floor(Math.random() * 30)), 0) : 0;
        
        // Mock time spent - 5 minutes per quiz on average
        const totalTime = quizData.reduce((sum, quiz) => sum + (quiz.timeSpentSeconds || 300), 0);
        
        // Get GitHub style activity data (52 weeks)
        const activityData = getGitHubStyleActivity(52);
        
        // Find max activity for scaling
        const maxActivity = Math.max(...activityData.map(d => d.count), 5);
        
        // Process for cell rendering - calculate intensity levels (0-4)
        const processedCells = activityData.map(day => ({
          date: day.date,
          count: day.count,
          level: day.count === 0 ? 0 : Math.ceil((day.count / maxActivity) * 4)
        }));
        
        setActivityCells(processedCells);
        
        // Update user stats
        setUserStats({
          documentsUploaded: totalDocs,
          quizzesCompleted: totalQuizzes,
          totalScore,
          streakDays: currentStreak,
          averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
          timeSpent: formatTime(totalTime)
        });
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);


  function handleQuickQuiz(id: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://quizitt.com/dashboard" />
      </Head>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4 min-h-screen"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* User Profile Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold dark:text-white">{user?.displayName || "User"}</h1>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <div className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      {userStats.streakDays} day streak 🔥
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {userStats.quizzesCompleted} quizzes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold dark:text-white">{userStats.documentsUploaded}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploaded docs</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold dark:text-white">{userStats.averageScore}%</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all quizzes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Time Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold dark:text-white">{userStats.timeSpent}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total study time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Learning Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold dark:text-white">{userStats.streakDays}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Days in a row</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Timeline */}
            <ActivityTimeline></ActivityTimeline>
            
            {/* Recent Documents */}
            {/* Recent Documents */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDocuments.length > 0 ? (
                <div className="space-y-4">
                  {recentDocuments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {/* Document icon based on type */}
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          {doc.type === 'pdf' ? (
                            <svg className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          ) : doc.type === 'powerpoint' ? (
                            <svg className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          ) : doc.type === 'word' ? (
                            <svg className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      {/* Document info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(doc.uploadDate).toLocaleDateString()} • {formatFileSize(doc.size)}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="ml-4 flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs flex items-center"
                          onClick={() => handleQuickQuiz(doc.id)}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Quiz
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentDocument(doc.id)}>
                          <span className="sr-only">Open</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                  <Button variant="outline" className="mt-2">Upload Your First Document</Button>
                </div>
              )}
            </CardContent>
          </Card>
            
            {/* Stats Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Current Progress</span>
                      <span className="font-medium dark:text-white">
                        {(userStats.quizzesCompleted / Math.max(10, userStats.documentsUploaded * 2) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (userStats.quizzesCompleted / Math.max(10, userStats.documentsUploaded * 2) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Study Sessions */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 dark:text-white">Study Sessions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">This Week:</span>
                        <span className="text-xs font-medium dark:text-white">
                          {calculateRecentSessions('week')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">This Month:</span>
                        <span className="text-xs font-medium dark:text-white">
                          {calculateRecentSessions('month')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Helper function to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

// Helper function to calculate recent sessions based on user progress
const calculateRecentSessions = (timeframe: 'week' | 'month'): number => {
  const progress = getUserProgress();
  if (!progress || !progress.dailyActivity) return 0;
  
  const now = new Date();
  const startDate = new Date(now);
  
  if (timeframe === 'week') {
    // Get start of this week (Sunday)
    const day = now.getDay();
    startDate.setDate(now.getDate() - day);
  } else {
    // Get start of this month
    startDate.setDate(1);
  }
  
  // Format date as YYYY-MM-DD
  const startDateStr = startDate.toISOString().split('T')[0];
  
  // Count all quizzes in this period
  return Object.values(progress.dailyActivity)
    .filter(activity => activity.date >= startDateStr)
    .reduce((sum, activity) => sum + activity.quizzes, 0);
};

export default UserDashboard;