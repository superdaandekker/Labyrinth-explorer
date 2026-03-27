import { useCallback } from 'react';
import { GameMode, ThemeType, PowerupInventory } from '../types';
import { GAME_MODES } from '../constants';
import { audioManager } from '../audio/audioManager';

interface UseShopProps {
  coins: number;
  gameMode: GameMode;
  unlockedGameModes: GameMode[];
  unlockedThemes: ThemeType[];
  setCoins: (fn: (prev: number) => number) => void;
  setUnlockedGameModes: (fn: (prev: GameMode[]) => GameMode[]) => void;
  setGameMode: (mode: GameMode) => void;
  setUnlockedThemes: (fn: (prev: ThemeType[]) => ThemeType[]) => void;
  setTheme: (theme: ThemeType) => void;
  setPowerupInventory: (fn: (prev: PowerupInventory) => PowerupInventory) => void;
}

export const useShop = ({
  coins, unlockedGameModes, unlockedThemes,
  setCoins, setUnlockedGameModes, setGameMode,
  setUnlockedThemes, setTheme, setPowerupInventory,
}: UseShopProps) => {
  const buyGameMode = useCallback(
    (mode: GameMode) => {
      const config = GAME_MODES[mode];
      if (config.price && coins >= config.price && !unlockedGameModes.includes(mode)) {
        setCoins((prev) => prev - config.price!);
        setUnlockedGameModes((prev) => [...prev, mode]);
        setGameMode(mode);
        audioManager.playSound(1200, 'sine', 0.3);
      }
    },
    [coins, unlockedGameModes, setCoins, setUnlockedGameModes, setGameMode]
  );

  const buyTheme = useCallback(
    (themeId: ThemeType, price: number) => {
      if (coins >= price && !unlockedThemes.includes(themeId)) {
        setCoins((prev) => prev - price);
        setUnlockedThemes((prev) => [...prev, themeId]);
        setTheme(themeId);
        audioManager.playSound(1200, 'sine', 0.3);
      }
    },
    [coins, unlockedThemes, setCoins, setUnlockedThemes, setTheme]
  );

  const buyPowerup = useCallback(
    (powerupId: string, price: number) => {
      if (coins >= price) {
        setCoins((prev) => prev - price);
        setPowerupInventory((prev) => ({ ...prev, [powerupId]: Math.min(99, (prev[powerupId] || 0) + 1) }));
        audioManager.playSound(1000, 'sine', 0.3);
      }
    },
    [coins, setCoins, setPowerupInventory]
  );

  const buyCoins = useCallback(
    (amount: number) => {
      setCoins((prev) => Math.min(9999, prev + amount));
      audioManager.playSound(1500, 'sine', 0.4);
    },
    [setCoins]
  );

  return { buyGameMode, buyTheme, buyPowerup, buyCoins };
};
