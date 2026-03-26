import { Trophy, Zap, Eye, Coins, Sparkles, ShoppingBag, Shield, Map, Move, RotateCcw, ArrowUp, EyeOff, Gamepad2, Skull, KeyRound, Lock, Ghost } from 'lucide-react';
import { GameMode, GameModeConfig, Achievement, ThemeType, ThemeConfig, PowerupConfig, TutorialConfig, DailyModifier } from './types';
import React from 'react';

// Maze cell type constants
export const CELL_SIZE = 30;
export const WALL = 1;
export const PATH = 0;
export const BREAKABLE_WALL = 2;
export const COIN = 3;
export const HIDDEN_BUTTON = 4;
export const PRESSURE_PLATE = 5;
export const DOOR = 6;
export const LEVER = 7;
export const TOGGLE_WALL = 8;
export const SPIKES = 9;
export const POISON_GAS = 10;
export const ILLUSIONARY_WALL = 11;
export const POWERUP_SHIELD = 12;
export const POWERUP_SPEED = 13;
export const POWERUP_MAP = 14;
export const KEY = 15;
export const KEY_DOOR = 16;

export const DAILY_MODIFIERS: DailyModifier[] = [
  {
    id: 'REVERSED_GRAVITY',
    name: 'Reversed Gravity',
    description: 'Controls are inverted! Up is Down, Left is Right.',
    color: 'text-purple-400',
    icon: React.createElement(Move, { className: "animate-bounce" })
  },
  {
    id: 'ILLUSIONARY_WALLS',
    name: 'Illusionary Walls',
    description: 'Some walls are not what they seem. Walk through them!',
    color: 'text-cyan-400',
    icon: React.createElement(Ghost, { className: "animate-pulse" })
  },
  {
    id: 'COLLECT_ALL_COINS',
    name: 'Greed is Good',
    description: 'Collect all coins in the maze to unlock the exit!',
    color: 'text-amber-400',
    icon: React.createElement(Coins, { className: "animate-spin" })
  },
  {
    id: 'FOG_OF_WAR',
    name: 'Blind Run',
    description: 'Vision is extremely limited. Watch your step!',
    color: 'text-zinc-400',
    icon: React.createElement(EyeOff)
  },
  {
    id: 'SPEED_BOOST',
    name: 'Hyper Speed',
    description: 'You move twice as fast, but be careful of the walls!',
    color: 'text-rose-400',
    icon: React.createElement(Zap, { className: "animate-pulse" })
  },
  {
    id: 'LOW_GRAVITY',
    name: 'Low Gravity',
    description: 'Floaty movement! You slide an extra step when you move.',
    color: 'text-blue-300',
    icon: React.createElement(ArrowUp, { className: "animate-bounce" })
  },
  {
    id: 'ONE_WAY_PATHS',
    name: 'One-Way Paths',
    description: 'No backtracking! You cannot return to the cell you just left.',
    color: 'text-orange-400',
    icon: React.createElement(RotateCcw, { className: "rotate-180" })
  },
  {
    id: 'LIMITED_VISION',
    name: 'Limited Vision',
    description: 'Only your immediate surroundings are visible!',
    color: 'text-zinc-600',
    icon: React.createElement(EyeOff, { className: "opacity-50" })
  }
];

export const POWERUPS: Record<string, PowerupConfig> = {
  shield: {
    id: 'shield',
    name: 'Shield',
    description: 'Absorb one hit from hazards.',
    icon: React.createElement(Shield, { size: 16 }),
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    borderColor: 'border-blue-400/50',
    price: 100,
    cellType: POWERUP_SHIELD,
  },
  speed: {
    id: 'speed',
    name: 'Speed Boost',
    description: 'Move 50% faster for 10 seconds.',
    icon: React.createElement(Zap, { size: 16 }),
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    borderColor: 'border-yellow-400/50',
    duration: 10000,
    price: 150,
    cellType: POWERUP_SPEED,
  },
  map: {
    id: 'map',
    name: 'Map Reveal',
    description: 'Show the entire maze for 5 seconds.',
    icon: React.createElement(Map, { size: 16 }),
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
    borderColor: 'border-emerald-400/50',
    duration: 5000,
    price: 200,
    cellType: POWERUP_MAP,
  }
};

export const TUTORIALS: Record<string, TutorialConfig> = {
  coins: {
    title: 'Munten Verzamelen',
    description: 'Verzamel munten om nieuwe thema\'s en hints te kopen!',
    icon: React.createElement(Coins, { className: "text-amber-400", size: 32 })
  },
  secrets: {
    title: 'Geheime Muren',
    description: 'Sommige muren hebben barsten. Sla er 3 keer tegenaan om ze te breken!',
    icon: React.createElement(Zap, { className: "text-cyan-400", size: 32 })
  },
  puzzles: {
    title: 'Hendels & Deuren',
    description: 'Gebruik hendels om deuren op een andere plek in het doolhof te openen!',
    icon: React.createElement(Gamepad2, { className: "text-purple-400", size: 32 })
  },
  spikes: {
    title: 'Gevaarlijke Stekels',
    description: 'Pas op voor de stekels! Ze kosten je gezondheidspunten.',
    icon: React.createElement(Skull, { className: "text-red-500", size: 32 })
  },
  gas: {
    title: 'Giftig Gas',
    description: 'Blijf uit de buurt van de giftige dampen!',
    icon: React.createElement(Sparkles, { className: "text-purple-500", size: 32 })
  },
  movement: {
    title: 'Besturing',
    description: 'Raak het scherm aan en sleep in een richting om te bewegen.',
    icon: React.createElement(Gamepad2, { className: "text-cyan-400", size: 32 })
  },
  key: {
    title: 'Sleutel Gevonden!',
    description: 'Je hebt een sleutel opgepakt. Zoek de gouden deur om hem te gebruiken!',
    icon: React.createElement(KeyRound, { className: "text-yellow-400", size: 32 })
  }
};

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  normal: {
    label: 'Normal',
    description: 'Standard gameplay, no time pressure.',
    baseSize: 15,
    timeLimit: null,
    color: 'text-cyan-400',
    branchingFactor: 0.1
  },
  timed: {
    label: 'Timed',
    description: 'Race against the clock!',
    baseSize: 17,
    timeLimit: 60,
    color: 'text-yellow-400',
    branchingFactor: 0.3
  },
  premium: {
    label: 'Premium',
    description: 'The ultimate challenge. Complex mazes and elite rewards.',
    baseSize: 21,
    timeLimit: null,
    color: 'text-purple-500',
    branchingFactor: 0.05,
    price: 500
  },
  hard: {
    label: 'Hard',
    description: 'For those who want a real challenge.',
    baseSize: 25,
    timeLimit: 45,
    color: 'text-red-500',
    branchingFactor: 0.4
  }
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'no_hint',
    title: 'Pure Explorer',
    description: 'Complete a level without using a hint',
    icon: React.createElement(Sparkles, { size: 20, className: "text-cyan-400" }),
    condition: (stats) => !stats.hintUsed && stats.gameState === 'won'
  },
  {
    id: 'speedrunner',
    title: 'Speedrunner',
    description: 'Complete a level in under 15 seconds',
    icon: React.createElement(Zap, { size: 20, className: "text-yellow-400" }),
    condition: (stats) => stats.time < 15 && stats.gameState === 'won'
  },
  {
    id: 'cartographer',
    title: 'Cartographer',
    description: 'Visit every reachable cell in a maze',
    icon: React.createElement(Eye, { size: 20, className: "text-purple-400" }),
    condition: (stats) => stats.visitedRatio >= 0.95 && stats.gameState === 'won'
  },
  {
    id: 'rich',
    title: 'Coin Collector',
    description: 'Accumulate 500 coins',
    icon: React.createElement(Coins, { size: 20, className: "text-amber-400" }),
    condition: (stats) => stats.coins >= 500
  },
  {
    id: 'veteran',
    title: 'Master of Sectors',
    description: 'Reach level 10',
    icon: React.createElement(Trophy, { size: 20, className: "text-orange-500" }),
    condition: (stats) => stats.level >= 10
  },
  {
    id: 'stylist',
    title: 'Theme Collector',
    description: 'Unlock all available themes',
    icon: React.createElement(ShoppingBag, { size: 20, className: "text-emerald-400" }),
    condition: (stats) => stats.unlockedThemesCount >= 3
  },
  {
    id: 'lockpicker',
    title: 'Lockpicker',
    description: 'Use a key to open a locked door',
    icon: React.createElement(KeyRound, { size: 20, className: "text-yellow-400" }),
    condition: (stats) => stats.usedKey === true
  }
];

export const THEMES: Record<ThemeType, ThemeConfig> = {
  default: {
    label: 'Classic',
    wallColor: 'bg-zinc-900',
    wallGradient: 'from-zinc-700 to-zinc-900',
    pathColor: 'bg-zinc-950',
    playerColor: 'bg-cyan-400',
    exitColor: 'bg-amber-500',
    exitCoreColor: 'bg-amber-400',
    ambientColor: 'rgba(0,0,0,0.8)',
    trailColor: 'bg-cyan-400/20',
    glowColor: 'rgba(34,211,238,0.6)',
    bgClass: 'bg-black',
    borderClass: 'border-zinc-800',
    pathGlow: '#22d3ee',
    wallTexture: 'bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:8px_8px]',
    price: 0,
    puzzleActive: 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    puzzleInactive: 'bg-zinc-800 border-zinc-600',
    hazardColor: 'text-red-500',
    hazardSecondary: 'rgba(239,68,68,0.5)',
    doorColor: 'bg-zinc-800 border-zinc-600',
    doorAccent: 'bg-zinc-600',
    gasColor: 'bg-red-500/20',
  },
  cyberpunk: {
    label: 'Cyberpunk Neon',
    wallColor: 'bg-zinc-950',
    wallGradient: 'from-zinc-800 to-zinc-950',
    pathColor: 'bg-zinc-950',
    playerColor: 'bg-cyan-400',
    exitColor: 'bg-purple-500',
    exitCoreColor: 'bg-purple-400',
    ambientColor: 'rgba(0,0,0,0.85)',
    trailColor: 'bg-cyan-400/30',
    glowColor: 'rgba(34,211,238,0.8)',
    bgClass: 'bg-black',
    borderClass: 'border-zinc-800',
    pathGlow: '#22d3ee',
    wallTexture: 'bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:4px_4px]',
    price: 100,
    puzzleActive: 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    puzzleInactive: 'bg-zinc-800 border-zinc-600',
    hazardColor: 'text-red-500',
    hazardSecondary: 'rgba(239,68,68,0.5)',
    doorColor: 'bg-zinc-800 border-zinc-600',
    doorAccent: 'bg-zinc-600',
    gasColor: 'bg-red-500/20',
  },
  ruins: {
    label: 'Ancient Ruins',
    wallColor: 'bg-stone-900',
    wallGradient: 'from-stone-700 to-stone-900',
    pathColor: 'bg-stone-950',
    playerColor: 'bg-amber-500',
    exitColor: 'bg-emerald-600',
    exitCoreColor: 'bg-emerald-400',
    ambientColor: 'rgba(28,25,23,0.9)',
    trailColor: 'bg-amber-500/20',
    glowColor: 'rgba(245,158,11,0.6)',
    bgClass: 'bg-stone-950',
    borderClass: 'border-stone-800',
    pathGlow: '#f59e0b',
    wallTexture: 'bg-[linear-gradient(45deg,_rgba(0,0,0,0.1)_25%,_transparent_25%,_transparent_50%,_rgba(0,0,0,0.1)_50%,_rgba(0,0,0,0.1)_75%,_transparent_75%,_transparent)] bg-[length:8px_8px]',
    price: 150,
    puzzleActive: 'bg-amber-600 border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.8)]',
    puzzleInactive: 'bg-stone-800 border-stone-700',
    hazardColor: 'text-orange-700',
    hazardSecondary: 'rgba(194,65,12,0.5)',
    doorColor: 'bg-stone-800 border-stone-700',
    doorAccent: 'bg-stone-600',
    gasColor: 'bg-orange-500/20',
  },
  forest: {
    label: 'Enchanted Forest',
    wallColor: 'bg-emerald-950',
    wallGradient: 'from-emerald-800 to-emerald-950',
    pathColor: 'bg-emerald-950',
    playerColor: 'bg-lime-400',
    exitColor: 'bg-rose-500',
    exitCoreColor: 'bg-rose-400',
    ambientColor: 'rgba(6,78,59,0.8)',
    trailColor: 'bg-lime-400/20',
    glowColor: 'rgba(163,230,53,0.6)',
    bgClass: 'bg-emerald-950',
    borderClass: 'border-emerald-900',
    pathGlow: '#a3e635',
    wallTexture: 'bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[length:6px_6px]',
    price: 300,
    puzzleActive: 'bg-lime-500 border-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.8)]',
    puzzleInactive: 'bg-emerald-900 border-emerald-800',
    hazardColor: 'text-purple-500',
    hazardSecondary: 'rgba(168,85,247,0.5)',
    doorColor: 'bg-emerald-900 border-emerald-800',
    doorAccent: 'bg-emerald-700',
    gasColor: 'bg-purple-500/20',
  }
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
