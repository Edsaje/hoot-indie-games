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

export interface SteamAccountInfo {
  steamId: string;
  personaName: string;
  profileUrl: string;
  avatarUrl?: string;
  lastSyncedAt: string;
  ownedAppIds: number[];
  gamesCount: number;
  apiKey?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarId: IndieAvatarId;
  title: string;
  createdAt: string;
  isCloudSynced: boolean;
  isAdmin?: boolean;
  role?: 'admin' | 'user';
  email?: string;
  steam?: SteamAccountInfo;
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
