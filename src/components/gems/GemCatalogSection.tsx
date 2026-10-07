import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  ExternalLink,
  Dice5,
  Search,
  Filter,
  Check,
  RotateCcw,
  X,
  ArrowUpDown,
  Database,
  Star,
  Flame,
  Sliders,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { ItchIcon } from '../common/ItchIcon';
import { soundFx } from '../../utils/audio';
import { formatSteamPrice } from '../../utils/currencyFormatter';
import { getAppIdFromSteamUrl } from '../../utils/steamUrl';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { PaginationControls } from '../common/PaginationControls';
import { telemetry } from '../../services/telemetry';
import { getLocalizedText, getTranslatedGenre } from '../../utils/localization';
import type { Game } from '../../types/game';
import type { NavTab } from '../common/Navbar';

interface GemCatalogSectionProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const GemCatalogSection: React.FC<GemCatalogSectionProps> = ({ onNavigateTab }) => {
  const { t, i18n } = useTranslation();
  const { stats: steamStats, curatedGems: catalogGems } = useSteamCatalog();
  const [gamesCatalog, setGamesCatalog] = useState<Game[]>([]);
  const [steamStoreGetter, setSteamStoreGetter] = useState<((id?: string | number) => any) | null>(null);

  useEffect(() => {
    let active = true;
    let idleTimer: any;

    const loadFullCatalog = () => {
      Promise.all([
        import('../../data/games'),
        import('../../data/steamStoreData'),
      ]).then(([gamesMod, storeMod]) => {
        if (active) {
          setGamesCatalog(gamesMod.INDIE_GAMES);
          setSteamStoreGetter(() => storeMod.getSteamStoreData);
        }
      });
    };

    const trigger = () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
      window.removeEventListener('click', trigger);
      loadFullCatalog();
    };

    window.addEventListener('scroll', trigger, { passive: true, once: true });
    window.addEventListener('touchstart', trigger, { passive: true, once: true });
    window.addEventListener('click', trigger, { passive: true, once: true });
    idleTimer = setTimeout(trigger, 3000);

    return () => {
      active = false;
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
      window.removeEventListener('click', trigger);
    };
  }, []);

  const getStoreData = (appId?: string | number) => {
    if (!appId || !steamStoreGetter) return null;
    return steamStoreGetter(appId);
  };

  const curatedGems = useMemo(() => {
    if (catalogGems && catalogGems.length > 0) return catalogGems;
    if (gamesCatalog.length > 0) return gamesCatalog;
    return [];
  }, [catalogGems, gamesCatalog]);

  const { isGameOwned, toggleGameOwned, hideOwnedGames, setHideOwnedGames } = useUserAccount();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>(() => (hideOwnedGames ? 'unowned' : 'all'));

  useEffect(() => {
    if (hideOwnedGames) {
      setOwnershipFilter('unowned');
    }
  }, [hideOwnedGames]);

  const [priceFilter, setPriceFilter] = useState<'all' | 'sale' | 'free' | 'under10' | 'under20' | '20plus'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'overwhelming' | 'very_positive' | 'positive'>('all');
  const [storeFilter, setStoreFilter] = useState<'all' | 'itch'>('all');
  const [sortBy, setSortBy] = useState<
    | 'yearDesc'
    | 'yearAsc'
    | 'priceAsc'
    | 'priceDesc'
    | 'discountDesc'
    | 'ratingDesc'
    | 'reviewsCountDesc'
    | 'titleAsc'
    | 'titleDesc'
  >('yearDesc');
  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(null);
  const [randomPickedGame, setRandomPickedGame] = useState<Game | null>(null);
  const [randomScreenshotIndex, setRandomScreenshotIndex] = useState<number>(0);
  const [storeUpdateTrigger, setStoreUpdateTrigger] = useState<number>(0);

  useEffect(() => {
    const handleStoreUpdate = () => {
      setStoreUpdateTrigger((prev) => prev + 1);
    };
    window.addEventListener('hoot_steam_store_data_updated', handleStoreUpdate);
    return () => {
      window.removeEventListener('hoot_steam_store_data_updated', handleStoreUpdate);
    };
  }, []);

  const catalogGridRef = useRef<HTMLDivElement | null>(null);

  const ownedCount = useMemo(() => {
    return curatedGems.filter((g) => isGameOwned(g.steamUrl)).length;
  }, [curatedGems, isGameOwned]);

  const itchCount = useMemo(() => {
    return curatedGems.filter((g) => Boolean(g.itchUrl)).length;
  }, [curatedGems]);

  const allGenresList = useMemo(() => {
    const set = new Set<string>();
    curatedGems.forEach((g) => g.genre.forEach((genre) => set.add(genre)));
    return Array.from(set).sort();
  }, [curatedGems]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedGenre !== 'all') count++;
    if (ownershipFilter !== 'all') count++;
    if (priceFilter !== 'all') count++;
    if (ratingFilter !== 'all') count++;
    if (storeFilter !== 'all') count++;
    if (sortBy !== 'yearDesc') count++;
    return count;
  }, [searchQuery, selectedGenre, ownershipFilter, priceFilter, ratingFilter, storeFilter, sortBy]);

  const handleResetFilters = () => {
    soundFx.playClick();
    setSearchQuery('');
    setSelectedGenre('all');
    setOwnershipFilter('all');
    setHideOwnedGames(false);
    setPriceFilter('all');
    setRatingFilter('all');
    setStoreFilter('all');
    setSortBy('yearDesc');
  };

  const formatReviewCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  };

  const filteredGems = useMemo(() => {
    let list = curatedGems.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.developer.toLowerCase().includes(q) ||
        g.genre.some((gen) => gen.toLowerCase().includes(q)) ||
        String(g.releaseYear).includes(q) ||
        Object.values(g.hints.tagline).some((val) => typeof val === 'string' && val.toLowerCase().includes(q));

      const matchesGenre = selectedGenre === 'all' || g.genre.includes(selectedGenre);

      const matchesOwnership =
        ownershipFilter === 'all' ||
        (ownershipFilter === 'owned' && isGameOwned(g.steamUrl)) ||
        (ownershipFilter === 'unowned' && !isGameOwned(g.steamUrl));

      const appId = getAppIdFromSteamUrl(g.steamUrl) || g.steamAppId;
      const storeData = getStoreData(appId) || g.steamStoreData;

      let matchesPrice = true;
      if (priceFilter === 'sale') {
        matchesPrice = Boolean(storeData && storeData.discountPercent > 0);
      } else if (priceFilter === 'free') {
        matchesPrice = Boolean((storeData && (storeData.isFree || storeData.finalPriceCents === 0)) || (!g.steamUrl && Boolean(g.itchUrl)));
      } else if (priceFilter === 'under10') {
        matchesPrice = Boolean(
          storeData &&
          !storeData.isFree &&
          storeData.finalPriceCents > 0 &&
          storeData.finalPriceCents <= 1000
        );
      } else if (priceFilter === 'under20') {
        matchesPrice = Boolean(
          storeData &&
          !storeData.isFree &&
          storeData.finalPriceCents > 0 &&
          storeData.finalPriceCents <= 2000
        );
      } else if (priceFilter === '20plus') {
        matchesPrice = Boolean(
          storeData &&
          !storeData.isFree &&
          storeData.finalPriceCents > 2000
        );
      }

      let matchesRating = true;
      if (ratingFilter === 'overwhelming') {
        matchesRating = Boolean(
          storeData &&
          storeData.positivePercent >= 95 &&
          storeData.totalReviews >= 500
        );
      } else if (ratingFilter === 'very_positive') {
        matchesRating = Boolean(storeData && storeData.positivePercent >= 80);
      } else if (ratingFilter === 'positive') {
        matchesRating = Boolean(storeData && storeData.positivePercent >= 70);
      }

      const matchesStore = storeFilter === 'all' || (storeFilter === 'itch' && Boolean(g.itchUrl));

      return matchesSearch && matchesGenre && matchesOwnership && matchesPrice && matchesRating && matchesStore;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'yearDesc':
          return b.releaseYear - a.releaseYear;
        case 'yearAsc':
          return a.releaseYear - b.releaseYear;
        case 'titleDesc':
          return b.title.localeCompare(a.title);
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'priceAsc': {
          const storeA = getStoreData(getAppIdFromSteamUrl(a.steamUrl) || a.steamAppId) || a.steamStoreData;
          const storeB = getStoreData(getAppIdFromSteamUrl(b.steamUrl) || b.steamAppId) || b.steamStoreData;
          const priceA = storeA ? (storeA.isFree ? 0 : storeA.finalPriceCents) : 999999;
          const priceB = storeB ? (storeB.isFree ? 0 : storeB.finalPriceCents) : 999999;
          return priceA - priceB;
        }
        case 'priceDesc': {
          const storeA = getStoreData(getAppIdFromSteamUrl(a.steamUrl) || a.steamAppId) || a.steamStoreData;
          const storeB = getStoreData(getAppIdFromSteamUrl(b.steamUrl) || b.steamAppId) || b.steamStoreData;
          const priceA = storeA ? (storeA.isFree ? 0 : storeA.finalPriceCents) : -1;
          const priceB = storeB ? (storeB.isFree ? 0 : storeB.finalPriceCents) : -1;
          return priceB - priceA;
        }
        case 'discountDesc': {
          const storeA = getStoreData(getAppIdFromSteamUrl(a.steamUrl) || a.steamAppId) || a.steamStoreData;
          const storeB = getStoreData(getAppIdFromSteamUrl(b.steamUrl) || b.steamAppId) || b.steamStoreData;
          const discA = storeA ? storeA.discountPercent : 0;
          const discB = storeB ? storeB.discountPercent : 0;
          if (discB !== discA) return discB - discA;
          return b.releaseYear - a.releaseYear;
        }
        case 'ratingDesc': {
          const storeA = getStoreData(getAppIdFromSteamUrl(a.steamUrl) || a.steamAppId) || a.steamStoreData;
          const storeB = getStoreData(getAppIdFromSteamUrl(b.steamUrl) || b.steamAppId) || b.steamStoreData;
          const ratA = storeA ? storeA.positivePercent : 0;
          const ratB = storeB ? storeB.positivePercent : 0;
          if (ratB !== ratA) return ratB - ratA;
          const revA = storeA ? storeA.totalReviews : 0;
          const revB = storeB ? storeB.totalReviews : 0;
          return revB - revA;
        }
        case 'reviewsCountDesc': {
          const storeA = getStoreData(getAppIdFromSteamUrl(a.steamUrl) || a.steamAppId) || a.steamStoreData;
          const storeB = getStoreData(getAppIdFromSteamUrl(b.steamUrl) || b.steamAppId) || b.steamStoreData;
          const revA = storeA ? storeA.totalReviews : 0;
          const revB = storeB ? storeB.totalReviews : 0;
          if (revB !== revA) return revB - revA;
          return a.title.localeCompare(b.title);
        }
        default:
          return 0;
      }
    });

    return list;
  }, [curatedGems, searchQuery, selectedGenre, ownershipFilter, priceFilter, ratingFilter, storeFilter, sortBy, isGameOwned, storeUpdateTrigger]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hoot_items_per_page');
      if (saved) {
        const val = parseInt(saved, 10);
        if ([-1, 6, 12, 24, 48, 96].includes(val)) return val;
      }
    } catch {
      // Ignore
    }
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 24;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, ownershipFilter, priceFilter, ratingFilter, storeFilter, sortBy]);

  const effectiveItemsPerPage = itemsPerPage === -1 ? Math.max(1, filteredGems.length) : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredGems.length / effectiveItemsPerPage));

  const paginatedGems = useMemo(() => {
    if (itemsPerPage === -1) {
      return filteredGems;
    }
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGems.slice(start, start + itemsPerPage);
  }, [filteredGems, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (newCount: number) => {
    soundFx.playClick();
    setItemsPerPage(newCount);
    try {
      localStorage.setItem('hoot_items_per_page', String(newCount));
    } catch {
      // Ignore
    }
    if (newCount === -1) {
      setCurrentPage(1);
    } else {
      const currentFirstIndex = (currentPage - 1) * (itemsPerPage === -1 ? filteredGems.length : itemsPerPage);
      const targetPage = Math.max(1, Math.floor(currentFirstIndex / newCount) + 1);
      setCurrentPage(targetPage);
    }
  };

  const handleRandomPick = () => {
    soundFx.playClick();
    if (curatedGems.length === 0) return;
    let candidates = curatedGems;
    if (randomPickedGame && curatedGems.length > 1) {
      candidates = curatedGems.filter((g) => g.id !== randomPickedGame.id);
    }
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex];

    setRandomScreenshotIndex(0);
    setRandomPickedGame(chosen);
    telemetry.track('interaction', 'random_gem_pick', chosen.title);
  };

  const handleLocateRandomGemInCatalog = (game: Game) => {
    soundFx.playClick();
    setRandomPickedGame(null);
    setSearchQuery('');
    setSelectedGenre('all');
    setOwnershipFilter('all');
    setPriceFilter('all');
    setRatingFilter('all');
    setStoreFilter('all');
    setSortBy('yearDesc');
    setHighlightedGameId(game.id);

    const sorted = [...curatedGems].sort((a, b) => {
      if (b.releaseYear !== a.releaseYear) return b.releaseYear - a.releaseYear;
      return a.title.localeCompare(b.title);
    });

    const targetIdx = sorted.findIndex((g) => g.id === game.id);
    if (targetIdx !== -1) {
      const effPerPage = itemsPerPage === -1 ? curatedGems.length : itemsPerPage;
      setCurrentPage(Math.floor(targetIdx / effPerPage) + 1);
    }

    setTimeout(() => {
      const el = document.getElementById(`gem-${game.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-amber-500', 'ring-offset-2', 'ring-offset-[#0b0f19]');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-amber-500', 'ring-offset-2', 'ring-offset-[#0b0f19]');
        }, 3000);
      }
    }, 200);

    setTimeout(() => {
      setHighlightedGameId(null);
    }, 4000);
  };

  useEffect(() => {
    if (!randomPickedGame) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRandomPickedGame(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [randomPickedGame]);

  return (
    <>
      {/* Discovery Banner for Extended Steam Catalog */}
      <div className="group relative mb-8 p-6 rounded-3xl bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-visible">
        <SylvestreIvyFrame density="delicate" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base sm:text-lg font-black text-white">
                {t('home.moreDiscoveries')}
              </p>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                {steamStats.totalGames} {t('home.gamesUnit')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {t('home.moreDiscoveriesDesc', { count: steamStats.totalGames })}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            onNavigateTab('catalog');
          }}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 active:scale-95 shrink-0 cursor-pointer"
        >
          <span>{t('home.exploreCatalog')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Catalog Section Header & Search/Filters */}
      <div ref={catalogGridRef} className="pt-4 mb-6" style={{ contentVisibility: 'auto', containIntrinsicSize: '900px' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <span>{t('home.certifiedCatalogTitle')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('home.certifiedCatalogSubtitle', { count: curatedGems.length })}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-xs font-mono text-amber-400 font-bold shadow-sm">
              {t('catalog.gemsCountUnit', { filtered: filteredGems.length, total: curatedGems.length })}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="group relative bg-[#072a20] border-2 border-[#78350f] rounded-3xl p-5 mb-5 shadow-xl space-y-3.5 overflow-visible">
          <SylvestreIvyFrame density="delicate" />
          {/* Row 1: Search Query */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('catalog.homeSearchPlaceholder')}
              aria-label={t('catalog.homeSearchPlaceholder')}
              className="w-full pl-10 pr-10 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition"
                aria-label={t('catalog.clearSearch')}
                title={t('catalog.clearSearch')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Row 2: Multi-criteria Select Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Genre Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                aria-label={t('catalog.genre', 'Filtrer par genre')}
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">{t('catalog.allGenres')}</option>
                {allGenresList.map((g) => (
                  <option key={g} value={g} className="bg-slate-900">
                    {getTranslatedGenre(g, i18n.language)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Ownership Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <SteamIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                aria-label={t('catalog.libraryOwnership', 'Statut bibliothèque')}
                value={ownershipFilter}
                onChange={(e) => {
                  const val = e.target.value as 'all' | 'owned' | 'unowned';
                  setOwnershipFilter(val);
                  if (val === 'unowned') setHideOwnedGames(true);
                  else if (val === 'all') setHideOwnedGames(false);
                }}
                className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">{t('catalog.ownershipAll')}</option>
                <option value="unowned" className="bg-slate-900">{t('catalog.ownershipUnowned', { count: curatedGems.length - ownedCount })}</option>
                <option value="owned" className="bg-slate-900">{t('catalog.ownershipOwned', { count: ownedCount })}</option>
              </select>
            </div>

            {/* 3. Price & Promo Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                aria-label={t('catalog.priceFilter', 'Filtrer par prix')}
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">{t('catalog.pricesAll')}</option>
                <option value="sale" className="bg-slate-900">{t('catalog.onSaleOnly')}</option>
                <option value="free" className="bg-slate-900">{t('catalog.freeOrItch')}</option>
                <option value="under10" className="bg-slate-900">{t('catalog.under10')}</option>
                <option value="under20" className="bg-slate-900">{t('catalog.under20')}</option>
                <option value="20plus" className="bg-slate-900">{t('catalog.above20')}</option>
              </select>
            </div>

            {/* 4. Rating & Reviews Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400/20" />
              <select
                aria-label={t('catalog.ratingFilter', 'Filtrer par note')}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">{t('catalog.ratingsAll')}</option>
                <option value="overwhelming" className="bg-slate-900">{t('catalog.ratingOverwhelming')}</option>
                <option value="very_positive" className="bg-slate-900">{t('catalog.ratingVeryPositive')}</option>
                <option value="positive" className="bg-slate-900">{t('catalog.ratingPositive')}</option>
              </select>
            </div>
          </div>

          {/* Row 3: Sort & Quick Badges Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#1e293b]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-400">{t('catalog.sortBy')} :</span>
              <select
                aria-label={t('catalog.sortBy', 'Trier le catalogue')}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0b0f19] border border-[#1e293b] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="yearDesc" className="bg-slate-900">{t('catalog.sortYearDesc')}</option>
                <option value="yearAsc" className="bg-slate-900">{t('catalog.sortYearAsc')}</option>
                <option value="priceAsc" className="bg-slate-900">{t('catalog.sortPriceAsc')}</option>
                <option value="priceDesc" className="bg-slate-900">{t('catalog.sortPriceDesc')}</option>
                <option value="discountDesc" className="bg-slate-900">{t('catalog.sortDiscountDesc')}</option>
                <option value="ratingDesc" className="bg-slate-900">{t('catalog.sortRatingDesc')}</option>
                <option value="reviewsCountDesc" className="bg-slate-900">{t('catalog.sortReviewsDesc')}</option>
                <option value="titleAsc" className="bg-slate-900">{t('catalog.sortTitleAsc')}</option>
                <option value="titleDesc" className="bg-slate-900">{t('catalog.sortTitleDesc')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRandomPick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
                title={t('catalog.randomPickTooltip')}
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>{t('catalog.randomPickBtn')}</span>
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-semibold transition active:scale-95 cursor-pointer"
                  title={t('catalog.resetFilters')}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('catalog.resetFiltersBtn')} ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>{t('catalog.quickTags')} :</span>
            </span>

            <button
              onClick={() => {
                setOwnershipFilter('all');
                setHideOwnedGames(false);
                setPriceFilter('all');
                setSelectedGenre('all');
                setStoreFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                ownershipFilter === 'all' && priceFilter === 'all' && selectedGenre === 'all' && storeFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'bg-[#0b0f19] text-slate-300 hover:bg-slate-800 border border-[#1e293b]'
              }`}
            >
              {t('catalog.allGames', { count: curatedGems.length })}
            </button>

            <button
              onClick={() => {
                setOwnershipFilter('unowned');
                setHideOwnedGames(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                ownershipFilter === 'unowned'
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'bg-[#0b0f19] text-slate-300 hover:bg-slate-800 border border-[#1e293b]'
              }`}
            >
              {t('catalog.toDiscover', { count: curatedGems.length - ownedCount })}
            </button>

            {ownedCount > 0 && (
              <button
                onClick={() => {
                  setOwnershipFilter('owned');
                  setHideOwnedGames(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  ownershipFilter === 'owned'
                    ? 'bg-emerald-500 text-black font-bold shadow'
                    : 'bg-[#0b0f19] text-slate-300 hover:bg-slate-800 border border-[#1e293b]'
                }`}
              >
                <SteamIcon className="w-3 h-3" />
                <span>{t('catalog.owned')} ({ownedCount})</span>
              </button>
            )}

            <button
              onClick={() => setPriceFilter(priceFilter === 'sale' ? 'all' : 'sale')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                priceFilter === 'sale'
                  ? 'bg-emerald-500 text-black font-bold shadow'
                  : 'bg-[#0b0f19] text-slate-300 hover:bg-slate-800 border border-[#1e293b]'
              }`}
            >
              <Flame className="w-3 h-3 text-emerald-400" />
              <span>{t('catalog.salesTag')}</span>
            </button>

            <button
              onClick={() => setStoreFilter(storeFilter === 'itch' ? 'all' : 'itch')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                storeFilter === 'itch'
                  ? 'bg-[#fa5c5c] text-white font-bold shadow'
                  : 'bg-[#0b0f19] text-slate-300 hover:bg-slate-800 border border-[#1e293b]'
              }`}
            >
              <ItchIcon className="w-3 h-3 text-[#fa5c5c]" />
              <span>{t('catalog.itchMicroGems', { count: itchCount })}</span>
            </button>
          </div>
        </div>

        {/* Active Filters Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5 px-3 py-2 rounded-xl bg-[#0b0f19]/70 border border-[#1e293b]">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>{t('catalog.activeFilters')} :</span>
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs">
                <span>"{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-white" aria-label={t('catalog.clearFilter')} title={t('catalog.clearFilter')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedGenre !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs">
                <span>{getTranslatedGenre(selectedGenre, i18n.language)}</span>
                <button type="button" onClick={() => setSelectedGenre('all')} className="hover:text-white" aria-label={t('catalog.clearFilter')} title={t('catalog.clearFilter')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {ownershipFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs">
                <span>{ownershipFilter === 'owned' ? t('catalog.filterOwned') : t('catalog.filterUnowned')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setOwnershipFilter('all');
                    setHideOwnedGames(false);
                  }}
                  className="hover:text-white"
                  aria-label={t('catalog.clearFilter')}
                  title={t('catalog.clearFilter')}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs">
                <span>
                  {priceFilter === 'sale'
                    ? t('catalog.filterSale')
                    : priceFilter === 'free'
                    ? t('catalog.filterFree')
                    : priceFilter === 'under10'
                    ? t('catalog.filterUnder10')
                    : priceFilter === 'under20'
                    ? t('catalog.filterUnder20')
                    : t('catalog.filterAbove20')}
                </span>
                <button type="button" onClick={() => setPriceFilter('all')} className="hover:text-white" aria-label={t('catalog.clearFilter')} title={t('catalog.clearFilter')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {ratingFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs">
                <span>{ratingFilter === 'overwhelming' ? '≥ 95%' : ratingFilter === 'very_positive' ? '≥ 80%' : '≥ 70%'}</span>
                <button type="button" onClick={() => setRatingFilter('all')} className="hover:text-white" aria-label={t('catalog.clearFilter')} title={t('catalog.clearFilter')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {storeFilter === 'itch' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#fa5c5c]/20 text-[#fa5c5c] border border-[#fa5c5c]/40 text-xs">
                <span>Itch.io</span>
                <button type="button" onClick={() => setStoreFilter('all')} className="hover:text-white" aria-label={t('catalog.clearFilter')} title={t('catalog.clearFilter')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Gems Cards Grid */}
        <div id="gems-grid-top" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedGems.map((game) => {
            const isHighlighted = highlightedGameId === game.id;
            const owned = isGameOwned(game.steamUrl);
            const appId = getAppIdFromSteamUrl(game.steamUrl) || game.steamAppId;
            const storeData = getStoreData(appId) || game.steamStoreData;
            const localizedPrice = formatSteamPrice(storeData, i18n.language, Boolean(game.itchUrl));

            return (
              <div
                key={game.id}
                id={`gem-${game.id}`}
                className={`deferred-card bg-[#131a29] border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group flex flex-col justify-between relative ${
                  isHighlighted
                    ? 'border-amber-400 ring-4 ring-amber-500/40 scale-102 bg-[#182338]'
                    : owned
                    ? 'border-cyan-900/50 hover:border-cyan-400/60 hover:shadow-2xl'
                    : 'border-[#1e293b] hover:border-amber-500/40 hover:shadow-2xl'
                }`}
              >
                {/* Thumbnail & Badges */}
                <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-slate-950">
                  <img
                    src={(game.screenshots[5] || game.screenshots[0] || '').replace('1920x1080.jpg', '600x338.jpg')}
                    alt={game.title}
                    width={600}
                    height={338}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131a29] via-transparent to-transparent opacity-60" />

                  {/* Top-Left Badges: Owned, Discount & Itch */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {owned && (
                      <div className="px-2.5 py-1 rounded-lg bg-[#0e1726]/90 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-[11px] font-black flex items-center gap-1.5 shadow-lg">
                        <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('catalog.owned')}</span>
                      </div>
                    )}
                    {storeData && storeData.discountPercent > 0 && (
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-500 text-black font-black text-xs shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-black" />
                        <span>-{storeData.discountPercent}%</span>
                      </div>
                    )}
                    {game.itchUrl && (
                      <div className="px-2 py-0.5 rounded-lg bg-[#fa5c5c]/20 backdrop-blur-md border border-[#fa5c5c]/40 text-[#fa5c5c] text-[11px] font-bold flex items-center gap-1 shadow-lg">
                        <ItchIcon className="w-3 h-3 text-[#fa5c5c]" />
                        <span>Itch</span>
                      </div>
                    )}
                  </div>

                  {/* Top-Right Badges: Price & Release Year */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {storeData || game.itchUrl ? (
                      localizedPrice.discountPercent > 0 ? (
                        <div className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-md">
                          {localizedPrice.formattedInitial && (
                            <span className="line-through text-slate-400 text-[10px]">
                              {localizedPrice.formattedInitial}
                            </span>
                          )}
                          <span>{localizedPrice.formattedFinal}</span>
                        </div>
                      ) : localizedPrice.isFree ? (
                        <div className="px-2 py-0.5 rounded-lg bg-emerald-500/90 text-slate-950 font-black text-xs shadow-md">
                          {localizedPrice.formattedFinal}
                        </div>
                      ) : localizedPrice.formattedFinal ? (
                        <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-slate-200 border border-white/10 shadow-md">
                          {localizedPrice.formattedFinal}
                        </div>
                      ) : null
                    ) : null}

                    <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-amber-500/30 shadow-md">
                      {game.releaseYear}
                    </div>
                  </div>

                  {/* Steam Store Positive Rating Overlay Badge */}
                  {storeData && storeData.totalReviews > 0 && (
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 border border-amber-500/20 shadow">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{storeData.positivePercent}%</span>
                      <span className="text-slate-400 text-[9px]">({formatReviewCount(storeData.totalReviews)})</span>
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition leading-snug line-clamp-1">
                        {game.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 mb-2 font-medium">
                      {game.developer}
                    </p>

                    <p className="text-xs text-slate-300/90 italic mb-3 line-clamp-2 leading-relaxed">
                      "{getLocalizedText(game.hints.tagline, i18n.language)}"
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {game.genre.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setSelectedGenre(g);
                            catalogGridRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition cursor-pointer ${
                            selectedGenre === g
                              ? 'bg-amber-400 text-black font-bold'
                              : 'bg-[#1e293b]/80 hover:bg-[#2d3d56] text-slate-300 border border-[#2d3d56]'
                          }`}
                        >
                          {getTranslatedGenre(g, i18n.language)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      {game.steamUrl && (
                        <a
                          href={game.steamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e1726] hover:bg-[#15233a] border border-[#1e293b] hover:border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm active:scale-95"
                          title="Fiche du jeu sur le magasin Steam"
                        >
                          <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Steam</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}

                      {game.itchUrl && (
                        <a
                          href={game.itchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#fa5c5c]/15 hover:bg-[#fa5c5c]/25 border border-[#fa5c5c]/30 hover:border-[#fa5c5c]/60 text-[#fa5c5c] text-xs font-bold transition shadow-sm active:scale-95 ${
                            !game.steamUrl ? 'flex-1' : ''
                          }`}
                          title="Fiche du jeu sur Itch.io"
                        >
                          <ItchIcon className="w-3.5 h-3.5 text-[#fa5c5c]" />
                          <span>Itch</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>

                    {game.steamUrl && (
                      <button
                        type="button"
                        onClick={() => toggleGameOwned(game.steamUrl)}
                        className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
                          owned
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30'
                            : 'bg-[#0e1726] border-[#1e293b] text-slate-500 hover:text-slate-300 hover:border-slate-600'
                        }`}
                        title={
                          owned
                            ? t('catalog.markUnownedTooltip', 'Marquer comme non possédé')
                            : t('catalog.markOwnedTooltip', 'Marquer comme possédé dans ma bibliothèque')
                        }
                        aria-label={
                          owned
                            ? t('catalog.markUnownedTooltip', 'Marquer comme non possédé')
                            : t('catalog.markOwnedTooltip', 'Marquer comme possédé dans ma bibliothèque')
                        }
                      >
                        <Check className={`w-3.5 h-3.5 ${owned ? 'text-cyan-400 stroke-[3]' : 'opacity-40'}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredGems.length === 0 && (
          <div className="py-16 text-center bg-[#072a20] rounded-3xl border-2 border-[#78350f] p-8 shadow-xl">
            <Filter className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">{t('catalog.noGemsFound')}</h3>
            <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
              {t('catalog.noGemsFoundDesc')}
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('catalog.resetFiltersBtn')}</span>
            </button>
          </div>
        )}

        {/* Global Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={filteredGems.length}
          itemsPerPageOptions={[6, 12, 24, 48, 96, -1]}
          itemName={t('pagination.gems', { defaultValue: 'pépites' })}
          scrollToId="gems-grid-top"
          className="mt-8"
        />
      </div>

      {/* Modale Pépite Découverte au Hasard */}
      {randomPickedGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setRandomPickedGame(null)}
        >
          <div
            className="group relative bg-[#072a20] border-2 border-[#78350f] rounded-3xl w-full max-w-2xl overflow-visible shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <SylvestreIvyFrame density="delicate" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1b4332] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Dice5 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Tirage Aléatoire
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Pépite du Sanctuaire
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {randomPickedGame.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRandomPickedGame(null)}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                aria-label="Fermer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Screenshot Hero */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-lg group">
              <img
                src={
                  randomPickedGame.screenshots[randomScreenshotIndex] ||
                  randomPickedGame.screenshots[0]
                }
                alt={randomPickedGame.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-mono text-xs font-bold border border-amber-500/30 shadow">
                  {randomPickedGame.releaseYear}
                </span>
                {isGameOwned(randomPickedGame.steamUrl) && (
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 backdrop-blur-md text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1 shadow">
                    <SteamIcon className="w-3 h-3 text-cyan-400" />
                    <span>Possédé</span>
                  </span>
                )}
              </div>

              {/* Mini Screenshot Carousel Switcher */}
              {randomPickedGame.screenshots.length > 1 && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {randomPickedGame.screenshots.slice(0, 6).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRandomScreenshotIndex(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        randomScreenshotIndex === idx
                          ? 'bg-amber-400 w-5'
                          : 'bg-white/40 hover:bg-white/70 w-2.5'
                      }`}
                      title={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-amber-300 font-semibold">
                  Studio : <span className="text-white font-bold">{randomPickedGame.developer}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span>{getLocalizedText(randomPickedGame.camera, i18n.language)}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span>{getLocalizedText(randomPickedGame.artStyle, i18n.language)}</span>
                </div>

                {/* Steam Store Score if available */}
                {(() => {
                  const appId = getAppIdFromSteamUrl(randomPickedGame.steamUrl) || randomPickedGame.steamAppId;
                  const store = getStoreData(appId) || randomPickedGame.steamStoreData;
                  if (store && store.totalReviews > 0) {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/40 text-sky-300 text-xs font-bold font-mono">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{store.positivePercent}% positifs</span>
                        </span>
                        <span className="text-xs text-slate-400">
                          ({formatReviewCount(store.totalReviews)} avis)
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Tagline */}
              <p className="text-sm text-slate-200 italic bg-[#041710] p-3.5 rounded-xl border border-[#1b4332] leading-relaxed">
                « {getLocalizedText(randomPickedGame.hints?.tagline, i18n.language)} »
              </p>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5">
                {randomPickedGame.genre.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg bg-[#0b1b14] text-emerald-200 text-xs font-medium border border-[#1b4332]"
                  >
                    {getTranslatedGenre(g, i18n.language)}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-[#1b4332] flex flex-wrap items-center gap-2.5 justify-between">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                {randomPickedGame.steamUrl && (
                  <a
                    href={randomPickedGame.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <SteamIcon className="w-4 h-4 text-slate-950" />
                    <span>Découvrir sur Steam</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {randomPickedGame.itchUrl && (
                  <a
                    href={randomPickedGame.itchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#fa5c5c]/20 hover:bg-[#fa5c5c]/30 text-[#fa5c5c] border border-[#fa5c5c]/40 text-xs font-bold transition active:scale-95"
                  >
                    <ItchIcon className="w-4 h-4 text-[#fa5c5c]" />
                    <span>Itch.io</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRandomPick}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1b14] hover:bg-emerald-950 text-amber-400 border border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
                  title="Relancer un tirage aléatoire"
                >
                  <Dice5 className="w-4 h-4" />
                  <span>Autre pépite 🎲</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLocateRandomGemInCatalog(randomPickedGame)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
                  title="Voir la carte dans le catalogue complet"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Dans le catalogue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
