"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SavedQuestions_1 = require("../models/SavedQuestions");
const router = express_1.default.Router();
router.get('/:userId/:documentId', async (req, res) => {
    try {
        const { userId, documentId } = req.params;
        const savedQuestions = await SavedQuestions_1.SavedQuestions.findOne({ userId, documentId });
        if (!savedQuestions) {
            res.status(404).json({ message: 'No saved questions found' });
            return;
        }
        res.json(savedQuestions);
    }
    catch (error) {
        console.error('Error fetching saved questions:', error);
        res.status(500).json({ message: 'Error fetching saved questions' });
    }
});
router.post('/:userId/:documentId', async (req, res) => {
    try {
        const { userId, documentId } = req.params;
        const { questions } = req.body;
        const savedQuestions = await SavedQuestions_1.SavedQuestions.findOneAndUpdate({ userId, documentId }, { $set: { questions } }, { new: true, upsert: true });
        res.json(savedQuestions);
    }
    catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({ message: 'Error saving questions' });
    }
});
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const savedQuestions = await SavedQuestions_1.SavedQuestions.find({ userId });
        res.json(savedQuestions);
    }
    catch (error) {
        console.error('Error fetching user saved questions:', error);
        res.status(500).json({ message: 'Error fetching saved questions' });
    }
});
exports.default = router;
//# sourceMappingURL=savedQuestions.js.map