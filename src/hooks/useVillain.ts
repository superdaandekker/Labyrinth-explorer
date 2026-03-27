import { useState, useRef, useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { Point, GameMode, GameState, PowerupState } from '../types';
import { WALL, VILLAIN_BASE_INTERVAL } from '../constants';
import { findPath } from '../utils/mazeGenerator';

interface UseVillainProps {
  gameMode: GameMode;
  currentLevel: number;
  gameState: GameState;
  gameStateRef: MutableRefObject<GameState>;
  mazeRef: MutableRefObject<number[][]>;
  playerPosRef: MutableRefObject<Point>;
  isPausedRef: MutableRefObject<boolean>;
  activePowerupsRef: MutableRefObject<PowerupState>;
  setPlayerHealth: Dispatch<SetStateAction<number>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setDamageFlash: (v: boolean) => void;
}

export function useVillain({
  gameMode, currentLevel, gameState, gameStateRef,
  mazeRef, playerPosRef, isPausedRef, activePowerupsRef,
  setPlayerHealth, setGameState, setDamageFlash,
}: UseVillainProps) {
  const [villainPos, setVillainPos] = useState<Point | null>(null);
  const villainRef = useRef<Point | null>(null);

  useEffect(() => { villainRef.current = villainPos; }, [villainPos]);

  // Spawn bij niveau-start (level >= 20)
  useEffect(() => {
    if (gameMode !== 'hard' || currentLevel < 20 || gameState !== 'playing') {
      setVillainPos(null);
      villainRef.current = null;
      return;
    }
    const m = mazeRef.current;
    const p = playerPosRef.current;
    const cells: Point[] = [];
    for (let y = 1; y < m.length - 1; y++) {
      for (let x = 1; x < m[0].length - 1; x++) {
        if (m[y][x] !== WALL && Math.abs(x - p.x) + Math.abs(y - p.y) > 8)
          cells.push({ x, y });
      }
    }
    if (cells.length > 0) {
      const spawn = cells[Math.floor(Math.random() * cells.length)];
      setVillainPos(spawn);
      villainRef.current = spawn;
    }
  }, [currentLevel, gameState, gameMode]);

  // AI-loop — 0,1% sneller per level vanaf level 20
  useEffect(() => {
    if (gameMode !== 'hard' || currentLevel < 20 || gameState !== 'playing') return;
    const levelsIn = Math.max(0, currentLevel - 20);
    const interval = Math.round(VILLAIN_BASE_INTERVAL / (1 + levelsIn * 0.001));
    const timer = setInterval(() => {
      if (isPausedRef.current || gameStateRef.current !== 'playing') return;
      const vp = villainRef.current;
      if (!vp) return;
      const player = playerPosRef.current;
      const m = mazeRef.current;
      const dist = Math.abs(vp.x - player.x) + Math.abs(vp.y - player.y);
      if (dist <= 1) {
        // BUG-041: freeze beschermt ook tegen villain-schade
        if (activePowerupsRef.current.freeze > Date.now()) return;
        setPlayerHealth(prev => {
          const next = prev - 1;
          if (next <= 0) setGameState('gameover');
          return next;
        });
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        const cells: Point[] = [];
        for (let y = 1; y < m.length - 1; y++) {
          for (let x = 1; x < m[0].length - 1; x++) {
            if (m[y][x] !== WALL && Math.abs(x - player.x) + Math.abs(y - player.y) > 8)
              cells.push({ x, y });
          }
        }
        if (cells.length > 0) {
          const np = cells[Math.floor(Math.random() * cells.length)];
          villainRef.current = np;
          setVillainPos(np);
        }
        return;
      }
      const path = findPath(vp, player, m);
      if (path.length > 1) {
        villainRef.current = path[1];
        setVillainPos(path[1]);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [gameMode, currentLevel, gameState]);

  return { villainPos, setVillainPos, villainRef };
}
