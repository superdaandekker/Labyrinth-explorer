import React from 'react';
import { motion } from 'motion/react';
import { Play, Eye, Zap, Trophy, RotateCcw, Info, ArrowUp, Coins } from 'lucide-react';
import { GameMode, ThemeType } from '../types';
import { GAME_MODES, THEMES, DAILY_MODIFIERS, containerVariants, itemVariants } from '../constants';
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
  hasSavedGame: boolean;
  loadSavedGame: () => void;
  coins: number;
}

const StartMenu: React.FC<StartMenuProps> = ({
  gameMode,
  setGameMode,
  unlockedGameModes,
  buyGameMode,
  theme,
  setTheme,
  unlockedThemes,
  buyTheme,
  startLevel,
  watchAd,
  startDailyChallenge,
  lastDailyCompleted,
  setShowAchievements,
  setShowLeaderboard,
  hasSavedGame,
  loadSavedGame,
  coins
}) => {
  return (
    <motion.div
      key="start"
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: "anticipate" }}
      className="z-10 text-center max-w-md"
    >
      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-2 sm:mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent italic">
        LABYRINTH
      </h1>
      <p className="text-zinc-400 mb-6 sm:mb-8 text-sm sm:text-lg px-4">
        Navigate through the neon corridors. Find the exit before time runs out.
      </p>

      <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold text-left ml-2">Select Game Mode</span>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => {
              const isUnlocked = unlockedGameModes.includes(mode);
              const config = GAME_MODES[mode];
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
                    gameMode === mode 
                      ? 'bg-zinc-800 border-zinc-700 text-white shadow-xl' 
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black italic tracking-tight ${gameMode === mode ? config.color : 'text-zinc-400'}`}>
                      {config.label}
                    </span>
                    {!isUnlocked && (
                      <div className="flex items-center gap-1 text-amber-400 text-[9px] font-bold">
                        <Coins size={10} />
                        <span>{config.price}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-500 text-left leading-tight opacity-80">
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold text-left ml-2">Select Theme</span>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(THEMES) as ThemeType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (unlockedThemes.includes(t)) {
                    setTheme(t);
                  } else {
                    buyTheme(t);
                  }
                }}
                className={`relative py-2.5 px-3 rounded-xl text-[10px] font-bold transition-all border ${
                  theme === t 
                    ? 'bg-zinc-800 text-white border-white shadow-lg' 
                    : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span>{THEMES[t].label}</span>
                  {!unlockedThemes.includes(t) && (
                    <div className="flex items-center gap-1 text-[9px] text-amber-400">
                      <Coins size={8} />
                      <span>{THEMES[t].price}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          <motion.button
            variants={itemVariants}
            onClick={() => startLevel(0)}
            className="group relative px-8 py-3.5 bg-white text-black font-bold rounded-xl overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="flex items-center justify-center gap-2 text-sm">
              <Play size={18} fill="currentColor" />
              NEW GAME
            </div>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={watchAd}
            className="group relative px-8 py-3.5 bg-zinc-900 text-amber-400 font-bold rounded-xl border border-amber-400/30 overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Eye size={18} />
            WATCH AD (+50)
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={startDailyChallenge}
            className="group relative px-8 py-3.5 bg-zinc-900 text-amber-400 font-bold rounded-xl border border-amber-400/30 overflow-hidden transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-0.5"
          >
            <div className="flex items-center gap-2 text-sm">
              <Zap size={18} />
              DAILY CHALLENGE
            </div>
            {lastDailyCompleted !== new Date().toISOString().split('T')[0] && (
              <div className="text-[7px] uppercase tracking-widest opacity-60">
                Today: {DAILY_MODIFIERS[getDailyModifierIndex(DAILY_MODIFIERS.length)].name}
              </div>
            )}
            {lastDailyCompleted === new Date().toISOString().split('T')[0] && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">COMPLETED</span>
              </div>
            )}
          </motion.button>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              variants={itemVariants}
              onClick={() => setShowAchievements(true)}
              className="group relative py-3 bg-zinc-900 text-cyan-400 font-bold rounded-xl border border-cyan-400/30 overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-xs"
            >
              <Trophy size={16} />
              AWARDS
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={() => setShowLeaderboard(true)}
              className="group relative py-3 bg-zinc-900/50 text-zinc-400 font-bold rounded-xl border border-zinc-800/50 overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-xs"
            >
              <Trophy size={16} />
              RANKS
            </motion.button>
          </div>

          {hasSavedGame && (
            <motion.button
              variants={itemVariants}
              onClick={loadSavedGame}
              className="group relative px-8 py-3.5 bg-zinc-900 text-white font-bold rounded-xl border border-zinc-800 overflow-hidden transition-transform hover:scale-105 active:scale-95 text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <RotateCcw size={18} />
                CONTINUE
              </div>
            </motion.button>
          )}
        </motion.div>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 border border-zinc-800 rounded-xl">
            <ArrowUp size={16} />
          </div>
          <span>Move</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 border border-zinc-800 rounded-xl">
            <Info size={16} />
          </div>
          <span>Infinite</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StartMenu;
