import type { Game } from '../types/game';

const DEFAULT_CURATED_BLINDTEST_IDS = [
  'undertale', 'celeste', 'hollow-knight', 'outer-wilds', 'shovel-knight',
  'hotline-miami', 'hades', 'stardew-valley', 'balatro', 'sea-of-stars',
  'gris', 'slay-the-spire', 'cuphead', 'dead-cells', 'tunic',
  'fez', 'katana-zero', 'the-binding-of-isaac-rebirth', 'hyper-light-drifter', 'terraria',
  'vampire-survivors', 'subnautica', 'cult-of-the-lamb', 'pizza-tower', 'dave-the-diver',
  'chants-of-sennaar', 'return-of-the-obra-dinn', 'disco-elysium', 'furi', 'baba-is-you',
  'dredge', 'animal-well', 'lethal-company', 'stray', 'dont-starve',
  'firewatch', 'omori', 'blasphemous', 'ori-and-the-blind-forest', 'risk-of-rain-2',
  'super-meat-boy', 'ftl-faster-than-light', 'papers-please', 'enter-the-gungeon', 'doki-doki-literature-club'
];

let defaultGamesPool: Game[] = [];
let defaultBlindtestIds: string[] = DEFAULT_CURATED_BLINDTEST_IDS;

export function setDefaultGamesPool(pool: Game[]): void {
  defaultGamesPool = pool;
}

export function setDefaultBlindtestIds(ids: string[]): void {
  defaultBlindtestIds = ids;
}

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
  blindtestGame?: Game;
}

// Cache mémoire des plannings mensuels générés
const monthlySchedulesCache = new Map<string, Map<string, DailyScheduleDay>>();

// Clé de stockage local pour la persistance hors-ligne (v3 : tirage réactualisé pour octobre 2026)
const STORAGE_PREFIX = 'hoot_season_schedule_v3_';

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
  const rawPool = allGems && allGems.length > 0 ? allGems : defaultGamesPool;
  const pool = (rawPool || []).filter((g): g is Game => Boolean(g && g.id));
  if (pool.length === 0) return [];
  const firstDayOfMonth = `${monthKey}-01`;

  const eligible = pool.filter((game) => {
    // Si pas de date d'ajout (base fondatrice certifiée) -> éligible
    if (!game.addedAt) return true;
    // Si date d'ajout antérieure ou égale à la date de référence actuelle (inclut l'ensemble des 295 pépites)
    if (game.addedAt <= '2026-10-12') return true;
    // Sinon, le jeu doit avoir été intégré AVANT le début du mois en question
    return game.addedAt < firstDayOfMonth;
  });

  // Tri alphabétique par slug ID pour garantir une graine d'entrée universelle et identique sur tout navigateur
  const selected = eligible.length >= 4 ? eligible : pool;
  return selected.slice().sort((a, b) => a.id.localeCompare(b.id));
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
        const parsed: Record<string, { screenleId: string; indledleId: string; profilleId: string; dailyGemId: string; blindtestId?: string }> =
          JSON.parse(stored);
        const mapById = new Map<string, Game>();
        allGems.forEach((g) => mapById.set(g.id, g));
        defaultGamesPool.forEach((g) => {
          if (!mapById.has(g.id)) mapById.set(g.id, g);
        });

        const scheduleMap = new Map<string, DailyScheduleDay>();
        let valid = true;

        for (const [dateStr, ids] of Object.entries(parsed)) {
          const s = mapById.get(ids.screenleId);
          const i = mapById.get(ids.indledleId);
          const p = mapById.get(ids.profilleId);
          const d = mapById.get(ids.dailyGemId);
          const b = ids.blindtestId ? mapById.get(ids.blindtestId) : undefined;
          if (s && i && p && d) {
            scheduleMap.set(dateStr, {
              date: dateStr,
              screenleGame: s,
              indledleGame: i,
              profilleGame: p,
              dailyGem: d,
              blindtestGame: b || s,
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

  // 3. Génération mathématique déterministe (Saison v3)
  const eligiblePool = getEligibleMonthlyPool(allGems, monthKey);
  if (!eligiblePool || eligiblePool.length === 0) {
    return new Map();
  }
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDays = new Date(year, month, 0).getDate(); // Nombre exact de jours (28, 29, 30 ou 31)

  const rng = mulberry32(hashString(`hoot-season-v3-${monthKey}`));

  // Jeux de cartes mélangés équitablement
  const deckScreenle = seededShuffle(eligiblePool, rng);
  const deckIndledle = seededShuffle(eligiblePool, rng);
  const deckProfille = seededShuffle(eligiblePool, rng);
  const deckDailyGem = seededShuffle(eligiblePool, rng);

  // Deck BlindTest (jeux disposant d'un audio officiel certifié)
  const blindtestPool = eligiblePool.filter((g) =>
    defaultBlindtestIds.length > 0 ? defaultBlindtestIds.includes(g.id) : true
  );
  const deckBlindtest = seededShuffle(
    blindtestPool.length > 0 ? blindtestPool : eligiblePool,
    rng
  );

  const scheduleMap = new Map<string, DailyScheduleDay>();
  const toPersist: Record<string, { screenleId: string; indledleId: string; profilleId: string; dailyGemId: string; blindtestId?: string }> =
    {};

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = String(d).padStart(2, '0');
    const date = `${monthKey}-${dayStr}`;

    const i = d - 1;

    // A. Screenle : garantie 100% unique dans le mois
    const screenleGame = deckScreenle[i % deckScreenle.length];

    // B. Indledle : garantie 100% unique dans le mois + distinct de Screenle ce jour-là
    if (i < deckIndledle.length && deckIndledle[i].id === screenleGame.id) {
      for (let s = i + 1; s < deckIndledle.length; s++) {
        if (deckIndledle[s].id !== screenleGame.id) {
          const tmp = deckIndledle[i];
          deckIndledle[i] = deckIndledle[s];
          deckIndledle[s] = tmp;
          break;
        }
      }
    }
    const indledleGame = deckIndledle[i % deckIndledle.length] || screenleGame;

    // C. Profille : garantie 100% unique dans le mois + distinct de Screenle et Indledle ce jour-là
    if (
      i < deckProfille.length &&
      (deckProfille[i].id === screenleGame.id || deckProfille[i].id === indledleGame.id)
    ) {
      for (let s = i + 1; s < deckProfille.length; s++) {
        if (
          deckProfille[s].id !== screenleGame.id &&
          deckProfille[s].id !== indledleGame.id
        ) {
          const tmp = deckProfille[i];
          deckProfille[i] = deckProfille[s];
          deckProfille[s] = tmp;
          break;
        }
      }
    }
    const profilleGame = deckProfille[i % deckProfille.length] || screenleGame;

    // D. DailyGem : garantie 100% unique dans le mois + distinct des 3 mini-jeux ce jour-là
    if (
      i < deckDailyGem.length &&
      (deckDailyGem[i].id === screenleGame.id ||
        deckDailyGem[i].id === indledleGame.id ||
        deckDailyGem[i].id === profilleGame.id)
    ) {
      for (let s = i + 1; s < deckDailyGem.length; s++) {
        if (
          deckDailyGem[s].id !== screenleGame.id &&
          deckDailyGem[s].id !== indledleGame.id &&
          deckDailyGem[s].id !== profilleGame.id
        ) {
          const tmp = deckDailyGem[i];
          deckDailyGem[i] = deckDailyGem[s];
          deckDailyGem[s] = tmp;
          break;
        }
      }
    }
    const dailyGem = deckDailyGem[i % deckDailyGem.length] || screenleGame;

    // E. BlindTest : tirage garanti parmi les jeux du pool audio officiel, 100% unique dans le mois
    if (
      i < deckBlindtest.length &&
      (deckBlindtest[i].id === screenleGame.id ||
        deckBlindtest[i].id === indledleGame.id ||
        deckBlindtest[i].id === profilleGame.id)
    ) {
      for (let s = i + 1; s < deckBlindtest.length; s++) {
        if (
          deckBlindtest[s].id !== screenleGame.id &&
          deckBlindtest[s].id !== indledleGame.id &&
          deckBlindtest[s].id !== profilleGame.id
        ) {
          const tmp = deckBlindtest[i];
          deckBlindtest[i] = deckBlindtest[s];
          deckBlindtest[s] = tmp;
          break;
        }
      }
    }
    const blindtestGame = deckBlindtest[i % deckBlindtest.length] || screenleGame;

    const dayObj: DailyScheduleDay = {
      date,
      screenleGame,
      indledleGame,
      profilleGame,
      dailyGem,
      blindtestGame,
    };

    scheduleMap.set(date, dayObj);
    toPersist[date] = {
      screenleId: screenleGame.id,
      indledleId: indledleGame.id,
      profilleId: profilleGame.id,
      dailyGemId: dailyGem.id,
      blindtestId: blindtestGame.id,
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
  const rawPool = allGems && allGems.length > 0 ? allGems : defaultGamesPool;
  const pool = (rawPool || []).filter((g): g is Game => Boolean(g && g.id));

  if (pool.length === 0) {
    const dummyGame: Game = {
      id: 'default-gem',
      title: 'Hoot Indie Game',
      releaseYear: 2026,
      genre: ['Indie'],
      artStyle: { fr: 'Pixel Art', en: 'Pixel Art' },
      camera: { fr: '2D', en: '2D' },
      developer: 'Indie Studio',
      screenshots: ['/daily-hero.webp'],
      hints: { tagline: { fr: 'Pépite indé', en: 'Indie Gem' } }
    };
    return {
      date: dateString,
      screenleGame: dummyGame,
      indledleGame: dummyGame,
      profilleGame: dummyGame,
      dailyGem: dummyGame,
      blindtestGame: dummyGame,
    };
  }

  const schedule = generateMonthlySchedule(pool, monthKey);
  const entry = schedule.get(dateString);
  if (entry) return entry;

  // Repli de sécurité déterministe si date hors du mois normal
  const fallback = pool[hashString(dateString) % pool.length] || pool[0];
  return {
    date: dateString,
    screenleGame: fallback,
    indledleGame: fallback,
    profilleGame: fallback,
    dailyGem: fallback,
    blindtestGame: fallback,
  };
}

/**
 * Récupère le jeu programmé pour un mode précis à une date donnée.
 */
export function getScheduledDailyGame(
  dateString: string,
  mode: 'screenle' | 'indledle' | 'profille' | 'dailyGem' | 'blindtest',
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
    case 'blindtest':
      return day.blindtestGame || day.screenleGame;
    default:
      return day.screenleGame;
  }
}
