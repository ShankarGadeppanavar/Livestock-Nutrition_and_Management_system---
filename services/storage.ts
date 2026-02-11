
import { AppState } from '../types';
import { generateSeedData } from '../constants';

const STORAGE_KEY = 'liveshock_v1_storage';

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    pigs: generateSeedData(),
    feedEvents: [],
    currentUser: null
  };
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
