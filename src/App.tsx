import { useState, useEffect, useCallback, useRef, ReactNode, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ChevronRight, RotateCcw, Play, Info, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX, X, Pause, Coins, ShoppingBag, Zap, Eye, Sparkles, Music, Gamepad2, Skull, Heart, EyeOff, Move, Ghost, AlertCircle, Shield, Map } from 'lucide-react';

// Maze constants
const CELL_SIZE = 30;
const WALL = 1;
const PATH = 0;
const BREAKABLE_WALL = 2;
const COIN = 3;
const HIDDEN_BUTTON = 4;
const PRESSURE_PLATE = 5;
const DOOR = 6;
const LEVER = 7;
const TOGGLE_WALL = 8;
const SPIKES = 9;
const POISON_GAS = 10;
const ILLUSIONARY_WALL = 11;
const POWERUP_SHIELD = 12;
const POWERUP_SPEED = 13;
const POWERUP_MAP = 14;

const DAILY_MODIFIERS = [
  {
    id: 'REVERSED_GRAVITY',
    name: 'Reversed Gravity',
    description: 'Controls are inverted! Up is Down, Left is Right.',
    color: 'text-purple-400',
    icon: <Move className="animate-bounce" />
  },
  {
    id: 'ILLUSIONARY_WALLS',
    name: 'Illusionary Walls',
    description: 'Some walls are not what they seem. Walk through them!',
    color: 'text-cyan-400',
    icon: <Ghost className="animate-pulse" />
  },
  {
    id: 'COLLECT_ALL_COINS',
    name: 'Greed is Good',
    description: 'Collect all coins in the maze to unlock the exit!',
    color: 'text-amber-400',
    icon: <Coins className="animate-spin" />
  },
  {
    id: 'FOG_OF_WAR',
    name: 'Blind Run',
    description: 'Vision is extremely limited. Watch your step!',
    color: 'text-zinc-400',
    icon: <EyeOff />
  },
  {
    id: 'SPEED_BOOST',
    name: 'Hyper Speed',
    description: 'You move twice as fast, but be careful of the walls!',
    color: 'text-rose-400',
    icon: <Zap className="animate-pulse" />
  },
  {
    id: 'LOW_GRAVITY',
    name: 'Low Gravity',
    description: 'Floaty movement! You slide an extra step when you move.',
    color: 'text-blue-300',
    icon: <ArrowUp className="animate-bounce" />
  },
  {
    id: 'ONE_WAY_PATHS',
    name: 'One-Way Paths',
    description: 'No backtracking! You cannot return to the cell you just left.',
    color: 'text-orange-400',
    icon: <RotateCcw className="rotate-180" />
  },
  {
    id: 'LIMITED_VISION',
    name: 'Limited Vision',
    description: 'Vision is extremely limited. Only your immediate surroundings are visible!',
    color: 'text-zinc-600',
    icon: <EyeOff className="opacity-50" />
  }
];

const POWERUPS = {
  shield: {
    id: 'shield',
    name: 'Shield',
    description: 'Absorb one hit from hazards.',
    icon: <Shield size={16} />,
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
    icon: <Zap size={16} />,
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
    icon: <Map size={16} />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
    borderColor: 'border-emerald-400/50',
    duration: 5000,
    price: 200,
    cellType: POWERUP_MAP,
  }
};

const TUTORIALS = {
  coins: {
    title: 'Munten Verzamelen',
    description: 'Verzamel munten om nieuwe thema\'s en hints te kopen! Je vindt ze vanaf level 10.',
    icon: <Coins className="text-amber-400" size={32} />
  },
  secrets: {
    title: 'Geheime Muren',
    description: 'Sommige muren hebben barsten. Sla er 3 keer tegenaan om ze te breken en geheime kamers te vinden!',
    icon: <Zap className="text-cyan-400" size={32} />
  },
  puzzles: {
    title: 'Hendels & Deuren',
    description: 'Gebruik hendels om deuren op een andere plek in het doolhof te openen. Zoek de hendel om verder te komen!',
    icon: <Gamepad2 className="text-purple-400" size={32} />
  },
  spikes: {
    title: 'Gevaarlijke Stekels',
    description: 'Pas op voor de stekels! Ze kosten je 20 gezondheidspunten per keer dat je eroverheen loopt.',
    icon: <Skull className="text-red-500" size={32} />
  },
  gas: {
    title: 'Giftig Gas',
    description: 'Blijf uit de buurt van de giftige dampen! Ze kosten je 10 gezondheidspunten bij elke stap.',
    icon: <Sparkles className="text-purple-500" size={32} />
  },
  movement: {
    title: 'Nieuwe Besturing',
    description: 'Raak het scherm aan en sleep in een richting om te bewegen. Je kunt ook swipen in de instellingen!',
    icon: <Gamepad2 className="text-cyan-400" size={32} />
  }
};

// Sound Utility
const playSound = (type: 'move' | 'win' | 'lose', enabled: boolean, volume: number = 0.5) => {
  if (!enabled || volume <= 0) return;
  
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  const baseVolume = volume * 0.2; // Scale down for comfort
  
  if (type === 'move') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
    gain.gain.setValueAtTime(baseVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'win') {
    osc.type = 'square';
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
    });
    gain.gain.setValueAtTime(baseVolume, now);
    gain.gain.linearRampToValueAtTime(baseVolume, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'lose') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
    gain.gain.setValueAtTime(baseVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }
};

// Seeded Random Utility for Daily Challenges
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

type Point = { x: number; y: number };

type GameMode = 'normal' | 'timed' | 'premium';

interface GameModeConfig {
  label: string;
  description: string;
  sizeMultiplier: number;
  timeMultiplier: number | null; // null means no time limit
  color: string;
  branchingFactor: number; // 0 to 1, higher means more branching/less linear
  price?: number;
}

const GAME_MODES: Record<GameMode, GameModeConfig> = {
  normal: { 
    label: 'Normal', 
    description: 'Standard gameplay, no time pressure.',
    sizeMultiplier: 1, 
    timeMultiplier: null, 
    color: 'text-cyan-400', 
    branchingFactor: 0.1 // Lower means more linear/harder
  },
  timed: { 
    label: 'Timed', 
    description: 'Race against the clock! More time for deeper sectors.',
    sizeMultiplier: 1.2, 
    timeMultiplier: 60, 
    color: 'text-yellow-400', 
    branchingFactor: 0.3 
  },
  premium: { 
    label: 'Premium', 
    description: 'The ultimate challenge. Complex mazes and elite rewards.',
    sizeMultiplier: 1.5, 
    timeMultiplier: null, 
    color: 'text-purple-500', 
    branchingFactor: 0.05,
    price: 500 
  },
};

interface LeaderboardEntry {
  gameMode: GameMode;
  time: number;
  moves: number;
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  condition: (stats: any) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'no_hint',
    title: 'Pure Explorer',
    description: 'Complete a level without using a hint',
    icon: <Sparkles size={20} className="text-cyan-400" />,
    condition: (stats) => !stats.hintUsed && stats.gameState === 'won'
  },
  {
    id: 'speedrunner',
    title: 'Speedrunner',
    description: 'Complete a level in under 15 seconds',
    icon: <Zap size={20} className="text-yellow-400" />,
    condition: (stats) => stats.time < 15 && stats.gameState === 'won'
  },
  {
    id: 'cartographer',
    title: 'Cartographer',
    description: 'Visit every reachable cell in a maze',
    icon: <Eye size={20} className="text-purple-400" />,
    condition: (stats) => stats.visitedRatio >= 0.95 && stats.gameState === 'won'
  },
  {
    id: 'rich',
    title: 'Coin Collector',
    description: 'Accumulate 500 coins',
    icon: <Coins size={20} className="text-amber-400" />,
    condition: (stats) => stats.coins >= 500
  },
  {
    id: 'veteran',
    title: 'Master of Sectors',
    description: 'Reach level 10',
    icon: <Trophy size={20} className="text-orange-500" />,
    condition: (stats) => stats.level >= 10
  },
  {
    id: 'stylist',
    title: 'Theme Collector',
    description: 'Unlock all available themes',
    icon: <ShoppingBag size={20} className="text-emerald-400" />,
    condition: (stats) => stats.unlockedThemesCount >= 3
  }
];

type ThemeType = 'cyberpunk' | 'ruins' | 'forest';

interface ThemeConfig {
  name: string;
  wallColor: string;
  wallGradient: string;
  pathColor: string;
  playerColor: string;
  exitColor: string;
  exitCoreColor: string;
  ambientColor: string;
  trailColor: string;
  glowColor: string;
  bgClass: string;
  borderClass: string;
  pathGlow: string;
  wallTexture: string;
  price: number;
  puzzleActive: string;
  puzzleInactive: string;
  hazardColor: string;
  hazardSecondary: string;
  doorColor: string;
  doorAccent: string;
  gasColor: string;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
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
    price: 0,
    puzzleActive: 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    puzzleInactive: 'bg-zinc-800 border-zinc-600',
    hazardColor: 'text-red-500',
    hazardSecondary: 'rgba(239,68,68,0.5)',
    doorColor: 'bg-zinc-800 border-zinc-600',
    doorAccent: 'bg-zinc-600',
    gasColor: 'bg-red-500/20',
  },
  ruins: {
    name: 'Ancient Ruins',
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
    name: 'Enchanted Forest',
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

const MazeCell = memo(({ 
  x, 
  y, 
  cell, 
  theme, 
  dynamicCellSize, 
  puzzleState, 
  breakableWallsHealth,
  isDoorOpen,
  visitedCells
}: { 
  x: number; 
  y: number; 
  cell: number; 
  theme: ThemeType; 
  dynamicCellSize: number;
  puzzleState: any;
  breakableWallsHealth: Record<string, number>;
  isDoorOpen: (x: number, y: number) => boolean;
  visitedCells: Set<string>;
}) => {
  const isPressurePlateActive = puzzleState.activeElements.has(`${x},${y}`);
  const isVisited = visitedCells.has(`${x},${y}`);
  
  return (
    <div
      className="relative"
      style={{
        width: dynamicCellSize,
        height: dynamicCellSize,
      }}
    >
      {cell === ILLUSIONARY_WALL && (
        <motion.div 
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute inset-[1px] rounded-[2px] bg-gradient-to-br ${THEMES[theme].wallGradient} border ${THEMES[theme].borderClass}/30 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] overflow-hidden`} 
        >
          <div className={`absolute inset-0 opacity-20 ${THEMES[theme].wallTexture}`} />
        </motion.div>
      )}
      {cell === WALL && (
        <div className={`absolute inset-[1px] rounded-[2px] bg-gradient-to-br ${THEMES[theme].wallGradient} border ${THEMES[theme].borderClass}/50 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_0_8px_rgba(0,0,0,0.8)] overflow-hidden`}>
          <div className={`absolute inset-0 opacity-30 ${THEMES[theme].wallTexture}`} />
        </div>
      )}
      {cell === BREAKABLE_WALL && (
        <div className={`absolute inset-[1px] rounded-[2px] bg-zinc-700 border-zinc-600 border-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center`}>
          <div className="w-1/2 h-1/2 border border-zinc-500/50 rounded-sm" />
          <div className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-zinc-400 opacity-50">
            {breakableWallsHealth[`${x},${y}`] || 3}
          </div>
        </div>
      )}
      {cell === POWERUP_SHIELD && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5 h-5 bg-blue-500/30 rounded-full border border-blue-400 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
          >
            <Shield size={12} />
          </motion.div>
        </div>
      )}
      {cell === POWERUP_SPEED && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-5 bg-yellow-500/30 rounded-full border border-yellow-400 flex items-center justify-center text-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
          >
            <Zap size={12} />
          </motion.div>
        </div>
      )}
      {cell === POWERUP_MAP && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-5 h-5 bg-emerald-500/30 rounded-full border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          >
            <Map size={12} />
          </motion.div>
        </div>
      )}
      {cell === COIN && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-amber-300 flex items-center justify-center"
          >
            <div className="w-1 h-1 bg-amber-200 rounded-full" />
          </motion.div>
        </div>
      )}
      {cell === PRESSURE_PLATE && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-sm border-2 ${isPressurePlateActive ? THEMES[theme].puzzleActive : THEMES[theme].puzzleInactive} transition-colors`} />
        </div>
      )}
      {cell === LEVER && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-4 h-4">
            <div className={`absolute inset-x-1.5 bottom-0 h-1 ${THEMES[theme].doorAccent}`} />
            <motion.div 
              animate={{ rotate: puzzleState.activeElements.has(`${x},${y}`) ? 45 : -45 }}
              className={`absolute inset-x-1.5 top-0 bottom-1 ${puzzleState.activeElements.has(`${x},${y}`) ? THEMES[theme].playerColor : 'bg-zinc-500'} origin-bottom`}
            />
          </div>
        </div>
      )}
      {cell === DOOR && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {!isDoorOpen(x, y) && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`absolute inset-[2px] ${THEMES[theme].doorColor} border-2 rounded-sm flex items-center justify-center`}
              >
                <div className={`w-1/2 h-1 ${THEMES[theme].doorAccent}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {cell === SPIKES && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`${THEMES[theme].hazardColor}/80 drop-shadow-[0_0_5px_${THEMES[theme].hazardSecondary}]`}
          >
            <Skull size={16} />
          </motion.div>
        </div>
      )}
      {cell === POISON_GAS && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`w-full h-full ${THEMES[theme].gasColor} blur-md rounded-full`}
          />
          <div className={`${THEMES[theme].hazardColor} opacity-40`}>
            <Sparkles size={12} />
          </div>
        </div>
      )}
      {cell === PATH && (
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ background: `radial-gradient(circle at center, ${THEMES[theme].pathGlow} 0%, transparent 70%)` }}
        />
      )}
      {isVisited && cell === PATH && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="absolute inset-0 blur-[2px]"
          style={{ backgroundColor: THEMES[theme].pathGlow }}
        />
      )}
    </div>
  );
});

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [unlockedGameModes, setUnlockedGameModes] = useState<GameMode[]>(['normal', 'timed']);
  const [theme, setTheme] = useState<ThemeType>('cyberpunk');
  const [coins, setCoins] = useState(100);
  const [unlockedThemes, setUnlockedThemes] = useState<ThemeType[]>(['cyberpunk']);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [lastDailyCompleted, setLastDailyCompleted] = useState<string | null>(null);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopCategory, setShopCategory] = useState<'all' | 'themes' | 'coins' | 'powerups'>('all');
  const [shopSort, setShopSort] = useState<'name' | 'price'>('name');
  const [showAchievements, setShowAchievements] = useState(false);
  const [isHintActive, setIsHintActive] = useState(false);
  const [controlScheme, setControlScheme] = useState<'swipe' | 'joystick'>('joystick');
  const [joystick, setJoystick] = useState<{ x: number, y: number, active: boolean, offsetX: number, offsetY: number } | null>(null);
  const joystickRef = useRef<{ x: number, y: number, active: boolean, offsetX: number, offsetY: number } | null>(null);
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [shownTutorials, setShownTutorials] = useState<Set<string>>(new Set());
  const [activeTutorial, setActiveTutorial] = useState<{
    title: string;
    description: string;
    icon: ReactNode;
  } | null>(null);
  const [swipeThreshold] = useState(30);
  const [hintPath, setHintPath] = useState<Point[]>([]);
  const [hintUsedThisLevel, setHintUsedThisLevel] = useState(false);
  const [breakableWallsHealth, setBreakableWallsHealth] = useState<Record<string, number>>({});
  const [puzzleState, setPuzzleState] = useState<{
    activeElements: Set<string>;
    connections: Record<string, string[]>;
  }>({ activeElements: new Set(), connections: {} });
  const [currentLevel, setCurrentLevel] = useState(0);
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Point>({ x: 1, y: 1 });
  const [previousPos, setPreviousPos] = useState<Point | null>(null);
  const playerPosRef = useRef<Point>({ x: 1, y: 1 });
  
  // Keep ref in sync with state
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);
  const [exitPos, setExitPos] = useState<Point>({ x: 1, y: 1 });
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'complete' | 'gameover'>('start');
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [damageFlash, setDamageFlash] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [showSettings, setShowSettings] = useState(false);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [isBumping, setIsBumping] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [playerTrail, setPlayerTrail] = useState<{x: number, y: number, id: number}[]>([]);
  const [activePowerups, setActivePowerups] = useState<{
    shield: boolean;
    speed: number; // timestamp when it expires
    map: number; // timestamp when it expires
  }>({ shield: false, speed: 0, map: 0 });
  const [activeModifier, setActiveModifier] = useState<typeof DAILY_MODIFIERS[0] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Auto-save state ref
  const autoSaveRef = useRef({
    currentLevel,
    gameMode,
    soundEnabled,
    theme,
    coins,
    unlockedThemes,
    unlockedAchievements,
    lastDailyCompleted,
    sfxVolume,
    musicVolume,
    controlScheme,
    shownTutorials,
    unlockedGameModes,
    activePowerups,
    gameState
  });

  // Keep auto-save ref in sync
  useEffect(() => {
    autoSaveRef.current = {
      currentLevel,
      gameMode,
      soundEnabled,
      theme,
      coins,
      unlockedThemes,
      unlockedAchievements,
      lastDailyCompleted,
      sfxVolume,
      musicVolume,
      controlScheme,
      shownTutorials,
      unlockedGameModes,
      activePowerups,
      gameState
    };
  }, [currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, shownTutorials, unlockedGameModes, activePowerups, gameState]);

  // Load saved game and leaderboard on mount
  useEffect(() => {
    const saved = localStorage.getItem('labyrinth_save');
    if (saved) {
      const data = JSON.parse(saved);
      setGameMode(data.gameMode || 'normal');
      setUnlockedGameModes(data.unlockedGameModes || ['normal', 'timed']);
      setTheme(data.theme || 'cyberpunk');
      setCoins(data.coins ?? 100);
      setUnlockedThemes(data.unlockedThemes || ['cyberpunk']);
      setUnlockedAchievements(data.unlockedAchievements || []);
      setLastDailyCompleted(data.lastDailyCompleted || null);
      setSoundEnabled(data.soundEnabled ?? true);
      setSfxVolume(data.sfxVolume ?? 0.5);
      setMusicVolume(data.musicVolume ?? 0.3);
      setControlScheme(data.controlScheme || 'joystick');
      if (data.shownTutorials) {
        setShownTutorials(new Set(data.shownTutorials));
      }
      if (data.activePowerups) {
        setActivePowerups(data.activePowerups);
      }
      setHasSavedGame(true);
    }

    const savedLeaderboard = localStorage.getItem('labyrinth_leaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      if (!shownTutorials.has('movement')) {
        setActiveTutorial(TUTORIALS.movement);
        setShownTutorials(prev => new Set([...prev, 'movement']));
      } else if (currentLevel === 10 && !shownTutorials.has('coins')) {
        setActiveTutorial(TUTORIALS.coins);
        setShownTutorials(prev => new Set([...prev, 'coins']));
      } else if (currentLevel === 15 && !shownTutorials.has('secrets')) {
        setActiveTutorial(TUTORIALS.secrets);
        setShownTutorials(prev => new Set([...prev, 'secrets']));
      } else if (currentLevel === 20 && !shownTutorials.has('puzzles')) {
        setActiveTutorial(TUTORIALS.puzzles);
        setShownTutorials(prev => new Set([...prev, 'puzzles']));
      } else if (currentLevel === 5 && !shownTutorials.has('spikes')) {
        setActiveTutorial(TUTORIALS.spikes);
        setShownTutorials(prev => new Set([...prev, 'spikes']));
      } else if (currentLevel === 30 && !shownTutorials.has('gas')) {
        setActiveTutorial(TUTORIALS.gas);
        setShownTutorials(prev => new Set([...prev, 'gas']));
      }
    }
  }, [gameState, currentLevel, shownTutorials]);

  // Background Music
  useEffect(() => {
    if (!soundEnabled || musicVolume <= 0 || gameState !== 'playing') return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(musicVolume * 0.05, ctx.currentTime);

    const playNote = (freq: number, time: number, duration: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(masterGain);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(1, time + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    const sequence = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 293.66, 392.00];
    let nextTime = ctx.currentTime;
    
    const interval = setInterval(() => {
      sequence.forEach((freq, i) => {
        playNote(freq / 2, nextTime + i * 0.5, 0.4);
      });
      nextTime += sequence.length * 0.5;
    }, sequence.length * 500);

    return () => {
      clearInterval(interval);
      ctx.close();
    };
  }, [soundEnabled, musicVolume, gameState]);

  // Exit Proximity Audio
  useEffect(() => {
    if (!soundEnabled || musicVolume <= 0 || gameState !== 'playing') return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    const panner = ctx.createPanner();
    masterGain.connect(ctx.destination);
    panner.connect(masterGain);
    
    // Setup panner
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(panner);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    
    osc.start();

    const updateAudio = () => {
      if (gameState !== 'playing') return;
      
      const dx = exitPos.x - playerPosRef.current.x;
      const dy = exitPos.y - playerPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Volume based on distance (max range 15 cells)
      const vol = Math.max(0, 1 - dist / 15) * musicVolume * 0.2;
      g.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
      
      // Panning
      panner.setPosition(dx / 5, 0, dy / 5);
      
      requestAnimationFrame(updateAudio);
    };

    const animId = requestAnimationFrame(updateAudio);

    return () => {
      cancelAnimationFrame(animId);
      osc.stop();
      ctx.close();
    };
  }, [soundEnabled, musicVolume, gameState, exitPos]);

  const updateLeaderboard = useCallback((time: number, moves: number) => {
    const newEntry: LeaderboardEntry = {
      gameMode,
      time,
      moves,
      date: new Date().toLocaleDateString()
    };

    setLeaderboard(prev => {
      const updated = [...prev, newEntry]
        .sort((a, b) => a.time - b.time) // Sort by time primarily
        .slice(0, 10); // Keep top 10
      localStorage.setItem('labyrinth_leaderboard', JSON.stringify(updated));
      return updated;
    });
  }, [gameMode]);

  const [dynamicCellSize, setDynamicCellSize] = useState(CELL_SIZE);

  useEffect(() => {
    const handleResize = () => {
      if (gameState === 'playing' && maze.length > 0) {
        const availableWidth = window.innerWidth - 32;
        const availableHeight = window.innerHeight - 300;
        
        // Viewport size in cells (9x9)
        const viewportCells = 9;
        const size = Math.floor(Math.min(availableWidth, availableHeight) / viewportCells);
        
        // Larger cells for viewport mode
        const newSize = Math.min(60, Math.max(35, size));
        setDynamicCellSize(newSize);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState, maze]);

  const saveProgress = useCallback((levelIdx: number, mode: GameMode, sound: boolean, currentTheme: ThemeType, currentCoins: number, unlocked: ThemeType[], achievements: string[], daily: string | null, sfx: number, music: number, scheme: 'swipe' | 'joystick', tutorials: string[], unlockedModes: GameMode[], powerups?: typeof activePowerups) => {
    localStorage.setItem('labyrinth_save', JSON.stringify({
      level: levelIdx,
      gameMode: mode,
      unlockedGameModes: unlockedModes,
      theme: currentTheme,
      coins: currentCoins,
      unlockedThemes: unlocked,
      unlockedAchievements: achievements,
      lastDailyCompleted: daily,
      soundEnabled: sound,
      sfxVolume: sfx,
      musicVolume: music,
      controlScheme: scheme,
      shownTutorials: tutorials,
      activePowerups: powerups || activePowerups,
      timestamp: Date.now()
    }));
    setHasSavedGame(true);
  }, [activePowerups]);

  // Periodic auto-save every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const s = autoSaveRef.current;
      if (s.gameState === 'playing') {
        saveProgress(
          s.currentLevel,
          s.gameMode,
          s.soundEnabled,
          s.theme,
          s.coins,
          s.unlockedThemes,
          s.unlockedAchievements,
          s.lastDailyCompleted,
          s.sfxVolume,
          s.musicVolume,
          s.controlScheme,
          Array.from(s.shownTutorials),
          s.unlockedGameModes,
          s.activePowerups
        );
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [saveProgress]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const findPath = useCallback((start: Point, end: Point, currentMaze: number[][]) => {
    if (!currentMaze.length) return [];
    const queue: { pos: Point; path: Point[] }[] = [{ pos: start, path: [] }];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const { pos, path } = queue.shift()!;
      if (pos.x === end.x && pos.y === end.y) return path;

      const neighbors = [
        { x: pos.x + 1, y: pos.y },
        { x: pos.x - 1, y: pos.y },
        { x: pos.x, y: pos.y + 1 },
        { x: pos.x, y: pos.y - 1 },
      ];

      for (const n of neighbors) {
        if (
          n.x >= 0 && n.x < currentMaze[0].length &&
          n.y >= 0 && n.y < currentMaze.length &&
          (currentMaze[n.y][n.x] === PATH || currentMaze[n.y][n.x] === COIN) &&
          !visited.has(`${n.x},${n.y}`)
        ) {
          visited.add(`${n.x},${n.y}`);
          queue.push({ pos: n, path: [...path, n] });
        }
      }
    }
    return [];
  }, []);

  // Maze generation using Growing Tree Algorithm for better control over branching
  const generateMaze = useCallback((width: number, height: number, seed?: number, levelIdx: number = 0) => {
    const newMaze = Array(height).fill(null).map(() => Array(width).fill(WALL));
    let currentSeed = seed || Math.random();
    const config = GAME_MODES[gameMode];
    const branchingFactor = config.branchingFactor;

    const activeCells: Point[] = [{ x: 1, y: 1 }];
    newMaze[1][1] = PATH;

    while (activeCells.length > 0) {
      // Choose a cell from the list
      // If random < branchingFactor, pick a random cell (Prim's - more branching)
      // Otherwise pick the last cell (DFS - longer paths)
      let index: number;
      const r = seed !== undefined ? seededRandom(currentSeed++) : Math.random();
      
      if (r < branchingFactor) {
        const r2 = seed !== undefined ? seededRandom(currentSeed++) : Math.random();
        index = Math.floor(r2 * activeCells.length);
      } else {
        index = activeCells.length - 1;
      }

      const { x, y } = activeCells[index];
      const neighbors: Point[] = [];

      const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && newMaze[ny][nx] === WALL) {
          neighbors.push({ x: nx, y: ny });
        }
      }

      if (neighbors.length > 0) {
        const r3 = seed !== undefined ? seededRandom(currentSeed++) : Math.random();
        const next = neighbors[Math.floor(r3 * neighbors.length)];
        
        newMaze[next.y][next.x] = PATH;
        newMaze[y + (next.y - y) / 2][x + (next.x - x) / 2] = PATH;
        activeCells.push(next);
      } else {
        activeCells.splice(index, 1);
      }
    }
    
    // Ensure exit is at the bottom right
    let ex = width - 2;
    let ey = height - 2;
    // If the corner is a wall, find the nearest path
    if (newMaze[ey][ex] === WALL) {
        for(let i = height - 2; i > 0; i--) {
            for(let j = width - 2; j > 0; j--) {
                if(newMaze[i][j] === PATH) {
                    ex = j;
                    ey = i;
                    break;
                }
            }
            if(newMaze[ey][ex] === PATH) break;
        }
    }
    
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setExitPos({ x: ex, y: ey });

    // Add coins (Introduce at Level 10)
    if (levelIdx >= 10) {
      // Add random coins in dead ends
      for (let i = 0; i < (width * height) / 40; i++) {
        const rx = Math.floor(Math.random() * (width - 2)) + 1;
        const ry = Math.floor(Math.random() * (height - 2)) + 1;
        if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey)) {
          newMaze[ry][rx] = COIN;
        }
      }
    }

    // Add secret areas (Introduce at Level 15)
    const initialWallHealth: Record<string, number> = {};
    if (levelIdx >= 15) {
      const numSecrets = Math.floor((width * height) / 80) + 1;
      
      for (let i = 0; i < numSecrets; i++) {
        let attempts = 0;
        while (attempts < 50) {
          attempts++;
          const rx = Math.floor(Math.random() * (width - 4)) + 2;
          const ry = Math.floor(Math.random() * (height - 4)) + 2;
          
          if (newMaze[ry][rx] === WALL) {
            const neighbors = [
              { x: rx + 1, y: ry }, { x: rx - 1, y: ry },
              { x: rx, y: ry + 1 }, { x: rx, y: ry - 1 },
            ];
            const pathNeighbors = neighbors.filter(n => newMaze[n.y][n.x] === PATH);
            
            if (pathNeighbors.length === 1) {
              newMaze[ry][rx] = BREAKABLE_WALL;
              initialWallHealth[`${rx},${ry}`] = 3; // 3 hits to break
              
              const dir = { x: rx - pathNeighbors[0].x, y: ry - pathNeighbors[0].y };
              const roomX = rx + dir.x;
              const roomY = ry + dir.y;
              
              if (roomX > 0 && roomX < width - 1 && roomY > 0 && roomY < height - 1) {
                newMaze[roomY][roomX] = Math.random() > 0.3 ? COIN : PATH;
                const nextX = roomX + dir.x;
                const nextY = roomY + dir.y;
                if (nextX > 0 && nextX < width - 1 && nextY > 0 && nextY < height - 1) {
                  newMaze[nextY][nextX] = Math.random() > 0.5 ? COIN : PATH;
                }
                break;
              }
            }
          }
        }
      }
    }
    setBreakableWallsHealth(initialWallHealth);

    // Add puzzles (Introduce at Level 20)
    if (levelIdx >= 20) {
      const path = findPath({ x: 1, y: 1 }, { x: ex, y: ey }, newMaze);
      if (path.length > 10) {
        // Pick a spot for a door on the main path
        const doorIdx = Math.floor(path.length * 0.6);
        const doorPos = path[doorIdx];
        
        // Find a dead end or branch for the lever
        let leverPos: Point | null = null;
        for (let i = 0; i < 100; i++) {
          const lx = Math.floor(Math.random() * (width - 2)) + 1;
          const ly = Math.floor(Math.random() * (height - 2)) + 1;
          if (newMaze[ly][lx] === PATH && (lx !== 1 || ly !== 1) && (lx !== ex || ly !== ey)) {
            // Check if it's NOT on the main path
            if (!path.some(p => p.x === lx && p.y === ly)) {
              leverPos = { x: lx, y: ly };
              break;
            }
          }
        }
        
        if (leverPos) {
          newMaze[doorPos.y][doorPos.x] = DOOR;
          newMaze[leverPos.y][leverPos.x] = LEVER;
          setPuzzleState({
            activeElements: new Set(),
            connections: { [`${leverPos.x},${leverPos.y}`]: [`${doorPos.x},${doorPos.y}`] }
          });
        }
      }
    }

    // Add spikes (Introduce at Level 5)
    if (levelIdx >= 5) {
      for (let i = 0; i < (width * height) / 30; i++) {
        const rx = Math.floor(Math.random() * (width - 2)) + 1;
        const ry = Math.floor(Math.random() * (height - 2)) + 1;
        // Don't place on start, exit, or critical puzzle elements
        if (newMaze[ry][rx] === PATH && 
            (rx !== 1 || ry !== 1) && 
            (rx !== ex || ry !== ey)) {
          newMaze[ry][rx] = SPIKES;
        }
      }
    }

    // Add poison gas (Introduce at Level 30)
    if (levelIdx >= 30) {
      for (let i = 0; i < (width * height) / 40; i++) {
        const rx = Math.floor(Math.random() * (width - 2)) + 1;
        const ry = Math.floor(Math.random() * (height - 2)) + 1;
        if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey)) {
          newMaze[ry][rx] = POISON_GAS;
        }
      }
    }
  }, [gameMode, findPath]);

  const startLevel = useCallback((levelIdx: number, isDaily: boolean = false) => {
    const config = GAME_MODES[gameMode];
    
    // Scale size with level in infinite mode
    const baseSize = 11 + Math.floor(levelIdx / 2) * 2;
    const w = baseSize;
    const h = baseSize;
    
    // Ensure width and height are odd for the algorithm
    const makeOdd = (n: number) => Math.floor(n / 2) * 2 + 1;
    const finalW = makeOdd(w * config.sizeMultiplier);
    const finalH = makeOdd(h * config.sizeMultiplier);
    
    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const seed = parseInt(today.replace(/-/g, ''));
      const modifierIndex = seed % DAILY_MODIFIERS.length;
      const modifier = DAILY_MODIFIERS[modifierIndex];
      setActiveModifier(modifier);

      generateMaze(finalW, finalH, seed, levelIdx);
      setIsDailyChallenge(true);
      
      // Show modifier description
      setAchievementToast(`${modifier.name}: ${modifier.description}`);
      setTimeout(() => setAchievementToast(null), 5000);
      playSound('win', soundEnabled, sfxVolume);

      // Post-process maze for special modifiers
      if (modifier.id === 'ILLUSIONARY_WALLS') {
        setMaze(prev => {
          const next = [...prev.map(row => [...row])];
          for (let i = 0; i < 15; i++) {
            const rx = Math.floor(seededRandom(seed + i) * (finalW - 2)) + 1;
            const ry = Math.floor(seededRandom(seed + i + 100) * (finalH - 2)) + 1;
            if (next[ry][rx] === WALL) {
              next[ry][rx] = ILLUSIONARY_WALL;
            }
          }
          return next;
        });
      }
      
      if (modifier.id === 'COLLECT_ALL_COINS') {
        setMaze(prev => {
          const next = [...prev.map(row => [...row])];
          let coinCount = 0;
          next.forEach(row => row.forEach(cell => { if (cell === COIN) coinCount++; }));
          
          if (coinCount < 5) {
            for (let i = 0; i < 5 - coinCount; i++) {
              let rx = Math.floor(seededRandom(seed + i + 200) * (finalW - 2)) + 1;
              let ry = Math.floor(seededRandom(seed + i + 300) * (finalH - 2)) + 1;
              if (next[ry][rx] === PATH) {
                next[ry][rx] = COIN;
              }
            }
          }
          return next;
        });
      }
    } else {
      setActiveModifier(null);
      generateMaze(finalW, finalH, undefined, levelIdx);
      setIsDailyChallenge(false);
    }

    setCurrentLevel(levelIdx);
    setPlayerHealth(100);
    setDamageFlash(false);
    setGameState('playing');
    setIsPaused(false);
    setMoves(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setVisitedCells(new Set(['1,1']));
    setPreviousPos(null);
    setPlayerTrail([]);
    
    if (config.timeMultiplier !== null) {
      // Base time + bonus per level
      setTimeLimit(config.timeMultiplier + (levelIdx * 15));
    } else {
      setTimeLimit(null);
    }

    // Auto-save when starting a level
    setHintUsedThisLevel(false);
    saveProgress(levelIdx, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
  }, [generateMaze, gameMode, soundEnabled, saveProgress, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, unlockedGameModes]);

  const startDailyChallenge = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastDailyCompleted === today) {
      alert("You've already completed today's challenge! Come back tomorrow.");
      return;
    }
    startLevel(5, true); // Daily challenge is always level 5 difficulty
  };

  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          if (timeLimit !== null && next >= timeLimit) {
            setGameState('gameover');
            playSound('lose', soundEnabled, sfxVolume);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isPaused, timeLimit, soundEnabled]);

  const isDoorOpen = useCallback((x: number, y: number) => {
    const doorKey = `${x},${y}`;
    const entries = Object.entries(puzzleState.connections) as [string, string[]][];
    for (const [elementPos, connectedDoors] of entries) {
      if (connectedDoors.includes(doorKey)) {
        if (puzzleState.activeElements.has(elementPos)) return true;
      }
    }
    return false;
  }, [puzzleState]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing' || isPaused) return;

    // Prevent rapid movement in Low Gravity to allow sliding
    if (activeModifier?.id === 'LOW_GRAVITY' && Date.now() - lastMoveTime < 250) return;

    let actualDx = dx;
    let actualDy = dy;

    if (activeModifier?.id === 'REVERSED_GRAVITY') {
      actualDx = -dx;
      actualDy = -dy;
    }

    const nx = playerPosRef.current.x + actualDx;
    const ny = playerPosRef.current.y + actualDy;

    if (activeModifier?.id === 'ONE_WAY_PATHS' && previousPos) {
      if (nx === previousPos.x && ny === previousPos.y) {
        setAchievementToast("No Backtracking!");
        setTimeout(() => setAchievementToast(null), 1000);
        return;
      }
    }

    if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length) {
      const cell = maze[ny][nx];
      const canMove = cell === PATH || cell === COIN || cell === LEVER || cell === PRESSURE_PLATE || cell === SPIKES || cell === POISON_GAS || cell === ILLUSIONARY_WALL || cell === POWERUP_SHIELD || cell === POWERUP_SPEED || cell === POWERUP_MAP || (cell === DOOR && isDoorOpen(nx, ny));
      
      if (canMove) {
        if (cell === COIN) {
          setCoins(c => c + 10);
          setMaze(prev => {
            const next = [...prev];
            next[ny] = [...next[ny]];
            next[ny][nx] = PATH;
            return next;
          });
          playSound('win', soundEnabled, sfxVolume * 0.5);
        }

        if (cell === POWERUP_SHIELD) {
          const newPowerups = { ...activePowerups, shield: true };
          setActivePowerups(newPowerups);
          setAchievementToast("Shield Activated!");
          setTimeout(() => setAchievementToast(null), 2000);
          setMaze(prev => {
            const next = [...prev];
            next[ny] = [...next[ny]];
            next[ny][nx] = PATH;
            return next;
          });
          playSound('win', soundEnabled, sfxVolume);
          saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes, newPowerups);
        }

        if (cell === POWERUP_SPEED) {
          const newPowerups = { ...activePowerups, speed: Date.now() + POWERUPS.speed.duration };
          setActivePowerups(newPowerups);
          setAchievementToast("Speed Boost Activated!");
          setTimeout(() => setAchievementToast(null), 2000);
          setMaze(prev => {
            const next = [...prev];
            next[ny] = [...next[ny]];
            next[ny][nx] = PATH;
            return next;
          });
          playSound('win', soundEnabled, sfxVolume);
          saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes, newPowerups);
        }

        if (cell === POWERUP_MAP) {
          const newPowerups = { ...activePowerups, map: Date.now() + POWERUPS.map.duration };
          setActivePowerups(newPowerups);
          setAchievementToast("Map Revealed!");
          setTimeout(() => setAchievementToast(null), 2000);
          setMaze(prev => {
            const next = [...prev];
            next[ny] = [...next[ny]];
            next[ny][nx] = PATH;
            return next;
          });
          playSound('win', soundEnabled, sfxVolume);
          saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes, newPowerups);
        }

        if (cell === SPIKES) {
          if (activePowerups.shield) {
            setActivePowerups(prev => ({ ...prev, shield: false }));
            setAchievementToast("Shield Absorbed Damage!");
            setTimeout(() => setAchievementToast(null), 2000);
            playSound('win', soundEnabled, sfxVolume * 0.5);
          } else {
            setPlayerHealth(prev => {
              const next = Math.max(0, prev - 20);
              if (next === 0) {
                setGameState('gameover');
                playSound('lose', soundEnabled, sfxVolume);
              } else {
                setDamageFlash(true);
                setTimeout(() => setDamageFlash(false), 200);
                playSound('lose', soundEnabled, sfxVolume * 0.5);
              }
              return next;
            });
          }
        }

        if (cell === POISON_GAS) {
          if (activePowerups.shield) {
            setActivePowerups(prev => ({ ...prev, shield: false }));
            setAchievementToast("Shield Absorbed Damage!");
            setTimeout(() => setAchievementToast(null), 2000);
            playSound('win', soundEnabled, sfxVolume * 0.5);
          } else {
            setPlayerHealth(prev => {
              const next = Math.max(0, prev - 10);
              if (next === 0) {
                setGameState('gameover');
                playSound('lose', soundEnabled, sfxVolume);
              } else {
                setDamageFlash(true);
                setTimeout(() => setDamageFlash(false), 200);
                playSound('lose', soundEnabled, sfxVolume * 0.3);
              }
              return next;
            });
          }
        }

        if (cell === LEVER) {
          const key = `${nx},${ny}`;
          setPuzzleState(prev => {
            const next = new Set(prev.activeElements);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return { ...prev, activeElements: next };
          });
        }
        
        setPreviousPos({ x: playerPosRef.current.x, y: playerPosRef.current.y });
        setPlayerPos(prev => ({ x: nx, y: ny }));
        setPlayerTrail(prev => [{ x: prev.x, y: prev.y, id: Date.now() }, ...prev].slice(0, 8));
        playSound('move', soundEnabled, sfxVolume);
        setMoves(m => m + 1);
        setLastMoveTime(Date.now());
        
        // Low Gravity Slide
        if (activeModifier?.id === 'LOW_GRAVITY') {
          setTimeout(() => {
            const sx = nx + actualDx;
            const sy = ny + actualDy;
            if (sx >= 0 && sx < maze[0].length && sy >= 0 && sy < maze.length) {
              const scell = maze[sy][sx];
              const canSlide = scell === PATH || scell === COIN || scell === LEVER || scell === PRESSURE_PLATE || scell === SPIKES || scell === POISON_GAS || scell === ILLUSIONARY_WALL || scell === POWERUP_SHIELD || scell === POWERUP_SPEED || scell === POWERUP_MAP || (scell === DOOR && isDoorOpen(sx, sy));
              if (canSlide) {
                setPreviousPos({ x: nx, y: ny });
                setPlayerPos({ x: sx, y: sy });
                playSound('move', soundEnabled, sfxVolume * 0.5);
              }
            }
          }, 100);
        }
        setVisitedCells(prev => {
          const next = new Set(prev);
          next.add(`${nx},${ny}`);
          return next;
        });
        if (nx === exitPos.x && ny === exitPos.y) {
          if (activeModifier?.id === 'COLLECT_ALL_COINS') {
            const hasCoins = maze.some(row => row.includes(COIN));
            if (hasCoins) {
              setAchievementToast("Collect all coins first!");
              setTimeout(() => setAchievementToast(null), 2000);
              playSound('lose', soundEnabled, sfxVolume * 0.5);
              return;
            }
          }
          playSound('win', soundEnabled, sfxVolume);
          setGameState('won');
        }
      } else if (cell === BREAKABLE_WALL) {
        const key = `${nx},${ny}`;
        const currentHealth = breakableWallsHealth[key] ?? 3;
        if (currentHealth <= 1) {
          setMaze(prev => {
            const next = [...prev];
            next[ny] = [...next[ny]];
            next[ny][nx] = PATH;
            return next;
          });
          setBreakableWallsHealth(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          playSound('move', soundEnabled, sfxVolume);
        } else {
          setBreakableWallsHealth(prev => ({ ...prev, [key]: currentHealth - 1 }));
          setIsBumping(true);
          setTimeout(() => setIsBumping(false), 100);
        }
      } else {
        setIsBumping(true);
        setTimeout(() => setIsBumping(false), 100);
      }
    }
  }, [maze, exitPos, gameState, isPaused, soundEnabled, playerPos, breakableWallsHealth, sfxVolume, coins]);

  useEffect(() => {
    const currentPosKey = `${playerPos.x},${playerPos.y}`;
    if (maze[playerPos.y]?.[playerPos.x] === PRESSURE_PLATE) {
      setPuzzleState(prev => {
        if (prev.activeElements.has(currentPosKey)) return prev;
        const next = new Set(prev.activeElements);
        next.add(currentPosKey);
        return { ...prev, activeElements: next };
      });
    } else {
      setPuzzleState(prev => {
        let changed = false;
        const next = new Set(prev.activeElements);
        const elements = Array.from(next) as string[];
        for (const key of elements) {
          const [x, y] = key.split(',').map(Number);
          if (maze[y]?.[x] === PRESSURE_PLATE && key !== currentPosKey) {
            next.delete(key);
            changed = true;
          }
        }
        return changed ? { ...prev, activeElements: next } : prev;
      });
    }
  }, [playerPos, maze]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const nextLevel = () => {
    startLevel(currentLevel + 1);
  };

  const restartGame = () => {
    setCurrentLevel(0);
    setGameState('start');
    // Check for saved game again
    const saved = localStorage.getItem('labyrinth_save');
    setHasSavedGame(!!saved);
  };

  const loadSavedGame = () => {
    const saved = localStorage.getItem('labyrinth_save');
    if (saved) {
      const data = JSON.parse(saved);
      startLevel(data.level || 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const buyGameMode = (mode: GameMode) => {
    const config = GAME_MODES[mode];
    if (!config.price) return;
    
    if (coins >= config.price) {
      const newCoins = coins - config.price;
      const newUnlocked = [...unlockedGameModes, mode];
      setCoins(newCoins);
      setUnlockedGameModes(newUnlocked);
      setGameMode(mode);
      saveProgress(currentLevel, mode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), newUnlocked);
      playSound('win', soundEnabled, sfxVolume);
    } else {
      alert(`Not enough coins! You need ${config.price - coins} more.`);
    }
  };

  const buyTheme = (t: ThemeType) => {
    const price = THEMES[t].price;
    if (coins >= price && !unlockedThemes.includes(t)) {
      const newCoins = coins - price;
      const newUnlocked = [...unlockedThemes, t];
      setCoins(newCoins);
      setUnlockedThemes(newUnlocked);
      setTheme(t);
      saveProgress(currentLevel, gameMode, soundEnabled, t, newCoins, newUnlocked, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
      playSound('win', soundEnabled, sfxVolume);
    }
  };

  const buyPowerup = (type: keyof typeof POWERUPS) => {
    const config = POWERUPS[type];
    if (coins >= config.price) {
      const newCoins = coins - config.price;
      setCoins(newCoins);
      
      let newPowerups = { ...activePowerups };
      if (type === 'shield') {
        newPowerups.shield = true;
      } else if (type === 'speed') {
        const duration = (config as any).duration;
        newPowerups.speed = (activePowerups.speed > Date.now() ? activePowerups.speed : Date.now()) + duration;
      } else if (type === 'map') {
        const duration = (config as any).duration;
        newPowerups.map = (activePowerups.map > Date.now() ? activePowerups.map : Date.now()) + duration;
      }
      setActivePowerups(newPowerups);
      
      saveProgress(currentLevel, gameMode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes, newPowerups);
      playSound('win', soundEnabled, sfxVolume);
      setAchievementToast(`${config.name} Purchased!`);
      setTimeout(() => setAchievementToast(null), 2000);
    } else {
      alert(`Not enough coins! You need ${config.price - coins} more.`);
    }
  };

  const watchAdForPowerup = (type: keyof typeof POWERUPS) => {
    const config = POWERUPS[type];
    // Simulate ad
    let newPowerups = { ...activePowerups };
    if (type === 'shield') {
      newPowerups.shield = true;
    } else if (type === 'speed') {
      const duration = (config as any).duration;
      newPowerups.speed = (activePowerups.speed > Date.now() ? activePowerups.speed : Date.now()) + duration;
    } else if (type === 'map') {
      const duration = (config as any).duration;
      newPowerups.map = (activePowerups.map > Date.now() ? activePowerups.map : Date.now()) + duration;
    }
    setActivePowerups(newPowerups);
    saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes, newPowerups);
    alert(`You watched an ad and received a ${config.name}!`);
    setAchievementToast(`${config.name} Activated!`);
    setTimeout(() => setAchievementToast(null), 2000);
  };

  const watchAd = () => {
    // Simulate watching an ad
    const reward = 50;
    const newCoins = coins + reward;
    setCoins(newCoins);
    saveProgress(currentLevel, gameMode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
    alert(`You watched an ad and earned ${reward} coins!`);
  };

  const useHint = () => {
    const cost = 50;
    if (coins >= cost && gameState === 'playing' && !isPaused) {
      const path = findPath(playerPos, exitPos, maze);
      // Reveal a portion, e.g., the next 15 steps
      setHintPath(path.slice(0, 15));
      
      const newCoins = coins - cost;
      setCoins(newCoins);
      setIsHintActive(true);
      setHintUsedThisLevel(true);
      setTimeout(() => {
        setIsHintActive(false);
        setHintPath([]);
      }, 3000);
      saveProgress(currentLevel, gameMode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
    }
  };

  const revive = () => {
    const cost = 75;
    if (coins >= cost && gameState === 'gameover') {
      const newCoins = coins - cost;
      setCoins(newCoins);
      setPlayerHealth(100);
      setGameState('playing');
      setElapsedTime(0); // Reset timer
      saveProgress(currentLevel, gameMode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
      playSound('win', soundEnabled, sfxVolume);
    }
  };

  const checkAchievements = useCallback((stats: any) => {
    const newlyUnlocked: string[] = [];
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
        newlyUnlocked.push(achievement.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      const updatedAchievements = [...unlockedAchievements, ...newlyUnlocked];
      setUnlockedAchievements(updatedAchievements);
      
      // Show toast notification
      const titles = newlyUnlocked.map(id => ACHIEVEMENTS.find(a => a.id === id)?.title).join(', ');
      setAchievementToast(titles);
      setTimeout(() => setAchievementToast(null), 4000);

      saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, updatedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
    }
  }, [unlockedAchievements, currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, saveProgress, unlockedGameModes]);

  useEffect(() => {
    if (gameState === 'won') {
      // Calculate visited ratio
      let pathCells = 0;
      maze.forEach(row => row.forEach(cell => { if (cell === PATH) pathCells++; }));
      const visitedRatio = visitedCells.size / pathCells;

      let bonusCoins = 0;
      let newDailyCompleted = lastDailyCompleted;

      if (isDailyChallenge) {
        bonusCoins = 100; // Daily bonus
        newDailyCompleted = new Date().toISOString().split('T')[0];
        setLastDailyCompleted(newDailyCompleted);
        
        // Grant random power-up
        const types = Object.keys(POWERUPS) as (keyof typeof POWERUPS)[];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const config = POWERUPS[randomType];
        
        let newPowerups = { ...activePowerups };
        if (randomType === 'shield') {
          newPowerups.shield = true;
        } else if (randomType === 'speed') {
          const duration = (config as any).duration;
          newPowerups.speed = (activePowerups.speed > Date.now() ? activePowerups.speed : Date.now()) + duration;
        } else if (randomType === 'map') {
          const duration = (config as any).duration;
          newPowerups.map = (activePowerups.map > Date.now() ? activePowerups.map : Date.now()) + duration;
        }
        setActivePowerups(newPowerups);
        
        alert(`Daily Challenge Complete! Bonus +${bonusCoins} coins and a ${config.name}!`);
      }

      const newCoins = coins + bonusCoins;
      setCoins(newCoins);

      // Check achievements
      checkAchievements({
        gameState: 'won',
        time: elapsedTime,
        hintUsed: hintUsedThisLevel,
        visitedRatio,
        coins: newCoins,
        level: currentLevel + 1,
        unlockedThemesCount: unlockedThemes.length
      });

      // Update leaderboard
      const newEntry: LeaderboardEntry = {
        gameMode,
        time: elapsedTime,
        moves,
        date: new Date().toLocaleDateString()
      };
      const updated = [newEntry, ...leaderboard].slice(0, 10);
      setLeaderboard(updated);
      localStorage.setItem('labyrinth_leaderboard', JSON.stringify(updated));
      
      saveProgress(currentLevel + 1, gameMode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, newDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes, activePowerups);
    }
  }, [gameState, maze, visitedCells, isDailyChallenge, lastDailyCompleted, coins, checkAchievements, elapsedTime, hintUsedThisLevel, currentLevel, unlockedThemes, gameMode, moves, leaderboard, soundEnabled, theme, unlockedAchievements, sfxVolume, musicVolume, controlScheme, shownTutorials, unlockedGameModes, activePowerups]);

  const movePlayerRef = useRef(movePlayer);
  useEffect(() => {
    movePlayerRef.current = movePlayer;
  }, [movePlayer]);

  const handlePanStart = (e: any, info: any) => {
    if (gameState !== 'playing' || isPaused) return;
    
    if (controlScheme === 'joystick') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = info.point.x - rect.left;
      const y = info.point.y - rect.top;
      const newState = { x, y, active: true, offsetX: 0, offsetY: 0 };
      setJoystick(newState);
      joystickRef.current = newState;
      
      // Start continuous movement
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      
      const moveDelay = Math.min(150, activeModifier?.id === 'SPEED_BOOST' ? 75 : activeModifier?.id === 'LOW_GRAVITY' ? 250 : 150, activePowerups.speed > Date.now() ? 100 : 150);
      
      moveIntervalRef.current = setInterval(() => {
        if (!joystickRef.current || !joystickRef.current.active) return;
        const { offsetX, offsetY } = joystickRef.current;
        const threshold = 15;
        
        if (Math.abs(offsetX) > Math.abs(offsetY)) {
          if (Math.abs(offsetX) > threshold) movePlayerRef.current(offsetX > 0 ? 1 : -1, 0);
        } else {
          if (Math.abs(offsetY) > threshold) movePlayerRef.current(0, offsetY > 0 ? 1 : -1);
        }
      }, moveDelay);
    }
  };

  const handlePan = (_: any, info: any) => {
    if (controlScheme === 'joystick' && joystickRef.current) {
      const maxDist = 40;
      const dx = info.offset.x;
      const dy = info.offset.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist > maxDist ? maxDist / dist : 1;
      
      const newState = { 
        ...joystickRef.current, 
        offsetX: dx * scale, 
        offsetY: dy * scale 
      };
      setJoystick(newState);
      joystickRef.current = newState;
    }
  };

  const handlePanEnd = (_: any, info: any) => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }

    if (controlScheme === 'swipe') {
      const { x, y } = info.offset;
      if (Math.abs(x) > Math.abs(y)) {
        if (Math.abs(x) > swipeThreshold) {
          movePlayerRef.current(x > 0 ? 1 : -1, 0);
        }
      } else {
        if (Math.abs(y) > swipeThreshold) {
          movePlayerRef.current(0, y > 0 ? 1 : -1);
        }
      }
    }
    
    setJoystick(null);
    joystickRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Achievement Toast */}
      <AnimatePresence>
        {achievementToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-zinc-950 border border-cyan-500/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
          >
            <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-500">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black italic text-cyan-500 tracking-widest">ACHIEVEMENT UNLOCKED</div>
              <div className="text-sm font-bold text-white">{achievementToast}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Bar (Coins & Sound) */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {gameState === 'playing' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md">
              <Heart size={16} className={`${playerHealth < 30 ? 'text-red-500 animate-pulse' : 'text-rose-400'}`} />
              <div className="w-16 sm:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ 
                    width: `${playerHealth}%`,
                    backgroundColor: playerHealth < 30 ? '#ef4444' : '#fb7185'
                  }}
                  className="h-full shadow-[0_0_10px_rgba(251,113,133,0.5)]"
                />
              </div>
              <span className="text-[9px] font-black text-zinc-400 w-5">{playerHealth}</span>
            </div>
          )}
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

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
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
                        <span>{THEMES[t].name}</span>
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
                    Today: {DAILY_MODIFIERS[parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')) % DAILY_MODIFIERS.length].name}
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
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 1.05, filter: 'brightness(0)' }}
            animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'brightness(2)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`z-10 flex flex-col items-center gap-6 ${THEMES[theme].bgClass} min-h-screen w-full justify-center`}
          >
            {/* Active Powerups UI */}
            <div className="absolute top-24 right-4 flex flex-col gap-2 z-50">
              {activePowerups.shield && (
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-400/50 rounded-xl text-blue-400 backdrop-blur-sm"
                >
                  <Shield size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Shield Active</span>
                </motion.div>
              )}
              {activePowerups.speed > Date.now() && (
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-xl text-yellow-400 backdrop-blur-sm"
                >
                  <Zap size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Speed Boost</span>
                </motion.div>
              )}
              {activePowerups.map > Date.now() && (
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-400 backdrop-blur-sm"
                >
                  <Map size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Map Revealed</span>
                </motion.div>
              )}
            </div>

            <div className="w-full max-w-2xl flex justify-between items-end gap-8 px-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                    Infinite Labyrinth
                  </span>
                  {isDailyChallenge && (
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-black italic text-[8px] tracking-widest flex items-center gap-1">
                      <Zap size={8} />
                      DAILY
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                  Sector {currentLevel + 1}
                  {activeModifier && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-2 px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg ${activeModifier.color}`}
                    >
                      <div className="scale-75">{activeModifier.icon}</div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{activeModifier.name}</span>
                    </motion.div>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-6 text-right">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      {timeLimit !== null ? 'Time Left' : 'Time'}
                    </span>
                    <div className={`font-mono text-xl tabular-nums ${
                      timeLimit !== null && (timeLimit - elapsedTime) < 10 ? 'text-red-500 animate-pulse' : ''
                    }`}>
                      {timeLimit !== null ? formatTime(Math.max(0, timeLimit - elapsedTime)) : formatTime(elapsedTime)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Moves</span>
                    <div className="font-mono text-xl tabular-nums">{moves}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPaused(true)}
                  className={`p-3 ${THEMES[theme].wallColor} border ${THEMES[theme].borderClass} rounded-xl hover:opacity-80 transition-colors text-white`}
                  title="Pause Game"
                >
                  <Pause size={18} />
                </button>
                <button 
                  onClick={useHint}
                  disabled={coins < 50}
                  className={`p-3 ${THEMES[theme].wallColor} border ${THEMES[theme].borderClass} rounded-xl hover:opacity-80 transition-colors text-amber-400 disabled:opacity-30`}
                  title="Use Hint (50 Coins)"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            <motion.div 
              onPanStart={handlePanStart}
              onPan={handlePan}
              onPanEnd={handlePanEnd}
              animate={damageFlash ? { 
                x: [-6, 6, -6, 6, 0], 
                y: [-3, 3, -3, 3, 0],
                scale: [1, 1.03, 1]
              } : (isBumping ? { 
                x: [-2, 2, -2, 2, 0],
                scale: 1.01 
              } : { scale: 1 })}
              transition={damageFlash ? { duration: 0.2 } : { duration: 0.1 }}
              className={`relative p-2 ${THEMES[theme].pathColor} border ${THEMES[theme].borderClass} rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden touch-none`}
              style={{
                width: 9 * dynamicCellSize + 16,
                height: 9 * dynamicCellSize + 16,
              }}
            >
              {/* Parallax Background Grid */}
              <motion.div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                animate={{
                  backgroundPosition: `${-playerPos.x * 5}px ${-playerPos.y * 5}px`,
                }}
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, ${THEMES[theme].pathGlow} 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Ambient Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * (9 * dynamicCellSize), 
                      y: Math.random() * (9 * dynamicCellSize),
                      opacity: Math.random() * 0.3 + 0.1,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{
                      y: [null, Math.random() * -50 - 20],
                      x: [null, (Math.random() - 0.5) * 30],
                      opacity: [null, 0]
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLevel}
                  initial={{ opacity: 0, filter: 'brightness(2)' }}
                  animate={{ 
                    opacity: 1, 
                    filter: 'brightness(1)',
                    x: (4 - playerPos.x) * dynamicCellSize,
                    y: (4 - playerPos.y) * dynamicCellSize,
                    scale: (joystick?.active || activePowerups.speed > Date.now()) ? 0.95 : 1
                  }}
                  exit={{ opacity: 0, filter: 'brightness(0)' }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    y: { type: 'spring', stiffness: 300, damping: 30 },
                    scale: { duration: 0.3 }
                  }}
                  className="absolute"
                >
                  {/* Grid */}
                  {maze.map((row, y) => (
                    <div key={y} className="flex">
                      {row.map((cell, x) => (
                        <MazeCell 
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          cell={cell}
                          theme={theme}
                          dynamicCellSize={dynamicCellSize}
                          puzzleState={puzzleState}
                          breakableWallsHealth={breakableWallsHealth}
                          isDoorOpen={isDoorOpen}
                          visitedCells={visitedCells}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Hint Path */}
                  <AnimatePresence>
                    {isHintActive && hintPath.map((p, i) => (
                      <motion.div
                        key={`hint-${i}-${p.x}-${p.y}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="absolute rounded-full z-30"
                        style={{
                          width: 8,
                          height: 8,
                          left: p.x * dynamicCellSize + (dynamicCellSize - 8) / 2,
                          top: p.y * dynamicCellSize + (dynamicCellSize - 8) / 2,
                          backgroundColor: THEMES[theme].playerColor,
                          boxShadow: `0 0 10px ${THEMES[theme].playerColor}`
                        }}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Exit */}
                  <div
                    className={`absolute opacity-20 border rounded-sm flex items-center justify-center overflow-hidden z-10`}
                    style={{
                      width: dynamicCellSize - 4,
                      height: dynamicCellSize - 4,
                      left: exitPos.x * dynamicCellSize + 2,
                      top: exitPos.y * dynamicCellSize + 2,
                      backgroundColor: THEMES[theme].exitColor,
                      borderColor: THEMES[theme].exitColor,
                      opacity: isHintActive ? 1 : 0.2,
                      boxShadow: isHintActive ? `0 0 30px ${THEMES[theme].exitColor}` : 'none',
                      zIndex: isHintActive ? 60 : 10
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)] ${THEMES[theme].exitCoreColor}`} />
                    <div className={`absolute inset-0 animate-ping opacity-20 ${THEMES[theme].exitColor}`} />
                  </div>

                  {/* Player Trail */}
                  <AnimatePresence>
                    {playerTrail.map((point, index) => (
                      <motion.div
                        key={point.id}
                        initial={{ opacity: 0.4, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 0.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className={`absolute rounded-sm z-20 ${THEMES[theme].trailColor}`}
                        style={{
                          width: dynamicCellSize - 8,
                          height: dynamicCellSize - 8,
                          left: point.x * dynamicCellSize + 4,
                          top: point.y * dynamicCellSize + 4,
                          opacity: (8 - index) / 20
                        }}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Ghost Trail (Echo Effect) */}
                  {activePowerups.speed > Date.now() && previousPos && (
                    <motion.div
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.2 }}
                      key={`ghost-${playerPos.x}-${playerPos.y}`}
                      className={`absolute rounded-sm z-30 ${THEMES[theme].playerColor} opacity-30 blur-[1px]`}
                      style={{
                        width: dynamicCellSize - 4,
                        height: dynamicCellSize - 4,
                        left: previousPos.x * dynamicCellSize + 2,
                        top: previousPos.y * dynamicCellSize + 2,
                      }}
                    />
                  )}

                  {/* Player */}
                  <motion.div
                    className={`absolute rounded-sm z-40 ${THEMES[theme].playerColor}`}
                    animate={{
                      left: playerPos.x * dynamicCellSize + 2,
                      top: playerPos.y * dynamicCellSize + 2,
                      scale: isBumping ? [1, 1.2, 1] : 1,
                      filter: activePowerups.speed > Date.now() ? 'hue-rotate(90deg) brightness(1.5)' : 'none'
                    }}
                    transition={{ 
                      left: { type: 'spring', stiffness: 400, damping: 30 },
                      top: { type: 'spring', stiffness: 400, damping: 30 },
                      scale: { duration: 0.1 }
                    }}
                    style={{
                      width: dynamicCellSize - 4,
                      height: dynamicCellSize - 4,
                      boxShadow: activePowerups.shield 
                        ? `0 0 25px #60a5fa, 0 0 10px #60a5fa` 
                        : `0 0 20px ${THEMES[theme].glowColor}`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-sm" />
                    {activePowerups.shield && (
                      <motion.div 
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -inset-2 border-2 border-blue-400 rounded-full blur-[2px]"
                      />
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Joystick UI */}
              <AnimatePresence>
                {joystick && joystick.active && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute z-50 pointer-events-none"
                    style={{
                      left: joystick.x - 40,
                      top: joystick.y - 40,
                      width: 80,
                      height: 80,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm" />
                    <motion.div 
                      className="absolute w-10 h-10 bg-white/30 rounded-full border border-white/40 shadow-xl"
                      style={{
                        left: 20 + joystick.offsetX,
                        top: 20 + joystick.offsetY,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pause Overlay */}
              <AnimatePresence>
                {isPaused && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                  >
                    <div className={`flex flex-col items-center gap-8 p-8 ${THEMES[theme].wallColor} border ${THEMES[theme].borderClass} rounded-3xl shadow-2xl`}>
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-4 ${THEMES[theme].bgClass} rounded-2xl border ${THEMES[theme].borderClass}`}>
                          <Pause size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white">GAME PAUSED</h2>
                      </div>
                      
                      <div className="flex flex-col gap-4 w-64">
                        <button 
                          onClick={() => setIsPaused(false)}
                          className="w-full py-4 bg-white text-black font-black italic rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        >
                          <Play size={18} fill="currentColor" />
                          RESUME
                        </button>
                        <button 
                          onClick={() => {
                            setIsPaused(false);
                            setGameState('start');
                          }}
                          className={`w-full py-4 ${THEMES[theme].bgClass} text-white font-black italic rounded-xl border ${THEMES[theme].borderClass} hover:opacity-80 transition-colors flex items-center justify-center gap-2`}
                        >
                          <X size={18} />
                          QUIT
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-8 items-center mt-12 w-full max-w-2xl">
              <div className="flex gap-4">
                <button 
                  onClick={() => startLevel(currentLevel)}
                  className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400 active:scale-95 flex items-center gap-2 shadow-lg"
                  title="Restart Level"
                >
                  <RotateCcw size={20} />
                  <span className="sm:hidden text-sm font-medium uppercase tracking-widest">Reset</span>
                </button>
              </div>
              
              <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
                {controlScheme === 'joystick' && (
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                      <Gamepad2 size={32} className="animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Touch & Drag to Move</span>
                  </div>
                )}
                {controlScheme === 'swipe' && (
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                      <Zap size={32} className="animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Swipe to Move</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:ml-auto w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-end gap-4 px-4 sm:px-0">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold sm:hidden">Quick Actions</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowShop(true)}
                      className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-amber-400 active:scale-95 shadow-lg"
                    >
                      <ShoppingBag size={20} />
                    </button>
                    <button 
                      onClick={() => setShowAchievements(true)}
                      className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-cyan-400 active:scale-95 shadow-lg"
                    >
                      <Trophy size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {(gameState === 'won' || gameState === 'complete' || gameState === 'gameover') && (
          <motion.div
            key="end-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -50, scale: 0.9, rotateX: -20 }}
            className="z-10 text-center bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl max-w-sm mx-4"
          >
            <motion.div 
              variants={itemVariants}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg ${
                gameState === 'gameover' 
                  ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20' 
                  : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/20'
              }`}
            >
              {gameState === 'gameover' ? (playerHealth <= 0 ? <Skull size={32} className="text-white" /> : <RotateCcw size={32} className="text-white" />) : <Trophy size={32} className="text-white" />}
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-black italic mb-1 sm:mb-2 tracking-tight">
              {gameState === 'gameover' ? (playerHealth <= 0 ? 'YOU DIED' : 'TIME EXPIRED') : 'SECTOR CLEAR!'}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-zinc-400 mb-6 sm:mb-8 text-sm sm:text-base">
              {gameState === 'gameover' 
                ? (playerHealth <= 0 ? 'The spikes were too sharp. Try again?' : 'The labyrinth claimed another soul. Try again?') 
                : `Sector ${currentLevel + 1} conquered in ${formatTime(elapsedTime)}.`}
            </motion.p>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Time</div>
                <div className="font-mono text-lg sm:text-xl">{formatTime(elapsedTime)}</div>
              </div>
              <div className="p-3 sm:p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Moves</div>
                <div className="font-mono text-lg sm:text-xl">{moves}</div>
              </div>
            </motion.div>

            {gameState === 'gameover' ? (
              <motion.div variants={itemVariants} className="flex flex-col gap-2 sm:gap-3 w-full">
                {coins >= 75 && (
                  <button
                    onClick={revive}
                    className="w-full py-3 sm:py-4 bg-amber-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-400/20 text-sm sm:text-base"
                  >
                    <Zap size={18} fill="currentColor" />
                    REVIVE (75 COINS)
                  </button>
                )}
                <button
                  onClick={() => startLevel(currentLevel)}
                  className="w-full py-3 sm:py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
                >
                  <RotateCcw size={18} />
                  TRY AGAIN
                </button>
              </motion.div>
            ) : gameState === 'complete' ? (
              <motion.button
                variants={itemVariants}
                onClick={restartGame}
                className="w-full py-3 sm:py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
              >
                <RotateCcw size={18} />
                PLAY AGAIN
              </motion.button>
            ) : (
              <motion.button
                variants={itemVariants}
                onClick={nextLevel}
                className="w-full py-3 sm:py-4 bg-cyan-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
              >
                NEXT LEVEL
                <ChevronRight size={18} />
              </motion.button>
            )}
            
            {gameState === 'gameover' && (
              <motion.button
                variants={itemVariants}
                onClick={restartGame}
                className="mt-3 sm:mt-4 w-full py-2 text-zinc-500 font-bold text-[10px] sm:text-xs hover:text-zinc-300 transition-colors"
              >
                BACK TO MENU
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-mono tracking-widest text-zinc-600 uppercase pointer-events-none">
        <span>
          Sector {currentLevel + 1}
        </span>
        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
        <span>Labyrinth Explorer v1.0</span>
      </div>
      {/* Leaderboard Modal */}
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
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                    <Trophy size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Hall of Fame</h2>
                </div>
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
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
                        <div>
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

      {/* Achievements Modal */}
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
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-500">
                    <Trophy size={28} />
                  </div>
                  <h2 className="text-2xl font-black italic tracking-tight">ACHIEVEMENTS</h2>
                </div>
                <button 
                  onClick={() => setShowAchievements(false)}
                  className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
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
                      <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
                        {achievement.icon}
                      </div>
                      <div>
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

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl mx-4"
            >
            <div className="p-6 sm:p-8 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-zinc-800 rounded-2xl text-zinc-400">
                  <Settings size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black italic tracking-tight">SETTINGS</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
              >
                <X size={20} />
              </button>
            </div>

              <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Master Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm">Master Sound</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Enable all audio</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                  >
                    <motion.div 
                      animate={{ x: soundEnabled ? 26 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* SFX Volume */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                        <Zap size={20} />
                      </div>
                      <div className="font-bold text-sm">Sound Effects</div>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{Math.round(sfxVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    disabled={!soundEnabled}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-30"
                  />
                </div>

                {/* Music Volume */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                        <Music size={20} />
                      </div>
                      <div className="font-bold text-sm">Background Music</div>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    disabled={!soundEnabled}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30"
                  />
                </div>

                {/* Control Scheme */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <Gamepad2 size={20} />
                    </div>
                    <div className="font-bold text-sm">Control Scheme</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['swipe', 'joystick'] as const).map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => {
                          setControlScheme(scheme);
                          saveProgress(currentLevel, gameMode, soundEnabled, theme, coins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, scheme, Array.from(shownTutorials), unlockedGameModes);
                        }}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-tighter transition-all ${
                          controlScheme === scheme
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'
                        }`}
                      >
                        {scheme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-zinc-950 flex justify-center">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full sm:w-auto px-12 py-3 sm:py-4 bg-white text-black font-black italic rounded-2xl hover:scale-105 transition-transform text-sm sm:text-base"
                >
                  DONE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
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
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden mx-4"
            >
              {/* Background Accents */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
              
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-amber-500/20 rounded-2xl text-amber-500">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-tight">CRYPTO SHOP</h2>
                    <div className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm font-bold">
                      <Coins size={12} />
                      <span>{coins} COINS</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShop(false)}
                  className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filters and Sorting */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl overflow-x-auto custom-scrollbar no-scrollbar">
                  {(['all', 'themes', 'powerups', 'coins'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setShopCategory(cat)}
                      className={`flex-1 py-2 text-[10px] font-black italic rounded-lg transition-all uppercase tracking-wider ${
                        shopCategory === cat ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                {shopCategory !== 'coins' && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Sort By</span>
                    <div className="flex gap-2">
                      {(['name', 'price'] as const).map((sort) => (
                        <button
                          key={sort}
                          onClick={() => setShopSort(sort)}
                          className={`px-3 py-1 text-[10px] font-black italic rounded-md transition-all uppercase ${
                            shopSort === sort ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          {sort}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {(shopCategory === 'all' || shopCategory === 'powerups') && (
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Power-ups</h3>
                    <div className="space-y-3">
                      {(Object.keys(POWERUPS) as (keyof typeof POWERUPS)[]).map((type) => {
                        const config = POWERUPS[type];
                        return (
                          <div 
                            key={type}
                            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                                  {config.icon}
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{config.name}</div>
                                  <div className="text-[10px] text-zinc-500">{config.description}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => buyPowerup(type)}
                                disabled={coins < config.price}
                                className="flex-1 py-2 bg-amber-400 text-black rounded-lg text-[10px] font-black italic flex items-center justify-center gap-1 hover:scale-105 transition-transform disabled:opacity-50"
                              >
                                <Coins size={10} />
                                BUY FOR {config.price}
                              </button>
                              <button 
                                onClick={() => watchAdForPowerup(type)}
                                className="flex-1 py-2 bg-zinc-800 text-white rounded-lg text-[10px] font-black italic flex items-center justify-center gap-1 hover:scale-105 transition-transform"
                              >
                                <Play size={10} />
                                WATCH AD
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {(shopCategory === 'all' || shopCategory === 'coins') && (
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Buy Coins</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { amount: 100, price: '$0.99', icon: <Coins size={16} /> },
                        { amount: 500, price: '$3.99', icon: <Sparkles size={16} />, popular: true },
                        { amount: 1200, price: '$7.99', icon: <Zap size={16} /> },
                        { amount: 3000, price: '$14.99', icon: <Trophy size={16} /> },
                      ].map((pack, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            const newCoins = coins + pack.amount;
                            setCoins(newCoins);
                            saveProgress(currentLevel, gameMode, soundEnabled, theme, newCoins, unlockedThemes, unlockedAchievements, lastDailyCompleted, sfxVolume, musicVolume, controlScheme, Array.from(shownTutorials), unlockedGameModes);
                            alert(`Purchased ${pack.amount} coins!`);
                          }}
                          className={`relative p-4 bg-zinc-900 border ${pack.popular ? 'border-amber-500/50' : 'border-zinc-800'} rounded-2xl hover:bg-zinc-800 transition-all text-left group`}
                        >
                          {pack.popular && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                              BEST VALUE
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-amber-400 font-black italic mb-1">
                            {pack.icon}
                            <span>{pack.amount}</span>
                          </div>
                          <div className="text-xs text-zinc-500 font-bold group-hover:text-white transition-colors">{pack.price}</div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {(shopCategory === 'all' || shopCategory === 'themes') && (
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Premium Themes</h3>
                    <div className="space-y-2">
                      {(Object.keys(THEMES) as ThemeType[])
                        .filter(t => t !== 'cyberpunk')
                        .sort((a, b) => {
                          if (shopSort === 'price') return THEMES[a].price - THEMES[b].price;
                          return THEMES[a].name.localeCompare(THEMES[b].name);
                        })
                        .map((t) => {
                          const isUnlocked = unlockedThemes.includes(t);
                          return (
                            <div 
                              key={t}
                              className={`flex items-center justify-between p-4 bg-zinc-900 border ${theme === t ? 'border-white/20' : 'border-zinc-800'} rounded-2xl`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${THEMES[t].wallGradient} border border-white/10`} />
                                <div>
                                  <div className="font-bold text-sm">{THEMES[t].name}</div>
                                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Visual Pack</div>
                                </div>
                              </div>
                              {isUnlocked ? (
                                <button 
                                  onClick={() => {
                                    setTheme(t);
                                    setShowShop(false);
                                  }}
                                  className={`px-4 py-2 rounded-lg text-[10px] font-black italic ${theme === t ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}
                                >
                                  {theme === t ? 'ACTIVE' : 'EQUIP'}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => buyTheme(t)}
                                  disabled={coins < THEMES[t].price}
                                  className="px-4 py-2 bg-amber-400 text-black rounded-lg text-[10px] font-black italic flex items-center gap-1 hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                  <Coins size={10} />
                                  {THEMES[t].price}
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </section>
                )}
              </div>

              <button 
                onClick={() => setShowShop(false)}
                className="mt-8 w-full py-4 bg-zinc-900 text-zinc-500 font-black italic rounded-2xl border border-zinc-800 hover:text-white transition-colors"
              >
                CLOSE SHOP
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Damage Flash Overlay */}
      <AnimatePresence>
        {damageFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[100] pointer-events-none shadow-[inset_0_0_150px_rgba(220,38,38,0.8)] bg-red-600/20"
          />
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {activeTutorial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
              
              <div className="mb-6 inline-flex p-4 bg-zinc-800 rounded-2xl text-cyan-400 shadow-inner">
                {activeTutorial.icon}
              </div>
              
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
                {activeTutorial.title}
              </h2>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                {activeTutorial.description}
              </p>
              
              <button
                onClick={() => setActiveTutorial(null)}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs shadow-lg shadow-white/10"
              >
                Begrepen!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
