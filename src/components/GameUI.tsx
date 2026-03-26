import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Map, Pause, Eye, RotateCcw, Gamepad2 } from 'lucide-react';
import { ThemeType, DailyModifier, Point } from '../types';
import { THEMES, POWERUPS, PATH, COIN } from '../constants';
import MazeCell from './MazeCell';

interface GameUIProps {
  theme: ThemeType;
  activePowerups: any;
  isDailyChallenge: boolean;
  currentLevel: number;
  activeModifier: any;
  timeLimit: number | null;
  elapsedTime: number;
  moves: number;
  setIsPaused: (paused: boolean) => void;
  useHint: () => void;
  coins: number;
  damageFlash: boolean;
  isBumping: boolean;
  dynamicCellSize: number;
  playerPos: Point;
  maze: number[][];
  puzzleState: any;
  breakableWallsHealth: Record<string, number>;
  isDoorOpen: boolean;
  visitedCells: Set<string>;
  isHintActive: boolean;
  hintPath: Point[];
  exitPos: Point;
  playerTrail: any[];
  previousPos: Point | null;
  joystick: any;
  setJoystick: (joystick: any) => void;
  movePlayer: (dx: number, dy: number) => void;
  isPaused: boolean;
  setGameState: (state: any) => void;
  startLevel: (level: number) => void;
  controlScheme: 'joystick' | 'swipe';
  setShowShop: (show: boolean) => void;
  setShowAchievements: (show: boolean) => void;
}

const GameUI: React.FC<GameUIProps> = ({
  theme,
  activePowerups,
  isDailyChallenge,
  currentLevel,
  activeModifier,
  timeLimit,
  elapsedTime,
  moves,
  setIsPaused,
  useHint,
  coins,
  damageFlash,
  isBumping,
  dynamicCellSize,
  playerPos,
  maze,
  puzzleState,
  breakableWallsHealth,
  isDoorOpen,
  visitedCells,
  isHintActive,
  hintPath,
  exitPos,
  playerTrail,
  previousPos,
  joystick,
  setJoystick,
  movePlayer,
  isPaused,
  setGameState,
  startLevel,
  controlScheme,
  setShowShop,
  setShowAchievements
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePanStart = (e: any, info: any) => {
    if (controlScheme !== 'joystick') return;
    setJoystick({
      active: true,
      x: info.point.x,
      y: info.point.y,
      offsetX: 0,
      offsetY: 0
    });
  };

  const handlePan = (e: any, info: any) => {
    if (controlScheme === 'joystick' && joystick?.active) {
      const dx = info.point.x - joystick.x;
      const dy = info.point.y - joystick.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 40;
      
      const limitedDx = dist > maxDist ? (dx / dist) * maxDist : dx;
      const limitedDy = dist > maxDist ? (dy / dist) * maxDist : dy;
      
      setJoystick({ ...joystick, offsetX: limitedDx, offsetY: limitedDy });
      
      if (dist > 20) {
        if (Math.abs(dx) > Math.abs(dy)) {
          movePlayer(dx > 0 ? 1 : -1, 0);
        } else {
          movePlayer(0, dy > 0 ? 1 : -1);
        }
      }
    } else if (controlScheme === 'swipe') {
      const threshold = 30;
      if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
        if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
          movePlayer(info.offset.x > 0 ? 1 : -1, 0);
        } else {
          movePlayer(0, info.offset.y > 0 ? 1 : -1);
        }
      }
    }
  };

  const handlePanEnd = () => {
    setJoystick(null);
  };

  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0, scale: 1.05, filter: 'brightness(0)' }}
      animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'brightness(2)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`z-10 flex flex-col items-center gap-6 ${THEMES[theme].bgClass} min-h-screen w-full justify-center`}
    >
      {/* Active Powerups UI */}
      <div className="absolute top-24 right-4 flex flex-col gap-2 z-50">
        {activePowerups.shield && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-400/50 rounded-xl text-blue-400 backdrop-blur-sm"
          >
            <Shield size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Shield Active</span>
          </motion.div>
        )}
        {activePowerups.speed > Date.now() && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-xl text-yellow-400 backdrop-blur-sm"
          >
            <Zap size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Speed Boost</span>
          </motion.div>
        )}
        {activePowerups.map > Date.now() && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-400 backdrop-blur-sm"
          >
            <Map size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Map Revealed</span>
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-2xl flex justify-between items-end gap-8 px-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              Infinite Labyrinth
            </span>
            {isDailyChallenge && (
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-black italic text-[8px] tracking-widest flex items-center gap-1">
                <Zap size={8} />
                DAILY
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
            Sector {currentLevel + 1}
            {activeModifier && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg ${activeModifier.color}`}
              >
                <div className="scale-75">{activeModifier.icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{activeModifier.name}</span>
              </motion.div>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6 text-right">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                {timeLimit !== null ? 'Time Left' : 'Time'}
              </span>
              <div className={`font-mono text-xl tabular-nums ${
                timeLimit !== null && (timeLimit - elapsedTime) < 10 ? 'text-red-500 animate-pulse' : ''
              }`}>
                {timeLimit !== null ? formatTime(Math.max(0, timeLimit - elapsedTime)) : formatTime(elapsedTime)}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Moves</span>
              <div className="font-mono text-xl tabular-nums">{moves}</div>
            </div>
          </div>
          <button 
            onClick={() => setIsPaused(true)}
            className={`p-3 ${THEMES[theme].wallColor} border ${THEMES[theme].borderClass} rounded-xl hover:opacity-80 transition-colors text-white`}
            title="Pause Game"
          >
            <Pause size={18} />
          </button>
          <button 
            onClick={useHint}
            disabled={coins < 50}
            className={`p-3 ${THEMES[theme].wallColor} border ${THEMES[theme].borderClass} rounded-xl hover:opacity-80 transition-colors text-amber-400 disabled:opacity-30`}
            title="Use Hint (50 Coins)"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      <motion.div 
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        animate={damageFlash ? { 
          x: [-6, 6, -6, 6, 0], 
          y: [-3, 3, -3, 3, 0],
          scale: [1, 1.03, 1]
        } : (isBumping ? { 
          x: [-2, 2, -2, 2, 0],
          scale: 1.01 
        } : { scale: 1 })}
        transition={damageFlash ? { duration: 0.2 } : { duration: 0.1 }}
        className={`relative p-2 ${THEMES[theme].pathColor} border ${THEMES[theme].borderClass} rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden touch-none`}
        style={{
          width: 9 * dynamicCellSize + 16,
          height: 9 * dynamicCellSize + 16,
        }}
      >
        {/* Parallax Background Grid */}
        <motion.div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{
            backgroundPosition: `${-playerPos.x * 5}px ${-playerPos.y * 5}px`,
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${THEMES[theme].pathGlow} 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * (9 * dynamicCellSize), 
                y: Math.random() * (9 * dynamicCellSize),
                opacity: Math.random() * 0.3 + 0.1,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [null, Math.random() * -50 - 20],
                x: [null, (Math.random() - 0.5) * 30],
                opacity: [null, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentLevel}
            initial={{ opacity: 0, filter: 'brightness(2)' }}
            animate={{ 
              opacity: 1, 
              filter: 'brightness(1)',
              x: (4 - playerPos.x) * dynamicCellSize,
              y: (4 - playerPos.y) * dynamicCellSize,
              scale: (joystick?.active || activePowerups.speed > Date.now()) ? 0.95 : 1
            }}
            exit={{ opacity: 0, filter: 'brightness(0)' }}
            transition={{ 
              opacity: { duration: 0.5 },
              x: { type: 'spring', stiffness: 300, damping: 30 },
              y: { type: 'spring', stiffness: 300, damping: 30 },
              scale: { duration: 0.3 }
            }}
            className="absolute"
          >
            {/* Grid */}
            {maze.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <MazeCell 
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    cell={cell}
                    theme={theme}
                    dynamicCellSize={dynamicCellSize}
                    puzzleState={puzzleState}
                    breakableWallsHealth={breakableWallsHealth}
                    isDoorOpen={isDoorOpen}
                    visitedCells={visitedCells}
                  />
                ))}
              </div>
            ))}

            {/* Hint Path */}
            <AnimatePresence>
              {isHintActive && hintPath.map((p, i) => (
                <motion.div
                  key={`hint-${i}-${p.x}-${p.y}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="absolute rounded-full z-30"
                  style={{
                    width: 8,
                    height: 8,
                    left: p.x * dynamicCellSize + (dynamicCellSize - 8) / 2,
                    top: p.y * dynamicCellSize + (dynamicCellSize - 8) / 2,
                    backgroundColor: THEMES[theme].playerColor,
                    boxShadow: `0 0 10px ${THEMES[theme].playerColor}`
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Exit */}
            <div
              className={`absolute opacity-20 border rounded-sm flex items-center justify-center overflow-hidden z-10`}
              style={{
                width: dynamicCellSize - 4,
                height: dynamicCellSize - 4,
                left: exitPos.x * dynamicCellSize + 2,
                top: exitPos.y * dynamicCellSize + 2,
                backgroundColor: THEMES[theme].exitColor,
                borderColor: THEMES[theme].exitColor,
                opacity: isHintActive ? 1 : 0.2,
                boxShadow: isHintActive ? `0 0 30px ${THEMES[theme].exitColor}` : 'none',
                zIndex: isHintActive ? 60 : 10
              }}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)] ${THEMES[theme].exitCoreColor}`} />
              <div className={`absolute inset-0 animate-ping opacity-20 ${THEMES[theme].exitColor}`} />
            </div>

            {/* Player Trail */}
            <AnimatePresence>
              {playerTrail.map((point, index) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0.4, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className={`absolute rounded-sm z-20 ${THEMES[theme].trailColor}`}
                  style={{
                    width: dynamicCellSize - 8,
                    height: dynamicCellSize - 8,
                    left: point.x * dynamicCellSize + 4,
                    top: point.y * dynamicCellSize + 4,
                    opacity: (8 - index) / 20
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Ghost Trail (Echo Effect) */}
            {activePowerups.speed > Date.now() && previousPos && (
              <motion.div
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.2 }}
                key={`ghost-${playerPos.x}-${playerPos.y}`}
                className={`absolute rounded-sm z-30 ${THEMES[theme].playerColor} opacity-30 blur-[1px]`}
                style={{
                  width: dynamicCellSize - 4,
                  height: dynamicCellSize - 4,
                  left: previousPos.x * dynamicCellSize + 2,
                  top: previousPos.y * dynamicCellSize + 2,
                }}
              />
            )}

            {/* Player */}
            <motion.div
              className={`absolute rounded-sm z-40 ${THEMES[theme].playerColor}`}
              animate={{
                left: playerPos.x * dynamicCellSize + 2,
                top: playerPos.y * dynamicCellSize + 2,
                scale: isBumping ? [1, 1.2, 1] : 1,
                filter: activePowerups.speed > Date.now() ? 'hue-rotate(90deg) brightness(1.5)' : 'none'
              }}
              transition={{ 
                left: { type: 'spring', stiffness: 400, damping: 30 },
                top: { type: 'spring', stiffness: 400, damping: 30 },
                scale: { duration: 0.1 }
              }}
              style={{
                width: dynamicCellSize - 4,
                height: dynamicCellSize - 4,
                boxShadow: activePowerups.shield 
                  ? `0 0 25px #60a5fa, 0 0 10px #60a5fa` 
                  : `0 0 20px ${THEMES[theme].glowColor}`
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-sm" />
              {activePowerups.shield && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -inset-2 border-2 border-blue-400 rounded-full blur-[2px]"
                />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Joystick UI */}
        <AnimatePresence>
          {joystick && joystick.active && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute z-50 pointer-events-none"
              style={{
                left: joystick.x - 40,
                top: joystick.y - 40,
                width: 80,
                height: 80,
              }}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm" />
              <motion.div 
                className="absolute w-10 h-10 bg-white/30 rounded-full border border-white/40 shadow-xl"
                style={{
                  left: 20 + joystick.offsetX,
                  top: 20 + joystick.offsetY,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-8 items-center mt-12 w-full max-w-2xl">
        <div className="flex gap-4">
          <button 
            onClick={() => startLevel(currentLevel)}
            className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400 active:scale-95 flex items-center gap-2 shadow-lg"
            title="Restart Level"
          >
            <RotateCcw size={20} />
            <span className="sm:hidden text-sm font-medium uppercase tracking-widest">Reset</span>
          </button>
        </div>
        
        <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
          {controlScheme === 'joystick' && (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                <Gamepad2 size={32} className="animate-pulse" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black">Hold to Move</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GameUI;
