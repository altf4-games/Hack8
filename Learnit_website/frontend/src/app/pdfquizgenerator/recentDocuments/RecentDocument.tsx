'use client'
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, FileText, Book, File, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getRecentDocuments,
  UploadedDocument,
  setCurrentDocument,
  addDocument,
  recordQuizGeneration
} from '@/app/services/documentStorage';
import { auth } from '@/lib/firebaseConfig';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Analytics } from "@vercel/analytics/react";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pdftoflashcard.onrender.com/api';
const STORAGE_KEYS = {
  SAVED_QUESTIONS: 'quizitt_saved_questions_'
};

interface DocumentHistorySidebarProps {
  onSelectDocument: (documentId: string) => void;
  currentDocumentId?: string;
  navbarHeight?: number;
  handleUploadedFiles?: (files: FileList) => Promise<void>;
  isLoggedIn?: boolean;
  documentUpdateTrigger?: number; // New prop to trigger refreshes
  onLoadSavedQuestions?: (documentId: string, savedQuestions: any) => void; // Add this prop
}

const SUPPORTED_FILE_TYPES = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.csv'];

const DocumentHistorySidebar: React.FC<DocumentHistorySidebarProps> = ({ 
  onSelectDocument,
  currentDocumentId,
  navbarHeight = 64,
  handleUploadedFiles,
  isLoggedIn = false,
  documentUpdateTrigger = 0, // Default value
  onLoadSavedQuestions // Add this prop
}) => {
  const router = useRouter();
  const [recentDocuments, setRecentDocuments] = useState<UploadedDocument[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Helper function to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    switch(type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case 'powerpoint':
        return <Book className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'word':
        return <File className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      default:
        return <File className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Function to fetch recent documents
  const fetchRecentDocuments = () => {
    try {
      const recentDocs = getRecentDocuments(10); 
      setRecentDocuments(recentDocs);
    } catch (error) {
      console.error("Error fetching document history:", error);
      setRecentDocuments([]);
    }
  };

  // Fetch recent documents on mount and when documentUpdateTrigger changes
  useEffect(() => {
    fetchRecentDocuments();
  }, [documentUpdateTrigger]); // Re-fetch when this prop changes

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    
    // Fetch latest documents when sidebar is opened
    if (!isExpanded) {
      fetchRecentDocuments();
    }
  };

  const handleDocumentSelect = async (docId: string) => {
    try {
      // Set the current document in the storage service
      setCurrentDocument(docId);
      
      // Get the current user ID
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Fetch saved questions from MongoDB
      const apiUrl = `${API_BASE_URL}/saved-questions/${userId}/${docId}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const savedQuestions = await response.json();
        console.log('Fetched saved questions:', savedQuestions);
        
        // Store the saved questions in localStorage for persistence
        const savedKey = `${STORAGE_KEYS.SAVED_QUESTIONS}${docId}`;
        localStorage.setItem(savedKey, JSON.stringify(savedQuestions));

        // Find document details in recent documents
        const docDetails = recentDocuments.find(doc => doc.id === docId);
        
        if (docDetails && onLoadSavedQuestions) {
          // If we have the callback to load questions, use it
          onLoadSavedQuestions(docId, savedQuestions);
        } else {
          // Otherwise, just navigate to the quiz page
          router.push(`/quizPage?docId=${docId}`);
        }
      } else {
        console.log('No saved questions found for this document');
        
        // Still notify parent component
        onSelectDocument(docId);
      }
      
      // Close the sidebar after selection on mobile only
      if (isMobile) {
        setIsExpanded(false);
      }
    } catch (error) {
      console.error('Error fetching saved questions:', error);
      // Still notify parent component
      onSelectDocument(docId);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAuthRequiredAction = () => {
    if (!isLoggedIn) {
      toast.info("Just one more step to create your quiz!", {
        description: "Please log in to continue processing your document"
      });
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (!handleAuthRequiredAction()) return;
      
      try {
        // If handleUploadedFiles is provided as a prop, use that
        if (handleUploadedFiles) {
          await handleUploadedFiles(e.target.files);
        } else {
          // Default basic implementation
          Array.from(e.target.files).forEach(file => {
            addDocument(file, "Uploaded from sidebar");
          });
        }
        
        // Update recent documents immediately after upload
        fetchRecentDocuments();
        
        toast.success("Files uploaded successfully!", {
          description: "Click on a file to generate quiz questions"
        });
      } catch (error) {
        console.error("Error processing files:", error);
        toast.error("Failed to process files. Please try again.");
      }
    }
  };

  return (
    <div className="absolute" style={{ width: 0, height: 0, overflow: 'visible' }}>
      <Analytics />
      {/* Hidden file input */}
      <input 
        type="file" 
        accept={SUPPORTED_FILE_TYPES.join(',')} 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple
      />

      {/* Floating toggle button - positioned fixed so it doesn't affect layout */}
      <div className="fixed top-20 left-0 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar}
          className="bg-white dark:bg-gray-800 rounded-r-md shadow-md p-2 mb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
        >
          <FileText className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          <span className="sr-only">{isExpanded ? 'Hide Documents' : 'Show Documents'}</span>
        </Button>
      </div>

      {/* Only render the sidebar content when expanded */}
      {isExpanded && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
          )}
          
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 400,
              mass: 0.5,
              duration: 0.2
            }}
            className={`fixed z-50 bg-white dark:bg-gray-900 shadow-xl flex flex-col ${
              isMobile 
                ? 'inset-y-0 left-0 w-4/5 max-w-sm rounded-r-lg' 
                : 'top-20 bottom-4 left-0 w-72 rounded-r-lg'
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Recent Files
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className="rounded-full w-8 h-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            {/* Document List */}
            <div className="flex-1 overflow-y-auto" style={{ height: "auto" }}>
              {recentDocuments.length > 0 ? (
                <div className="py-2">
                  {recentDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => handleDocumentSelect(doc.id)}
                      className={`${
                        currentDocumentId === doc.id 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                      } cursor-pointer transition-all duration-200 px-4 py-3 mb-1 group`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className={`w-10 h-10 rounded-lg ${
                            currentDocumentId === doc.id 
                              ? 'bg-purple-200 dark:bg-purple-800/60' 
                              : 'bg-purple-100 dark:bg-purple-900/40'
                          } flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                            {getDocumentIcon(doc.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                            <span className="inline-block mr-2">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                              {formatFileSize(doc.size)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400 px-4 text-center">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No documents available</p>
                </div>
              )}
            </div>
            
            {/* Upload new button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 hover:shadow-md"
                onClick={handleUploadClick}
              >
                Upload New
              </Button>
              {/* Refresh button - Added for manual refresh capability */}
              <Button 
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                onClick={fetchRecentDocuments}
              >
                Refresh Document List
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default DocumentHistorySidebar;