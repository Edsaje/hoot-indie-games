/**
 * Moissonne les titres 2024 / 2025 / 2026 pour mettre à jour la base de données
 */
interface GameSeed {
  appId: number;
  id: string;
  artStyle: { fr: string; en: string };
  camera: { fr: string; en: string };
  composer?: string;
  forcedYear?: number;
}

const SEEDS: GameSeed[] = [
  {
    appId: 1145350,
    id: 'hades-ii',
    artStyle: { fr: 'Dessin 2D isométrique mythologique peint à la main', en: 'Hand-painted mythological 2D isometric art' },
    camera: { fr: 'Vue Isométrique 2.5D (Isometric)', en: '2.5D Isometric' },
    composer: 'Darren Korb',
    forcedYear: 2025,
  },
  {
    appId: 2420660,
    id: 'neva',
    artStyle: { fr: 'Aquarelle numérique et aplats vectoriels poétiques', en: 'Poetic digital watercolor & clean vector art' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Berlinist',
    forcedYear: 2024,
  },
  {
    appId: 2475490,
    id: 'mouthwashing',
    artStyle: { fr: 'Rétro 3D low-poly PlayStation 1 / Dégradés sombres', en: 'PS1 style low-poly retro 3D' },
    camera: { fr: 'Première personne 3D (First-person)', en: 'First-person 3D' },
    composer: 'Martin Kvale',
    forcedYear: 2024,
  },
  {
    appId: 1043810,
    id: 'tactical-breach-wizards',
    artStyle: { fr: '3D Cel-shaded humoristique et bande dessinée', en: 'Comic-book cel-shaded 3D' },
    camera: { fr: 'Vue Isométrique tactique (Turn-based)', en: 'Tactical Isometric' },
    composer: 'Suspicious Developments',
    forcedYear: 2024,
  },
  {
    appId: 1675830,
    id: '1000xresist',
    artStyle: { fr: '3D Stylisée anime dystopique / Mise en scène théâtrale', en: 'Dystopian cinematic anime 3D' },
    camera: { fr: 'Troisième personne 3D cinématographique', en: 'Cinematic Third-person 3D' },
    composer: 'Anthony H. Fung',
    forcedYear: 2024,
  },
  {
    appId: 2366970,
    id: 'arco',
    artStyle: { fr: 'Pixel Art miniature sublime et paysages panoramiques', en: 'Breathtaking miniature pixel art' },
    camera: { fr: 'Vue Isométrique du dessus simultanée', en: 'Simultaneous Top-down Isometric' },
    composer: 'José Ramón "Fáyer" García',
    forcedYear: 2024,
  },
  {
    appId: 1621690,
    id: 'core-keeper',
    artStyle: { fr: 'Pixel Art lumineux avec éclairages dynamiques souterrains', en: 'Vibrant underground pixel art with dynamic lighting' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Jonathan Geer',
    forcedYear: 2024,
  },
  {
    appId: 1363080,
    id: 'manor-lords',
    artStyle: { fr: '3D Réaliste historique médiévale ultra-détaillée', en: 'Hyper-detailed realistic medieval 3D' },
    camera: { fr: 'Vue stratégique aérienne & troisième personne (Bird-eye / Third-person)', en: 'Strategic Bird-eye / Third-person' },
    composer: 'Isaac Noss & T中间',
    forcedYear: 2024,
  },
  {
    appId: 2142790,
    id: 'fields-of-mistria',
    artStyle: { fr: 'Pixel Art nostalgique anime des années 90 (Sailor Moon)', en: 'Nostalgic 90s anime-inspired pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Toby Fox & Friends',
    forcedYear: 2024,
  },
  {
    appId: 1885110,
    id: 'cryptmaster',
    artStyle: { fr: 'Monochrome crayonné noir et blanc rétro dungeon crawler', en: 'Monochrome sketchbook dungeon crawler aesthetic' },
    camera: { fr: 'Première personne 3D case par case (Grid-based Dungeon Crawler)', en: 'First-person 3D grid dungeon crawler' },
    composer: 'Paul Hart',
    forcedYear: 2024,
  },
  {
    appId: 2111190,
    id: 'mullet-madjack',
    artStyle: { fr: 'Anime rétro cyberpunk VHS des années 80 / 90', en: '80s/90s retro cyberpunk anime aesthetic' },
    camera: { fr: 'Première personne 3D Boomer Shooter survolté', en: 'First-person 3D Boomer Shooter' },
    composer: 'HAMMER95',
    forcedYear: 2024,
  },
  {
    appId: 1978590,
    id: 'anger-foot',
    artStyle: { fr: '3D Cartoon déjantée, fluo et hyper-saturée', en: 'Hyper-saturated neon cartoon 3D' },
    camera: { fr: 'Première personne 3D fast-FPS', en: 'First-person 3D fast-FPS' },
    composer: 'Free Lives Sound Team',
    forcedYear: 2024,
  },
  {
    appId: 1887400,
    id: 'antonblast',
    artStyle: { fr: 'Pixel Art cartoonesque frénétique style Game Boy Advance / Wario Land', en: 'Frenetic GBA/Wario Land cartoon pixel art' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Tony Grayson',
    forcedYear: 2024,
  },
  {
    appId: 2868840,
    id: 'slay-the-spire-2',
    artStyle: { fr: 'Illustration 2D moderne et sombre redessinée sous Godot', en: 'Modern dark 2D illustration in Godot Engine' },
    camera: { fr: 'Vue de profil 2D de combat tactique', en: '2D Side-view Tactical Battle' },
    composer: 'Clark Aboud',
    forcedYear: 2025,
  },
];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log(`Moissonnage des titres récents (2024-2026) : ${SEEDS.length} jeux...`);
  const results = [];

  for (const seed of SEEDS) {
    try {
      const url = `https://store.steampowered.com/api/appdetails?appids=${seed.appId}&l=french`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const app = data[seed.appId];
      if (!app || !app.success || !app.data) continue;

      const d = app.data;
      const yearMatch = d.release_date.date.match(/\d{4}/);
      const releaseYear = seed.forcedYear || (yearMatch ? parseInt(yearMatch[0], 10) : 2025);

      results.push({
        id: seed.id,
        title: d.name,
        releaseYear,
        genre: d.genres.map((g: { description: string }) => g.description),
        artStyle: seed.artStyle,
        camera: seed.camera,
        developer: d.developers.join(', '),
        steamUrl: `https://store.steampowered.com/app/${d.steam_appid}/`,
        screenshots: d.screenshots.slice(0, 6).map((s: { path_full: string }) => s.path_full),
        hints: {
          tagline: {
            fr: d.short_description,
            en: d.short_description,
          },
          composer: seed.composer || 'Artistes du studio',
        },
      });

      console.log(`✅ ${d.name} (${releaseYear})`);
      await sleep(150);
    } catch (e) {
      console.error(e);
    }
  }

  const fs = await import('fs');
  fs.writeFileSync('scripts/fetched_2024_2026.json', JSON.stringify(results, null, 2));
  console.log(`Terminé ! ${results.length} jeux sauvegardés.`);
}

run();
