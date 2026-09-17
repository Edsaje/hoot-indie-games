export type IndieAvatarId =
  | 'knight'
  | 'madeline'
  | 'zagreus'
  | 'lamb'
  | 'joker'
  | 'cat'
  | 'goose'
  | 'owl';

export interface IndieAvatar {
  id: IndieAvatarId;
  name: string;
  game: string;
  emoji: string;
  bgGradient: string;
  quote: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarId: IndieAvatarId;
  title: string;
  createdAt: string;
  isCloudSynced: boolean;
  email?: string;
  versusStats: {
    matchesPlayed: number;
    matchesWon: number;
    currentStreak: number;
    bestStreak: number;
    eloRating: number;
  };
}

export interface AccountSaveData {
  profile: UserProfile;
  stats: any;
  achievements: any;
  goldenFeathers: number;
  exportedAt: string;
}
