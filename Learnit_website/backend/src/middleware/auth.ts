import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');
initializeApp({
  credential: cert(serviceAccount)
});

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}; 