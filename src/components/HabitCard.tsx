import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Zap, Trash2, Star } from 'lucide-react';
import { Habit, HabitCompletion, Streak } from '../lib/firestore';

interface HabitCardProps {
  habit: Habit;
  completion: HabitCompletion | null;
  streak: Streak | null;
  onCheckIn: (habitId: string) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
  loading?: boolean;
}

const ICON_MAP: Record<string, string> = {
  Brain: '🧠',
  Code: '💻',
  MessageCircle: '💬',
  Book: '📚',
  Dumbbell: '🏋️',
  Music: '🎵',
  Heart: '❤️',
  Star: '⭐',
};

export function HabitCard({ habit, completion, streak, onCheckIn, onDelete, loading }: HabitCardProps) {
  const [isChecked, setIsChecked] = useState(!!completion);
  const [isGlowing, setIsGlowing] = useState(false);
  const xpEarned = completion?.xp_earned || 0;

  useEffect(() => {
    setIsChecked(!!completion);
  }, [completion]);

  const handleCheckIn = async () => {
    if (!isChecked) {
      setIsGlowing(true);
      try {
        await onCheckIn(habit.id);
        setIsChecked(true);
        setTimeout(() => setIsGlowing(false), 500);
      } catch (error) {
        console.error('Check-in failed:', error);
        setIsChecked(false);
        setIsGlowing(false);
      }
    }
  };

  const handleClick = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 300);
  };

  const getIconComponent = () => {
    return ICON_MAP[habit.icon] || '⭐';
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className={`group relative backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 ${
        isChecked
          ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
      style={{ 
        borderColor: isChecked ? habit.color + '50' : undefined,
        boxShadow: isGlowing 
          ? `0 0 30px ${habit.color}80, 0 0 60px ${habit.color}40` 
          : undefined,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit.id);
          }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400 z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={`text-4xl ${isChecked ? 'scale-110' : ''} transition-transform`}
            style={{ filter: isChecked ? `drop-shadow(0 0 8px ${habit.color}80)` : undefined }}
          >
            {getIconComponent()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{habit.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{habit.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {streak && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">{streak.current_streak}</span>
            <span className="text-xs text-orange-400/70">day{streak.current_streak !== 1 ? 's' : ''}</span>
          </div>
        )}
        {isChecked && xpEarned > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">+{xpEarned} XP</span>
          </div>
        )}
        {streak && streak.freeze_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-2 py-1">
            <Zap className="w-3 h-3" />
            <span>{streak.freeze_count} freezes</span>
          </div>
        )}
      </div>

      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          handleCheckIn();
        }}
        disabled={loading || isChecked}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          isChecked
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default'
            : 'text-white hover:shadow-lg'
        }`}
        style={{
          background: isChecked 
            ? undefined 
            : `linear-gradient(135deg, ${habit.color}, ${habit.color}dd)`,
          boxShadow: isChecked ? undefined : `0 4px 15px ${habit.color}40`,
        }}
      >
        {isChecked && <Check className="w-5 h-5" />}
        {isChecked ? 'Completed Today' : 'Check In'}
      </motion.button>

      {isChecked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-5 h-5 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
