"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Document_1 = require("../models/Document");
const router = express_1.default.Router();
router.get('/', (_req, res) => {
    res.json({
        message: 'Documents API is running',
        availableEndpoints: {
            'GET /api/documents': 'Show this help message',
            'POST /api/documents': 'Upload a new document',
            'GET /api/documents/user/:userId': 'Get all documents for a user',
            'GET /api/documents/:documentId': 'Get a single document by ID',
            'PUT /api/documents/:documentId': 'Update a document',
            'DELETE /api/documents/:documentId': 'Delete a document',
            'GET /api/documents/search': 'Search documents (query params: query, userId)'
        }
    });
});
router.post('/', async (req, res) => {
    try {
        const { userId, fileName, fileType, fileSize, fileContent, contentPreview, metadata } = req.body;
        const document = new Document_1.DocumentModel({
            userId,
            fileName,
            fileType,
            fileSize,
            fileContent,
            contentPreview,
            metadata,
            uploadDate: new Date(),
            lastAccessed: new Date()
        });
        await document.save();
        res.status(201).json(document);
    }
    catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const documents = await Document_1.DocumentModel.find({ userId })
            .sort({ lastAccessed: -1 })
            .select('-fileContent');
        res.json(documents);
    }
    catch (error) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
});
router.get('/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document_1.DocumentModel.findById(documentId);
        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }
        document.lastAccessed = new Date();
        await document.save();
        res.json(document);
    }
    catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Error fetching document' });
    }
});
router.put('/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const updates = req.body;
        const document = await Document_1.DocumentModel.findByIdAndUpdate(documentId, { $set: updates }, { new: true });
        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }
        res.json(document);
    }
    catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Error updating document' });
    }
});
router.delete('/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document_1.DocumentModel.findByIdAndDelete(documentId);
        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
});
router.get('/search', async (req, res) => {
    try {
        const { query, userId } = req.query;
        const searchQuery = {
            userId,
            $or: [
                { fileName: { $regex: query, $options: 'i' } },
                { 'metadata.title': { $regex: query, $options: 'i' } },
                { 'metadata.author': { $regex: query, $options: 'i' } }
            ]
        };
        const documents = await Document_1.DocumentModel.find(searchQuery)
            .sort({ lastAccessed: -1 })
            .select('-fileContent');
        res.json(documents);
    }
    catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).json({ message: 'Error searching documents' });
    }
});
exports.default = router;
//# sourceMappingURL=documents.js.map