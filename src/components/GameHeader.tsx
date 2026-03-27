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
      className="w-full max-w-2xl px-1 sm:px-3"
    >
      <div
        className="glass rounded-2xl px-3 py-2.5 shadow-violet-glow sm:px-4 sm:py-3"
        style={{
          transform: 'perspective(600px) rotateX(2deg)',
          transformOrigin: '50% 100%',
          boxShadow: '0 0 30px rgba(109,40,217,0.2), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-violet-400/45 sm:text-[9px] sm:tracking-[0.25em]">
                Infinite Labyrinth
              </span>
              {isDailyChallenge && (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[8px] font-black tracking-[0.18em] text-amber-400 sm:tracking-widest">
                  <Zap size={7} /> DAILY
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className="font-black italic tracking-tight text-violet-100"
                style={{ fontSize: 'clamp(1rem, 4.8vw, 1.5rem)' }}
              >
                Sector {currentLevel + 1}
              </span>
              {activeModifier && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex max-w-full shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] ${activeModifier.color} sm:gap-1.5 sm:text-[9px] sm:tracking-widest`}
                >
                  <span className="scale-75">{activeModifier.icon}</span>
                  {activeModifier.name}
                </motion.span>
              )}
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex sm:w-auto sm:gap-3">
            <div className="text-right">
              <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-violet-400/40 sm:text-[9px] sm:tracking-[0.2em]">
                {timeLimit !== null ? 'Left' : 'Time'}
              </div>
              <div
                className={`font-mono font-black tabular-nums ${isUrgent ? 'animate-pulse text-rose-400' : 'text-violet-100'}`}
                style={{ fontSize: 'clamp(0.95rem, 4vw, 1.3rem)' }}
              >
                {displayTime}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-violet-400/40 sm:text-[9px] sm:tracking-[0.2em]">
                Moves
              </div>
              <div
                className="font-mono font-black tabular-nums text-violet-100"
                style={{ fontSize: 'clamp(0.95rem, 4vw, 1.3rem)' }}
              >
                {moves}
              </div>
            </div>

            <div className="hidden h-8 w-px rounded-full bg-white/8 sm:block" />

            <button
              onClick={() => setIsPaused(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass text-violet-300 transition-colors hover:border-violet-500/40 hover:text-violet-100 sm:h-auto sm:w-auto sm:p-2.5"
            >
              <Pause size={16} />
            </button>

            <button
              onClick={useHint}
              disabled={coins < HINT_COST}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass text-amber-400 transition-colors hover:border-amber-500/40 disabled:opacity-25 sm:h-auto sm:w-auto sm:p-2.5"
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
