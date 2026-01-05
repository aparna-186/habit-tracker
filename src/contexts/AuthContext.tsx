import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Profile } from '../lib/firestore';
import { initializeDefaultHabits } from '../lib/initFirestore';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUid: string): Promise<Profile | null> => {
    try {
      const profileRef = doc(db, 'profiles', firebaseUid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        return { 
          id: profileSnap.id, 
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const createProfile = async (firebaseUid: string, email: string, username: string): Promise<Profile | null> => {
    try {
      const now = new Date().toISOString();
      const profileData = {
        firebase_uid: firebaseUid,
        email,
        username,
        total_xp: 0,
        level: 1,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const profileRef = doc(db, 'profiles', firebaseUid);
      await setDoc(profileRef, profileData);

      // Initialize default habits for new user
      const habitIds = await initializeDefaultHabits(firebaseUid);
      
      // Initialize streaks for default habits
      for (const habitId of habitIds) {
        try {
          await addDoc(collection(db, 'streaks'), {
            user_id: firebaseUid,
            habit_id: habitId,
            current_streak: 0,
            longest_streak: 0,
            last_completed: null,
            freeze_count: 3,
            updated_at: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error initializing streak:', error);
        }
      }

      return { 
        id: firebaseUid, 
        ...profileData, 
        created_at: now, 
        updated_at: now 
      } as Profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const freshProfile = await fetchProfile(user.uid);
      if (freshProfile) {
        setProfile(freshProfile);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        let userProfile = await fetchProfile(firebaseUser.uid);

        if (!userProfile) {
          userProfile = await createProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.email?.split('@')[0] || 'User'
          );
        }

        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    await createProfile(firebaseUser.uid, email, username);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
