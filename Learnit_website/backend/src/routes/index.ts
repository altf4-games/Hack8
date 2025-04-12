import express from 'express';
import userProgressRoutes from './userProgress';
import savedQuestionsRoutes from './savedQuestions';
import documentRoutes from './documents';

const router = express.Router();

// Health check endpoint
router.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

// Mount routes
router.use('/user-progress', userProgressRoutes);
router.use('/saved-questions', savedQuestionsRoutes);
router.use('/documents', documentRoutes);

export default router; 