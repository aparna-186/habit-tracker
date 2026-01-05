// Gamification system for XP, levels, and badge progression

const XP_PER_LEVEL = 500;
const XP_PER_CHECK_IN = 50;

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function calculateXPForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL;
}

export function calculateXPForNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  return xpForNextLevel - xpForCurrentLevel;
}

export function getProgressToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeeded = calculateXPForNextLevel(totalXP);
  return (xpInCurrentLevel / xpNeeded) * 100;
}

export function getXPFromCheckIn(): number {
  return XP_PER_CHECK_IN;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  requirement: BadgeRequirement;
}

export interface BadgeRequirement {
  type: 'streak' | 'total_check_ins' | 'level' | 'daily_complete' | 'all_habits';
  value: number;
}

export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'unlocked' | 'progress'>> = {
  first_step: {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first habit check-in',
    icon: 'Star',
    requirement: { type: 'total_check_ins', value: 1 },
  },
  week_warrior: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak on any habit',
    icon: 'Flame',
    requirement: { type: 'streak', value: 7 },
  },
  consistency_king: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak on any habit',
    icon: 'Crown',
    requirement: { type: 'streak', value: 30 },
  },
  century_club: {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 total check-ins across all habits',
    icon: 'Award',
    requirement: { type: 'total_check_ins', value: 100 },
  },
  triple_threat: {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: 'Complete all three habits in one day',
    icon: 'Zap',
    requirement: { type: 'daily_complete', value: 3 },
  },
  level_10: {
    id: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: 'TrendingUp',
    requirement: { type: 'level', value: 10 },
  },
};

export function checkBadgeProgress(
  stats: { total_xp: number; current_streak: number; level: number },
  checkInData: { totalCheckIns: number; todayCompletedHabits: number }
): string[] {
  const unlockedBadges: string[] = [];

  if (checkInData.totalCheckIns >= 1) {
    unlockedBadges.push('first_step');
  }
  if (stats.current_streak >= 7) {
    unlockedBadges.push('week_warrior');
  }
  if (stats.current_streak >= 30) {
    unlockedBadges.push('consistency_king');
  }
  if (checkInData.totalCheckIns >= 100) {
    unlockedBadges.push('century_club');
  }
  if (checkInData.todayCompletedHabits >= 3) {
    unlockedBadges.push('triple_threat');
  }
  if (stats.level >= 10) {
    unlockedBadges.push('level_10');
  }

  return unlockedBadges;
}

export function getMotivationalMessage(level: number, streak: number): string {
  if (streak === 0) {
    return 'Start your streak today! You got this.';
  }
  if (streak < 7) {
    return `You're on fire! ${streak} day streak going.`;
  }
  if (streak < 30) {
    return `Legendary! ${streak} days of consistency.`;
  }
  if (streak >= 30) {
    return `Ultimate champion! ${streak} days of pure dedication.`;
  }
  return 'Keep pushing forward!';
}

export function calculateStreakFreezeImpact(freezeCount: number, usedFreezes: number): number {
  return Math.max(0, freezeCount - usedFreezes);
}
