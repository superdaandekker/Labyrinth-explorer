import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy } from 'lucide-react';
import { GAME_MODES } from '../../constants';
import { LeaderboardEntry } from '../../types';

interface LeaderboardModalProps {
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  leaderboard: LeaderboardEntry[];
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  showLeaderboard,
  setShowLeaderboard,
  leaderboard
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
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
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                  <Trophy size={24} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Hall of Fame</h2>
              </div>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 italic">
                  No records found yet. Be the first to conquer the labyrinth!
                </div>
              ) : (
                leaderboard.map((entry, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-black ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-500' : 'text-zinc-600'}`}>
                        {i + 1}
                      </span>
                      <div className="text-left">
                        <div className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-1">
                          {GAME_MODES[entry.gameMode]?.label || 'Normal'}
                        </div>
                        <div className="text-sm text-zinc-400">{entry.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-cyan-400">{formatTime(entry.time)}</div>
                      <div className="text-xs text-zinc-500 uppercase tracking-tighter">{entry.moves} moves</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowLeaderboard(false)}
              className="w-full mt-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl border border-zinc-800 transition-all"
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
