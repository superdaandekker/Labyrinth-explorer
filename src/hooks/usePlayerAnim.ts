import { useReducer, useCallback } from 'react';
import { Point } from '../types';

interface PlayerAnimState {
  damageFlash: boolean;
  isBumping: boolean;
  isDashing: boolean;
  moveDirection: 'up' | 'down' | 'left' | 'right';
  previousPos: Point | null;
}

type PlayerAnimAction =
  | { type: 'SET_DAMAGE_FLASH'; payload: boolean }
  | { type: 'SET_BUMPING'; payload: boolean }
  | { type: 'SET_DASHING'; payload: boolean }
  | { type: 'SET_MOVE_DIRECTION'; payload: 'up' | 'down' | 'left' | 'right' }
  | { type: 'SET_PREVIOUS_POS'; payload: Point | null };

const playerAnimReducer = (state: PlayerAnimState, action: PlayerAnimAction): PlayerAnimState => {
  switch (action.type) {
    case 'SET_DAMAGE_FLASH':   return { ...state, damageFlash: action.payload };
    case 'SET_BUMPING':        return { ...state, isBumping: action.payload };
    case 'SET_DASHING':        return { ...state, isDashing: action.payload };
    case 'SET_MOVE_DIRECTION': return { ...state, moveDirection: action.payload };
    case 'SET_PREVIOUS_POS':   return { ...state, previousPos: action.payload };
    default: return state;
  }
};

const initialPlayerAnimState: PlayerAnimState = {
  damageFlash: false,
  isBumping: false,
  isDashing: false,
  moveDirection: 'right',
  previousPos: null,
};

export const usePlayerAnim = () => {
  const [state, dispatch] = useReducer(playerAnimReducer, initialPlayerAnimState);

  const setDamageFlash   = useCallback((v: boolean) => dispatch({ type: 'SET_DAMAGE_FLASH', payload: v }), []);
  const setIsBumping     = useCallback((v: boolean) => dispatch({ type: 'SET_BUMPING', payload: v }), []);
  const setIsDashing     = useCallback((v: boolean) => dispatch({ type: 'SET_DASHING', payload: v }), []);
  const setMoveDirection = useCallback((v: 'up' | 'down' | 'left' | 'right') => dispatch({ type: 'SET_MOVE_DIRECTION', payload: v }), []);
  const setPreviousPos   = useCallback((v: Point | null) => dispatch({ type: 'SET_PREVIOUS_POS', payload: v }), []);

  return {
    ...state,
    setDamageFlash, setIsBumping, setIsDashing, setMoveDirection, setPreviousPos,
  };
};
