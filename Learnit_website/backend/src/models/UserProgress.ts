import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: string;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  lastStudyDate: Date;
  dailyActivity: Map<string, {
    questionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    timeSpent: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  totalQuestionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date, default: Date.now },
  dailyActivity: {
    type: Map,
    of: {
      questionsAnswered: Number,
      correctAnswers: Number,
      incorrectAnswers: Number,
      timeSpent: Number
    },
    default: new Map()
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ lastStudyDate: -1 });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema); 