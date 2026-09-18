import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { UserAccountContext } from './UserAccountContext';

const STORAGE_KEY = 'hoot_user_profile_v1';

function getDefaultProfile(): UserProfile {
  return {
    id: 'local_' + Math.random().toString(36).substring(2, 9),
    username: 'Hibou Mystère',
    avatarId: 'owl',
    title: 'Oisillon du Perchoir',
    createdAt: new Date().toISOString(),
    isCloudSynced: false,
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
        return { ...getDefaultProfile(), ...JSON.parse(saved) };
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

  const updateProfile = useCallback((fields: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  }, []);

  const setAvatar = useCallback((avatarId: IndieAvatarId) => {
    setProfile((prev) => ({ ...prev, avatarId }));
  }, []);

  const setUsername = useCallback((username: string) => {
    const trimmed = username.trim();
    if (trimmed.length > 0) {
      setProfile((prev) => ({ ...prev, username: trimmed }));
    }
  }, []);

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
    if (!supabase || !isSupabaseConfigured) {
      // Mode simulation hors-ligne
      setProfile((prev) => ({
        ...prev,
        email,
        username: email.split('@')[0],
        isCloudSynced: false,
      }));
      setIsAuthenticated(true);
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
        isCloudSynced: true,
      }));
    }

    return { success: true };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      setProfile((prev) => ({
        ...prev,
        email,
        username: email.split('@')[0],
        isCloudSynced: false,
      }));
      setIsAuthenticated(true);
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
        isCloudSynced: true,
      }));
    }

    return { success: true };
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return {
        success: false,
        error: 'La connexion Google nécessite la configuration Supabase (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY).',
      };
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
  }, []);

  const logout = useCallback(async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setProfile((prev) => ({
      ...prev,
      email: undefined,
      steam: undefined,
      isCloudSynced: false,
    }));
  }, []);

  const syncCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return {
        success: true,
        message: 'Sauvegarde locale active (configurez VITE_SUPABASE_URL pour activer le cloud distant).',
      };
    }

    try {
      const payload = {
        user_id: profile.id,
        username: profile.username,
        avatar_id: profile.avatarId,
        versus_stats: profile.versusStats,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      setProfile((prev) => ({ ...prev, isCloudSynced: true }));
      return { success: true, message: 'Synchronisation cloud réussie !' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Échec de synchronisation.' };
    }
  }, [profile]);

  // =============================================================
  // INTÉGRATION STEAM & SYNCHRONISATION DE LA BIBLIOTHÈQUE
  // =============================================================
  const isSteamConnected = Boolean(profile.steam?.steamId);
  const ownedAppIdsSet = useMemo(
    () => new Set<number>(profile.steam?.ownedAppIds || []),
    [profile.steam?.ownedAppIds]
  );

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
        if (keyToUse) {
          const syncRes = await fetchSteamOwnedGames(details.steamId, keyToUse);
          if (syncRes.success) {
            ownedAppIds = syncRes.ownedAppIds;
            gamesCount = syncRes.totalCount;
          }
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

        setProfile((prev) => ({
          ...prev,
          steam: steamInfo,
          username: prev.username === 'Hibou Mystère' ? details.personaName : prev.username,
        }));
        setIsAuthenticated(true);

        return {
          success: true,
          message: `Compte Steam "${details.personaName}" lié avec succès ! (${ownedAppIds.length} jeux synchronisés)`,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Échec de liaison du compte Steam.',
        };
      }
    },
    [profile.steam]
  );

  const syncSteamLibrary = useCallback(
    async (
      customApiKey?: string
    ): Promise<{ success: boolean; count?: number; message?: string }> => {
      if (!profile.steam?.steamId) {
        return { success: false, message: 'Aucun compte Steam lié.' };
      }

      const key = customApiKey || profile.steam.apiKey;
      const res = await fetchSteamOwnedGames(profile.steam.steamId, key);

      if (res.success) {
        setProfile((prev) => {
          if (!prev.steam) return prev;
          return {
            ...prev,
            steam: {
              ...prev.steam,
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

    const isUserLoggedIn = isAuthenticated || Boolean(profile.steam?.steamId) || Boolean(profile.email);

    return (
      <UserAccountContext.Provider
        value={{
          profile,
          isAuthenticated: isUserLoggedIn,
          isSupabaseActive: isSupabaseConfigured,
          updateProfile,
          setAvatar,
          setUsername,
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
