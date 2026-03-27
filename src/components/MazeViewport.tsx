import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { ThemeType, Point, PowerupState, JoystickState, TrailPoint } from '../types';
import { THEMES, VIEWPORT_SIZE } from '../constants';
import MazeCell from './MazeCell';

interface MazeViewportProps {
  theme: ThemeType;
  activePowerups: PowerupState;
  currentLevel: number;
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
  controlScheme: 'joystick' | 'swipe';
  damageFlash: boolean;
  isBumping: boolean;
  isDashing?: boolean;
  moveDirection?: 'up' | 'down' | 'left' | 'right';
  jumpProActive: boolean;
  executeJumpPro: (dx: number, dy: number) => void;
  cancelJumpPro: () => void;
  isFogOfWar?: boolean;
  villainPos?: Point | null;
}

const MazeViewport = React.memo(({
  theme, activePowerups, currentLevel, dynamicCellSize, playerPos,
  maze, puzzleState, breakableWallsHealth, isDoorOpen, visitedCells,
  isHintActive, hintPath, exitPos, playerTrail,
  joystick, setJoystick, movePlayer, controlScheme,
  damageFlash, isBumping, isDashing = false, moveDirection = 'right',
  jumpProActive, executeJumpPro, cancelJumpPro,
  isFogOfWar = false, villainPos = null,
}) => {
  // BUG-030: één move per swipe-gesture
  const swipeMovedRef = useRef(false);
  // BUG-029: joystick vuurt alleen bij richtingswisseling opnieuw onmiddellijk
  const joystickLastDirRef = useRef('');
  // Swipe-richting feedback (300ms flash)
  const [swipeFlash, setSwipeFlash] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const swipeFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireSwipeFlash = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (swipeFlashTimerRef.current) clearTimeout(swipeFlashTimerRef.current);
    setSwipeFlash(dir);
    swipeFlashTimerRef.current = setTimeout(() => setSwipeFlash(null), 300);
  }, []);

  const handlePanStart = (_e: PointerEvent, info: PanInfo) => {
    swipeMovedRef.current = false;
    if (controlScheme !== 'joystick') return;
    setJoystick({ active: true, x: info.point.x, y: info.point.y, offsetX: 0, offsetY: 0 });
    joystickLastDirRef.current = '';
  };

  const handlePan = (_e: PointerEvent, info: PanInfo) => {
    if (controlScheme === 'joystick' && joystick?.active) {
      const dx = info.point.x - joystick.x;
      const dy = info.point.y - joystick.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 40;
      const limitedDx = dist > maxDist ? (dx / dist) * maxDist : dx;
      const limitedDy = dist > maxDist ? (dy / dist) * maxDist : dy;
      setJoystick({ ...joystick, offsetX: limitedDx, offsetY: limitedDy });
      if (dist > 20) {
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
        joystickLastDirRef.current = dir;
        if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx > 0 ? 1 : -1, 0);
        else movePlayer(0, dy > 0 ? 1 : -1);
        navigator.vibrate?.(8);
      } else {
        joystickLastDirRef.current = '';
      }
    } else if (controlScheme === 'swipe') {
      if (swipeMovedRef.current) return; // BUG-030: blokkeer verdere moves in zelfde gesture
      // Adaptieve threshold: ~4% schermbreedте, minimaal 20px
      const threshold = Math.max(20, window.innerWidth * 0.04);
      if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
        if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
          const dir = info.offset.x > 0 ? 'right' : 'left';
          movePlayer(info.offset.x > 0 ? 1 : -1, 0);
          fireSwipeFlash(dir);
        } else {
          const dir = info.offset.y > 0 ? 'down' : 'up';
          movePlayer(0, info.offset.y > 0 ? 1 : -1);
          fireSwipeFlash(dir);
        }
        navigator.vibrate?.(12);
        swipeMovedRef.current = true;
      }
    }
  };

  const handlePanEnd = () => {
    setJoystick(null);
    swipeMovedRef.current = false;
    joystickLastDirRef.current = '';
  };

  // Virtualisatie: alleen cellen binnen viewport + 1-cel buffer renderen
  const cols = maze[0]?.length ?? 0;
  const rows = maze.length;
  const half = Math.floor(VIEWPORT_SIZE / 2);
  const startX = Math.max(0, playerPos.x - half - 1);
  const endX = Math.min(cols - 1, playerPos.x + half + 1);
  const startY = Math.max(0, playerPos.y - half - 1);
  const endY = Math.min(rows - 1, playerPos.y + half + 1);

  return (
    <motion.div
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      animate={damageFlash
        ? { x: [-6, 6, -6, 6, 0], y: [-3, 3, -3, 3, 0], scale: [1, 1.03, 1] }
        : isBumping ? { x: [-2, 2, -2, 2, 0], scale: 1.01 } : { scale: 1 }}
      transition={damageFlash ? { duration: 0.2 } : { duration: 0.1 }}
      className={`relative p-2 ${THEMES[theme].pathColor} border ${THEMES[theme].borderClass} rounded-2xl overflow-hidden touch-none maze-perspective scanlines portal-flicker`}
      style={{
        width: VIEWPORT_SIZE * dynamicCellSize + 16,
        height: VIEWPORT_SIZE * dynamicCellSize + 16,
        boxShadow: '0 0 60px rgba(109,40,217,0.25), 0 0 120px rgba(67,56,202,0.1), 0 30px 60px rgba(0,0,0,0.7)',
      }}
    >
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{ backgroundPosition: `${-playerPos.x * 5}px ${-playerPos.y * 5}px` }}
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${THEMES[theme].pathGlow} 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel}
          initial={{ opacity: 0, filter: 'brightness(2)' }}
          animate={{
            opacity: 1, filter: 'brightness(1)',
            x: (4 - playerPos.x) * dynamicCellSize,
            y: (4 - playerPos.y) * dynamicCellSize,
            scale: joystick?.active ? 0.95 : 1
          }}
          exit={{ opacity: 0, filter: 'brightness(0)' }}
          transition={{
            opacity: { duration: 0.5 },
            x: { type: 'spring', stiffness: 300, damping: 30 },
            y: { type: 'spring', stiffness: 300, damping: 30 },
            scale: { duration: 0.3 }
          }}
          style={{ rotateX: 14, transformStyle: 'preserve-3d' }}
          className="absolute"
        >
          <div className="relative" style={{ width: cols * dynamicCellSize, height: rows * dynamicCellSize }}>
            {maze.slice(startY, endY + 1).flatMap((row, relY) => {
              const y = startY + relY;
              return row.slice(startX, endX + 1).map((cell, relX) => {
                const x = startX + relX;
                return (
                  <div key={`${x}-${y}`} className="absolute" style={{ left: x * dynamicCellSize, top: y * dynamicCellSize }}>
                    <MazeCell
                      x={x} y={y} cell={cell} theme={theme}
                      dynamicCellSize={dynamicCellSize} puzzleState={puzzleState}
                      breakableWallsHealth={breakableWallsHealth} isDoorOpen={isDoorOpen}
                      visitedCells={visitedCells}
                    />
                  </div>
                );
              });
            })}
          </div>

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
                  width: 8, height: 8,
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
            className="absolute border rounded-full flex items-center justify-center overflow-hidden"
            style={{
              width: dynamicCellSize - 6, height: dynamicCellSize - 6,
              left: exitPos.x * dynamicCellSize + 3, top: exitPos.y * dynamicCellSize + 3,
              backgroundColor: THEMES[theme].exitColor,
              borderColor: THEMES[theme].exitColor,
              opacity: isHintActive ? 1 : 0.25,
              boxShadow: isHintActive
                ? `0 0 30px ${THEMES[theme].exitColor}, 0 0 10px ${THEMES[theme].exitColor}`
                : `0 0 8px ${THEMES[theme].exitColor}`,
              zIndex: isHintActive ? 60 : 10
            }}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${THEMES[theme].exitCoreColor}`} />
          </div>

          {/* Player trail */}
          <AnimatePresence>
            {playerTrail.map((point, index) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0.25, scale: 0.7 }}
                animate={{ opacity: 0, scale: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={`absolute rounded-full z-20 ${THEMES[theme].trailColor}`}
                style={{
                  width: dynamicCellSize - 10, height: dynamicCellSize - 10,
                  left: point.x * dynamicCellSize + 5, top: point.y * dynamicCellSize + 5,
                  opacity: (5 - index) / 18
                }}
              />
            ))}
          </AnimatePresence>

          {/* Fog of war — dekt onbezochte cellen, blijft onder speler en slechterik */}
          {isFogOfWar && !(activePowerups.map > Date.now()) && (
            <div
              className="absolute pointer-events-none"
              style={{
                zIndex: 35,
                left: 0,
                top: 0,
                width: (maze[0]?.length || 0) * dynamicCellSize,
                height: (maze.length || 0) * dynamicCellSize,
                background: `radial-gradient(circle at ${(playerPos.x + 0.5) * dynamicCellSize}px ${(playerPos.y + 0.5) * dynamicCellSize}px, transparent ${2.5 * dynamicCellSize}px, rgba(0,0,0,0.97) ${4.5 * dynamicCellSize}px)`,
              }}
            />
          )}

          {/* Slechterik — zichtbaar door fog als hij dichtbij komt */}
          {villainPos && (
            <motion.div
              className="absolute rounded-full"
              animate={{
                left: villainPos.x * dynamicCellSize + 3,
                top: villainPos.y * dynamicCellSize + 3,
              }}
              transition={{
                left: { type: 'spring', stiffness: 250, damping: 28 },
                top: { type: 'spring', stiffness: 250, damping: 28 },
              }}
              style={{
                zIndex: 42,
                width: dynamicCellSize - 6,
                height: dynamicCellSize - 6,
                backgroundColor: '#ef4444',
                boxShadow: '0 0 20px rgba(239,68,68,0.9), 0 0 40px rgba(239,68,68,0.5)',
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-300"
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <span className="text-white font-black leading-none select-none" style={{ fontSize: Math.max(7, dynamicCellSize * 0.26) }}>☠</span>
              </motion.div>
            </motion.div>
          )}

          {/* Player */}
          <motion.div
            className={`absolute rounded-full z-40 ${THEMES[theme].playerColor}`}
            animate={{
              left: playerPos.x * dynamicCellSize + 3,
              top: playerPos.y * dynamicCellSize + 3,
              scale: isBumping ? [1, 1.3, 0.9, 1] : isDashing ? [1, 1.4, 0.85, 1] : 1,
              filter: isDashing ? ['brightness(1)', 'brightness(2)', 'brightness(1)'] : 'brightness(1)',
            }}
            transition={{
              left: { type: 'spring', stiffness: 450, damping: 28 },
              top: { type: 'spring', stiffness: 450, damping: 28 },
              scale: { duration: 0.15 }
            }}
            style={{
              width: dynamicCellSize - 6, height: dynamicCellSize - 6,
              boxShadow: activePowerups.shield
                ? '0 0 30px #60a5fa, 0 0 12px #60a5fa, inset 0 0 8px rgba(255,255,255,0.3)'
                : `0 0 24px ${THEMES[theme].glowColor}, inset 0 0 8px rgba(255,255,255,0.2)`
            }}
          >
            <motion.div
              className="absolute inset-[3px] rounded-full bg-white/30"
              animate={{ opacity: isDashing ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: isDashing ? 0.4 : 1.8, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.span
                key={moveDirection}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: isDashing ? 0.9 : 0.5, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="text-white font-black leading-none select-none"
                style={{ fontSize: Math.max(8, dynamicCellSize * 0.28) }}
              >
                {moveDirection === 'right' ? '›' : moveDirection === 'left' ? '‹' : moveDirection === 'up' ? '˄' : '˅'}
              </motion.span>
            </div>
            <motion.div
              className="absolute -inset-1 rounded-full border border-white/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
            {activePowerups.shield && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -inset-2 border-2 border-blue-400 rounded-full blur-[2px]"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Swipe-richting flash — bevestigt geregistreerde swipe */}
      <AnimatePresence>
        {swipeFlash && (
          <motion.div
            key={swipeFlash}
            initial={{ opacity: 0.7, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-white/70 drop-shadow-lg">
              {swipeFlash === 'up' && <ArrowUp size={48} strokeWidth={3} />}
              {swipeFlash === 'down' && <ArrowDown size={48} strokeWidth={3} />}
              {swipeFlash === 'left' && <ArrowLeft size={48} strokeWidth={3} />}
              {swipeFlash === 'right' && <ArrowRight size={48} strokeWidth={3} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {joystick && joystick.active && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute z-50 pointer-events-none"
            style={{ left: joystick.x - 40, top: joystick.y - 40, width: 80, height: 80 }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm" />
            <motion.div
              className="absolute w-10 h-10 bg-white/30 rounded-full border border-white/40 shadow-xl"
              style={{ left: 20 + joystick.offsetX, top: 20 + joystick.offsetY }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jump Pro direction picker overlay */}
      <AnimatePresence>
        {jumpProActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-black mb-1">Choose Direction</span>
              <button onClick={() => executeJumpPro(0, -1)} className="p-3 bg-rose-500/20 border border-rose-400/50 rounded-xl text-rose-300 hover:bg-rose-500/40 active:scale-95 transition-all">
                <ArrowUp size={22} />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => executeJumpPro(-1, 0)} className="p-3 bg-rose-500/20 border border-rose-400/50 rounded-xl text-rose-300 hover:bg-rose-500/40 active:scale-95 transition-all">
                  <ArrowLeft size={22} />
                </button>
                <button onClick={cancelJumpPro} className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-500 hover:text-white active:scale-95 transition-all">
                  <X size={16} />
                </button>
                <button onClick={() => executeJumpPro(1, 0)} className="p-3 bg-rose-500/20 border border-rose-400/50 rounded-xl text-rose-300 hover:bg-rose-500/40 active:scale-95 transition-all">
                  <ArrowRight size={22} />
                </button>
              </div>
              <button onClick={() => executeJumpPro(0, 1)} className="p-3 bg-rose-500/20 border border-rose-400/50 rounded-xl text-rose-300 hover:bg-rose-500/40 active:scale-95 transition-all">
                <ArrowDown size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}) as React.FC<MazeViewportProps>;

export default MazeViewport;
