/**
 * Script de moissonnage et génération automatique de fiches de jeux Steam
 * Usage : npx tsx scripts/addBatchGames.ts
 */

interface GameSeed {
  appId: number;
  id: string;
  artStyle: { fr: string; en: string };
  camera: { fr: string; en: string };
  composer?: string;
}

const SEED_GAMES: GameSeed[] = [
  {
    appId: 250900,
    id: 'the-binding-of-isaac-rebirth',
    artStyle: { fr: 'Pixel Art 16-bit macabre et expressif', en: 'Grim and expressive 16-bit pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Ridiculon',
  },
  {
    appId: 105600,
    id: 'terraria',
    artStyle: { fr: 'Pixel Art rétro coloré et foisonnant', en: 'Vibrant and detailed retro pixel art' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Scott Lloyd Shelly (RE-LOGIC)',
  },
  {
    appId: 1794680,
    id: 'vampire-survivors',
    artStyle: { fr: 'Pixel Art rétro gothique style Castlevania', en: 'Gothic retro pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Daniele Zandara / Filippo Vicarelli',
  },
  {
    appId: 1313140,
    id: 'cult-of-the-lamb',
    artStyle: { fr: 'Dessin 2D cartoon mignon et occulte', en: 'Cute and occult hand-drawn cartoon 2D' },
    camera: { fr: 'Vue Isométrique 2.5D', en: '2.5D Isometric' },
    composer: 'River Boy (Narayana Johnson)',
  },
  {
    appId: 250760,
    id: 'shovel-knight',
    artStyle: { fr: 'Pixel Art 8-bit authentique style NES', en: 'Authentic 8-bit NES pixel art' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Jake Kaufman & Manami Matsumae',
  },
  {
    appId: 304430,
    id: 'inside',
    artStyle: { fr: '3D Minimaliste atmosphérique en nuances de gris', en: 'Atmospheric minimalist 3D in desaturated tones' },
    camera: { fr: 'Vue de côté 2.5D cinématique', en: 'Cinematic 2.5D Side-scroller' },
    composer: 'Martin Stig Andersen & SØS Gunver Ryberg',
  },
  {
    appId: 48000,
    id: 'limbo',
    artStyle: { fr: 'Noir et blanc monochrome en ombres chinoises', en: 'Monochrome black & white silhouette noir' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Martin Stig Andersen',
  },
  {
    appId: 1497440,
    id: 'cocoon',
    artStyle: { fr: '3D Stylisée épurée et extraterrestre', en: 'Sleek stylized alien 3D' },
    camera: { fr: 'Vue Isométrique du dessus', en: 'Top-down Isometric' },
    composer: 'Jakob Schmid',
  },
  {
    appId: 653530,
    id: 'return-of-the-obra-dinn',
    artStyle: { fr: 'Monochrome 1-bit dithering rétro Mac/PC', en: '1-bit monochrome dithering classic Macintosh' },
    camera: { fr: 'Première personne 3D (First-person)', en: 'First-person 3D' },
    composer: 'Lucas Pope',
  },
  {
    appId: 1229490,
    id: 'ultrakill',
    artStyle: { fr: 'Rétro Low-poly texturé style PS1 / Quake', en: 'Retro low-poly PS1/Quake aesthetic' },
    camera: { fr: 'Première personne 3D (FPS)', en: 'First-person 3D (FPS)' },
    composer: 'Hakita (Arsi Patala)',
  },
  {
    appId: 311690,
    id: 'enter-the-gungeon',
    artStyle: { fr: 'Pixel Art vibrant et hyper-animé', en: 'Vibrant and richly animated pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'doseone',
  },
  {
    appId: 632360,
    id: 'risk-of-rain-2',
    artStyle: { fr: '3D Cel-shaded stylisée et texturée', en: 'Stylized cel-shaded 3D' },
    camera: { fr: 'Troisième personne 3D (Over-the-shoulder)', en: 'Third-person 3D' },
    composer: 'Chris Christodoulou',
  },
  {
    appId: 257850,
    id: 'hyper-light-drifter',
    artStyle: { fr: 'Pixel Art 16-bit néon et cinématique', en: 'Neon-soaked cinematic 16-bit pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Disasterpeace',
  },
  {
    appId: 418530,
    id: 'spelunky-2',
    artStyle: { fr: 'Dessin 2D cartoon soigné et précis', en: 'Sharp hand-drawn 2D cartoon' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Eirik Suhrke',
  },
  {
    appId: 412830,
    id: 'rain-world',
    artStyle: { fr: 'Pixel Art organique et animation procédurale', en: 'Organic pixel art with procedural animation' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'James Primate & Lydia Esrig',
  },
  {
    appId: 383870,
    id: 'firewatch',
    artStyle: { fr: '3D Stylisée chaude et picturale', en: 'Warm pictorial stylized 3D' },
    camera: { fr: 'Première personne 3D (First-person)', en: 'First-person 3D' },
    composer: 'Chris Remo',
  },
  {
    appId: 501300,
    id: 'what-remains-of-edith-finch',
    artStyle: { fr: '3D Réaliste narrative et poétique', en: 'Poetic narrative realistic 3D' },
    camera: { fr: 'Première personne 3D (First-person)', en: 'First-person 3D' },
    composer: 'Jeff Russo',
  },
  {
    appId: 40800,
    id: 'super-meat-boy',
    artStyle: { fr: 'Dessin 2D cartoon vectoriel délirant', en: 'Wild cartoon vector 2D' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'Danny Baranowsky',
  },
  {
    appId: 107100,
    id: 'bastion',
    artStyle: { fr: 'Peinture numérique texturée et colorée', en: 'Lush hand-painted digital art' },
    camera: { fr: 'Vue Isométrique 2.5D', en: '2.5D Isometric' },
    composer: 'Darren Korb',
  },
  {
    appId: 237930,
    id: 'transistor',
    artStyle: { fr: 'Peinture numérique cyberpunk et Art Déco', en: 'Art Deco cyberpunk painted aesthetic' },
    camera: { fr: 'Vue Isométrique 2.5D', en: '2.5D Isometric' },
    composer: 'Darren Korb',
  },
  {
    appId: 212680,
    id: 'ftl-faster-than-light',
    artStyle: { fr: 'Pixel Art spatial épuré et fonctionnel', en: 'Clean and functional sci-fi pixel art' },
    camera: { fr: 'Vue du dessus vaisseau 2D (Top-down cockpit)', en: '2D Top-down Ship Overview' },
    composer: 'Ben Prunty',
  },
  {
    appId: 590380,
    id: 'into-the-breach',
    artStyle: { fr: 'Pixel Art miniature isométrique précis', en: 'Crisp isometric miniature pixel art' },
    camera: { fr: 'Vue Isométrique 2D sur grille (Grid-based)', en: '2D Isometric Grid' },
    composer: 'Ben Prunty',
  },
  {
    appId: 1150690,
    id: 'omori',
    artStyle: { fr: 'Dessin aux crayons de papier et Pixel Art 16-bit', en: 'Hand-drawn colored pencil sketches & 16-bit pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down RPG)', en: '2D Top-down RPG' },
    composer: 'OMOCAT, Pedro Silva, Jami Lynne',
  },
  {
    appId: 1147860,
    id: 'ufo-50',
    artStyle: { fr: 'Pixel Art 8-bit fictionnel console vintage', en: 'Fictional 8-bit vintage console pixel art' },
    camera: { fr: 'Multiples perspectives rétro 2D', en: 'Multiple retro 2D perspectives' },
    composer: 'Eirik Suhrke',
  },
  {
    appId: 2008920,
    id: 'lorelei-and-the-laser-eyes',
    artStyle: { fr: '3D Monochrome noir & blanc avec accents cramoisis', en: 'Black & white 3D monochrome with crimson accents' },
    camera: { fr: 'Plans fixes cinématographiques 3D', en: 'Fixed cinematic 3D angles' },
    composer: 'Simogo / Daniel Olsén',
  },
  {
    appId: 1562700,
    id: 'sanabi',
    artStyle: { fr: 'Pixel Art cyberpunk dynamique et néon', en: 'Dynamic neon cyberpunk pixel art' },
    camera: { fr: 'Vue de côté 2D (Side-scroller)', en: '2D Side-scroller' },
    composer: 'WONDER POTION',
  },
  {
    appId: 1966720,
    id: 'lethal-company',
    artStyle: { fr: '3D Rétro basse fidélité style cassette VHS', en: 'Low-fi VHS retro 3D' },
    camera: { fr: 'Première personne 3D (First-person)', en: 'First-person 3D' },
    composer: 'Zeekerss',
  },
  {
    appId: 1578650,
    id: 'citizen-sleeper',
    artStyle: { fr: 'Illustrations de personnages manga & UI cyberpunk épurée', en: 'Manga character portraits & slick cyberpunk UI' },
    camera: { fr: 'Vue statique 2D de station / Visual Novel', en: '2D Static Station Map & Visual Novel' },
    composer: 'Amos Roddy',
  },
  {
    appId: 247080,
    id: 'crypt-of-the-necrodancer',
    artStyle: { fr: 'Pixel Art rétro vif et musical', en: 'Lively retro musical pixel art' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Danny Baranowsky',
  },
  {
    appId: 219740,
    id: 'dont-starve',
    artStyle: { fr: 'Dessin gothique au trait style gravure macabre', en: 'Gothic scratchboard storybook art style' },
    camera: { fr: 'Vue Isométrique 2.5D orientable', en: '2.5D Rotatable Isometric' },
    composer: 'Vince de Giorgi',
  },
  {
    appId: 1332010,
    id: 'stray',
    artStyle: { fr: '3D Réaliste immersive et néon-cyberpunk', en: 'Immersive realistic neon-cyberpunk 3D' },
    camera: { fr: 'Troisième personne féline 3D', en: 'Third-person Feline 3D' },
    composer: 'Yann van der Cruyssen',
  },
  {
    appId: 1123450,
    id: 'chicory-a-colorful-tale',
    artStyle: { fr: 'Dessin à la main noir et blanc à peindre', en: 'Coloring book black and white hand-drawn' },
    camera: { fr: 'Vue du dessus 2D (Top-down)', en: '2D Top-down' },
    composer: 'Lena Raine',
  },
  {
    appId: 2138710,
    id: 'sifu',
    artStyle: { fr: '3D Stylisée façon peinture à l’huile et cinéma d’arts martiaux', en: 'Stylized oil-painted martial arts cinematic 3D' },
    camera: { fr: 'Troisième personne 3D (Over-the-shoulder)', en: 'Third-person 3D' },
    composer: 'Howie Lee',
  },
  {
    appId: 1977170,
    id: 'jusant',
    artStyle: { fr: '3D Stylisée lumineuse et minérale', en: 'Luminous and mineral stylized 3D' },
    camera: { fr: 'Troisième personne 3D d’escalade', en: 'Third-person Climbing 3D' },
    composer: 'Guillaume Ferran',
  },
  {
    appId: 2366980,
    id: 'thank-goodness-youre-here',
    artStyle: { fr: 'Dessin animé britannique traditionnel fait main', en: 'Traditional hand-drawn British comedy cartoon' },
    camera: { fr: 'Vue de dessus / latérale 2D cartoon', en: '2D Cartoon Top-down / Side hybrid' },
    composer: 'Coal Supper',
  },
  {
    appId: 1634860,
    id: 'minishoot-adventures',
    artStyle: { fr: 'Dessin vectoriel 2D vibrant et coloré', en: 'Vibrant and colorful 2D vector art' },
    camera: { fr: 'Vue du dessus 2D (Twin-stick / Metroidvania)', en: '2D Top-down Twin-stick' },
    composer: 'SoulGame',
  },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log(`🦉 Moissonnage de ${SEED_GAMES.length} jeux indés depuis l'API Steam Store...`);
  const results = [];

  for (const seed of SEED_GAMES) {
    try {
      const url = `https://store.steampowered.com/api/appdetails?appids=${seed.appId}&l=french`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`⚠️ Erreur HTTP ${res.status} pour AppId ${seed.appId}`);
        continue;
      }
      const data = await res.json();
      const app = data[seed.appId];
      if (!app || !app.success || !app.data) {
        console.warn(`⚠️ AppId ${seed.appId} non disponible`);
        continue;
      }

      const d = app.data;
      const yearMatch = d.release_date.date.match(/\d{4}/);
      const releaseYear = yearMatch ? parseInt(yearMatch[0], 10) : 2020;

      const gameObj = {
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
      };

      results.push(gameObj);
      console.log(`✅ [${results.length}/${SEED_GAMES.length}] ${d.name} (${releaseYear})`);
      await sleep(150); // Be respectful to Steam API
    } catch (e) {
      console.error(`❌ Erreur sur ${seed.appId}:`, e);
    }
  }

  const fs = await import('fs');
  fs.writeFileSync('scripts/fetched_games.json', JSON.stringify(results, null, 2));
  console.log(`\n🎉 Terminé ! ${results.length} jeux sauvegardés dans scripts/fetched_games.json`);
}

run();
