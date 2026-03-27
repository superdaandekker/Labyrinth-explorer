import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Map, Skull, Sparkles, KeyRound, Lock } from 'lucide-react';
import { ThemeType } from '../types';
import { THEMES, ILLUSIONARY_WALL, WALL, BREAKABLE_WALL, POWERUP_SHIELD, POWERUP_SPEED, POWERUP_MAP, COIN, PRESSURE_PLATE, LEVER, DOOR, SPIKES, POISON_GAS, PATH, KEY, KEY_DOOR, KEY_BLUE, KEY_DOOR_BLUE, KEY_GREEN, KEY_DOOR_GREEN, KEY_YELLOW, KEY_DOOR_YELLOW, KEY_PURPLE, KEY_DOOR_PURPLE, HIDDEN_BUTTON, TOGGLE_WALL } from '../constants';

// Visuele stijl per gekleurde sleutel
const COLOR_KEY_STYLE: Record<number, string> = {
  [KEY_BLUE]:   'text-blue-400 border-blue-400 bg-blue-500/30 shadow-[0_0_12px_rgba(96,165,250,0.7)]',
  [KEY_GREEN]:  'text-emerald-400 border-emerald-400 bg-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.7)]',
  [KEY_YELLOW]: 'text-orange-400 border-orange-400 bg-orange-500/30 shadow-[0_0_12px_rgba(251,146,60,0.7)]',
  [KEY_PURPLE]: 'text-purple-400 border-purple-400 bg-purple-500/30 shadow-[0_0_12px_rgba(192,132,252,0.7)]',
};

// Visuele stijl per gekleurde deur
const COLOR_DOOR_STYLE: Record<number, { bg: string; border: string; text: string }> = {
  [KEY_DOOR_BLUE]:   { bg: 'bg-blue-900/60',    border: 'border-blue-600',    text: 'text-blue-400' },
  [KEY_DOOR_GREEN]:  { bg: 'bg-emerald-900/60',  border: 'border-emerald-600',  text: 'text-emerald-400' },
  [KEY_DOOR_YELLOW]: { bg: 'bg-orange-900/60',   border: 'border-orange-600',   text: 'text-orange-400' },
  [KEY_DOOR_PURPLE]: { bg: 'bg-purple-900/60',   border: 'border-purple-600',   text: 'text-purple-400' },
};

interface MazeCellProps {
  x: number;
  y: number;
  cell: number;
  theme: ThemeType;
  dynamicCellSize: number;
  puzzleState: Set<string>;
  breakableWallsHealth: Record<string, number>;
  isDoorOpen: boolean;
  visitedCells: Set<string>;
}

const MazeCell = memo(({
  x, y, cell, theme, dynamicCellSize, puzzleState,
  breakableWallsHealth, isDoorOpen, visitedCells
}: MazeCellProps) => {
  const isPressurePlateActive = puzzleState.has(`${x},${y}`);
  const isVisited = visitedCells.has(`${x},${y}`);

  return (
    <div className="relative" style={{ width: dynamicCellSize, height: dynamicCellSize }}>

      {cell === ILLUSIONARY_WALL && (
        <motion.div
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute inset-[1px] rounded-[2px] bg-gradient-to-br ${THEMES[theme].wallGradient} border ${THEMES[theme].borderClass}/30 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] overflow-hidden`}
        >
          <div className={`absolute inset-0 opacity-20 ${THEMES[theme].wallTexture}`} />
        </motion.div>
      )}

      {cell === WALL && (
        <div className={`absolute inset-[1px] rounded-[2px] bg-gradient-to-br ${THEMES[theme].wallGradient} border ${THEMES[theme].borderClass}/50 overflow-hidden wall-3d`}>
          <div className={`absolute inset-0 opacity-30 ${THEMES[theme].wallTexture}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent pointer-events-none" />
        </div>
      )}

      {cell === BREAKABLE_WALL && (
        <div className={`absolute inset-[1px] rounded-[2px] border-2 overflow-hidden shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center
          ${ (breakableWallsHealth[`${x},${y}`] ?? 3) >= 3 ? 'bg-zinc-700 border-zinc-600' :
             (breakableWallsHealth[`${x},${y}`] ?? 3) === 2 ? 'bg-zinc-600 border-amber-600/70' :
             'bg-zinc-500 border-red-500/70' }`}>
          {(breakableWallsHealth[`${x},${y}`] ?? 3) <= 2 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-[38%] w-px h-full bg-black/50 rotate-[14deg]" />
              {(breakableWallsHealth[`${x},${y}`] ?? 3) === 1 && (
                <div className="absolute top-[15%] right-[30%] w-px h-[80%] bg-black/40 rotate-[-9deg]" />
              )}
            </div>
          )}
          <div className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-zinc-200 font-bold opacity-80">
            {breakableWallsHealth[`${x},${y}`] ?? 3}
          </div>
        </div>
      )}

      {cell === POWERUP_SHIELD && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5 h-5 bg-blue-500/30 rounded-full border border-blue-400 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
          >
            <Shield size={12} />
          </motion.div>
        </div>
      )}

      {cell === POWERUP_SPEED && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-5 bg-yellow-500/30 rounded-full border border-yellow-400 flex items-center justify-center text-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
          >
            <Zap size={12} />
          </motion.div>
        </div>
      )}

      {cell === POWERUP_MAP && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-5 h-5 bg-emerald-500/30 rounded-full border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          >
            <Map size={12} />
          </motion.div>
        </div>
      )}

      {cell === COIN && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-amber-300 flex items-center justify-center"
          >
            <div className="w-1 h-1 bg-amber-200 rounded-full" />
          </motion.div>
        </div>
      )}

      {cell === KEY && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [-8, 8, -8], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-6 bg-yellow-500/30 rounded-full border border-yellow-400 flex items-center justify-center text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.7)]"
          >
            <KeyRound size={13} />
          </motion.div>
        </div>
      )}

      {COLOR_KEY_STYLE[cell] && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [-8, 8, -8], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-6 h-6 rounded-full border flex items-center justify-center ${COLOR_KEY_STYLE[cell]}`}
          >
            <KeyRound size={13} />
          </motion.div>
        </div>
      )}

      {COLOR_DOOR_STYLE[cell] && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`absolute inset-[2px] border-2 rounded-sm flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] ${COLOR_DOOR_STYLE[cell].bg} ${COLOR_DOOR_STYLE[cell].border}`}>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={COLOR_DOOR_STYLE[cell].text}
            >
              <Lock size={14} />
            </motion.div>
          </div>
        </div>
      )}

      {cell === KEY_DOOR && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-[2px] bg-yellow-900/60 border-2 border-yellow-600 rounded-sm flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-yellow-400"
            >
              <Lock size={14} />
            </motion.div>
          </div>
        </div>
      )}

      {cell === PRESSURE_PLATE && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-sm border-2 ${isPressurePlateActive ? THEMES[theme].puzzleActive : THEMES[theme].puzzleInactive} transition-colors`} />
        </div>
      )}

      {cell === LEVER && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-4 h-4">
            <div className={`absolute inset-x-1.5 bottom-0 h-1 ${THEMES[theme].doorAccent}`} />
            <motion.div
              animate={{ rotate: isPressurePlateActive ? 45 : -45 }}
              className={`absolute inset-x-1.5 top-0 bottom-1 ${isPressurePlateActive ? THEMES[theme].playerColor : 'bg-zinc-500'} origin-bottom`}
            />
          </div>
        </div>
      )}

      {cell === DOOR && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {!isDoorOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`absolute inset-[2px] ${THEMES[theme].doorColor} border-2 rounded-sm flex items-center justify-center`}
              >
                <div className={`w-1/2 h-1 ${THEMES[theme].doorAccent}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {cell === SPIKES && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ y: [2, -2, 2] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            className={THEMES[theme].hazardColor}
          >
            <Skull size={14} />
          </motion.div>
        </div>
      )}

      {cell === POISON_GAS && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 90, 180, 270, 360] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`w-full h-full rounded-full blur-md ${THEMES[theme].gasColor}`}
          />
          <Sparkles size={10} className={`${THEMES[theme].hazardColor} opacity-40`} />
        </div>
      )}

      {cell === TOGGLE_WALL && (
        <motion.div
          animate={{ opacity: puzzleState.has('toggle_walls_open') ? [0.2, 0.4, 0.2] : 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`absolute inset-[1px] rounded-[2px] ${puzzleState.has('toggle_walls_open') ? 'bg-violet-900/30 border border-violet-500/30' : 'bg-gradient-to-br from-violet-900 to-violet-800 border border-violet-600/50 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]'}`}
        />
      )}

      {cell === HIDDEN_BUTTON && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-2 h-2 rounded-full border border-violet-400/40 bg-violet-500/20"
          />
        </div>
      )}

      {isVisited && cell === PATH && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-1 h-1 bg-white/30 rounded-full" />
        </div>
      )}
    </div>
  );
});

MazeCell.displayName = 'MazeCell';
export default MazeCell;
