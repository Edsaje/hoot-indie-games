/**
 * 🦉 Hoot Indie Games — Service de Synchronisation Cloud Souverain
 * Permet de synchroniser les plumes d'or, records, succès et profils entre tous les appareils d'un joueur.
 */

import { ACHIEVEMENTS_LIST } from '../data/achievements';

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
  cardCollection?: Record<string, { count: number; countHolo: number; firstObtainedAt?: string }>;
  lastDailyBoosterClaim?: string;
  dailyGameStates?: Record<string, any>;
  syncedAt?: string;
}

const STORAGE_BONUS_FEATHERS = 'hoot_bonus_feathers_v1';
const STORAGE_SPENT_FEATHERS = 'hoot_spent_feathers_v1';
const STORAGE_CLAIMED_DAILY = 'hoot_claimed_daily_feathers_v1';
const STORAGE_ACHIEVEMENTS = 'hoot_achievements_v1';
const STORAGE_GAME_STATS = 'hoot_game_stats_v1';
const STORAGE_INDIE_STATS = 'hoot_indie_stats_v1';
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
 * Définit ou importe manuellement une clé de synchronisation cloud existante
 */
export function setCloudSyncKey(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem(STORAGE_SYNC_KEY, clean);
  }
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
    let parsedAch: string[] = [];
    if (rawAch) {
      try {
        const parsed = JSON.parse(rawAch);
        if (Array.isArray(parsed)) {
          parsedAch = parsed;
        } else if (parsed && typeof parsed === 'object') {
          parsedAch = Object.keys(parsed);
        }
      } catch {
        parsedAch = [];
      }
    }
    const validAchSet = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
    const cleanAchievements = Array.from(new Set(parsedAch.filter((id) => validAchSet.has(id))));

    const rawStats = localStorage.getItem(STORAGE_INDIE_STATS) || localStorage.getItem(STORAGE_GAME_STATS);
    const stats = rawStats ? JSON.parse(rawStats) : {};

    // Collecter l'historique complet du calendrier de tous les mini-jeux quotidiens
    const dailyGameStates: Record<string, any> = {};
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
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && modePrefixes.some((p) => k.startsWith(p))) {
        try {
          const val = localStorage.getItem(k);
          if (val) {
            dailyGameStates[k] = JSON.parse(val);
          }
        } catch {}
      }
    }

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
      achievements: cleanAchievements,
      stats,
      dailyGameStates,
      timeAttackStats,
      versusStats: profile.versusStats,
      cardCollection: (() => {
        try {
          const raw = localStorage.getItem('hoot_cards_collection_v1');
          return raw ? JSON.parse(raw) : undefined;
        } catch {
          return undefined;
        }
      })(),
      lastDailyBoosterClaim: localStorage.getItem('hoot_last_daily_booster_claim_v1') || undefined,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[UserCloudSync] Erreur lors de la collecte locale:', err);
    return {};
  }
}

/**
 * /**
 * Applique une sauvegarde cloud dans le localStorage local
 * @param cloudData Données reçues du serveur
 * @param options Stratégie : 'replace' pour connexion à un compte existant (isolation étanche PC partagé), 'merge' pour nouvelle inscription ou fusion
 */
export function applyCloudSaveToLocalStorage(
  cloudData: UserCloudSavePayload,
  options?: { strategy?: 'merge' | 'replace' }
): void {
  if (typeof window === 'undefined' || !window.localStorage || !cloudData) return;
  const isReplace = options?.strategy === 'replace';

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
        if (isReplace) {
          localStorage.setItem(STORAGE_CLAIMED_DAILY, JSON.stringify(cloudData.feathers.claimedDaily));
        } else {
          const localRaw = localStorage.getItem(STORAGE_CLAIMED_DAILY);
          let localClaimed: Record<string, any> = {};
          if (localRaw) {
            try {
              const parsed = JSON.parse(localRaw);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                localClaimed = parsed;
              }
            } catch {}
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
    }

    // 2. Succès débloqués
    if (Array.isArray(cloudData.achievements)) {
      const validAchSet = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
      if (isReplace) {
        const cleanAchievements = cloudData.achievements.filter((id) => validAchSet.has(id));
        localStorage.setItem('hoot_unlocked_achievements_v1', JSON.stringify(cleanAchievements));
      } else {
        const existingAchRaw = localStorage.getItem('hoot_unlocked_achievements_v1') || localStorage.getItem(STORAGE_ACHIEVEMENTS);
        let existingAch: string[] = [];
        if (existingAchRaw) {
          try {
            const parsed = JSON.parse(existingAchRaw);
            if (Array.isArray(parsed)) existingAch = parsed;
            else if (parsed && typeof parsed === 'object') existingAch = Object.keys(parsed);
          } catch {
            existingAch = [];
          }
        }
        const mergedAch = Array.from(
          new Set([...existingAch, ...cloudData.achievements])
        ).filter((id) => validAchSet.has(id));
        localStorage.setItem('hoot_unlocked_achievements_v1', JSON.stringify(mergedAch));
      }
      try {
        localStorage.removeItem(STORAGE_ACHIEVEMENTS);
      } catch {}
    }

    // 3. Stats des jeux (8 mini-jeux & séries de victoires)
    if (cloudData.stats && typeof cloudData.stats === 'object' && Object.keys(cloudData.stats).length > 0) {
      if (isReplace) {
        localStorage.setItem(STORAGE_INDIE_STATS, JSON.stringify(cloudData.stats));
        localStorage.setItem(STORAGE_GAME_STATS, JSON.stringify(cloudData.stats));
        window.dispatchEvent(new CustomEvent('hoot_stats_updated', { detail: cloudData.stats }));
      } else {
        const existingStatsRaw = localStorage.getItem(STORAGE_INDIE_STATS) || localStorage.getItem(STORAGE_GAME_STATS);
        const existingStats = existingStatsRaw ? JSON.parse(existingStatsRaw) : {};
        const modes = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'];

        let isModeBased = false;
        for (const m of modes) {
          if (cloudData.stats[m] || existingStats[m]) {
            isModeBased = true;
            break;
          }
        }

        let mergedStats: any = {};
        if (isModeBased) {
          mergedStats = { ...existingStats };
          for (const m of modes) {
            const exM = existingStats[m] || {};
            const cM = cloudData.stats[m] || {};
            const dist = { ...(exM.guessDistribution || {}) };
            if (cM.guessDistribution && typeof cM.guessDistribution === 'object') {
              for (const [guesses, count] of Object.entries(cM.guessDistribution)) {
                dist[guesses] = Math.max(Number(dist[guesses] || 0), Number(count || 0));
              }
            }
            mergedStats[m] = {
              ...exM,
              ...cM,
              played: Math.max(Number(exM.played || 0), Number(cM.played || 0)),
              won: Math.max(Number(exM.won || 0), Number(cM.won || 0)),
              currentStreak: Math.max(Number(exM.currentStreak || 0), Number(cM.currentStreak || 0)),
              maxStreak: Math.max(Number(exM.maxStreak || 0), Number(cM.maxStreak || 0)),
              guessDistribution: dist,
              lastPlayedDate: (exM.lastPlayedDate || '') > (cM.lastPlayedDate || '') ? exM.lastPlayedDate : (cM.lastPlayedDate || ''),
              lastWonDate: (exM.lastWonDate || '') > (cM.lastWonDate || '') ? exM.lastWonDate : (cM.lastWonDate || ''),
              streakRescued: Boolean(exM.streakRescued || cM.streakRescued),
            };
          }
        } else {
          mergedStats = {
            ...existingStats,
            ...cloudData.stats,
            gamesPlayed: Math.max(existingStats.gamesPlayed || 0, cloudData.stats.gamesPlayed || 0),
            gamesWon: Math.max(existingStats.gamesWon || 0, cloudData.stats.gamesWon || 0),
            currentStreak: Math.max(existingStats.currentStreak || 0, cloudData.stats.currentStreak || 0),
            maxStreak: Math.max(existingStats.maxStreak || 0, cloudData.stats.maxStreak || 0),
          };
        }
        localStorage.setItem(STORAGE_INDIE_STATS, JSON.stringify(mergedStats));
        localStorage.setItem(STORAGE_GAME_STATS, JSON.stringify(mergedStats));
        window.dispatchEvent(new CustomEvent('hoot_stats_updated', { detail: mergedStats }));
      }
    }

    // 3b. Historique Quotidien du Calendrier (Daily Game States)
    if (isReplace) {
      // Nettoyage complet des puzzles résolus locaux pour charger strictement ceux du compte connecté
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

      if (cloudData.dailyGameStates && typeof cloudData.dailyGameStates === 'object') {
        for (const [stateKey, cloudState] of Object.entries(cloudData.dailyGameStates)) {
          if (cloudState && typeof cloudState === 'object') {
            localStorage.setItem(stateKey, JSON.stringify(cloudState));
          }
        }
      }
      window.dispatchEvent(new CustomEvent('hoot_daily_states_updated'));
    } else if (cloudData.dailyGameStates && typeof cloudData.dailyGameStates === 'object') {
      let hasDailyChanges = false;
      for (const [stateKey, cloudState] of Object.entries(cloudData.dailyGameStates)) {
        if (!cloudState || typeof cloudState !== 'object') continue;
        const localRaw = localStorage.getItem(stateKey);
        if (!localRaw) {
          localStorage.setItem(stateKey, JSON.stringify(cloudState));
          hasDailyChanges = true;
        } else {
          try {
            const localState = JSON.parse(localRaw);
            const isWon = Boolean(localState.isWon || (cloudState as any).isWon);
            const isCompleted = Boolean(localState.isCompleted || (cloudState as any).isCompleted);
            const localGuesses = Array.isArray(localState.guesses) ? localState.guesses : [];
            const cloudGuesses = Array.isArray((cloudState as any).guesses) ? (cloudState as any).guesses : [];
            const guesses = cloudGuesses.length >= localGuesses.length ? cloudGuesses : localGuesses;
            const mergedDailyState = {
              ...localState,
              ...(cloudState as any),
              isWon,
              isCompleted,
              guesses,
            };
            localStorage.setItem(stateKey, JSON.stringify(mergedDailyState));
            hasDailyChanges = true;
          } catch {
            localStorage.setItem(stateKey, JSON.stringify(cloudState));
            hasDailyChanges = true;
          }
        }
      }
      if (hasDailyChanges) {
        window.dispatchEvent(new CustomEvent('hoot_daily_states_updated'));
      }
    }

    // 4. Time Attack
    if (cloudData.timeAttackStats && Object.keys(cloudData.timeAttackStats).length > 0) {
      if (isReplace) {
        localStorage.setItem(STORAGE_TIME_ATTACK, JSON.stringify(cloudData.timeAttackStats));
      } else {
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
    }

    // 5. Profil utilisateur
    const rawProfile = localStorage.getItem(STORAGE_USER_PROFILE);
    if (rawProfile) {
      const currentProfile = JSON.parse(rawProfile);
      const mergedAvatars = isReplace
        ? (cloudData.unlockedAvatars || ['owl'])
        : Array.from(new Set([...(currentProfile.unlockedAvatars || []), ...(cloudData.unlockedAvatars || [])]));
      const mergedTitles = isReplace
        ? (cloudData.unlockedTitles || ['Oisillon du Perchoir'])
        : Array.from(new Set([...(currentProfile.unlockedTitles || []), ...(cloudData.unlockedTitles || [])]));
      const mergedFrames = isReplace
        ? (cloudData.unlockedFrames || ['frame_wood'])
        : Array.from(new Set([...(currentProfile.unlockedFrames || []), ...(cloudData.unlockedFrames || [])]));

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

    // 6. Collection de cartes
    if (cloudData.cardCollection && typeof cloudData.cardCollection === 'object') {
      if (isReplace) {
        localStorage.setItem('hoot_cards_collection_v1', JSON.stringify(cloudData.cardCollection));
        window.dispatchEvent(new CustomEvent('hoot_cards_updated', { detail: cloudData.cardCollection }));
      } else {
        try {
          const localCardsRaw = localStorage.getItem('hoot_cards_collection_v1');
          const localCards = localCardsRaw ? JSON.parse(localCardsRaw) : {};
          const mergedCards: Record<string, any> = { ...localCards };

          for (const [cardId, cloudEntry] of Object.entries(cloudData.cardCollection)) {
            const localEntry = mergedCards[cardId] || { count: 0, countHolo: 0 };
            mergedCards[cardId] = {
              count: Math.max(localEntry.count || 0, (cloudEntry as any).count || 0),
              countHolo: Math.max(localEntry.countHolo || 0, (cloudEntry as any).countHolo || 0),
              firstObtainedAt: localEntry.firstObtainedAt || (cloudEntry as any).firstObtainedAt || new Date().toISOString(),
            };
          }
          localStorage.setItem('hoot_cards_collection_v1', JSON.stringify(mergedCards));
          window.dispatchEvent(new CustomEvent('hoot_cards_updated', { detail: mergedCards }));
        } catch {}
      }
    }
    if (cloudData.lastDailyBoosterClaim) {
      if (isReplace) {
        localStorage.setItem('hoot_last_daily_booster_claim_v1', cloudData.lastDailyBoosterClaim);
      } else {
        try {
          const localClaim = localStorage.getItem('hoot_last_daily_booster_claim_v1');
          if (!localClaim || cloudData.lastDailyBoosterClaim > localClaim) {
            localStorage.setItem('hoot_last_daily_booster_claim_v1', cloudData.lastDailyBoosterClaim);
          }
        } catch {}
      }
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

  const adminKey = typeof localStorage !== 'undefined' ? localStorage.getItem('hoot_admin_key') || '' : '';

  const url = `/api/user_cloud_sync.php?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(adminKey ? { 'X-Admin-Key': adminKey } : {}),
      ...(syncKey ? { 'X-Sync-Key': syncKey } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Erreur ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // Ignorer si non JSON
    }
    throw new Error(errorMsg);
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

  const adminKey = typeof localStorage !== 'undefined' ? localStorage.getItem('hoot_admin_key') || '' : '';

  const url = `/api/user_cloud_sync.php?${params.toString()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(adminKey ? { 'X-Admin-Key': adminKey } : {}),
      ...(syncKey ? { 'X-Sync-Key': syncKey } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMsg = `Erreur ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // Ignorer si non JSON
    }
    throw new Error(errorMsg);
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
    stats: data.stats,
    dailyCount: Object.keys(data.dailyGameStates || {}).length,
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
  options?: { force?: boolean; strategy?: 'merge' | 'replace' }
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
      const isReplace = options?.strategy === 'replace';

      // 1. Récupération des données distantes
      const cloudRes = await fetchUserCloudSave(identifiers);

      // Si des données distantes existent et qu'on est en mode replace (connexion à un compte existant sur PC partagé)
      if (cloudRes.success && cloudRes.exists && cloudRes.data && isReplace) {
        applyCloudSaveToLocalStorage(cloudRes.data, { strategy: 'replace' });
        lastSyncTimestamp = Date.now();
        lastSyncedDataHash = computeSaveFingerprint(cloudRes.data);
        return {
          success: true,
          message: 'Compte chargé depuis le Cloud Souverain !',
          data: cloudRes.data,
        };
      }

      // Si des données distantes existent en mode merge
      if (cloudRes.success && cloudRes.exists && cloudRes.data) {
        applyCloudSaveToLocalStorage(cloudRes.data, { strategy: 'merge' });
      }

      // 3. On envoie l'état local fusionné au serveur pour persistance
      const updatedLocal = gatherLocalSaveData();
      const pushRes = await pushUserCloudSave(identifiers, updatedLocal);

      lastSyncTimestamp = Date.now();
      lastSyncedDataHash = computeSaveFingerprint(updatedLocal);

      if (pushRes.success && pushRes.data) {
        applyCloudSaveToLocalStorage(pushRes.data, { strategy: 'merge' });
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
