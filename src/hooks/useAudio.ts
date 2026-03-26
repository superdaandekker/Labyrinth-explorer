import { useCallback, useEffect } from 'react';
import { Point } from '../types';
import { audioManager } from '../audio/audioManager';

interface UseAudioProps {
  soundEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  gameState: string;
  exitPos: Point;
  playerPosRef: React.MutableRefObject<Point>;
}

export const useAudio = ({
  soundEnabled,
  sfxVolume,
  musicVolume,
  gameState,
  exitPos,
  playerPosRef,
}: UseAudioProps) => {
  const playSound = useCallback(
    (freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.1) => {
      if (!soundEnabled) return;
      audioManager.playSound(freq, type, duration, volume, sfxVolume);
    },
    [soundEnabled, sfxVolume]
  );

  useEffect(() => {
    if (!soundEnabled || musicVolume <= 0 || gameState !== 'playing') {
      audioManager.stopBackgroundMusic();
      return;
    }
    audioManager.startBackgroundMusic(musicVolume);
    return () => audioManager.stopBackgroundMusic();
  }, [soundEnabled, musicVolume, gameState]);

  useEffect(() => {
    if (!soundEnabled || musicVolume <= 0 || gameState !== 'playing') {
      audioManager.stopProximityAudio();
      return;
    }
    audioManager.startProximityAudio(musicVolume, () => playerPosRef.current, exitPos);
    return () => audioManager.stopProximityAudio();
  }, [soundEnabled, musicVolume, gameState, exitPos, playerPosRef]);

  return { playSound };
};
