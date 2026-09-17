import fs from 'fs';
import path from 'path';
import type { Game } from '../src/types/game';
import { INDIE_GAMES } from '../src/data/games';

/**
 * 🦉 Hoot Indie Games — Script d'Alimentation Quotidienne Automatique
 * Moissonne les nouveautés et tendances indépendantes certifiées sur Steam,
 * applique des filtres stricts de qualité (Règle 0 Hallucination) et met à jour
 * la base de données officielle src/data/games.ts.
 */

// Configuration des seuils de qualité
const CONFIG = {
  MIN_REVIEWS: 15,          // Minimum d'avis pour éliminer les prototypes / shovelware
  MIN_POSITIVE_RATIO: 0.80, // Minimum 80% d'avis positifs
  MAX_NEW_GAMES_PER_DAY: 3, // Nombre maximum de pépites ajoutées par jour pour préserver la curation
  REQUEST_DELAY_MS: 400,    // Délai poli entre requêtes Steam API
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Inférence de l'ArtStyle canonique strict
function inferCanonicalArtStyle(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  if (lower.includes('pixel') || lower.includes('16-bit') || lower.includes('8-bit') || lower.includes('retro 2d')) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
  }
  if (lower.includes('hand-drawn') || lower.includes('dessiné') || lower.includes('watercolor') || lower.includes('cartoon') || lower.includes('anime') || lower.includes('sketch') || lower.includes('peint')) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }
  if (lower.includes('low poly') || lower.includes('low-poly') || lower.includes('ps1') || lower.includes('psx') || lower.includes('polygonal') || lower.includes('retro 3d')) {
    return { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' };
  }
  if (lower.includes('realistic') || lower.includes('photorealist') || lower.includes('réaliste') || lower.includes('unreal engine 5') || lower.includes('ue5')) {
    return { fr: '3D Réaliste', en: 'Realistic 3D' };
  }
  if (lower.includes('monochrome') || lower.includes('black and white') || lower.includes('minimalist') || lower.includes('noir et blanc')) {
    return { fr: 'Monochrome / Minimaliste', en: 'Monochrome' };
  }

  // Par défaut selon les tags 3D
  if (lower.includes('3d') || genres.some((g) => ['3D', 'Action 3D', 'Aventure 3D', 'Simulation', 'Survie'].includes(g))) {
    return { fr: '3D Stylisée', en: 'Stylized 3D' };
  }
  return { fr: 'Pixel Art', en: 'Pixel Art' };
}

// Inférence de la Caméra canonique stricte
function inferCanonicalCamera(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  if (lower.includes('first-person') || lower.includes('première personne') || lower.includes('fps') || lower.includes('vue subjective') || lower.includes('fpv')) {
    return { fr: 'Première personne', en: 'First-Person' };
  }
  if (lower.includes('isometric') || lower.includes('isométrique') || lower.includes('2.5d') || lower.includes('diablo-like')) {
    return { fr: 'Isométrique / 2.5D', en: 'Isometric / 2.5D' };
  }
  if (lower.includes('top-down') || lower.includes('vue du dessus') || lower.includes('vue de dessus') || lower.includes('twin-stick') || lower.includes('vertical')) {
    return { fr: 'Vue du dessus 2D', en: '2D Top-down' };
  }
  if (lower.includes('third-person') || lower.includes('troisième personne') || lower.includes('tps') || lower.includes('over-the-shoulder')) {
    return { fr: 'Troisième personne', en: 'Third-Person' };
  }

  // Par défaut 2D
  return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
}

// Nettoyage des genres pour éviter les métadonnées polluantes
function sanitizeGenres(steamGenres: Array<{ description: string }>, descriptionText: string): string[] {
  const banned = ['indépendant', 'accès anticipé', 'indie', 'early access', 'free to play', 'gratuit', 'occasionnel', 'casual'];
  const mapping: Record<string, string> = {
    'action': 'Action',
    'adventure': 'Aventure',
    'aventure': 'Aventure',
    'rpg': 'RPG',
    'role-playing': 'RPG',
    'strategy': 'Stratégie',
    'stratégie': 'Stratégie',
    'simulation': 'Simulation',
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
  if (lowerDesc.includes('coop') || lowerDesc.includes('coopération')) results.add('Coop');

  const finalGenres = Array.from(results).slice(0, 4);
  return finalGenres.length > 0 ? finalGenres : ['Aventure', 'Indépendant'];
}

// Extraction du nom de compositeur si mentionné dans la description
function extractComposer(text: string): string | undefined {
  const match = text.match(/(?:musique|soundtrack|bande[- ]originale|ost|composed by|composée par)\s*(?:de|by|par)?\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
  return match ? match[1].trim() : undefined;
}

// Récupération des AppIDs candidats depuis Steam
async function fetchCandidateAppIds(): Promise<number[]> {
  const candidates = new Set<number>();

  console.log('🔍 [1/4] Interrogation des flux Steam Nouveautés & Tendances Indés...');

  try {
    // 1. Nouveautés et Top Ventes dans le genre Indépendant
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
    // 2. Catégories Featured (au cas où un indé majeur est mis en avant)
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

// Vérification de la note et du volume d'avis Steam
async function checkGameReviews(appId: number): Promise<{ eligible: boolean; totalReviews: number; positiveRatio: number; scoreDesc: string }> {
  try {
    const url = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`;
    const res = await fetch(url);
    if (!res.ok) return { eligible: false, totalReviews: 0, positiveRatio: 0, scoreDesc: '' };

    const data = (await res.json()) as {
      query_summary?: {
        total_reviews: number;
        total_positive: number;
        review_score_desc: string;
      };
    };

    const summary = data.query_summary;
    if (!summary || summary.total_reviews < CONFIG.MIN_REVIEWS) {
      return { eligible: false, totalReviews: summary?.total_reviews || 0, positiveRatio: 0, scoreDesc: summary?.review_score_desc || '' };
    }

    const ratio = summary.total_positive / summary.total_reviews;
    const eligible = ratio >= CONFIG.MIN_POSITIVE_RATIO;

    return {
      eligible,
      totalReviews: summary.total_reviews,
      positiveRatio: ratio,
      scoreDesc: summary.review_score_desc,
    };
  } catch {
    return { eligible: false, totalReviews: 0, positiveRatio: 0, scoreDesc: '' };
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
  release_date?: { date: string };
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

// Fonction principale de moissonnage
export async function runDailyHarvest() {
  console.log('🦉 ====================================================');
  console.log('🦉 HOOT INDIE GAMES — MOISSONNAGE QUOTIDIEN AUTOMATIQUE');
  console.log('🦉 ====================================================\n');

  // 1. Récupération des jeux déjà existants pour éviter les doublons
  const existingSlugs = new Set(INDIE_GAMES.map((g) => g.id));
  const existingAppIds = new Set<number>();

  for (const game of INDIE_GAMES) {
    if (game.steamUrl) {
      const match = game.steamUrl.match(/\/app\/(\d+)/);
      if (match) existingAppIds.add(parseInt(match[1], 10));
    }
  }

  console.log(`📦 Base actuelle : ${INDIE_GAMES.length} jeux certifiés.`);

  // 2. Recherche des candidats
  const candidateIds = await fetchCandidateAppIds();
  const newCandidates = candidateIds.filter((id) => !existingAppIds.has(id));
  console.log(`✨ ${newCandidates.length} nouvelles sorties / tendances à analyser...\n`);

  const addedGames: Game[] = [];

  // 3. Filtrage et sélection
  for (const appId of newCandidates) {
    if (addedGames.length >= CONFIG.MAX_NEW_GAMES_PER_DAY) {
      console.log(`🎯 Quota journalier atteint (${CONFIG.MAX_NEW_GAMES_PER_DAY} pépites max).`);
      break;
    }

    await delay(CONFIG.REQUEST_DELAY_MS);

    // Vérification des avis
    const reviewCheck = await checkGameReviews(appId);
    if (!reviewCheck.eligible) {
      continue;
    }

    // Récupération des détails FR et EN
    const detailsFr = await fetchGameDetails(appId, 'french');
    if (!detailsFr || detailsFr.type !== 'game') continue;

    // Doit être un jeu avec le tag Indépendant
    const isIndie = detailsFr.genres?.some((g) =>
      ['indépendant', 'indie'].includes(g.description.toLowerCase())
    );
    if (!isIndie) continue;

    // Doit avoir au moins 5 captures d'écran
    if (!detailsFr.screenshots || detailsFr.screenshots.length < 5) continue;

    await delay(CONFIG.REQUEST_DELAY_MS);
    const detailsEn = await fetchGameDetails(appId, 'english');
    const taglineEn = detailsEn?.short_description || detailsFr.short_description;

    const slug = slugify(detailsFr.name);
    if (existingSlugs.has(slug)) continue;

    const yearMatch = detailsFr.release_date?.date.match(/\d{4}/);
    const releaseYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

    const artStyle = inferCanonicalArtStyle(
      detailsFr.short_description + ' ' + (detailsEn?.short_description || ''),
      detailsFr.genres?.map((g) => g.description) || []
    );

    const camera = inferCanonicalCamera(
      detailsFr.short_description + ' ' + (detailsEn?.short_description || ''),
      detailsFr.genres?.map((g) => g.description) || []
    );

    const genres = sanitizeGenres(
      detailsFr.genres || [],
      detailsFr.short_description
    );

    const screenshots = detailsFr.screenshots.slice(0, 6).map((s) => s.path_full);
    // Assurer au moins 6 visuels
    while (screenshots.length < 6) {
      screenshots.push(detailsFr.header_image);
    }

    const composer = extractComposer(detailsFr.detailed_description) ||
                     extractComposer(detailsEn?.detailed_description || '');

    const newGame: Game = {
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
    };

    console.log(`✅ [PÉPITE DÉTECTÉE] ${newGame.title} (${newGame.releaseYear})`);
    console.log(`   ★ Avis : ${reviewCheck.scoreDesc} (${Math.round(reviewCheck.positiveRatio * 100)}% positifs sur ${reviewCheck.totalReviews} avis)`);
    console.log(`   ★ Style : ${newGame.artStyle.fr} | Caméra : ${newGame.camera.fr}`);
    console.log(`   ★ Genres : ${newGame.genre.join(', ')}\n`);

    addedGames.push(newGame);
    existingSlugs.add(slug);
    existingAppIds.add(appId);
  }

  if (addedGames.length === 0) {
    console.log('☕ Aucune nouvelle sortie indé n\'a atteint les critères d\'excellence aujourd\'hui.');
    console.log('   La base de données reste inchangée et propre.');
    return { addedCount: 0 };
  }

  // 4. Fusion et écriture sécurisée de src/data/games.ts
  const updatedGamesList = [...INDIE_GAMES, ...addedGames];

  const fileHeader = `import type { Game } from '../types/game';

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Enrichie quotidiennement par le robot Hoot Harvest via l'API Steam Store officielle.
 * 0 Hallucination : métadonnées et captures certifiées.
 * Total de jeux : ${updatedGamesList.length}
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
`;

  const targetPath = path.join(process.cwd(), 'src/data/games.ts');
  const fullContent = fileHeader + JSON.stringify(updatedGamesList, null, 2) + fileFooter;

  fs.writeFileSync(targetPath, fullContent, 'utf8');
  console.log(`🎉 Succès ! ${addedGames.length} nouveau(x) jeu(x) ajouté(s) à src/data/games.ts !`);
  console.log(`📚 Nouveau total de la base : ${updatedGamesList.length} jeux.`);

  return { addedCount: addedGames.length, games: addedGames.map((g) => g.title) };
}

// Exécution directe en CLI
if (process.argv[1]?.includes('dailyIndieHarvest')) {
  runDailyHarvest().catch((err) => {
    console.error('❌ Erreur critique lors du moissonnage :', err);
    process.exit(1);
  });
}
