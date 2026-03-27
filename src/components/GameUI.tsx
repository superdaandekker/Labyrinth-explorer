import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Map, KeyRound, Ghost, Magnet, Snowflake, Play, Home, RotateCcw } from 'lucide-react';
import { ThemeType, SkinType, Point, PowerupState, ActiveModifier, JoystickState, TrailPoint, GameState, StreakReward, GameMode } from '../types';
import { THEMES } from '../constants';
import GameHeader from './GameHeader';
import MazeViewport from './MazeViewport';
import GameControls from './GameControls';

interface GameUIProps {
  theme: ThemeType;
  selectedSkin: SkinType;
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
  joystick: JoystickState | null;
  setJoystick: (joystick: JoystickState | null) => void;
  movePlayer: (dx: number, dy: number) => void;
  isPaused: boolean;
  setGameState: (state: GameState) => void;
  startLevel: (level: number) => void;
  controlScheme: 'joystick' | 'swipe';
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
  isFogOfWar?: boolean;
  villainPos?: Point | null;
  gameMode?: GameMode;
}

const badgeClass = 'flex items-center gap-1.5 rounded-xl px-2 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-2';
const badgeLabelClass = 'text-[9px] font-black uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-widest';

const GameUI: React.FC<GameUIProps> = ({
  theme, selectedSkin, activePowerups, isDailyChallenge, currentLevel, activeModifier,
  timeLimit, elapsedTime, moves, setIsPaused, useHint, coins, hasKey,
  damageFlash, isBumping, dynamicCellSize, playerPos, maze, puzzleState,
  breakableWallsHealth, isDoorOpen, visitedCells, isHintActive, hintPath,
  exitPos, playerTrail, joystick, setJoystick, movePlayer,
  isPaused, setGameState, startLevel, controlScheme,
  isDashing = false, moveDirection = 'right',
  jumpCount, jumpProCount, jumpProActive, useJump, useJumpPro, executeJumpPro, cancelJumpPro,
  teleportCount, useTeleport, ghostCount, magnetActive, freezeActive,
  powerupInventory, activatePowerup, streakReward,
  isFogOfWar = false, villainPos = null,
}) => (
  <motion.div
    key="playing"
    initial={{ opacity: 0, scale: 1.05, filter: 'brightness(0)' }}
    animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
    exit={{ opacity: 0, scale: 0.95, filter: 'brightness(2)' }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className={`relative z-10 flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden ${THEMES[theme].bgClass}`}
    style={{ minHeight: '100dvh' }}
  >
    <div
      className="absolute right-2 z-50 flex max-w-[7.5rem] flex-col gap-1.5 sm:right-4 sm:max-w-none sm:gap-2"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4.75rem)' }}
    >
      {activePowerups.shield && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${badgeClass} border border-blue-400/50 bg-blue-500/20 text-blue-400`}
        >
          <Shield size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className={badgeLabelClass}>Shield</span>
        </motion.div>
      )}

      {activePowerups.speed > Date.now() && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${badgeClass} border border-yellow-400/50 bg-yellow-500/20 text-yellow-400`}
        >
          <Zap size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className={badgeLabelClass}>Speed</span>
        </motion.div>
      )}

      {activePowerups.map > Date.now() && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${badgeClass} border border-emerald-400/50 bg-emerald-500/20 text-emerald-400`}
        >
          <Map size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className={badgeLabelClass}>Map</span>
        </motion.div>
      )}

      {ghostCount > 0 && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${badgeClass} border border-slate-400/50 bg-slate-500/20 text-slate-300`}
        >
          <Ghost size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className={badgeLabelClass}>Ghost x{ghostCount}</span>
        </motion.div>
      )}

      {magnetActive && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${badgeClass} border border-amber-400/50 bg-amber-500/20 text-amber-300`}
        >
          <Magnet size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className={badgeLabelClass}>Magnet</span>
        </motion.div>
      )}

      {freezeActive && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${badgeClass} border border-cyan-400/50 bg-cyan-500/20 text-cyan-300`}
        >
          <Snowflake size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className={badgeLabelClass}>Freeze</span>
        </motion.div>
      )}

      <AnimatePresence>
        {hasKey && (
          <motion.div
            initial={{ x: 50, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.8 }}
            className={`${badgeClass} border border-yellow-400/50 bg-yellow-500/20 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]`}
          >
            <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <KeyRound size={14} className="sm:h-4 sm:w-4" />
            </motion.div>
            <span className={badgeLabelClass}>Key</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div
      className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between gap-3 px-2 pb-3 pt-3 sm:gap-4 sm:px-4 sm:pb-4 sm:pt-4"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
      }}
    >
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

      <div className="flex w-full flex-1 items-center justify-center">
        <MazeViewport
          theme={theme}
          selectedSkin={selectedSkin}
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
          isFogOfWar={isFogOfWar}
          villainPos={villainPos}
        />
      </div>

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
    </div>

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
            className="flex w-64 flex-col items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-8 shadow-2xl"
          >
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              paused
            </div>
            <div className="mb-2 text-xl font-black italic tracking-tight text-white">
              Take a breath
            </div>

            <button
              onClick={() => setIsPaused(false)}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 text-sm font-black tracking-widest text-white transition-opacity hover:opacity-90 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <Play size={16} fill="currentColor" />
                RESUME
              </span>
            </button>

            <button
              onClick={() => startLevel(currentLevel)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-600 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <RotateCcw size={15} />
                RESTART LEVEL
              </span>
            </button>

            <button
              onClick={() => { setIsPaused(false); setGameState('start'); }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-bold text-zinc-500 transition-all hover:border-zinc-600 hover:text-zinc-300 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <Home size={15} />
                HOME
              </span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {streakReward && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 z-[200] flex min-w-[220px] -translate-x-1/2 items-center gap-4 rounded-2xl border border-amber-500/60 bg-zinc-950 px-6 py-4 shadow-2xl"
        >
          <div className="text-2xl">{streakReward.type === 'milestone' ? '🏆' : '🎁'}</div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-amber-400">Streak Reward!</div>
            <div className="text-sm font-bold text-white">
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

export default React.memo(GameUI);
