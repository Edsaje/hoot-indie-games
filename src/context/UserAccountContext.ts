import { createContext } from 'react';
import type { UserProfile, IndieAvatarId } from '../types/user';

export interface UserAccountContextType {
  profile: UserProfile;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupabaseActive: boolean;
  updateProfile: (fields: Partial<UserProfile>) => void;
  setAvatar: (avatarId: IndieAvatarId) => void;
  setUsername: (name: string) => Promise<{ success: boolean; error?: string }>;
  recordVersusResult: (won: boolean, opponentElo?: number) => void;
  exportSaveData: () => string;
  importSaveData: (jsonString: string) => { success: boolean; error?: string };
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  syncCloud: () => Promise<{ success: boolean; message: string }>;

  // Intégration Steam & Bibliothèque
  steamAccount?: import('../types/user').SteamAccountInfo;
  isSteamConnected: boolean;
  ownedAppIdsSet: Set<number>;
  connectSteamWithOpenId: () => void;
  connectSteamByIdentifier: (identifier: string, apiKey?: string) => Promise<{ success: boolean; message?: string }>;
  syncSteamLibrary: (apiKey?: string) => Promise<{ success: boolean; count?: number; message?: string }>;
  setManualOwnedGames: (appIds: number[]) => void;
  toggleGameOwned: (steamUrlOrAppId?: string | number | null) => void;
  isGameOwned: (steamUrlOrAppId?: string | number | null) => boolean;
  disconnectSteam: () => void;
}

export const UserAccountContext = createContext<UserAccountContextType | null>(null);
