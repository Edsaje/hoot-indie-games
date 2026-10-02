/**
 * 🌲 Hoot Indie Games — Service Moteur de Jeu de l'Odyssée Sylvestre
 * Gestion de l'état, de la boucle de combat, des améliorations et de la persistance locale/cloud.
 */

import type {
  OdysseySaveState,
  OdysseyPlayerStats,
  OdysseyMonster,
  OdysseyRoute,
  OdysseyBiomeId,
  OfflineGainsSummary,
} from '../types/odyssey';
import {
  ODYSSEY_BIOMES,
  ODYSSEY_ROUTES,
  CELESTIAL_TREE_UPGRADES,
  calculateUpgradeCost,
  generateMonsterForRoute,
} from '../data/odysseyData';

export const ODYSSEY_STORAGE_KEY = 'hoot_odyssey_save_v1';

/**
 * État initial d'un nouveau joueur arrivant dans l'Odyssée
 */
export function getDefaultOdysseyState(): OdysseySaveState {
  return {
    version: 1,
    currentBiomeId: 'biome_1_clearing',
    currentRouteNumber: 1,
    autoAdvance: false,
    highestBiomeUnlocked: 1,
    highestRouteUnlocked: {
      biome_1_clearing: 1,
      biome_2_pixel_canopy: 1,
      biome_3_crystal_caves: 1,
      biome_4_celestial_summit: 1,
      biome_5_infernal_abyss: 1,
      biome_6_cosmic_void: 1,
    },
    starSap: 0,
    totalStarSapEarned: 0,
    celestialShards: 0,
    routeKills: {},
    treeUpgrades: {},
    capturedGames: {},
    activeCompanions: [],
    stats: {
      totalClicks: 0,
      totalDamageDealt: 0,
      monstersDefeated: 0,
      bossesDefeated: 0,
      holosFound: 0,
      firefliesCaught: 0,
      rebirthsCount: 0,
    },
    lastSavedAt: Date.now(),
  };
}

/**
 * Charge l'état sauvegardé depuis le localStorage avec assainissement
 */
export function loadOdysseyState(): OdysseySaveState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultOdysseyState();
  }

  try {
    const raw = localStorage.getItem(ODYSSEY_STORAGE_KEY);
    if (!raw) return getDefaultOdysseyState();

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) {
      return getDefaultOdysseyState();
    }

    const defaultState = getDefaultOdysseyState();
    const currentBiomeId =
      parsed.currentBiomeId && ODYSSEY_BIOMES.some((b) => b.id === parsed.currentBiomeId)
        ? parsed.currentBiomeId
        : defaultState.currentBiomeId;
    const currentRouteNumber =
      typeof parsed.currentRouteNumber === 'number'
        ? Math.max(1, Math.min(5, Math.floor(parsed.currentRouteNumber)))
        : defaultState.currentRouteNumber;
    const autoAdvance =
      typeof parsed.autoAdvance === 'boolean' ? parsed.autoAdvance : defaultState.autoAdvance;

    return {
      ...defaultState,
      ...parsed,
      currentBiomeId,
      currentRouteNumber,
      autoAdvance,
      highestRouteUnlocked: {
        ...defaultState.highestRouteUnlocked,
        ...(parsed.highestRouteUnlocked || {}),
      },
      routeKills: { ...(parsed.routeKills || {}) },
      treeUpgrades: { ...(parsed.treeUpgrades || {}) },
      capturedGames: { ...(parsed.capturedGames || {}) },
      stats: {
        ...defaultState.stats,
        ...(parsed.stats || {}),
      },
    };
  } catch (err) {
    console.warn('[OdysseyEngine] Erreur chargement sauvegarde, utilisation défaut:', err);
    return getDefaultOdysseyState();
  }
}

/**
 * Sauvegarde l'état actuel dans le localStorage et émet un événement
 */
export function saveOdysseyState(state: OdysseySaveState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const toSave: OdysseySaveState = {
      ...state,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(ODYSSEY_STORAGE_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: toSave }));
  } catch (err) {
    console.warn('[OdysseyEngine] Erreur sauvegarde locale:', err);
  }
}

/**
 * Calcule les statistiques globales du joueur (dégâts, DPS, critiques, multiplicateurs)
 */
export function computePlayerStats(state: OdysseySaveState): OdysseyPlayerStats {
  const upgrades = state.treeUpgrades || {};

  // 1. Dégâts de clic
  const talonLevel = upgrades['vigor_talons'] || 0;
  const clickDamage = 10 + talonLevel * 5;

  // 2. Coups critiques
  const critStrikeLevel = upgrades['vigor_crit_strike'] || 0;
  const critMultLevel = upgrades['vigor_crit_mult'] || 0;
  const critChance = Math.min(0.75, 0.05 + critStrikeLevel * 0.01);
  const critMultiplier = 2.0 + critMultLevel * 0.25;

  // 3. DPS Passif (Chouettes + Synergies des 256 jeux capturés)
  const scoutLevel = upgrades['comp_scouts'] || 0;
  const baseDps = scoutLevel * 8;

  const capturedCount = Object.keys(state.capturedGames || {}).length;
  const synergyLevel = upgrades['comp_synergy'] || 0;
  const synergyBonus = 1 + capturedCount * (synergyLevel * 0.02);

  // Bonus Pépites Holographiques
  const holoCount = Object.values(state.capturedGames || {}).filter((g) => g.isHolo).length;
  const holoRadianceLevel = upgrades['comp_holo_radiance'] || 0;
  const holoMultiplier = 1 + holoCount * (holoRadianceLevel * 0.2);

  const passiveDps = Math.floor(baseDps * synergyBonus * holoMultiplier);

  // 4. Sève Stellaire
  const extractorLevel = upgrades['alch_extractor'] || 0;
  const sapMultiplier = 1 + extractorLevel * 0.08;

  // 5. Bonus taux Holographique
  const starlightLevel = upgrades['astro_starlight_sight'] || 0;
  const holoChanceBonus = starlightLevel * 0.25;

  // 6. Plafond hors-ligne
  const slumberLevel = upgrades['astro_owl_slumber'] || 0;
  const maxOfflineHours = 8 + slumberLevel * 2;

  return {
    clickDamage,
    passiveDps,
    critChance,
    critMultiplier,
    sapMultiplier,
    holoChanceBonus,
    maxOfflineHours,
  };
}

/**
 * Calcule les gains hors-ligne accumulés pendant l'absence du joueur
 */
export function calculateOfflineGains(
  lastSavedAt: number,
  playerStats: OdysseyPlayerStats,
  currentRoute: OdysseyRoute
): OfflineGainsSummary | null {
  const now = Date.now();
  if (lastSavedAt <= 0 || now <= lastSavedAt) return null;

  const elapsedSeconds = Math.floor((now - lastSavedAt) / 1000);
  if (elapsedSeconds < 30) return null; // Ignorer les rechargements rapides (< 30s)

  const maxSeconds = playerStats.maxOfflineHours * 3600;
  const effectiveSeconds = Math.min(elapsedSeconds, maxSeconds);

  // Si le joueur n'a aucun DPS passif, il ne génère rien hors-ligne
  if (playerStats.passiveDps <= 0) {
    return {
      elapsedSeconds,
      effectiveSeconds,
      starSapEarned: 0,
      monstersDefeatedEstimate: 0,
    };
  }

  // Estimation du nombre de monstres vaincus sur la route courante (hors boss)
  const monsterHp = Math.max(10, currentRoute.baseHp);
  const totalDamageSimulated = playerStats.passiveDps * effectiveSeconds;
  const monstersDefeatedEstimate = Math.floor(totalDamageSimulated / monsterHp);

  // Gain de Sève estimé
  const sapPerMonster = Math.max(1, currentRoute.baseSapReward) * playerStats.sapMultiplier;
  const starSapEarned = Math.floor(monstersDefeatedEstimate * sapPerMonster);

  return {
    elapsedSeconds,
    effectiveSeconds,
    starSapEarned,
    monstersDefeatedEstimate,
  };
}

/**
 * Récupère l'objet route actuel
 */
export function getCurrentRoute(biomeId: string, routeNumber: number): OdysseyRoute {
  const found = ODYSSEY_ROUTES.find((r) => r.biomeId === biomeId && r.routeNumber === routeNumber);
  return found || ODYSSEY_ROUTES[0];
}

/**
 * Récupère le biome actuel
 */
export function getCurrentBiome(biomeId: string) {
  const found = ODYSSEY_BIOMES.find((b) => b.id === biomeId);
  return found || ODYSSEY_BIOMES[0];
}

/**
 * Formate les nombres colossaux de jeu idle (K, M, B, T, Qa, Qi)
 */
export function formatOdysseyNumber(num: number): string {
  if (!isFinite(num) || num <= 0) return '0';
  if (num < 1000) return Math.floor(num).toLocaleString('fr-FR');

  const suffixes = ['', 'k', 'M', 'Mrd', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  const i = Math.floor(Math.log10(num) / 3);
  if (i >= suffixes.length) return num.toExponential(2);

  const formatted = (num / Math.pow(10, i * 3)).toFixed(1);
  return `${formatted.replace('.0', '')} ${suffixes[i]}`;
}

/**
 * Génère le prochain monstre sur une route
 */
export function spawnNextMonster(
  route: OdysseyRoute,
  holoChanceBonus: number = 0,
  capturedGames: Record<string, { count: number; isHolo: boolean }> = {}
): OdysseyMonster {
  return generateMonsterForRoute(route, holoChanceBonus, capturedGames);
}

/**
 * Effectue une attaque (clic ou passif) contre le monstre actif
 */
export function performAttack(
  monster: OdysseyMonster,
  playerStats: OdysseyPlayerStats,
  isClick: boolean = true,
  frenzyMultiplier: number = 1
): { damage: number; isCrit: boolean; nextHp: number; isKilled: boolean } {
  let damage = isClick ? playerStats.clickDamage : playerStats.passiveDps;
  damage *= frenzyMultiplier;

  let isCrit = false;
  if (isClick && Math.random() < playerStats.critChance) {
    isCrit = true;
    damage = Math.floor(damage * playerStats.critMultiplier);
  }

  damage = Math.max(1, Math.floor(damage));
  const nextHp = Math.max(0, monster.currentHp - damage);
  const isKilled = nextHp <= 0;

  return { damage, isCrit, nextHp, isKilled };
}

/**
 * Gère la victoire contre un monstre : récolte de sève, capture d'écho indé et progression
 */
export function defeatMonster(
  state: OdysseySaveState,
  monster: OdysseyMonster,
  playerStats: OdysseyPlayerStats,
  sapBuffMultiplier: number = 1
): { nextState: OdysseySaveState; sapGained: number; newlyCapturedGameTitle?: string } {
  const sapGained = Math.max(
    1,
    Math.floor(monster.sapReward * playerStats.sapMultiplier * sapBuffMultiplier)
  );

  let newlyCapturedGameTitle: string | undefined = undefined;
  const updatedCaptured = { ...(state.capturedGames || {}) };

  if (monster.isWildEcho && monster.gameId) {
    const existing = updatedCaptured[monster.gameId];
    if (!existing) {
      newlyCapturedGameTitle = monster.title || monster.name;
      updatedCaptured[monster.gameId] = {
        count: 1,
        isHolo: monster.isHolo,
        level: 1,
        firstCapturedAt: new Date().toISOString(),
      };
    } else {
      updatedCaptured[monster.gameId] = {
        ...existing,
        count: existing.count + 1,
        isHolo: existing.isHolo || monster.isHolo,
        level: existing.level + 1,
      };
    }
  }

  // Déblocage de la route suivante si c'est un boss ou franchissement
  const currentBiomeId = state.currentBiomeId;
  const currentRouteNum = state.currentRouteNumber;
  const currentRouteObj = getCurrentRoute(currentBiomeId, currentRouteNum);
  const currentRouteId = currentRouteObj.id;

  const currentRouteKills = (state.routeKills && state.routeKills[currentRouteId]) || 0;
  const nextRouteKills = currentRouteKills + 1;
  const updatedRouteKills = {
    ...(state.routeKills || {}),
    [currentRouteId]: nextRouteKills,
  };

  const highestForBiome = state.highestRouteUnlocked[currentBiomeId] || 1;
  const nextUnlockedRoute = monster.isBoss
    ? Math.min(5, highestForBiome)
    : Math.min(5, Math.max(highestForBiome, currentRouteNum + 1));

  const updatedRoutes = {
    ...state.highestRouteUnlocked,
    [currentBiomeId]: Math.max(highestForBiome, nextUnlockedRoute),
  };

  const nextState: OdysseySaveState = {
    ...state,
    starSap: state.starSap + sapGained,
    totalStarSapEarned: state.totalStarSapEarned + sapGained,
    highestRouteUnlocked: updatedRoutes,
    routeKills: updatedRouteKills,
    capturedGames: updatedCaptured,
    stats: {
      ...state.stats,
      monstersDefeated: state.stats.monstersDefeated + 1,
      bossesDefeated: monster.isBoss ? state.stats.bossesDefeated + 1 : state.stats.bossesDefeated,
      holosFound: monster.isHolo ? state.stats.holosFound + 1 : state.stats.holosFound,
    },
  };

  return { nextState, sapGained, newlyCapturedGameTitle };
}

/**
 * Achat d'une amélioration dans l'Arbre Céleste
 */
export function buyCelestialUpgrade(
  state: OdysseySaveState,
  nodeId: string
): { success: boolean; nextState: OdysseySaveState; error?: string } {
  const node = CELESTIAL_TREE_UPGRADES.find((u) => u.id === nodeId);
  if (!node) {
    return { success: false, nextState: state, error: 'Amélioration introuvable.' };
  }

  const currentLevel = state.treeUpgrades[nodeId] || 0;
  if (currentLevel >= node.maxLevel) {
    return { success: false, nextState: state, error: 'Niveau maximum atteint.' };
  }

  const cost = calculateUpgradeCost(node, currentLevel);
  if (state.starSap < cost) {
    return {
      success: false,
      nextState: state,
      error: `Sève insuffisante (${formatOdysseyNumber(cost)} requise).`,
    };
  }

  const nextState: OdysseySaveState = {
    ...state,
    starSap: state.starSap - cost,
    treeUpgrades: {
      ...state.treeUpgrades,
      [nodeId]: currentLevel + 1,
    },
  };

  saveOdysseyState(nextState);
  return { success: true, nextState };
}

/**
 * Change de route dans le biome actif
 */
export function switchRoute(state: OdysseySaveState, routeNumber: number): OdysseySaveState {
  const maxAvailable = state.highestRouteUnlocked[state.currentBiomeId] || 1;
  const safeRoute = Math.max(1, Math.min(maxAvailable, routeNumber));
  const nextState: OdysseySaveState = {
    ...state,
    currentRouteNumber: safeRoute,
  };
  saveOdysseyState(nextState);
  return nextState;
}

/**
 * Change de biome si débloqué
 */
export function switchBiome(state: OdysseySaveState, biomeId: OdysseyBiomeId): OdysseySaveState {
  const targetBiome = ODYSSEY_BIOMES.find((b) => b.id === biomeId);
  if (!targetBiome) return state;

  if (targetBiome.index > state.highestBiomeUnlocked) {
    return state; // Biome verrouillé
  }

  const highestRouteInTarget = state.highestRouteUnlocked[biomeId] || 1;
  const nextState: OdysseySaveState = {
    ...state,
    currentBiomeId: biomeId,
    currentRouteNumber: Math.min(highestRouteInTarget, state.currentRouteNumber),
  };
  saveOdysseyState(nextState);
  return nextState;
}

/**
 * Débloque un nouveau biome contre de la Sève Stellaire
 */
export function unlockBiome(
  state: OdysseySaveState,
  biomeId: OdysseyBiomeId
): { success: boolean; nextState: OdysseySaveState; error?: string } {
  const targetBiome = ODYSSEY_BIOMES.find((b) => b.id === biomeId);
  if (!targetBiome) {
    return { success: false, nextState: state, error: 'Biome introuvable.' };
  }

  if (targetBiome.index <= state.highestBiomeUnlocked) {
    return { success: true, nextState: state };
  }

  const cost = targetBiome.unlockRequirement.starSapCost;
  if (state.starSap < cost) {
    return {
      success: false,
      nextState: state,
      error: `Sève Stellaire insuffisante (${formatOdysseyNumber(cost)} requise).`,
    };
  }

  const nextState: OdysseySaveState = {
    ...state,
    starSap: state.starSap - cost,
    highestBiomeUnlocked: Math.max(state.highestBiomeUnlocked, targetBiome.index),
    currentBiomeId: biomeId,
    currentRouteNumber: 1,
    highestRouteUnlocked: {
      ...state.highestRouteUnlocked,
      [biomeId]: Math.max(state.highestRouteUnlocked[biomeId] || 1, 1),
    },
  };

  saveOdysseyState(nextState);
  return { success: true, nextState };
}

