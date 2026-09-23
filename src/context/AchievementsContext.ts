import { createContext } from 'react';
import type { Achievement } from '../types/achievements';

export interface FeatherToast {
  amount: number;
  message: string;
}

export interface AchievementsContextType {
  unlockedIds: string[];
  feathersCount: number;
  unlockAchievement: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  recentlyUnlocked: Achievement | null;
  clearRecentAchievement: () => void;
  allAchievements: Achievement[];
  // Économie des Plumes d'Or (Farm journalier & Dépenses boutique)
  spendFeathers: (amount: number, reason?: string) => boolean;
  addBonusFeathers: (amount: number, reason?: string) => void;
  checkPendingDailyRewards: (dateStr?: string) => { totalAwarded: number; newGames: string[]; grandSlamAwarded: boolean };
  recentFeatherToast: FeatherToast | null;
  clearRecentFeatherToast: () => void;
}

export const AchievementsContext = createContext<AchievementsContextType | null>(null);
