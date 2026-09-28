import type { IndieAvatarId } from './user';

export type FriendPlayStatus = 'won' | 'lost' | 'unplayed';

export interface FriendDailyDiscipline {
  status: FriendPlayStatus;
  guessCount?: number;
  timeSeconds?: number;
  solvedAt?: string;
}

export interface FriendDailyScores {
  date: string; // "YYYY-MM-DD"
  screenle: FriendDailyDiscipline;
  indledle: FriendDailyDiscipline;
  linkle: FriendDailyDiscipline;
  profille: FriendDailyDiscipline;
  chrono: FriendDailyDiscipline;
  pixel: FriendDailyDiscipline;
  review: FriendDailyDiscipline;
  blindtest: FriendDailyDiscipline;
  totalWonToday: number;
}

export interface FriendPlayer {
  friendCode: string; // "HOOT-XXXX"
  username: string;
  avatarId: IndieAvatarId;
  title: string;
  steamId?: string;
  elo: number;
  streak: number;
  lastActive: string; // ISO string
  dailyScores?: FriendDailyScores;
  isOnline?: boolean;
  isMutual?: boolean;
  addedAt?: string;
  note?: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface FriendRequest {
  id: string;
  fromCode: string;
  fromUsername: string;
  fromAvatarId: IndieAvatarId;
  fromTitle?: string;
  toCode: string;
  toUsername: string;
  status: FriendRequestStatus;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  fromPlayer?: FriendPlayer;
  toPlayer?: FriendPlayer;
}

