/**
 * useDailyChallenge — unified hook for the Daily Challenge + Streak Bonus system.
 *
 * Responsibilities (single system, single entry point):
 *  - Start the daily challenge (once-per-day guard)
 *  - Generate the challenge with fixed difficulty parameters (DAILY_CHALLENGE_CONFIG)
 *  - Award the streak bonus + optional milestone bonus on win
 *  - Handle streak buyback when the player missed a day
 *  - Mark the daily as completed today (fixes the lastDailyCompleted gap)
 */
import { useCallback, useEffect, useRef } from 'react';
import {
  GameMode, GameState, ActiveModifier, StreakReward, DailyChallengeConfig,
} from '../types';
import { DAILY_MODIFIERS, MILESTONE_BONUSES, DAILY_STREAK_REWARDS } from '../constants';
import {
  hasCompletedToday, isStreakExpired, getBuybackCost,
  getDailyModifierIndex, getTodayKey, getDailyChallengeConfig, calculateNewStreak,
} from '../utils/dailyChallenge';

interface UseDailyChallengeProps {
  streakCount: number;
  lastStreakTimestamp: number;
  lastDailyCompleted: string | null;
  coins: number;
  gameState: GameState;
  isDailyChallenge: boolean;
  setStreakCount: (v: number) => void;
  setLastStreakTimestamp: (v: number) => void;
  setLastDailyCompleted: (v: string | null) => void;
  setCoins: (fn: (prev: number) => number) => void;
  setPowerupInventory: (fn: (prev: Record<string, number>) => Record<string, number>) => void;
  setStreakReward: (reward: StreakReward | null) => void;
  setIsDailyChallenge: (v: boolean) => void;
  setActiveModifier: (v: ActiveModifier | null) => void;
  setUnlockedGameModes: (fn: (prev: GameMode[]) => GameMode[]) => void;
  setGameMode: (v: GameMode) => void;
  startLevel: (
    levelIdx: number,
    isNewGame?: boolean,
    modifierOverride?: ActiveModifier | null,
    dailyOverride?: DailyChallengeConfig,
  ) => void;
  playSound: (freq: number, type: OscillatorType, vol: number, dur?: number) => void;
}

/** Apply a regular streak reward to the game state. */
const applyReward = (
  reward: StreakReward,
  setCoins: (fn: (prev: number) => number) => void,
  setPowerupInventory: (fn: (prev: Record<string, number>) => Record<string, number>) => void,
) => {
  if (reward.type === 'coins') {
    setCoins((prev) => Math.min(9999, prev + reward.amount));
  } else if (reward.type === 'powerup' && reward.powerupId) {
    const id = reward.powerupId as string;
    setPowerupInventory((prev) => ({ ...prev, [id]: Math.min(99, (prev[id] || 0) + 1) }));
  }
};

export const useDailyChallenge = ({
  streakCount, lastStreakTimestamp, lastDailyCompleted, coins,
  gameState, isDailyChallenge,
  setStreakCount, setLastStreakTimestamp, setLastDailyCompleted,
  setCoins, setPowerupInventory, setStreakReward,
  setIsDailyChallenge, setActiveModifier, setUnlockedGameModes, setGameMode,
  startLevel, playSound,
}: UseDailyChallengeProps) => {
  const streakProcessedRef = useRef(false);

  // ── Derived state ──────────────────────────────────────────────────────────
  const completedToday = hasCompletedToday(lastDailyCompleted);
  const streakExpired  = isStreakExpired(lastStreakTimestamp);
  const buybackCost    = getBuybackCost(streakCount);
  const canBuyback     = streakCount > 1 && streakExpired && !completedToday && coins >= buybackCost;

  // ── Start daily challenge (once-per-day guard is here — single source of truth) ──
  const startDailyChallenge = useCallback(() => {
    if (completedToday) return;
    const config   = getDailyChallengeConfig();
    const modifier = DAILY_MODIFIERS[getDailyModifierIndex(DAILY_MODIFIERS.length)];
    setIsDailyChallenge(true);
    setActiveModifier(modifier);
    setUnlockedGameModes((prev) => prev.includes('hard') ? prev : [...prev, 'hard']);
    setGameMode(config.gameMode);
    startLevel(0, false, modifier, config);
  }, [completedToday, setIsDailyChallenge, setActiveModifier, setUnlockedGameModes, setGameMode, startLevel]);

  // ── Buy back a broken streak ───────────────────────────────────────────────
  const buybackStreak = useCallback(() => {
    if (!canBuyback) return;
    setCoins((prev) => prev - buybackCost);
    // Simulate a win from 25 h ago so the increment logic fires correctly on today's win
    setLastStreakTimestamp(Date.now() - 25 * 60 * 60 * 1000);
  }, [canBuyback, buybackCost, setCoins, setLastStreakTimestamp]);

  // ── Award streak bonus on daily win ───────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'won' || !isDailyChallenge) {
      streakProcessedRef.current = false;
      return;
    }
    if (streakProcessedRef.current) return;
    streakProcessedRef.current = true;

    const newStreak = calculateNewStreak(streakCount, lastStreakTimestamp);
    if (newStreak === null) return; // duplicate within same day

    // Mark daily as completed today
    setLastDailyCompleted(getTodayKey());
    setStreakCount(newStreak);
    setLastStreakTimestamp(Date.now());

    // Regular daily reward
    const rewardIdx = (newStreak - 1) % DAILY_STREAK_REWARDS.length;
    const reward    = DAILY_STREAK_REWARDS[rewardIdx];
    applyReward(reward, setCoins, setPowerupInventory);
    setStreakReward(reward);
    playSound(1500, 'sine', 0.5, 0.2);
    setTimeout(() => setStreakReward(null), 4000);

    // Milestone bonus (staggered after the regular toast)
    const milestoneBonus = MILESTONE_BONUSES[newStreak as keyof typeof MILESTONE_BONUSES];
    if (milestoneBonus) {
      setTimeout(() => {
        setCoins((prev) => Math.min(9999, prev + milestoneBonus.coins));
        const id = milestoneBonus.powerupId as string;
        setPowerupInventory((prev) => ({ ...prev, [id]: Math.min(99, (prev[id] || 0) + 1) }));
        setStreakReward({ type: 'milestone', amount: milestoneBonus.coins, powerupId: milestoneBonus.powerupId });
        playSound(1800, 'sine', 0.6, 0.3);
        setTimeout(() => setStreakReward(null), 4000);
      }, 4500);
    }
  // Intentionally only re-runs on gameState / isDailyChallenge changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, isDailyChallenge]);

  return { startDailyChallenge, buybackStreak, buybackCost, completedToday, streakExpired, canBuyback };
};
