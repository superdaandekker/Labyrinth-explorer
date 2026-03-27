import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Zap, Trophy, RotateCcw, ShoppingBag, Settings, Star, ChevronRight, Coins, Eye, ArrowLeft } from 'lucide-react';
import { GameMode, ThemeType } from '../types';
import { GAME_MODES, DAILY_MODIFIERS } from '../constants';
import { getDailyModifierIndex } from '../utils/dailyChallenge';

interface StartMenuProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  unlockedGameModes: GameMode[];
  buyGameMode: (mode: GameMode) => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  unlockedThemes: ThemeType[];
  buyTheme: (theme: ThemeType) => void;
  startLevel: (level: number, isNewGame?: boolean) => void;
  watchAd: () => void;
  startDailyChallenge: () => void;
  lastDailyCompleted: string | null;
  setShowAchievements: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowShop: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  hasSavedGame: boolean;
  loadSavedGame: () => void;
  coins: number;
}

const StartMenu: React.FC<StartMenuProps> = ({
  gameMode,
  setGameMode,
  unlockedGameModes,
  buyGameMode,
  startLevel,
  watchAd,
  startDailyChallenge,
  lastDailyCompleted,
  setShowAchievements,
  setShowLeaderboard,
  setShowShop,
  setShowSettings,
  hasSavedGame,
  loadSavedGame,
  coins,
}) => {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const todayKey = new Date().toISOString().split('T')[0];
  const dailyDone = lastDailyCompleted === todayKey;
  const dailyModifier = DAILY_MODIFIERS[getDailyModifierIndex(DAILY_MODIFIERS.length)];

  return (
    <motion.div
      key="start"
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
      transition={{ duration: 0.5, ease: 'anticipate' }}
      className="z-10 w-full max-w-sm px-4 flex flex-col items-center"
    >
      {/* Title block */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1"
        >
          ☠️ abandon all hope, ye who enter
        </motion.div>
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl font-black tracking-tighter bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent italic leading-none"
        >
          LABYRINTH
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 text-xs mt-1"
        >
          turn left. no wait, right. actually… good luck.
        </motion.p>
      </div>

      {/* Coins */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-amber-500/30 rounded-full mb-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
      >
        <Coins size={14} className="text-amber-400" />
        <span className="text-amber-400 font-black text-sm tabular-nums">{coins}</span>
        <span className="text-zinc-600 text-[10px] font-medium">coins</span>
        <button
          onClick={watchAd}
          className="ml-1 flex items-center gap-1 text-[9px] text-zinc-500 hover:text-amber-400 transition-colors font-bold uppercase tracking-wide border-l border-zinc-800 pl-2"
        >
          <Eye size={10} />
          +50
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showModeSelect ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-3"
          >
            {/* PLAY button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowModeSelect(true)}
              className="group relative w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] text-sm tracking-widest"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="flex items-center justify-center gap-2">
                <Play size={18} fill="currentColor" />
                NEW GAME
                <ChevronRight size={16} className="opacity-60" />
              </div>
            </motion.button>

            {/* Continue */}
            {hasSavedGame && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={loadSavedGame}
                className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-2xl border border-zinc-700 hover:border-zinc-500 transition-all hover:scale-[1.01] active:scale-[0.98] text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                CONTINUE
              </motion.button>
            )}

            {/* Daily Challenge */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={startDailyChallenge}
              disabled={dailyDone}
              className="relative w-full py-3.5 bg-zinc-900 border border-amber-500/40 rounded-2xl overflow-hidden hover:border-amber-500/70 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Zap size={16} />
                  DAILY CHALLENGE
                  {!dailyDone && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 rounded-full text-[8px] font-black text-amber-300 uppercase tracking-widest animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest">
                  {dailyDone ? '✓ completed today' : `Today: ${dailyModifier.name}`}
                </div>
              </div>
            </motion.button>

            {/* Grid: Shop · Leaderboard · Achievements · Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-2 gap-2"
            >
              <button
                onClick={() => setShowShop(true)}
                className="flex flex-col items-center gap-1.5 py-4 bg-zinc-900 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 hover:bg-zinc-800/80 transition-all group"
              >
                <ShoppingBag size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Shop</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex flex-col items-center gap-1.5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 hover:bg-zinc-800/80 transition-all group"
              >
                <Trophy size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ranks</span>
              </button>

              <button
                onClick={() => setShowAchievements(true)}
                className="flex flex-col items-center gap-1.5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 hover:bg-zinc-800/80 transition-all group"
              >
                <Star size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Awards</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="flex flex-col items-center gap-1.5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 hover:bg-zinc-800/80 transition-all group"
              >
                <Settings size={20} className="text-zinc-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Settings</span>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          /* Game mode selector */
          <motion.div
            key="modeselect"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-3"
          >
            <button
              onClick={() => setShowModeSelect(false)}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-widest self-start mb-1"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1">
              Select Game Mode
            </div>

            <div className="flex flex-col gap-2">
              {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => {
                const isUnlocked = unlockedGameModes.includes(mode);
                const config = GAME_MODES[mode];
                const isSelected = gameMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (isUnlocked) {
                        setGameMode(mode);
                      } else {
                        buyGameMode(mode);
                      }
                    }}
                    className={`relative w-full py-3 px-4 rounded-xl border transition-all flex flex-col items-start gap-0.5 ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-600 text-white shadow-xl'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black italic tracking-tight ${isSelected ? config.color : 'text-zinc-400'}`}>
                        {config.label}
                      </span>
                      {!isUnlocked && (
                        <div className="flex items-center gap-1 text-amber-400 text-[9px] font-bold">
                          <Coins size={10} />
                          <span>{config.price}</span>
                        </div>
                      )}
                      {isSelected && isUnlocked && (
                        <span className="text-[8px] text-green-400 font-black uppercase tracking-widest">selected</span>
                      )}
                    </div>
                    <p className="text-[9px] text-zinc-500 text-left leading-tight opacity-80">
                      {config.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => startLevel(0)}
              className="group relative w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] text-sm tracking-widest mt-1"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="flex items-center justify-center gap-2">
                <Play size={18} fill="currentColor" />
                START
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StartMenu;
