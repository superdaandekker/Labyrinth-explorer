import { ReactNode } from 'react';

export type Point = { x: number; y: number };

export type GameState = 'start' | 'playing' | 'won' | 'gameover' | 'complete' | 'loading';

export type GameMode = 'normal' | 'timed' | 'premium' | 'hard';

export interface GameModeConfig {
  label: string;
  description: string;
  baseSize: number;
  timeLimit: number | null;
  color: string;
  branchingFactor: number;
  price?: number;
}

export interface LeaderboardEntry {
  gameMode: GameMode;
  time: number;
  moves: number;
  score?: number;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  condition: (stats: any) => boolean;
}

export type ThemeType = 'default' | 'cyberpunk' | 'ruins' | 'forest';

export interface ThemeConfig {
  label: string;
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

export interface PowerupState {
  shield: boolean;
  speed: number;
  map: number;
}

export interface ActiveModifier {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: ReactNode;
}

export interface JoystickState {
  startX?: number;
  startY?: number;
  currentX?: number;
  currentY?: number;
  active?: boolean;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export interface PowerupConfig {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  price: number;
  cellType: number;
  duration?: number;
}

export interface TutorialConfig {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface DailyModifier {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: ReactNode;
}
