export interface LocalizedText {
  fr: string;
  en: string;
}

// Pour les modes Screenle et Indledle
export interface Game {
  id: string;
  title: string;
  releaseYear: number;
  genre: string[];
  artStyle: LocalizedText;
  camera: LocalizedText;
  developer: string;
  steamUrl?: string;
  screenshots: string[]; // 6 zooms/niveaux pour Screenle
  hints: {
    tagline: LocalizedText;
    composer?: string;
  };
}

// Pour le Mode 3 : Connections / Linkle
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface ConnectionCategory {
  id: string;
  label: LocalizedText; // ex: { fr: "Sortis en 2018", en: "Released in 2018" }
  difficulty: DifficultyLevel; // Associe une couleur : Jaune, Vert, Bleu, Violet
  items: {
    gameId: string;
    gameTitle: string;
    imageUrl: string; // Screenshot ou jaquette
  }[]; // Doit contenir exactement 4 items
}

export interface DailyConnectionsPuzzle {
  id: string;
  date: string; // "YYYY-MM-DD"
  categories: ConnectionCategory[]; // Exactement 4 catégories (soit 16 items au total)
}

// Extensions typées pour la gestion des états de jeu et des statistiques

export type ComparisonResult = 'exact' | 'partial' | 'wrong' | 'higher' | 'lower';

export interface IndledleGuessComparison {
  title: string;
  isCorrectTitle: boolean;
  releaseYear: {
    value: number;
    result: 'exact' | 'higher' | 'lower';
  };
  genres: {
    values: string[];
    result: 'exact' | 'partial' | 'wrong';
    matching: string[];
  };
  artStyle: {
    value: string;
    result: 'exact' | 'wrong';
  };
  camera: {
    value: string;
    result: 'exact' | 'wrong';
  };
  developer: {
    value: string;
    result: 'exact' | 'wrong';
  };
}

export interface DailyGameSaveState {
  gameMode: 'screenle' | 'indledle' | 'linkle';
  date: string;
  guesses: string[];
  isCompleted: boolean;
  isWon: boolean;
  revealedHints?: string[];
  solvedCategoryIds?: string[];
  mistakesRemaining?: number;
}

export interface StreakBreakInfo {
  date: string;
  missedDate: string;
  lostStreak: number;
  canRescueYesterday: boolean;
}

export interface ModeStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedDate?: string;
  lastWonDate?: string;
  activeStreakBreak?: StreakBreakInfo | null;
  streakRescued?: boolean;
}

export interface OverallStats {
  screenle: ModeStats;
  indledle: ModeStats;
  linkle: ModeStats;
  profille: ModeStats;
  chrono: ModeStats;
}

export interface RoostProject {
  id: string;
  title: string;
  tagline: LocalizedText;
  description: LocalizedText;
  category: 'game' | 'prototype' | 'lore' | 'tool';
  tags: string[];
  releaseYear: number;
  status: 'released' | 'in-development' | 'prototype' | 'featured';
  imageUrl: string;
  links: {
    demoUrl?: string;
    githubUrl?: string;
    videoUrl?: string;
    playUrl?: string;
  };
  highlights: LocalizedText[];
}
