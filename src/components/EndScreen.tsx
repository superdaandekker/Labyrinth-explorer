import React from 'react';
import { motion } from 'motion/react';
import { Skull, RotateCcw, Trophy, ChevronRight, Zap, Tv } from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import { REVIVE_COST } from '../constants';
import { GameMode } from '../types';

interface EndScreenProps {
  gameState: 'won' | 'complete' | 'gameover';
  playerHealth: number;
  currentLevel: number;
  elapsedTime: number;
  moves: number;
  coins: number;
  score?: number;
  rank?: { label: string; color: string };
  revive: () => void;
  startLevel: (level: number) => void;
  restartGame: () => void;
  nextLevel: () => void;
  gameMode?: GameMode;
  adReviveCount?: number;
  onWatchAdRevive?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50, rotateX: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0, rotateX: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25, staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EndScreen: React.FC<EndScreenProps> = ({
  gameState, playerHealth, currentLevel, elapsedTime, moves, coins,
  score, rank, revive, startLevel, restartGame, nextLevel,
  gameMode, adReviveCount = 0, onWatchAdRevive,
}) => {
  const isWin = gameState === 'won' || gameState === 'complete';

  return (
    <motion.div
      key="end-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -50, scale: 0.9, rotateX: -20 }}
      className="z-10 text-center bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl max-w-sm mx-4"
    >
      <motion.div
        variants={itemVariants}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg ${
          gameState === 'gameover'
            ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20'
            : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/20'
        }`}
      >
        {gameState === 'gameover'
          ? (playerHealth <= 0 ? <Skull size={32} className="text-white" /> : <RotateCcw size={32} className="text-white" />)
          : <Trophy size={32} className="text-white" />}
      </motion.div>

      <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-black italic mb-1 sm:mb-2 tracking-tight text-white">
        {gameState === 'gameover'
          ? (playerHealth <= 0 ? 'YOU DIED' : 'TIME EXPIRED')
          : gameState === 'complete' ? 'GAME COMPLETE!' : 'SECTOR CLEAR!'}
      </motion.h2>

      <motion.p variants={itemVariants} className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
        {gameState === 'gameover'
          ? (playerHealth <= 0 ? 'The labyrinth claimed your soul. Try again?' : 'The clock ran out. Try again?')
          : `Sector ${currentLevel + 1} conquered in ${formatTime(elapsedTime)}.`}
      </motion.p>

      {isWin && score !== undefined && rank && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 mb-4 sm:mb-6"
        >
          <div className={`text-5xl sm:text-6xl font-black italic ${rank.color} drop-shadow-lg`}>
            {rank.label}
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Run Score</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-white">
              {score.toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-7">
        <div className="p-3 sm:p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Time</div>
          <div className="font-mono text-lg sm:text-xl text-white">{formatTime(elapsedTime)}</div>
        </div>
        <div className="p-3 sm:p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Moves</div>
          <div className="font-mono text-lg sm:text-xl text-white">{moves}</div>
        </div>
      </motion.div>

      {gameState === 'gameover' ? (
        <motion.div variants={itemVariants} className="flex flex-col gap-2 sm:gap-3 w-full">
          {/* Hard mode: revive via ads (3×) of echt geld — geen coin-revive */}
          {gameMode === 'hard' ? (
            <>
              {onWatchAdRevive && (
                <button
                  onClick={onWatchAdRevive}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/30 text-sm sm:text-base"
                >
                  <Tv size={18} />
                  WATCH AD ({adReviveCount}/3) — FREE REVIVE
                </button>
              )}
            </>
          ) : (
            coins >= REVIVE_COST && (
              <button
                onClick={revive}
                className="w-full py-3 sm:py-4 bg-amber-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-400/20 text-sm sm:text-base"
              >
                <Zap size={18} fill="currentColor" />
                REVIVE ({REVIVE_COST} COINS)
              </button>
            )
          )}
          <button
            onClick={() => startLevel(currentLevel)}
            className="w-full py-3 sm:py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
          >
            <RotateCcw size={18} />
            TRY AGAIN
          </button>
          <button
            onClick={restartGame}
            className="mt-1 w-full py-2 text-zinc-500 font-bold text-[10px] sm:text-xs hover:text-zinc-300 transition-colors"
          >
            BACK TO MENU
          </button>
        </motion.div>
      ) : gameState === 'complete' ? (
        <motion.button
          variants={itemVariants}
          onClick={restartGame}
          className="w-full py-3 sm:py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
        >
          <RotateCcw size={18} />
          PLAY AGAIN
        </motion.button>
      ) : (
        <motion.button
          variants={itemVariants}
          onClick={nextLevel}
          className="w-full py-3 sm:py-4 bg-cyan-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
        >
          NEXT LEVEL
          <ChevronRight size={18} />
        </motion.button>
      )}
    </motion.div>
  );
};

export default EndScreen;
