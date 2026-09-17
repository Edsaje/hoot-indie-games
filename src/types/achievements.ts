import type { LocalizedText } from './game';

export interface Achievement {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string; // Lucide icon identifier
  feathersReward: number;
  category: 'gameplay' | 'exploration' | 'mastery';
  secret?: boolean;
}

export interface UserAchievementState {
  unlockedIds: string[];
  feathersCount: number;
  unlockedAt: Record<string, string>; // achievementId -> ISO timestamp
}
