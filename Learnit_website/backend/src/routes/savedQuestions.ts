import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { SavedQuestions } from '../models/SavedQuestions';
import mongoose from 'mongoose';

const router = express.Router();

// Debug middleware for this router
router.use((req, _res, next) => {
  console.log('SavedQuestions Route accessed:', {
    method: req.method,
    url: req.url,
    params: req.params,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Root endpoint to show available routes
router.get('/', (_req, res) => {
  res.json({
    message: 'Saved Questions API is running',
    availableEndpoints: {
      'GET /': 'Show this help message',
      'GET /:userId/:documentId': 'Get saved questions for a specific document',
      'POST /:userId/:documentId': 'Save questions for a document',
      'GET /:userId': 'Get all saved questions for a user'
    }
  });
});

// Get saved questions for a document
router.get('/:userId/:documentId', async (req, res) => {
  try {
    const { userId, documentId } = req.params;
    const savedQuestions = await SavedQuestions.findOne({ userId, documentId });
    if (!savedQuestions) {
      res.status(404).json({ message: 'No saved questions found' });
      return;
    }
    res.json(savedQuestions);
  } catch (error) {
    console.error('Error fetching saved questions:', error);
    res.status(500).json({ message: 'Error fetching saved questions' });
  }
});

// Save questions for a document
router.post('/:userId/:documentId', async (req, res) => {
  try {
    const { userId, documentId } = req.params;
    // Save the request body directly as it matches our schema
    const savedQuestions = await SavedQuestions.findOneAndUpdate(
      { userId, documentId },
      { $set: { ...req.body, lastUpdated: new Date() } },
      { new: true, upsert: true }
    );
    res.json(savedQuestions);
  } catch (error) {
    console.error('Error saving questions:', error);
    res.status(500).json({ message: 'Error saving questions' });
  }
});

// Get all saved questions for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const savedQuestions = await SavedQuestions.find({ userId });
    res.json(savedQuestions);
  } catch (error) {
    console.error('Error fetching user saved questions:', error);
    res.status(500).json({ message: 'Error fetching saved questions' });
  }
});

// Update questions for a document
router.put('/:userId/:documentId', async (req: AuthRequest, res) => {
  try {
    const { userId, documentId } = req.params;
    console.log('Attempting to update questions for:', { userId, documentId });
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Verify MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }

    // Find and update the document, create if it doesn't exist
    const updatedQuestions = await SavedQuestions.findOneAndUpdate(
      { userId, documentId },
      {
        $set: {
          flashcards: req.body.flashcards || [],
          mcqs: req.body.mcqs || [],
          matchingQuestions: req.body.matchingQuestions || [],
          trueFalseQuestions: req.body.trueFalseQuestions || [],
          fillInBlanksQuestions: req.body.fillInBlanksQuestions || [],
          lastUpdated: new Date()
        }
      },
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        runValidators: true 
      }
    );

    if (!updatedQuestions) {
      console.log('Failed to update or create document:', { userId, documentId });
      res.status(500).json({ message: 'Failed to update or create document' });
      return;
    }

    console.log('Successfully updated/created document:', updatedQuestions._id);
    res.json(updatedQuestions);
  } catch (error) {
    console.error('Error updating questions:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error updating questions',
      error: error.message 
    });
  }
});

export default router; 