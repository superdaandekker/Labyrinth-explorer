import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Map, KeyRound, Ghost, Magnet, Snowflake, Play, Home, RotateCcw } from 'lucide-react';
import { ThemeType, Point, PowerupState, ActiveModifier, JoystickState, TrailPoint, GameState, StreakReward } from '../types';
import { THEMES } from '../constants';
import GameHeader from './GameHeader';
import MazeViewport from './MazeViewport';
import GameControls from './GameControls';

interface GameUIProps {
  theme: ThemeType;
  activePowerups: PowerupState;
  isDailyChallenge: boolean;
  currentLevel: number;
  activeModifier: ActiveModifier | null;
  timeLimit: number | null;
  elapsedTime: number;
  moves: number;
  setIsPaused: (paused: boolean) => void;
  useHint: () => void;
  coins: number;
  hasKey: boolean;
  damageFlash: boolean;
  isBumping: boolean;
  dynamicCellSize: number;
  playerPos: Point;
  maze: number[][];
  puzzleState: Set<string>;
  breakableWallsHealth: Record<string, number>;
  isDoorOpen: boolean;
  visitedCells: Set<string>;
  isHintActive: boolean;
  hintPath: Point[];
  exitPos: Point;
  playerTrail: TrailPoint[];
  previousPos: Point | null;
  joystick: JoystickState;
  setJoystick: (joystick: JoystickState) => void;
  movePlayer: (dx: number, dy: number) => void;
  isPaused: boolean;
  setGameState: (state: GameState) => void;
  startLevel: (level: number) => void;
  controlScheme: 'joystick' | 'swipe';
  setShowShop: (show: boolean) => void;
  setShowAchievements: (show: boolean) => void;
  isDashing?: boolean;
  moveDirection?: 'up' | 'down' | 'left' | 'right';
  jumpCount: number;
  jumpProCount: number;
  jumpProActive: boolean;
  useJump: () => void;
  useJumpPro: () => void;
  executeJumpPro: (dx: number, dy: number) => void;
  cancelJumpPro: () => void;
  teleportCount: number;
  useTeleport: () => void;
  ghostCount: number;
  magnetActive: boolean;
  freezeActive: boolean;
  powerupInventory: Record<string, number>;
  activatePowerup: (id: string) => void;
  streakReward: StreakReward | null;
}

const GameUI: React.FC<GameUIProps> = ({
  theme, activePowerups, isDailyChallenge, currentLevel, activeModifier,
  timeLimit, elapsedTime, moves, setIsPaused, useHint, coins, hasKey,
  damageFlash, isBumping, dynamicCellSize, playerPos, maze, puzzleState,
  breakableWallsHealth, isDoorOpen, visitedCells, isHintActive, hintPath,
  exitPos, playerTrail, joystick, setJoystick, movePlayer,
  isPaused, setGameState, startLevel, controlScheme,
  isDashing = false, moveDirection = 'right',
  jumpCount, jumpProCount, jumpProActive, useJump, useJumpPro, executeJumpPro, cancelJumpPro,
  teleportCount, useTeleport, ghostCount, magnetActive, freezeActive,
  powerupInventory, activatePowerup, streakReward,
}) => (
  <motion.div
    key="playing"
    initial={{ opacity: 0, scale: 1.05, filter: 'brightness(0)' }}
    animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
    exit={{ opacity: 0, scale: 0.95, filter: 'brightness(2)' }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className={`z-10 flex flex-col items-center gap-6 ${THEMES[theme].bgClass} min-h-screen w-full justify-center`}
  >
    {/* Active Powerups + Key */}
    <div className="absolute top-24 right-4 flex flex-col gap-2 z-50">
      {activePowerups.shield && (
        <motion.div
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-400/50 rounded-xl text-blue-400 backdrop-blur-sm"
        >
          <Shield size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Shield</span>
        </motion.div>
      )}
      {activePowerups.speed > Date.now() && (
        <motion.div
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-xl text-yellow-400 backdrop-blur-sm"
        >
          <Zap size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Speed</span>
        </motion.div>
      )}
      {activePowerups.map > Date.now() && (
        <motion.div
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-400 backdrop-blur-sm"
        >
          <Map size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Map</span>
        </motion.div>
      )}
      {ghostCount > 0 && (
        <motion.div
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-500/20 border border-slate-400/50 rounded-xl text-slate-300 backdrop-blur-sm"
        >
          <Ghost size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Ghost x{ghostCount}</span>
        </motion.div>
      )}
      {magnetActive && (
        <motion.div
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-300 backdrop-blur-sm"
        >
          <Magnet size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Magnet</span>
        </motion.div>
      )}
      {freezeActive && (
        <motion.div
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-xl text-cyan-300 backdrop-blur-sm"
        >
          <Snowflake size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Freeze</span>
        </motion.div>
      )}
      <AnimatePresence>
        {hasKey && (
          <motion.div
            initial={{ x: 50, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-xl text-yellow-400 backdrop-blur-sm shadow-[0_0_12px_rgba(234,179,8,0.3)]"
          >
            <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <KeyRound size={16} />
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest">Key</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <GameHeader
      theme={theme}
      isDailyChallenge={isDailyChallenge}
      currentLevel={currentLevel}
      activeModifier={activeModifier}
      timeLimit={timeLimit}
      elapsedTime={elapsedTime}
      moves={moves}
      coins={coins}
      isPaused={isPaused}
      setIsPaused={setIsPaused}
      useHint={useHint}
    />

    <MazeViewport
      theme={theme}
      activePowerups={activePowerups}
      currentLevel={currentLevel}
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
      joystick={joystick}
      setJoystick={setJoystick}
      movePlayer={movePlayer}
      controlScheme={controlScheme}
      damageFlash={damageFlash}
      isBumping={isBumping}
      isDashing={isDashing}
      moveDirection={moveDirection}
      jumpProActive={jumpProActive}
      executeJumpPro={executeJumpPro}
      cancelJumpPro={cancelJumpPro}
    />

    <GameControls
      controlScheme={controlScheme}
      currentLevel={currentLevel}
      startLevel={startLevel}
      jumpCount={jumpCount}
      jumpProCount={jumpProCount}
      useJump={useJump}
      useJumpPro={useJumpPro}
      teleportCount={teleportCount}
      useTeleport={useTeleport}
      powerupInventory={powerupInventory}
      activatePowerup={activatePowerup}
    />

    {/* Pause overlay */}
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3 w-64 px-6 py-8 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">
              ⏸ paused
            </div>
            <div className="text-xl font-black italic tracking-tight text-white mb-2">
              Take a breath 😮‍💨
            </div>

            <button
              onClick={() => setIsPaused(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-xl text-sm tracking-widest hover:opacity-90 transition-opacity active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              RESUME
            </button>

            <button
              onClick={() => startLevel(currentLevel)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-zinc-300 font-bold rounded-xl text-sm border border-zinc-800 hover:border-zinc-600 transition-colors active:scale-95"
            >
              <RotateCcw size={15} />
              RESTART LEVEL
            </button>

            <button
              onClick={() => { setIsPaused(false); setGameState('start'); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-zinc-500 font-bold rounded-xl text-sm border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 transition-all active:scale-95"
            >
              <Home size={15} />
              HOME
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Streak reward toast */}
    <AnimatePresence>
      {streakReward && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 bg-zinc-950 border border-amber-500/60 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[220px]"
        >
          <div className="text-2xl">{streakReward.type === 'milestone' ? '🏆' : '🎁'}</div>
          <div>
            <div className="text-amber-400 font-black text-xs uppercase tracking-widest">Streak Reward!</div>
            <div className="text-white text-sm font-bold">
              {streakReward.type === 'coins' && `+${streakReward.amount} coins`}
              {streakReward.type === 'powerup' && `${streakReward.powerupId} x${streakReward.amount}`}
              {streakReward.type === 'milestone' && (streakReward.label ?? 'Milestone reached!')}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default GameUI;
