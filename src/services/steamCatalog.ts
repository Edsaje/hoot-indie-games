import { INDIE_GAMES } from '../data/games';
import type { Game } from '../types/game';
import { inferCanonicalArtStyle, inferCanonicalCamera, inferEnrichedGenres } from '../utils/gameInference';

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
  private serverHiddenIds = new Set<string>();
  private serverModifiedGames = new Map<string, Partial<Game>>();
  private serverCustomGames: Game[] = [];

  /**
   * Met à jour les surcharges serveur en mémoire
   */
  public setServerOverrides(overrides: {
    hiddenGameIds?: string[];
    modifiedGames?: Record<string, Partial<Game>>;
    customAdminGames?: Game[];
  }) {
    if (overrides.hiddenGameIds) {
      this.serverHiddenIds = new Set(overrides.hiddenGameIds);
    }
    if (overrides.modifiedGames) {
      this.serverModifiedGames = new Map(Object.entries(overrides.modifiedGames));
    }
    if (overrides.customAdminGames) {
      this.serverCustomGames = overrides.customAdminGames;
    }
  }

  /**
   * Synchronise les surcharges et ajouts de jeux souverains depuis l'API PHP
   */
  public async syncServerOverrides(): Promise<void> {
    try {
      const response = await fetch(`/api/admin_games.php?action=public_overrides&t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          this.setServerOverrides(data);
        }
      }
    } catch {
      // Repli silencieux en mode hors ligne
    }
  }

  /**
   * Charge de façon asynchrone le fichier public/data/steam_catalog.json
   * et les surcharges serveur sans bloquer le rendu initial.
   */
  public async loadCatalog(): Promise<SteamCatalogGame[]> {
    if (this.isLoaded) return this.catalog;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const [steamRes] = await Promise.all([
          fetch('/data/steam_catalog.json').catch(() => null),
          this.syncServerOverrides().catch(() => {}),
        ]);
        if (steamRes && steamRes.ok) {
          const items: SteamCatalogGame[] = await steamRes.json();
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

    const registerGame = (rawGame: Game): boolean => {
      if (this.serverHiddenIds.has(rawGame.id)) return false;

      let game = rawGame;
      if (this.serverModifiedGames.has(rawGame.id)) {
        const mod = this.serverModifiedGames.get(rawGame.id)!;
        game = {
          ...rawGame,
          ...mod,
          hints: {
            ...rawGame.hints,
            ...(mod.hints || {}),
            tagline: {
              ...rawGame.hints.tagline,
              ...(mod.hints?.tagline || {}),
            },
          },
          artStyle: {
            ...rawGame.artStyle,
            ...(mod.artStyle || {}),
          },
          camera: {
            ...rawGame.camera,
            ...(mod.camera || {}),
          },
        };
      }

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

    // 4. Ajouter les jeux souverains créés par l'administrateur
    for (const game of this.serverCustomGames) {
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
      if (raw) {
        const games: SteamCatalogGame[] = JSON.parse(raw);
        let hasChanges = false;
        const sanitized = games.map((g) => {
          if (g.artStyle?.fr === '3D Stylisée' || g.camera?.fr === 'Troisième personne') {
            const desc = `${g.title} ${g.hints?.tagline?.fr || ''} ${g.hints?.tagline?.en || ''}`;
            const correctedStyle = inferCanonicalArtStyle(desc, g.genre);
            const correctedCamera = inferCanonicalCamera(desc, g.genre);
            const correctedGenres = inferEnrichedGenres(g.genre, desc);
            if (
              correctedStyle.fr !== g.artStyle?.fr ||
              correctedCamera.fr !== g.camera?.fr ||
              correctedGenres.length !== g.genre.length
            ) {
              hasChanges = true;
              return {
                ...g,
                artStyle: correctedStyle,
                camera: correctedCamera,
                genre: correctedGenres,
              };
            }
          }
          return g;
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEY_CUSTOM_GAMES, JSON.stringify(sanitized));
        }
        return sanitized;
      }
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
export const steamCatalogService = steamCatalog;
