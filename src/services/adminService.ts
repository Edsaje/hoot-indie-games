/**
 * Service API Administrateur Souverain — Hoot Indie Games
 * Permet au créateur du site d'accéder aux métriques globales, à la modération des pseudos,
 * aux suggestions communautaires, à la santé du serveur et à la gestion du catalogue en temps réel.
 */

import type { Game } from '../types/game';

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

export interface AdminRetentionData {
  returning_visitors?: number;
  returning_rate?: number;
  streak_rescues?: number;
  avg_games_per_visitor?: number;
  global_win_rate?: number;
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
  daily: Record<string, { views?: number; uniques?: number; pageviews?: number; games?: number } | number>;
  recent: AdminEventLog[];
  retention?: AdminRetentionData;
}

export interface AdminUsernameEntry {
  normalized: string;
  displayName: string;
  steamId?: string | null;
  userId?: string | null;
  claimedAt: string;
  lastSeenAt?: string;
  role?: 'admin' | 'moderator' | 'vip' | 'user';
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
  microIndiesFileSize?: number;
  leaderboardFileSize: number;
  adminSteamId: string;
}

export interface AdminMicroIndieEntry {
  id: string;
  title: string;
  developer: string;
  releaseYear: number;
  platform: 'itch' | 'steam' | 'web' | 'both';
  itchUrl?: string;
  steamUrl?: string;
  playInBrowserUrl?: string;
  isFree?: boolean;
  pricingText?: Record<string, string>;
  genre: string[];
  artStyle?: Record<string, string>;
  tagline: Record<string, string>;
  description: Record<string, string>;
  developerMessage?: Record<string, string>;
  jam?: string;
  discoveredBy?: string;
  likesCount?: number;
  coverImage: string;
  screenshots: string[];
  dateAdded: string;
  approved: boolean;
  approvedAt?: string;
  ipHash?: string;
  sourceType?: string;
  pitch?: string;
  submittedAt?: string;
  gameplayUrl?: string;
  [key: string]: any;
}

export interface AdminMicroIndiesData {
  total: number;
  pending: number;
  approved: number;
  list: AdminMicroIndieEntry[];
}

export interface AdminOverviewPayload {
  success: boolean;
  admin: boolean;
  csrfToken?: string;
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
  microIndies?: AdminMicroIndiesData;
  leaderboard: AdminLeaderboardData;
  system: AdminSystemStatus;
}

let activeCsrfToken = '';

export function setAdminCsrfToken(token: string) {
  if (token) activeCsrfToken = token;
}

export function getCachedAdminCsrfToken(): string {
  return activeCsrfToken;
}

export async function ensureAdminCsrfToken(steamId: string = ADMIN_STEAM_ID): Promise<string> {
  if (activeCsrfToken) return activeCsrfToken;
  try {
    const res = await fetch(`/api/track.php?action=get_csrf_token&steamId=${encodeURIComponent(steamId)}&t=${Date.now()}`, {
      credentials: 'include',
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.csrfToken) {
        activeCsrfToken = json.csrfToken;
        return activeCsrfToken;
      }
    }
  } catch {
    // Ignore fallback
  }
  return '';
}

async function postAdminTrack(formData: URLSearchParams): Promise<any> {
  const token = await ensureAdminCsrfToken();
  if (token && !formData.has('csrf_token')) {
    formData.append('csrf_token', token);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
  if (token) {
    headers['X-CSRF-Token'] = token;
  }

  let response = await fetch('/api/track.php', {
    method: 'POST',
    headers,
    body: formData.toString(),
    credentials: 'include',
  });

  if (response.status === 403) {
    activeCsrfToken = '';
    const freshToken = await ensureAdminCsrfToken();
    if (freshToken) {
      formData.set('csrf_token', freshToken);
      headers['X-CSRF-Token'] = freshToken;
      response = await fetch('/api/track.php', {
        method: 'POST',
        headers,
        body: formData.toString(),
        credentials: 'include',
      });
    }
  }

  return response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
}

async function postAdminGames(url: string, bodyJsonOrParams: any, isJson = true): Promise<any> {
  const token = await ensureAdminCsrfToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['X-CSRF-Token'] = token;
  }

  let body: any;
  if (isJson) {
    headers['Content-Type'] = 'application/json';
    const payload = typeof bodyJsonOrParams === 'object' && bodyJsonOrParams !== null ? { ...bodyJsonOrParams } : {};
    if (token) payload.csrf_token = token;
    body = JSON.stringify(payload);
  } else {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (token && bodyJsonOrParams instanceof URLSearchParams && !bodyJsonOrParams.has('csrf_token')) {
      bodyJsonOrParams.append('csrf_token', token);
    }
    body = bodyJsonOrParams.toString();
  }

  let response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  });

  if (response.status === 403) {
    activeCsrfToken = '';
    const freshToken = await ensureAdminCsrfToken();
    if (freshToken) {
      headers['X-CSRF-Token'] = freshToken;
      if (isJson) {
        const payload = typeof bodyJsonOrParams === 'object' && bodyJsonOrParams !== null ? { ...bodyJsonOrParams, csrf_token: freshToken } : {};
        body = JSON.stringify(payload);
      } else if (bodyJsonOrParams instanceof URLSearchParams) {
        bodyJsonOrParams.set('csrf_token', freshToken);
        body = bodyJsonOrParams.toString();
      }
      response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        credentials: 'include',
      });
    }
  }

  return response.json().catch(() => ({ success: false, message: 'Erreur réseau' }));
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

  if (data.csrfToken) {
    activeCsrfToken = data.csrfToken;
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
  const formData = new URLSearchParams();
  formData.append('action', 'delete_username');
  formData.append('target', targetName);
  formData.append('steamId', steamId);

  return postAdminTrack(formData);
}

/**
 * Supprime une suggestion de jeu communautaire
 */
export async function deleteCommunitySuggestion(
  id: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const formData = new URLSearchParams();
  formData.append('action', 'delete_suggestion');
  formData.append('id', id);
  formData.append('steamId', steamId);

  return postAdminTrack(formData);
}

/**
 * Approuve et publie un micro-indé soumis par un utilisateur
 */
export async function approveAdminMicroIndie(
  id: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const formData = new URLSearchParams();
  formData.append('action', 'approve_micro_indie');
  formData.append('id', id);
  formData.append('steamId', steamId);

  return postAdminTrack(formData);
}

/**
 * Supprime ou rejette un micro-indé soumis par un utilisateur
 */
export async function deleteAdminMicroIndie(
  id: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const formData = new URLSearchParams();
  formData.append('action', 'delete_micro_indie');
  formData.append('id', id);
  formData.append('steamId', steamId);

  return postAdminTrack(formData);
}

/**
 * Met à jour les métadonnées d'un micro-indé (jaquette, titre, développeur, liens...)
 */
export async function updateAdminMicroIndie(
  id: string,
  updates: {
    coverImage?: string;
    title?: string;
    developer?: string;
    steamUrl?: string;
    itchUrl?: string;
    playInBrowserUrl?: string;
    pitch?: string;
    discoveredBy?: string;
    price?: string;
    pricingText?: Record<string, string>;
    approved?: boolean;
  },
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; game?: AdminMicroIndieEntry }> {
  const formData = new URLSearchParams();
  formData.append('action', 'update_micro_indie');
  formData.append('id', id);
  formData.append('steamId', steamId);
  if (updates.coverImage !== undefined) formData.append('coverImage', updates.coverImage);
  if (updates.title !== undefined) formData.append('title', updates.title);
  if (updates.developer !== undefined) formData.append('developer', updates.developer);
  if (updates.steamUrl !== undefined) formData.append('steamUrl', updates.steamUrl);
  if (updates.itchUrl !== undefined) formData.append('itchUrl', updates.itchUrl);
  if (updates.playInBrowserUrl !== undefined) formData.append('playInBrowserUrl', updates.playInBrowserUrl);
  if (updates.pitch !== undefined) formData.append('pitch', updates.pitch);
  if (updates.discoveredBy !== undefined) formData.append('discoveredBy', updates.discoveredBy);
  if (updates.price !== undefined) formData.append('price', updates.price);
  if (updates.pricingText !== undefined) formData.append('pricingText', JSON.stringify(updates.pricingText));

  return postAdminTrack(formData);
}

/**
 * Réinitialise les métriques d'analytics
 */
export async function resetServerStats(
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string }> {
  const formData = new URLSearchParams();
  formData.append('action', 'reset_stats');
  formData.append('steamId', steamId);

  return postAdminTrack(formData);
}

/**
 * Modifie les attributs d'un utilisateur (Pseudo, rôle, statut, titre, note)
 */
export async function editAdminUser(
  target: string,
  fields: {
    displayName?: string;
    role?: 'admin' | 'moderator' | 'vip' | 'user';
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

  return postAdminTrack(formData);
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

  return postAdminTrack(formData);
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

  return postAdminTrack(formData);
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

  return postAdminTrack(formData);
}

/**
 * Crée et réserve manuellement une identité utilisateur
 */
export async function createAdminUser(
  userData: {
    username: string;
    targetSteamId?: string;
    role?: 'admin' | 'moderator' | 'vip' | 'user';
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

/**
 * Génère l'URL d'export CSV sécurisé des données
 */
export function getAdminExportCsvUrl(
  type: 'daily' | 'games' | 'recent' = 'daily',
  steamId: string = ADMIN_STEAM_ID
): string {
  return `/api/track.php?action=export_csv&type=${encodeURIComponent(type)}&steamId=${encodeURIComponent(steamId)}`;
}

/**
 * Génère l'URL d'export JSON de sauvegarde
 */
export function getAdminExportJsonUrl(steamId: string = ADMIN_STEAM_ID): string {
  return `/api/track.php?action=export_json&steamId=${encodeURIComponent(steamId)}`;
}

// ============================================================================
// GESTION EN TEMPS RÉEL DU CATALOGUE DE JEUX (CRUD ADMIN SOUVERAIN)
// ============================================================================

export interface AdminGameOverridesPayload {
  success: boolean;
  admin?: boolean;
  hiddenGameIds: string[];
  modifiedGames: Record<string, Partial<Game>>;
  customAdminGames: Game[];
  excludedFromGems?: string[];
  promotedToGems?: string[];
  lastUpdated: string;
}

/**
 * Récupère l'intégralité des surcharges et jeux personnalisés pour l'administrateur
 */
export async function fetchAdminGameOverrides(
  steamId: string = ADMIN_STEAM_ID
): Promise<AdminGameOverridesPayload> {
  const url = `/api/admin_games.php?action=get_all&steamId=${encodeURIComponent(steamId)}&t=${Date.now()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    let msg = `Erreur HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) msg = err.message;
    } catch {
      // Ignore
    }
    throw new Error(msg);
  }

  return response.json();
}

/**
 * Récupère publiquement les surcharges actives pour synchroniser le catalogue côté client
 */
export async function fetchPublicGameOverrides(): Promise<AdminGameOverridesPayload> {
  const url = `/api/admin_games.php?action=public_overrides&t=${Date.now()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur récupération surcharges : ${response.status}`);
  }

  return response.json();
}

/**
 * Sauvegarde ou met à jour une fiche de jeu dans le catalogue souverain
 */
export async function saveAdminGame(
  game: Partial<Game> & { isCustomAdmin?: boolean; hidden?: boolean; isGem?: boolean },
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; game?: Game }> {
  const url = `/api/admin_games.php?action=save_game&steamId=${encodeURIComponent(steamId)}`;
  return postAdminGames(url, game, true);
}

/**
 * Bascule le statut Pépite d'un jeu (présent dans l'explorateur de Pépites ou réservé au catalogue)
 */
export async function toggleAdminGameGemStatus(
  id: string,
  isGem: boolean,
  steamId: string = ADMIN_STEAM_ID
): Promise<{
  success: boolean;
  message: string;
  gameId?: string;
  isGem: boolean;
  excludedFromGems?: string[];
  promotedToGems?: string[];
}> {
  const formData = new URLSearchParams();
  formData.append('id', id);
  formData.append('isGem', isGem ? '1' : '0');

  const url = `/api/admin_games.php?action=toggle_gem&steamId=${encodeURIComponent(steamId)}`;
  return postAdminGames(url, formData, false);
}

/**
 * Bascule la visibilité d'un jeu (masquer / afficher sur le site public)
 */
export async function toggleAdminGameVisibility(
  id: string,
  hidden: boolean,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; hidden: boolean; hiddenGameIds?: string[] }> {
  const formData = new URLSearchParams();
  formData.append('id', id);
  formData.append('hidden', hidden ? '1' : '0');

  const url = `/api/admin_games.php?action=toggle_visibility&steamId=${encodeURIComponent(steamId)}`;
  return postAdminGames(url, formData, false);
}

/**
 * Supprime un jeu personnalisé ou retire un jeu du catalogue public
 */
export async function deleteAdminGame(
  id: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; gameId?: string }> {
  const formData = new URLSearchParams();
  formData.append('id', id);

  const url = `/api/admin_games.php?action=delete_game&steamId=${encodeURIComponent(steamId)}`;
  return postAdminGames(url, formData, false);
}

/**
 * Restaure un jeu dans son état canonique d'origine
 */
export async function restoreAdminGame(
  id: string,
  steamId: string = ADMIN_STEAM_ID
): Promise<{ success: boolean; message: string; gameId?: string }> {
  const formData = new URLSearchParams();
  formData.append('id', id);

  const url = `/api/admin_games.php?action=restore_game&steamId=${encodeURIComponent(steamId)}`;
  return postAdminGames(url, formData, false);
}


