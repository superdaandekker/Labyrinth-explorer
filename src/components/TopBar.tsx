import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Settings, Coins } from 'lucide-react';
import { KEY, KEY_BLUE, KEY_GREEN, KEY_YELLOW, KEY_PURPLE } from '../constants';

// FEAT-008 / BUG-032: key ring — kleur + emoji per sleuteltype
const KEY_COLORS: Record<number, { bg: string; label: string }> = {
  [KEY]:        { bg: '#e2e8f0', label: '🗝' },
  [KEY_BLUE]:   { bg: '#60a5fa', label: '🗝' },
  [KEY_GREEN]:  { bg: '#4ade80', label: '🗝' },
  [KEY_YELLOW]: { bg: '#facc15', label: '🗝' },
  [KEY_PURPLE]: { bg: '#c084fc', label: '🗝' },
};

interface TopBarProps {
  playerHealth: number;
  maxHealth: number;
  coins: number;
  hasKey: boolean;
  heldColorKeys: Set<number>;
  setShowShop: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  playerHealth,
  maxHealth,
  coins,
  hasKey,
  heldColorKeys,
  setShowShop,
  setShowSettings
}) => {
  const activeKeys: number[] = [
    ...(hasKey ? [KEY as number] : [] as number[]),
    ...[...heldColorKeys],
  ];

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* FEAT-003: low-health warning bij laatste hart */}
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border rounded-xl shadow-xl backdrop-blur-md transition-colors ${playerHealth === 1 ? 'border-red-500/60' : 'border-zinc-800'}`}>
          <Heart size={16} className={`${playerHealth === 1 ? 'text-red-500 animate-pulse' : 'text-rose-400'}`} />
          <div className="w-16 sm:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <motion.div
              initial={{ width: '100%' }}
              animate={{
                width: `${(playerHealth / maxHealth) * 100}%`,
                backgroundColor: playerHealth === 1 ? '#ef4444' : '#fb7185'
              }}
              className="h-full shadow-[0_0_10px_rgba(251,113,133,0.5)]"
            />
          </div>
          {playerHealth === 1 ? (
            <span className="text-[9px] font-black text-red-400 animate-pulse tracking-widest">LOW</span>
          ) : (
            <span className="text-[9px] font-black text-zinc-400 w-5">{playerHealth}</span>
          )}
        </div>

        {/* FEAT-008 / BUG-032: key ring — toon verzamelde sleutels */}
        <AnimatePresence>
          {activeKeys.map((k) => (
            <motion.div
              key={k}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center justify-center w-7 h-7 rounded-lg shadow-md text-sm"
              style={{
                background: `${KEY_COLORS[k]?.bg}22`,
                border: `1.5px solid ${KEY_COLORS[k]?.bg}88`,
              }}
            >
              🗝
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all text-zinc-400"
        >
          <Settings size={18} />
        </button>
        <button 
          onClick={() => setShowShop(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-amber-400 font-bold hover:bg-zinc-800 transition-all text-sm"
        >
          <Coins size={16} />
          <span>{coins}</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
