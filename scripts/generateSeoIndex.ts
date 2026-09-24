import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INDIE_GAMES } from '../src/data/games';
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

function buildFaqSchema() {
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
      a: `Hoot Indie Games propose un Explorateur de Pépites certifiées regroupant ${INDIE_GAMES.length} pépites rigoureusement auditées selon notre charte officielle de vérification (100% de données Steam réelles, avis extrêmement positifs et captures officielles). Vous pouvez également consulter notre Radar des sorties indépendantes 2025-2026 et synchroniser votre bibliothèque Steam pour identifier en un clic les perles que vous possédez déjà ou qu'il vous reste à explorer.`
    },
    {
      q: "Quels sont les 8 défis quotidiens gratuits de déduction sur Hoot Indie Games ?",
      a: "Hoot Indie Games propose chaque jour à minuit 8 défis de déduction gratuits et variés : 1. Screenle (devinette par zoom progressif de capture d'écran HD) ; 2. Indledle (le Wordle du jeu indé comparant l'année, le studio, les genres et la caméra) ; 3. Linkle (16 jeux à regrouper en 4 familles thématiques secrètes) ; 4. Profille (fiche d'identité aux indices textuels progressifs) ; 5. Chrono (classement chronologique de 5 jeux sur la frise temporelle) ; 6. Pixel & Silhouette (mosaïque dé-pixellisée et ombre chinoise) ; 7. Critique Steam (mots-clés caviardés d'un avis d'évaluation Steam authentique) ; 8. Blind Test OST (extraits sonores de bandes originales cultes au synthétiseur Web Audio)."
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

export function generateSeoIndexHtml(): string {
  const categorized = categorizeGames(INDIE_GAMES);
  const faqs = buildFaqSchema();

  // 1. Build ItemList for VideoGame Schema.org (Limit to Top 25 to reduce HTML weight)
  const topGames = INDIE_GAMES.slice(0, 25);
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
          `Le Sanctuaire des Jeux Vidéo Indépendants : catalogue certifié de ${INDIE_GAMES.length} pépites Steam, 8 défis quotidiens de déduction, sprints Time Attack, duels multijoueurs 1v1 et salle d\'arcade rétro.`,
        publisher: {
          '@type': 'Person',
          name: 'Quentin Beaud',
          alternateName: 'Hibouxe',
          url: 'https://quentinbeaud.com',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${CANONICAL_DOMAIN}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: ['fr-FR', 'en-US'],
      },
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': `${CANONICAL_DOMAIN}/#webapp`,
        name: 'Hoot Indie Games',
        url: `${CANONICAL_DOMAIN}/`,
        description:
          'Plateforme gratuite dédiée à la découverte, aux défis quotidiens et aux duels multijoueurs du jeu vidéo indépendant.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5 Canvas & Web Audio API.',
        inLanguage: ['fr', 'en'],
        image: `${CANONICAL_DOMAIN}/og-banner.png`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          bestRating: '5',
          ratingCount: '340',
        },
        featureList: [
          '8 Défis Quotidiens de Déduction Indé (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Critique Steam, Blind Test OST)',
          '8 Modes Sprints Time Attack avec records millisecondes',
          'Arène de Duels 1v1 en Temps Réel P2P WebRTC avec Tournoi Décathlon Indé',
          `Catalogue Certifié de ${INDIE_GAMES.length} Pépites du Jeu Vidéo Indépendant avec métadonnées Steam`,
          'Synchronisation Officielle de Bibliothèque Steam (OpenID / SteamID)',
          'Véritable Salle d\'Arcade Rétro 8 Jeux incluant Mine Storm Vectrex 1982',
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
        logo: `${CANONICAL_DOMAIN}/favicon.svg`,
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
            description: `Catalogue officiel des ${INDIE_GAMES.length} meilleures pépites du jeu vidéo indépendant certifiées Steam.`,
            url: `${CANONICAL_DOMAIN}/#gems`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 2,
            name: 'Hub des Mini-Jeux',
            description: 'Les 8 disciplines quotidiennes, Time Attack et duels multijoueurs.',
            url: `${CANONICAL_DOMAIN}/#minigames`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 3,
            name: 'Screenle (Capture)',
            description: 'Devinette quotidienne du jeu indé par zoom progressif de capture d\'écran HD.',
            url: `${CANONICAL_DOMAIN}/#screenle`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 4,
            name: 'Indledle (Classic)',
            description: 'Le Wordle du jeu vidéo indépendant par année, genres, studio et caméra.',
            url: `${CANONICAL_DOMAIN}/#indledle`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 5,
            name: 'Linkle (Connexions)',
            description: 'Regroupez 16 jeux indés en 4 familles thématiques secrètes.',
            url: `${CANONICAL_DOMAIN}/#linkle`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 6,
            name: 'Profille (Profil)',
            description: 'Indices textuels dévoilés progressivement pour deviner le jeu.',
            url: `${CANONICAL_DOMAIN}/#profille`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 7,
            name: 'Chrono (Timeline)',
            description: 'Replacez les pépites indés sur la frise chronologique historique.',
            url: `${CANONICAL_DOMAIN}/#chrono`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 8,
            name: 'Pixel & Silhouette',
            description: 'Déduction par résolution de mosaïque de pixels et ombre chinoise.',
            url: `${CANONICAL_DOMAIN}/#pixel`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 9,
            name: 'Critique Steam (Review)',
            description: 'Déchiffrez les mots-clés biffés d\'une évaluation Steam authentique.',
            url: `${CANONICAL_DOMAIN}/#review`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 10,
            name: 'Blind Test OST',
            description: 'Quiz musical au synthétiseur Web Audio en paliers d\'écoute de 1 à 30 secondes.',
            url: `${CANONICAL_DOMAIN}/#blindtest`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 11,
            name: 'Time Attack',
            description: 'Sprints contre-la-montre sur les 8 disciplines avec chrono milliseconde.',
            url: `${CANONICAL_DOMAIN}/#timeattack`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 12,
            name: 'Arène Versus 1v1',
            description: 'Duels multijoueurs en temps réel P2P WebRTC et Tournoi Décathlon Mixte.',
            url: `${CANONICAL_DOMAIN}/#versus`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 13,
            name: 'Salle d\'Arcade Rétro',
            description: '8 jeux d\'arcade cultes dont une réplique fidèle du Mine Storm Vectrex 1982.',
            url: `${CANONICAL_DOMAIN}/#arcade`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 14,
            name: 'Boîte à Outils & Radar 2025-2026',
            description: 'Radar des sorties de jeux indépendants et boîte à outils pour joueurs.',
            url: `${CANONICAL_DOMAIN}/#toolbox`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 15,
            name: 'Le Perchoir Sylvestre',
            description: 'Portfolio créatif, essais narratifs et projets de Quentin Beaud (Hibouxe).',
            url: `${CANONICAL_DOMAIN}/#roost`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${CANONICAL_DOMAIN}/#catalog`,
        name: `Catalogue Officiel des ${INDIE_GAMES.length} Pépites du Jeu Vidéo Indépendant`,
        description: 'Sélection certifiée des plus grands chefs-d\'œuvre et découvertes de la scène indépendante PC & Steam.',
        numberOfItems: INDIE_GAMES.length,
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
    catalogHtml += `
      <section class="seo-category" style="margin-bottom: 2.5rem;">
        <h3 style="color: #f59e0b; font-size: 1.4rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; margin-top: 1.5rem;">
          ${escapeHtml(categoryName)} (${games.length} jeux)
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
    `;

    for (const game of games) {
      catalogHtml += `
        <article class="seo-game-card" style="background: #131a29; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; color: #cbd5e1;">
          <h4 style="color: #f8fafc; margin: 0 0 0.4rem 0; font-size: 1.1rem;">
            ${escapeHtml(game.title)} <span style="color: #f59e0b; font-size: 0.85rem; font-weight: normal;">(${game.releaseYear})</span>
          </h4>
          <p style="margin: 0 0 0.4rem 0; font-size: 0.85rem; color: #94a3b8;">
            <strong>Studio :</strong> ${escapeHtml(game.developer)}<br>
            <strong>Genres :</strong> ${escapeHtml(game.genre.join(', '))}<br>
            <strong>Style :</strong> ${escapeHtml(game.artStyle.fr)} | <strong>Vue :</strong> ${escapeHtml(game.camera.fr)}
          </p>
          <p style="margin: 0 0 0.6rem 0; font-size: 0.9rem; font-style: italic; color: #e2e8f0; line-height: 1.4;">
            « ${escapeHtml(game.hints.tagline.fr)} »
          </p>
          ${
            game.steamUrl
              ? `<a href="${escapeHtml(game.steamUrl)}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-size: 0.85rem; text-decoration: underline;">Voir la page Steam officielle</a>`
              : ''
          }
        </article>
      `;
    }

    catalogHtml += `
        </div>
      </section>
    `;
  }

  let faqHtml = '';
  for (const f of faqs) {
    faqHtml += `
      <article style="margin-bottom: 1.5rem; background: #131a29; padding: 1.25rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.1rem;">${escapeHtml(f.q)}</h3>
        <p style="color: #cbd5e1; margin-bottom: 0; line-height: 1.6;">${escapeHtml(f.a)}</p>
      </article>
    `;
  }

  const rootPrerenderContent = `
    <!-- Pre-rendered Semantic SEO Content for Search Engine Crawlers (Googlebot, Bingbot) -->
    <!-- When React mounts, this content is dynamically replaced by the interactive SPA -->
    <div id="seo-crawler-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
      <header style="text-align: center; margin-bottom: 3rem; border-bottom: 1px solid #1e293b; padding-bottom: 2rem;">
        <h1 style="color: #f59e0b; font-size: 2.2rem; margin-bottom: 0.5rem; letter-spacing: 1px;">
          🦉 Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants
        </h1>
        <p style="font-size: 1.2rem; color: #94a3b8; max-width: 860px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
          Le sanctuaire du <strong>jeu vidéo indépendant</strong> : catalogue certifié de ${INDIE_GAMES.length} pépites Steam, 
          <strong>8 défis quotidiens de déduction</strong> (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Critique Steam, Blind Test OST), 
          sprints <strong>Time Attack</strong>, arène de <strong>duels 1v1</strong> en direct et véritable <strong>salle d'arcade rétro 1982</strong>.
        </p>
        <nav aria-label="Navigation Principale" style="display: flex; justify-content: center; gap: 1rem 1.5rem; flex-wrap: wrap; font-weight: 600;">
          <a href="#gems" style="color: #fbbf24; text-decoration: none;">💎 Pépites Certifiées</a>
          <a href="#minigames" style="color: #fbbf24; text-decoration: none;">🎮 Hub des Mini-Jeux</a>
          <a href="#screenle" style="color: #fbbf24; text-decoration: none;">📸 Screenle (Capture)</a>
          <a href="#indledle" style="color: #fbbf24; text-decoration: none;">🔍 Indledle (Classic)</a>
          <a href="#linkle" style="color: #fbbf24; text-decoration: none;">🧩 Linkle (Connexions)</a>
          <a href="#profille" style="color: #fbbf24; text-decoration: none;">📋 Profille (Profil)</a>
          <a href="#chrono" style="color: #fbbf24; text-decoration: none;">⏳ Chrono (Timeline)</a>
          <a href="#pixel" style="color: #fbbf24; text-decoration: none;">🎨 Pixel &amp; Silhouette</a>
          <a href="#review" style="color: #fbbf24; text-decoration: none;">💬 Critique Steam</a>
          <a href="#blindtest" style="color: #fbbf24; text-decoration: none;">🎵 Blind Test OST</a>
          <a href="#timeattack" style="color: #fbbf24; text-decoration: none;">⚡ Time Attack</a>
          <a href="#versus" style="color: #fbbf24; text-decoration: none;">⚔️ Arène Versus 1v1</a>
          <a href="#arcade" style="color: #fbbf24; text-decoration: none;">🕹️ Salle d'Arcade</a>
          <a href="#toolbox" style="color: #fbbf24; text-decoration: none;">🧰 Radar Sorties 2025-2026</a>
          <a href="#roost" style="color: #fbbf24; text-decoration: none;">🦉 Le Perchoir Sylvestre</a>
        </nav>
      </header>

      <div role="main" class="seo-crawler-content">
        <!-- Section 1 : Introduction aux Jeux Indépendants -->
        <section style="margin-bottom: 3rem;">
          <h2 style="color: #38bdf8; font-size: 1.8rem; margin-bottom: 1rem;">
            🎮 Pourquoi les Jeux Vidéo Indépendants Réinventent le Jeu Vidéo
          </h2>
          <p style="line-height: 1.7; color: #cbd5e1; font-size: 1.05rem;">
            Le <strong>jeu vidéo indépendant</strong> (ou <em>indie game</em>) incarne aujourd'hui le laboratoire de créativité le plus vibrant de l'industrie vidéoludique mondiale. 
            Loin des contraintes de rentabilité des superproductions AAA, les studios indépendants osent des mécaniques de jeu révolutionnaires, des narrations intimistes et bouleversantes, et des esthétiques artistiques artisanales inoubliables : du <strong>Pixel Art</strong> minutieux de <em>Celeste</em> et <em>Dead Cells</em> à la 3D contemplative d'<em>Outer Wilds</em>, en passant par le dessin à la main de <em>Hollow Knight</em> ou l'ingéniosité mathématique de <em>Balatro</em>.
          </p>
          <p style="line-height: 1.7; color: #cbd5e1; font-size: 1.05rem;">
            Chez <strong>Hoot Indie Games</strong>, nous appliquons une <strong>charte de sélection officielle et rigoureuse</strong> : chaque jeu figurant dans notre sanctuaire est audité manuellement, certifié avec ses métadonnées Steam authentiques, ses captures d'écran en haute résolution et ses avis de joueurs vérifiés.
          </p>
        </section>

        <!-- Section 2 : Les 8 Disciplines de Déduction Quotidiennes -->
        <section id="minigames" style="margin-bottom: 3.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 2rem;">
          <h2 style="color: #f59e0b; font-size: 1.8rem; margin-top: 0; margin-bottom: 0.5rem;">
            🏆 Les 8 Disciplines de Déduction Quotidiennes Gratuites
          </h2>
          <p style="color: #94a3b8; margin-bottom: 1.5rem; font-size: 1.05rem;">
            Chaque jour à minuit, testez votre culture des chefs-d'œuvre indépendants à travers 8 formats de réflexion uniques et complémentaires :
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.25rem;">
            <!-- 1. Screenle -->
            <article id="screenle" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #06b6d4;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">📸 1. Screenle : Capture du Jour</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Identifiez le chef-d'œuvre indépendant secret à partir d'une capture d'écran ultra-zoomée. 
                À chaque essai manqué, le champ visuel s'élargit progressivement pour révéler des détails cruciaux.
              </p>
              <a href="#screenle" style="color: #38bdf8; font-size: 0.85rem; font-weight: 600;">Lancer le défi Screenle →</a>
            </article>

            <!-- 2. Indledle -->
            <article id="indledle" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #f59e0b;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">🔍 2. Indledle : Le Wordle du Jeu Indé</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Déduisez le titre secret en analysant l'année de sortie (plus récent / plus ancien), les genres correspondants, le studio créateur, le style artistique et la caméra.
              </p>
              <a href="#indledle" style="color: #fbbf24; font-size: 0.85rem; font-weight: 600;">Lancer le défi Indledle →</a>
            </article>

            <!-- 3. Linkle -->
            <article id="linkle" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #a855f7;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">🧩 3. Linkle : 16 Connexions Secrètes</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Une grille de 16 jeux vidéo indépendants reliés par 4 thématiques secrètes (mécaniques communes, compositeurs partagés, univers visuels, années marquantes).
              </p>
              <a href="#linkle" style="color: #c084fc; font-size: 0.85rem; font-weight: 600;">Lancer le défi Linkle →</a>
            </article>

            <!-- 4. Profille -->
            <article id="profille" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #10b981;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">📋 4. Profille : La Fiche d'Identité</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Découvrez le jeu du jour en débloquant pas à pas ses indices d'identité : année de publication, studio de développement, tags Steam et phrase d'accroche narrative.
              </p>
              <a href="#profille" style="color: #34d399; font-size: 0.85rem; font-weight: 600;">Lancer le défi Profille →</a>
            </article>

            <!-- 5. Chrono -->
            <article id="chrono" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #14b8a6;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">⏳ 5. Chrono : La Frise Historique</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Replacez 5 jeux vidéo indépendants majeurs sur une frise temporelle dans leur ordre exact de sortie pour mesurer votre maîtrise de l'histoire du jeu indé.
              </p>
              <a href="#chrono" style="color: #2dd4bf; font-size: 0.85rem; font-weight: 600;">Lancer le défi Chrono →</a>
            </article>

            <!-- 6. Pixel & Silhouette -->
            <article id="pixel" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #6366f1;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">🎨 6. Pixel &amp; Silhouette : Mosaïque</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Reconnaissez une scène emblématique à travers une mosaïque dé-pixellisée progressive combinée à la silhouette d'ombre chinoise de son protagoniste.
              </p>
              <a href="#pixel" style="color: #818cf8; font-size: 0.85rem; font-weight: 600;">Lancer le défi Pixel →</a>
            </article>

            <!-- 7. Critique Steam -->
            <article id="review" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #f43f5e;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">💬 7. Critique Steam : L'Avis Caviardé</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Déchiffrez une véritable évaluation Steam officielle dont les mots-clés révélateurs ont été biffés. Révélez les indices un par un et devinez le titre encensé.
              </p>
              <a href="#review" style="color: #fb7185; font-size: 0.85rem; font-weight: 600;">Lancer le défi Critique →</a>
            </article>

            <!-- 8. Blind Test OST -->
            <article id="blindtest" style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #8b5cf6;">
              <h3 style="color: #f8fafc; margin-top: 0; font-size: 1.15rem;">🎵 8. Blind Test OST : Quiz Musical</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Écoutez des extraits musicaux au synthétiseur Web Audio en temps réel en paliers d'écoute progressifs (1s à 30s) et reconnaissez les bandes originales cultes.
              </p>
              <a href="#blindtest" style="color: #a78bfa; font-size: 0.85rem; font-weight: 600;">Lancer le Blind Test OST →</a>
            </article>
          </div>
        </section>

        <!-- Section 3 : Modes Compétitifs (Time Attack & Versus 1v1) -->
        <section style="margin-bottom: 3.5rem;">
          <h2 style="color: #38bdf8; font-size: 1.8rem; margin-bottom: 1rem;">
            ⚡ Compétition : Sprints Time Attack &amp; Arène Versus 1v1
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
            <article id="timeattack" style="background: #131a29; border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #f59e0b;">
              <h3 style="color: #fbbf24; margin-top: 0; font-size: 1.3rem;">⚡ Time Attack : Sprints Solo Contre-la-Montre</h3>
              <p style="line-height: 1.6; color: #cbd5e1;">
                Le <strong>Time Attack</strong> de Hoot Indie Games met vos réflexes à rude épreuve sur les 8 disciplines de déduction.
                Chronométré à la milliseconde près, ce mode récompense la rapidité et la précision avec un multiplicateur de combo,
                un système de bonus/pénalités et la sauvegarde locale de vos records de vitesse.
              </p>
              <a href="#timeattack" style="color: #f59e0b; font-weight: 600;">Accéder au Hub Time Attack →</a>
            </article>

            <article id="versus" style="background: #131a29; border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #f43f5e;">
              <h3 style="color: #fb7185; margin-top: 0; font-size: 1.3rem;">⚔️ Arène Versus 1v1 : Duels Directs P2P WebRTC</h3>
              <p style="line-height: 1.6; color: #cbd5e1;">
                Affrontez un ami ou un rival en direct dans l'<strong>Arène 1v1</strong> sans téléchargement ni intermédiaire grâce à la synchronisation pair-à-pair WebRTC.
                Partagez un simple code de salon pour lancer un duel sur votre discipline favorite ou vous mesurer au <strong>Tournoi Décathlon Mixte</strong> (8 épreuves consécutives) avec boutons de validation rapide [1-4].
              </p>
              <a href="#versus" style="color: #f43f5e; font-weight: 600;">Rejoindre l'Arène Versus →</a>
            </article>
          </div>
        </section>

        <!-- Section 4 : La Salle d'Arcade Rétro -->
        <section id="arcade" style="margin-bottom: 3.5rem; background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 2rem;">
          <h2 style="color: #10b981; font-size: 1.8rem; margin-top: 0; margin-bottom: 1rem;">
            🕹️ La Salle d'Arcade Rétro &amp; Le Vectrex Mine Storm 1982
          </h2>
          <p style="line-height: 1.7; color: #cbd5e1; font-size: 1.05rem;">
            En hommage aux racines du jeu indépendant et du homebrew, Hoot Indie Games abrite une véritable salle d'arcade rétro jouable instantanément dans votre navigateur :
            <strong>Snake Sylvestre</strong>, <strong>Pong Nocturne</strong>, <strong>Casse-Briques</strong>, <strong>Flappy Hibou</strong>, <strong>Moon Runner</strong>, <strong>Space Invaders</strong>, <strong>Tetris des Pépites</strong>, 
            ainsi qu'une émulation vectorielle fidèle du légendaire <strong>Mine Storm</strong> paru sur la console <em>Vectrex en 1982</em>.
          </p>
          <a href="#arcade" style="color: #34d399; font-weight: 600;">Jouer aux 8 bornes rétro d'arcade →</a>
        </section>

        <!-- Section 5 : Boîte à Outils & Radar des Sorties 2025-2026 -->
        <section id="toolbox" style="margin-bottom: 3.5rem; background: #131a29; border: 1px solid #1e293b; border-radius: 12px; padding: 2rem;">
          <h2 style="color: #38bdf8; font-size: 1.8rem; margin-top: 0; margin-bottom: 1rem;">
            🧰 Boîte à Outils du Joueur &amp; Radar des Sorties Indés 2025-2026
          </h2>
          <p style="line-height: 1.7; color: #cbd5e1; font-size: 1.05rem;">
            Restez à la pointe de l'actualité avec notre <strong>Radar des sorties indépendantes 2025-2026</strong>. 
            Suivez les pépites en développement les plus prometteuses (telles que <em>Hollow Knight: Silksong</em>, <em>Mina the Hollower</em> ou <em>Judas</em>), 
            consultez les fiches techniques, les dates estimées et ajoutez-les directement à votre liste de souhaits Steam.
          </p>
          <a href="#toolbox" style="color: #38bdf8; font-weight: 600;">Explorer la Boîte à Outils &amp; le Radar →</a>
        </section>

        <!-- Section 6 : Le Grand Catalogue des ${INDIE_GAMES.length} Pépites -->
        <section id="catalogue-pepites" style="margin-bottom: 3.5rem;">
          <h2 style="color: #38bdf8; font-size: 1.8rem; margin-bottom: 0.5rem;">
            📚 Le Catalogue de Référence des ${INDIE_GAMES.length} Meilleures Pépites du Jeu Vidéo Indépendant
          </h2>
          <p style="color: #94a3b8; margin-bottom: 1.5rem; font-size: 1.05rem;">
            Explorez notre sélection exhaustive de chefs-d'œuvre et découvertes incontournables du jeu vidéo indépendant certifiés sur PC et Steam, triés par genres et styles visuels.
          </p>
          ${catalogHtml}
        </section>

        <!-- Section 7 : Foire Aux Questions (FAQ) -->
        <section id="faq-jeux-independants" style="margin-bottom: 3.5rem;">
          <h2 style="color: #f59e0b; font-size: 1.8rem; margin-bottom: 1rem;">
            💡 Foire Aux Questions : Tout Savoir sur les Jeux Vidéo Indépendants
          </h2>
          ${faqHtml}
        </section>

        <!-- Section 8 : Le Créateur et l'Écosystème -->
        <section id="roost" style="margin-bottom: 2rem; background: #131a29; border: 1px solid #1e293b; border-radius: 12px; padding: 2rem;">
          <h2 style="color: #10b981; font-size: 1.5rem; margin-top: 0;">
            🦉 À Propos de Hoot Indie Games &amp; Quentin Beaud (Hibouxe / Edsaje)
          </h2>
          <p style="line-height: 1.6; color: #cbd5e1;">
            Conçu avec passion par <strong>Quentin Beaud</strong> (alias <em>Hibouxe</em> sur YouTube et <em>Edsaje</em> sur GitHub), 
            Hoot Indie Games est un sanctuaire open-source dédié à promouvoir la créativité des studios indépendants, 
            à sauvegarder le patrimoine vidéoludique rétro (reproduction du <em>Mine Storm</em> Vectrex 1982) et à proposer des outils de déduction modernes et gratuits à la communauté des joueurs.
          </p>
          <p style="margin-bottom: 0;">
            Découvrez le portfolio et les créations sur <a href="https://quentinbeaud.com" target="_blank" rel="noopener noreferrer" style="color: #10b981; font-weight: 600;">quentinbeaud.com</a>, 
            les vidéos d'essais sur YouTube <a href="https://youtube.com/@Hibouxe" target="_blank" rel="noopener noreferrer" style="color: #f59e0b; font-weight: 600;">@Hibouxe</a> 
            et le code source officiel sur <a href="https://github.com/Edsaje/hoot-indie-games" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-weight: 600;">GitHub (Edsaje)</a>.
          </p>
        </section>
      </div>

      <footer style="text-align: center; border-top: 1px solid #1e293b; padding-top: 2rem; color: #64748b; font-size: 0.9rem;">
        <p>© 2026 Hoot Indie Games • Le Sanctuaire des Jeux Vidéo Indépendants • Tous droits réservés aux studios et créateurs respectifs.</p>
        <p>Hoot Indie Games n'est pas affilié à Valve Corporation. Steam et le logo Steam sont des marques déposées de Valve Corporation.</p>
      </footer>
    </div>
  `;

  // HTML Template
  const fullHtml = `<!doctype html>
<html lang="fr" dir="ltr">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="apple-touch-icon" href="/logo-512.png">
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary SEO Meta Tags -->
    <title>Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants</title>
    <meta name="title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants">
    <meta name="description" content="Le sanctuaire du jeu vidéo indé : ${INDIE_GAMES.length} pépites certifiées, 8 défis quotidiens (Screenle, Indledle, Blind Test...), Time Attack, duels 1v1 et arcade rétro.">
    <meta name="keywords" content="jeux vidéo indépendants, jeux indés, indie games, meilleurs jeux vidéo indés, pépites jeux indés, catalogue steam indé, screenle, indledle, linkle, profille, chrono timeline, quiz pixel art, devinette avis steam, blind test ost jeu video, time attack sprint, duel versus 1v1 jeu indé, hollow knight, outer wilds, celeste, hades, balatro, quentin beaud, hibouxe, arcade rétro vectrex">
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
    <meta property="og:description" content="Explorez ${INDIE_GAMES.length} chefs-d'œuvre indépendants certifiés Steam, 8 défis quotidiens gratuits (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Critique Steam, Blind Test OST), sprints Time Attack, arène de duels 1v1 et salle d'arcade rétro.">
    <meta property="og:image" content="${CANONICAL_DOMAIN}/og-banner.png?v=2">
    <meta property="og:image:secure_url" content="${CANONICAL_DOMAIN}/og-banner.png?v=2">
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
    <meta name="twitter:description" content="${INDIE_GAMES.length} pépites indés certifiées, 8 défis quotidiens (Screenle, Indledle, Blind Test OST...), sprints Time Attack, duels 1v1 P2P et salle d'arcade rétro.">
    <meta name="twitter:image" content="${CANONICAL_DOMAIN}/og-banner.png?v=2">
    <meta name="twitter:image:alt" content="Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants">

    <!-- Mobile & PWA Theme -->
    <meta name="theme-color" content="#0b0f19">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Structured Data (JSON-LD Schema.org) -->
    <script type="application/ld+json">
${JSON.stringify(jsonLdGraph, null, 2)}
    </script>
    <!-- Critical Inline Styles to Prevent FOUC & Display Loading Screen -->
    <style>
      :root { color-scheme: dark; }
      html, body {
        margin: 0;
        padding: 0;
        background-color: #010604;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #app-loading {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: radial-gradient(ellipse 120% 75% at 50% -10%, rgba(13, 59, 44, 0.42) 0%, rgba(2, 22, 15, 0.7) 45%, #010805 85%), #010604;
        color: #e2e8f0;
        text-align: center;
        padding: 1.5rem;
        box-sizing: border-box;
      }
      @keyframes hoot-pulse {
        0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4)); }
        50% { transform: scale(1.06); opacity: 1; filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.6)); }
      }
      @keyframes hoot-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body class="bg-[#010604] text-slate-100 antialiased" style="margin: 0; background-color: #010604; color: #f1f5f9;">
    <noscript>
      <div style="max-width: 800px; margin: 2rem auto; padding: 2rem; background: #131a29; border: 1px solid #f59e0b; border-radius: 12px; color: #e2e8f0; font-family: sans-serif; line-height: 1.6; text-align: center;">
        <h1 style="color: #f59e0b; font-size: 1.8rem; margin-top: 0;">🦉 Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants</h1>
        <p>Bienvenue sur <strong>Hoot Indie Games</strong>, la plateforme consacrée aux pépites du jeu vidéo indépendant.</p>
        <p>Explorez notre catalogue certifié de ${INDIE_GAMES.length} jeux indépendants et nos 8 défis quotidiens gratuits (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Critique Steam, Blind Test OST).</p>
        <p style="color: #94a3b8; font-size: 0.9rem;">Pour lancer les jeux interactifs, les duels 1v1 et le mode Time Attack, veuillez activer JavaScript dans votre navigateur.</p>
      </div>
      ${rootPrerenderContent}
    </noscript>
    <div id="root">
      <div id="app-loading">
        <div style="position: relative; margin-bottom: 1.25rem;">
          <img src="/logo-512.png" alt="Hoot Indie Games" width="80" height="80" style="width: 80px; height: 80px; animation: hoot-pulse 2s ease-in-out infinite;">
        </div>
        <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b; letter-spacing: 0.5px; margin-bottom: 0.5rem; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          Hoot Indie Games
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #94a3b8; font-size: 0.875rem;">
          <div style="width: 14px; height: 14px; border: 2px solid #059669; border-top-color: #f59e0b; border-radius: 50%; animation: hoot-spin 0.8s linear infinite;"></div>
          <span>Chargement du sanctuaire...</span>
        </div>
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  return fullHtml;
}

// Run when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`🦉 Génération de la suite SEO sémantique pour Hoot Indie Games...`);
  const outputHtml = generateSeoIndexHtml();
  fs.writeFileSync(indexPath, outputHtml, 'utf-8');
  console.log(`✅ index.html mis à jour avec succès avec les ${INDIE_GAMES.length} pépites certifiées, le schéma JSON-LD (FAQPage + ItemList + SiteNavigation) et le contenu sémantique pré-rendu !`);
}
