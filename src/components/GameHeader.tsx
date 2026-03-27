import React from 'react';
import { motion } from 'motion/react';
import { Zap, Pause, Eye } from 'lucide-react';
import { ThemeType, ActiveModifier } from '../types';
import { formatTime } from '../utils/formatTime';
import { HINT_COST } from '../constants';

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
}) => {
  const isUrgent = timeLimit !== null && (timeLimit - elapsedTime) < 10;
  const displayTime = timeLimit !== null
    ? formatTime(Math.max(0, timeLimit - elapsedTime))
    : formatTime(elapsedTime);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-2xl px-3"
    >
      {/* ── Floating HUD strip ── */}
      <div
        className="glass rounded-2xl px-4 py-3 shadow-violet-glow"
        style={{
          transform: 'perspective(600px) rotateX(2deg)',
          transformOrigin: '50% 100%',
          boxShadow: '0 0 30px rgba(109,40,217,0.2), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex justify-between items-center gap-4">

          {/* ── Left: level + modifier ── */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-violet-400/45 font-bold whitespace-nowrap">
                Infinite Labyrinth
              </span>
              {isDailyChallenge && (
                <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-black text-[8px] tracking-widest flex items-center gap-1 shrink-0">
                  <Zap size={7} /> DAILY
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-black italic tracking-tight text-violet-100"
                style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}
              >
                Sector {currentLevel + 1}
              </span>
              {activeModifier && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest ${activeModifier.color} shrink-0`}
                >
                  <span className="scale-75">{activeModifier.icon}</span>
                  {activeModifier.name}
                </motion.span>
              )}
            </div>
          </div>

          {/* ── Right: stats + buttons ── */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Time */}
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.2em] text-violet-400/40 font-bold">
                {timeLimit !== null ? 'Left' : 'Time'}
              </div>
              <div className={`font-mono font-black tabular-nums ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-violet-100'}`}
                style={{ fontSize: 'clamp(1rem, 3.5vw, 1.3rem)' }}
              >
                {displayTime}
              </div>
            </div>

            {/* Moves */}
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.2em] text-violet-400/40 font-bold">Moves</div>
              <div className="font-mono font-black tabular-nums text-violet-100"
                style={{ fontSize: 'clamp(1rem, 3.5vw, 1.3rem)' }}
              >
                {moves}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/8 rounded-full" />

            {/* Pause */}
            <button
              onClick={() => setIsPaused(true)}
              className="p-2.5 glass rounded-xl hover:border-violet-500/40 transition-colors text-violet-300 hover:text-violet-100"
            >
              <Pause size={16} />
            </button>

            {/* Hint */}
            <button
              onClick={useHint}
              disabled={coins < HINT_COST}
              className="p-2.5 glass rounded-xl hover:border-amber-500/40 transition-colors text-amber-400 disabled:opacity-25"
              title={`Hint (${HINT_COST} coins)`}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameHeader;
