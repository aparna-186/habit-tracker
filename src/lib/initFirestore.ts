import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { Habit } from './firestore';

// System habit IDs (fixed IDs for consistency) - kept for backward compatibility
export const SYSTEM_HABIT_IDS = {
  COMMUNICATION: '11111111-1111-1111-1111-111111111111',
  CODING: '22222222-2222-2222-2222-222222222222',
  NETWORKING: '33333333-3333-3333-3333-333333333333',
};

// Default habits for new users
export const DEFAULT_HABITS: Omit<Habit, 'id' | 'created_at'>[] = [
  {
    name: 'Communication Practice',
    description: 'Practice speaking and communication skills daily',
    icon: 'MessageCircle',
    color: '#3b82f6', // blue
    target_frequency: 1,
    user_id: null, // Will be set to user ID
  },
  {
    name: 'DSA Practice',
    description: 'Solve data structures and algorithms problems',
    icon: 'Brain',
    color: '#8b5cf6', // purple
    target_frequency: 1,
    user_id: null,
  },
  {
    name: 'Web Development Practice',
    description: 'Build and practice web development skills',
    icon: 'Code',
    color: '#10b981', // emerald
    target_frequency: 1,
    user_id: null,
  },
];

/**
 * Initialize default habits for a new user
 */
export async function initializeDefaultHabits(userId: string): Promise<string[]> {
  const habitIds: string[] = [];
  
  try {
    for (const habit of DEFAULT_HABITS) {
      const habitDoc = await addDoc(collection(db, 'habits'), {
        ...habit,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      habitIds.push(habitDoc.id);
    }
    return habitIds;
  } catch (error) {
    console.error('Error initializing default habits:', error);
    throw error;
  }
}

// System habits data (kept for backward compatibility)
const SYSTEM_HABITS = [
  {
    id: SYSTEM_HABIT_IDS.COMMUNICATION,
    name: 'Daily Communication',
    description: 'Practice your communication skills',
    icon: 'MessageCircle',
    color: '#3b82f6', // blue
    target_frequency: 1,
    user_id: null, // System habit
    created_at: serverTimestamp(),
  },
  {
    id: SYSTEM_HABIT_IDS.CODING,
    name: 'Code Practice',
    description: 'Work on coding skills',
    icon: 'Code',
    color: '#10b981', // emerald
    target_frequency: 1,
    user_id: null,
    created_at: serverTimestamp(),
  },
  {
    id: SYSTEM_HABIT_IDS.NETWORKING,
    name: 'Networking',
    description: 'Build professional connections',
    icon: 'Globe',
    color: '#f59e0b', // amber
    target_frequency: 1,
    user_id: null,
    created_at: serverTimestamp(),
  },
];

/**
 * Initialize system habits in Firestore
 * This creates the 'habits' collection automatically if it doesn't exist
 * Requires authentication
 */
export async function initializeSystemHabits(): Promise<void> {
  try {
    console.log('Initializing system habits...');
    
    for (const habit of SYSTEM_HABITS) {
      const habitRef = doc(db, 'habits', habit.id);
      const habitSnap = await getDoc(habitRef);
      
      // Only create if it doesn't exist
      if (!habitSnap.exists()) {
        await setDoc(habitRef, habit);
        console.log(`Created system habit: ${habit.name}`);
      }
    }
    
    console.log('System habits initialized successfully');
  } catch (error) {
    console.error('Error initializing system habits:', error);
    throw error;
  }
}

/**
 * Check if system habits exist, if not create them
 * This is safe to call multiple times
 * Requires authentication
 */
export async function ensureSystemHabitsExist(): Promise<boolean> {
  try {
    const habitsQuery = query(collection(db, 'habits'), where('user_id', '==', null));
    const habitsSnapshot = await getDocs(habitsQuery);
    
    // If we have less than 3 system habits, initialize them
    if (habitsSnapshot.size < 3) {
      await initializeSystemHabits();
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking system habits:', error);
    // If permission error, try to initialize anyway (might work if user is authenticated)
    try {
      await initializeSystemHabits();
      return true;
    } catch (initError) {
      console.warn('Could not initialize system habits. They may need to be created manually in Firebase Console.');
      return false;
    }
  }
}

/**
 * Initialize all collections by ensuring system habits exist
 * This will automatically create the 'habits' collection
 * Other collections (profiles, streaks, habit_completions) are created
 * automatically when documents are written to them
 * This function now fails gracefully - app will still work if it fails
 */
export async function initializeFirestore(): Promise<void> {
  try {
    console.log('Initializing Firestore database...');
    await ensureSystemHabitsExist();
    console.log('Firestore database initialized successfully');
  } catch (error) {
    console.warn('Could not initialize Firestore. App will continue, but system habits may need to be created manually.');
    // Don't throw - let the app continue
  }
}
