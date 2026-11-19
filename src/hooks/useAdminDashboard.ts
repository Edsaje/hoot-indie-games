import { useState, useCallback, useEffect } from 'react';
import {
  fetchAdminOverview,
  deleteCommunitySuggestion,
  saveAdminGame,
  type AdminOverviewPayload,
  type AdminCommunitySuggestion,
} from '../services/adminService';
import { fetchSteamProxyStatus } from '../services/steamService';
import { registerSteamStoreData, type SteamStoreGameData } from '../data/steamStoreData';
import { computeGameRarity } from '../data/cardsData';
import {
  inferCanonicalArtStyle,
  inferCanonicalCamera,
  inferEnrichedGenres,
  detectNonIndieStatus,
} from '../utils/gameInference';
import type { Game } from '../types/game';
import { soundFx } from '../utils/audio';

export type AdminTab = 'overview' | 'catalog' | 'games' | 'usernames' | 'suggestions' | 'microIndies' | 'system';

interface UseAdminDashboardProps {
  isOpen: boolean;
  currentSteamId: string;
  initialTab?: AdminTab;
}

export const useAdminDashboard = ({ isOpen, currentSteamId, initialTab }: UseAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'overview');
  const [data, setData] = useState<AdminOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [prefilledGameForCatalog, setPrefilledGameForCatalog] = useState<{
    game: Partial<Game>;
    suggestionId?: string;
  } | null>(null);

  const [steamMasterStatus, setSteamMasterStatus] = useState<{ hasMasterKey: boolean; maskedKey?: string } | null>(null);
  const [validatingSuggestionId, setValidatingSuggestionId] = useState<string | null>(null);

  const showNotice = useCallback((type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => {
      setActionNotice((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [res, steamStatus] = await Promise.all([
        fetchAdminOverview(currentSteamId),
        fetchSteamProxyStatus().catch(() => ({ success: false, hasMasterKey: false })),
      ]);
      setData(res);
      if (steamStatus && typeof steamStatus.hasMasterKey === 'boolean') {
        setSteamMasterStatus(steamStatus);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de joindre le serveur de télémétrie.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSteamId]);

  useEffect(() => {
    if (isOpen) {
      setActionNotice(null);
      if (initialTab) {
        setActiveTab(initialTab);
      }
      const timer = setTimeout(() => {
        void loadData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialTab, loadData]);

  const handleQuickApproveSuggestion = async (s: AdminCommunitySuggestion) => {
    soundFx.playClick();

    const nonIndieCheck = detectNonIndieStatus({
      title: s.title,
      developer: s.developer,
      genres: s.genres,
      comment: s.comment,
    });
    if (nonIndieCheck.isLikelyNonIndie) {
      const confirmed = window.confirm(
        `⚠️ ATTENTION : Le jeu « ${s.title} » semble être une production NON-INDÉPENDANTE / AAA (${nonIndieCheck.reason}).\n\nÊtes-vous certain de vouloir valider ce jeu dans le sanctuaire des pépites indés ?`
      );
      if (!confirmed) {
        return;
      }
    }

    setValidatingSuggestionId(s.id);
    try {
      let dataFR: any = null;
      let dataEN: any = null;
      let fetchedReviews: {
        totalReviews: number;
        totalPositive: number;
        positivePercent: number;
        reviewScoreDesc?: string | { fr?: string; en?: string };
      } | null = null;

      try {
        const lookupRes = await fetch(`/api/suggest_game.php?action=lookup&appId=${s.appId}`);
        if (lookupRes.ok) {
          const lookupJson = await lookupRes.json();
          if (lookupJson.status === 'success' && lookupJson.dataFR) {
            dataFR = lookupJson.dataFR;
            dataEN = lookupJson.dataEN || lookupJson.dataFR;
            if (lookupJson.reviews) {
              fetchedReviews = lookupJson.reviews;
            }
          }
        }
      } catch (err) {
        console.warn('Erreur lookup Steam:', err);
      }

      const title = dataFR?.name?.trim() || s.title;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `game-${s.appId}`;
      const developer = dataFR?.developers?.[0] || s.developer || 'Studio Indépendant';
      const releaseYear = parseInt(
        dataFR?.release_date?.date?.match(/\b(19\d\d|20\d\d)\b/)?.[1] || String(s.releaseYear || new Date().getFullYear()),
        10
      );
      const headerImage = dataFR?.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${s.appId}/header.jpg`;
      const screenshots: string[] = (dataFR?.screenshots || [])
        .map((sc: { path_full: string }) => sc.path_full)
        .slice(0, 6);
      while (screenshots.length < 6) {
        screenshots.push(headerImage);
      }

      const publisher = dataFR?.publishers?.[0] || '';
      const fullDesc = `${title} ${developer} ${publisher} ${dataFR?.short_description || ''} ${dataEN?.short_description || ''} ${dataFR?.detailed_description || ''}`;
      const rawGenres = (dataFR?.genres || []).map((g: { description: string }) => g.description);
      const rawCategories = (dataFR?.categories || []).map((c: { description: string }) => c.description);
      const combinedGenres = [...rawGenres, ...rawCategories];
      const enrichedGenres = inferEnrichedGenres(combinedGenres.length > 0 ? combinedGenres : s.genres, fullDesc);
      const artStyle = inferCanonicalArtStyle(fullDesc, enrichedGenres);
      const camera = inferCanonicalCamera(fullDesc, enrichedGenres);

      const taglineFR = (dataFR?.short_description || `${title} par ${developer}`).replace(/<[^>]+>/g, '').trim();
      const taglineEN = (dataEN?.short_description || `${title} by ${developer}`).replace(/<[^>]+>/g, '').trim();

      let storeDataToSave: SteamStoreGameData | undefined = undefined;
      if (s.appId) {
        const priceOverview = dataFR?.price_overview;
        const isFree = !!dataFR?.is_free || (!priceOverview && dataFR?.is_free);
        const currency = priceOverview?.currency || 'EUR';
        const initialPriceCents = typeof priceOverview?.initial === 'number' ? priceOverview.initial : 0;
        const finalPriceCents = typeof priceOverview?.final === 'number' ? priceOverview.final : 0;
        const discountPercent = typeof priceOverview?.discount_percent === 'number' ? priceOverview.discount_percent : 0;
        const formattedFinalPrice = priceOverview?.final_formatted || (isFree ? 'Gratuit' : '');
        const formattedInitialPrice = priceOverview?.initial_formatted || '';

        const descFr = typeof fetchedReviews?.reviewScoreDesc === 'object' && fetchedReviews?.reviewScoreDesc
          ? (fetchedReviews.reviewScoreDesc.fr || fetchedReviews.reviewScoreDesc.en || 'Très positives')
          : (typeof fetchedReviews?.reviewScoreDesc === 'string' ? fetchedReviews.reviewScoreDesc : 'Très positives');
        const descEn = typeof fetchedReviews?.reviewScoreDesc === 'object' && fetchedReviews?.reviewScoreDesc
          ? (fetchedReviews.reviewScoreDesc.en || fetchedReviews.reviewScoreDesc.fr || 'Very Positive')
          : (typeof fetchedReviews?.reviewScoreDesc === 'string' ? fetchedReviews.reviewScoreDesc : 'Very Positive');

        storeDataToSave = {
          appId: s.appId,
          isFree,
          currency,
          initialPriceCents,
          finalPriceCents,
          discountPercent,
          formattedFinalPrice,
          formattedInitialPrice,
          totalReviews: fetchedReviews?.totalReviews || 0,
          totalPositive: fetchedReviews?.totalPositive || 0,
          positivePercent: fetchedReviews?.positivePercent || 0,
          reviewScoreDesc: {
            fr: descFr,
            en: descEn,
          },
        };
        registerSteamStoreData(storeDataToSave);
      }

      const computedCardRarity = computeGameRarity(
        slug,
        {
          id: slug,
          title,
          steamAppId: s.appId,
          steamUrl: s.steamUrl || `https://store.steampowered.com/app/${s.appId}/`,
        },
        fetchedReviews
          ? {
              totalReviews: fetchedReviews.totalReviews,
              totalPositive: fetchedReviews.totalPositive,
              positivePercent: fetchedReviews.positivePercent,
              reviewScoreDesc: typeof fetchedReviews.reviewScoreDesc === 'object'
                ? (fetchedReviews.reviewScoreDesc?.fr || fetchedReviews.reviewScoreDesc?.en || 'Très positives')
                : (fetchedReviews.reviewScoreDesc || 'Très positives'),
            }
          : undefined
      );

      const gameToSave: Partial<Game> & { isCustomAdmin: boolean; isGem?: boolean } = {
        id: slug,
        title,
        developer,
        releaseYear,
        genre: enrichedGenres,
        artStyle,
        camera,
        steamUrl: s.steamUrl || `https://store.steampowered.com/app/${s.appId}/`,
        steamAppId: s.appId,
        screenshots,
        headerImage,
        hints: {
          tagline: { fr: taglineFR, en: taglineEN },
        },
        cardRarity: computedCardRarity,
        steamStoreData: storeDataToSave,
        isCustomAdmin: true,
        isGem: true,
      };

      const saveRes = await saveAdminGame(gameToSave, currentSteamId);
      if (!saveRes.success) {
        throw new Error(saveRes.message || "Échec de l'enregistrement dans le catalogue souverain.");
      }

      await deleteCommunitySuggestion(s.id, currentSteamId);

      setData((prev) => {
        if (!prev || !prev.suggestions) return prev;
        const nextList = prev.suggestions.list.filter((entry) => entry.id !== s.id && entry.appId !== s.appId);
        return {
          ...prev,
          suggestions: {
            ...prev.suggestions,
            total: nextList.length,
            list: nextList,
          },
        };
      });

      soundFx.playVictory();
      showNotice('success', `La pépite « ${title} » a été validée et intégrée au catalogue public !`);
      await loadData();
    } catch (err: any) {
      soundFx.playError();
      showNotice('error', err.message || "Erreur lors de la validation de la pépite.");
    } finally {
      setValidatingSuggestionId(null);
    }
  };

  const handleEditAndApproveSuggestion = async (s: AdminCommunitySuggestion) => {
    soundFx.playClick();
    setValidatingSuggestionId(s.id);
    try {
      let dataFR: any = null;
      let dataEN: any = null;
      let fetchedReviews: {
        totalReviews: number;
        totalPositive: number;
        positivePercent: number;
        reviewScoreDesc?: string | { fr?: string; en?: string };
      } | null = null;

      try {
        const lookupRes = await fetch(`/api/suggest_game.php?action=lookup&appId=${s.appId}`);
        if (lookupRes.ok) {
          const lookupJson = await lookupRes.json();
          if (lookupJson.status === 'success' && lookupJson.dataFR) {
            dataFR = lookupJson.dataFR;
            dataEN = lookupJson.dataEN || lookupJson.dataFR;
            if (lookupJson.reviews) {
              fetchedReviews = lookupJson.reviews;
            }
          }
        }
      } catch (err) {
        console.warn('Erreur lookup Steam:', err);
      }

      const title = dataFR?.name?.trim() || s.title;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `game-${s.appId}`;
      const developer = dataFR?.developers?.[0] || s.developer || 'Studio Indépendant';
      const releaseYear = parseInt(
        dataFR?.release_date?.date?.match(/\b(19\d\d|20\d\d)\b/)?.[1] || String(s.releaseYear || new Date().getFullYear()),
        10
      );
      const headerImage = dataFR?.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${s.appId}/header.jpg`;
      const screenshots: string[] = (dataFR?.screenshots || [])
        .map((sc: { path_full: string }) => sc.path_full)
        .slice(0, 6);
      while (screenshots.length < 6) {
        screenshots.push(headerImage);
      }

      const publisher = dataFR?.publishers?.[0] || '';
      const fullDesc = `${title} ${developer} ${publisher} ${dataFR?.short_description || ''} ${dataEN?.short_description || ''} ${dataFR?.detailed_description || ''}`;
      const rawGenres = (dataFR?.genres || []).map((g: { description: string }) => g.description);
      const rawCategories = (dataFR?.categories || []).map((c: { description: string }) => c.description);
      const combinedGenres = [...rawGenres, ...rawCategories];
      const enrichedGenres = inferEnrichedGenres(combinedGenres.length > 0 ? combinedGenres : s.genres, fullDesc);
      const artStyle = inferCanonicalArtStyle(fullDesc, enrichedGenres);
      const camera = inferCanonicalCamera(fullDesc, enrichedGenres);

      const taglineFR = (dataFR?.short_description || `${title} par ${developer}`).replace(/<[^>]+>/g, '').trim();
      const taglineEN = (dataEN?.short_description || `${title} by ${developer}`).replace(/<[^>]+>/g, '').trim();

      let storeDataToSave: SteamStoreGameData | undefined = undefined;
      if (s.appId) {
        const priceOverview = dataFR?.price_overview;
        const isFree = !!dataFR?.is_free || (!priceOverview && dataFR?.is_free);
        const currency = priceOverview?.currency || 'EUR';
        const initialPriceCents = typeof priceOverview?.initial === 'number' ? priceOverview.initial : 0;
        const finalPriceCents = typeof priceOverview?.final === 'number' ? priceOverview.final : 0;
        const discountPercent = typeof priceOverview?.discount_percent === 'number' ? priceOverview.discount_percent : 0;
        const formattedFinalPrice = priceOverview?.final_formatted || (isFree ? 'Gratuit' : '');
        const formattedInitialPrice = priceOverview?.initial_formatted || '';

        const descFr = typeof fetchedReviews?.reviewScoreDesc === 'object' && fetchedReviews?.reviewScoreDesc
          ? (fetchedReviews.reviewScoreDesc.fr || fetchedReviews.reviewScoreDesc.en || 'Très positives')
          : (typeof fetchedReviews?.reviewScoreDesc === 'string' ? fetchedReviews.reviewScoreDesc : 'Très positives');
        const descEn = typeof fetchedReviews?.reviewScoreDesc === 'object' && fetchedReviews?.reviewScoreDesc
          ? (fetchedReviews.reviewScoreDesc.en || fetchedReviews.reviewScoreDesc.fr || 'Very Positive')
          : (typeof fetchedReviews?.reviewScoreDesc === 'string' ? fetchedReviews.reviewScoreDesc : 'Very Positive');

        storeDataToSave = {
          appId: s.appId,
          isFree,
          currency,
          initialPriceCents,
          finalPriceCents,
          discountPercent,
          formattedFinalPrice,
          formattedInitialPrice,
          totalReviews: fetchedReviews?.totalReviews || 0,
          totalPositive: fetchedReviews?.totalPositive || 0,
          positivePercent: fetchedReviews?.positivePercent || 0,
          reviewScoreDesc: {
            fr: descFr,
            en: descEn,
          },
        };
        registerSteamStoreData(storeDataToSave);
      }

      const computedCardRarity = computeGameRarity(
        slug,
        {
          id: slug,
          title,
          steamAppId: s.appId,
          steamUrl: s.steamUrl || `https://store.steampowered.com/app/${s.appId}/`,
        },
        fetchedReviews
          ? {
              totalReviews: fetchedReviews.totalReviews,
              totalPositive: fetchedReviews.totalPositive,
              positivePercent: fetchedReviews.positivePercent,
              reviewScoreDesc: typeof fetchedReviews.reviewScoreDesc === 'object'
                ? (fetchedReviews.reviewScoreDesc?.fr || fetchedReviews.reviewScoreDesc?.en || 'Très positives')
                : (fetchedReviews.reviewScoreDesc || 'Très positives'),
            }
          : undefined
      );

      const gameToPrefill: Partial<Game> = {
        id: slug,
        title,
        developer,
        releaseYear,
        genre: enrichedGenres,
        artStyle,
        camera,
        steamUrl: s.steamUrl || `https://store.steampowered.com/app/${s.appId}/`,
        steamAppId: s.appId,
        screenshots,
        headerImage,
        hints: {
          tagline: { fr: taglineFR, en: taglineEN },
        },
        cardRarity: computedCardRarity,
        steamStoreData: storeDataToSave,
      };

      setPrefilledGameForCatalog({ game: gameToPrefill, suggestionId: s.id });
      setActiveTab('catalog');
    } catch (err: any) {
      soundFx.playError();
      showNotice('error', err.message || "Erreur lors de la préparation de l'édition.");
    } finally {
      setValidatingSuggestionId(null);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    soundFx.playClick();
    try {
      const res = await deleteCommunitySuggestion(id, currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        setData((prev) => {
          if (!prev || !prev.suggestions) return prev;
          const nextList = prev.suggestions.list.filter((s) => s.id !== id && String(s.appId) !== id);
          return {
            ...prev,
            suggestions: {
              ...prev.suggestions,
              total: nextList.length,
              list: nextList,
            },
          };
        });
      } else {
        showNotice('error', res.message || 'Échec de la suppression.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la suppression.');
    }
  };

  return {
    activeTab,
    setActiveTab,
    data,
    setData,
    isLoading,
    error,
    actionNotice,
    showNotice,
    loadData,
    steamMasterStatus,
    setSteamMasterStatus,
    validatingSuggestionId,
    prefilledGameForCatalog,
    setPrefilledGameForCatalog,
    handleQuickApproveSuggestion,
    handleEditAndApproveSuggestion,
    handleDeleteSuggestion,
  };
};
