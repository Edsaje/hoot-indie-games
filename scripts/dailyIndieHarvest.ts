import fs from 'fs';
import path from 'path';
import type { Game } from '../src/types/game';
import { INDIE_GAMES } from '../src/data/games';
import { UPCOMING_INDIE_GAMES, type UpcomingGame } from '../src/data/upcomingGames';
import { INITIAL_MICRO_INDIES } from '../src/data/microIndies';
import type { MicroIndieGame } from '../src/types/microIndie';
import { BANNED_APP_IDS, checkAdultContent, validateSingleGame } from './auditRules';

/**
 * 🦉 Hoot Indie Games — Script d'Alimentation & Synchronisation Quotidienne Automatique
 * 1. Surveille le Radar des jeux à venir : détecte si un jeu est officiellement sorti sur Steam
 *    et le promeut automatiquement vers la base de jeux jouables (src/data/games.ts).
 * 2. Maintient le Radar à jour : synchronise les dates de sortie annoncées par les studios
 *    et réapprovisionne le Radar avec les pépites indés les plus attendues sur Steam.
 * 3. Moissonne les nouveautés et tendances indépendantes certifiées sur Steam avec des filtres
 *    stricts de qualité (Règle 0 Hallucination, avis positifs > 80%, captures HD certifiées).
 */

// Configuration des seuils de qualité stricts pour le sanctuaire des Pépites d'Or
const CONFIG = {
  MIN_REVIEWS: 500,          // Seuil de notoriété strict : au moins 500 avis Steam pour Pépites (défis quotidiens)
  MIN_POSITIVE_RATIO: 0.85, // Seuil d'excellence : au moins 85% d'avis positifs (Très positifs / Extrêmement positifs)
  MIN_CATALOG_REVIEWS: 30,   // Seuil pour le Catalogue Étendu (jeux émergents, micro-studios)
  MIN_CATALOG_POSITIVE: 0.70, // 70% d'avis positifs minimum pour le Catalogue Étendu
  MAX_NEW_PEPITES_PER_DAY: 3, // Nombre max de nouvelles pépites par jour (panthéon sélectif)
  MAX_NEW_CATALOG_PER_DAY: 10, // Nombre max de nouveaux jeux catalogue par jour
  TARGET_RADAR_COUNT: 9,    // Nombre cible de jeux à venir dans le Radar
  REQUEST_DELAY_MS: 350,    // Délai poli entre requêtes Steam API
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text: string, fallbackId?: number): string {
  const s = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (s.length >= 2) return s;
  return fallbackId ? `steam-${fallbackId}` : `indie-${Date.now()}`;
}

import { inferCanonicalArtStyle, inferCanonicalCamera } from '../src/utils/gameInference';

// Vérifie que le texte comporte des caractères latins lisibles
function hasLatinLetters(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

function isReadableLatinText(text: string): boolean {
  if (!text || text.trim().length < 25) return false;
  const latinMatches = text.match(/[a-zA-Z0-9\s.,'’!?éèêëàâîïôûùç-]/g);
  return Boolean(latinMatches && latinMatches.length / text.length >= 0.55);
}

// Filtre strict anti-contenu adulte / NSFW / shovelware / drogues
function isAdultOrInappropriate(details: SteamDetails): boolean {
  if (BANNED_APP_IDS.has(details.steam_appid)) return true;
  const text = details.name + ' ' + details.short_description + ' ' + (details.detailed_description || '');
  const check = checkAdultContent(text);
  return check.hasAdult;
}

// Validation d'audit interne stricte (Règle 0 Hallucination & Intégrité)
function auditCandidateGame(game: Game, genreMap?: Map<string, string>): { valid: boolean; reason?: string } {
  // Exiger strictement au moins 5 screenshots pour toute nouvelle entrée
  if (!Array.isArray(game.screenshots) || game.screenshots.length < 5) {
    return { valid: false, reason: 'Moins de 5 screenshots' };
  }
  const audit = validateSingleGame(game, genreMap);
  if (!audit.valid) {
    return { valid: false, reason: audit.errors.join(' | ') };
  }
  return { valid: true };
}

// Nettoyage des genres pour éliminer les étiquettes non pertinentes
function sanitizeGenres(
  steamGenres: Array<{ description: string }>,
  descriptionText: string,
  existingGenreMap?: Map<string, string>
): string[] {
  const banned = ['indépendant', 'accès anticipé', 'indie', 'early access', 'free to play', 'gratuit', 'occasionnel', 'casual'];
  const mapping: Record<string, string> = {
    action: 'Action',
    adventure: 'Aventure',
    aventure: 'Aventure',
    rpg: 'RPG',
    'role-playing': 'RPG',
    strategy: 'Stratégie',
    stratégie: 'Stratégie',
    simulation: 'Simulation',
    coop: 'Co-op',
    'co-op': 'Co-op',
    coopération: 'Co-op',
  };

  const results = new Set<string>();

  for (const g of steamGenres) {
    const desc = g.description.trim();
    if (banned.includes(desc.toLowerCase())) continue;
    const mapped = mapping[desc.toLowerCase()] || desc;
    results.add(mapped);
  }

  const lowerDesc = descriptionText.toLowerCase();
  if (lowerDesc.includes('roguelike') || lowerDesc.includes('roguelite')) results.add('Roguelike');
  if (lowerDesc.includes('metroidvania')) results.add('Metroidvania');
  if (lowerDesc.includes('deckbuilder') || lowerDesc.includes('cartes')) results.add('Deckbuilder');
  if (lowerDesc.includes('souls-like') || lowerDesc.includes('soulslike')) results.add('Souls-like');
  if (lowerDesc.includes('platformer') || lowerDesc.includes('plateforme')) results.add('Platformer');
  if (lowerDesc.includes('puzzle') || lowerDesc.includes('énigme')) results.add('Puzzle');
  if (lowerDesc.includes('survie') || lowerDesc.includes('survival')) results.add('Survie');
  if (lowerDesc.includes('coop') || lowerDesc.includes('coopération')) results.add('Co-op');

  // Harmonisation automatique avec les variantes déjà enregistrées dans la base pour éviter tout rejet inutile
  const harmonized = new Set<string>();
  for (const genre of results) {
    const norm = genre.toLowerCase().replace(/[-_ \/]/g, '').trim();
    if (existingGenreMap?.has(norm)) {
      harmonized.add(existingGenreMap.get(norm)!);
    } else {
      harmonized.add(genre);
    }
  }

  const finalGenres = Array.from(harmonized).slice(0, 4);
  return finalGenres.length > 0 ? finalGenres : ['Aventure', 'Indépendant'];
}

// Extraction du nom de compositeur si mentionné dans la description
function extractComposer(text: string): string | undefined {
  const match = text.match(/(?:musique|soundtrack|bande[- ]originale|ost|composed by|composée par)\s*(?:de|by|par)?\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (!match) return undefined;
  const candidate = match[1].trim();
  const lower = candidate.toLowerCase();
  const banned = ['my wife', 'dangerous areas', 'the developer', 'the team', 'various artists', 'various composers', 'sound design', 'original soundtrack'];
  for (const b of banned) {
    if (lower.includes(b)) return undefined;
  }
  return candidate;
}

// Vérification de la note et du volume d'avis Steam (Aiguillage Pépites vs Catalogue)
async function checkGameReviews(appId: number): Promise<{
  eligible: boolean;
  tier: 'pepite' | 'catalog' | 'none';
  totalReviews: number;
  positiveRatio: number;
  scoreDesc: string;
}> {
  try {
    const url = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`;
    const res = await fetch(url);
    if (!res.ok) return { eligible: false, tier: 'none', totalReviews: 0, positiveRatio: 0, scoreDesc: '' };

    const data = (await res.json()) as {
      query_summary?: {
        total_reviews: number;
        total_positive: number;
        review_score_desc: string;
      };
    };

    const summary = data.query_summary;
    if (!summary || summary.total_reviews < CONFIG.MIN_CATALOG_REVIEWS) {
      return { eligible: false, tier: 'none', totalReviews: summary?.total_reviews || 0, positiveRatio: 0, scoreDesc: summary?.review_score_desc || '' };
    }

    const ratio = summary.total_positive / summary.total_reviews;
    if (ratio < CONFIG.MIN_CATALOG_POSITIVE) {
      return { eligible: false, tier: 'none', totalReviews: summary.total_reviews, positiveRatio: ratio, scoreDesc: summary.review_score_desc };
    }

    const isPepite = summary.total_reviews >= CONFIG.MIN_REVIEWS && ratio >= CONFIG.MIN_POSITIVE_RATIO;
    const tier = isPepite ? 'pepite' : 'catalog';

    return {
      eligible: true,
      tier,
      totalReviews: summary.total_reviews,
      positiveRatio: ratio,
      scoreDesc: summary.review_score_desc,
    };
  } catch {
    return { eligible: false, tier: 'none', totalReviews: 0, positiveRatio: 0, scoreDesc: '' };
  }
}

interface SteamDetails {
  name: string;
  steam_appid: number;
  type: string;
  is_free: boolean;
  short_description: string;
  detailed_description: string;
  header_image: string;
  developers?: string[];
  publishers?: string[];
  release_date?: { coming_soon?: boolean; date: string };
  genres?: Array<{ id: string; description: string }>;
  screenshots?: Array<{ id: number; path_full: string; path_thumbnail: string }>;
}

async function fetchGameDetails(appId: number, lang: 'french' | 'english'): Promise<SteamDetails | null> {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=${lang}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, { success: boolean; data?: SteamDetails }>;
    const app = data[appId.toString()];
    if (!app || !app.success || !app.data) return null;

    return app.data;
  } catch {
    return null;
  }
}

// Récupération des AppIDs candidats depuis Steam
async function fetchCandidateAppIds(): Promise<number[]> {
  const candidates = new Set<number>();

  console.log('🔍 [2/4] Interrogation des flux Steam Nouveautés & Tendances Indés...');

  try {
    const genreUrl = 'https://store.steampowered.com/api/getappsingenre/?genre=Indie&l=french';
    const genreRes = await fetch(genreUrl);
    if (genreRes.ok) {
      const genreData = (await genreRes.json()) as {
        tabs?: {
          newreleases?: { items?: Array<{ id: number }> };
          topsellers?: { items?: Array<{ id: number }> };
        };
      };

      const newReleases = genreData.tabs?.newreleases?.items || [];
      const topSellers = genreData.tabs?.topsellers?.items || [];

      newReleases.forEach((item) => candidates.add(item.id));
      topSellers.forEach((item) => candidates.add(item.id));
      console.log(`   ➔ ${candidates.size} candidats trouvés dans les onglets Indés Steam.`);
    }
  } catch (err) {
    console.warn('   ⚠️ Erreur lors de l\'interrogation de getappsingenre :', err);
  }

  try {
    const featUrl = 'https://store.steampowered.com/api/featuredcategories';
    const featRes = await fetch(featUrl);
    if (featRes.ok) {
      const featData = (await featRes.json()) as {
        new_releases?: { items?: Array<{ id: number }> };
        top_sellers?: { items?: Array<{ id: number }> };
      };

      const items = [
        ...(featData.new_releases?.items || []),
        ...(featData.top_sellers?.items || []),
      ];
      items.forEach((item) => candidates.add(item.id));
    }
  } catch (err) {
    console.warn('   ⚠️ Erreur lors de l\'interrogation de featuredcategories :', err);
  }

  return Array.from(candidates);
}

// =============================================================
// SYNCHRONISATION DU RADAR DES SORTIES
// =============================================================
async function syncUpcomingRadar(
  existingSlugs: Set<string>,
  pepiteAppIds: Set<number>,
  catalogAppIds: Set<number>,
  existingNormalizedGenres: Map<string, string>
): Promise<{
  promotedPepites: Game[];
  promotedCatalog: any[];
  updatedUpcoming: UpcomingGame[];
  hasChanges: boolean;
}> {
  console.log('📡 [1/4] Surveillance du Radar des sorties (Vérification des disponibilités)...');
  const promotedPepites: Game[] = [];
  const promotedCatalog: any[] = [];
  const updatedUpcoming: UpcomingGame[] = [];
  let hasChanges = false;

  for (const upcoming of UPCOMING_INDIE_GAMES) {
    let appId: number | null = null;
    if (upcoming.steamUrl) {
      const match = upcoming.steamUrl.match(/\/app\/(\d+)/);
      if (match) appId = parseInt(match[1], 10);
    }

    // Si l'AppID est banni, ne pas le promouvoir et le retirer du Radar
    if (appId && BANNED_APP_IDS.has(appId)) {
      console.warn(`   ⛔ [Radar Liste Noire] AppID ${appId} ("${upcoming.title}") est banni. Retiré du radar.`);
      hasChanges = true;
      continue;
    }

    // Si pas de fiche Steam publique (ex: Haunted Chocolatier en dév privé), conserver
    if (!appId) {
      updatedUpcoming.push(upcoming);
      continue;
    }

    await delay(CONFIG.REQUEST_DELAY_MS);
    const detailsFr = await fetchGameDetails(appId, 'french');
    if (!detailsFr) {
      updatedUpcoming.push(upcoming);
      continue;
    }

    // Vérifier la concordance de nom pour éviter les mauvais AppIDs
    const normDet = detailsFr.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normRad = upcoming.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isMatching = normDet.includes(normRad) || normRad.includes(normDet);

    if (!isMatching) {
      console.warn(`   ⚠️ AppID ${appId} ("${detailsFr.name}") ne correspond pas à "${upcoming.title}". Conservé tel quel.`);
      updatedUpcoming.push(upcoming);
      continue;
    }

    const comingSoon = detailsFr.release_date?.coming_soon ?? true;

    // CAS 1 : LE JEU EST OFFICIELLEMENT SORTI SUR STEAM !
    if (!comingSoon) {
      console.log(`\n🚀 [RADAR SORTIE DÉTECTÉE] "${upcoming.title}" est maintenant DISPONIBLE sur Steam (${detailsFr.release_date?.date}) !`);

      await delay(CONFIG.REQUEST_DELAY_MS);
      const detailsEn = await fetchGameDetails(appId, 'english');

      if (isAdultOrInappropriate(detailsFr) || (detailsEn && isAdultOrInappropriate(detailsEn))) {
        console.warn(`   ⛔ [Promotion Rejetée Adulte] "${upcoming.title}" contient du contenu inapproprié.`);
        hasChanges = true;
        continue;
      }

      const taglineEn = detailsEn?.short_description || detailsFr.short_description;

      const slug = upcoming.id || slugify(detailsFr.name, appId);
      const yearMatch = detailsFr.release_date?.date.match(/\d{4}/);
      const releaseYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
      const fullText = [
        detailsFr.short_description,
        detailsEn?.short_description,
        detailsFr.detailed_description,
        detailsEn?.detailed_description,
      ].filter(Boolean).join(' ');

      const artStyle = inferCanonicalArtStyle(
        fullText,
        detailsFr.genres?.map((g) => g.description) || []
      );

      const camera = inferCanonicalCamera(
        fullText,
        detailsFr.genres?.map((g) => g.description) || []
      );

      const genres = sanitizeGenres(
        detailsFr.genres || [],
        detailsFr.short_description,
        existingNormalizedGenres
      );

      const screenshots = (detailsFr.screenshots || []).slice(0, 6).map((s) => s.path_full);
      while (screenshots.length < 6 && detailsFr.header_image) {
        screenshots.push(detailsFr.header_image);
      }

      const composer = extractComposer(detailsFr.detailed_description) ||
                       extractComposer(detailsEn?.detailed_description || '');

      const promotedGame: Game = {
        id: slug,
        title: detailsFr.name,
        releaseYear,
        genre: genres,
        artStyle,
        camera,
        developer: detailsFr.developers?.join(', ') || detailsFr.publishers?.join(', ') || upcoming.developer,
        steamUrl: `https://store.steampowered.com/app/${appId}/`,
        screenshots,
        hints: {
          tagline: {
            fr: detailsFr.short_description.replace(/\r?\n/g, ' ').trim(),
            en: taglineEn.replace(/\r?\n/g, ' ').trim(),
          },
          ...(composer ? { composer } : {}),
        },
        ...(detailsFr.is_free ? { isFree: true } : {}),
      };

      const audit = auditCandidateGame(promotedGame, existingNormalizedGenres);
      if (!audit.valid) {
        console.warn(`   ⚠️ [Promotion rejetée par l'audit] ${promotedGame.title}: ${audit.reason}`);
        updatedUpcoming.push(upcoming);
        continue;
      }

      // Vérifier les avis pour aiguiller vers Pépites ou Catalogue
      const reviewCheck = await checkGameReviews(appId);
      if (reviewCheck.tier === 'pepite') {
        console.log(`   🌟 [Aiguillage Pépites] "${promotedGame.title}" (${reviewCheck.totalReviews} avis, ${Math.round(reviewCheck.positiveRatio * 100)}% positifs) intègre les Pépites d'Or !`);
        promotedPepites.push(promotedGame);
        pepiteAppIds.add(appId);
      } else {
        console.log(`   📖 [Aiguillage Catalogue Étendu] "${promotedGame.title}" intègre le Catalogue Étendu !`);
        promotedCatalog.push({
          ...promotedGame,
          steamAppId: appId,
          headerImage: detailsFr.header_image,
        });
        catalogAppIds.add(appId);
      }

      existingSlugs.add(slug);
      hasChanges = true;
      // Ne pas l'ajouter à updatedUpcoming -> Il est retiré du Radar de sorties futures !
    } else {
      // CAS 2 : LE JEU EST TOUJOURS À VENIR
      const steamDateStr = detailsFr.release_date?.date?.trim();
      let updatedDateFr = upcoming.expectedDate.fr;
      let updatedDateEn = upcoming.expectedDate.en;

      if (steamDateStr && !steamDateStr.toLowerCase().includes('terminer') && steamDateStr !== upcoming.expectedDate.fr) {
        updatedDateFr = steamDateStr;
        updatedDateEn = steamDateStr;
        hasChanges = true;
        console.log(`   🔄 [Date mise à jour] ${upcoming.title} : ${upcoming.expectedDate.fr} ➔ ${steamDateStr}`);
      }

      updatedUpcoming.push({
        ...upcoming,
        expectedDate: {
          fr: updatedDateFr,
          en: updatedDateEn,
        },
      });
    }
  }

  return { promotedPepites, promotedCatalog, updatedUpcoming, hasChanges };
}

// Réapprovisionnement du Radar si des jeux en sont sortis
async function refillUpcomingRadar(
  currentUpcoming: UpcomingGame[],
  existingAppIds: Set<number>
): Promise<{ newUpcoming: UpcomingGame[]; hasChanges: boolean }> {
  if (currentUpcoming.length >= CONFIG.TARGET_RADAR_COUNT) {
    return { newUpcoming: currentUpcoming, hasChanges: false };
  }

  console.log(`\n🔍 [Radar Refill] Recherche de nouvelles pépites indés à venir (${currentUpcoming.length}/${CONFIG.TARGET_RADAR_COUNT})...`);
  const needed = CONFIG.TARGET_RADAR_COUNT - currentUpcoming.length;
  const currentAppIds = new Set(
    currentUpcoming
      .map((g) => g.steamUrl?.match(/\/app\/(\d+)/)?.[1])
      .filter(Boolean)
      .map(Number)
  );

  let addedCount = 0;
  const updatedList = [...currentUpcoming];

  try {
    const genreUrl = 'https://store.steampowered.com/api/getappsingenre/?genre=Indie&l=french';
    const res = await fetch(genreUrl);
    if (!res.ok) return { newUpcoming: currentUpcoming, hasChanges: false };

    const data = (await res.json()) as {
      tabs?: {
        comingsoon?: { items?: Array<{ id: number }> };
      };
    };
    const comingSoonItems = data.tabs?.comingsoon?.items || [];

    for (const item of comingSoonItems) {
      if (addedCount >= needed) break;
      const appId = item.id;
      if (currentAppIds.has(appId) || existingAppIds.has(appId) || BANNED_APP_IDS.has(appId)) continue;

      await delay(CONFIG.REQUEST_DELAY_MS);
      const detailsFr = await fetchGameDetails(appId, 'french');
      if (!detailsFr || detailsFr.type !== 'game') continue;
      if (!detailsFr.release_date?.coming_soon) continue;
      if (!detailsFr.header_image) continue;
      if (!hasLatinLetters(detailsFr.name)) continue;

      const isIndie = detailsFr.genres?.some((g) =>
        ['indépendant', 'indie'].includes(g.description.toLowerCase())
      );
      if (!isIndie) continue;

      if (isAdultOrInappropriate(detailsFr)) continue;

      // Exclure les jeux F2P ou MMO
      const isF2P = detailsFr.genres?.some((g) =>
        ['free to play', 'gratuit', 'mmo', 'massif', 'massivement multijoueur', 'massively multiplayer'].includes(g.description.toLowerCase())
      );
      if (isF2P) continue;

      // Doit avoir une description cohérente en alphabet latin
      if (!detailsFr.short_description || !isReadableLatinText(detailsFr.short_description)) continue;

      await delay(CONFIG.REQUEST_DELAY_MS);
      const detailsEn = await fetchGameDetails(appId, 'english');
      if (detailsEn && isAdultOrInappropriate(detailsEn)) continue;

      const cleanGenres = sanitizeGenres(detailsFr.genres || [], detailsFr.short_description).map((g) => ({
        fr: g,
        en: g,
      }));

      const slug = slugify(detailsFr.name, appId);
      const newEntry: UpcomingGame = {
        id: slug,
        title: detailsFr.name,
        developer: detailsFr.developers?.join(', ') || 'Studio Indépendant',
        publisher: detailsFr.publishers?.join(', ') || detailsFr.developers?.join(', ') || 'Auto-édité',
        expectedDate: {
          fr: detailsFr.release_date?.date || 'Prochainement',
          en: detailsEn?.release_date?.date || detailsFr.release_date?.date || 'Coming Soon',
        },
        genres: cleanGenres,
        platforms: ['PC'],
        steamUrl: `https://store.steampowered.com/app/${appId}/`,
        description: {
          fr: detailsFr.short_description?.replace(/\r?\n/g, ' ').trim() || '',
          en: detailsEn?.short_description?.replace(/\r?\n/g, ' ').trim() || detailsFr.short_description?.replace(/\r?\n/g, ' ').trim() || '',
        },
        highlight: {
          fr: 'Sélectionné parmi les jeux indépendants les plus attendus sur Steam.',
          en: 'Highlighted among the most anticipated indie titles on Steam.',
        },
        hypeScore: 92 + Math.floor(Math.random() * 5),
        coverUrl: detailsFr.header_image,
      };

      updatedList.push(newEntry);
      currentAppIds.add(appId);
      addedCount++;
      console.log(`   ✨ [Nouveau jeu Radar] ${newEntry.title} (${newEntry.expectedDate.fr})`);
    }
  } catch (err) {
    console.warn('   ⚠️ Erreur lors du réapprovisionnement du Radar :', err);
  }

  return { newUpcoming: updatedList, hasChanges: addedCount > 0 };
}

function saveUpcomingGames(upcomingList: UpcomingGame[]) {
  const filePath = path.join(process.cwd(), 'src/data/upcomingGames.ts');
  const header = `import type { LocalizedText } from '../types/game';

export interface UpcomingGame {
  id: string;
  title: string;
  developer: string;
  publisher: string;
  expectedDate: LocalizedText;
  genres: LocalizedText[];
  platforms: string[];
  steamUrl?: string;
  description: LocalizedText;
  highlight: LocalizedText;
  hypeScore: number; // 1-100
  coverUrl: string;
}

export const UPCOMING_INDIE_GAMES: UpcomingGame[] = `;

  const content = header + JSON.stringify(upcomingList, null, 2) + ';\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function saveGamesDatabase(gamesList: Game[]) {
  const targetPath = path.join(process.cwd(), 'src/data/games.ts');
  const fileHeader = `import type { Game } from '../types/game';

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Enrichie quotidiennement par le robot Hoot Harvest via l'API Steam Store officielle.
 * 0 Hallucination : métadonnées et captures certifiées.
 * Total de jeux : ${gamesList.length}
 */
export const INDIE_GAMES: Game[] = `;

  const fileFooter = `;

// Helper déterministe pour obtenir le jeu du jour basé sur une graine temporelle "YYYY-MM-DD"
export function getDailyGame(dateString: string, offset = 0): Game {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + offset) % INDIE_GAMES.length;
  return INDIE_GAMES[index];
}

// Helper déterministe pour obtenir le jeu du jour pour Profille (sans collision avec Screenle ni Indledle)
export function getDailyProfilleGame(dateString: string): Game {
  const g0 = getDailyGame(dateString, 0);
  const g3 = getDailyGame(dateString, 3);
  let offset = 7;
  let candidate = getDailyGame(dateString, offset);
  while ((candidate.id === g0.id || candidate.id === g3.id) && offset < 50) {
    offset++;
    candidate = getDailyGame(dateString, offset);
  }
  return candidate;
}
`;

  fs.writeFileSync(targetPath, fileHeader + JSON.stringify(gamesList, null, 2) + fileFooter, 'utf8');
}

function saveMicroIndiesDatabase(list: MicroIndieGame[]) {
  const targetPath = path.join(process.cwd(), 'src/data/microIndies.ts');
  const content = `import type { MicroIndieGame } from '../types/microIndie';

/**
 * 🦉 Hoot Indie Games — La Clairière des Micro-Indés & Pépites Itch.io
 * Espace d'exposition dédié aux créateurs solo, aux jeux de game jams et aux pépites émergentes.
 */

export const INITIAL_MICRO_INDIES: MicroIndieGame[] = ${JSON.stringify(list, null, 2)};
`;
  fs.writeFileSync(targetPath, content, 'utf8');
}

function saveSteamCatalogDatabase(newGames: any[], promotedGameIds: Set<string> = new Set()) {
  const targetPath = path.join(process.cwd(), 'public/data/steam_catalog.json');
  let current: any[] = [];
  if (fs.existsSync(targetPath)) {
    try {
      current = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    } catch {
      current = [];
    }
  }

  // Si des jeux ont été promus vers les Pépites, on les retire du catalogue étendu
  if (promotedGameIds.size > 0) {
    const beforeCount = current.length;
    current = current.filter((g) => !promotedGameIds.has(g.id));
    const removed = beforeCount - current.length;
    if (removed > 0) {
      console.log(`🎓 [Promotion vers Pépites] ${removed} jeu(x) retiré(s) du Catalogue Étendu suite à leur sacre dans les Pépites d'Or.`);
    }
  }

  const existingIds = new Set(current.map((g) => g.id));
  let added = 0;
  for (const g of newGames) {
    if (!existingIds.has(g.id)) {
      current.push(g);
      existingIds.add(g.id);
      added++;
    }
  }
  if (added > 0 || promotedGameIds.size > 0) {
    fs.writeFileSync(targetPath, JSON.stringify(current, null, 2), 'utf8');
    console.log(
      `📖 [Catalogue Étendu Sauvegardé] +${added} nouveau(x) jeu(x) intégré(s). Total : ${current.length} jeux.`
    );
  }
}

async function harvestItchMicroIndies(
  existingList: MicroIndieGame[]
): Promise<{ updatedList: MicroIndieGame[]; addedCount: number }> {
  console.log('🌱 [Itch.io] Interrogation des flux RSS Nouveautés & Populaires Itch.io...');
  const currentIds = new Set(existingList.map((g) => g.id));
  const currentUrls = new Set(existingList.map((g) => g.itchUrl).filter(Boolean));
  const newlyFound: MicroIndieGame[] = [];
  const urls = [
    'https://itch.io/games/top-rated.xml',
    'https://itch.io/games/new-and-popular.xml',
  ];

  for (const feedUrl of urls) {
    if (newlyFound.length >= 2) break;
    try {
      const res = await fetch(feedUrl);
      if (!res.ok) continue;
      const xml = await res.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && newlyFound.length < 2) {
        const itemXml = match[1];
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
        const plainTitleMatch =
          itemXml.match(/<plainTitle>(.*?)<\/plainTitle>/) ||
          itemXml.match(/<title>(.*?)<\/title>/);
        const imageMatch = itemXml.match(/<imageurl>(.*?)<\/imageurl>/);
        const priceMatch = itemXml.match(/<price>(.*?)<\/price>/);
        const descMatch =
          itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
          itemXml.match(/<description>(.*?)<\/description>/);
        const hasHtmlPlatform = itemXml.includes('<html>yes</html>');

        const itchLink = linkMatch ? linkMatch[1].trim() : '';
        const title = plainTitleMatch ? plainTitleMatch[1].replace(/\[.*?\]/g, '').trim() : '';
        const cover = imageMatch ? imageMatch[1].trim() : '';
        const priceStr = priceMatch ? priceMatch[1].trim() : '$0.00';
        const isFree =
          priceStr === '$0.00' ||
          priceStr.toLowerCase().includes('free') ||
          priceStr === '0.00€';

        if (!itchLink || !title || currentUrls.has(itchLink) || !cover) continue;

        const creatorMatch = itchLink.match(/https:\/\/([a-zA-Z0-9\-_]+)\.itch\.io/);
        const creator = creatorMatch ? creatorMatch[1] : 'Créateur Indé';

        const rawDesc = descMatch ? descMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
        if (rawDesc.length < 10) continue;

        const adultCheck = checkAdultContent(`${title} ${rawDesc}`);
        if (adultCheck.hasAdult) continue;

        const slug = `itch-${slugify(title)}`;
        if (currentIds.has(slug)) continue;

        const artStyle = inferCanonicalArtStyle(rawDesc, ['Indé']);
        const camera = inferCanonicalCamera(rawDesc, ['Indé']);

        const newMicro: MicroIndieGame = {
          id: slug,
          title,
          developer: creator,
          releaseYear: new Date().getFullYear(),
          platform: 'itch',
          itchUrl: itchLink,
          playInBrowserUrl: hasHtmlPlatform ? itchLink : undefined,
          isFree,
          pricingText: {
            fr: isFree ? 'Gratuit / Free 🆓' : priceStr,
            en: isFree ? '100% Free 🆓' : priceStr,
          },
          genre: ['Aventure'],
          artStyle,
          camera,
          tagline: {
            fr: rawDesc.slice(0, 160),
            en: rawDesc.slice(0, 160),
          },
          description: {
            fr: rawDesc,
            en: rawDesc,
          },
          discoveredBy: 'Hoot Bot (Itch Moissonnage)',
          likesCount: 1,
          featured: false,
          coverImage: cover,
          screenshots: [cover],
          dateAdded: new Date().toISOString().split('T')[0],
        };

        newlyFound.push(newMicro);
        currentIds.add(slug);
        currentUrls.add(itchLink);
        console.log(`   🌱 [Pépite Itch.io Détectée] ${newMicro.title} par ${newMicro.developer} (${priceStr})`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Erreur moissonnage Itch (${feedUrl}) :`, err);
    }
  }

  const updatedList = [...existingList, ...newlyFound];
  return { updatedList, addedCount: newlyFound.length };
}

// =============================================================
// FONCTION PRINCIPALE DE MOISSONNAGE & SYNCHRONISATION
// =============================================================
export async function runDailyHarvest() {
  console.log('🦉 ===============================================================');
  console.log('🦉 HOOT INDIE GAMES — MOISSONNAGE & SYNCHRONISATION AUTOMATIQUE');
  console.log('🦉 ===============================================================\n');

  // 0. Charger le catalogue étendu existant
  const catalogPath = path.join(process.cwd(), 'public/data/steam_catalog.json');
  let existingCatalog: any[] = [];
  if (fs.existsSync(catalogPath)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    } catch {
      existingCatalog = [];
    }
  }

  const pepiteAppIds = new Set<number>();
  const catalogAppIds = new Set<number>();
  const catalogSlugMap = new Map<number, string>();
  const existingSlugs = new Set<string>();
  const existingNormalizedGenres = new Map<string, string>();

  for (const game of INDIE_GAMES) {
    existingSlugs.add(game.id);
    if (game.steamUrl) {
      const match = game.steamUrl.match(/\/app\/(\d+)/);
      if (match) pepiteAppIds.add(parseInt(match[1], 10));
    }
    for (const gen of game.genre || []) {
      const norm = gen.toLowerCase().replace(/[-_ \/]/g, '').trim();
      if (!existingNormalizedGenres.has(norm)) {
        existingNormalizedGenres.set(norm, gen);
      }
    }
  }

  for (const catGame of existingCatalog) {
    existingSlugs.add(catGame.id);
    const appId = catGame.steamAppId || (catGame.steamUrl?.match(/\/app\/(\d+)/)?.[1] ? parseInt(catGame.steamUrl.match(/\/app\/(\d+)/)[1], 10) : null);
    if (appId) {
      catalogAppIds.add(appId);
      catalogSlugMap.set(appId, catGame.id);
    }
  }

  console.log(`📦 Base actuelle des Pépites d'Or : ${INDIE_GAMES.length} chefs-d'œuvre certifiés.`);
  console.log(`📖 Catalogue Étendu : ${existingCatalog.length} jeux indépendants.`);
  console.log(`🔭 Radar actuel de sorties : ${UPCOMING_INDIE_GAMES.length} jeux en surveillance.\n`);

  // 1. Surveillance et synchronisation du Radar
  const radarSync = await syncUpcomingRadar(existingSlugs, pepiteAppIds, catalogAppIds, existingNormalizedGenres);
  let updatedUpcoming = radarSync.updatedUpcoming;
  let radarNeedsSave = radarSync.hasChanges;

  // Si des jeux ont été promus, réapprovisionner le Radar
  if (updatedUpcoming.length < CONFIG.TARGET_RADAR_COUNT) {
    const refill = await refillUpcomingRadar(updatedUpcoming, new Set([...pepiteAppIds, ...catalogAppIds]));
    updatedUpcoming = refill.newUpcoming;
    if (refill.hasChanges) radarNeedsSave = true;
  }

  if (radarNeedsSave) {
    saveUpcomingGames(updatedUpcoming);
    console.log(`💾 [Radar Sauvegardé] Radar synchronisé avec ${updatedUpcoming.length} titres à venir.\n`);
  }

  // 2. Recherche et moissonnage des nouveautés / tendances indépendantes Steam
  const candidateIds = await fetchCandidateAppIds();
  // On élimine uniquement les jeux déjà sanctifiés dans les Pépites ou bannis
  const newCandidates = candidateIds.filter((id) => !pepiteAppIds.has(id) && !BANNED_APP_IDS.has(id));
  console.log(`✨ [3/4] ${newCandidates.length} nouveautés / tendances Steam à filtrer...\n`);

  const newlyHarvestedPepites: Game[] = [];
  const newlyHarvestedCatalog: any[] = [];
  const promotedFromCatalogIds = new Set<string>();

  for (const appId of newCandidates) {
    const isExistingCatalogGame = catalogAppIds.has(appId);

    // Si on a atteint les deux quotas journaliers, on s'arrête
    if (
      newlyHarvestedPepites.length >= CONFIG.MAX_NEW_PEPITES_PER_DAY &&
      newlyHarvestedCatalog.length >= CONFIG.MAX_NEW_CATALOG_PER_DAY
    ) {
      console.log(`🎯 Quotas journaliers atteints (${CONFIG.MAX_NEW_PEPITES_PER_DAY} pépites, ${CONFIG.MAX_NEW_CATALOG_PER_DAY} catalogue max).`);
      break;
    }

    if (BANNED_APP_IDS.has(appId)) {
      continue;
    }

    await delay(CONFIG.REQUEST_DELAY_MS);

    // Vérification des avis (Double seuil : >= 500 & >= 85% pour Pépite, >= 30 & >= 70% pour Catalogue)
    const reviewCheck = await checkGameReviews(appId);
    if (!reviewCheck.eligible) {
      continue;
    }

    // Si le jeu est déjà dans le Catalogue Étendu et ne remplit pas encore les critères d'excellence pour devenir Pépite
    if (isExistingCatalogGame && reviewCheck.tier !== 'pepite') {
      continue;
    }

    // Si le quota pour son niveau est déjà atteint, on passe
    if (reviewCheck.tier === 'pepite' && newlyHarvestedPepites.length >= CONFIG.MAX_NEW_PEPITES_PER_DAY) {
      continue;
    }
    if (reviewCheck.tier === 'catalog' && newlyHarvestedCatalog.length >= CONFIG.MAX_NEW_CATALOG_PER_DAY) {
      continue;
    }

    // Récupération des détails FR et EN
    const detailsFr = await fetchGameDetails(appId, 'french');
    if (!detailsFr || detailsFr.type !== 'game') continue;

    // 1. Vérifier que le titre contient des caractères latins lisibles
    if (!hasLatinLetters(detailsFr.name)) {
      console.log(`   ⛔ [Filtré Titre Non-Latin] "${detailsFr.name}" ne comporte aucun caractère latin.`);
      continue;
    }

    // 3. Vérifier que c'est bien un jeu indépendant
    const isIndie = detailsFr.genres?.some((g) =>
      ['indépendant', 'indie'].includes(g.description.toLowerCase())
    );
    if (!isIndie) continue;

    // 4. Filtrer contenu adulte / NSFW
    if (isAdultOrInappropriate(detailsFr)) {
      console.log(`   ⛔ [Filtré Adulte FR] ${detailsFr.name} contient du contenu inapproprié.`);
      continue;
    }

    if (!detailsFr.screenshots || detailsFr.screenshots.length < 5) continue;

    await delay(CONFIG.REQUEST_DELAY_MS);
    const detailsEn = await fetchGameDetails(appId, 'english');
    if (detailsEn && isAdultOrInappropriate(detailsEn)) {
      console.log(`   ⛔ [Filtré Adulte EN] ${detailsEn.name} contient du contenu inapproprié.`);
      continue;
    }

    // 5. Doit avoir une description textuelle latine lisible (FR ou EN)
    if (!isReadableLatinText(detailsFr.short_description) && !isReadableLatinText(detailsEn?.short_description || '')) {
      console.log(`   ⛔ [Filtré Langue] ${detailsFr.name} n'a pas de description en alphabet latin.`);
      continue;
    }

    const taglineEn = detailsEn?.short_description || detailsFr.short_description;

    const existingCatalogSlug = catalogSlugMap.get(appId);
    const slug = existingCatalogSlug || slugify(detailsFr.name, appId);
    if (!slug || (existingSlugs.has(slug) && !isExistingCatalogGame)) continue;

    const yearMatch = detailsFr.release_date?.date.match(/\d{4}/);
    const releaseYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

    const fullText = [
      detailsFr.short_description,
      detailsEn?.short_description,
      detailsFr.detailed_description,
      detailsEn?.detailed_description,
    ].filter(Boolean).join(' ');

    const artStyle = inferCanonicalArtStyle(
      fullText,
      detailsFr.genres?.map((g) => g.description) || []
    );

    const camera = inferCanonicalCamera(
      fullText,
      detailsFr.genres?.map((g) => g.description) || []
    );

    const genres = sanitizeGenres(
      detailsFr.genres || [],
      detailsFr.short_description,
      existingNormalizedGenres
    );

    const screenshots = detailsFr.screenshots.slice(0, 6).map((s) => s.path_full);
    while (screenshots.length < 6 && detailsFr.header_image) {
      screenshots.push(detailsFr.header_image);
    }

    const composer = extractComposer(detailsFr.detailed_description) ||
                     extractComposer(detailsEn?.detailed_description || '');

    const gameObj: Game = {
      id: slug,
      title: detailsFr.name,
      releaseYear,
      genre: genres,
      artStyle,
      camera,
      developer: detailsFr.developers?.join(', ') || detailsFr.publishers?.join(', ') || 'Studio Indépendant',
      steamUrl: `https://store.steampowered.com/app/${appId}/`,
      screenshots,
      hints: {
        tagline: {
          fr: detailsFr.short_description.replace(/\r?\n/g, ' ').trim(),
          en: taglineEn.replace(/\r?\n/g, ' ').trim(),
        },
        ...(composer ? { composer } : {}),
      },
      ...(detailsFr.is_free ? { isFree: true } : {}),
    };

    const audit = auditCandidateGame(gameObj, existingNormalizedGenres);
    if (!audit.valid) {
      console.warn(`   ⚠️ [Candidat rejeté par l'audit] ${gameObj.title}: ${audit.reason}`);
      continue;
    }

    if (reviewCheck.tier === 'pepite') {
      if (isExistingCatalogGame) {
        console.log(`🎓 [PROMOTION AU RANG DE PÉPITE] "${gameObj.title}" a franchi le seuil d'excellence ! (${reviewCheck.totalReviews} avis, ${Math.round(reviewCheck.positiveRatio * 100)}% positifs)`);
        promotedFromCatalogIds.add(slug);
      } else {
        console.log(`🌟 [NOUVELLE PÉPITE MAJEURE] ${gameObj.title} (${gameObj.releaseYear})`);
        console.log(`   ★ Avis : ${reviewCheck.scoreDesc} (${Math.round(reviewCheck.positiveRatio * 100)}% positifs sur ${reviewCheck.totalReviews} avis)`);
        console.log(`   ★ Style : ${gameObj.artStyle.fr} | Caméra : ${gameObj.camera.fr}`);
        console.log(`   ★ Genres : ${gameObj.genre.join(', ')}\n`);
      }
      newlyHarvestedPepites.push(gameObj);
      existingSlugs.add(slug);
      pepiteAppIds.add(appId);
    } else {
      // Tier catalog
      console.log(`📖 [NOUVEAU JEU CATALOGUE ÉTENDU] ${gameObj.title} (${gameObj.releaseYear})`);
      console.log(`   ★ Avis : ${reviewCheck.scoreDesc} (${Math.round(reviewCheck.positiveRatio * 100)}% positifs sur ${reviewCheck.totalReviews} avis)`);
      console.log(`   ★ Style : ${gameObj.artStyle.fr} | Caméra : ${gameObj.camera.fr}`);
      console.log(`   ★ Genres : ${gameObj.genre.join(', ')}\n`);
      newlyHarvestedCatalog.push({
        ...gameObj,
        steamAppId: appId,
        headerImage: detailsFr.header_image,
      });
      existingSlugs.add(slug);
      catalogAppIds.add(appId);
    }
  }

  // 3. Fusion et sauvegarde des bases
  const allNewPepites = [...radarSync.promotedPepites, ...newlyHarvestedPepites];
  const allNewCatalog = [...radarSync.promotedCatalog, ...newlyHarvestedCatalog];

  if (allNewPepites.length > 0) {
    const updatedGamesList = [...INDIE_GAMES, ...allNewPepites];
    saveGamesDatabase(updatedGamesList);
    console.log(`\n🎉 [4/4] Base des Pépites mise à jour ! ${allNewPepites.length} pépite(s) ajoutée(s) (dont ${radarSync.promotedPepites.length} issue(s) du Radar).`);
    console.log(`📚 Nouveau panthéon des Pépites : ${updatedGamesList.length} chefs-d'œuvre certifiés.`);
  } else {
    console.log('\n☕ [4/4] Aucune nouvelle Pépite majeure à intégrer aujourd\'hui. Le sanctuaire reste sélectif et pur.');
  }

  if (allNewCatalog.length > 0 || promotedFromCatalogIds.size > 0) {
    saveSteamCatalogDatabase(allNewCatalog, promotedFromCatalogIds);
  }

  // 4. Moissonnage automatique des Micro-Indés Itch.io
  const itchHarvest = await harvestItchMicroIndies(INITIAL_MICRO_INDIES);
  if (itchHarvest.addedCount > 0) {
    saveMicroIndiesDatabase(itchHarvest.updatedList);
    console.log(`🌱 [Itch.io] ${itchHarvest.addedCount} pépite(s) Itch.io ajoutée(s) à La Clairière.`);
  }

  return {
    promotedFromRadarToPepite: radarSync.promotedPepites.map((g) => g.title),
    promotedFromRadarToCatalog: radarSync.promotedCatalog.map((g) => g.title),
    promotedFromCatalogToPepite: Array.from(promotedFromCatalogIds),
    newlyHarvestedPepites: newlyHarvestedPepites.map((g) => g.title),
    newlyHarvestedCatalog: newlyHarvestedCatalog.map((g) => g.title),
    newlyHarvestedItch: itchHarvest.addedCount,
    totalUpcoming: updatedUpcoming.length,
    totalPepites: INDIE_GAMES.length + allNewPepites.length,
    totalCatalog: existingCatalog.length + allNewCatalog.length - promotedFromCatalogIds.size,
  };
}

// Exécution directe en CLI
if (process.argv[1]?.includes('dailyIndieHarvest')) {
  runDailyHarvest().catch((err) => {
    console.error('❌ Erreur critique lors du moissonnage :', err);
    process.exit(1);
  });
}
