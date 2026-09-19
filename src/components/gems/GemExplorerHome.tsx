import React, { useState, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { getDailyGame, INDIE_GAMES } from '../../data/games';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { soundFx } from '../../utils/audio';
import { getSteamStoreData } from '../../data/steamStoreData';
import { getAppIdFromSteamUrl } from '../../services/steamService';
import { getChallengeStatusForDate } from '../../utils/streakManager';
import type { NavTab } from '../common/Navbar';
import type { ArcadeGameId } from '../arcade/ArcadeModal';
import { telemetry } from '../../services/telemetry';

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
  const { i18n } = useTranslation();
  const curatedGems = INDIE_GAMES;
  const { isGameOwned, isSteamConnected, toggleGameOwned } = useUserAccount();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  // The featured canonical daily gem (guaranteed never to spoil Screenle (offset 0) or Indledle (offset 3))
  const dailyGem = useMemo(() => {
    const screenleGame = getDailyGame(currentDate, 0);
    const indledleGame = getDailyGame(currentDate, 3);
    let offset = 17;
    let candidate = getDailyGame(currentDate, offset);
    while (
      (candidate.id === screenleGame.id || candidate.id === indledleGame.id) &&
      offset < 100
    ) {
      offset += 5;
      candidate = getDailyGame(currentDate, offset);
    }
    return candidate;
  }, [currentDate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'sale' | 'free' | 'under10' | 'under20' | '20plus'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'overwhelming' | 'very_positive' | 'positive'>('all');
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

  const catalogGridRef = useRef<HTMLDivElement | null>(null);

  const ownedCount = useMemo(() => {
    return curatedGems.filter((g) => isGameOwned(g.steamUrl)).length;
  }, [curatedGems, isGameOwned]);

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
    if (sortBy !== 'yearDesc') count++;
    return count;
  }, [searchQuery, selectedGenre, ownershipFilter, priceFilter, ratingFilter, sortBy]);

  const handleResetFilters = () => {
    soundFx.playClick();
    setSearchQuery('');
    setSelectedGenre('all');
    setOwnershipFilter('all');
    setPriceFilter('all');
    setRatingFilter('all');
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
        g.hints.tagline.fr.toLowerCase().includes(q) ||
        g.hints.tagline.en.toLowerCase().includes(q);

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
        matchesPrice = Boolean(storeData && (storeData.isFree || storeData.finalPriceCents === 0));
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
        matchesPrice = Boolean(storeData && storeData.finalPriceCents > 2000);
      }

      // Review Rating filter
      let matchesRating = true;
      if (ratingFilter === 'overwhelming') {
        matchesRating = Boolean(storeData && storeData.positivePercent >= 95);
      } else if (ratingFilter === 'very_positive') {
        matchesRating = Boolean(storeData && storeData.positivePercent >= 85);
      } else if (ratingFilter === 'positive') {
        matchesRating = Boolean(storeData && storeData.positivePercent >= 80);
      }

      return matchesSearch && matchesGenre && matchesOwnership && matchesPrice && matchesRating;
    });

    list = [...list].sort((a, b) => {
      const storeA = getSteamStoreData(getAppIdFromSteamUrl(a.steamUrl));
      const storeB = getSteamStoreData(getAppIdFromSteamUrl(b.steamUrl));

      switch (sortBy) {
        case 'yearDesc':
          return b.releaseYear !== a.releaseYear
            ? b.releaseYear - a.releaseYear
            : a.title.localeCompare(b.title);

        case 'yearAsc':
          return a.releaseYear !== b.releaseYear
            ? a.releaseYear - b.releaseYear
            : a.title.localeCompare(b.title);

        case 'priceAsc': {
          const priceA = storeA?.isFree ? 0 : (storeA?.finalPriceCents ?? 99999);
          const priceB = storeB?.isFree ? 0 : (storeB?.finalPriceCents ?? 99999);
          if (priceA !== priceB) return priceA - priceB;
          return a.title.localeCompare(b.title);
        }

        case 'priceDesc': {
          const priceA = storeA?.isFree ? 0 : (storeA?.finalPriceCents ?? 0);
          const priceB = storeB?.isFree ? 0 : (storeB?.finalPriceCents ?? 0);
          if (priceA !== priceB) return priceB - priceA;
          return a.title.localeCompare(b.title);
        }

        case 'discountDesc': {
          const discA = storeA?.discountPercent || 0;
          const discB = storeB?.discountPercent || 0;
          if (discB !== discA) return discB - discA;
          return (storeB?.positivePercent || 0) - (storeA?.positivePercent || 0);
        }

        case 'ratingDesc': {
          const rateA = storeA?.positivePercent || 0;
          const rateB = storeB?.positivePercent || 0;
          if (rateB !== rateA) return rateB - rateA;
          return (storeB?.totalReviews || 0) - (storeA?.totalReviews || 0);
        }

        case 'reviewsCountDesc': {
          const countA = storeA?.totalReviews || 0;
          const countB = storeB?.totalReviews || 0;
          if (countB !== countA) return countB - countA;
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
  }, [curatedGems, searchQuery, selectedGenre, ownershipFilter, priceFilter, ratingFilter, sortBy, isGameOwned]);

  // Roulette: Randomly pick a gem and scroll to it
  const handleRandomPick = () => {
    soundFx.playClick();
    if (curatedGems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * curatedGems.length);
    const chosen = curatedGems[randomIndex];

    setSearchQuery('');
    setSelectedGenre('all');
    setHighlightedGameId(chosen.id);

    telemetry.track('interaction', 'random_gem_pick', chosen.title);

    setTimeout(() => {
      const el = document.getElementById(`gem-${chosen.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedGameId(null);
    }, 3500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Spotlight: Featured Daily Gem & Nocturnal Woodland Atmosphere */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#061e16] via-[#111c2a] to-[#0c1624] border border-emerald-900/40 p-6 sm:p-10 mb-10 shadow-2xl">
        {/* Soft emerald ambient glow in background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-800/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-950/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <span>🌿</span>
                <span>Refuge Sylvestre</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Explorateur de Pépites</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              L'Écrin Quotidien du <span className="text-amber-400">Jeu Indépendant</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {lang === 'fr'
                ? "Découvrez chaque jour une pépite certifiée pour sa direction artistique et sonore, relevez nos 8 défis quotidiens de déduction, affrontez vos amis en duel 1v1 ou contre-la-montre et explorez notre salle d'arcade rétro."
                : "Discover a certified indie gem every day, solve our 8 daily deduction puzzles, challenge friends in 1v1 duels or Time Attack sprints, and explore the retro arcade hall."}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigateTab('screenle');
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Jouer au Défi du Jour
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleRandomPick}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 border border-emerald-900/40 hover:border-amber-500/50 text-xs sm:text-sm font-bold transition shadow cursor-pointer"
              >
                <Dice5 className="w-4 h-4 text-amber-400" />
                Pépite au Hasard
              </button>
            </div>
          </div>

          {/* Right: Featured Daily Gem Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b0f19]/90 backdrop-blur-md border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-amber-400 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                  ⭐ Pépite du Jour
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {currentDate}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                <img
                  src={dailyGem.screenshots[5] || dailyGem.screenshots[0]}
                  alt={dailyGem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-xs font-mono font-bold text-amber-400 border border-white/10">
                  {dailyGem.releaseYear}
                </div>
              </div>

              <div>
                {isGameOwned(dailyGem.steamUrl) && (
                  <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-md">
                    <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Déjà dans votre bibliothèque Steam !</span>
                  </div>
                )}
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition mb-1">
                  {dailyGem.title}
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  {dailyGem.developer}
                </p>
                <p className="text-xs text-slate-300 italic mb-3 line-clamp-2">
                  "{dailyGem.hints.tagline[lang]}"
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dailyGem.genre.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-md bg-[#131a29] text-slate-300 text-[11px] font-medium border border-slate-800"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e293b]">
                {dailyGem.steamUrl ? (
                  <a
                    href={dailyGem.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-98"
                  >
                    <span>Découvrir sur Steam</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                  </a>
                ) : (
                  <div className="w-full text-center text-xs text-slate-400 italic py-1">Pépite Quotidienne Certifiée</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Games Launchpad */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'fr' ? 'Les 8 Défis & Jeux Quotidiens' : 'The 8 Daily Indie Challenges'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'fr'
                  ? '8 disciplines de déduction renouvelées chaque minuit • Sprints Time Attack • Duels 1v1'
                  : '8 deduction disciplines refreshed at midnight • Time Attack sprints • 1v1 Duels'}
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
            <span>{lang === 'fr' ? 'Hub des 10 Mini-Jeux' : '10 Mini-Games Hub'}</span>
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
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Camera className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.screenle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    1. Capture
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition mb-1">
                {lang === 'fr' ? 'Capture' : 'Framed'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? "Identifiez le jeu secret à travers 6 captures d'écran zoomées."
                  : 'Identify the secret game with 6 progressive zoomed screenshots.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Indledle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('indledle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.indledle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    2. Classic
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition mb-1">
                Classic
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? "Wordle indé : comparez l'année, les genres, le studio et la caméra."
                  : 'Indie Wordle: compare release year, genres, studio and camera.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Linkle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('linkle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-purple-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.linkle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    3. Connexions
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition mb-1">
                {lang === 'fr' ? 'Connexions' : 'Connections'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? 'Regroupez 16 jeux par 4 catégories thématiques secrètes.'
                  : 'Group 16 indie gems into 4 secret thematic categories.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Profille */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('profille');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <FileSearch className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.profille === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    4. Profil
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition mb-1">
                Profil
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? "Indices débloqués un par un : année, studio, genre et tagline."
                  : 'Clues revealed one by one: year, studio, genre, and tagline.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Chrono */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('chrono');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-teal-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                  <History className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.chrono === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    5. Chrono
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-teal-400 transition mb-1">
                {lang === 'fr' ? 'Chrono' : 'Timeline'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? 'Replacez 5 jeux indés par ordre chronologique de sortie.'
                  : 'Place 5 indie gems in chronological order of release.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Pixel */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('pixel');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-indigo-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.pixel === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    6. Pixel
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition mb-1">
                Pixel &amp; Silhouette
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? 'Devinez à partir d’une mosaïque dé-pixellisée et son ombre.'
                  : 'Identify the game from a de-pixellating mosaic and shadow.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 7: Review */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('review');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-rose-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <MessageSquareQuote className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.review === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    7. Critique
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-rose-400 transition mb-1">
                {lang === 'fr' ? 'Critique Steam' : 'Steam Review'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? 'Déchiffrez les mots-clés caviardés d’un avis Steam authentique.'
                  : 'Decode redacted words from an authentic Steam user review.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 8: Blind Test */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('blindtest');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-violet-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <Music className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.blindtest === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' ? 'Résolu' : 'Solved'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    8. Musique
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-violet-400 transition mb-1">
                Blind Test OST
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'fr'
                  ? 'Écoutez des extraits musicaux au synthé et devinez la BO.'
                  : 'Listen to progressive synth audio clips and name the OST.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Jouer au défi' : 'Play challenge'}</span>
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
            className="group relative bg-gradient-to-r from-amber-950/40 via-[#131a29] to-[#0f172a] hover:from-amber-900/40 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  8 Sprints
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-1">
                ⚡ Time Attack
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {lang === 'fr'
                  ? 'Enchaînez les devinettes contre-la-montre sur les 8 disciplines avec chrono milliseconde !'
                  : 'Race against the clock across all 8 disciplines with millisecond precision!'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Lancer un sprint' : 'Launch sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Trio 2: Versus 1v1 */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('versus');
            }}
            className="group relative bg-gradient-to-r from-rose-950/40 via-[#131a29] to-[#0f172a] hover:from-rose-900/40 border border-rose-500/30 hover:border-rose-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-black uppercase tracking-wider">
                  1v1 Direct
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-rose-400 transition mb-1">
                ⚔️ {lang === 'fr' ? 'Arène Versus 1v1' : '1v1 Versus Arena'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {lang === 'fr'
                  ? 'Défiez un ami en direct sur les 8 disciplines ou lancez un Tournoi Décathlon Mixte !'
                  : 'Challenge a friend live across 8 disciplines or battle in the Mixed Decathlon!'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Créer un salon' : 'Create room'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Trio 3: Arcade */}
          <div
            onClick={() => {
              soundFx.playClick();
              onOpenArcade('snake');
            }}
            className="group relative bg-gradient-to-r from-emerald-950/40 via-[#131a29] to-[#0f172a] hover:from-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                  8 Bornes
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition mb-1">
                🕹️ {lang === 'fr' ? "Salle d'Arcade Rétro" : 'Retro Arcade Hall'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {lang === 'fr'
                  ? 'Snake, Tetris, Pong, Space Invaders et réplique exacte du Mine Storm Vectrex 1982.'
                  : 'Snake, Tetris, Pong, Space Invaders, and faithful 1982 Vectrex Mine Storm.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{lang === 'fr' ? 'Lancer une borne' : 'Play arcade game'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Banner for Extended Steam Catalog */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#131a29] to-indigo-950/50 border border-blue-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 shadow">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                {lang === 'fr' ? 'À la recherche de plus de découvertes indés ?' : 'Looking for more indie discoveries?'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase">
                {lang === 'fr' ? 'Onglet Dédié' : 'Dedicated Tab'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {lang === 'fr'
                ? 'Explorez notre grand Catalogue Steam avec des centaines de jeux indés (y compris émergents ou aux avis variés), des filtres par angle de caméra / style artistique, et forgez votre propre avis !'
                : 'Explore our extensive Steam Catalog featuring hundreds of indie games with diverse review scores, camera & art filters, and form your own opinion!'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            onNavigateTab('catalog');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 active:scale-95 shrink-0 cursor-pointer"
        >
          <span>{lang === 'fr' ? 'Explorer le Catalogue Steam' : 'Explore Steam Catalog'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Catalog Section Header & Search/Filters */}
      <div ref={catalogGridRef} className="pt-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <span>{lang === 'fr' ? 'Catalogue des Pépites Certifiées' : 'Certified Indie Gems Catalog'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'fr'
                ? `Explorez nos ${curatedGems.length} chefs-d'œuvre sélectionnés et certifiés Steam`
                : `Explore our ${curatedGems.length} certified curated Steam indie masterpieces`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs font-mono text-amber-400 font-bold shadow-sm">
              {filteredGems.length} / {curatedGems.length} {lang === 'fr' ? 'pépite(s)' : 'gem(s)'}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#131a29] border border-[#1e293b] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl space-y-3.5">
          {/* Row 1: Search Query */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'fr'
                  ? 'Rechercher par titre, studio, genre, année...'
                  : 'Search by title, developer, genre, year...'
              }
              className="w-full pl-10 pr-10 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition"
                title={lang === 'fr' ? 'Effacer la recherche' : 'Clear search'}
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
                  {lang === 'fr' ? 'Tous les genres' : 'All genres'}
                </option>
                {allGenresList.map((genre) => (
                  <option key={genre} value={genre} className="bg-[#131a29]">
                    {genre}
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
                  {lang === 'fr' ? 'Tous les prix' : 'All prices'}
                </option>
                <option value="sale" className="bg-[#131a29] text-emerald-400 font-bold">
                  {lang === 'fr' ? '🏷️ En promotion / Soldes' : '🏷️ On Sale / Discounted'}
                </option>
                <option value="free" className="bg-[#131a29] text-cyan-300 font-bold">
                  {lang === 'fr' ? '🆓 Gratuits / Free-to-play' : '🆓 Free to play'}
                </option>
                <option value="under10" className="bg-[#131a29]">
                  {lang === 'fr' ? '💸 Moins de 10 €' : '💸 Under 10 €'}
                </option>
                <option value="under20" className="bg-[#131a29]">
                  {lang === 'fr' ? '💳 Moins de 20 €' : '💳 Under 20 €'}
                </option>
                <option value="20plus" className="bg-[#131a29]">
                  {lang === 'fr' ? '💎 20 € et plus' : '💎 20 € and more'}
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
                  {lang === 'fr' ? 'Toutes les évaluations' : 'All review scores'}
                </option>
                <option value="overwhelming" className="bg-[#131a29] text-amber-300 font-bold">
                  {lang === 'fr' ? '🌟 Extrêmement positifs (≥ 95%)' : '🌟 Overwhelmingly Positive (≥ 95%)'}
                </option>
                <option value="very_positive" className="bg-[#131a29]">
                  {lang === 'fr' ? '⭐ Très positifs et + (≥ 85%)' : '⭐ Very Positive & up (≥ 85%)'}
                </option>
                <option value="positive" className="bg-[#131a29]">
                  {lang === 'fr' ? '👍 Positifs (≥ 80%)' : '👍 Positive (≥ 80%)'}
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
                  {lang === 'fr' ? '📅 Date : Plus récents' : '📅 Date: Newest first'}
                </option>
                <option value="yearAsc" className="bg-[#131a29]">
                  {lang === 'fr' ? '⏳ Date : Classiques (Anciens)' : '⏳ Date: Classic indies'}
                </option>
                <option value="discountDesc" className="bg-[#131a29] text-emerald-400 font-bold">
                  {lang === 'fr' ? '🔥 Meilleures réductions (% solde)' : '🔥 Biggest discounts (%)'}
                </option>
                <option value="priceAsc" className="bg-[#131a29]">
                  {lang === 'fr' ? '💸 Prix : Moins chers (Petits budgets)' : '💸 Price: Lowest first'}
                </option>
                <option value="priceDesc" className="bg-[#131a29]">
                  {lang === 'fr' ? '💎 Prix : Plus chers d’abord' : '💎 Price: Highest first'}
                </option>
                <option value="ratingDesc" className="bg-[#131a29] text-amber-300 font-bold">
                  {lang === 'fr' ? '⭐ Meilleures évaluations (% avis)' : '⭐ Best reviews rating (%)'}
                </option>
                <option value="reviewsCountDesc" className="bg-[#131a29]">
                  {lang === 'fr' ? '👥 Nombre d’avis (Popularité)' : '👥 Total reviews count'}
                </option>
                <option value="titleAsc" className="bg-[#131a29]">
                  {lang === 'fr' ? '🔤 Titre (A → Z)' : '🔤 Title (A → Z)'}
                </option>
                <option value="titleDesc" className="bg-[#131a29]">
                  {lang === 'fr' ? '🔤 Titre (Z → A)' : '🔤 Title (Z → A)'}
                </option>
              </select>
            </div>
          </div>

          {/* Row 3: Ownership filter (if Steam connected) & Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e293b]/70">
            {isSteamConnected && (
              <select
                value={ownershipFilter}
                onChange={(e) => setOwnershipFilter(e.target.value as 'all' | 'owned' | 'unowned')}
                className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#131a29] text-white">
                  {lang === 'fr' ? `Toutes les pépites (${curatedGems.length})` : `All gems (${curatedGems.length})`}
                </option>
                <option value="owned" className="bg-[#131a29] text-cyan-400">
                  {lang === 'fr' ? `🎮 Dans ma bibliothèque (${ownedCount})` : `🎮 In my library (${ownedCount})`}
                </option>
                <option value="unowned" className="bg-[#131a29] text-emerald-400">
                  {lang === 'fr' ? `✨ À découvrir (${curatedGems.length - ownedCount})` : `✨ To discover (${curatedGems.length - ownedCount})`}
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
              <span>{lang === 'fr' ? 'En solde' : 'On sale'}</span>
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
              <span>{lang === 'fr' ? 'Gratuits' : 'Free'}</span>
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
              <span>{lang === 'fr' ? 'Top Avis (≥ 95%)' : 'Top Rated (≥ 95%)'}</span>
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
              <span>{lang === 'fr' ? 'Populaires' : 'Most Popular'}</span>
            </button>

            {/* Reset filters button (if any active) */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
                title={lang === 'fr' ? 'Réinitialiser tous les filtres' : 'Reset all filters'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? `Réinitialiser (${activeFiltersCount})` : `Reset (${activeFiltersCount})`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State when no games match */}
        {filteredGems.length === 0 && (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#131a29] border border-[#1e293b] shadow-xl my-8 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              {lang === 'fr' ? 'Aucune pépite trouvée' : 'No indie gems found'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              {lang === 'fr'
                ? 'Aucun jeu ne correspond à l’ensemble de vos filtres actuels. Essayez d’ajuster vos critères de prix, de note ou de genre.'
                : 'No games match all your selected filters. Try broadening your price, rating, or genre criteria.'}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Réinitialiser tous les filtres' : 'Reset all filters'}</span>
            </button>
          </div>
        )}

        {/* Gems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGems.map((game) => {
            const isHighlighted = highlightedGameId === game.id;
            const owned = isGameOwned(game.steamUrl);
            const appId = getAppIdFromSteamUrl(game.steamUrl);
            const storeData = getSteamStoreData(appId);

            return (
              <div
                key={game.id}
                id={`gem-${game.id}`}
                className={`bg-[#131a29] border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group flex flex-col justify-between ${
                  isHighlighted
                    ? 'border-amber-400 ring-4 ring-amber-500/40 scale-102 bg-[#182338]'
                    : owned
                    ? 'border-cyan-900/50 hover:border-cyan-400/60 hover:shadow-2xl'
                    : 'border-[#1e293b] hover:border-amber-500/40 hover:shadow-2xl'
                }`}
              >
                {/* Thumbnail & Badges */}
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={game.screenshots[5] || game.screenshots[0]}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131a29] via-transparent to-transparent opacity-60" />

                  {/* Top-Left Badges: Owned & Discount */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {owned && (
                      <div className="px-2.5 py-1 rounded-lg bg-[#0e1726]/90 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-[11px] font-black flex items-center gap-1.5 shadow-lg">
                        <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{lang === 'fr' ? 'Possédé' : 'Owned'}</span>
                      </div>
                    )}
                    {storeData && storeData.discountPercent > 0 && (
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-500 text-black font-black text-xs shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-black" />
                        <span>-{storeData.discountPercent}%</span>
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
                          {lang === 'fr' ? 'Gratuit' : 'Free'}
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-slate-200 border border-white/10 shadow-md">
                          {storeData.formattedFinalPrice}
                        </div>
                      )
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
                          {storeData.reviewScoreDesc[lang]} · {formatReviewCount(storeData.totalReviews)} {lang === 'fr' ? 'avis' : 'reviews'}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 italic mb-4 line-clamp-2 leading-relaxed">
                      "{game.hints.tagline[lang]}"
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
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#1e293b] flex items-center gap-2">
                      {game.steamUrl ? (
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
                              ? lang === 'fr'
                                ? 'Dans votre bibliothèque'
                                : 'In your library'
                              : storeData && storeData.discountPercent > 0
                              ? `${lang === 'fr' ? 'Sur Steam' : 'On Steam'} · ${storeData.formattedFinalPrice} (-${storeData.discountPercent}%)`
                              : storeData
                              ? `${lang === 'fr' ? 'Sur Steam' : 'On Steam'} · ${storeData.formattedFinalPrice}`
                              : lang === 'fr'
                              ? 'Voir sur Steam'
                              : 'View on Steam'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        </a>
                      ) : (
                        <div className="w-full text-center text-[11px] text-slate-500 italic py-1">Pépite Certifiée</div>
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
                              ? lang === 'fr'
                                ? 'Marqué comme possédé (Cliquer pour retirer)'
                                : 'Marked as owned (Click to unmark)'
                              : lang === 'fr'
                              ? 'Marquer comme possédé sur Steam'
                              : 'Mark as owned on Steam'
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
      </div>
    </div>
  );
};
