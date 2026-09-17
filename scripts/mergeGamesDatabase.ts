import fs from 'fs';
import { INDIE_GAMES } from '../src/data/games';
import type { Game } from '../src/types/game';

const fetchedRaw1 = fs.readFileSync('scripts/fetched_games.json', 'utf8');
const fetchedGames1: Game[] = JSON.parse(fetchedRaw1);

let fetchedGames2: Game[] = [];
if (fs.existsSync('scripts/fetched_2024_2026.json')) {
  fetchedGames2 = JSON.parse(fs.readFileSync('scripts/fetched_2024_2026.json', 'utf8'));
}

const allNew = [...fetchedGames1, ...fetchedGames2];

console.log(`Current existing games: ${INDIE_GAMES.length}`);
console.log(`Fetched games to merge: ${allNew.length}`);

// Merge ensuring no duplicate ids
const existingIds = new Set<string>();
const mergedList: Game[] = [];

for (const g of [...INDIE_GAMES, ...allNew]) {
  if (!existingIds.has(g.id)) {
    existingIds.add(g.id);
    mergedList.push(g);
  }
}
console.log(`Total games in database: ${mergedList.length}`);

const fileHeader = `import type { Game } from '../types/game';

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Moissonnée et enrichie via l'API Steam Store & IGDB.
 * Total de jeux : ${mergedList.length}
 */
export const INDIE_GAMES: Game[] = `;

const fileFooter = `;

// Helper deterministe pour obtenir le jeu du jour basé sur une graine temporelle "YYYY-MM-DD"
export function getDailyGame(dateString: string, offset = 0): Game {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + offset) % INDIE_GAMES.length;
  return INDIE_GAMES[index];
}
`;

const fileContent = fileHeader + JSON.stringify(mergedList, null, 2) + fileFooter;
fs.writeFileSync('src/data/games.ts', fileContent, 'utf8');

console.log('✅ src/data/games.ts mis à jour avec succès !');
