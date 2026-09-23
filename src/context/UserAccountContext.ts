import { createContext } from 'react';
import type { UserProfile, IndieAvatarId } from '../types/user';
import type { RenameCooldownInfo } from '../utils/featherEconomy';

export interface UserAccountContextType {
  profile: UserProfile;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  isSupabaseActive: boolean;
  updateProfile: (fields: Partial<UserProfile>) => void;
  setAvatar: (avatarId: IndieAvatarId) => void;
  setUsername: (name: string) => Promise<{ success: boolean; error?: string }>;
  renameCooldown: RenameCooldownInfo;
  bypassRenameCooldown: (spendFeathersFn?: (amount: number) => boolean) => { success: boolean; error?: string };
  setActiveTitle: (title: string) => void;
  setActiveFrame: (frameId: string) => void;
  unlockShopItem: (
    type: 'avatar' | 'title' | 'frame',
    itemId: string,
    cost: number,
    spendFeathersFn: (amount: number) => boolean
  ) => { success: boolean; error?: string };
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
  hideOwnedGames: boolean;
  setHideOwnedGames: (hide: boolean) => void;
  connectSteamWithOpenId: () => void;
  connectSteamByIdentifier: (identifier: string, apiKey?: string) => Promise<{ success: boolean; message?: string }>;
  syncSteamLibrary: (apiKey?: string) => Promise<{ success: boolean; count?: number; message?: string }>;
  setManualOwnedGames: (appIds: number[]) => void;
  toggleGameOwned: (steamUrlOrAppId?: string | number | null) => void;
  isGameOwned: (steamUrlOrAppId?: string | number | null) => boolean;
  disconnectSteam: () => void;
}

export const UserAccountContext = createContext<UserAccountContextType | null>(null);
