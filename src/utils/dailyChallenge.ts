import { DAILY_CHALLENGE_CONFIG, DAILY_STREAK_REWARDS, MILESTONE_BONUSES } from '../constants';
import { DailyChallengeConfig, MilestoneBonus, StreakReward } from '../types';

const ONE_DAY  = 86_400_000;  // ms
const TWO_DAYS = 172_800_000; // ms

/** Returns today's key string (YYYY-MM-DD). */
export const getTodayKey = (): string =>
  new Date().toISOString().split('T')[0];

/** Returns a stable index for the daily modifier based on the day of the year. */
export const getDailyModifierIndex = (modifierCount: number): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((+now - +startOfYear) / ONE_DAY);
  return dayOfYear % modifierCount;
};

/** Returns true if the daily challenge has already been completed today. */
export const hasCompletedToday = (lastDailyCompleted: string | null): boolean =>
  lastDailyCompleted === getTodayKey();

/**
 * Returns true if the streak has expired (more than 48 h since last win).
 * A timestamp of 0 means the player has never won — streak has not started yet,
 * so it is not considered "expired".
 */
export const isStreakExpired = (lastStreakTimestamp: number): boolean =>
  lastStreakTimestamp > 0 && Date.now() - lastStreakTimestamp >= TWO_DAYS;

/** Returns the coin cost to buy back a broken streak: streakCount × 20. */
export const getBuybackCost = (streakCount: number): number =>
  streakCount * 20;

/** Returns the date-based seed for the daily challenge maze. */
export const getDailySeed = (): number =>
  parseInt(getTodayKey().replace(/-/g, ''));

/** Returns the fixed config used to generate the daily challenge maze. */
export const getDailyChallengeConfig = (): DailyChallengeConfig =>
  DAILY_CHALLENGE_CONFIG;

/** Returns the regular streak reward for a given streak day (1-based, wraps at 50). */
export const getDailyStreakReward = (streakDay: number): StreakReward => {
  const idx = (streakDay - 1) % DAILY_STREAK_REWARDS.length;
  return DAILY_STREAK_REWARDS[idx];
};

/** Returns the milestone bonus for a given streak day, or null if none. */
export const getMilestoneBonus = (streakDay: number): MilestoneBonus | null =>
  MILESTONE_BONUSES[streakDay] ?? null;

/** Calculates the new streak count after a daily win. Returns null when the win is a duplicate (already counted today). */
export const calculateNewStreak = (
  streakCount: number,
  lastStreakTimestamp: number,
): number | null => {
  const elapsed = Date.now() - lastStreakTimestamp;
  if (lastStreakTimestamp === 0 || elapsed >= TWO_DAYS) return 1;
  if (elapsed < ONE_DAY) return null; // duplicate — already rewarded today
  return (streakCount % 50) + 1;
};
