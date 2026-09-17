import { createContext } from 'react';
import type { UserProfile, IndieAvatarId } from '../types/user';

export interface UserAccountContextType {
  profile: UserProfile;
  isAuthenticated: boolean;
  isSupabaseActive: boolean;
  updateProfile: (fields: Partial<UserProfile>) => void;
  setAvatar: (avatarId: IndieAvatarId) => void;
  setUsername: (name: string) => void;
  recordVersusResult: (won: boolean, opponentElo?: number) => void;
  exportSaveData: () => string;
  importSaveData: (jsonString: string) => { success: boolean; error?: string };
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  syncCloud: () => Promise<{ success: boolean; message: string }>;
}

export const UserAccountContext = createContext<UserAccountContextType | null>(null);
