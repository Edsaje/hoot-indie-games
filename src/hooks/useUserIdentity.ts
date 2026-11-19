/**
 * 🦉 Hoot Indie Games — Hook Modulaire d'Identité Utilisateur
 * Gère le profil local/cloud, les titres, cadres, avatars, rôles et le renommage.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile, IndieAvatarId } from '../types/user';
import {
  validateUsernameFormat,
  claimUsernameOnServer,
  ADMIN_STEAM_ID,
} from '../utils/usernameValidation';
import {
  getRenameCooldownInfo,
  EXPRESS_RENAME_COST,
  SHOP_TITLES,
} from '../utils/featherEconomy';

export const USER_STORAGE_KEY = 'hoot_user_profile_v1';

export function getDefaultProfile(): UserProfile {
  return {
    id: 'local_' + Math.random().toString(36).substring(2, 9),
    username: 'Hibou Mystère',
    avatarId: 'owl',
    title: 'Oisillon du Perchoir',
    createdAt: new Date().toISOString(),
    isCloudSynced: false,
    isAdmin: false,
    role: 'user',
    versusStats: {
      matchesPlayed: 0,
      matchesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      eloRating: 1000,
    },
  };
}

export function useUserIdentity() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isOfficialCreator = Boolean(
          (parsed.steam?.steamId && String(parsed.steam.steamId).trim() === ADMIN_STEAM_ID) ||
          (parsed.email && parsed.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr')
        );
        const resolvedUsername = isOfficialCreator
          ? (!parsed.username || parsed.username === 'Hibou Mystère' || parsed.username.startsWith('Explorateur_') ? 'Hibouxe' : parsed.username)
          : (parsed.username || 'Hibou Mystère');
        return {
          ...getDefaultProfile(),
          ...parsed,
          username: resolvedUsername,
          isAdmin: isOfficialCreator ? true : false,
          role: isOfficialCreator ? 'admin' : 'user',
          avatarId: isOfficialCreator ? 'hibouxe_creator' : (parsed.avatarId || 'owl'),
          title: isOfficialCreator ? '👑 Créateur du Site' : (parsed.title || 'Oisillon du Perchoir'),
        };
      }
    } catch {
      // Fallback
    }
    return getDefaultProfile();
  });

  // Sauvegarde locale automatique
  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Détection stricte créateur & modérateur
  const isCreator = useMemo(() => {
    const hasAdminSteam = Boolean(profile.steam?.steamId && String(profile.steam.steamId).trim() === ADMIN_STEAM_ID);
    const hasAdminEmail = Boolean(profile.email && profile.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr');
    return hasAdminSteam || hasAdminEmail;
  }, [profile.steam?.steamId, profile.email]);

  const isAdmin = useMemo(() => {
    return isCreator || Boolean(profile.isAdmin) || profile.role === 'admin';
  }, [isCreator, profile.isAdmin, profile.role]);

  const isModerator = useMemo(() => {
    return isCreator || isAdmin || Boolean(profile.isModerator) || profile.role === 'moderator';
  }, [isCreator, isAdmin, profile.isModerator, profile.role]);

  // Protection stricte de l'identité du créateur
  useEffect(() => {
    if (isCreator) {
      if (!profile.isAdmin || profile.role !== 'admin' || profile.avatarId !== 'hibouxe_creator') {
        setProfile((prev) => ({
          ...prev,
          isAdmin: true,
          role: 'admin',
          avatarId: 'hibouxe_creator',
          title: '👑 Créateur du Site',
        }));
      }
    } else {
      if (profile.isAdmin || profile.role === 'admin' || profile.avatarId === 'hibouxe_creator') {
        setProfile((prev) => ({
          ...prev,
          isAdmin: false,
          role: prev.role === 'admin' ? (prev.isModerator ? 'moderator' : 'user') : prev.role,
          avatarId: prev.avatarId === 'hibouxe_creator' ? 'owl' : prev.avatarId,
          title: prev.title === '👑 Créateur du Site' ? 'Oisillon du Perchoir' : prev.title,
        }));
      }
    }
  }, [isCreator, profile.isAdmin, profile.role, profile.avatarId]);

  const updateProfile = useCallback((fields: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  }, []);

  const setAvatar = useCallback((avatarId: IndieAvatarId) => {
    if (avatarId === 'hibouxe_creator' && !isCreator) return;
    setProfile((prev) => {
      import('../services/leaderboardService').then((m) => {
        m.updateLeaderboardPlayerProfile(prev.username, avatarId, prev.username).catch(() => {});
      }).catch(() => {});
      return { ...prev, avatarId };
    });
  }, [isCreator]);

  const renameCooldown = useMemo(() => {
    return getRenameCooldownInfo(profile.lastUsernameChangeAt, isCreator);
  }, [profile.lastUsernameChangeAt, isCreator]);

  const setUsername = useCallback(
    async (username: string): Promise<{ success: boolean; error?: string }> => {
      if (!isCreator && !renameCooldown.canChange) {
        return {
          success: false,
          error: `Vous devez attendre encore ${renameCooldown.daysRemaining} jour(s) avant de modifier votre pseudo.`,
        };
      }

      const trimmed = username.trim();
      const formatCheck = validateUsernameFormat(trimmed, profile.steam?.steamId, isCreator);
      if (!formatCheck.valid) {
        return { success: false, error: formatCheck.error };
      }

      const claimResult = await claimUsernameOnServer(trimmed, profile.id, profile.steam?.steamId);
      if (!claimResult.success) {
        return { success: false, error: claimResult.message };
      }

      const finalName = claimResult.username || trimmed;
      const oldName = profile.username;

      setProfile((prev) => ({
        ...prev,
        username: finalName,
        lastUsernameChangeAt: new Date().toISOString(),
      }));

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hoot_player_nickname', finalName);
      }

      import('../services/leaderboardService').then((m) => {
        m.updateLeaderboardPlayerProfile(finalName, profile.avatarId, oldName).catch(() => {});
      }).catch(() => {});

      return { success: true };
    },
    [isCreator, renameCooldown, profile.steam?.steamId, profile.id, profile.avatarId, profile.username]
  );

  const bypassRenameCooldown = useCallback(
    (spendFeathersFn?: (amount: number) => boolean): { success: boolean; error?: string } => {
      if (spendFeathersFn) {
        const spent = spendFeathersFn(EXPRESS_RENAME_COST);
        if (!spent) {
          return { success: false, error: "Solde de Plumes d'Or insuffisant !" };
        }
      } else {
        const rawSpent = Number(localStorage.getItem('hoot_spent_feathers_v1') || '0');
        localStorage.setItem('hoot_spent_feathers_v1', String(rawSpent + EXPRESS_RENAME_COST));
        window.dispatchEvent(new CustomEvent('hoot_feathers_updated'));
      }
      setProfile((prev) => ({ ...prev, lastUsernameChangeAt: undefined }));
      return { success: true };
    },
    []
  );

  const setActiveTitle = useCallback((title: string) => {
    setProfile((prev) => ({ ...prev, title }));
  }, []);

  const setActiveFrame = useCallback((frameId: string) => {
    setProfile((prev) => ({ ...prev, activeFrame: frameId }));
  }, []);

  const unlockShopItem = useCallback(
    (
      type: 'avatar' | 'title' | 'frame',
      itemId: string,
      cost: number,
      spendFeathersFn: (amount: number) => boolean
    ): { success: boolean; error?: string } => {
      const success = spendFeathersFn(cost);
      if (!success) {
        return { success: false, error: 'Solde de Plumes d’Or insuffisant !' };
      }

      setProfile((prev) => {
        if (type === 'avatar') {
          const unlocked = prev.unlockedAvatars ? [...prev.unlockedAvatars] : [];
          if (!unlocked.includes(itemId as IndieAvatarId)) {
            unlocked.push(itemId as IndieAvatarId);
          }
          return {
            ...prev,
            unlockedAvatars: unlocked,
            avatarId: itemId as IndieAvatarId,
          };
        }
        if (type === 'title') {
          const unlocked = prev.unlockedTitles ? [...prev.unlockedTitles] : [];
          if (!unlocked.includes(itemId)) {
            unlocked.push(itemId);
          }
          const matchingShop = SHOP_TITLES.find((t) => t.id === itemId);
          const titleLabel = matchingShop ? matchingShop.name : itemId;
          return {
            ...prev,
            unlockedTitles: unlocked,
            title: titleLabel,
          };
        }
        if (type === 'frame') {
          const unlocked = prev.unlockedFrames ? [...prev.unlockedFrames] : ['frame_wood'];
          if (!unlocked.includes(itemId)) {
            unlocked.push(itemId);
          }
          return {
            ...prev,
            unlockedFrames: unlocked,
            activeFrame: itemId,
          };
        }
        return prev;
      });

      return { success: true };
    },
    []
  );

  const recordVersusResult = useCallback((isWin: boolean, opponentRating = 1000) => {
    setProfile((prev) => {
      const cur = prev.versusStats || { matchesPlayed: 0, matchesWon: 0, currentStreak: 0, bestStreak: 0, eloRating: 1000 };
      const kFactor = 32;
      const expected = 1 / (1 + Math.pow(10, (opponentRating - cur.eloRating) / 400));
      const actual = isWin ? 1 : 0;
      const newRating = Math.max(100, Math.round(cur.eloRating + kFactor * (actual - expected)));
      const newStreak = isWin ? cur.currentStreak + 1 : 0;
      const bestStreak = Math.max(cur.bestStreak, newStreak);

      return {
        ...prev,
        versusStats: {
          matchesPlayed: cur.matchesPlayed + 1,
          matchesWon: cur.matchesWon + (isWin ? 1 : 0),
          currentStreak: newStreak,
          bestStreak,
          eloRating: newRating,
        },
      };
    });
  }, []);

  return {
    profile,
    setProfile,
    isCreator,
    isAdmin,
    isModerator,
    updateProfile,
    setAvatar,
    renameCooldown,
    setUsername,
    bypassRenameCooldown,
    setActiveTitle,
    setActiveFrame,
    unlockShopItem,
    recordVersusResult,
  };
}
