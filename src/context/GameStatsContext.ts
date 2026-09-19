import { createContext } from 'react';
import type { ModeStats, OverallStats } from '../types/game';

export type DailyGameMode =
  | 'screenle'
  | 'indledle'
  | 'linkle'
  | 'profille'
  | 'chrono'
  | 'pixel'
  | 'review'
  | 'blindtest';

export interface GameStatsContextType {
  stats: OverallStats;
  recordGameResult: (
    mode: DailyGameMode,
    dateStr: string,
    isWon: boolean,
    guessCount: number
  ) => void;
  resetStats: () => void;
  dismissStreakBreak: (mode: DailyGameMode) => void;
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
  indledle: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } },
  linkle: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 } },
  profille: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0 } },
  chrono: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0 } },
  pixel: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  review: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  blindtest: { ...defaultModeStats, guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
};

export const STATS_STORAGE_KEY = 'hoot_indie_stats_v1';

export const GameStatsContext = createContext<GameStatsContextType | undefined>(undefined);
