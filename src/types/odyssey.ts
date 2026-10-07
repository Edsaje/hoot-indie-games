/**
 * 🌲 Hoot Indie Games — Types & Modèles de Données de l'Odyssée Sylvestre
 * Jeu Idle / Clicker persistant au cœur du sanctuaire des jeux indépendants.
 */

export type OdysseyBiomeId =
  | 'biome_1_clearing'
  | 'biome_2_pixel_canopy'
  | 'biome_3_crystal_caves'
  | 'biome_4_celestial_summit'
  | 'biome_5_infernal_abyss'
  | 'biome_6_cosmic_void'
  | (string & {});

export type CelestialBranch = 'vigor' | 'companions' | 'alchemy' | 'astronomy';

export interface OdysseyBiome {
  id: OdysseyBiomeId;
  index: number; // 1 à N
  name: string;
  tagline: string;
  description: string;
  icon: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  particlesType: 'spores' | 'pixels' | 'crystals' | 'snow' | 'embers' | 'cosmic' | 'glitch' | 'bubbles' | 'stars' | (string & {});
  routesCount: number;
  unlockRequirement: {
    biomeIndex: number;
    starSapCost: number;
  };
}

export interface OdysseyRoute {
  id: string; // ex: "biome_1_route_1"
  biomeId: OdysseyBiomeId;
  routeNumber: number; // 1 à 5 (la 5ème est le boss)
  name: string;
  requiredKillsToAdvance: number; // Habituellement 10
  monsterLevel: number;
  baseHp: number;
  baseSapReward: number;
  isBossRoute: boolean;
  bossTimerSeconds?: number; // 30s pour battre le boss
}

export interface OdysseyMonster {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  sapReward: number;
  isBoss: boolean;
  isWildEcho: boolean; // Écho d'un des 256 jeux indés certifiés
  gameId?: string; // ID du jeu indé si Écho
  isHolo: boolean; // Variante Shiny brillante (1/1024)
  artworkUrl?: string;
  emoji: string;
  title?: string; // Nom officiel du jeu
  developer?: string;
}

export interface DamagePopup {
  id: string;
  amount: number;
  isCrit: boolean;
  x: number; // Position relative %
  y: number;
  createdAt: number;
}

export interface CelestialUpgradeNode {
  id: string;
  branch: CelestialBranch;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number; // Ex: 1.15^N
  maxLevel: number;
  effectPerLevel: number;
  effectType:
    | 'click_power'
    | 'passive_dps'
    | 'sap_gain'
    | 'crit_chance'
    | 'crit_mult'
    | 'holo_rate'
    | 'offline_cap'
    | 'auto_click'
    | 'boss_damage'
    | 'duplicate_synergy'
    | 'boss_trophies'
    | 'boss_sap_bounty'
    | 'echo_spawn_rate';
  formatValue?: (level: number) => string;
}

export interface OdysseyPlayerStats {
  clickDamage: number;
  passiveDps: number;
  critChance: number;
  critMultiplier: number;
  sapMultiplier: number;
  holoChanceBonus: number;
  maxOfflineHours: number;
  bossDamageMultiplier: number;
  bossSapMultiplier: number;
  echoChanceBonus: number;
}

export interface CapturedGameCompanion {
  gameId: string;
  level: number;
  isHolo: boolean;
  capturedCount: number;
  dpsContribution: number;
  firstCapturedAt: string;
}

export type GoldenBuffType =
  | 'frenzy_click' // x7 dégâts clic
  | 'sap_rain' // Gain immédiat 15m de sève
  | 'time_freeze' // Timer des boss gelé
  | 'golden_feathers'; // Plumes d'or Hoot octroyées

export interface GoldenFireflyState {
  isActive: boolean;
  x: number; // % 5-90
  y: number; // % 10-80
  spawnTimestamp: number;
  buffActive?: {
    type: GoldenBuffType;
    durationRemaining: number;
    multiplier: number;
    label: string;
  };
}

export interface OdysseySaveState {
  version: 1;
  currentBiomeId: OdysseyBiomeId;
  currentRouteNumber: number; // 1 à 5
  autoAdvance: boolean;
  miniHudEnabled?: boolean; // Option : afficher le mini-widget flottant du jeu sur le site (désactivé par défaut)
  miniHudMobileEnabled?: boolean; // Rétrocompatibilité mobile
  highestBiomeUnlocked: number; // 1 à 6
  highestRouteUnlocked: Record<string, number>; // biomeId -> highest route unlocked (1-5)
  routeKills?: Record<string, number>; // routeId -> nombre d'ennemis vaincus sur cette route
  starSap: number;
  totalStarSapEarned: number;
  celestialShards: number; // Monnaie de réincarnation / prestige
  treeUpgrades: Record<string, number>; // nodeId -> currentLevel
  capturedGames: Record<string, { count: number; isHolo: boolean; level: number; firstCapturedAt?: string }>;
  activeCompanions: string[]; // Jusqu'à 6 pépites indés déployées en renfort
  stats: {
    totalClicks: number;
    totalDamageDealt: number;
    monstersDefeated: number;
    bossesDefeated: number;
    holosFound: number;
    firefliesCaught: number;
    rebirthsCount: number;
  };
  lastSavedAt: number; // Timestamp Date.now() pour calcul offline
}

export interface OfflineGainsSummary {
  elapsedSeconds: number;
  effectiveSeconds: number;
  starSapEarned: number;
  monstersDefeatedEstimate: number;
}
