import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SteamCatalogContext } from './SteamCatalogContext';
import type { SteamCatalogGame } from '../services/steamCatalog';
import type { Game } from '../types/game';
import { TODAY_DAILY_GEM } from '../data/dailyGem';

interface SteamCatalogProviderProps {
  children: React.ReactNode;
}

const DEFAULT_STATS = {
  totalGames: 274,
  steamCatalogCount: 0,
  customCount: 0,
  genresCount: {},
  yearsCount: {},
  artStylesCount: {},
};

export const SteamCatalogProvider: React.FC<SteamCatalogProviderProps> = ({ children }) => {
  const [catalog, setCatalog] = useState<SteamCatalogGame[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([TODAY_DAILY_GEM]);
  const [curatedGems, setCuratedGems] = useState<Game[]>([TODAY_DAILY_GEM]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const steamCatalogRef = useRef<any>(null);

  // Charger le catalogue complet asynchronement en arrière-plan sans bloquer le premier rendu (FCP/LCP)
  useEffect(() => {
    let isMounted = true;

    const loadService = async () => {
      try {
        const { steamCatalog } = await import('../services/steamCatalog');
        if (!isMounted) return;
        steamCatalogRef.current = steamCatalog;

        const playable = steamCatalog.getAllPlayableGames();
        const gems = steamCatalog.getCuratedGems();
        setAllGames(playable);
        setCuratedGems(gems);
        setStats(steamCatalog.getStats());

        const triggerLoadCatalog = () => {
          steamCatalog.loadCatalog().then(async (items) => {
            if (!isMounted) return;
            setCatalog(items);
            const updatedPlayable = steamCatalog.getAllPlayableGames();
            const updatedGems = steamCatalog.getCuratedGems();
            setAllGames(updatedPlayable);
            setCuratedGems(updatedGems);
            setStats(steamCatalog.getStats());
            try {
              const { buildCardsFromGames, setDynamicCardsPool } = await import('../data/cardsData');
              setDynamicCardsPool(buildCardsFromGames(updatedGems));
            } catch {
              // Ignore
            }
            setIsLoading(false);
          });
        };

        let idleTimer: any;
        const onInteraction = () => {
          if (idleTimer) clearTimeout(idleTimer);
          window.removeEventListener('scroll', onInteraction);
          window.removeEventListener('touchstart', onInteraction);
          window.removeEventListener('click', onInteraction);
          triggerLoadCatalog();
        };

        window.addEventListener('scroll', onInteraction, { passive: true, once: true });
        window.addEventListener('touchstart', onInteraction, { passive: true, once: true });
        window.addEventListener('click', onInteraction, { passive: true, once: true });
        idleTimer = setTimeout(onInteraction, 8000);
      } catch (err) {
        console.warn('[SteamCatalogProvider] Background load error:', err);
      }
    };

    let initTimer: any;
    const triggerInit = () => {
      if (initTimer) clearTimeout(initTimer);
      window.removeEventListener('scroll', triggerInit);
      window.removeEventListener('touchstart', triggerInit);
      window.removeEventListener('click', triggerInit);
      loadService();
    };

    window.addEventListener('scroll', triggerInit, { passive: true, once: true });
    window.addEventListener('touchstart', triggerInit, { passive: true, once: true });
    window.addEventListener('click', triggerInit, { passive: true, once: true });
    initTimer = setTimeout(triggerInit, 4000);

    const handleUpdate = async () => {
      if (!steamCatalogRef.current) return;
      const sc = steamCatalogRef.current;
      const playable = sc.getAllPlayableGames();
      const gems = sc.getCuratedGems();
      setAllGames(playable);
      setCuratedGems(gems);
      setStats(sc.getStats());
      try {
        const { buildCardsFromGames, setDynamicCardsPool } = await import('../data/cardsData');
        setDynamicCardsPool(buildCardsFromGames(gems));
      } catch {
        // Ignore
      }
    };

    window.addEventListener('hoot_steam_catalog_updated', handleUpdate);
    window.addEventListener('hoot_steam_store_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      if (initTimer) clearTimeout(initTimer);
      window.removeEventListener('scroll', triggerInit);
      window.removeEventListener('touchstart', triggerInit);
      window.removeEventListener('click', triggerInit);
      window.removeEventListener('hoot_steam_catalog_updated', handleUpdate);
      window.removeEventListener('hoot_steam_store_data_updated', handleUpdate);
    };
  }, []);

  // Synchronisation dynamique du nombre de jeux dans les balises meta de partage et de SEO
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const count = curatedGems.length > 1 ? curatedGems.length : 274;

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
    if (steamCatalogRef.current) {
      return steamCatalogRef.current.searchGames(query, limit);
    }
    const q = query.toLowerCase().trim();
    if (!q) return [TODAY_DAILY_GEM];
    return [TODAY_DAILY_GEM].filter((g) => g.title.toLowerCase().includes(q));
  }, []);

  const addCustomGame = useCallback((game: SteamCatalogGame) => {
    steamCatalogRef.current?.addUserCustomGame(game);
  }, []);

  const removeCustomGame = useCallback((id: string) => {
    steamCatalogRef.current?.removeUserCustomGame(id);
  }, []);

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
