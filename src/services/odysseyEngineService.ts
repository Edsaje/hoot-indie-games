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
  calculateCumulativeUpgradeCost,
  calculateMaxAffordableLevels,
  calculateCompanionDps,
  generateMonsterForRoute,
  getNodeMilestoneInfo,
  getCollectionMilestoneBonus,
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
    miniHudEnabled: false,
    miniHudMobileEnabled: false,
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
    const miniHudEnabled =
      typeof parsed.miniHudEnabled === 'boolean'
        ? parsed.miniHudEnabled
        : typeof parsed.miniHudMobileEnabled === 'boolean'
        ? parsed.miniHudMobileEnabled
        : (typeof window !== 'undefined' && localStorage.getItem('hoot_odyssey_hud_enabled') === 'true');

    return {
      ...defaultState,
      ...parsed,
      currentBiomeId,
      currentRouteNumber,
      autoAdvance,
      miniHudEnabled,
      miniHudMobileEnabled: miniHudEnabled,
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
 * Réinitialise complètement l'état de l'Odyssée Sylvestre à zéro (Hard Reset)
 */
export function resetOdysseySaveState(): OdysseySaveState {
  const freshState = getDefaultOdysseyState();
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(ODYSSEY_STORAGE_KEY, JSON.stringify(freshState));
      window.dispatchEvent(new CustomEvent('hoot_odyssey_updated', { detail: { ...freshState, reset: true } }));
    } catch (err) {
      console.warn('[OdysseyEngine] Erreur réinitialisation sauvegarde locale:', err);
    }
  }
  return freshState;
}

/**
 * Calcule les statistiques globales du joueur (dégâts, DPS, critiques, multiplicateurs)
 */
export function computePlayerStats(state: OdysseySaveState): OdysseyPlayerStats {
  const upgrades = state.treeUpgrades || {};

  // 1. Paliers de Collection Globale d'Indiedex
  const capturedEntries = Object.entries(state.capturedGames || {});
  const capturedCount = capturedEntries.length;
  const collectionBonus = getCollectionMilestoneBonus(capturedCount);

  // 2. Trophées des Boss (basé sur le nombre de biomes uniques conquis : 0 à 5)
  const trophiesLevel = upgrades['comp_boss_trophies'] || 0;
  const trophiesMilestone = getNodeMilestoneInfo(trophiesLevel, 15);
  const uniqueBosses = Math.min(6, Math.max(0, (state.highestBiomeUnlocked || 1) - 1));
  const bossTrophyMultiplier = 1 + (uniqueBosses * (trophiesLevel * 0.03)) * trophiesMilestone.milestoneMultiplier;

  // 3. Coups critiques
  const critStrikeLevel = upgrades['vigor_crit_strike'] || 0;
  const critStrikeMilestone = getNodeMilestoneInfo(critStrikeLevel, 40);
  const critMultLevel = upgrades['vigor_crit_mult'] || 0;
  const critMultMilestone = getNodeMilestoneInfo(critMultLevel, 30);
  const critChance = Math.min(0.75, 0.05 + (critStrikeLevel * 0.01) * critStrikeMilestone.milestoneMultiplier);
  const critMultiplier = 2.0 + (critMultLevel * 0.25) * critMultMilestone.milestoneMultiplier;

  // 4. Synergie des doublons
  const dupResonanceLevel = upgrades['comp_duplicate_resonance'] || 0;
  const dupResonanceMilestone = getNodeMilestoneInfo(dupResonanceLevel, 25);
  const extraDuplicateRatio = (dupResonanceLevel * 0.002) * dupResonanceMilestone.milestoneMultiplier;

  // 5. DPS Passif (Chouettes Éclaireuses + DPS Intrinsèque des 256 jeux capturés)
  const scoutLevel = upgrades['comp_scouts'] || 0;
  const scoutMilestone = getNodeMilestoneInfo(scoutLevel, 100);
  const scoutDps = (scoutLevel * 3) * scoutMilestone.milestoneMultiplier;

  const synergyLevel = upgrades['comp_synergy'] || 0;
  const synergyMilestone = getNodeMilestoneInfo(synergyLevel, 25);
  const synergyBonus = 1 + capturedCount * ((synergyLevel * 0.001) * synergyMilestone.milestoneMultiplier);

  const holoRadianceLevel = upgrades['comp_holo_radiance'] || 0;
  const holoRadianceMilestone = getNodeMilestoneInfo(holoRadianceLevel, 10);
  const holoRadianceBonus = (holoRadianceLevel * 0.2) * holoRadianceMilestone.milestoneMultiplier;

  // Sommer les dégâts intrinsèques de toutes les pépites capturées
  let companionsRawDps = 0;
  for (const [gameId, entry] of capturedEntries) {
    companionsRawDps += calculateCompanionDps(gameId, entry, holoRadianceBonus, extraDuplicateRatio);
  }

  // Multiplicateur Prestige Éclats Célestes (+10% par éclat)
  const shardsMultiplier = 1 + (state.celestialShards || 0) * 0.10;

  // Total DPS Passif avec boosts de collection et de trophées de boss
  const rawPassiveDps = Math.floor((scoutDps + companionsRawDps) * synergyBonus);
  const passiveDps = Math.floor(rawPassiveDps * shardsMultiplier * collectionBonus.dpsMultiplier * bossTrophyMultiplier);

  // 6. Dégâts de clic manuel (Base + Serres + Transmission saine du DPS passif sans double compte multiplicatif)
  const talonLevel = upgrades['vigor_talons'] || 0;
  const talonMilestone = getNodeMilestoneInfo(talonLevel, 100);
  const talonDamage = (talonLevel * 3) * talonMilestone.milestoneMultiplier;
  const baseClick = 5 + talonDamage;
  const clickDamageFromBase = Math.floor(baseClick * shardsMultiplier * collectionBonus.dpsMultiplier * bossTrophyMultiplier);
  const passiveTransferRatio = Math.min(0.1, (talonLevel * 0.001) * talonMilestone.milestoneMultiplier);
  const passiveTransferredToClick = Math.floor(passiveDps * passiveTransferRatio);
  const clickDamage = Math.max(1, clickDamageFromBase + passiveTransferredToClick);

  // 7. Pourfendeur de Boss
  const bossHunterLevel = upgrades['vigor_boss_hunter'] || 0;
  const bossHunterMilestone = getNodeMilestoneInfo(bossHunterLevel, 30);
  const bossDamageMultiplier = 1 + (bossHunterLevel * 0.10) * bossHunterMilestone.milestoneMultiplier;

  // 8. Sève Stellaire (Extracteur + Paliers + Primes de boss + Jalon de collection)
  const extractorLevel = upgrades['alch_extractor'] || 0;
  const extractorMilestone = getNodeMilestoneInfo(extractorLevel, 100);
  const rawSapMultiplier = 1 + (extractorLevel * 0.08) * extractorMilestone.milestoneMultiplier;
  const sapMultiplier = rawSapMultiplier * collectionBonus.sapMultiplier;

  const bossBountyLevel = upgrades['alch_boss_bounty'] || 0;
  const bossBountyMilestone = getNodeMilestoneInfo(bossBountyLevel, 25);
  const bossSapMultiplier = 1 + (bossBountyLevel * 0.20) * bossBountyMilestone.milestoneMultiplier;

  // 9. Bonus taux Holographique
  const starlightLevel = upgrades['astro_starlight_sight'] || 0;
  const starlightMilestone = getNodeMilestoneInfo(starlightLevel, 5);
  const holoChanceBonus = (starlightLevel * 0.25) * starlightMilestone.milestoneMultiplier;

  // 10. Balise des Échos
  const echoBeaconLevel = upgrades['astro_echo_beacon'] || 0;
  const echoBeaconMilestone = getNodeMilestoneInfo(echoBeaconLevel, 10);
  const echoChanceBonus = (echoBeaconLevel * 0.03) * echoBeaconMilestone.milestoneMultiplier;

  // 11. Plafond hors-ligne
  const slumberLevel = upgrades['astro_owl_slumber'] || 0;
  const slumberMilestone = getNodeMilestoneInfo(slumberLevel, 8);
  const maxOfflineHours = 8 + (slumberLevel * 2) * slumberMilestone.milestoneMultiplier;

  return {
    clickDamage,
    passiveDps,
    critChance,
    critMultiplier,
    sapMultiplier,
    holoChanceBonus,
    maxOfflineHours,
    bossDamageMultiplier,
    bossSapMultiplier,
    echoChanceBonus,
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
  capturedGames: Record<string, { count: number; isHolo: boolean }> = {},
  echoChanceBonus: number = 0
): OdysseyMonster {
  return generateMonsterForRoute(route, holoChanceBonus, capturedGames, echoChanceBonus);
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

  // Multiplicateur Pourfendeur de Boss si la cible est un Boss
  if (monster.isBoss) {
    damage *= playerStats.bossDamageMultiplier;
  }

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
  const bossSapBonus = monster.isBoss ? playerStats.bossSapMultiplier : 1;
  const sapGained = Math.max(
    1,
    Math.floor(monster.sapReward * playerStats.sapMultiplier * sapBuffMultiplier * bossSapBonus)
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

  // Déblocage de la route suivante si le quota requis (ex: 10) est franchi
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
  const isQuotaReached = nextRouteKills >= currentRouteObj.requiredKillsToAdvance;
  const nextUnlockedRoute = (!monster.isBoss && isQuotaReached)
    ? Math.min(5, Math.max(highestForBiome, currentRouteNum + 1))
    : highestForBiome;

  const updatedRoutes = {
    ...state.highestRouteUnlocked,
    [currentBiomeId]: Math.max(highestForBiome, nextUnlockedRoute),
  };

  // Déblocage automatique et gratuit du biome suivant si le Boss de la route 5 est vaincu
  let nextHighestBiomeUnlocked = state.highestBiomeUnlocked;
  if (monster.isBoss && currentRouteObj.isBossRoute) {
    const currentBiomeObj = getCurrentBiome(currentBiomeId);
    if (currentBiomeObj.index < ODYSSEY_BIOMES.length) {
      nextHighestBiomeUnlocked = Math.max(state.highestBiomeUnlocked, currentBiomeObj.index + 1);
      const nextBiomeObj = ODYSSEY_BIOMES.find((b) => b.index === currentBiomeObj.index + 1);
      if (nextBiomeObj) {
        updatedRoutes[nextBiomeObj.id] = Math.max(updatedRoutes[nextBiomeObj.id] || 1, 1);
      }
    }
  }

  const nextState: OdysseySaveState = {
    ...state,
    starSap: state.starSap + sapGained,
    totalStarSapEarned: state.totalStarSapEarned + sapGained,
    highestBiomeUnlocked: nextHighestBiomeUnlocked,
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
 * Achat d'une amélioration dans l'Arbre Céleste (Unitaire ou Achat Multiple / Max)
 */
export function buyCelestialUpgrade(
  state: OdysseySaveState,
  nodeId: string,
  quantity: number | 'max' = 1
): { success: boolean; nextState: OdysseySaveState; levelsBought?: number; cost?: number; error?: string } {
  const node = CELESTIAL_TREE_UPGRADES.find((u) => u.id === nodeId);
  if (!node) {
    return { success: false, nextState: state, error: 'Amélioration introuvable.' };
  }

  const currentLevel = state.treeUpgrades[nodeId] || 0;
  if (currentLevel >= node.maxLevel) {
    return { success: false, nextState: state, error: 'Niveau maximum atteint.' };
  }

  let levelsToBuy = 0;
  let totalCost = 0;

  if (quantity === 'max') {
    const affordable = calculateMaxAffordableLevels(node, currentLevel, state.starSap);
    levelsToBuy = affordable.count;
    totalCost = affordable.cost;
  } else {
    const desired = Math.max(1, Math.floor(quantity));
    const availableLevels = Math.min(desired, node.maxLevel - currentLevel);
    const cumulativeCost = calculateCumulativeUpgradeCost(node, currentLevel, availableLevels);

    if (state.starSap >= cumulativeCost && availableLevels > 0) {
      levelsToBuy = availableLevels;
      totalCost = cumulativeCost;
    } else {
      // Si le joueur ne peut pas payer toute la quantité demandée, lui accorder ce qu'il peut financer
      const affordable = calculateMaxAffordableLevels(node, currentLevel, state.starSap);
      levelsToBuy = affordable.count;
      totalCost = affordable.cost;
    }
  }

  if (levelsToBuy <= 0 || state.starSap < totalCost) {
    const singleCost = calculateUpgradeCost(node, currentLevel);
    return {
      success: false,
      nextState: state,
      error: `Sève insuffisante (${formatOdysseyNumber(singleCost)} requise).`,
    };
  }

  const nextState: OdysseySaveState = {
    ...state,
    starSap: state.starSap - totalCost,
    treeUpgrades: {
      ...state.treeUpgrades,
      [nodeId]: currentLevel + levelsToBuy,
    },
  };

  saveOdysseyState(nextState);
  return { success: true, nextState, levelsBought: levelsToBuy, cost: totalCost };
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
 * Débloque un nouveau biome (la victoire contre le boss précédent suffit, aucun coût en Sève)
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
    return { success: true, nextState: switchBiome(state, biomeId) };
  }

  // Vérification de la progression séquentielle
  if (targetBiome.index !== state.highestBiomeUnlocked + 1) {
    return {
      success: false,
      nextState: state,
      error: 'Vous devez débloquer les mondes précédents dans l’ordre séquentiel.',
    };
  }

  // Vérification que le boss du monde précédent a bien été terrassé
  const prevBiome = ODYSSEY_BIOMES.find((b) => b.index === targetBiome.index - 1);
  if (prevBiome) {
    const prevBossRoute = ODYSSEY_ROUTES.find(
      (r) => r.biomeId === prevBiome.id && r.isBossRoute
    );
    if (prevBossRoute) {
      const prevBossKills = (state.routeKills && state.routeKills[prevBossRoute.id]) || 0;
      if (prevBossKills < 1) {
        return {
          success: false,
          nextState: state,
          error: `Vous devez d’abord terrasser le Boss de ${prevBiome.name} (Route 5) pour déverrouiller ce monde !`,
        };
      }
    }
  }

  // Déblocage direct et sans coût dès que le boss est vaincu
  const nextState: OdysseySaveState = {
    ...state,
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

