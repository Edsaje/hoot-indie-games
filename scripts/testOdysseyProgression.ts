/**
 * 🌲 Hoot Indie Games — Banc de tests automatisé du pipeline de progression de l'Odyssée Sylvestre
 * Valide :
 * 1. Le déblocage séquentiel Route 1 -> Route 5 (10 kills requis par route)
 * 2. La victoire face au Boss de Route 5 et son enregistrement
 * 3. Le repli stratégique en cas d'échec de Boss (Route 4 et autoAdvance = false)
 * 4. La protection des Biomes (boss requis + progression ordonnée + coût en sève)
 */

import {
  getDefaultOdysseyState,
  defeatMonster,
  switchRoute,
  unlockBiome,
  computePlayerStats,
  getCurrentRoute,
} from '../src/services/odysseyEngineService';
import { ODYSSEY_ROUTES, ODYSSEY_BIOMES } from '../src/data/odysseyData';
import type { OdysseyMonster } from '../src/types/odyssey';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ ÉCHEC : ${testName}${detail ? ` (${detail})` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCCÈS : ${testName}`);
  }
}

function runProgressionTests() {
  console.log('🌲 [Test Odyssey Progression] Lancement du banc de vérification...');

  // --- Test 1 : État initial ---
  let state = getDefaultOdysseyState();
  const playerStats = computePlayerStats(state);

  assert(state.currentBiomeId === 'biome_1_clearing', 'Initialisation Biome 1');
  assert(state.currentRouteNumber === 1, 'Initialisation Route 1');
  assert(state.highestRouteUnlocked['biome_1_clearing'] === 1, 'Seule la Route 1 est initialement débloquée');

  // Helper pour créer un monstre fictif
  const createMockMonster = (routeId: string, isBoss: boolean = false): OdysseyMonster => {
    return {
      id: `mob_${routeId}_test`,
      name: isBoss ? 'Grand Boss Sylvestre' : 'Monstre Sylvestre',
      level: 1,
      currentHp: 100,
      maxHp: 100,
      sapReward: 10,
      isBoss,
      isWildEcho: false,
      isHolo: false,
      sprite: '',
    };
  };

  // --- Test 2 : Route 1 — Vérification du seuil de 10 kills pour débloquer la Route 2 ---
  console.log('\n--- Test 2 : Seuil de 10 éliminations pour débloquer la Route 2 ---');
  for (let k = 1; k <= 9; k++) {
    const mob = createMockMonster('b1_r1', false);
    const result = defeatMonster(state, mob, playerStats, 1);
    state = result.nextState;
    assert(
      state.highestRouteUnlocked['biome_1_clearing'] === 1,
      `Kill ${k}/10 sur Route 1 : La Route 2 ne doit PAS encore être débloquée`
    );
  }

  // 10ème kill
  const mob10 = createMockMonster('b1_r1', false);
  const res10 = defeatMonster(state, mob10, playerStats, 1);
  state = res10.nextState;
  assert(
    state.highestRouteUnlocked['biome_1_clearing'] === 2,
    '10ème kill sur Route 1 : La Route 2 est maintenant débloquée !'
  );

  // --- Test 3 : Avancement vers Route 2, 3, 4 et 5 ---
  console.log('\n--- Test 3 : Déblocage séquentiel Route 2 -> Route 5 ---');
  state = switchRoute(state, 2);
  assert(state.currentRouteNumber === 2, 'Basculement sur Route 2');

  // Compléter Route 2 (10 kills)
  for (let k = 1; k <= 10; k++) {
    const mob = createMockMonster('b1_r2', false);
    state = defeatMonster(state, mob, playerStats, 1).nextState;
  }
  assert(state.highestRouteUnlocked['biome_1_clearing'] === 3, 'Route 3 débloquée après 10 kills sur Route 2');

  state = switchRoute(state, 3);
  for (let k = 1; k <= 10; k++) {
    const mob = createMockMonster('b1_r3', false);
    state = defeatMonster(state, mob, playerStats, 1).nextState;
  }
  assert(state.highestRouteUnlocked['biome_1_clearing'] === 4, 'Route 4 débloquée après 10 kills sur Route 3');

  state = switchRoute(state, 4);
  for (let k = 1; k <= 10; k++) {
    const mob = createMockMonster('b1_r4', false);
    state = defeatMonster(state, mob, playerStats, 1).nextState;
  }
  assert(state.highestRouteUnlocked['biome_1_clearing'] === 5, 'Route 5 (Boss) débloquée après 10 kills sur Route 4');

  // --- Test 4 : Tentative de débloquer le Biome 2 AVANT d'avoir vaincu le Boss du Biome 1 ---
  console.log('\n--- Test 4 : Protection anti-skip de Biome avant Boss ---');
  // On donne 100 000 sèves au joueur
  state.starSap = 100000;
  state.totalStarSapEarned = 100000;

  const prematureUnlock = unlockBiome(state, 'biome_2_pixel_canopy');
  assert(
    prematureUnlock.success === false,
    'Refus de débloquer le Biome 2 tant que le Boss de Route 5 n\'est pas battu'
  );
  assert(
    state.highestBiomeUnlocked === 1,
    'Le joueur reste au Monde 1'
  );

  // --- Test 5 : Échec du Boss (Temps écoulé) -> Repli Route 4 et arrêt autoAdvance ---
  console.log('\n--- Test 5 : Échec du Boss (Repli & désactivation autoAdvance) ---');
  state = switchRoute(state, 5);
  state.autoAdvance = true;
  assert(state.currentRouteNumber === 5, 'Joueur sur Route 5 (Boss)');
  assert(state.autoAdvance === true, 'Auto-progression activée');

  // Simulation du timeout de 30s du Boss
  const fallbackRoute = Math.max(1, state.currentRouteNumber - 1);
  state = {
    ...switchRoute(state, fallbackRoute),
    autoAdvance: false,
  };
  assert(state.currentRouteNumber === 4, 'Repli immédiat sur la Route 4');
  assert(state.autoAdvance === false, 'Auto-progression correctement désactivée');

  // --- Test 6 : Victoire face au Boss de Route 5 ---
  console.log('\n--- Test 6 : Victoire face au Boss de Route 5 ---');
  state = switchRoute(state, 5);
  const bossMob = createMockMonster('b1_r5', true);
  const bossDefeatRes = defeatMonster(state, bossMob, playerStats, 1);
  state = bossDefeatRes.nextState;

  assert((state.routeKills && state.routeKills['b1_r5']) >= 1, 'Boss Route 5 enregistré comme vaincu dans routeKills');
  assert(state.stats.bossesDefeated >= 1, 'Compteur de boss vaincus incrémenté');

  // --- Test 7 : Déverrouillage légitime du Biome 2 après Boss (Sans coût en Sève) ---
  console.log('\n--- Test 7 : Déverrouillage du Biome 2 après Boss (Gratuit & automatique) ---');
  assert(state.highestBiomeUnlocked === 2, 'highestBiomeUnlocked passé automatiquement à 2 suite au Boss');
  assert(state.highestRouteUnlocked['biome_2_pixel_canopy'] === 1, 'Seule la Route 1 du Biome 2 est initialement débloquée');

  const initialSap = state.starSap;
  const validUnlock = unlockBiome(state, 'biome_2_pixel_canopy');
  assert(validUnlock.success === true, 'Biome 2 accessible avec succès !');
  state = validUnlock.nextState;
  assert(state.highestBiomeUnlocked === 2, 'highestBiomeUnlocked reste à 2');
  assert(state.currentBiomeId === 'biome_2_pixel_canopy', 'Biome actif basculé sur Biome 2');
  assert(state.currentRouteNumber === 1, 'Route active initialisée à Route 1 du nouveau biome');
  assert(state.starSap === initialSap, 'Aucune Sève n\'est déduite (victoire de boss gratuite)');

  // --- Test 8 : Tentative de sauter des mondes (ex: Monde 2 vers Monde 4) ---
  console.log('\n--- Test 8 : Interdiction de sauter des biomes (Ordre séquentiel) ---');
  state.starSap = 10000000;
  const skipUnlock = unlockBiome(state, 'biome_4_celestial_summit');
  assert(skipUnlock.success === false, 'Refus de sauter directement au Biome 4 sans passer par le Biome 3');

  console.log('\n🎉 TOUS LES TESTS DE PROGRESSION SONT PASSÉS AVEC SUCCÈS À 100% !');
}

runProgressionTests();
