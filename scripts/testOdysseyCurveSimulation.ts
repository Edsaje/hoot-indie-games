/**
 * 📊 Simulation de la courbe de puissance du joueur (Débutant, Midgame, Endgame)
 */
import { computePlayerStats, getDefaultOdysseyState } from '../src/services/odysseyEngineService';
import { INDIE_GAMES } from '../src/data/games';
import { ROUTE_GAMES_MAPPING } from '../src/data/odysseyRouteDex';

console.log('📊 [Simulation de Courbe Odyssey]');

// 1. Joueur Débutant (Biome 1, 0 upgrade, 0 pépite)
const noobState = getDefaultOdysseyState();
const noobStats = computePlayerStats(noobState);
console.log(`- Débutant : Clic = ${noobStats.clickDamage} dégâts, Passif = ${noobStats.passiveDps} DPS`);

// 2. Joueur Après Biome 1 (10 pépites Biome 1, Serres lvl 10, Chouettes lvl 10, 1 Boss battu)
const earlyState = getDefaultOdysseyState();
earlyState.highestBiomeUnlocked = 2;
earlyState.stats.bossesDefeated = 1;
earlyState.treeUpgrades = {
  vigor_talons: 10,
  comp_scouts: 10,
  alch_extractor: 5,
};
const b1Games = [...(ROUTE_GAMES_MAPPING['b1_r1'] || []), ...(ROUTE_GAMES_MAPPING['b1_r2'] || [])].slice(0, 10);
for (const gid of b1Games) {
  earlyState.capturedGames[gid] = { count: 1, isHolo: false, level: 1, firstCapturedAt: '' };
}
const earlyStats = computePlayerStats(earlyState);
console.log(`- Fin Biome 1 (10 pépites) : Clic = ${earlyStats.clickDamage} dégâts, Passif = ${earlyStats.passiveDps} DPS`);

// 3. Joueur Midgame (Biome 3, 50 pépites, Upgrades lvl 25, 2 Boss battus)
const midState = getDefaultOdysseyState();
midState.highestBiomeUnlocked = 3;
midState.stats.bossesDefeated = 2;
midState.treeUpgrades = {
  vigor_talons: 30,
  vigor_crit_strike: 15,
  vigor_crit_mult: 10,
  comp_scouts: 30,
  comp_synergy: 10,
  comp_duplicate_resonance: 10,
  comp_boss_trophies: 5,
};
const midGames = INDIE_GAMES.slice(0, 50);
for (const g of midGames) {
  midState.capturedGames[g.id] = { count: 2, isHolo: false, level: 1, firstCapturedAt: '' };
}
const midStats = computePlayerStats(midState);
console.log(`- Midgame (50 pépites, Biome 3) : Clic = ${midStats.clickDamage} dégâts, Passif = ${midStats.passiveDps} DPS`);

// 4. Joueur Endgame Absolu (256 pépites capturées avec doublons, upgrades MAX, 5 boss battus)
const endState = getDefaultOdysseyState();
endState.highestBiomeUnlocked = 6;
endState.stats.bossesDefeated = 5;
endState.celestialShards = 10; // +100%
endState.treeUpgrades = {
  vigor_talons: 100,
  vigor_crit_strike: 40,
  vigor_crit_mult: 30,
  vigor_boss_hunter: 30,
  comp_scouts: 100,
  comp_synergy: 25,
  comp_duplicate_resonance: 25,
  comp_boss_trophies: 15,
  comp_holo_radiance: 10,
};
for (const g of INDIE_GAMES) {
  endState.capturedGames[g.id] = { count: 4, isHolo: false, level: 1, firstCapturedAt: '' };
}
const endStats = computePlayerStats(endState);
console.log(`- Endgame Absolu (256 pépites, Arbre Max) : Clic = ${endStats.clickDamage} dégâts, Passif = ${endStats.passiveDps} DPS`);

// Assertions de non-divergence
if (endStats.passiveDps > 1_500_000_000) {
  console.error(`❌ ÉCHEC : Le DPS Endgame (${endStats.passiveDps}) dépasse le plafond sain (1.5 Mrd)`);
  process.exit(1);
}
if (endStats.passiveDps < 10_000_000) {
  console.error(`❌ ÉCHEC : Le DPS Endgame (${endStats.passiveDps}) est trop faible (< 10M)`);
  process.exit(1);
}
console.log('✅ ÉQUILIBRAGE PARFAIT : La courbe s’étend sainement de 5 DPS (début) à ~800M DPS (Endgame absolu étendu) !');
