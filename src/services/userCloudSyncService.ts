/**
 * 🦉 Hoot Indie Games — Service de Synchronisation Cloud Souverain
 * Permet de synchroniser les plumes d'or, records, succès et profils entre tous les appareils d'un joueur.
 */

export interface UserCloudSavePayload {
  steamId?: string;
  userId?: string;
  username?: string;
  avatarId?: string;
  title?: string;
  activeFrame?: string;
  unlockedAvatars?: string[];
  unlockedTitles?: string[];
  unlockedFrames?: string[];
  feathers?: {
    bonus: number;
    spent: number;
    claimedDaily: Record<string, any>;
  };
  achievements?: string[];
  stats?: any;
  timeAttackStats?: any;
  versusStats?: any;
  syncedAt?: string;
}

const STORAGE_BONUS_FEATHERS = 'hoot_bonus_feathers_v1';
const STORAGE_SPENT_FEATHERS = 'hoot_spent_feathers_v1';
const STORAGE_CLAIMED_DAILY = 'hoot_claimed_daily_feathers_v1';
const STORAGE_ACHIEVEMENTS = 'hoot_achievements_v1';
const STORAGE_GAME_STATS = 'hoot_game_stats_v1';
const STORAGE_TIME_ATTACK = 'hoot_time_attack_stats_v1';
const STORAGE_USER_PROFILE = 'hoot_user_profile_v1';
const STORAGE_SYNC_KEY = 'hoot_cloud_sync_key_v1';

/**
 * Récupère ou génère une clé cryptographique unique pour sceller la sauvegarde cloud du joueur
 */
export function getOrCreateCloudSyncKey(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '';
  }
  let key = localStorage.getItem(STORAGE_SYNC_KEY);
  if (!key) {
    key = 'sync_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_SYNC_KEY, key);
  }
  return key;
}

/**
 * Récupère l'ensemble des données locales de jeu depuis le localStorage
 */
export function gatherLocalSaveData(): UserCloudSavePayload {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }

  try {
    const rawProfile = localStorage.getItem(STORAGE_USER_PROFILE);
    const profile = rawProfile ? JSON.parse(rawProfile) : {};

    const bonusFromStorage = Number(localStorage.getItem(STORAGE_BONUS_FEATHERS) || '0');
    const legacyFeathers = Number(localStorage.getItem('hoot_golden_feathers_v1') || '0');
    const bonus = Math.max(bonusFromStorage, legacyFeathers);
    const spent = Number(localStorage.getItem(STORAGE_SPENT_FEATHERS) || '0');
    const rawClaimed = localStorage.getItem(STORAGE_CLAIMED_DAILY);
    const claimedDaily = rawClaimed ? JSON.parse(rawClaimed) : {};

    const rawAch = localStorage.getItem('hoot_unlocked_achievements_v1') || localStorage.getItem(STORAGE_ACHIEVEMENTS);
    const achievements = rawAch ? JSON.parse(rawAch) : [];

    const rawStats = localStorage.getItem(STORAGE_GAME_STATS);
    const stats = rawStats ? JSON.parse(rawStats) : {};

    const rawTa = localStorage.getItem(STORAGE_TIME_ATTACK);
    const timeAttackStats = rawTa ? JSON.parse(rawTa) : {};

    return {
      steamId: profile.steam?.steamId,
      userId: profile.id,
      username: profile.username,
      avatarId: profile.avatarId,
      title: profile.title,
      activeFrame: profile.activeFrame,
      unlockedAvatars: profile.unlockedAvatars || [],
      unlockedTitles: profile.unlockedTitles || [],
      unlockedFrames: profile.unlockedFrames || [],
      feathers: {
        bonus,
        spent,
        claimedDaily,
      },
      achievements: Array.isArray(achievements) ? achievements : [],
      stats,
      timeAttackStats,
      versusStats: profile.versusStats,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[UserCloudSync] Erreur lors de la collecte locale:', err);
    return {};
  }
}

/**
 * Applique une sauvegarde cloud dans le localStorage local
 */
export function applyCloudSaveToLocalStorage(cloudData: UserCloudSavePayload): void {
  if (typeof window === 'undefined' || !window.localStorage || !cloudData) return;

  try {
    // 1. Plumes d'Or
    if (cloudData.feathers) {
      if (typeof cloudData.feathers.bonus === 'number') {
        localStorage.setItem(STORAGE_BONUS_FEATHERS, String(cloudData.feathers.bonus));
        localStorage.setItem('hoot_golden_feathers_v1', String(cloudData.feathers.bonus));
      }
      if (typeof cloudData.feathers.spent === 'number') {
        localStorage.setItem(STORAGE_SPENT_FEATHERS, String(cloudData.feathers.spent));
      }
      if (cloudData.feathers.claimedDaily) {
        const localRaw = localStorage.getItem(STORAGE_CLAIMED_DAILY);
        let localClaimed: Record<string, any> = {};
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              localClaimed = parsed;
            }
          } catch {
            // Ignore
          }
        }
        const cloudClaimed =
          cloudData.feathers.claimedDaily &&
          typeof cloudData.feathers.claimedDaily === 'object' &&
          !Array.isArray(cloudData.feathers.claimedDaily)
            ? cloudData.feathers.claimedDaily
            : {};

        const mergedClaimed = { ...localClaimed };
        for (const [dateKey, cloudRecord] of Object.entries(cloudClaimed as Record<string, any>)) {
          if (!mergedClaimed[dateKey]) {
            mergedClaimed[dateKey] = cloudRecord;
          } else {
            const localGames = Array.isArray(mergedClaimed[dateKey].claimedGames)
              ? mergedClaimed[dateKey].claimedGames
              : [];
            const cloudGames = Array.isArray(cloudRecord?.claimedGames)
              ? cloudRecord.claimedGames
              : [];
            mergedClaimed[dateKey] = {
              claimedGames: Array.from(new Set([...localGames, ...cloudGames])),
              grandSlamClaimed: Boolean(
                mergedClaimed[dateKey].grandSlamClaimed || cloudRecord?.grandSlamClaimed
              ),
            };
          }
        }
        localStorage.setItem(STORAGE_CLAIMED_DAILY, JSON.stringify(mergedClaimed));
      }
    }

    // 2. Succès débloqués
    if (Array.isArray(cloudData.achievements) && cloudData.achievements.length > 0) {
      const existingAchRaw = localStorage.getItem('hoot_unlocked_achievements_v1') || localStorage.getItem(STORAGE_ACHIEVEMENTS);
      const existingAch = existingAchRaw ? JSON.parse(existingAchRaw) : [];
      const mergedAch = Array.from(new Set([...existingAch, ...cloudData.achievements]));
      localStorage.setItem('hoot_unlocked_achievements_v1', JSON.stringify(mergedAch));
      localStorage.setItem(STORAGE_ACHIEVEMENTS, JSON.stringify(mergedAch));
    }

    // 3. Stats des jeux
    if (cloudData.stats && Object.keys(cloudData.stats).length > 0) {
      const existingStatsRaw = localStorage.getItem(STORAGE_GAME_STATS);
      const existingStats = existingStatsRaw ? JSON.parse(existingStatsRaw) : {};
      const mergedStats = {
        ...existingStats,
        ...cloudData.stats,
        gamesPlayed: Math.max(existingStats.gamesPlayed || 0, cloudData.stats.gamesPlayed || 0),
        gamesWon: Math.max(existingStats.gamesWon || 0, cloudData.stats.gamesWon || 0),
        currentStreak: Math.max(existingStats.currentStreak || 0, cloudData.stats.currentStreak || 0),
        maxStreak: Math.max(existingStats.maxStreak || 0, cloudData.stats.maxStreak || 0),
      };
      localStorage.setItem(STORAGE_GAME_STATS, JSON.stringify(mergedStats));
    }

    // 4. Time Attack
    if (cloudData.timeAttackStats && Object.keys(cloudData.timeAttackStats).length > 0) {
      const existingTaRaw = localStorage.getItem(STORAGE_TIME_ATTACK);
      const existingTa = existingTaRaw ? JSON.parse(existingTaRaw) : {};
      const mergedTa: Record<string, any> = { ...existingTa };
      for (const [mode, s] of Object.entries(cloudData.timeAttackStats)) {
        const cur = mergedTa[mode] || { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 };
        const inc = s as any;
        mergedTa[mode] = {
          highScore: Math.max(cur.highScore || 0, inc.highScore || 0),
          bestCombo: Math.max(cur.bestCombo || 0, inc.bestCombo || 0),
          gamesPlayed: Math.max(cur.gamesPlayed || 0, inc.gamesPlayed || 0),
          totalAnswered: Math.max(cur.totalAnswered || 0, inc.totalAnswered || 0),
          lastPlayed: inc.lastPlayed || cur.lastPlayed || new Date().toISOString(),
        };
      }
      localStorage.setItem(STORAGE_TIME_ATTACK, JSON.stringify(mergedTa));
    }

    // 5. Profil utilisateur
    const rawProfile = localStorage.getItem(STORAGE_USER_PROFILE);
    if (rawProfile) {
      const currentProfile = JSON.parse(rawProfile);
      const mergedAvatars = Array.from(new Set([...(currentProfile.unlockedAvatars || []), ...(cloudData.unlockedAvatars || [])]));
      const mergedTitles = Array.from(new Set([...(currentProfile.unlockedTitles || []), ...(cloudData.unlockedTitles || [])]));
      const mergedFrames = Array.from(new Set([...(currentProfile.unlockedFrames || []), ...(cloudData.unlockedFrames || [])]));

      const updatedProfile = {
        ...currentProfile,
        username: cloudData.username && cloudData.username !== 'Hibou Mystère' ? cloudData.username : currentProfile.username,
        avatarId: cloudData.avatarId || currentProfile.avatarId,
        title: cloudData.title || currentProfile.title,
        activeFrame: cloudData.activeFrame || currentProfile.activeFrame,
        unlockedAvatars: mergedAvatars,
        unlockedTitles: mergedTitles,
        unlockedFrames: mergedFrames,
        isCloudSynced: true,
      };
      localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updatedProfile));
    }

    // Déclenchement d'un événement global pour notifier tous les providers et composants React
    window.dispatchEvent(new CustomEvent('hoot_cloud_save_restored', { detail: cloudData }));
    // Signaler la mise à jour des plumes avec le flag 'fromCloud: true' pour éviter la boucle infinie de re-synchronisation
    window.dispatchEvent(new CustomEvent('hoot_feathers_updated', { detail: { fromCloud: true } }));
  } catch (err) {
    console.warn('[UserCloudSync] Erreur lors de l’application locale:', err);
  }
}

/**
 * Charge la sauvegarde cloud distante pour un utilisateur
 */
export async function fetchUserCloudSave(identifiers: {
  steamId?: string;
  userId?: string;
  username?: string;
}): Promise<{ success: boolean; exists: boolean; data?: UserCloudSavePayload; message?: string }> {
  const params = new URLSearchParams();
  if (identifiers.steamId) params.append('steamId', identifiers.steamId);
  if (identifiers.userId) params.append('userId', identifiers.userId);
  if (identifiers.username) params.append('username', identifiers.username);
  const syncKey = getOrCreateCloudSyncKey();
  if (syncKey) params.append('syncKey', syncKey);
  params.append('action', 'load');
  params.append('t', String(Date.now()));

  const url = `/api/user_cloud_sync.php?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Envoie une sauvegarde vers le cloud distant
 */
export async function pushUserCloudSave(
  identifiers: { steamId?: string; userId?: string; username?: string },
  payload: UserCloudSavePayload
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  const params = new URLSearchParams();
  if (identifiers.steamId) params.append('steamId', identifiers.steamId);
  if (identifiers.userId) params.append('userId', identifiers.userId);
  if (identifiers.username) params.append('username', identifiers.username);
  const syncKey = getOrCreateCloudSyncKey();
  if (syncKey) params.append('syncKey', syncKey);
  params.append('action', 'save');

  const url = `/api/user_cloud_sync.php?${params.toString()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

let inFlightSyncPromise: Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> | null = null;
let lastSyncTimestamp = 0;
let lastSyncedDataHash = '';

function computeSaveFingerprint(data: UserCloudSavePayload): string {
  return JSON.stringify({
    bonus: data.feathers?.bonus,
    spent: data.feathers?.spent,
    claimed: Object.keys(data.feathers?.claimedDaily || {}).length,
    ach: data.achievements?.length,
    username: data.username,
    avatarId: data.avatarId,
    title: data.title,
    frame: data.activeFrame,
    statsGamesPlayed: data.stats?.gamesPlayed,
    taPlayed: Object.keys(data.timeAttackStats || {}).length,
  });
}

/**
 * Exécute une synchronisation bidirectionnelle intelligente
 * Avec dédoublonnage en vol, détection des changements locaux et anti-boucle
 */
export async function syncUserCloudSave(
  identifiers: {
    steamId?: string;
    userId?: string;
    username?: string;
  },
  options?: { force?: boolean }
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  if (!identifiers.steamId && !identifiers.userId && !identifiers.username) {
    return { success: false, message: 'Aucun identifiant utilisateur disponible pour la synchronisation.' };
  }

  // Si une synchronisation est déjà en vol, réutiliser la même promesse pour éviter les requêtes concurrentes
  if (inFlightSyncPromise) {
    return inFlightSyncPromise;
  }

  const now = Date.now();
  const currentLocal = gatherLocalSaveData();
  const currentFingerprint = computeSaveFingerprint(currentLocal);

  // Si la sauvegarde n'est pas forcée, temporiser et vérifier si des données ont réellement changé
  if (!options?.force) {
    // Si rien n'a changé depuis la dernière synchronisation récente (< 60s), ne pas surcharger le réseau
    if (currentFingerprint === lastSyncedDataHash && now - lastSyncTimestamp < 60000) {
      return { success: true, message: 'Données déjà synchronisées.', data: currentLocal };
    }
    // Délai minimum de 5s entre synchronisations automatiques
    if (now - lastSyncTimestamp < 5000) {
      return { success: true, message: 'Synchronisation temporisée.', data: currentLocal };
    }
  }

  inFlightSyncPromise = (async () => {
    try {
      // 1. Récupération des données distantes
      const cloudRes = await fetchUserCloudSave(identifiers);

      // Si des données distantes existent, on les applique d'abord localement
      if (cloudRes.success && cloudRes.exists && cloudRes.data) {
        applyCloudSaveToLocalStorage(cloudRes.data);
      }

      // 3. On envoie l'état local fusionné au serveur pour persistance
      const updatedLocal = gatherLocalSaveData();
      const pushRes = await pushUserCloudSave(identifiers, updatedLocal);

      lastSyncTimestamp = Date.now();
      lastSyncedDataHash = computeSaveFingerprint(updatedLocal);

      if (pushRes.success && pushRes.data) {
        applyCloudSaveToLocalStorage(pushRes.data);
        return { success: true, message: 'Compte synchronisé avec succès sur le Cloud Souverain !', data: pushRes.data };
      }

      return { success: true, message: 'Synchronisation terminée.', data: updatedLocal };
    } catch (err: any) {
      console.warn('[UserCloudSync] Échec synchronisation cloud:', err);
      return { success: false, message: err.message || 'Erreur réseau lors de la synchronisation cloud.' };
    } finally {
      inFlightSyncPromise = null;
    }
  })();

  return inFlightSyncPromise;
}
