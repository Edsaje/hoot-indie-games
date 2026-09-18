import { INDIE_GAMES } from '../data/games';
import type { Game } from '../types/game';

export interface SteamCatalogGame extends Game {
  steamAppId?: number;
  headerImage?: string;
  isCustomImport?: boolean;
}

const STORAGE_KEY_CUSTOM_GAMES = 'hoot_custom_imported_steam_games_v1';

class SteamCatalogService {
  private catalog: SteamCatalogGame[] = [];
  private isLoaded = false;
  private loadPromise: Promise<SteamCatalogGame[]> | null = null;

  /**
   * Charge de façon asynchrone le fichier public/data/steam_catalog.json
   * sans bloquer le rendu initial.
   */
  public async loadCatalog(): Promise<SteamCatalogGame[]> {
    if (this.isLoaded) return this.catalog;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const response = await fetch('/data/steam_catalog.json');
        if (response.ok) {
          const items: SteamCatalogGame[] = await response.json();
          this.catalog = items;
        }
      } catch (err) {
        console.warn('Impossible de charger /data/steam_catalog.json, repli sur le catalogue de base:', err);
      } finally {
        this.isLoaded = true;
      }
      return this.catalog;
    })();

    return this.loadPromise;
  }

  /**
   * Retourne la liste fusionnée de tous les jeux jouables :
   * Jeux certifiés Hoot Indie Games + catalogue Steam + imports personnalisés.
   * Dédoublonnage strict par ID, Steam AppID et titre normalisé (ex: Shovel Knight, Disco Elysium).
   */
  public getAllPlayableGames(): Game[] {
    const custom = this.getUserCustomGames();
    const map = new Map<string, Game>();
    const seenAppIds = new Set<string>();
    const seenTitles = new Set<string>();

    const extractAppId = (url?: string): string | null => {
      if (!url) return null;
      const m = url.match(/\/app\/(\d+)/);
      return m ? m[1] : null;
    };

    const normalizeTitle = (t: string): string => {
      return t
        .toLowerCase()
        .replace(/[:\-–—'’!?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const registerGame = (game: Game): boolean => {
      const appId = extractAppId(game.steamUrl) || (game as SteamCatalogGame).steamAppId?.toString();
      const normTitle = normalizeTitle(game.title);

      if (map.has(game.id)) return false;
      if (appId && seenAppIds.has(appId)) return false;
      if (normTitle && seenTitles.has(normTitle)) return false;

      map.set(game.id, game);
      if (appId) seenAppIds.add(appId);
      if (normTitle) seenTitles.add(normTitle);
      return true;
    };

    // 1. Ajouter d'abord les jeux certifiés "Hoot Indie Games" (priorité maximale)
    for (const game of INDIE_GAMES) {
      registerGame(game);
    }

    // 2. Ajouter les jeux du catalogue Steam
    for (const game of this.catalog) {
      registerGame(game);
    }

    // 3. Ajouter les imports personnalisés
    for (const game of custom) {
      registerGame(game);
    }

    return Array.from(map.values());
  }

  /**
   * Recherche instantanée bilingue multi-critères
   */
  public searchGames(query: string, limit = 20): Game[] {
    const all = this.getAllPlayableGames();
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, limit);

    return all
      .filter((g) => {
        return (
          g.title.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.genre.some((gen) => gen.toLowerCase().includes(q)) ||
          g.artStyle.fr.toLowerCase().includes(q) ||
          g.artStyle.en.toLowerCase().includes(q) ||
          g.camera.fr.toLowerCase().includes(q) ||
          g.camera.en.toLowerCase().includes(q)
        );
      })
      .slice(0, limit);
  }

  /**
   * Récupère les jeux importés par l'utilisateur dans son localStorage
   */
  public getUserCustomGames(): SteamCatalogGame[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_GAMES);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return [];
  }

  /**
   * Ajoute un jeu importé manuellement
   */
  public addUserCustomGame(game: SteamCatalogGame): void {
    if (typeof localStorage === 'undefined') return;
    const current = this.getUserCustomGames();
    const filtered = current.filter((g) => g.id !== game.id);
    filtered.unshift({ ...game, isCustomImport: true });
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_GAMES, JSON.stringify(filtered));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hoot_steam_catalog_updated'));
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Supprime un jeu importé
   */
  public removeUserCustomGame(id: string): void {
    if (typeof localStorage === 'undefined') return;
    const current = this.getUserCustomGames();
    const filtered = current.filter((g) => g.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_GAMES, JSON.stringify(filtered));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hoot_steam_catalog_updated'));
      }
    } catch {
      // Ignore
    }
  }

  public getStats() {
    const all = this.getAllPlayableGames();
    const genresCount: Record<string, number> = {};
    const yearsCount: Record<string, number> = {};
    const artStylesCount: Record<string, number> = {};

    for (const g of all) {
      yearsCount[g.releaseYear] = (yearsCount[g.releaseYear] || 0) + 1;
      artStylesCount[g.artStyle.fr] = (artStylesCount[g.artStyle.fr] || 0) + 1;
      for (const gen of g.genre) {
        genresCount[gen] = (genresCount[gen] || 0) + 1;
      }
    }

    return {
      totalGames: all.length,
      steamCatalogCount: this.catalog.length,
      customCount: this.getUserCustomGames().length,
      genresCount,
      yearsCount,
      artStylesCount,
    };
  }
}

export const steamCatalog = new SteamCatalogService();
