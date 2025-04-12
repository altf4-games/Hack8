export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  contentPreview?: string;
  lastAccessed?: string;
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

export interface DailyActivity {
  date: string;
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
  dailyActivity: {
    [date: string]: DailyActivity;
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