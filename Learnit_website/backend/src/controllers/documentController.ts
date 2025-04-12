import { Request, Response } from 'express';
import { DocumentModel } from '../models/Document';

// Upload a new document
export const uploadDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId, fileName, fileType, fileSize, fileContent, contentPreview, metadata } = req.body;

    // Validate required fields
    if (!userId || !fileName || !fileType || !fileSize || !fileContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new document
    const document = new DocumentModel({
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

    // Save document
    await document.save();

    return res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ message: 'Error uploading document' });
  }
};

// Get all documents for a user
export const getUserDocuments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const documents = await DocumentModel.find({ userId })
      .sort({ lastAccessed: -1 })
      .select('-fileContent');
    return res.json(documents);
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Get a single document
export const getDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { documentId } = req.params;
    const document = await DocumentModel.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.lastAccessed = new Date();
    await document.save();

    return res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ message: 'Error fetching document' });
  }
};

// Update document metadata
export const updateDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { documentId } = req.params;
    const updates = req.body;

    const document = await DocumentModel.findByIdAndUpdate(
      documentId,
      { $set: updates },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    return res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ message: 'Error updating document' });
  }
};

// Delete a document
export const deleteDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { documentId } = req.params;
    const document = await DocumentModel.findByIdAndDelete(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ message: 'Error deleting document' });
  }
};

// Search documents
export const searchDocuments = async (req: Request, res: Response): Promise<Response> => {
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

    const documents = await DocumentModel.find(searchQuery)
      .sort({ lastAccessed: -1 })
      .select('-fileContent');

    return res.json(documents);
  } catch (error) {
    console.error('Error searching documents:', error);
    return res.status(500).json({ message: 'Error searching documents' });
  }
}; 