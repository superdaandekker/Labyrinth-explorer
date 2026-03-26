import { useCallback, useEffect } from 'react';
import { GameMode, ThemeType, PowerupState } from '../types';

interface SaveData {
  currentLevel: number;
  gameMode: GameMode;
  soundEnabled: boolean;
  theme: ThemeType;
  coins: number;
  unlockedThemes: ThemeType[];
  unlockedAchievements: string[];
  lastDailyCompleted: string | null;
  sfxVolume: number;
  musicVolume: number;
  controlScheme: 'swipe' | 'joystick';
  shownTutorials: Set<string> | string[];
  gameState: string;
  unlockedGameModes: GameMode[];
  activePowerups: PowerupState;
}

interface UseSaveLoadProps {
  autoSaveRef: React.MutableRefObject<SaveData>;
  activePowerups: PowerupState;
  setHasSavedGame: (v: boolean) => void;
  setUnlockedThemes: (v: ThemeType[]) => void;
  setUnlockedAchievements: (v: string[]) => void;
  setCoins: (v: number) => void;
  setLastDailyCompleted: (v: string | null) => void;
  setSoundEnabled: (v: boolean) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setControlScheme: (v: 'swipe' | 'joystick') => void;
  setShownTutorials: (v: Set<string>) => void;
  setUnlockedGameModes: (v: GameMode[]) => void;
  setGameMode: (v: GameMode) => void;
  setTheme: (v: ThemeType) => void;
  setActivePowerups: (v: PowerupState) => void;
  startLevel: (level: number) => void;
}

const applyParsedSave = (
  data: Record<string, any>,
  setters: Omit<UseSaveLoadProps, 'autoSaveRef' | 'activePowerups' | 'startLevel'>
) => {
  setters.setHasSavedGame(true);
  setters.setCoins(data.coins || 0);
  setters.setUnlockedThemes(data.unlockedThemes || ['default']);
  setters.setUnlockedAchievements(data.unlockedAchievements || []);
  setters.setLastDailyCompleted(data.lastDailyCompleted || null);
  setters.setSoundEnabled(data.soundEnabled ?? true);
  setters.setSfxVolume(data.sfxVolume ?? 0.5);
  setters.setMusicVolume(data.musicVolume ?? 0.3);
  setters.setControlScheme(data.controlScheme || 'swipe');
  setters.setShownTutorials(new Set(data.shownTutorials || []));
  setters.setUnlockedGameModes(data.unlockedGameModes || ['normal']);
  setters.setGameMode(data.gameMode || 'normal');
  setters.setTheme(data.theme || 'default');
  setters.setActivePowerups(data.activePowerups || { shield: false, speed: 0, map: 0 });
};

export const useSaveLoad = ({
  autoSaveRef, activePowerups, setHasSavedGame,
  setUnlockedThemes, setUnlockedAchievements, setCoins, setLastDailyCompleted,
  setSoundEnabled, setSfxVolume, setMusicVolume, setControlScheme,
  setShownTutorials, setUnlockedGameModes, setGameMode, setTheme,
  setActivePowerups, startLevel,
}: UseSaveLoadProps) => {
  const setters = {
    setHasSavedGame, setUnlockedThemes, setUnlockedAchievements, setCoins,
    setLastDailyCompleted, setSoundEnabled, setSfxVolume, setMusicVolume,
    setControlScheme, setShownTutorials, setUnlockedGameModes,
    setGameMode, setTheme, setActivePowerups,
  };

  const saveProgress = useCallback(
    (
      levelIdx: number, mode: GameMode, sound: boolean, currentTheme: ThemeType,
      currentCoins: number, unlocked: ThemeType[], achievements: string[],
      daily: string | null, sfx: number, music: number,
      scheme: 'swipe' | 'joystick', tutorials: string[],
      unlockedModes: GameMode[], powerups?: PowerupState
    ) => {
      localStorage.setItem('labyrinth_save', JSON.stringify({
        level: levelIdx, gameMode: mode, unlockedGameModes: unlockedModes,
        theme: currentTheme, coins: currentCoins, unlockedThemes: unlocked,
        unlockedAchievements: achievements, lastDailyCompleted: daily,
        soundEnabled: sound, sfxVolume: sfx, musicVolume: music,
        controlScheme: scheme, shownTutorials: tutorials,
        activePowerups: powerups || activePowerups, timestamp: Date.now(),
      }));
      setHasSavedGame(true);
    },
    [activePowerups, setHasSavedGame]
  );

  // Auto-save every 2 minutes while playing
  useEffect(() => {
    const interval = setInterval(() => {
      const s = autoSaveRef.current;
      if (s.gameState === 'playing') {
        saveProgress(
          s.currentLevel, s.gameMode, s.soundEnabled, s.theme, s.coins,
          s.unlockedThemes, s.unlockedAchievements, s.lastDailyCompleted,
          s.sfxVolume, s.musicVolume, s.controlScheme,
          Array.from(s.shownTutorials as any),
          s.unlockedGameModes, s.activePowerups
        );
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [saveProgress, autoSaveRef]);

  /** Called on mount — restores settings without starting a level. */
  const loadInitialData = useCallback(() => {
    const saved = localStorage.getItem('labyrinth_save');
    if (saved) applyParsedSave(JSON.parse(saved), setters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Called when user clicks "Continue" — restores ALL state and resumes saved level. */
  const loadSavedGame = useCallback(() => {
    const saved = localStorage.getItem('labyrinth_save');
    if (!saved) return;
    const data = JSON.parse(saved);
    applyParsedSave(data, setters);
    startLevel(data.level || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLevel]);

  return { saveProgress, loadInitialData, loadSavedGame };
};
