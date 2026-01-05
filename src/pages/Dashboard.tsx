import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { Habit, HabitCompletion, Streak } from '../lib/firestore';
import { calculateLevel, getProgressToNextLevel, checkBadgeProgress, getMotivationalMessage } from '../lib/gamification';
import { checkStreakReset, calculateStreak, canCompleteToday } from '../lib/streakLogic';
import { motion } from 'framer-motion';
import { LogOut, Zap, TrendingUp, Award, Calendar, Plus } from 'lucide-react';
import { HabitCard } from '../components/HabitCard';
import { StatsCard } from '../components/StatsCard';
import { BadgeCard } from '../components/BadgeCard';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { AddHabitModal } from '../components/AddHabitModal';
import { AnimatedGradientBackground } from '../components/AnimatedGradientBackground';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

// Add Habit Button Component with Glow
function AddHabitButton({ onClick }: { onClick: () => void }) {
  const [isGlowing, setIsGlowing] = useState(false);

  const handleClick = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 300);
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full h-full min-h-[200px] backdrop-blur-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition"
      style={{
        boxShadow: isGlowing 
          ? '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(34, 197, 94, 0.3)' 
          : undefined,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
        <Plus className="w-8 h-8 text-blue-400" />
      </div>
      <p className="text-slate-300 font-medium">Create New Habit</p>
    </motion.button>
  );
}

// No Habits Message Component with Glow
function NoHabitsMessage({ onAddClick }: { onAddClick: () => void }) {
  const [isGlowing, setIsGlowing] = useState(false);

  const handleClick = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 300);
    onAddClick();
  };

  return (
    <div className="text-center py-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
      <p className="text-slate-400 mb-4">No habits yet. Create your first one!</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-500/50 mx-auto"
        style={{
          boxShadow: isGlowing 
            ? '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(34, 197, 94, 0.4)' 
            : undefined,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <Plus className="w-5 h-5" />
        Create New Habit
      </motion.button>
    </div>
  );
}

export function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData();
    }
  }, [user?.uid]);

  const fetchDashboardData = async () => {
    if (!user?.uid) return;

    try {
      // Fetch user's habits (where user_id matches)
      const habitsQuery = query(collection(db, 'habits'), where('user_id', '==', user.uid));
      const habitsSnapshot = await getDocs(habitsQuery);
      const habitsData = habitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Habit[];

      // Fetch today's completions
      const today = new Date().toISOString().split('T')[0];
      const completionsQuery = query(
        collection(db, 'habit_completions'),
        where('user_id', '==', user.uid),
        where('completed_at', '==', today)
      );
      const completionsSnapshot = await getDocs(completionsQuery);
      const completionsData = completionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completed_at: doc.data().completed_at || today,
      })) as HabitCompletion[];

      // Fetch streaks
      const streaksQuery = query(collection(db, 'streaks'), where('user_id', '==', user.uid));
      const streaksSnapshot = await getDocs(streaksQuery);
      let streaksData = streaksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        last_completed: doc.data().last_completed || null,
      })) as Streak[];

      // Check and reset streaks that haven't been completed in 24 hours
      const updatedStreaks = await Promise.all(
        streaksData.map(async (streak) => {
          const streakCheck = checkStreakReset(streak.last_completed);
          
          if (streakCheck.shouldReset && streak.current_streak > 0) {
            // Reset streak in database
            const streakRef = doc(db, 'streaks', streak.id);
            await updateDoc(streakRef, {
              current_streak: 0,
              updated_at: serverTimestamp(),
            });
            
            return {
              ...streak,
              current_streak: 0,
            };
          }
          
          return streak;
        })
      );

      setHabits(habitsData);
      setCompletions(completionsData);
      setStreaks(updatedStreaks);

      // Check badge progress
      const badges = checkBadgeProgress(
        {
          total_xp: profile?.total_xp || 0,
          current_streak: Math.max(...(streaksData.map(s => s.current_streak) || [0]), 0),
          level: profile?.level || 1,
        },
        {
          totalCheckIns: completionsData.length || 0,
          todayCompletedHabits: completionsData.length || 0,
        }
      );
      setUnlockedBadges(badges);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId: string) => {
    if (!user?.uid || checkingIn) return;

    // Enforce strict daily completion rule - one check per habit per day
    if (!canCompleteToday(completions, habitId)) {
      alert('This habit has already been completed today!');
      return;
    }

    setCheckingIn(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Create completion record
      await addDoc(collection(db, 'habit_completions'), {
        user_id: user.uid,
        habit_id: habitId,
        completed_at: today,
        xp_earned: 50,
      });

      // Update or create streak with proper calculation
      let streak = streaks.find(s => s.habit_id === habitId);
      if (streak) {
        // Calculate new streak using streak logic
        const newStreakValue = calculateStreak(
          streak.current_streak,
          streak.last_completed,
          true // completed today
        );

        const newStreak = {
          ...streak,
          current_streak: newStreakValue,
          longest_streak: Math.max(streak.longest_streak, newStreakValue),
          last_completed: today,
        };

        const streakRef = doc(db, 'streaks', streak.id);
        await updateDoc(streakRef, {
          current_streak: newStreak.current_streak,
          longest_streak: newStreak.longest_streak,
          last_completed: newStreak.last_completed,
          updated_at: serverTimestamp(),
        });

        setStreaks(prevStreaks =>
          prevStreaks.map(s => (s.id === streak.id ? newStreak : s))
        );
      } else {
        // Create new streak if it doesn't exist
        const newStreakDoc = await addDoc(collection(db, 'streaks'), {
          user_id: user.uid,
          habit_id: habitId,
          current_streak: 1,
          longest_streak: 1,
          last_completed: today,
          freeze_count: 3,
          updated_at: serverTimestamp(),
        });
        setStreaks(prev => [...prev, {
          id: newStreakDoc.id,
          user_id: user.uid,
          habit_id: habitId,
          current_streak: 1,
          longest_streak: 1,
          last_completed: today,
          freeze_count: 3,
          updated_at: new Date().toISOString(),
        }]);
      }

      // Update user XP
      if (profile?.id) {
        const newXP = (profile.total_xp || 0) + 50;
        const profileRef = doc(db, 'profiles', profile.id);
        await updateDoc(profileRef, {
          total_xp: newXP,
          updated_at: serverTimestamp(),
        });
        await refreshProfile();
      }

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user?.uid || !confirm('Are you sure you want to delete this habit?')) return;

    try {
      await deleteDoc(doc(db, 'habits', habitId));
      // Also delete associated streaks
      const streak = streaks.find(s => s.habit_id === habitId);
      if (streak) {
        await deleteDoc(doc(db, 'streaks', streak.id));
      }
      await fetchDashboardData();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = completions.filter(c => c.completed_at === today);
  const currentLevel = calculateLevel(profile?.total_xp || 0);
  const progressToNextLevel = getProgressToNextLevel(profile?.total_xp || 0);
  const maxStreak = Math.max(...(streaks?.map(s => s.longest_streak) || [0]), 0);
  const currentStreak = Math.max(...(streaks?.map(s => s.current_streak) || [0]), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
        <AnimatedGradientBackground />
        <div className="relative z-10 animate-pulse">
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      {/* Global Animated Gradient Background */}
      <AnimatedGradientBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                HabitFlow
              </h1>
              <p className="text-xs text-slate-400">Track your daily progress</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Profile stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <StatsCard
              title="Level"
              value={currentLevel}
              icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
              color="blue"
              subtitle={`${Math.round(profile?.total_xp || 0)} XP total`}
            />
            <StatsCard
              title="Today"
              value={`${todayCompletions.length}/${habits.length}`}
              icon={<Calendar className="w-6 h-6 text-emerald-400" />}
              color="emerald"
              subtitle="Habits completed"
            />
            <StatsCard
              title="Current Streak"
              value={currentStreak}
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              color="amber"
              subtitle="Days in a row"
            />
            <StatsCard
              title="Best Streak"
              value={maxStreak}
              icon={<Award className="w-6 h-6 text-purple-400" />}
              color="purple"
              subtitle="Personal record"
            />
          </motion.div>

          {/* Level progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-white">Level Progress</h2>
              <p className="text-sm text-slate-400">{Math.round(progressToNextLevel)}% to level {currentLevel + 1}</p>
            </div>
            <AnimatedProgressBar
              current={Math.round(progressToNextLevel)}
              max={100}
              color="from-blue-400 to-cyan-400"
            />
            <p className="text-xs text-slate-500 mt-3">
              {getMotivationalMessage(currentLevel, currentStreak)}
            </p>
          </motion.div>

          {/* Habits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Your Habits</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-500/50"
              >
                <Plus className="w-5 h-5" />
                Create New Habit
              </motion.button>
            </div>
            
            {habits.length === 0 ? (
              <div className="text-center py-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
                <p className="text-slate-400 mb-4">No habits yet. Create your first one!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-500/50 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create New Habit
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <HabitCard
                      habit={habit}
                      completion={completions.find(c => c.habit_id === habit.id && c.completed_at === today) || null}
                      streak={streaks.find(s => s.habit_id === habit.id) || null}
                      onCheckIn={handleCheckIn}
                      onDelete={handleDeleteHabit}
                      loading={checkingIn}
                    />
                  </motion.div>
                ))}
                
                {/* Add Habit Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + habits.length * 0.1 }}
                >
                  <AddHabitButton onClick={() => setShowAddModal(true)} />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <BadgeCard
                name="First Step"
                description="Complete your first check-in"
                icon="Star"
                unlocked={unlockedBadges.includes('first_step')}
              />
              <BadgeCard
                name="Week Warrior"
                description="7-day streak"
                icon="Flame"
                unlocked={unlockedBadges.includes('week_warrior')}
              />
              <BadgeCard
                name="Consistency King"
                description="30-day streak"
                icon="Crown"
                unlocked={unlockedBadges.includes('consistency_king')}
              />
              <BadgeCard
                name="Century Club"
                description="100 check-ins"
                icon="Award"
                unlocked={unlockedBadges.includes('century_club')}
              />
              <BadgeCard
                name="Triple Threat"
                description="All habits today"
                icon="Zap"
                unlocked={unlockedBadges.includes('triple_threat')}
              />
              <BadgeCard
                name="Level 10"
                description="Reach level 10"
                icon="TrendingUp"
                unlocked={unlockedBadges.includes('level_10')}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {user && (
        <AddHabitModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onHabitAdded={fetchDashboardData}
          userId={user.uid}
        />
      )}
    </div>
  );
}