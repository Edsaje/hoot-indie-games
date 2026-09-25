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
  const [curatedGems, setCuratedGems] = useState<Game[]>(() => steamCatalog.getCuratedGems());
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  // Charger le catalogue au montage
  useEffect(() => {
    let isMounted = true;
    steamCatalog.loadCatalog().then((items) => {
      if (isMounted) {
        setCatalog(items);
        setAllGames(steamCatalog.getAllPlayableGames());
        setCuratedGems(steamCatalog.getCuratedGems());
        setIsLoading(false);
      }
    });

    const handleUpdate = () => {
      setAllGames(steamCatalog.getAllPlayableGames());
      setCuratedGems(steamCatalog.getCuratedGems());
      setVersion((v) => v + 1);
    };

    window.addEventListener('hoot_steam_catalog_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('hoot_steam_catalog_updated', handleUpdate);
    };
  }, []);

  // Synchronisation dynamique du nombre de jeux dans les balises meta de partage et de SEO
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const count = curatedGems.length;
    if (count <= 0) return;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        `Le sanctuaire du jeu indé : ${count} pépites certifiées, collection de cartes & boosters, 17+ mini-jeux (8 défis quotidiens, arcade rétro 1982), Time Attack et duels 1v1.`
      );
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        `Explorez ${count} pépites indés certifiées Steam ! Collectionnez les cartes de jeux et ouvrez vos boosters, relevez 17+ mini-jeux : 8 défis quotidiens (Screenle, Indledle, Blind Test OST...), 8 bornes d'arcade rétro, quiz trivia, sprints Time Attack et duels 1v1 en direct.`
      );
    }

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute(
        'content',
        `${count} pépites indés certifiées, collection de cartes & boosters sylvestres, 17+ mini-jeux (8 défis quotidiens, 8 bornes d'arcade 1982), quiz trivia, Time Attack et duels 1v1 P2P.`
      );
    }
  }, [curatedGems.length]);

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
      curatedGems,
      steamCatalog: catalog,
      isLoading,
      searchGames,
      addCustomGame,
      removeCustomGame,
      stats,
    }),
    [allGames, curatedGems, catalog, isLoading, searchGames, addCustomGame, removeCustomGame, stats]
  );

  return <SteamCatalogContext.Provider value={value}>{children}</SteamCatalogContext.Provider>;
};
