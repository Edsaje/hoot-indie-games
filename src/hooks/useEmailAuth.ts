/**
 * 🦉 Hoot Indie Games — Hook Modulaire d'Authentification Email & Session
 * Gère la connexion, l'inscription, la vérification d'email et la détection transparente de session serveur.
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/user';
import { ADMIN_STEAM_ID } from '../utils/usernameValidation';
import {
  apiGetSession,
  apiLogin,
  apiRegister,
  apiLogout,
  apiDeleteAccount,
  apiVerifyEmail,
  apiResendVerificationEmail,
} from '../services/userAuthService';
import { syncUserCloudSave } from '../services/userCloudSyncService';
import { USER_STORAGE_KEY, getDefaultProfile } from './useUserIdentity';

/**
 * Nettoyage souverain étanche de toutes les données du compte lors de la déconnexion
 */
export function clearAllUserConnectedData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    fetch('/api/user_auth.php?action=logout', { credentials: 'include' }).catch(() => {});
  } catch {}

  // 1. Profil utilisateur
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem('hoot_user_profile');
  localStorage.removeItem('hoot_player_nickname');

  // 2. Sanctuaire des cartes
  localStorage.removeItem('hoot_cards_collection_v1');
  localStorage.removeItem('hoot_cards_stats_v1');
  localStorage.removeItem('hoot_cards_pack_history_v1');
  localStorage.removeItem('hoot_last_daily_booster_claim_v1');
  localStorage.removeItem('hoot_free_boosters_stock_v2');

  // 3. Amis & Social
  localStorage.removeItem('hoot_friends_list_v2');

  // 4. Économie des Plumes
  localStorage.removeItem('hoot_bonus_feathers_v1');
  localStorage.removeItem('hoot_spent_feathers_v1');
  localStorage.removeItem('hoot_claimed_daily_feathers_v1');
  localStorage.removeItem('hoot_golden_feathers_v1');

  // 5. Succès & Trophées
  localStorage.removeItem('hoot_unlocked_achievements_v1');
  localStorage.removeItem('hoot_achievements_v1');

  // 6. Odyssée Sylvestre (Purge étanche sur machine partagée)
  localStorage.removeItem('hoot_odyssey_save_v1');

  // 7. Outils & Modules
  localStorage.removeItem('hoot_backlog_selection');
  localStorage.removeItem('hoot_backlog_daily_hours');
  localStorage.removeItem('hoot_liked_micro_indies');
  localStorage.removeItem('hoot_quiz_highscore');

  // 8. Grilles quotidiennes des 8 mini-jeux
  const modePrefixes = [
    'screenle_state_',
    'indledle_state_',
    'linkle_state_',
    'profille_state_',
    'chrono_state_',
    'pixel_state_',
    'review_state_',
    'blindtest_state_',
  ];
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && modePrefixes.some((p) => k.startsWith(p))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  localStorage.removeItem('hoot_indie_stats_v1');
  localStorage.removeItem('hoot_game_stats_v1');
  localStorage.removeItem('hoot_time_attack_stats_v1');
  localStorage.removeItem('hoot_cloud_sync_key_v1');
  localStorage.removeItem('hoot_admin_key');

  // Déclenchement des événements de réinitialisation
  try {
    window.dispatchEvent(new CustomEvent('hoot_cards_updated', { detail: {} }));
    window.dispatchEvent(new CustomEvent('hoot_feathers_updated'));
    window.dispatchEvent(new CustomEvent('hoot_achievements_updated'));
    window.dispatchEvent(new CustomEvent('hoot_friends_updated'));
    window.dispatchEvent(new CustomEvent('hoot_daily_states_updated'));
    window.dispatchEvent(new CustomEvent('hoot_stats_updated', { detail: null }));
    window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { reset: true } }));
    window.dispatchEvent(new CustomEvent('hoot_cloud_reset'));
  } catch {}
}

export function useEmailAuth(
  profile: UserProfile,
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>,
  isCreator: boolean
) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email || parsed.steam?.steamId || parsed.isCloudSynced) {
          return true;
        }
      }
    } catch {}
    return false;
  });

  const isEmailVerified = Boolean(
    profile.emailVerified || profile.steam?.steamId || isCreator
  );

  // Vérification transparente de la session active au montage (même sur navigateur vierge)
  useEffect(() => {
    const checkServerSession = async () => {
      try {
        const res = await apiGetSession();
        if (res.success && res.authenticated && res.user) {
          if ((res as any).adminKey) {
            try {
              localStorage.setItem('hoot_admin_key', (res as any).adminKey);
            } catch {}
          }
          const user = res.user;
          const isOfficialAdmin = Boolean(
            (user.steamId && String(user.steamId).trim() === ADMIN_STEAM_ID) ||
            (user.email && user.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr')
          );
          const isVerified = user.emailVerified !== undefined ? Boolean(user.emailVerified) : (user.steamId ? true : undefined);

          setIsAuthenticated(true);
          setProfile((prev) => ({
            ...prev,
            id: user.id,
            email: user.email || prev.email,
            emailVerified: isVerified !== undefined ? isVerified : prev.emailVerified,
            username: user.username && user.username !== 'Hibou Mystère' ? user.username : prev.username,
            steam: user.steamId ? {
              ...(prev.steam || {
                profileUrl: '',
                lastSyncedAt: new Date().toISOString(),
                ownedAppIds: [],
                gamesCount: 0,
              }),
              steamId: user.steamId,
              personaName: prev.steam?.personaName || user.username,
            } : prev.steam,
            isAdmin: isOfficialAdmin ? true : prev.isAdmin,
            role: isOfficialAdmin ? 'admin' : prev.role,
            avatarId: isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId,
            title: isOfficialAdmin ? '👑 Créateur du Site' : prev.title,
            isCloudSynced: true,
          }));

          // Synchroniser immédiatement la sauvegarde cloud
          syncUserCloudSave(
            { userId: user.id, steamId: user.steamId || undefined, username: user.username },
            { force: true, strategy: 'replace' }
          ).then((syncRes) => {
            if (syncRes.success && syncRes.data) {
              const cloudData = syncRes.data;
              setProfile((prev) => ({
                ...prev,
                username: isOfficialAdmin
                  ? 'Hibouxe'
                  : cloudData.username && cloudData.username !== 'Hibou Mystère' && !cloudData.username.startsWith('Explorateur_')
                  ? cloudData.username
                  : prev.username,
                avatarId: (cloudData.avatarId as any) || (isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId),
                title: cloudData.title || (isOfficialAdmin ? '👑 Créateur du Site' : prev.title),
                activeFrame: cloudData.activeFrame || prev.activeFrame,
                unlockedAvatars: (cloudData.unlockedAvatars as any) || prev.unlockedAvatars,
                unlockedTitles: cloudData.unlockedTitles || prev.unlockedTitles,
                unlockedFrames: cloudData.unlockedFrames || prev.unlockedFrames,
                isCloudSynced: true,
              }));
            }
          }).catch(() => {});
        }
      } catch {}
    };

    let timer: any;
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && typeof win.requestIdleCallback === 'function') {
      timer = win.requestIdleCallback(checkServerSession, { timeout: 3000 });
    } else {
      timer = setTimeout(checkServerSession, 1200);
    }

    return () => {
      if (win && typeof win.cancelIdleCallback === 'function' && timer) {
        win.cancelIdleCallback(timer);
      } else {
        clearTimeout(timer);
      }
    };
  }, [setProfile]);

  const loginWithEmail = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await apiLogin(email, pass);
        if (res.success && res.user) {
          if ((res as any).adminKey) {
            try {
              localStorage.setItem('hoot_admin_key', (res as any).adminKey);
            } catch {}
          }
          const user = res.user;
          const isOfficialAdmin = Boolean(
            (user.steamId && String(user.steamId).trim() === ADMIN_STEAM_ID) ||
            (user.email && user.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr')
          );

          setIsAuthenticated(true);
          setProfile((prev) => ({
            ...prev,
            id: user.id,
            email: user.email || email,
            emailVerified: user.emailVerified !== undefined ? Boolean(user.emailVerified) : (user.steamId ? true : undefined),
            username: user.username || prev.username,
            steam: user.steamId
              ? {
                  ...(prev.steam || {
                    profileUrl: '',
                    lastSyncedAt: new Date().toISOString(),
                    ownedAppIds: [],
                    gamesCount: 0,
                  }),
                  steamId: user.steamId,
                  personaName: prev.steam?.personaName || user.username,
                }
              : prev.steam,
            isAdmin: isOfficialAdmin ? true : prev.isAdmin,
            role: isOfficialAdmin ? 'admin' : prev.role,
            avatarId: isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId,
            title: isOfficialAdmin ? '👑 Créateur du Site' : prev.title,
            isCloudSynced: true,
          }));

          syncUserCloudSave(
            { userId: user.id, steamId: user.steamId || undefined, username: user.username },
            { force: true, strategy: 'replace' }
          ).then((syncRes) => {
            if (syncRes.success && syncRes.data) {
              const cloudData = syncRes.data;
              setProfile((prev) => ({
                ...prev,
                username: isOfficialAdmin
                  ? 'Hibouxe'
                  : cloudData.username && cloudData.username !== 'Hibou Mystère' && !cloudData.username.startsWith('Explorateur_')
                  ? cloudData.username
                  : prev.username,
                avatarId: (cloudData.avatarId as any) || (isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId),
                title: cloudData.title || (isOfficialAdmin ? '👑 Créateur du Site' : prev.title),
                activeFrame: cloudData.activeFrame || prev.activeFrame,
                unlockedAvatars: (cloudData.unlockedAvatars as any) || prev.unlockedAvatars,
                unlockedTitles: cloudData.unlockedTitles || prev.unlockedTitles,
                unlockedFrames: cloudData.unlockedFrames || prev.unlockedFrames,
                isCloudSynced: true,
              }));
            }
          }).catch(() => {});

          return { success: true };
        }
        return { success: false, error: res.message || 'Adresse e-mail ou mot de passe incorrect.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur réseau.' };
      }
    },
    [setProfile]
  );

  const signUpWithEmail = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const preferredUsername = profile.username && profile.username !== 'Hibou Mystère' ? profile.username : undefined;
        const currentSteamId = profile.steam?.steamId && !profile.steam.steamId.startsWith('local_') ? profile.steam.steamId : undefined;

        const res = await apiRegister(email, pass, preferredUsername, currentSteamId);
        if (res.success && res.user) {
          const user = res.user;
          setIsAuthenticated(true);
          setProfile((prev) => ({
            ...prev,
            id: user.id,
            email: user.email || email,
            emailVerified: Boolean(user.emailVerified),
            username: user.username || prev.username,
            isCloudSynced: true,
          }));

          // À l'inscription, fusionner les progrès locaux réalisés en mode invité (merge)
          syncUserCloudSave(
            { userId: user.id, steamId: user.steamId || undefined, username: user.username },
            { force: true, strategy: 'merge' }
          ).catch(() => {});

          return { success: true };
        }
        return { success: false, error: res.message || 'Impossible de créer le compte.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur réseau.' };
      }
    },
    [profile.username, profile.steam?.steamId, setProfile]
  );

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const guestGoogleEmail = 'joueur.google@hoot.local';
    const chosenName = profile.username && profile.username !== 'Hibou Mystère' ? profile.username : 'Chouette Exploratrice';
    setProfile((prev) => ({
      ...prev,
      email: guestGoogleEmail,
      username: chosenName,
      isCloudSynced: false,
    }));
    setIsAuthenticated(true);
    return { success: true };
  }, [profile.username, setProfile]);

  const verifyEmail = useCallback(
    async (tokenOrCode: string): Promise<{ success: boolean; error?: string; message?: string }> => {
      try {
        const res = await apiVerifyEmail(tokenOrCode);
        if (res.success) {
          setProfile((prev) => ({ ...prev, emailVerified: true }));
          return { success: true, message: res.message };
        }
        return { success: false, error: res.message || 'Code ou lien invalide.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur réseau.' };
      }
    },
    [setProfile]
  );

  const resendVerificationEmail = useCallback(
    async (email?: string): Promise<{ success: boolean; error?: string; message?: string; cooldownRemaining?: number }> => {
      const emailToSend = email || profile.email;
      if (!emailToSend) return { success: false, error: 'Aucune adresse e-mail.' };
      return apiResendVerificationEmail(emailToSend);
    },
    [profile.email]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiLogout();
    } catch {}
    clearAllUserConnectedData();
    setIsAuthenticated(false);
    setProfile(getDefaultProfile());
  }, [setProfile]);

  const deleteAccount = useCallback(
    async (password?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await apiDeleteAccount(password);
        if (res.success) {
          clearAllUserConnectedData();
          setIsAuthenticated(false);
          setProfile(getDefaultProfile());
          return { success: true };
        }
        return { success: false, error: res.message || 'Échec de la suppression du compte.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur réseau.' };
      }
    },
    [setProfile]
  );

  return {
    isAuthenticated,
    setIsAuthenticated,
    isEmailVerified,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    verifyEmail,
    resendVerificationEmail,
    logout,
    deleteAccount,
  };
}
