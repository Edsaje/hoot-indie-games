/**
 * 🦉 Hoot Indie Games — Mapper Exhaustif de Sauvegarde Cloud Souveraine
 * Collecte et applique l'ensemble des 16 catégories de données du site ("TOUTES les saves")
 */

import { ACHIEVEMENTS_LIST } from '../data/achievements';
import type { OdysseySaveState } from '../types/odyssey';
import { loadSecureJson, saveSecureJson } from '../utils/securityAntiCheat';
import { mergeOdysseySaveStates } from './odysseySaveMerger';

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
  // 1. Identité & Profil
  steamId?: string;
  userId?: string;
  username?: string;
  avatarId?: string;
  title?: string;
  activeFrame?: string;
  unlockedAvatars?: string[];
  unlockedTitles?: string[];
  unlockedFrames?: string[];

  // 2. Jeux possédés (Steam + ajouts manuels "J'ai ce jeu")
  ownedAppIds?: number[];

  // 3. Économie des Plumes d'Or
  feathers?: {
    bonus: number;
    spent: number;
    claimedDaily: Record<string, any>;
  };

  // 4. Succès
  achievements?: string[];

  // 5. Mini-jeux quotidiens
  stats?: any;
  dailyGameStates?: Record<string, any>;
  timeAttackStats?: any;
  versusStats?: any;

  // 6. Sanctuaire des Cartes & Boosters
  cardCollection?: Record<string, { count: number; countHolo: number; firstObtainedAt?: string }>;
  lastDailyBoosterClaim?: string;
  freeBoostersStock?: { count: number; lastRechargeTimestamp: number };

  // 7. Odyssée Sylvestre
  odysseyState?: OdysseySaveState;

  // 8. Outils & Modules complémentaires
  backlog?: { selection: any[]; dailyHours: number };
  likedMicroIndies?: string[];
  arcadeStats?: {
    highScores: Record<string, number>;
    difficulty?: string;
    vectrexUnlocked?: boolean;
    vectrexPhosphor?: boolean;
  };
  quizHighScore?: number;
  userPreferences?: {
    hideOwnedGames?: boolean;
    soundEnabled?: boolean;
    masterVolume?: number;
    musicVolume?: number;
    sfxVolume?: number;
    lang?: string;
    crtUnlocked?: boolean;
  };

  // 9. Notifications admin
  pendingAdminRewards?: AdminRewardNotification[];
  syncedAt?: string;
}

// Clés de stockage LocalStorage
export const STORAGE_USER_PROFILE = 'hoot_user_profile_v1';
export const STORAGE_BONUS_FEATHERS = 'hoot_bonus_feathers_v1';
export const STORAGE_SPENT_FEATHERS = 'hoot_spent_feathers_v1';
export const STORAGE_CLAIMED_DAILY = 'hoot_claimed_daily_feathers_v1';
export const STORAGE_ACHIEVEMENTS = 'hoot_unlocked_achievements_v1';
export const STORAGE_INDIE_STATS = 'hoot_indie_stats_v1';
export const STORAGE_GAME_STATS = 'hoot_game_stats_v1';
export const STORAGE_TIME_ATTACK = 'hoot_time_attack_stats_v1';
export const STORAGE_SYNC_KEY = 'hoot_cloud_sync_key_v1';
export const STORAGE_ODYSSEY = 'hoot_odyssey_save_v1';
export const STORAGE_CARDS = 'hoot_cards_collection_v1';
export const STORAGE_BOOSTERS_STOCK = 'hoot_free_boosters_stock_v2';
export const STORAGE_LAST_BOOSTER = 'hoot_last_daily_booster_claim_v1';

const ARCADE_GAMES = ['breakout', 'flappy', 'invaders', 'pong', 'run', 'snake', 'tetris', 'vectrex'];

export function getOrCreateCloudSyncKey(): string {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  let key = localStorage.getItem(STORAGE_SYNC_KEY);
  if (!key) {
    key = 'sync_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_SYNC_KEY, key);
  }
  return key;
}

export function setCloudSyncKey(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem(STORAGE_SYNC_KEY, clean);
  }
}

/**
 * Collecte exhaustive de l'ensemble des 16 composantes du jeu depuis le localStorage
 */
export function gatherLocalSaveData(): UserCloudSavePayload {
  if (typeof window === 'undefined' || !window.localStorage) return {};

  try {
    const rawProfile = localStorage.getItem(STORAGE_USER_PROFILE);
    const profile = rawProfile ? JSON.parse(rawProfile) : {};

    const bonusFromStorage = Number(localStorage.getItem(STORAGE_BONUS_FEATHERS) || '0');
    const legacyFeathers = Number(localStorage.getItem('hoot_golden_feathers_v1') || '0');
    const bonus = Math.max(bonusFromStorage, legacyFeathers);
    const spent = Number(localStorage.getItem(STORAGE_SPENT_FEATHERS) || '0');
    const rawClaimed = localStorage.getItem(STORAGE_CLAIMED_DAILY);
    const claimedDaily = rawClaimed ? JSON.parse(rawClaimed) : {};

    // Succès
    const rawAch = localStorage.getItem(STORAGE_ACHIEVEMENTS) || localStorage.getItem('hoot_achievements_v1');
    let parsedAch: string[] = [];
    if (rawAch) {
      try {
        const parsed = JSON.parse(rawAch);
        if (Array.isArray(parsed)) parsedAch = parsed;
        else if (parsed && typeof parsed === 'object') parsedAch = Object.keys(parsed);
      } catch {
        parsedAch = [];
      }
    }
    const validAchSet = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
    const cleanAchievements = Array.from(new Set(parsedAch.filter((id) => validAchSet.has(id))));

    // Stats mini-jeux
    const rawStats = localStorage.getItem(STORAGE_INDIE_STATS) || localStorage.getItem(STORAGE_GAME_STATS);
    const stats = rawStats ? JSON.parse(rawStats) : {};

    // Calendrier quotidien des grilles (8 jeux)
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
          const parsed = loadSecureJson<any>(k);
          if (parsed) dailyGameStates[k] = parsed;
        } catch {}
      }
    }

    // Time Attack
    const rawTa = localStorage.getItem(STORAGE_TIME_ATTACK);
    const timeAttackStats = rawTa ? JSON.parse(rawTa) : {};

    // Cartes & Boosters
    const cardCollection = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_CARDS);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    })();
    const freeBoostersStock = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_BOOSTERS_STOCK);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    })();

    // Odyssée Sylvestre
    const odysseyState = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_ODYSSEY);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    })();

    // Jeux possédés (Steam + manuels)
    const ownedAppIds: number[] = Array.isArray(profile.steam?.ownedAppIds)
      ? Array.from(new Set(profile.steam.ownedAppIds.map(Number).filter(Boolean)))
      : [];

    // Backlog
    const backlog = (() => {
      try {
        const rawSel = localStorage.getItem('hoot_backlog_selection');
        const rawHours = localStorage.getItem('hoot_backlog_daily_hours');
        if (rawSel || rawHours) {
          return {
            selection: rawSel ? JSON.parse(rawSel) : [],
            dailyHours: rawHours ? Number(rawHours) : 2,
          };
        }
      } catch {}
      return undefined;
    })();

    // Micro-Indies likés
    const likedMicroIndies = (() => {
      try {
        const raw = localStorage.getItem('hoot_liked_micro_indies');
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    })();

    // Salle d'Arcade
    const arcadeStats = (() => {
      const highScores: Record<string, number> = {};
      let hasAny = false;
      for (const gId of ARCADE_GAMES) {
        const val = localStorage.getItem(`hoot_arcade_hs_${gId}`);
        if (val) {
          highScores[gId] = Number(val);
          hasAny = true;
        }
      }
      const difficulty = localStorage.getItem('hoot_arcade_difficulty') || undefined;
      const vectrexUnlocked = localStorage.getItem('hoot_vectrex_unlocked') === 'true';
      const vectrexPhosphor = localStorage.getItem('hoot_vectrex_phosphor') === 'true';
      if (hasAny || difficulty || vectrexUnlocked) {
        return { highScores, difficulty, vectrexUnlocked, vectrexPhosphor };
      }
      return undefined;
    })();

    // Quiz Indé
    const rawQuiz = localStorage.getItem('hoot_quiz_highscore');
    const quizHighScore = rawQuiz ? Number(rawQuiz) : undefined;

    // Préférences & Options
    const userPreferences = {
      hideOwnedGames: localStorage.getItem('hoot_hide_owned_games') === 'true',
      soundEnabled: localStorage.getItem('hoot_sound_enabled') !== 'false',
      masterVolume: Number(localStorage.getItem('hoot_master_volume') || '1'),
      musicVolume: Number(localStorage.getItem('hoot_music_volume') || '0.7'),
      sfxVolume: Number(localStorage.getItem('hoot_sfx_volume') || '0.8'),
      lang: localStorage.getItem('hoot_lang') || undefined,
      crtUnlocked: localStorage.getItem('hoot_crt_unlocked') === 'true',
    };

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
      ownedAppIds,
      feathers: { bonus, spent, claimedDaily },
      achievements: cleanAchievements,
      stats,
      dailyGameStates,
      timeAttackStats,
      versusStats: profile.versusStats,
      cardCollection,
      lastDailyBoosterClaim: localStorage.getItem(STORAGE_LAST_BOOSTER) || undefined,
      freeBoostersStock,
      odysseyState,
      backlog,
      likedMicroIndies,
      arcadeStats,
      quizHighScore,
      userPreferences,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[CloudPayloadMapper] Erreur collecte locale:', err);
    return {};
  }
}

/**
 * Applique l'ensemble d'une sauvegarde cloud dans le localStorage avec notification réactive
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
          const localClaimed = localRaw ? JSON.parse(localRaw) : {};
          const mergedClaimed = { ...localClaimed };
          for (const [dateKey, cloudRecord] of Object.entries(cloudData.feathers.claimedDaily)) {
            if (!mergedClaimed[dateKey]) {
              mergedClaimed[dateKey] = cloudRecord;
            } else {
              const localG = Array.isArray(mergedClaimed[dateKey].claimedGames) ? mergedClaimed[dateKey].claimedGames : [];
              const cloudG = Array.isArray(cloudRecord?.claimedGames) ? cloudRecord.claimedGames : [];
              mergedClaimed[dateKey] = {
                claimedGames: Array.from(new Set([...localG, ...cloudG])),
                grandSlamClaimed: Boolean(mergedClaimed[dateKey].grandSlamClaimed || cloudRecord?.grandSlamClaimed),
              };
            }
          }
          localStorage.setItem(STORAGE_CLAIMED_DAILY, JSON.stringify(mergedClaimed));
        }
      }
    }

    // 2. Succès
    if (Array.isArray(cloudData.achievements)) {
      const validAchSet = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
      if (isReplace) {
        const clean = cloudData.achievements.filter((id) => validAchSet.has(id));
        localStorage.setItem(STORAGE_ACHIEVEMENTS, JSON.stringify(clean));
      } else {
        const existingAchRaw = localStorage.getItem(STORAGE_ACHIEVEMENTS);
        const existingAch = existingAchRaw ? JSON.parse(existingAchRaw) : [];
        const mergedAch = Array.from(new Set([...existingAch, ...cloudData.achievements])).filter((id) => validAchSet.has(id));
        localStorage.setItem(STORAGE_ACHIEVEMENTS, JSON.stringify(mergedAch));
      }
    }

    // 3. Stats des mini-jeux quotidiens
    if (cloudData.stats && typeof cloudData.stats === 'object') {
      if (isReplace) {
        localStorage.setItem(STORAGE_INDIE_STATS, JSON.stringify(cloudData.stats));
        localStorage.setItem(STORAGE_GAME_STATS, JSON.stringify(cloudData.stats));
        window.dispatchEvent(new CustomEvent('hoot_stats_updated', { detail: cloudData.stats }));
      } else {
        const existingRaw = localStorage.getItem(STORAGE_INDIE_STATS) || localStorage.getItem(STORAGE_GAME_STATS);
        const existingStats = existingRaw ? JSON.parse(existingRaw) : {};
        const modes = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'];
        const merged: any = { ...existingStats };
        for (const m of modes) {
          const exM = existingStats[m] || {};
          const cM = cloudData.stats[m] || {};
          merged[m] = {
            ...exM,
            ...cM,
            played: Math.max(Number(exM.played || 0), Number(cM.played || 0)),
            won: Math.max(Number(exM.won || 0), Number(cM.won || 0)),
            currentStreak: Math.max(Number(exM.currentStreak || 0), Number(cM.currentStreak || 0)),
            maxStreak: Math.max(Number(exM.maxStreak || 0), Number(cM.maxStreak || 0)),
          };
        }
        localStorage.setItem(STORAGE_INDIE_STATS, JSON.stringify(merged));
        localStorage.setItem(STORAGE_GAME_STATS, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('hoot_stats_updated', { detail: merged }));
      }
    }

    // 4. Grilles du calendrier (dailyGameStates)
    if (cloudData.dailyGameStates && typeof cloudData.dailyGameStates === 'object') {
      for (const [stateKey, cState] of Object.entries(cloudData.dailyGameStates)) {
        if (!cState || typeof cState !== 'object') continue;
        if (isReplace) {
          saveSecureJson(stateKey, cState);
        } else {
          const lState = loadSecureJson<any>(stateKey);
          if (!lState) {
            saveSecureJson(stateKey, cState);
          } else {
            saveSecureJson(stateKey, {
              ...lState,
              ...cState,
              isWon: Boolean(lState.isWon || (cState as any).isWon),
              isCompleted: Boolean(lState.isCompleted || (cState as any).isCompleted),
            });
          }
        }
      }
      window.dispatchEvent(new CustomEvent('hoot_daily_states_updated'));
    }

    // 5. Profil Utilisateur & Jeux Possédés
    const rawProfile = localStorage.getItem(STORAGE_USER_PROFILE);
    const curProfile = rawProfile ? JSON.parse(rawProfile) : {};

    // Intégration des jeux possédés synchronisés
    const existingOwned: number[] = Array.isArray(curProfile.steam?.ownedAppIds) ? curProfile.steam.ownedAppIds : [];
    const cloudOwned: number[] = Array.isArray(cloudData.ownedAppIds) ? cloudData.ownedAppIds : [];
    const mergedOwned = isReplace
      ? cloudOwned
      : Array.from(new Set([...existingOwned, ...cloudOwned]));

    const updatedProfile = {
      ...curProfile,
      username: cloudData.username && cloudData.username !== 'Hibou Mystère' ? cloudData.username : curProfile.username,
      avatarId: cloudData.avatarId || curProfile.avatarId,
      title: cloudData.title || curProfile.title,
      activeFrame: cloudData.activeFrame || curProfile.activeFrame,
      unlockedAvatars: isReplace
        ? (cloudData.unlockedAvatars || ['owl'])
        : Array.from(new Set([...(curProfile.unlockedAvatars || []), ...(cloudData.unlockedAvatars || [])])),
      unlockedTitles: isReplace
        ? (cloudData.unlockedTitles || ['Oisillon du Perchoir'])
        : Array.from(new Set([...(curProfile.unlockedTitles || []), ...(cloudData.unlockedTitles || [])])),
      unlockedFrames: isReplace
        ? (cloudData.unlockedFrames || ['frame_wood'])
        : Array.from(new Set([...(curProfile.unlockedFrames || []), ...(cloudData.unlockedFrames || [])])),
      steam: {
        ...(curProfile.steam || { steamId: cloudData.steamId, personaName: cloudData.username, profileUrl: '', lastSyncedAt: new Date().toISOString() }),
        steamId: cloudData.steamId || curProfile.steam?.steamId,
        ownedAppIds: mergedOwned,
        gamesCount: mergedOwned.length,
      },
      isCloudSynced: true,
    };
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updatedProfile));
    window.dispatchEvent(new CustomEvent('hoot_owned_games_updated', { detail: mergedOwned }));

    // 6. Cartes & Boosters
    if (cloudData.cardCollection && typeof cloudData.cardCollection === 'object') {
      if (isReplace) {
        localStorage.setItem(STORAGE_CARDS, JSON.stringify(cloudData.cardCollection));
        window.dispatchEvent(new CustomEvent('hoot_cards_updated', { detail: cloudData.cardCollection }));
      } else {
        const localCardsRaw = localStorage.getItem(STORAGE_CARDS);
        const localCards = localCardsRaw ? JSON.parse(localCardsRaw) : {};
        const mergedCards: Record<string, any> = { ...localCards };
        for (const [cId, cEntry] of Object.entries(cloudData.cardCollection)) {
          const lEntry = mergedCards[cId] || { count: 0, countHolo: 0 };
          mergedCards[cId] = {
            count: Math.max(lEntry.count || 0, (cEntry as any).count || 0),
            countHolo: Math.max(lEntry.countHolo || 0, (cEntry as any).countHolo || 0),
            firstObtainedAt: lEntry.firstObtainedAt || (cEntry as any).firstObtainedAt || new Date().toISOString(),
          };
        }
        localStorage.setItem(STORAGE_CARDS, JSON.stringify(mergedCards));
        window.dispatchEvent(new CustomEvent('hoot_cards_updated', { detail: mergedCards }));
      }
    }

    if (cloudData.lastDailyBoosterClaim) {
      localStorage.setItem(STORAGE_LAST_BOOSTER, cloudData.lastDailyBoosterClaim);
    }
    if (cloudData.freeBoostersStock && typeof cloudData.freeBoostersStock === 'object') {
      localStorage.setItem(STORAGE_BOOSTERS_STOCK, JSON.stringify(cloudData.freeBoostersStock));
      window.dispatchEvent(new CustomEvent('hoot_free_boosters_updated', { detail: cloudData.freeBoostersStock }));
    }

    // 7. Odyssée Sylvestre (Moteur de Fusion Monotonique)
    if (cloudData.odysseyState && typeof cloudData.odysseyState === 'object') {
      const localOdysseyRaw = localStorage.getItem(STORAGE_ODYSSEY);
      const localOdyssey = localOdysseyRaw ? JSON.parse(localOdysseyRaw) : null;
      const mergedOdyssey = mergeOdysseySaveStates(localOdyssey, cloudData.odysseyState, isReplace);
      if (mergedOdyssey) {
        localStorage.setItem(STORAGE_ODYSSEY, JSON.stringify(mergedOdyssey));
        window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { ...mergedOdyssey, fromCloud: true } }));
      }
    }

    // 8. Backlog
    if (cloudData.backlog && typeof cloudData.backlog === 'object') {
      if (Array.isArray(cloudData.backlog.selection)) {
        localStorage.setItem('hoot_backlog_selection', JSON.stringify(cloudData.backlog.selection));
      }
      if (typeof cloudData.backlog.dailyHours === 'number') {
        localStorage.setItem('hoot_backlog_daily_hours', String(cloudData.backlog.dailyHours));
      }
      window.dispatchEvent(new CustomEvent('hoot_backlog_updated'));
    }

    // 9. Micro-Indies Likés
    if (Array.isArray(cloudData.likedMicroIndies)) {
      const curLikedRaw = localStorage.getItem('hoot_liked_micro_indies');
      const curLiked = curLikedRaw ? JSON.parse(curLikedRaw) : [];
      const mergedLiked = isReplace ? cloudData.likedMicroIndies : Array.from(new Set([...curLiked, ...cloudData.likedMicroIndies]));
      localStorage.setItem('hoot_liked_micro_indies', JSON.stringify(mergedLiked));
      window.dispatchEvent(new CustomEvent('hoot_liked_games_updated'));
    }

    // 10. Salle d'Arcade
    if (cloudData.arcadeStats && typeof cloudData.arcadeStats === 'object') {
      if (cloudData.arcadeStats.highScores && typeof cloudData.arcadeStats.highScores === 'object') {
        for (const [gId, score] of Object.entries(cloudData.arcadeStats.highScores)) {
          const curVal = Number(localStorage.getItem(`hoot_arcade_hs_${gId}`) || '0');
          const finalScore = isReplace ? score : Math.max(curVal, Number(score));
          localStorage.setItem(`hoot_arcade_hs_${gId}`, String(finalScore));
        }
      }
      if (cloudData.arcadeStats.difficulty) {
        localStorage.setItem('hoot_arcade_difficulty', cloudData.arcadeStats.difficulty);
      }
      if (cloudData.arcadeStats.vectrexUnlocked) {
        localStorage.setItem('hoot_vectrex_unlocked', 'true');
      }
      if (cloudData.arcadeStats.vectrexPhosphor) {
        localStorage.setItem('hoot_vectrex_phosphor', 'true');
      }
      window.dispatchEvent(new CustomEvent('hoot_arcade_updated'));
    }

    // 11. Quiz Indé
    if (typeof cloudData.quizHighScore === 'number') {
      const curQuiz = Number(localStorage.getItem('hoot_quiz_highscore') || '0');
      const finalQuiz = isReplace ? cloudData.quizHighScore : Math.max(curQuiz, cloudData.quizHighScore);
      localStorage.setItem('hoot_quiz_highscore', String(finalQuiz));
      window.dispatchEvent(new CustomEvent('hoot_quiz_updated'));
    }

    // 12. Préférences utilisateur
    if (cloudData.userPreferences && typeof cloudData.userPreferences === 'object') {
      const p = cloudData.userPreferences;
      if (typeof p.hideOwnedGames === 'boolean') localStorage.setItem('hoot_hide_owned_games', String(p.hideOwnedGames));
      if (typeof p.soundEnabled === 'boolean') localStorage.setItem('hoot_sound_enabled', String(p.soundEnabled));
      if (typeof p.masterVolume === 'number') localStorage.setItem('hoot_master_volume', String(p.masterVolume));
      if (typeof p.musicVolume === 'number') localStorage.setItem('hoot_music_volume', String(p.musicVolume));
      if (typeof p.sfxVolume === 'number') localStorage.setItem('hoot_sfx_volume', String(p.sfxVolume));
      if (p.lang) localStorage.setItem('hoot_lang', p.lang);
      if (p.crtUnlocked) localStorage.setItem('hoot_crt_unlocked', 'true');
    }

    // Événement global pour tous les composants
    window.dispatchEvent(new CustomEvent('hoot_cloud_save_restored', { detail: cloudData }));
    window.dispatchEvent(new CustomEvent('hoot_feathers_updated', { detail: { fromCloud: true } }));

    if (Array.isArray(cloudData.pendingAdminRewards) && cloudData.pendingAdminRewards.length > 0) {
      window.dispatchEvent(new CustomEvent('hoot_admin_reward_received', { detail: cloudData.pendingAdminRewards }));
    }
  } catch (err) {
    console.warn('[CloudPayloadMapper] Erreur application locale:', err);
  }
}

export function computeSaveFingerprint(data: UserCloudSavePayload): string {
  return JSON.stringify({
    bonus: data.feathers?.bonus,
    spent: data.feathers?.spent,
    claimed: Object.keys(data.feathers?.claimedDaily || {}).length,
    ach: data.achievements?.length,
    username: data.username,
    avatarId: data.avatarId,
    title: data.title,
    frame: data.activeFrame,
    ownedCount: data.ownedAppIds?.length,
    stats: data.stats,
    dailyCount: Object.keys(data.dailyGameStates || {}).length,
    taPlayed: Object.keys(data.timeAttackStats || {}).length,
    cardsCount: Object.keys(data.cardCollection || {}).length,
    cardsTotal: Object.values(data.cardCollection || {}).reduce((s: number, c: any) => s + (c.count || 0) + (c.countHolo || 0), 0),
    lastBooster: data.lastDailyBoosterClaim,
    freeStock: data.freeBoostersStock?.count,
    odysseySap: data.odysseyState?.starSap || 0,
    odysseyTotalSap: data.odysseyState?.totalStarSapEarned || 0,
    odysseyBiome: data.odysseyState?.highestBiomeUnlocked || 1,
    odysseyRoute: data.odysseyState?.currentRouteNumber || 1,
    odysseyUpgrades: Object.values(data.odysseyState?.treeUpgrades || {}).reduce((a, b) => a + b, 0),
    odysseyCap: Object.keys(data.odysseyState?.capturedGames || {}).length,
    odysseySavedAt: data.odysseyState?.lastSavedAt || 0,
    backlogCount: data.backlog?.selection?.length,
    likedCount: data.likedMicroIndies?.length,
    quizScore: data.quizHighScore,
  });
}
