import type { FriendPlayer, FriendDailyScores, FriendPlayStatus } from '../types/friends';
import type { UserProfile } from '../types/user';
import { getTodayDateString, getChallengeStatusForDate } from '../utils/streakManager';
import { ADMIN_STEAM_ID } from '../utils/usernameValidation';

const FRIENDS_STORAGE_KEY = 'hoot_friends_list_v2';
const API_BASE = '/api/friends.php';

// Caractères lisibles sans ambiguïté (sans 0, O, 1, I)
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Génère ou récupère le code ami canonique de l'utilisateur
 */
export function getOrCreateFriendCode(profile: UserProfile): string {
  if (profile.steam?.steamId === ADMIN_STEAM_ID || profile.id === 'admin_hibouxe' || profile.username.toLowerCase() === 'hibouxe') {
    return 'HOOT-HIBOU';
  }

  if (profile.friendCode && /^HOOT-[A-Z0-9]{3,10}$/.test(profile.friendCode)) {
    return profile.friendCode;
  }

  // Dérivation déterministe basée sur l'id ou génération aléatoire persistante
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * CODE_CHARS.length);
    randomPart += CODE_CHARS[idx];
  }

  return `HOOT-${randomPart}`;
}

/**
 * Extrait les scores de l'utilisateur pour la date spécifiée (zéro spoiler sur le titre de jeu)
 */
export function extractCurrentDailyScores(dateStr = getTodayDateString()): FriendDailyScores {
  const statusSummary = getChallengeStatusForDate(dateStr);
  const disciplines = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'] as const;

  const result: any = {
    date: dateStr,
    totalWonToday: 0,
  };

  disciplines.forEach((disc) => {
    const st: FriendPlayStatus = statusSummary[disc] || 'unplayed';
    let guessCount: number | undefined = undefined;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(`${disc}_state_${dateStr}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.guesses)) {
            guessCount = parsed.guesses.length;
          } else if (typeof parsed.score === 'number') {
            guessCount = parsed.score;
          }
        }
      }
    } catch {
      // Ignorer
    }

    if (st === 'won') {
      result.totalWonToday++;
    }

    result[disc] = {
      status: st,
      guessCount,
    };
  });

  return result as FriendDailyScores;
}

/**
 * Récupère les codes d'amis enregistrés localement
 * Règle d'or : Tout joueur / compte créé a automatiquement le Créateur (Hibouxe, HOOT-HIBOU) en ami par défaut.
 */
export function getStoredFriendCodes(excludeCode?: string): string[] {
  const normExclude = excludeCode?.trim().toUpperCase();
  const isCreatorUser = normExclude === 'HOOT-HIBOU';

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return isCreatorUser ? [] : ['HOOT-HIBOU'];
    }
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let clean = Array.from(new Set(parsed.map((c) => String(c).trim().toUpperCase())));
        if (isCreatorUser) {
          clean = clean.filter((c) => c !== 'HOOT-HIBOU');
        } else if (!clean.includes('HOOT-HIBOU')) {
          // Tout nouvel utilisateur ou visiteur a automatiquement Hibouxe (le Créateur) en compagnon d'accueil
          clean = ['HOOT-HIBOU', ...clean];
        }
        if (normExclude) {
          clean = clean.filter((c) => c !== normExclude);
        }
        return clean;
      }
    }
  } catch {
    // Fallback
  }
  // Par défaut, le Fondateur Hibouxe est présent en guide d'accueil pour les visiteurs (sauf s'il s'agit de lui-même)
  return isCreatorUser ? [] : ['HOOT-HIBOU'];
}

/**
 * Sauvegarde la liste des codes d'amis en local
 */
export function saveStoredFriendCodes(codes: string[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const clean = Array.from(new Set(codes.map((c) => c.trim().toUpperCase())));
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignorer
  }
}

/**
 * Enregistre ou met à jour la présence publique du joueur sur le serveur souverain
 */
export async function registerSelfOnServer(
  profile: UserProfile,
  friendCode: string,
  currentDailyScores = extractCurrentDailyScores()
): Promise<{ success: boolean; player?: FriendPlayer; error?: string }> {
  try {
    const payload = {
      action: 'register',
      friendCode,
      username: profile.username,
      avatarId: profile.avatarId,
      title: profile.title,
      steamId: profile.steam?.steamId || null,
      elo: profile.versusStats?.eloRating || 1000,
      streak: profile.versusStats?.currentStreak || 0,
      dailyScores: currentDailyScores,
    };

    const res = await fetch(`${API_BASE}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Erreur serveur HTTP ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Réseau indisponible.' };
  }
}

/**
 * Récupère les profils à jour des amis depuis l'API
 */
export async function fetchFriendsData(friendCodes: string[], excludeCode?: string): Promise<FriendPlayer[]> {
  const normExclude = excludeCode?.trim().toUpperCase();
  const cleanedCodes = friendCodes
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c && (!normExclude || c !== normExclude));

  if (cleanedCodes.length === 0) return [];

  try {
    const res = await fetch(`${API_BASE}?action=get_friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: cleanedCodes }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.friends)) {
        return normExclude
          ? data.friends.filter((f: FriendPlayer) => f.friendCode?.trim().toUpperCase() !== normExclude)
          : data.friends;
      }
    }
  } catch (err) {
    console.warn('Impossible de joindre le serveur d’amis, repli local :', err);
  }

  // Fallback si hors ligne ou serveur distant momentanément injoignable :
  // Ne renvoie le profil de Hibouxe que s'il a été explicitement demandé et n'est pas le joueur lui-même
  if (cleanedCodes.includes('HOOT-HIBOU') && normExclude !== 'HOOT-HIBOU') {
    return [
      {
        friendCode: 'HOOT-HIBOU',
        username: 'Hibouxe',
        avatarId: 'hibouxe_creator',
        title: '👑 Fondateur du Perchoir',
        steamId: ADMIN_STEAM_ID,
        elo: 1500,
        streak: 120,
        lastActive: '2026-01-01T00:00:00Z',
        isOnline: false,
        dailyScores: extractCurrentDailyScores(),
      },
    ];
  }

  return [];
}

/**
 * Recherche un joueur par son code ami ou son pseudo
 */
export async function lookupFriend(query: string): Promise<{
  success: boolean;
  player?: FriendPlayer;
  error?: string;
}> {
  const clean = query.trim();
  if (!clean) {
    return { success: false, error: 'Veuillez renseigner un code ami ou un pseudonyme.' };
  }

  try {
    const res = await fetch(`${API_BASE}?action=lookup&query=${encodeURIComponent(clean)}`);
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Serveur momentanément indisponible.' };
  }
}

/**
 * Synchronise les amis Steam de l'utilisateur qui jouent également sur Hoot Indie Games
 */
export async function syncSteamFriendsList(mySteamId: string): Promise<{
  success: boolean;
  matchedFriends: FriendPlayer[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}?action=sync_steam_friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamId: mySteamId }),
    });

    const data = await res.json();
    if (data.success && Array.isArray(data.matchedFriends)) {
      return { success: true, matchedFriends: data.matchedFriends };
    }
    return {
      success: false,
      matchedFriends: [],
      error: data.error || 'Aucun ami Steam trouvé pour le moment.',
    };
  } catch (err: any) {
    return {
      success: false,
      matchedFriends: [],
      error: err.message || 'Erreur réseau lors de la synchronisation Steam.',
    };
  }
}
