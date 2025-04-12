"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDocuments = exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.getUserDocuments = exports.uploadDocument = void 0;
const Document_1 = require("../models/Document");
const uploadDocument = async (req, res) => {
    try {
        const { userId, fileName, fileType, fileSize, fileContent, contentPreview, metadata } = req.body;
        if (!userId || !fileName || !fileType || !fileSize || !fileContent) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
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
        return res.status(201).json(document);
    }
    catch (error) {
        console.error('Error uploading document:', error);
        return res.status(500).json({ message: 'Error uploading document' });
    }
};
exports.uploadDocument = uploadDocument;
const getUserDocuments = async (req, res) => {
    try {
        const { userId } = req.params;
        const documents = await Document_1.DocumentModel.find({ userId })
            .sort({ lastAccessed: -1 })
            .select('-fileContent');
        return res.json(documents);
    }
    catch (error) {
        console.error('Error fetching user documents:', error);
        return res.status(500).json({ message: 'Error fetching documents' });
    }
};
exports.getUserDocuments = getUserDocuments;
const getDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document_1.DocumentModel.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        document.lastAccessed = new Date();
        await document.save();
        return res.json(document);
    }
    catch (error) {
        console.error('Error fetching document:', error);
        return res.status(500).json({ message: 'Error fetching document' });
    }
};
exports.getDocument = getDocument;
const updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const updates = req.body;
        const document = await Document_1.DocumentModel.findByIdAndUpdate(documentId, { $set: updates }, { new: true });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        return res.json(document);
    }
    catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({ message: 'Error updating document' });
    }
};
exports.updateDocument = updateDocument;
const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document_1.DocumentModel.findByIdAndDelete(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        return res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({ message: 'Error deleting document' });
    }
};
exports.deleteDocument = deleteDocument;
const searchDocuments = async (req, res) => {
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
        return res.json(documents);
    }
    catch (error) {
        console.error('Error searching documents:', error);
        return res.status(500).json({ message: 'Error searching documents' });
    }
};
exports.searchDocuments = searchDocuments;
//# sourceMappingURL=documentController.js.map