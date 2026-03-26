import { useReducer, useCallback } from 'react';

interface UIState {
  showSettings: boolean;
  showShop: boolean;
  showAchievements: boolean;
  showLeaderboard: boolean;
  isPaused: boolean;
  shopCategory: 'all' | 'themes' | 'powerups' | 'coins';
  shopSort: 'name' | 'price';
}

type UIAction =
  | { type: 'SET_SHOW_SETTINGS'; payload: boolean }
  | { type: 'SET_SHOW_SHOP'; payload: boolean }
  | { type: 'SET_SHOW_ACHIEVEMENTS'; payload: boolean }
  | { type: 'SET_SHOW_LEADERBOARD'; payload: boolean }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_SHOP_CATEGORY'; payload: 'all' | 'themes' | 'powerups' | 'coins' }
  | { type: 'SET_SHOP_SORT'; payload: 'name' | 'price' };

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'SET_SHOW_SETTINGS':    return { ...state, showSettings: action.payload };
    case 'SET_SHOW_SHOP':        return { ...state, showShop: action.payload };
    case 'SET_SHOW_ACHIEVEMENTS': return { ...state, showAchievements: action.payload };
    case 'SET_SHOW_LEADERBOARD': return { ...state, showLeaderboard: action.payload };
    case 'SET_PAUSED':           return { ...state, isPaused: action.payload };
    case 'SET_SHOP_CATEGORY':    return { ...state, shopCategory: action.payload };
    case 'SET_SHOP_SORT':        return { ...state, shopSort: action.payload };
    default: return state;
  }
};

const initialUIState: UIState = {
  showSettings: false,
  showShop: false,
  showAchievements: false,
  showLeaderboard: false,
  isPaused: false,
  shopCategory: 'all',
  shopSort: 'name',
};

export const useUIState = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  const setShowSettings    = useCallback((v: boolean) => dispatch({ type: 'SET_SHOW_SETTINGS', payload: v }), []);
  const setShowShop        = useCallback((v: boolean) => dispatch({ type: 'SET_SHOW_SHOP', payload: v }), []);
  const setShowAchievements = useCallback((v: boolean) => dispatch({ type: 'SET_SHOW_ACHIEVEMENTS', payload: v }), []);
  const setShowLeaderboard = useCallback((v: boolean) => dispatch({ type: 'SET_SHOW_LEADERBOARD', payload: v }), []);
  const setIsPaused        = useCallback((v: boolean) => dispatch({ type: 'SET_PAUSED', payload: v }), []);
  const setShopCategory    = useCallback((v: 'all' | 'themes' | 'powerups' | 'coins') => dispatch({ type: 'SET_SHOP_CATEGORY', payload: v }), []);
  const setShopSort        = useCallback((v: 'name' | 'price') => dispatch({ type: 'SET_SHOP_SORT', payload: v }), []);

  return {
    ...state,
    setShowSettings, setShowShop, setShowAchievements, setShowLeaderboard,
    setIsPaused, setShopCategory, setShopSort,
  };
};
