/**
 * 🦉 Hoot Indie Games — Hook Modulaire de Gestion des Jeux Possédés
 * Centralise l'état des jeux de la bibliothèque Steam et des ajouts manuels ("J'ai ce jeu").
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { UserProfile, SteamAccountInfo } from '../types/user';
import { getAppIdFromSteamUrl } from '../utils/steamUrl';

export function useOwnedGamesManager(
  profile: UserProfile,
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>
) {
  const [hideOwnedGamesState, setHideOwnedGamesState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hoot_hide_owned_games') === 'true';
    } catch {
      return false;
    }
  });

  const hideOwnedGames = hideOwnedGamesState;

  const setHideOwnedGames = useCallback((hide: boolean) => {
    setHideOwnedGamesState(hide);
    try {
      localStorage.setItem('hoot_hide_owned_games', hide ? 'true' : 'false');
    } catch {}
  }, []);

  const ownedAppIdsSet = useMemo(
    () => new Set<number>(profile.steam?.ownedAppIds || []),
    [profile.steam?.ownedAppIds]
  );

  // Écoute de l'événement de mise à jour des jeux possédés
  useEffect(() => {
    const handleOwnedUpdated = (e: any) => {
      const incomingList: number[] = Array.isArray(e?.detail) ? e.detail : [];
      if (incomingList.length > 0) {
        setProfile((prev) => {
          const curOwned = prev.steam?.ownedAppIds || [];
          const merged = Array.from(new Set([...curOwned, ...incomingList]));
          if (merged.length === curOwned.length) return prev;
          return {
            ...prev,
            steam: {
              ...(prev.steam || {
                steamId: 'local_steam_' + Math.random().toString(36).slice(2, 8),
                personaName: prev.username,
                profileUrl: '',
                lastSyncedAt: new Date().toISOString(),
                gamesCount: 0,
              }),
              ownedAppIds: merged,
              gamesCount: merged.length,
            },
          };
        });
      }
    };

    window.addEventListener('hoot_owned_games_updated', handleOwnedUpdated as any);
    return () => {
      window.removeEventListener('hoot_owned_games_updated', handleOwnedUpdated as any);
    };
  }, [setProfile]);

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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hoot_owned_games_updated', { detail: newOwned }));
      }

      return {
        ...prev,
        steam: {
          ...currentSteam,
          ownedAppIds: newOwned,
          gamesCount: newOwned.length,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    });
  }, [setProfile]);

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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hoot_owned_games_updated', { detail: appIds }));
      }

      return {
        ...prev,
        steam: {
          ...currentSteam,
          ownedAppIds: appIds,
          gamesCount: appIds.length,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    });
  }, [setProfile]);

  return {
    hideOwnedGames,
    setHideOwnedGames,
    ownedAppIdsSet,
    isGameOwned,
    toggleGameOwned,
    setManualOwnedGames,
  };
}
