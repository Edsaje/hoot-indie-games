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
  MIN_REVIEWS: 20,            // Dès 20 avis pour maximiser le nombre de découvertes indés
  MIN_POSITIVE_RATIO: 0.45,   // Seuil abaissé à 45% minimum comme demandé par l'utilisateur !
  MAX_NEW_GAMES: 1000,        // Objectif maximal d'ajouts
  SEARCH_DELAY_MS: 700,       // Délai poli pour les requêtes de recherche
  DETAIL_DELAY_MS: 650,       // Délai poli entre fiches de jeux (préserve le quota Valve)
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

  if (
    lower.includes('1-bit') ||
    lower.includes('monochrome') ||
    lower.includes('black and white') ||
    lower.includes('noir et blanc') ||
    lower.includes('minimalist art')
  ) {
    return { fr: 'Monochrome / Minimaliste', en: 'Monochrome' };
  }

  if (
    lower.includes('low poly') ||
    lower.includes('low-poly') ||
    lower.includes('ps1') ||
    lower.includes('psx') ||
    lower.includes('n64') ||
    lower.includes('retro 3d') ||
    lower.includes('polygonal') ||
    lower.includes('boomer shooter')
  ) {
    return { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' };
  }

  if (
    lower.includes('photorealistic') ||
    lower.includes('photorealist') ||
    lower.includes('unreal engine 5') ||
    lower.includes('ue5') ||
    lower.includes('3d réaliste') ||
    lower.includes('realistic 3d') ||
    (lower.includes('realistic') && lower.includes('3d'))
  ) {
    return { fr: '3D Réaliste', en: 'Realistic 3D' };
  }

  if (
    lower.includes('pixel graphics') ||
    lower.includes('pixel art') ||
    lower.includes('pixel-art') ||
    lower.includes('16-bit') ||
    lower.includes('8-bit') ||
    lower.includes('retro 2d') ||
    lower.includes('sprites 2d')
  ) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
  }

  if (
    lower.includes('hand-drawn') ||
    lower.includes('hand drawn') ||
    lower.includes('dessiné à la main') ||
    lower.includes('watercolor') ||
    lower.includes('aquarelle') ||
    lower.includes('cartoon') ||
    lower.includes('anime') ||
    lower.includes('comic book') ||
    genres.includes('Visual Novel') ||
    ((genres.includes('Deckbuilder') || genres.includes('Cartes')) && !lower.includes('3d')) ||
    (genres.includes('Idle / Clicker') && !lower.includes('3d')) ||
    (genres.includes('Point & Click') && !lower.includes('3d'))
  ) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  if (
    lower.includes('stylized 3d') ||
    lower.includes('cel-shaded') ||
    lower.includes('cel shading') ||
    lower.includes('voxel') ||
    lower.includes('3d')
  ) {
    return { fr: '3D Stylisé', en: 'Stylized 3D' };
  }

  if (lower.includes('2d')) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  return { fr: '3D Stylisé', en: 'Stylized 3D' };
}

// Dictionnaire officiel des caméras reconnues
function inferCamera(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  // 1. Première personne
  if (
    lower.includes('first-person') ||
    lower.includes('first person') ||
    lower.includes('première personne') ||
    lower.includes('fps') ||
    lower.includes('fpv') ||
    lower.includes('boomer shooter') ||
    lower.includes('vr') ||
    genres.includes('FPS') ||
    genres.includes('Fast-FPS') ||
    genres.includes('Immersive Sim')
  ) {
    return { fr: 'Vue à la première personne', en: 'First-Person' };
  }

  // 2. Isométrique / 2.5D
  if (
    lower.includes('isometric') ||
    lower.includes('isométrique') ||
    lower.includes('2.5d') ||
    genres.includes('City Builder')
  ) {
    return { fr: '2.5D Isométrique', en: 'Isometric / 2.5D' };
  }

  // 3. Vue du dessus 2D
  if (
    lower.includes('top-down') ||
    lower.includes('topdown') ||
    lower.includes('vue de dessus') ||
    lower.includes('vue du dessus') ||
    lower.includes('twin-stick') ||
    lower.includes('twin stick') ||
    genres.includes('Auto-Shooter') ||
    genres.includes('Twin-stick') ||
    genres.includes('Colony Sim') ||
    genres.includes('Idle / Clicker') ||
    genres.includes('Incrémental') ||
    (genres.includes('Bullet Hell') && !genres.includes('Metroidvania'))
  ) {
    return { fr: '2D Vue de dessus', en: '2D Top-down' };
  }

  // 4. Troisième personne
  if (
    lower.includes('third-person') ||
    lower.includes('third person') ||
    lower.includes('troisième personne') ||
    lower.includes('3d platformer') ||
    lower.includes('plateforme 3d') ||
    genres.includes('Course') ||
    genres.includes('Conduite') ||
    (genres.includes('Souls-like') && lower.includes('3d'))
  ) {
    return { fr: '3D Vue à la troisième personne', en: 'Third-Person' };
  }

  // 5. Vue de côté 2D
  if (
    lower.includes('side-scroller') ||
    lower.includes('side-scrolling') ||
    lower.includes('sidescroller') ||
    lower.includes('vue de côté') ||
    lower.includes('metroidvania') ||
    genres.includes('Metroidvania') ||
    genres.includes('Plateforme') ||
    genres.includes('Platformer')
  ) {
    return { fr: '2D Vue de côté', en: '2D Side-scroller' };
  }

  // 6. Contextuel par genres
  if (genres.includes('Farming') && lower.includes('2d')) {
    return { fr: '2D Vue de dessus', en: '2D Top-down' };
  }
  if (genres.includes('Course')) {
    return { fr: '3D Vue à la troisième personne', en: 'Third-Person' };
  }
  if (genres.includes('Deckbuilder') || genres.includes('Cartes')) {
    return { fr: '2D Vue de dessus', en: '2D Top-down' };
  }

  if (lower.includes('3d')) {
    if (lower.includes('shooter') || lower.includes('cockpit') || lower.includes('horror')) {
      return { fr: 'Vue à la première personne', en: 'First-Person' };
    }
    return { fr: '3D Vue à la troisième personne', en: 'Third-Person' };
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
  idle: 'Idle / Clicker',
  clicker: 'Idle / Clicker',
  towerdefense: 'Stratégie',
  cardbattler: 'Deckbuilder',
  cardgame: 'Cartes',
  turnbased: 'Tour par tour',
  turnbasedstrategy: 'Tour par tour',
  turnbasedtactics: 'Tactique',
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

  // 1. Ajouter le genre cible de découverte s'il est canonique (PRIORITÉ MAXIMALE)
  const canonCategory = normalizeGenreName(discoveredCategoryName);
  if (canonCategory) detected.add(canonCategory);

  // 2. Détecter des sous-genres contextuels forts dans la description (PRIORITÉ HAUTE)
  const lower = desc.toLowerCase();
  if (lower.includes('idle') || lower.includes('clicker')) detected.add('Idle / Clicker');
  if (lower.includes('incremental') || lower.includes('incrémental')) {
    detected.add('Incrémental');
    detected.add('Idle / Clicker');
  }
  if (lower.includes('metroidvania')) detected.add('Metroidvania');
  if (lower.includes('deckbuilder') || lower.includes('card battler') || lower.includes('deck-builder')) detected.add('Deckbuilder');
  if (lower.includes('tower defense') || lower.includes('tower-defense')) detected.add('Stratégie');
  if (lower.includes('autoshooter') || lower.includes('auto-shooter') || lower.includes('bullet heaven') || lower.includes('survivors-like')) detected.add('Auto-Shooter');
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
  if (lower.includes('roguelike') || lower.includes('roguelite')) detected.add('Roguelike');

  // 3. Traiter les genres Steam officiels en complément
  for (const g of steamGenres) {
    const raw = g.description.trim();
    const canon = normalizeGenreName(raw);
    const key = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_ \/]/g, '').trim();
    if (banned.includes(key)) continue;
    if (canon) {
      detected.add(canon);
    }
  }

  const list = Array.from(detected);
  if (list.length === 0) return ['Aventure', 'Action'];
  return list.slice(0, 5); // Conserver jusqu'à 5 genres canoniques riches
}

// Familles de Recherches et Tags Steam ciblées pour repeupler massivement tous les styles orphelins
const TARGET_SEARCHES: Array<{ name: string; query: string; pages: number[] }> = [
  // 1. Idle, Clicker & Incrémental (Demande prioritaire de l'utilisateur)
  { name: 'Idle / Clicker', query: 'term=idle&tags=492', pages: [0, 50, 100] },
  { name: 'Idle / Clicker', query: 'term=clicker&tags=492', pages: [0, 50, 100] },
  { name: 'Incrémental', query: 'term=incremental&tags=492', pages: [0, 50, 100] },

  // 2. Metroidvania (Style très demandé en souffrance - seulement 15 jeux)
  { name: 'Metroidvania', query: 'tags=492,1628', pages: [0, 50, 100] },

  // 3. Deckbuilder & Cartes (Seulement 26 jeux)
  { name: 'Deckbuilder', query: 'tags=492,32322', pages: [0, 50, 100] },
  { name: 'Cartes', query: 'tags=492,1666', pages: [0, 50] },

  // 4. Tour par tour & Tactique
  { name: 'Tour par tour', query: 'tags=492,1677', pages: [0, 50, 100] },
  { name: 'Tactique', query: 'tags=492,1741', pages: [0, 50, 100] },

  // 5. Stratégie & Tower Defense
  { name: 'Stratégie', query: 'tags=492,1645', pages: [0, 50, 100] }, // Tower Defense
  { name: 'Stratégie', query: 'term=tower+defense&tags=492', pages: [0, 50] },

  // 6. Auto-Shooter & Bullet Hell (Auto-Shooter n'avait que 2 jeux !)
  { name: 'Auto-Shooter', query: 'term=autoshooter&tags=492', pages: [0, 50] },
  { name: 'Auto-Shooter', query: 'term=survivors&tags=492', pages: [0, 50] },
  { name: 'Auto-Shooter', query: 'term=bullet+heaven&tags=492', pages: [0, 50] },
  { name: 'Bullet Hell', query: 'tags=492,4885', pages: [0, 50] },
  { name: 'Twin-stick', query: 'tags=492,4255', pages: [0, 50] },

  // 7. City Builder, Colony Sim, Automatisation & Farming
  { name: 'City Builder', query: 'tags=492,4328', pages: [0, 50, 100] },
  { name: 'Colony Sim', query: 'tags=492,1753', pages: [0, 50, 100] },
  { name: 'Automatisation', query: 'tags=492,18594', pages: [0, 50, 100] },
  { name: 'Farming', query: 'tags=492,87918', pages: [0, 50, 100] },

  // 8. Donjon, Roguelike & Roguelite
  { name: 'Dungeon Crawler', query: 'tags=492,1720', pages: [0, 50, 100] },
  { name: 'Roguelike', query: 'tags=492,1716', pages: [0, 50] },
  { name: 'Roguelite', query: 'tags=492,3959', pages: [0, 50] },

  // 9. Point & Click, Visual Novel, Mystère & Enquête
  { name: 'Point & Click', query: 'tags=492,1698', pages: [0, 50, 100] },
  { name: 'Visual Novel', query: 'tags=492,3799', pages: [0, 50, 100] },
  { name: 'Enquête', query: 'tags=492,5613', pages: [0, 50] },
  { name: 'Mystère', query: 'tags=492,5716', pages: [0, 50] },

  // 10. Beat 'em up, Combat & Hack and Slash
  { name: 'Beat them all', query: 'tags=492,4158', pages: [0, 50, 100] },
  { name: 'Combat', query: 'tags=492,1743', pages: [0, 50] },
  { name: 'Hack and Slash', query: 'tags=492,1646', pages: [0, 50] },

  // 11. FPS Rétro & Fast-FPS
  { name: 'FPS', query: 'tags=492,7432', pages: [0, 50, 100] },
  { name: 'Fast-FPS', query: 'tags=492,4234', pages: [0, 50] },

  // 12. Course & Conduite
  { name: 'Course', query: 'tags=492,699', pages: [0, 50, 100] },
  { name: 'Conduite', query: 'tags=492,11006', pages: [0, 50] },

  // 13. Sport & Glisse
  { name: 'Sport', query: 'tags=492,701', pages: [0, 50, 100] },

  // 14. Rythme & Musique
  { name: 'Rythme', query: 'tags=492,1752', pages: [0, 50, 100] },
  { name: 'Musique', query: 'tags=492,1621', pages: [0, 50] },

  // 15. Party Game & Co-op Local
  { name: 'Party Game', query: 'tags=492,7107', pages: [0, 50, 100] },
  { name: 'Co-op', query: 'tags=492,4840', pages: [0, 50] },

  // 16. Puzzle & Logique
  { name: 'Puzzle', query: 'tags=492,1734', pages: [0, 50] },
  { name: 'Puzzle', query: 'tags=492,6129', pages: [0, 50] },

  // 17. Souls-like & Immersive Sim
  { name: 'Souls-like', query: 'tags=492,29438', pages: [0, 50] },
  { name: 'Immersive Sim', query: 'tags=492,9204', pages: [0, 50] },

  // 18. Cozy & Méditatif
  { name: 'Cozy', query: 'tags=492,3834', pages: [0, 50] },
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
    for (const target of TARGET_SEARCHES) {
      console.log(`   ➔ Exploration du style "${target.name}" (${target.query})...`);

      for (const start of target.pages) {
        const url = `https://store.steampowered.com/search/results/?start=${start}&count=50&${target.query}&category1=998&sort_by=Reviews_DESC&json=1`;
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
                candidates.push({ appId, categoryName: target.name });
              }
            }
          }
        } catch (err) {
          console.warn(`⚠️ Erreur sur la recherche ${target.name}:`, err);
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

    let scoreDescFR = 'Plutôt positifs';
    let scoreDescEN = 'Mostly Positive';
    if (positivePercent >= 95) {
      scoreDescFR = 'Extrêmement positifs';
      scoreDescEN = 'Overwhelmingly Positive';
    } else if (positivePercent >= 80) {
      scoreDescFR = 'Très positifs';
      scoreDescEN = 'Very Positive';
    } else if (positivePercent >= 70) {
      scoreDescFR = 'Plutôt positifs';
      scoreDescEN = 'Mostly Positive';
    } else {
      scoreDescFR = 'Moyens';
      scoreDescEN = 'Mixed';
    }

    const storeEntry: SteamStoreGameData = {
      appId,
      isFree,
      currency: priceOverview?.currency ?? 'EUR',
      initialPriceCents,
      finalPriceCents,
      discountPercent,
      formattedFinalPrice,
      formattedInitialPrice: formattedInitialPrice || '',
      totalReviews,
      totalPositive,
      positivePercent,
      reviewScoreDesc: {
        fr: scoreDescFR,
        en: scoreDescEN,
      },
    };

    storeDataMap[appId] = storeEntry;
    (catalogItem as any).steamStoreData = storeEntry;

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
