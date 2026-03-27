import { useState, useEffect } from 'react';
import { GameState } from '../types';
import { CELL_SIZE, VIEWPORT_SIZE } from '../constants';

export function useDynamicCellSize(gameState: GameState, mazeLength: number): number {
  const [dynamicCellSize, setDynamicCellSize] = useState(CELL_SIZE);

  useEffect(() => {
    const handleResize = () => {
      if (gameState === 'playing' && mazeLength > 0) {
        const availableWidth = window.innerWidth - 32;
        const availableHeight = window.innerHeight - 300;
        const size = Math.floor(Math.min(availableWidth, availableHeight) / VIEWPORT_SIZE);
        setDynamicCellSize(Math.min(60, Math.max(35, size)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState, mazeLength]);

  return dynamicCellSize;
}
