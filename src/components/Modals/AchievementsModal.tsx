import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS } from '../../constants';

interface AchievementsModalProps {
  showAchievements: boolean;
  setShowAchievements: (show: boolean) => void;
  unlockedAchievements: string[];
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  showAchievements,
  setShowAchievements,
  unlockedAchievements
}) => {
  return (
    <AnimatePresence>
      {showAchievements && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mx-4"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-500">
                  <Trophy size={28} />
                </div>
                <h2 className="text-2xl font-black italic tracking-tight text-white">ACHIEVEMENTS</h2>
              </div>
              <button 
                onClick={() => setShowAchievements(false)}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                return (
                  <div 
                    key={achievement.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isUnlocked 
                        ? 'bg-zinc-900/50 border-cyan-500/30' 
                        : 'bg-zinc-950 border-zinc-900 opacity-50 grayscale'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-zinc-800' : 'bg-zinc-900'} text-white`}>
                      {achievement.icon}
                    </div>
                    <div className="text-left">
                      <div className={`font-bold ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {achievement.title}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {achievement.description}
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="ml-auto">
                        <Sparkles size={16} className="text-cyan-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setShowAchievements(false)}
              className="mt-8 w-full py-4 bg-zinc-900 text-zinc-500 font-black italic rounded-2xl border border-zinc-800 hover:text-white transition-colors"
            >
              CLOSE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementsModal;
