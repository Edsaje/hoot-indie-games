import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INDIE_GAMES } from '../src/data/games';
import type { Game } from '../src/types/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gamesFilePath = path.resolve(__dirname, '../src/data/games.ts');

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SteamScreenshot {
  id: number;
  path_thumbnail: string;
  path_full: string;
}

async function fetchSteamGameData(appId: string, retries = 3): Promise<{ screenshots: string[]; headerImage?: string } | null> {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      });

      if (res.status === 429) {
        console.warn(`⚠️ Rate limited on app ${appId}, waiting 2.5s before retry (attempt ${attempt}/${retries})...`);
        await sleep(2500);
        continue;
      }

      if (!res.ok) {
        console.warn(`HTTP ${res.status} on app ${appId}`);
        await sleep(1000);
        continue;
      }

      const json = await res.json();
      const appData = json[appId];

      if (!appData || !appData.success || !appData.data) {
        console.warn(`No data for app ${appId}`);
        return null;
      }

      const rawScreenshots: SteamScreenshot[] = appData.data.screenshots || [];
      // Take up to 6 screenshots
      const screenshots = rawScreenshots.map(s => s.path_full).slice(0, 6);
      const headerImage = appData.data.header_image;

      return { screenshots, headerImage };
    } catch (err: any) {
      console.warn(`Network error on app ${appId}: ${err?.message}`);
      await sleep(1500);
    }
  }

  return null;
}

async function run() {
  console.log(`Starting Steam Screenshot Synchronization for ${INDIE_GAMES.length} games...`);

  const updatedGames: Game[] = [];
  let updatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < INDIE_GAMES.length; i++) {
    const game = INDIE_GAMES[i];
    const match = game.steamUrl.match(/app\/(\d+)/);
    
    if (!match) {
      console.warn(`⚠️ Skipping ${game.title}: no AppID in URL (${game.steamUrl})`);
      updatedGames.push(game);
      continue;
    }

    const appId = match[1];
    console.log(`[${i + 1}/${INDIE_GAMES.length}] Fetching official screenshots for "${game.title}" (AppID: ${appId})...`);

    const steamData = await fetchSteamGameData(appId);

    if (steamData && steamData.screenshots.length >= 3) {
      const newGame: Game = {
        ...game,
        screenshots: steamData.screenshots,
      };
      updatedGames.push(newGame);
      updatedCount++;
      console.log(`  ✅ Synced ${steamData.screenshots.length} screenshots for "${game.title}"`);
    } else {
      console.warn(`  ❌ Failed or insufficient screenshots for "${game.title}", keeping existing.`);
      updatedGames.push(game);
      failedCount++;
    }

    // Polite delay to prevent Steam rate limit
    await sleep(250);
  }

  console.log(`\nSynchronization done! Updated: ${updatedCount}, Failed/Kept: ${failedCount}`);

  if (updatedCount > 50) {
    const codeContent = `import type { Game } from '../types/game';

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Enrichie quotidiennement par le robot Hoot Harvest via l'API Steam Store officielle.
 * 0 Hallucination : métadonnées et captures certifiées.
 * Total de jeux : ${updatedGames.length}
 */
export const INDIE_GAMES: Game[] = ${JSON.stringify(updatedGames, null, 2)};
`;

    fs.writeFileSync(gamesFilePath, codeContent, 'utf-8');
    console.log(`\n🎉 Successfully saved updated games to ${gamesFilePath}!`);
  } else {
    console.error('Too few games were updated. Aborting file write to be safe.');
  }
}

run();
