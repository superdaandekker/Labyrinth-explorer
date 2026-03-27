import { Dispatch, MutableRefObject, SetStateAction, useCallback } from 'react';

import { ActiveModifier, GameState, Point, PowerupInventory, PowerupState, TutorialConfig } from '../types';
import {
  COIN,
  DOOR,
  HIDDEN_BUTTON,
  KEY,
  KEY_DOOR,
  LEVER,
  PATH,
  POISON_GAS,
  POWERUP_MAP,
  POWERUP_SHIELD,
  POWERUP_SPEED,
  PREMIUM_LOOT,
  PRESSURE_PLATE,
  SPIKES,
  TUTORIALS,
} from '../constants';

interface UseTileEffectsProps {
  activePowerups: PowerupState;
  heldColorKeys: Set<number>;
  hasKey: boolean;
  exitPos: Point;
  shownTutorials: Set<string>;
  premiumLootMap: Record<string, string>;
  activeModifier: ActiveModifier | null;
  colorKeyPairs: [number, number][];
  mazeRef: MutableRefObject<number[][]>;
  playSound: (...args: any[]) => void;
  setCoins: Dispatch<SetStateAction<number>>;
  setCoinsCollected: Dispatch<SetStateAction<number>>;
  setMaze: Dispatch<SetStateAction<number[][]>>;
  setPremiumCollected: Dispatch<SetStateAction<Record<string, number>>>;
  setPowerupInventory: Dispatch<SetStateAction<PowerupInventory>>;
  setActivePowerups: Dispatch<SetStateAction<PowerupState>>;
  setHasKey: Dispatch<SetStateAction<boolean>>;
  setActiveTutorial: Dispatch<SetStateAction<TutorialConfig | null>>;
  setShownTutorials: Dispatch<SetStateAction<Set<string>>>;
  setUsedKeyThisLevel: Dispatch<SetStateAction<boolean>>;
  setHeldColorKeys: Dispatch<SetStateAction<Set<number>>>;
  setPuzzleState: Dispatch<SetStateAction<Set<string>>>;
  setIsDoorOpen: Dispatch<SetStateAction<boolean>>;
  setPlayerHealth: Dispatch<SetStateAction<number>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setDamageFlash: Dispatch<SetStateAction<boolean>>;
}

export const useTileEffects = ({
  activePowerups,
  heldColorKeys,
  hasKey,
  exitPos,
  shownTutorials,
  premiumLootMap,
  activeModifier,
  colorKeyPairs,
  mazeRef,
  playSound,
  setCoins,
  setCoinsCollected,
  setMaze,
  setPremiumCollected,
  setPowerupInventory,
  setActivePowerups,
  setHasKey,
  setActiveTutorial,
  setShownTutorials,
  setUsedKeyThisLevel,
  setHeldColorKeys,
  setPuzzleState,
  setIsDoorOpen,
  setPlayerHealth,
  setGameState,
  setDamageFlash,
}: UseTileEffectsProps) => {
  const applyTileEffects = useCallback((x: number, y: number, cell: number) => {
    if (cell === COIN) {
      setCoins((prev) => prev + 10);
      setCoinsCollected((prev) => prev + 1);
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(1200, 'sine', 0.1, 0.1);
    } else if (cell === PREMIUM_LOOT) {
      const lootId = premiumLootMap[`${x},${y}`];
      if (lootId) {
        setPremiumCollected((prev) => ({ ...prev, [lootId]: (prev[lootId] || 0) + 1 }));
        setPowerupInventory((prev) => ({ ...prev, [lootId]: (prev[lootId] || 0) + 1 }));
      }
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(1600, 'sine', 0.25, 0.12);
    } else if (cell === POWERUP_SHIELD) {
      setActivePowerups((prev) => ({ ...prev, shield: true }));
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(800, 'sine', 0.3);
    } else if (cell === POWERUP_SPEED) {
      setActivePowerups((prev) => ({ ...prev, speed: Date.now() + 10000 }));
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(1000, 'sine', 0.3);
    } else if (cell === POWERUP_MAP) {
      setActivePowerups((prev) => ({ ...prev, map: Date.now() + 5000 }));
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(900, 'sine', 0.3);
    } else if (cell === KEY) {
      setHasKey(true);
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(1400, 'sine', 0.3);
      if (!shownTutorials.has('key')) {
        setActiveTutorial(TUTORIALS.key);
        setShownTutorials((prev) => new Set(prev).add('key'));
      }
    } else if (cell === KEY_DOOR && hasKey) {
      setHasKey(false);
      setUsedKeyThisLevel(true);
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(600, 'square', 0.3);
    } else if (colorKeyPairs.some(([keyType]) => cell === keyType)) {
      const found = colorKeyPairs.find(([keyType]) => cell === keyType);
      if (found) {
        const [keyType] = found;
        setHeldColorKeys((prev) => new Set([...prev, keyType]));
        setMaze((prev) => {
          const next = prev.map((row) => [...row]);
          next[y][x] = PATH;
          return next;
        });
        playSound(1400, 'sine', 0.3);
      }
    } else if (colorKeyPairs.some(([keyType, doorType]) => cell === doorType && heldColorKeys.has(keyType))) {
      const found = colorKeyPairs.find(([keyType, doorType]) => cell === doorType && heldColorKeys.has(keyType));
      if (found) {
        const [keyType] = found;
        setHeldColorKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyType);
          return next;
        });
        setMaze((prev) => {
          const next = prev.map((row) => [...row]);
          next[y][x] = PATH;
          return next;
        });
        playSound(600, 'square', 0.3);
      }
    } else if (cell === HIDDEN_BUTTON) {
      setPuzzleState((prev) => {
        const next = new Set(prev);
        next.add(`${x},${y}`);
        next.add('toggle_walls_open');
        return next;
      });
      setMaze((prev) => {
        const next = prev.map((row) => [...row]);
        next[y][x] = PATH;
        return next;
      });
      playSound(700, 'sine', 0.3, 0.1);
    } else if (cell === PRESSURE_PLATE || cell === LEVER) {
      setPuzzleState((prev) => new Set(prev).add(`${x},${y}`));
      setIsDoorOpen(true);
      playSound(400, 'square', 0.2);
    } else if (cell === SPIKES || cell === POISON_GAS) {
      if (activePowerups.shield) {
        setActivePowerups((prev) => ({ ...prev, shield: false }));
        playSound(200, 'square', 0.3);
      } else if (activePowerups.freeze > Date.now()) {
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
    }

    if (x === exitPos.x && y === exitPos.y) {
      if (activeModifier?.id === 'COLLECT_ALL_COINS') {
        const hasCoins = mazeRef.current.some((row) => row.includes(COIN));
        if (hasCoins) {
          playSound(200, 'sine', 0.2);
          return;
        }
      }
      setGameState('won');
      playSound(880, 'sine', 0.5);
    }
  }, [
    activeModifier,
    activePowerups,
    colorKeyPairs,
    exitPos,
    hasKey,
    heldColorKeys,
    mazeRef,
    playSound,
    premiumLootMap,
    setActivePowerups,
    setActiveTutorial,
    setCoins,
    setCoinsCollected,
    setDamageFlash,
    setGameState,
    setHasKey,
    setHeldColorKeys,
    setIsDoorOpen,
    setMaze,
    setPlayerHealth,
    setPowerupInventory,
    setPremiumCollected,
    setPuzzleState,
    setShownTutorials,
    setUsedKeyThisLevel,
    shownTutorials,
  ]);

  return { applyTileEffects };
};
