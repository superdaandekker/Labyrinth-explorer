import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Point, GameState, GameMode, ThemeType, PowerupState, PowerupInventory, ActiveModifier, JoystickState, TrailPoint, TutorialConfig, StreakReward } from './types';
import { CELL_SIZE, WALL, PATH, BREAKABLE_WALL, COIN, PRESSURE_PLATE, DOOR, LEVER, SPIKES, POISON_GAS, POWERUP_SHIELD, POWERUP_SPEED, POWERUP_MAP, KEY, KEY_DOOR, ILLUSIONARY_WALL, VIEWPORT_SIZE, THEMES, TUTORIALS, DAILY_STREAK_REWARDS } from './constants';
import { findPath } from './utils/mazeGenerator';

import { useAudio } from './hooks/useAudio';
import { useGameLogic } from './hooks/useGameLogic';
import { useShop } from './hooks/useShop';
import { useSaveLoad } from './hooks/useSaveLoad';
import { calculateScore, getScoreRank } from './hooks/useScore';
import { formatTime } from './utils/formatTime';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useUIState } from './hooks/useUIState';
import { usePlayerAnim } from './hooks/usePlayerAnim';

import TopBar from './components/TopBar';
import StartMenu from './components/StartMenu';
import GameUI from './components/GameUI';
import SettingsModal from './components/Modals/SettingsModal';
import ShopModal from './components/Modals/ShopModal';
import AchievementsModal from './components/Modals/AchievementsModal';
import LeaderboardModal from './components/Modals/LeaderboardModal';
import TutorialModal from './components/Modals/TutorialModal';
import EndScreen from './components/EndScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Point>({ x: 1, y: 1 });
  const [exitPos, setExitPos] = useState<Point>({ x: 1, y: 1 });
  const [moves, setMoves] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [unlockedGameModes, setUnlockedGameModes] = useState<GameMode[]>(['normal']);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [activeModifier, setActiveModifier] = useState<ActiveModifier | null>(null);
  const [lastDailyCompleted, setLastDailyCompleted] = useState<string | null>(null);

  const [playerHealth, setPlayerHealth] = useState(3);
  const [maxHealth] = useState(3);
  const { damageFlash, isBumping, isDashing, moveDirection, previousPos,
          setDamageFlash, setIsBumping, setIsDashing, setMoveDirection, setPreviousPos } = usePlayerAnim();

  const [theme, setTheme] = useState<ThemeType>('default');
  const [unlockedThemes, setUnlockedThemes] = useState<ThemeType[]>(['default']);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [controlScheme, setControlScheme] = useState<'swipe' | 'joystick'>('swipe');
  const { showSettings, showShop, showAchievements, showLeaderboard,
          isPaused, shopCategory, shopSort,
          setShowSettings, setShowShop, setShowAchievements, setShowLeaderboard,
          setIsPaused, setShopCategory, setShopSort } = useUIState();
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const [activePowerups, setActivePowerups] = useState<PowerupState>({ shield: false, speed: 0, map: 0, jump: 0, jumpPro: 0, ghost: 0, magnet: 0, freeze: 0, teleport: 0 });
  const [powerupInventory, setPowerupInventory] = useState<PowerupInventory>(() => {
    try { const s = localStorage.getItem('powerupInventory'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const powerupInventoryRef = useRef<PowerupInventory>({});
  const [streakCount, setStreakCount] = useState(0);
  const [lastStreakTimestamp, setLastStreakTimestamp] = useState(0);
  const [streakReward, setStreakReward] = useState<StreakReward | null>(null);
  const streakProcessedRef = useRef(false);
  const [jumpProActive, setJumpProActive] = useState(false);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [playerTrail, setPlayerTrail] = useState<TrailPoint[]>([]);
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintPath, setHintPath] = useState<Point[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [joystick, setJoystick] = useState<JoystickState | null>(null);
  const consecutiveMovesRef = useRef<{ dx: number; dy: number; count: number }>({ dx: 0, dy: 0, count: 0 });
  const [shownTutorials, setShownTutorials] = useState<Set<string>>(new Set());
  const [activeTutorial, setActiveTutorial] = useState<TutorialConfig | null>(null);

  const [puzzleState, setPuzzleState] = useState<Set<string>>(new Set());
  const [breakableWallsHealth, setBreakableWallsHealth] = useState<Record<string, number>>({});
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);

  const playerPosRef = useRef(playerPos);
  const mazeRef = useRef(maze);
  const gameStateRef = useRef(gameState);
  const lastMoveTimeRef = useRef(0);
  const autoSaveRef = useRef({
    currentLevel, gameMode, soundEnabled, theme, coins,
    unlockedThemes, unlockedAchievements, lastDailyCompleted,
    sfxVolume, musicVolume, controlScheme, shownTutorials,
    gameState, unlockedGameModes, activePowerups, playerHealth,
    streakCount, lastStreakTimestamp,
  });

  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { mazeRef.current = maze; }, [maze]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { powerupInventoryRef.current = powerupInventory; }, [powerupInventory]);
  useEffect(() => { localStorage.setItem('powerupInventory', JSON.stringify(powerupInventory)); }, [powerupInventory]);
  useEffect(() => {
    autoSaveRef.current = {
      currentLevel, gameMode, soundEnabled, theme, coins,
      unlockedThemes, unlockedAchievements, lastDailyCompleted,
      sfxVolume, musicVolume, controlScheme, shownTutorials,
      gameState, unlockedGameModes, activePowerups, playerHealth,
      streakCount, lastStreakTimestamp,
    };
  }, [currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, shownTutorials, gameState, unlockedGameModes, activePowerups, playerHealth, streakCount, lastStreakTimestamp]);

  // Audio — playSound available via hook
  const { playSound } = useAudio({ soundEnabled, sfxVolume, musicVolume, gameState, exitPos, playerPosRef });

  // Leaderboard
  const { leaderboard, addEntry, loadFromStorage } = useLeaderboard(gameMode);

  // Game Logic
  const {
    startLevel, nextLevel, restartGame, revive, useHint,
    watchAd, startDailyChallenge, checkAchievements,
  } = useGameLogic({
    gameMode, isDailyChallenge, activeModifier, maxHealth, coins, elapsedTime, moves,
    gameState, playerHealth, currentLevel, playerPos, exitPos, maze,
    unlockedAchievements, isHintActive,
    setMaze, setExitPos, setPlayerPos, setPuzzleState, setBreakableWallsHealth,
    setCurrentLevel, setGameState, setMoves, setElapsedTime, setIsPaused,
    setIsHintActive, setHintPath, setVisitedCells, setPlayerTrail,
    setPlayerHealth, setIsDoorOpen, setHasKey, setTimeLimit, setActivePowerups,
    setCoins, setIsDailyChallenge, setActiveModifier, setGameMode,
    setUnlockedGameModes, setUnlockedAchievements, addEntry,
  });

  // Shop
  const { buyGameMode, buyTheme, buyPowerup, buyCoins } = useShop({
    coins, gameMode, unlockedGameModes, unlockedThemes,
    setCoins, setUnlockedGameModes, setGameMode,
    setUnlockedThemes, setTheme, setPowerupInventory,
  });

  // Save/Load
  const { saveProgress, loadInitialData, loadSavedGame } = useSaveLoad({
    autoSaveRef, activePowerups, setHasSavedGame,
    setUnlockedThemes, setUnlockedAchievements, setCoins, setLastDailyCompleted,
    setSoundEnabled, setSfxVolume, setMusicVolume, setControlScheme,
    setShownTutorials, setUnlockedGameModes,
    setGameMode, setTheme, setActivePowerups, setPowerupInventory, setPlayerHealth,
    setStreakCount, setLastStreakTimestamp, startLevel,
  });

  useEffect(() => {
    loadInitialData();
    loadFromStorage();
  }, [loadInitialData, loadFromStorage]);

  useEffect(() => {
    if (gameState === 'won' || gameState === 'complete') checkAchievements();
  }, [gameState, checkAchievements]);

  // Reset per-run state on new level
  useEffect(() => {
    if (gameState === 'playing') {
      setHasKey(false);
      setCoinsCollected(0);
      consecutiveMovesRef.current = { dx: 0, dy: 0, count: 0 };
    }
  }, [currentLevel, gameState]);

  const [dynamicCellSize, setDynamicCellSize] = useState(CELL_SIZE);
  useEffect(() => {
    const handleResize = () => {
      if (gameState === 'playing' && maze.length > 0) {
        const availableWidth = window.innerWidth - 32;
        const availableHeight = window.innerHeight - 300;
        const size = Math.floor(Math.min(availableWidth, availableHeight) / VIEWPORT_SIZE);
        setDynamicCellSize(Math.min(60, Math.max(35, size)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState, maze]);

  // Movement Logic (PROTECTED)
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing' || isPaused) return;

    const now = Date.now();
    const moveDelay = activePowerups.speed > now ? 75 : 150;
    if (now - lastMoveTimeRef.current < moveDelay) return;

    let actualDx = dx;
    let actualDy = dy;
    if (activeModifier?.id === 'REVERSED_GRAVITY') { actualDx = -dx; actualDy = -dy; }

    // Momentum tracking (no dash — use Jump powerup instead)
    const prevMomentum = consecutiveMovesRef.current;
    if (prevMomentum.dx === actualDx && prevMomentum.dy === actualDy) {
      consecutiveMovesRef.current = { dx: actualDx, dy: actualDy, count: prevMomentum.count + 1 };
    } else {
      consecutiveMovesRef.current = { dx: actualDx, dy: actualDy, count: 1 };
    }

    const newX = playerPosRef.current.x + actualDx;
    const newY = playerPosRef.current.y + actualDy;

    if (newX < 0 || newX >= mazeRef.current[0].length || newY < 0 || newY >= mazeRef.current.length) return;

    const cell = mazeRef.current[newY][newX];

    if (cell === KEY_DOOR && !hasKey) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      return;
    }

    if (cell === ILLUSIONARY_WALL) {
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(880, 'sine', 0.25, 0.07);
      // fall through — movement continues normally
    }

    if (cell === WALL && activePowerups.ghost > 0) {
      const beyondX = newX + actualDx;
      const beyondY = newY + actualDy;
      if (
        beyondX >= 0 && beyondX < mazeRef.current[0].length &&
        beyondY >= 0 && beyondY < mazeRef.current.length &&
        mazeRef.current[beyondY][beyondX] !== WALL
      ) {
        setActivePowerups((prev) => ({ ...prev, ghost: prev.ghost - 1 }));
        performJump(actualDx, actualDy);
        return;
      }
    }

    if (cell === WALL || (cell === DOOR && !isDoorOpen)) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      return;
    }

    if (cell === BREAKABLE_WALL) {
      const wallKey = `${newX},${newY}`;
      const health = (breakableWallsHealth[wallKey] ?? 3) - 1;
      if (health <= 0) {
        setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
        playSound(300, 'square', 0.2);
      } else {
        setBreakableWallsHealth((prev) => ({ ...prev, [wallKey]: health }));
        playSound(200, 'square', 0.1);
      }
      return;
    }

    setPreviousPos(playerPosRef.current);
    setPlayerPos({ x: newX, y: newY });
    if (actualDx > 0) setMoveDirection('right');
    else if (actualDx < 0) setMoveDirection('left');
    else if (actualDy > 0) setMoveDirection('down');
    else if (actualDy < 0) setMoveDirection('up');
    setMoves((prev) => prev + 1);
    lastMoveTimeRef.current = now;
    setVisitedCells((prev) => new Set(prev).add(`${newX},${newY}`));
    setPlayerTrail((prev) => [{ x: newX, y: newY, id: now }, ...prev.slice(0, 4)]);

    if (cell === COIN) {
      setCoins((prev) => prev + 10);
      setCoinsCollected((prev) => prev + 1);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(1200, 'sine', 0.1, 0.1);
    } else if (cell === POWERUP_SHIELD) {
      setActivePowerups((prev) => ({ ...prev, shield: true }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(800, 'sine', 0.3);
    } else if (cell === POWERUP_SPEED) {
      setActivePowerups((prev) => ({ ...prev, speed: Date.now() + 10000 }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(1000, 'sine', 0.3);
    } else if (cell === POWERUP_MAP) {
      setActivePowerups((prev) => ({ ...prev, map: Date.now() + 5000 }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(900, 'sine', 0.3);
    } else if (cell === KEY) {
      setHasKey(true);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(1400, 'sine', 0.3);
      if (!shownTutorials.has('key')) {
        setActiveTutorial(TUTORIALS.key);
        setShownTutorials((prev) => new Set(prev).add('key'));
      }
    } else if (cell === KEY_DOOR && hasKey) {
      setHasKey(false);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(600, 'square', 0.3);
    } else if (cell === PRESSURE_PLATE || cell === LEVER) {
      setPuzzleState((prev) => new Set(prev).add(`${newX},${newY}`));
      setIsDoorOpen(true);
      playSound(400, 'square', 0.2);
    } else if (cell === SPIKES || cell === POISON_GAS) {
      if (activePowerups.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else if (activePowerups.freeze > Date.now()) {
        // Freeze active — no damage
      } else {
        setPlayerHealth((prev) => {
          const next = prev - 1;
          if (next <= 0) setGameState('gameover');
          return next;
        });
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        playSound(100, 'square', 0.4);
      }
    }

    if (newX === exitPos.x && newY === exitPos.y) {
      if (activeModifier?.id === 'COLLECT_ALL_COINS') {
        const hasCoins = mazeRef.current.some((row) => row.includes(COIN));
        if (hasCoins) { playSound(200, 'sine', 0.2); return; }
      }
      setGameState('won');
      playSound(880, 'sine', 0.5);
    }

    if (!shownTutorials.has('movement')) {
      setActiveTutorial(TUTORIALS.movement);
      setShownTutorials((prev) => new Set(prev).add('movement'));
    }
    if (cell === COIN && !shownTutorials.has('coins')) {
      setActiveTutorial(TUTORIALS.coins);
      setShownTutorials((prev) => new Set(prev).add('coins'));
    }
  }, [
    gameState, isPaused, activePowerups, activeModifier, isDoorOpen, hasKey,
    breakableWallsHealth, exitPos, shownTutorials, playSound,
  ]);

  // Jump: shared movement logic — 2 cells, no wall check
  const performJump = useCallback((dx: number, dy: number) => {
    if (gameStateRef.current !== 'playing' || isPaused) return;
    const newX = playerPosRef.current.x + dx * 2;
    const newY = playerPosRef.current.y + dy * 2;
    if (newX < 0 || newX >= mazeRef.current[0].length || newY < 0 || newY >= mazeRef.current.length) return;
    const cell = mazeRef.current[newY][newX];
    const now = Date.now();
    setPreviousPos(playerPosRef.current);
    setPlayerPos({ x: newX, y: newY });
    if (dx > 0) setMoveDirection('right');
    else if (dx < 0) setMoveDirection('left');
    else if (dy > 0) setMoveDirection('down');
    else if (dy < 0) setMoveDirection('up');
    setMoves((prev) => prev + 1);
    lastMoveTimeRef.current = now;
    setVisitedCells((prev) => new Set(prev).add(`${newX},${newY}`));
    setPlayerTrail((prev) => [{ x: newX, y: newY, id: now }, ...prev.slice(0, 4)]);
    setIsDashing(true);
    setTimeout(() => setIsDashing(false), 200);
    playSound(880, 'sine', 0.2, 0.1);
    if (cell === COIN) {
      setCoins((prev) => prev + 10);
      setCoinsCollected((prev) => prev + 1);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
    } else if (cell === POWERUP_SHIELD) {
      setActivePowerups((prev) => ({ ...prev, shield: true }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
    } else if (cell === POWERUP_SPEED) {
      setActivePowerups((prev) => ({ ...prev, speed: Date.now() + 10000 }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
    } else if (cell === POWERUP_MAP) {
      setActivePowerups((prev) => ({ ...prev, map: Date.now() + 5000 }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
    } else if (cell === KEY) {
      setHasKey(true);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
      playSound(1400, 'sine', 0.3);
    } else if (cell === SPIKES || cell === POISON_GAS) {
      if (activePowerups.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
      } else if (activePowerups.freeze > Date.now()) {
        // Freeze active — no damage
      } else {
        setPlayerHealth((prev) => {
          const next = prev - 1;
          if (next <= 0) setGameState('gameover');
          return next;
        });
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        playSound(100, 'square', 0.4);
      }
    }
    if (newX === exitPos.x && newY === exitPos.y) {
      setGameState('won');
      playSound(880, 'sine', 0.5);
    }
  }, [isPaused, activePowerups, exitPos, playSound]);

  const useJump = useCallback(() => {
    if ((powerupInventoryRef.current['jump'] || 0) <= 0) return;
    const dirMap: Record<string, { dx: number; dy: number }> = {
      right: { dx: 1, dy: 0 }, left: { dx: -1, dy: 0 },
      down: { dx: 0, dy: 1 }, up: { dx: 0, dy: -1 },
    };
    const { dx, dy } = dirMap[moveDirection];
    setPowerupInventory((prev) => ({ ...prev, jump: Math.max(0, (prev.jump || 0) - 1) }));
    performJump(dx, dy);
  }, [moveDirection, performJump]);

  const useJumpPro = useCallback(() => {
    if ((powerupInventoryRef.current['jumpPro'] || 0) <= 0) return;
    setJumpProActive(true);
  }, []);

  const executeJumpPro = useCallback((dx: number, dy: number) => {
    setPowerupInventory((prev) => ({ ...prev, jumpPro: Math.max(0, (prev.jumpPro || 0) - 1) }));
    setJumpProActive(false);
    performJump(dx, dy);
  }, [performJump]);

  const cancelJumpPro = useCallback(() => {
    setJumpProActive(false);
  }, []);

  const useTeleport = useCallback(() => {
    if ((powerupInventoryRef.current['teleport'] || 0) <= 0) return;
    const path = findPath(playerPosRef.current, exitPos, mazeRef.current);
    // path[0] is current pos, path[last] is exit — pick from positions 1..length-2
    if (path.length < 2) return;
    const candidates = path.slice(1, -1);
    if (candidates.length === 0) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    setPowerupInventory((prev) => ({ ...prev, teleport: Math.max(0, (prev.teleport || 0) - 1) }));
    setPlayerPos(target);
    setVisitedCells((prev) => new Set(prev).add(`${target.x},${target.y}`));
    setPlayerTrail((prev) => [{ x: target.x, y: target.y, id: Date.now() }, ...prev.slice(0, 4)]);
    setIsDashing(true);
    setTimeout(() => setIsDashing(false), 300);
    playSound(1400, 'sine', 0.3, 0.15);
  }, [exitPos, playSound]);

  // Activate a timed powerup from inventory → sets activePowerups timer
  const activatePowerup = useCallback((id: string) => {
    if ((powerupInventoryRef.current[id] || 0) <= 0) return;
    setPowerupInventory((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
    if (id === 'shield') setActivePowerups((p) => ({ ...p, shield: true }));
    if (id === 'speed') setActivePowerups((p) => ({ ...p, speed: Date.now() + 30000 }));
    if (id === 'map') setActivePowerups((p) => ({ ...p, map: Date.now() + 60000 }));
    if (id === 'ghost') setActivePowerups((p) => ({ ...p, ghost: Math.min(99, p.ghost + 1) }));
    if (id === 'magnet') setActivePowerups((p) => ({ ...p, magnet: Date.now() + 15000 }));
    if (id === 'freeze') setActivePowerups((p) => ({ ...p, freeze: Date.now() + 10000 }));
    playSound(1200, 'sine', 0.3);
  }, [playSound]);

  // Magnet: auto-collect coins within 3 cells every 300ms
  useEffect(() => {
    if (activePowerups.magnet <= Date.now()) return;
    const interval = setInterval(() => {
      if (activePowerups.magnet <= Date.now()) return;
      const { x: px, y: py } = playerPosRef.current;
      const collected: string[] = [];
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const nx = px + dx, ny = py + dy;
          if (ny >= 0 && ny < mazeRef.current.length && nx >= 0 && nx < mazeRef.current[0].length) {
            if (mazeRef.current[ny][nx] === COIN) collected.push(`${nx},${ny}`);
          }
        }
      }
      if (collected.length > 0) {
        setMaze((prev) => {
          const next = prev.map(r => [...r]);
          collected.forEach((key) => { const [x, y] = key.split(',').map(Number); next[y][x] = PATH; });
          return next;
        });
        setCoins((prev) => prev + collected.length * 10);
        setCoinsCollected((prev) => prev + collected.length);
        playSound(1200, 'sine', 0.1, 0.05);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [activePowerups.magnet, playSound]);

  // Streak: award on daily challenge win
  useEffect(() => {
    if (gameState !== 'won' || !isDailyChallenge) {
      streakProcessedRef.current = false;
      return;
    }
    if (streakProcessedRef.current) return;
    streakProcessedRef.current = true;

    const now = Date.now();
    const elapsed = now - lastStreakTimestamp;
    const oneDay = 24 * 60 * 60 * 1000;
    const twoDays = 48 * 60 * 60 * 1000;

    let newStreak: number;
    if (lastStreakTimestamp === 0 || elapsed >= twoDays) {
      newStreak = 1;
    } else if (elapsed < oneDay) {
      // Already won today — no duplicate reward
      return;
    } else {
      newStreak = (streakCount % 50) + 1;
    }

    const rewardIdx = (newStreak - 1) % DAILY_STREAK_REWARDS.length;
    const reward = DAILY_STREAK_REWARDS[rewardIdx];

    setStreakCount(newStreak);
    setLastStreakTimestamp(now);

    // Apply reward
    if (reward.type === 'coins') {
      setCoins((prev) => Math.min(9999, prev + reward.amount));
    } else if (reward.type === 'powerup' && reward.powerupId) {
      const id = reward.powerupId;
      const count = reward.amount;
      setActivePowerups((prev) => {
        const val = prev[id];
        if (typeof val === 'boolean') return { ...prev, [id]: true };
        return { ...prev, [id]: Math.min(99, (val as number) + count) };
      });
    }

    setStreakReward(reward);
    setTimeout(() => setStreakReward(null), 4000);
    playSound(1500, 'sine', 0.5, 0.2);
  }, [gameState, isDailyChallenge]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': movePlayer(1, 0); break;
        case 'Escape': setIsPaused((p) => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      const start = Date.now() - elapsedTime * 1000;
      const interval = setInterval(() => {
        const current = Math.floor((Date.now() - start) / 1000);
        setElapsedTime(current);
        if (timeLimit !== null && current >= timeLimit) {
          setGameState('gameover');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, isPaused, timeLimit, elapsedTime]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex items-center justify-center">
      {gameState === 'playing' && (
        <TopBar
          playerHealth={playerHealth}
          maxHealth={maxHealth}
          coins={coins}
          setShowShop={setShowShop}
          setShowSettings={setShowSettings}
        />
      )}

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <StartMenu
            gameMode={gameMode}
            setGameMode={setGameMode}
            unlockedGameModes={unlockedGameModes}
            buyGameMode={buyGameMode}
            theme={theme}
            setTheme={setTheme}
            unlockedThemes={unlockedThemes}
            buyTheme={(t) => buyTheme(t, THEMES[t].price)}
            startLevel={startLevel}
            watchAd={watchAd}
            startDailyChallenge={() => startDailyChallenge(lastDailyCompleted)}
            lastDailyCompleted={lastDailyCompleted}
            setShowAchievements={setShowAchievements}
            setShowLeaderboard={setShowLeaderboard}
            setShowShop={setShowShop}
            setShowSettings={setShowSettings}
            hasSavedGame={hasSavedGame}
            loadSavedGame={loadSavedGame}
            coins={coins}
          />
        )}

        {gameState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-50 flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-amber-400 font-black italic tracking-widest animate-pulse uppercase">LOADING AD...</div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <GameUI
            theme={theme}
            activePowerups={activePowerups}
            isDailyChallenge={isDailyChallenge}
            currentLevel={currentLevel}
            activeModifier={activeModifier}
            timeLimit={timeLimit}
            elapsedTime={elapsedTime}
            moves={moves}
            setIsPaused={setIsPaused}
            useHint={useHint}
            coins={coins}
            hasKey={hasKey}
            damageFlash={damageFlash}
            isBumping={isBumping}
            dynamicCellSize={dynamicCellSize}
            playerPos={playerPos}
            maze={maze}
            puzzleState={puzzleState}
            breakableWallsHealth={breakableWallsHealth}
            isDoorOpen={isDoorOpen}
            visitedCells={visitedCells}
            isHintActive={isHintActive}
            hintPath={hintPath}
            exitPos={exitPos}
            playerTrail={playerTrail}
            previousPos={previousPos}
            moveDirection={moveDirection}
            isDashing={isDashing}
            joystick={joystick}
            setJoystick={setJoystick}
            movePlayer={movePlayer}
            isPaused={isPaused}
            setGameState={setGameState}
            startLevel={startLevel}
            controlScheme={controlScheme}
            setShowShop={setShowShop}
            setShowAchievements={setShowAchievements}
            jumpCount={powerupInventory.jump || 0}
            jumpProCount={powerupInventory.jumpPro || 0}
            jumpProActive={jumpProActive}
            useJump={useJump}
            useJumpPro={useJumpPro}
            executeJumpPro={executeJumpPro}
            cancelJumpPro={cancelJumpPro}
            teleportCount={powerupInventory.teleport || 0}
            useTeleport={useTeleport}
            ghostCount={activePowerups.ghost}
            magnetActive={activePowerups.magnet > Date.now()}
            freezeActive={activePowerups.freeze > Date.now()}
            powerupInventory={powerupInventory}
            activatePowerup={activatePowerup}
            streakReward={streakReward}
          />
        )}

        {(gameState === 'won' || gameState === 'complete' || gameState === 'gameover') && (() => {
          const runScore = calculateScore({ currentLevel, elapsedTime, moves, playerHealth, coinsCollected });
          const rank = getScoreRank(runScore);
          return (
            <EndScreen
              gameState={gameState}
              playerHealth={playerHealth}
              currentLevel={currentLevel}
              elapsedTime={elapsedTime}
              moves={moves}
              coins={coins}
              score={runScore}
              rank={rank}
              revive={revive}
              startLevel={startLevel}
              restartGame={restartGame}
              nextLevel={() => {
                const s = calculateScore({ currentLevel, elapsedTime, moves, playerHealth, coinsCollected });
                nextLevel(s);
              }}
            />
          );
        })()}
      </AnimatePresence>

      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-mono tracking-widest text-zinc-600 uppercase pointer-events-none">
        <span>Sector {currentLevel + 1}</span>
        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
        <span>Labyrinth Explorer v1.0</span>
      </div>

      <LeaderboardModal
        showLeaderboard={showLeaderboard}
        setShowLeaderboard={setShowLeaderboard}
        leaderboard={leaderboard}
        formatTime={formatTime}
      />
      <AchievementsModal
        showAchievements={showAchievements}
        setShowAchievements={setShowAchievements}
        unlockedAchievements={unlockedAchievements}
      />
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        sfxVolume={sfxVolume}
        setSfxVolume={setSfxVolume}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
        controlScheme={controlScheme}
        setControlScheme={setControlScheme}
        onSave={() =>
          saveProgress(
            currentLevel, gameMode, soundEnabled, theme, coins,
            unlockedThemes, unlockedAchievements, lastDailyCompleted,
            sfxVolume, musicVolume, controlScheme,
            Array.from(shownTutorials), unlockedGameModes, activePowerups, playerHealth,
            streakCount, lastStreakTimestamp
          )
        }
      />
      <ShopModal
        showShop={showShop}
        setShowShop={setShowShop}
        coins={coins}
        shopCategory={shopCategory}
        setShopCategory={setShopCategory}
        shopSort={shopSort}
        setShopSort={setShopSort}
        unlockedThemes={unlockedThemes}
        buyTheme={buyTheme}
        buyPowerup={buyPowerup}
        buyCoins={buyCoins}
        currentLevel={currentLevel}
        powerupInventory={powerupInventory}
      />
      <TutorialModal
        activeTutorial={activeTutorial}
        setActiveTutorial={setActiveTutorial}
      />

      <AnimatePresence>
        {damageFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[100] pointer-events-none shadow-[inset_0_0_150px_rgba(220,38,38,0.8)] bg-red-600/20"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
