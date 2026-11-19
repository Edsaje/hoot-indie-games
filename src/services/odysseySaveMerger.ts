/**
 * 🌲 Hoot Indie Games — Moteur de Fusion de Sauvegarde de l'Odyssée Sylvestre (TypeScript)
 * Module pur et 100% testable unitairement.
 * Applique une règle stricte de monotonicité pour empêcher toute perte de progrès entre appareils.
 */

import type { OdysseySaveState } from '../types/odyssey';

/**
 * Vérifie si un état Odyssée est considéré comme vierge / vide (nouveau joueur)
 */
export function isOdysseyStateEmpty(state?: OdysseySaveState | null): boolean {
  if (!state) return true;
  return (
    Number(state.totalStarSapEarned || 0) === 0 &&
    Number(state.highestBiomeUnlocked || 1) === 1 &&
    Object.keys(state.treeUpgrades || {}).length === 0 &&
    Object.keys(state.capturedGames || {}).length === 0
  );
}

/**
 * Fusionne intelligemment deux états Odyssée (local et cloud)
 * 
 * @param local État sauvegardé sur l'appareil local
 * @param cloud État provenant du serveur distant
 * @param forceReplace Si true (ex: réinitialisation hard reset), applique directement le remplacement
 */
export function mergeOdysseySaveStates(
  local?: OdysseySaveState | null,
  cloud?: OdysseySaveState | null,
  forceReplace = false
): OdysseySaveState | null {
  if (forceReplace && cloud) {
    return { ...cloud, version: 1 as const, lastSavedAt: Date.now() };
  }
  if (!local || isOdysseyStateEmpty(local)) {
    if (cloud) return { ...cloud, version: 1 as const };
    return local || null;
  }
  if (!cloud || isOdysseyStateEmpty(cloud)) {
    return { ...local, version: 1 as const };
  }

  const localSavedAt = Number(local.lastSavedAt || 0);
  const cloudSavedAt = Number(cloud.lastSavedAt || 0);

  const localBiome = Number(local.highestBiomeUnlocked || 1);
  const cloudBiome = Number(cloud.highestBiomeUnlocked || 1);
  const localSapTotal = Number(local.totalStarSapEarned || 0);
  const cloudSapTotal = Number(cloud.totalStarSapEarned || 0);

  // 1. Détermination de la source maîtresse
  let isLocalPrimary: boolean;
  if (localBiome > cloudBiome) {
    isLocalPrimary = true;
  } else if (cloudBiome > localBiome) {
    isLocalPrimary = false;
  } else if (localSapTotal > cloudSapTotal * 1.05) {
    isLocalPrimary = true;
  } else if (cloudSapTotal > localSapTotal * 1.05) {
    isLocalPrimary = false;
  } else {
    isLocalPrimary = localSavedAt >= cloudSavedAt;
  }

  const primary = isLocalPrimary ? local : cloud;
  const secondary = isLocalPrimary ? cloud : local;

  // 2. Monotonicité stricte sur la progression de niveau
  const mergedBiome = Math.max(localBiome, cloudBiome);

  const mergedRoutes: Record<string, number> = { ...(local.highestRouteUnlocked || {}) };
  for (const [bId, rNum] of Object.entries(cloud.highestRouteUnlocked || {})) {
    mergedRoutes[bId] = Math.max(Number(mergedRoutes[bId] || 1), Number(rNum || 1));
  }

  const mergedUpgrades: Record<string, number> = { ...(local.treeUpgrades || {}) };
  for (const [uId, uLvl] of Object.entries(cloud.treeUpgrades || {})) {
    mergedUpgrades[uId] = Math.max(Number(mergedUpgrades[uId] || 0), Number(uLvl || 0));
  }

  const mergedCaptured: Record<string, any> = { ...(local.capturedGames || {}) };
  for (const [gId, cData] of Object.entries(cloud.capturedGames || {})) {
    const lData = mergedCaptured[gId] || { count: 0, isHolo: false, level: 1 };
    mergedCaptured[gId] = {
      count: Math.max(Number(lData.count || 0), Number((cData as any).count || 0)),
      isHolo: Boolean(lData.isHolo || (cData as any).isHolo),
      level: Math.max(Number(lData.level || 1), Number((cData as any).level || 1)),
      firstCapturedAt: lData.firstCapturedAt || (cData as any).firstCapturedAt || new Date().toISOString(),
    };
  }

  const mergedRouteKills: Record<string, number> = { ...(local.routeKills || {}) };
  for (const [rId, kNum] of Object.entries(cloud.routeKills || {})) {
    mergedRouteKills[rId] = Math.max(Number(mergedRouteKills[rId] || 0), Number(kNum || 0));
  }

  // 3. Conciliation de la monnaie Sève Stellaire
  const mergedTotalSap = Math.max(localSapTotal, cloudSapTotal);
  const localSap = Math.max(0, Number(local.starSap || 0));
  const cloudSap = Math.max(0, Number(cloud.starSap || 0));
  const mergedStarSap = Math.min(Math.max(localSap, cloudSap), mergedTotalSap);

  // 4. Position active sécurisée (ne jamais rétrograder au Biome 1 si un Biome avancé est conquis)
  const primaryBiome = primary.currentBiomeId || 'biome_1_clearing';
  const secondaryBiome = secondary.currentBiomeId || 'biome_1_clearing';
  const activeBiome = (primaryBiome === 'biome_1_clearing' && secondaryBiome !== 'biome_1_clearing')
    ? secondaryBiome
    : primaryBiome;

  const primaryRoute = Math.max(1, Math.min(5, Number(primary.currentRouteNumber || 1)));
  const secondaryRoute = Math.max(1, Math.min(5, Number(secondary.currentRouteNumber || 1)));
  const activeRoute = (primaryRoute === 1 && secondaryRoute > 1 && primaryBiome === 'biome_1_clearing')
    ? secondaryRoute
    : primaryRoute;

  const activeAutoAdvance = typeof primary.autoAdvance === 'boolean'
    ? primary.autoAdvance
    : Boolean(secondary.autoAdvance);

  const activeMiniHud = typeof primary.miniHudEnabled === 'boolean'
    ? primary.miniHudEnabled
    : Boolean(secondary.miniHudEnabled);

  const activeCompanions = Array.isArray(primary.activeCompanions) && primary.activeCompanions.length > 0
    ? primary.activeCompanions
    : (Array.isArray(secondary.activeCompanions) ? secondary.activeCompanions : []);

  return {
    version: 1,
    currentBiomeId: activeBiome,
    currentRouteNumber: activeRoute,
    autoAdvance: activeAutoAdvance,
    miniHudEnabled: activeMiniHud,
    miniHudMobileEnabled: activeMiniHud,
    highestBiomeUnlocked: mergedBiome,
    highestRouteUnlocked: mergedRoutes,
    routeKills: mergedRouteKills,
    treeUpgrades: mergedUpgrades,
    capturedGames: mergedCaptured,
    activeCompanions,
    starSap: mergedStarSap,
    totalStarSapEarned: mergedTotalSap,
    celestialShards: Math.max(Number(local.celestialShards || 0), Number(cloud.celestialShards || 0)),
    stats: {
      totalClicks: Math.max(Number(local.stats?.totalClicks || 0), Number(cloud.stats?.totalClicks || 0)),
      totalDamageDealt: Math.max(Number(local.stats?.totalDamageDealt || 0), Number(cloud.stats?.totalDamageDealt || 0)),
      monstersDefeated: Math.max(Number(local.stats?.monstersDefeated || 0), Number(cloud.stats?.monstersDefeated || 0)),
      bossesDefeated: Math.max(Number(local.stats?.bossesDefeated || 0), Number(cloud.stats?.bossesDefeated || 0)),
      holosFound: Math.max(Number(local.stats?.holosFound || 0), Number(cloud.stats?.holosFound || 0)),
      firefliesCaught: Math.max(Number(local.stats?.firefliesCaught || 0), Number(cloud.stats?.firefliesCaught || 0)),
      rebirthsCount: Math.max(Number(local.stats?.rebirthsCount || 0), Number(cloud.stats?.rebirthsCount || 0)),
    },
    lastSavedAt: Math.max(localSavedAt, cloudSavedAt, Date.now()),
  };
}
