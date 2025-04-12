import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileContent: string;
  contentPreview?: string;
  metadata?: {
    title?: string;
    author?: string;
    pageCount?: number;
    [key: string]: any;
  };
  uploadDate: Date;
  lastAccessed: Date;
  questions?: Array<{
    question: string;
    answer: string;
    [key: string]: any;
  }>;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileContent: { type: String, required: true },
  contentPreview: { type: String },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  uploadDate: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  questions: [{
    question: String,
    answer: String,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }]
});

// Indexes for better query performance
DocumentSchema.index({ userId: 1, fileName: 1 });
DocumentSchema.index({ 'metadata.title': 1 });
DocumentSchema.index({ uploadDate: -1 });
DocumentSchema.index({ lastAccessed: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema); 