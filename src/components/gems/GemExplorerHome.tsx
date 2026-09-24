import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Sparkles,
  ExternalLink,
  Camera,
  Layers,
  Gamepad2,
  Dice5,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  Check,
  FileSearch,
  History,
  Sliders,
  MessageSquareQuote,
  Music,
  Zap,
  Swords,
  Tag,
  Star,
  Flame,
  RotateCcw,
  X,
  ArrowUpDown,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getDailyGame, INDIE_GAMES } from '../../data/games';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { ItchIcon } from '../common/ItchIcon';
import { soundFx } from '../../utils/audio';
import { getSteamStoreData } from '../../data/steamStoreData';
import { getAppIdFromSteamUrl } from '../../services/steamService';
import { getChallengeStatusForDate } from '../../utils/streakManager';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import type { NavTab } from '../common/Navbar';
import type { ArcadeGameId } from '../arcade/ArcadeModal';
import { SylvestreHudFrame } from '../sylvestre/SylvestreHudFrame';
import { SylvestreBranchDivider } from '../sylvestre/SylvestreBranchDivider';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { PaginationControls } from '../common/PaginationControls';
import { telemetry } from '../../services/telemetry';
import { getLocalizedText, getTranslatedGenre } from '../../utils/localization';
import type { Game } from '../../types/game';

interface GemExplorerHomeProps {
  currentDate: string;
  onNavigateTab: (tab: NavTab) => void;
  onOpenArcade: (gameId?: ArcadeGameId) => void;
}

export const GemExplorerHome: React.FC<GemExplorerHomeProps> = ({
  currentDate,
  onNavigateTab,
  onOpenArcade,
}) => {
  const { t, i18n } = useTranslation();
  const { stats: steamStats, curatedGems: catalogGems } = useSteamCatalog();
  const curatedGems = catalogGems && catalogGems.length > 0 ? catalogGems : INDIE_GAMES;
  const { isGameOwned, isSteamConnected, toggleGameOwned, hideOwnedGames, setHideOwnedGames, connectSteamWithOpenId } = useUserAccount();

  // The featured canonical daily gem (guaranteed never to spoil Screenle (offset 0) or Indledle (offset 3), and drawn strictly from curated gems)
  const dailyGem = useMemo(() => {
    const screenleGame = getDailyGame(currentDate, 0, curatedGems);
    const indledleGame = getDailyGame(currentDate, 3, curatedGems);
    const pool = curatedGems.length > 0 ? curatedGems : INDIE_GAMES;
    let hash = 0;
    for (let i = 0; i < currentDate.length; i++) {
      hash = (hash << 5) - hash + currentDate.charCodeAt(i);
      hash |= 0;
    }
    let offset = 17;
    let candidate = pool[Math.abs(hash + offset) % pool.length];
    while (
      (candidate.id === screenleGame.id || candidate.id === indledleGame.id) &&
      offset < 100
    ) {
      offset += 5;
      candidate = pool[Math.abs(hash + offset) % pool.length];
    }
    return candidate;
  }, [currentDate, curatedGems]);

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

  const catalogGridRef = useRef<HTMLDivElement | null>(null);

  const ownedCount = useMemo(() => {
    return curatedGems.filter((g) => isGameOwned(g.steamUrl)).length;
  }, [curatedGems, isGameOwned]);

  const itchCount = useMemo(() => {
    return curatedGems.filter((g) => Boolean(g.itchUrl)).length;
  }, [curatedGems]);

  // Check today's game completion status for all 8 daily disciplines
  const dailyStatus = useMemo(() => {
    return getChallengeStatusForDate(currentDate);
  }, [currentDate]);

  // Extract unique genres across all games
  const allGenresList = useMemo(() => {
    const set = new Set<string>();
    curatedGems.forEach((g) => g.genre.forEach((genre) => set.add(genre)));
    return Array.from(set).sort();
  }, [curatedGems]);

  // Active non-default filters count
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

  // Helper for human-readable review counts (544k, 1.2M, etc.)
  const formatReviewCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  };

  // Filtered and sorted gems catalog
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

      const appId = getAppIdFromSteamUrl(g.steamUrl);
      const storeData = getSteamStoreData(appId);

      // Price & Sale filter
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

      // Rating filter
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

    // Sorting logic
    list.sort((a, b) => {
      const storeA = getSteamStoreData(getAppIdFromSteamUrl(a.steamUrl));
      const storeB = getSteamStoreData(getAppIdFromSteamUrl(b.steamUrl));

      switch (sortBy) {
        case 'yearDesc':
          return b.releaseYear - a.releaseYear;

        case 'yearAsc':
          return a.releaseYear - b.releaseYear;

        case 'priceAsc': {
          const priceA = storeA ? (storeA.isFree ? 0 : storeA.finalPriceCents) : 999999;
          const priceB = storeB ? (storeB.isFree ? 0 : storeB.finalPriceCents) : 999999;
          return priceA - priceB;
        }

        case 'priceDesc': {
          const priceA = storeA ? (storeA.isFree ? 0 : storeA.finalPriceCents) : -1;
          const priceB = storeB ? (storeB.isFree ? 0 : storeB.finalPriceCents) : -1;
          return priceB - priceA;
        }

        case 'discountDesc': {
          const discA = storeA ? storeA.discountPercent : 0;
          const discB = storeB ? storeB.discountPercent : 0;
          if (discB !== discA) return discB - discA;
          return b.releaseYear - a.releaseYear;
        }

        case 'ratingDesc': {
          const ratA = storeA ? storeA.positivePercent : 0;
          const ratB = storeB ? storeB.positivePercent : 0;
          if (ratB !== ratA) return ratB - ratA;
          const revA = storeA ? storeA.totalReviews : 0;
          const revB = storeB ? storeB.totalReviews : 0;
          return revB - revA;
        }

        case 'reviewsCountDesc': {
          const revA = storeA ? storeA.totalReviews : 0;
          const revB = storeB ? storeB.totalReviews : 0;
          if (revB !== revA) return revB - revA;
          return a.title.localeCompare(b.title);
        }

        case 'titleDesc':
          return b.title.localeCompare(a.title);

        case 'titleAsc':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return list;
  }, [curatedGems, searchQuery, selectedGenre, ownershipFilter, priceFilter, ratingFilter, storeFilter, sortBy, isGameOwned]);

  // Système de pagination (paramétrable par l'utilisateur, persistant dans localStorage)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hoot_items_per_page');
      if (saved) {
        const val = parseInt(saved, 10);
        if ([-1, 12, 24, 48, 96].includes(val)) return val;
      }
    } catch {
      // Ignore
    }
    return 24;
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

  // Roulette: Randomly pick a gem and display it in spotlight modal
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

    // Calculer la page cible pour que la pépite tirée au sort soit visible dans la liste triée
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
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hero Spotlight: Featured Daily Gem & Nocturnal Woodland Atmosphere */}
      <div className="group relative rounded-2xl sm:rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-4 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-[inset_0_2px_2px_rgba(217,119,6,0.3),0_16px_40px_rgba(0,0,0,0.8)]">
        {/* Living Creeping Ivy Frame Contour */}
        <SylvestreIvyFrame density="medium" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>{t('home.gemExplorer')}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t('home.heroTitlePart1')}<span className="text-amber-400">{t('home.heroTitleHighlight')}</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {t('home.heroDesc')}
            </p>

            {/* Quick Action Buttons (Optimized Mobile-First Thumb Targets) */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigateTab('screenle');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer touch-manipulation"
              >
                <Camera className="w-4 h-4" />
                <span>{t('home.playDailyChallenge')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 sm:flex sm:w-auto gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRandomPick}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 border border-emerald-900/40 hover:border-amber-500/50 text-xs sm:text-sm font-bold transition shadow cursor-pointer touch-manipulation"
                >
                  <Dice5 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t('home.randomGem')}</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateTab('microindies');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-[#06241b] hover:from-emerald-800 hover:to-emerald-700 text-emerald-200 border border-emerald-500/40 hover:border-amber-400 text-xs sm:text-sm font-bold transition shadow cursor-pointer touch-manipulation"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t('home.microIndiesBtn', 'Micro-Indés')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Featured Daily Gem Card */}
          <div className="lg:col-span-5 w-full">
            <SylvestreHudFrame
              variant="wood"
              accent="amber"
              withLeaves={true}
              interactive={true}
            >
              <div className="p-3.5 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                    ⭐ {t('home.dailyGem')}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200/80 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {currentDate}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-[#4a3424] shadow-inner">
                  <img
                    src={dailyGem.screenshots[5] || dailyGem.screenshots[0]}
                    alt={dailyGem.title}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-xs font-mono font-bold text-amber-400 border border-amber-500/30 shadow">
                    {dailyGem.releaseYear}
                  </div>
                </div>

                <div>
                  {isGameOwned(dailyGem.steamUrl) && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-md">
                      <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('home.inYourSteamLibrary')}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-black text-[#fef3c7] group-hover:text-amber-300 transition mb-1 drop-shadow-sm">
                    {dailyGem.title}
                  </h3>
                  <p className="text-xs text-amber-200/60 mb-2">
                    {dailyGem.developer}
                  </p>
                  <p className="text-xs text-slate-200/90 italic mb-3 line-clamp-2">
                    "{getLocalizedText(dailyGem.hints?.tagline, i18n.language)}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dailyGem.genre.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-md bg-[#251a14] text-amber-100/80 text-[11px] font-medium border border-[#4a3424]"
                      >
                        {getTranslatedGenre(g, i18n.language)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#4a3424]/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {dailyGem.steamUrl && (
                    <a
                      href={dailyGem.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-98 border border-amber-300"
                    >
                      <SteamIcon className="w-3.5 h-3.5 text-slate-950" />
                      <span>{t('home.discoverOnSteam')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                    </a>
                  )}
                  {dailyGem.itchUrl && (
                    <a
                      href={dailyGem.itchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Itch.io"
                      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#fa5c5c]/15 hover:bg-[#fa5c5c]/25 text-[#fa5c5c] text-xs font-bold transition border border-[#fa5c5c]/40 hover:border-[#fa5c5c]/70 active:scale-98 ${
                        !dailyGem.steamUrl ? 'w-full' : ''
                      }`}
                    >
                      <ItchIcon className="w-3.5 h-3.5 text-[#fa5c5c]" />
                      <span>Itch.io</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {!dailyGem.steamUrl && !dailyGem.itchUrl && (
                    <div className="w-full text-center text-xs text-amber-200/60 italic py-1">{t('home.certifiedDailyGem')}</div>
                  )}
                </div>
              </div>
            </SylvestreHudFrame>
          </div>
        </div>
      </div>

      {/* Living Forest Branch Divider with Animated Rustling Leaves */}
      <SylvestreBranchDivider glow="amber" withLeaves={true} className="my-10" />

      {/* Daily Games Launchpad */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('home.dailyChallengesTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('home.dailyChallengesSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('minigames');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#131a29] hover:bg-[#1e293b] border border-[#1e293b] hover:border-amber-500/50 text-xs font-bold text-amber-400 transition cursor-pointer self-end sm:self-auto"
          >
            <span>{t('home.hubBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Daily Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Card 1: Screenle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('screenle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Camera className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.screenle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    1. {t('minigamesHub.screenle.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition mb-1">
                {t('minigamesHub.screenle.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.screenle.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Indledle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('indledle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.indledle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    2. {t('minigamesHub.indledle.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition mb-1">
                {t('minigamesHub.indledle.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.indledle.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Linkle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('linkle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-purple-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.linkle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    3. {t('minigamesHub.linkle.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition mb-1">
                {t('minigamesHub.linkle.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.linkle.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Profille */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('profille');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <FileSearch className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.profille === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    4. {t('minigamesHub.profille.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition mb-1">
                {t('minigamesHub.profille.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.profille.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Chrono */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('chrono');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-teal-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                  <History className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.chrono === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    5. {t('minigamesHub.chrono.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-teal-400 transition mb-1">
                {t('minigamesHub.chrono.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.chrono.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Pixel */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('pixel');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-indigo-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.pixel === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    6. {t('minigamesHub.pixel.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition mb-1">
                {t('minigamesHub.pixel.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.pixel.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 7: Review */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('review');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-rose-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <MessageSquareQuote className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.review === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    7. {t('minigamesHub.review.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-rose-400 transition mb-1">
                {t('minigamesHub.review.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.review.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 8: Blind Test */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('blindtest');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-violet-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <Music className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.blindtest === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    8. {t('minigamesHub.blindtest.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-violet-400 transition mb-1">
                {t('minigamesHub.blindtest.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.blindtest.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Competitive & Arcade Trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trio 1: Time Attack */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('timeattack');
            }}
            className="group relative bg-gradient-to-r from-[#0d3f30]/80 via-[#07281e] to-[#03150f] hover:from-[#114f3c] border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  {t('home.sprintsBadge')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-1">
                {t('home.sprintsTitle')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t('home.sprintsDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.launchSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Trio 2: Versus 1v1 */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('versus');
            }}
            className="group relative bg-gradient-to-r from-[#0d3f30]/80 via-[#07281e] to-[#03150f] hover:from-[#114f3c] border-2 border-rose-500/50 hover:border-rose-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-black uppercase tracking-wider">
                  {t('home.versusBadge')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-rose-400 transition mb-1">
                {t('home.versusTitle')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t('home.versusDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.createRoom')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Trio 3: Arcade */}
          <div
            onClick={() => {
              soundFx.playClick();
              onOpenArcade('snake');
            }}
            className="group relative bg-gradient-to-r from-[#0d3f30]/80 via-[#07281e] to-[#03150f] hover:from-[#114f3c] border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                  {t('home.arcadeBadge')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition mb-1">
                {t('home.arcadeTitle')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t('home.arcadeDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playArcade')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Living Forest Branch Divider with Animated Rustling Leaves */}
      <SylvestreBranchDivider glow="emerald" withLeaves={true} className="my-10" />

      {/* Discovery Banner for Extended Steam Catalog */}
      <div className="group relative mb-8 p-6 rounded-3xl bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-visible">
        <SylvestreIvyFrame density="delicate" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {t('home.moreDiscoveries')}
              </h3>
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
      <div ref={catalogGridRef} className="pt-4 mb-6">
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
              className="w-full pl-10 pr-10 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition"
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
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer w-full"
              >
                <option value="all" className="bg-[#131a29]">
                  {t('catalog.allGenres')}
                </option>
                {allGenresList.map((genre) => (
                  <option key={genre} value={genre} className="bg-[#131a29]">
                    {getTranslatedGenre(genre, i18n.language)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Price & Promotion Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer w-full"
              >
                <option value="all" className="bg-[#131a29]">
                  {t('catalog.allPrices')}
                </option>
                <option value="sale" className="bg-[#131a29] text-emerald-400 font-bold">
                  {t('catalog.onSaleFilter')}
                </option>
                <option value="free" className="bg-[#131a29] text-cyan-300 font-bold">
                  {t('catalog.freeFilter')}
                </option>
                <option value="under10" className="bg-[#131a29]">
                  {t('catalog.under10')}
                </option>
                <option value="under20" className="bg-[#131a29]">
                  {t('catalog.under20')}
                </option>
                <option value="20plus" className="bg-[#131a29]">
                  {t('catalog.twentyPlus')}
                </option>
              </select>
            </div>

            {/* 3. Steam Reviews Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer w-full"
              >
                <option value="all" className="bg-[#131a29]">
                  {t('catalog.allReviews')}
                </option>
                <option value="overwhelming" className="bg-[#131a29] text-amber-300 font-bold">
                  {t('catalog.overwhelming')}
                </option>
                <option value="very_positive" className="bg-[#131a29]">
                  {t('catalog.veryPositive')}
                </option>
                <option value="positive" className="bg-[#131a29]">
                  {t('catalog.positive')}
                </option>
              </select>
            </div>

            {/* 4. Advanced Sorting Select */}
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer w-full"
              >
                <option value="yearDesc" className="bg-[#131a29]">
                  {t('catalog.sortNewest')}
                </option>
                <option value="yearAsc" className="bg-[#131a29]">
                  {t('catalog.sortOldest')}
                </option>
                <option value="discountDesc" className="bg-[#131a29] text-emerald-400 font-bold">
                  {t('catalog.sortDiscount')}
                </option>
                <option value="priceAsc" className="bg-[#131a29]">
                  {t('catalog.sortPriceAsc')}
                </option>
                <option value="priceDesc" className="bg-[#131a29]">
                  {t('catalog.sortPriceDesc')}
                </option>
                <option value="ratingDesc" className="bg-[#131a29] text-amber-300 font-bold">
                  {t('catalog.sortRating')}
                </option>
                <option value="reviewsCountDesc" className="bg-[#131a29]">
                  {t('catalog.sortReviews')}
                </option>
                <option value="titleAsc" className="bg-[#131a29]">
                  {t('catalog.sortTitle')}
                </option>
                <option value="titleDesc" className="bg-[#131a29]">
                  {t('catalog.sortTitleDesc')}
                </option>
              </select>
            </div>
          </div>

          {/* Row 3: Ownership filter (if Steam connected) & Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e293b]/70">
            {/* Quick Pill: Hide Owned Games Toggle (Directive 31) */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                if (isSteamConnected || ownedCount > 0) {
                  const next = ownershipFilter !== 'unowned';
                  setHideOwnedGames(next);
                  setOwnershipFilter(next ? 'unowned' : 'all');
                } else {
                  connectSteamWithOpenId();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                ownershipFilter === 'unowned' && (isSteamConnected || ownedCount > 0)
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-emerald-300 border-[#1e293b] hover:border-emerald-500/40'
              }`}
              title={
                isSteamConnected || ownedCount > 0
                  ? (ownershipFilter === 'unowned' ? t('catalog.hideOwnedActive') : t('catalog.hideOwned'))
                  : t('catalog.connectSteamToHide')
              }
            >
              {ownershipFilter === 'unowned' && (isSteamConnected || ownedCount > 0) ? (
                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {ownershipFilter === 'unowned' && (isSteamConnected || ownedCount > 0)
                  ? t('catalog.hideOwnedActive')
                  : t('catalog.hideOwned')}
                {ownedCount > 0 ? ` (${ownedCount})` : ''}
              </span>
              {!isSteamConnected && ownedCount === 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <SteamIcon className="w-2.5 h-2.5" />
                  <span>Sync</span>
                </span>
              )}
            </button>

            {isSteamConnected && (
              <select
                value={ownershipFilter}
                onChange={(e) => {
                  const val = e.target.value as 'all' | 'owned' | 'unowned';
                  setOwnershipFilter(val);
                  setHideOwnedGames(val === 'unowned');
                }}
                className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#131a29] text-white">
                  {t('catalog.allGames', { count: curatedGems.length })}
                </option>
                <option value="owned" className="bg-[#131a29] text-cyan-400">
                  {t('catalog.inMyLibrary', { count: ownedCount })}
                </option>
                <option value="unowned" className="bg-[#131a29] text-emerald-400">
                  {t('catalog.toDiscover', { count: curatedGems.length - ownedCount })}
                </option>
              </select>
            )}

            {/* Quick Pill 1: On Sale */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setPriceFilter(priceFilter === 'sale' ? 'all' : 'sale');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                priceFilter === 'sale'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-emerald-300 border-[#1e293b] hover:border-emerald-500/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('catalog.onSale')}</span>
            </button>

            {/* Quick Pill 2: Under 10€ */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setPriceFilter(priceFilter === 'under10' ? 'all' : 'under10');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                priceFilter === 'under10'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-amber-300 border-[#1e293b] hover:border-amber-500/40'
              }`}
            >
              <span>💸</span>
              <span>&lt; 10 €</span>
            </button>

            {/* Quick Pill 3: Free */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setPriceFilter(priceFilter === 'free' ? 'all' : 'free');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                priceFilter === 'free'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-cyan-300 border-[#1e293b] hover:border-cyan-500/40'
              }`}
            >
              <span>🆓</span>
              <span>{t('catalog.free')}</span>
            </button>

            {/* Quick Pill 4: Overwhelmingly Positive */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRatingFilter(ratingFilter === 'overwhelming' ? 'all' : 'overwhelming');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                ratingFilter === 'overwhelming'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-amber-300 border-[#1e293b] hover:border-amber-500/40'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{t('catalog.topRated')}</span>
            </button>

            {/* Quick Pill 5: Most Popular */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSortBy(sortBy === 'reviewsCountDesc' ? 'yearDesc' : 'reviewsCountDesc');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                sortBy === 'reviewsCountDesc'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm shadow-purple-500/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-purple-300 border-[#1e293b] hover:border-purple-500/40'
              }`}
            >
              <span>👥</span>
              <span>{t('catalog.popular')}</span>
            </button>

            {/* Quick Pill 6: Itch.io Gems */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setStoreFilter(storeFilter === 'itch' ? 'all' : 'itch');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                storeFilter === 'itch'
                  ? 'bg-[#fa5c5c]/20 text-[#fa5c5c] border-[#fa5c5c]/60 shadow-sm shadow-[#fa5c5c]/20'
                  : 'bg-[#0b0f19] text-slate-400 hover:text-[#fa5c5c] border-[#1e293b] hover:border-[#fa5c5c]/40'
              }`}
            >
              <ItchIcon className="w-3.5 h-3.5 text-[#fa5c5c]" />
              <span>Itch.io ({itchCount})</span>
            </button>

            {/* Reset filters button (if any active) */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
                title={t('catalog.resetAllFilters')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('catalog.resetFilters', { count: activeFiltersCount })}</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State when no games match */}
        {filteredGems.length === 0 && (
          <div className="group relative p-8 sm:p-12 text-center rounded-3xl bg-[#072a20] border-2 border-[#78350f] shadow-xl my-8 max-w-lg mx-auto overflow-visible">
            <SylvestreIvyFrame density="delicate" />
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              {t('catalog.noGemsFound')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              {t('catalog.noGemsFoundDesc')}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('catalog.resetAllFilters')}</span>
            </button>
          </div>
        )}

        {/* Gems Grid */}
        <div id="gems-grid-top" className="scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-xs text-slate-400 font-semibold">
            <span>{filteredGems.length} {t('pagination.gems', { defaultValue: 'pépites' })}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="hidden sm:inline font-medium text-slate-400">{t('pagination.perPage', { defaultValue: 'Par page :' })}</span>
              <div className="inline-flex rounded-xl bg-[#0b0f19] border border-[#1e293b] p-0.5 shadow-inner">
                {[12, 24, 48, 96, -1].map((opt) => {
                  const isAll = itemsPerPage === -1 || (filteredGems.length > 0 && itemsPerPage >= filteredGems.length);
                  const isSelected = opt === -1 ? isAll : itemsPerPage === opt && !isAll;
                  const label = opt === -1 ? t('pagination.all', { defaultValue: 'Tous' }) : String(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleItemsPerPageChange(opt)}
                      aria-pressed={isSelected}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedGems.map((game) => {
            const isHighlighted = highlightedGameId === game.id;
            const owned = isGameOwned(game.steamUrl);
            const appId = getAppIdFromSteamUrl(game.steamUrl);
            const storeData = getSteamStoreData(appId);

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
                    src={game.screenshots[5] || game.screenshots[0]}
                    alt={game.title}
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
                    {storeData ? (
                      storeData.discountPercent > 0 ? (
                        <div className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-md">
                          <span className="line-through text-slate-500 text-[10px]">
                            {storeData.formattedInitialPrice}
                          </span>
                          <span>{storeData.formattedFinalPrice}</span>
                        </div>
                      ) : storeData.isFree ? (
                        <div className="px-2 py-0.5 rounded-lg bg-emerald-950/85 backdrop-blur-md text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40 shadow-md">
                          {t('catalog.free')}
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-slate-200 border border-white/10 shadow-md">
                          {storeData.formattedFinalPrice}
                        </div>
                      )
                    ) : game.itchUrl ? (
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-950/85 backdrop-blur-md text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40 shadow-md">
                        {t('catalog.free')}
                      </div>
                    ) : null}

                    <div className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-white/10 shadow-md">
                      {game.releaseYear}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-0.5 flex items-center justify-between">
                      <span>{game.title}</span>
                    </h3>
                    <div className="text-xs text-slate-400 font-medium mb-2">
                      {game.developer}
                    </div>

                    {/* Steam Reviews Score Pill */}
                    {storeData && storeData.totalReviews > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/40 border border-sky-500/30 text-sky-300 text-[11px] font-bold font-mono">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{storeData.positivePercent}%</span>
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {getLocalizedText(storeData.reviewScoreDesc, i18n.language)} · {formatReviewCount(storeData.totalReviews)} {t('catalog.reviewsSuffix')}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 italic mb-4 line-clamp-2 leading-relaxed">
                      "{getLocalizedText(game.hints?.tagline, i18n.language)}"
                    </p>
                  </div>

                  <div>
                    {/* Genre tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {game.genre.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-md bg-[#0b0f19] text-slate-300 text-[11px] font-medium border border-slate-800"
                        >
                          {getTranslatedGenre(g, i18n.language)}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#1e293b] flex items-center gap-2">
                      {game.steamUrl && (
                        <a
                          href={game.steamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition border shadow-sm ${
                            owned
                              ? 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
                              : storeData && storeData.discountPercent > 0
                              ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/50 hover:border-amber-500/40'
                          }`}
                        >
                          <SteamIcon className={`w-3.5 h-3.5 ${owned ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="truncate">
                            {owned
                              ? t('catalog.inYourLibrary')
                              : storeData && storeData.discountPercent > 0
                              ? `${t('catalog.onSteam')} · ${storeData.formattedFinalPrice} (-${storeData.discountPercent}%)`
                              : storeData
                              ? `${t('catalog.onSteam')} · ${storeData.formattedFinalPrice}`
                              : t('catalog.viewOnSteam')}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        </a>
                      )}

                      {game.itchUrl && (
                        <a
                          href={game.itchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Itch.io"
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#fa5c5c]/10 hover:bg-[#fa5c5c]/20 text-[#fa5c5c] border border-[#fa5c5c]/30 hover:border-[#fa5c5c]/60 transition shrink-0 active:scale-98 ${
                            !game.steamUrl ? 'flex-1' : ''
                          }`}
                        >
                          <ItchIcon className="w-3.5 h-3.5 text-[#fa5c5c]" />
                          <span>Itch.io</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {!game.steamUrl && !game.itchUrl && (
                        <div className="w-full text-center text-[11px] text-slate-500 italic py-1">{t('home.certifiedGemBadge')}</div>
                      )}

                      {/* Bouton de bascule rapide possédé */}
                      {isSteamConnected && game.steamUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            toggleGameOwned(game.steamUrl);
                          }}
                          title={
                            owned
                              ? t('catalog.unmarkOwned')
                              : t('catalog.markOwned')
                          }
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            owned
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30'
                              : 'bg-slate-800/80 text-slate-500 hover:text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredGems.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[12, 24, 48, 96, -1]}
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
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {isGameOwned(randomPickedGame.steamUrl) && (
                  <div className="px-2.5 py-1 rounded-lg bg-[#0e1726]/90 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-xs font-black flex items-center gap-1.5 shadow-lg">
                    <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dans votre bibliothèque Steam</span>
                  </div>
                )}
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-amber-500/40 shadow-md">
                {randomPickedGame.releaseYear}
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
                  const appId = getAppIdFromSteamUrl(randomPickedGame.steamUrl);
                  const store = getSteamStoreData(appId);
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
    </div>
  </div>
);
};
