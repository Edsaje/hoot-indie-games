/**
 * ⚖️ Test d'équilibrage mathématique & Achat multiple - Chantier 11
 */

import {
  getDefaultOdysseyState,
  computePlayerStats,
  buyCelestialUpgrade,
} from '../src/services/odysseyEngineService';
import {
  CELESTIAL_TREE_UPGRADES,
  calculateUpgradeCost,
  calculateCumulativeUpgradeCost,
  calculateMaxAffordableLevels,
  calculateCompanionDps,
  BIOME_DPS_TIERS,
} from '../src/data/odysseyData';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ÉCHEC : ${msg}`);
    process.exit(1);
  }
  console.log(`✅ SUCCÈS : ${msg}`);
}

console.log('⚖️ [Test Math Balancing] Démarrage des vérifications...');

// 1. Test des Tiers de DPS des Pépites par Biome (Recalibrés style PokéClicker)
assert(BIOME_DPS_TIERS[1] === 2, 'Tier B1 = 2 DPS');
assert(BIOME_DPS_TIERS[2] === 10, 'Tier B2 = 10 DPS');
assert(BIOME_DPS_TIERS[3] === 50, 'Tier B3 = 50 DPS');
assert(BIOME_DPS_TIERS[4] === 300, 'Tier B4 = 300 DPS');
assert(BIOME_DPS_TIERS[5] === 2000, 'Tier B5 = 2 000 DPS');
assert(BIOME_DPS_TIERS[6] === 15000, 'Tier B6 = 15 000 DPS');

// 2. Test Companion DPS (Doublons et Holo)
// Pépite du biome 2 (celeste => base 10)
const dpsSingle = calculateCompanionDps('celeste', { count: 1, isHolo: false }, 0);
assert(dpsSingle >= 10, `DPS unitaire B2 celeste = ${dpsSingle} DPS (>= 10)`);

const dpsDup = calculateCompanionDps('celeste', { count: 3, isHolo: false }, 0);
// 2 doublons => 1 + 2*0.05 = 1.10x
assert(dpsDup === Math.floor(dpsSingle * 1.1), `Doublons x3 = +10% DPS (${dpsDup} vs ${Math.floor(dpsSingle * 1.1)})`);

const dpsHolo = calculateCompanionDps('celeste', { count: 1, isHolo: true }, 0.4);
// Holo => x (2 + 0.4) = 2.4x
assert(dpsHolo === Math.floor(dpsSingle * 2.4), `Holo shiny avec radiance = 2.4x (${dpsHolo} vs ${Math.floor(dpsSingle * 2.4)})`);

// 3. Test Calculs Achat Multiple
const talonNode = CELESTIAL_TREE_UPGRADES.find((u) => u.id === 'vigor_talons')!;
const costL0 = calculateUpgradeCost(talonNode, 0); // baseCost = 20
assert(costL0 === 20, 'Coût Serres niveau 0 = 20');

const cost10 = calculateCumulativeUpgradeCost(talonNode, 0, 10);
let manualSum10 = 0;
for (let i = 0; i < 10; i++) manualSum10 += calculateUpgradeCost(talonNode, i);
assert(cost10 === manualSum10, `Coût cumulé 10 niveaux = ${cost10} (conforme somme manuelle ${manualSum10})`);

// Max affordable
const affordable = calculateMaxAffordableLevels(talonNode, 0, cost10);
assert(affordable.count === 10, `Avec ${cost10} de sève, max affordable = 10 (obtenu ${affordable.count})`);
assert(affordable.cost === cost10, `Coût max affordable = ${affordable.cost}`);

// 4. Test buyCelestialUpgrade avec quantité
let state = getDefaultOdysseyState();
state.starSap = cost10;

const buy10Res = buyCelestialUpgrade(state, 'vigor_talons', 10);
assert(buy10Res.success, 'Achat 10x réussi');
assert(buy10Res.levelsBought === 10, '10 niveaux achetés d’un coup');
assert(buy10Res.nextState.treeUpgrades['vigor_talons'] === 10, 'Niveau actuel = 10');
assert(buy10Res.nextState.starSap === 0, 'Sève débitée exactement');

// 5. Test transmission DPS Passif -> Clic Manuel (avec Palier Niv. 10 à x1.2)
state = buy10Res.nextState;
state.capturedGames = {
  celeste: { count: 1, isHolo: false, level: 1, firstCapturedAt: '' },
};
// Stats avec 10 serres (palier 10 atteint: multiplicateur x1.2) et une pépite B2
const statsWithPassive = computePlayerStats(state);
assert(statsWithPassive.passiveDps > 0, `Passive DPS = ${statsWithPassive.passiveDps}`);
// Serres lvl 10 => palier x1.2 => 10 * 0.001 * 1.2 = 1.2% du passif transféré au clic
const expectedTransfer = Math.floor(statsWithPassive.passiveDps * 0.012);
// Talon damage lvl 10 => 10 * 3 * 1.2 = 36. Base click = 5 => 41
const expectedClick = 41 + expectedTransfer;
assert(statsWithPassive.clickDamage === expectedClick, `Click Damage = ${statsWithPassive.clickDamage} (attendu ${expectedClick})`);

// 6. Test Multiplicateur Prestige Shards
state.celestialShards = 5; // +50%
const statsWithShards = computePlayerStats(state);
assert(
  statsWithShards.passiveDps === Math.floor(statsWithPassive.passiveDps * 1.5),
  `Boost 5 shards (+50%) sur passiveDps = ${statsWithShards.passiveDps}`
);
const expectedTransferWithShards = Math.floor(statsWithShards.passiveDps * 0.012);
const expectedClickWithShards = Math.floor(41 * 1.5) + expectedTransferWithShards;
assert(
  statsWithShards.clickDamage === expectedClickWithShards,
  `Boost 5 shards (+50%) sur clickDamage = ${statsWithShards.clickDamage}`
);

console.log('🎉 TOUS LES TESTS MATHÉMATIQUES & SCALING SONT PARFAITEMENT VALIDÉS !');
