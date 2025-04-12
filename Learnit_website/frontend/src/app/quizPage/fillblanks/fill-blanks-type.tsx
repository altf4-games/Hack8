// This file defines the TypeScript interface for fill-in-the-blanks questions

export interface FillInBlanksQuestion {
    id: string;
    question: string;
    correctAnswers: string[];
    userAnswers?: string[];
    explanation?: string;
    // The original text with [BLANK_0], [BLANK_1] placeholders
    textWithBlanks: string;
    // The complete text with all answers filled in
    completeText: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }
  
  export interface FillInBlanksSection {
    title: string;
    questions: FillInBlanksQuestion[];
  }