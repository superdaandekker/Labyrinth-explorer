import { useCallback } from 'react';
import { GameMode, GameState, PowerupState, ActiveModifier, Point, TrailPoint, DailyChallengeConfig } from '../types';
import { GAME_MODES, ACHIEVEMENTS, ILLUSIONARY_WALL, WALL, DAILY_MODIFIERS } from '../constants';
import { getDailyModifierIndex } from '../utils/dailyChallenge';
import generateMaze, { findPath, seededRandom } from '../utils/mazeGenerator';
import { audioManager } from '../audio/audioManager';

interface UseGameLogicProps {
  gameMode: GameMode;
  isDailyChallenge: boolean;
  activeModifier: ActiveModifier | null;
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
  visitedCells: Set<string>;
  usedKey: boolean;
  unlockedThemesCount: number;
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
  setPlayerTrail: (v: TrailPoint[]) => void;
  setPlayerHealth: (v: number) => void;
  setIsDoorOpen: (v: boolean) => void;
  setHasKey: (v: boolean) => void;
  setTimeLimit: (v: number | null) => void;
  setActivePowerups: (v: PowerupState) => void;
  setCoins: (fn: (prev: number) => number) => void;
  setIsDailyChallenge: (v: boolean) => void;
  setActiveModifier: (v: ActiveModifier | null) => void;
  setGameMode: (v: GameMode) => void;
  setUnlockedGameModes: (fn: (prev: GameMode[]) => GameMode[]) => void;
  setUnlockedAchievements: (fn: (prev: string[]) => string[]) => void;
  addEntry: (time: number, moves: number, score: number) => void;
}

export const useGameLogic = ({
  gameMode, isDailyChallenge, activeModifier, maxHealth, coins, elapsedTime, moves,
  gameState, playerHealth, currentLevel, playerPos, exitPos, maze,
  unlockedAchievements, isHintActive, visitedCells, usedKey, unlockedThemesCount,
  setMaze, setExitPos, setPlayerPos, setPuzzleState, setBreakableWallsHealth,
  setCurrentLevel, setGameState, setMoves, setElapsedTime, setIsPaused,
  setIsHintActive, setHintPath, setVisitedCells, setPlayerTrail,
  setPlayerHealth, setIsDoorOpen, setHasKey, setTimeLimit, setActivePowerups,
  setCoins, setIsDailyChallenge, setActiveModifier, setGameMode,
  setUnlockedGameModes, setUnlockedAchievements, addEntry,
}: UseGameLogicProps) => {
  const startLevel = useCallback(
    (levelIdx: number, isNewGame = false, modifierOverride?: ActiveModifier | null, dailyOverride?: DailyChallengeConfig) => {
      const effectiveGameMode = dailyOverride?.gameMode ?? gameMode;
      const config = GAME_MODES[effectiveGameMode];
      const width    = dailyOverride?.width    ?? (config.baseSize + Math.floor(levelIdx / 2) * 2);
      const height   = dailyOverride?.height   ?? (config.baseSize + Math.floor(levelIdx / 2) * 2);
      const mazeLevel = dailyOverride?.mazeLevel ?? levelIdx;
      const seed = (isDailyChallenge || dailyOverride)
        ? parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')) + levelIdx
        : undefined;

      const mazeData = generateMaze(width, height, seed, mazeLevel, effectiveGameMode);

      // Post-process: replace ~15% of interior walls with ILLUSIONARY_WALL
      const effectiveModifier = modifierOverride !== undefined ? modifierOverride : activeModifier;
      if (effectiveModifier?.id === 'ILLUSIONARY_WALLS') {
        const wallCells: Point[] = [];
        for (let y = 1; y < mazeData.maze.length - 1; y++) {
          for (let x = 1; x < mazeData.maze[0].length - 1; x++) {
            if (mazeData.maze[y][x] === WALL) wallCells.push({ x, y });
          }
        }
        const count = Math.floor(wallCells.length * 0.15);
        let rndSeed = seed ?? Date.now();
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(seededRandom(rndSeed++) * wallCells.length);
          mazeData.maze[wallCells[idx].y][wallCells[idx].x] = ILLUSIONARY_WALL;
        }
      }

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
        setActivePowerups({ shield: false, speed: 0, map: 0, jump: 0, jumpPro: 0, ghost: 0, magnet: 0, freeze: 0, teleport: 0 });
      }

      audioManager.playSound(440, 'sine', 0.2);
    },
    [
      gameMode, isDailyChallenge, activeModifier, maxHealth,
      setMaze, setExitPos, setPlayerPos, setPuzzleState, setBreakableWallsHealth,
      setCurrentLevel, setGameState, setMoves, setElapsedTime, setIsPaused,
      setIsHintActive, setHintPath, setVisitedCells, setPlayerTrail,
      setPlayerHealth, setIsDoorOpen, setHasKey, setTimeLimit, setActivePowerups,
    ]
  );

  const nextLevel = useCallback((currentScore = 0) => {
    const nextIdx = currentLevel + 1;
    if (gameMode === 'hard') {
      startLevel(nextIdx);
      return;
    }

    if (nextIdx >= 10) {
      setGameState('complete');
      addEntry(elapsedTime, moves, currentScore);
    } else {
      startLevel(nextIdx);
    }
  }, [currentLevel, gameMode, elapsedTime, moves, startLevel, setGameState, addEntry]);

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
      const modifier = DAILY_MODIFIERS[getDailyModifierIndex(DAILY_MODIFIERS.length)];
      setActiveModifier(modifier);
      setUnlockedGameModes((prev) => prev.includes('hard') ? prev : [...prev, 'hard']);
      setGameMode('hard');
      startLevel(0, false, modifier, { gameMode: 'hard' });
    },
    [setIsDailyChallenge, setActiveModifier, setUnlockedGameModes, setGameMode, startLevel]
  );

  const checkAchievements = useCallback(() => {
    const totalCells = maze.reduce((sum, row) => sum + row.filter(c => c !== 1).length, 0);
    const stats = {
      time: elapsedTime,
      gameState,
      coins,
      level: currentLevel,
      hintUsed: isHintActive,
      visitedRatio: totalCells > 0 ? visitedCells.size / totalCells : 0,
      usedKey,
      unlockedThemesCount,
    };
    ACHIEVEMENTS.forEach((achievement) => {
      if (unlockedAchievements.includes(achievement.id)) return;
      if (achievement.condition(stats)) {
        setUnlockedAchievements((prev) => [...prev, achievement.id]);
        audioManager.playSound(1500, 'sine', 0.5, 0.2);
      }
    });
  }, [
    unlockedAchievements, coins, elapsedTime, gameState, currentLevel,
    isHintActive, visitedCells, usedKey, unlockedThemesCount, maze,
    setUnlockedAchievements,
  ]);

  return { startLevel, nextLevel, restartGame, revive, useHint, watchAd, startDailyChallenge, checkAchievements };
};
