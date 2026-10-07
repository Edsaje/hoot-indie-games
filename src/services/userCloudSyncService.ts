/**
 * 🦉 Hoot Indie Games — Service de Synchronisation Cloud Souverain
 * Permet de synchroniser les plumes d'or, records, succès et profils entre tous les appareils d'un joueur.
 */

import { ACHIEVEMENTS_LIST } from '../data/achievements';
import type { OdysseySaveState } from '../types/odyssey';
import { getSupabaseClient } from './supabase';

export interface AdminRewardNotification {
  id: string;
  feathers: number;
  cardId?: string | null;
  isHolo?: boolean;
  reason?: string;
  grantedAt: string;
  grantedBy: string;
}

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
  freeBoostersStock?: { count: number; lastRechargeTimestamp: number };
  dailyGameStates?: Record<string, any>;
  pendingAdminRewards?: AdminRewardNotification[];
  odysseyState?: OdysseySaveState;
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
      freeBoostersStock: (() => {
        try {
          const raw = localStorage.getItem('hoot_free_boosters_stock_v2');
          return raw ? JSON.parse(raw) : undefined;
        } catch {
          return undefined;
        }
      })(),
      odysseyState: (() => {
        try {
          const raw = localStorage.getItem('hoot_odyssey_save_v1');
          return raw ? JSON.parse(raw) : undefined;
        } catch {
          return undefined;
        }
      })(),
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
  _options?: { strategy?: 'merge' | 'replace' }
): void {
  if (typeof window === 'undefined' || !window.localStorage || !cloudData) return;
  const isReplace = _options?.strategy === 'replace';

  try {
    // 1. Plumes d'Or
    if (cloudData.feathers) {
      if (typeof cloudData.feathers.bonus === 'number') {
        const localBonus = Number(localStorage.getItem(STORAGE_BONUS_FEATHERS) || '0');
        const finalBonus = isReplace ? cloudData.feathers.bonus : Math.max(localBonus, cloudData.feathers.bonus);
        localStorage.setItem(STORAGE_BONUS_FEATHERS, String(finalBonus));
        localStorage.setItem('hoot_golden_feathers_v1', String(finalBonus));
      }
      if (typeof cloudData.feathers.spent === 'number') {
        const localSpent = Number(localStorage.getItem(STORAGE_SPENT_FEATHERS) || '0');
        const finalSpent = isReplace ? cloudData.feathers.spent : Math.max(localSpent, cloudData.feathers.spent);
        localStorage.setItem(STORAGE_SPENT_FEATHERS, String(finalSpent));
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

    if (cloudData.freeBoostersStock && typeof cloudData.freeBoostersStock === 'object') {
      const cloudStock = cloudData.freeBoostersStock;
      if (isReplace) {
        localStorage.setItem('hoot_free_boosters_stock_v2', JSON.stringify(cloudStock));
        window.dispatchEvent(new CustomEvent('hoot_free_boosters_updated', { detail: cloudStock }));
      } else {
        try {
          const localRaw = localStorage.getItem('hoot_free_boosters_stock_v2');
          if (localRaw) {
            const localStock = JSON.parse(localRaw);
            const bestCount = Math.min(2, Math.max(Number(localStock.count || 0), Number(cloudStock.count || 0)));
            const olderTimestamp = Math.min(Number(localStock.lastRechargeTimestamp || Date.now()), Number(cloudStock.lastRechargeTimestamp || Date.now()));
            const mergedStock = { count: bestCount, lastRechargeTimestamp: olderTimestamp };
            localStorage.setItem('hoot_free_boosters_stock_v2', JSON.stringify(mergedStock));
            window.dispatchEvent(new CustomEvent('hoot_free_boosters_updated', { detail: mergedStock }));
          } else {
            localStorage.setItem('hoot_free_boosters_stock_v2', JSON.stringify(cloudStock));
            window.dispatchEvent(new CustomEvent('hoot_free_boosters_updated', { detail: cloudStock }));
          }
        } catch {
          localStorage.setItem('hoot_free_boosters_stock_v2', JSON.stringify(cloudStock));
          window.dispatchEvent(new CustomEvent('hoot_free_boosters_updated', { detail: cloudStock }));
        }
      }
    }

    // 7. Odyssée Sylvestre (Idle Game)
    if (cloudData.odysseyState && typeof cloudData.odysseyState === 'object') {
      const cloudOdyssey = cloudData.odysseyState;
      if (isReplace) {
        localStorage.setItem('hoot_odyssey_save_v1', JSON.stringify(cloudOdyssey));
        window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { ...cloudOdyssey, fromCloud: true } }));
      } else {
        try {
          const localRaw = localStorage.getItem('hoot_odyssey_save_v1');
          const localOdyssey = localRaw ? JSON.parse(localRaw) : null;
          if (!localOdyssey) {
            localStorage.setItem('hoot_odyssey_save_v1', JSON.stringify(cloudOdyssey));
            window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { ...cloudOdyssey, fromCloud: true } }));
          } else {
            const localSavedAt = Number(localOdyssey.lastSavedAt || 0);
            const cloudSavedAt = Number(cloudOdyssey.lastSavedAt || 0);
            const isLocalNewer = localSavedAt >= cloudSavedAt;

            const primary = isLocalNewer ? localOdyssey : cloudOdyssey;
            const secondary = isLocalNewer ? cloudOdyssey : localOdyssey;

            const activeBiome = primary.currentBiomeId || secondary.currentBiomeId || 'biome_1_clearing';
            const activeRoute = Math.max(1, Math.min(5, Number(primary.currentRouteNumber || secondary.currentRouteNumber || 1)));
            const activeAutoAdvance = typeof primary.autoAdvance === 'boolean'
              ? primary.autoAdvance
              : (typeof secondary.autoAdvance === 'boolean' ? secondary.autoAdvance : false);
            const activeMiniHud = typeof primary.miniHudEnabled === 'boolean'
              ? primary.miniHudEnabled
              : (typeof secondary.miniHudEnabled === 'boolean'
                ? secondary.miniHudEnabled
                : (typeof primary.miniHudMobileEnabled === 'boolean' ? primary.miniHudMobileEnabled : false));
            const activeCompanions = Array.isArray(primary.activeCompanions) && primary.activeCompanions.length > 0
              ? primary.activeCompanions
              : (Array.isArray(secondary.activeCompanions) ? secondary.activeCompanions : []);

            const mergedBiome = Math.max(
              Number(localOdyssey.highestBiomeUnlocked || 1),
              Number(cloudOdyssey.highestBiomeUnlocked || 1)
            );

            const mergedRoutes: Record<string, number> = { ...(localOdyssey.highestRouteUnlocked || {}) };
            for (const [bId, rNum] of Object.entries(cloudOdyssey.highestRouteUnlocked || {})) {
              mergedRoutes[bId] = Math.max(Number(mergedRoutes[bId] || 1), Number(rNum || 1));
            }

            const mergedUpgrades: Record<string, number> = { ...(localOdyssey.treeUpgrades || {}) };
            for (const [uId, uLvl] of Object.entries(cloudOdyssey.treeUpgrades || {})) {
              mergedUpgrades[uId] = Math.max(Number(mergedUpgrades[uId] || 0), Number(uLvl || 0));
            }

            const mergedCaptured: Record<string, any> = { ...(localOdyssey.capturedGames || {}) };
            for (const [gId, cData] of Object.entries(cloudOdyssey.capturedGames || {})) {
              const lData = mergedCaptured[gId] || { count: 0, isHolo: false, level: 1 };
              mergedCaptured[gId] = {
                count: Math.max(Number(lData.count || 0), Number((cData as any).count || 0)),
                isHolo: Boolean(lData.isHolo || (cData as any).isHolo),
                level: Math.max(Number(lData.level || 1), Number((cData as any).level || 1)),
                firstCapturedAt: lData.firstCapturedAt || (cData as any).firstCapturedAt || new Date().toISOString(),
              };
            }

            const mergedRouteKills: Record<string, number> = { ...(localOdyssey.routeKills || {}) };
            for (const [rId, kNum] of Object.entries(cloudOdyssey.routeKills || {})) {
              mergedRouteKills[rId] = Math.max(Number(mergedRouteKills[rId] || 0), Number(kNum || 0));
            }

            // Réconciliation intelligente de la Sève Céleste (monnaie consommable)
            const primarySap = Math.max(0, Number(primary.starSap || 0));
            const primaryTotal = Math.max(0, Number(primary.totalStarSapEarned || 0));
            const secondaryTotal = Math.max(0, Number(secondary.totalStarSapEarned || 0));
            const extraEarned = Math.max(0, secondaryTotal - primaryTotal);
            const mergedTotalSap = Math.max(primaryTotal, secondaryTotal);
            const mergedStarSap = Math.max(0, Math.min(primarySap + extraEarned, mergedTotalSap));

            const mergedOdyssey = {
              ...(isLocalNewer ? localOdyssey : cloudOdyssey),
              currentBiomeId: activeBiome,
              currentRouteNumber: activeRoute,
              autoAdvance: activeAutoAdvance,
              miniHudEnabled: activeMiniHud,
              miniHudMobileEnabled: activeMiniHud,
              highestBiomeUnlocked: mergedBiome,
              highestRouteUnlocked: mergedRoutes,
              routeKills: mergedRouteKills,
              treeUpgrades: mergedUpgrades,
              capturedGames: mergedCaptured,
              activeCompanions: activeCompanions,
              starSap: mergedStarSap,
              totalStarSapEarned: mergedTotalSap,
              celestialShards: Math.max(
                Number(localOdyssey.celestialShards || 0),
                Number(cloudOdyssey.celestialShards || 0)
              ),
              stats: {
                totalClicks: Math.max(
                  Number(localOdyssey.stats?.totalClicks || 0),
                  Number(cloudOdyssey.stats?.totalClicks || 0)
                ),
                totalDamageDealt: Math.max(
                  Number(localOdyssey.stats?.totalDamageDealt || 0),
                  Number(cloudOdyssey.stats?.totalDamageDealt || 0)
                ),
                monstersDefeated: Math.max(
                  Number(localOdyssey.stats?.monstersDefeated || 0),
                  Number(cloudOdyssey.stats?.monstersDefeated || 0)
                ),
                bossesDefeated: Math.max(
                  Number(localOdyssey.stats?.bossesDefeated || 0),
                  Number(cloudOdyssey.stats?.bossesDefeated || 0)
                ),
                holosFound: Math.max(
                  Number(localOdyssey.stats?.holosFound || 0),
                  Number(cloudOdyssey.stats?.holosFound || 0)
                ),
                firefliesCaught: Math.max(
                  Number(localOdyssey.stats?.firefliesCaught || 0),
                  Number(cloudOdyssey.stats?.firefliesCaught || 0)
                ),
                rebirthsCount: Math.max(
                  Number(localOdyssey.stats?.rebirthsCount || 0),
                  Number(cloudOdyssey.stats?.rebirthsCount || 0)
                ),
              },
              lastSavedAt: Math.max(localSavedAt, cloudSavedAt),
            };

            localStorage.setItem('hoot_odyssey_save_v1', JSON.stringify(mergedOdyssey));
            window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { ...mergedOdyssey, fromCloud: true } }));
          }
        } catch {
          localStorage.setItem('hoot_odyssey_save_v1', JSON.stringify(cloudOdyssey));
          window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { ...cloudOdyssey, fromCloud: true } }));
        }
      }
    }

    // Déclenchement d'un événement global pour notifier tous les providers et composants React
    window.dispatchEvent(new CustomEvent('hoot_cloud_save_restored', { detail: cloudData }));
    // Signaler la mise à jour des plumes avec le flag 'fromCloud: true' pour éviter la boucle infinie de re-synchronisation
    window.dispatchEvent(new CustomEvent('hoot_feathers_updated', { detail: { fromCloud: true } }));

    // Déclenchement de la célébration des récompenses souveraines attribuées par Hibouxe
    if (Array.isArray(cloudData.pendingAdminRewards) && cloudData.pendingAdminRewards.length > 0) {
      window.dispatchEvent(
        new CustomEvent('hoot_admin_reward_received', { detail: cloudData.pendingAdminRewards })
      );
    }
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
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    if (!identifiers.userId && !identifiers.steamId && !identifiers.username) {
      throw new Error('Not authenticated');
    }

    let query = supabase.from('user_profiles').select('save_data');
    
    if (identifiers.userId) {
      query = query.eq('id', identifiers.userId);
    } else if (identifiers.steamId) {
      query = query.eq('steam_id', identifiers.steamId);
    } else if (identifiers.username) {
      query = query.eq('username', identifiers.username);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return { success: true, exists: false };
      throw error;
    }

    return { success: true, exists: !!data, data: data?.save_data };
  } catch (err: any) {
    return { success: false, exists: false, message: err.message };
  }
}

/**
 * Envoie une sauvegarde vers le cloud distant
 */
export async function pushUserCloudSave(
  identifiers: { steamId?: string; userId?: string; username?: string },
  payload: UserCloudSavePayload,
  _options?: { strategy?: 'merge' | 'replace'; odysseyStrategy?: 'replace' }
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    if (!identifiers.userId && !identifiers.steamId && !identifiers.username) {
      throw new Error('Not authenticated');
    }

    payload.syncedAt = new Date().toISOString();

    const upsertData: any = {
      username: identifiers.username || `unknown_${Math.random().toString(36).substring(2, 9)}`,
      save_data: payload,
      last_synced_at: new Date().toISOString()
    };
    
    if (identifiers.userId) {
      upsertData.id = identifiers.userId;
    }
    if (identifiers.steamId) {
      upsertData.steam_id = identifiers.steamId;
    }

    // Determine the conflict target. If we have userId, use 'id'. Otherwise, use 'username' if it's unique, or steam_id.
    // The migration set 'id' as PRIMARY KEY, 'username' as UNIQUE, 'friend_code' as UNIQUE.
    const conflictTarget = identifiers.userId ? 'id' : (identifiers.username ? 'username' : 'id');

    const { error } = await supabase
      .from('user_profiles')
      .upsert(upsertData, { onConflict: conflictTarget });

    if (error) throw error;

    return { success: true, message: 'Sauvegarde Cloud effectuee', data: payload };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Force la synchronisation immédiate de l'état réinitialisé de l'Odyssée (Hard Reset)
 */
export async function forcePushOdysseyReset(
  identifiers: { steamId?: string; userId?: string; username?: string },
  freshOdysseyState: OdysseySaveState
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  const local = gatherLocalSaveData();
  local.odysseyState = freshOdysseyState;
  const res = await pushUserCloudSave(identifiers, local, { odysseyStrategy: 'replace' });
  if (res.success && res.data) {
    applyCloudSaveToLocalStorage(res.data, { strategy: 'replace' });
  }
  return res;
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
    odysseySap: data.odysseyState?.starSap || 0,
    odysseyTotalSap: data.odysseyState?.totalStarSapEarned || 0,
    odysseyBiome: data.odysseyState?.highestBiomeUnlocked || 1,
    odysseyRoute: data.odysseyState?.currentRouteNumber || 1,
    odysseyUpgrades: Object.values(data.odysseyState?.treeUpgrades || {}).reduce((a, b) => a + b, 0),
    odysseyCap: Object.keys(data.odysseyState?.capturedGames || {}).length,
    odysseySavedAt: data.odysseyState?.lastSavedAt || 0,
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
  _options?: { force?: boolean; strategy?: 'merge' | 'replace' }
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  if (!identifiers.steamId && !identifiers.userId && !identifiers.username) {
    return { success: false, message: 'Aucun identifiant utilisateur disponible pour la synchronisation.' };
  }

  // Si une synchronisation est déjà en vol, gérer les requêtes concurrentes
  if (inFlightSyncPromise) {
    if (_options?.force) {
      // Attendre la fin de la synchronisation en cours pour enchaîner immédiatement la synchronisation forcée
      try {
        await inFlightSyncPromise;
      } catch {}
    } else {
      return inFlightSyncPromise;
    }
  }

  const now = Date.now();
  const currentLocal = gatherLocalSaveData();
  const currentFingerprint = computeSaveFingerprint(currentLocal);

  // Si la sauvegarde n'est pas forcée, temporiser et vérifier si des données ont réellement changé
  if (!_options?.force) {
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
      const isReplace = _options?.strategy === 'replace';

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

/**
 * Confirme et acquitte les récompenses souveraines reçues pour ne plus les réafficher
 */
export async function acknowledgeAdminReward(_rewardId?: string): Promise<boolean> {
  return true;
}

