import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Building2,
  Gamepad2,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Share2,
  ZoomIn,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FileSearch,
  Check,
  X,
  Layers,
  Star,
} from 'lucide-react';
import { INDIE_GAMES, getDailyProfilleGame } from '../../data/games';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { SteamIcon } from '../common/SteamIcon';
import { ShareResultModal } from '../common/ShareResultModal';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { telemetry } from '../../services/telemetry';

interface ProfilleGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface SavedProfilleState {
  yearGuesses: number[];
  devGuesses: string[];
  genreGuesses: string[][];
  isYearSolved: boolean;
  isDevSolved: boolean;
  isGenreSolved: boolean;
  isCompleted: boolean;
  isWon: boolean;
  score: number;
}

// Helper to normalize studio names for tolerant matching (e.g. "Moon Studios" == "Moon Studios GmbH")
const normalizeStudioName = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\b(gmbh|inc\.?|llc|ltd\.?|corp\.?|co\.|studios?|games?|entertainment|interactive)\b/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
};

/**
 * Normalisation robuste des genres pour éliminer la ponctuation, les tirets, les espaces et la casse.
 * Réconcilie aussi les variantes courantes (ex: 'coop', 'co-op', 'coopération' -> 'coop').
 */
export function normalizeGenreKey(genre: string): string {
  const norm = genre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_ \/]/g, '')
    .trim();

  if (norm === 'coop' || norm === 'cooperation' || norm === 'cooperatif') return 'coop';
  if (norm === 'soulslike') return 'soulslike';
  if (norm === 'roguelike' || norm === 'roguelite') return 'roguelike';
  return norm;
}

export function isGenreEquivalent(genreA: string, genreB: string): boolean {
  return normalizeGenreKey(genreA) === normalizeGenreKey(genreB);
}

export function checkGenreMatch(guess: string, targetGenres: string[]): boolean {
  return targetGenres.some((t) => isGenreEquivalent(t, guess));
}

export const ProfilleGame: React.FC<ProfilleGameProps> = ({ currentDate, onSelectDate }) => {
  const { i18n } = useTranslation();
  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();
  const isFr = i18n.language.startsWith('fr');

  // The secret game to profile
  const secretGame = useMemo(() => getDailyProfilleGame(currentDate), [currentDate]);

  // Unique list of all indie developers and genres
  const allDevelopers = useMemo(() => {
    return Array.from(new Set(INDIE_GAMES.map((g) => g.developer))).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, []);

  const allGenres = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of INDIE_GAMES) {
      for (const gen of g.genre) {
        const key = normalizeGenreKey(gen);
        if (!map.has(key)) {
          map.set(key, gen);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, []);

  // Storage key
  const storageKey = `profille_state_${currentDate}`;

  const savedState = useMemo<SavedProfilleState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          yearGuesses: Array.isArray(parsed.yearGuesses) ? parsed.yearGuesses : [],
          devGuesses: Array.isArray(parsed.devGuesses) ? parsed.devGuesses : [],
          genreGuesses: Array.isArray(parsed.genreGuesses) ? parsed.genreGuesses : [],
          isYearSolved: Boolean(parsed.isYearSolved),
          isDevSolved: Boolean(parsed.isDevSolved),
          isGenreSolved: Boolean(parsed.isGenreSolved),
          isCompleted: Boolean(parsed.isCompleted),
          isWon: Boolean(parsed.isWon),
          score: typeof parsed.score === 'number' ? parsed.score : 0,
        };
      }
    } catch {
      // Fallback
    }
    return {
      yearGuesses: [],
      devGuesses: [],
      genreGuesses: [],
      isYearSolved: false,
      isDevSolved: false,
      isGenreSolved: false,
      isCompleted: false,
      isWon: false,
      score: 0,
    };
  }, [storageKey]);

  // Screenshot viewer state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Card 1: Year state
  const [yearGuesses, setYearGuesses] = useState<number[]>(savedState.yearGuesses);
  const [inputYear, setInputYear] = useState<string>(() =>
    savedState.yearGuesses.length > 0 ? String(savedState.yearGuesses[savedState.yearGuesses.length - 1]) : '2020'
  );
  const [isYearSolved, setIsYearSolved] = useState<boolean>(savedState.isYearSolved);

  // Card 2: Developer state
  const [devGuesses, setDevGuesses] = useState<string[]>(savedState.devGuesses);
  const [inputDev, setInputDev] = useState<string>('');
  const [devSuggestions, setDevSuggestions] = useState<string[]>([]);
  const [isDevDropdownOpen, setIsDevDropdownOpen] = useState<boolean>(false);
  const [isDevSolved, setIsDevSolved] = useState<boolean>(savedState.isDevSolved);
  const devInputRef = useRef<HTMLInputElement>(null);

  // Card 3: Genre state
  const [genreGuesses, setGenreGuesses] = useState<string[][]>(savedState.genreGuesses);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState<string>('');
  const [isGenreSolved, setIsGenreSolved] = useState<boolean>(savedState.isGenreSolved);

  // Overall game state
  const [isCompleted, setIsCompleted] = useState<boolean>(savedState.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(savedState.isWon);
  const [score, setScore] = useState<number>(savedState.score);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const MAX_ATTEMPTS = 3;

  const isYearExhausted = yearGuesses.length >= MAX_ATTEMPTS || isYearSolved;
  const isDevExhausted = devGuesses.length >= MAX_ATTEMPTS || isDevSolved;
  const isGenreExhausted = genreGuesses.length >= MAX_ATTEMPTS || isGenreSolved;

  // Persist state to local storage
  const persistState = useCallback(
    (newState: Partial<SavedProfilleState>) => {
      try {
        const stateToSave: SavedProfilleState = {
          yearGuesses,
          devGuesses,
          genreGuesses,
          isYearSolved,
          isDevSolved,
          isGenreSolved,
          isCompleted,
          isWon,
          score,
          ...newState,
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      } catch {
        // Ignore
      }
    },
    [
      yearGuesses,
      devGuesses,
      genreGuesses,
      isYearSolved,
      isDevSolved,
      isGenreSolved,
      isCompleted,
      isWon,
      score,
      storageKey,
    ]
  );

  // Check if whole game is finished
  useEffect(() => {
    if (isCompleted) return;

    if (isYearExhausted && isDevExhausted && isGenreExhausted) {
      const finalScore =
        (isYearSolved ? 1 : 0) + (isDevSolved ? 1 : 0) + (isGenreSolved ? 1 : 0);
      const won = finalScore >= 2;

      setIsCompleted(true);
      setIsWon(won);
      setScore(finalScore);

      persistState({
        isCompleted: true,
        isWon: won,
        score: finalScore,
      });

      // Stats recording (score 3, 2, 1 stars mapped directly for community distribution and stats)
      recordGameResult('profille', currentDate, won, finalScore);

      if (finalScore === 3) {
        soundFx.playVictory();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        unlockAchievement('keen_eye');
      } else if (won) {
        soundFx.playChime();
      } else {
        soundFx.playError();
      }

      telemetry.track('game', 'game_completed', 'profille', finalScore, {
        won,
        date: currentDate,
      });
    }
  }, [
    isYearExhausted,
    isDevExhausted,
    isGenreExhausted,
    isYearSolved,
    isDevSolved,
    isGenreSolved,
    isCompleted,
    currentDate,
    persistState,
    recordGameResult,
    unlockAchievement,
  ]);

  // Dev autocompletion filtering
  const handleDevInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputDev(val);
    if (!val.trim()) {
      setDevSuggestions([]);
      setIsDevDropdownOpen(false);
      return;
    }
    const filtered = allDevelopers
      .filter((d) => d.toLowerCase().includes(val.toLowerCase().trim()))
      .slice(0, 6);
    setDevSuggestions(filtered);
    setIsDevDropdownOpen(filtered.length > 0);
  };

  const handleSelectDevSuggestion = (dev: string) => {
    soundFx.playClick();
    setInputDev(dev);
    setDevSuggestions([]);
    setIsDevDropdownOpen(false);
    devInputRef.current?.focus();
  };

  // --- SUBMISSION HANDLERS ---

  // 1. Submit Year
  const handleSubmitYear = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isYearExhausted || isCompleted) return;

    const val = parseInt(inputYear, 10);
    if (isNaN(val) || val < 1980 || val > 2030) return;
    if (yearGuesses.includes(val)) return;

    soundFx.playClick();
    const newGuesses = [...yearGuesses, val];
    setYearGuesses(newGuesses);

    const isMatch = val === secretGame.releaseYear;
    if (isMatch) {
      setIsYearSolved(true);
      soundFx.playChime();
      persistState({ yearGuesses: newGuesses, isYearSolved: true });
    } else {
      soundFx.playError();
      persistState({ yearGuesses: newGuesses });
    }
  };

  // 2. Submit Developer
  const handleSubmitDev = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDevExhausted || isCompleted) return;

    const trimmed = inputDev.trim();
    if (!trimmed) return;
    if (devGuesses.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return;

    soundFx.playClick();
    const newGuesses = [...devGuesses, trimmed];
    setDevGuesses(newGuesses);
    setInputDev('');
    setIsDevDropdownOpen(false);

    // Lenient matching: exact match OR normalized studio match (handles GmbH, Studios, LLC, etc.)
    const secretDev = secretGame.developer;
    const isDirectMatch = trimmed.toLowerCase() === secretDev.toLowerCase();
    const isNormMatch =
      normalizeStudioName(trimmed).length >= 3 &&
      normalizeStudioName(trimmed) === normalizeStudioName(secretDev);
    const isSubstringMatch =
      trimmed.length >= 4 &&
      (secretDev.toLowerCase().includes(trimmed.toLowerCase()) ||
        trimmed.toLowerCase().includes(secretDev.toLowerCase()));

    const isMatch = isDirectMatch || isNormMatch || isSubstringMatch;

    if (isMatch) {
      setIsDevSolved(true);
      soundFx.playChime();
      persistState({ devGuesses: newGuesses, isDevSolved: true });
    } else {
      soundFx.playError();
      persistState({ devGuesses: newGuesses });
    }
  };

  // 3. Submit Genre
  const toggleGenre = (genre: string) => {
    if (isGenreExhausted || isCompleted) return;
    soundFx.playClick();
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length >= 3) return; // Max 3 genres selected
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmitGenre = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenreExhausted || isCompleted || selectedGenres.length === 0) return;

    soundFx.playClick();
    const newGuesses = [...genreGuesses, selectedGenres];
    setGenreGuesses(newGuesses);

    const matchedCount = selectedGenres.filter((g) =>
      checkGenreMatch(g, secretGame.genre)
    ).length;

    // Solved if the player identified at least 1 matching genre from this title
    const hasValidHit = matchedCount > 0;

    if (hasValidHit) {
      setIsGenreSolved(true);
      soundFx.playChime();
      persistState({ genreGuesses: newGuesses, isGenreSolved: true });
    } else {
      soundFx.playError();
      persistState({ genreGuesses: newGuesses });
    }
    setSelectedGenres([]);
  };

  // Share text generation (clean, minimal emojis)
  const handleShare = () => {
    soundFx.playClick();
    const yearStatus = isYearSolved ? `Succes (${yearGuesses.length}/3)` : `Echec`;
    const devStatus = isDevSolved ? `Succes (${devGuesses.length}/3)` : `Echec`;
    const genreStatus = isGenreSolved ? `Succes (${genreGuesses.length}/3)` : `Echec`;

    const text = `Hoot Indie Games — Profille #${currentDate}
Dossier : ${isCompleted ? secretGame.title : '???'}
Annee : ${yearStatus}
Studio : ${devStatus}
Style : ${genreStatus}
Score : ${score}/3 etoiles
https://hootindiegames.com/#profille`;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  };

  // Filtered genres for picker
  const filteredGenresList = useMemo(() => {
    if (!genreSearch.trim()) return allGenres;
    return allGenres.filter((g) =>
      g.toLowerCase().includes(genreSearch.toLowerCase().trim())
    );
  }, [allGenres, genreSearch]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Game Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
          <FileSearch className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFr ? "Fiche d'Identité" : 'Game ID Card'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center justify-center gap-2">
          <span>{isFr ? 'Profil' : 'Profile'}</span>
          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {isFr ? 'Dossier Indé' : 'Indie File'}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
          {isFr
            ? "Le titre du jeu et ses captures d'écran sont dévoilés. Retrouvez son année de sortie, son studio et son style de jeu."
            : 'The game title and official screenshots are revealed. Deduce its release year, developer studio, and game genre.'}
        </p>
      </div>

      {/* Secret Game Title Banner (WITHOUT spoiler tagline) */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#131a29] via-[#1a233a] to-[#131a29] border border-amber-500/30 shadow-xl text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFr ? 'Dossier d’enquête' : 'Investigation File'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {secretGame.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isFr
              ? "Observez les captures et complétez les 3 indices d'identité ci-dessous."
              : 'Inspect the screenshots and solve the 3 identity criteria below.'}
          </p>
        </div>
      </div>

      {/* Visual Gallery Viewer */}
      <div className="mb-8 bg-[#131a29] rounded-2xl border border-[#1e293b] p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isFr
                ? `Captures officielles (${activeImageIndex + 1}/${secretGame.screenshots.length})`
                : `Official Screenshots (${activeImageIndex + 1}/${secretGame.screenshots.length})`}
            </span>
          </span>
          <button
            onClick={() => setIsZoomModalOpen(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{isFr ? 'Agrandir' : 'Enlarge'}</span>
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-[#1e293b] group">
          <img
            src={secretGame.screenshots[activeImageIndex] || secretGame.screenshots[0]}
            alt={`${secretGame.title} screenshot ${activeImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            loading="eager"
          />

          {/* Navigation Arrows */}
          <button
            onClick={() =>
              setActiveImageIndex((prev) =>
                prev === 0 ? secretGame.screenshots.length - 1 : prev - 1
              )
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition cursor-pointer"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setActiveImageIndex((prev) =>
                prev === secretGame.screenshots.length - 1 ? 0 : prev + 1
              )
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition cursor-pointer"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {secretGame.screenshots.map((src, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFx.playClick();
                setActiveImageIndex(idx);
              }}
              className={`relative shrink-0 w-16 sm:w-20 aspect-video rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                activeImageIndex === idx
                  ? 'border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Streak Notice Banner (Catch-up / Preservation) */}
      <StreakNoticeBanner
        mode="profille"
        currentDate={currentDate}
        isWon={isWon}
        onSelectDate={onSelectDate}
      />

      {/* 3 Deduction Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* CARD 1: ANNÉE DE SORTIE */}
        <div className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{isFr ? 'Année de sortie' : 'Release Year'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isYearSolved ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                  </span>
                ) : (
                  `${yearGuesses.length}/${MAX_ATTEMPTS}`
                )}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {isFr
                ? "Deduisez l'année exacte de parution."
                : 'Deduce the official release year.'}
            </p>

            {/* Year History */}
            <div className="space-y-1.5 mb-3 min-h-[70px]">
              {yearGuesses.map((y, idx) => {
                const isMatch = y === secretGame.releaseYear;
                const isHigher = y < secretGame.releaseYear; // Target is higher / more recent

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                      isMatch
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="font-mono text-sm">{y}</span>
                    {isMatch ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Exact' : 'Exact'}</span>
                      </span>
                    ) : isHigher ? (
                      <span className="flex items-center gap-1 text-amber-300 text-[11px]">
                        <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isFr ? 'Plus récent' : 'Newer'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-cyan-300 text-[11px]">
                        <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isFr ? 'Plus ancien' : 'Older'}</span>
                      </span>
                    )}
                  </div>
                );
              })}

              {!isYearSolved && yearGuesses.length >= MAX_ATTEMPTS && (
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                  <span>{isFr ? 'Réponse :' : 'Answer:'}</span>
                  <span className="font-mono">{secretGame.releaseYear}</span>
                </div>
              )}
            </div>
          </div>

          {/* Year Input / Stepper */}
          {!isYearExhausted ? (
            <form onSubmit={handleSubmitYear} className="space-y-2 pt-2 border-t border-[#1e293b]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setInputYear((y) => String(Math.max(1990, (parseInt(y, 10) || 2020) - 1)))
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInputYear((y) => String(Math.max(1990, (parseInt(y, 10) || 2020) - 5)))
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  -5
                </button>
                <input
                  type="number"
                  min={1990}
                  max={2030}
                  value={inputYear}
                  onChange={(e) => setInputYear(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setInputYear((y) => String(Math.min(2030, (parseInt(y, 10) || 2020) + 1)))
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInputYear((y) => String(Math.min(2030, (parseInt(y, 10) || 2020) + 5)))
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  +5
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                {isFr ? "Valider l'année" : 'Submit Year'}
              </button>
            </form>
          ) : (
            <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
              {isYearSolved ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Point validé' : 'Solved'}</span>
                </span>
              ) : (
                <span className="text-slate-500">{isFr ? 'Essais épuisés' : 'Attempts ended'}</span>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: DÉVELOPPEUR / STUDIO */}
        <div className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{isFr ? 'Studio / Dév' : 'Developer'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isDevSolved ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                  </span>
                ) : (
                  `${devGuesses.length}/${MAX_ATTEMPTS}`
                )}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {isFr
                ? 'Retrouvez le créateur ou studio indé.'
                : 'Identify the indie studio or creator.'}
            </p>

            {/* Dev History */}
            <div className="space-y-1.5 mb-3 min-h-[70px]">
              {devGuesses.map((d, idx) => {
                const isMatch =
                  d.toLowerCase() === secretGame.developer.toLowerCase() ||
                  (normalizeStudioName(d).length >= 3 &&
                    normalizeStudioName(d) === normalizeStudioName(secretGame.developer));

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                      isMatch
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{d}</span>
                    {isMatch ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Exact' : 'Exact'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-[11px] shrink-0">
                        <X className="w-3 h-3" />
                        <span>{isFr ? 'Incorrect' : 'Wrong'}</span>
                      </span>
                    )}
                  </div>
                );
              })}

              {!isDevSolved && devGuesses.length >= MAX_ATTEMPTS && (
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                  <span>{isFr ? 'Réponse :' : 'Answer:'}</span>
                  <span className="truncate ml-1">{secretGame.developer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dev Autocomplete Input */}
          {!isDevExhausted ? (
            <form onSubmit={handleSubmitDev} className="space-y-2 pt-2 border-t border-[#1e293b] relative">
              <div className="relative">
                <input
                  ref={devInputRef}
                  type="text"
                  value={inputDev}
                  onChange={handleDevInputChange}
                  placeholder={isFr ? 'Nom du studio...' : 'Studio name...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />

                {/* Suggestions Dropdown (Opens downwards cleanly) */}
                {isDevDropdownOpen && devSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0f19] border border-[#1e293b] rounded-xl shadow-2xl max-h-40 overflow-y-auto z-30">
                    {devSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDevSuggestion(item)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition cursor-pointer border-b border-slate-800/40 last:border-0"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!inputDev.trim()}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                {isFr ? 'Valider le studio' : 'Submit Studio'}
              </button>
            </form>
          ) : (
            <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
              {isDevSolved ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Point validé' : 'Solved'}</span>
                </span>
              ) : (
                <span className="text-slate-500">{isFr ? 'Essais épuisés' : 'Attempts ended'}</span>
              )}
            </div>
          )}
        </div>

        {/* CARD 3: STYLE DE JEU & GENRES */}
        <div className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" />
                <span>{isFr ? 'Style & Genres' : 'Style & Genre'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isGenreSolved ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                  </span>
                ) : (
                  `${genreGuesses.length}/${MAX_ATTEMPTS}`
                )}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {isFr
                ? 'Sélectionnez jusqu’à 3 genres clés.'
                : 'Pick up to 3 matching genres.'}
            </p>

            {/* Genre Guess History */}
            <div className="space-y-1.5 mb-3 min-h-[70px]">
              {genreGuesses.map((guessArr, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-slate-900 border border-slate-800"
                >
                  {guessArr.map((g) => {
                    const isTarget = checkGenreMatch(g, secretGame.genre);
                    return (
                      <span
                        key={g}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                          isTarget
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 line-through'
                        }`}
                      >
                        {isTarget ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <X className="w-3 h-3 text-rose-400" />
                        )}
                        <span>{g}</span>
                      </span>
                    );
                  })}
                </div>
              ))}

              {!isGenreSolved && genreGuesses.length >= MAX_ATTEMPTS && (
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  <div className="text-[10px] text-rose-300/80 mb-0.5">
                    {isFr ? 'Genres officiels :' : 'Official genres:'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {secretGame.genre.map((g) => (
                      <span
                        key={g}
                        className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[10px] font-bold"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Genre Multi-Selector */}
          {!isGenreExhausted ? (
            <div className="pt-2 border-t border-[#1e293b] space-y-2">
              <input
                type="text"
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                placeholder={isFr ? 'Filtrer un genre...' : 'Filter genre...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none focus:border-amber-500"
              />

              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto no-scrollbar p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                {filteredGenresList.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`text-[10px] px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSubmitGenre}
                disabled={selectedGenres.length === 0}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                {isFr
                  ? `Valider (${selectedGenres.length}/3)`
                  : `Submit (${selectedGenres.length}/3)`}
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
              {isGenreSolved ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Point validé' : 'Solved'}</span>
                </span>
              ) : (
                <span className="text-slate-500">{isFr ? 'Essais épuisés' : 'Attempts ended'}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY DOSSIER CLOTURE (When Game Completed) */}
      {isCompleted && (
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#131a29] border border-amber-500/40 shadow-2xl animate-in fade-in zoom-in-95 duration-400">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-black text-white flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>
                    {score === 3
                      ? isFr
                        ? 'Enquête Parfaite'
                        : 'Perfect Investigation'
                      : score >= 2
                      ? isFr
                        ? 'Excellente Déduction'
                        : 'Great Deduction'
                      : isFr
                      ? 'Dossier Clôturé'
                      : 'Case Closed'}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                  {score}/3
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isFr
                  ? `Vous avez identifié avec succès ${score} critère(s) sur 3 pour ${secretGame.title}.`
                  : `You successfully identified ${score} out of 3 criteria for ${secretGame.title}.`}
              </p>
            </div>

            {/* Action Buttons: Share & Steam */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? (isFr ? 'Copié !' : 'Copied!') : isFr ? 'Partager' : 'Share'}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFr ? 'Carte Image' : 'Image Card'}</span>
              </button>

              {secretGame.steamUrl && (
                <a
                  href={secretGame.steamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#171a21] hover:bg-[#2a475e] text-cyan-300 font-bold text-xs border border-cyan-500/30 transition cursor-pointer"
                >
                  <SteamIcon className="w-3.5 h-3.5" />
                  <span>Steam</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Metadata Recap Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {isFr ? 'Année de sortie' : 'Release Year'}
              </div>
              <div className="text-white font-mono font-black text-sm mt-0.5">
                {secretGame.releaseYear}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {isFr ? 'Studio Développeur' : 'Studio'}
              </div>
              <div className="text-white font-bold text-sm mt-0.5 truncate">
                {secretGame.developer}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {isFr ? 'Style Visuel' : 'Art Style'}
              </div>
              <div className="text-white font-bold text-sm mt-0.5 truncate">
                {isFr ? secretGame.artStyle.fr : secretGame.artStyle.en}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {isFr ? 'Caméra' : 'Camera'}
              </div>
              <div className="text-white font-bold text-sm mt-0.5 truncate">
                {isFr ? secretGame.camera.fr : secretGame.camera.en}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold mr-1">
              {isFr ? 'Genres officiels :' : 'Official genres:'}
            </span>
            {secretGame.genre.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Community Attempt Distribution Graph */}
          <div className="mt-5 pt-4 border-t border-[#1e293b]">
            <AttemptDistributionChart
              game="profille"
              date={currentDate}
              playerAttempts={score}
              isWon={score > 0}
            />
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={secretGame.screenshots[activeImageIndex]}
              alt={secretGame.title}
              className="w-full max-h-[85vh] object-contain rounded-xl border border-slate-800"
            />
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
            >
              {isFr ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Share Image Modal */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={{
          gameMode: 'Profille',
          date: currentDate,
          isWon,
          scoreText: `${score}/3 (${isWon ? (isFr ? 'Succès' : 'Won') : isFr ? 'Échec' : 'Lost'})`,
          details: [
            `Année : ${isYearSolved ? 'Exact' : 'Non trouvé'} (${yearGuesses.length}/3)`,
            `Studio : ${isDevSolved ? 'Exact' : 'Non trouvé'} (${devGuesses.length}/3)`,
            `Style : ${isGenreSolved ? 'Exact' : 'Non trouvé'} (${genreGuesses.length}/3)`,
            `Score final : ${score}/3`,
          ],
        }}
      />
    </div>
  );
};
