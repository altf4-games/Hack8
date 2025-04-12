import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedQuestions extends Document {
  userId: string;
  documentId: string;
  flashcards: Array<{
    question: string;
    answer: string;
    metadata?: any;
  }>;
  mcqs: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    metadata?: any;
  }>;
  matchingQuestions: Array<{
    pairs: Array<{
      left: string;
      right: string;
    }>;
    metadata?: any;
  }>;
  trueFalseQuestions: Array<{
    statement: string;
    isTrue: boolean;
    explanation?: string;
    metadata?: any;
  }>;
  fillInBlanksQuestions: Array<{
    text: string;
    blanks: string[];
    metadata?: any;
  }>;
  lastUpdated: Date;
}

const SavedQuestionsSchema: Schema = new Schema({
  userId: { type: String, required: true },
  documentId: { type: String, required: true },
  flashcards: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
  }],
  mcqs: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
  }],
  matchingQuestions: [{
    pairs: [{
      left: { type: String, required: true },
      right: { type: String, required: true }
    }],
    metadata: { type: Schema.Types.Mixed }
  }],
  trueFalseQuestions: [{
    statement: { type: String, required: true },
    isTrue: { type: Boolean, required: true },
    explanation: String,
    metadata: { type: Schema.Types.Mixed }
  }],
  fillInBlanksQuestions: [{
    text: { type: String, required: true },
    blanks: [{ type: String, required: true }],
    metadata: { type: Schema.Types.Mixed }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

// Compound index for faster queries
SavedQuestionsSchema.index({ userId: 1, documentId: 1 }, { unique: true });

export const SavedQuestions = mongoose.model<ISavedQuestions>('SavedQuestions', SavedQuestionsSchema); 