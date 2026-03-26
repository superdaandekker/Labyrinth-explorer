import { useState, useCallback } from 'react';
import { LeaderboardEntry, GameMode } from '../types';

const STORAGE_KEY = 'labyrinth_leaderboard';
const MAX_ENTRIES = 10;

export const useLeaderboard = (gameMode: GameMode) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addEntry = useCallback(
    (time: number, moves: number, score: number) => {
      const newEntry: LeaderboardEntry = {
        gameMode, time, moves, score,
        date: new Date().toLocaleDateString(),
      };
      setLeaderboard((prev) => {
        const updated = [...prev, newEntry]
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, MAX_ENTRIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [gameMode]
  );

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLeaderboard(JSON.parse(saved));
    } catch {
      // corrupt storage — leave as empty
    }
  }, []);

  return { leaderboard, addEntry, loadFromStorage, setLeaderboard };
};
