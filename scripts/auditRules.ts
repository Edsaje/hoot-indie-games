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

  // Contenu adulte, porno, hentai, sexuel, érotique proscrit
  4225940, // Au secours ! Le maître a été enlevé par une fée démoniaque !
  383080,  // Sakura Clicker
  420110,  // NEKOPARA Vol. 2
  1406990, // NEKOPARA Vol. 4
  459820,  // Crush Crush
  777130,  // Blush Blush
  844930,  // Fox Hime Zero
  1441840, // FALL IN LABYRINTH
  1660290, // Monmusu Gladiator
  2986260, // Dreamlike Love with Seira
  1986230, // What if your girl was a frog?
  1996210, // Sakura Hime 3
  1964310, // MORODASHI SUMO
  1127470, // Skater Frog
  402330,  // Press X to Not Die
  296470,  // Mount Your Friends
  546390,  // Brief Karate Foolish
  617660,  // Dong-Jin Rice-hime（東津萌米）
  858940,  // Flowers -Le volume sur ete-
  944220,  // Gachi Heroes
  1000830, // Gachi Finder 3000
  1068070, // Lords Of The Lockerroom
  1098370, // Akash: Path of the Five
  1161870, // Epiphyllum in Love
  1202070, // Gachi Revenge
  1291370, // Lotion samurai
  1828630, // 幻想枝魂 Soul Fantasy
  3220830, // Dusk Pub
  4258390, // 厦日恋旅 Enjoy Amoy&Sisters
  5101080, // BOYKISSER IS COMING

  // Jeux factices, 0 avis Steam, playtests, shovelware
  4831090, // Battle Simulator: Counter Zombie REBORN
  5228570, // StickWord
  5275800, // Apocalypse Intern
  3627560, // Bounty Hunter Horrors
  5306000, // BABEL: Invent a Way
  5138180, // Don't Give Up
  1911950, // Every Day We Fight Playtest
  5343270, // ROCK CORE (0% positif)
  3778610, // Colorbound (< 10 avis)
  3301010, // Den-Den: Tokyo Horror (< 10 avis)
]);

/**
 * Identifiants officiels Valve Steam pour les descripteurs de contenu adulte / sexuel explicite (NSFW / Porn)
 * ID 3: Adult Only Sexual Content (Gratuitous or explicit sexual content)
 * ID 4: Frequent Sexual Content or Frequent Nudity
 * Note : ID 1 = Some Nudity / Mild sexual references
 *        ID 2 = Frequent Violence or Gore (Visage, Prodeus, Doom)
 *        ID 5 = General Mature Content (TowerFall Ascension, Bodycam, Bad North, Darkest Dungeon)
 * Seuls les descripteurs 3 et 4 qualifient un jeu d'inapproprié / NSFW au sens Valve.
 */
export const ADULT_CONTENT_DESCRIPTOR_IDS = new Set<number>([3, 4]);

/**
 * AppIDs de pépites et jeux indépendants certifiés (protection absolue contre les faux positifs)
 */
export const KNOWN_INDIE_APP_IDS = new Set<number>([
  214560,  // Mark of the Ninja (Klei Entertainment / édité initialement via XBLA Microsoft Studios)
  860950,  // Mark of the Ninja: Remastered (Klei Entertainment)
  236090,  // Dust: An Elysian Tail (Humble Hearts LLC / Xbox Game Studios)
  248820,  // Risk of Rain (2013) (Hopoo Games / Gearbox - 2K)
  251470,  // TowerFall Ascension (Maddy Makes Games / Extremely OK Games)
  335670,  // LISA: The Painful (Dingaling Productions)
  252490,  // Rust (Facepunch Studios)
  304650,  // SUNLESS SEA (Failbetter Games)
  979690,  // The Ascent (Neon Giant)
  2406770, // Bodycam (Reissad Studio)
  4762810, // SpyCat: Codename Wu
  240720,  // Getting Over It with Bennett Foddy (Bennett Foddy)
  322190,  // SteamWorld Heist (Image & Form Games / Thunderful)
  2396240, // SteamWorld Heist II (Image & Form Games / Thunderful)
  252410,  // SteamWorld Dig (Image & Form Games)
  571310,  // SteamWorld Dig 2 (Image & Form Games)
  593280,  // Cat Quest (The Gentlebros / Kepler Interactive)
  914710,  // Cat Quest II (The Gentlebros)
  594330,  // Visage (SadSquare Studio)
  481510,  // Night in the Woods (Infinite Fall / Finji)
  365360,  // Battle Brothers (Overhype Studios)
  589780,  // The Red Strings Club (Deconstructeam / Devolver Digital)
  596970,  // Sunless Skies: Sovereign Edition (Failbetter Games)
  597760,  // Yuppie Psycho: Executive Edition (Baroque Decay)
  601840,  // Griftlands (Klei Entertainment)
  673130,  // AMID EVIL (Indefatigable / New Blood Interactive)
  688420,  // Bad North: Jotunn Edition (Plausible Concept / Raw Fury)
  784150,  // Workers & Resources: Soviet Republic (3Division)
  815370,  // Green Hell (Creepy Jar)
  824600,  // HROT (Spytihněv)
  844590,  // Hypnospace Outlaw (Tendershoot / No More Robots)
  857980,  // Void Bastards (Blue Manchu)
  867210,  // Songs of Conquest (Lavapotion / Coffee Stain Publishing)
  913740,  // WORLD OF HORROR (panstasz / Ysbryd Games)
  963710,  // Lost in Vivo (KIRA)
  964800,  // Prodeus (Bounding Box Software / Humble Games)
  1061910, // Metal: Hellsinger (The Outsiders / Funcom)
  1102190, // Monster Train (Shiny Shoe)
  1122720, // Sayonara Wild Hearts (Simogo / Annapurna Interactive)
  1127400, // Mindustry (AnukenDev)
  1136370, // Bear and Breakfast (Gummy Cat / Armor Games)
  1161580, // Hardspace: Shipbreaker (Blackbird Interactive)
  1164940, // Trepang2 (Trepang Studios)
  1179080, // FAITH: The Unholy Trinity (Airdorf Games / New Blood Interactive)
  1188930, // Chrono Ark (Alblassoft)
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
  'the gentlebros',
  'sadsquare studio',
  'bennett foddy',
  'image & form',
  'image & form games',
  'finji',
  'infinite fall',
  'deconstructeam',
  'baroque decay',
  'overhype studios',
  'plausible concept',
  'bounding box software',
  'creepy jar',
  '3division',
  'panstasz',
  'new blood interactive',
  'shiny shoe',
  'simogo',
  'anukendev',
  'gummy cat',
  'blackbird interactive',
  'tendershoot',
  'blue manchu',
  'lavapotion',
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
  'furry hentai',
  'furry nsfw',
  'furry porn',
  'furry 18+',
  'harem',
  'carnal lust',
  'lustful',
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

  // 11. Vérification Intégrité des avis Steam (Zéro Hallucination)
  if (game.steamStoreData) {
    if (game.steamStoreData.totalReviews === 0) {
      errors.push(`[Erreur Avis Steam] ${game.title} : 0 avis Steam enregistré.`);
    } else if (game.steamStoreData.positivePercent < 45) {
      errors.push(`[Erreur Seuil Qualité] ${game.title} : score Steam (${game.steamStoreData.positivePercent}%) sous le seuil minimal de 45%.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
