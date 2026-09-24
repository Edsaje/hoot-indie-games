import { getActiveDailyPool } from './games';
import type { Game, LocalizedText } from '../types/game';

export interface PixelClue {
  labelFr: string;
  labelEn: string;
  valueFr: string;
  valueEn: string;
  valueLocalized?: LocalizedText;
}

export interface PixelPuzzle {
  id: string;
  date?: string;
  targetGame: Game;
  imageUrl: string;
  clues: PixelClue[];
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

function buildCluesForGame(game: Game): PixelClue[] {
  // Clue 1: Perspective & Era Window (±2 years window)
  const minYear = Math.max(2005, game.releaseYear - 2);
  const maxYear = Math.min(new Date().getFullYear(), game.releaseYear + 2);
  const clue1: PixelClue = {
    labelFr: 'Perspective & Époque',
    labelEn: 'Perspective & Era',
    valueFr: `${game.camera.fr} • Période ${minYear} - ${maxYear}`,
    valueEn: `${game.camera.en} • Era ${minYear} - ${maxYear}`,
  };

  // Clue 2: Genres
  const genresStr = game.genre.slice(0, 3).join(', ');
  const clue2: PixelClue = {
    labelFr: 'Genres',
    labelEn: 'Genres',
    valueFr: genresStr,
    valueEn: genresStr,
  };

  // Clue 3: Exact Year & Art Style
  const clue3: PixelClue = {
    labelFr: 'Année & Style Visuel',
    labelEn: 'Year & Art Style',
    valueFr: `${game.releaseYear} • ${game.artStyle.fr}`,
    valueEn: `${game.releaseYear} • ${game.artStyle.en}`,
  };

  // Clue 4: Studio
  const clue4: PixelClue = {
    labelFr: 'Studio Développeur',
    labelEn: 'Developer Studio',
    valueFr: game.developer,
    valueEn: game.developer,
  };

  // Clue 5: Tagline / Phrase d'accroche
  const taglineFr = game.hints.tagline.fr || `${game.developer} (${game.releaseYear})`;
  const taglineEn = game.hints.tagline.en || `${game.developer} (${game.releaseYear})`;
  const localizedTaglines: LocalizedText = {
    fr: `« ${taglineFr} »`,
    en: `"${taglineEn}"`,
    es: `« ${game.hints.tagline.es || taglineEn} »`,
    de: `„${game.hints.tagline.de || taglineEn}“`,
    ja: `「${game.hints.tagline.ja || taglineEn}」`,
    'pt-BR': `"${game.hints.tagline['pt-BR'] || taglineEn}"`,
  };
  const clue5: PixelClue = {
    labelFr: "Phrase d'accroche",
    labelEn: 'Tagline',
    valueFr: `« ${taglineFr} »`,
    valueEn: `"${taglineEn}"`,
    valueLocalized: localizedTaglines,
  };

  return [clue1, clue2, clue3, clue4, clue5];
}

/**
 * Sélectionne une capture d'écran nette et caractéristique du jeu
 */
function pickGameScreenshot(game: Game, randVal: number): string {
  if (game.screenshots && game.screenshots.length > 0) {
    const idx = Math.floor(randVal * Math.min(3, game.screenshots.length));
    return game.screenshots[idx] || game.screenshots[0];
  }
  return '';
}

/**
 * Génère le puzzle Pixel quotidien pour une date donnée (YYYY-MM-DD)
 */
export function getDailyPixelPuzzle(dateString: string): PixelPuzzle {
  const seed = stringToHash(`pixel_puzzle_${dateString}`);
  const rand = mulberry32(seed);

  const pool = getActiveDailyPool();
  const gameIndex = Math.floor(rand() * pool.length);
  const targetGame = pool[gameIndex];
  const imageUrl = pickGameScreenshot(targetGame, rand());
  const clues = buildCluesForGame(targetGame);

  return {
    id: `pixel_${dateString}`,
    date: dateString,
    targetGame,
    imageUrl,
    clues,
  };
}

/**
 * Génère un puzzle Pixel aléatoire pour le mode entraînement illimité
 */
export function getRandomPixelPuzzle(seedSuffix = Date.now().toString()): PixelPuzzle {
  const seed = stringToHash(`pixel_rand_${seedSuffix}`);
  const rand = mulberry32(seed);

  const pool = getActiveDailyPool();
  const gameIndex = Math.floor(rand() * pool.length);
  const targetGame = pool[gameIndex];
  const imageUrl = pickGameScreenshot(targetGame, rand());
  const clues = buildCluesForGame(targetGame);

  return {
    id: `pixel_random_${seedSuffix}`,
    targetGame,
    imageUrl,
    clues,
  };
}
