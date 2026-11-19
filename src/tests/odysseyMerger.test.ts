import { describe, it, expect } from 'vitest';
import { isOdysseyStateEmpty, mergeOdysseySaveStates } from '../services/odysseySaveMerger';
import type { OdysseySaveState } from '../types/odyssey';

describe('odysseySaveMerger — Moteur de Fusion Monotonique', () => {
  it('détecte correctement un état Odyssée vide / vierge', () => {
    expect(isOdysseyStateEmpty(null)).toBe(true);
    expect(isOdysseyStateEmpty(undefined)).toBe(true);
    expect(isOdysseyStateEmpty({} as OdysseySaveState)).toBe(true);
    expect(
      isOdysseyStateEmpty({
        version: 1,
        highestBiomeUnlocked: 1,
        totalStarSapEarned: 0,
        treeUpgrades: {},
        capturedGames: {},
      } as OdysseySaveState)
    ).toBe(true);

    expect(
      isOdysseyStateEmpty({
        version: 1,
        highestBiomeUnlocked: 2,
        totalStarSapEarned: 0,
      } as OdysseySaveState)
    ).toBe(false);

    expect(
      isOdysseyStateEmpty({
        version: 1,
        highestBiomeUnlocked: 1,
        totalStarSapEarned: 500,
      } as OdysseySaveState)
    ).toBe(false);
  });

  it('ne régresse JAMAIS un Biome 6 vers un Biome 1 même si le timestamp est plus récent', () => {
    const advancedLocal = {
      version: 1,
      highestBiomeUnlocked: 6,
      currentBiomeId: 'biome_6_cosmic_void',
      currentRouteNumber: 4,
      starSap: 50000000,
      totalStarSapEarned: 100917767263699,
      highestRouteUnlocked: { '6': 4 },
      treeUpgrades: { sap_boost: 10, crit_rate: 5 },
      capturedGames: { game_a: { level: 3 } },
      routeKills: { '6-4': 150 },
      lastSavedAt: 1000,
    } as any as OdysseySaveState;

    const emptyNewerCloud = {
      version: 1,
      highestBiomeUnlocked: 1,
      currentBiomeId: 'biome_1_verdant_woods',
      currentRouteNumber: 1,
      starSap: 10,
      totalStarSapEarned: 10,
      highestRouteUnlocked: { '1': 1 },
      treeUpgrades: {},
      capturedGames: {},
      lastSavedAt: 999999, // Timestamp plus récent mais état vierge
    } as any as OdysseySaveState;

    const merged = mergeOdysseySaveStates(advancedLocal, emptyNewerCloud, false);

    expect(merged).not.toBeNull();
    expect(merged?.highestBiomeUnlocked).toBe(6);
    expect(merged?.currentBiomeId).toBe('biome_6_cosmic_void');
    expect(merged?.totalStarSapEarned).toBe(100917767263699);
    expect(merged?.treeUpgrades?.sap_boost).toBe(10);
    expect(merged?.capturedGames?.game_a).toBeDefined();
  });

  it('fusionne correctement deux progressions actives en prenant le maximum de chaque amélioration', () => {
    const deviceA = {
      version: 1,
      highestBiomeUnlocked: 3,
      currentBiomeId: 'biome_3_crystal_caverns',
      currentRouteNumber: 2,
      starSap: 1000,
      totalStarSapEarned: 50000,
      highestRouteUnlocked: { '1': 5, '2': 5, '3': 2 },
      treeUpgrades: { sap_boost: 5, offline_efficiency: 2 },
      capturedGames: { game_a: { level: 2 } },
      routeKills: { '1-1': 50 },
      lastSavedAt: 2000,
    } as any as OdysseySaveState;

    const deviceB = {
      version: 1,
      highestBiomeUnlocked: 4,
      currentBiomeId: 'biome_4_ancient_ruins',
      currentRouteNumber: 1,
      starSap: 3000,
      totalStarSapEarned: 120000,
      highestRouteUnlocked: { '1': 5, '2': 5, '3': 5, '4': 1 },
      treeUpgrades: { sap_boost: 3, offline_efficiency: 4, companion_slots: 1 },
      capturedGames: { game_b: { level: 1 } },
      routeKills: { '1-1': 30, '4-1': 10 },
      lastSavedAt: 2500,
    } as any as OdysseySaveState;

    const merged = mergeOdysseySaveStates(deviceA, deviceB, false);

    expect(merged).not.toBeNull();
    // Le biome le plus élevé gagne
    expect(merged?.highestBiomeUnlocked).toBe(4);
    // Sève totale maximale
    expect(merged?.totalStarSapEarned).toBe(120000);
    // Niveaux d'améliorations maximaux
    expect(merged?.treeUpgrades?.sap_boost).toBe(5); // max(5, 3)
    expect(merged?.treeUpgrades?.offline_efficiency).toBe(4); // max(2, 4)
    expect(merged?.treeUpgrades?.companion_slots).toBe(1);
    // Compagnons des deux côtés conservés
    expect(merged?.capturedGames?.game_a).toBeDefined();
    expect(merged?.capturedGames?.game_b).toBeDefined();
  });

  it('n’applique le remplacement pur que lors d’un reset explicite (forceReplace: true)', () => {
    const advanced = {
      version: 1,
      highestBiomeUnlocked: 6,
      currentBiomeId: 'biome_6',
      currentRouteNumber: 4,
      starSap: 50000000,
      totalStarSapEarned: 100917767263699,
      lastSavedAt: 1000,
    } as any as OdysseySaveState;

    const freshResetState = {
      version: 1,
      highestBiomeUnlocked: 1,
      currentBiomeId: 'biome_1_verdant_woods',
      currentRouteNumber: 1,
      starSap: 0,
      totalStarSapEarned: 0,
      treeUpgrades: {},
      capturedGames: {},
      lastSavedAt: Date.now(),
    } as any as OdysseySaveState;

    // Sans forceReplace : conserve advanced
    const preserved = mergeOdysseySaveStates(advanced, freshResetState, false);
    expect(preserved?.highestBiomeUnlocked).toBe(6);

    // Avec forceReplace : autorise le reset hard
    const reset = mergeOdysseySaveStates(advanced, freshResetState, true);
    expect(reset?.highestBiomeUnlocked).toBe(1);
    expect(reset?.totalStarSapEarned).toBe(0);
  });
});
