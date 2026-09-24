import { createContext } from 'react';
import type { Game } from '../types/game';
import type { SteamCatalogGame } from '../services/steamCatalog';

export interface SteamCatalogContextType {
  allPlayableGames: Game[];
  curatedGems: Game[];
  steamCatalog: SteamCatalogGame[];
  isLoading: boolean;
  searchGames: (query: string, limit?: number) => Game[];
  addCustomGame: (game: SteamCatalogGame) => void;
  removeCustomGame: (id: string) => void;
  stats: {
    totalGames: number;
    steamCatalogCount: number;
    customCount: number;
    genresCount: Record<string, number>;
    yearsCount: Record<string, number>;
    artStylesCount: Record<string, number>;
  };
}

export const SteamCatalogContext = createContext<SteamCatalogContextType | undefined>(undefined);
