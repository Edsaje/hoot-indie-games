/**
 * featherEconomy.ts
 * Gestion centralisée de l'économie des Plumes d'Or 🪶 :
 * - Récolte quotidienne (Farm journalier sur les 8 mini-jeux & bonus Grand Chelem)
 * - Solde réel des plumes (Succès + Farm - Dépenses)
 * - Boutique du Sanctuaire (Avatars, Titres, Cadres, Renommage Express)
 * - Règle de carence de 14 jours pour le changement de pseudonyme
 */

import { getChallengeStatusForDate, getTodayDateString } from './streakManager';
import { ADMIN_STEAM_ID } from './usernameValidation';

export const EXPRESS_RENAME_COST = 150;
export const DAILY_GAME_FEATHER_REWARD = 10;
export const DAILY_GRAND_SLAM_BONUS = 25;
export const RENAME_COOLDOWN_DAYS = 14;
export const RENAME_COOLDOWN_MS = RENAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export const STORAGE_BONUS_FEATHERS = 'hoot_bonus_feathers_v1';
export const STORAGE_SPENT_FEATHERS = 'hoot_spent_feathers_v1';
export const STORAGE_CLAIMED_DAILY = 'hoot_claimed_daily_feathers_v1';

export interface DailyClaimRecord {
  claimedGames: string[];
  grandSlamClaimed: boolean;
}

export interface RenameCooldownInfo {
  canChange: boolean;
  daysRemaining: number;
  nextChangeDate: string | null;
}

export interface ShopTitle {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
}

export interface ShopFrame {
  id: string;
  name: string;
  cost: number;
  borderClass: string;
  glowClass: string;
  previewColor: string;
  description: string;
}

export const SHOP_TITLES: ShopTitle[] = [
  {
    id: 'title_gem_hunter',
    name: 'Dénicheur de Pépites',
    cost: 120,
    icon: '💎',
    description: 'Pour ceux dont l’œil avisé sait repérer les trésors méconnus de la scène indépendante.',
  },
  {
    id: 'title_pixel_master',
    name: 'Maître du Pixel',
    cost: 180,
    icon: '🎨',
    description: 'La basse résolution et l’esthétique 8-bit / 16-bit n’ont aucun secret pour vous.',
  },
  {
    id: 'title_melody_owl',
    name: 'Mélomane du Perchoir',
    cost: 250,
    icon: '🎵',
    description: 'Capable d’identifier une bande originale indé culte dès les premières notes.',
  },
  {
    id: 'title_summit_explorer',
    name: 'Explorateur des Cimes',
    cost: 350,
    icon: '🏔️',
    description: 'A bravé le froid et les plateformes vertigineuses pour contempler la canopée.',
  },
  {
    id: 'title_grand_duc',
    name: 'Grand-Duc Sylvestre',
    cost: 600,
    icon: '👑',
    description: 'Titre de haute distinction décerné par les gardiens de la forêt nocturne.',
  },
];

export const SHOP_FRAMES: ShopFrame[] = [
  {
    id: 'frame_wood',
    name: 'Écorce Sylvestre',
    cost: 0, // Inclus par défaut
    borderClass: 'border-[#78350f]',
    glowClass: 'shadow-md shadow-black/60',
    previewColor: 'from-[#78350f] to-[#451a03]',
    description: 'Cadre classique en bois noble et feuillages d’angle, symbole du sanctuaire.',
  },
  {
    id: 'frame_celestial_gold',
    name: 'Liseré Doré Céleste',
    cost: 300,
    borderClass: 'border-amber-400 ring-2 ring-amber-300/40',
    glowClass: 'shadow-lg shadow-amber-500/30 animate-pulse',
    previewColor: 'from-amber-400 via-yellow-300 to-amber-600',
    description: 'Halo étincelant aux reflets solaires pour illuminer votre présence.',
  },
  {
    id: 'frame_neon_synthwave',
    name: 'Néon Synthwave 80s',
    cost: 450,
    borderClass: 'border-cyan-400 ring-2 ring-fuchsia-500/50',
    glowClass: 'shadow-lg shadow-cyan-500/40',
    previewColor: 'from-cyan-400 via-fuchsia-500 to-purple-600',
    description: 'Bordure rétro-futuriste vibrante aux couleurs de l’arcade vintage.',
  },
  {
    id: 'frame_dark_emerald',
    name: 'Émeraude Profonde',
    cost: 650,
    borderClass: 'border-emerald-400 ring-2 ring-emerald-500/50',
    glowClass: 'shadow-xl shadow-emerald-500/30',
    previewColor: 'from-emerald-400 via-teal-600 to-green-900',
    description: 'Gemme sylvestre scintillante infusée des spores bioluminescentes des bois.',
  },
];

export function getFrameDefinition(frameId?: string): ShopFrame {
  return SHOP_FRAMES.find((f) => f.id === frameId) || SHOP_FRAMES[0];
}

/**
 * Calcul de la période de carence de 14 jours pour le changement de pseudonyme.
 * L'administrateur / créateur (Quentin Beaud) est exempté en permanence.
 */
export function getRenameCooldownInfo(lastChangedAt?: string, isAdmin?: boolean): RenameCooldownInfo {
  if (isAdmin || !lastChangedAt) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }

  const lastTime = new Date(lastChangedAt).getTime();
  if (isNaN(lastTime)) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }

  const nextTime = lastTime + RENAME_COOLDOWN_MS;
  const now = Date.now();
  if (now >= nextTime) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }

  const diffMs = nextTime - now;
  const daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const nextDate = new Date(nextTime);

  return {
    canChange: false,
    daysRemaining,
    nextChangeDate: nextDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

/**
 * Vérifie si le compte utilisateur actif en local est l'administrateur / créateur officiel.
 */
export function isLocalAdminProfile(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    if (localStorage.getItem('hoot_dev_admin') === 'true') return true;
    const raw = localStorage.getItem('hoot_user_profile_v1');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    // 1. Adresse email authentifiée officielle du créateur
    if (parsed.email && parsed.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr') {
      return true;
    }
    // 2. Steam ID officiel du créateur
    if (parsed.steam?.steamId && String(parsed.steam.steamId).trim() === ADMIN_STEAM_ID) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Formate le solde de plumes pour l'affichage :
 * Affiche le symbole '∞' si le compte dispose de plumes infinies (compte administrateur/créateur),
 * sinon formate le nombre avec séparateurs de milliers.
 */
export function formatFeathers(amount: number): string {
  if (amount === Infinity || !isFinite(amount) || amount >= 999999999) {
    return '∞';
  }
  return amount.toLocaleString();
}

/**
 * Calcule le solde disponible en Plumes d'Or :
 * Solde = (Plumes de Succès) + (Plumes de Farm Quotidien) - (Dépenses en Boutique)
 * Le compte administrateur officiel dispose en permanence de plumes infinies (Infinity).
 */
export function getFeathersBalance(baseAchievementsFeathers: number, isAdmin?: boolean): number {
  if (isAdmin || isLocalAdminProfile()) {
    return Infinity;
  }
  if (typeof window === 'undefined' || !window.localStorage) {
    return baseAchievementsFeathers;
  }
  try {
    const bonus = Number(localStorage.getItem(STORAGE_BONUS_FEATHERS) || '0');
    const spent = Number(localStorage.getItem(STORAGE_SPENT_FEATHERS) || '0');
    return Math.max(0, baseAchievementsFeathers + bonus - spent);
  } catch {
    return baseAchievementsFeathers;
  }
}

/**
 * Ajoute des plumes bonus (Farm journalier, primes, codes spéciaux).
 */
export function addBonusFeathers(amount: number, reason?: string): void {
  if (amount <= 0 || typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = Number(localStorage.getItem(STORAGE_BONUS_FEATHERS) || '0');
    const next = current + amount;
    localStorage.setItem(STORAGE_BONUS_FEATHERS, String(next));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hoot_feathers_updated'));
    }
    if (reason) {
      console.log(`[FeatherEconomy] +${amount} plumes attribuées (${reason}). Total bonus: ${next}`);
    }
  } catch (err) {
    console.warn('[FeatherEconomy] Erreur sauvegarde plumes bonus:', err);
  }
}

/**
 * Dépense des plumes dans la boutique. Retourne true si le solde était suffisant.
 * Pour le compte administrateur (ou si solde infini), la transaction est toujours validée sans déduction.
 */
export function spendFeathers(amount: number, currentFeathersBalance: number, reason?: string): boolean {
  if (amount <= 0) return true;
  if (currentFeathersBalance === Infinity || !isFinite(currentFeathersBalance) || isLocalAdminProfile()) {
    if (reason) {
      console.log(`[FeatherEconomy] Privilège Admin : transaction gratuite (${reason}). Solde infini préservé 🪶✨`);
    }
    return true;
  }
  if (currentFeathersBalance < amount) return false;
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const currentSpent = Number(localStorage.getItem(STORAGE_SPENT_FEATHERS) || '0');
    const nextSpent = currentSpent + amount;
    localStorage.setItem(STORAGE_SPENT_FEATHERS, String(nextSpent));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hoot_feathers_updated'));
    }
    if (reason) {
      console.log(`[FeatherEconomy] -${amount} plumes dépensées (${reason}). Total dépensé: ${nextSpent}`);
    }
    return true;
  } catch (err) {
    console.warn('[FeatherEconomy] Erreur sauvegarde dépense plumes:', err);
    return false;
  }
}

/**
 * Récupère le registre des récompenses quotidiennes réclamées pour une date donnée.
 */
export function getClaimedDailyFeathers(dateStr: string): DailyClaimRecord {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { claimedGames: [], grandSlamClaimed: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_CLAIMED_DAILY);
    if (!raw) return { claimedGames: [], grandSlamClaimed: false };
    const all = JSON.parse(raw);
    if (!all || typeof all !== 'object' || Array.isArray(all)) {
      return { claimedGames: [], grandSlamClaimed: false };
    }
    const day = all[dateStr];
    if (!day) return { claimedGames: [], grandSlamClaimed: false };
    return {
      claimedGames: Array.isArray(day.claimedGames) ? day.claimedGames : [],
      grandSlamClaimed: Boolean(day.grandSlamClaimed),
    };
  } catch {
    return { claimedGames: [], grandSlamClaimed: false };
  }
}

/**
 * Sauvegarde le registre des récompenses quotidiennes.
 */
function saveClaimedDailyFeathers(dateStr: string, record: DailyClaimRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(STORAGE_CLAIMED_DAILY);
    let all: Record<string, DailyClaimRecord> = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          all = parsed;
        }
      } catch {
        // Fallback vide
      }
    }
    all[dateStr] = {
      claimedGames: Array.from(new Set(record.claimedGames)),
      grandSlamClaimed: Boolean(record.grandSlamClaimed),
    };
    localStorage.setItem(STORAGE_CLAIMED_DAILY, JSON.stringify(all));
  } catch (err) {
    console.warn('[FeatherEconomy] Erreur sauvegarde farm journalier:', err);
  }
}

export const ALL_DAILY_GAMES = [
  'screenle',
  'indledle',
  'linkle',
  'profille',
  'chrono',
  'pixel',
  'review',
  'blindtest',
];

/**
 * Vérifie l'ensemble des 8 mini-jeux pour la date donnée, attribue automatiquement
 * +10 Plumes pour chaque jeu victorieux non encore réclamé, et +25 Plumes si Grand Chelem.
 */
export function checkAndClaimAllPendingDailyRewards(
  dateStr = getTodayDateString()
): { totalAwarded: number; newGames: string[]; grandSlamAwarded: boolean } {
  const currentStatus = getChallengeStatusForDate(dateStr);
  const claimedRecord = getClaimedDailyFeathers(dateStr);

  const newGames: string[] = [];
  let totalAwarded = 0;

  for (const gameKey of ALL_DAILY_GAMES) {
    const status = currentStatus[gameKey as keyof typeof currentStatus];
    if (status === 'won' && !claimedRecord.claimedGames.includes(gameKey)) {
      newGames.push(gameKey);
      claimedRecord.claimedGames.push(gameKey);
      totalAwarded += DAILY_GAME_FEATHER_REWARD;
    }
  }

  // Vérification Grand Chelem (les 8 jeux résolus le même jour)
  let grandSlamAwarded = false;
  const allEightWon = ALL_DAILY_GAMES.every(
    (g) => currentStatus[g as keyof typeof currentStatus] === 'won'
  );

  if (allEightWon && !claimedRecord.grandSlamClaimed) {
    claimedRecord.grandSlamClaimed = true;
    grandSlamAwarded = true;
    totalAwarded += DAILY_GRAND_SLAM_BONUS;
  }

  if (totalAwarded > 0) {
    saveClaimedDailyFeathers(dateStr, claimedRecord);
    addBonusFeathers(
      totalAwarded,
      `Farm journalier ${dateStr} (${newGames.join(', ')}${grandSlamAwarded ? ' + Grand Chelem' : ''})`
    );
  }

  return { totalAwarded, newGames, grandSlamAwarded };
}
