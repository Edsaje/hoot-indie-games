import fs from 'fs';
import path from 'path';
import type { Game } from '../src/types/game';
import { INDIE_GAMES } from '../src/data/games';
import { VALID_ART_STYLES, VALID_CAMERAS } from './auditRules';

/**
 * 🦉 Hoot Indie Games — Recalibration Exhaustive des Graphismes (Art Style) et Caméras
 * Règle 0 Hallucination : Corrige massivement les faux-positifs "2D Side-scroller" et "3D Stylisé"
 * en utilisant :
 * 1. Les 298 pépites certifiées INDIE_GAMES (parité absolue)
 * 2. Un dictionnaire d'autorité des chefs-d'œuvre indés majeurs
 * 3. L'API SteamSpy (tags votés par la communauté Steam) avec cache disque
 * 4. Une inférence contextuelle multi-critères (genres canoniques, tags, descriptions)
 */

const CATALOG_FILE = path.join(process.cwd(), 'public/data/steam_catalog.json');
const STEAM_CACHE_FILE = path.join(process.cwd(), 'scripts/steam_cache.json');
const TAGS_CACHE_FILE = path.join(process.cwd(), 'scripts/steam_tags_cache.json');

// Dictionnaire des jeux majeurs certifiés (ground truth absolu)
const KNOWN_OVERRIDES: Record<string, { art: string; cam: string }> = {
  // 3D Third-Person
  'risk of rain 2': { art: 'Stylized 3D', cam: 'Third-Person' },
  'valheim': { art: 'Retro Low-poly 3D', cam: 'Third-Person' },
  'chained together': { art: 'Realistic 3D', cam: 'Third-Person' },
  'palworld': { art: 'Stylized 3D', cam: 'Third-Person' },
  'enshrouded': { art: 'Stylized 3D', cam: 'Third-Person' },
  'a hat in time': { art: 'Stylized 3D', cam: 'Third-Person' },
  'stray': { art: 'Realistic 3D', cam: 'Third-Person' },
  'sifu': { art: 'Stylized 3D', cam: 'Third-Person' },
  'solar ash': { art: 'Stylized 3D', cam: 'Third-Person' },
  'human fall flat': { art: 'Stylized 3D', cam: 'Third-Person' },
  'crab champions': { art: 'Stylized 3D', cam: 'Third-Person' },

  // 3D First-Person
  'phasmophobia': { art: 'Realistic 3D', cam: 'First-Person' },
  'rust': { art: 'Realistic 3D', cam: 'First-Person' },
  'raft': { art: 'Stylized 3D', cam: 'First-Person' },
  'slime rancher': { art: 'Stylized 3D', cam: 'First-Person' },
  'slime rancher 2': { art: 'Stylized 3D', cam: 'First-Person' },
  'deep rock galactic': { art: 'Stylized 3D', cam: 'First-Person' },
  'subnautica': { art: 'Stylized 3D', cam: 'First-Person' },
  'subnautica: below zero': { art: 'Stylized 3D', cam: 'First-Person' },
  'outer wilds': { art: 'Stylized 3D', cam: 'First-Person' },
  'firewatch': { art: 'Stylized 3D', cam: 'First-Person' },
  'the witness': { art: 'Stylized 3D', cam: 'First-Person' },
  'superhot': { art: 'Stylized 3D', cam: 'First-Person' },
  'lethal company': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'abiotic factor': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'content warning': { art: 'Stylized 3D', cam: 'First-Person' },
  'bodycam': { art: 'Realistic 3D', cam: 'First-Person' },
  'ultrakill': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'dusk': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'ion fury': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'cultic': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'amid evil': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'roboquest': { art: 'Stylized 3D', cam: 'First-Person' },
  'gunfire reborn': { art: 'Stylized 3D', cam: 'First-Person' },
  'ghostrunner': { art: 'Realistic 3D', cam: 'First-Person' },
  'pacific drive': { art: 'Stylized 3D', cam: 'First-Person' },
  'sons of the forest': { art: 'Realistic 3D', cam: 'First-Person' },
  'the forest': { art: 'Realistic 3D', cam: 'First-Person' },
  'green hell': { art: 'Realistic 3D', cam: 'First-Person' },
  'medieval dynasty': { art: 'Realistic 3D', cam: 'First-Person' },
  'superliminal': { art: 'Stylized 3D', cam: 'First-Person' },
  'amnesia: the dark descent': { art: 'Stylized 3D', cam: 'First-Person' },
  'amnesia: the bunker': { art: 'Realistic 3D', cam: 'First-Person' },

  // Isometric / 2.5D
  'hades': { art: '2D Hand-drawn', cam: 'Isometric / 2.5D' },
  'hades ii': { art: '2D Hand-drawn', cam: 'Isometric / 2.5D' },
  'disco elysium': { art: '2D Hand-drawn', cam: 'Isometric / 2.5D' },
  'project zomboid': { art: 'Retro Low-poly 3D', cam: 'Isometric / 2.5D' },
  'bastion': { art: '2D Hand-drawn', cam: 'Isometric / 2.5D' },
  'transistor': { art: '2D Hand-drawn', cam: 'Isometric / 2.5D' },
  'death\'s door': { art: 'Stylized 3D', cam: 'Isometric / 2.5D' },
  'tunic': { art: 'Stylized 3D', cam: 'Isometric / 2.5D' },
  'timberborn': { art: 'Stylized 3D', cam: 'Isometric / 2.5D' },
  'frostpunk': { art: 'Realistic 3D', cam: 'Isometric / 2.5D' },
  'against the storm': { art: 'Stylized 3D', cam: 'Isometric / 2.5D' },
  'manor lords': { art: 'Realistic 3D', cam: 'Isometric / 2.5D' },
  'dyson sphere program': { art: 'Stylized 3D', cam: 'Isometric / 2.5D' },
  'banished': { art: 'Realistic 3D', cam: 'Isometric / 2.5D' },
  'songs of syx': { art: 'Pixel Art', cam: 'Isometric / 2.5D' },

  // 2D Top-down
  'vampire survivors': { art: 'Pixel Art', cam: '2D Top-down' },
  'brotato': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'hotline miami': { art: 'Pixel Art', cam: '2D Top-down' },
  'hotline miami 2: wrong number': { art: 'Pixel Art', cam: '2D Top-down' },
  'the binding of isaac: rebirth': { art: 'Pixel Art', cam: '2D Top-down' },
  'the binding of isaac': { art: 'Pixel Art', cam: '2D Top-down' },
  'enter the gungeon': { art: 'Pixel Art', cam: '2D Top-down' },
  'stardew valley': { art: 'Pixel Art', cam: '2D Top-down' },
  'graveyard keeper': { art: 'Pixel Art', cam: '2D Top-down' },
  'rimworld': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'dwarf fortress': { art: 'Pixel Art', cam: '2D Top-down' },
  'prison architect': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'factorio': { art: 'Retro Low-poly 3D', cam: '2D Top-down' },
  'mindustry': { art: 'Pixel Art', cam: '2D Top-down' },
  'shapez': { art: 'Monochrome', cam: '2D Top-down' },
  'cookie clicker': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'rusty\'s retirement': { art: 'Pixel Art', cam: '2D Top-down' },
  'melvor idle': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'realm grinder': { art: 'Pixel Art', cam: '2D Top-down' },
  'ngu idle': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'bitburner': { art: 'Monochrome', cam: '2D Top-down' },
  'antimatter dimensions': { art: 'Monochrome', cam: '2D Top-down' },
  'garden galaxy': { art: 'Pixel Art', cam: '2D Top-down' },
  'balatro': { art: 'Pixel Art', cam: '2D Top-down' },
  'slay the spire': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'monster train': { art: '2D Hand-drawn', cam: '2D Top-down' },
  'inscryption': { art: 'Retro Low-poly 3D', cam: 'First-Person' },
  'undertale': { art: 'Pixel Art', cam: '2D Top-down' },
  'deltarune': { art: 'Pixel Art', cam: '2D Top-down' },
  'baba is you': { art: 'Pixel Art', cam: '2D Top-down' },
  'darkwood': { art: 'Pixel Art', cam: '2D Top-down' },
  'ape out': { art: 'Stylized 3D', cam: '2D Top-down' },
  'nuclear throne': { art: 'Pixel Art', cam: '2D Top-down' },
  'synthetik: legion rising': { art: 'Pixel Art', cam: '2D Top-down' },
  'overcooked!': { art: 'Stylized 3D', cam: '2D Top-down' },
  'overcooked! 2': { art: 'Stylized 3D', cam: '2D Top-down' },

  // 2D Side-scroller
  'hollow knight': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'cuphead': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'celeste': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'dead cells': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'terraria': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'ori and the blind forest': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'ori and the will of the wisps': { art: 'Stylized 3D', cam: '2D Side-scroller' },
  'rain world': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'blasphemous': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'blasphemous 2': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'shovel knight': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'spelunky': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'spelunky 2': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'noita': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'katana zero': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'mark of the ninja': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'mark of the ninja: remastered': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'super meat boy': { art: '2D Hand-drawn', cam: '2D Side-scroller' },
  'limbo': { art: 'Monochrome', cam: '2D Side-scroller' },
  'inside': { art: 'Stylized 3D', cam: '2D Side-scroller' },
  'skul: the hero slayer': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'carrion': { art: 'Pixel Art', cam: '2D Side-scroller' },
  'bloodstained: ritual of the night': { art: 'Stylized 3D', cam: '2D Side-scroller' },
  'my friend pedro': { art: 'Stylized 3D', cam: '2D Side-scroller' },
};

const ART_MAP: Record<string, { fr: string; en: string }> = {
  'Pixel Art': { fr: 'Pixel Art', en: 'Pixel Art' },
  '2D Hand-drawn': { fr: '2D Dessiné à la main', en: '2D Hand-drawn' },
  'Stylized 3D': { fr: '3D Stylisé', en: 'Stylized 3D' },
  'Retro Low-poly 3D': { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' },
  'Realistic 3D': { fr: '3D Réaliste', en: 'Realistic 3D' },
  'Monochrome': { fr: 'Monochrome / Minimaliste', en: 'Monochrome' },
};

const CAM_MAP: Record<string, { fr: string; en: string }> = {
  '2D Side-scroller': { fr: '2D Vue de côté', en: '2D Side-scroller' },
  '2D Top-down': { fr: '2D Vue de dessus', en: '2D Top-down' },
  'Isometric / 2.5D': { fr: '2.5D Isométrique', en: 'Isometric / 2.5D' },
  'First-Person': { fr: 'Vue à la première personne', en: 'First-Person' },
  'Third-Person': { fr: '3D Vue à la troisième personne', en: 'Third-Person' },
};

function inferCameraFromMetadata(title: string, genres: string[], tags: string[], desc: string): { fr: string; en: string } {
  const normTitle = title.toLowerCase().replace(/[:\-–—'’!?]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [key, val] of Object.entries(KNOWN_OVERRIDES)) {
    const normKey = key.replace(/[:\-–—'’!?]/g, ' ').replace(/\s+/g, ' ').trim();
    if (normTitle === normKey || normTitle.includes(normKey)) {
      return CAM_MAP[val.cam];
    }
  }

  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  const fullText = (title + ' ' + desc + ' ' + tags.join(' ')).toLowerCase();

  // 1. Première personne
  if (
    tagSet.has('first-person') ||
    tagSet.has('fps') ||
    tagSet.has('boomer shooter') ||
    tagSet.has('vr') ||
    tagSet.has('vr only') ||
    genres.includes('FPS') ||
    genres.includes('Fast-FPS') ||
    genres.includes('Immersive Sim') ||
    fullText.includes('first-person') ||
    fullText.includes('first person') ||
    fullText.includes('première personne') ||
    fullText.includes('vue subjective')
  ) {
    return CAM_MAP['First-Person'];
  }

  // 2. Isométrique / 2.5D
  if (
    tagSet.has('isometric') ||
    fullText.includes('isometric') ||
    fullText.includes('isométrique') ||
    fullText.includes('2.5d') ||
    genres.includes('City Builder')
  ) {
    return CAM_MAP['Isometric / 2.5D'];
  }

  // 3. Vue du dessus 2D
  if (
    tagSet.has('top-down') ||
    tagSet.has('top-down shooter') ||
    tagSet.has('twin stick shooter') ||
    tagSet.has('twin-stick') ||
    genres.includes('Auto-Shooter') ||
    genres.includes('Twin-stick') ||
    genres.includes('Colony Sim') ||
    genres.includes('Idle / Clicker') ||
    genres.includes('Incrémental') ||
    fullText.includes('top-down') ||
    fullText.includes('twin-stick') ||
    fullText.includes('vue du dessus') ||
    fullText.includes('vue de dessus') ||
    (genres.includes('Bullet Hell') && !genres.includes('Metroidvania') && !tagSet.has('side scroller'))
  ) {
    return CAM_MAP['2D Top-down'];
  }

  // 4. Troisième personne
  if (
    tagSet.has('third person') ||
    tagSet.has('third-person') ||
    tagSet.has('third-person shooter') ||
    tagSet.has('3d platformer') ||
    fullText.includes('third-person') ||
    fullText.includes('troisième personne') ||
    fullText.includes('over the shoulder') ||
    (genres.includes('Course') && (tagSet.has('3d') || fullText.includes('3d'))) ||
    (genres.includes('Souls-like') && (tagSet.has('3d') || fullText.includes('3d')))
  ) {
    return CAM_MAP['Third-Person'];
  }

  // 5. Vue de côté 2D
  if (
    tagSet.has('side scroller') ||
    tagSet.has('2d platformer') ||
    tagSet.has('metroidvania') ||
    tagSet.has('precision platformer') ||
    genres.includes('Metroidvania') ||
    genres.includes('Plateforme') ||
    genres.includes('Platformer') ||
    fullText.includes('side-scroller') ||
    fullText.includes('side-scrolling') ||
    fullText.includes('metroidvania') ||
    fullText.includes('plateforme 2d')
  ) {
    return CAM_MAP['2D Side-scroller'];
  }

  // Contextuel
  if (genres.includes('Farming') && (tagSet.has('2d') || fullText.includes('2d'))) {
    return CAM_MAP['2D Top-down'];
  }
  if (genres.includes('Course')) {
    return CAM_MAP['Third-Person'];
  }
  if (genres.includes('Deckbuilder') || genres.includes('Cartes')) {
    return CAM_MAP['2D Top-down'];
  }

  if (tagSet.has('3d') || fullText.includes(' 3d')) {
    if (fullText.includes('shooter') || fullText.includes('cockpit') || fullText.includes('horror')) {
      return CAM_MAP['First-Person'];
    }
    return CAM_MAP['Third-Person'];
  }

  return CAM_MAP['2D Side-scroller'];
}

function inferArtStyleFromMetadata(title: string, genres: string[], tags: string[], desc: string): { fr: string; en: string } {
  const normTitle = title.toLowerCase().replace(/[:\-–—'’!?]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [key, val] of Object.entries(KNOWN_OVERRIDES)) {
    const normKey = key.replace(/[:\-–—'’!?]/g, ' ').replace(/\s+/g, ' ').trim();
    if (normTitle === normKey || normTitle.includes(normKey)) {
      return ART_MAP[val.art];
    }
  }

  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  const fullText = (title + ' ' + desc + ' ' + tags.join(' ')).toLowerCase();

  // 1. Monochrome
  if (
    tagSet.has('monochrome') ||
    tagSet.has('black and white') ||
    tagSet.has('1-bit') ||
    fullText.includes('monochrome') ||
    fullText.includes('black and white') ||
    fullText.includes('noir et blanc') ||
    fullText.includes('1-bit')
  ) {
    return ART_MAP['Monochrome'];
  }

  // 2. Retro Low-poly 3D
  if (
    tagSet.has('low-poly') ||
    tagSet.has('psx') ||
    tagSet.has('retro 3d') ||
    fullText.includes('low-poly') ||
    fullText.includes('low poly') ||
    fullText.includes('ps1') ||
    fullText.includes('psx') ||
    fullText.includes('n64') ||
    fullText.includes('retro 3d') ||
    fullText.includes('polygonal') ||
    fullText.includes('boomer shooter')
  ) {
    return ART_MAP['Retro Low-poly 3D'];
  }

  // 3. Realistic 3D
  if (
    tagSet.has('realistic') ||
    tagSet.has('photorealistic') ||
    fullText.includes('photorealistic') ||
    fullText.includes('unreal engine 5') ||
    fullText.includes('ue5') ||
    fullText.includes('3d réaliste') ||
    fullText.includes('realistic 3d') ||
    (fullText.includes('realistic') && (tagSet.has('3d') || fullText.includes('3d')))
  ) {
    return ART_MAP['Realistic 3D'];
  }

  // 4. Pixel Art
  if (
    tagSet.has('pixel graphics') ||
    fullText.includes('pixel art') ||
    fullText.includes('pixel graphics') ||
    fullText.includes('pixel-art') ||
    fullText.includes('16-bit') ||
    fullText.includes('8-bit') ||
    fullText.includes('retro 2d') ||
    (tagSet.has('2d') && fullText.includes('pixel'))
  ) {
    return ART_MAP['Pixel Art'];
  }

  // 5. 2D Hand-drawn
  if (
    tagSet.has('hand-drawn') ||
    tagSet.has('anime') ||
    tagSet.has('cartoon') ||
    tagSet.has('comic book') ||
    fullText.includes('hand-drawn') ||
    fullText.includes('hand drawn') ||
    fullText.includes('dessiné à la main') ||
    fullText.includes('watercolor') ||
    fullText.includes('aquarelle') ||
    fullText.includes('cartoon') ||
    fullText.includes('anime') ||
    genres.includes('Visual Novel') ||
    (genres.includes('Deckbuilder') && !tagSet.has('3d') && !fullText.includes('3d')) ||
    (genres.includes('Cartes') && !tagSet.has('3d') && !fullText.includes('3d')) ||
    (tagSet.has('2d') && !tagSet.has('3d') && !fullText.includes('pixel'))
  ) {
    return ART_MAP['2D Hand-drawn'];
  }

  // 6. Stylized 3D
  if (
    tagSet.has('3d') ||
    tagSet.has('stylized') ||
    fullText.includes('stylized') ||
    fullText.includes('cel-shaded') ||
    fullText.includes('cel shading') ||
    fullText.includes('voxel') ||
    fullText.includes('3d')
  ) {
    return ART_MAP['Stylized 3D'];
  }

  if (tagSet.has('2d') || fullText.includes('2d')) {
    return ART_MAP['2D Hand-drawn'];
  }

  return ART_MAP['Stylized 3D'];
}

async function fetchTagsWithRetry(appId: number, cache: Record<number, string[]>): Promise<string[]> {
  if (cache[appId]) return cache[appId];

  try {
    const res = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appId}`);
    if (res.ok) {
      const json = await res.json();
      const tags = Object.keys(json.tags || {});
      cache[appId] = tags;
      return tags;
    }
  } catch {
    // Repli sur tableau vide
  }
  cache[appId] = [];
  return [];
}

async function main() {
  console.log('🦉 =====================================================================');
  console.log('🦉 RECALIBRATION CANONIQUE DES GRAPHISMES & PERSPECTIVES DU CATALOGUE');
  console.log('🦉 =====================================================================\n');

  const catalog: Game[] = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
  let tagsCache: Record<number, string[]> = {};
  if (fs.existsSync(TAGS_CACHE_FILE)) {
    try {
      tagsCache = JSON.parse(fs.readFileSync(TAGS_CACHE_FILE, 'utf8'));
    } catch {
      tagsCache = {};
    }
  }

  // 1. Indexer les pépites certifiées INDIE_GAMES pour synchronisation 1:1
  const indieMap = new Map<number, Game>();
  const indieTitleMap = new Map<string, Game>();
  for (const g of INDIE_GAMES) {
    if (g.steamUrl) {
      const m = g.steamUrl.match(/\/app\/(\d+)/);
      if (m) indieMap.set(parseInt(m[1], 10), g);
    }
    indieTitleMap.set(g.title.toLowerCase().trim(), g);
  }

  console.log(`📦 Audit de ${catalog.length} jeux dans le catalogue étendu...`);

  let modifiedCount = 0;
  let indieSynced = 0;
  let tagsFetched = 0;

  for (let i = 0; i < catalog.length; i++) {
    const game = catalog[i];
    const appId = (game as any).steamAppId || (game.steamUrl ? parseInt(game.steamUrl.match(/\/app\/(\d+)/)?.[1] || '0', 10) : 0);
    const normTitle = game.title.toLowerCase().trim();

    // A. Si présent dans INDIE_GAMES -> Parité absolue certifiée
    const certified = (appId && indieMap.get(appId)) || indieTitleMap.get(normTitle);
    if (certified) {
      const oldCam = game.camera?.en;
      const oldArt = game.artStyle?.en;
      game.camera = { ...certified.camera };
      game.artStyle = { ...certified.artStyle };
      if (oldCam !== game.camera.en || oldArt !== game.artStyle.en) {
        modifiedCount++;
        indieSynced++;
      }
      continue;
    }

    // B. Sinon -> Recalibration via SteamSpy tags & métadonnées
    let tags = tagsCache[appId] || [];
    if (!tags || tags.length === 0) {
      tags = await fetchTagsWithRetry(appId, tagsCache);
      tagsFetched++;
      if (tagsFetched % 15 === 0) {
        fs.writeFileSync(TAGS_CACHE_FILE, JSON.stringify(tagsCache, null, 2), 'utf8');
      }
      // Pause légère de 100ms
      await new Promise((r) => setTimeout(r, 100));
    }

    const desc = `${game.hints?.tagline?.fr || ''} ${game.hints?.tagline?.en || ''}`;
    const newCamera = inferCameraFromMetadata(game.title, game.genre || [], tags, desc);
    const newArt = inferArtStyleFromMetadata(game.title, game.genre || [], tags, desc);

    const oldCam = game.camera?.en;
    const oldArt = game.artStyle?.en;

    game.camera = newCamera;
    game.artStyle = newArt;

    if (oldCam !== newCamera.en || oldArt !== newArt.en) {
      modifiedCount++;
    }
  }

  // Sauvegarder les fichiers mis à jour
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  fs.writeFileSync(TAGS_CACHE_FILE, JSON.stringify(tagsCache, null, 2), 'utf8');

  // Mettre à jour steam_cache.json
  if (fs.existsSync(STEAM_CACHE_FILE)) {
    try {
      const steamCache = JSON.parse(fs.readFileSync(STEAM_CACHE_FILE, 'utf8'));
      for (const g of catalog) {
        const appIdStr = (g as any).steamAppId?.toString();
        if (appIdStr && steamCache[appIdStr]) {
          steamCache[appIdStr].camera = g.camera;
          steamCache[appIdStr].artStyle = g.artStyle;
        }
      }
      fs.writeFileSync(STEAM_CACHE_FILE, JSON.stringify(steamCache, null, 2), 'utf8');
    } catch {}
  }

  console.log('\n=====================================================================');
  console.log(`✨ RECALIBRATION TERMINÉE AVEC SUCCÈS !`);
  console.log(`🎮 Total jeux analysés : ${catalog.length}`);
  console.log(`🔧 Jeux dont les tags caméra/art ont été corrigés : ${modifiedCount}`);
  console.log(`🎴 Pépites du Panthéon synchronisées 1:1 : ${indieSynced}`);
  console.log(`🏷️ Fiches SteamSpy interrogées : ${tagsFetched}`);
  console.log('=====================================================================\n');

  // Afficher la nouvelle distribution
  const finalCams: Record<string, number> = {};
  const finalArts: Record<string, number> = {};
  for (const g of catalog) {
    finalCams[g.camera.en] = (finalCams[g.camera.en] || 0) + 1;
    finalArts[g.artStyle.en] = (finalArts[g.artStyle.en] || 0) + 1;
  }
  console.log('📊 Nouvelle distribution des Caméras :', finalCams);
  console.log('🎨 Nouvelle distribution des Styles Artistiques :', finalArts);
}

main().catch((err) => {
  console.error('❌ Erreur lors de la recalibration :', err);
  process.exit(1);
});
