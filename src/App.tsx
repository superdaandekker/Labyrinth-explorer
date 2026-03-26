import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  RotateCcw, Pause, Coins, Zap, Eye, Trophy, Play, Info, Settings, ArrowUp, 
  ShoppingBag, Sparkles, Music, Gamepad2, Skull, Heart, EyeOff, Move, Ghost, Shield, Map 
} from 'lucide-react';

// Types
import { 
  Point, GameState, GameMode, ThemeType, 
  LeaderboardEntry, PowerupState, ActiveModifier, 
  JoystickState, TrailPoint, Achievement 
} from './types';

// Constants
import { 
  WALL, PATH, BREAKABLE_WALL, COIN, HIDDEN_BUTTON, 
  PRESSURE_PLATE, DOOR, LEVER, TOGGLE_WALL, SPIKES, 
  POISON_GAS, ILLUSIONARY_WALL, POWERUP_SHIELD, 
  POWERUP_SPEED, POWERUP_MAP, DAILY_MODIFIERS, 
  POWERUPS, ACHIEVEMENTS, THEMES, GAME_MODES, 
  TUTORIALS 
} from './constants';

// Utilities
import generateMaze, { findPath, seededRandom } from './utils/mazeGenerator';

// Components
import TopBar from './components/TopBar';
import StartMenu from './components/StartMenu';
import GameUI from './components/GameUI';
import SettingsModal from './components/Modals/SettingsModal';
import ShopModal from './components/Modals/ShopModal';
import AchievementsModal from './components/Modals/AchievementsModal';
import LeaderboardModal from './components/Modals/LeaderboardModal';
import TutorialModal from './components/Modals/TutorialModal';
import EndScreen from './components/EndScreen';

const CELL_SIZE = 30;

export default function App() {
  // Game State
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
  
  // Player Stats
  const [playerHealth, setPlayerHealth] = useState(3);
  const [maxHealth, setMaxHealth] = useState(3);
  const [damageFlash, setDamageFlash] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  
  // Settings & UI
  const [theme, setTheme] = useState<ThemeType>('default');
  const [unlockedThemes, setUnlockedThemes] = useState<ThemeType[]>(['default']);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [controlScheme, setControlScheme] = useState<'swipe' | 'joystick'>('swipe');
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shopCategory, setShopCategory] = useState<'all' | 'themes' | 'powerups' | 'coins'>('all');
  const [shopSort, setShopSort] = useState<'name' | 'price'>('name');
  
  // Game Mechanics
  const [activePowerups, setActivePowerups] = useState<PowerupState>({
    shield: false,
    speed: 0,
    map: 0
  });
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [playerTrail, setPlayerTrail] = useState<TrailPoint[]>([]);
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintPath, setHintPath] = useState<Point[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [joystick, setJoystick] = useState<JoystickState | null>(null);
  const [previousPos, setPreviousPos] = useState<Point | null>(null);
  const [shownTutorials, setShownTutorials] = useState<Set<string>>(new Set());
  const [activeTutorial, setActiveTutorial] = useState<Achievement | null>(null);

  // Interactive Elements State
  const [puzzleState, setPuzzleState] = useState<Set<string>>(new Set());
  const [breakableWallsHealth, setBreakableWallsHealth] = useState<Record<string, number>>({});
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  // Refs for logic
  const playerPosRef = useRef(playerPos);
  const mazeRef = useRef(maze);
  const gameStateRef = useRef(gameState);
  const lastMoveTimeRef = useRef(0);
  const autoSaveRef = useRef({
    currentLevel, gameMode, soundEnabled, theme, coins, 
    unlockedThemes, unlockedAchievements, lastDailyCompleted,
    sfxVolume, musicVolume, controlScheme, shownTutorials,
    gameState, unlockedGameModes, activePowerups
  });

  // Update refs
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { mazeRef.current = maze; }, [maze]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => {
    autoSaveRef.current = {
      currentLevel, gameMode, soundEnabled, theme, coins, 
      unlockedThemes, unlockedAchievements, lastDailyCompleted,
      sfxVolume, musicVolume, controlScheme, shownTutorials,
      gameState, unlockedGameModes, activePowerups
    };
  }, [currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, shownTutorials, gameState, unlockedGameModes, activePowerups]);

  // Audio Context & Sounds
  const audioCtx = useRef<AudioContext | null>(null);
  const playSound = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.1) => {
    if (!soundEnabled) return;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    
    gain.gain.setValueAtTime(volume * sfxVolume, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    osc.start();
    osc.stop(audioCtx.current.currentTime + duration);
  }, [soundEnabled, sfxVolume]);

  // Background Music
  useEffect(() => {
    if (!soundEnabled || musicVolume <= 0 || gameState !== 'playing') return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(musicVolume * 0.1, ctx.currentTime);

    const playNote = (freq: number, time: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.1, time + 0.1);
      g.gain.linearRampToValueAtTime(0, time + dur);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(time);
      osc.stop(time + dur);
    };

    const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    let step = 0;
    const interval = setInterval(() => {
      if (gameState === 'playing') {
        const note = melody[step % melody.length];
        playNote(note, ctx.currentTime, 1.5);
        step++;
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      ctx.close();
    };
  }, [soundEnabled, musicVolume, gameState]);

  // Exit Proximity Audio
  useEffect(() => {
    if (!soundEnabled || musicVolume <= 0 || gameState !== 'playing') return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    const panner = ctx.createPanner();
    masterGain.connect(ctx.destination);
    panner.connect(masterGain);
    
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(panner);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    
    osc.start();

    const updateAudio = () => {
      if (gameState !== 'playing') return;
      
      const dx = exitPos.x - playerPosRef.current.x;
      const dy = exitPos.y - playerPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const vol = Math.max(0, 1 - dist / 15) * musicVolume * 0.2;
      g.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
      
      panner.setPosition(dx / 5, 0, dy / 5);
      
      requestAnimationFrame(updateAudio);
    };

    const animId = requestAnimationFrame(updateAudio);

    return () => {
      cancelAnimationFrame(animId);
      osc.stop();
      ctx.close();
    };
  }, [soundEnabled, musicVolume, gameState, exitPos]);

  // Leaderboard logic
  const updateLeaderboard = useCallback((time: number, moves: number) => {
    const newEntry: LeaderboardEntry = {
      gameMode,
      time,
      moves,
      date: new Date().toLocaleDateString()
    };

    setLeaderboard(prev => {
      const updated = [...prev, newEntry]
        .sort((a, b) => a.time - b.time)
        .slice(0, 10);
      localStorage.setItem('labyrinth_leaderboard', JSON.stringify(updated));
      return updated;
    });
  }, [gameMode]);

  // Dynamic Cell Size
  const [dynamicCellSize, setDynamicCellSize] = useState(CELL_SIZE);
  useEffect(() => {
    const handleResize = () => {
      if (gameState === 'playing' && maze.length > 0) {
        const availableWidth = window.innerWidth - 32;
        const availableHeight = window.innerHeight - 300;
        const viewportCells = 9;
        const size = Math.floor(Math.min(availableWidth, availableHeight) / viewportCells);
        const newSize = Math.min(60, Math.max(35, size));
        setDynamicCellSize(newSize);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState, maze]);

  // Save/Load Progress
  const saveProgress = useCallback((levelIdx: number, mode: GameMode, sound: boolean, currentTheme: ThemeType, currentCoins: number, unlocked: ThemeType[], achievements: string[], daily: string | null, sfx: number, music: number, scheme: 'swipe' | 'joystick', tutorials: string[], unlockedModes: GameMode[], powerups?: PowerupState) => {
    localStorage.setItem('labyrinth_save', JSON.stringify({
      level: levelIdx,
      gameMode: mode,
      unlockedGameModes: unlockedModes,
      theme: currentTheme,
      coins: currentCoins,
      unlockedThemes: unlocked,
      unlockedAchievements: achievements,
      lastDailyCompleted: daily,
      soundEnabled: sound,
      sfxVolume: sfx,
      musicVolume: music,
      controlScheme: scheme,
      shownTutorials: tutorials,
      activePowerups: powerups || activePowerups,
      timestamp: Date.now()
    }));
    setHasSavedGame(true);
  }, [activePowerups]);

  useEffect(() => {
    const interval = setInterval(() => {
      const s = autoSaveRef.current;
      if (s.gameState === 'playing') {
        saveProgress(
          s.currentLevel, s.gameMode, s.soundEnabled, s.theme, s.coins, 
          s.unlockedThemes, s.unlockedAchievements, s.lastDailyCompleted,
          s.sfxVolume, s.musicVolume, s.controlScheme, Array.from(s.shownTutorials),
          s.unlockedGameModes, s.activePowerups
        );
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  // Game Logic Functions
  const startLevel = useCallback((levelIdx: number, isNewGame = false) => {
    const config = GAME_MODES[gameMode];
    const width = config.baseSize + Math.floor(levelIdx / 2) * 2;
    const height = config.baseSize + Math.floor(levelIdx / 2) * 2;
    
    const seed = isDailyChallenge ? parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')) + levelIdx : undefined;
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
    
    if (config.timeLimit) {
      setTimeLimit(config.timeLimit + levelIdx * 5);
    } else {
      setTimeLimit(null);
    }

    if (isNewGame) {
      setActivePowerups({ shield: false, speed: 0, map: 0 });
    }

    playSound(440, 'sine', 0.2);
  }, [gameMode, isDailyChallenge, maxHealth, playSound]);

  const nextLevel = () => {
    const nextIdx = currentLevel + 1;
    if (nextIdx >= 10) {
      setGameState('complete');
      updateLeaderboard(elapsedTime, moves);
    } else {
      startLevel(nextIdx);
    }
  };

  const restartGame = () => {
    setGameState('start');
    setCurrentLevel(0);
    setMoves(0);
    setElapsedTime(0);
    setIsDailyChallenge(false);
    setActiveModifier(null);
  };

  const revive = () => {
    if (coins >= 75) {
      setCoins(prev => prev - 75);
      setPlayerHealth(maxHealth);
      setGameState('playing');
      playSound(660, 'square', 0.3);
    }
  };

  const useHint = () => {
    if (coins >= 50 && !isHintActive) {
      setCoins(prev => prev - 50);
      const path = findPath(playerPos, exitPos, maze);
      setHintPath(path);
      setIsHintActive(true);
      playSound(880, 'sine', 0.4);
      setTimeout(() => setIsHintActive(false), 5000);
    }
  };

  const watchAd = () => {
    setGameState('loading');
    setTimeout(() => {
      setCoins(prev => prev + 50);
      setGameState('start');
      playSound(1200, 'sine', 0.5, 0.2);
    }, 2000);
  };

  const startDailyChallenge = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastDailyCompleted === today) return;
    
    setIsDailyChallenge(true);
    const daySeed = parseInt(today.replace(/-/g, ''));
    const modifier = DAILY_MODIFIERS[daySeed % DAILY_MODIFIERS.length];
    setActiveModifier(modifier);
    setGameMode('hard');
    startLevel(0);
  };

  // Achievement Check
  const checkAchievements = useCallback(() => {
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let unlocked = false;
      if (achievement.id === 'first_steps' && moves >= 1) unlocked = true;
      if (achievement.id === 'coin_collector' && coins >= 100) unlocked = true;
      if (achievement.id === 'speed_demon' && elapsedTime < 30 && gameState === 'won') unlocked = true;
      if (achievement.id === 'survivor' && playerHealth === 1 && gameState === 'won') unlocked = true;
      if (achievement.id === 'maze_master' && currentLevel >= 5) unlocked = true;
      if (achievement.id === 'rich' && coins >= 1000) unlocked = true;
      
      if (unlocked) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        playSound(1500, 'sine', 0.5, 0.2);
      }
    });
  }, [unlockedAchievements, moves, coins, elapsedTime, gameState, playerHealth, currentLevel, playSound]);

  useEffect(() => {
    if (gameState === 'won' || gameState === 'complete') {
      checkAchievements();
    }
  }, [gameState, checkAchievements]);

  // Movement Logic
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing' || isPaused) return;

    const now = Date.now();
    const moveDelay = activePowerups.speed > now ? 75 : 150;
    if (now - lastMoveTimeRef.current < moveDelay) return;

    let actualDx = dx;
    let actualDy = dy;

    if (activeModifier?.id === 'REVERSED_GRAVITY') {
      actualDx = -dx;
      actualDy = -dy;
    }

    const newX = playerPosRef.current.x + actualDx;
    const newY = playerPosRef.current.y + actualDy;

    if (newX < 0 || newX >= mazeRef.current[0].length || newY < 0 || newY >= mazeRef.current.length) return;

    const cell = mazeRef.current[newY][newX];
    
    if (cell === WALL || (cell === DOOR && !isDoorOpen) || (cell === TOGGLE_WALL && !isDoorOpen)) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      return;
    }

    if (cell === BREAKABLE_WALL) {
      const wallKey = `${newX},${newY}`;
      const health = (breakableWallsHealth[wallKey] ?? 3) - 1;
      if (health <= 0) {
        setMaze(prev => {
          const next = [...prev.map(r => [...r])];
          next[newY][newX] = PATH;
          return next;
        });
        playSound(300, 'square', 0.2);
      } else {
        setBreakableWallsHealth(prev => ({ ...prev, [wallKey]: health }));
        playSound(200, 'square', 0.1);
      }
      return;
    }

    setPreviousPos(playerPosRef.current);
    setPlayerPos({ x: newX, y: newY });
    setMoves(prev => prev + 1);
    lastMoveTimeRef.current = now;
    setVisitedCells(prev => new Set(prev).add(`${newX},${newY}`));
    setPlayerTrail(prev => [{ x: newX, y: newY, id: now }, ...prev.slice(0, 7)]);

    // Handle Cell Interactions
    if (cell === COIN) {
      setCoins(prev => prev + 10);
      setMaze(prev => {
        const next = [...prev.map(r => [...r])];
        next[newY][newX] = PATH;
        return next;
      });
      playSound(1200, 'sine', 0.1, 0.1);
    } else if (cell === POWERUP_SHIELD) {
      setActivePowerups(prev => ({ ...prev, shield: true }));
      setMaze(prev => {
        const next = [...prev.map(r => [...r])];
        next[newY][newX] = PATH;
        return next;
      });
      playSound(800, 'sine', 0.3);
    } else if (cell === POWERUP_SPEED) {
      setActivePowerups(prev => ({ ...prev, speed: Date.now() + 10000 }));
      setMaze(prev => {
        const next = [...prev.map(r => [...r])];
        next[newY][newX] = PATH;
        return next;
      });
      playSound(1000, 'sine', 0.3);
    } else if (cell === POWERUP_MAP) {
      setActivePowerups(prev => ({ ...prev, map: Date.now() + 15000 }));
      setMaze(prev => {
        const next = [...prev.map(r => [...r])];
        next[newY][newX] = PATH;
        return next;
      });
      playSound(900, 'sine', 0.3);
    } else if (cell === HIDDEN_BUTTON || cell === PRESSURE_PLATE || cell === LEVER) {
      setPuzzleState(prev => new Set(prev).add(`${newX},${newY}`));
      setIsDoorOpen(true);
      playSound(400, 'square', 0.2);
    } else if (cell === SPIKES || cell === POISON_GAS) {
      if (activePowerups.shield) {
        setActivePowerups(prev => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else {
        setPlayerHealth(prev => prev - 1);
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        playSound(100, 'square', 0.4);
        if (playerHealth <= 1) setGameState('gameover');
      }
    }

    if (newX === exitPos.x && newY === exitPos.y) {
      if (activeModifier?.id === 'COLLECT_ALL_COINS') {
        const hasCoins = mazeRef.current.some(row => row.includes(COIN));
        if (hasCoins) {
          playSound(200, 'sine', 0.2);
          return;
        }
      }
      setGameState('won');
      playSound(880, 'sine', 0.5);
    }

    // Tutorial Checks
    if (!shownTutorials.has('movement')) {
      setActiveTutorial(TUTORIALS.movement);
      setShownTutorials(prev => new Set(prev).add('movement'));
    }
    if (cell === COIN && !shownTutorials.has('coins')) {
      setActiveTutorial(TUTORIALS.coins);
      setShownTutorials(prev => new Set(prev).add('coins'));
    }
  }, [gameState, isPaused, activePowerups, activeModifier, isDoorOpen, breakableWallsHealth, playerHealth, exitPos, shownTutorials, playSound]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': movePlayer(1, 0); break;
        case 'Escape': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Timer
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

  // Shop Functions
  const buyGameMode = (mode: GameMode) => {
    const config = GAME_MODES[mode];
    if (config.price && coins >= config.price && !unlockedGameModes.includes(mode)) {
      setCoins(prev => prev - config.price);
      setUnlockedGameModes(prev => [...prev, mode]);
      setGameMode(mode);
      playSound(1200, 'sine', 0.3);
    }
  };

  const buyTheme = (themeId: ThemeType, price: number) => {
    if (coins >= price && !unlockedThemes.includes(themeId)) {
      setCoins(prev => prev - price);
      setUnlockedThemes(prev => [...prev, themeId]);
      setTheme(themeId);
      playSound(1200, 'sine', 0.3);
    }
  };

  const buyPowerup = (powerupId: string, price: number) => {
    if (coins >= price) {
      setCoins(prev => prev - price);
      if (powerupId === 'shield') setActivePowerups(p => ({ ...p, shield: true }));
      if (powerupId === 'speed') setActivePowerups(p => ({ ...p, speed: Date.now() + 30000 }));
      if (powerupId === 'map') setActivePowerups(p => ({ ...p, map: Date.now() + 60000 }));
      playSound(1000, 'sine', 0.3);
    }
  };

  const buyCoins = (amount: number, price: number) => {
    setCoins(prev => prev + amount);
    playSound(1500, 'sine', 0.4);
  };

  // Load Initial Data
  useEffect(() => {
    const saved = localStorage.getItem('labyrinth_save');
    if (saved) {
      setHasSavedGame(true);
      const data = JSON.parse(saved);
      setUnlockedThemes(data.unlockedThemes || ['default']);
      setUnlockedAchievements(data.unlockedAchievements || []);
      setCoins(data.coins || 0);
      setLastDailyCompleted(data.lastDailyCompleted || null);
      setSoundEnabled(data.soundEnabled ?? true);
      setSfxVolume(data.sfxVolume ?? 0.5);
      setMusicVolume(data.musicVolume ?? 0.3);
      setControlScheme(data.controlScheme || 'swipe');
      setShownTutorials(new Set(data.shownTutorials || []));
      setUnlockedGameModes(data.unlockedGameModes || ['normal']);
    }
    const lb = localStorage.getItem('labyrinth_leaderboard');
    if (lb) setLeaderboard(JSON.parse(lb));
  }, []);

  const loadSavedGame = () => {
    const saved = localStorage.getItem('labyrinth_save');
    if (saved) {
      const data = JSON.parse(saved);
      setGameMode(data.gameMode);
      setTheme(data.theme);
      setActivePowerups(data.activePowerups || { shield: false, speed: 0, map: 0 });
      startLevel(data.level);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex items-center justify-center">
      <TopBar 
        playerHealth={playerHealth}
        maxHealth={maxHealth}
        coins={coins}
        setShowShop={setShowShop}
        setShowSettings={setShowSettings}
      />

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
            joystick={joystick}
            setJoystick={setJoystick}
            movePlayer={movePlayer}
            isPaused={isPaused}
            setGameState={setGameState}
            startLevel={startLevel}
            controlScheme={controlScheme}
            setShowShop={setShowShop}
            setShowAchievements={setShowAchievements}
          />
        )}

        {(gameState === 'won' || gameState === 'complete' || gameState === 'gameover') && (
          <EndScreen 
            gameState={gameState}
            playerHealth={playerHealth}
            currentLevel={currentLevel}
            elapsedTime={elapsedTime}
            moves={moves}
            coins={coins}
            formatTime={formatTime}
            revive={revive}
            startLevel={startLevel}
            restartGame={restartGame}
            nextLevel={nextLevel}
          />
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-mono tracking-widest text-zinc-600 uppercase pointer-events-none">
        <span>Sector {currentLevel + 1}</span>
        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
        <span>Labyrinth Explorer v1.0</span>
      </div>

      {/* Modals */}
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
        onSave={() => saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes)}
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
      />

      <TutorialModal 
        activeTutorial={activeTutorial}
        setActiveTutorial={setActiveTutorial}
      />

      {/* Damage Flash Overlay */}
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
