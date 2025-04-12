import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserProgress } from '../models/UserProgress';

const router = express.Router();

// Get user progress
router.get('/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      res.status(404).json({ message: 'User progress not found' });
      return;
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Error fetching user progress' });
  }
});

// Update user progress
router.post('/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(progress);
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ message: 'Error updating user progress' });
  }
});

// Update daily activity
router.post('/:userId/daily-activity', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { date, activity } = req.body;

    const progress = await UserProgress.findOne({ userId });
    if (!progress) {
      res.status(404).json({ message: 'User progress not found' });
      return;
    }

    if (!progress.dailyActivity) {
      progress.dailyActivity = new Map();
    }

    progress.dailyActivity.set(date, activity);
    await progress.save();

    res.json(progress);
  } catch (error) {
    console.error('Error updating daily activity:', error);
    res.status(500).json({ message: 'Error updating daily activity' });
  }
});

export default router; 