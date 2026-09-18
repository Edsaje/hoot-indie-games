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
} from 'lucide-react';
import { getDailyGame } from '../../data/games';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { soundFx } from '../../utils/audio';
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
  const { allPlayableGames } = useSteamCatalog();
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
  const [sortBy, setSortBy] = useState<'yearDesc' | 'yearAsc' | 'titleAsc'>('yearDesc');
  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(null);

  const catalogGridRef = useRef<HTMLDivElement | null>(null);

  const ownedCount = useMemo(() => {
    return allPlayableGames.filter((g) => isGameOwned(g.steamUrl)).length;
  }, [allPlayableGames, isGameOwned]);

  // Check today's game completion status from localStorage
  const dailyStatus = useMemo(() => {
    const checkState = (keyPrefix: string) => {
      try {
        const raw = localStorage.getItem(`${keyPrefix}_state_${currentDate}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return Boolean(parsed.isCompleted && parsed.isWon);
        }
      } catch {
        // Ignore
      }
      return false;
    };

    return {
      screenleWon: checkState('screenle'),
      indledleWon: checkState('indledle'),
      linkleWon: checkState('linkle'),
    };
  }, [currentDate]);

  // Extract unique genres across all games
  const allGenresList = useMemo(() => {
    const set = new Set<string>();
    allPlayableGames.forEach((g) => g.genre.forEach((genre) => set.add(genre)));
    return Array.from(set).sort();
  }, [allPlayableGames]);

  // Filtered and sorted gems catalog
  const filteredGems = useMemo(() => {
    let list = allPlayableGames.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.developer.toLowerCase().includes(q) ||
        g.genre.some((gen) => gen.toLowerCase().includes(q)) ||
        String(g.releaseYear).includes(q);

      const matchesGenre = selectedGenre === 'all' || g.genre.includes(selectedGenre);

      const matchesOwnership =
        ownershipFilter === 'all' ||
        (ownershipFilter === 'owned' && isGameOwned(g.steamUrl)) ||
        (ownershipFilter === 'unowned' && !isGameOwned(g.steamUrl));

      return matchesSearch && matchesGenre && matchesOwnership;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'yearDesc') return b.releaseYear - a.releaseYear;
      if (sortBy === 'yearAsc') return a.releaseYear - b.releaseYear;
      return a.title.localeCompare(b.title);
    });

    return list;
  }, [allPlayableGames, searchQuery, selectedGenre, ownershipFilter, sortBy, isGameOwned]);

  // Roulette: Randomly pick a gem and scroll to it
  const handleRandomPick = () => {
    soundFx.playClick();
    if (allPlayableGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allPlayableGames.length);
    const chosen = allPlayableGames[randomIndex];

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
              Découvrez chaque jour une pépite sélectionnée pour son identité artistique et sonore, résolvez nos 3 énigmes quotidiennes et jouez à nos mini-jeux rétro.
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Les Jeux & Défis Quotidiens
              </h2>
              <p className="text-xs text-slate-400">
                3 énigmes quotidiennes renouvelées chaque minuit + la salle d'arcade rétro
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Screenle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('screenle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                {dailyStatus.screenleWon ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Résolu
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-bold">
                    Mode 1
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-1">
                Screenle
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Devinez le jeu secret à travers 6 captures d'écran zoomées progressives.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Jouer au défi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Indledle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('indledle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                {dailyStatus.indledleWon ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Résolu
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-bold">
                    Mode 2
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition mb-1">
                Indledle
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Comparez l'année, les genres, le style artistique, la caméra et le studio.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Jouer au défi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Linkle */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('linkle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-purple-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                {dailyStatus.linkleWon ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Résolu
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-bold">
                    Mode 3
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition mb-1">
                Linkle
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Regroupez 16 jeux par 4 catégories thématiques secrètes.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Jouer au défi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Arcade */}
          <div
            onClick={() => {
              soundFx.playClick();
              onOpenArcade('snake');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  8 Jeux
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-1">
                Salle d'Arcade
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Snake, Pong, Casse-Briques, Flappy, Invaders, Run, Tetris & Vectrex 1982.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Lancer un jeu rétro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Section Header & Search/Filters */}
      <div ref={catalogGridRef} className="pt-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              Catalogue des Pépites Certifiées
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explorez nos {allPlayableGames.length} chefs-d'œuvre sélectionnés sans aucune hallucination
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs font-mono text-amber-400 font-bold">
              {filteredGems.length} affichée(s)
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#131a29] border border-[#1e293b] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, studio, genre..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#131a29]">Tous les genres</option>
                {allGenresList.map((genre) => (
                  <option key={genre} value={genre} className="bg-[#131a29]">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Ownership Filter */}
            {isSteamConnected && (
              <select
                value={ownershipFilter}
                onChange={(e) => setOwnershipFilter(e.target.value as 'all' | 'owned' | 'unowned')}
                className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#131a29] text-white">Toutes les pépites ({allPlayableGames.length})</option>
                <option value="owned" className="bg-[#131a29] text-cyan-400">🎮 Dans ma bibliothèque ({ownedCount})</option>
                <option value="unowned" className="bg-[#131a29] text-emerald-400">✨ À découvrir ({allPlayableGames.length - ownedCount})</option>
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'yearDesc' | 'yearAsc' | 'titleAsc')}
              className="bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="yearDesc" className="bg-[#131a29]">Plus récents</option>
              <option value="yearAsc" className="bg-[#131a29]">Plus anciens</option>
              <option value="titleAsc" className="bg-[#131a29]">Titre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Gems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGems.map((game) => {
            const isHighlighted = highlightedGameId === game.id;
            const owned = isGameOwned(game.steamUrl);
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
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={game.screenshots[5] || game.screenshots[0]}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131a29] via-transparent to-transparent opacity-60" />

                  {/* Badge Possédé sur Steam */}
                  {owned && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#0e1726]/90 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-[11px] font-black flex items-center gap-1.5 shadow-lg">
                      <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Possédé</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-white/10">
                    {game.releaseYear}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-0.5 flex items-center justify-between">
                      <span>{game.title}</span>
                    </h3>
                    <div className="text-xs text-slate-400 font-medium mb-2.5">
                      {game.developer}
                    </div>
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
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/50 hover:border-amber-500/40'
                          }`}
                        >
                          <SteamIcon className={`w-3.5 h-3.5 ${owned ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span>{owned ? 'Dans votre bibliothèque' : 'Voir sur Steam'}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
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
                          title={owned ? 'Marqué comme possédé (Cliquer pour retirer)' : 'Marquer comme possédé sur Steam'}
                          className={`p-2 rounded-xl border transition ${
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
