import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SteamCatalogContext } from './SteamCatalogContext';
import { steamCatalog } from '../services/steamCatalog';
import type { SteamCatalogGame } from '../services/steamCatalog';
import type { Game } from '../types/game';

interface SteamCatalogProviderProps {
  children: React.ReactNode;
}

export const SteamCatalogProvider: React.FC<SteamCatalogProviderProps> = ({ children }) => {
  const [catalog, setCatalog] = useState<SteamCatalogGame[]>([]);
  const [allGames, setAllGames] = useState<Game[]>(() => steamCatalog.getAllPlayableGames());
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  // Charger le catalogue au montage
  useEffect(() => {
    let isMounted = true;
    steamCatalog.loadCatalog().then((items) => {
      if (isMounted) {
        setCatalog(items);
        setAllGames(steamCatalog.getAllPlayableGames());
        setIsLoading(false);
      }
    });

    const handleUpdate = () => {
      setAllGames(steamCatalog.getAllPlayableGames());
      setVersion((v) => v + 1);
    };

    window.addEventListener('hoot_steam_catalog_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('hoot_steam_catalog_updated', handleUpdate);
    };
  }, []);

  const searchGames = useCallback((query: string, limit = 20) => {
    return steamCatalog.searchGames(query, limit);
  }, []);

  const addCustomGame = useCallback((game: SteamCatalogGame) => {
    steamCatalog.addUserCustomGame(game);
  }, []);

  const removeCustomGame = useCallback((id: string) => {
    steamCatalog.removeUserCustomGame(id);
  }, []);

  const stats = useMemo(() => {
    if (catalog.length >= 0 && version >= 0) {
      return steamCatalog.getStats();
    }
    return steamCatalog.getStats();
  }, [catalog, version]);

  const value = useMemo(
    () => ({
      allPlayableGames: allGames,
      steamCatalog: catalog,
      isLoading,
      searchGames,
      addCustomGame,
      removeCustomGame,
      stats,
    }),
    [allGames, catalog, isLoading, searchGames, addCustomGame, removeCustomGame, stats]
  );

  return <SteamCatalogContext.Provider value={value}>{children}</SteamCatalogContext.Provider>;
};
