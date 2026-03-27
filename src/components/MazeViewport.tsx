import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { ThemeType, SkinType, Point, PowerupState, JoystickState, TrailPoint } from '../types';
import { THEMES, SKINS, VIEWPORT_SIZE } from '../constants';
import MazeCell from './MazeCell';

interface MazeViewportProps {
  theme: ThemeType;
  selectedSkin: SkinType;
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

const renderSkinCharacter = (
  selectedSkin: SkinType,
  dynamicCellSize: number,
  moveDirection: 'up' | 'down' | 'left' | 'right',
  isDashing: boolean
) => {
  const skin = SKINS[selectedSkin];
  const faceShift = moveDirection === 'left' ? -1.5 : moveDirection === 'right' ? 1.5 : 0;
  const tilt = moveDirection === 'left' ? -5 : moveDirection === 'right' ? 5 : 0;
  const outline = `1.5px solid ${skin.outlineColor}`;
  const headSize = Math.max(8, dynamicCellSize * 0.34);
  const eyeSize = Math.max(1.5, dynamicCellSize * 0.055);
  const glow = isDashing ? `drop-shadow(0 0 8px ${skin.glowColor})` : 'none';

  const eyes = (
    <div
      className="absolute z-20 flex items-center justify-center"
      style={{
        left: `calc(50% + ${faceShift}px)`,
        top: dynamicCellSize * 0.22,
        width: headSize * 0.58,
        transform: 'translateX(-50%)',
        gap: eyeSize * 1.5,
      }}
    >
      <span className="rounded-full" style={{ width: eyeSize, height: eyeSize, backgroundColor: skin.eyeColor }} />
      <span className="rounded-full" style={{ width: eyeSize, height: eyeSize, backgroundColor: skin.eyeColor }} />
    </div>
  );

  if (selectedSkin === 'knight') {
    return (
      <div className="absolute inset-0" style={{ filter: glow }}>
        <div className="absolute left-[18%] right-[18%] top-[14%] h-[28%] rounded-[28%]" style={{ backgroundColor: skin.baseColor, border: outline, transform: `rotate(${tilt}deg)` }} />
        <div className="absolute left-[24%] right-[24%] top-[24%] h-[7%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        {eyes}
        <div className="absolute left-[15%] right-[15%] top-[44%] h-[28%] rounded-[30%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[9%] top-[46%] h-[18%] w-[16%] rounded-full" style={{ backgroundColor: skin.accentColor, border: outline }} />
        <div className="absolute right-[9%] top-[46%] h-[18%] w-[16%] rounded-full" style={{ backgroundColor: skin.accentColor, border: outline }} />
        <div className="absolute left-[28%] right-[28%] top-[52%] h-[8%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
        <div className="absolute left-[22%] top-[70%] h-[18%] w-[16%] rounded-b-full" style={{ backgroundColor: skin.detailColor, borderLeft: outline, borderRight: outline, borderBottom: outline }} />
        <div className="absolute right-[22%] top-[70%] h-[18%] w-[16%] rounded-b-full" style={{ backgroundColor: skin.detailColor, borderLeft: outline, borderRight: outline, borderBottom: outline }} />
      </div>
    );
  }

  if (selectedSkin === 'rogue') {
    return (
      <div className="absolute inset-0" style={{ filter: glow }}>
        <div className="absolute left-[21%] right-[21%] top-[12%] h-[31%] rounded-[42%_42%_36%_36%]" style={{ backgroundColor: skin.baseColor, border: outline, transform: `rotate(${tilt}deg)` }} />
        <div className="absolute left-[28%] right-[28%] top-[24%] h-[10%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        {eyes}
        <div className="absolute left-[24%] right-[24%] top-[44%] h-[31%] rounded-[40%_40%_28%_28%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[32%] right-[32%] top-[55%] h-[6%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
        <div className="absolute left-[17%] top-[50%] h-[20%] w-[11%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute right-[17%] top-[50%] h-[20%] w-[11%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute left-[26%] top-[70%] h-[18%] w-[12%] rounded-b-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute right-[26%] top-[70%] h-[18%] w-[12%] rounded-b-full" style={{ backgroundColor: skin.detailColor }} />
      </div>
    );
  }

  if (selectedSkin === 'mech') {
    return (
      <div className="absolute inset-0" style={{ filter: glow }}>
        <div className="absolute left-[24%] right-[24%] top-[14%] h-[26%] rounded-[22%]" style={{ backgroundColor: skin.baseColor, border: outline, transform: `rotate(${tilt}deg)` }} />
        <div className="absolute left-[34%] top-[9%] h-[7%] w-[4%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
        <div className="absolute right-[34%] top-[9%] h-[7%] w-[4%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
        {eyes}
        <div className="absolute left-[20%] right-[20%] top-[44%] h-[28%] rounded-[18%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[32%] right-[32%] top-[51%] h-[10%] rounded-md" style={{ backgroundColor: skin.detailColor, border: `1px solid ${skin.accentColor}` }} />
        <div className="absolute left-[10%] top-[48%] h-[18%] w-[10%] rounded-md" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute right-[10%] top-[48%] h-[18%] w-[10%] rounded-md" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute left-[26%] top-[72%] h-[16%] w-[12%] rounded-b-md" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute right-[26%] top-[72%] h-[16%] w-[12%] rounded-b-md" style={{ backgroundColor: skin.detailColor }} />
      </div>
    );
  }

  if (selectedSkin === 'mage') {
    return (
      <div className="absolute inset-0" style={{ filter: glow }}>
        <div className="absolute left-[26%] right-[26%] top-[5%] h-[18%]" style={{ backgroundColor: skin.baseColor, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        <div className="absolute left-[22%] right-[22%] top-[18%] h-[5%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
        <div className="absolute left-[26%] right-[26%] top-[18%] h-[23%] rounded-full" style={{ backgroundColor: skin.baseColor, border: outline, transform: `rotate(${tilt}deg)` }} />
        {eyes}
        <div className="absolute left-[18%] right-[18%] top-[42%] h-[37%]" style={{ backgroundColor: skin.baseColor, clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', borderBottom: outline }} />
        <div className="absolute left-[38%] top-[48%] h-[13%] w-[24%] rounded-full" style={{ backgroundColor: skin.accentColor, opacity: 0.9 }} />
        <div className="absolute left-[8%] top-[48%] h-[18%] w-[10%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute right-[8%] top-[48%] h-[18%] w-[10%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute right-[12%] top-[64%] h-[10%] w-[10%] rounded-full" style={{ backgroundColor: skin.accentColor, boxShadow: `0 0 8px ${skin.glowColor}` }} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0" style={{ filter: glow }}>
      <div className="absolute left-[24%] right-[24%] top-[14%] h-[26%] rounded-full" style={{ backgroundColor: skin.baseColor, border: outline, transform: `rotate(${tilt}deg)` }} />
      {eyes}
      <div className="absolute left-[23%] right-[23%] top-[44%] h-[28%] rounded-[36%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
      <div className="absolute left-[20%] right-[20%] top-[50%] h-[7%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
      <div className="absolute left-[14%] top-[46%] h-[19%] w-[11%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
      <div className="absolute right-[14%] top-[46%] h-[19%] w-[11%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
      <div className="absolute left-[30%] top-[71%] h-[17%] w-[11%] rounded-b-full" style={{ backgroundColor: skin.detailColor }} />
      <div className="absolute right-[30%] top-[71%] h-[17%] w-[11%] rounded-b-full" style={{ backgroundColor: skin.detailColor }} />
      <div className="absolute left-[55%] top-[44%] h-[12%] w-[16%] rounded-full" style={{ backgroundColor: skin.accentColor, transform: 'rotate(-18deg)' }} />
    </div>
  );
};

const MazeViewport = React.memo(({
  theme, selectedSkin, activePowerups, currentLevel, dynamicCellSize, playerPos,
  maze, puzzleState, breakableWallsHealth, isDoorOpen, visitedCells,
  isHintActive, hintPath, exitPos, playerTrail,
  joystick, setJoystick, movePlayer, controlScheme,
  damageFlash, isBumping, isDashing = false, moveDirection = 'right',
  jumpProActive, executeJumpPro, cancelJumpPro,
  isFogOfWar = false, villainPos = null,
}: MazeViewportProps) => {
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
            className="absolute z-40"
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
                : `0 0 24px ${THEMES[theme].glowColor}, 0 0 14px ${SKINS[selectedSkin].glowColor}`
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ opacity: isDashing ? [0.18, 0.34, 0.18] : [0.08, 0.16, 0.08] }}
              transition={{ repeat: Infinity, duration: isDashing ? 0.4 : 1.8, ease: 'easeInOut' }}
              style={{ backgroundColor: SKINS[selectedSkin].glowColor }}
            />
            {renderSkinCharacter(selectedSkin, dynamicCellSize, moveDirection, isDashing)}
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
