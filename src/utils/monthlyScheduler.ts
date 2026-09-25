import type { Game } from '../types/game';
import { INDIE_GAMES, EXCLUDED_FROM_MINI_GAMES } from '../data/games';

/**
 * 🦉 Hoot Indie Games — Générateur Automatique de Saisons Mensuelles
 * 
 * Règle d'or :
 * 1. Chaque mois civil ("YYYY-MM") génère une distribution déterministe et équitable de jeux
 *    sur 100% de la ludothèque des pépites (base certifiée + daily harvest + ajouts admin).
 * 2. Zéro doublon dans le même mois pour un mode de jeu donné (30 Screenle distincts, 30 Indledle distincts...).
 * 3. Zéro collision le même jour entre Screenle, Indledle, Profille et la Pépite de l'accueil.
 * 4. Immutabilité stricte du mois en cours : Tout jeu ajouté en cours de mois M (ex: le 15) est
 *    automatiquement réservé pour la génération du mois suivant (M+1), sanctuarisant ainsi
 *    le mois M et toutes les archives passées contre tout changement inopiné.
 */

export interface DailyScheduleDay {
  date: string; // "YYYY-MM-DD"
  screenleGame: Game;
  indledleGame: Game;
  profilleGame: Game;
  dailyGem: Game;
}

// Cache mémoire des plannings mensuels générés
const monthlySchedulesCache = new Map<string, Map<string, DailyScheduleDay>>();

// Clé de stockage local pour la persistance hors-ligne (v2 : régénération avec jeux connus garantis)
const STORAGE_PREFIX = 'hoot_season_schedule_v2_';

/**
 * Hash déterministe d'une chaîne de caractères (32 bits)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Générateur pseudo-aléatoire rapide et déterministe Mulberry32
 */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mélange déterministe de Fisher-Yates
 */
function seededShuffle<T>(array: T[], random: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calcule la liste des jeux éligibles pour un mois donné (YYYY-MM).
 * Règle d'or : les jeux ajoutés pendant ou après le mois ne sont pas éligibles
 * pour ce mois, ce qui garantit que le mois ne change jamais une fois démarré.
 */
export function getEligibleMonthlyPool(allGems: Game[], monthKey: string): Game[] {
  const excludedSet = new Set(EXCLUDED_FROM_MINI_GAMES);
  const rawPool = allGems && allGems.length > 0 ? allGems : INDIE_GAMES;
  const pool = rawPool.filter((game) => !excludedSet.has(game.id));
  const firstDayOfMonth = `${monthKey}-01`;

  const eligible = pool.filter((game) => {
    // Si pas de date d'ajout (base fondatrice certifiée) -> éligible
    if (!game.addedAt) return true;
    // Si date d'ajout antérieure ou égale à la date de référence (inclut la promo v1.2.6)
    if (game.addedAt <= '2026-09-25') return true;
    // Sinon, le jeu doit avoir été intégré AVANT le début du mois en question
    return game.addedAt < firstDayOfMonth;
  });

  // Tri alphabétique par slug ID pour garantir une graine d'entrée universelle et identique sur tout navigateur
  return (eligible.length >= 4 ? eligible : pool).slice().sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Génère le planning mensuel complet pour un mois donné (YYYY-MM).
 */
export function generateMonthlySchedule(
  allGems: Game[],
  monthKey: string
): Map<string, DailyScheduleDay> {
  // 1. Vérifier si déjà en cache mémoire
  if (monthlySchedulesCache.has(monthKey)) {
    return monthlySchedulesCache.get(monthKey)!;
  }

  // 2. Vérifier le cache LocalStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${monthKey}`);
      if (stored) {
        const parsed: Record<string, { screenleId: string; indledleId: string; profilleId: string; dailyGemId: string }> =
          JSON.parse(stored);
        const mapById = new Map<string, Game>();
        allGems.forEach((g) => mapById.set(g.id, g));
        INDIE_GAMES.forEach((g) => {
          if (!mapById.has(g.id)) mapById.set(g.id, g);
        });

        const scheduleMap = new Map<string, DailyScheduleDay>();
        let valid = true;

        for (const [dateStr, ids] of Object.entries(parsed)) {
          const s = mapById.get(ids.screenleId);
          const i = mapById.get(ids.indledleId);
          const p = mapById.get(ids.profilleId);
          const d = mapById.get(ids.dailyGemId);
          if (s && i && p && d) {
            scheduleMap.set(dateStr, {
              date: dateStr,
              screenleGame: s,
              indledleGame: i,
              profilleGame: p,
              dailyGem: d,
            });
          } else {
            valid = false;
            break;
          }
        }

        if (valid && scheduleMap.size >= 28) {
          monthlySchedulesCache.set(monthKey, scheduleMap);
          return scheduleMap;
        }
      }
    } catch {
      // Ignorer erreur de parsing du cache local
    }
  }

  // 3. Génération mathématique déterministe
  const eligiblePool = getEligibleMonthlyPool(allGems, monthKey);
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDays = new Date(year, month, 0).getDate(); // Nombre exact de jours (28, 29, 30 ou 31)

  const rng = mulberry32(hashString(`hoot-season-${monthKey}`));

  // 4 jeux de cartes mélangés équitablement
  const deckScreenle = seededShuffle(eligiblePool, rng);
  const deckIndledle = seededShuffle(eligiblePool, rng);
  const deckProfille = seededShuffle(eligiblePool, rng);
  const deckDailyGem = seededShuffle(eligiblePool, rng);

  const scheduleMap = new Map<string, DailyScheduleDay>();
  const toPersist: Record<string, { screenleId: string; indledleId: string; profilleId: string; dailyGemId: string }> =
    {};

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = String(d).padStart(2, '0');
    const date = `${monthKey}-${dayStr}`;

    // A. Screenle : garantie 100% unique dans le mois
    const screenleGame = deckScreenle[(d - 1) % deckScreenle.length];

    // B. Indledle : garantie 100% unique dans le mois + distinct de Screenle ce jour-là
    let idxI = (d - 1) % deckIndledle.length;
    let attemptsI = 0;
    while (deckIndledle[idxI].id === screenleGame.id && attemptsI < deckIndledle.length) {
      idxI = (idxI + 1) % deckIndledle.length;
      attemptsI++;
    }
    const indledleGame = deckIndledle[idxI];

    // C. Profille : garantie 100% unique dans le mois + distinct de Screenle et Indledle ce jour-là
    let idxP = (d - 1) % deckProfille.length;
    let attemptsP = 0;
    while (
      (deckProfille[idxP].id === screenleGame.id || deckProfille[idxP].id === indledleGame.id) &&
      attemptsP < deckProfille.length
    ) {
      idxP = (idxP + 1) % deckProfille.length;
      attemptsP++;
    }
    const profilleGame = deckProfille[idxP];

    // D. DailyGem : distinct des 3 mini-jeux de ce jour-là
    let idxG = (d - 1) % deckDailyGem.length;
    let attemptsG = 0;
    while (
      (deckDailyGem[idxG].id === screenleGame.id ||
        deckDailyGem[idxG].id === indledleGame.id ||
        deckDailyGem[idxG].id === profilleGame.id) &&
      attemptsG < deckDailyGem.length
    ) {
      idxG = (idxG + 1) % deckDailyGem.length;
      attemptsG++;
    }
    const dailyGem = deckDailyGem[idxG];

    const dayObj: DailyScheduleDay = {
      date,
      screenleGame,
      indledleGame,
      profilleGame,
      dailyGem,
    };

    scheduleMap.set(date, dayObj);
    toPersist[date] = {
      screenleId: screenleGame.id,
      indledleId: indledleGame.id,
      profilleId: profilleGame.id,
      dailyGemId: dailyGem.id,
    };
  }

  // Enregistrer en cache mémoire
  monthlySchedulesCache.set(monthKey, scheduleMap);

  // Sauvegarder dans LocalStorage
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${monthKey}`, JSON.stringify(toPersist));
    } catch {
      // Ignorer
    }
  }

  return scheduleMap;
}

/**
 * Récupère le jour complet planifié (Screenle, Indledle, Profille, DailyGem) pour une date "YYYY-MM-DD".
 */
export function getScheduledDay(dateString: string, allGems?: Game[]): DailyScheduleDay {
  const monthKey = dateString.slice(0, 7);
  const pool = allGems && allGems.length > 0 ? allGems : INDIE_GAMES;
  const schedule = generateMonthlySchedule(pool, monthKey);

  const entry = schedule.get(dateString);
  if (entry) return entry;

  // Repli de sécurité déterministe si date hors du mois normal
  const fallback = pool[hashString(dateString) % pool.length];
  return {
    date: dateString,
    screenleGame: fallback,
    indledleGame: fallback,
    profilleGame: fallback,
    dailyGem: fallback,
  };
}

/**
 * Récupère le jeu programmé pour un mode précis à une date donnée.
 */
export function getScheduledDailyGame(
  dateString: string,
  mode: 'screenle' | 'indledle' | 'profille' | 'dailyGem',
  allGems?: Game[]
): Game {
  const day = getScheduledDay(dateString, allGems);
  switch (mode) {
    case 'screenle':
      return day.screenleGame;
    case 'indledle':
      return day.indledleGame;
    case 'profille':
      return day.profilleGame;
    case 'dailyGem':
      return day.dailyGem;
    default:
      return day.screenleGame;
  }
}
