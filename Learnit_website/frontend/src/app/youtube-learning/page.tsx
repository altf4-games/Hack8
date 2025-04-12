'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Search, Youtube, BookOpen, Brain, MessageSquare, FileText, Loader2, Clock, Eye, Book, Plus, X, Edit, Check } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { auth } from '@/lib/firebaseConfig';
import { toast } from 'sonner';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Types
interface VideoSearchResult {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface VideoDetails {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  transcript: string;
  summary: string;
  embedUrl?: string;
}

interface StudyNotes {
  [key: string]: string;
}

interface RecommendedVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount: string;
  publishedAt: string;
  duration: string;
}

interface Category {
  id: string;
  name: string;
  videos: RecommendedVideo[];
  isCustom?: boolean;
}

// Custom hooks
const useStudyTimer = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [studyTime, setStudyTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(prev => !prev);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setStudyTime(0);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { isTimerRunning, studyTime, toggleTimer, resetTimer, formatTime };
};

const YouTubeLearningPage = () => {
  const { isTimerRunning, studyTime, toggleTimer, resetTimer, formatTime } = useStudyTimer();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoDetails | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<StudyNotes>({});
  const [focusMode, setFocusMode] = useState(false);

  // Categories and recommendations
  const [selectedCategory, setSelectedCategory] = useState('tech');
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'tech',
      name: 'Technology',
      videos: [
        {
          id: 'rfscVS0vtbw',
          title: 'Learn Python - Full Course for Beginners',
          channelTitle: 'freeCodeCamp.org',
          thumbnailUrl: 'https://i.ytimg.com/vi/rfscVS0vtbw/mqdefault.jpg',
          viewCount: '38M',
          publishedAt: '4 years ago',
          duration: '4:26:52'
        },
        {
          id: 'PkZNo7MFNFg',
          title: 'Learn JavaScript - Full Course for Beginners',
          channelTitle: 'freeCodeCamp.org',
          thumbnailUrl: 'https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg',
          viewCount: '14M',
          publishedAt: '3 years ago',
          duration: '3:26:42'
        },
        {
          id: 'SWYqp7iY_Tc',
          title: 'Git & GitHub Crash Course For Beginners',
          channelTitle: 'Traversy Media',
          thumbnailUrl: 'https://i.ytimg.com/vi/SWYqp7iY_Tc/mqdefault.jpg',
          viewCount: '2.8M',
          publishedAt: '5 years ago',
          duration: '32:41'
        },
        {
          id: 'HXV3zeQKqGY',
          title: 'SQL Tutorial - Full Database Course for Beginners',
          channelTitle: 'freeCodeCamp.org',
          thumbnailUrl: 'https://i.ytimg.com/vi/HXV3zeQKqGY/mqdefault.jpg',
          viewCount: '7.8M',
          publishedAt: '3 years ago',
          duration: '4:20:37'
        }
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      videos: [
        {
          id: 'Pgb2ZNUp0QI',
          title: 'Financial Wisdom Everyone Should Know',
          channelTitle: 'Ali Abdaal',
          thumbnailUrl: 'https://i.ytimg.com/vi/Pgb2ZNUp0QI/mqdefault.jpg',
          viewCount: '943K',
          publishedAt: '2 years ago',
          duration: '11:02'
        },
        {
          id: 'PHe0bXAIuk0',
          title: 'How The Economic Machine Works by Ray Dalio',
          channelTitle: 'Principles by Ray Dalio',
          thumbnailUrl: 'https://i.ytimg.com/vi/PHe0bXAIuk0/mqdefault.jpg',
          viewCount: '22M',
          publishedAt: '8 years ago',
          duration: '31:00'
        },
        {
          id: 'KmOyhyAJM8c',
          title: 'The Ultimate Guide to Personal Finance',
          channelTitle: 'Thomas Frank',
          thumbnailUrl: 'https://i.ytimg.com/vi/KmOyhyAJM8c/mqdefault.jpg',
          viewCount: '1.2M',
          publishedAt: '3 years ago',
          duration: '23:46'
        },
        {
          id: 'svbhI_disXE',
          title: 'Investing For Beginners | The Complete Guide',
          channelTitle: 'Nate O\'Brien',
          thumbnailUrl: 'https://i.ytimg.com/vi/svbhI_disXE/mqdefault.jpg',
          viewCount: '2.4M',
          publishedAt: '2 years ago',
          duration: '28:19'
        }
      ]
    },
    {
      id: 'math',
      name: 'Mathematics',
      videos: [
        {
          id: 'pTnEG_WGd2Q',
          title: 'Math isn\'t hard, it\'s a language',
          channelTitle: '3Blue1Brown',
          thumbnailUrl: 'https://i.ytimg.com/vi/pTnEG_WGd2Q/mqdefault.jpg',
          viewCount: '1.7M',
          publishedAt: '2 years ago',
          duration: '20:12'
        },
        {
          id: 'fNk_zzaMoSs',
          title: 'Vectors - Basic Introduction',
          channelTitle: 'The Organic Chemistry Tutor',
          thumbnailUrl: 'https://i.ytimg.com/vi/fNk_zzaMoSs/mqdefault.jpg',
          viewCount: '4.2M',
          publishedAt: '4 years ago',
          duration: '1:11:32'
        },
        {
          id: 'WUvTyaaNkzM',
          title: 'The essence of calculus',
          channelTitle: '3Blue1Brown',
          thumbnailUrl: 'https://i.ytimg.com/vi/WUvTyaaNkzM/mqdefault.jpg',
          viewCount: '6.3M',
          publishedAt: '6 years ago',
          duration: '20:46'
        },
        {
          id: 'rHLEWRxRGiM',
          title: 'Statistics with Professor B: How to Study Statistics',
          channelTitle: 'Professor B',
          thumbnailUrl: 'https://i.ytimg.com/vi/rHLEWRxRGiM/mqdefault.jpg',
          viewCount: '823K',
          publishedAt: '7 years ago',
          duration: '18:02'
        }
      ]
    }
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isEditingCategories, setIsEditingCategories] = useState(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast.error("Please log in to access this feature");
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load saved notes
  useEffect(() => {
    if (!selectedVideo?.videoId) return;
    
    try {
      const savedNotesData = localStorage.getItem('youtube_notes');
      if (savedNotesData) {
        const parsedNotes = JSON.parse(savedNotesData);
        setSavedNotes(parsedNotes);
        setNotes(parsedNotes[selectedVideo.videoId] || '');
      }
    } catch (error) {
      console.error('Error loading saved notes:', error);
      toast.error('Failed to load saved notes');
    }
  }, [selectedVideo?.videoId]);

  // Load categories from localStorage
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('youtube_learning_categories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error('Error loading saved categories:', error);
    }
  }, []);

  // Save categories to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('youtube_learning_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }, [categories]);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Instant video loading
  const loadVideoInstantly = (videoId: string) => {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&widgetid=1&autoplay=1&rel=0`;
    
    setSelectedVideo({
      videoId,
      title: "Loading...",
      channelTitle: "Loading...",
      description: "",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      transcript: "",
      summary: "Generating summary...",
      embedUrl
    });
    
    setSearchResults([]);
    setActiveTab('video');
    
    // Load full details in background
    loadFullDetails(videoId);
  };

  // Load full video details in background
  const loadFullDetails = async (videoId: string) => {
    try {
      const response = await fetch('/api/youtube/video-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
        credentials: 'same-origin'
      });
      
      if (!response.ok) throw new Error('Failed to load video details');
      
      const data = await response.json();
      
      setSelectedVideo(prev => ({
        ...data,
        embedUrl: prev?.embedUrl || `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&widgetid=1&autoplay=1&rel=0`,
        summary: "Generating summary..."
      }));
      
      // Generate summary in background
      generateSummary(data.transcript, data.title);
    } catch (error) {
      console.error('Video loading error:', error);
      toast.error('Failed to load video details');
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setErrorMessage('');
    
    try {
      const videoId = extractVideoId(searchQuery);
      
      if (videoId) {
        // Load video instantly if ID is found
        loadVideoInstantly(videoId);
        setIsSearching(false);
      } else {
        const response = await fetch('/api/youtube/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setSearchResults(data.videos || []);
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('Failed to search videos. Please try again.');
      setIsSearching(false);
    }
  };

  // Handle video selection from search results or recommendations
  const handleVideoSelect = (video: VideoSearchResult | RecommendedVideo) => {
    loadVideoInstantly(video.id);
  };

  // Generate summary
  const generateSummary = async (transcript: string, title: string) => {
    setSummaryLoading(true);
    
    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, type: 'youtube', title }),
      });
      
      if (!response.ok) throw new Error('Summary generation failed');
      
      const data = await response.json();
      
      setSelectedVideo(prev => prev ? {
        ...prev,
        summary: data.summary || "Couldn't generate summary. Please try again."
      } : null);
    } catch (error) {
      console.error('Summary error:', error);
      setSelectedVideo(prev => prev ? {
        ...prev,
        summary: "Couldn't generate summary. Please try again."
      } : null);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Ask question
  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedVideo) return;
    
    setIsAskingQuestion(true);
    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: selectedVideo.transcript,
          title: selectedVideo.title
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get answer');
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Question error:', error);
      toast.error('Failed to get an answer. Please try again.');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  // Save notes
  const handleSaveNotes = () => {
    if (!selectedVideo?.videoId) return;
    
    try {
      const updatedNotes = { ...savedNotes, [selectedVideo.videoId]: notes };
      localStorage.setItem('youtube_notes', JSON.stringify(updatedNotes));
      setSavedNotes(updatedNotes);
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Notes saving error:', error);
      toast.error('Failed to save notes');
    }
  };

  // Generate quiz
  const handleGenerateQuiz = () => {
    if (!selectedVideo) return;
    
    try {
      localStorage.setItem('current_video_transcript', JSON.stringify({
        transcript: selectedVideo.transcript,
        title: selectedVideo.title,
        videoId: selectedVideo.videoId
      }));
      router.push(`/youtube-learning/quiz?videoId=${selectedVideo.videoId}`);
    } catch (error) {
      console.error('Quiz preparation error:', error);
      toast.error('Failed to prepare quiz. Please try again.');
    }
  };

  // Export transcript
  const handleExportTranscript = () => {
    if (!selectedVideo) return;
    
    try {
      const blob = new Blob([selectedVideo.transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedVideo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Transcript downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transcript');
    }
  };

  // Handle category creation
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      videos: [],
      isCustom: true
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setIsAddingCategory(false);
    setSelectedCategory(newCategory.id);
    
    toast.success(`Category "${newCategoryName}" created`);
  };

  // Handle category deletion
  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    
    if (selectedCategory === categoryId) {
      setSelectedCategory(updatedCategories[0]?.id || 'tech');
    }
    
    toast.success('Category deleted');
  };

  // Handle adding a selected video to a category
  const handleAddVideoToCategory = (video: VideoSearchResult | VideoDetails, categoryId: string) => {
    const newVideo: RecommendedVideo = {
      id: 'videoId' in video ? video.videoId : video.id,
      title: video.title,
      channelTitle: video.channelTitle,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: 'New',
      publishedAt: new Date().toLocaleDateString(),
      duration: '00:00'
    };
    
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          videos: [newVideo, ...cat.videos]
        };
      }
      return cat;
    }));
    
    toast.success(`Added to ${categories.find(c => c.id === categoryId)?.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            YouTube Learning Hub
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Transform YouTube videos into interactive learning experiences
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube URL or search query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>
        </div>

        {/* Video Categories and Recommendations */}
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Youtube className="h-5 w-5 mr-2 text-red-600" />
              Recommended Learning Videos
            </h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingCategories(!isEditingCategories)}
                className="text-gray-600 dark:text-gray-300"
              >
                {isEditingCategories ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Done
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
              {!isEditingCategories && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingCategory(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto p-2 gap-2 hide-scrollbar">
              {categories.map((category) => (
                <div key={category.id} className="relative">
                  <Button
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                    {isEditingCategories && category.isCustom && (
                      <X
                        className="h-3.5 w-3.5 ml-1 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                      />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.find(c => c.id === selectedCategory)?.videos.slice(0, 16).map((video) => (
                <Card 
                  key={video.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => router.push(`/youtube-learning/${video.id}`)}
                >
                  <div className="relative">
                    <div className="relative h-36 w-full">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-t-md"
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {video.channelTitle}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{video.viewCount} views</span>
                        <span className="mx-1">•</span>
                        <span>{video.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {categories.find(c => c.id === selectedCategory)?.videos.length === 0 && (
                <div className="col-span-full p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Youtube className="h-10 w-10 text-gray-400" />
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">No videos in this category yet</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Search for videos and add them to this category
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((video) => (
                <Card 
                  key={video.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/youtube-learning/${video.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="relative h-40 w-full mb-2">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {video.channelTitle}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your learning videos
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="mb-4"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YouTubeLearningPage;