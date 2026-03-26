import { Trophy, Zap, Eye, Coins, Sparkles, ShoppingBag, Shield, Map, Move, RotateCcw, ArrowUp, EyeOff, Gamepad2, Skull, KeyRound, Lock, Ghost, ChevronsUp, Crosshair, Magnet, Snowflake, Navigation } from 'lucide-react';
import { GameMode, GameModeConfig, Achievement, ThemeType, ThemeConfig, PowerupConfig, TutorialConfig, DailyModifier, StreakReward } from './types';
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
export const VIEWPORT_SIZE = 9;

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
  },
  jump: {
    id: 'jump',
    name: 'Jump',
    description: 'Instantly jump 2 cells in your current direction, over any obstacle.',
    icon: React.createElement(ChevronsUp, { size: 16 }),
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/20',
    borderColor: 'border-violet-400/50',
    price: 175,
  },
  jumpPro: {
    id: 'jumpPro',
    name: 'Jump Pro',
    description: 'Choose your direction, then jump 2 cells over any obstacle.',
    icon: React.createElement(Crosshair, { size: 16 }),
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/20',
    borderColor: 'border-rose-400/50',
    price: 200,
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    description: 'Auto-triggers on your next wall: pass right through it.',
    icon: React.createElement(Ghost, { size: 16 }),
    color: 'text-slate-300',
    bgColor: 'bg-slate-300/20',
    borderColor: 'border-slate-300/50',
    price: 250,
    unlockedLevel: 10,
  },
  magnet: {
    id: 'magnet',
    name: 'Magnet',
    description: 'Auto-collect all coins within 3 cells for 15 seconds.',
    icon: React.createElement(Magnet, { size: 16 }),
    color: 'text-amber-300',
    bgColor: 'bg-amber-300/20',
    borderColor: 'border-amber-300/50',
    price: 300,
    duration: 15000,
    unlockedLevel: 20,
  },
  freeze: {
    id: 'freeze',
    name: 'Freeze',
    description: 'Spikes and poison gas cannot hurt you for 10 seconds.',
    icon: React.createElement(Snowflake, { size: 16 }),
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-300/20',
    borderColor: 'border-cyan-300/50',
    price: 350,
    duration: 10000,
    unlockedLevel: 30,
  },
  teleport: {
    id: 'teleport',
    name: 'Teleport',
    description: 'Jump to a random open cell closer to the exit.',
    icon: React.createElement(Navigation, { size: 16 }),
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-400/20',
    borderColor: 'border-fuchsia-400/50',
    price: 400,
    unlockedLevel: 40,
  },
};

export const DAILY_STREAK_REWARDS: StreakReward[] = [
  { type: 'coins', amount: 50 },                              // Day 1
  { type: 'coins', amount: 100 },                             // Day 2
  { type: 'powerup', powerupId: 'jump', amount: 1 },          // Day 3
  { type: 'coins', amount: 150 },                             // Day 4
  { type: 'powerup', powerupId: 'shield', amount: 1 },        // Day 5
  { type: 'powerup', powerupId: 'jumpPro', amount: 1 },       // Day 6
  { type: 'coins', amount: 300 },                             // Day 7
  { type: 'powerup', powerupId: 'ghost', amount: 1 },         // Day 8
  { type: 'coins', amount: 500 },                             // Day 9
  { type: 'milestone', amount: 0, label: 'streak_skin_1' },   // Day 10 🏆
  { type: 'powerup', powerupId: 'magnet', amount: 1 },        // Day 11
  { type: 'coins', amount: 300 },                             // Day 12
  { type: 'powerup', powerupId: 'jump', amount: 2 },          // Day 13
  { type: 'powerup', powerupId: 'freeze', amount: 1 },        // Day 14
  { type: 'coins', amount: 500 },                             // Day 15
  { type: 'powerup', powerupId: 'teleport', amount: 1 },      // Day 16
  { type: 'powerup', powerupId: 'jumpPro', amount: 2 },       // Day 17
  { type: 'coins', amount: 750 },                             // Day 18
  { type: 'powerup', powerupId: 'ghost', amount: 2 },         // Day 19
  { type: 'milestone', amount: 0, label: 'streak_skin_2' },   // Day 20 🏆
  { type: 'coins', amount: 400 },                             // Day 21
  { type: 'powerup', powerupId: 'magnet', amount: 2 },        // Day 22
  { type: 'coins', amount: 600 },                             // Day 23
  { type: 'powerup', powerupId: 'freeze', amount: 2 },        // Day 24
  { type: 'coins', amount: 800 },                             // Day 25
  { type: 'powerup', powerupId: 'teleport', amount: 2 },      // Day 26
  { type: 'coins', amount: 500 },                             // Day 27
  { type: 'powerup', powerupId: 'ghost', amount: 3 },         // Day 28
  { type: 'coins', amount: 700 },                             // Day 29
  { type: 'powerup', powerupId: 'jump', amount: 3 },          // Day 30
  { type: 'coins', amount: 600 },                             // Day 31
  { type: 'powerup', powerupId: 'jumpPro', amount: 3 },       // Day 32
  { type: 'coins', amount: 900 },                             // Day 33
  { type: 'powerup', powerupId: 'magnet', amount: 3 },        // Day 34
  { type: 'coins', amount: 800 },                             // Day 35
  { type: 'powerup', powerupId: 'freeze', amount: 3 },        // Day 36
  { type: 'coins', amount: 1000 },                            // Day 37
  { type: 'powerup', powerupId: 'teleport', amount: 3 },      // Day 38
  { type: 'coins', amount: 900 },                             // Day 39
  { type: 'powerup', powerupId: 'ghost', amount: 4 },         // Day 40
  { type: 'coins', amount: 800 },                             // Day 41
  { type: 'powerup', powerupId: 'magnet', amount: 4 },        // Day 42
  { type: 'coins', amount: 1000 },                            // Day 43
  { type: 'powerup', powerupId: 'freeze', amount: 4 },        // Day 44
  { type: 'coins', amount: 900 },                             // Day 45
  { type: 'powerup', powerupId: 'teleport', amount: 4 },      // Day 46
  { type: 'coins', amount: 1000 },                            // Day 47
  { type: 'powerup', powerupId: 'jump', amount: 5 },          // Day 48
  { type: 'coins', amount: 1000 },                            // Day 49
  { type: 'milestone', amount: 1000, label: 'streak_skin_legendary' }, // Day 50 🌟
];

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
