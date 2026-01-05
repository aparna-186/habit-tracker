export interface Profile {
  id: string;
  firebase_uid: string;
  username: string;
  email: string;
  total_xp: number;
  level: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  icon: string;
  color: string;
  target_frequency: number;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
  notes?: string;
}

export interface Streak {
  id: string;
  user_id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed: string | null;
  freeze_count: number;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: number;
}
