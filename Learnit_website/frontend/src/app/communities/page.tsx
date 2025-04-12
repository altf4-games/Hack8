"use client";

import { FC, useState, useEffect } from "react";
import { Users, Upload, Search, Bookmark, BookOpen, ThumbsUp, MessageSquare, Filter, Clock, TrendingUp, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCallback, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadFormData {
  title: string;
  university: string;
  course: string;
  professor: string;
  semester: string;
  tags: string;
  description: string;
  files: FileWithPreview[];
}

const CollegeNotesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [uploadMode, setUploadMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login state
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    university: "",
    course: "",
    professor: "",
    semester: "",
    tags: "",
    description: "",
    files: []
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Mock data for universities and majors
  const universities = [
    "Harvard University", "MIT", "Stanford University", "UC Berkeley", "Yale University",
    "Princeton University", "Columbia University", "Oxford University", "Cambridge University", "CalTech"
  ];
  
  const majors = [
    "Computer Science", "Engineering", "Business", "Medicine", "Law", 
    "Psychology", "Biology", "Physics", "Economics", "Mathematics"
  ];
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files) return;
    
    const uploadedFiles = Array.from(e.target.files).map(file => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
    });
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...uploadedFiles]
    }));
  };
  
  const removeFile = (index: number) => {
    setFormData(prev => {
      const newFiles = [...prev.files];
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview as string);
      }
      newFiles.splice(index, 1);
      return {
        ...prev,
        files: newFiles
      };
    });
  };

  // Mock notes data
  const mockNotes = [
    {
      id: 1,
      title: "Data Structures and Algorithms Complete Course Notes",
      university: "MIT",
      course: "Computer Science",
      professor: "Dr. Sarah Chen",
      semester: "Fall 2024",
      author: "csStudent42",
      authorAvatar: "/api/placeholder/30/30",
      date: "2 days ago",
      likes: 328,
      comments: 54,
      bookmarks: 216,
      tags: ["CS", "Data Structures", "Algorithms"],
      description: "Comprehensive notes covering all topics from MIT's renowned Data Structures course including Big O, trees, graphs, and dynamic programming."
    },
    {
      id: 2,
      title: "Organic Chemistry II - Full Semester Notes with Diagrams",
      university: "Harvard University",
      course: "Chemistry",
      professor: "Dr. Robert Williams",
      semester: "Spring 2024",
      author: "chemguru",
      authorAvatar: "/api/placeholder/30/30",
      date: "5 hours ago",
      likes: 187,
      comments: 41,
      bookmarks: 142,
      tags: ["Chemistry", "Organic Chemistry", "Pre-Med"],
      description: "Detailed notes with hand-drawn reaction mechanisms and explanations for all organic chemistry concepts covered in Harvard's CHEM 201."
    },
    {
      id: 3,
      title: "Introduction to Microeconomics - Lecture Notes Bundle",
      university: "Stanford University",
      course: "Economics",
      professor: "Dr. Michael Porter",
      semester: "Winter 2024",
      author: "econWhiz",
      authorAvatar: "/api/placeholder/30/30",
      date: "1 week ago",
      likes: 215,
      comments: 37,
      bookmarks: 173,
      tags: ["Economics", "Microeconomics", "Business"],
      description: "Complete set of lecture notes for Stanford's introductory microeconomics course covering supply/demand, market structures, and game theory."
    },
    {
      id: 4,
      title: "Calculus III - Vector Calculus Made Simple",
      university: "Princeton University",
      course: "Mathematics",
      professor: "Dr. Lisa Zhang",
      semester: "Fall 2024",
      author: "mathMaster",
      authorAvatar: "/api/placeholder/30/30",
      date: "3 days ago",
      likes: 164,
      comments: 35,
      bookmarks: 91,
      tags: ["Mathematics", "Calculus", "Vector Calculus"],
      description: "Simplified notes on vector calculus, multiple integrals, and vector fields with step-by-step examples and visualizations."
    },
    {
      id: 5,
      title: "Constitutional Law - Supreme Court Cases Analysis",
      university: "Yale University",
      course: "Law",
      professor: "Dr. James Wilson",
      semester: "Spring 2024",
      author: "lawStudent",
      authorAvatar: "/api/placeholder/30/30",
      date: "1 day ago",
      likes: 142,
      comments: 29,
      bookmarks: 78,
      tags: ["Law", "Constitutional Law", "Legal Studies"],
      description: "Detailed case briefs and analysis of landmark Supreme Court decisions covered in Yale Law's Constitutional Law course."
    },
    {
      id: 6,
      title: "Introduction to Neural Networks and Deep Learning",
      university: "UC Berkeley",
      course: "Computer Science",
      professor: "Dr. Andrew Ng",
      semester: "Winter 2024",
      author: "aiResearcher",
      authorAvatar: "/api/placeholder/30/30",
      date: "2 weeks ago",
      likes: 287,
      comments: 52,
      bookmarks: 193,
      tags: ["CS", "AI", "Machine Learning", "Neural Networks"],
      description: "Comprehensive notes on neural network architectures, backpropagation, CNNs, RNNs, and transformer models from Berkeley's AI course."
    },
    {
      id: 7,
      title: "Human Anatomy and Physiology - Full Course Notes",
      university: "Columbia University",
      course: "Medicine",
      professor: "Dr. Elena Rodriguez",
      semester: "Fall 2023",
      author: "medStudent",
      authorAvatar: "/api/placeholder/30/30",
      date: "4 days ago",
      likes: 178,
      comments: 36,
      bookmarks: 84,
      tags: ["Medicine", "Anatomy", "Physiology", "Pre-Med"],
      description: "Detailed anatomy and physiology notes with labeled diagrams covering all major body systems from Columbia's medical program."
    },
    {
      id: 8,
      title: "Quantum Mechanics - Complete Course Notes",
      university: "CalTech",
      course: "Physics",
      professor: "Dr. Richard Feynman",
      semester: "Spring 2024",
      author: "quantumWizard",
      authorAvatar: "/api/placeholder/30/30",
      date: "1 week ago",
      likes: 132,
      comments: 27,
      bookmarks: 64,
      tags: ["Physics", "Quantum Mechanics", "Advanced Physics"],
      description: "In-depth notes on quantum mechanical principles, Schrödinger's equation, quantum operators, and quantum computing fundamentals."
    },
    {
      id: 9,
      title: "Modern Web Development with React and Node.js",
      university: "MIT",
      course: "Computer Science",
      professor: "Dr. Thomas Johnson",
      semester: "Winter 2024",
      author: "webDev",
      authorAvatar: "/api/placeholder/30/30",
      date: "3 days ago",
      likes: 198,
      comments: 43,
      bookmarks: 112,
      tags: ["CS", "Web Development", "React", "Node.js"],
      description: "Comprehensive notes from MIT's web development course covering frontend React components, backend Node.js architecture, and RESTful API design."
    },
    {
      id: 10,
      title: "Behavioral Psychology - Research Methods and Theories",
      university: "Oxford University",
      course: "Psychology",
      professor: "Dr. Emma Thompson",
      semester: "Fall 2023",
      author: "psychResearcher",
      authorAvatar: "/api/placeholder/30/30",
      date: "6 days ago",
      likes: 224,
      comments: 47,
      bookmarks: 136,
      tags: ["Psychology", "Behavioral Psychology", "Research Methods"],
      description: "Detailed notes on research methodologies, experimental design, and major psychological theories from Oxford's psychology department."
    }
  ];

  // Filter notes based on search query and selected university
  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch = searchQuery === "" || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesUniversity = selectedUniversity === "" || note.university === selectedUniversity;
    
    return matchesSearch && matchesUniversity;
  });

  // Placeholder cards for empty spots in grid
  const placeholderCount = Math.max(0, 5 - (filteredNotes.length % 5));
  const placeholders = placeholderCount === 5 ? [] : Array(placeholderCount).fill(null);
  
  useEffect(() => {
    return () => {
      formData.files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [formData.files]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">College Notes Hub</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover, share, and connect with students across universities. Access the best lecture notes, study guides, and academic resources.
          </p>
        </div>
        
        {!isLoggedIn ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Join Our Academic Community</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Log in to access premium notes, upload your own materials, and connect with students from top universities worldwide.
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              Log In or Sign Up
            </Button>
          </div>
        ) : (
          <>
            {/* Universities Filter Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Universities</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                <button 
                  onClick={() => setSelectedUniversity("")}
                  className={`p-2 px-4 rounded-full text-center transition-all ${
                    selectedUniversity === ""
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-sm"
                  }`}
                >
                  All Universities
                </button>
                {universities.map(university => (
                  <button 
                    key={university}
                    onClick={() => setSelectedUniversity(university)}
                    className={`p-2 px-4 rounded-full text-center transition-all ${
                      selectedUniversity === university
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-sm"
                    }`}
                  >
                    {university}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Main content area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              {/* Toggle between browse and upload */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                  <Button 
                    variant={!uploadMode ? "default" : "ghost"}
                    className={!uploadMode ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : "text-gray-700 dark:text-gray-300"}
                    onClick={() => setUploadMode(false)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Notes
                  </Button>
                  <Button 
                    variant={uploadMode ? "default" : "ghost"}
                    className={uploadMode ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : "text-gray-700 dark:text-gray-300"}
                    onClick={() => setUploadMode(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Share Notes
                  </Button>
                </div>
              </div>
              
              {uploadMode ? (
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-blue-500" />
                    Share Your Academic Notes
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <Input 
                        name="title"
                        placeholder="E.g., Organic Chemistry - Complete Lecture Notes" 
                        className="w-full p-3 bg-white dark:bg-gray-700"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        University
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select 
                          name="university"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          value={formData.university}
                          onChange={handleInputChange}
                        >
                          <option value="">Select your university...</option>
                          {universities.map(university => (
                            <option key={university} value={university}>
                              {university}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Course / Major
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <select 
                            name="course"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            value={formData.course}
                            onChange={handleInputChange}
                          >
                            <option value="">Select course/major...</option>
                            {majors.map(major => (
                              <option key={major} value={major}>
                                {major}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Semester
                        </label>
                        <Input 
                          name="semester"
                          placeholder="E.g., Fall 2024" 
                          className="w-full p-3 bg-white dark:bg-gray-700"
                          value={formData.semester}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Professor
                      </label>
                      <Input 
                        name="professor"
                        placeholder="E.g., Dr. John Smith" 
                        className="w-full p-3 bg-white dark:bg-gray-700"
                        value={formData.professor}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags (Separate with commas)
                      </label>
                      <Input 
                        name="tags"
                        placeholder="E.g., Organic Chemistry, Lab Notes, Exam Prep" 
                        className="w-full p-3 bg-white dark:bg-gray-700"
                        value={formData.tags}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea 
                        name="description"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Briefly describe what your notes cover, their format, and any special features..."
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Notes
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none px-2 py-1">
                              <span>Upload files</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                multiple
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="pl-1 pt-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, DOCX, PPT, JPG, PNG up to 50MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Preview uploaded files */}
                      {formData.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</p>
                          <div className="space-y-2">
                            {formData.files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{file.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => removeFile(index)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3"
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Share Notes with Students"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for courses, professors, topics..."
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Tabs for different content views */}
                  <Tabs defaultValue="trending" className="w-full mb-6">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="trending" className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Top Rated
                      </TabsTrigger>
                      <TabsTrigger value="recent" className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Recent
                      </TabsTrigger>
                      <TabsTrigger value="bookmarked" className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Saved
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="trending">
                      {filteredNotes.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">No notes found matching your criteria.</p>
                        </div>
                      ) : (
                        <div>
                          {/* Card Grid Layout */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {filteredNotes.map(note => (
                              <div 
                                key={note.id}
                                className="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden"
                              >
                                {/* Card Header with gradient background */}
                                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-3">
                                  <div className="flex justify-between items-start">
                                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs">
                                      {note.university}
                                    </Badge>
                                    <button className="text-gray-400 hover:text-blue-500">
                                      <Bookmark className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Card Content */}
                                <div className="p-4 flex-grow flex flex-col">
                                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-2">
                                    {note.title}
                                  </h3>
                                  
                                  <div className="mt-1 flex items-center text-xs text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">{note.course}</span>
                                    <span className="mx-1">•</span>
                                    <span>{note.semester}</span>
                                  </div>
                                  
                                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Prof. {note.professor}</span>
                                  </div>
                                  
                                  <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm line-clamp-3 flex-grow">
                                    {note.description}
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {note.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="outline" className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {note.tags.length > 2 && (
                                      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs">
                                        +{note.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Card Footer */}
                                
                              </div>
                            ))}
                            
                            {/* Placeholder cards to maintain grid */}
                            {placeholders.map((_, index) => (
                              <div 
                                key={`placeholder-${index}`}
                                className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-transparent h-full"
                              ></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="recent">
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">View the most recently added content here.</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bookmarked">
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Your bookmarked content will appear here.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
            
            {/* Community Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Community Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">18,432</div>
                  <p className="text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">42,659</div>
                  <p className="text-gray-600 dark:text-gray-400">Resources Shared</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">8,542</div>
                  <p className="text-gray-600 dark:text-gray-400">Daily Views</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">126,893</div>
                  <p className="text-gray-600 dark:text-gray-400">Downloads</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollegeNotesPage;