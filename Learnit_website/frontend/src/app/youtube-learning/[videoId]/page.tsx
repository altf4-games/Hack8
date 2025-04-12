'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, FileText, Loader2, Book } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

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

const VideoDetailsPage = () => {
  const params = useParams();
  const videoId = params.videoId as string;
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [notes, setNotes] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  useEffect(() => {
    const loadVideoDetails = async () => {
      try {
        const response = await fetch('/api/youtube/video-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });
        
        if (!response.ok) throw new Error('Failed to load video details');
        
        const data = await response.json();
        setVideo({
          ...data,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&widgetid=1&autoplay=1&rel=0`
        });

        // Load saved notes
        const savedNotes = localStorage.getItem('youtube_notes');
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes);
          setNotes(parsedNotes[videoId] || '');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load video details');
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      loadVideoDetails();
    }
  }, [videoId]);

  const handleAskQuestion = async () => {
    if (!question.trim() || !video) return;
    
    setIsAskingQuestion(true);
    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: video.transcript,
          title: video.title
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

  const handleSaveNotes = () => {
    if (!video?.videoId) return;
    
    try {
      const savedNotes = JSON.parse(localStorage.getItem('youtube_notes') || '{}');
      const updatedNotes = { ...savedNotes, [video.videoId]: notes };
      localStorage.setItem('youtube_notes', JSON.stringify(updatedNotes));
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Notes saving error:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleGenerateQuiz = () => {
    if (!video) return;
    
    try {
      localStorage.setItem('current_video_transcript', JSON.stringify({
        transcript: video.transcript,
        title: video.title,
        videoId: video.videoId
      }));
      window.location.href = `/youtube-learning/quiz?videoId=${video.videoId}`;
    } catch (error) {
      console.error('Quiz preparation error:', error);
      toast.error('Failed to prepare quiz. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Failed to load video details</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Video Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {video.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {video.channelTitle}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                src={video.embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video">Transcript</TabsTrigger>
                <TabsTrigger value="ask">Ask AI</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="video">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                      {video.transcript.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-2 text-sm">{line}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ask">
                <Card>
                  <CardHeader>
                    <CardTitle>Ask About The Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Ask a question about the video..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={handleAskQuestion}
                        disabled={isAskingQuestion}
                        className="w-full"
                      >
                        {isAskingQuestion ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <MessageSquare className="h-4 w-4 mr-2" />
                        )}
                        Get Answer
                      </Button>

                      {answer && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md mt-4">
                          <h4 className="font-medium mb-2 text-purple-600 dark:text-purple-400">
                            Answer:
                          </h4>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                            {answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-purple-500" />
                      Study Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                      <Button onClick={handleSaveNotes} className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Save Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {video.summary}
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button onClick={handleGenerateQuiz} className="w-full bg-purple-600 hover:bg-purple-700">
                <Book className="h-4 w-4 mr-2" />
                Generate Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsPage;