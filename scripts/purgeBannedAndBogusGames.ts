import fs from 'fs';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'public/data/steam_catalog.json');
const CACHE_PATH = path.join(process.cwd(), 'scripts/steam_cache.json');
const STORE_CACHE_PATH = path.join(process.cwd(), 'scripts/steam_store_cache.json');
const STORE_DATA_FILE = path.join(process.cwd(), 'src/data/steamStoreData.ts');
const AUDIT_RULES_PATH = path.join(process.cwd(), 'scripts/auditRules.ts');

export const BANNED_ADULT_AND_BOGUS_IDS = new Set<number>([
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

// Vraies données Steam certifiées pour les jeux légitimes ayant de vrais avis
const VERIFIED_STEAM_REVIEWS_UPDATES: Record<number, {
  totalReviews: number;
  totalPositive: number;
  positivePercent: number;
  reviewScoreDesc: { fr: string; en: string };
}> = {
  3048840: {
    totalReviews: 213,
    totalPositive: 210,
    positivePercent: 99,
    reviewScoreDesc: { fr: 'Très positifs', en: 'Very Positive' },
  },
  4024440: {
    totalReviews: 50,
    totalPositive: 49,
    positivePercent: 98,
    reviewScoreDesc: { fr: 'Très positifs', en: 'Very Positive' },
  },
  3859210: {
    totalReviews: 23,
    totalPositive: 23,
    positivePercent: 100,
    reviewScoreDesc: { fr: 'Très positifs', en: 'Very Positive' },
  },
  4773180: {
    totalReviews: 11,
    totalPositive: 11,
    positivePercent: 100,
    reviewScoreDesc: { fr: 'Positifs', en: 'Positive' },
  },
};

function main() {
  console.log('🧹 Purge définitive des jeux interdits (NSFW, sexuel, porno) et des entrées factices (0 avis)...');

  // 1. Nettoyage de public/data/steam_catalog.json
  const rawCatalog: any[] = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  console.log(`📦 Catalogue initial : ${rawCatalog.length} jeux`);

  const purgedCatalog: any[] = [];
  let purgedCount = 0;

  for (const game of rawCatalog) {
    const appId = game.steamAppId;
    if (BANNED_ADULT_AND_BOGUS_IDS.has(appId)) {
      console.log(`  🗑️ Supprimé [${appId}] "${game.title}" (Interdit / Factice)`);
      purgedCount++;
      continue;
    }

    // Si le jeu a 0 avis sur Steam et n'est pas dans les exceptions, on l'écarte
    if (game.steamStoreData?.totalReviews === 0 && !VERIFIED_STEAM_REVIEWS_UPDATES[appId]) {
      console.log(`  🗑️ Supprimé [${appId}] "${game.title}" (0 avis Steam)`);
      purgedCount++;
      continue;
    }

    // Mise à jour des avis certifiés Valve
    if (VERIFIED_STEAM_REVIEWS_UPDATES[appId]) {
      const update = VERIFIED_STEAM_REVIEWS_UPDATES[appId];
      game.steamStoreData = {
        ...game.steamStoreData,
        ...update,
      };
      console.log(`  ✨ Avis Steam certifiés mis à jour pour [${appId}] "${game.title}" : ${update.positivePercent}% (${update.totalReviews} avis)`);
    }

    purgedCatalog.push(game);
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(purgedCatalog, null, 2));
  console.log(`✅ Catalogue assaini sauvegardé : ${purgedCatalog.length} jeux restants (-${purgedCount} supprimés).`);

  // 2. Nettoyage du cache steam_cache.json
  if (fs.existsSync(CACHE_PATH)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    let cachePurged = 0;
    for (const idStr of Object.keys(cache)) {
      const id = parseInt(idStr, 10);
      if (BANNED_ADULT_AND_BOGUS_IDS.has(id)) {
        delete cache[idStr];
        cachePurged++;
      }
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    console.log(`✅ Cache steam_cache.json assaini (-${cachePurged} entrées supprimées).`);
  }

  // 3. Nettoyage de steam_store_cache.json
  if (fs.existsSync(STORE_CACHE_PATH)) {
    const storeCache = JSON.parse(fs.readFileSync(STORE_CACHE_PATH, 'utf-8'));
    let storePurged = 0;
    for (const idStr of Object.keys(storeCache)) {
      const id = parseInt(idStr, 10);
      if (BANNED_ADULT_AND_BOGUS_IDS.has(id)) {
        delete storeCache[idStr];
        storePurged++;
      } else if (VERIFIED_STEAM_REVIEWS_UPDATES[id]) {
        storeCache[idStr] = {
          ...storeCache[idStr],
          ...VERIFIED_STEAM_REVIEWS_UPDATES[id],
        };
      }
    }
    fs.writeFileSync(STORE_CACHE_PATH, JSON.stringify(storeCache, null, 2));
    console.log(`✅ Cache steam_store_cache.json assaini (-${storePurged} entrées supprimées).`);
  }

  // 4. Régénération de src/data/steamStoreData.ts
  if (fs.existsSync(STORE_CACHE_PATH)) {
    const storeCache = JSON.parse(fs.readFileSync(STORE_CACHE_PATH, 'utf-8'));
    const tsCode = `import type { Game } from '../types/game';

export interface SteamStoreGameData {
  appId: number;
  isFree: boolean;
  currency: string;
  initialPriceCents: number;
  finalPriceCents: number;
  discountPercent: number;
  formattedFinalPrice: string;
  formattedInitialPrice?: string;
  totalReviews: number;
  totalPositive: number;
  positivePercent: number;
  reviewScoreDesc: {
    fr: string;
    en: string;
  };
}

export const STEAM_STORE_DATA: Record<number, SteamStoreGameData> = ${JSON.stringify(storeCache, null, 2)};

export function getSteamStoreData(appId?: string | number): SteamStoreGameData | null {
  if (!appId) return null;
  const numId = typeof appId === 'string' ? parseInt(appId, 10) : appId;
  if (isNaN(numId)) return null;
  return STEAM_STORE_DATA[numId] || null;
}
`;
    fs.writeFileSync(STORE_DATA_FILE, tsCode);
    console.log(`✅ src/data/steamStoreData.ts régénéré avec succès.`);
  }

  console.log(`🎉 Purge et assainissement complets terminés ! Nouveau total de jeux certifiés : ${purgedCatalog.length}`);
}

main();
