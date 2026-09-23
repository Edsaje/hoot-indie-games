import { useContext } from 'react';
import { AchievementsContext } from './AchievementsContext';
import type { AchievementsContextType } from './AchievementsContext';

export const useAchievements = (): AchievementsContextType => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
