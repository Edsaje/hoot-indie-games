import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, IndieAvatarId, AccountSaveData, SteamAccountInfo } from '../types/user';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  buildSteamOpenIdUrl,
  extractSteamIdFromOpenId,
  getAppIdFromSteamUrl,
  resolveSteamAccount,
  fetchSteamOwnedGames,
} from '../services/steamService';
import {
  ADMIN_STEAM_ID,
  validateUsernameFormat,
  claimUsernameOnServer,
} from '../utils/usernameValidation';
import { updateLeaderboardPlayerProfile } from '../services/leaderboardService';
import { UserAccountContext } from './UserAccountContext';
import {
  getRenameCooldownInfo,
  EXPRESS_RENAME_COST,
  SHOP_TITLES,
} from '../utils/featherEconomy';
import { syncUserCloudSave } from '../services/userCloudSyncService';

const STORAGE_KEY = 'hoot_user_profile_v1';

function getDefaultProfile(): UserProfile {
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

export const UserAccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const safeAvatar = parsed.avatarId === 'hibouxe_creator' ? 'owl' : (parsed.avatarId || 'owl');
        return {
          ...getDefaultProfile(),
          ...parsed,
          isAdmin: false,
          role: 'user',
          avatarId: safeAvatar,
        };
      }
    } catch {
      // Fallback
    }
    return getDefaultProfile();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email || parsed.steam?.steamId || parsed.isCloudSynced) {
          return true;
        }
      }
    } catch {
      // Fallback
    }
    return false;
  });

  // Sauvegarde locale automatique
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  }, [profile]);

  const hasInitialSyncedRef = useRef(false);

  // Synchronisation Cloud Souverain automatique au chargement initial et lors de l'authentification
  useEffect(() => {
    const steamId = profile.steam?.steamId;
    const username = profile.username;
    const hasValidIdentity = Boolean(steamId || (username && username !== 'Hibou Mystère') || isAuthenticated);

    if (hasValidIdentity && !hasInitialSyncedRef.current) {
      hasInitialSyncedRef.current = true;
      syncUserCloudSave({ steamId, userId: profile.id, username }).then((res) => {
        if (res.success && res.data) {
          const cloudData = res.data;
          const isOfficialAdmin = steamId === ADMIN_STEAM_ID;
          setProfile((prev) => ({
            ...prev,
            username: cloudData.username && cloudData.username !== 'Hibou Mystère' ? cloudData.username : prev.username,
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

    const handleCloudRestored = (e: any) => {
      const cloudData = e.detail;
      if (!cloudData) return;
      setProfile((prev) => ({
        ...prev,
        username: cloudData.username && cloudData.username !== 'Hibou Mystère' ? cloudData.username : prev.username,
        avatarId: cloudData.avatarId || prev.avatarId,
        title: cloudData.title || prev.title,
        activeFrame: cloudData.activeFrame || prev.activeFrame,
        unlockedAvatars: cloudData.unlockedAvatars || prev.unlockedAvatars,
        unlockedTitles: cloudData.unlockedTitles || prev.unlockedTitles,
        unlockedFrames: cloudData.unlockedFrames || prev.unlockedFrames,
        isCloudSynced: true,
      }));
    };

    window.addEventListener('hoot_cloud_save_restored', handleCloudRestored as any);
    return () => {
      window.removeEventListener('hoot_cloud_save_restored', handleCloudRestored as any);
    };
  }, [isAuthenticated, profile.steam?.steamId]);

  // Sauvegarde automatique cloud lors d'achats ou de récolte de plumes
  useEffect(() => {
    let timer: any = null;
    const handleFeathersChanged = (e: any) => {
      // Éviter la boucle infinie si l'événement provient de la synchronisation cloud elle-même
      if (e?.detail?.fromCloud) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        const steamId = profile.steam?.steamId;
        const username = profile.username;
        if (steamId || (username && username !== 'Hibou Mystère')) {
          syncUserCloudSave({ steamId, userId: profile.id, username }).catch(() => {});
        }
      }, 3000);
    };

    window.addEventListener('hoot_feathers_updated', handleFeathersChanged as any);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hoot_feathers_updated', handleFeathersChanged as any);
    };
  }, [profile.steam?.steamId, profile.id, profile.username]);

  // Écoute de session Supabase si configuré
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setProfile((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email,
          isCloudSynced: true,
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setProfile((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email,
          isCloudSynced: true,
        }));
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isUserLoggedIn = isAuthenticated || Boolean(profile.steam?.steamId) || Boolean(profile.email);

  // Détection stricte et inviolable : l'accès administrateur exige impérativement d'être connecté sur un compte admin officiel.
  const isCreator = useMemo(() => {
    if (!isUserLoggedIn) return false;

    // 1. Authentification Steam officielle du créateur
    const isOfficialSteam = Boolean(
      profile.steam?.steamId && String(profile.steam.steamId).trim() === ADMIN_STEAM_ID
    );

    // 2. Authentification par compte vérifié (Supabase/Email) avec rôle admin ou email administrateur officiel
    const isOfficialEmail = Boolean(
      profile.email && profile.email.toLowerCase() === 'quentin.beaud@hotmail.fr'
    );
    const isOfficialCloudAdmin = Boolean(
      isAuthenticated && (profile.role === 'admin' || isOfficialEmail)
    );

    return isOfficialSteam || isOfficialCloudAdmin;
  }, [isUserLoggedIn, profile.steam?.steamId, profile.email, profile.role, isAuthenticated]);

  const isAdmin = isCreator;

  const isModerator = useMemo(() => {
    if (isAdmin || isCreator) return true;
    return profile.role === 'moderator' || profile.isModerator === true;
  }, [isAdmin, isCreator, profile.role, profile.isModerator]);

  // Synchronisation du statut admin & attribution exclusive de l'avatar fondateur
  useEffect(() => {
    if (isCreator) {
      if (!profile.isAdmin || profile.role !== 'admin' || profile.avatarId !== 'hibouxe_creator') {
        setProfile((prev) => ({
          ...prev,
          isAdmin: true,
          role: 'admin',
          avatarId: 'hibouxe_creator',
        }));
      }
    } else {
      // Sécurité stricte : personne d'autre ne peut utiliser cet avatar ni avoir de statut admin
      if (profile.isAdmin || profile.role === 'admin' || profile.avatarId === 'hibouxe_creator') {
        setProfile((prev) => ({
          ...prev,
          isAdmin: false,
          role: prev.role === 'admin' ? (prev.isModerator ? 'moderator' : 'user') : prev.role,
          avatarId: prev.avatarId === 'hibouxe_creator' ? 'owl' : prev.avatarId,
        }));
      }
    }
  }, [isCreator, profile.isAdmin, profile.role, profile.avatarId]);

  // Synchronisation et déclaration automatique de l'identité du joueur sur le serveur souverain
  useEffect(() => {
    const steamId = profile.steam?.steamId;
    const email = profile.email;
    const hasCustomName = profile.username && profile.username !== 'Hibou Mystère';

    // N'enregistrer que si l'utilisateur a une identité réelle (Steam, Email ou pseudo personnalisé)
    if (!steamId && !email && !hasCustomName) {
      return;
    }

    const desiredName =
      (profile.steam?.personaName && profile.steam.personaName !== 'Hibou Mystère')
        ? profile.steam.personaName
        : (hasCustomName ? profile.username : (steamId ? `Joueur Steam #${steamId.slice(-4)}` : null));

    if (!desiredName) return;

    // Déclencher l'enregistrement atomique auprès de l'API /api/usernames.php
    const timer = setTimeout(() => {
      claimUsernameOnServer(desiredName, profile.id, steamId).then((res) => {
        if (res && res.success && res.role) {
          setProfile((prev) => ({
            ...prev,
            role: res.role === 'moderator' ? 'moderator' : (res.role === 'admin' && isCreator ? 'admin' : prev.role),
            isModerator: res.role === 'moderator' || Boolean(res.isModerator),
            customTitle: res.customTitle || prev.customTitle,
          }));
        }
      }).catch(() => {});
    }, 1200);

    return () => clearTimeout(timer);
  }, [profile.steam?.steamId, profile.steam?.personaName, profile.username, profile.email, profile.id, isCreator]);

  const updateProfile = useCallback((fields: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  }, []);

  const setAvatar = useCallback((avatarId: IndieAvatarId) => {
    // Sécurité stricte : personne d'autre que le créateur ne peut utiliser l'avatar officiel
    if (avatarId === 'hibouxe_creator' && !isCreator) {
      return;
    }
    setProfile((prev) => {
      // Synchroniser avec tous les scores enregistrés dans le classement
      updateLeaderboardPlayerProfile(prev.username, avatarId, prev.username).catch(() => {});
      return { ...prev, avatarId };
    });
  }, [isCreator]);

  // Calcul réactif du délai de carence de 14 jours pour le renommage
  const renameCooldown = useMemo(() => {
    return getRenameCooldownInfo(profile.lastUsernameChangeAt, isCreator);
  }, [profile.lastUsernameChangeAt, isCreator]);

  const setUsername = useCallback(
    async (username: string): Promise<{ success: boolean; error?: string }> => {
      // 1. Contrôle du délai de carence (14 jours) pour les comptes non-créateur
      if (!isCreator && !renameCooldown.canChange) {
        return {
          success: false,
          error: `Vous devez attendre encore ${renameCooldown.daysRemaining} jour${
            renameCooldown.daysRemaining > 1 ? 's' : ''
          } (jusqu'au ${renameCooldown.nextChangeDate}) avant de pouvoir modifier votre pseudonyme. Utilisez un Renommage Express dans la boutique pour lever immédiatement ce délai.`,
        };
      }

      const trimmed = username.trim();
      const formatCheck = validateUsernameFormat(trimmed, profile.steam?.steamId, isCreator);
      if (!formatCheck.valid) {
        return { success: false, error: formatCheck.error };
      }

      // Réservation auprès de l'API d'unicité souveraine
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

      // Synchronisation avec le pseudonyme du classement et mise à jour de TOUS les scores du joueur
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hoot_player_nickname', finalName);
      }

      updateLeaderboardPlayerProfile(
        finalName,
        isCreator ? 'hibouxe_creator' : profile.avatarId,
        oldName
      ).catch(() => {});

      return { success: true };
    },
    [profile.id, profile.username, profile.avatarId, profile.steam?.steamId, isCreator, renameCooldown]
  );

  // Déblocage anticipé du délai de 14 jours (Renommage Express)
  const bypassRenameCooldown = useCallback(
    (spendFeathersFn?: (amount: number) => boolean): { success: boolean; error?: string } => {
      if (isCreator || renameCooldown.canChange) {
        return { success: true };
      }
      if (spendFeathersFn) {
        const success = spendFeathersFn(EXPRESS_RENAME_COST);
        if (!success) {
          return {
            success: false,
            error: `Plumes d'or insuffisantes (${EXPRESS_RENAME_COST} plumes requises pour le renommage express).`,
          };
        }
      }
      setProfile((prev) => {
        const copy = { ...prev };
        delete copy.lastUsernameChangeAt;
        return copy;
      });
      return { success: true };
    },
    [isCreator, renameCooldown.canChange]
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
          const titleObj = SHOP_TITLES.find((t) => t.id === itemId);
          return {
            ...prev,
            unlockedTitles: unlocked,
            title: titleObj ? titleObj.name : prev.title,
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

  const recordVersusResult = useCallback((won: boolean, opponentElo = 1000) => {
    setProfile((prev) => {
      const currentElo = prev.versusStats.eloRating;
      const K = 32;
      const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
      const actualScore = won ? 1 : 0;
      const newElo = Math.max(400, Math.round(currentElo + K * (actualScore - expectedScore)));

      const matchesPlayed = prev.versusStats.matchesPlayed + 1;
      const matchesWon = prev.versusStats.matchesWon + (won ? 1 : 0);
      const currentStreak = won ? prev.versusStats.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.versusStats.bestStreak, currentStreak);

      return {
        ...prev,
        versusStats: {
          matchesPlayed,
          matchesWon,
          currentStreak,
          bestStreak,
          eloRating: newElo,
        },
      };
    });
  }, []);

  const exportSaveData = useCallback((): string => {
    const statsStr = localStorage.getItem('hoot_game_stats_v1') || '{}';
    const achStr = localStorage.getItem('hoot_achievements_v1') || '{}';
    const feathersStr = localStorage.getItem('hoot_golden_feathers_v1') || '0';

    const fullSave: AccountSaveData = {
      profile,
      stats: JSON.parse(statsStr),
      achievements: JSON.parse(achStr),
      goldenFeathers: Number(feathersStr),
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(fullSave, null, 2);
  }, [profile]);

  const importSaveData = useCallback((jsonString: string): { success: boolean; error?: string } => {
    try {
      const data: AccountSaveData = JSON.parse(jsonString);
      if (!data.profile || typeof data.goldenFeathers !== 'number') {
        return { success: false, error: 'Format de fichier de sauvegarde invalide.' };
      }

      setProfile(data.profile);
      if (data.stats) {
        localStorage.setItem('hoot_game_stats_v1', JSON.stringify(data.stats));
      }
      if (data.achievements) {
        localStorage.setItem('hoot_achievements_v1', JSON.stringify(data.achievements));
      }
      localStorage.setItem('hoot_golden_feathers_v1', String(data.goldenFeathers));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la lecture du JSON.' };
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const defaultName = email.split('@')[0];
    if (!supabase || !isSupabaseConfigured) {
      // Mode simulation hors-ligne
      setProfile((prev) => ({
        ...prev,
        email,
        username: prev.username === 'Hibou Mystère' ? defaultName : prev.username,
        isCloudSynced: false,
      }));
      setIsAuthenticated(true);
      claimUsernameOnServer(defaultName, profile.id, profile.steam?.steamId).catch(() => {});
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const authUser = data?.user;
    if (authUser) {
      setIsAuthenticated(true);
      setProfile((prev) => ({
        ...prev,
        id: authUser.id,
        email: authUser.email ?? undefined,
        username: prev.username === 'Hibou Mystère' ? defaultName : prev.username,
        isCloudSynced: true,
      }));
      claimUsernameOnServer(defaultName, authUser.id, profile.steam?.steamId).catch(() => {});
    }

    return { success: true };
  }, [profile.id, profile.steam?.steamId]);

  const signUpWithEmail = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const defaultName = email.split('@')[0];
    if (!supabase || !isSupabaseConfigured) {
      setProfile((prev) => ({
        ...prev,
        email,
        username: prev.username === 'Hibou Mystère' ? defaultName : prev.username,
        isCloudSynced: false,
      }));
      setIsAuthenticated(true);
      claimUsernameOnServer(defaultName, profile.id, profile.steam?.steamId).catch(() => {});
      return { success: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const authUser = data?.user;
    if (authUser) {
      setIsAuthenticated(true);
      setProfile((prev) => ({
        ...prev,
        id: authUser.id,
        email: authUser.email ?? undefined,
        username: prev.username === 'Hibou Mystère' ? defaultName : prev.username,
        isCloudSynced: true,
      }));
      claimUsernameOnServer(defaultName, authUser.id, profile.steam?.steamId).catch(() => {});
    }

    return { success: true };
  }, [profile.id, profile.steam?.steamId]);

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      // Mode simulation hors-ligne / démonstration locale
      const guestGoogleEmail = 'joueur.google@hoot.local';
      const chosenName = profile.username && profile.username !== 'Hibou Mystère' ? profile.username : 'Chouette Exploratrice';
      setProfile((prev) => ({
        ...prev,
        email: guestGoogleEmail,
        username: chosenName,
        isCloudSynced: false,
      }));
      setIsAuthenticated(true);
      claimUsernameOnServer(chosenName, profile.id, profile.steam?.steamId).catch(() => {});
      return { success: true };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, [profile.id, profile.username, profile.steam?.steamId]);

  const logout = useCallback(async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setProfile((prev) => ({
      ...prev,
      email: undefined,
      steam: undefined,
      isAdmin: false,
      role: 'user',
      avatarId: prev.avatarId === 'hibouxe_creator' ? 'owl' : prev.avatarId,
      title: prev.title === '👑 Créateur du Site' || prev.title === 'Fondateur du Perchoir' ? 'Oisillon du Perchoir' : prev.title,
      isCloudSynced: false,
    }));
  }, []);

  const syncCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await syncUserCloudSave(
        {
          steamId: profile.steam?.steamId,
          userId: profile.id,
          username: profile.username,
        },
        { force: true }
      );

      if (res.success && res.data) {
        const cloudData = res.data;
        const isOfficialAdmin = profile.steam?.steamId === ADMIN_STEAM_ID;
        setProfile((prev) => ({
          ...prev,
          username: cloudData.username && cloudData.username !== 'Hibou Mystère' ? cloudData.username : prev.username,
          avatarId: (cloudData.avatarId as any) || (isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId),
          title: cloudData.title || (isOfficialAdmin ? '👑 Créateur du Site' : prev.title),
          activeFrame: cloudData.activeFrame || prev.activeFrame,
          unlockedAvatars: (cloudData.unlockedAvatars as any) || prev.unlockedAvatars,
          unlockedTitles: cloudData.unlockedTitles || prev.unlockedTitles,
          unlockedFrames: cloudData.unlockedFrames || prev.unlockedFrames,
          isCloudSynced: true,
        }));
        return { success: true, message: 'Progression synchronisée avec succès sur le Cloud Souverain (OVHcloud) !' };
      }

      return { success: false, message: res.message || 'Échec de synchronisation.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur réseau lors de la synchronisation cloud.' };
    }
  }, [profile.steam, profile.id, profile.username]);

  // =============================================================
  // INTÉGRATION STEAM & SYNCHRONISATION DE LA BIBLIOTHÈQUE
  // =============================================================
  const isSteamConnected = Boolean(profile.steam?.steamId);
  const ownedAppIdsSet = useMemo(
    () => new Set<number>(profile.steam?.ownedAppIds || []),
    [profile.steam?.ownedAppIds]
  );

  const [hideOwnedGames, setHideOwnedGamesState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hoot_hide_owned_games') === 'true';
    } catch {
      return false;
    }
  });

  const setHideOwnedGames = useCallback((hide: boolean) => {
    setHideOwnedGamesState(hide);
    try {
      localStorage.setItem('hoot_hide_owned_games', hide ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }, []);

  const isGameOwned = useCallback(
    (steamUrlOrAppId?: string | number | null): boolean => {
      if (!steamUrlOrAppId) return false;
      if (typeof steamUrlOrAppId === 'number') {
        return ownedAppIdsSet.has(steamUrlOrAppId);
      }
      const appId = getAppIdFromSteamUrl(steamUrlOrAppId);
      return appId ? ownedAppIdsSet.has(appId) : false;
    },
    [ownedAppIdsSet]
  );

  const toggleGameOwned = useCallback((steamUrlOrAppId?: string | number | null) => {
    if (!steamUrlOrAppId) return;
    const appId =
      typeof steamUrlOrAppId === 'number'
        ? steamUrlOrAppId
        : getAppIdFromSteamUrl(steamUrlOrAppId);
    if (!appId) return;

    setProfile((prev) => {
      const currentSteam: SteamAccountInfo = prev.steam || {
        steamId: 'local_steam_' + Math.random().toString(36).slice(2, 8),
        personaName: prev.username,
        profileUrl: '',
        lastSyncedAt: new Date().toISOString(),
        ownedAppIds: [],
        gamesCount: 0,
      };

      const set = new Set(currentSteam.ownedAppIds);
      if (set.has(appId)) {
        set.delete(appId);
      } else {
        set.add(appId);
      }

      const newOwned = Array.from(set);
      return {
        ...prev,
        steam: {
          ...currentSteam,
          ownedAppIds: newOwned,
          gamesCount: Math.max(currentSteam.gamesCount, newOwned.length),
          lastSyncedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const setManualOwnedGames = useCallback((appIds: number[]) => {
    setProfile((prev) => {
      const currentSteam: SteamAccountInfo = prev.steam || {
        steamId: 'local_steam_' + Math.random().toString(36).slice(2, 8),
        personaName: prev.username,
        profileUrl: '',
        lastSyncedAt: new Date().toISOString(),
        ownedAppIds: [],
        gamesCount: 0,
      };
      return {
        ...prev,
        steam: {
          ...currentSteam,
          ownedAppIds: appIds,
          gamesCount: Math.max(currentSteam.gamesCount, appIds.length),
          lastSyncedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const connectSteamWithOpenId = useCallback(() => {
    const url = buildSteamOpenIdUrl();
    if (url) {
      window.location.href = url;
    }
  }, []);

  const connectSteamByIdentifier = useCallback(
    async (
      identifier: string,
      apiKey?: string
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        const details = await resolveSteamAccount(identifier);
        let ownedAppIds: number[] = profile.steam?.ownedAppIds || [];
        let gamesCount = profile.steam?.gamesCount || ownedAppIds.length;

        const keyToUse = apiKey || profile.steam?.apiKey;
        // Appel au proxy souverain Hoot (utilise la Clé Maîtresse si keyToUse est absent)
        const syncRes = await fetchSteamOwnedGames(details.steamId, keyToUse);
        let syncNotice = '';
        if (syncRes.success) {
          ownedAppIds = syncRes.ownedAppIds;
          gamesCount = syncRes.totalCount;
          if (syncRes.player?.personaName) {
            details.personaName = syncRes.player.personaName;
          }
          if (syncRes.player?.avatarUrl) {
            details.avatarUrl = syncRes.player.avatarUrl;
          }
          if (syncRes.player?.profileUrl) {
            details.profileUrl = syncRes.player.profileUrl;
          }
          syncNotice = ` (${ownedAppIds.length} jeux synchronisés)`;
        } else if (syncRes.error === 'PRIVATE_LIBRARY') {
          syncNotice = ' (Note : bibliothèque Steam configurée en Privé)';
        }

        const steamInfo: SteamAccountInfo = {
          steamId: details.steamId,
          personaName: details.personaName,
          profileUrl: details.profileUrl,
          avatarUrl: details.avatarUrl,
          lastSyncedAt: new Date().toISOString(),
          ownedAppIds,
          gamesCount,
          apiKey: keyToUse,
        };

        const isOfficialAdmin = details.steamId === ADMIN_STEAM_ID;
        setProfile((prev) => {
          const targetUsername = prev.username === 'Hibou Mystère' ? details.personaName : prev.username;
          return {
            ...prev,
            steam: steamInfo,
            isAdmin: isOfficialAdmin ? true : prev.isAdmin,
            role: isOfficialAdmin ? 'admin' : prev.role,
            username: targetUsername,
            avatarId: isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId,
            title: isOfficialAdmin ? '👑 Créateur du Site' : prev.title,
          };
        });
        setIsAuthenticated(true);

        // Enregistrement automatique sur le serveur souverain et synchronisation cloud
        claimUsernameOnServer(details.personaName, profile.id, details.steamId).catch(() => {});

        syncUserCloudSave({ steamId: details.steamId, username: details.personaName }, { force: true }).then((syncResCloud) => {
          if (syncResCloud.success && syncResCloud.data) {
            const cloudData = syncResCloud.data;
            setProfile((prev) => ({
              ...prev,
              username: cloudData.username && cloudData.username !== 'Hibou Mystère' ? cloudData.username : prev.username,
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

        return {
          success: true,
          message: `Compte Steam "${details.personaName}" lié avec succès !${syncNotice}`,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Échec de liaison du compte Steam.',
        };
      }
    },
    [profile.id, profile.steam]
  );

  const syncSteamLibrary = useCallback(
    async (
      customApiKey?: string
    ): Promise<{ success: boolean; count?: number; message?: string }> => {
      if (!profile.steam?.steamId) {
        return { success: false, message: 'Aucun compte Steam lié.' };
      }

      const key = customApiKey || profile.steam.apiKey;
      const res = await fetchSteamOwnedGames(profile.steam.steamId, key, true);

      if (res.success) {
        setProfile((prev) => {
          if (!prev.steam) return prev;
          return {
            ...prev,
            steam: {
              ...prev.steam,
              personaName: res.player?.personaName || prev.steam.personaName,
              avatarUrl: res.player?.avatarUrl || prev.steam.avatarUrl,
              profileUrl: res.player?.profileUrl || prev.steam.profileUrl,
              ownedAppIds: res.ownedAppIds,
              gamesCount: res.totalCount,
              lastSyncedAt: new Date().toISOString(),
              apiKey: key || prev.steam.apiKey,
            },
          };
        });
        return { success: true, count: res.ownedAppIds.length, message: res.message };
      }

      return {
        success: false,
        count: 0,
        message: res.message || 'Erreur lors de la synchronisation de la bibliothèque.',
      };
    },
    [profile.steam]
  );

  const disconnectSteam = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      steam: undefined,
    }));
  }, []);

  // Écoute automatique du retour d'authentification Steam OpenID
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const isSteamAuth = searchParams.get('steam_auth');

    if (isSteamAuth) {
      const steamId = extractSteamIdFromOpenId(searchParams);
      if (steamId) {
        connectSteamByIdentifier(steamId);
      }

      // Nettoyage de l'URL pour une expérience propre
      const cleanUrl = new URL(window.location.href);
      const steamParams = [
        'steam_auth',
        'openid.ns',
        'openid.mode',
        'openid.op_endpoint',
        'openid.claimed_id',
        'openid.identity',
        'openid.return_to',
        'openid.response_nonce',
        'openid.assoc_handle',
        'openid.signed',
        'openid.sig',
      ];
      steamParams.forEach((p) => cleanUrl.searchParams.delete(p));
      window.history.replaceState(
        {},
        document.title,
        cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash
      );
    }
  }, [connectSteamByIdentifier]);

    return (
      <UserAccountContext.Provider
        value={{
          profile,
          isAuthenticated: isUserLoggedIn,
          isAdmin,
          isModerator,
          isCreator,
          isSupabaseActive: isSupabaseConfigured,
          updateProfile,
          setAvatar,
          setUsername,
          renameCooldown,
          bypassRenameCooldown,
          setActiveTitle,
          setActiveFrame,
          unlockShopItem,
          recordVersusResult,
          exportSaveData,
          importSaveData,
          loginWithEmail,
          signUpWithEmail,
          loginWithGoogle,
          logout,
          syncCloud,
          steamAccount: profile.steam,
          isSteamConnected,
          ownedAppIdsSet,
          hideOwnedGames,
          setHideOwnedGames,
          connectSteamWithOpenId,
          connectSteamByIdentifier,
          syncSteamLibrary,
          setManualOwnedGames,
          toggleGameOwned,
          isGameOwned,
          disconnectSteam,
        }}
    >
      {children}
    </UserAccountContext.Provider>
  );
};
