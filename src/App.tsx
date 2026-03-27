import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Point, GameState, GameMode, ThemeType, PowerupState, PowerupInventory, ActiveModifier, JoystickState, TrailPoint, TutorialConfig, StreakReward } from './types';
import { CELL_SIZE, WALL, PATH, BREAKABLE_WALL, COIN, PRESSURE_PLATE, DOOR, LEVER, SPIKES, POISON_GAS, POWERUP_SHIELD, POWERUP_SPEED, POWERUP_MAP, KEY, KEY_DOOR, KEY_BLUE, KEY_DOOR_BLUE, KEY_GREEN, KEY_DOOR_GREEN, KEY_YELLOW, KEY_DOOR_YELLOW, KEY_PURPLE, KEY_DOOR_PURPLE, ILLUSIONARY_WALL, HIDDEN_BUTTON, TOGGLE_WALL, VIEWPORT_SIZE, THEMES, TUTORIALS, VILLAIN_BASE_INTERVAL, HARD_MILESTONES, GAME_MODES, PREMIUM_LOOT, POWERUPS } from './constants';
import { findPath, getPremiumLootMap } from './utils/mazeGenerator';

import { useAudio } from './hooks/useAudio';
import { useGameLogic } from './hooks/useGameLogic';
import { useShop } from './hooks/useShop';
import { useSaveLoad } from './hooks/useSaveLoad';
import { calculateScore, getScoreRank } from './hooks/useScore';
import { formatTime } from './utils/formatTime';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useUIState } from './hooks/useUIState';
import { usePlayerAnim } from './hooks/usePlayerAnim';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { useDynamicCellSize } from './hooks/useDynamicCellSize';
import { useVillain } from './hooks/useVillain';

import TopBar from './components/TopBar';
import StartMenu from './components/StartMenu';
import GameUI from './components/GameUI';
import SettingsModal from './components/Modals/SettingsModal';
import ShopModal from './components/Modals/ShopModal';
import AchievementsModal from './components/Modals/AchievementsModal';
import LeaderboardModal from './components/Modals/LeaderboardModal';
import TutorialModal from './components/Modals/TutorialModal';
import EndScreen from './components/EndScreen';
import PremiumSummaryScreen from './components/PremiumSummaryScreen';

// Gekleurde sleutel-deur paren: [sleuteltype, deurtype]
const COLOR_KEY_PAIRS: [number, number][] = [
  [KEY_BLUE, KEY_DOOR_BLUE],
  [KEY_GREEN, KEY_DOOR_GREEN],
  [KEY_YELLOW, KEY_DOOR_YELLOW],
  [KEY_PURPLE, KEY_DOOR_PURPLE],
];

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
  const { damageFlash, isBumping, isDashing, moveDirection,
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
  const [jumpProActive, setJumpProActive] = useState(false);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [playerTrail, setPlayerTrail] = useState<TrailPoint[]>([]);
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintPath, setHintPath] = useState<Point[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [joystick, setJoystick] = useState<JoystickState | null>(null);
  // BUG-034/FEAT-001: feedback bij geblokkeerde acties
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const blockedMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveMovesRef = useRef<{ dx: number; dy: number; count: number }>({ dx: 0, dy: 0, count: 0 });
  const [shownTutorials, setShownTutorials] = useState<Set<string>>(new Set());
  const [activeTutorial, setActiveTutorial] = useState<TutorialConfig | null>(null);

  const [puzzleState, setPuzzleState] = useState<Set<string>>(new Set());
  const [breakableWallsHealth, setBreakableWallsHealth] = useState<Record<string, number>>({});
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [heldColorKeys, setHeldColorKeys] = useState<Set<number>>(new Set());
  const [usedKeyThisLevel, setUsedKeyThisLevel] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [premiumLootMap, setPremiumLootMap] = useState<Record<string, string>>({});
  const [premiumCollected, setPremiumCollected] = useState<Record<string, number>>({});

  // Hard mode: ad-revive teller (reset per level, 3 ads = gratis revive)
  const [adReviveCount, setAdReviveCount] = useState(0);
  const adReviveCountRef = useRef(0);

  // Hard mode: bijgehouden mijlpalen om dubbele uitkering te voorkomen
  const [hardMilestonesAwarded, setHardMilestonesAwarded] = useState<number[]>([]);

  const playerPosRef = useRef(playerPos);
  const mazeRef = useRef(maze);
  const gameStateRef = useRef(gameState);
  const puzzleStateRef = useRef(puzzleState);
  const isPausedRef = useRef(isPaused);
  const activePowerupsRef = useRef(activePowerups);
  const lastMoveTimeRef = useRef(0);
  const autoSaveRef = useRef({
    currentLevel, gameMode, soundEnabled, theme, coins,
    unlockedThemes, unlockedAchievements, lastDailyCompleted,
    sfxVolume, musicVolume, controlScheme, shownTutorials,
    gameState, unlockedGameModes, activePowerups, playerHealth,
    streakCount, lastStreakTimestamp,
    // BUG-040: daily challenge vlag meenemen in auto-save
    isDailyChallenge,
  });

  useEffect(() => {
    playerPosRef.current = playerPos;
    mazeRef.current = maze;
    gameStateRef.current = gameState;
    puzzleStateRef.current = puzzleState;
    isPausedRef.current = isPaused;
    activePowerupsRef.current = activePowerups;
    powerupInventoryRef.current = powerupInventory;
  }, [playerPos, maze, gameState, puzzleState, isPaused, activePowerups, powerupInventory]);
  useEffect(() => { adReviveCountRef.current = adReviveCount; }, [adReviveCount]);
  useEffect(() => { localStorage.setItem('powerupInventory', JSON.stringify(powerupInventory)); }, [powerupInventory]);
  useEffect(() => {
    autoSaveRef.current = {
      currentLevel, gameMode, soundEnabled, theme, coins,
      unlockedThemes, unlockedAchievements, lastDailyCompleted,
      sfxVolume, musicVolume, controlScheme, shownTutorials,
      gameState, unlockedGameModes, activePowerups, playerHealth,
      streakCount, lastStreakTimestamp, isDailyChallenge,
    };
  }, [currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, shownTutorials, gameState, unlockedGameModes, activePowerups, playerHealth, streakCount, lastStreakTimestamp, isDailyChallenge]);

  // Audio — playSound available via hook
  const { playSound } = useAudio({ soundEnabled, sfxVolume, musicVolume, gameState, exitPos, playerPosRef });

  // Leaderboard
  const { leaderboard, addEntry, loadFromStorage } = useLeaderboard(gameMode);

  // Game Logic
  const {
    startLevel, nextLevel, restartGame, revive, useHint,
    watchAd, checkAchievements,
  } = useGameLogic({
    gameMode, isDailyChallenge, activeModifier, maxHealth, coins, elapsedTime, moves,
    gameState, playerHealth, currentLevel, playerPos, exitPos, maze,
    unlockedAchievements, isHintActive,
    visitedCells, usedKey: usedKeyThisLevel, unlockedThemesCount: unlockedThemes.length,
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

  // Daily Challenge + Streak
  const { startDailyChallenge } = useDailyChallenge({
    streakCount, lastStreakTimestamp, lastDailyCompleted, coins,
    gameState, isDailyChallenge,
    setStreakCount, setLastStreakTimestamp, setLastDailyCompleted,
    setCoins, setPowerupInventory, setStreakReward,
    setIsDailyChallenge, setActiveModifier, setUnlockedGameModes, setGameMode,
    startLevel, playSound,
  });

  // Save/Load
  const { saveProgress, loadInitialData, loadSavedGame } = useSaveLoad({
    autoSaveRef, activePowerups, setHasSavedGame,
    setUnlockedThemes, setUnlockedAchievements, setCoins, setLastDailyCompleted,
    setSoundEnabled, setSfxVolume, setMusicVolume, setControlScheme,
    setShownTutorials, setUnlockedGameModes,
    setGameMode, setTheme, setActivePowerups, setPowerupInventory, setPlayerHealth,
    setStreakCount, setLastStreakTimestamp,
    // BUG-040: daily challenge state herstellen bij laden
    setIsDailyChallenge, startLevel,
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
      setHeldColorKeys(new Set());
      setUsedKeyThisLevel(false);
      setCoinsCollected(0);
      consecutiveMovesRef.current = { dx: 0, dy: 0, count: 0 };
    }
  }, [currentLevel, gameState]);

  const dynamicCellSize = useDynamicCellSize(gameState, maze.length);

  // IMP-002/003: Centrale tile-effect + damage functie — gebruikt door movePlayer, performJump en useTeleport
  const applyTileEffects = useCallback((x: number, y: number, cell: number) => {
    if (cell === COIN) {
      setCoins((prev) => prev + 10);
      setCoinsCollected((prev) => prev + 1);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(1200, 'sine', 0.1, 0.1);
    } else if (cell === PREMIUM_LOOT) {
      const lootId = premiumLootMap[`${x},${y}`];
      if (lootId) {
        setPremiumCollected((prev) => ({ ...prev, [lootId]: (prev[lootId] || 0) + 1 }));
        setPowerupInventory((prev) => ({ ...prev, [lootId]: (prev[lootId] || 0) + 1 }));
      }
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(1600, 'sine', 0.25, 0.12);
    } else if (cell === POWERUP_SHIELD) {
      setActivePowerups((prev) => ({ ...prev, shield: true }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(800, 'sine', 0.3);
    } else if (cell === POWERUP_SPEED) {
      setActivePowerups((prev) => ({ ...prev, speed: Date.now() + 10000 }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(1000, 'sine', 0.3);
    } else if (cell === POWERUP_MAP) {
      setActivePowerups((prev) => ({ ...prev, map: Date.now() + 5000 }));
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(900, 'sine', 0.3);
    } else if (cell === KEY) {
      setHasKey(true);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(1400, 'sine', 0.3);
      if (!shownTutorials.has('key')) {
        setActiveTutorial(TUTORIALS.key);
        setShownTutorials((prev) => new Set(prev).add('key'));
      }
    } else if (cell === KEY_DOOR && hasKey) {
      setHasKey(false);
      setUsedKeyThisLevel(true);
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(600, 'square', 0.3);
    } else if (COLOR_KEY_PAIRS.some(([k]) => cell === k)) {
      const found = COLOR_KEY_PAIRS.find(([k]) => cell === k);
      if (found) {
        const [keyType] = found;
        setHeldColorKeys(prev => new Set([...prev, keyType]));
        setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
        playSound(1400, 'sine', 0.3);
      }
    } else if (COLOR_KEY_PAIRS.some(([k, d]) => cell === d && heldColorKeys.has(k))) {
      const found = COLOR_KEY_PAIRS.find(([k, d]) => cell === d && heldColorKeys.has(k));
      if (found) {
        const [keyType] = found;
        setHeldColorKeys(prev => { const next = new Set(prev); next.delete(keyType); return next; });
        setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
        playSound(600, 'square', 0.3);
      }
    } else if (cell === HIDDEN_BUTTON) {
      setPuzzleState((prev) => {
        const next = new Set(prev);
        next.add(`${x},${y}`);
        next.add('toggle_walls_open');
        return next;
      });
      // BUG-012: verwijder knop na eerste druk — toggle kan niet meer teruggedraaid worden
      setMaze((prev) => { const next = prev.map(r => [...r]); next[y][x] = PATH; return next; });
      playSound(700, 'sine', 0.3, 0.1);
    } else if (cell === PRESSURE_PLATE || cell === LEVER) {
      setPuzzleState((prev) => new Set(prev).add(`${x},${y}`));
      setIsDoorOpen(true);
      playSound(400, 'square', 0.2);
    } else if (cell === SPIKES || cell === POISON_GAS) {
      if (activePowerups.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else if (activePowerups.freeze > Date.now()) {
        // Freeze actief — geen schade
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
    // Exit check
    if (x === exitPos.x && y === exitPos.y) {
      if (activeModifier?.id === 'COLLECT_ALL_COINS') {
        const hasCoins = mazeRef.current.some((row) => row.includes(COIN));
        if (hasCoins) { playSound(200, 'sine', 0.2); return; }
      }
      setGameState('won');
      playSound(880, 'sine', 0.5);
    }
  }, [activePowerups, heldColorKeys, hasKey, exitPos, shownTutorials, premiumLootMap, playSound, activeModifier]);

  // BUG-034/FEAT-001: toon korte geblokkeerde-actie melding
  const showBlocked = useCallback((msg: string) => {
    if (blockedMsgTimerRef.current) clearTimeout(blockedMsgTimerRef.current);
    setBlockedMessage(msg);
    blockedMsgTimerRef.current = setTimeout(() => setBlockedMessage(null), 1200);
  }, []);

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
      showBlocked('🔑 Sleutel nodig');
      return;
    }
    const colorDoorBlocked = COLOR_KEY_PAIRS.find(([k, d]) => cell === d && !heldColorKeys.has(k));
    if (colorDoorBlocked) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      showBlocked('🔑 Gekleurde sleutel nodig');
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

    const toggleOpen = puzzleStateRef.current.has('toggle_walls_open');
    if (cell === WALL || (cell === TOGGLE_WALL && !toggleOpen)) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      return;
    }
    if (cell === DOOR && !isDoorOpen) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      showBlocked('🚪 Deur vergrendeld');
      return;
    }

    if (cell === BREAKABLE_WALL) {
      if ((activePowerups.hammer ?? 0) <= 0) {
        setIsBumping(true);
        setTimeout(() => setIsBumping(false), 100);
        playSound(150, 'sine', 0.05, 0.05);
        showBlocked('🔨 Hamer nodig');
        return;
      }
      const wallKey = `${newX},${newY}`;
      const health = (breakableWallsHealth[wallKey] ?? 3) - 1;
      if (health <= 0) {
        setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
        setActivePowerups((prev) => ({ ...prev, hammer: (prev.hammer ?? 1) - 1 }));
        playSound(300, 'square', 0.3);
      } else {
        setBreakableWallsHealth((prev) => ({ ...prev, [wallKey]: health }));
        playSound(200, 'square', 0.15);
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

    applyTileEffects(newX, newY, cell);

    if (!shownTutorials.has('movement')) {
      setActiveTutorial(TUTORIALS.movement);
      setShownTutorials((prev) => new Set(prev).add('movement'));
    }
    if (cell === COIN && !shownTutorials.has('coins')) {
      setActiveTutorial(TUTORIALS.coins);
      setShownTutorials((prev) => new Set(prev).add('coins'));
    }
  }, [
    gameState, isPaused, activePowerups, activeModifier, isDoorOpen, hasKey, heldColorKeys,
    breakableWallsHealth, shownTutorials, playSound, applyTileEffects,
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
    applyTileEffects(newX, newY, cell);
  }, [isPaused, playSound, applyTileEffects]);

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
    // BUG-031: zelfde inputregels als movePlayer / performJump
    if (gameStateRef.current !== 'playing' || isPausedRef.current) return;
    if ((powerupInventoryRef.current['teleport'] || 0) <= 0) return;
    const path = findPath(playerPosRef.current, exitPos, mazeRef.current, { walkDoors: true });
    // path[0] is current pos, path[last] is exit — pick from positions 1..length-2
    if (path.length < 2) return;
    const candidates = path.slice(1, -1);
    if (candidates.length === 0) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const cell = mazeRef.current[target.y][target.x];
    setPowerupInventory((prev) => ({ ...prev, teleport: Math.max(0, (prev.teleport || 0) - 1) }));
    setPlayerPos(target);
    setVisitedCells((prev) => new Set(prev).add(`${target.x},${target.y}`));
    setPlayerTrail((prev) => [{ x: target.x, y: target.y, id: Date.now() }, ...prev.slice(0, 4)]);
    setIsDashing(true);
    setTimeout(() => setIsDashing(false), 300);
    lastMoveTimeRef.current = Date.now();
    // BUG-035: herkenbaar teleport geluid — sweep + pop
    playSound(300, 'sawtooth', 0.1, 0.12);
    setTimeout(() => playSound(1800, 'sine', 0.35, 0.15), 100);
    // BUG-001/005/016/020/023: verwerk tile-interacties op doelpositie
    applyTileEffects(target.x, target.y, cell);
  }, [exitPos, playSound, applyTileEffects]);

  // Activate a timed powerup from inventory → sets activePowerups timer
  const activatePowerup = useCallback((id: string) => {
    if ((powerupInventoryRef.current[id] || 0) <= 0) return;
    setPowerupInventory((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
    if (id === 'shield') setActivePowerups((p) => ({ ...p, shield: true }));
    if (id === 'speed') setActivePowerups((p) => ({ ...p, speed: Date.now() + 10000 }));
    if (id === 'map') setActivePowerups((p) => ({ ...p, map: Date.now() + 5000 }));
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


  // Hard mode: slechterik
  const { villainPos, setVillainPos, villainRef } = useVillain({
    gameMode, currentLevel, gameState, gameStateRef,
    mazeRef, playerPosRef, isPausedRef, activePowerupsRef,
    setPlayerHealth, setGameState, setDamageFlash,
  });

  // BUG-004: Poison gas — schade over tijd terwijl speler op tegel staat (elke 1,5s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStateRef.current !== 'playing' || isPausedRef.current) return;
      const { x, y } = playerPosRef.current;
      if (mazeRef.current[y]?.[x] !== POISON_GAS) return;
      const ap = activePowerupsRef.current;
      if (ap.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else if (ap.freeze > Date.now()) {
        // Freeze actief — geen schade
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
    }, 1500);
    return () => clearInterval(interval);
  }, [playSound]);

  // Hard mode: ad-revive — reset teller bij nieuw level
  useEffect(() => {
    if (gameState === 'playing') setAdReviveCount(0);
  }, [currentLevel]);

  // Premium mode: laad loot-map direct nadat generateMaze is aangeroepen
  useEffect(() => {
    if (gameMode === 'premium' && gameState === 'playing') {
      setPremiumLootMap(getPremiumLootMap());
      setPremiumCollected({});
    }
  }, [gameMode, gameState, currentLevel]);

  // Hard mode: mijlpaal-beloningen bij sector 10/20/30...
  useEffect(() => {
    if (gameMode !== 'hard' || gameState !== 'won') return;
    const sector = currentLevel + 1;
    const milestone = HARD_MILESTONES[sector];
    if (!milestone || hardMilestonesAwarded.includes(sector)) return;
    setHardMilestonesAwarded(prev => [...prev, sector]);
    setCoins(prev => prev + milestone.coins);
    setPowerupInventory(prev => ({ ...prev, [milestone.powerupId]: (prev[milestone.powerupId] || 0) + 1 }));
    setStreakReward({ type: 'milestone', amount: milestone.coins, label: `🔥 Hard Sector ${sector}! +${milestone.coins} coins` });
    setTimeout(() => setStreakReward(null), 4000);
  }, [currentLevel, gameState, gameMode]);

  // Hard mode: gratis revive na 3 advertenties
  const handlePremiumBack = useCallback(() => {
    // Premium moet opnieuw worden gekocht na elke run
    setUnlockedGameModes((prev) => prev.filter((m) => m !== 'premium'));
    setGameMode('normal');
    setGameState('start');
  }, []);

  const watchAdForRevive = useCallback(() => {
    const nextCount = adReviveCountRef.current + 1;
    setGameState('loading');
    setTimeout(() => {
      if (nextCount >= 3) {
        setAdReviveCount(0);
        setPlayerHealth(maxHealth);
        setGameState('playing');
      } else {
        setAdReviveCount(nextCount);
        setGameState('gameover');
      }
    }, 2000);
  }, [maxHealth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': movePlayer(1, 0); break;
        case 'Escape':
          if (gameStateRef.current === 'playing') setIsPaused(!isPausedRef.current);
          break;
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
          setGameState(gameMode === 'premium' ? 'premium_summary' : 'gameover');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, isPaused, timeLimit, gameMode]);

  return (
    <div className="min-h-screen dungeon-bg text-white font-sans selection:bg-violet-500/30 overflow-hidden flex items-center justify-center">
      {/* Hidden SVG filter definitions — referenced via CSS filter: url(#...) */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="dungeon-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.024" numOctaves="4" seed="7" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.15  0 0 0 0 0.65  0 0 0 0.18 0" in="noise" result="tinted" />
            <feBlend in="SourceGraphic" in2="tinted" mode="overlay" />
          </filter>
        </defs>
      </svg>

      {gameState === 'playing' && (
        <TopBar
          playerHealth={playerHealth}
          maxHealth={maxHealth}
          coins={coins}
          hasKey={hasKey}
          heldColorKeys={heldColorKeys}
          setShowShop={setShowShop}
          setShowSettings={setShowSettings}
        />
      )}

      {/* BUG-034/FEAT-001: blocked action feedback toast */}
      <AnimatePresence>
        {blockedMessage && (
          <motion.div
            key={blockedMessage}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900/90 border border-zinc-700 rounded-xl text-sm font-bold text-zinc-200 shadow-xl backdrop-blur-sm pointer-events-none"
          >
            {blockedMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
            startDailyChallenge={startDailyChallenge}
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
            moveDirection={moveDirection}
            isDashing={isDashing}
            joystick={joystick}
            setJoystick={setJoystick}
            movePlayer={movePlayer}
            isPaused={isPaused}
            setGameState={setGameState}
            startLevel={startLevel}
            controlScheme={controlScheme}
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
            isFogOfWar={GAME_MODES[gameMode].fogOfWar ?? false}
            villainPos={villainPos}
            gameMode={gameMode}
          />
        )}

        {gameState === 'premium_summary' && (
          <PremiumSummaryScreen
            coins={coins}
            premiumCollected={premiumCollected}
            elapsedTime={elapsedTime}
            onBack={handlePremiumBack}
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
                if (gameMode === 'hard') {
                  // Hard mode: onbeperkt levels, geen cap op 10
                  startLevel(currentLevel + 1);
                } else {
                  const s = calculateScore({ currentLevel, elapsedTime, moves, playerHealth, coinsCollected });
                  nextLevel(s);
                }
              }}
              gameMode={gameMode}
              adReviveCount={adReviveCount}
              onWatchAdRevive={gameMode === 'hard' ? watchAdForRevive : undefined}
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
            streakCount, lastStreakTimestamp, isDailyChallenge
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
