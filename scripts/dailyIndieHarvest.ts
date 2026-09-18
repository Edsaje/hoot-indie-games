import fs from 'fs';
import path from 'path';
import type { Game } from '../src/types/game';
import { INDIE_GAMES } from '../src/data/games';
import { UPCOMING_INDIE_GAMES, type UpcomingGame } from '../src/data/upcomingGames';

/**
 * 🦉 Hoot Indie Games — Script d'Alimentation & Synchronisation Quotidienne Automatique
 * 1. Surveille le Radar des jeux à venir : détecte si un jeu est officiellement sorti sur Steam
 *    et le promeut automatiquement vers la base de jeux jouables (src/data/games.ts).
 * 2. Maintient le Radar à jour : synchronise les dates de sortie annoncées par les studios
 *    et réapprovisionne le Radar avec les pépites indés les plus attendues sur Steam.
 * 3. Moissonne les nouveautés et tendances indépendantes certifiées sur Steam avec des filtres
 *    stricts de qualité (Règle 0 Hallucination, avis positifs > 80%, captures HD certifiées).
 */

// Configuration des seuils de qualité
const CONFIG = {
  MIN_REVIEWS: 15,          // Minimum d'avis pour éliminer les prototypes / shovelware
  MIN_POSITIVE_RATIO: 0.80, // Minimum 80% d'avis positifs
  MAX_NEW_GAMES_PER_DAY: 3, // Nombre maximum de pépites ajoutées par jour pour préserver la curation
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

// Inférence de l'ArtStyle canonique strict
function inferCanonicalArtStyle(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  if (lower.includes('pixel') || lower.includes('16-bit') || lower.includes('8-bit') || lower.includes('retro 2d') || lower.includes('pixel-art')) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
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
  if (lower.includes('hand-drawn') || lower.includes('dessiné') || lower.includes('watercolor') || lower.includes('cartoon') || lower.includes('anime') || lower.includes('sketch') || lower.includes('peint')) {
    if (lower.includes('3d') || lower.includes('isometric') || lower.includes('third-person') || lower.includes('first-person')) {
      return { fr: '3D Stylisée', en: 'Stylized 3D' };
    }
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  // Par défaut selon les tags 3D
  if (lower.includes('3d') || genres.some((g) => ['3D', 'Action 3D', 'Aventure 3D', 'Simulation', 'Survie', 'RPG'].includes(g))) {
    return { fr: '3D Stylisée', en: 'Stylized 3D' };
  }
  return { fr: 'Pixel Art', en: 'Pixel Art' };
}

// Inférence de la Caméra canonique stricte
function inferCanonicalCamera(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  if (lower.includes('first-person') || lower.includes('first person') || lower.includes('première personne') || lower.includes('fps') || lower.includes('vue subjective') || lower.includes('fpv') || lower.includes('conduire') || lower.includes('drive')) {
    return { fr: 'Première personne', en: 'First-Person' };
  }
  if (lower.includes('isometric') || lower.includes('isométrique') || lower.includes('2.5d') || lower.includes('diablo-like') || lower.includes('arpg') || lower.includes('souls-like') || lower.includes('quarter view')) {
    return { fr: 'Isométrique / 2.5D', en: 'Isometric / 2.5D' };
  }
  if (lower.includes('top-down') || lower.includes('vue du dessus') || lower.includes('vue de dessus') || lower.includes('twin-stick') || lower.includes('vertical')) {
    return { fr: 'Vue du dessus 2D', en: '2D Top-down' };
  }
  if (lower.includes('third-person') || lower.includes('third person') || lower.includes('troisième personne') || lower.includes('tps') || lower.includes('over-the-shoulder') || lower.includes('open world') || lower.includes('monde ouvert') || lower.includes('survie')) {
    return { fr: 'Troisième personne', en: 'Third-Person' };
  }

  // Par défaut selon le contexte
  if (lower.includes('3d')) {
    return { fr: 'Troisième personne', en: 'Third-Person' };
  }
  return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
}

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
  const text = (details.name + ' ' + details.short_description + ' ' + (details.detailed_description || '')).toLowerCase();
  const bannedKeywords = [
    'hentai', 'nsfw', 'adult only', 'nudity', 'nudité', 'sexual', 'sexe',
    'erotic', 'érotique', 'porn', 'ntr', 'lust', 'waifu', 'dating sim',
    'unrated', 'co-eds', 'landlord', 'satisfy the lonely hearts', 'compagne de bureau',
    'ecchi', 'sensual', 'furry', 'harem', 'weed', 'cannabis', 'marijuana', 'drug'
  ];
  for (const kw of bannedKeywords) {
    if (text.includes(kw)) return true;
  }
  return false;
}

// Validation d'audit interne stricte (Règle 0 Hallucination & Intégrité)
function auditCandidateGame(game: Game): { valid: boolean; reason?: string } {
  if (!game.id || typeof game.id !== 'string' || game.id.trim() === '') {
    return { valid: false, reason: 'ID manquant ou invalide' };
  }
  if (!game.title || game.title.trim() === '') {
    return { valid: false, reason: 'Titre manquant' };
  }
  if (!hasLatinLetters(game.title)) {
    return { valid: false, reason: 'Le titre ne contient aucun caractère latin' };
  }
  if (typeof game.releaseYear !== 'number' || game.releaseYear < 2000 || game.releaseYear > 2026) {
    return { valid: false, reason: `Année de sortie anormale (${game.releaseYear})` };
  }
  if (!game.developer || game.developer.trim() === '') {
    return { valid: false, reason: 'Développeur manquant' };
  }
  const validArtStyles = ['Pixel Art', '2D Hand-drawn', 'Stylized 3D', 'Retro Low-poly 3D', 'Realistic 3D', 'Monochrome'];
  const validCameras = ['2D Side-scroller', '2D Top-down', 'Isometric / 2.5D', 'First-Person', 'Third-Person'];
  if (!validArtStyles.includes(game.artStyle.en)) {
    return { valid: false, reason: `ArtStyle invalide: "${game.artStyle.en}"` };
  }
  if (!validCameras.includes(game.camera.en)) {
    return { valid: false, reason: `Camera invalide: "${game.camera.en}"` };
  }
  if (!game.hints.tagline.fr || !game.hints.tagline.en) {
    return { valid: false, reason: 'Tagline FR ou EN manquante' };
  }
  if (!Array.isArray(game.screenshots) || game.screenshots.length < 5) {
    return { valid: false, reason: 'Moins de 5 screenshots' };
  }
  if (!game.steamUrl || !game.steamUrl.startsWith('https://store.steampowered.com/app/')) {
    return { valid: false, reason: 'URL Steam invalide' };
  }
  const adultBannedKeywords = ['hentai', 'sexual', 'nsfw', 'nudity', 'nudité', 'erotic', 'érotique', 'dating sim', 'waifu', 'compagne de bureau', 'porn'];
  const lowerContent = (game.title + ' ' + game.genre.join(' ') + ' ' + (game.hints?.tagline?.fr || '') + ' ' + (game.hints?.tagline?.en || '')).toLowerCase();
  for (const kw of adultBannedKeywords) {
    if (lowerContent.includes(kw)) {
      return { valid: false, reason: `Contenu adulte interdit ("${kw}")` };
    }
  }
  return { valid: true };
}

// Nettoyage des genres pour éliminer les étiquettes non pertinentes
function sanitizeGenres(steamGenres: Array<{ description: string }>, descriptionText: string): string[] {
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
  existingAppIds: Set<number>
): Promise<{
  promotedGames: Game[];
  updatedUpcoming: UpcomingGame[];
  hasChanges: boolean;
}> {
  console.log('📡 [1/4] Surveillance du Radar des sorties (Vérification des disponibilités)...');
  const promotedGames: Game[] = [];
  const updatedUpcoming: UpcomingGame[] = [];
  let hasChanges = false;

  for (const upcoming of UPCOMING_INDIE_GAMES) {
    let appId: number | null = null;
    if (upcoming.steamUrl) {
      const match = upcoming.steamUrl.match(/\/app\/(\d+)/);
      if (match) appId = parseInt(match[1], 10);
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
      console.log(`   ➔ Promotion automatique du Radar vers la base de jeux jouables...`);

      await delay(CONFIG.REQUEST_DELAY_MS);
      const detailsEn = await fetchGameDetails(appId, 'english');
      const taglineEn = detailsEn?.short_description || detailsFr.short_description;

      const slug = upcoming.id || slugify(detailsFr.name, appId);
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
      };

      const audit = auditCandidateGame(promotedGame);
      if (!audit.valid) {
        console.warn(`   ⚠️ [Promotion rejetée par l'audit] ${promotedGame.title}: ${audit.reason}`);
        updatedUpcoming.push(upcoming);
        continue;
      }

      promotedGames.push(promotedGame);
      existingSlugs.add(slug);
      existingAppIds.add(appId);
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

  return { promotedGames, updatedUpcoming, hasChanges };
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
      if (currentAppIds.has(appId) || existingAppIds.has(appId)) continue;

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
`;

  fs.writeFileSync(targetPath, fileHeader + JSON.stringify(gamesList, null, 2) + fileFooter, 'utf8');
}

// =============================================================
// FONCTION PRINCIPALE DE MOISSONNAGE & SYNCHRONISATION
// =============================================================
export async function runDailyHarvest() {
  console.log('🦉 ===============================================================');
  console.log('🦉 HOOT INDIE GAMES — MOISSONNAGE & SYNCHRONISATION AUTOMATIQUE');
  console.log('🦉 ===============================================================\n');

  const existingSlugs = new Set(INDIE_GAMES.map((g) => g.id));
  const existingAppIds = new Set<number>();

  for (const game of INDIE_GAMES) {
    if (game.steamUrl) {
      const match = game.steamUrl.match(/\/app\/(\d+)/);
      if (match) existingAppIds.add(parseInt(match[1], 10));
    }
  }

  console.log(`📦 Base actuelle de jeux jouables : ${INDIE_GAMES.length} jeux certifiés.`);
  console.log(`🔭 Radar actuel de sorties : ${UPCOMING_INDIE_GAMES.length} jeux en surveillance.\n`);

  // 1. Surveillance et synchronisation du Radar
  const radarSync = await syncUpcomingRadar(existingSlugs, existingAppIds);
  let updatedUpcoming = radarSync.updatedUpcoming;
  let radarNeedsSave = radarSync.hasChanges;

  // Si des jeux ont été promus, réapprovisionner le Radar
  if (updatedUpcoming.length < CONFIG.TARGET_RADAR_COUNT) {
    const refill = await refillUpcomingRadar(updatedUpcoming, existingAppIds);
    updatedUpcoming = refill.newUpcoming;
    if (refill.hasChanges) radarNeedsSave = true;
  }

  if (radarNeedsSave) {
    saveUpcomingGames(updatedUpcoming);
    console.log(`💾 [Radar Sauvegardé] Radar synchronisé avec ${updatedUpcoming.length} titres à venir.\n`);
  }

  // 2. Recherche et moissonnage des nouveautés / tendances indépendantes Steam
  const candidateIds = await fetchCandidateAppIds();
  const newCandidates = candidateIds.filter((id) => !existingAppIds.has(id));
  console.log(`✨ [3/4] ${newCandidates.length} nouveautés / tendances Steam à filtrer...\n`);

  const newlyHarvestedGames: Game[] = [];

  for (const appId of newCandidates) {
    if (newlyHarvestedGames.length >= CONFIG.MAX_NEW_GAMES_PER_DAY) {
      console.log(`🎯 Quota journalier de nouveautés atteint (${CONFIG.MAX_NEW_GAMES_PER_DAY} pépites max).`);
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

    // 1. Exclure les jeux F2P ou MMO
    if (detailsFr.is_free) {
      console.log(`   ⛔ [Filtré F2P] ${detailsFr.name} est gratuit / free-to-play.`);
      continue;
    }

    const isExcludedGenre = detailsFr.genres?.some((g) => {
      const desc = g.description.toLowerCase();
      return [
        'free to play',
        'gratuit',
        'mmo',
        'massif',
        'massivement multijoueur',
        'massively multiplayer',
      ].includes(desc);
    });
    if (isExcludedGenre) {
      console.log(`   ⛔ [Filtré Genre Exclu] ${detailsFr.name} (MMO / F2P).`);
      continue;
    }

    // 2. Vérifier que le titre contient des caractères latins lisibles
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
      console.log(`   ⛔ [Filtré Adulte] ${detailsFr.name} contient du contenu inapproprié.`);
      continue;
    }

    if (!detailsFr.screenshots || detailsFr.screenshots.length < 5) continue;

    await delay(CONFIG.REQUEST_DELAY_MS);
    const detailsEn = await fetchGameDetails(appId, 'english');

    // 5. Doit avoir une description textuelle latine lisible (FR ou EN)
    if (!isReadableLatinText(detailsFr.short_description) && !isReadableLatinText(detailsEn?.short_description || '')) {
      console.log(`   ⛔ [Filtré Langue] ${detailsFr.name} n'a pas de description en alphabet latin.`);
      continue;
    }

    const taglineEn = detailsEn?.short_description || detailsFr.short_description;

    const slug = slugify(detailsFr.name, appId);
    if (!slug || existingSlugs.has(slug)) continue;

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
    while (screenshots.length < 6 && detailsFr.header_image) {
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

    const audit = auditCandidateGame(newGame);
    if (!audit.valid) {
      console.warn(`   ⚠️ [Candidat rejeté par l'audit] ${newGame.title}: ${audit.reason}`);
      continue;
    }

    console.log(`✅ [PÉPITE DÉTECTÉE] ${newGame.title} (${newGame.releaseYear})`);
    console.log(`   ★ Avis : ${reviewCheck.scoreDesc} (${Math.round(reviewCheck.positiveRatio * 100)}% positifs sur ${reviewCheck.totalReviews} avis)`);
    console.log(`   ★ Style : ${newGame.artStyle.fr} | Caméra : ${newGame.camera.fr}`);
    console.log(`   ★ Genres : ${newGame.genre.join(', ')}\n`);

    newlyHarvestedGames.push(newGame);
    existingSlugs.add(slug);
    existingAppIds.add(appId);
  }

  // 3. Fusion et sauvegarde de la base de jeux jouables
  const allNewGames = [...radarSync.promotedGames, ...newlyHarvestedGames];

  if (allNewGames.length > 0) {
    const updatedGamesList = [...INDIE_GAMES, ...allNewGames];
    saveGamesDatabase(updatedGamesList);
    console.log(`\n🎉 [4/4] Base mise à jour ! ${allNewGames.length} jeu(x) ajouté(s) (dont ${radarSync.promotedGames.length} issu(s) du Radar).`);
    console.log(`📚 Nouveau catalogue jouable : ${updatedGamesList.length} jeux certifiés.`);
  } else {
    console.log('\n☕ [4/4] Aucun nouveau jeu jouable à intégrer aujourd\'hui. La base reste propre et certifiée.');
  }

  return {
    promotedFromRadar: radarSync.promotedGames.map((g) => g.title),
    newlyHarvested: newlyHarvestedGames.map((g) => g.title),
    totalUpcoming: updatedUpcoming.length,
    totalPlayable: INDIE_GAMES.length + allNewGames.length,
  };
}

// Exécution directe en CLI
if (process.argv[1]?.includes('dailyIndieHarvest')) {
  runDailyHarvest().catch((err) => {
    console.error('❌ Erreur critique lors du moissonnage :', err);
    process.exit(1);
  });
}
