// Initialize the first teacher in Firestore
// Run with: node src/scripts/initializeTeacher.js <EMAIL>
// Make sure to have properly configured Firebase credentials

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

// Check for email argument
const teacherEmail = process.argv[2];
if (!teacherEmail) {
  console.error('Please provide teacher email as an argument');
  console.error('Example: node src/scripts/initializeTeacher.js teacher@example.com');
  process.exit(1);
}

// Load Firebase service account
let serviceAccount;
try {
  // Try to load from environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Otherwise, try to load from file
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('Firebase service account file not found at:', serviceAccountPath);
      console.error('Please create a firebase-service-account.json file in the project root');
      process.exit(1);
    }
    serviceAccount = require(serviceAccountPath);
  }
} catch (error) {
  console.error('Error loading Firebase service account:', error);
  process.exit(1);
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function initializeTeacher() {
  try {
    console.log(`Looking up user with email: ${teacherEmail}`);
    
    // Try to find the user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(teacherEmail);
      console.log('Found existing user:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('User not found, creating new user...');
        // Create a new user if not found
        userRecord = await auth.createUser({
          email: teacherEmail,
          emailVerified: true,
          password: 'TemporaryPassword123!', // User should change this
          displayName: 'Teacher Admin'
        });
        console.log('Created new user:', userRecord.uid);
      } else {
        throw error;
      }
    }
    
    // Check if teacher document already exists
    const teacherDoc = await db.collection('teachers').doc(userRecord.uid).get();
    
    if (teacherDoc.exists) {
      console.log('Teacher document already exists');
      return;
    }
    
    // Create the teacher document
    await db.collection('teachers').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: teacherEmail,
      displayName: userRecord.displayName || 'Teacher Admin',
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    });
    
    console.log('Successfully created teacher record for:', teacherEmail);
    console.log('UID:', userRecord.uid);
    console.log('\nIMPORTANT: If a new user was created, use the password reset function to set a secure password.');
    
  } catch (error) {
    console.error('Error initializing teacher:', error);
    process.exit(1);
  }
}

initializeTeacher()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 