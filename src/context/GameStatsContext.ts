import { createContext } from 'react';
import type { ModeStats, OverallStats } from '../types/game';

export interface GameStatsContextType {
  stats: OverallStats;
  recordGameResult: (
    mode: 'screenle' | 'indledle' | 'linkle',
    dateStr: string,
    isWon: boolean,
    guessCount: number
  ) => void;
  resetStats: () => void;
}

export const defaultModeStats: ModeStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

export const defaultOverallStats: OverallStats = {
  screenle: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } },
  indledle: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 } },
  linkle: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 } },
};

export const STATS_STORAGE_KEY = 'hoot_indie_stats_v1';

export const GameStatsContext = createContext<GameStatsContextType | undefined>(undefined);
