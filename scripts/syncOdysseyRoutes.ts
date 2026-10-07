/**
 * 🌲 Hoot Indie Games — Script de Synchronisation & Extension Automatique des Routes de l'Odyssée
 * Détecte les nouvelles pépites certifiées non encore attribuées à une route
 * et génère automatiquement de nouveaux biomes ou complète les routes existantes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INDIE_GAMES } from '../src/data/games';
import routeMappingData from '../src/data/odysseyRouteMapping.json';
import { synchronizeOdysseyMapping } from '../src/services/odysseyBiomeGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAPPING_FILE_PATH = path.resolve(__dirname, '../src/data/odysseyRouteMapping.json');

export function runSyncOdysseyRoutes(silent: boolean = false): {
  success: boolean;
  addedBiomes: number;
  addedGames: number;
  totalMapped: number;
  totalPool: number;
} {
  const existingMapping = routeMappingData as Record<string, string[]>;
  const totalPool = INDIE_GAMES.length;

  if (!silent) {
    console.log(`🦉 Démarrage de la synchronisation de l'Odyssée (${totalPool} pépites certifiées)...`);
  }

  const result = synchronizeOdysseyMapping(INDIE_GAMES, existingMapping);

  if (!silent) {
    result.changesSummary.forEach((line) => console.log(`   ${line}`));
  }

  if (result.addedGamesCount > 0 || result.addedBiomesCount > 0) {
    fs.writeFileSync(MAPPING_FILE_PATH, JSON.stringify(result.updatedMapping, null, 2) + '\n', 'utf8');
    if (!silent) {
      console.log(`✅ Fichier ${path.basename(MAPPING_FILE_PATH)} mis à jour avec succès !`);
      console.log(`   + ${result.addedBiomesCount} nouveau(x) biome(s)`);
      console.log(`   + ${result.addedGamesCount} pépite(s) assignée(s)`);
    }
  } else if (!silent) {
    if (result.unmappedGamesCount > 0) {
      console.log(`⏳ ${result.unmappedGamesCount} pépite(s) orpheline(s) en attente (seuil pour un nouveau monde : 45 pépites, 9 par route).`);
    } else {
      console.log(`✨ Toutes les pépites certifiées (${totalPool}) sont déjà intégrées à l'Odyssée.`);
    }
  }

  const finalMappedSet = new Set(Object.values(result.updatedMapping).flat());

  return {
    success: true,
    addedBiomes: result.addedBiomesCount,
    addedGames: result.addedGamesCount,
    totalMapped: finalMappedSet.size,
    totalPool,
  };
}

// Exécution directe via CLI
if (process.argv[1]?.includes('syncOdysseyRoutes')) {
  try {
    const res = runSyncOdysseyRoutes(false);
    console.log(`\n🎉 Bilan de synchronisation : ${res.totalMapped}/${res.totalPool} pépites mappées.`);
  } catch (err) {
    console.error('❌ Erreur lors de la synchronisation des routes de l’Odyssée :', err);
    process.exit(1);
  }
}
