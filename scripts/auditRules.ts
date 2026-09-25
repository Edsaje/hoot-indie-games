import type { Game } from '../src/types/game';

/**
 * AppIDs explicitement bannis du sanctuaire (contenu adulte, shovelware, troll, etc.)
 */
export const BANNED_APP_IDS = new Set<number>([
  4739660, // Drag'n Wash (contenu adulte déguisé)
  1888160, // ARMORED CORE VI (AAA FromSoftware / Bandai Namco)
  1325200, // Nioh 2 (AAA Team Ninja / Koei Tecmo)
  2072450, // Like a Dragon: Infinite Wealth (AAA SEGA)
]);

/**
 * Éditeurs et studios AAA non-indépendants interdits de moissonnage dans le sanctuaire
 */
export const BANNED_AAA_PUBLISHERS = [
  'bandai namco',
  'electronic arts',
  'ubisoft',
  'activision',
  'blizzard',
  'sony interactive entertainment',
  'playstation pc llc',
  'xbox game studios',
  'microsoft',
  'square enix',
  'capcom',
  'sega',
  'koei tecmo',
  'bethesda',
  'take-two interactive',
  'warner bros',
  'konami',
  'fromsoftware',
  'tencent',
  'riot games',
  'netmarble',
  'ncsoft',
];

const COMPILED_AAA_REGEXES = [
  /\belectronic arts\b/i,
  /\bea games\b/i,
  /\bea sports\b/i,
  /\b2k\b/i,
  ...BANNED_AAA_PUBLISHERS.map((pub) => new RegExp(`\\b${pub.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')),
];

export function isNonIndieOrAAA(text: string): boolean {
  if (!text) return false;
  return COMPILED_AAA_REGEXES.some((rx) => rx.test(text));
}


/**
 * Mots-clés interdits pour le filtrage strict anti-contenu adulte / hentai / NSFW
 */
export const ADULT_BANNED_KEYWORDS = [
  'hentai',
  'sexual',
  'sexuel',
  'nsfw',
  'nudity',
  'nudité',
  'erotic',
  'érotique',
  'dating sim',
  'waifu',
  'compagne de bureau',
  'porn',
  'porno',
  'touch them',
  'wash them',
  'male dragon',
  'adult content',
  'adult only',
  '18+',
  'ecchi',
  'sensual',
  'furry',
  'harem',
  'lust',
  'ntr',
  'unrated',
  'co-eds',
  'landlord',
  'satisfy the lonely hearts',
  'eroge',
  'yuri',
  'yaoi',
  'bdsm',
  'fetish',
  'weed',
  'cannabis',
  'marijuana',
  'drug',
  'drugs',
  'gore',
  'explicit content',
  'sexual content',
  'mature content',
];

export const VALID_ART_STYLES = [
  'Pixel Art',
  '2D Hand-drawn',
  'Stylized 3D',
  'Retro Low-poly 3D',
  'Realistic 3D',
  'Monochrome',
];

export const VALID_CAMERAS = [
  '2D Side-scroller',
  '2D Top-down',
  'Isometric / 2.5D',
  'First-Person',
  'Third-Person',
];

export interface AuditResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function buildKeywordRegex(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startBoundary = /^\w/.test(keyword) ? '\\b' : '';
  const endBoundary = /\w$/.test(keyword) ? '\\b' : '';
  return new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
}

const COMPILED_KEYWORD_REGEXES = ADULT_BANNED_KEYWORDS.map((kw) => ({
  keyword: kw,
  regex: buildKeywordRegex(kw),
}));

/**
 * Vérifie si un texte quelconque contient des termes adultes ou inappropriés
 */
export function checkAdultContent(text: string): { hasAdult: boolean; keywords: string[] } {
  const matched: string[] = [];
  for (const item of COMPILED_KEYWORD_REGEXES) {
    if (item.regex.test(text)) {
      matched.push(item.keyword);
    }
  }
  return {
    hasAdult: matched.length > 0,
    keywords: matched,
  };
}

/**
 * Validation unifiée et stricte d'un jeu individuel selon les règles canoniques de Hoot Indie Games
 */
export function validateSingleGame(
  game: Game,
  existingNormalizedGenres?: Map<string, string>
): AuditResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Vérification AppID banni
  if (game.steamUrl) {
    const match = game.steamUrl.match(/\/app\/(\d+)/);
    if (match) {
      const appId = parseInt(match[1], 10);
      if (BANNED_APP_IDS.has(appId)) {
        errors.push(`AppID interdit: ${appId} ("${game.title}")`);
      }
    }
  }

  // 2. Vérification ID et Titre
  if (!game.id || typeof game.id !== 'string' || game.id.trim() === '') {
    errors.push(`[Erreur ID/Titre] ID manquant ou invalide pour: ${JSON.stringify(game)}`);
  }
  if (!game.title || typeof game.title !== 'string' || game.title.trim() === '') {
    errors.push(`[Erreur ID/Titre] Titre manquant`);
  } else if (!/[a-zA-Z]/.test(game.title)) {
    errors.push(`[Erreur Titre Non-Latin] ${game.title} : ne comporte aucun caractère latin.`);
  }

  // 3. Vérification Année de sortie
  if (typeof game.releaseYear !== 'number' || game.releaseYear < 2000 || game.releaseYear > 2026) {
    errors.push(`[Erreur Année] ${game.title} : année ${game.releaseYear} anormale.`);
  }

  // 4. Vérification Développeur & Compositeur
  if (!game.developer || game.developer.trim() === '') {
    errors.push(`[Erreur Développeur] ${game.title} : développeur manquant.`);
  } else if (isNonIndieOrAAA(game.developer)) {
    errors.push(`[Erreur Non-Indé / AAA] ${game.title} : studio/éditeur AAA détecté ("${game.developer}").`);
  }
  if (!game.hints?.composer || game.hints.composer.trim() === '') {
    warnings.push(`⚠️ [Avertissement Compositeur] ${game.title} : compositeur non spécifié.`);
  }

  // 5. Vérification ArtStyle & Caméra
  if (!VALID_ART_STYLES.includes(game.artStyle?.en)) {
    errors.push(`[Erreur ArtStyle] ${game.title} : artStyle inconnu "${game.artStyle?.en}".`);
  }
  if (!VALID_CAMERAS.includes(game.camera?.en)) {
    errors.push(`[Erreur Caméra] ${game.title} : camera inconnue "${game.camera?.en}".`);
  }

  // 6. Vérification Taglines bilingues
  if (!game.hints?.tagline?.fr || !game.hints?.tagline?.en) {
    errors.push(`[Erreur Tagline] ${game.title} : tagline FR ou EN vide.`);
  } else if (game.hints.tagline.fr === game.hints.tagline.en) {
    warnings.push(`⚠️ [Avertissement Traduction] ${game.title} : tagline FR et EN identiques.`);
  }

  // 7. Vérification Screenshots
  if (!Array.isArray(game.screenshots) || game.screenshots.length < 5) {
    warnings.push(`⚠️ [Avertissement Visuels] ${game.title} : moins de 5 screenshots.`);
  }
  for (const sUrl of game.screenshots || []) {
    if (typeof sUrl !== 'string' || !sUrl.startsWith('https://')) {
      errors.push(`[Erreur Screenshot] ${game.title} : URL screenshot invalide "${sUrl}".`);
    }
  }

  // 8. Vérification URLs officielles (Steam et/ou Itch.io)
  if (game.steamUrl && !game.steamUrl.startsWith('https://store.steampowered.com/app/')) {
    errors.push(`[Erreur SteamURL] ${game.title} : format URL Steam invalide "${game.steamUrl}".`);
  }
  if (game.itchUrl && (!game.itchUrl.startsWith('https://') || !game.itchUrl.includes('.itch.io/'))) {
    errors.push(`[Erreur ItchURL] ${game.title} : format URL Itch.io invalide "${game.itchUrl}".`);
  }
  if (!game.steamUrl && !game.itchUrl && !game.playInBrowserUrl) {
    errors.push(`[Erreur Source] ${game.title} : doit comporter au moins une URL officielle (Steam ou Itch.io).`);
  }

  // 9. Filtrage strict anti-contenu adulte / hentai / NSFW
  const contentToCheck = [
    game.title || '',
    ...(game.genre || []),
    game.hints?.tagline?.fr || '',
    game.hints?.tagline?.en || '',
  ].join(' ');

  const adultCheck = checkAdultContent(contentToCheck);
  for (const kw of adultCheck.keywords) {
    errors.push(`[Erreur Contenu Adulte] ${game.title} contient le mot-clé interdit "${kw}".`);
  }

  // 10. Vérification cohérence des genres
  if (existingNormalizedGenres && game.genre) {
    for (const g of game.genre) {
      const norm = g.toLowerCase().replace(/[-_ \/]/g, '').trim();
      if (existingNormalizedGenres.has(norm) && existingNormalizedGenres.get(norm) !== g) {
        errors.push(
          `[Erreur Conflit Genre] Le genre "${g}" (${game.title}) est en conflit avec la variante existante "${existingNormalizedGenres.get(norm)}".`
        );
      } else if (!existingNormalizedGenres.has(norm)) {
        existingNormalizedGenres.set(norm, g);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
