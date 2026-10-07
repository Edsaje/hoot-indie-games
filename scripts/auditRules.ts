import type { Game } from '../src/types/game';

/**
 * AppIDs explicitement bannis du sanctuaire (contenu adulte, shovelware, troll, etc.)
 */
export const BANNED_APP_IDS = new Set<number>([
  4198330, // Femboy Ghost (contenu adulte explicite)
  4739660, // Drag'n Wash (contenu adulte déguisé)
  1888160, // ARMORED CORE VI (AAA FromSoftware / Bandai Namco)
  1325200, // Nioh 2 (AAA Team Ninja / Koei Tecmo)
  2072450, // Like a Dragon: Infinite Wealth (AAA SEGA)
]);

/**
 * Identifiants officiels Valve Steam pour les descripteurs de contenu adulte / sexuel explicite (NSFW / Porn)
 * ID 3: Adult Only Sexual Content (Gratuitous or explicit sexual content)
 * ID 4: Frequent Sexual Content or Frequent Nudity
 * Note : ID 1 = Some Nudity / Mild sexual references (Rust, Sunless Sea)
 *        ID 2 = Frequent Violence or Gore
 *        ID 5 = General Mature Content (TowerFall Ascension, Bodycam, The Ascent)
 * Seuls les descripteurs 3 et 4 qualifient un jeu d'inapproprié / NSFW au sens Valve.
 */
export const ADULT_CONTENT_DESCRIPTOR_IDS = new Set<number>([3, 4]);

/**
 * AppIDs de pépites et jeux indépendants certifiés (protection absolue contre les faux positifs)
 */
export const KNOWN_INDIE_APP_IDS = new Set<number>([
  214560,  // Mark of the Ninja (Klei Entertainment / édité initialement via XBLA Microsoft Studios)
  236090,  // Dust: An Elysian Tail (Humble Hearts LLC / Xbox Game Studios)
  248820,  // Risk of Rain (2013) (Hopoo Games / Gearbox - 2K)
  251470,  // TowerFall Ascension (Maddy Makes Games / Extremely OK Games)
  252490,  // Rust (Facepunch Studios)
  304650,  // SUNLESS SEA (Failbetter Games)
  979690,  // The Ascent (Neon Giant)
  2406770, // Bodycam (Reissad Studio)
  4762810, // SpyCat: Codename Wu
]);

/**
 * Studios indépendants certifiés (ne doivent jamais être flaggués AAA, même en cas de partenariat d'édition)
 */
export const KNOWN_INDIE_STUDIOS = new Set<string>([
  'klei entertainment',
  'hopoo games',
  'humble hearts',
  'humble hearts llc',
  'maddy makes games',
  'maddy makes games inc.',
  'extremely ok games',
  'extremely ok games, ltd.',
  'failbetter games',
  'facepunch studios',
  'neon giant',
  'supergiant games',
  'team cherry',
  'motion twin',
  'evil empire',
  're-logic',
  'poncle',
  'mega crit',
  'subset games',
  'yacht club games',
  'toby fox',
  'heart machine',
  'studio mdhr',
  'moon studios',
  'hazelight',
  'hazelight studios',
  'unknown worlds entertainment',
  'ghost ship games',
  'iron gate studio',
  'landfall',
  'tarsier studios',
  'nomada studio',
  'red hook studios',
  'reissad studio',
  'acid nerve',
  'playdead',
  'the game bakers',
  'coldwood interactive',
  'concernedape',
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

export function isNonIndieOrAAA(developerOrText: string, publisher?: string, appId?: number): boolean {
  if (appId && KNOWN_INDIE_APP_IDS.has(appId)) return false;

  const devClean = (developerOrText || '').toLowerCase().trim();
  if (devClean) {
    for (const indieStudio of KNOWN_INDIE_STUDIOS) {
      if (devClean.includes(indieStudio)) return false;
    }
    if (COMPILED_AAA_REGEXES.some((rx) => rx.test(devClean))) {
      return true;
    }
  }

  if (publisher) {
    const pubClean = publisher.toLowerCase().trim();
    if (COMPILED_AAA_REGEXES.some((rx) => rx.test(pubClean))) {
      // Si le studio développeur est absent ou identique à l'éditeur AAA
      if (!devClean || devClean === pubClean) {
        return true;
      }
      // Éditeurs AAA stricts dont les jeux ne sont pas des indés tiers
      const STRICT_AAA_PUBS = [
        'electronic arts', 'ubisoft', 'activision', 'blizzard',
        'square enix', 'capcom', 'fromsoftware', 'tencent', 'riot games'
      ];
      if (STRICT_AAA_PUBS.some((p) => pubClean.includes(p))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Mots-clés interdits pour le filtrage strict anti-contenu adulte / hentai / NSFW
 */
export const ADULT_BANNED_KEYWORDS = [
  'femboy',
  'twink',
  'hentai',
  'nsfw',
  'erotic',
  'érotique',
  'erotica',
  'dating sim',
  'waifu',
  'compagne de bureau',
  'porn',
  'porno',
  'pornography',
  'pornographique',
  'touch them',
  'wash them',
  'male dragon',
  'adult content',
  'adult only',
  'adult game',
  'adult games',
  'jeu adulte',
  'jeux adultes',
  'contenu adulte',
  'adult visual novel',
  '18+ adult',
  'adult 18+',
  'ecchi',
  'sensual',
  'sensuelle',
  'furry',
  'harem',
  'lust',
  'ntr',
  'unrated',
  'co-eds',
  'satisfy the lonely hearts',
  'eroge',
  'yuri',
  'yaoi',
  'bdsm',
  'fetish',
  'masturbation',
  'masturbate',
  'intercourse',
  'orgasm',
  'non-consensual',
  'weed',
  'cannabis',
  'marijuana',
  'sexual content',
  'sexual act',
  'sexual acts',
  'sexual violence',
  'sexual simulation',
  'sexual intercourse',
  'sexual scene',
  'sexual scenes',
  'explicit sexual',
  'mature sexual',
  'acte sexuel',
  'actes sexuels',
  'contenu sexuel',
  'scène sexuelle',
  'scènes sexuelles',
  'simulation sexuelle',
  'sexualized',
  'explicit sex',
  'sex acts',
  'explicit nudity',
  'nudité explicite',
  'sexual nudity',
  'full frontal nudity',
  'lewd',
  'stripper',
  'seduce',
  'seduction',
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
