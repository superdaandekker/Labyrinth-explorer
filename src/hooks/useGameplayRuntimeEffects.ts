import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react';

import { GameState, Point, PowerupState } from '../types';
import { COIN, PATH, POISON_GAS } from '../constants';

interface UseGameplayRuntimeEffectsProps {
  activePowerups: PowerupState;
  activePowerupsRef: MutableRefObject<PowerupState>;
  playerPosRef: MutableRefObject<Point>;
  mazeRef: MutableRefObject<number[][]>;
  gameStateRef: MutableRefObject<GameState>;
  isPausedRef: MutableRefObject<boolean>;
  playSound: (...args: any[]) => void;
  setMaze: Dispatch<SetStateAction<number[][]>>;
  setCoins: Dispatch<SetStateAction<number>>;
  setCoinsCollected: Dispatch<SetStateAction<number>>;
  setActivePowerups: Dispatch<SetStateAction<PowerupState>>;
  setPlayerHealth: Dispatch<SetStateAction<number>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setDamageFlash: Dispatch<SetStateAction<boolean>>;
}

export const useGameplayRuntimeEffects = ({
  activePowerups,
  activePowerupsRef,
  playerPosRef,
  mazeRef,
  gameStateRef,
  isPausedRef,
  playSound,
  setMaze,
  setCoins,
  setCoinsCollected,
  setActivePowerups,
  setPlayerHealth,
  setGameState,
  setDamageFlash,
}: UseGameplayRuntimeEffectsProps) => {
  useEffect(() => {
    if (activePowerups.magnet <= Date.now()) return;
    const interval = setInterval(() => {
      if (activePowerups.magnet <= Date.now()) return;
      const { x: px, y: py } = playerPosRef.current;
      const collected: string[] = [];
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const nx = px + dx;
          const ny = py + dy;
          if (ny >= 0 && ny < mazeRef.current.length && nx >= 0 && nx < mazeRef.current[0].length) {
            if (mazeRef.current[ny][nx] === COIN) collected.push(`${nx},${ny}`);
          }
        }
      }
      if (collected.length > 0) {
        setMaze((prev) => {
          const next = prev.map((row) => [...row]);
          collected.forEach((key) => {
            const [x, y] = key.split(',').map(Number);
            next[y][x] = PATH;
          });
          return next;
        });
        setCoins((prev) => prev + collected.length * 10);
        setCoinsCollected((prev) => prev + collected.length);
        playSound(1200, 'sine', 0.1, 0.05);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [activePowerups.magnet, mazeRef, playSound, playerPosRef, setCoins, setCoinsCollected, setMaze]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStateRef.current !== 'playing' || isPausedRef.current) return;
      const { x, y } = playerPosRef.current;
      if (mazeRef.current[y]?.[x] !== POISON_GAS) return;
      const powerups = activePowerupsRef.current;
      if (powerups.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else if (powerups.freeze > Date.now()) {
        // Freeze actief â€” geen schade
      } else {
        setPlayerHealth((prev) => {
          const next = prev - 1;
          if (next <= 0) setGameState('gameover');
          return next;
        });
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        playSound(100, 'square', 0.4);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [
    activePowerupsRef,
    gameStateRef,
    isPausedRef,
    mazeRef,
    playSound,
    playerPosRef,
    setActivePowerups,
    setDamageFlash,
    setGameState,
    setPlayerHealth,
  ]);
};
