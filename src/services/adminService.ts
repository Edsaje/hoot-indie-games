/**
 * Service API Administrateur Souverain — Hoot Indie Games
 * Permet au créateur du site d'accéder aux métriques globales, à la modération des pseudos,
 * aux suggestions communautaires et à la santé du serveur.
 */

export const ADMIN_STEAM_ID = '76561198035270542';

export interface AdminAnalyticsSummary {
  pageviews: number;
  unique_visitors: number;
  games_played: number;
  games_won: number;
  versus_played: number;
  steam_clicks: number;
  easter_eggs: number;
}

export interface AdminGameStat {
  plays: number;
  wins: number;
}

export interface AdminEventLog {
  id?: string;
  event: string;
  category?: string;
  label?: string;
  timestamp: string;
  device?: string;
  props?: Record<string, any>;
}

export interface AdminAnalyticsData {
  summary: AdminAnalyticsSummary;
  games: Record<string, AdminGameStat>;
  referrers: Record<string, number>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  daily: Record<string, { views?: number; uniques?: number } | number>;
  recent: AdminEventLog[];
}

export interface AdminUsernameEntry {
  normalized: string;
  displayName: string;
  steamId?: string | null;
  userId?: string | null;
  claimedAt: string;
  lastSeenAt?: string;
  role?: 'admin' | 'vip' | 'user';
  status?: 'active' | 'banned';
  customTitle?: string;
  note?: string;
  isAdminReserved?: boolean;
}

export interface AdminCommunitySuggestion {
  id: string;
  appId: number;
  title: string;
  developer: string;
  releaseYear: number;
  genres: string[];
  comment?: string;
  steamUrl: string;
  submittedAt: string;
  status: string;
}

export interface AdminLeaderboardData {
  totalEntries: number;
  categories: Record<string, Record<string, number>>;
}

export interface AdminSystemStatus {
  phpVersion: string;
  serverTime: string;
  statsFileSize: number;
  usernamesFileSize: number;
  suggestionsFileSize: number;
  leaderboardFileSize: number;
  adminSteamId: string;
}

export interface AdminOverviewPayload {
  success: boolean;
  admin: boolean;
  analytics: AdminAnalyticsData;
  usernames: {
    total: number;
    list: AdminUsernameEntry[];
    forbiddenNames?: string[];
    bannedCount?: number;
  };
  suggestions: {
    total: number;
    list: AdminCommunitySuggestion[];
  };
  leaderboard: AdminLeaderboardData;
  system: AdminSystemStatus;
}

/**
 * Récupère l'ensemble de la vue d'ensemble administrateur depuis l'API souveraine
 */
export async function fetchAdminOverview(steamId: string = ADMIN_STEAM_ID): Promise<AdminOverviewPayload> {
  const url = `/api/track.php?format=json&steamId=${encodeURIComponent(steamId)}&t=${Date.now()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Erreur HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // Ignore
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (!data || !data.success) {
    throw new Error(data?.message || 'Réponse administrateur invalide');
  }

  return data as AdminOverviewPayload;
}

/**
 * Libère / supprime un pseudonyme enregistré pour modération
 */
export async function deleteRegisteredUsername(
  targetName: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const url = `/api/track.php?action=delete_username&target=${encodeURIComponent(targetName)}&steamId=${encodeURIComponent(steamId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
  return data;
}

/**
 * Supprime une suggestion de jeu communautaire
 */
export async function deleteCommunitySuggestion(
  id: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const url = `/api/track.php?action=delete_suggestion&id=${encodeURIComponent(id)}&steamId=${encodeURIComponent(steamId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
  return data;
}

/**
 * Réinitialise les métriques d'analytics
 */
export async function resetServerStats(
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const url = `/api/track.php?action=reset_stats&steamId=${encodeURIComponent(steamId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
  return data;
}

/**
 * Modifie les attributs d'un utilisateur (Pseudo, rôle, statut, titre, note)
 */
export async function editAdminUser(
  target: string,
  fields: {
    displayName?: string;
    role?: 'admin' | 'vip' | 'user';
    status?: 'active' | 'banned';
    customTitle?: string;
    note?: string;
  },
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; user?: AdminUsernameEntry }> {
  const formData = new URLSearchParams();
  formData.append('action', 'edit_user');
  formData.append('steamId', steamId);
  formData.append('target', target);
  if (fields.displayName !== undefined) formData.append('displayName', fields.displayName);
  if (fields.role !== undefined) formData.append('role', fields.role);
  if (fields.status !== undefined) formData.append('status', fields.status);
  if (fields.customTitle !== undefined) formData.append('customTitle', fields.customTitle);
  if (fields.note !== undefined) formData.append('note', fields.note);

  const response = await fetch('/api/track.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur de communication réseau' }));
  return data;
}

/**
 * Active ou suspend (bannit) un utilisateur
 */
export async function toggleBanAdminUser(
  target: string,
  isBanned: boolean,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const formData = new URLSearchParams();
  formData.append('action', 'toggle_ban_user');
  formData.append('steamId', steamId);
  formData.append('target', target);
  formData.append('banned', isBanned ? '1' : '0');

  const response = await fetch('/api/track.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
  return data;
}

/**
 * Purge tous les scores d'un joueur dans le Leaderboard
 */
export async function purgeUserLeaderboardScores(
  username: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const formData = new URLSearchParams();
  formData.append('action', 'purge_user_scores');
  formData.append('steamId', steamId);
  formData.append('username', username);

  const response = await fetch('/api/track.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
  return data;
}

/**
 * Gère la blacklist des pseudonymes interdits (ajout / suppression / liste)
 */
export async function manageForbiddenNames(
  subaction: 'add' | 'remove' | 'list',
  word: string = '',
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message?: string; forbiddenNames: string[] }> {
  const formData = new URLSearchParams();
  formData.append('action', 'manage_forbidden_names');
  formData.append('steamId', steamId);
  formData.append('subaction', subaction);
  if (word) formData.append('word', word);

  const response = await fetch('/api/track.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, forbiddenNames: [] }));
  return data;
}

/**
 * Crée et réserve manuellement une identité utilisateur
 */
export async function createAdminUser(
  userData: {
    username: string;
    targetSteamId?: string;
    role?: 'admin' | 'vip' | 'user';
    customTitle?: string;
    note?: string;
  },
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; user?: AdminUsernameEntry }> {
  const formData = new URLSearchParams();
  formData.append('action', 'create_user');
  formData.append('steamId', steamId);
  formData.append('username', userData.username);
  if (userData.targetSteamId) formData.append('targetSteamId', userData.targetSteamId);
  if (userData.role) formData.append('role', userData.role);
  if (userData.customTitle) formData.append('customTitle', userData.customTitle);
  if (userData.note) formData.append('note', userData.note);

  const response = await fetch('/api/track.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
  return data;
}

