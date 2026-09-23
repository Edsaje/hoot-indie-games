import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Dices,
  Clock,
  PiggyBank,
  Compass,
  Flame,
  ExternalLink,
  RotateCw,
  Calendar,
  Search,
  Sparkles,
  Zap,
  Coffee,
  Trophy,
  Trash2,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import { UPCOMING_INDIE_GAMES } from '../../data/upcomingGames';
import { STEAM_STORE_DATA } from '../../data/steamStoreData';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { getLocalizedText, getTranslatedGenre } from '../../utils/localization';
import {
  getGameDurationHours,
  getDurationCategory,
  type DurationCategory,
} from '../../utils/gameDuration';
import {
  MOOD_DEFINITIONS,
  filterGamesByMood,
  type GameMood,
} from '../../utils/gameMoods';
import type { Game } from '../../types/game';

type ToolboxTab = 'roulette' | 'backlog' | 'budget' | 'gems' | 'radar';
type BudgetStrategy = 'value' | 'acclaimed' | 'sales' | 'variety';
type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'year-desc'
  | 'year-asc'
  | 'rating-desc'
  | 'price-asc'
  | 'price-desc';

// Helper to extract store data safely
function getStoreDetails(game: Game) {
  const match = game.steamUrl ? game.steamUrl.match(/\/app\/(\d+)/) : null;
  const appId = match ? parseInt(match[1], 10) : null;
  const store = appId ? STEAM_STORE_DATA[appId] : null;

  const finalPrice = store ? (store.isFree ? 0 : store.finalPriceCents / 100) : 14.99;
  const initialPrice = store ? store.initialPriceCents / 100 : 14.99;
  const discount = store ? store.discountPercent : 0;
  const isFree = store ? store.isFree : false;
  const score = store ? store.positivePercent : 92;
  const totalReviews = store ? store.totalReviews : 2500;

  return {
    appId,
    store,
    finalPrice,
    initialPrice,
    discount,
    isFree,
    score,
    totalReviews,
    formattedPrice: isFree
      ? 'Gratuit'
      : store?.formattedFinalPrice || `${finalPrice.toFixed(2)} €`,
  };
}

export const ToolboxHub: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { unlockAchievement } = useAchievements();

  const [activeTab, setActiveTab] = useState<ToolboxTab>('roulette');

  // ==================== 1. ROULETTE STATE ====================
  const [selectedMood, setSelectedMood] = useState<GameMood>('all');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rouletteWinner, setRouletteWinner] = useState<Game | null>(null);
  const [spinCount, setSpinCount] = useState<number>(0);

  // Candidates for the selected mood
  const moodCandidates = useMemo(() => {
    return filterGamesByMood(INDIE_GAMES, selectedMood);
  }, [selectedMood]);

  const handleSpinRoulette = () => {
    soundFx.playClick();
    setIsSpinning(true);
    setRouletteWinner(null);

    const candidates = moodCandidates.length > 0 ? moodCandidates : INDIE_GAMES;

    let counter = 0;
    const interval = setInterval(() => {
      soundFx.playClick();
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
        setRouletteWinner(randomPick);
        setIsSpinning(false);
        setSpinCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            unlockAchievement('roulette_gambler');
          }
          return next;
        });
        soundFx.playVictory();
      }
    }, 110);
  };

  // ==================== 2. BACKLOG STATE ====================
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hoot_backlog_selection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return ['celeste', 'hollow-knight', 'outer-wilds', 'tunic'];
  });

  const [dailyHours, setDailyHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hoot_backlog_daily_hours');
      if (saved) return parseFloat(saved) || 2;
    } catch {
      // ignore
    }
    return 2;
  });

  const [backlogSearch, setBacklogSearch] = useState<string>('');
  const [backlogDurationFilter, setBacklogDurationFilter] = useState<
    'all' | DurationCategory
  >('all');

  // Save backlog selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'hoot_backlog_selection',
        JSON.stringify(selectedBacklogIds)
      );
    } catch {
      // ignore
    }
  }, [selectedBacklogIds]);

  useEffect(() => {
    try {
      localStorage.setItem('hoot_backlog_daily_hours', dailyHours.toString());
    } catch {
      // ignore
    }
  }, [dailyHours]);

  const toggleBacklogItem = (id: string) => {
    soundFx.playClick();
    if (selectedBacklogIds.includes(id)) {
      setSelectedBacklogIds(selectedBacklogIds.filter((item) => item !== id));
    } else {
      setSelectedBacklogIds([...selectedBacklogIds, id]);
    }
  };

  // Backlog Presets
  const applyBacklogPreset = (preset: 'short' | 'essentials' | 'cozy' | 'clear') => {
    soundFx.playClick();
    if (preset === 'clear') {
      setSelectedBacklogIds([]);
      return;
    }
    if (preset === 'short') {
      const shortPicks = ['a-short-hike', 'celeste', 'inside', 'gris', 'to-the-moon'];
      setSelectedBacklogIds(shortPicks);
      return;
    }
    if (preset === 'essentials') {
      const essentialPicks = ['hollow-knight', 'outer-wilds', 'hades', 'balatro', 'slay-the-spire'];
      setSelectedBacklogIds(essentialPicks);
      return;
    }
    if (preset === 'cozy') {
      const cozyPicks = ['stardew-valley', 'chants-of-sennaar', 'dave-the-diver', 'dorfromantik', 'tiny-glade'];
      setSelectedBacklogIds(cozyPicks);
      return;
    }
  };

  // Filtered backlog candidates list
  const filteredBacklogCandidates = useMemo(() => {
    return INDIE_GAMES.filter((game) => {
      const matchesSearch =
        backlogSearch.trim() === '' ||
        game.title.toLowerCase().includes(backlogSearch.toLowerCase()) ||
        game.developer.toLowerCase().includes(backlogSearch.toLowerCase());

      const hours = getGameDurationHours(game);
      const cat = getDurationCategory(hours);
      const matchesDuration =
        backlogDurationFilter === 'all' || cat === backlogDurationFilter;

      return matchesSearch && matchesDuration;
    });
  }, [backlogSearch, backlogDurationFilter]);

  // Backlog Calculations
  const totalBacklogHours = useMemo(() => {
    return selectedBacklogIds.reduce((acc, id) => {
      const game = INDIE_GAMES.find((g) => g.id === id);
      return acc + (game ? getGameDurationHours(game) : 0);
    }, 0);
  }, [selectedBacklogIds]);

  const daysToComplete = dailyHours > 0 ? Math.ceil(totalBacklogHours / dailyHours) : 0;
  const projectedFinishDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + daysToComplete);
    return d;
  }, [daysToComplete]);

  // ==================== 3. STEAM SALE OPTIMIZER STATE ====================
  const [userBudget, setUserBudget] = useState<number>(30);
  const [budgetStrategy, setBudgetStrategy] = useState<BudgetStrategy>('value');
  const [optimizedCart, setOptimizedCart] = useState<
    Array<{
      game: Game;
      finalPrice: number;
      initialPrice: number;
      discount: number;
      score: number;
      hours: number;
    }>
  >([]);

  const optimizeBudget = () => {
    soundFx.playClick();

    // Build candidate pool from INDIE_GAMES
    const pool = INDIE_GAMES.map((game) => {
      const store = getStoreDetails(game);
      const hours = getGameDurationHours(game);
      return {
        game,
        finalPrice: store.finalPrice,
        initialPrice: store.initialPrice,
        discount: store.discount,
        score: store.score,
        hours,
      };
    }).filter((item) => item.finalPrice > 0 && item.finalPrice <= userBudget);

    // Heuristics based on strategy
    pool.sort((a, b) => {
      if (budgetStrategy === 'value') {
        const valA = (a.score * a.hours) / Math.max(1, a.finalPrice);
        const valB = (b.score * b.hours) / Math.max(1, b.finalPrice);
        return valB - valA;
      }
      if (budgetStrategy === 'acclaimed') {
        const valA = a.score * 2 - a.finalPrice;
        const valB = b.score * 2 - b.finalPrice;
        return valB - valA;
      }
      if (budgetStrategy === 'sales') {
        const valA = a.discount * 3 + a.score;
        const valB = b.discount * 3 + b.score;
        return valB - valA;
      }
      // 'variety': prioritize diverse genres
      return b.score - a.score;
    });

    const cart: typeof pool = [];
    let currentCost = 0;
    const seenGenres = new Set<string>();

    for (const item of pool) {
      if (currentCost + item.finalPrice <= userBudget) {
        if (budgetStrategy === 'variety') {
          const mainGenre = item.game.genre[0];
          if (mainGenre && seenGenres.has(mainGenre) && cart.length < 5) {
            continue; // try to diversify first
          }
          if (mainGenre) seenGenres.add(mainGenre);
        }
        cart.push(item);
        currentCost += item.finalPrice;
      }
    }

    setOptimizedCart(cart);
    soundFx.playVictory();
  };

  // ==================== 4. GEMS COMPENDIUM STATE ====================
  const [gemSearch, setGemSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'under10' | 'under20' | 'sale'>('all');
  const [cameraFilter, setCameraFilter] = useState<string>('all');
  const [artFilter, setArtFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('rating-desc');

  const allGenresList = useMemo(() => {
    return Array.from(new Set(INDIE_GAMES.flatMap((g) => g.genre))).sort();
  }, []);

  const allCamerasList = useMemo(() => {
    return Array.from(
      new Set(INDIE_GAMES.map((g) => getLocalizedText(g.camera, i18n.language)))
    ).filter(Boolean).sort();
  }, [i18n.language]);

  const allArtStylesList = useMemo(() => {
    return Array.from(
      new Set(INDIE_GAMES.map((g) => getLocalizedText(g.artStyle, i18n.language)))
    ).filter(Boolean).sort();
  }, [i18n.language]);

  const filteredGems = useMemo(() => {
    return INDIE_GAMES.filter((game) => {
      const store = getStoreDetails(game);

      // Search
      const searchLower = gemSearch.trim().toLowerCase();
      const matchesSearch =
        searchLower === '' ||
        game.title.toLowerCase().includes(searchLower) ||
        game.developer.toLowerCase().includes(searchLower) ||
        game.genre.some((g) => g.toLowerCase().includes(searchLower));

      // Genre
      const matchesGenre =
        selectedGenre === 'all' || game.genre.includes(selectedGenre);

      // Camera
      const cameraText = getLocalizedText(game.camera, i18n.language);
      const matchesCamera =
        cameraFilter === 'all' || cameraText === cameraFilter;

      // Art Style
      const artText = getLocalizedText(game.artStyle, i18n.language);
      const matchesArt = artFilter === 'all' || artText === artFilter;

      // Price filter
      let matchesPrice = true;
      if (priceFilter === 'free') {
        matchesPrice = store.isFree;
      } else if (priceFilter === 'under10') {
        matchesPrice = store.finalPrice < 10;
      } else if (priceFilter === 'under20') {
        matchesPrice = store.finalPrice < 20;
      } else if (priceFilter === 'sale') {
        matchesPrice = store.discount > 0;
      }

      return matchesSearch && matchesGenre && matchesCamera && matchesArt && matchesPrice;
    }).sort((a, b) => {
      const storeA = getStoreDetails(a);
      const storeB = getStoreDetails(b);

      if (sortOption === 'title-asc') return a.title.localeCompare(b.title);
      if (sortOption === 'title-desc') return b.title.localeCompare(a.title);
      if (sortOption === 'year-desc') return b.releaseYear - a.releaseYear;
      if (sortOption === 'year-asc') return a.releaseYear - b.releaseYear;
      if (sortOption === 'rating-desc') return storeB.score - storeA.score;
      if (sortOption === 'price-asc') return storeA.finalPrice - storeB.finalPrice;
      if (sortOption === 'price-desc') return storeB.finalPrice - storeA.finalPrice;
      return 0;
    });
  }, [
    gemSearch,
    selectedGenre,
    cameraFilter,
    artFilter,
    priceFilter,
    sortOption,
    i18n.language,
  ]);

  // ==================== 5. RADAR SORTIES STATE ====================
  const [radarFilter, setRadarFilter] = useState<'all' | '2026' | '2027+' | 'tba'>('all');

  const filteredRadarGames = useMemo(() => {
    return UPCOMING_INDIE_GAMES.filter((game) => {
      const dateText = getLocalizedText(game.expectedDate, i18n.language).toLowerCase();
      if (radarFilter === '2026') return dateText.includes('2026');
      if (radarFilter === '2027+') return dateText.includes('2027') || dateText.includes('+');
      if (radarFilter === 'tba') return dateText.includes('tba') || dateText.includes('prochainement');
      return true;
    }).sort((a, b) => b.hypeScore - a.hypeScore);
  }, [radarFilter, i18n.language]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header Sylvestre */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-lg shadow-emerald-950/40">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Atelier & Utilitaires Indés</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
          {t('toolbox.title')}
        </h1>
        <p className="text-sm sm:text-base text-emerald-100/70 mt-2 max-w-2xl mx-auto">
          {t('toolbox.subtitle')}
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 bg-[#020b08]/90 p-2 rounded-2xl border-2 border-[#78350f]/60 max-w-3xl mx-auto shadow-2xl backdrop-blur-md">
        {(
          [
            { id: 'roulette', label: t('toolbox.tabs.roulette'), icon: Dices },
            { id: 'backlog', label: t('toolbox.tabs.backlog'), icon: Clock },
            { id: 'budget', label: t('toolbox.tabs.budget'), icon: PiggyBank },
            { id: 'gems', label: t('toolbox.tabs.gems'), icon: Compass },
            { id: 'radar', label: t('toolbox.tabs.radar'), icon: Flame },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all select-none cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                  : 'text-emerald-100/80 hover:text-white hover:bg-emerald-950/40 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: ROULETTE À PÉPITES ==================== */}
      {activeTab === 'roulette' && (
        <div className="max-w-3xl mx-auto bg-[#04120e]/95 border-2 border-[#78350f] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Dices className="w-6 h-6 text-amber-400" />
              <span>{t('toolbox.roulette.heading')}</span>
            </h2>
            {spinCount > 0 && (
              <span className="text-xs font-mono font-bold text-amber-300 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                {t('toolbox.roulette.drawCount', { count: spinCount })}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/70 mb-6">
            {t('toolbox.roulette.vibeDesc')}
          </p>

          {/* Mood Selectors */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-3">
              {t('toolbox.roulette.mood')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_DEFINITIONS.map((m) => {
                const count = filterGamesByMood(INDIE_GAMES, m.id).length;
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedMood(m.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all select-none cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20 scale-[1.02]'
                        : 'bg-[#061813] border-[#78350f]/50 text-emerald-100/70 hover:border-amber-500/50 hover:bg-[#08221b]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">
                        {getLocalizedText(m.label, i18n.language)}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-[#020b08] px-1.5 py-0.5 rounded border border-[#78350f]/40 shrink-0">
                        {count}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-100/60 mt-1 line-clamp-2 leading-tight">
                      {getLocalizedText(m.description, i18n.language)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spin Trigger Button */}
          <button
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning ? t('toolbox.roulette.spinning') : t('toolbox.roulette.spin')}
            </span>
          </button>

          {/* Winner Showcase Card */}
          {rouletteWinner && (
            <div className="mt-8 bg-[#061813] border-2 border-amber-500/60 rounded-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-300 shadow-2xl">
              <div className="flex items-center justify-between mb-3 border-b border-[#78350f]/50 pb-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t('toolbox.roulette.resultTitle')}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
                  ~{getGameDurationHours(rouletteWinner)}h de jeu
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-full sm:w-56 h-36 rounded-xl overflow-hidden border border-[#78350f]/60 shrink-0 bg-black relative group">
                  <img
                    src={rouletteWinner.screenshots[5] || rouletteWinner.screenshots[0]}
                    alt={rouletteWinner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-white/10">
                    {rouletteWinner.releaseYear}
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-black text-white leading-tight">
                    {rouletteWinner.title}
                  </h3>
                  <div className="text-xs text-amber-400/90 font-semibold mt-1">
                    {rouletteWinner.developer} • {getLocalizedText(rouletteWinner.camera, i18n.language)} • {getLocalizedText(rouletteWinner.artStyle, i18n.language)}
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 italic leading-relaxed">
                    « {getLocalizedText(rouletteWinner.hints?.tagline, i18n.language)} »
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {rouletteWinner.genre.map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-1 rounded-lg bg-[#020b08] text-emerald-200 text-xs font-semibold border border-[#78350f]/40"
                      >
                        {getTranslatedGenre(g, i18n.language)}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[#78350f]/40">
                    {rouletteWinner.steamUrl && (
                      <a
                        href={rouletteWinner.steamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20"
                      >
                        <span>{t('toolbox.roulette.launchSteam')}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={handleSpinRoulette}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#020b08] hover:bg-emerald-950 text-amber-400 text-xs font-bold border border-amber-500/40 transition cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Tirer un autre jeu</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: ESTIMATEUR DE BACKLOG ==================== */}
      {activeTab === 'backlog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Games Selection Column */}
          <div className="lg:col-span-2 bg-[#04120e]/95 border-2 border-[#78350f] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>{t('toolbox.backlog.heading')}</span>
              </h2>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                {selectedBacklogIds.length} / {INDIE_GAMES.length} jeux sélectionnés
              </span>
            </div>
            <p className="text-xs text-emerald-100/70 mb-4">
              {t('toolbox.backlog.desc')}
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[#78350f]/40">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80 mr-1">
                Presets :
              </span>
              <button
                onClick={() => applyBacklogPreset('short')}
                className="px-2.5 py-1 rounded-lg bg-[#061813] hover:bg-amber-500/20 text-emerald-200 hover:text-amber-300 border border-[#78350f]/50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Express (&lt; 10h)</span>
              </button>
              <button
                onClick={() => applyBacklogPreset('essentials')}
                className="px-2.5 py-1 rounded-lg bg-[#061813] hover:bg-amber-500/20 text-emerald-200 hover:text-amber-300 border border-[#78350f]/50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Les Incontournables</span>
              </button>
              <button
                onClick={() => applyBacklogPreset('cozy')}
                className="px-2.5 py-1 rounded-lg bg-[#061813] hover:bg-amber-500/20 text-emerald-200 hover:text-amber-300 border border-[#78350f]/50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Coffee className="w-3 h-3 text-amber-400" />
                <span>Pause Cozy</span>
              </button>
              <button
                onClick={() => applyBacklogPreset('clear')}
                className="px-2.5 py-1 rounded-lg bg-[#061813] hover:bg-red-900/30 text-slate-400 hover:text-red-300 border border-slate-700/50 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('toolbox.backlog.clearSelection')}</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={backlogSearch}
                  onChange={(e) => setBacklogSearch(e.target.value)}
                  placeholder="Rechercher parmi les 161 jeux..."
                  className="w-full pl-9 pr-3 py-2 bg-[#020b08] border border-[#78350f]/50 rounded-xl text-xs text-white placeholder-emerald-100/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Duration Pills */}
              <div className="flex items-center gap-1 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(
                  [
                    { id: 'all', label: 'Tous' },
                    { id: 'short', label: '< 10h' },
                    { id: 'medium', label: '10-25h' },
                    { id: 'long', label: '25-50h' },
                    { id: 'infinite', label: '50h+' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      soundFx.playClick();
                      setBacklogDurationFilter(d.id);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition whitespace-nowrap cursor-pointer ${
                      backlogDurationFilter === d.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#020b08] border-[#78350f]/40 text-emerald-100/60 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredBacklogCandidates.map((game) => {
                const isSelected = selectedBacklogIds.includes(game.id);
                const hours = getGameDurationHours(game);
                return (
                  <div
                    key={game.id}
                    onClick={() => toggleBacklogItem(game.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : 'bg-[#061813] border-[#78350f]/40 text-emerald-100/70 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                            : 'border-slate-700 bg-black/50'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {game.title}
                        </div>
                        <div className="text-[11px] text-emerald-100/50 truncate">
                          {game.developer} • {getTranslatedGenre(game.genre[0], i18n.language)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-2">
                      ~{hours}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backlog Forecast Sidebar */}
          <div className="bg-[#04120e]/95 border-2 border-[#78350f] rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Synthèse Prévisionnelle</span>
              </h3>

              {/* Total Hours Badge */}
              <div className="bg-[#061813] border border-[#78350f]/60 p-4 rounded-2xl mb-4 text-center shadow-inner">
                <div className="text-xs text-emerald-100/70 mb-1">
                  {t('toolbox.backlog.totalEstimated')}
                </div>
                <div className="text-4xl font-black text-white">
                  {totalBacklogHours} <span className="text-lg text-amber-400">heures</span>
                </div>
                <div className="text-xs text-amber-300 font-bold mt-1">
                  {t('toolbox.backlog.selectedGames', { count: selectedBacklogIds.length })}
                </div>
              </div>

              {/* Daily Hours Slider */}
              <div className="mb-6 bg-[#061813] border border-[#78350f]/40 p-4 rounded-2xl">
                <div className="flex justify-between text-xs font-bold text-emerald-100 mb-2">
                  <span>{t('toolbox.backlog.dailyHours')}</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {t('toolbox.backlog.hoursPerDay', { count: dailyHours })}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-emerald-100/40 mt-1">
                  <span>30 min / j</span>
                  <span>4 h / j</span>
                  <span>8 h / j</span>
                </div>
              </div>

              {/* Completion Date */}
              <div className="bg-[#061813] border border-[#78350f]/40 p-4 rounded-2xl mb-4">
                <div className="flex items-center gap-2 text-xs text-emerald-100/70 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('toolbox.backlog.completionDate')}</span>
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-300">
                  {daysToComplete === 0
                    ? '-'
                    : projectedFinishDate.toLocaleDateString(i18n.language, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                </div>
                <div className="text-xs text-emerald-100/60 mt-1 font-medium">
                  Soit environ <span className="text-amber-400 font-bold">{daysToComplete} jours</span> de périple régulier.
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-emerald-100/50 italic border-t border-[#78350f]/30 pt-3">
              « Dans un jeu indépendant, le bonheur réside dans chaque recoin exploré plutôt que dans la fin du générique. »
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: OPTIMISEUR DE BUDGET SOLDES STEAM ==================== */}
      {activeTab === 'budget' && (
        <div className="max-w-4xl mx-auto bg-[#04120e]/95 border-2 border-[#78350f] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <PiggyBank className="w-6 h-6 text-amber-400" />
              <span>{t('toolbox.budget.heading')}</span>
            </h2>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
              Données Steam Store Officielles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/70 mb-6">
            {t('toolbox.budget.desc')}
          </p>

          {/* Budget Input & Presets */}
          <div className="bg-[#061813] border border-[#78350f]/50 p-5 rounded-2xl mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  {t('toolbox.budget.budgetLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="200"
                    step="5"
                    value={userBudget}
                    onChange={(e) => setUserBudget(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 bg-[#020b08] border-2 border-[#78350f]/60 focus:border-amber-400 rounded-xl text-white font-black text-lg focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-lg">
                    €
                  </span>
                </div>
              </div>

              {/* Strategy Selector */}
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Stratégie d'Optimisation
                </label>
                <select
                  value={budgetStrategy}
                  onChange={(e) => setBudgetStrategy(e.target.value as BudgetStrategy)}
                  className="w-full px-3 py-3 bg-[#020b08] border-2 border-[#78350f]/60 focus:border-amber-400 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="value">Meilleur Ratio Heures / Prix</option>
                  <option value="acclaimed">Top Évaluations Steam</option>
                  <option value="sales">Chasse aux Grosses Soldes</option>
                  <option value="variety">Pépites Variées (Multi-genres)</option>
                </select>
              </div>

              <button
                onClick={optimizeBudget}
                className="w-full sm:w-auto mt-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {t('toolbox.budget.calculate')}
              </button>
            </div>

            {/* Quick Budget Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#78350f]/30">
              <span className="text-xs font-bold text-emerald-100/60 mr-1">
                Budgets rapides :
              </span>
              {[10, 20, 30, 50, 75, 100].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    soundFx.playClick();
                    setUserBudget(b);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    userBudget === b
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#020b08] border-[#78350f]/40 text-emerald-100/70 hover:text-white'
                  }`}
                >
                  {b} €
                </button>
              ))}
            </div>
          </div>

          {/* Optimized Cart Results */}
          {optimizedCart.length > 0 && (
            <div className="bg-[#061813] border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 animate-in fade-in duration-300 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#78350f]/40 pb-3">
                <div>
                  <h3 className="font-black text-white text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>{t('toolbox.budget.optimalSelection')}</span>
                  </h3>
                  <span className="text-xs text-emerald-300/80">
                    Calcul optimal basé sur vos critères
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-300 px-3 py-1 bg-emerald-950/60 rounded-xl border border-emerald-500/40">
                  {optimizedCart.length} chefs-d'œuvre sélectionnés
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2 mb-5">
                {optimizedCart.map((item) => (
                  <div
                    key={item.game.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#020b08] border border-[#78350f]/40 hover:border-amber-500/40 text-xs transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.game.screenshots[0]}
                        alt={item.game.title}
                        className="w-12 h-8 rounded-lg object-cover border border-[#78350f]/40 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-black text-white truncate text-sm">
                          {item.game.title}
                        </div>
                        <div className="text-xs text-emerald-100/60 truncate">
                          ~{item.hours}h de jeu • {item.score}% d'avis positifs • {getTranslatedGenre(item.game.genre[0], i18n.language)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      {item.discount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                          -{item.discount}%
                        </span>
                      )}
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {item.finalPrice.toFixed(2)} €
                      </span>
                      {item.game.steamUrl && (
                        <a
                          href={item.game.steamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                          title="Voir sur Steam"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[#78350f]/40">
                <div className="p-3 bg-[#020b08] rounded-xl border border-[#78350f]/40">
                  <div className="text-[11px] uppercase text-emerald-100/60 font-bold">Total Dépensé</div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {optimizedCart.reduce((acc, i) => acc + i.finalPrice, 0).toFixed(2)} €
                  </div>
                </div>
                <div className="p-3 bg-[#020b08] rounded-xl border border-[#78350f]/40">
                  <div className="text-[11px] uppercase text-emerald-100/60 font-bold">Monnaie Restante</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">
                    {(userBudget - optimizedCart.reduce((acc, i) => acc + i.finalPrice, 0)).toFixed(2)} €
                  </div>
                </div>
                <div className="p-3 bg-[#020b08] rounded-xl border border-[#78350f]/40">
                  <div className="text-[11px] uppercase text-emerald-100/60 font-bold">Heures Cumulées</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    ~{optimizedCart.reduce((acc, i) => acc + i.hours, 0)}h
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: EXPLORATEUR DE PÉPITES MULTICRITÈRES ==================== */}
      {activeTab === 'gems' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-[#04120e]/95 border-2 border-[#78350f] rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 mb-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gemSearch}
                  onChange={(e) => setGemSearch(e.target.value)}
                  placeholder={t('toolbox.gems.search')}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#020b08] border border-[#78350f]/60 rounded-xl text-xs text-white placeholder-emerald-100/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Genre */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#020b08] border border-[#78350f]/60 rounded-xl text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">{t('toolbox.gems.filterGenre')}</option>
                {allGenresList.map((genre) => (
                  <option key={genre} value={genre}>
                    {getTranslatedGenre(genre, i18n.language)}
                  </option>
                ))}
              </select>

              {/* Camera Perspective */}
              <select
                value={cameraFilter}
                onChange={(e) => setCameraFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#020b08] border border-[#78350f]/60 rounded-xl text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Toutes les caméras</option>
                {allCamerasList.map((cam) => (
                  <option key={cam} value={cam}>
                    {cam}
                  </option>
                ))}
              </select>

              {/* Art Style */}
              <select
                value={artFilter}
                onChange={(e) => setArtFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#020b08] border border-[#78350f]/60 rounded-xl text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Tous les styles d'art</option>
                {allArtStylesList.map((art) => (
                  <option key={art} value={art}>
                    {art}
                  </option>
                ))}
              </select>

              {/* Price */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#020b08] border border-[#78350f]/60 rounded-xl text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Tous les prix</option>
                <option value="free">Gratuits</option>
                <option value="under10">Moins de 10 €</option>
                <option value="under20">Moins de 20 €</option>
                <option value="sale">En promotion</option>
              </select>

              {/* Sorting */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full px-3 py-2.5 bg-[#020b08] border border-[#78350f]/60 rounded-xl text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="rating-desc">Évaluations Steam</option>
                <option value="year-desc">Plus récents</option>
                <option value="year-asc">Plus anciens</option>
                <option value="title-asc">Titre (A → Z)</option>
                <option value="title-desc">Titre (Z → A)</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>

            {/* Results count & Clear */}
            <div className="flex items-center justify-between pt-2 border-t border-[#78350f]/30 text-xs">
              <span className="text-emerald-100/70 font-semibold">
                {t('toolbox.gems.foundCount', { count: filteredGems.length })} sur {INDIE_GAMES.length}
              </span>
              {(gemSearch || selectedGenre !== 'all' || priceFilter !== 'all' || cameraFilter !== 'all' || artFilter !== 'all') && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setGemSearch('');
                    setSelectedGenre('all');
                    setPriceFilter('all');
                    setCameraFilter('all');
                    setArtFilter('all');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGems.map((game) => {
              const store = getStoreDetails(game);
              const hours = getGameDurationHours(game);
              return (
                <div
                  key={game.id}
                  className="bg-[#04120e]/95 border border-[#78350f]/50 rounded-2xl overflow-hidden hover:border-amber-500/60 transition-all duration-200 group flex flex-col justify-between shadow-xl"
                >
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img
                      src={game.screenshots[5] || game.screenshots[0]}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-white/10">
                      {game.releaseYear}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-emerald-400 border border-white/10">
                      {store.formattedPrice}
                      {store.discount > 0 && ` (-${store.discount}%)`}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-black text-white group-hover:text-amber-400 transition">
                          {game.title}
                        </h3>
                        <span className="text-[11px] font-mono text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                          ~{hours}h
                        </span>
                      </div>
                      <div className="text-xs text-emerald-100/60 mb-2">
                        {game.developer} • {store.score}% positif
                      </div>
                      <p className="text-xs text-emerald-100/80 italic mb-3 line-clamp-2">
                        « {getLocalizedText(game.hints?.tagline, i18n.language)} »
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#78350f]/30 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {game.genre.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-md bg-[#020b08] text-emerald-200 text-[11px] font-semibold border border-[#78350f]/30"
                          >
                            {getTranslatedGenre(g, i18n.language)}
                          </span>
                        ))}
                      </div>

                      {game.steamUrl && (
                        <a
                          href={game.steamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#020b08] hover:bg-amber-500 hover:text-slate-950 text-emerald-300 border border-[#78350f]/40 transition"
                          title={t('common.viewOnSteam')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: RADAR DES SORTIES INDÉES ==================== */}
      {activeTab === 'radar' && (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
          <div className="bg-[#04120e]/95 border-2 border-[#78350f] rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-400" />
                <span>{t('toolbox.radar.title')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
                {t('toolbox.radar.subtitle')}
              </p>
            </div>

            {/* Radar Filter Pills */}
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'all', label: 'Toutes' },
                  { id: '2026', label: '2026' },
                  { id: '2027+', label: '2027+' },
                  { id: 'tba', label: 'TBA' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundFx.playClick();
                    setRadarFilter(f.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    radarFilter === f.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#020b08] border-[#78350f]/40 text-emerald-100/60 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRadarGames.map((game) => (
              <div
                key={game.id}
                className="bg-[#04120e]/95 border-2 border-[#78350f]/60 rounded-2xl p-5 hover:border-amber-500/60 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        {getLocalizedText(game.expectedDate, i18n.language)}
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition mt-2 leading-tight">
                        {game.title}
                      </h3>
                      <p className="text-xs text-emerald-100/70 font-medium">
                        {game.developer} {game.publisher !== game.developer && `• ${game.publisher}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0 bg-[#020b08] px-3 py-1.5 rounded-xl border border-[#78350f]/40">
                      <span className="text-[10px] uppercase font-bold text-emerald-100/60 block">
                        Hype
                      </span>
                      <span className="text-base font-mono font-black text-amber-400">
                        {game.hypeScore}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-100/80 mb-3 leading-relaxed">
                    {getLocalizedText(game.description, i18n.language)}
                  </p>

                  <div className="p-3 rounded-xl bg-[#020b08] border border-[#78350f]/40 mb-4 text-xs text-amber-200/90 italic">
                    « {getLocalizedText(game.highlight, i18n.language)} »
                  </div>
                </div>

                <div>
                  {/* Platforms & Genres */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {game.genres.map((g, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#020b08] border border-[#78350f]/40 text-xs text-emerald-200 font-medium"
                      >
                        {getLocalizedText(g, i18n.language)}
                      </span>
                    ))}
                    {game.platforms.map((p, i) => (
                      <span
                        key={`plat-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/50 text-xs text-slate-300 font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  {game.steamUrl && (
                    <a
                      href={game.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20"
                    >
                      <span>{t('toolbox.radar.wishlistOnSteam')}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
