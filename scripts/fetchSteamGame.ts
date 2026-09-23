/**
 * Script utilitaire de moissonnage Steam Store API
 * Utilisation : npx tsx scripts/fetchSteamGame.ts <STEAM_APP_ID>
 * Exemple : npx tsx scripts/fetchSteamGame.ts 1809540 (Nine Sols)
 */

interface SteamApiResponse {
  [appId: string]: {
    success: boolean;
    data?: {
      name: string;
      steam_appid: number;
      short_description: string;
      header_image: string;
      developers: string[];
      release_date: {
        date: string;
      };
      genres: { id: string; description: string }[];
      screenshots: { id: number; path_full: string; path_thumbnail: string }[];
    };
  };
}

async function fetchGameFromSteam(appId: string) {
  console.log(`🦉 Moissonnage des métadonnées Steam pour l'AppId : ${appId}...`);

  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=french`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const json = (await res.json()) as SteamApiResponse;
    const appData = json[appId];

    if (!appData || !appData.success || !appData.data) {
      console.error(`❌ Impossible de trouver l'application ${appId} sur Steam.`);
      return;
    }

    const d = appData.data;
    const yearMatch = d.release_date.date.match(/\d{4}/);
    const releaseYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

    const formattedGame = {
      id: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: d.name,
      releaseYear,
      genre: d.genres.map((g) => g.description),
      artStyle: {
        fr: 'Style graphique à préciser',
        en: 'Art style to specify',
      },
      camera: {
        fr: 'Perspective à préciser (ex: Vue de côté 2D / Vue Isométrique 3D / Première personne)',
        en: 'Camera to specify',
      },
      developer: d.developers.join(', '),
      steamUrl: `https://store.steampowered.com/app/${d.steam_appid}/`,
      screenshots: d.screenshots.slice(0, 6).map((s) => s.path_full),
      hints: {
        tagline: {
          fr: d.short_description,
          en: d.short_description,
        },
        composer: 'Compositeur à préciser',
      },
    };

    console.log('\n✅ Données récupérées avec succès ! Voici le modèle typé à insérer dans src/data/games.ts :\n');
    console.log(JSON.stringify(formattedGame, null, 2));
  } catch (err) {
    console.error('❌ Erreur lors du fetch Steam :', err);
  }
}

const targetAppId = process.argv[2];
if (!targetAppId) {
  console.log('Usage: npx tsx scripts/fetchSteamGame.ts <appId>');
  console.log('Exemple: npx tsx scripts/fetchSteamGame.ts 1809540');
} else {
  fetchGameFromSteam(targetAppId);
}
