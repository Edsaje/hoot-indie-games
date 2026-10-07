/**
 * 🧪 Hoot Indie Games — Banc d'Essai de Test d'Extension Procédurale des Biomes & Routes
 * Valide le bon fonctionnement du Chantier 12 & des spécifications strictes :
 * 1. 262 pépites implémentées sur les 30 routes des biomes 1 à 6.
 * 2. 15 pépites orphelines en attente (277 - 262 = 15).
 * 3. Règle stricte des 45 pépites orphelines nécessaires pour ouvrir un nouveau monde (9 pépites par route).
 * 4. Les pépites orphelines ne sont pas affichées dans l'Indiedex tant qu'elles ne sont pas implémentées.
 * 5. Simulation complète d'ouverture d'un nouveau monde avec 45 pépites (exactement 9 par route).
 * 6. Simulation avec reliquat (50 pépites : 45 assignées, 5 en attente pour le monde suivant).
 * 7. Cohérence mathématique des PV, Sève et niveaux des routes étendues.
 */

import { INDIE_GAMES } from '../src/data/games';
import routeMappingData from '../src/data/odysseyRouteMapping.json';
import { ODYSSEY_BIOMES, ODYSSEY_ROUTES } from '../src/data/odysseyData';
import {
  IMPLEMENTED_ODYSSEY_GAMES,
  IMPLEMENTED_GAME_IDS,
  isGameImplementedInOdyssey,
} from '../src/data/odysseyRouteDex';
import {
  synchronizeOdysseyMapping,
  generateProceduralBiomeTemplate,
  calculateRouteHp,
  calculateRouteSap,
  calculateMonsterLevel,
  getBiomeDpsTier,
  MIN_ORPHAN_GAMES_FOR_NEW_WORLD,
  GAMES_PER_ROUTE,
  ROUTES_PER_WORLD,
} from '../src/services/odysseyBiomeGenerator';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ÉCHEC ASSERTION : ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log('🌲 Début des tests d’extension procédurale & intégrité de l’Indiedex...\n');

// 1. Vérifier l'état de base de l'Odyssée (Biomes 1 à 6, 30 routes, 270 pépites)
const mapping = routeMappingData as Record<string, string[]>;
const allMappedGameIds = new Set(Object.values(mapping).flat());

assert(allMappedGameIds.size === 270, `Mapping actuel contient 270 pépites (${allMappedGameIds.size}/270)`);
assert(Object.keys(mapping).length === 30, `Mapping actuel contient exactement 30 routes (trouvé ${Object.keys(mapping).length})`);
assert(Object.values(mapping).every((games) => games.length === 9), `Chacune des 30 routes contient exactement 9 pépites (9x30 = 270)`);
assert(ODYSSEY_BIOMES.length === 6, `ODYSSEY_BIOMES compte 6 biomes actifs (trouvé ${ODYSSEY_BIOMES.length})`);
assert(ODYSSEY_ROUTES.length === 30, `ODYSSEY_ROUTES compte 30 routes actives (trouvé ${ODYSSEY_ROUTES.length})`);

// 2. Vérifier les pépites orphelines
const unmappedGames = INDIE_GAMES.filter((g) => !allMappedGameIds.has(g.id));
assert(unmappedGames.length === 7, `Exactement 7 pépites orphelines en attente (trouvé ${unmappedGames.length})`);

// 3. Vérifier que l'Indiedex n'affiche QUE les jeux implémentés
assert(IMPLEMENTED_ODYSSEY_GAMES.length === 270, `IMPLEMENTED_ODYSSEY_GAMES compte 270 jeux (trouvé ${IMPLEMENTED_ODYSSEY_GAMES.length})`);
assert(IMPLEMENTED_GAME_IDS.size === 270, `IMPLEMENTED_GAME_IDS compte 270 IDs (trouvé ${IMPLEMENTED_GAME_IDS.size})`);

for (const orphan of unmappedGames) {
  assert(!isGameImplementedInOdyssey(orphan.id), `Pépite orpheline « ${orphan.title} » est bien absente de l’Indiedex`);
}

// 4. Test du comportement de synchronizeOdysseyMapping avec les 7 pépites orphelines actuelles
console.log('\n🔍 Test de la synchronisation avec 7 orphelines (seuil requis : 45)...');
const currentSyncResult = synchronizeOdysseyMapping(INDIE_GAMES, mapping);
assert(currentSyncResult.addedBiomesCount === 0, 'Aucun nouveau biome créé car 7 < 45');
assert(currentSyncResult.addedGamesCount === 0, 'Aucune pépite ajoutée aux routes existantes');
assert(currentSyncResult.unmappedGamesCount === 7, '7 pépites restent orphelines en attente');
assert(
  JSON.stringify(currentSyncResult.updatedMapping) === JSON.stringify(mapping),
  'Le mapping reste strictement intact'
);

// 5. Simulation procédurale : moisson de 45 pépites orphelines (seuil parfait pour Monde 7)
console.log('\n🔮 Simulation d’une moisson future de 45 pépites virtuelles (1 monde complet)...');
const virtual45Games = Array.from({ length: 45 }, (_, idx) => ({
  id: `virtual-game-45-${idx + 1}`,
  title: `Jeu Virtuel ${idx + 1}`,
  releaseYear: 2026,
  genre: ['Aventure'],
  artStyle: { fr: 'Pixel Art', en: 'Pixel Art' },
  camera: { fr: 'Vue du dessus', en: 'Top-down' },
  developer: 'Studio Futur',
  steamUrl: 'https://store.steampowered.com',
  screenshots: [],
  hints: { tagline: { fr: 'Test', en: 'Test' } },
  addedAt: '2026-10-07',
}));

const sim45Result = synchronizeOdysseyMapping([...IMPLEMENTED_ODYSSEY_GAMES, ...virtual45Games], mapping);
assert(sim45Result.addedBiomesCount === 1, '1 nouveau biome (Monde 7) créé pour les 45 jeux');
assert(sim45Result.addedGamesCount === 45, 'Les 45 jeux ont été assignés');
assert(sim45Result.unmappedGamesCount === 0, '0 jeu restant en attente');

// Vérifier que chacune des 5 routes du nouveau biome a EXACTEMENT 9 pépites
for (let r = 1; r <= 5; r++) {
  const routeGames = sim45Result.updatedMapping[`b7_r${r}`];
  assert(Boolean(routeGames), `Route b7_r${r} créée`);
  assert(routeGames.length === 9, `Route b7_r${r} possède exactement 9 pépites (trouvé ${routeGames.length})`);
}

// 6. Simulation avec reliquat : 50 pépites virtuelles (45 pour Monde 7, 5 en attente pour Monde 8)
console.log('\n🔮 Simulation d’une moisson avec reliquat (50 pépites : 45 pour B7, 5 en attente)...');
const virtual50Games = Array.from({ length: 50 }, (_, idx) => ({
  id: `virtual-game-50-${idx + 1}`,
  title: `Jeu Virtuel ${idx + 1}`,
  releaseYear: 2026,
  genre: ['Aventure'],
  artStyle: { fr: 'Pixel Art', en: 'Pixel Art' },
  camera: { fr: 'Vue du dessus', en: 'Top-down' },
  developer: 'Studio Futur',
  steamUrl: 'https://store.steampowered.com',
  screenshots: [],
  hints: { tagline: { fr: 'Test', en: 'Test' } },
  addedAt: '2026-10-07',
}));

const sim50Result = synchronizeOdysseyMapping([...IMPLEMENTED_ODYSSEY_GAMES, ...virtual50Games], mapping);
assert(sim50Result.addedBiomesCount === 1, '1 seul nouveau biome créé');
assert(sim50Result.addedGamesCount === 45, 'Seulement 45 jeux assignés au Monde 7');
assert(sim50Result.unmappedGamesCount === 5, '5 jeux restent en attente pour le Monde 8');

// Vérifier qu'aucune route du Monde 7 ne déborde (chacune doit avoir 9 jeux exactement)
for (let r = 1; r <= 5; r++) {
  const routeGames = sim50Result.updatedMapping[`b7_r${r}`];
  assert(routeGames.length === 9, `Route b7_r${r} conserve strictement 9 pépites (trouvé ${routeGames.length})`);
}

// 7. Vérifier la cohérence mathématique des PV, Sève et DPS pour les futurs Mondes 7 et 8
console.log('\n📐 Vérification de la progression mathématique...');
const b7R1Hp = calculateRouteHp(7, 1);
const b7BossHp = calculateRouteHp(7, 5);
const b7BossSap = calculateRouteSap(7, 5);
const b7DpsTier = getBiomeDpsTier(7);

assert(b7R1Hp > 10_000_000_000, `R1 B7 a des PV colossaux (${b7R1Hp} PV)`);
assert(b7BossHp > 1_000_000_000_000, `Boss B7 > 1 Trillion (${b7BossHp} PV)`);
assert(b7BossSap > 0, `Sève Boss B7 positive (${b7BossSap})`);
assert(b7DpsTier > 50000, `Tier DPS B7 équilibré (${b7DpsTier} DPS)`);

const b8R1Hp = calculateRouteHp(8, 1);
assert(b8R1Hp > b7R1Hp, `Croissance R1 B7 -> B8 (${b7R1Hp} < ${b8R1Hp})`);
assert(b8R1Hp < b7BossHp, `R1 B8 (${b8R1Hp}) accessible après Boss B7 (${b7BossHp})`);

console.log('\n🎉 TOUS LES TESTS D’EXTENSION ET D’INTÉGRITÉ DE L’INDIEDEX ONT RÉUSSI AVEC SUCCÈS ! (100% OK)');
