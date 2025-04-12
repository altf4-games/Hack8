import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Log environment variables for debugging (remove in production)
console.log("Firebase Config Environment Variables:");
console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Not Set");
console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Set" : "Not Set");
console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Set" : "Not Set");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("Missing required Firebase configuration. Check your environment variables.");
}

// Ensure Firebase is initialized only once
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Initialize auth with explicit settings
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulators in development if needed
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log("Connected to Firebase emulators");
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
  }
}

export default app; 