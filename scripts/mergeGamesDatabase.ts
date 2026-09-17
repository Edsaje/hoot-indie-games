import fs from 'fs';
import { INDIE_GAMES } from '../src/data/games';
import type { Game } from '../src/types/game';

const fetchedRaw = fs.readFileSync('scripts/fetched_games.json', 'utf8');
const fetchedGames: Game[] = JSON.parse(fetchedRaw);

console.log(`Current existing games: ${INDIE_GAMES.length}`);
console.log(`Fetched games to merge: ${fetchedGames.length}`);

// Merge ensuring no duplicate ids
const existingIds = new Set(INDIE_GAMES.map((g) => g.id));
const uniqueNew = fetchedGames.filter((g) => !existingIds.has(g.id));

console.log(`Unique new games to add: ${uniqueNew.length}`);

const mergedList: Game[] = [...INDIE_GAMES, ...uniqueNew];
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
