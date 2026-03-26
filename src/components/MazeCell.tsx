import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Map, Skull, Sparkles } from 'lucide-react';
import { ThemeType } from '../types';
import { THEMES, ILLUSIONARY_WALL, WALL, BREAKABLE_WALL, POWERUP_SHIELD, POWERUP_SPEED, POWERUP_MAP, COIN, PRESSURE_PLATE, LEVER, DOOR, SPIKES, POISON_GAS, PATH } from '../constants';

interface MazeCellProps {
  x: number;
  y: number;
  cell: number;
  theme: ThemeType;
  dynamicCellSize: number;
  puzzleState: any;
  breakableWallsHealth: Record<string, number>;
  isDoorOpen: boolean;
  visitedCells: Set<string>;
}

const MazeCell = memo(({ 
  x, 
  y, 
  cell, 
  theme, 
  dynamicCellSize, 
  puzzleState, 
  breakableWallsHealth,
  isDoorOpen,
  visitedCells
}: MazeCellProps) => {
  const isPressurePlateActive = puzzleState.activeElements.has(`${x},${y}`);
  const isVisited = visitedCells.has(`${x},${y}`);
  
  return (
    <div
      className="relative"
      style={{
        width: dynamicCellSize,
        height: dynamicCellSize,
      }}
    >
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
        <div className={`absolute inset-[1px] rounded-[2px] bg-gradient-to-br ${THEMES[theme].wallGradient} border ${THEMES[theme].borderClass}/50 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_0_8px_rgba(0,0,0,0.8)] overflow-hidden`}>
          <div className={`absolute inset-0 opacity-30 ${THEMES[theme].wallTexture}`} />
        </div>
      )}
      {cell === BREAKABLE_WALL && (
        <div className={`absolute inset-[1px] rounded-[2px] bg-zinc-700 border-zinc-600 border-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center`}>
          <div className="w-1/2 h-1/2 border border-zinc-500/50 rounded-sm" />
          <div className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-zinc-400 opacity-50">
            {breakableWallsHealth[`${x},${y}`] || 3}
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
              animate={{ rotate: puzzleState.activeElements.has(`${x},${y}`) ? 45 : -45 }}
              className={`absolute inset-x-1.5 top-0 bottom-1 ${puzzleState.activeElements.has(`${x},${y}`) ? THEMES[theme].playerColor : 'bg-zinc-500'} origin-bottom`}
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
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`w-full h-full rounded-full blur-md ${THEMES[theme].gasColor}`}
          />
          <Sparkles size={10} className={`${THEMES[theme].hazardColor} opacity-40`} />
        </div>
      )}
      
      {/* Visited Indicator */}
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
