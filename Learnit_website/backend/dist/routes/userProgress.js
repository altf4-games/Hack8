"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserProgress_1 = require("../models/UserProgress");
const router = express_1.default.Router();
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await UserProgress_1.UserProgress.findOne({ userId });
        if (!progress) {
            res.status(404).json({ message: 'User progress not found' });
            return;
        }
        res.json(progress);
    }
    catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ message: 'Error fetching user progress' });
    }
});
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const progress = await UserProgress_1.UserProgress.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true });
        res.json(progress);
    }
    catch (error) {
        console.error('Error updating user progress:', error);
        res.status(500).json({ message: 'Error updating user progress' });
    }
});
router.post('/:userId/daily-activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const { date, activity } = req.body;
        const progress = await UserProgress_1.UserProgress.findOne({ userId });
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
    }
    catch (error) {
        console.error('Error updating daily activity:', error);
        res.status(500).json({ message: 'Error updating daily activity' });
    }
});
exports.default = router;
//# sourceMappingURL=userProgress.js.map