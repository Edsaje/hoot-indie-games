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
      a: "Hoot Indie Games propose un Explorateur de Pépites certifiées regroupant 94 pépites rigoureusement auditées selon la règle Zéro Hallucination (100% de données Steam réelles, avis extrêmement positifs et captures officielles). Vous pouvez également consulter notre Radar des sorties indépendantes 2025-2026 et synchroniser votre bibliothèque Steam pour identifier en un clic les perles que vous possédez déjà ou qu'il vous reste à explorer."
    },
    {
      q: "Qu'est-ce que Screenle, Indledle et Linkle sur Hoot Indie Games ?",
      a: "Ce sont les 3 défis quotidiens gratuits de Hoot Indie Games pour tester sa culture des jeux indépendants : Screenle consiste à deviner le jeu du jour à partir d'un zoom progressif de capture d'écran HD ; Indledle invite à trouver le jeu secret en croisant l'année de sortie, les genres, le studio, le style graphique et la caméra ; Linkle met au défi de regrouper 16 jeux indés en 4 catégories secrètes de 4 jeux."
    },
    {
      q: "Comment connecter son compte Steam et synchroniser sa bibliothèque de jeux ?",
      a: "Sur Hoot Indie Games, vous pouvez vous connecter en un clic via l'authentification officielle Valve Steam OpenID 2.0 ou saisir directement votre identifiant SteamID64. Le site synchronise alors instantanément votre ludothèque Steam afin d'afficher les badges 'Dans votre bibliothèque' sur chaque jeu du catalogue et filtrer les pépites selon vos possessions."
    },
    {
      q: "Qu'est-ce que la salle d'arcade rétro Hoot Indie Games ?",
      a: "La salle d'arcade rétro propose 8 mini-jeux classiques jouables gratuitement directement dans votre navigateur sur mobile et ordinateur : Snake Sylvestre, Pong Nocturne, Casse-Briques, Flappy Hibou, Moon Runner, Space Invaders, Tetris des Pépites, ainsi qu'une reproduction fidèle du légendaire Mine Storm de la console vectorielle Vectrex (1982)."
    }
  ];
}

export function generateSeoIndexHtml(): string {
  const categorized = categorizeGames(INDIE_GAMES);
  const faqs = buildFaqSchema();

  // 1. Build ItemList for VideoGame Schema.org
  const videoGameItems = INDIE_GAMES.map((game, index) => ({
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
        url: `${CANONICAL_DOMAIN}/`,
        description: 'Le Sanctuaire des Jeux Vidéo Indépendants : 94 pépites certifiées, 3 jeux quotidiens (Screenle, Indledle, Linkle), arène 1v1 multijoueur et salle d\'arcade rétro.',
        publisher: {
          '@type': 'Person',
          name: 'Quentin Beaud',
          alternateName: 'Hibouxe',
          url: 'https://quentinbeaud.com',
        },
        inLanguage: ['fr-FR', 'en-US'],
      },
      {
        '@type': 'WebApplication',
        '@id': `${CANONICAL_DOMAIN}/#webapp`,
        name: 'Hoot Indie Games',
        url: `${CANONICAL_DOMAIN}/`,
        description: 'Plateforme gratuite dédiée à la découverte et aux défis quotidiens du jeu vidéo indépendant.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5 Canvas.',
        inLanguage: ['fr', 'en'],
        image: `${CANONICAL_DOMAIN}/og-banner.png`,
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
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${CANONICAL_DOMAIN}/#catalog`,
        name: 'Catalogue Officiel des 94 Pépites du Jeu Vidéo Indépendant',
        description: 'Sélection certifiée Zéro Hallucination des plus grands chefs-d\'œuvre et découvertes de la scène indépendante PC & Steam.',
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
        <h4 style="color: #f8fafc; margin-top: 0; font-size: 1.1rem;">${escapeHtml(f.q)}</h4>
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
        <p style="font-size: 1.2rem; color: #94a3b8; max-width: 800px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
          La plateforme de référence pour découvrir, célébrer et tester sa culture des plus grands <strong>jeux vidéo indépendants</strong>. 
          Catalogue certifié de ${INDIE_GAMES.length} pépites, 3 défis quotidiens (Screenle, Indledle, Linkle), arène 1v1 multijoueur et véritable salle d'arcade rétro 1982.
        </p>
        <nav aria-label="Navigation Principale" style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; font-weight: 600;">
          <a href="#gems" style="color: #fbbf24; text-decoration: none;">💎 Pépites Certifiées</a>
          <a href="#screenle" style="color: #fbbf24; text-decoration: none;">📸 Screenle (Capture du Jour)</a>
          <a href="#indledle" style="color: #fbbf24; text-decoration: none;">🔍 Indledle (Déduction Quotidienne)</a>
          <a href="#linkle" style="color: #fbbf24; text-decoration: none;">🧩 Linkle (16 Connexions)</a>
          <a href="#versus" style="color: #fbbf24; text-decoration: none;">⚔️ Arène Versus 1v1</a>
          <a href="#arcade" style="color: #fbbf24; text-decoration: none;">🕹️ Salle d'Arcade Rétro</a>
          <a href="#toolbox" style="color: #fbbf24; text-decoration: none;">🧰 Radar & Sorties 2025-2026</a>
          <a href="#roost" style="color: #fbbf24; text-decoration: none;">🦉 Le Perchoir Sylvestre</a>
        </nav>
      </header>

      <main>
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
            Chez <strong>Hoot Indie Games</strong>, nous appliquons une <strong>charte stricte Zéro Hallucination</strong> : chaque jeu figurant dans notre sanctuaire est audité manuellement, certifié avec ses métadonnées Steam authentiques, ses captures d'écran en haute résolution et ses avis de joueurs vérifiés.
          </p>
        </section>

        <!-- Section 2 : Les 3 Jeux Quotidiens -->
        <section style="margin-bottom: 3rem; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 2rem;">
          <h2 style="color: #f59e0b; font-size: 1.8rem; margin-top: 0; margin-bottom: 1rem;">
            🏆 3 Défis Quotidiens Gratuits pour les Passionnés de Jeux Indés
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            <article style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #f59e0b;">
              <h3 style="color: #f8fafc; margin-top: 0;">📸 Screenle : Devinette par Zoom de Capture</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Chaque jour à minuit, identifiez un chef-d'œuvre indépendant à partir d'une capture d'écran ultra-zoomée. 
                À chaque essai manqué, le champ visuel s'élargit et des indices textuels et musicaux se dévoilent.
              </p>
            </article>

            <article style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #10b981;">
              <h3 style="color: #f8fafc; margin-top: 0;">🔍 Indledle : Déduction par Attributs</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Le Wordle du jeu vidéo indé ! Proposez un titre pour analyser l'année de sortie (plus récent/plus ancien), les genres concordants, le studio, le style artistique et la perspective de caméra.
              </p>
            </article>

            <article style="background: #131a29; padding: 1.25rem; border-radius: 8px; border-top: 3px solid #8b5cf6;">
              <h3 style="color: #f8fafc; margin-top: 0;">🧩 Linkle : Le Jeu des 16 Connexions</h3>
              <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.95rem;">
                Une grille de 16 jeux vidéo indépendants reliés par 4 thématiques secrètes (mécaniques communes, compositeurs partagés, univers visuels, années marquantes). Retrouvez les 4 groupes sans dépasser 4 erreurs !
              </p>
            </article>
          </div>
        </section>

        <!-- Section 3 : Le Grand Catalogue des 94 Pépites -->
        <section id="catalogue-pepites" style="margin-bottom: 3.5rem;">
          <h2 style="color: #38bdf8; font-size: 1.8rem; margin-bottom: 0.5rem;">
            📚 Le Catalogue de Référence des ${INDIE_GAMES.length} Meilleures Pépites du Jeu Vidéo Indépendant
          </h2>
          <p style="color: #94a3b8; margin-bottom: 1.5rem; font-size: 1.05rem;">
            Explorez notre sélection exhaustive de jeux vidéo indépendants incontournables sur PC et Steam, triés par genres majeurs et styles visuels.
          </p>
          ${catalogHtml}
        </section>

        <!-- Section 4 : Foire Aux Questions (FAQ) -->
        <section id="faq-jeux-independants" style="margin-bottom: 3.5rem;">
          <h2 style="color: #f59e0b; font-size: 1.8rem; margin-bottom: 1rem;">
            💡 Foire Aux Questions : Tout Savoir sur les Jeux Vidéo Indépendants
          </h2>
          ${faqHtml}
        </section>

        <!-- Section 5 : Le Créateur et l'Écosystème -->
        <section style="margin-bottom: 2rem; background: #131a29; border: 1px solid #1e293b; border-radius: 12px; padding: 2rem;">
          <h2 style="color: #10b981; font-size: 1.5rem; margin-top: 0;">
            🦉 À Propos de Hoot Indie Games & Quentin Beaud (Hibouxe)
          </h2>
          <p style="line-height: 1.6; color: #cbd5e1;">
            Conçu avec passion par <strong>Quentin Beaud</strong> (alias <em>Hibouxe</em> sur YouTube et <em>Edsaje</em> sur GitHub), 
            Hoot Indie Games est un projet open-source et communautaire dédié à promouvoir la culture des créateurs indépendants, 
            à sauvegarder le patrimoine vidéoludique rétro (reproduction du <em>Mine Storm</em> Vectrex 1982) et à offrir des outils ludiques modernes aux joueurs du monde entier.
          </p>
          <p style="margin-bottom: 0;">
            Retrouvez les vidéos et essais narratifs sur la chaîne YouTube 
            <a href="https://youtube.com/@Hibouxe" target="_blank" rel="noopener noreferrer" style="color: #f59e0b; font-weight: 600;">@Hibouxe</a> 
            et le code source officiel sur <a href="https://github.com/Edsaje/hoot-indie-games" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-weight: 600;">GitHub</a>.
          </p>
        </section>
      </main>

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
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary SEO Meta Tags -->
    <title>Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants</title>
    <meta name="title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants" />
    <meta name="description" content="Plateforme de référence des jeux vidéo indépendants : catalogue des 94 meilleures pépites indés certifiées (Hollow Knight, Outer Wilds, Celeste, Hades, Balatro), 3 défis quotidiens gratuits (Screenle, Indledle, Linkle), arène 1v1 multijoueur et synchronisation Steam." />
    <meta name="keywords" content="jeux vidéo indépendants, jeux indés, meilleurs jeux indépendants, pépites jeux indés, catalogue jeux indés, screenle, indledle, linkle, devinette jeu vidéo, steam indé, hollow knight, outer wilds, celeste, hades, balatro, jeux indés pixel art, jeux indés pc, quentin beaud, hibouxe, vectrex" />
    <meta name="author" content="Quentin Beaud (Hibouxe)" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

    <!-- Canonical URL & Multilingual Alternates -->
    <link rel="canonical" href="${CANONICAL_DOMAIN}/" />
    <link rel="alternate" hreflang="fr" href="${CANONICAL_DOMAIN}/" />
    <link rel="alternate" hreflang="en" href="${CANONICAL_DOMAIN}/" />
    <link rel="alternate" hreflang="x-default" href="${CANONICAL_DOMAIN}/" />

    <!-- Open Graph / Facebook / Discord -->
    <meta property="og:site_name" content="Hoot Indie Games" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${CANONICAL_DOMAIN}/" />
    <meta property="og:title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants" />
    <meta property="og:description" content="Catalogue de 94 pépites du jeu vidéo indépendant, 3 défis quotidiens gratuits (Screenle, Indledle, Linkle), arène 1v1 en temps réel et salle d'arcade rétro." />
    <meta property="og:image" content="${CANONICAL_DOMAIN}/og-banner.png" />
    <meta property="og:image:secure_url" content="${CANONICAL_DOMAIN}/og-banner.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:locale:alternate" content="en_US" />

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@Hibouxe" />
    <meta name="twitter:creator" content="@Hibouxe" />
    <meta name="twitter:title" content="Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants" />
    <meta name="twitter:description" content="Catalogue certifié de 94 pépites indés, 3 défis quotidiens, arène Versus 1v1 en direct et salle d'arcade rétro." />
    <meta name="twitter:image" content="${CANONICAL_DOMAIN}/og-banner.png" />
    <meta name="twitter:image:alt" content="Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants" />

    <!-- Mobile & PWA Theme -->
    <meta name="theme-color" content="#0b0f19" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

    <!-- Structured Data (JSON-LD Schema.org) -->
    <script type="application/ld+json">
${JSON.stringify(jsonLdGraph, null, 2)}
    </script>
  </head>
  <body class="bg-[#0b0f19] text-slate-100 antialiased">
    <noscript>
      <div style="max-width: 800px; margin: 2rem auto; padding: 2rem; background: #131a29; border: 1px solid #f59e0b; border-radius: 12px; color: #e2e8f0; font-family: sans-serif; line-height: 1.6;">
        <h1 style="color: #f59e0b; font-size: 1.8rem; margin-top: 0;">🦉 Hoot Indie Games — Le Sanctuaire des Jeux Vidéo Indépendants</h1>
        <p>Bienvenue sur <strong>Hoot Indie Games</strong>, la plateforme consacrée aux pépites du jeu vidéo indépendant.</p>
        <p>Explorez notre catalogue certifié de ${INDIE_GAMES.length} jeux indépendants et nos défis quotidiens gratuits (Screenle, Indledle, Linkle).</p>
        <p style="color: #94a3b8; font-size: 0.9rem;">Pour lancer les jeux interactifs, veuillez activer JavaScript dans votre navigateur.</p>
      </div>
    </noscript>
    <div id="root">${rootPrerenderContent}</div>
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
  console.log(`✅ index.html mis à jour avec succès avec les ${INDIE_GAMES.length} pépites certifiées, le schéma JSON-LD (FAQPage + ItemList) et le contenu sémantique pré-rendu !`);
}
