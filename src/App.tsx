import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Point, GameState, GameMode, ThemeType, PowerupState, ActiveModifier, JoystickState, TrailPoint, Achievement } from './types';
import { WALL, PATH, BREAKABLE_WALL, COIN, HIDDEN_BUTTON, PRESSURE_PLATE, DOOR, LEVER, TOGGLE_WALL, SPIKES, POISON_GAS, POWERUP_SHIELD, POWERUP_SPEED, POWERUP_MAP, KEY, KEY_DOOR, THEMES, TUTORIALS } from './constants';

import { useAudio } from './hooks/useAudio';
import { useGameLogic } from './hooks/useGameLogic';
import { useShop } from './hooks/useShop';
import { useSaveLoad } from './hooks/useSaveLoad';
import { calculateScore, getScoreRank } from './hooks/useScore';
import { useLeaderboard } from './hooks/useLeaderboard';

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
  const [damageFlash, setDamageFlash] = useState(false);
  const [isBumping, setIsBumping] = useState(false);

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
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const [activePowerups, setActivePowerups] = useState<PowerupState>({ shield: false, speed: 0, map: 0 });
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [playerTrail, setPlayerTrail] = useState<TrailPoint[]>([]);
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintPath, setHintPath] = useState<Point[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [joystick, setJoystick] = useState<JoystickState | null>(null);
  const [previousPos, setPreviousPos] = useState<Point | null>(null);
  const [moveDirection, setMoveDirection] = useState<'up'|'down'|'left'|'right'>('right');
  const consecutiveMovesRef = useRef<{ dx: number; dy: number; count: number }>({ dx: 0, dy: 0, count: 0 });
  const [isDashing, setIsDashing] = useState(false);
  const [shownTutorials, setShownTutorials] = useState<Set<string>>(new Set());
  const [activeTutorial, setActiveTutorial] = useState<Achievement | null>(null);

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
    gameState, unlockedGameModes, activePowerups
  });

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

  // Audio — playSound available via hook
  const { playSound } = useAudio({ soundEnabled, sfxVolume, musicVolume, gameState, exitPos, playerPosRef });

  // Leaderboard
  const { leaderboard, addEntry, loadFromStorage } = useLeaderboard(gameMode);

  // Game Logic
  const {
    startLevel, nextLevel, restartGame, revive, useHint,
    watchAd, startDailyChallenge, checkAchievements,
  } = useGameLogic({
    gameMode, isDailyChallenge, maxHealth, coins, elapsedTime, moves,
    gameState, playerHealth, currentLevel, playerPos, exitPos, maze,
    unlockedAchievements, isHintActive,
    setMaze, setExitPos, setPlayerPos, setPuzzleState, setBreakableWallsHealth,
    setCurrentLevel, setGameState, setMoves, setElapsedTime, setIsPaused,
    setIsHintActive, setHintPath, setVisitedCells, setPlayerTrail,
    setPlayerHealth, setIsDoorOpen, setHasKey, setTimeLimit, setActivePowerups,
    setCoins, setIsDailyChallenge, setActiveModifier, setGameMode,
    setUnlockedAchievements, addEntry,
  });

  // Shop
  const { buyGameMode, buyTheme, buyPowerup, buyCoins } = useShop({
    coins, gameMode, unlockedGameModes, unlockedThemes,
    setCoins, setUnlockedGameModes, setGameMode,
    setUnlockedThemes, setTheme, setActivePowerups,
  });

  // Save/Load
  const { saveProgress, loadInitialData, loadSavedGame } = useSaveLoad({
    autoSaveRef, activePowerups, setHasSavedGame,
    setUnlockedThemes, setUnlockedAchievements, setCoins, setLastDailyCompleted,
    setSoundEnabled, setSfxVolume, setMusicVolume, setControlScheme,
    setShownTutorials, setUnlockedGameModes,
    setGameMode, setTheme, setActivePowerups, startLevel,
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
  }, [currentLevel]);

  const [dynamicCellSize, setDynamicCellSize] = useState(CELL_SIZE);
  useEffect(() => {
    const handleResize = () => {
      if (gameState === 'playing' && maze.length > 0) {
        const availableWidth = window.innerWidth - 32;
        const availableHeight = window.innerHeight - 300;
        const size = Math.floor(Math.min(availableWidth, availableHeight) / 9);
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

    // Momentum Dash: 2+ consecutive steps in same direction → dash 2 cells
    const prevMomentum = consecutiveMovesRef.current;
    if (prevMomentum.dx === actualDx && prevMomentum.dy === actualDy) {
      consecutiveMovesRef.current = { dx: actualDx, dy: actualDy, count: prevMomentum.count + 1 };
    } else {
      consecutiveMovesRef.current = { dx: actualDx, dy: actualDy, count: 1 };
    }

    const isDash = consecutiveMovesRef.current.count >= 2;
    const dashX = playerPosRef.current.x + actualDx * 2;
    const dashY = playerPosRef.current.y + actualDy * 2;
    const canDash = isDash &&
      dashX >= 0 && dashX < mazeRef.current[0].length &&
      dashY >= 0 && dashY < mazeRef.current.length &&
      mazeRef.current[dashY][dashX] !== WALL &&
      mazeRef.current[dashY][dashX] !== DOOR &&
      mazeRef.current[dashY][dashX] !== KEY_DOOR &&
      mazeRef.current[dashY][dashX] !== TOGGLE_WALL;

    const newX = canDash ? dashX : playerPosRef.current.x + actualDx;
    const newY = canDash ? dashY : playerPosRef.current.y + actualDy;

    if (newX < 0 || newX >= mazeRef.current[0].length || newY < 0 || newY >= mazeRef.current.length) return;

    const cell = mazeRef.current[newY][newX];

    if (cell === KEY_DOOR && !hasKey) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 100);
      playSound(150, 'sine', 0.05, 0.05);
      return;
    }

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
        setMaze((prev) => { const next = prev.map(r => [...r]); next[newY][newX] = PATH; return next; });
        playSound(300, 'square', 0.2);
      } else {
        setBreakableWallsHealth((prev) => ({ ...prev, [wallKey]: health }));
        playSound(200, 'square', 0.1);
      }
      return;
    }

    if (canDash) {
      setIsDashing(true);
      setTimeout(() => setIsDashing(false), 200);
      playSound(1600, 'sine', 0.15, 0.08);
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
      setActivePowerups((prev) => ({ ...prev, map: Date.now() + 15000 }));
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
    } else if (cell === HIDDEN_BUTTON || cell === PRESSURE_PLATE || cell === LEVER) {
      setPuzzleState((prev) => new Set(prev).add(`${newX},${newY}`));
      setIsDoorOpen(true);
      playSound(400, 'square', 0.2);
    } else if (cell === SPIKES || cell === POISON_GAS) {
      if (activePowerups.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else {
        setPlayerHealth((prev) => prev - 1);
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        playSound(100, 'square', 0.4);
        if (playerHealth <= 1) setGameState('gameover');
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
    breakableWallsHealth, playerHealth, exitPos, shownTutorials, playSound,
  ]);

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
            startDailyChallenge={() => startDailyChallenge(lastDailyCompleted)}
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
            Array.from(shownTutorials), unlockedGameModes
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
