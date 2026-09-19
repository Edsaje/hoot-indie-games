import { INDIE_GAMES } from './games';
import type { Game } from '../types/game';

export interface ChronoPuzzle {
  id: string;
  date?: string;
  initialGame: Game;
  cardsToPlace: Game[];
}

// Simple deterministic hash for daily selection
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic PRNG using Mulberry32
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Génère un puzzle Chrono quotidien déterministe à partir d'une date (YYYY-MM-DD)
 * Sélectionne 5 jeux distincts avec des années équilibrées
 */
export function getDailyChronoPuzzle(dateString: string): ChronoPuzzle {
  const seed = stringToHash(`chrono_puzzle_${dateString}`);
  const rand = mulberry32(seed);

  // Pool de tous les jeux valides
  const pool = [...INDIE_GAMES];

  // Mélange de Fisher-Yates déterministe
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Sélectionner 5 jeux distincts
  // Pour une expérience de jeu captivante, on privilégie au moins 3 années différentes
  const selected: Game[] = [];
  const yearsSeen = new Set<number>();

  for (const game of pool) {
    if (selected.length < 5) {
      // Éviter d'avoir 4 jeux de la même année
      const yearCount = selected.filter((g) => g.releaseYear === game.releaseYear).length;
      if (yearCount < 2) {
        selected.push(game);
        yearsSeen.add(game.releaseYear);
      }
    }
    if (selected.length === 5) break;
  }

  // Fallback si la contrainte était trop stricte
  if (selected.length < 5) {
    for (const game of pool) {
      if (!selected.some((g) => g.id === game.id)) {
        selected.push(game);
      }
      if (selected.length === 5) break;
    }
  }

  // Le 1er jeu est le pivot de départ déjà positionné sur la frise
  const initialGame = selected[0];
  // Les 4 autres sont les cartes que le joueur doit placer
  const cardsToPlace = selected.slice(1);

  return {
    id: `chrono_${dateString}`,
    date: dateString,
    initialGame,
    cardsToPlace,
  };
}

/**
 * Génère un puzzle Chrono aléatoire pour les parties infinies / entraînement
 */
export function getRandomChronoPuzzle(seedSuffix = Date.now().toString()): ChronoPuzzle {
  const seed = stringToHash(`chrono_rand_${seedSuffix}`);
  const rand = mulberry32(seed);

  const pool = [...INDIE_GAMES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected: Game[] = pool.slice(0, 5);

  return {
    id: `chrono_practice_${seedSuffix}`,
    initialGame: selected[0],
    cardsToPlace: selected.slice(1),
  };
}
