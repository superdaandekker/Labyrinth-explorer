import React from 'react';
import { motion } from 'motion/react';
import { Heart, Settings, Coins } from 'lucide-react';

interface TopBarProps {
  playerHealth: number;
  maxHealth: number;
  coins: number;
  setShowShop: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  playerHealth,
  maxHealth,
  coins,
  setShowShop,
  setShowSettings
}) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md">
          <Heart size={16} className={`${playerHealth < maxHealth * 0.3 ? 'text-red-500 animate-pulse' : 'text-rose-400'}`} />
          <div className="w-16 sm:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ 
                width: `${(playerHealth / maxHealth) * 100}%`,
                backgroundColor: playerHealth < maxHealth * 0.3 ? '#ef4444' : '#fb7185'
              }}
              className="h-full shadow-[0_0_10px_rgba(251,113,133,0.5)]"
            />
          </div>
          <span className="text-[9px] font-black text-zinc-400 w-5">{playerHealth}</span>
        </div>
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
