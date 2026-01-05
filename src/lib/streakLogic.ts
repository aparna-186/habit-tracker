/**
 * Streak management logic
 * Handles 24-hour window enforcement and automatic streak resets
 */

export interface StreakCheckResult {
  shouldReset: boolean;
  daysSinceLastCompletion: number;
  isWithin24Hours: boolean;
}

/**
 * Check if a streak should be reset based on 24-hour rule
 * @param lastCompleted - ISO date string of last completion or null
 * @returns Object with reset information
 */
export function checkStreakReset(lastCompleted: string | null): StreakCheckResult {
  if (!lastCompleted) {
    return {
      shouldReset: false,
      daysSinceLastCompletion: Infinity,
      isWithin24Hours: false,
    };
  }

  const lastCompletedDate = new Date(lastCompleted);
  const now = new Date();
  const hoursSinceCompletion = (now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60);
  const daysSinceCompletion = Math.floor(hoursSinceCompletion / 24);

  // If more than 24 hours have passed, streak should reset
  const shouldReset = hoursSinceCompletion > 24;
  const isWithin24Hours = hoursSinceCompletion <= 24;

  return {
    shouldReset,
    daysSinceLastCompletion: daysSinceCompletion,
    isWithin24Hours,
  };
}

/**
 * Calculate the new streak value after checking completion
 * @param currentStreak - Current streak count
 * @param lastCompleted - Last completion date or null
 * @param todayCompleted - Whether habit was completed today
 * @returns New streak count
 */
export function calculateStreak(
  currentStreak: number,
  lastCompleted: string | null,
  todayCompleted: boolean
): number {
  if (todayCompleted) {
    // If completed today, check if we're continuing a streak
    if (!lastCompleted) {
      return 1; // First completion
    }

    const lastDate = new Date(lastCompleted);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day - don't increment
      return currentStreak;
    } else if (daysDiff === 1) {
      // Consecutive day - increment
      return currentStreak + 1;
    } else {
      // Gap in days - reset to 1
      return 1;
    }
  } else {
    // Not completed today - check if streak should reset
    const checkResult = checkStreakReset(lastCompleted);
    return checkResult.shouldReset ? 0 : currentStreak;
  }
}

/**
 * Check if a habit can be completed today (one check per day rule)
 * @param completions - Array of completion dates for today
 * @param habitId - The habit ID to check
 * @returns Whether the habit can be checked in
 */
export function canCompleteToday(completions: Array<{ habit_id: string; completed_at: string }>, habitId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return !completions.some(
    (c) => c.habit_id === habitId && c.completed_at === today
  );
}
