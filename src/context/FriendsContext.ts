import { createContext } from 'react';
import type { FriendPlayer } from '../types/friends';

export interface FriendsContextType {
  friends: FriendPlayer[];
  myFriendCode: string;
  isLoading: boolean;
  addFriend: (query: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeFriend: (friendCode: string) => void;
  refreshFriends: () => Promise<void>;
  syncSteamFriends: () => Promise<{ success: boolean; count?: number; message?: string; error?: string }>;
  createVersusChallengeUrl: (customRoomCode?: string) => { roomCode: string; inviteUrl: string };
  isFriendAdded: (code: string) => boolean;
  totalFriendsCount: number;
  friendsActiveTodayCount: number;
  friendsOnlineCount: number;
  favoriteFriendCodes: string[];
  isFavoriteFriend: (friendCode: string) => boolean;
  toggleFavoriteFriend: (friendCode: string) => void;
}

export const FriendsContext = createContext<FriendsContextType | null>(null);
