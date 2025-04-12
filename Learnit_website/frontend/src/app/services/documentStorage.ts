// services/documentStorage.ts

import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebaseConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pdftoflashcard.onrender.com/api';

// Storage keys for local storage
const STORAGE_KEYS = {
  DOCUMENT_STATE: 'quizitt_document_state',
  USER_PROGRESS: 'quizitt_user_progress',
  SAVED_QUESTIONS: 'quizitt_saved_questions_',
  CURRENT_QUIZ: 'quizitt_current_quiz',
  PENDING_DOCUMENT: 'pendingDocumentId'
};

export interface UploadedDocument {
  id: string;          // Unique identifier for the document
  name: string;        // Original filename
  type: string;        // Document type/format (pdf, ppt, doc, etc.)
  size: number;        // File size in bytes
  uploadDate: string;  // ISO string of upload timestamp
  contentPreview?: string; // Optional preview of content
  lastAccessed?: string;   // When document was last accessed
}

export interface DocumentsState {
  documents: UploadedDocument[];
  recentDocuments: string[];  // Array of document IDs, most recent first
  currentDocumentId?: string;  // Currently active document
}

export interface QuizGeneration {
  documentId: string;
  timestamp: string;
  timeSpentSeconds?: number;
  questionTypes: {
    flashcards: number;
    mcqs: number;
    matching: number;
    trueFalse: number;
    fillInBlanks: number;
  }
}

// New interface for activity tracking
export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  uploads: number;
  quizzes: number;
  score: number;
}

export interface UserProgress {
  userId: string;
  streakInfo: {
    currentStreak: number;
    lastUploadDate: string;
    longestStreak: number;
  };
  generations: QuizGeneration[];
  // Add daily activity tracking
  dailyActivity: {
    [date: string]: DailyActivity; // Keyed by date string YYYY-MM-DD
  };
}

export interface SavedQuestions {
  documentId: string;
  userId: string;
  flashcards: any[];
  mcqs: any[];
  matchingQuestions: any[];
  trueFalseQuestions: any[];
  fillInBlanksQuestions: any[];
  lastUpdated: string;
}

// Add this interface for quiz state
interface QuizState {
  file: {
    name: string;
    type: string;
    size: number;
    lastModified: number;
  } | null;
  flashcards: any[];
  mcqs: any[];
  matchingQuestions: any[];
  trueFalseQuestions: any[];
  fillInBlanksQuestions: any[];
}

// Storage optimization - batch pending writes
let pendingStorageWrites: Record<string, any> = {};
let storageWriteTimer: NodeJS.Timeout | null = null;

// Helper to batch localStorage writes
const batchedStorageWrite = (key: string, value: any): void => {
  pendingStorageWrites[key] = value;
  
  // Clear existing timer if there is one
  if (storageWriteTimer) {
    clearTimeout(storageWriteTimer);
  }
  
  // Set a timer to write all pending values at once
  storageWriteTimer = setTimeout(() => {
    Object.entries(pendingStorageWrites).forEach(([key, value]) => {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error);
      }
    });
    
    // Clear pending writes
    pendingStorageWrites = {};
    storageWriteTimer = null;
  }, 100); // Batch writes with 100ms delay
};

// Enhanced caching function
export const cacheApiResponse = (endpoint: string, params: any, response: any, options: any = {}) => {
  const { cacheKey = '', expiryMinutes = 60 } = options;
  const now = new Date().getTime();
  const expiry = now + (expiryMinutes * 60 * 1000);
  
  // Create a deterministic cache key with version control
  const version = '1'; // Increment when response format changes
  const key = cacheKey || `${endpoint}-${JSON.stringify(params)}-v${version}`;
  
  localStorage.setItem(`cache-${key}`, JSON.stringify({
    data: response,
    expiry,
    timestamp: now
  }));
};

// Updated function to get cached API response
export const getCachedApiResponse = (endpoint: string, params: any, options: any = {}) => {
  const { cacheKey = '' } = options;
  const version = '1'; // Must match the version in cacheApiResponse
  const key = cacheKey || `${endpoint}-${JSON.stringify(params)}-v${version}`;
  const cachedItem = localStorage.getItem(`cache-${key}`);
  
  if (!cachedItem) return null;
  
  try {
    const { data, expiry } = JSON.parse(cachedItem);
    const now = new Date().getTime();
    
    // Check if the cached response has expired
    if (now > expiry) {
      localStorage.removeItem(`cache-${key}`);
      return null;
    }
    
    return data;
  } catch (e) {
    localStorage.removeItem(`cache-${key}`);
    return null;
  }
};

// Helper to get current state from local storage
export function getDocumentState(): DocumentsState {
  const stateJson = localStorage.getItem(STORAGE_KEYS.DOCUMENT_STATE);
  if (!stateJson) {
    return { documents: [], recentDocuments: [] };
  }
  
  try {
    return JSON.parse(stateJson);
  } catch (e) {
    console.error('Error parsing document state:', e);
    return { documents: [], recentDocuments: [] };
  }
}

// Helper to save state to local storage
function saveDocumentState(state: DocumentsState): void {
  localStorage.setItem(STORAGE_KEYS.DOCUMENT_STATE, JSON.stringify(state));
}

// Add a new document with local storage support
export function addDocument(file: File, contentPreview?: string): UploadedDocument | null {
  console.log('Adding document:', file.name);

  const state = getDocumentState();
  
  // Check for duplicates
  const existingDocument = state.documents.find(doc => doc.name === file.name);
  if (existingDocument) {
    console.log('Document already exists:', file.name);
    return null;
  }
  
  const now = new Date();
  const dateString = now.toISOString();
  
  const newDocument: UploadedDocument = {
    id: uuidv4(),
    name: file.name,
    type: getFileType(file.name),
    size: file.size,
    uploadDate: dateString,
    contentPreview: contentPreview,
    lastAccessed: dateString
  };
  
  // Update state
  state.documents.push(newDocument);
  state.recentDocuments = [newDocument.id, 
    ...state.recentDocuments.filter(id => id !== newDocument.id)
  ].slice(0, 10);
  state.currentDocumentId = newDocument.id;
  
  // Save to local storage
  saveDocumentState(state);
  
  // Track activity
  recordDailyActivity('upload', null);
  
  // Store pending document ID in session storage
  sessionStorage.setItem(STORAGE_KEYS.PENDING_DOCUMENT, newDocument.id);
  
  return newDocument;
}

// Get saved questions from local storage
export function getSavedQuestionsForDocument(documentId: string): SavedQuestions | null {
  try {
    const savedKey = `${STORAGE_KEYS.SAVED_QUESTIONS}${documentId}`;
    const savedData = localStorage.getItem(savedKey);
    
    if (!savedData) return null;
    
    return JSON.parse(savedData);
  } catch (error) {
    console.error("Error retrieving saved questions:", error);
    return null;
  }
}

// Save questions to local storage
export async function saveQuestionsForDocument(
  documentId: string, 
  questions: {
    flashcards: any[];
    mcqs: any[];
    matchingQuestions: any[];
    trueFalseQuestions: any[];
    fillInBlanksQuestions: any[];
  }
): Promise<boolean> {
  try {
    const userId = auth.currentUser?.uid || 'anonymous';
    console.log('Saving questions for document:', documentId);
    console.log('User ID:', userId);
    
    // Save to localStorage
    const savedKey = `${STORAGE_KEYS.SAVED_QUESTIONS}${documentId}`;
    const savedData: SavedQuestions = {
      documentId,
      userId,
      ...questions,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(savedKey, JSON.stringify(savedData));
    
    // Save to MongoDB via direct API call
    const apiUrl = `${API_BASE_URL}/saved-questions/${userId}/${documentId}`;
    console.log('Making API request to:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentId,
          flashcards: (questions.flashcards || []).map((card, index) => ({
            question: card.question || card.front || '',
            answer: card.answer || card.back || '',
            metadata: { ...card.metadata, originalIndex: index }
          })).filter(card => card.question && card.answer),
          mcqs: (questions.mcqs || []).map((mcq, index) => {
            if (!mcq.correctAnswer || !mcq.options?.length) {
              console.warn(`MCQ at index ${index} is missing required fields, skipping...`);
              return null;
            }
            return {
              question: mcq.question || '',
              options: mcq.options,
              correctAnswer: mcq.correctAnswer,
              metadata: { ...mcq.metadata, originalIndex: index }
            };
          }).filter(Boolean),
          matchingQuestions: (questions.matchingQuestions || []).map((match, index) => ({
            pairs: (match.pairs || match.leftItems?.map((left: string, i: number) => ({
              left: left || '',
              right: match.rightItems?.[i] || ''
            })) || []).filter((pair: { left: string; right: string }) => pair.left && pair.right),
            metadata: { ...match.metadata, originalIndex: index }
          })).filter(match => match.pairs.length > 0),
          trueFalseQuestions: (questions.trueFalseQuestions || []).map((tf, index) => ({
            statement: tf.statement || tf.question || '',
            isTrue: tf.isTrue || false,
            explanation: tf.explanation || '',
            metadata: { ...tf.metadata, originalIndex: index }
          })).filter(tf => tf.statement),
          fillInBlanksQuestions: (questions.fillInBlanksQuestions || []).map((fib, index) => ({
            text: fib.text || fib.question || '',
            blanks: fib.blanks || fib.answers || [],
            metadata: { ...fib.metadata, originalIndex: index }
          })).filter(fib => fib.text && fib.blanks.length > 0)
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', errorText);
        // Try to parse the error message for better debugging
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`Failed to save to MongoDB: ${errorJson.message || errorText}`);
        } catch (e) {
          throw new Error(`Failed to save to MongoDB: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('Successfully saved to MongoDB:', result);
      return true;
    } catch (apiError) {
      console.error("Error saving to API:", apiError);
      // Still return true if localStorage save was successful
      return true;
    }
  } catch (error) {
    console.error("Error saving questions:", error);
    return false;
  }
}

// Get current document from local storage
export function getCurrentDocument(): UploadedDocument | null {
  const state = getDocumentState();
  
  if (!state.currentDocumentId) return null;
  
  const currentDoc = state.documents.find(doc => doc.id === state.currentDocumentId);
  return currentDoc || null;
}

// Set current document in local storage
export function setCurrentDocument(documentId: string): void {
  const state = getDocumentState();
  
  if (!state.documents.some(doc => doc.id === documentId)) return;
  
  state.currentDocumentId = documentId;
  
  const docIndex = state.documents.findIndex(doc => doc.id === documentId);
  if (docIndex >= 0) {
    state.documents[docIndex].lastAccessed = new Date().toISOString();
  }
  
  state.recentDocuments = [documentId, 
    ...state.recentDocuments.filter(id => id !== documentId)
  ].slice(0, 10);
  
  saveDocumentState(state);
}

// Get recent documents from local storage
export function getRecentDocuments(limit = 5): UploadedDocument[] {
  const state = getDocumentState();
  
  return state.recentDocuments
    .slice(0, limit)
    .map(id => state.documents.find(doc => doc.id === id))
    .filter((doc): doc is UploadedDocument => !!doc);
}

// Update the saveQuizState function
export function saveQuizState(state: {
  file: File | null;
  flashcards: any[];
  mcqs: any[];
  matchingQuestions: any[];
  trueFalseQuestions: any[];
  fillInBlanksQuestions: any[];
}): void {
  try {
    // Convert File object to a serializable format
    const serializedState: QuizState = {
      file: state.file ? {
        name: state.file.name,
        type: state.file.type,
        size: state.file.size,
        lastModified: state.file.lastModified
      } : null,
      flashcards: state.flashcards,
      mcqs: state.mcqs,
      matchingQuestions: state.matchingQuestions,
      trueFalseQuestions: state.trueFalseQuestions,
      fillInBlanksQuestions: state.fillInBlanksQuestions
    };

    // Use batched write instead of direct localStorage
    batchedStorageWrite(STORAGE_KEYS.CURRENT_QUIZ, JSON.stringify({
      timestamp: Date.now(),
      data: serializedState
    }));
  } catch (error) {
    console.error('Error saving quiz state:', error);
  }
}

// Update the getSavedQuizState function
export function getSavedQuizState(): {
  file: File | null;
  flashcards: any[];
  mcqs: any[];
  matchingQuestions: any[];
  trueFalseQuestions: any[];
  fillInBlanksQuestions: any[];
} | null {
  try {
    const savedQuiz = localStorage.getItem(STORAGE_KEYS.CURRENT_QUIZ);
    if (!savedQuiz) return null;
    
    const parsedQuiz = JSON.parse(savedQuiz);
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    
    if (Date.now() - parsedQuiz.timestamp > MAX_AGE) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_QUIZ);
      return null;
    }

    const quizData: QuizState = parsedQuiz.data;
    
    // Convert serialized file back to File object if it exists
    const file = quizData.file ? new File([], quizData.file.name, {
      type: quizData.file.type,
      lastModified: quizData.file.lastModified
    }) : null;
    
    return {
      file,
      flashcards: quizData.flashcards,
      mcqs: quizData.mcqs,
      matchingQuestions: quizData.matchingQuestions,
      trueFalseQuestions: quizData.trueFalseQuestions,
      fillInBlanksQuestions: quizData.fillInBlanksQuestions
    };
  } catch (error) {
    console.error('Error getting saved quiz state:', error);
    return null;
  }
}

// Clear saved quiz state from local storage
export function clearSavedQuizState(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_QUIZ);
}

// Get user progress from local storage
export function getUserProgress(): UserProgress | null {
  const userProgressJson = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  if (!userProgressJson) return null;
  
  try {
    return JSON.parse(userProgressJson);
  } catch (e) {
    console.error('Error parsing user progress:', e);
    return null;
  }
}

// Initialize user progress in local storage
function initializeUserProgress(): UserProgress {
  return {
    userId: 'anonymous',
    streakInfo: {
      currentStreak: 1,
      lastUploadDate: new Date().toISOString(),
      longestStreak: 1
    },
    generations: [],
    dailyActivity: {}
  };
}

// Record quiz generation in local storage
export function recordQuizGeneration(
  documentId: string, 
  questionTypes: QuizGeneration['questionTypes'],
  timeSpentSeconds?: number
): void {
  setCurrentDocument(documentId);
  
  const userProgress = getUserProgress() || initializeUserProgress();
  
  // Update streak info
  const lastDate = new Date(userProgress.streakInfo.lastUploadDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    userProgress.streakInfo.currentStreak++;
    userProgress.streakInfo.lastUploadDate = today.toISOString();
    
    if (userProgress.streakInfo.currentStreak > userProgress.streakInfo.longestStreak) {
      userProgress.streakInfo.longestStreak = userProgress.streakInfo.currentStreak;
    }
  } else if (diffDays > 1) {
    userProgress.streakInfo.currentStreak = 1;
    userProgress.streakInfo.lastUploadDate = today.toISOString();
  }
  
  userProgress.generations.push({
    documentId,
    timestamp: new Date().toISOString(),
    timeSpentSeconds,
    questionTypes
  });
  
  recordDailyActivity('quiz', questionTypes);
  
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress));
}

// Record daily activity in local storage
export function recordDailyActivity(
  activityType: 'upload' | 'quiz',
  questionTypes: QuizGeneration['questionTypes'] | null
): void {
  const userProgress = getUserProgress() || initializeUserProgress();
  
  if (!userProgress.dailyActivity) {
    userProgress.dailyActivity = {};
  }
  
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  
  const todayActivity = userProgress.dailyActivity[dateKey] || {
    date: dateKey,
    uploads: 0,
    quizzes: 0,
    score: 0
  };
  
  if (activityType === 'upload') {
    todayActivity.uploads += 1;
  } else if (activityType === 'quiz') {
    todayActivity.quizzes += 1;
    const score = 70 + Math.floor(Math.random() * 30);
    todayActivity.score += score;
  }
  
  userProgress.dailyActivity[dateKey] = todayActivity;
  
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress));
}

// Get daily activity from local storage
export function getDailyActivity(
  startDate?: Date,
  endDate?: Date
): DailyActivity[] {
  const userProgress = getUserProgress();
  if (!userProgress?.dailyActivity) return [];
  
  const end = endDate || new Date();
  const start = startDate || new Date(end);
  if (!startDate) {
    start.setMonth(start.getMonth() - 12);
  }
  
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  
  return Object.values(userProgress.dailyActivity)
    .filter(activity => activity.date >= startStr && activity.date <= endStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Get streak info from local storage
export function getStreakInfo() {
  const userProgress = getUserProgress();
  
  if (!userProgress) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  return {
    currentStreak: userProgress.streakInfo.currentStreak,
    longestStreak: userProgress.streakInfo.longestStreak
  };
}

// Get GitHub-style activity from local storage
export function getGitHubStyleActivity(weeks = 52): { date: string; count: number }[] {
  const userProgress = getUserProgress();
  if (!userProgress?.dailyActivity) return [];
  
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const result: { date: string; count: number }[] = [];
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const activity = userProgress.dailyActivity[dateKey];
    
    result.push({
      date: dateKey,
      count: activity ? activity.uploads + activity.quizzes : 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

// Migrate from session storage to local storage
export function migrateSessionToLocalStorage(): void {
  const pendingDocId = sessionStorage.getItem(STORAGE_KEYS.PENDING_DOCUMENT);
  if (pendingDocId) {
    const state = getDocumentState();
    if (state.documents.some(doc => doc.id === pendingDocId)) {
      state.currentDocumentId = pendingDocId;
      saveDocumentState(state);
    }
    sessionStorage.removeItem(STORAGE_KEYS.PENDING_DOCUMENT);
  }
}

// Handle user login with local storage
export function handleUserLogin(userId: string): void {
  const userProgress = getUserProgress();
  
  if (userProgress) {
    userProgress.userId = userId;
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress));
  }
}

// Handle user logout (keep local storage data)
export function handleUserLogout(): void {
  // Keep local storage data
  // In a real app, you might want to sync with the server before logout
}

// Helper to get file type
function getFileType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop() || '';
  
  if (extension === 'pdf') return 'pdf';
  if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
  if (['doc', 'docx'].includes(extension)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
  if (['txt', 'rtf', 'md'].includes(extension)) return 'text';
  return 'unknown';
}

// Add these new functions for MongoDB document handling
export async function uploadDocumentToMongoDB(
  file: File,
  userId: string,
  contentPreview?: string,
  metadata?: any
): Promise<any> {
  try {
    const fileContent = await readFileContent(file);
    
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fileName: file.name,
        fileType: getFileType(file.name),
        fileSize: file.size,
        fileContent,
        contentPreview,
        metadata
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading document to MongoDB:', error);
    throw error;
  }
}

export async function getUserDocuments(userId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
}

export async function getDocumentById(documentId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

export async function updateDocumentInMongoDB(
  documentId: string,
  updates: {
    metadata?: any;
    questions?: any;
  }
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocumentFromMongoDB(documentId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Helper function to read file content
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read file content"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(file);
  });
}

interface Question {
  question?: string;
  answer?: string;
  front?: string;
  back?: string;
  options?: string[];
  correctAnswer?: string | number;  // Allow both string and number
  pairs?: Array<{ left: string; right: string }>;
  leftItems?: string[];
  rightItems?: string[];
  statement?: string;
  isTrue?: boolean;
  explanation?: string;
  text?: string;
  blanks?: string[];
  answers?: string[];
  metadata?: any;
}

interface Questions {
  flashcards: Question[];
  mcqs: Question[];
  matchingQuestions: Question[];
  trueFalseQuestions: Question[];
  fillInBlanksQuestions: Question[];
}

export async function saveQuestionDirectlyToMongoDB(documentId: string, questions: Questions): Promise<boolean> {
  const userId = auth.currentUser?.uid || 'anonymous';
  console.log('Directly saving to MongoDB:', { userId, documentId });
  
  try {
    const apiUrl = `${API_BASE_URL}/saved-questions/${userId}/${documentId}`;
    console.log('API URL:', apiUrl);

    // Format questions according to MongoDB schema
    const formattedQuestions = {
      userId,
      documentId,
      flashcards: questions.flashcards.map((card: Question, index: number) => ({
        question: card.question || card.front || '',
        answer: card.answer || card.back || '',
        metadata: { ...card.metadata, originalIndex: index }
      })) || [],
      mcqs: questions.mcqs.map((mcq: Question, index: number) => {
        // Ensure we have a valid correctAnswer
        if (!mcq.correctAnswer) {
          console.warn(`MCQ at index ${index} is missing correctAnswer, skipping...`);
          return null;
        }
        return {
          question: mcq.question || '',
          options: mcq.options || [],
          correctAnswer: mcq.correctAnswer,
          metadata: { ...mcq.metadata, originalIndex: index }
        };
      }).filter(Boolean) || [], // Remove any null entries
      matchingQuestions: questions.matchingQuestions.map((match: Question, index: number) => ({
        pairs: match.pairs || match.leftItems?.map((left: string, i: number) => ({
          left: left,
          right: match.rightItems?.[i] || ''
        })) || [],
        metadata: { ...match.metadata, originalIndex: index }
      })) || [],
      trueFalseQuestions: questions.trueFalseQuestions.map((tf: Question, index: number) => ({
        statement: tf.statement || tf.question || '',
        isTrue: tf.isTrue || false,
        explanation: tf.explanation || '',
        metadata: { ...tf.metadata, originalIndex: index }
      })) || [],
      fillInBlanksQuestions: questions.fillInBlanksQuestions.map((fib: Question, index: number) => ({
        text: fib.text || fib.question || '',
        blanks: fib.blanks || fib.answers || [],
        metadata: { ...fib.metadata, originalIndex: index }
      })) || [],
      lastUpdated: new Date().toISOString()
    };
    
    // First try to create a new document
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedQuestions),
    });
    
    console.log('MongoDB API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from API:', errorText);
      
      // Check if it's a duplicate key error
      if (errorText.includes('E11000 duplicate key error')) {
        console.log('Document already exists, updating with PUT...');
        // Retry with PUT method to update existing document
        const updateResponse = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedQuestions),
        });
        
        if (!updateResponse.ok) {
          const updateErrorText = await updateResponse.text();
          console.error('Error updating document:', updateErrorText);
          throw new Error(`Failed to update existing document: ${updateResponse.status} ${updateResponse.statusText}`);
        }
        
        const data = await updateResponse.json();
        console.log('Successfully updated existing document:', data);
        return true;
      }
      
      // If it's not a duplicate key error, throw the original error
      throw new Error(`Failed to save questions: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully created new document:', data);
    return true;
  } catch (error) {
    console.error('Error in saveQuestionDirectlyToMongoDB:', error);
    throw error;
  }
}

// Check if user has reached daily usage limit
export function hasReachedDailyLimit(): boolean {
  const userProgress = getUserProgress();
  if (!userProgress?.dailyActivity) return false;
  
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  const todayActivity = userProgress.dailyActivity[dateKey];
  
  if (!todayActivity) return false;
  
  // Count total uses (uploads + quizzes)
  const totalUses = todayActivity.uploads + todayActivity.quizzes;
  
  return totalUses >= 5; // 5 uses per day limit
}

// Get remaining daily uses
export function getRemainingDailyUses(): number {
  const userProgress = getUserProgress();
  if (!userProgress?.dailyActivity) return 5;
  
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  const todayActivity = userProgress.dailyActivity[dateKey];
  
  if (!todayActivity) return 5;
  
  // Count total uses (uploads + quizzes)
  const totalUses = todayActivity.uploads + todayActivity.quizzes;
  
  return Math.max(0, 5 - totalUses); // 5 uses per day limit
}