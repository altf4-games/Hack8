import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './firebase-service-account.json';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount as any)
});

// Get Auth instance
export const auth = getAuth(app); 