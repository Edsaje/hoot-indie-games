/**
 * 🌲 Hoot Indie Games — Données de Configuration de l'Odyssée Sylvestre
 * Biomes, Routes, Arbre Céleste et Génération des Échos Indés.
 */

import type {
  OdysseyBiome,
  OdysseyBiomeId,
  OdysseyRoute,
  OdysseyMonster,
  CelestialUpgradeNode,
} from '../types/odyssey';
import { INDIE_GAMES } from './games';
import { pickWildEchoForRoute, getRouteMastery, getGameArtwork } from './odysseyRouteDex';

export const HOLO_BASE_PROBABILITY = 1 / 1024; // 1 chance sur 1024 par apparition

// -------------------------------------------------------------
// 1. LES 6 BIOMES DU SANCTUAIRE
// -------------------------------------------------------------
export const ODYSSEY_BIOMES: OdysseyBiome[] = [
  {
    id: 'biome_1_clearing',
    index: 1,
    name: 'La Clairière des Premiers Pas',
    tagline: 'L’orée de la forêt où tout voyage indépendant commence.',
    description: 'Une clairière tapissée de mousse et de fougères baignée par une lumière d’ambre rassurante.',
    icon: '🌸',
    bgGradient: 'from-[#041d15] via-[#062c20] to-[#02130d]',
    accentColor: '#10b981',
    borderColor: '#059669',
    particlesType: 'spores',
    routesCount: 5,
    unlockRequirement: { biomeIndex: 1, starSapCost: 0 },
  },
  {
    id: 'biome_2_pixel_canopy',
    index: 2,
    name: 'La Canopée des Pixels',
    tagline: 'Où le feuillage géométrique vibre aux sons des puces sonores 8-bit.',
    description: 'Une canopée suspendue où les lianes de code côtoient d’antiques cartouches de légendes.',
    icon: '👾',
    bgGradient: 'from-[#0d1f2d] via-[#102a3d] to-[#06121c]',
    accentColor: '#06b6d4',
    borderColor: '#0891b2',
    particlesType: 'pixels',
    routesCount: 5,
    unlockRequirement: { biomeIndex: 2, starSapCost: 5000 },
  },
  {
    id: 'biome_3_crystal_caves',
    index: 3,
    name: 'Les Grottes de Silice',
    tagline: 'Des profondeurs minérales illuminées par des géodes luminescentes.',
    description: 'D’immenses grottes souterraines taillées par des générations de mineurs et de pionniers indépendants.',
    icon: '💎',
    bgGradient: 'from-[#19112e] via-[#241744] to-[#0d071a]',
    accentColor: '#a855f7',
    borderColor: '#9333ea',
    particlesType: 'crystals',
    routesCount: 5,
    unlockRequirement: { biomeIndex: 3, starSapCost: 50000 },
  },
  {
    id: 'biome_4_celestial_summit',
    index: 4,
    name: 'Le Sommet Céleste',
    tagline: 'Grimpez au-dessus des nuages là où le vent murmure des défis extrêmes.',
    description: 'Un pic rocheux aux neiges étincelantes sous une aurore boréale inspirante (hommage à Celeste).',
    icon: '🏔️',
    bgGradient: 'from-[#162038] via-[#1e2f52] to-[#09101f]',
    accentColor: '#38bdf8',
    borderColor: '#0284c7',
    particlesType: 'snow',
    routesCount: 5,
    unlockRequirement: { biomeIndex: 4, starSapCost: 500000 },
  },
  {
    id: 'biome_5_infernal_abyss',
    index: 5,
    name: 'Le Gouffre des Enfers',
    tagline: 'Des failles de magma incandescent où les âmes forgent leur rédemption.',
    description: 'Un dédale de roche volcanique et de braises tourbillonnantes (hommage vibrant à Hades).',
    icon: '🔥',
    bgGradient: 'from-[#2e0e0e] via-[#451414] to-[#170505]',
    accentColor: '#f43f5e',
    borderColor: '#e11d48',
    particlesType: 'embers',
    routesCount: 5,
    unlockRequirement: { biomeIndex: 5, starSapCost: 5000000 },
  },
  {
    id: 'biome_6_cosmic_void',
    index: 6,
    name: 'Le Sanctuaire du Néant',
    tagline: 'L’ultime boucle stellaire aux confins de l’espace et du temps.',
    description: 'Une nébuleuse cosmique où gravitent les chefs-d’œuvre intemporels (hommage à Outer Wilds).',
    icon: '🌌',
    bgGradient: 'from-[#080517] via-[#150a2b] to-[#020108]',
    accentColor: '#f59e0b',
    borderColor: '#d97706',
    particlesType: 'cosmic',
    routesCount: 5,
    unlockRequirement: { biomeIndex: 6, starSapCost: 50000000 },
  },
];

// -------------------------------------------------------------
// 2. LES ROUTES & PROGRESSIONS PAR BIOME
// -------------------------------------------------------------
export const ODYSSEY_ROUTES: OdysseyRoute[] = [
  // Biome 1
  {
    id: 'b1_r1',
    biomeId: 'biome_1_clearing',
    routeNumber: 1,
    name: 'Le Sentier des Mousses',
    requiredKillsToAdvance: 10,
    monsterLevel: 1,
    baseHp: 40,
    baseSapReward: 6,
    isBossRoute: false,
  },
  {
    id: 'b1_r2',
    biomeId: 'biome_1_clearing',
    routeNumber: 2,
    name: 'L’Orée des Sous-Bois',
    requiredKillsToAdvance: 10,
    monsterLevel: 2,
    baseHp: 110,
    baseSapReward: 16,
    isBossRoute: false,
  },
  {
    id: 'b1_r3',
    biomeId: 'biome_1_clearing',
    routeNumber: 3,
    name: 'La Clairière Oubliée',
    requiredKillsToAdvance: 10,
    monsterLevel: 3,
    baseHp: 280,
    baseSapReward: 38,
    isBossRoute: false,
  },
  {
    id: 'b1_r4',
    biomeId: 'biome_1_clearing',
    routeNumber: 4,
    name: 'Le Bosquet des Lucioles',
    requiredKillsToAdvance: 10,
    monsterLevel: 4,
    baseHp: 650,
    baseSapReward: 85,
    isBossRoute: false,
  },
  {
    id: 'b1_r5',
    biomeId: 'biome_1_clearing',
    routeNumber: 5,
    name: 'Le Trône du Grand-Duc (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 5,
    baseHp: 2200,
    baseSapReward: 450,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },

  // Biome 2
  {
    id: 'b2_r1',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 1,
    name: 'La Branche 8-Bit',
    requiredKillsToAdvance: 10,
    monsterLevel: 6,
    baseHp: 1500,
    baseSapReward: 180,
    isBossRoute: false,
  },
  {
    id: 'b2_r2',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 2,
    name: 'Le Défilé Chiptune',
    requiredKillsToAdvance: 10,
    monsterLevel: 7,
    baseHp: 3400,
    baseSapReward: 380,
    isBossRoute: false,
  },
  {
    id: 'b2_r3',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 3,
    name: 'La Clairière Glitchée',
    requiredKillsToAdvance: 10,
    monsterLevel: 8,
    baseHp: 7800,
    baseSapReward: 820,
    isBossRoute: false,
  },
  {
    id: 'b2_r4',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 4,
    name: 'La Canopée des Cartouches',
    requiredKillsToAdvance: 10,
    monsterLevel: 9,
    baseHp: 17500,
    baseSapReward: 1750,
    isBossRoute: false,
  },
  {
    id: 'b2_r5',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 5,
    name: 'Le Boss de Fin de Niveau (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 10,
    baseHp: 55000,
    baseSapReward: 8500,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },

  // Biome 3
  {
    id: 'b3_r1',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 1,
    name: 'La Descente Minérale',
    requiredKillsToAdvance: 10,
    monsterLevel: 11,
    baseHp: 38000,
    baseSapReward: 3600,
    isBossRoute: false,
  },
  {
    id: 'b3_r2',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 2,
    name: 'La Faille Silicatée',
    requiredKillsToAdvance: 10,
    monsterLevel: 12,
    baseHp: 85000,
    baseSapReward: 7800,
    isBossRoute: false,
  },
  {
    id: 'b3_r3',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 3,
    name: 'Le Labyrinthe Bioluminescent',
    requiredKillsToAdvance: 10,
    monsterLevel: 13,
    baseHp: 190000,
    baseSapReward: 16500,
    isBossRoute: false,
  },
  {
    id: 'b3_r4',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 4,
    name: 'La Cathédrale de Quartz',
    requiredKillsToAdvance: 10,
    monsterLevel: 14,
    baseHp: 420000,
    baseSapReward: 35000,
    isBossRoute: false,
  },
  {
    id: 'b3_r5',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 5,
    name: 'Le Golem de Cristal (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 15,
    baseHp: 1350000,
    baseSapReward: 150000,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },

  // Biome 4
  {
    id: 'b4_r1',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 1,
    name: 'Les Pentes Enneigées',
    requiredKillsToAdvance: 10,
    monsterLevel: 16,
    baseHp: 950000,
    baseSapReward: 75000,
    isBossRoute: false,
  },
  {
    id: 'b4_r2',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 2,
    name: 'Le Col du Blizzard',
    requiredKillsToAdvance: 10,
    monsterLevel: 17,
    baseHp: 2100000,
    baseSapReward: 160000,
    isBossRoute: false,
  },
  {
    id: 'b4_r3',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 3,
    name: 'Le Sanctuaire de l’Aurore',
    requiredKillsToAdvance: 10,
    monsterLevel: 18,
    baseHp: 4600000,
    baseSapReward: 340000,
    isBossRoute: false,
  },
  {
    id: 'b4_r4',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 4,
    name: 'L’Arête des Fraises d’Or',
    requiredKillsToAdvance: 10,
    monsterLevel: 19,
    baseHp: 10200000,
    baseSapReward: 720000,
    isBossRoute: false,
  },
  {
    id: 'b4_r5',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 5,
    name: 'Le Spectre du Sommet (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 20,
    baseHp: 32000000,
    baseSapReward: 3200000,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },

  // Biome 5
  {
    id: 'b5_r1',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 1,
    name: 'Les Berges du Styx',
    requiredKillsToAdvance: 10,
    monsterLevel: 21,
    baseHp: 24000000,
    baseSapReward: 1600000,
    isBossRoute: false,
  },
  {
    id: 'b5_r2',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 2,
    name: 'La Plaine des Cendres',
    requiredKillsToAdvance: 10,
    monsterLevel: 22,
    baseHp: 52000000,
    baseSapReward: 3400000,
    isBossRoute: false,
  },
  {
    id: 'b5_r3',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 3,
    name: 'L’Asphodèle Magmatique',
    requiredKillsToAdvance: 10,
    monsterLevel: 23,
    baseHp: 115000000,
    baseSapReward: 7200000,
    isBossRoute: false,
  },
  {
    id: 'b5_r4',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 4,
    name: 'Le Sanctuaire de Nyx',
    requiredKillsToAdvance: 10,
    monsterLevel: 24,
    baseHp: 250000000,
    baseSapReward: 15000000,
    isBossRoute: false,
  },
  {
    id: 'b5_r5',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 5,
    name: 'Le Titan des Enfers (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 25,
    baseHp: 800000000,
    baseSapReward: 75000000,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },

  // Biome 6
  {
    id: 'b6_r1',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 1,
    name: 'L’Orbite de l’Œil',
    requiredKillsToAdvance: 10,
    monsterLevel: 26,
    baseHp: 600000000,
    baseSapReward: 35000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r2',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 2,
    name: 'La Comète Prisonnière',
    requiredKillsToAdvance: 10,
    monsterLevel: 27,
    baseHp: 1400000000,
    baseSapReward: 80000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r3',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 3,
    name: 'Le Trou Noir Nomade',
    requiredKillsToAdvance: 10,
    monsterLevel: 28,
    baseHp: 3200000000,
    baseSapReward: 180000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r4',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 4,
    name: 'L’Horizon des Événements',
    requiredKillsToAdvance: 10,
    monsterLevel: 29,
    baseHp: 7500000000,
    baseSapReward: 420000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r5',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 5,
    name: 'Le Gardien Cosmique du Sanctuaire (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 30,
    baseHp: 25000000000,
    baseSapReward: 2000000000,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },
];

// -------------------------------------------------------------
// 3. ARBRE CÉLESTE (COMPÉTENCES & TALENTS)
// -------------------------------------------------------------
export const CELESTIAL_TREE_UPGRADES: CelestialUpgradeNode[] = [
  // Branche 1 : Vigueur (Puissance de Clic)
  {
    id: 'vigor_talons',
    branch: 'vigor',
    name: 'Serres d’Acier',
    description: 'Augmente les dégâts de base infligés à chaque clic.',
    icon: '🦅',
    baseCost: 20,
    costMultiplier: 1.15,
    maxLevel: 100,
    effectPerLevel: 5, // +5 dégâts/clic par niveau
    effectType: 'click_power',
    formatValue: (lvl) => `+${lvl * 5} Dégâts/clic`,
  },
  {
    id: 'vigor_crit_strike',
    branch: 'vigor',
    name: 'Regard Perçant',
    description: 'Augmente vos chances de porter un coup critique dévastateur.',
    icon: '👁️',
    baseCost: 150,
    costMultiplier: 1.25,
    maxLevel: 40,
    effectPerLevel: 0.01, // +1% chance critique par niveau
    effectType: 'crit_chance',
    formatValue: (lvl) => `+${lvl}% Chance Crit`,
  },
  {
    id: 'vigor_crit_mult',
    branch: 'vigor',
    name: 'Impact Stellaire',
    description: 'Augmente le multiplicateur des coups critiques.',
    icon: '⚡',
    baseCost: 800,
    costMultiplier: 1.3,
    maxLevel: 30,
    effectPerLevel: 0.25, // +25% multiplicateur de crit
    effectType: 'crit_mult',
    formatValue: (lvl) => `x${(2 + lvl * 0.25).toFixed(2)} Dégâts Crit`,
  },

  // Branche 2 : Compagnons (DPS Passif & Pépites Déployées)
  {
    id: 'comp_scouts',
    branch: 'companions',
    name: 'Chouettes Éclaireuses',
    description: 'Invoque des chouettes alliées qui attaquent automatiquement vos cibles.',
    icon: '🦉',
    baseCost: 50,
    costMultiplier: 1.16,
    maxLevel: 100,
    effectPerLevel: 8, // +8 DPS passif par niveau
    effectType: 'passive_dps',
    formatValue: (lvl) => `+${lvl * 8} DPS Passif`,
  },
  {
    id: 'comp_synergy',
    branch: 'companions',
    name: 'Alliance des Pépites',
    description: 'Chaque jeu indé capturé dans votre équipe augmente vos DPS de 2% supplémentaires.',
    icon: '🤝',
    baseCost: 2500,
    costMultiplier: 1.35,
    maxLevel: 25,
    effectPerLevel: 0.02,
    effectType: 'passive_dps',
    formatValue: (lvl) => `+${lvl * 2}% DPS / Jeu`,
  },
  {
    id: 'comp_holo_radiance',
    branch: 'companions',
    name: 'Éclat Holographique',
    description: 'Les Pépites Shiny (Holographiques) confèrent un bonus passif doublé.',
    icon: '✨',
    baseCost: 15000,
    costMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 0.2, // +20% puissance des Holos
    effectType: 'passive_dps',
    formatValue: (lvl) => `+${lvl * 20}% Puissance Holo`,
  },

  // Branche 3 : Alchimie (Économie de Sève & Lucioles)
  {
    id: 'alch_extractor',
    branch: 'alchemy',
    name: 'Extracteur de Sève',
    description: 'Augmente la quantité de Sève Stellaire obtenue sur chaque ennemi vaincu.',
    icon: '💧',
    baseCost: 35,
    costMultiplier: 1.14,
    maxLevel: 100,
    effectPerLevel: 0.08, // +8% Sève par niveau
    effectType: 'sap_gain',
    formatValue: (lvl) => `+${(lvl * 8)}% Sève`,
  },
  {
    id: 'alch_firefly_charm',
    branch: 'alchemy',
    name: 'Pollen Féerique',
    description: 'Attire plus souvent la Luciole Dorée sur votre écran.',
    icon: '🪲',
    baseCost: 1200,
    costMultiplier: 1.25,
    maxLevel: 20,
    effectPerLevel: 0.05, // +5% fréquence de luciole
    effectType: 'sap_gain',
    formatValue: (lvl) => `+${lvl * 5}% Lucioles`,
  },

  // Branche 4 : Astronomie (Hors-Ligne & Shinies)
  {
    id: 'astro_owl_slumber',
    branch: 'astronomy',
    name: 'Sommeil de la Chouette',
    description: 'Augmente le plafond maximal de récolte en veille hors-ligne (base 8h, jusqu’à 24h).',
    icon: '🌙',
    baseCost: 3500,
    costMultiplier: 1.4,
    maxLevel: 8,
    effectPerLevel: 2, // +2h par niveau (8h + 8*2 = 24h max)
    effectType: 'offline_cap',
    formatValue: (lvl) => `${8 + lvl * 2}h Max Hors-Ligne`,
  },
  {
    id: 'astro_starlight_sight',
    branch: 'astronomy',
    name: 'Œil du Sanctuaire',
    description: 'Augmente vos chances de rencontrer des Pépites Holographiques rares (Shinies).',
    icon: '🌟',
    baseCost: 20000,
    costMultiplier: 1.6,
    maxLevel: 5,
    effectPerLevel: 0.25, // +25% chance holo
    effectType: 'holo_rate',
    formatValue: (lvl) => `+${lvl * 25}% Chance Holo`,
  },
  {
    id: 'astro_whispering_wind',
    branch: 'astronomy',
    name: 'Souffle Sylvestre',
    description: 'Déclenche des clics automatiques permanents, même sans interaction.',
    icon: '🍃',
    baseCost: 10000,
    costMultiplier: 1.45,
    maxLevel: 10,
    effectPerLevel: 1, // 1 clic auto / seconde par niveau
    effectType: 'auto_click',
    formatValue: (lvl) => `${lvl} Clics/sec permanents`,
  },
];

// -------------------------------------------------------------
// 4. GÉNÉRATEURS DE MONSTRES & ÉCHOS SAUVAGES
// -------------------------------------------------------------
const BIOME_MONSTER_NAMES: Record<OdysseyBiomeId, { names: string[]; emojis: string[] }> = {
  biome_1_clearing: {
    names: [
      'Limace de Résine',
      'Scarabée d’Écorce',
      'Écureuil des Sous-Bois',
      'Fleur Vénéneuse',
      'Hérisson Sauvage',
      'Esprit du Chêne',
      'Mousse Vivante',
      'Champignon Lumineux',
    ],
    emojis: ['🐛', '🪲', '🐿️', '🌺', '🦔', '🌿', '🍄', '🌱'],
  },
  biome_2_pixel_canopy: {
    names: [
      'Pixel Égaré',
      'Glitch Rampant',
      'Sprite Agressif',
      'Blob 8-Bit',
      'Spectre Chiptune',
      'Bug de Collision',
      'Lutin d’Arcade',
    ],
    emojis: ['👾', '🕹️', '💾', '🟩', '🧩', '⚡', '🎮'],
  },
  biome_3_crystal_caves: {
    names: [
      'Chauve-Souris d’Obsidienne',
      'Géode Mouvante',
      'Taupe Cristalline',
      'Stalactite Rampante',
      'Spectre de Silice',
      'Glaçon de Saphir',
    ],
    emojis: ['🦇', '💎', '🪨', '🔮', '🧊', '⛏️'],
  },
  biome_4_celestial_summit: {
    names: [
      'Corbeau des Glaces',
      'Loup des Brumes',
      'Aigle des Hauteurs',
      'Fée du Blizzard',
      'Spectre d’Altitude',
      'Yéti Miniature',
    ],
    emojis: ['🦅', '🐺', '❄️', '🧚', '🌨️', '🏔️'],
  },
  biome_5_infernal_abyss: {
    names: [
      'Gargouille de Lave',
      'Scorpion de Braise',
      'Crâne Ardent',
      'Démon Cendré',
      'Molosse des Enfers',
      'Salamandre de Feu',
    ],
    emojis: ['🔥', '💀', '🦂', '👹', '🌋', '🗡️'],
  },
  biome_6_cosmic_void: {
    names: [
      'Astéroïde Vivant',
      'Comète Errant',
      'Ombre Stellaire',
      'Fragment Temporel',
      'Entité du Trou Noir',
      'Chimère des Étoiles',
    ],
    emojis: ['🌌', '☄️', '🌠', '⏳', '🪐', '✨'],
  },
};

/**
 * Calcule le coût d'amélioration d'un nœud de l'Arbre Céleste au niveau N
 */
export function calculateUpgradeCost(node: CelestialUpgradeNode, currentLevel: number): number {
  return Math.floor(node.baseCost * Math.pow(node.costMultiplier, currentLevel));
}

/**
 * Génère un monstre aléatoire pour une route donnée (Monstre classique ou Écho Indé capturable)
 */
export function generateMonsterForRoute(
  route: OdysseyRoute,
  holoRateBonus: number = 0,
  capturedGames: Record<string, { count: number; isHolo: boolean }> = {}
): OdysseyMonster {
  // Bonus de spawn si la route est maîtrisée à 100% (45% au lieu de 35%)
  const mastery = getRouteMastery(route.id, capturedGames);
  const echoChance = mastery.isMastered ? 0.45 : 0.35;
  const isWildEcho = !route.isBossRoute && Math.random() < echoChance;
  
  // Tirage Shiny / Holo
  const holoThreshold = HOLO_BASE_PROBABILITY * (1 + holoRateBonus);
  const isHolo = Math.random() < holoThreshold;

  // Calcul PV et récompense avec légère variance (+- 10%) et bonus de maîtrise (+15% de sève)
  const variance = 0.9 + Math.random() * 0.2;
  const maxHp = Math.max(10, Math.floor(route.baseHp * variance));
  const sapMultiplier = (isHolo ? 3 : 1) * mastery.sapMultiplierBonus;
  const sapReward = Math.max(1, Math.floor(route.baseSapReward * variance * sapMultiplier));

  if (route.isBossRoute) {
    const bossEchoGame = pickWildEchoForRoute(route.id);
    const bossArtwork = bossEchoGame ? getGameArtwork(bossEchoGame) : undefined;

    return {
      id: `boss_${route.id}_${Date.now()}`,
      name: bossEchoGame ? `Gardien : ${bossEchoGame.title}` : route.name,
      maxHp: route.baseHp,
      currentHp: route.baseHp,
      sapReward: Math.floor(sapReward * 2),
      isBoss: true,
      isWildEcho: Boolean(bossEchoGame),
      gameId: bossEchoGame?.id,
      isHolo,
      artworkUrl: bossArtwork,
      emoji: '👑',
      title: bossEchoGame?.title || route.name,
      developer: bossEchoGame?.developer,
    };
  }

  if (isWildEcho) {
    const pickedGame =
      pickWildEchoForRoute(route.id) ||
      INDIE_GAMES[Math.floor(Math.random() * INDIE_GAMES.length)];
    const artworkUrl = getGameArtwork(pickedGame);

    return {
      id: `echo_${pickedGame.id}_${Date.now()}`,
      name: `Écho de ${pickedGame.title}`,
      maxHp,
      currentHp: maxHp,
      sapReward: Math.floor(sapReward * 1.5),
      isBoss: false,
      isWildEcho: true,
      gameId: pickedGame.id,
      isHolo,
      artworkUrl,
      emoji: isHolo ? '✨' : '🎮',
      title: pickedGame.title,
      developer: pickedGame.developer,
    };
  }

  // Monstre standard du biome
  const biomeData = BIOME_MONSTER_NAMES[route.biomeId] || BIOME_MONSTER_NAMES.biome_1_clearing;
  const nameIndex = Math.floor(Math.random() * biomeData.names.length);
  const name = biomeData.names[nameIndex];
  const emoji = biomeData.emojis[nameIndex] || '🦉';

  return {
    id: `mob_${route.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: isHolo ? `${name} (Holo)` : name,
    maxHp,
    currentHp: maxHp,
    sapReward,
    isBoss: false,
    isWildEcho: false,
    isHolo,
    emoji,
  };
}
