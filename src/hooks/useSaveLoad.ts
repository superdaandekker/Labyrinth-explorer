import { useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { GameMode, ThemeType, SkinType, PowerupState, PowerupInventory } from '../types';

// IMP-031: centrale save-structuur — alle veldnamen consistent als camelCase
interface SaveData {
  currentLevel: number;
  gameMode: GameMode;
  soundEnabled: boolean;
  theme: ThemeType;
  selectedSkin: SkinType;
  coins: number;
  unlockedThemes: ThemeType[];
  unlockedSkins: SkinType[];
  unlockedAchievements: string[];
  lastDailyCompleted: string | null;
  sfxVolume: number;
  musicVolume: number;
  controlScheme: 'swipe' | 'joystick';
  shownTutorials: Set<string> | string[];
  gameState: string;
  unlockedGameModes: GameMode[];
  activePowerups: PowerupState;
  playerHealth: number;
  streakCount: number;
  lastStreakTimestamp: number;
  // BUG-040: daily challenge onderscheid bewaard
  isDailyChallenge: boolean;
}

const VALID_GAME_MODES: GameMode[] = ['normal', 'timed', 'premium', 'hard'];
const VALID_THEMES: ThemeType[] = ['default', 'cyberpunk', 'ruins', 'forest'];
const VALID_SKINS: SkinType[] = ['scout', 'knight', 'rogue', 'mech', 'mage'];

interface UseSaveLoadProps {
  autoSaveRef: MutableRefObject<SaveData>;
  activePowerups: PowerupState;
  setHasSavedGame: (v: boolean) => void;
  setUnlockedThemes: (v: ThemeType[]) => void;
  setUnlockedSkins: (v: SkinType[]) => void;
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
  setSelectedSkin: (v: SkinType) => void;
  setActivePowerups: (v: PowerupState) => void;
  setPowerupInventory: (fn: (prev: PowerupInventory) => PowerupInventory) => void;
  setPlayerHealth: (v: number) => void;
  setStreakCount: (v: number) => void;
  setLastStreakTimestamp: (v: number) => void;
  // BUG-040: daily challenge state herstellen
  setIsDailyChallenge: (v: boolean) => void;
  startLevel: (level: number) => void;
}

// IMP-032: validatie + fallback voor alle save-velden
const applyParsedSave = (
  data: Record<string, any>,
  setters: Omit<UseSaveLoadProps, 'autoSaveRef' | 'activePowerups' | 'startLevel'>
) => {
  setters.setHasSavedGame(true);
  // BUG-039: valideer numerieke velden op range
  const coins = typeof data.coins === 'number' ? Math.max(0, data.coins) : 0;
  setters.setCoins(coins);
  setters.setUnlockedThemes(Array.isArray(data.unlockedThemes) ? data.unlockedThemes : ['default']);
  const unlockedSkins: SkinType[] = Array.isArray(data.unlockedSkins)
    ? data.unlockedSkins.filter((skin): skin is SkinType => VALID_SKINS.includes(skin))
    : ['scout'];
  setters.setUnlockedSkins(unlockedSkins.length > 0 ? unlockedSkins : ['scout']);
  setters.setUnlockedAchievements(Array.isArray(data.unlockedAchievements) ? data.unlockedAchievements : []);
  setters.setLastDailyCompleted(typeof data.lastDailyCompleted === 'string' ? data.lastDailyCompleted : null);
  setters.setSoundEnabled(typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true);
  setters.setSfxVolume(typeof data.sfxVolume === 'number' ? Math.min(1, Math.max(0, data.sfxVolume)) : 0.5);
  setters.setMusicVolume(typeof data.musicVolume === 'number' ? Math.min(1, Math.max(0, data.musicVolume)) : 0.3);
  setters.setControlScheme(data.controlScheme === 'joystick' ? 'joystick' : 'swipe');
  const rawTutorials = Array.isArray(data.shownTutorials) ? data.shownTutorials : [];
  setters.setShownTutorials(new Set(rawTutorials));
  setters.setUnlockedGameModes(Array.isArray(data.unlockedGameModes) ? data.unlockedGameModes : ['normal']);
  // BUG-039: valideer gameMode en theme op geldige waarden
  const gameMode: GameMode = VALID_GAME_MODES.includes(data.gameMode) ? data.gameMode : 'normal';
  setters.setGameMode(gameMode);
  const theme: ThemeType = VALID_THEMES.includes(data.theme) ? data.theme : 'default';
  setters.setTheme(theme);
  const selectedSkin: SkinType = VALID_SKINS.includes(data.selectedSkin) ? data.selectedSkin : 'scout';
  const fallbackSkin: SkinType = unlockedSkins[0] ?? 'scout';
  setters.setSelectedSkin(unlockedSkins.includes(selectedSkin) ? selectedSkin : fallbackSkin);
  const defaultPowerups = { shield: false, speed: 0, map: 0, jump: 0, jumpPro: 0, ghost: 0, magnet: 0, freeze: 0, teleport: 0 };
  const saved = (data.activePowerups && typeof data.activePowerups === 'object' && !Array.isArray(data.activePowerups))
    ? data.activePowerups : defaultPowerups;
  // Migrate legacy count-based powerups from activePowerups → inventory
  const { jump = 0, jumpPro = 0, ghost = 0, teleport = 0 } = saved;
  if (jump > 0 || jumpPro > 0 || ghost > 0 || teleport > 0) {
    setters.setPowerupInventory((prev) => ({
      ...prev,
      jump: (prev.jump || 0) + jump,
      jumpPro: (prev.jumpPro || 0) + jumpPro,
      ghost: (prev.ghost || 0) + ghost,
      teleport: (prev.teleport || 0) + teleport,
    }));
  }
  setters.setActivePowerups({ ...saved, jump: 0, jumpPro: 0, ghost: 0, teleport: 0 });
  setters.setStreakCount(typeof data.streakCount === 'number' ? Math.max(0, data.streakCount) : 0);
  setters.setLastStreakTimestamp(typeof data.lastStreakTimestamp === 'number' ? data.lastStreakTimestamp : 0);
  // BUG-040: daily challenge vlag herstellen
  setters.setIsDailyChallenge(data.isDailyChallenge === true);
};

export const useSaveLoad = ({
  autoSaveRef, activePowerups, setHasSavedGame,
  setUnlockedThemes, setUnlockedSkins, setUnlockedAchievements, setCoins, setLastDailyCompleted,
  setSoundEnabled, setSfxVolume, setMusicVolume, setControlScheme,
  setShownTutorials, setUnlockedGameModes, setGameMode, setTheme,
  setSelectedSkin, setActivePowerups, setPowerupInventory, setPlayerHealth, setStreakCount, setLastStreakTimestamp,
  setIsDailyChallenge, startLevel,
}: UseSaveLoadProps) => {
  const setters = {
    setHasSavedGame, setUnlockedThemes, setUnlockedSkins, setUnlockedAchievements, setCoins,
    setLastDailyCompleted, setSoundEnabled, setSfxVolume, setMusicVolume,
    setControlScheme, setShownTutorials, setUnlockedGameModes,
    setGameMode, setTheme, setSelectedSkin, setActivePowerups, setPowerupInventory,
    setStreakCount, setLastStreakTimestamp, setIsDailyChallenge,
  };
  const settersRef = useRef(setters);
  settersRef.current = setters;

  // IMP-031: consistente veldnamen (currentLevel ipv level), BUG-040: isDailyChallenge opslaan
  const saveProgress = useCallback(
    (
      levelIdx: number, mode: GameMode, sound: boolean, currentTheme: ThemeType,
      currentSkin: SkinType, currentCoins: number, unlocked: ThemeType[],
      unlockedSkinList: SkinType[], achievements: string[],
      daily: string | null, sfx: number, music: number,
      scheme: 'swipe' | 'joystick', tutorials: string[],
      unlockedModes: GameMode[], powerups?: PowerupState, health?: number,
      streak?: number, streakTs?: number, isDaily?: boolean
    ) => {
      localStorage.setItem('labyrinth_save', JSON.stringify({
        currentLevel: levelIdx, gameMode: mode, unlockedGameModes: unlockedModes,
        theme: currentTheme, selectedSkin: currentSkin, coins: currentCoins,
        unlockedThemes: unlocked, unlockedSkins: unlockedSkinList,
        unlockedAchievements: achievements, lastDailyCompleted: daily,
        soundEnabled: sound, sfxVolume: sfx, musicVolume: music,
        controlScheme: scheme, shownTutorials: tutorials,
        activePowerups: powerups || activePowerups,
        playerHealth: health ?? 3,
        streakCount: streak ?? 0, lastStreakTimestamp: streakTs ?? 0,
        isDailyChallenge: isDaily ?? false,
        timestamp: Date.now(),
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
          s.currentLevel, s.gameMode, s.soundEnabled, s.theme, s.selectedSkin, s.coins,
          s.unlockedThemes, s.unlockedSkins, s.unlockedAchievements, s.lastDailyCompleted,
          s.sfxVolume, s.musicVolume, s.controlScheme,
          Array.from(s.shownTutorials as Iterable<string>),
          s.unlockedGameModes, s.activePowerups, s.playerHealth,
          s.streakCount, s.lastStreakTimestamp, s.isDailyChallenge
        );
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [saveProgress, autoSaveRef]);

  /** Called on mount — restores settings without starting a level. */
  const loadInitialData = useCallback(() => {
    const saved = localStorage.getItem('labyrinth_save');
    if (!saved) return;
    try {
      applyParsedSave(JSON.parse(saved), settersRef.current);
    } catch {
      settersRef.current.setHasSavedGame(false);
    }
  }, []);

  /** Called when user clicks "Continue" — restores ALL state and resumes saved level. */
  const loadSavedGame = useCallback(() => {
    const saved = localStorage.getItem('labyrinth_save');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      applyParsedSave(data, settersRef.current);
      // IMP-031: gebruik currentLevel; val terug op legacy 'level' veld voor oude saves
      const level = typeof data.currentLevel === 'number' ? data.currentLevel
        : typeof data.level === 'number' ? data.level : 0;
      // BUG-039: health valideren op geldig bereik (1–maxHealth; gebruik 3 als onbekend)
      const health = typeof data.playerHealth === 'number' ? Math.max(1, data.playerHealth) : 3;
      startLevel(level);
      setPlayerHealth(health);
    } catch {
      // IMP-032: corrupte save verwijderen + hasSavedGame resetten
      localStorage.removeItem('labyrinth_save');
      settersRef.current.setHasSavedGame(false);
    }
  }, [startLevel]);

  return { saveProgress, loadInitialData, loadSavedGame };
};
