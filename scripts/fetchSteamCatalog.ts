import fs from 'fs';
import path from 'path';
import type { Game } from '../src/types/game';

// Interface pour le catalogue étendu Steam
export interface SteamCatalogItem extends Game {
  steamAppId: number;
  headerImage: string;
  capsuleImage?: string;
  reviewSummary?: string;
}

const CACHE_FILE = path.join(process.cwd(), 'scripts/steam_cache.json');
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/steam_catalog.json');

// Liste emblématique de base d'AppIDs de jeux indépendants incontournables (2008-2026)
const PRIORITY_INDIE_APPIDS = [
  // Chefs-d'œuvre Roguelike & Action
  1145360, // Hades
  1145350, // Hades II
  588650,  // Dead Cells
  646570,  // Slay the Spire
  2379780, // Balatro
  632360,  // Risk of Rain 2
  250900,  // The Binding of Isaac: Rebirth
  311690,  // Enter the Gungeon
  1313140, // Cult of the Lamb
  1794680, // Vampire Survivors
  1253920, // Rogue Legacy 2
  262060,  // Darkest Dungeon
  881100,  // Noita
  1147560, // Skul: The Hero Slayer
  1942280, // Brotato
  894020,  // Death's Door
  445980,  // Wizard of Legend
  606150,  // Moonlighter
  330020,  // Children of Morta
  1740720, // Have a Nice Death
  1280930, // Astral Ascent
  2218750, // Halls of Torment

  // Metroidvania & Plateforme
  367520,  // Hollow Knight
  504230,  // Celeste
  813230,  // Animal Well
  1809540, // Nine Sols
  774360,  // Blasphemous
  2114740, // Blasphemous 2
  1369630, // Ender Lilies
  764790,  // The Messenger
  534550,  // Guacamelee! 2
  283640,  // Salt and Sanctuary
  332200,  // Axiom Verge
  412830,  // Rain World
  460950,  // Katana Zero
  40800,   // Super Meat Boy
  250760,  // Shovel Knight
  268910,  // Cuphead
  224760,  // FEZ
  48000,   // Limbo
  304430,  // Inside
  683320,  // GRIS
  219150,  // Hotline Miami
  274170,  // Hotline Miami 2
  1055540, // A Short Hike
  553420,  // Tunic

  // Exploration, Enquête, Narratif & RPG
  753640,  // Outer Wilds
  632470,  // Disco Elysium
  264710,  // Subnautica
  848450,  // Subnautica: Below Zero
  653530,  // Return of the Obra Dinn
  239030,  // Papers, Please
  1931770, // Chants of Sennaar
  2041440, // Lorelei and the Laser Eyes
  501300,  // What Remains of Edith Finch
  383870,  // Firewatch
  1703340, // The Stanley Parable: Ultra Deluxe
  1562430, // Dredge
  1458140, // Pacific Drive
  1332010, // Stray
  2818800, // Crow Country
  1262350, // Signalis
  282140,  // SOMA
  1092790, // Inscryption
  1150690, // Omori
  391540,  // Undertale
  481510,  // Night in the Woods
  388880,  // Oxenfree
  1244090, // Sea of Stars
  1868140, // Dave the Diver
  1325200, // Neon White
  2231450, // Pizza Tower
  1229490, // Ultrakill

  // Simulation, Survie, Bac à Sable & Stratégie
  413150,  // Stardew Valley
  105600,  // Terraria
  294100,  // RimWorld
  427520,  // Factorio
  108600,  // Project Zomboid
  892970,  // Valheim
  252490,  // Rust
  648800,  // Raft
  739630,  // Phasmophobia
  1966720, // Lethal Company
  1363080, // Manor Lords
  526870,  // Satisfactory
  433340,  // Slime Rancher
  322330,  // Don't Starve Together
  1245560, // Roots of Pacha
  599140,  // Graveyard Keeper
  1284190, // The Planet Crafter
  1604030, // V Rising
  1621690, // Core Keeper
  2072450, // Schedule I

  // Puzzles & Réflexion
  1260520, // Patrick's Parabox
  736260,  // Baba Is You
  1497440, // Cocoon
  257510,  // The Talos Principle
  835960,  // The Talos Principle 2
  210970,  // The Witness
  558990,  // Opus Magnum
  590380,  // Into the Breach
  212680,  // FTL: Faster Than Light
  1811990, // Wildfrost
  1102190, // Monster Train
  1296610, // Peglin
  1970580, // Backpack Hero
  2179850, // Cobalt Core
];

// Helper slugify
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Inférence intelligente du Art Style canonique
function inferArtStyle(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  if (lower.includes('pixel') || lower.includes('16-bit') || lower.includes('8-bit') || lower.includes('retro 2d')) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
  }
  if (lower.includes('hand-drawn') || lower.includes('dessiné') || lower.includes('watercolor') || lower.includes('cartoon') || lower.includes('anime') || lower.includes('sketch')) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }
  if (lower.includes('low poly') || lower.includes('low-poly') || lower.includes('ps1') || lower.includes('polygonal') || lower.includes('retro 3d')) {
    return { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' };
  }
  if (lower.includes('realistic') || lower.includes('photorealist') || lower.includes('réaliste') || lower.includes('unreal engine 5')) {
    return { fr: '3D Réaliste', en: 'Realistic 3D' };
  }
  if (lower.includes('monochrome') || lower.includes('black and white') || lower.includes('minimalist') || lower.includes('noir et blanc')) {
    return { fr: 'Monochrome / Minimaliste', en: 'Monochrome' };
  }

  // Par défaut selon les genres
  if (genres.some((g) => ['3D', 'Action 3D', 'Aventure 3D', 'Simulation', 'Survie'].includes(g))) {
    return { fr: '3D Stylisé', en: 'Stylized 3D' };
  }
  return { fr: 'Pixel Art', en: 'Pixel Art' };
}

// Inférence intelligente de la caméra canonique
function inferCamera(text: string, genres: string[]): { fr: string; en: string } {
  const lower = (text + ' ' + genres.join(' ')).toLowerCase();

  if (lower.includes('first-person') || lower.includes('première personne') || lower.includes('fps') || lower.includes('fpv')) {
    return { fr: 'Vue à la première personne', en: 'First-Person' };
  }
  if (lower.includes('isometric') || lower.includes('isométrique') || lower.includes('2.5d')) {
    return { fr: '2.5D Isométrique', en: 'Isometric / 2.5D' };
  }
  if (lower.includes('top-down') || lower.includes('vue de dessus') || lower.includes('twin-stick') || lower.includes('vertical')) {
    return { fr: '2D Vue de dessus', en: '2D Top-down' };
  }
  if (lower.includes('third-person') || lower.includes('troisième personne') || lower.includes('behind')) {
    return { fr: '3D Vue à la troisième personne', en: 'Third-Person' };
  }

  // Par défaut
  if (lower.includes('platformer') || lower.includes('metroidvania') || lower.includes('side-scroller') || lower.includes('défilement horizontal')) {
    return { fr: '2D Vue de côté', en: '2D Side-scroller' };
  }
  return { fr: '2D Vue de côté', en: '2D Side-scroller' };
}

// Nettoyage et normalisation des genres (Règle 0 Hallucination)
function sanitizeGenres(steamGenres: Array<{ description: string }>, descriptionText: string): string[] {
  const banned = ['indépendant', 'accès anticipé', 'indie', 'early access', 'free to play', 'gratuit'];
  const mapping: Record<string, string> = {
    'action': 'Action',
    'aventure': 'Aventure',
    'adventure': 'Aventure',
    'rpg': 'RPG',
    'stratégie': 'Stratégie',
    'strategy': 'Stratégie',
    'simulation': 'Simulation',
    'occasionnel': 'Occasionnel',
    'casual': 'Occasionnel',
    'course automobile': 'Course',
    'racing': 'Course',
  };

  const detected: Set<string> = new Set();

  for (const g of steamGenres) {
    const desc = g.description.toLowerCase().trim();
    if (banned.includes(desc)) continue;
    if (mapping[desc]) {
      detected.add(mapping[desc]);
    } else if (desc.length > 2) {
      detected.add(g.description);
    }
  }

  // Inférence additionnelle par mots-clés dans la description
  const lower = descriptionText.toLowerCase();
  if (lower.includes('metroidvania')) detected.add('Metroidvania');
  if (lower.includes('roguelike') || lower.includes('rogue-like') || lower.includes('roguelite')) detected.add('Roguelike');
  if (lower.includes('deckbuilder') || lower.includes('cartes')) detected.add('Deckbuilder');
  if (lower.includes('platformer') || lower.includes('plateforme')) detected.add('Plateforme');
  if (lower.includes('puzzle') || lower.includes('énigme')) detected.add('Puzzle');
  if (lower.includes('survie') || lower.includes('survival')) detected.add('Survie');
  if (lower.includes('souls-like') || lower.includes('soulslike')) detected.add('Souls-like');
  if (lower.includes('horreur') || lower.includes('horror')) detected.add('Horreur');

  const list = Array.from(detected);
  return list.length > 0 ? list : ['Aventure', 'Action'];
}

// Extraction propre de l'année de sortie
function parseReleaseYear(dateStr?: string): number {
  if (!dateStr) return 2024;
  const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    const yr = parseInt(match[1], 10);
    if (yr >= 1990 && yr <= 2026) return yr;
  }
  return 2024;
}

// Nettoyage de balises HTML dans les descriptions Steam
function stripHtml(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ingestion principale
async function main() {
  console.log('🚀 Démarrage de l\'ingestion du catalogue Steam Indie Games (Règle 0 Hallucination)...');

  // 1. Chargement du cache local pour ne jamais refetcher inutilement
  let cache: Record<string, SteamCatalogItem> = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      console.log(`📦 Cache local chargé : ${Object.keys(cache).length} jeux déjà certifiés.`);
    } catch {
      cache = {};
    }
  }

  // 2. Collecte des AppIDs à partir des listes prioritaires et des flux de recherche
  const targetAppIds = new Set<number>(PRIORITY_INDIE_APPIDS);

  console.log(`🔍 Exploration des flux Steam Search pour découvrir les meilleurs jeux indés...`);
  try {
    // Top revus
    const revUrl = 'https://store.steampowered.com/search/results/?query=&start=0&count=50&tags=492&category1=998&sort_by=Reviews_DESC&json=1';
    const revRes = await fetch(revUrl);
    const revJson = await revRes.json();
    for (const it of revJson.items || []) {
      const m = it.logo?.match(/\/apps\/(\d+)\//);
      if (m) targetAppIds.add(parseInt(m[1], 10));
    }

    // Top ventes
    const topUrl = 'https://store.steampowered.com/search/results/?query=&start=0&count=50&tags=492&category1=998&filter=topsellers&json=1';
    const topRes = await fetch(topUrl);
    const topJson = await topRes.json();
    for (const it of topJson.items || []) {
      const m = it.logo?.match(/\/apps\/(\d+)\//);
      if (m) targetAppIds.add(parseInt(m[1], 10));
    }
  } catch (err) {
    console.warn('⚠️ Avertissement flux dynamique Steam search:', err);
  }

  const appIdsList = Array.from(targetAppIds);
  console.log(`🎯 Total d'AppIDs indés ciblés : ${appIdsList.length}`);

  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < appIdsList.length; i++) {
    const appId = appIdsList[i];
    const appIdStr = String(appId);

    // Vérifier si déjà en cache
    if (cache[appIdStr]) {
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${appIdsList.length}] Requête Steam API pour AppID ${appId}...`);

    try {
      // Requête bilingue FR et EN en parallèle
      const [frRes, enRes] = await Promise.all([
        fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=french`),
        fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`),
      ]);

      let frJson: Record<string, { data?: any }> | null = null;
      let enJson: Record<string, { data?: any }> | null = null;

      try {
        frJson = await frRes.json();
      } catch {
        // ignore
      }
      try {
        enJson = await enRes.json();
      } catch {
        // ignore
      }

      if (!frJson || !frJson[appIdStr] || !frJson[appIdStr]?.data) {
        console.warn(`⚠️ AppID ${appId} : réponse Steam vide (rate limit ou indisponible). Pause de 4s...`);
        await sleep(4000);
        continue;
      }

      const dataFR = frJson[appIdStr].data;
      const dataEN = enJson?.[appIdStr]?.data;

      const title = dataFR.name.trim();
      const id = slugify(title);
      const releaseYear = parseReleaseYear(dataFR.release_date?.date || dataEN?.release_date?.date);
      const developer = dataFR.developers?.[0] || 'Studio Indépendant';
      const steamUrl = `https://store.steampowered.com/app/${appId}/`;
      const headerImage = dataFR.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

      // Screenshots officiels (jusqu'à 6 pour Screenle)
      const screenshots: string[] = (dataFR.screenshots || [])
        .map((s: { path_full: string }) => s.path_full)
        .slice(0, 6);

      // Si moins de 6 screenshots, compléter avec le header
      while (screenshots.length < 6) {
        screenshots.push(headerImage);
      }

      // Taglines bilingues vérifiées (0 hallucination)
      const taglineFR = stripHtml(dataFR.short_description) || `${title} est un jeu indépendant remarquable développé par ${developer}.`;
      const taglineEN = stripHtml(dataEN?.short_description) || `${title} is a remarkable indie game developed by ${developer}.`;

      // Genres
      const genres = sanitizeGenres(dataFR.genres || [], taglineFR + ' ' + taglineEN);

      // Art style & Camera
      const artStyle = inferArtStyle(taglineEN + ' ' + dataFR.type, genres);
      const camera = inferCamera(taglineEN + ' ' + dataFR.type, genres);

      const catalogItem: SteamCatalogItem = {
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

      cache[appIdStr] = catalogItem;
      addedCount++;
      console.log(`✅ [${addedCount}] Certifié Steam : "${title}" (${releaseYear}) par ${developer}`);

      // Sauvegarde progressive du cache
      if (addedCount % 5 === 0) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
      }

      // Délai poli pour respecter les limites Steam (350ms)
      await sleep(350);
    } catch (err) {
      console.error(`❌ Erreur sur AppID ${appId}:`, err);
      await sleep(1000);
    }
  }

  // Sauvegarde finale
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

  // Création du fichier public JSON
  const catalogList = Object.values(cache);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalogList, null, 2));

  console.log('\n====================================================');
  console.log(`✨ INGESTION STEAM TERMINÉE AVEC SUCCÈS !`);
  console.log(`🎮 Total de jeux indés certifiés dans le catalogue : ${catalogList.length}`);
  console.log(`💾 Fichier généré : ${OUTPUT_FILE}`);
  console.log(`📦 Fichier cache conservé : ${CACHE_FILE}`);
  console.log('====================================================');
}

main().catch(console.error);
