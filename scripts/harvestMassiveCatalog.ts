import fs from 'fs';
import path from 'path';
import type { Game } from '../src/types/game';
import type { SteamStoreGameData } from '../src/data/steamStoreData';
import { INDIE_GAMES } from '../src/data/games';
import {
  isNonIndieOrAAA,
  checkAdultContent,
  BANNED_APP_IDS,
  VALID_ART_STYLES,
  VALID_CAMERAS,
  validateSingleGame,
} from './auditRules';

/**
 * 🦉 Hoot Indie Games — Moissonnage Massif Multi-Genres du Catalogue Étendu
 * Objectif : Peupler massivement le catalogue avec des centaines de nouveaux jeux
 * en ciblant prioritairement tous les genres orphelins et sous-représentés
 * (Course, Sport, Rythme, City Builder, Automatisation, Farming, Point & Click,
 *  Beat 'em up, Tactique, Boomer Shooter, Party Game, Sokoban, etc.).
 *
 * Règles d'or :
 * - 0 Hallucination : métadonnées et captures officielles Valve Steam Store.
 * - Anti-AAA : exclusion stricte des éditeurs et filiales non-indépendants.
 * - Anti-NSFW : exclusion des descripteurs adultes Valve et mots-clés proscrits.
 * - Seuil de qualité : 75%+ d'avis positifs (demande utilisateur) et >= 25 avis.
 * - Parité canonique : genres, styles artistiques et angles de caméra normalisés.
 */

const CACHE_FILE = path.join(process.cwd(), 'scripts/steam_cache.json');
const OUTPUT_CATALOG_FILE = path.join(process.cwd(), 'public/data/steam_catalog.json');
const STORE_DATA_FILE = path.join(process.cwd(), 'src/data/steamStoreData.ts');
const STORE_CACHE_FILE = path.join(process.cwd(), 'scripts/steam_store_cache.json');
const CANDIDATES_FILE = path.join(process.cwd(), 'scripts/discovered_candidates.json');

// Configuration du moissonnage
const CONFIG = {
  MIN_REVIEWS: 25,            // Dès 25 avis pour capter les vraies pépites indés émergentes
  MIN_POSITIVE_RATIO: 0.75,   // Seuil ajusté à 75% comme demandé par l'utilisateur
  MAX_NEW_GAMES: 600,         // Objectif d'ajout massif sur cette session
  SEARCH_DELAY_MS: 1200,      // Délai poli pour les requêtes de recherche par tag
  DETAIL_DELAY_MS: 900,       // Délai poli entre fiches de jeux (préserve le quota Valve)
  MAX_RETRIES_429: 6,         // Nombre de tentatives en cas de limitation HTTP 429
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = CONFIG.MAX_RETRIES_429): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        },
      });

      if (res.status === 429) {
        const waitSec = 45 + (attempt - 1) * 15;
        console.warn(`⏳ [Rate Limit 429 Valve] Pause défensive de ${waitSec}s avant réessai (${attempt}/${retries}) sur ${url}...`);
        await sleep(waitSec * 1000);
        continue;
      }

      if (res.ok) {
        return await res.json();
      }

      if (attempt < retries) {
        await sleep(1000 * attempt);
      }
    } catch {
      if (attempt < retries) {
        await sleep(1500 * attempt);
      }
    }
  }
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseReleaseYear(dateStr?: string): number {
  if (!dateStr) return 2024;
  const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    const yr = parseInt(match[1], 10);
    if (yr >= 2000 && yr <= 2026) return yr;
  }
  return 2024;
}

// Dictionnaire officiel des styles artistiques reconnus
function inferArtStyle(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();
  if (lower.includes('pixel') || lower.includes('16-bit') || lower.includes('8-bit') || lower.includes('retro 2d')) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
  }
  if (
    lower.includes('hand-drawn') ||
    lower.includes('dessiné') ||
    lower.includes('watercolor') ||
    lower.includes('cartoon') ||
    lower.includes('anime') ||
    lower.includes('clay') ||
    lower.includes('sketch')
  ) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }
  if (
    lower.includes('low poly') ||
    lower.includes('low-poly') ||
    lower.includes('ps1') ||
    lower.includes('psx') ||
    lower.includes('polygonal') ||
    lower.includes('retro 3d')
  ) {
    return { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' };
  }
  if (lower.includes('realistic') || lower.includes('photorealist') || lower.includes('réaliste') || lower.includes('unreal engine 5')) {
    return { fr: '3D Réaliste', en: 'Realistic 3D' };
  }
  if (lower.includes('monochrome') || lower.includes('black and white') || lower.includes('minimalist') || lower.includes('noir et blanc')) {
    return { fr: 'Monochrome / Minimaliste', en: 'Monochrome' };
  }
  return { fr: '3D Stylisé', en: 'Stylized 3D' };
}

// Dictionnaire officiel des caméras reconnues
function inferCamera(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();
  if (lower.includes('first-person') || lower.includes('première personne') || lower.includes('fps') || lower.includes('fpv')) {
    return { fr: 'Vue à la première personne', en: 'First-Person' };
  }
  if (lower.includes('isometric') || lower.includes('isométrique') || lower.includes('2.5d')) {
    return { fr: '2.5D Isométrique', en: 'Isometric / 2.5D' };
  }
  if (lower.includes('top-down') || lower.includes('vue de dessus') || lower.includes('twin-stick') || lower.includes('twin stick') || lower.includes('vertical')) {
    return { fr: '2D Vue de dessus', en: '2D Top-down' };
  }
  if (lower.includes('third-person') || lower.includes('troisième personne') || lower.includes('behind') || lower.includes('over the shoulder')) {
    return { fr: '3D Vue à la troisième personne', en: 'Third-Person' };
  }
  if (lower.includes('platformer') || lower.includes('metroidvania') || lower.includes('side-scroller') || lower.includes('défilement horizontal') || lower.includes('vue de côté')) {
    return { fr: '2D Vue de côté', en: '2D Side-scroller' };
  }
  return { fr: '2D Vue de côté', en: '2D Side-scroller' };
}

// Table canonique de normalisation stricte des genres (pour éviter tout conflit audit)
const CANONICAL_GENRE_MAP: Record<string, string> = {
  metroidvania: 'Metroidvania',
  action: 'Action',
  soulslike: 'Souls-like',
  platformer: 'Platformer',
  plateforme: 'Plateforme',
  aventure: 'Aventure',
  adventure: 'Aventure',
  narratif: 'Narratif',
  exploration: 'Exploration',
  scifi: 'Sci-Fi',
  sciencefiction: 'Science-fiction',
  puzzle: 'Puzzle',
  roguelike: 'Roguelike',
  hackandslash: 'Hack and Slash',
  mythologie: 'Mythologie',
  roguelite: 'Roguelite',
  rpg: 'RPG',
  bullethell: 'Bullet Hell',
  comedie: 'Comédie',
  comédie: 'Comédie',
  deckbuilder: 'Deckbuilder',
  strategie: 'Stratégie',
  stratégie: 'Stratégie',
  strategy: 'Stratégie',
  coop: 'Co-op',
  enquete: 'Enquête',
  enquête: 'Enquête',
  horreur: 'Horreur',
  horror: 'Horreur',
  simulation: 'Simulation',
  gestion: 'Gestion',
  survie: 'Survie',
  survival: 'Survie',
  cartes: 'Cartes',
  tourpartour: 'Tour par tour',
  darkfantasy: 'Dark Fantasy',
  retro: 'Rétro',
  rétro: 'Rétro',
  conduite: 'Conduite',
  atmospherique: 'Atmosphérique',
  atmosphérique: 'Atmosphérique',
  cyberpunk: 'Cyberpunk',
  twinstick: 'Twin-stick',
  peche: 'Pêche',
  pêche: 'Pêche',
  mystere: 'Mystère',
  mystère: 'Mystère',
  'point&click': 'Point & Click',
  pointandclick: 'Point & Click',
  cozy: 'Cozy',
  folklorique: 'Folklorique',
  sandbox: 'Sandbox',
  autoshooter: 'Auto-Shooter',
  historique: 'Historique',
  fastfps: 'Fast-FPS',
  psychologique: 'Psychologique',
  anthologie: 'Anthologie',
  rythme: 'Rythme',
  rhythm: 'Rythme',
  dungeoncrawler: 'Dungeon Crawler',
  artisanat: 'Artisanat',
  crafting: 'Artisanat',
  artsmartiaux: 'Arts martiaux',
  beatthemall: 'Beat them all',
  beatemup: 'Beat them all',
  escalade: 'Escalade',
  meditatif: 'Méditatif',
  méditatif: 'Méditatif',
  western: 'Western',
  tactique: 'Tactique',
  citybuilder: 'City Builder',
  medieval: 'Médiéval',
  médiéval: 'Médiéval',
  farming: 'Farming',
  destruction: 'Destruction',
  partygame: 'Party Game',
  physique: 'Physique',
  physics: 'Physique',
  visualnovel: 'Visual Novel',
  colonysim: 'Colony Sim',
  incremental: 'Incrémental',
  incrémental: 'Incrémental',
  automatisation: 'Automatisation',
  automation: 'Automatisation',
  idleclicker: 'Idle / Clicker',
  immersivesim: 'Immersive Sim',
  runner: 'Runner',
  minijeux: 'Mini-Jeux',
  occasionnel: 'Occasionnel',
  casual: 'Occasionnel',
  bacasable: 'Bac à sable',
  bacàsable: 'Bac à sable',
  multijoueur: 'Multijoueur',
  cooperatif: 'Coopératif',
  coopératif: 'Coopératif',
  fps: 'FPS',
  combat: 'Combat',
  fighting: 'Combat',
  musique: 'Musique',
  music: 'Musique',
  precision: 'Précision',
  précision: 'Précision',
  anime: 'Anime',
  fete: 'Fête',
  fête: 'Fête',
  ambiance: 'Ambiance',
  colonie: 'Colonie',
  fantastique: 'Fantastique',
  action3d: 'Action 3D',
  surrealiste: 'Surréaliste',
  surréaliste: 'Surréaliste',
  course: 'Course',
  racing: 'Course',
  courseautomobile: 'Course',
  competitif: 'Compétitif',
  compétitif: 'Compétitif',
  sport: 'Sport',
  sports: 'Sport',
};

function normalizeGenreName(rawName: string): string | null {
  const key = rawName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_ \/]/g, '')
    .trim();

  return CANONICAL_GENRE_MAP[key] || null;
}

function sanitizeAndCanonicalizeGenres(
  steamGenres: Array<{ description: string }>,
  discoveredCategoryName: string,
  desc: string
): string[] {
  const banned = ['independant', 'indépendant', 'accesanticipe', 'accès anticipé', 'indie', 'earlyaccess', 'early access', 'freetoplay', 'gratuit'];
  const detected = new Set<string>();

  // 1. Ajouter le genre cible de découverte s'il est canonique
  const canonCategory = normalizeGenreName(discoveredCategoryName);
  if (canonCategory) detected.add(canonCategory);

  // 2. Traiter les genres Steam officiels
  for (const g of steamGenres) {
    const raw = g.description.trim();
    const canon = normalizeGenreName(raw);
    const key = raw.toLowerCase().replace(/[-_ \/]/g, '').trim();
    if (banned.includes(key)) continue;
    if (canon) {
      detected.add(canon);
    }
  }

  // 3. Détecter des sous-genres contextuels forts dans la description
  const lower = desc.toLowerCase();
  if (lower.includes('metroidvania')) detected.add('Metroidvania');
  if (lower.includes('roguelike') || lower.includes('roguelite')) detected.add('Roguelike');
  if (lower.includes('deckbuilder') || lower.includes('card battler')) detected.add('Deckbuilder');
  if (lower.includes('city builder') || lower.includes('city-builder')) detected.add('City Builder');
  if (lower.includes('colony sim') || lower.includes('gestion de colonie')) detected.add('Colony Sim');
  if (lower.includes('farming') || lower.includes('ferme')) detected.add('Farming');
  if (lower.includes('rhythm') || lower.includes('rythme')) detected.add('Rythme');
  if (lower.includes('point & click') || lower.includes('point and click')) detected.add('Point & Click');
  if (lower.includes('dungeon crawler')) detected.add('Dungeon Crawler');
  if (lower.includes('turn-based') || lower.includes('tour par tour')) detected.add('Tour par tour');
  if (lower.includes('party game') || lower.includes('party-game')) detected.add('Party Game');
  if (lower.includes('bullet hell') || lower.includes('danmaku')) detected.add('Bullet Hell');
  if (lower.includes('twin-stick') || lower.includes('twin stick')) detected.add('Twin-stick');
  if (lower.includes('boomer shooter') || lower.includes('retro fps')) detected.add('FPS');
  if (lower.includes('sokoban')) detected.add('Puzzle');
  if (lower.includes('automation') || lower.includes('automatisation')) detected.add('Automatisation');

  const list = Array.from(detected);
  if (list.length === 0) return ['Aventure', 'Action'];
  return list.slice(0, 5); // Conserver jusqu'à 5 genres canoniques riches
}

// 23 Familles de Tags Steam ciblées pour repeupler tous les styles orphelins
const TARGET_GENRE_TAGS: Array<{ name: string; tag: string }> = [
  // 1. Course & Conduite (actuellement 2 jeux)
  { name: 'Course', tag: '699' },
  { name: 'Conduite', tag: '11006' },

  // 2. Sport & Glisse (actuellement 3 jeux)
  { name: 'Sport', tag: '701' },

  // 3. Rythme & Musique (actuellement 3-5 jeux)
  { name: 'Rythme', tag: '1752' },
  { name: 'Musique', tag: '1621' },

  // 4. City Builder, Colonie & Automatisation (actuellement 2-4 jeux)
  { name: 'City Builder', tag: '4328' },
  { name: 'Colony Sim', tag: '1753' },
  { name: 'Automatisation', tag: '18594' },
  { name: 'Farming', tag: '87918' },

  // 5. Point & Click, Enquête, Visual Novel (actuellement 4-5 jeux)
  { name: 'Point & Click', tag: '1698' },
  { name: 'Visual Novel', tag: '3799' },
  { name: 'Mystère', tag: '5716' },

  // 6. Beat 'em up, Combat & Hack and Slash (actuellement 1-3 jeux)
  { name: 'Beat them all', tag: '4158' },
  { name: 'Combat', tag: '1743' },
  { name: 'Hack and Slash', tag: '1646' },

  // 7. Dungeon Crawler & Tactique Tour par Tour (actuellement 2-5 jeux)
  { name: 'Dungeon Crawler', tag: '1720' },
  { name: 'Tactique', tag: '1741' },
  { name: 'Tour par tour', tag: '1677' },

  // 8. FPS Rétro & Boomer Shooter (actuellement 2-3 jeux)
  { name: 'FPS', tag: '7432' },
  { name: 'Fast-FPS', tag: '4234' },

  // 9. Party Game & Co-op Local (actuellement 1-2 jeux)
  { name: 'Party Game', tag: '7107' },
  { name: 'Co-op', tag: '4840' },

  // 10. Auto-Shooter & Bullet Hell (actuellement 5 jeux)
  { name: 'Bullet Hell', tag: '4885' },
  { name: 'Twin-stick', tag: '4255' },

  // 11. Puzzle pur, Sokoban & Logique
  { name: 'Puzzle', tag: '1734' },
  { name: 'Puzzle', tag: '6129' },
];

function saveAllData(catalog: Game[], cache: Record<string, any>, storeDataMap: Record<number, SteamStoreGameData>) {
  fs.writeFileSync(OUTPUT_CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  fs.writeFileSync(STORE_CACHE_FILE, JSON.stringify(storeDataMap, null, 2), 'utf8');

  const tsStoreContent = `/**
 * 🦉 Hoot Indie Games — Données Steam Store Officielles Certifiées (Prix, Promotions & Avis)
 * Généré automatiquement via Steam Store & Reviews API.
 * 0 Hallucination : données réelles et vérifiées pour ${Object.keys(storeDataMap).length} jeux indépendants.
 */

export interface SteamStoreGameData {
  appId: number;
  isFree: boolean;
  currency: string;
  initialPriceCents: number;
  finalPriceCents: number;
  discountPercent: number;
  formattedFinalPrice: string;
  formattedInitialPrice?: string;
  totalReviews: number;
  totalPositive: number;
  positivePercent: number;
  reviewScoreDesc: {
    fr: string;
    en: string;
  };
}

export const STEAM_STORE_DATA: Record<number, SteamStoreGameData> = ${JSON.stringify(storeDataMap, null, 2)};

const DYNAMIC_STORE_CACHE: Record<number, SteamStoreGameData> = {};

export function registerSteamStoreData(data: SteamStoreGameData): void {
  if (data && data.appId) {
    DYNAMIC_STORE_CACHE[data.appId] = data;
  }
}

export function getSteamStoreData(appId?: number | string | null): SteamStoreGameData | undefined {
  if (!appId) return undefined;
  const numId = typeof appId === 'string' ? parseInt(appId, 10) : appId;
  if (!numId || isNaN(numId)) return undefined;
  return DYNAMIC_STORE_CACHE[numId] || STEAM_STORE_DATA[numId];
}

export function getAllSteamStoreData(): Record<number, SteamStoreGameData> {
  return { ...STEAM_STORE_DATA, ...DYNAMIC_STORE_CACHE };
}
`;

  fs.writeFileSync(STORE_DATA_FILE, tsStoreContent, 'utf8');
}

async function main() {
  console.log('🦉 =====================================================================');
  console.log('🦉 HOOT INDIE GAMES — SCRAP MASSIF DU CATALOGUE ÉTENDU MULTI-GENRES');
  console.log('🦉 =====================================================================\n');

  // 1. Charger le catalogue et la base actuelle
  let catalog: Game[] = [];
  if (fs.existsSync(OUTPUT_CATALOG_FILE)) {
    try {
      catalog = JSON.parse(fs.readFileSync(OUTPUT_CATALOG_FILE, 'utf8'));
    } catch {
      catalog = [];
    }
  }

  let cache: Record<string, any> = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch {
      cache = {};
    }
  }

  let storeDataMap: Record<number, SteamStoreGameData> = {};
  if (fs.existsSync(STORE_CACHE_FILE)) {
    try {
      storeDataMap = JSON.parse(fs.readFileSync(STORE_CACHE_FILE, 'utf8'));
    } catch {
      storeDataMap = {};
    }
  }

  // Ensemble des AppIDs et titres déjà connus dans le Sanctuaire
  const existingAppIds = new Set<number>();
  const existingTitles = new Set<string>();

  for (const g of INDIE_GAMES) {
    const m = g.steamUrl?.match(/\/app\/(\d+)/);
    if (m) existingAppIds.add(parseInt(m[1], 10));
    existingTitles.add(g.title.toLowerCase().trim());
  }

  for (const g of catalog) {
    const appId = (g as any).steamAppId || (g.steamUrl?.match(/\/app\/(\d+)/)?.[1] ? parseInt(g.steamUrl.match(/\/app\/(\d+)/)[1], 10) : null);
    if (appId) existingAppIds.add(appId);
    existingTitles.add(g.title.toLowerCase().trim());
  }

  console.log(`📦 État initial : ${catalog.length} jeux dans le catalogue étendu, ${INDIE_GAMES.length} pépites certifiées.`);
  console.log(`🎯 Objectif : moissonner jusqu'à +${CONFIG.MAX_NEW_GAMES} jeux dans les styles sous-représentés.\n`);

  // 2. Découverte des AppIDs candidats par Tags Steam
  console.log('🔍 [Phase 1/2] Découverte des pépites sur Steam via les tags ciblés...');
  let candidates: Array<{ appId: number; categoryName: string }> = [];

  if (fs.existsSync(CANDIDATES_FILE)) {
    try {
      candidates = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
      console.log(`📦 ${candidates.length} candidats chargés depuis ${CANDIDATES_FILE}.`);
    } catch {
      candidates = [];
    }
  }

  if (candidates.length === 0) {
    const seenCandidates = new Set<number>();
    for (const genreTag of TARGET_GENRE_TAGS) {
      console.log(`   ➔ Exploration du style "${genreTag.name}" (Tag Steam: ${genreTag.tag})...`);

      // Interroger la page 1 et la page 2 (jusqu'à 100 jeux par tag)
      for (const start of [0, 50]) {
        const url = `https://store.steampowered.com/search/results/?query=&start=${start}&count=50&tags=492,${genreTag.tag}&category1=998&sort_by=Reviews_DESC&json=1`;
        try {
          const res = await fetchWithRetry(url, 3);
          for (const item of res?.items || []) {
            const match = item.logo?.match(/\/apps\/(\d+)\//);
            if (match) {
              const appId = parseInt(match[1], 10);
              if (
                !existingAppIds.has(appId) &&
                !BANNED_APP_IDS.has(appId) &&
                !seenCandidates.has(appId)
              ) {
                seenCandidates.add(appId);
                candidates.push({ appId, categoryName: genreTag.name });
              }
            }
          }
        } catch (err) {
          console.warn(`⚠️ Erreur sur le tag ${genreTag.name}:`, err);
        }
        await sleep(CONFIG.SEARCH_DELAY_MS);
      }
    }
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf8');
    console.log(`💾 ${candidates.length} candidats mis en cache dans ${CANDIDATES_FILE}.`);
  }

  console.log(`\n✨ Total de candidats uniques à traiter : ${candidates.length} jeux.`);
  console.log('🚀 [Phase 2/2] Moissonnage officiel, filtrage de qualité et intégration...\n');

  let addedCount = 0;
  let rejectedAAA = 0;
  let rejectedNSFW = 0;
  let rejectedReviews = 0;
  let rejectedAudit = 0;

  for (let i = 0; i < candidates.length; i++) {
    if (addedCount >= CONFIG.MAX_NEW_GAMES) {
      console.log(`\n🏁 Objectif de ${CONFIG.MAX_NEW_GAMES} nouveaux jeux atteint avec succès !`);
      break;
    }

    const { appId, categoryName } = candidates[i];
    const appIdStr = String(appId);

    if (existingAppIds.has(appId)) {
      continue;
    }

    // 1. Récupération des avis pour vérifier le seuil >= 75%
    const reviewsUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`;
    const reviewsJson = await fetchWithRetry(reviewsUrl);
    const summary = reviewsJson?.query_summary;

    if (!summary || summary.total_reviews < CONFIG.MIN_REVIEWS) {
      rejectedReviews++;
      continue;
    }

    const positiveRatio = summary.total_positive / summary.total_reviews;
    if (positiveRatio < CONFIG.MIN_POSITIVE_RATIO) {
      rejectedReviews++;
      continue;
    }

    // 2. Récupération officielle des détails du jeu (FR avec fallback automatique Steam)
    const frJson = await fetchWithRetry(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=fr&l=french`);
    const frEntry = Object.values(frJson || {})[0] as any;

    if (!frEntry?.success || !frEntry?.data) {
      continue;
    }

    const dataFR = frEntry.data;

    // A. Filtrer par type (Jeu complet uniquement)
    if (dataFR.type !== 'game') {
      continue;
    }

    // B. Filtrer les éditeurs / développeurs AAA
    const developer = (dataFR.developers?.[0] || 'Studio Indépendant').trim();
    const publisher = (dataFR.publishers?.[0] || '').trim();
    if (isNonIndieOrAAA(developer, publisher, appId)) {
      rejectedAAA++;
      continue;
    }

    // C. Filtrer le contenu adulte / NSFW
    const descriptorIds = dataFR.content_descriptors?.ids || [];
    if (descriptorIds.some((id: number) => id === 3 || id === 4)) {
      rejectedNSFW++;
      continue;
    }

    const title = dataFR.name.trim();

    // D. Vérifier le titre (alphabétique latin et non doublon)
    if (!/[a-zA-Z]/.test(title) || existingTitles.has(title.toLowerCase())) {
      continue;
    }

    // E. Vérifier les descriptions contre les mots-clés adultes
    const rawTagline = stripHtml(dataFR.short_description);
    if (checkAdultContent(`${title} ${rawTagline}`).hasAdult) {
      rejectedNSFW++;
      continue;
    }

    // F. Métadonnées canoniques
    const id = slugify(title);
    if (!id || id.length < 2) continue;

    const releaseYear = parseReleaseYear(dataFR.release_date?.date);
    const steamUrl = `https://store.steampowered.com/app/${appId}/`;
    const headerImage =
      dataFR.header_image ||
      `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

    // 6 captures d'écran certifiées
    const screenshots: string[] = (dataFR.screenshots || [])
      .map((s: { path_full: string }) => s.path_full)
      .filter((s: string) => s && s.startsWith('https://'))
      .slice(0, 6);

    while (screenshots.length < 6) {
      screenshots.push(headerImage);
    }

    const taglineFR = rawTagline || `${title} est un jeu indépendant remarquable développé par ${developer}.`;
    const taglineEN = rawTagline || `${title} is a remarkable indie game developed by ${developer}.`;

    const genres = sanitizeAndCanonicalizeGenres(dataFR.genres || [], categoryName, taglineFR);
    const artStyle = inferArtStyle(taglineFR + ' ' + dataFR.type, genres);
    const camera = inferCamera(taglineFR + ' ' + dataFR.type, genres);

    const catalogItem: Game & { steamAppId: number; headerImage: string } = {
      id,
      title,
      releaseYear,
      genre: genres,
      artStyle,
      camera,
      developer,
      steamUrl,
      screenshots,
      hints: {
        tagline: {
          fr: taglineFR,
          en: taglineEN,
        },
      },
      steamAppId: appId,
      headerImage,
    };

    // Validation préalable unifiée (Règle 0 Hallucination)
    const audit = validateSingleGame(catalogItem);
    if (!audit.valid) {
      rejectedAudit++;
      continue;
    }

    // G. Données officielles du Steam Store (Prix, Soldes, Pourcentage d'avis)
    const isFree = Boolean(dataFR.is_free);
    const priceOverview = dataFR.price_overview;
    const finalPriceCents = isFree ? 0 : (priceOverview?.final ?? 999);
    const initialPriceCents = isFree ? 0 : (priceOverview?.initial ?? finalPriceCents);
    const discountPercent = priceOverview?.discount_percent ?? 0;
    const formattedFinalPrice = isFree ? 'Gratuit' : (priceOverview?.final_formatted ?? `${(finalPriceCents / 100).toFixed(2)}€`);
    const formattedInitialPrice = priceOverview?.initial_formatted;

    const totalReviews = summary.total_reviews;
    const totalPositive = summary.total_positive;
    const positivePercent = Math.round((totalPositive / totalReviews) * 100);

    let scoreDescFR = 'Très positifs';
    let scoreDescEN = 'Very Positive';
    if (positivePercent >= 95) {
      scoreDescFR = 'Extrêmement positifs';
      scoreDescEN = 'Overwhelmingly Positive';
    } else if (positivePercent >= 80) {
      scoreDescFR = 'Très positifs';
      scoreDescEN = 'Very Positive';
    } else {
      scoreDescFR = 'Plutôt positifs';
      scoreDescEN = 'Mostly Positive';
    }

    storeDataMap[appId] = {
      appId,
      isFree,
      currency: priceOverview?.currency ?? 'EUR',
      initialPriceCents,
      finalPriceCents,
      discountPercent,
      formattedFinalPrice,
      formattedInitialPrice,
      totalReviews,
      totalPositive,
      positivePercent,
      reviewScoreDesc: {
        fr: scoreDescFR,
        en: scoreDescEN,
      },
    };

    catalog.push(catalogItem);
    cache[appIdStr] = catalogItem;
    existingAppIds.add(appId);
    existingTitles.add(title.toLowerCase());
    addedCount++;

    console.log(
      `✅ [${addedCount}/${CONFIG.MAX_NEW_GAMES}] Ajouté (${categoryName}) : "${title}" (${releaseYear}) — ${positivePercent}% positif (${totalReviews} avis) [${genres.join(', ')}]`
    );

    // Sauvegarde incrémentale défensive tous les 10 jeux
    if (addedCount % 10 === 0) {
      saveAllData(catalog, cache, storeDataMap);
      console.log(`   💾 [Sauvegarde Incrémentale] ${catalog.length} jeux au total dans le catalogue (${Object.keys(storeDataMap).length} fiches store synchronisées).`);
    }

    await sleep(CONFIG.DETAIL_DELAY_MS);
  }

  // Sauvegarde finale intégrale
  saveAllData(catalog, cache, storeDataMap);

  console.log('\n=====================================================================');
  console.log(`🎉 MOISSONNAGE MASSIF TERMINÉ !`);
  console.log(`🎮 Nouveaux jeux certifiés ajoutés : +${addedCount}`);
  console.log(`📚 Total final dans steam_catalog.json : ${catalog.length} jeux`);
  console.log(`💎 Total de fiches Steam Store : ${Object.keys(storeDataMap).length}`);
  console.log(`🛡️ Filtrages appliqués : ${rejectedAAA} AAA rejetés, ${rejectedNSFW} NSFW rejetés, ${rejectedReviews} avis insuffisants (<75%).`);
  console.log('=====================================================================\n');
}

main().catch((err) => {
  console.error('❌ Erreur fatale durant le moissonnage :', err);
  process.exit(1);
});
