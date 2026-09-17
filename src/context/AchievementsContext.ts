import { createContext } from 'react';
import type { Achievement } from '../types/achievements';

export interface AchievementsContextType {
  unlockedIds: string[];
  feathersCount: number;
  unlockAchievement: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  recentlyUnlocked: Achievement | null;
  clearRecentAchievement: () => void;
  allAchievements: Achievement[];
}

export const AchievementsContext = createContext<AchievementsContextType | null>(null);
