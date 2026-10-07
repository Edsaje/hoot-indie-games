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
import routeMappingData from './odysseyRouteMapping.json';
import {
  generateProceduralBiomeTemplate,
  createBiomeFromTemplate,
  createRoutesForBiome,
  getBiomeDpsTier,
} from '../services/odysseyBiomeGenerator';
import {
  pickWildEchoForRoute,
  getRouteMastery,
  getGameArtwork,
  getGameBiomeIndex,
} from './odysseyRouteDex';

export const HOLO_BASE_PROBABILITY = 1 / 1024; // 1 chance sur 1024 par apparition

// -------------------------------------------------------------
// 1. LES BIOMES DE BASE DU SANCTUAIRE (MONDES 1 À 6)
// -------------------------------------------------------------
const BASE_ODYSSEY_BIOMES: OdysseyBiome[] = [
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
    unlockRequirement: { biomeIndex: 2, starSapCost: 0 },
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
    unlockRequirement: { biomeIndex: 3, starSapCost: 0 },
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
    unlockRequirement: { biomeIndex: 4, starSapCost: 0 },
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
    unlockRequirement: { biomeIndex: 5, starSapCost: 0 },
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
    unlockRequirement: { biomeIndex: 6, starSapCost: 0 },
  },
];

// -------------------------------------------------------------
// 2. LES ROUTES & PROGRESSIONS PAR BIOME (MONDES 1 À 6)
// -------------------------------------------------------------
const BASE_ODYSSEY_ROUTES: OdysseyRoute[] = [
  // Biome 1
  {
    id: 'b1_r1',
    biomeId: 'biome_1_clearing',
    routeNumber: 1,
    name: 'Le Sentier des Mousses',
    requiredKillsToAdvance: 10,
    monsterLevel: 1,
    baseHp: 40,
    baseSapReward: 4,
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
    baseSapReward: 10,
    isBossRoute: false,
  },
  {
    id: 'b1_r3',
    biomeId: 'biome_1_clearing',
    routeNumber: 3,
    name: 'La Clairière Oubliée',
    requiredKillsToAdvance: 10,
    monsterLevel: 3,
    baseHp: 260,
    baseSapReward: 24,
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
    baseSapReward: 55,
    isBossRoute: false,
  },
  {
    id: 'b1_r5',
    biomeId: 'biome_1_clearing',
    routeNumber: 5,
    name: 'Le Trône du Grand-Duc (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 5,
    baseHp: 2800,
    baseSapReward: 250,
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
    baseHp: 1400,
    baseSapReward: 110,
    isBossRoute: false,
  },
  {
    id: 'b2_r2',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 2,
    name: 'Le Défilé Chiptune',
    requiredKillsToAdvance: 10,
    monsterLevel: 7,
    baseHp: 3200,
    baseSapReward: 240,
    isBossRoute: false,
  },
  {
    id: 'b2_r3',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 3,
    name: 'La Clairière Glitchée',
    requiredKillsToAdvance: 10,
    monsterLevel: 8,
    baseHp: 7500,
    baseSapReward: 550,
    isBossRoute: false,
  },
  {
    id: 'b2_r4',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 4,
    name: 'La Canopée des Cartouches',
    requiredKillsToAdvance: 10,
    monsterLevel: 9,
    baseHp: 18000,
    baseSapReward: 1200,
    isBossRoute: false,
  },
  {
    id: 'b2_r5',
    biomeId: 'biome_2_pixel_canopy',
    routeNumber: 5,
    name: 'Le Boss de Fin de Niveau (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 10,
    baseHp: 75000,
    baseSapReward: 6000,
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
    baseHp: 35000,
    baseSapReward: 2500,
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
    baseSapReward: 5800,
    isBossRoute: false,
  },
  {
    id: 'b3_r3',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 3,
    name: 'Le Labyrinthe Bioluminescent',
    requiredKillsToAdvance: 10,
    monsterLevel: 13,
    baseHp: 200000,
    baseSapReward: 13000,
    isBossRoute: false,
  },
  {
    id: 'b3_r4',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 4,
    name: 'La Cathédrale de Quartz',
    requiredKillsToAdvance: 10,
    monsterLevel: 14,
    baseHp: 450000,
    baseSapReward: 28000,
    isBossRoute: false,
  },
  {
    id: 'b3_r5',
    biomeId: 'biome_3_crystal_caves',
    routeNumber: 5,
    name: 'Le Golem de Cristal (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 15,
    baseHp: 1800000,
    baseSapReward: 120000,
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
    baseHp: 800000,
    baseSapReward: 50000,
    isBossRoute: false,
  },
  {
    id: 'b4_r2',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 2,
    name: 'Le Col du Blizzard',
    requiredKillsToAdvance: 10,
    monsterLevel: 17,
    baseHp: 2000000,
    baseSapReward: 110000,
    isBossRoute: false,
  },
  {
    id: 'b4_r3',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 3,
    name: 'Le Sanctuaire de l’Aurore',
    requiredKillsToAdvance: 10,
    monsterLevel: 18,
    baseHp: 4500000,
    baseSapReward: 240000,
    isBossRoute: false,
  },
  {
    id: 'b4_r4',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 4,
    name: 'L’Arête des Fraises d’Or',
    requiredKillsToAdvance: 10,
    monsterLevel: 19,
    baseHp: 10000000,
    baseSapReward: 500000,
    isBossRoute: false,
  },
  {
    id: 'b4_r5',
    biomeId: 'biome_4_celestial_summit',
    routeNumber: 5,
    name: 'Le Spectre du Sommet (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 20,
    baseHp: 45000000,
    baseSapReward: 2200000,
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
    baseHp: 18000000,
    baseSapReward: 900000,
    isBossRoute: false,
  },
  {
    id: 'b5_r2',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 2,
    name: 'La Plaine des Cendres',
    requiredKillsToAdvance: 10,
    monsterLevel: 22,
    baseHp: 45000000,
    baseSapReward: 2000000,
    isBossRoute: false,
  },
  {
    id: 'b5_r3',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 3,
    name: 'L’Asphodèle Magmatique',
    requiredKillsToAdvance: 10,
    monsterLevel: 23,
    baseHp: 110000000,
    baseSapReward: 4500000,
    isBossRoute: false,
  },
  {
    id: 'b5_r4',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 4,
    name: 'Le Sanctuaire de Nyx',
    requiredKillsToAdvance: 10,
    monsterLevel: 24,
    baseHp: 260000000,
    baseSapReward: 10000000,
    isBossRoute: false,
  },
  {
    id: 'b5_r5',
    biomeId: 'biome_5_infernal_abyss',
    routeNumber: 5,
    name: 'Le Titan des Enfers (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 25,
    baseHp: 1200000000,
    baseSapReward: 50000000,
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
    baseHp: 500000000,
    baseSapReward: 20000000,
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
    baseSapReward: 50000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r3',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 3,
    name: 'Le Trou Noir Nomade',
    requiredKillsToAdvance: 10,
    monsterLevel: 28,
    baseHp: 3800000000,
    baseSapReward: 120000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r4',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 4,
    name: 'L’Horizon des Événements',
    requiredKillsToAdvance: 10,
    monsterLevel: 29,
    baseHp: 9500000000,
    baseSapReward: 280000000,
    isBossRoute: false,
  },
  {
    id: 'b6_r5',
    biomeId: 'biome_6_cosmic_void',
    routeNumber: 5,
    name: 'Le Gardien Cosmique du Sanctuaire (Boss)',
    requiredKillsToAdvance: 1,
    monsterLevel: 30,
    baseHp: 45000000000,
    baseSapReward: 1500000000,
    isBossRoute: true,
    bossTimerSeconds: 30,
  },
];

// -------------------------------------------------------------
// EXTENSION DYNAMIQUE DES BIOMES & ROUTES (MONDES 7+)
// -------------------------------------------------------------
const EXTENDED_BIOMES: OdysseyBiome[] = [];
const EXTENDED_ROUTES: OdysseyRoute[] = [];

// Analyse des identifiants de routes présents dans le mapping (ex: 'b7_r1' => biome 7)
const mappedBiomeIndices = new Set<number>();
for (const routeKey of Object.keys(routeMappingData)) {
  const match = routeKey.match(/^b(\d+)_/);
  if (match) {
    const idx = parseInt(match[1], 10);
    if (idx > 6) {
      mappedBiomeIndices.add(idx);
    }
  }
}

// Pour chaque biome étendu (7, 8, ...), instanciation de son modèle et de ses 5 routes
const sortedExtendedIndices = Array.from(mappedBiomeIndices).sort((a, b) => a - b);
for (const bIdx of sortedExtendedIndices) {
  const template = generateProceduralBiomeTemplate(bIdx);
  EXTENDED_BIOMES.push(createBiomeFromTemplate(template));
  EXTENDED_ROUTES.push(...createRoutesForBiome(template));
}

export const ODYSSEY_BIOMES: OdysseyBiome[] = [
  ...BASE_ODYSSEY_BIOMES,
  ...EXTENDED_BIOMES,
];

export const ODYSSEY_ROUTES: OdysseyRoute[] = [
  ...BASE_ODYSSEY_ROUTES,
  ...EXTENDED_ROUTES,
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
    effectPerLevel: 3, // +3 dégâts/clic par niveau
    effectType: 'click_power',
    formatValue: (lvl) => `+${lvl * 3} Dégâts/clic`,
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
  {
    id: 'vigor_boss_hunter',
    branch: 'vigor',
    name: 'Pourfendeur de Boss',
    description: 'Augmente substantiellement les dégâts infligés aux Boss et Gardiens de parcours.',
    icon: '⚔️',
    baseCost: 1200,
    costMultiplier: 1.25,
    maxLevel: 30,
    effectPerLevel: 0.1, // +10% dégâts Boss par niveau
    effectType: 'boss_damage',
    formatValue: (lvl) => `+${lvl * 10}% Dégâts Boss`,
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
    effectPerLevel: 3, // +3 DPS passif par niveau
    effectType: 'passive_dps',
    formatValue: (lvl) => `+${lvl * 3} DPS Passif`,
  },
  {
    id: 'comp_synergy',
    branch: 'companions',
    name: 'Alliance des Pépites',
    description: 'Chaque jeu indé capturé dans votre équipe augmente vos DPS de 0.1% supplémentaires par niveau.',
    icon: '🤝',
    baseCost: 2500,
    costMultiplier: 1.35,
    maxLevel: 25,
    effectPerLevel: 0.001,
    effectType: 'passive_dps',
    formatValue: (lvl) => `+${(lvl * 0.1).toFixed(1)}% DPS / Jeu`,
  },
  {
    id: 'comp_duplicate_resonance',
    branch: 'companions',
    name: 'Résonance des Doublons',
    description: 'Chaque doublon d’une pépite dans votre Indiedex accorde un bonus de DPS supplémentaire.',
    icon: '📚',
    baseCost: 3500,
    costMultiplier: 1.28,
    maxLevel: 25,
    effectPerLevel: 0.002, // +0.2% par doublon supplémentaire
    effectType: 'duplicate_synergy',
    formatValue: (lvl) => `+${(lvl * 0.2).toFixed(1)}% / Doublon`,
  },
  {
    id: 'comp_boss_trophies',
    branch: 'companions',
    name: 'Trophées des Gardiens',
    description: 'Chaque monde conquis de votre périple accorde un bonus permanent à toute votre équipe.',
    icon: '🏆',
    baseCost: 10000,
    costMultiplier: 1.35,
    maxLevel: 15,
    effectPerLevel: 0.03, // +3% DPS par biome conquis
    effectType: 'boss_trophies',
    formatValue: (lvl) => `+${lvl * 3}% DPS / Monde conquis`,
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
    id: 'alch_boss_bounty',
    branch: 'alchemy',
    name: 'Primes de Gardien',
    description: 'Multiplie la quantité de Sève Stellaire obtenue en terrassant les Boss.',
    icon: '💰',
    baseCost: 2500,
    costMultiplier: 1.25,
    maxLevel: 25,
    effectPerLevel: 0.2, // +20% Sève Boss par niveau
    effectType: 'boss_sap_bounty',
    formatValue: (lvl) => `+${lvl * 20}% Sève de Boss`,
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
    id: 'astro_echo_beacon',
    branch: 'astronomy',
    name: 'Balise des Échos',
    description: 'Augmente la probabilité de faire apparaître des Échos Indés sauvages sur les routes.',
    icon: '📡',
    baseCost: 8000,
    costMultiplier: 1.35,
    maxLevel: 10,
    effectPerLevel: 0.03, // +3% taux d'apparition échos
    effectType: 'echo_spawn_rate',
    formatValue: (lvl) => `+${lvl * 3}% Apparition Échos`,
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
 * Calcule le coût cumulé pour acheter plusieurs niveaux d'un coup (1x, 10x, 25x, etc.)
 */
export function calculateCumulativeUpgradeCost(
  node: CelestialUpgradeNode,
  currentLevel: number,
  count: number
): number {
  if (count <= 0) return 0;
  const maxPossible = Math.min(count, Math.max(0, node.maxLevel - currentLevel));
  let total = 0;
  for (let i = 0; i < maxPossible; i++) {
    total += calculateUpgradeCost(node, currentLevel + i);
  }
  return total;
}

/**
 * Calcule le nombre maximal de niveaux abordables pour un nœud avec la Sève disponible
 */
export function calculateMaxAffordableLevels(
  node: CelestialUpgradeNode,
  currentLevel: number,
  availableSap: number
): { count: number; cost: number } {
  if (availableSap <= 0 || currentLevel >= node.maxLevel) {
    return { count: 0, cost: 0 };
  }

  let count = 0;
  let totalCost = 0;

  while (currentLevel + count < node.maxLevel) {
    const nextCost = calculateUpgradeCost(node, currentLevel + count);
    if (totalCost + nextCost > availableSap) {
      break;
    }
    totalCost += nextCost;
    count++;
  }

  return { count, cost: totalCost };
}

/**
 * -------------------------------------------------------------
 * 4. PALIERS D'AMÉLIORATION (JALONS / MILESTONES)
 * -------------------------------------------------------------
 */

export interface NodeMilestoneInfo {
  currentMilestoneCount: number;
  milestoneMultiplier: number; // Multiplicateur cumulatif conféré par les paliers
  nextMilestoneLevel: number | null;
  progressToNext: number; // 0 à 100%
  prevMilestoneLevel: number;
}

/**
 * Calcule l'état des paliers franchis pour un nœud de l'Arbre Céleste.
 * Jalons universels : 10, 25, 50, 75, 100 (selon le niveau max du nœud).
 * Chaque jalon franchi apporte +20% (+0.2x multiplicateur multiplicatif).
 */
export function getNodeMilestoneInfo(level: number, maxLevel: number): NodeMilestoneInfo {
  const milestones = [10, 25, 50, 75, 100].filter((m) => m <= maxLevel);
  const reached = milestones.filter((m) => level >= m);
  const count = reached.length;

  const multiplier = 1 + count * 0.2; // +20% multiplicatif par jalon
  const next = milestones.find((m) => level < m) || null;
  const prev = reached.length > 0 ? reached[reached.length - 1] : 0;

  let progress = 100;
  if (next !== null) {
    const span = next - prev;
    const inSpan = Math.max(0, level - prev);
    progress = Math.min(100, Math.max(0, Math.round((inSpan / span) * 100)));
  }

  return {
    currentMilestoneCount: count,
    milestoneMultiplier: multiplier,
    nextMilestoneLevel: next,
    progressToNext: progress,
    prevMilestoneLevel: prev,
  };
}

/**
 * Paliers de Collection Globale d'Indiedex (256 pépites)
 */
export interface CollectionMilestone {
  requiredCount: number;
  dpsBonusPercent: number; // +X%
  sapBonusPercent: number; // +X%
  title: string;
}

export const COLLECTION_MILESTONES: CollectionMilestone[] = [
  { requiredCount: 10, dpsBonusPercent: 10, sapBonusPercent: 10, title: 'Amateur Curieux' },
  { requiredCount: 25, dpsBonusPercent: 20, sapBonusPercent: 20, title: 'Explorateur Sylvestre' },
  { requiredCount: 50, dpsBonusPercent: 40, sapBonusPercent: 35, title: 'Chasseur de Pépites' },
  { requiredCount: 100, dpsBonusPercent: 80, sapBonusPercent: 60, title: 'Mécène Indépendant' },
  { requiredCount: 150, dpsBonusPercent: 120, sapBonusPercent: 90, title: 'Conservateur Stellaire' },
  { requiredCount: 200, dpsBonusPercent: 180, sapBonusPercent: 130, title: 'Archiviste Suprême' },
  { requiredCount: 250, dpsBonusPercent: 250, sapBonusPercent: 180, title: 'Archiviste Légendaire' },
  { requiredCount: 270, dpsBonusPercent: 300, sapBonusPercent: 220, title: 'Maître Absolu du Sanctuaire' },
];

export function getCollectionMilestoneBonus(capturedCount: number): {
  activeMilestone: CollectionMilestone | null;
  nextMilestone: CollectionMilestone | null;
  dpsMultiplier: number;
  sapMultiplier: number;
  progressToNext: number;
} {
  let active: CollectionMilestone | null = null;
  for (const m of COLLECTION_MILESTONES) {
    if (capturedCount >= m.requiredCount) {
      active = m;
    } else {
      break;
    }
  }

  const next = COLLECTION_MILESTONES.find((m) => capturedCount < m.requiredCount) || null;
  const prevCount = active ? active.requiredCount : 0;

  let progress = 100;
  if (next) {
    const span = next.requiredCount - prevCount;
    const inSpan = Math.max(0, capturedCount - prevCount);
    progress = Math.min(100, Math.max(0, Math.round((inSpan / span) * 100)));
  }

  const dpsMultiplier = 1 + (active ? active.dpsBonusPercent / 100 : 0);
  const sapMultiplier = 1 + (active ? active.sapBonusPercent / 100 : 0);

  return {
    activeMilestone: active,
    nextMilestone: next,
    dpsMultiplier,
    sapMultiplier,
    progressToNext: progress,
  };
}

/**
 * DPS intrinsèque apporté par chaque pépite selon le palier du biome où elle est découverte
 */
export const BIOME_DPS_TIERS: Record<number, number> = {
  1: 2,
  2: 10,
  3: 50,
  4: 300,
  5: 2000,
  6: 15000,
};

/**
 * Calcule la contribution en DPS passif d'une pépite indé capturée
 */
export function calculateCompanionDps(
  gameId: string,
  entry: { count: number; isHolo: boolean },
  holoRadianceBonus: number = 0,
  extraDuplicateRatio: number = 0
): number {
  const biomeIndex = getGameBiomeIndex(gameId);
  const baseDps = getBiomeDpsTier(biomeIndex);
  const duplicateMultiplier = 1 + Math.max(0, entry.count - 1) * (0.05 + extraDuplicateRatio);
  const holoMultiplier = entry.isHolo ? 2 + holoRadianceBonus : 1;
  return Math.floor(baseDps * duplicateMultiplier * holoMultiplier);
}

/**
 * Génère un monstre aléatoire pour une route donnée (Monstre classique ou Écho Indé capturable)
 */
export function generateMonsterForRoute(
  route: OdysseyRoute,
  holoRateBonus: number = 0,
  capturedGames: Record<string, { count: number; isHolo: boolean }> = {},
  echoChanceBonus: number = 0
): OdysseyMonster {
  // Bonus de spawn si la route est maîtrisée à 100% (45% au lieu de 35%) + bonus de balise
  const mastery = getRouteMastery(route.id, capturedGames);
  const baseRate = mastery.isMastered ? 0.45 : 0.35;
  const echoChance = Math.min(0.85, baseRate + echoChanceBonus);
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
