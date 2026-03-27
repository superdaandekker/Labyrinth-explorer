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

/* Particle positions — deterministic, no random() on render */
const PARTICLES: { left: string; top: string; dur: string; delay: string; size: number; color: string }[] = [
  { left: '8%',  top: '22%', dur: '6s',   delay: '0s',    size: 3, color: 'rgba(167,139,250,0.7)' },
  { left: '88%', top: '12%', dur: '8.5s', delay: '1.2s',  size: 2, color: 'rgba(96,165,250,0.6)'  },
  { left: '20%', top: '70%', dur: '7s',   delay: '0.5s',  size: 2, color: 'rgba(240,171,252,0.5)' },
  { left: '72%', top: '55%', dur: '9s',   delay: '2.1s',  size: 3, color: 'rgba(167,139,250,0.5)' },
  { left: '50%', top: '5%',  dur: '6.5s', delay: '0.8s',  size: 2, color: 'rgba(110,231,183,0.5)' },
  { left: '93%', top: '78%', dur: '7.5s', delay: '1.6s',  size: 2, color: 'rgba(167,139,250,0.6)' },
  { left: '35%', top: '90%', dur: '8s',   delay: '3s',    size: 3, color: 'rgba(96,165,250,0.4)'  },
  { left: '62%', top: '30%', dur: '5.5s', delay: '0.3s',  size: 2, color: 'rgba(240,171,252,0.6)' },
];

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
      initial={{ opacity: 0, scale: 0.88, filter: 'blur(20px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.6, ease: 'anticipate' }}
      className="z-10 w-full max-w-sm px-4 flex flex-col items-center"
    >
      {/* ── Fixed floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="fixed particle rounded-full"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: p.color,
            '--dur': p.dur,
            '--delay': p.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Title block ── */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-[9px] uppercase tracking-[0.45em] text-violet-400/50 font-bold mb-2"
        >
          ✦ abandon all hope, ye who enter ✦
        </motion.div>

        <motion.h1
          initial={{ y: -15, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="title-liquid font-black italic leading-none select-none"
          style={{ fontSize: 'clamp(3.5rem, 16vw, 5.5rem)', letterSpacing: '-0.04em' }}
        >
          LABYRINTH
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent my-3"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-violet-300/35 text-[11px] tracking-[0.15em] font-medium"
        >
          EXPLORER
        </motion.p>
      </div>

      {/* ── Coins ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="flex items-center gap-2 px-4 py-2 glass rounded-full mb-6 shadow-violet-glow-sm"
      >
        <Coins size={13} className="text-amber-400" />
        <span className="text-amber-400 font-black text-sm tabular-nums">{coins}</span>
        <span className="text-violet-400/35 text-[10px]">coins</span>
        <button
          onClick={watchAd}
          className="ml-1 flex items-center gap-1 text-[9px] text-violet-400/35 hover:text-amber-400 transition-colors font-bold uppercase tracking-wide border-l border-white/10 pl-2"
        >
          <Eye size={10} /> +50
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showModeSelect ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-3"
          >
            {/* ── PLAY — 3D extruded ── */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              onClick={() => setShowModeSelect(true)}
              className="relative w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black rounded-xl overflow-hidden btn-extrude text-sm tracking-[0.2em]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Play size={17} fill="currentColor" />
                NEW GAME
                <ChevronRight size={15} className="opacity-50" />
              </div>
            </motion.button>

            {/* ── Continue ── */}
            {hasSavedGame && (
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.27 }}
                onClick={loadSavedGame}
                className="w-full py-3.5 glass rounded-xl card-3d text-white font-bold text-sm flex items-center justify-center gap-2 hover:border-violet-500/40 transition-colors"
              >
                <RotateCcw size={15} />
                CONTINUE
              </motion.button>
            )}

            {/* ── Daily Challenge ── */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              onClick={startDailyChallenge}
              disabled={dailyDone}
              className="relative w-full py-3.5 glass border border-amber-500/30 rounded-xl overflow-hidden card-3d hover:border-amber-500/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
              <div className="flex flex-col items-center gap-0.5 relative z-10">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Zap size={15} />
                  DAILY CHALLENGE
                  {!dailyDone && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 rounded-full text-[8px] font-black text-amber-300 uppercase tracking-widest animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-violet-400/40 uppercase tracking-widest">
                  {dailyDone ? '✓ completed today' : `Today: ${dailyModifier.name}`}
                </div>
              </div>
            </motion.button>

            {/* ── Icon grid ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="grid grid-cols-4 gap-2"
            >
              {[
                { onClick: () => setShowShop(true),         icon: <ShoppingBag size={18} />, label: 'Shop',     color: 'text-violet-400', border: 'border-violet-500/25 hover:border-violet-400/55' },
                { onClick: () => setShowLeaderboard(true),  icon: <Trophy size={18} />,      label: 'Ranks',    color: 'text-amber-400',  border: 'hover:border-amber-500/40' },
                { onClick: () => setShowAchievements(true), icon: <Star size={18} />,        label: 'Awards',   color: 'text-indigo-300', border: 'hover:border-indigo-400/40' },
                { onClick: () => setShowSettings(true),     icon: <Settings size={18} />,    label: 'Settings', color: 'text-violet-300/50', border: 'hover:border-violet-400/30' },
              ].map(({ onClick, icon, label, color, border }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`flex flex-col items-center gap-1.5 py-3.5 glass border rounded-xl transition-all card-3d group ${border}`}
                >
                  <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-violet-300/50">{label}</span>
                </button>
              ))}
            </motion.div>
          </motion.div>

        ) : (
          /* ── Mode selector ── */
          <motion.div
            key="modeselect"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-3"
          >
            <button
              onClick={() => setShowModeSelect(false)}
              className="flex items-center gap-1.5 text-violet-400/45 hover:text-violet-300 transition-colors text-xs font-bold uppercase tracking-widest self-start mb-1"
            >
              <ArrowLeft size={13} /> Back
            </button>

            <div className="text-[9px] uppercase tracking-[0.25em] text-violet-400/40 font-bold ml-1">
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
                      if (isUnlocked) { setGameMode(mode); }
                      else { buyGameMode(mode); }
                    }}
                    className={`relative w-full py-3 px-4 rounded-xl border transition-all flex flex-col items-start gap-0.5 card-3d ${
                      isSelected
                        ? 'bg-violet-900/30 border-violet-500/55 text-white shadow-[0_0_20px_rgba(139,92,246,0.18)]'
                        : 'glass border-white/6 text-violet-300/50 hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black italic tracking-tight ${isSelected ? config.color : 'text-violet-300/55'}`}>
                        {config.label}
                      </span>
                      {!isUnlocked && (
                        <div className="flex items-center gap-1 text-amber-400 text-[9px] font-bold">
                          <Coins size={10} /><span>{config.price}</span>
                        </div>
                      )}
                      {isSelected && isUnlocked && (
                        <span className="text-[8px] text-violet-300 font-black uppercase tracking-widest">✦ active</span>
                      )}
                    </div>
                    <p className="text-[9px] text-violet-400/38 text-left leading-tight">{config.description}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => startLevel(0)}
              className="relative w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black rounded-xl overflow-hidden btn-extrude text-sm tracking-[0.2em] mt-1"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Play size={17} fill="currentColor" /> START
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StartMenu;
