import { auth, db } from './firebaseConfig';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Check if the current user is a teacher
 * @returns Promise<boolean> True if the user is a teacher
 */
export async function isTeacher(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    // Check if user exists in teachers collection
    const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
    return teacherDoc.exists();
  } catch (error) {
    console.error('Error checking teacher status:', error);
    return false;
  }
}

/**
 * Register a new teacher
 * @param user Firebase user
 * @param teacherData Additional teacher data
 * @returns Promise<void>
 */
export async function registerTeacher(user: User, teacherData: any): Promise<void> {
  if (!user) throw new Error('User not authenticated');
  
  try {
    // Create teacher document
    await setDoc(doc(db, 'teachers', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || teacherData.name,
      photoURL: user.photoURL,
      createdAt: new Date(),
      ...teacherData
    });
  } catch (error) {
    console.error('Error registering teacher:', error);
    throw error;
  }
}

/**
 * Get teacher data
 * @param userId Teacher user ID
 * @returns Promise<any> Teacher data
 */
export async function getTeacherData(userId: string): Promise<any> {
  try {
    const teacherDoc = await getDoc(doc(db, 'teachers', userId));
    if (!teacherDoc.exists()) {
      throw new Error('Teacher not found');
    }
    return { id: teacherDoc.id, ...teacherDoc.data() };
  } catch (error) {
    console.error('Error fetching teacher data:', error);
    throw error;
  }
}

/**
 * Create a teacher without Firebase Auth (admin function)
 * @param teacherData Teacher data
 * @returns Promise<void>
 */
export async function createTeacherDocument(uid: string, teacherData: any): Promise<void> {
  try {
    // Check if teacher already exists
    const teacherDoc = await getDoc(doc(db, 'teachers', uid));
    if (teacherDoc.exists()) {
      throw new Error('Teacher already exists');
    }
    
    // Create teacher document
    await setDoc(doc(db, 'teachers', uid), {
      uid,
      email: teacherData.email,
      displayName: teacherData.name || teacherData.displayName,
      photoURL: teacherData.photoURL || null,
      createdAt: new Date(),
      ...teacherData
    });
  } catch (error) {
    console.error('Error creating teacher document:', error);
    throw error;
  }
} 