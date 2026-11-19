import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INDIE_GAMES, getDailyGame } from '../src/data/games';
import type { Game } from '../src/types/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.resolve(__dirname, '../index.html');

const CANONICAL_DOMAIN = 'https://hootindiegames.com';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Categorize games into thematic groups for semantic SEO structure
function categorizeGames(games: Game[]) {
  const categories: Record<string, Game[]> = {
    'Metroidvania & Action-Aventure': [],
    'Roguelike, Roguelite & Deckbuilders': [],
    'Aventure, Narration & Mystère': [],
    'Puzzle, Réflexion & Énigmes': [],
    'Gestion, Simulation & Cozy': [],
    'Plateforme, Précision & Rétro': [],
    'Pépites Récentes (2024-2026)': [],
  };

  for (const game of games) {
    const genres = game.genre.map((g) => g.toLowerCase());
    if (game.releaseYear >= 2024) {
      categories['Pépites Récentes (2024-2026)'].push(game);
    } else if (genres.some((g) => g.includes('metroidvania') || g.includes('souls-like') || g.includes('soulslike'))) {
      categories['Metroidvania & Action-Aventure'].push(game);
    } else if (genres.some((g) => g.includes('roguelike') || g.includes('roguelite') || g.includes('deckbuilder'))) {
      categories['Roguelike, Roguelite & Deckbuilders'].push(game);
    } else if (genres.some((g) => g.includes('puzzle') || g.includes('réflexion') || g.includes('mystère') || g.includes('enquête'))) {
      categories['Puzzle, Réflexion & Énigmes'].push(game);
    } else if (genres.some((g) => g.includes('narratif') || g.includes('aventure') || g.includes('atmosphérique') || g.includes('psychologique'))) {
      categories['Aventure, Narration & Mystère'].push(game);
    } else if (genres.some((g) => g.includes('simulation') || g.includes('gestion') || g.includes('farming') || g.includes('cozy') || g.includes('méditatif'))) {
      categories['Gestion, Simulation & Cozy'].push(game);
    } else {
      categories['Plateforme, Précision & Rétro'].push(game);
    }
  }

  return categories;
}

function loadAllCuratedGames(): Game[] {
  const gamesMap = new Map<string, Game>();
  INDIE_GAMES.forEach((g) => gamesMap.set(g.id, g));

  try {
    const overrideFile = path.resolve(__dirname, '../public/api/games_override.json');
    if (fs.existsSync(overrideFile)) {
      const overrides = JSON.parse(fs.readFileSync(overrideFile, 'utf8'));
      if (Array.isArray(overrides.hiddenGameIds)) {
        overrides.hiddenGameIds.forEach((id: string) => gamesMap.delete(id));
      }
      if (Array.isArray(overrides.excludedFromGems)) {
        overrides.excludedFromGems.forEach((id: string) => gamesMap.delete(id));
      }
      if (Array.isArray(overrides.customAdminGames)) {
        overrides.customAdminGames.forEach((cg: Game) => {
          // Si promotedToGems est défini, seuls les jeux promus sont comptés comme pépites
          if (!Array.isArray(overrides.promotedToGems) || overrides.promotedToGems.includes(cg.id)) {
            gamesMap.set(cg.id, cg);
          }
        });
      }

      // Charger les jeux promus issus du catalogue Steam (ex: V Rising, Phasmophobia)
      const steamCatFile = path.resolve(__dirname, '../public/data/steam_catalog.json');
      if (fs.existsSync(steamCatFile) && Array.isArray(overrides.promotedToGems)) {
        const steamGames: Game[] = JSON.parse(fs.readFileSync(steamCatFile, 'utf8'));
        const steamMap = new Map(steamGames.map((g) => [g.id, g]));
        overrides.promotedToGems.forEach((id: string) => {
          if (!gamesMap.has(id) && steamMap.has(id)) {
            gamesMap.set(id, steamMap.get(id)!);
          }
        });
      }
    }
  } catch (err) {
    // Repli silencieux
  }

  return Array.from(gamesMap.values());
}

function buildFaqSchema(totalCount: number) {
  return [
    {
      q: "Qu'est-ce qu'un jeu vidéo indépendant (jeu indé) ?",
      a: "Un jeu vidéo indépendant, communément appelé jeu indé (ou indie game), est une œuvre vidéoludique conçue par un créateur solitaire ou un studio à taille humaine, libre de toute tutelle d'un grand éditeur (AAA). Cette indépendance financière et créative offre une liberté d'expérimentation totale, donnant naissance aux gameplays les plus innovants, à des directions artistiques singulières (pixel art, dessin à la main, low-poly 3D) et à des récits profondément humains."
    },
    {
      q: "Quels sont les meilleurs jeux vidéo indépendants à faire absolument ?",
      a: "Parmi les plus grands chefs-d'œuvre du jeu vidéo indépendant certifiés sur Hoot Indie Games figurent Hollow Knight (Team Cherry), Outer Wilds (Mobius Digital), Celeste (Maddy Makes Games), Hades (Supergiant Games), Balatro (LocalThunk), Disco Elysium (ZA/UM), Undertale (Toby Fox), Slay the Spire (MegaCrit), Dead Cells (Motion Twin), Tunic (Andrew Shouldice), Sea of Stars (Sabotage Studio), et Chants of Sennaar (Rundisc)."
    },
    {
      q: "Comment découvrir de nouvelles pépites indépendantes méconnues ?",
      a: `Hoot Indie Games propose un Explorateur de Pépites certifiées regroupant ${totalCount} pépites rigoureusement auditées selon notre charte officielle de vérification (100% de données Steam réelles, avis extrêmement positifs et captures officielles). Vous pouvez également consulter notre Radar des sorties indépendantes 2025-2026 et synchroniser votre bibliothèque Steam pour identifier en un clic les perles que vous possédez déjà ou qu'il vous reste à explorer.`
    },
    {
      q: "Combien de mini-jeux et défis interactifs propose Hoot Indie Games ?",
      a: "Hoot Indie Games propose plus de 17 mini-jeux et modes interactifs gratuits : 8 défis quotidiens de déduction renouvelés chaque nuit (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Critique Steam, Blind Test OST), 8 bornes d'arcade rétro cultes (Snake, Pong, Casse-Briques, Flappy Hibou, Moon Runner, Space Invaders, Tetris, Mine Storm Vectrex 1982), le Grand Quiz Trivia (180 questions), les sprints Time Attack chronométrés à la milliseconde et l'Arène de Duels Versus 1v1 multijoueur en temps réel."
    },
    {
      q: "Comment fonctionne la collection de cartes et l'ouverture de boosters sur Hoot Indie Games ?",
      a: `Hoot Indie Games propose une collection sylvestre de ${totalCount} cartes à collectionner correspondant à chaque pépite certifiée du sanctuaire. Chaque carte se décline en 4 raretés (Commune ~65%, Rare ~24%, Épique ~9%, Légendaire ~2%) et bénéficie de finitions holographiques 3D avec reflets gyroscopiques interactifs. Chaque joueur peut ouvrir un booster quotidien de 5 cartes ou utiliser ses Plumes Sylvestres pour compléter son classeur virtuel.`
    },
    {
      q: "Comment remporter des Plumes Sylvestres pour débloquer des boosters et des cartes ?",
      a: "Les Plumes Sylvestres sont la monnaie gratifiante du sanctuaire, 100% gratuite et sans microtransaction. Vous en gagnez en réussissant vos défis quotidiens, en maintenant des séries de victoires consécutives (streaks), en réalisant des scores élevés sur les bornes d'arcade rétro, en complétant le Grand Quiz Trivia et lors de votre connexion quotidienne."
    },
    {
      q: "Qu'est-ce que le Grand Quiz Trivia du jeu vidéo indépendant ?",
      a: "Le Grand Quiz Trivia réunit 180 questions thématiques couvrant le lore, les bandes originales (OST), le gameplay, l'histoire des studios créateurs et les dates de sortie des œuvres indépendantes cultes. Chaque question propose des explications historiques et des anecdotes vérifiées pour enrichir votre culture indie."
    },
    {
      q: "Qu'est-ce que l'espace Micro-Pépites et la scène indé alternative (Itch.io) ?",
      a: "L'espace Micro-Pépites met à l'honneur les trésors cachés de la scène indépendante émergente, les créations de Game Jams et les prototypes expérimentaux issus de plateformes comme Itch.io. C'est l'endroit idéal pour découvrir des pépites courtes, audacieuses et poétiques conçues hors des circuits commerciaux traditionnels."
    },
    {
      q: "Comment fonctionne le Blind Test de musiques de jeux vidéo indépendants (OST) ?",
      a: "Le Blind Test OST génère des extraits musicaux au synthétiseur Web Audio en temps réel sans chargement externe. L'écoute se fait par paliers progressifs (1s, 2s, 4s, 7s, 11s, 16s, 22s, 30s) pour identifier les thèmes musicaux légendaires de Hollow Knight, Celeste, Undertale, Hades, Outer Wilds et bien d'autres pépites avec autocomplétion intelligente."
    },
    {
      q: "Comment fonctionnent les modes Time Attack et les sprints chronométrés ?",
      a: "Le Time Attack propose 8 sprints solo contre-la-montre chronométrés à la milliseconde correspondant aux 8 disciplines de déduction. Les joueurs doivent enchaîner 5 à 10 énigmes consécutives le plus rapidement possible sans commettre d'erreur pour alimenter un multiplicateur de combo et établir des records locaux."
    },
    {
      q: "Comment défier des amis en duel en temps réel dans l'Arène Versus 1v1 ?",
      a: "L'Arène Versus 1v1 utilise la technologie WebRTC Peer-to-Peer (P2P) pour connecter directement deux joueurs sans latence de serveur intermédiaire. Vous pouvez choisir une discipline spécifique (Screenle, Classic, Blind Test, etc.) ou lancer le Tournoi Décathlon Mixte (8 épreuves consécutives) avec validation instantanée par raccourcis clavier [1-4]."
    },
    {
      q: "Comment connecter son compte Steam et synchroniser sa bibliothèque de jeux ?",
      a: "Sur Hoot Indie Games, vous pouvez vous connecter en un clic via l'authentification officielle Valve Steam OpenID 2.0 ou saisir directement votre identifiant SteamID64. Le site synchronise alors instantanément votre ludothèque Steam afin d'afficher les badges 'Dans votre bibliothèque' sur chaque jeu du catalogue et filtrer les pépites selon vos possessions."
    },
    {
      q: "Qu'est-ce que la salle d'arcade rétro Hoot Indie Games ?",
      a: "La salle d'arcade rétro propose 8 mini-jeux classiques jouables gratuitement directement dans votre navigateur sur mobile et ordinateur : Snake Sylvestre, Pong Nocturne, Casse-Briques, Flappy Hibou, Moon Runner, Space Invaders, Tetris des Pépites, ainsi qu'une reproduction fidèle du légendaire Mine Storm de la console vectorielle Vectrex (1982)."
    },
    {
      q: "Où trouver le radar des prochaines sorties de jeux vidéo indépendants 2025-2026 ?",
      a: "La section Boîte à Outils intègre un Radar des Sorties 2025-2026 recensant les productions indépendantes les plus prometteuses et attendues (comme Hollow Knight Silksong, Mina the Hollower, Judas), avec fiches descriptives, liens Steam officiels et calendrier de lancement prévisionnel."
    }
  ];
}

interface HeroImagePaths {
  desktop: string;
  mobile: string;
}

async function prepareDailyHeroImage(screenshotUrl: string, todayStr: string): Promise<HeroImagePaths> {
  if (!screenshotUrl) return { desktop: '', mobile: '' };
  const publicDesktopWebp = path.resolve(__dirname, '../public/daily-hero.webp');
  const publicMobileWebp = path.resolve(__dirname, '../public/daily-hero-mobile.webp');

  try {
    const res = await fetch(screenshotUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const sharp = (await import('sharp')).default;

      // 1. Desktop version: 520x292, quality 70 (~10 kB)
      const webpDesktop = await sharp(buf)
        .resize({ width: 520, height: 292, fit: 'cover' })
        .webp({ quality: 70, effort: 6 })
        .toBuffer();
      fs.writeFileSync(publicDesktopWebp, webpDesktop);

      // 2. Mobile version: 380x214, quality 64 (~4.5 kB, ultra-fast 4G single RTT)
      const webpMobile = await sharp(buf)
        .resize({ width: 380, height: 214, fit: 'cover' })
        .webp({ quality: 64, effort: 6 })
        .toBuffer();
      fs.writeFileSync(publicMobileWebp, webpMobile);

      console.log(`⚡ Images WebP créées avec succès: desktop (${(webpDesktop.length / 1024).toFixed(1)} kB) & mobile (${(webpMobile.length / 1024).toFixed(1)} kB)`);
      return { desktop: `/daily-hero.webp?v=${todayStr}`, mobile: `/daily-hero-mobile.webp?v=${todayStr}` };
    }
  } catch (err) {
    console.warn('⚠️ Erreur téléchargement/compression hero WebP:', err);
  }
  if (fs.existsSync(publicDesktopWebp) && fs.existsSync(publicMobileWebp)) {
    return { desktop: `/daily-hero.webp?v=${todayStr}`, mobile: `/daily-hero-mobile.webp?v=${todayStr}` };
  }
  return { desktop: screenshotUrl, mobile: screenshotUrl };
}

async function prepareLogoWebp(): Promise<void> {
  const publicLogoWebp = path.resolve(__dirname, '../public/logo-36.webp');
  const sourceFavicon = path.resolve(__dirname, '../public/favicon-96x96.png');
  if (fs.existsSync(publicLogoWebp)) return;
  if (fs.existsSync(sourceFavicon)) {
    try {
      const sharp = (await import('sharp')).default;
      await sharp(sourceFavicon)
        .resize(72, 72)
        .webp({ quality: 75, effort: 6 })
        .toFile(publicLogoWebp);
    } catch {
      // fallback
    }
  }
}

export function generateSitemapXml(todayStr: string): string {
  const routes = [
    { path: '', changefreq: 'daily', priority: '1.0', xhtml: true },
    { path: 'gems', changefreq: 'daily', priority: '0.9' },
    { path: 'catalog', changefreq: 'daily', priority: '0.9' },
    { path: 'cards', changefreq: 'daily', priority: '0.9' },
    { path: 'minigames', changefreq: 'daily', priority: '0.9' },
    { path: 'screenle', changefreq: 'daily', priority: '0.9' },
    { path: 'indledle', changefreq: 'daily', priority: '0.9' },
    { path: 'linkle', changefreq: 'daily', priority: '0.8' },
    { path: 'profille', changefreq: 'daily', priority: '0.8' },
    { path: 'chrono', changefreq: 'daily', priority: '0.8' },
    { path: 'pixel', changefreq: 'daily', priority: '0.8' },
    { path: 'review', changefreq: 'daily', priority: '0.8' },
    { path: 'blindtest', changefreq: 'daily', priority: '0.8' },
    { path: 'quiz', changefreq: 'daily', priority: '0.8' },
    { path: 'timeattack', changefreq: 'daily', priority: '0.8' },
    { path: 'versus', changefreq: 'weekly', priority: '0.8' },
    { path: 'arcade', changefreq: 'monthly', priority: '0.7' },
    { path: 'micro', changefreq: 'weekly', priority: '0.7' },
    { path: 'toolbox', changefreq: 'weekly', priority: '0.7' },
    { path: 'roost', changefreq: 'monthly', priority: '0.6' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
  for (const r of routes) {
    const loc = r.path ? `${CANONICAL_DOMAIN}/${r.path}` : `${CANONICAL_DOMAIN}/`;
    xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n`;
    if (r.xhtml) {
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${loc}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
    }
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;
  return xml;
}

export async function generateSeoIndexHtml(): Promise<string> {
  await prepareLogoWebp();
  const allCuratedGames = loadAllCuratedGames();
  const totalCount = allCuratedGames.length;
  let catalogCount = 1727;
  try {
    const steamCatFile = path.resolve(__dirname, '../public/data/steam_catalog.json');
    if (fs.existsSync(steamCatFile)) {
      const catData = JSON.parse(fs.readFileSync(steamCatFile, 'utf8'));
      if (Array.isArray(catData)) catalogCount = catData.length;
    }
  } catch {
    // fallback
  }
  const categorized = categorizeGames(allCuratedGames);
  const faqs = buildFaqSchema(totalCount);

  // Compute today's Daily Gem for LCP image preload (synchronized with Paris timezone and INDIE_GAMES pool)
  const PARIS_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayStr = PARIS_DATE_FORMATTER.format(new Date());
  const dailyGame = getDailyGame(todayStr, 17, INDIE_GAMES);
  const rawScreenshot = dailyGame?.screenshots?.[5] || dailyGame?.screenshots?.[0] || '';
  const rawDailyScreenshot = rawScreenshot.replace('1920x1080.jpg', '600x338.jpg');
  const dailyScreenshot = await prepareDailyHeroImage(rawDailyScreenshot, todayStr);

  // Persist daily gem for ultra-fast LCP rendering without bundling 274 games
  try {
    const dailyGemPath = path.resolve(__dirname, '../src/data/dailyGem.ts');
    fs.writeFileSync(
      dailyGemPath,
      `import type { Game } from '../types/game';\n\nexport const TODAY_DATE = ${JSON.stringify(todayStr)};\n\nexport const TODAY_DAILY_GEM: Game = ${JSON.stringify(dailyGame, null, 2)};\n`
    );
  } catch {
    // fallback
  }

  // 1. Build ItemList for VideoGame Schema.org (Limit to Top 10 to reduce HTML weight)
  const topGames = allCuratedGames.slice(0, 10);
  const videoGameItems = topGames.map((game, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'VideoGame',
      name: game.title,
      description: game.hints.tagline.fr,
      genre: game.genre,
      gamePlatform: ['PC', 'Steam'],
      datePublished: `${game.releaseYear}-01-01`,
      author: {
        '@type': 'Organization',
        name: game.developer,
      },
      image: game.screenshots[0] || `${CANONICAL_DOMAIN}/og-banner.png`,
      sameAs: game.steamUrl || undefined,
    },
  }));

  // 2. Build FAQPage Schema.org
  const faqSchemaItems = faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  }));

  // Complete JSON-LD Graph
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${CANONICAL_DOMAIN}/#website`,
        name: 'Hoot Indie Games',
        alternateName: [
          'Hoot Indie',
          'Sanctuaire des Jeux Indés',
          'Hoot Indie Games by Hibouxe',
        ],
        url: `${CANONICAL_DOMAIN}/`,
        description:
          `Le Sanctuaire des Jeux Vidéo Indépendants : catalogue certifié de ${totalCount} pépites Steam, classeur de cartes à collectionner & boosters sylvestres, 17+ mini-jeux (8 défis quotidiens de déduction, 8 bornes d'arcade rétro dont Mine Storm 1982), Grand Quiz Trivia, sprints Time Attack et duels 1v1 en direct.`,
        publisher: {
          '@type': 'Person',
          name: 'Quentin Beaud',
          alternateName: 'Hibouxe',
          url: 'https://quentinbeaud.com',
        },
        inLanguage: ['fr-FR', 'en-US'],
      },
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': `${CANONICAL_DOMAIN}/#webapp`,
        name: 'Hoot Indie Games',
        url: `${CANONICAL_DOMAIN}/`,
        description:
          'Plateforme gratuite dédiée à la découverte, à la collection de cartes, aux défis quotidiens et aux duels multijoueurs du jeu vidéo indépendant.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5 Canvas & Web Audio API.',
        inLanguage: ['fr', 'en'],
        image: `${CANONICAL_DOMAIN}/og-banner.png`,
        featureList: [
          `Catalogue Certifié de ${totalCount} Pépites du Jeu Vidéo Indépendant avec métadonnées Steam authentiques`,
          `Collection Sylvestre de ${totalCount} Cartes à Collectionner (Communes, Rares, Épiques, Légendaires et Holo 3D)`,
          'Ouverture quotidienne de Boosters de 5 cartes & Économie de Plumes Sylvestres sans microtransaction',
          '8 Défis Quotidiens de Déduction Indé (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Critique Steam, Blind Test OST)',
          'Grand Quiz Trivia du Jeu Vidéo Indépendant (180 questions et anecdotes de culture indé)',
          '8 Modes Sprints Time Attack chronométrés à la milliseconde avec multiplicateurs de combo',
          'Arène de Duels 1v1 en Temps Réel P2P WebRTC avec Tournoi Décathlon Mixte sans latence',
          'Véritable Salle d\'Arcade Rétro 8 Bornes incluant une reproduction fidèle de Mine Storm Vectrex 1982',
          'Espace Micro-Pépites dédié aux créations émergentes, game jams et scènes Itch.io',
          'Synchronisation Officielle de Bibliothèque Steam (OpenID / SteamID64)',
          'Radar des Prochaines Sorties de Jeux Vidéo Indépendants 2025-2026',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${CANONICAL_DOMAIN}/#organization`,
        name: 'Hoot Indie Games',
        url: `${CANONICAL_DOMAIN}/`,
        logo: `${CANONICAL_DOMAIN}/logo-512.png`,
        sameAs: [
          'https://github.com/Edsaje/hoot-indie-games',
          'https://youtube.com/@Hibouxe',
          'https://quentinbeaud.com',
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${CANONICAL_DOMAIN}/#navigation`,
        name: 'Navigation Principale Hoot Indie Games',
        itemListElement: [
          {
            '@type': 'SiteNavigationElement',
            position: 1,
            name: 'Pépites Certifiées',
            description: `Catalogue officiel des ${totalCount} meilleures pépites du jeu vidéo indépendant certifiées Steam.`,
            url: `${CANONICAL_DOMAIN}/gems`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 2,
            name: 'Classeur de Cartes & Boosters Sylvestres',
            description: `Collectionnez les ${totalCount} cartes de pépites indés, ouvrez des boosters quotidiens et admirez les reflets holographiques 3D.`,
            url: `${CANONICAL_DOMAIN}/cards`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 3,
            name: 'Hub des Mini-Jeux',
            description: 'Les 8 disciplines quotidiennes, 8 bornes d\'arcade, quiz trivia, Time Attack et duels multijoueurs.',
            url: `${CANONICAL_DOMAIN}/minigames`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 4,
            name: 'Screenle (Capture)',
            description: 'Devinette quotidienne du jeu indé par zoom progressif de capture d\'écran HD.',
            url: `${CANONICAL_DOMAIN}/screenle`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 5,
            name: 'Indledle (Classic)',
            description: 'Le Wordle du jeu vidéo indépendant par année, genres, studio et caméra.',
            url: `${CANONICAL_DOMAIN}/indledle`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 6,
            name: 'Linkle (Connexions)',
            description: 'Regroupez 16 jeux indés en 4 familles thématiques secrètes.',
            url: `${CANONICAL_DOMAIN}/linkle`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 7,
            name: 'Profille (Profil)',
            description: 'Indices textuels dévoilés progressivement pour deviner le jeu.',
            url: `${CANONICAL_DOMAIN}/profille`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 8,
            name: 'Chrono (Timeline)',
            description: 'Replacez les pépites indés sur la frise chronologique historique.',
            url: `${CANONICAL_DOMAIN}/chrono`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 9,
            name: 'Pixel & Silhouette',
            description: 'Déduction par résolution de mosaïque de pixels et ombre chinoise.',
            url: `${CANONICAL_DOMAIN}/pixel`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 10,
            name: 'Critique Steam (Review)',
            description: 'Déchiffrez les mots-clés biffés d\'une évaluation Steam authentique.',
            url: `${CANONICAL_DOMAIN}/review`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 11,
            name: 'Blind Test OST',
            description: 'Quiz musical au synthétiseur Web Audio en paliers d\'écoute de 1 à 30 secondes.',
            url: `${CANONICAL_DOMAIN}/blindtest`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 12,
            name: 'Grand Quiz Trivia Indé',
            description: 'Testez votre érudition vidéoludique sur 180 questions et anecdotes de développement indé.',
            url: `${CANONICAL_DOMAIN}/quiz`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 13,
            name: 'Time Attack',
            description: 'Sprints contre-la-montre sur les 8 disciplines avec chrono milliseconde.',
            url: `${CANONICAL_DOMAIN}/timeattack`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 14,
            name: 'Arène Versus 1v1',
            description: 'Duels multijoueurs en temps réel P2P WebRTC et Tournoi Décathlon Mixte.',
            url: `${CANONICAL_DOMAIN}/versus`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 15,
            name: 'Salle d\'Arcade Rétro',
            description: '8 jeux d\'arcade cultes dont une réplique fidèle du Mine Storm Vectrex 1982.',
            url: `${CANONICAL_DOMAIN}/arcade`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 16,
            name: 'Micro-Pépites & Scène Itch.io',
            description: 'Explorez les créations émergentes, jeux de Game Jams et pépites indés expérimentales.',
            url: `${CANONICAL_DOMAIN}/micro`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 17,
            name: 'Boîte à Outils & Radar 2025-2026',
            description: 'Radar des sorties de jeux indépendants et boîte à outils pour joueurs.',
            url: `${CANONICAL_DOMAIN}/toolbox`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 18,
            name: 'Le Perchoir Sylvestre',
            description: 'Portfolio créatif, essais narratifs et projets de Quentin Beaud (Hibouxe).',
            url: `${CANONICAL_DOMAIN}/roost`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${CANONICAL_DOMAIN}/#catalog`,
        name: `Catalogue Officiel des ${totalCount} Pépites du Jeu Vidéo Indépendant`,
        description: 'Sélection certifiée des plus grands chefs-d\'œuvre et découvertes de la scène indépendante PC & Steam.',
        numberOfItems: totalCount,
        itemListElement: videoGameItems,
      },
      {
        '@type': 'FAQPage',
        '@id': `${CANONICAL_DOMAIN}/#faq`,
        mainEntity: faqSchemaItems,
      },
    ],
  };

  // 3. Build Semantic Pre-rendered HTML inside #root
  let catalogHtml = '';
  for (const [categoryName, games] of Object.entries(categorized)) {
    if (games.length === 0) continue;
    const topGame = games[0];
    const otherGames = games.slice(1, 6);

    catalogHtml += `
      <section class="seo-category" style="margin-bottom: 2rem;">
        <h3 style="color: #f59e0b; font-size: 1.3rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; margin-top: 1.5rem;">
          ${escapeHtml(categoryName)} (${games.length} jeux)
        </h3>
        <p style="margin: 0.5rem 0 0.75rem 0; font-size: 0.95rem; color: #cbd5e1; line-height: 1.5;">
          En vedette : <strong>${escapeHtml(topGame.title)}</strong> (${topGame.releaseYear}) par ${escapeHtml(topGame.developer)} — <em>« ${escapeHtml(topGame.hints.tagline.fr)} »</em>.
          ${topGame.steamUrl ? ` <a href="${escapeHtml(topGame.steamUrl)}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline;">Fiche Steam</a>` : ''}
        </p>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; font-size: 0.85rem;">
    `;

    for (const game of otherGames) {
      catalogHtml += `
          <li>
            ${game.steamUrl ? `<a href="${escapeHtml(game.steamUrl)}" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">` : ''}
            <strong>${escapeHtml(game.title)}</strong> (${game.releaseYear}) - ${escapeHtml(game.developer)}
            ${game.steamUrl ? `</a>` : ''}
          </li>
      `;
    }

    catalogHtml += `
        </ul>
      </section>
    `;
  }

  let faqHtml = '';
  for (const f of faqs.slice(0, 3)) {
    faqHtml += `
      <article style="margin-bottom: 1.25rem;">
        <h3 style="color: #f8fafc; margin: 0 0 0.3rem 0; font-size: 1.05rem;">${escapeHtml(f.q)}</h3>
        <p style="color: #cbd5e1; margin: 0; line-height: 1.5; font-size: 0.95rem;">${escapeHtml(f.a)}</p>
      </article>
    `;
  }

  const rootPrerenderContent = `
    <!-- Pre-rendered Semantic SEO Content for Search Engine Crawlers (Googlebot, Bingbot) -->
    <!-- When React mounts, this content is dynamically replaced by the interactive SPA -->
    <div id="seo-crawler-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
      <header style="text-align: center; margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
        <h1 style="color: #f59e0b; font-size: 2rem; margin-bottom: 0.5rem; letter-spacing: 1px;">
          🦉 Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants
        </h1>
        <p style="font-size: 1.1rem; color: #94a3b8; max-width: 860px; margin: 0 auto 1.25rem auto; line-height: 1.5;">
          Le sanctuaire du <strong>jeu vidéo indépendant</strong> : catalogue certifié de ${totalCount} pépites Steam, 
          <strong>classeur de cartes à collectionner &amp; boosters sylvestres</strong>, 
          <strong>17+ mini-jeux &amp; défis</strong> (8 défis quotidiens de déduction, 8 bornes d'arcade rétro 1982, grand quiz trivia), 
          sprints <strong>Time Attack</strong> et arène de <strong>duels 1v1</strong> en direct.
        </p>
        <nav aria-label="Navigation Principale" style="display: flex; justify-content: center; gap: 0.75rem 1.25rem; flex-wrap: wrap; font-weight: 600; font-size: 0.9rem;">
          <a href="/gems" style="color: #fbbf24; text-decoration: none;">💎 Pépites Certifiées</a>
          <a href="/cards" style="color: #fbbf24; text-decoration: none;">🃏 Cartes &amp; Boosters</a>
          <a href="/minigames" style="color: #fbbf24; text-decoration: none;">🎮 Hub des Mini-Jeux</a>
          <a href="/screenle" style="color: #fbbf24; text-decoration: none;">📸 Screenle</a>
          <a href="/indledle" style="color: #fbbf24; text-decoration: none;">🔍 Indledle</a>
          <a href="/linkle" style="color: #fbbf24; text-decoration: none;">🧩 Linkle</a>
          <a href="/profille" style="color: #fbbf24; text-decoration: none;">📋 Profille</a>
          <a href="/chrono" style="color: #fbbf24; text-decoration: none;">⏳ Chrono</a>
          <a href="/pixel" style="color: #fbbf24; text-decoration: none;">🎨 Pixel &amp; Silhouette</a>
          <a href="/review" style="color: #fbbf24; text-decoration: none;">💬 Critique Steam</a>
          <a href="/blindtest" style="color: #fbbf24; text-decoration: none;">🎵 Blind Test OST</a>
          <a href="/quiz" style="color: #fbbf24; text-decoration: none;">❓ Grand Quiz Trivia</a>
          <a href="/timeattack" style="color: #fbbf24; text-decoration: none;">⚡ Time Attack</a>
          <a href="/versus" style="color: #fbbf24; text-decoration: none;">⚔️ Arène Versus 1v1</a>
          <a href="/arcade" style="color: #fbbf24; text-decoration: none;">🕹️ Salle d'Arcade</a>
          <a href="/micro" style="color: #fbbf24; text-decoration: none;">🌱 Micro-Pépites</a>
          <a href="/toolbox" style="color: #fbbf24; text-decoration: none;">🧰 Radar Sorties 2025-2026</a>
          <a href="/roost" style="color: #fbbf24; text-decoration: none;">🦉 Le Perchoir Sylvestre</a>
        </nav>
      </header>

      <div role="main" class="seo-crawler-content">
        <!-- Section 1 : Introduction aux Jeux Indépendants -->
        <section style="margin-bottom: 2rem;">
          <h2 style="color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.5rem;">
            🎮 Pourquoi les Jeux Vidéo Indépendants Réinventent le Jeu Vidéo
          </h2>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 0.95rem;">
            Le <strong>jeu vidéo indépendant</strong> incarne le laboratoire de créativité le plus vibrant de l'industrie : des chefs-d'œuvre comme <em>Hollow Knight</em>, <em>Outer Wilds</em>, <em>Celeste</em>, <em>Hades</em> ou <em>Balatro</em> osent des mécaniques novatrices et des directions artistiques artisanales. Chez <strong>Hoot Indie Games</strong>, chaque jeu certifié est audité manuellement avec ses métadonnées Steam authentiques.
          </p>
        </section>

        <!-- Section 2 : Les Mini-Jeux et Défis Quotidiens -->
        <section id="minigames" style="margin-bottom: 2rem;">
          <h2 style="color: #f59e0b; font-size: 1.5rem; margin-bottom: 0.5rem;">
            🏆 8 Disciplines Quotidiennes, Arcade &amp; Duels Versus
          </h2>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 0.95rem; margin-bottom: 0.5rem;">
            Chaque jour à minuit, testez votre culture indie à travers 8 défis de déduction : 
            <strong>Screenle</strong> (capture zoomée), <strong>Indledle</strong> (Wordle du jeu indé), 
            <strong>Linkle</strong> (16 connexions secrètes), <strong>Profille</strong> (indices d'identité), 
            <strong>Chrono</strong> (frise chronologique), <strong>Pixel &amp; Silhouette</strong> (mosaïque dé-pixellisée), 
            <strong>Critique Steam</strong> (avis caviardé) et <strong>Blind Test OST</strong> (extraits musicaux interactifs).
          </p>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 0.95rem;">
            Profitez également des sprints <strong>Time Attack</strong> solo, de l'<strong>Arène Versus 1v1</strong> P2P WebRTC sans serveur tiers, du <strong>Grand Quiz Trivia</strong> (180 questions) et de 8 bornes d'<strong>arcade rétro</strong> (Snake, Pong, Breakout, Flappy, Moon Runner, Space Invaders, Tetris, Mine Storm Vectrex 1982).
          </p>
        </section>

        <!-- Section 3 : La Collection Sylvestre & Cartes -->
        <section id="cards" style="margin-bottom: 2rem;">
          <h2 style="color: #34d399; font-size: 1.5rem; margin-bottom: 0.5rem;">
            🃏 La Collection Sylvestre : Cartes &amp; Boosters
          </h2>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 0.95rem;">
            Collectionnez ${totalCount} cartes virtuelles officielles déclinées en 4 raretés (Commune, Rare, Épique, Légendaire) avec finitions holographiques 3D dynamiques. Ouvrez un booster de 5 cartes chaque jour et utilisez vos Plumes Sylvestres remportées lors des défis pour compléter votre classeur.
          </p>
        </section>

        <!-- Section 4 : Le Catalogue des Pépites par Genre -->
        <section id="catalogue-pepites" style="margin-bottom: 2rem;">
          <h2 style="color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.5rem;">
            📚 Le Catalogue de Référence des Meilleurs Jeux Indépendants
          </h2>
          ${catalogHtml}
        </section>

        <!-- Section 5 : Foire Aux Questions -->
        <section id="faq-jeux-independants" style="margin-bottom: 2rem;">
          <h2 style="color: #f59e0b; font-size: 1.5rem; margin-bottom: 0.5rem;">
            💡 Foire Aux Questions
          </h2>
          ${faqHtml}
        </section>

        <!-- Section 6 : Le Créateur et l'Écosystème -->
        <section id="roost" style="margin-bottom: 1.5rem;">
          <h2 style="color: #10b981; font-size: 1.3rem; margin-bottom: 0.5rem;">
            🦉 À Propos de Hoot Indie Games &amp; Quentin Beaud (Hibouxe / Edsaje)
          </h2>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 0.95rem;">
            Conçu avec passion par <strong>Quentin Beaud</strong> (alias <em>Hibouxe</em> sur YouTube et <em>Edsaje</em> sur GitHub), Hoot Indie Games est un sanctuaire open-source dédié à valoriser le jeu vidéo indépendant et à sauvegarder le patrimoine vidéoludique. Découvrez le portfolio sur <a href="https://quentinbeaud.com" target="_blank" rel="noopener noreferrer" style="color: #10b981; font-weight: 600;">quentinbeaud.com</a> et le code source sur <a href="https://github.com/Edsaje/hoot-indie-games" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-weight: 600;">GitHub</a>.
          </p>
        </section>
      </div>

      <footer style="text-align: center; border-top: 1px solid #1e293b; padding-top: 1.5rem; color: #64748b; font-size: 0.85rem;">
        <p>© 2026 Hoot Indie Games • Le Sanctuaire des Jeux Vidéo Indépendants • Tous droits réservés aux studios et créateurs respectifs.</p>
        <p>Hoot Indie Games n'est pas affilié à Valve Corporation. Steam et le logo Steam sont des marques déposées de Valve Corporation.</p>
      </footer>
    </div>
  `;

  // Lean semantic noscript content: strip 320+ inline styles to avoid mobile HTML parser/CSS bottlenecks
  const cleanNoscriptContent = rootPrerenderContent.replace(/\s*style="[^"]*"/g, '');

  // Pre-rendered Hero Card Skeleton inside #root for instant 0.9s LCP and 0.00 CLS
  const heroSkeletonContent = `
    <header class="sticky top-0 z-[48] w-full max-w-full bg-[#010805]/90 backdrop-blur-md border-b border-[#78350f] shadow-lg shadow-black/50" style="height: 64px; display: flex; align-items: center; padding: 0 1rem; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: #06241b; border: 1px solid #78350f; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🦉</div>
        <span style="font-weight: 900; font-size: 1rem; letter-spacing: 0.05em; color: #ffffff;">HOOT <span style="color: #f59e0b;">INDIE</span> GAMES</span>
      </div>
    </header>

    <main class="flex-1 w-full relative z-10">
      <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6">
        <div class="w-full max-w-xl mx-auto flex items-center justify-center p-1.5 rounded-2xl bg-[#06241b] border border-[#78350f] mb-6 shadow-xl" style="max-width: 576px; margin: 0 auto 1.5rem auto; padding: 0.375rem; border-radius: 1rem; background: #06241b; border: 1px solid #78350f; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700;">
          <span class="flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-black bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5" style="background: #f59e0b; color: #020617; padding: 0.5rem 0.75rem; border-radius: 0.75rem; font-weight: 900; display: inline-flex; align-items: center; gap: 0.35rem;">
            🧭 Pépites <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-black bg-slate-950/20 text-slate-950" style="font-family: monospace; font-size: 0.65rem; background: rgba(0,0,0,0.2); padding: 0.1rem 0.35rem; border-radius: 0.25rem;">${totalCount}</span>
          </span>
          <span class="flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5" style="color: #cbd5e1; padding: 0.5rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
            📁 Catalogue <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/30" style="font-family: monospace; font-size: 0.65rem; color: #fbbf24;">${catalogCount}</span>
          </span>
          <span class="flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5" style="color: #cbd5e1; padding: 0.5rem 0.75rem;">
            🌱 Micro-Indés
          </span>
        </div>
      </div>

      <div class="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8" style="max-width: 1152px; margin: 0 auto 2rem auto; padding: 1rem; box-sizing: border-box;">
        <div class="group relative rounded-2xl sm:rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-4 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-[inset_0_2px_2px_rgba(217,119,6,0.3),0_16px_40px_rgba(0,0,0,0.8)]" style="border-radius: 1.5rem; background: linear-gradient(135deg, #093a2b, #05261c, #021711); border: 2px solid #78350f; padding: 1.5rem; box-sizing: border-box;">
          <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center" style="display: grid; gap: 1.5rem;">
            <div class="lg:col-span-7 space-y-3 sm:space-y-4" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div class="flex flex-wrap items-center gap-2">
                <div class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider" style="display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content; padding: 0.25rem 0.75rem; border-radius: 0.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
                  <span>🧭 EXPÉDITION PÉPITES</span>
                </div>
              </div>

              <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight" style="font-size: clamp(1.5rem, 4vw, 2.75rem); font-weight: 900; color: #ffffff; margin: 0; line-height: 1.15; letter-spacing: -0.02em;">
                Le Sanctuaire du <span class="text-amber-400" style="color: #f59e0b;">Jeu Vidéo Indépendant</span>
              </h1>

              <p class="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl" style="font-size: 0.95rem; color: #cbd5e1; margin: 0; line-height: 1.5; max-width: 576px;">
                Chaque jour, une merveille du jeu indépendant sélectionnée pour son génie de conception, son authenticité et son statut d'œuvre culte.
              </p>

              <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2" style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <div class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; border-radius: 1rem; background: #f59e0b; color: #020617; font-weight: 900; font-size: 0.85rem; text-transform: uppercase;">
                  <span>📸 RELEVER LE DÉFI DU JOUR</span>
                </div>
              </div>
            </div>

            <div class="lg:col-span-5 w-full">
              <div class="rounded-2xl border border-[#78350f] bg-[#021711]/90 p-3.5 sm:p-5 flex flex-col justify-between shadow-2xl" style="background: #131a29; border: 1px solid #78350f; border-radius: 1rem; padding: 1rem; box-sizing: border-box;">
                <div class="flex items-center justify-between mb-3" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow" style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.15rem 0.5rem; border-radius: 0.375rem; background: #f59e0b; color: #020617; font-size: 0.75rem; font-weight: 900; text-transform: uppercase;">
                    ⭐ PÉPITE DU JOUR
                  </span>
                  <span class="text-xs font-mono font-bold text-amber-200/80" style="font-size: 0.75rem; font-family: monospace; font-weight: 700; color: #fde68a;">
                    ${escapeHtml(todayStr)}
                  </span>
                </div>

                <div class="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-[#4a3424] shadow-inner" style="position: relative; aspect-ratio: 16/9; border-radius: 0.75rem; overflow: hidden; background: #020617; border: 1px solid #4a3424; margin-bottom: 0.75rem;">
                  <picture class="w-full h-full block" style="width: 100%; height: 100%; display: block;">
                    ${dailyScreenshot.mobile ? `<source media="(max-width: 640px)" srcset="${escapeHtml(dailyScreenshot.mobile)}" type="image/webp">` : ''}
                    <img
                      src="${escapeHtml(dailyScreenshot.desktop || rawDailyScreenshot)}"
                      alt="${escapeHtml(dailyGame.title)}"
                      width="520"
                      height="292"
                      fetchpriority="high"
                      decoding="sync"
                      class="w-full h-full object-cover"
                      style="width: 100%; height: 100%; object-fit: cover; display: block;"
                    />
                  </picture>
                  <div style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.15rem 0.5rem; border-radius: 0.375rem; background: rgba(0,0,0,0.8); font-size: 0.75rem; font-family: monospace; font-weight: 700; color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    ${dailyGame.releaseYear}
                  </div>
                </div>

                <div>
                  <h2 class="text-xl font-black text-[#fef3c7] mb-1 drop-shadow-sm truncate" style="font-size: 1.25rem; font-weight: 900; color: #fef3c7; margin: 0 0 0.25rem 0;">
                    ${escapeHtml(dailyGame.title)}
                  </h2>
                  <p class="text-xs text-amber-200/60 mb-2 truncate" style="font-size: 0.8rem; color: #fde68a; opacity: 0.7; margin: 0;">
                    ${escapeHtml(dailyGame.developer)} • ${escapeHtml(dailyGame.genre.join(', '))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  // HTML Template
  const fullHtml = `<!doctype html>
<html lang="fr" dir="ltr">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- DNS prefetch for Steam CDN lazy loaded media -->
    <link rel="dns-prefetch" href="https://shared.akamai.steamstatic.com">
    ${dailyScreenshot.desktop ? `<!-- Responsive Preload for LCP Daily Gem Screenshot -->
    <link rel="preload" as="image" type="image/webp" href="${escapeHtml(dailyScreenshot.mobile || dailyScreenshot.desktop)}" media="(max-width: 640px)" fetchpriority="high">
    <link rel="preload" as="image" type="image/webp" href="${escapeHtml(dailyScreenshot.desktop)}" media="(min-width: 641px)" fetchpriority="high">\n` : ''}
    
    <!-- Primary SEO Meta Tags -->
    <title>Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants</title>
    <meta name="title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants">
    <meta name="description" content="Le sanctuaire du jeu indé : ${totalCount} pépites certifiées, collection de cartes &amp; boosters, 17+ mini-jeux (8 défis quotidiens, arcade rétro 1982), Time Attack et duels 1v1.">
    <meta name="keywords" content="jeux vidéo indépendants, jeux indés, indie games, meilleurs jeux vidéo indés, pépites jeux indés, catalogue steam indé, cartes à collectionner indé, booster de cartes jeux vidéo, classeur sylvestre, 17 mini jeux indés, screenle, indledle, linkle, profille, chrono timeline, quiz pixel art, devinette avis steam, blind test ost jeu video, grand quiz trivia indé, time attack sprint, duel versus 1v1 jeu indé, micro pépites itch io, hollow knight, outer wilds, celeste, hades, balatro, quentin beaud, hibouxe, arcade rétro vectrex">
    <meta name="author" content="Quentin Beaud (Hibouxe)">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

    <!-- Canonical URL & Multilingual Alternates -->
    <link rel="canonical" href="${CANONICAL_DOMAIN}/">
    <link rel="alternate" hreflang="fr" href="${CANONICAL_DOMAIN}/">
    <link rel="alternate" hreflang="en" href="${CANONICAL_DOMAIN}/">
    <link rel="alternate" hreflang="x-default" href="${CANONICAL_DOMAIN}/">

    <!-- Open Graph / Facebook / Discord -->
    <meta property="og:site_name" content="Hoot Indie Games">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${CANONICAL_DOMAIN}/">
    <meta property="og:title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants">
    <meta property="og:description" content="Explorez ${totalCount} pépites indés certifiées Steam ! Collectionnez les cartes de jeux et ouvrez vos boosters, relevez 18+ mini-jeux : 9 défis quotidiens (Screenle, Indledle, Blind Test OST, Critique...), 8 bornes d'arcade rétro, quiz trivia, sprints Time Attack et duels 1v1 en direct.">
    <meta property="og:image" content="${CANONICAL_DOMAIN}/og-banner.png?v=4">
    <meta property="og:image:secure_url" content="${CANONICAL_DOMAIN}/og-banner.png?v=4">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:locale:alternate" content="en_US">

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@Hibouxe">
    <meta name="twitter:creator" content="@Hibouxe">
    <meta name="twitter:title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants">
    <meta name="twitter:description" content="${totalCount} pépites indés certifiées, collection de cartes &amp; boosters sylvestres, 18+ mini-jeux (9 défis quotidiens dont Critique et Blind Test, 8 bornes d'arcade 1982), quiz trivia, Time Attack et duels 1v1 P2P.">
    <meta name="twitter:image" content="${CANONICAL_DOMAIN}/og-banner.png?v=4">
    <meta name="twitter:image:alt" content="Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants">

    <!-- Mobile & PWA Theme -->
    <meta name="theme-color" content="#0b0f19">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <!-- Critical Inline Styles to Prevent FOUC & Display Sanctuary Background -->
    <style>
      :root { color-scheme: dark; }
      html, body {
        margin: 0;
        padding: 0;
        background-color: #010604;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      @keyframes hoot-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body class="bg-[#010604] text-slate-100 antialiased" style="margin: 0; background-color: #010604; color: #f1f5f9;">
    <div id="root">
      ${heroSkeletonContent}
    </div>
    <noscript>
      ${cleanNoscriptContent}
    </noscript>
    <script type="module" src="/src/main.tsx"></script>
    <!-- Structured Data (JSON-LD Schema.org) placed at the end of body for fast initial DOM paint -->
    <script type="application/ld+json">
${JSON.stringify(jsonLdGraph)}
    </script>
  </body>
</html>
`;

  const minifiedHtml = fullHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return minifiedHtml;
}

// Run when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`🦉 Génération de la suite SEO sémantique pour Hoot Indie Games...`);
  const todayStr = new Date().toISOString().split('T')[0];
  generateSeoIndexHtml()
    .then((outputHtml) => {
      fs.writeFileSync(indexPath, outputHtml, 'utf-8');
      const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
      fs.writeFileSync(sitemapPath, generateSitemapXml(todayStr), 'utf-8');
      console.log(`✅ index.html et public/sitemap.xml mis à jour avec succès avec les pépites certifiées, le schéma JSON-LD (FAQPage + ItemList + SiteNavigation) et le contenu sémantique pré-rendu !`);
    })
    .catch((err) => {
      console.error('❌ Erreur lors de la génération SEO:', err);
      process.exit(1);
    });
}
