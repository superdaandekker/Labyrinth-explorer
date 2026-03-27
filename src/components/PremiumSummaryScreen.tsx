import React from 'react';
import { motion } from 'motion/react';
import { Coins, Trophy, Clock } from 'lucide-react';
import { POWERUPS } from '../constants';
import { formatTime } from '../utils/formatTime';

interface PremiumSummaryScreenProps {
  coins: number;
  premiumCollected: Record<string, number>;
  elapsedTime: number;
  onBack: () => void;
}

export default function PremiumSummaryScreen({ coins, premiumCollected, elapsedTime, onBack }: PremiumSummaryScreenProps) {
  const collectedEntries = Object.entries(premiumCollected).filter(([, count]) => count > 0);
  const totalItems = collectedEntries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <motion.div
      key="premium_summary"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="flex flex-col items-center gap-6 px-4 max-w-sm w-full"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="text-4xl mb-2"
        >
          🏆
        </motion.div>
        <h1 className="text-2xl font-black tracking-wider text-yellow-400 uppercase">Premium Run</h1>
        <p className="text-zinc-400 text-sm mt-1">Tijd voorbij — hier is je buit</p>
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/80 border border-yellow-500/30 rounded-xl p-3 flex flex-col items-center gap-1">
          <Clock size={16} className="text-zinc-400" />
          <span className="text-yellow-300 font-bold text-sm">{formatTime(elapsedTime)}</span>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Tijd</span>
        </div>
        <div className="bg-zinc-900/80 border border-yellow-500/30 rounded-xl p-3 flex flex-col items-center gap-1">
          <Coins size={16} className="text-amber-400" />
          <span className="text-amber-300 font-bold text-sm">{coins}</span>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Coins</span>
        </div>
        <div className="bg-zinc-900/80 border border-yellow-500/30 rounded-xl p-3 flex flex-col items-center gap-1">
          <Trophy size={16} className="text-violet-400" />
          <span className="text-violet-300 font-bold text-sm">{totalItems}</span>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Items</span>
        </div>
      </div>

      {/* Collected items */}
      {collectedEntries.length > 0 && (
        <div className="w-full bg-zinc-900/80 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3 font-semibold">Verzamelde items</p>
          <div className="flex flex-col gap-2">
            {collectedEntries.map(([id, count]) => {
              const cfg = POWERUPS[id];
              if (!cfg) return null;
              return (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <span className="text-zinc-200 text-sm">{cfg.name}</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">×{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {collectedEntries.length === 0 && (
        <p className="text-zinc-500 text-sm italic">Geen items verzameld — probeer het opnieuw!</p>
      )}

      {/* Note */}
      <p className="text-zinc-500 text-xs text-center">Premium modus moet opnieuw worden gekocht voor de volgende run.</p>

      {/* Back button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="w-full py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold rounded-xl text-sm uppercase tracking-wider hover:bg-yellow-500/30 transition-colors"
      >
        Terug naar start
      </motion.button>
    </motion.div>
  );
}
