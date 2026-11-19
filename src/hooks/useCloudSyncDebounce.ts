/**
 * 🦉 Hoot Indie Games — Hook Modulaire d'Orchestration et Débouncage de Sauvegarde Cloud
 * Écoute l'ensemble des événements de jeu du site et garantit l'auto-sync et la persistance sans perte.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { UserProfile } from '../types/user';
import { ADMIN_STEAM_ID } from '../utils/usernameValidation';
import { syncUserCloudSave, forcePushOdysseyReset } from '../services/userCloudSyncService';

export function useCloudSyncDebounce(
  profile: UserProfile,
  isAuthenticated: boolean,
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>
) {
  const syncTimerRef = useRef<any>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const DEBOUNCE_INTERVAL_MS = 3500;

  const triggerSync = useCallback(
    (force = false) => {
      const steamId = profile.steam?.steamId;
      const userId = profile.id;
      const username = profile.username;
      const hasValidIdentity = Boolean(steamId || (username && username !== 'Hibou Mystère') || isAuthenticated);

      if (!hasValidIdentity) return;

      lastSyncTimeRef.current = Date.now();
      syncUserCloudSave({ steamId, userId, username }, { force }).catch(() => {});
    },
    [profile.steam?.steamId, profile.id, profile.username, isAuthenticated]
  );

  // Synchronisation manuelle déclenchable par l'UI (ex: bouton dans ProfileModal)
  const syncCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const steamId = profile.steam?.steamId;
    const userId = profile.id;
    const username = profile.username;
    return syncUserCloudSave({ steamId, userId, username }, { force: true, strategy: 'merge' });
  }, [profile.steam?.steamId, profile.id, profile.username]);

  // Synchronisation automatique au premier chargement
  const hasInitialSyncedRef = useRef(false);
  useEffect(() => {
    const steamId = profile.steam?.steamId;
    const username = profile.username;
    const hasValidIdentity = Boolean(steamId || (username && username !== 'Hibou Mystère') || isAuthenticated);

    if (hasValidIdentity && !hasInitialSyncedRef.current) {
      hasInitialSyncedRef.current = true;
      syncUserCloudSave({ steamId, userId: profile.id, username }).catch(() => {});
    }
  }, [isAuthenticated, profile.steam?.steamId, profile.id, profile.username]);

  // Écoute de la restauration cloud distante
  useEffect(() => {
    const handleCloudRestored = (e: any) => {
      const cloudData = e.detail;
      if (!cloudData) return;
      setProfile((prev) => {
        const isOfficialAdmin = Boolean(
          (cloudData.steamId && String(cloudData.steamId).trim() === ADMIN_STEAM_ID) ||
          (prev.steam?.steamId && String(prev.steam.steamId).trim() === ADMIN_STEAM_ID) ||
          (prev.email && prev.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr')
        );
        return {
          ...prev,
          username: isOfficialAdmin
            ? 'Hibouxe'
            : cloudData.username && cloudData.username !== 'Hibou Mystère' && !cloudData.username.startsWith('Explorateur_')
            ? cloudData.username
            : prev.username,
          avatarId: (cloudData.avatarId as any) || (isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId),
          title: cloudData.title || (isOfficialAdmin ? '👑 Créateur du Site' : prev.title),
          isAdmin: isOfficialAdmin ? true : prev.isAdmin,
          role: isOfficialAdmin ? 'admin' : prev.role,
          activeFrame: cloudData.activeFrame || prev.activeFrame,
          unlockedAvatars: cloudData.unlockedAvatars || prev.unlockedAvatars,
          unlockedTitles: cloudData.unlockedTitles || prev.unlockedTitles,
          unlockedFrames: cloudData.unlockedFrames || prev.unlockedFrames,
          isCloudSynced: true,
        };
      });
    };

    window.addEventListener('hoot_cloud_save_restored', handleCloudRestored as any);
    return () => {
      window.removeEventListener('hoot_cloud_save_restored', handleCloudRestored as any);
    };
  }, [setProfile]);

  // Écoute réactive centralisée des 14 événements du site avec debounce
  useEffect(() => {
    const scheduleDebouncedSync = () => {
      clearTimeout(syncTimerRef.current);
      const elapsed = Date.now() - lastSyncTimeRef.current;
      if (elapsed > DEBOUNCE_INTERVAL_MS * 4) {
        syncTimerRef.current = setTimeout(() => triggerSync(false), 800);
      } else {
        syncTimerRef.current = setTimeout(() => triggerSync(false), DEBOUNCE_INTERVAL_MS);
      }
    };

    const handleGameEvent = (e: any) => {
      if (e?.detail?.fromCloud) return;

      if (e?.type === 'hoot_odyssey_updated' && e?.detail?.reset) {
        clearTimeout(syncTimerRef.current);
        const steamId = profile.steam?.steamId;
        const userId = profile.id;
        const username = profile.username;
        if (steamId || userId || (username && username !== 'Hibou Mystère') || isAuthenticated) {
          forcePushOdysseyReset({ steamId, userId, username }, e.detail).catch(() => {});
        }
        return;
      }

      scheduleDebouncedSync();
    };

    const handleImmediateFlush = () => {
      clearTimeout(syncTimerRef.current);
      triggerSync(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleImmediateFlush();
      }
    };

    const eventsToListen = [
      'hoot_owned_games_updated',
      'hoot_feathers_updated',
      'hoot_cards_updated',
      'hoot_card_collection_updated',
      'hoot_daily_booster_claimed',
      'hoot_free_boosters_updated',
      'hoot_daily_game_completed',
      'hoot_daily_states_updated',
      'hoot_stats_updated',
      'hoot_achievements_updated',
      'hoot_backlog_updated',
      'hoot_liked_games_updated',
      'hoot_arcade_updated',
      'hoot_quiz_updated',
      'hoot_odyssey_updated',
    ];

    eventsToListen.forEach((ev) => window.addEventListener(ev, handleGameEvent as any));
    window.addEventListener('beforeunload', handleImmediateFlush);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(syncTimerRef.current);
      eventsToListen.forEach((ev) => window.removeEventListener(ev, handleGameEvent as any));
      window.removeEventListener('beforeunload', handleImmediateFlush);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [triggerSync, profile.steam?.steamId, profile.id, profile.username, isAuthenticated]);

  return {
    syncCloud,
  };
}
