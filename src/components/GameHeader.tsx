import React from 'react';
import { motion } from 'motion/react';
import { Zap, Pause, Eye } from 'lucide-react';
import { ThemeType, ActiveModifier } from '../types';
import { THEMES } from '../constants';
import { formatTime } from '../utils/formatTime';

interface GameHeaderProps {
  theme: ThemeType;
  isDailyChallenge: boolean;
  currentLevel: number;
  activeModifier: ActiveModifier | null;
  timeLimit: number | null;
  elapsedTime: number;
  moves: number;
  coins: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  useHint: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  theme, isDailyChallenge, currentLevel, activeModifier,
  timeLimit, elapsedTime, moves, coins, setIsPaused, useHint,
}) => (
  <div className="w-full max-w-2xl flex justify-between items-end gap-8 px-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Infinite Labyrinth</span>
        {isDailyChallenge && (
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-black italic text-[8px] tracking-widest flex items-center gap-1">
            <Zap size={8} /> DAILY
          </span>
        )}
      </div>
      <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
        Sector {currentLevel + 1}
        {activeModifier && (
          <motion.div
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
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
          <div className={`font-mono text-xl tabular-nums ${timeLimit !== null && (timeLimit - elapsedTime) < 10 ? 'text-red-500 animate-pulse' : ''}`}>
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
      >
        <Pause size={18} />
      </button>
      <button
        onClick={useHint}
        disabled={coins < 50}
        className={`p-3 ${THEMES[theme].wallColor} border ${THEMES[theme].borderClass} rounded-xl hover:opacity-80 transition-colors text-amber-400 disabled:opacity-30`}
        title="Hint (50 coins)"
      >
        <Eye size={18} />
      </button>
    </div>
  </div>
);

export default GameHeader;
