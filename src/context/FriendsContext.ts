import { createContext } from 'react';
import type { FriendPlayer, FriendRequest } from '../types/friends';

export interface FriendsContextType {
  friends: FriendPlayer[];
  myFriendCode: string;
  isLoading: boolean;
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  pendingRequestsCount: number;
  sendFriendRequest: (query: string) => Promise<{ success: boolean; isImmediate?: boolean; message?: string; error?: string }>;
  respondFriendRequest: (requestId: string, action: 'accept' | 'decline' | 'cancel') => Promise<{ success: boolean; message?: string; error?: string }>;
  addFriend: (query: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeFriend: (friendCode: string) => Promise<void> | void;
  refreshFriends: () => Promise<void>;
  refreshRequests: () => Promise<void>;
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

