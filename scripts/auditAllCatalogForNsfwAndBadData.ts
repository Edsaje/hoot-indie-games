import fs from 'fs';
import path from 'path';

interface GameItem {
  id: string;
  title: string;
  steamAppId: number;
  steamUrl: string;
  developer?: string;
  hints?: {
    tagline?: { fr?: string; en?: string };
    composer?: string;
  };
  steamStoreData?: {
    totalReviews?: number;
    totalPositive?: number;
    positivePercent?: number;
    reviewScoreDesc?: { fr?: string; en?: string };
  };
}

const CATALOG_PATH = path.join(process.cwd(), 'public/data/steam_catalog.json');
const CACHE_PATH = path.join(process.cwd(), 'scripts/steam_descriptors_cache.json');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchDescriptorsWithRetry(appId: number, retries = 5): Promise<any> {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=content_descriptors`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HootIndieGamesAuditor/1.0',
        },
      });

      if (res.status === 429) {
        const wait = 15000 + attempt * 5000;
        console.warn(`⏳ [Rate Limit 429] Pause de ${wait / 1000}s pour AppID ${appId}...`);
        await sleep(wait);
        continue;
      }

      if (res.ok) {
        const json = await res.json();
        return json?.[String(appId)]?.data?.content_descriptors || null;
      }
    } catch {
      await sleep(1000 * attempt);
    }
  }
  return null;
}

async function main() {
  console.log('🔍 Démarrage de l\'audit exhaustif Anti-NSFW et Intégrité des avis Steam...');

  const catalog: GameItem[] = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  console.log(`📊 Total jeux dans le catalogue : ${catalog.length}`);

  let cache: Record<string, any> = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    } catch {
      cache = {};
    }
  }

  console.log(`📦 Cache de descripteurs existant : ${Object.keys(cache).length} entrées.`);

  // 1. Récupération des descripteurs Steam
  const toFetch = catalog.filter((g) => !cache[String(g.steamAppId)]);
  console.log(`🌐 Fiches à récupérer auprès de Valve : ${toFetch.length}`);

  const BATCH_SIZE = 8;
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (g) => {
        const desc = await fetchDescriptorsWithRetry(g.steamAppId);
        cache[String(g.steamAppId)] = desc || { ids: [], notes: '' };
      })
    );

    if ((i + BATCH_SIZE) % 80 === 0 || i + BATCH_SIZE >= toFetch.length) {
      console.log(`   ⏳ Progression : ${Math.min(i + BATCH_SIZE, toFetch.length)} / ${toFetch.length}...`);
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    }
    await sleep(250);
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  // 2. Détection des jeux interdits / NSFW
  const nsfwGames: Array<{ game: GameItem; reason: string }> = [];
  const zeroReviewGames: Array<{ game: GameItem; reason: string }> = [];
  const lowRatingGames: Array<{ game: GameItem; reason: string }> = [];

  const KNOWN_SAFE_APP_IDS = new Set([
    252490,  // Rust (nudity toggle in survival)
    304650,  // Sunless Sea (textual romance)
    251470,  // TowerFall Ascension
    447530,  // VA-11 Hall-A
    1229490, // ULTRAKILL
    1061910, // Metal: Hellsinger
    1481400, // Dagon: by H. P. Lovecraft
  ]);

  const ADULT_KEYWORDS = [
    'hentai', 'porn', 'porno', 'nsfw', 'erotic', 'erotica', 'érotique',
    'sexual content', 'contenu sexuel', 'adult only', 'nudité explicite',
    'explicit nudity', 'eroge', 'ecchi', 'waifu', 'fée démoniaque',
    'dating sim', 'male dragon', 'sensual', 'concubine', 'harem'
  ];

  for (const game of catalog) {
    const appIdStr = String(game.steamAppId);
    const desc = cache[appIdStr];
    const ids: number[] = desc?.ids || [];
    const notes: string = (desc?.notes || '').toLowerCase();

    // Check descriptors
    if (!KNOWN_SAFE_APP_IDS.has(game.steamAppId)) {
      // ID 5 = Adult Only Sexual Content
      // ID 4 = Sexual Content / Frequent Nudity
      // ID 3 = Adult / Erotic Content
      if (ids.includes(5)) {
        nsfwGames.push({ game, reason: `Valve Content Descriptor 5 (Adult Only Sexual Content) - notes: "${desc?.notes}"` });
        continue;
      }
      if (ids.includes(4)) {
        nsfwGames.push({ game, reason: `Valve Content Descriptor 4 (Sexual Content) - notes: "${desc?.notes}"` });
        continue;
      }
      if (ids.includes(3) && (notes.includes('sexual') || notes.includes('nudity') || notes.includes('adult'))) {
        nsfwGames.push({ game, reason: `Valve Content Descriptor 3 (Mature Sexual) - notes: "${desc?.notes}"` });
        continue;
      }
      if ((ids.includes(1) || ids.includes(2)) && (notes.includes('nudity') || notes.includes('sexual') || notes.includes('suggestive') || notes.includes('adult'))) {
        nsfwGames.push({ game, reason: `Valve Content Descriptor ${ids.join(',')} avec notes adultes: "${desc?.notes}"` });
        continue;
      }

      // Check text for explicit adult keywords
      const fullText = [
        game.title,
        game.developer,
        game.hints?.tagline?.fr,
        game.hints?.tagline?.en,
        notes,
      ].join(' ').toLowerCase();

      for (const kw of ADULT_KEYWORDS) {
        if (new RegExp(`\\b${kw}\\b`, 'i').test(fullText) || fullText.includes(kw)) {
          // Exceptions pour des termes innocents
          if (kw === 'dating sim' && game.title.includes('Monster Prom')) continue;
          nsfwGames.push({ game, reason: `Mot-clé adulte interdit détecté : "${kw}"` });
          break;
        }
      }
    }

    // Check review integrity
    const reviews = game.steamStoreData?.totalReviews ?? 0;
    const posPercent = game.steamStoreData?.positivePercent ?? 0;

    if (reviews === 0) {
      zeroReviewGames.push({ game, reason: `0 avis Steam mais marqué à ${posPercent}%` });
    } else if (posPercent < 45) {
      lowRatingGames.push({ game, reason: `Note inférieure à 45% (${posPercent}%)` });
    } else if (game.title.toLowerCase().includes('playtest')) {
      zeroReviewGames.push({ game, reason: `Entrée de Playtest ("${game.title}") non finale` });
    }
  }

  console.log('\n=========================================');
  console.log(`🚨 JEUX ADULTES / NSFW DÉTECTÉS : ${nsfwGames.length}`);
  nsfwGames.forEach(({ game, reason }) => {
    console.log(`  ❌ [${game.steamAppId}] "${game.title}" -> ${reason}`);
  });

  console.log('\n=========================================');
  console.log(`⚠️ JEUX AVEC 0 AVIS / FAKE STATS : ${zeroReviewGames.length}`);
  zeroReviewGames.forEach(({ game, reason }) => {
    console.log(`  ⚠️ [${game.steamAppId}] "${game.title}" -> ${reason}`);
  });

  console.log('\n=========================================');
  console.log(`📉 JEUX AVEC NOTE < 45% : ${lowRatingGames.length}`);
  lowRatingGames.forEach(({ game, reason }) => {
    console.log(`  📉 [${game.steamAppId}] "${game.title}" -> ${reason}`);
  });

  // Sauvegarde du rapport pour inspection
  fs.writeFileSync('scripts/audit_nsfw_report.json', JSON.stringify({
    nsfwGames: nsfwGames.map(x => ({ id: x.game.steamAppId, title: x.game.title, reason: x.reason })),
    zeroReviewGames: zeroReviewGames.map(x => ({ id: x.game.steamAppId, title: x.game.title, reason: x.reason })),
    lowRatingGames: lowRatingGames.map(x => ({ id: x.game.steamAppId, title: x.game.title, reason: x.reason })),
  }, null, 2));
}

main().catch(console.error);
