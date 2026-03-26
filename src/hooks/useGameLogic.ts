import { useCallback } from 'react';
import { GameMode, GameState, PowerupState, ActiveModifier, Point } from '../types';
import { GAME_MODES, ACHIEVEMENTS, DAILY_MODIFIERS } from '../constants';
import generateMaze, { findPath } from '../utils/mazeGenerator';
import { audioManager } from '../audio/audioManager';

interface UseGameLogicProps {
  gameMode: GameMode;
  isDailyChallenge: boolean;
  maxHealth: number;
  coins: number;
  elapsedTime: number;
  moves: number;
  gameState: GameState;
  playerHealth: number;
  currentLevel: number;
  playerPos: Point;
  exitPos: Point;
  maze: number[][];
  unlockedAchievements: string[];
  isHintActive: boolean;
  setMaze: (v: number[][]) => void;
  setExitPos: (v: Point) => void;
  setPlayerPos: (v: Point) => void;
  setPuzzleState: (v: Set<string>) => void;
  setBreakableWallsHealth: (v: Record<string, number>) => void;
  setCurrentLevel: (v: number) => void;
  setGameState: (v: GameState) => void;
  setMoves: (v: number) => void;
  setElapsedTime: (v: number) => void;
  setIsPaused: (v: boolean) => void;
  setIsHintActive: (v: boolean) => void;
  setHintPath: (v: Point[]) => void;
  setVisitedCells: (v: Set<string>) => void;
  setPlayerTrail: (v: any[]) => void;
  setPlayerHealth: (v: number) => void;
  setIsDoorOpen: (v: boolean) => void;
  setHasKey: (v: boolean) => void;
  setTimeLimit: (v: number | null) => void;
  setActivePowerups: (v: PowerupState) => void;
  setCoins: (fn: (prev: number) => number) => void;
  setIsDailyChallenge: (v: boolean) => void;
  setActiveModifier: (v: ActiveModifier | null) => void;
  setGameMode: (v: GameMode) => void;
  setUnlockedAchievements: (fn: (prev: string[]) => string[]) => void;
  addEntry: (time: number, moves: number, score: number) => void;
}

export const useGameLogic = ({
  gameMode, isDailyChallenge, maxHealth, coins, elapsedTime, moves,
  gameState, playerHealth, currentLevel, playerPos, exitPos, maze,
  unlockedAchievements, isHintActive,
  setMaze, setExitPos, setPlayerPos, setPuzzleState, setBreakableWallsHealth,
  setCurrentLevel, setGameState, setMoves, setElapsedTime, setIsPaused,
  setIsHintActive, setHintPath, setVisitedCells, setPlayerTrail,
  setPlayerHealth, setIsDoorOpen, setHasKey, setTimeLimit, setActivePowerups,
  setCoins, setIsDailyChallenge, setActiveModifier, setGameMode,
  setUnlockedAchievements, addEntry,
}: UseGameLogicProps) => {
  const startLevel = useCallback(
    (levelIdx: number, isNewGame = false) => {
      const config = GAME_MODES[gameMode];
      const width = config.baseSize + Math.floor(levelIdx / 2) * 2;
      const height = config.baseSize + Math.floor(levelIdx / 2) * 2;
      const seed = isDailyChallenge
        ? parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')) + levelIdx
        : undefined;

      const mazeData = generateMaze(width, height, seed, levelIdx, gameMode);
      setMaze(mazeData.maze);
      setExitPos(mazeData.exitPos);
      setPlayerPos(mazeData.playerPos);
      setPuzzleState(mazeData.puzzleState.activeElements);
      setBreakableWallsHealth(mazeData.breakableWallsHealth);
      setCurrentLevel(levelIdx);
      setGameState('playing');
      setMoves(0);
      setElapsedTime(0);
      setIsPaused(false);
      setIsHintActive(false);
      setHintPath([]);
      setVisitedCells(new Set([`${mazeData.playerPos.x},${mazeData.playerPos.y}`]));
      setPlayerTrail([]);
      setPlayerHealth(maxHealth);
      setIsDoorOpen(false);
      setHasKey(false);

      if (config.timeLimit) {
        setTimeLimit(config.timeLimit + levelIdx * 5);
      } else {
        setTimeLimit(null);
      }

      if (isNewGame) {
        setActivePowerups({ shield: false, speed: 0, map: 0 });
      }

      audioManager.playSound(440, 'sine', 0.2);
    },
    [
      gameMode, isDailyChallenge, maxHealth,
      setMaze, setExitPos, setPlayerPos, setPuzzleState, setBreakableWallsHealth,
      setCurrentLevel, setGameState, setMoves, setElapsedTime, setIsPaused,
      setIsHintActive, setHintPath, setVisitedCells, setPlayerTrail,
      setPlayerHealth, setIsDoorOpen, setHasKey, setTimeLimit, setActivePowerups,
    ]
  );

  const nextLevel = useCallback((currentScore = 0) => {
    const nextIdx = currentLevel + 1;
    if (nextIdx >= 10) {
      setGameState('complete');
      addEntry(elapsedTime, moves, currentScore);
    } else {
      startLevel(nextIdx);
    }
  }, [currentLevel, elapsedTime, moves, startLevel, setGameState, addEntry]);

  const restartGame = useCallback(() => {
    setGameState('start');
    setCurrentLevel(0);
    setMoves(0);
    setElapsedTime(0);
    setIsDailyChallenge(false);
    setActiveModifier(null);
  }, [setGameState, setCurrentLevel, setMoves, setElapsedTime, setIsDailyChallenge, setActiveModifier]);

  const revive = useCallback(() => {
    if (coins >= 75) {
      setCoins((prev) => prev - 75);
      setPlayerHealth(maxHealth);
      setGameState('playing');
      audioManager.playSound(660, 'square', 0.3);
    }
  }, [coins, maxHealth, setCoins, setPlayerHealth, setGameState]);

  const useHint = useCallback(() => {
    if (coins >= 50 && !isHintActive) {
      setCoins((prev) => prev - 50);
      const path = findPath(playerPos, exitPos, maze);
      setHintPath(path);
      setIsHintActive(true);
      audioManager.playSound(880, 'sine', 0.4);
      setTimeout(() => setIsHintActive(false), 5000);
    }
  }, [coins, isHintActive, playerPos, exitPos, maze, setCoins, setHintPath, setIsHintActive]);

  const watchAd = useCallback(() => {
    setGameState('loading');
    setTimeout(() => {
      setCoins((prev) => prev + 50);
      setGameState('start');
      audioManager.playSound(1200, 'sine', 0.5, 0.2);
    }, 2000);
  }, [setGameState, setCoins]);

  const startDailyChallenge = useCallback(
    (lastDailyCompleted: string | null) => {
      const today = new Date().toISOString().split('T')[0];
      if (lastDailyCompleted === today) return;
      setIsDailyChallenge(true);
      const daySeed = parseInt(today.replace(/-/g, ''));
      const modifier = DAILY_MODIFIERS[daySeed % DAILY_MODIFIERS.length];
      setActiveModifier(modifier);
      setGameMode('hard');
      startLevel(0);
    },
    [setIsDailyChallenge, setActiveModifier, setGameMode, startLevel]
  );

  const checkAchievements = useCallback(() => {
    ACHIEVEMENTS.forEach((achievement) => {
      if (unlockedAchievements.includes(achievement.id)) return;
      let unlocked = false;
      if (achievement.id === 'first_steps' && moves >= 1) unlocked = true;
      if (achievement.id === 'coin_collector' && coins >= 100) unlocked = true;
      if (achievement.id === 'speed_demon' && elapsedTime < 30 && gameState === 'won') unlocked = true;
      if (achievement.id === 'survivor' && playerHealth === 1 && gameState === 'won') unlocked = true;
      if (achievement.id === 'maze_master' && currentLevel >= 5) unlocked = true;
      if (achievement.id === 'rich' && coins >= 1000) unlocked = true;
      if (unlocked) {
        setUnlockedAchievements((prev) => [...prev, achievement.id]);
        audioManager.playSound(1500, 'sine', 0.5, 0.2);
      }
    });
  }, [
    unlockedAchievements, moves, coins, elapsedTime, gameState,
    playerHealth, currentLevel, setUnlockedAchievements,
  ]);

  return { startLevel, nextLevel, restartGame, revive, useHint, watchAd, startDailyChallenge, checkAchievements };
};
