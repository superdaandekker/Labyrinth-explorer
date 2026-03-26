import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy } from 'lucide-react';
import { GAME_MODES } from '../../constants';
import { LeaderboardEntry } from '../../types';

interface LeaderboardModalProps {
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  leaderboard: LeaderboardEntry[];
  formatTime: (seconds: number) => string;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  showLeaderboard, setShowLeaderboard, leaderboard, formatTime,
}) => {
  const rankColor = (i: number) =>
    i === 0 ? 'text-yellow-500' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-500' : 'text-zinc-600';

  return (
    <AnimatePresence>
      {showLeaderboard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                  <Trophy size={24} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Hall of Fame</h2>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            {leaderboard.length > 0 && (
              <div className="grid grid-cols-[2rem_1fr_auto] gap-2 px-4 mb-2">
                <div />
                <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Mode</div>
                <div className="text-right text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
                  Score · Time · Moves
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 italic text-sm">
                  No records yet. Be the first to conquer the labyrinth!
                </div>
              ) : (
                leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2rem_1fr_auto] gap-2 items-center p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
                  >
                    <span className={`text-lg font-black text-center ${rankColor(i)}`}>{i + 1}</span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {GAME_MODES[entry.gameMode]?.label || 'Normal'}
                      </div>
                      <div className="text-[10px] text-zinc-500">{entry.date}</div>
                    </div>
                    <div className="text-right">
                      {entry.score !== undefined && (
                        <div className="font-mono font-black text-cyan-400 text-sm">
                          {entry.score.toLocaleString()}
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {formatTime(entry.time)} · {entry.moves}mv
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowLeaderboard(false)}
              className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl border border-zinc-800 transition-all"
            >
              CLOSE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaderboardModal;
