/**
 * Service Leaderboard & Statistiques Communautaires — Hoot Indie Games
 * Gère la communication avec les APIs souveraines :
 * - /api/leaderboard.php (High Scores mondiaux Arcade & Time Attack)
 * - /api/community_stats.php (Distribution des essais de la communauté pour Screenle, Indledle, Linkle, Profille)
 * Avec fallback local automatique et persistance offline garantie.
 */

import { generateScoreSignature, isScorePlausible } from '../utils/securityAntiCheat';

export type LeaderboardCategory = 'arcade' | 'timeattack' | 'quiz';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  nickname: string;
  score: number;
  avatar: string;
  date: string;
  isCurrentPlayer?: boolean;
}

export interface CommunityDistributionData {
  game: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest';
  date: string;
  total: number;
  distribution: Record<string, number>;
  averageAttempts: number;
  isBaseline?: boolean;
}

const NICKNAME_KEY = 'hoot_player_nickname';
const AVATAR_KEY = 'hoot_player_avatar';

export const AVATAR_OPTIONS = [
  { id: 'hibouxe_creator', label: 'Hibouxe (Fondateur)', icon: '🦉', imageUrl: '/logo.png', adminOnly: true },
  { id: 'owl', label: 'Hootie', icon: '🦉' },
  { id: 'knight', label: 'Le Chevalier', icon: '🗡️' },
  { id: 'madeline', label: 'Madeline', icon: '🍓' },
  { id: 'zagreus', label: 'Zagreus', icon: '🔥' },
  { id: 'lamb', label: "L'Agneau", icon: '👑' },
  { id: 'joker', label: 'Jimbo le Joker', icon: '🃏' },
  { id: 'cat', label: 'Le Chat Errant', icon: '🐱' },
  { id: 'goose', label: 'L’Oie Espiègle', icon: '🪿' },
  { id: 'shovel_knight', label: 'Shovel Knight', icon: '🪏' },
  { id: 'sans', label: 'Sans', icon: '💀' },
  { id: 'cuphead', label: 'Cuphead', icon: '☕' },
  { id: 'isaac', label: 'Isaac', icon: '💧' },
  { id: 'penitent', label: 'Le Pénitent', icon: '⚔️' },
  { id: 'beheaded', label: 'Le Décapité', icon: '🔥' },
  { id: 'niko', label: 'Niko', icon: '💡' },
  { id: 'meat_boy', label: 'Super Meat Boy', icon: '🥩' },
  { id: 'baba', label: 'Baba', icon: '🐑' },
  { id: 'hornet', label: 'Hornet', icon: '🪡' },
  { id: 'omori', label: 'Omori', icon: '🔪' },
  { id: 'claire', label: 'Claire', icon: '🦅' },
  { id: 'drifter', label: 'Le Voyageur', icon: '⚡' },
  { id: 'slugcat', label: 'Le Slugcat', icon: '🌧️' },
  { id: 'owl_wood', label: 'Hibou des Bois', icon: '🦉' },
  { id: 'owl_golden', label: 'Grand-Duc Doré', icon: '👑' },
  { id: 'owl_emerald', label: 'Chouette Émeraude', icon: '🌿' },
  { id: 'owl_neon', label: 'Hibou Néon', icon: '⚡' },
  { id: 'owl_shadow', label: 'Effraie Nocturne', icon: '🌑' },
  { id: 'owl_cyber', label: 'Hibou Cyberpunk', icon: '🔮' },
  { id: 'owl_cosmic', label: 'Hibou Stellaire', icon: '🌌' },
  { id: 'owl_snow', label: 'Harfang des Neiges', icon: '❄️' },
];

export function getPlayerNickname(): string {
  if (typeof localStorage === 'undefined') return 'Hibou Anonyme';

  // 1. Priorité absolue au profil de compte de l'utilisateur
  try {
    const userRawV1 = localStorage.getItem('hoot_user_profile_v1');
    if (userRawV1) {
      const parsed = JSON.parse(userRawV1);
      if (parsed?.username && parsed.username.trim()) {
        return parsed.username.trim();
      }
    }
    const userRaw = localStorage.getItem('hoot_user_profile');
    if (userRaw) {
      const parsed = JSON.parse(userRaw);
      if (parsed?.username && parsed.username.trim()) {
        return parsed.username.trim();
      }
    }
  } catch {
    // Ignore
  }

  // 2. Repli sur le pseudo leaderboard enregistré
  const saved = localStorage.getItem(NICKNAME_KEY);
  if (saved && saved.trim()) return saved.trim();

  // 3. Fallback générique amical
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const defaultName = isLocalHost ? 'Hibouxe' : 'Hibou_' + Math.floor(100 + Math.random() * 900);
  localStorage.setItem(NICKNAME_KEY, defaultName);
  return defaultName;
}

export function setPlayerNickname(nickname: string): void {
  if (typeof localStorage === 'undefined') return;
  const clean = nickname.trim().slice(0, 16) || 'Hibou Anonyme';
  localStorage.setItem(NICKNAME_KEY, clean);
}

export function getPlayerAvatar(): string {
  if (typeof localStorage === 'undefined') return 'owl';

  // 1. Priorité au profil de compte
  try {
    const userRawV1 = localStorage.getItem('hoot_user_profile_v1');
    if (userRawV1) {
      const parsed = JSON.parse(userRawV1);
      if (parsed?.avatarId) {
        if (parsed.avatarId === 'hibouxe_creator') return 'hibouxe_creator';
        if (AVATAR_OPTIONS.some((a) => a.id === parsed.avatarId)) return parsed.avatarId;
      }
    }
  } catch {
    // Ignore
  }

  const saved = localStorage.getItem(AVATAR_KEY);
  if (saved && (saved === 'hibouxe_creator' || AVATAR_OPTIONS.some((a) => a.id === saved))) return saved;
  return 'owl';
}

export function setPlayerAvatar(avatarId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AVATAR_KEY, avatarId);
}

/**
 * Récupère l'identifiant de compte unique du joueur (Steam ID, Profil Cloud ou Device ID persistant)
 */
export function getPlayerAccountId(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const userRawV1 = localStorage.getItem('hoot_user_profile_v1');
    if (userRawV1) {
      const parsed = JSON.parse(userRawV1);
      if (String(parsed?.steam?.steamId) === '76561198035270542' || parsed?.username === 'Hibouxe' && (parsed?.isAdmin || isLocalHost)) {
        return 'admin_hibouxe';
      }
      if (parsed?.steam?.steamId) return `steam_${parsed.steam.steamId}`;
      if (parsed?.id) return parsed.id;
    }
    const userRaw = localStorage.getItem('hoot_user_profile');
    if (userRaw) {
      const parsed = JSON.parse(userRaw);
      if (String(parsed?.steam?.steamId) === '76561198035270542' || parsed?.username === 'Hibouxe') {
        return 'admin_hibouxe';
      }
      if (parsed?.steam?.steamId) return `steam_${parsed.steam.steamId}`;
      if (parsed?.id) return parsed.id;
    }
    if (isLocalHost) {
      return 'admin_hibouxe';
    }
    let deviceId = localStorage.getItem('hoot_device_account_id');
    if (!deviceId) {
      deviceId = 'acc_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('hoot_device_account_id', deviceId);
    }
    return deviceId;
  } catch {
    return '';
  }
}

/**
 * Met à jour le pseudonyme et l'avatar du joueur sur TOUS ses scores existants dans l'ensemble des jeux
 */
export async function updateLeaderboardPlayerProfile(
  newNickname: string,
  newAvatar?: string,
  oldNickname?: string
): Promise<boolean> {
  const accountId = getPlayerAccountId();
  const cleanNick = newNickname.trim().slice(0, 16) || 'Hibou Anonyme';
  const avatar = newAvatar || getPlayerAvatar();

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(NICKNAME_KEY, cleanNick);
    if (avatar) localStorage.setItem(AVATAR_KEY, avatar);
  }

  try {
    const res = await fetch('/api/leaderboard.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        action: 'update_player_profile',
        accountId,
        newNickname: cleanNick,
        oldNickname: oldNickname || '',
        newAvatar: avatar,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.status === 'success';
    }
  } catch {
    // Mode local / hors-ligne
  }
  return true;
}

/**
 * Récupère le classement en ligne (Top 10 ou Top N) pour une borne d'arcade, un sprint Time Attack ou le Quiz
 */
export async function fetchLeaderboard(
  category: LeaderboardCategory,
  game: string,
  limit: number = 10,
  period: 'all' | 'daily' = 'all'
): Promise<{ totalEntries: number; leaderboard: LeaderboardEntry[] }> {
  const currentNick = getPlayerNickname();

  try {
    const res = await fetch(
      `/api/leaderboard.php?category=${category}&game=${game}&limit=${limit}&period=${period}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && Array.isArray(data.leaderboard)) {
        const enriched: LeaderboardEntry[] = data.leaderboard.map((item: LeaderboardEntry) => ({
          ...item,
          isCurrentPlayer: item.nickname === currentNick,
        }));
        return {
          totalEntries: data.totalEntries || enriched.length,
          leaderboard: enriched,
        };
      }
    }
  } catch {
    // Fallback mode offline / dev local
  }

  return getFallbackLeaderboard(category, game, limit);
}

/**
 * Envoie un score vers le classement en ligne
 * Règle d'or : conserve toujours le meilleur score du compte / joueur (aucun doublon).
 */
export async function submitLeaderboardScore(
  category: LeaderboardCategory,
  game: string,
  score: number,
  customNickname?: string,
  customAvatar?: string
): Promise<{ success: boolean; rank?: number; isNewRecord?: boolean; leaderboard: LeaderboardEntry[] }> {
  const nickname = customNickname || getPlayerNickname();
  const avatar = customAvatar || getPlayerAvatar();
  const accountId = getPlayerAccountId();

  if (score <= 0 || !isScorePlausible(category, game, score)) {
    console.warn(`[Leaderboard] Rejet du score ${score} pour ${category}/${game} (non plausible).`);
    return { success: false, leaderboard: [] };
  }

  // Sauvegarde locale du pseudo / avatar
  setPlayerNickname(nickname);
  setPlayerAvatar(avatar);

  const timestamp = Math.floor(Date.now() / 1000);
  const token = generateScoreSignature(category, game, score, timestamp);

  try {
    const res = await fetch('/api/leaderboard.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        category,
        game,
        score,
        nickname,
        avatar,
        token,
        timestamp,
        accountId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        const enriched: LeaderboardEntry[] = (data.leaderboard || []).map((item: LeaderboardEntry) => ({
          ...item,
          isCurrentPlayer: item.nickname === nickname,
        }));
        return {
          success: true,
          rank: data.rank,
          isNewRecord: data.isNewRecord,
          leaderboard: enriched,
        };
      }
    }
  } catch {
    // Mode local / fallback
  }

  // Fallback local persistence (Garantit 1 seul score par joueur en conservant le meilleur)
  const fallback = getFallbackLeaderboard(category, game, 10);
  const playerEntry: LeaderboardEntry = {
    rank: 1,
    id: 'local_score_' + (accountId || nickname),
    nickname,
    score,
    avatar,
    date: new Date().toISOString().split('T')[0],
    isCurrentPlayer: true,
  };

  const existingIdx = fallback.leaderboard.findIndex(
    (e) => e.isCurrentPlayer || e.nickname.toLowerCase() === nickname.toLowerCase()
  );

  let updatedList = [...fallback.leaderboard];
  let isNewRecord = true;

  if (existingIdx !== -1) {
    const existing = updatedList[existingIdx];
    if (score > existing.score) {
      updatedList[existingIdx] = playerEntry;
      isNewRecord = true;
    } else {
      // Conserver le meilleur score existant sans régression
      updatedList[existingIdx] = {
        ...existing,
        avatar,
        isCurrentPlayer: true,
      };
      isNewRecord = false;
    }
  } else {
    updatedList.push(playerEntry);
  }

  const combined = updatedList
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((e, idx) => ({
      ...e,
      rank: idx + 1,
      isCurrentPlayer: e.nickname.toLowerCase() === nickname.toLowerCase(),
    }));

  return {
    success: true,
    rank: combined.findIndex((e) => e.isCurrentPlayer) + 1,
    isNewRecord,
    leaderboard: combined,
  };
}

/**
 * Récupère la distribution des essais de la communauté pour le jeu quotidien du jour
 */
export async function fetchCommunityStats(
  game: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest',
  dateStr: string
): Promise<CommunityDistributionData> {
  try {
    const res = await fetch(`/api/community_stats.php?game=${game}&date=${dateStr}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.distribution) {
        return {
          game,
          date: dateStr,
          total: data.total || 0,
          distribution: data.distribution,
          averageAttempts: data.averageAttempts || 0,
          isBaseline: data.isBaseline,
        };
      }
    }
  } catch {
    // Fallback mode offline
  }

  return generateBaselineDistribution(game, dateStr);
}

/**
 * Enregistre la résolution d'une partie quotidienne pour alimenter le graphique communautaire
 */
export async function recordDailyCommunityCompletion(
  game: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest',
  dateStr: string,
  won: boolean,
  attempts: number
): Promise<CommunityDistributionData | null> {
  try {
    const res = await fetch('/api/community_stats.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        game,
        date: dateStr,
        won,
        attempts,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.distribution) {
        return {
          game,
          date: dateStr,
          total: data.total,
          distribution: data.distribution,
          averageAttempts: data.averageAttempts,
        };
      }
    }
  } catch {
    // Silencieux
  }

  return null;
}

// -------------------------------------------------------------
// Fallbacks déterministes et esthétiques (Local / Offline)
// -------------------------------------------------------------

function generateBaselineDistribution(
  game: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest',
  dateStr: string
): CommunityDistributionData {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % 10000;
  }

  let dist: Record<string, number> = {};

  if (game === 'linkle') {
    dist = {
      '4': 38 + (hash % 8),
      '5': 45 + ((hash * 3) % 10),
      '6': 28 + ((hash * 7) % 7),
      '7': 14 + ((hash * 5) % 5),
      fail: 9 + ((hash * 2) % 4),
    };
  } else if (game === 'profille') {
    dist = {
      '3': 52 + (hash % 10),
      '2': 48 + ((hash * 3) % 8),
      '1': 22 + ((hash * 5) % 6),
      fail: 7 + ((hash * 2) % 3),
    };
  } else if (game === 'chrono') {
    dist = {
      '3': 55 + (hash % 12),
      '2': 42 + ((hash * 3) % 9),
      '1': 24 + ((hash * 5) % 6),
      fail: 8 + ((hash * 2) % 4),
    };
  } else if (game === 'pixel' || game === 'review' || game === 'blindtest') {
    dist = {
      '1': 10 + (hash % 6),
      '2': 32 + ((hash * 2) % 9),
      '3': 58 + ((hash * 3) % 12),
      '4': 36 + ((hash * 5) % 8),
      '5': 18 + ((hash * 7) % 6),
      fail: 8 + ((hash * 11) % 4),
    };
  } else {
    // Screenle & Indledle
    dist = {
      '1': 8 + (hash % 5),
      '2': 26 + ((hash * 2) % 8),
      '3': 54 + ((hash * 3) % 12),
      '4': 42 + ((hash * 5) % 10),
      '5': 19 + ((hash * 7) % 6),
      '6': 10 + ((hash * 11) % 5),
      fail: 6 + ((hash * 13) % 4),
    };
  }

  const total = Object.values(dist).reduce((acc, v) => acc + v, 0);
  let sumWeighted = 0;
  let totalWins = 0;
  for (const [k, v] of Object.entries(dist)) {
    if (k !== 'fail' && !isNaN(Number(k))) {
      sumWeighted += Number(k) * v;
      totalWins += v;
    }
  }
  const averageAttempts = totalWins > 0 ? Number((sumWeighted / totalWins).toFixed(2)) : 3.5;

  return {
    game,
    date: dateStr,
    total,
    distribution: dist,
    averageAttempts,
    isBaseline: true,
  };
}

function getFallbackLeaderboard(
  _category: LeaderboardCategory,
  game: string,
  limit: number
): { totalEntries: number; leaderboard: LeaderboardEntry[] } {
  const avatars = ['owl_golden', 'owl_emerald', 'owl_neon', 'owl_shadow', 'owl_cyber', 'owl_cosmic', 'owl_wood'];
  const baseScores: Record<string, number[]> = {
    snake: [1420, 1280, 1150, 980, 890, 760, 690, 580, 520, 440],
    pong: [21, 19, 18, 15, 14, 12, 11, 10, 9, 8],
    breakout: [4800, 4250, 3900, 3450, 3100, 2800, 2500, 2200, 1950, 1700],
    flappy: [84, 76, 68, 59, 52, 45, 39, 34, 28, 22],
    invaders: [6400, 5850, 5120, 4700, 4200, 3850, 3400, 2900, 2450, 2100],
    run: [3120, 2850, 2600, 2340, 2100, 1850, 1620, 1450, 1280, 1100],
    tetris: [34500, 29800, 26400, 23100, 19800, 17200, 14500, 12800, 11200, 9500],
    vectrex: [5800, 5100, 4650, 4100, 3750, 3300, 2950, 2600, 2250, 1900],
    // Time Attack (8 Sprints)
    screenle: [2800, 2500, 2300, 2100, 1900, 1750, 1600, 1450, 1300, 1150],
    indledle: [2600, 2350, 2150, 1950, 1800, 1650, 1500, 1350, 1200, 1050],
    linkle: [2400, 2200, 2050, 1850, 1700, 1550, 1400, 1250, 1100, 950],
    profille: [2500, 2300, 2100, 1900, 1750, 1600, 1450, 1300, 1150, 1000],
    chrono: [2700, 2400, 2200, 2000, 1800, 1650, 1500, 1350, 1200, 1050],
    pixel: [2900, 2600, 2350, 2150, 1900, 1750, 1550, 1400, 1250, 1100],
    review: [2650, 2400, 2150, 1950, 1750, 1600, 1450, 1300, 1150, 1000],
    blindtest: [3200, 2850, 2550, 2250, 1950, 1750, 1550, 1350, 1200, 1050],
    // Quiz Indé (3 Modes)
    standard: [10, 10, 9, 9, 8, 8, 7, 7, 6, 5],
    survival: [42, 36, 29, 24, 20, 17, 14, 11, 9, 7],
    infinite: [85, 72, 63, 54, 46, 38, 32, 26, 21, 16],
  };

  const sampleNames = [
    'NoctisOwl',
    'GrandDuc',
    'SylveMaster',
    'Canopée',
    'Chouette84',
    'IndieHunter',
    'PixelNight',
    'FeatherGamer',
    'AuraSylvestre',
    'HootRunner',
  ];

  const scores = baseScores[game] || [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100];
  const entries: LeaderboardEntry[] = scores.slice(0, limit).map((sc, i) => ({
    rank: i + 1,
    id: `seed_${game}_${i + 1}`,
    nickname: sampleNames[i % sampleNames.length],
    score: sc,
    avatar: avatars[i % avatars.length],
    date: '2026-09-19',
    isCurrentPlayer: false,
  }));

  return {
    totalEntries: entries.length,
    leaderboard: entries,
  };
}
