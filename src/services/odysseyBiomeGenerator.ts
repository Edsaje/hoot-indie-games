/**
 * 🌲 Hoot Indie Games — Générateur Procédural & Moteur d'Extension de l'Odyssée
 * Permet d'étendre automatiquement les Biomes et Routes au-delà des 6 mondes initiaux
 * dès que de nouvelles pépites sont récoltées ou certifiées dans le sanctuaire.
 */

import type { OdysseyBiome, OdysseyRoute } from '../types/odyssey';
import type { Game } from '../types/game';

export interface BiomeTemplate {
  id: string;
  index: number;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  particlesType: 'spores' | 'pixels' | 'crystals' | 'snow' | 'embers' | 'cosmic' | 'glitch' | 'bubbles' | 'stars';
  routeNames: [string, string, string, string, string];
}

/**
 * Modèles thématiques d'ambiance pour les mondes 7 à 10
 */
export const EXTENDED_BIOME_TEMPLATES: Record<number, BiomeTemplate> = {
  7: {
    id: 'biome_7_chrono_rift',
    index: 7,
    name: 'La Faille Chronologique',
    tagline: 'Là où le tissu temporel se déchire, révélant les reliques oubliées.',
    description: 'Un sanctuaire suspendu entre les époques où les fragments d’histoire gravitent au milieu des aiguilles d’horloges cosmiques.',
    icon: '⏳',
    bgGradient: 'from-[#1a1405] via-[#2e2208] to-[#0c0902]',
    accentColor: '#eab308',
    borderColor: '#ca8a04',
    particlesType: 'glitch',
    routeNames: [
      'Le Sentier Temporel',
      'L’Antre des Ombres',
      'Les Abysses de Sombreroche',
      'Les Terres Sauvages',
      'La Faille Primordiale (Boss)',
    ],
  },
  8: {
    id: 'biome_8_ocean_abyss',
    index: 8,
    name: 'Les Abysses Océaniques',
    tagline: 'Plongez dans les fosses abyssales illuminées par la faune bioluminescente.',
    description: 'Un gouffre marin infini où les secrets sous-marins et les créatures lumineuses dansent dans l’obscurité liquide.',
    icon: '🌊',
    bgGradient: 'from-[#031525] via-[#05223b] to-[#020b14]',
    accentColor: '#06b6d4',
    borderColor: '#0891b2',
    particlesType: 'bubbles',
    routeNames: [
      'Le Récif des Murmures',
      'Le Défilé des Coraux',
      'La Tranchée Crépusculaire',
      'La Cité Engloutie',
      'Le Léviathan des Profondeurs (Boss)',
    ],
  },
  9: {
    id: 'biome_9_dream_nebula',
    index: 9,
    name: 'La Nébuleuse des Songes',
    tagline: 'Une mer d’étoiles pastel où prennent vie les fables poétiques.',
    description: 'Une étendue onirique où gravitent les chefs-d’œuvre d’émotion, baignés d’un crépuscule d’aurore boréale perpétuelle.',
    icon: '🌙',
    bgGradient: 'from-[#1c0e2e] via-[#2d164a] to-[#0d0517]',
    accentColor: '#c084fc',
    borderColor: '#a855f7',
    particlesType: 'stars',
    routeNames: [
      'L’Archipel Onirique',
      'La Clairière de Cristal',
      'Le Dôme des Chimères',
      'L’Aurore Éternelle',
      'Le Monarque des Rêves (Boss)',
    ],
  },
  10: {
    id: 'biome_10_clockwork_citadel',
    index: 10,
    name: 'La Cité Mécanique',
    tagline: 'Des forges de cuivre où s’activent des automates séculaires.',
    description: 'Une forteresse de cuivre et de vapeur, animée par le battement perpétuel d’engrenages et de pistons géants.',
    icon: '⚙️',
    bgGradient: 'from-[#241308] via-[#381e0d] to-[#120803]',
    accentColor: '#f97316',
    borderColor: '#ea580c',
    particlesType: 'embers',
    routeNames: [
      'La Voie des Rouages',
      'L’Allée des Pistons',
      'La Fonderie de Vapeur',
      'L’Observatoire de Laiton',
      'L’Horloger Primordial (Boss)',
    ],
  },
};

/**
 * Générateur procédural pour tout biome au-delà du 10ème (évolutivité infinie)
 */
export function generateProceduralBiomeTemplate(biomeIndex: number): BiomeTemplate {
  if (EXTENDED_BIOME_TEMPLATES[biomeIndex]) {
    return EXTENDED_BIOME_TEMPLATES[biomeIndex];
  }

  const hue = ((biomeIndex * 47) % 360);
  const titles = [
    'L’Éther Stellaire',
    'Le Bosquet Astral',
    'L’Horizon Infini',
    'La Faille Cosmique',
    'Le Panthéon des Étoiles',
    'La Croisée des Dimensions',
  ];
  const name = `${titles[(biomeIndex - 11) % titles.length]} (Monde ${biomeIndex})`;
  const id = `biome_${biomeIndex}_astral_realm`;

  return {
    id,
    index: biomeIndex,
    name,
    tagline: `Un royaume indépendant né de la résonance du ${biomeIndex}e palier stellaire.`,
    description: `Une dimension mystique forgée par l'afflux continu de créations indépendantes dans le sanctuaire Hoot.`,
    icon: '✨',
    bgGradient: `from-[hsl(${hue},40%,6%)] via-[hsl(${hue},45%,12%)] to-[hsl(${hue},50%,3%)]`,
    accentColor: `hsl(${hue},80%,60%)`,
    borderColor: `hsl(${hue},75%,45%)`,
    particlesType: 'cosmic',
    routeNames: [
      `Sentier des Reliques ${biomeIndex}-1`,
      `Passe des Éclats ${biomeIndex}-2`,
      `Sanctuaire Astral ${biomeIndex}-3`,
      `Antichambre Cosmique ${biomeIndex}-4`,
      `Gardien Ancestral ${biomeIndex}-5 (Boss)`,
    ],
  };
}

/**
 * Calcul équilibré des PV de route pour n'importe quel biome (B >= 7)
 * Respecte le multiplicateur lissé continu d'environ 24x par biome
 */
export function calculateRouteHp(biomeIndex: number, routeNumber: number): number {
  if (biomeIndex <= 6) {
    // Rétrocompatibilité : ne pas toucher aux biomes 1 à 6
    const b6Hps = [500_000_000, 1_400_000_000, 3_800_000_000, 9_500_000_000, 45_000_000_000];
    return b6Hps[routeNumber - 1] || 100_000_000;
  }

  const baseB6Hps = [500_000_000, 1_400_000_000, 3_800_000_000, 9_500_000_000, 45_000_000_000];
  const exponent = biomeIndex - 6;
  const factor = Math.pow(24, exponent);
  return Math.round(baseB6Hps[routeNumber - 1] * factor);
}

/**
 * Calcul équilibré de la Sève de récompense par monstre pour n'importe quel biome (B >= 7)
 */
export function calculateRouteSap(biomeIndex: number, routeNumber: number): number {
  const hp = calculateRouteHp(biomeIndex, routeNumber);
  const divisor = routeNumber === 5 ? 27 : 26;
  return Math.max(10, Math.round(hp / divisor));
}

/**
 * Niveau de monstre progressif : 5 niveaux par biome
 */
export function calculateMonsterLevel(biomeIndex: number, routeNumber: number): number {
  return (biomeIndex - 1) * 5 + routeNumber;
}

/**
 * DPS intrinsèque apporté par chaque pépite du biome
 */
export function getBiomeDpsTier(biomeIndex: number): number {
  const STATIC_TIERS: Record<number, number> = {
    1: 2,
    2: 10,
    3: 50,
    4: 300,
    5: 2000,
    6: 15000,
  };
  if (STATIC_TIERS[biomeIndex]) {
    return STATIC_TIERS[biomeIndex];
  }
  // Facteur de croissance progressif et sain ~6.5x par biome
  return Math.floor(15000 * Math.pow(6.5, Math.max(0, biomeIndex - 6)));
}

/**
 * Construit un objet OdysseyBiome complet à partir d'un template
 */
export function createBiomeFromTemplate(template: BiomeTemplate): OdysseyBiome {
  return {
    id: template.id,
    index: template.index,
    name: template.name,
    tagline: template.tagline,
    description: template.description,
    icon: template.icon,
    bgGradient: template.bgGradient,
    accentColor: template.accentColor,
    borderColor: template.borderColor,
    particlesType: template.particlesType,
    routesCount: 5,
    unlockRequirement: {
      biomeIndex: template.index,
      starSapCost: 0, // Gratuit : déblocage sur simple victoire de boss
    },
  };
}

/**
 * Construit les 5 routes d'un biome étendu
 */
export function createRoutesForBiome(template: BiomeTemplate): OdysseyRoute[] {
  const routes: OdysseyRoute[] = [];
  const bIndex = template.index;

  for (let rNum = 1; rNum <= 5; rNum++) {
    const isBoss = rNum === 5;
    routes.push({
      id: `b${bIndex}_r${rNum}`,
      biomeId: template.id,
      routeNumber: rNum,
      name: template.routeNames[rNum - 1],
      requiredKillsToAdvance: isBoss ? 1 : 10,
      monsterLevel: calculateMonsterLevel(bIndex, rNum),
      baseHp: calculateRouteHp(bIndex, rNum),
      baseSapReward: calculateRouteSap(bIndex, rNum),
      isBossRoute: isBoss,
      ...(isBoss ? { bossTimerSeconds: 30 } : {}),
    });
  }

  return routes;
}

export const MIN_ORPHAN_GAMES_FOR_NEW_WORLD = 45;
export const GAMES_PER_ROUTE = 9;
export const ROUTES_PER_WORLD = 5;

/**
 * Affinités thématiques recommandées pour compléter les routes existantes de l'Odyssée
 */
export const THEMATIC_ROUTE_PREFERENCES: Record<string, string[]> = {
  // Biome 5 Route 3 : Roguelikes / Deckbuilders / Stratégie
  'b5_r3': ['caves-of-qud', 'downwell'],
  // Biome 5 Route 4 : Ambiance sombre / Horreur / Océan ténébreux
  'b5_r4': ['sunless-sea', 'ghost-song'],
  // Biome 5 Route 5 : Frénésie / Co-op canapé / Action délirante
  'b5_r5': ['towerfall-ascension', 'keep-talking-and-nobody-explodes'],
  // Biome 6 Route 1 : SF / Espace / Survie
  'b6_r1': ['risk-of-rain-2013'],
  // Biome 6 Route 2 : Survie / Craft / Colonie
  'b6_r2': ['rust'],
  // Biome 6 Route 3 : Narration / Enquête / Point & Click
  'b6_r3': ['unavowed', '80-days'],
  // Biome 6 Route 4 : Poésie / Émotion / Suites cultes (avec To the Moon)
  'b6_r4': ['finding-paradise'],
  // Biome 6 Route 5 : Frénésie / Violence rythmique / Défi
  'b6_r5': ['thumper', 'downwell', 'mark-of-the-ninja'],
};

/**
 * Synchronise et attribue automatiquement les pépites non mappées aux routes de l'Odyssée :
 * 1. Complète en priorité toutes les routes existantes qui ont moins de 9 pépites.
 * 2. Crée de nouveaux biomes UNIQUEMENT lorsqu'un quota complet de 45 pépites orphelines
 *    est atteint (5 routes × 9 pépites).
 * 3. Les pépites orphelines restantes (< 45) restent en réserve et masquées de l'Indiedex.
 */
export function synchronizeOdysseyMapping(
  allGames: Game[],
  existingMapping: Record<string, string[]>,
  minGamesForNewBiome: number = MIN_ORPHAN_GAMES_FOR_NEW_WORLD
): {
  updatedMapping: Record<string, string[]>;
  addedBiomesCount: number;
  addedGamesCount: number;
  unmappedGamesCount: number;
  changesSummary: string[];
} {
  const updatedMapping: Record<string, string[]> = { ...existingMapping };
  const mappedGameIds = new Set(Object.values(existingMapping).flat());
  const unmappedGames = allGames.filter((g) => !mappedGameIds.has(g.id));

  const changesSummary: string[] = [];
  let addedBiomesCount = 0;
  let addedGamesCount = 0;

  if (unmappedGames.length === 0) {
    return {
      updatedMapping,
      addedBiomesCount: 0,
      addedGamesCount: 0,
      unmappedGamesCount: 0,
      changesSummary: ['Toutes les pépites certifiées sont déjà assignées aux routes de l’Odyssée.'],
    };
  }

  // Déterminer le plus grand numéro de biome présent dans le mapping
  let highestBiomeIdx = 6;
  for (const routeId of Object.keys(existingMapping)) {
    const match = routeId.match(/^b(\d+)_/);
    if (match) {
      const idx = parseInt(match[1], 10);
      if (idx > highestBiomeIdx) highestBiomeIdx = idx;
    }
  }

  let remainingGames = [...unmappedGames];

  // 1. Compléter d'abord toutes les routes existantes qui ont moins de 9 pépites
  const sortedRouteKeys = Object.keys(updatedMapping).sort((a, b) => {
    const parse = (k: string) => {
      const m = k.match(/^b(\d+)_r(\d+)$/);
      return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : [999, 999];
    };
    const [bA, rA] = parse(a);
    const [bB, rB] = parse(b);
    return bA !== bB ? bA - bB : rA - rB;
  });

  for (const routeKey of sortedRouteKeys) {
    const routeGames = [...(updatedMapping[routeKey] || [])];
    while (routeGames.length < GAMES_PER_ROUTE && remainingGames.length > 0) {
      const preferred = THEMATIC_ROUTE_PREFERENCES[routeKey] || [];
      let candidateIdx = -1;
      for (const prefId of preferred) {
        const idx = remainingGames.findIndex((g) => g.id === prefId);
        if (idx !== -1) {
          candidateIdx = idx;
          break;
        }
      }
      if (candidateIdx === -1) {
        candidateIdx = 0;
      }
      const [chosen] = remainingGames.splice(candidateIdx, 1);
      routeGames.push(chosen.id);
      mappedGameIds.add(chosen.id);
      addedGamesCount += 1;
      changesSummary.push(
        `✨ Route ${routeKey} complétée (${routeGames.length}/${GAMES_PER_ROUTE}) avec : « ${chosen.title} »`
      );
    }
    updatedMapping[routeKey] = routeGames;
  }

  // Si on n'atteint pas le quota de 45 pépites orphelines, aucun nouveau monde n'est créé
  if (remainingGames.length < minGamesForNewBiome) {
    if (addedGamesCount > 0) {
      changesSummary.push(
        `🎉 Toutes les ${Object.keys(updatedMapping).length} routes existantes disposent désormais d’exactement ${GAMES_PER_ROUTE} pépites chacune.`
      );
    }
    if (remainingGames.length > 0) {
      changesSummary.push(
        `⏳ ${remainingGames.length} pépite(s) certifiée(s) orpheline(s) en attente. Un nouveau monde sera débloqué dès que le quota de ${minGamesForNewBiome} pépites sera atteint (5 routes × 9 pépites). Progression : ${remainingGames.length}/${minGamesForNewBiome}.`
      );
    }
    return {
      updatedMapping,
      addedBiomesCount: 0,
      addedGamesCount,
      unmappedGamesCount: remainingGames.length,
      changesSummary,
    };
  }

  // Tant qu'on a au moins 45 pépites orphelines, on crée un nouveau biome complet (5 routes × 9 pépites)
  while (remainingGames.length >= minGamesForNewBiome) {
    highestBiomeIdx += 1;
    addedBiomesCount += 1;
    const template = generateProceduralBiomeTemplate(highestBiomeIdx);

    // Initialiser les 5 routes du nouveau biome
    const newRouteKeys = [
      `b${highestBiomeIdx}_r1`,
      `b${highestBiomeIdx}_r2`,
      `b${highestBiomeIdx}_r3`,
      `b${highestBiomeIdx}_r4`,
      `b${highestBiomeIdx}_r5`,
    ];

    // Extraire exactement 45 pépites (9 pépites par route)
    const worldGames = remainingGames.slice(0, minGamesForNewBiome);
    remainingGames = remainingGames.slice(minGamesForNewBiome);

    for (let r = 0; r < ROUTES_PER_WORLD; r++) {
      const routeKey = newRouteKeys[r];
      const routeGames = worldGames.slice(r * GAMES_PER_ROUTE, (r + 1) * GAMES_PER_ROUTE);
      updatedMapping[routeKey] = routeGames.map((g) => g.id);
      routeGames.forEach((g) => mappedGameIds.add(g.id));
      addedGamesCount += routeGames.length;
    }

    changesSummary.push(
      `✨ Nouveau Biome créé : Monde ${highestBiomeIdx} « ${template.name} » avec 45 pépites (exactement 9 pépites réparties sur chacune des 5 routes).`
    );
  }

  // S'il reste des pépites orphelines (< 45), elles restent en attente pour le monde suivant
  if (remainingGames.length > 0) {
    changesSummary.push(
      `⏳ ${remainingGames.length} pépite(s) orpheline(s) restante(s) en attente pour le Monde ${highestBiomeIdx + 1} (${remainingGames.length}/${minGamesForNewBiome} nécessaires).`
    );
  }

  return {
    updatedMapping,
    addedBiomesCount,
    addedGamesCount,
    unmappedGamesCount: remainingGames.length,
    changesSummary,
  };
}
