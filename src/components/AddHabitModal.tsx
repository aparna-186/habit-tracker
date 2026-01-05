import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
  userId: string;
}

const HABIT_COLORS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
];

const HABIT_ICONS = [
  { name: 'Brain', emoji: '🧠' },
  { name: 'Code', emoji: '💻' },
  { name: 'MessageCircle', emoji: '💬' },
  { name: 'Book', emoji: '📚' },
  { name: 'Dumbbell', emoji: '🏋️' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Heart', emoji: '❤️' },
  { name: 'Star', emoji: '⭐' },
];

export function AddHabitModal({ isOpen, onClose, onHabitAdded, userId }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0].name);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Create the habit
      const habitDoc = await addDoc(collection(db, 'habits'), {
        name: name.trim(),
        description: description.trim() || 'Track your progress',
        icon: selectedIcon,
        color: selectedColor,
        target_frequency: 1,
        user_id: userId,
        created_at: serverTimestamp(),
      });

      // Initialize streak for the new habit
      await addDoc(collection(db, 'streaks'), {
        user_id: userId,
        habit_id: habitDoc.id,
        current_streak: 0,
        longest_streak: 0,
        last_completed: null,
        freeze_count: 3,
        updated_at: serverTimestamp(),
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedColor(HABIT_COLORS[0].value);
      setSelectedIcon(HABIT_ICONS[0].name);
      
      onHabitAdded();
      onClose();
    } catch (error) {
      console.error('Error adding habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6">
                Create New Habit
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Habit Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Exercise"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What do you want to achieve?"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition resize-none"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setSelectedIcon(icon.name)}
                        className={`p-3 rounded-lg border-2 transition ${
                          selectedIcon === icon.name
                            ? 'border-blue-400 bg-blue-400/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl">{icon.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Choose Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {HABIT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-10 h-10 rounded-lg transition ${
                          selectedColor === color.value
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Creating...'
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Habit
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}