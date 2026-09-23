export type IndieAvatarId =
  | 'hibouxe_creator'
  | 'knight'
  | 'madeline'
  | 'zagreus'
  | 'lamb'
  | 'joker'
  | 'cat'
  | 'goose'
  | 'owl'
  | 'shovel_knight'
  | 'sans'
  | 'cuphead'
  | 'isaac'
  | 'penitent'
  | 'beheaded'
  | 'niko'
  | 'meat_boy'
  | 'baba'
  | 'hornet'
  | 'omori'
  | 'claire'
  | 'drifter'
  | 'slugcat'
  | 'golden_sylvestre'
  | 'celestial_knight'
  | 'golden_hornet'
  | 'retro_ghost';

export interface IndieAvatar {
  id: IndieAvatarId;
  name: string;
  game: string;
  emoji: string;
  bgGradient: string;
  quote: string;
  imageUrl?: string;
  adminOnly?: boolean;
  shopPrice?: number;
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
  friendCode?: string;
  steam?: SteamAccountInfo;
  versusStats: {
    matchesPlayed: number;
    matchesWon: number;
    currentStreak: number;
    bestStreak: number;
    eloRating: number;
  };
  // Cooldown de renommage (14 jours)
  lastUsernameChangeAt?: string;
  // Déblocages & Cosmétiques de la Boutique
  unlockedAvatars?: IndieAvatarId[];
  unlockedTitles?: string[];
  unlockedFrames?: string[];
  activeFrame?: string;
}

export interface AccountSaveData {
  profile: UserProfile;
  stats: any;
  achievements: any;
  goldenFeathers: number;
  exportedAt: string;
}
