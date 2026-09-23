import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Building2,
  Gamepad2,
  Music,
  Palette,
  Video,
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
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { telemetry } from '../../services/telemetry';
import {
  getTranslatedGenre,
  getTranslatedArtStyle,
  getTranslatedCamera,
} from '../../utils/localization';
import {
  type ProfilleCategory,
  getDailyProfilleCategories,
  CANONICAL_ART_STYLES,
  CANONICAL_CAMERAS,
  isStudioMatch,
  isComposerMatch,
  isArtStyleMatch,
  isCameraMatch,
} from '../../utils/profilleCategories';

interface ProfilleGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface SavedProfilleState {
  activeCategories?: ProfilleCategory[];
  yearGuesses?: number[];
  devGuesses?: string[];
  genreGuesses?: string[][];
  composerGuesses?: string[];
  artStyleGuesses?: string[];
  cameraGuesses?: string[];
  isYearSolved?: boolean;
  isDevSolved?: boolean;
  isGenreSolved?: boolean;
  isComposerSolved?: boolean;
  isArtStyleSolved?: boolean;
  isCameraSolved?: boolean;
  isCompleted?: boolean;
  isWon?: boolean;
  score?: number;
}

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
  const { t, i18n } = useTranslation();
  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();

  // Secret game to profile
  const secretGame = useMemo(() => getDailyProfilleGame(currentDate), [currentDate]);

  // Unique list of developers, genres, composers
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

  const allComposers = useMemo(() => {
    const set = new Set<string>();
    for (const g of INDIE_GAMES) {
      if (g.hints?.composer?.trim()) {
        set.add(g.hints.composer.trim());
      }
    }
    return Array.from(set).sort((a, b) =>
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
          activeCategories: Array.isArray(parsed.activeCategories) ? parsed.activeCategories : undefined,
          yearGuesses: Array.isArray(parsed.yearGuesses) ? parsed.yearGuesses : [],
          devGuesses: Array.isArray(parsed.devGuesses) ? parsed.devGuesses : [],
          genreGuesses: Array.isArray(parsed.genreGuesses) ? parsed.genreGuesses : [],
          composerGuesses: Array.isArray(parsed.composerGuesses) ? parsed.composerGuesses : [],
          artStyleGuesses: Array.isArray(parsed.artStyleGuesses) ? parsed.artStyleGuesses : [],
          cameraGuesses: Array.isArray(parsed.cameraGuesses) ? parsed.cameraGuesses : [],
          isYearSolved: Boolean(parsed.isYearSolved),
          isDevSolved: Boolean(parsed.isDevSolved),
          isGenreSolved: Boolean(parsed.isGenreSolved),
          isComposerSolved: Boolean(parsed.isComposerSolved),
          isArtStyleSolved: Boolean(parsed.isArtStyleSolved),
          isCameraSolved: Boolean(parsed.isCameraSolved),
          isCompleted: Boolean(parsed.isCompleted),
          isWon: Boolean(parsed.isWon),
          score: typeof parsed.score === 'number' ? parsed.score : 0,
        };
      }
    } catch {
      // Fallback
    }
    return {};
  }, [storageKey]);

  // Determine active categories: backward compatible with legacy saved games
  const activeCategories = useMemo<ProfilleCategory[]>(() => {
    if (savedState.activeCategories && savedState.activeCategories.length === 3) {
      return savedState.activeCategories;
    }
    // Legacy backward compatibility: if old state had year/dev/genre guesses
    if (
      (savedState.yearGuesses && savedState.yearGuesses.length > 0) ||
      (savedState.devGuesses && savedState.devGuesses.length > 0) ||
      (savedState.genreGuesses && savedState.genreGuesses.length > 0)
    ) {
      return ['year', 'developer', 'genres'];
    }
    return getDailyProfilleCategories(currentDate, secretGame);
  }, [savedState, currentDate, secretGame]);

  // Screenshot viewer state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Category 1: Year
  const [yearGuesses, setYearGuesses] = useState<number[]>(savedState.yearGuesses || []);
  const [inputYear, setInputYear] = useState<string>(() =>
    (savedState.yearGuesses && savedState.yearGuesses.length > 0)
      ? String(savedState.yearGuesses[savedState.yearGuesses.length - 1])
      : '2020'
  );
  const [isYearSolved, setIsYearSolved] = useState<boolean>(Boolean(savedState.isYearSolved));

  // Category 2: Developer
  const [devGuesses, setDevGuesses] = useState<string[]>(savedState.devGuesses || []);
  const [inputDev, setInputDev] = useState<string>('');
  const [devSuggestions, setDevSuggestions] = useState<string[]>([]);
  const [isDevDropdownOpen, setIsDevDropdownOpen] = useState<boolean>(false);
  const [isDevSolved, setIsDevSolved] = useState<boolean>(Boolean(savedState.isDevSolved));
  const devInputRef = useRef<HTMLInputElement>(null);

  // Category 3: Genres
  const [genreGuesses, setGenreGuesses] = useState<string[][]>(savedState.genreGuesses || []);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState<string>('');
  const [isGenreSolved, setIsGenreSolved] = useState<boolean>(Boolean(savedState.isGenreSolved));

  // Category 4: Composer
  const [composerGuesses, setComposerGuesses] = useState<string[]>(savedState.composerGuesses || []);
  const [inputComposer, setInputComposer] = useState<string>('');
  const [composerSuggestions, setComposerSuggestions] = useState<string[]>([]);
  const [isComposerDropdownOpen, setIsComposerDropdownOpen] = useState<boolean>(false);
  const [isComposerSolved, setIsComposerSolved] = useState<boolean>(Boolean(savedState.isComposerSolved));
  const composerInputRef = useRef<HTMLInputElement>(null);

  // Category 5: Art Style
  const [artStyleGuesses, setArtStyleGuesses] = useState<string[]>(savedState.artStyleGuesses || []);
  const [selectedArtStyle, setSelectedArtStyle] = useState<string>('');
  const [isArtStyleSolved, setIsArtStyleSolved] = useState<boolean>(Boolean(savedState.isArtStyleSolved));

  // Category 6: Camera
  const [cameraGuesses, setCameraGuesses] = useState<string[]>(savedState.cameraGuesses || []);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isCameraSolved, setIsCameraSolved] = useState<boolean>(Boolean(savedState.isCameraSolved));

  // Overall game state
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(savedState.isCompleted));
  const [isWon, setIsWon] = useState<boolean>(Boolean(savedState.isWon));
  const [score, setScore] = useState<number>(savedState.score || 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const MAX_ATTEMPTS = 3;

  const getCategoryStatus = useCallback(
    (cat: ProfilleCategory) => {
      switch (cat) {
        case 'year':
          return {
            solved: isYearSolved,
            exhausted: yearGuesses.length >= MAX_ATTEMPTS || isYearSolved,
            attempts: yearGuesses.length,
          };
        case 'developer':
          return {
            solved: isDevSolved,
            exhausted: devGuesses.length >= MAX_ATTEMPTS || isDevSolved,
            attempts: devGuesses.length,
          };
        case 'genres':
          return {
            solved: isGenreSolved,
            exhausted: genreGuesses.length >= MAX_ATTEMPTS || isGenreSolved,
            attempts: genreGuesses.length,
          };
        case 'composer':
          return {
            solved: isComposerSolved,
            exhausted: composerGuesses.length >= MAX_ATTEMPTS || isComposerSolved,
            attempts: composerGuesses.length,
          };
        case 'artStyle':
          return {
            solved: isArtStyleSolved,
            exhausted: artStyleGuesses.length >= MAX_ATTEMPTS || isArtStyleSolved,
            attempts: artStyleGuesses.length,
          };
        case 'camera':
          return {
            solved: isCameraSolved,
            exhausted: cameraGuesses.length >= MAX_ATTEMPTS || isCameraSolved,
            attempts: cameraGuesses.length,
          };
      }
    },
    [
      isYearSolved,
      yearGuesses.length,
      isDevSolved,
      devGuesses.length,
      isGenreSolved,
      genreGuesses.length,
      isComposerSolved,
      composerGuesses.length,
      isArtStyleSolved,
      artStyleGuesses.length,
      isCameraSolved,
      cameraGuesses.length,
    ]
  );

  // Persist state to local storage
  const persistState = useCallback(
    (patch: Partial<SavedProfilleState>) => {
      try {
        const stateToSave: SavedProfilleState = {
          activeCategories,
          yearGuesses,
          devGuesses,
          genreGuesses,
          composerGuesses,
          artStyleGuesses,
          cameraGuesses,
          isYearSolved,
          isDevSolved,
          isGenreSolved,
          isComposerSolved,
          isArtStyleSolved,
          isCameraSolved,
          isCompleted,
          isWon,
          score,
          ...patch,
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      } catch {
        // Ignore
      }
    },
    [
      activeCategories,
      yearGuesses,
      devGuesses,
      genreGuesses,
      composerGuesses,
      artStyleGuesses,
      cameraGuesses,
      isYearSolved,
      isDevSolved,
      isGenreSolved,
      isComposerSolved,
      isArtStyleSolved,
      isCameraSolved,
      isCompleted,
      isWon,
      score,
      storageKey,
    ]
  );

  // Check if whole game is finished
  useEffect(() => {
    if (isCompleted) return;

    const allExhausted = activeCategories.every((cat) => getCategoryStatus(cat).exhausted);

    if (allExhausted) {
      const finalScore = activeCategories.filter((cat) => getCategoryStatus(cat).solved).length;
      const won = finalScore >= 2;

      setIsCompleted(true);
      setIsWon(won);
      setScore(finalScore);

      persistState({
        isCompleted: true,
        isWon: won,
        score: finalScore,
      });

      // Stats recording
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
        categories: activeCategories.join(','),
      });
    }
  }, [
    activeCategories,
    getCategoryStatus,
    isCompleted,
    currentDate,
    persistState,
    recordGameResult,
    unlockAchievement,
  ]);

  // Dev autocomplete filtering
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

  // Composer autocomplete filtering
  const handleComposerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputComposer(val);
    if (!val.trim()) {
      setComposerSuggestions([]);
      setIsComposerDropdownOpen(false);
      return;
    }
    const filtered = allComposers
      .filter((c) => c.toLowerCase().includes(val.toLowerCase().trim()))
      .slice(0, 6);
    setComposerSuggestions(filtered);
    setIsComposerDropdownOpen(filtered.length > 0);
  };

  const handleSelectComposerSuggestion = (comp: string) => {
    soundFx.playClick();
    setInputComposer(comp);
    setComposerSuggestions([]);
    setIsComposerDropdownOpen(false);
    composerInputRef.current?.focus();
  };

  // --- SUBMISSION HANDLERS ---

  // 1. Submit Year
  const handleSubmitYear = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (getCategoryStatus('year').exhausted || isCompleted) return;

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
    if (getCategoryStatus('developer').exhausted || isCompleted) return;

    const trimmed = inputDev.trim();
    if (!trimmed) return;
    if (devGuesses.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return;

    soundFx.playClick();
    const newGuesses = [...devGuesses, trimmed];
    setDevGuesses(newGuesses);
    setInputDev('');
    setIsDevDropdownOpen(false);

    const isMatch = isStudioMatch(trimmed, secretGame.developer);

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
    if (getCategoryStatus('genres').exhausted || isCompleted) return;
    soundFx.playClick();
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length >= 3) return;
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmitGenre = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (getCategoryStatus('genres').exhausted || isCompleted || selectedGenres.length === 0) return;

    soundFx.playClick();
    const newGuesses = [...genreGuesses, selectedGenres];
    setGenreGuesses(newGuesses);

    const matchedCount = selectedGenres.filter((g) =>
      checkGenreMatch(g, secretGame.genre)
    ).length;

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

  // 4. Submit Composer
  const handleSubmitComposer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (getCategoryStatus('composer').exhausted || isCompleted) return;

    const trimmed = inputComposer.trim();
    if (!trimmed) return;
    if (composerGuesses.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;

    soundFx.playClick();
    const newGuesses = [...composerGuesses, trimmed];
    setComposerGuesses(newGuesses);
    setInputComposer('');
    setIsComposerDropdownOpen(false);

    const isMatch = isComposerMatch(trimmed, secretGame.hints?.composer);

    if (isMatch) {
      setIsComposerSolved(true);
      soundFx.playChime();
      persistState({ composerGuesses: newGuesses, isComposerSolved: true });
    } else {
      soundFx.playError();
      persistState({ composerGuesses: newGuesses });
    }
  };

  // 5. Submit Art Style
  const handleSubmitArtStyle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (getCategoryStatus('artStyle').exhausted || isCompleted || !selectedArtStyle) return;

    if (artStyleGuesses.includes(selectedArtStyle)) return;

    soundFx.playClick();
    const newGuesses = [...artStyleGuesses, selectedArtStyle];
    setArtStyleGuesses(newGuesses);

    const isMatch = isArtStyleMatch(selectedArtStyle, secretGame.artStyle);

    if (isMatch) {
      setIsArtStyleSolved(true);
      soundFx.playChime();
      persistState({ artStyleGuesses: newGuesses, isArtStyleSolved: true });
    } else {
      soundFx.playError();
      persistState({ artStyleGuesses: newGuesses });
    }
    setSelectedArtStyle('');
  };

  // 6. Submit Camera
  const handleSubmitCamera = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (getCategoryStatus('camera').exhausted || isCompleted || !selectedCamera) return;

    if (cameraGuesses.includes(selectedCamera)) return;

    soundFx.playClick();
    const newGuesses = [...cameraGuesses, selectedCamera];
    setCameraGuesses(newGuesses);

    const isMatch = isCameraMatch(selectedCamera, secretGame.camera);

    if (isMatch) {
      setIsCameraSolved(true);
      soundFx.playChime();
      persistState({ cameraGuesses: newGuesses, isCameraSolved: true });
    } else {
      soundFx.playError();
      persistState({ cameraGuesses: newGuesses });
    }
    setSelectedCamera('');
  };

  // Category labels helper
  const getCategoryTitle = useCallback(
    (cat: ProfilleCategory): string => {
      switch (cat) {
        case 'year':
          return t('profille.releaseYear');
        case 'developer':
          return t('profille.developer');
        case 'genres':
          return t('profille.genre');
        case 'composer':
          return t('profille.composer');
        case 'artStyle':
          return t('profille.artStyle');
        case 'camera':
          return t('profille.camera');
      }
    },
    [t]
  );

  // Share text generation (dynamic across the 3 active categories)
  const handleShare = () => {
    soundFx.playClick();

    const categoryLines = activeCategories.map((cat) => {
      const st = getCategoryStatus(cat);
      const title = getCategoryTitle(cat);
      const statusText = st.solved ? `Succès (${st.attempts}/3)` : `Échec`;
      return `${title} : ${statusText}`;
    });

    const text = `Hoot Indie Games — Profille #${currentDate}
Dossier : ${isCompleted ? secretGame.title : '???'}
${categoryLines.join('\n')}
Score : ${score}/3 étoiles
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
    const q = genreSearch.toLowerCase().trim();
    return allGenres.filter(
      (g) =>
        g.toLowerCase().includes(q) ||
        getTranslatedGenre(g, i18n.language).toLowerCase().includes(q)
    );
  }, [allGenres, genreSearch, i18n.language]);

  // --- RENDER CATEGORY CARD ---
  const renderCategoryCard = (cat: ProfilleCategory) => {
    const status = getCategoryStatus(cat);

    switch (cat) {
      // 1. ANNÉE DE SORTIE
      case 'year':
        return (
          <div
            key="year"
            className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{t('profille.releaseYear')}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {status.solved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                    </span>
                  ) : (
                    `${yearGuesses.length}/${MAX_ATTEMPTS}`
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{t('profille.deduceYear')}</p>

              {/* Year History */}
              <div className="space-y-1.5 mb-3 min-h-[70px]">
                {yearGuesses.map((y, idx) => {
                  const isMatch = y === secretGame.releaseYear;
                  const isHigher = y < secretGame.releaseYear;

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
                          <span>{t('profille.exact')}</span>
                        </span>
                      ) : isHigher ? (
                        <span className="flex items-center gap-1 text-amber-300 text-[11px]">
                          <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('profille.newer')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-cyan-300 text-[11px]">
                          <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t('profille.older')}</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {!status.solved && yearGuesses.length >= MAX_ATTEMPTS && (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                    <span>{t('profille.answer')}</span>
                    <span className="font-mono">{secretGame.releaseYear}</span>
                  </div>
                )}
              </div>
            </div>

            {!status.exhausted ? (
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
                  {t('profille.submitYear')}
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
                {status.solved ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('profille.pointSolved')}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{t('profille.attemptsEnded')}</span>
                )}
              </div>
            )}
          </div>
        );

      // 2. DÉVELOPPEUR / STUDIO
      case 'developer':
        return (
          <div
            key="developer"
            className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md relative"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>{t('profille.developer')}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {status.solved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                    </span>
                  ) : (
                    `${devGuesses.length}/${MAX_ATTEMPTS}`
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{t('profille.deduceDev')}</p>

              {/* Dev History */}
              <div className="space-y-1.5 mb-3 min-h-[70px]">
                {devGuesses.map((d, idx) => {
                  const isMatch = isStudioMatch(d, secretGame.developer);

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
                          <span>{t('profille.exact')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] shrink-0">
                          <X className="w-3 h-3" />
                          <span>{t('profille.wrong')}</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {!status.solved && devGuesses.length >= MAX_ATTEMPTS && (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                    <span>{t('profille.answer')}</span>
                    <span className="truncate ml-1">{secretGame.developer}</span>
                  </div>
                )}
              </div>
            </div>

            {!status.exhausted ? (
              <form onSubmit={handleSubmitDev} className="space-y-2 pt-2 border-t border-[#1e293b] relative">
                <div className="relative">
                  <input
                    ref={devInputRef}
                    type="text"
                    value={inputDev}
                    onChange={handleDevInputChange}
                    onFocus={() => {
                      if (inputDev.trim().length > 0) setIsDevDropdownOpen(true);
                    }}
                    placeholder={t('profille.studioPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />

                  {isDevDropdownOpen && devSuggestions.length > 0 && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#0d131f] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 max-h-40 overflow-y-auto">
                      {devSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleSelectDevSuggestion(sug)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition truncate cursor-pointer"
                        >
                          {sug}
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
                  {t('profille.submitStudio')}
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
                {status.solved ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('profille.pointSolved')}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{t('profille.attemptsEnded')}</span>
                )}
              </div>
            )}
          </div>
        );

      // 3. GENRES & MÉCANIQUES CLÉS
      case 'genres':
        return (
          <div
            key="genres"
            className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" />
                  <span>{t('profille.genre')}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {status.solved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                    </span>
                  ) : (
                    `${genreGuesses.length}/${MAX_ATTEMPTS}`
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{t('profille.deduceGenre')}</p>

              {/* Genre History */}
              <div className="space-y-1.5 mb-3 min-h-[70px]">
                {genreGuesses.map((guessGroup, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    {guessGroup.map((g) => {
                      const isMatch = checkGenreMatch(g, secretGame.genre);
                      return (
                        <span
                          key={g}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            isMatch
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <span>{getTranslatedGenre(g, i18n.language)}</span>
                          {isMatch ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        </span>
                      );
                    })}
                  </div>
                ))}

                {!status.solved && genreGuesses.length >= MAX_ATTEMPTS && (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    <div className="text-[10px] text-rose-300/80 mb-0.5">
                      {t('profille.officialGenres')}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {secretGame.genre.map((g: string) => (
                        <span
                          key={g}
                          className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[10px] font-bold"
                        >
                          {getTranslatedGenre(g, i18n.language)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!status.exhausted ? (
              <div className="pt-2 border-t border-[#1e293b] space-y-2">
                <input
                  type="text"
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                  placeholder={t('profille.filterGenre')}
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
                        {getTranslatedGenre(genre, i18n.language)}
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
                  {t('profille.submitGenres', { count: selectedGenres.length })}
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
                {status.solved ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('profille.pointSolved')}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{t('profille.attemptsEnded')}</span>
                )}
              </div>
            )}
          </div>
        );

      // 4. COMPOSITEUR / BANDE ORIGINALE
      case 'composer':
        return (
          <div
            key="composer"
            className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md relative"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>{t('profille.composer')}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {status.solved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                    </span>
                  ) : (
                    `${composerGuesses.length}/${MAX_ATTEMPTS}`
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{t('profille.deduceComposer')}</p>

              {/* Composer History */}
              <div className="space-y-1.5 mb-3 min-h-[70px]">
                {composerGuesses.map((c, idx) => {
                  const isMatch = isComposerMatch(c, secretGame.hints?.composer);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                        isMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate max-w-[150px]">{c}</span>
                      {isMatch ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px] shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('profille.exact')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] shrink-0">
                          <X className="w-3 h-3" />
                          <span>{t('profille.wrong')}</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Progressive hint on attempt 2 & 3 */}
                {!status.solved && composerGuesses.length >= 1 && composerGuesses.length < MAX_ATTEMPTS && secretGame.hints?.composer && (
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px]">
                    {t('profille.composerClue', {
                      letter: secretGame.hints.composer.charAt(0).toUpperCase(),
                      len: secretGame.hints.composer.length,
                    })}
                  </div>
                )}

                {!status.solved && composerGuesses.length >= MAX_ATTEMPTS && (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                    <span>{t('profille.answer')}</span>
                    <span className="truncate ml-1">{secretGame.hints?.composer || '—'}</span>
                  </div>
                )}
              </div>
            </div>

            {!status.exhausted ? (
              <form onSubmit={handleSubmitComposer} className="space-y-2 pt-2 border-t border-[#1e293b] relative">
                <div className="relative">
                  <input
                    ref={composerInputRef}
                    type="text"
                    value={inputComposer}
                    onChange={handleComposerInputChange}
                    onFocus={() => {
                      if (inputComposer.trim().length > 0) setIsComposerDropdownOpen(true);
                    }}
                    placeholder={t('profille.composerPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />

                  {isComposerDropdownOpen && composerSuggestions.length > 0 && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#0d131f] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 max-h-40 overflow-y-auto">
                      {composerSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleSelectComposerSuggestion(sug)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition truncate cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputComposer.trim()}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
                >
                  {t('profille.submitComposer')}
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
                {status.solved ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('profille.pointSolved')}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{t('profille.attemptsEnded')}</span>
                )}
              </div>
            )}
          </div>
        );

      // 5. STYLE VISUEL / DIRECTION ARTISTIQUE
      case 'artStyle':
        return (
          <div
            key="artStyle"
            className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>{t('profille.artStyle')}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {status.solved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                    </span>
                  ) : (
                    `${artStyleGuesses.length}/${MAX_ATTEMPTS}`
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{t('profille.deduceArtStyle')}</p>

              {/* Art Style History */}
              <div className="space-y-1.5 mb-3 min-h-[70px]">
                {artStyleGuesses.map((s, idx) => {
                  const isMatch = isArtStyleMatch(s, secretGame.artStyle);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                        isMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate max-w-[150px]">
                        {getTranslatedArtStyle({ fr: s, en: s }, i18n.language)}
                      </span>
                      {isMatch ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px] shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('profille.exact')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] shrink-0">
                          <X className="w-3 h-3" />
                          <span>{t('profille.wrong')}</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {!status.solved && artStyleGuesses.length >= MAX_ATTEMPTS && (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                    <span>{t('profille.answer')}</span>
                    <span className="truncate ml-1">
                      {getTranslatedArtStyle(secretGame.artStyle, i18n.language)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!status.exhausted ? (
              <form onSubmit={handleSubmitArtStyle} className="space-y-2 pt-2 border-t border-[#1e293b]">
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto no-scrollbar p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  {CANONICAL_ART_STYLES.map((opt) => {
                    const isSelected = selectedArtStyle === opt.labelFr;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedArtStyle(opt.labelFr);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {getTranslatedArtStyle({ fr: opt.labelFr, en: opt.labelEn }, i18n.language)}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={!selectedArtStyle}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
                >
                  {t('profille.submitArtStyle')}
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
                {status.solved ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('profille.pointSolved')}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{t('profille.attemptsEnded')}</span>
                )}
              </div>
            )}
          </div>
        );

      // 6. PERSPECTIVE & ANGLE DE CAMÉRA
      case 'camera':
        return (
          <div
            key="camera"
            className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>{t('profille.camera')}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {status.solved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1/1
                    </span>
                  ) : (
                    `${cameraGuesses.length}/${MAX_ATTEMPTS}`
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{t('profille.deduceCamera')}</p>

              {/* Camera History */}
              <div className="space-y-1.5 mb-3 min-h-[70px]">
                {cameraGuesses.map((c, idx) => {
                  const isMatch = isCameraMatch(c, secretGame.camera);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                        isMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate max-w-[150px]">
                        {getTranslatedCamera({ fr: c, en: c }, i18n.language)}
                      </span>
                      {isMatch ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px] shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('profille.exact')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] shrink-0">
                          <X className="w-3 h-3" />
                          <span>{t('profille.wrong')}</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {!status.solved && cameraGuesses.length >= MAX_ATTEMPTS && (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
                    <span>{t('profille.answer')}</span>
                    <span className="truncate ml-1">
                      {getTranslatedCamera(secretGame.camera, i18n.language)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!status.exhausted ? (
              <form onSubmit={handleSubmitCamera} className="space-y-2 pt-2 border-t border-[#1e293b]">
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto no-scrollbar p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  {CANONICAL_CAMERAS.map((opt) => {
                    const isSelected = selectedCamera === opt.labelFr;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedCamera(opt.labelFr);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {getTranslatedCamera({ fr: opt.labelFr, en: opt.labelEn }, i18n.language)}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={!selectedCamera}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
                >
                  {t('profille.submitCamera')}
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-[#1e293b] text-center text-xs font-bold text-slate-400">
                {status.solved ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('profille.pointSolved')}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{t('profille.attemptsEnded')}</span>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Game Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
          <FileSearch className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('profille.gameIdCard')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center justify-center gap-2">
          <span>{t('profille.title')}</span>
          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {t('profille.indieFile')}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
          {t('profille.headerSubtitle')}
        </p>
      </div>

      {/* Secret Game Title Banner */}
      <div className="relative overflow-visible mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#06241b] via-[#093a2b] to-[#06241b] border-2 border-[#78350f] shadow-xl text-center">
        <SylvestreIvyFrame density="delicate" />
        <div className="relative z-10">
          <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('profille.investigationFile')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {secretGame.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {t('profille.bannerSubtitle')}
          </p>

          {/* Dynamic 3 Daily Categories Pills */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {t('profille.todayCategories')}
            </span>
            {activeCategories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-emerald-300 text-xs font-bold"
              >
                {getCategoryTitle(cat)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshots Gallery Card */}
      <div className="bg-[#131a29] rounded-2xl border border-[#1e293b] p-4 sm:p-5 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('profille.officialScreenshots', {
              current: activeImageIndex + 1,
              total: secretGame.screenshots.length,
            })}
          </div>
          <button
            onClick={() => setIsZoomModalOpen(true)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{t('profille.enlarge')}</span>
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-[#1e293b] group">
          <img
            src={secretGame.screenshots[activeImageIndex] || secretGame.screenshots[0]}
            alt={`${secretGame.title} screenshot ${activeImageIndex + 1}`}
            onError={(e) => {
              const target = e.currentTarget;
              const match = secretGame.steamUrl?.match(/app\/(\d+)/);
              const appId = match ? match[1] : '';
              const fallbackHeader = appId
                ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`
                : '';
              const alt = secretGame.screenshots.find((s: string) => s !== target.src) || fallbackHeader;
              if (alt && target.src !== alt) {
                target.src = alt;
              }
            }}
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
          {secretGame.screenshots.map((src: string, idx: number) => (
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
                onError={(e) => {
                  const target = e.currentTarget;
                  const match = secretGame.steamUrl?.match(/app\/(\d+)/);
                  const appId = match ? match[1] : '';
                  const fallbackHeader = appId
                    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`
                    : '';
                  if (fallbackHeader && target.src !== fallbackHeader) {
                    target.src = fallbackHeader;
                  }
                }}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Streak Notice Banner */}
      <StreakNoticeBanner
        mode="profille"
        currentDate={currentDate}
        isWon={isWon}
        onSelectDate={onSelectDate}
      />

      {/* 3 Deduction Cards Grid (Dynamic Daily Rotation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {activeCategories.map((cat) => renderCategoryCard(cat))}
      </div>

      {/* SUMMARY DOSSIER CLOTURE (When Game Completed) */}
      {isCompleted && (
        <div className="relative overflow-visible mb-8 p-5 sm:p-6 rounded-2xl bg-[#06241b] border-2 border-[#78350f] shadow-2xl animate-in fade-in zoom-in-95 duration-400">
          <SylvestreIvyFrame density="medium" />
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-black text-white flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>
                    {score === 3
                      ? t('profille.perfectInvestigation')
                      : score >= 2
                      ? t('profille.greatDeduction')
                      : t('profille.caseClosed')}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                  {score}/3
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {t('profille.summaryIdentified', {
                  score,
                  title: secretGame.title,
                })}
              </p>
            </div>

            {/* Action Buttons: Share & Steam */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? t('common.copied') : t('common.share')}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('common.downloadCard')}</span>
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
                {t('profille.releaseYear')}
              </div>
              <div className="text-white font-mono font-black text-sm mt-0.5">
                {secretGame.releaseYear}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {t('profille.developer')}
              </div>
              <div className="text-white font-bold text-sm mt-0.5 truncate">
                {secretGame.developer}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {t('profille.artStyle')}
              </div>
              <div className="text-white font-bold text-sm mt-0.5 truncate">
                {getTranslatedArtStyle(secretGame.artStyle, i18n.language)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                {t('profille.camera')}
              </div>
              <div className="text-white font-bold text-sm mt-0.5 truncate">
                {getTranslatedCamera(secretGame.camera, i18n.language)}
              </div>
            </div>
          </div>

          {secretGame.hints?.composer && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400 font-bold">{t('profille.composer')}</span>
              <span className="text-amber-300 font-bold">{secretGame.hints.composer}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold mr-1">
              {t('profille.officialGenres')}
            </span>
            {secretGame.genre.map((g: string) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold"
              >
                {getTranslatedGenre(g, i18n.language)}
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

      {/* Full-Screen Zoom Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={secretGame.screenshots[activeImageIndex] || secretGame.screenshots[0]}
              alt={`${secretGame.title} zoom`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) =>
                  prev === 0 ? secretGame.screenshots.length - 1 : prev - 1
                );
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm transition cursor-pointer"
            >
              {t('common.previous')}
            </button>
            <span className="text-xs text-slate-300 font-mono">
              {activeImageIndex + 1} / {secretGame.screenshots.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) =>
                  prev === secretGame.screenshots.length - 1 ? 0 : prev + 1
                );
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm transition cursor-pointer"
            >
              {t('common.next')}
            </button>
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer ml-2"
            >
              {t('common.close')}
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
          scoreText: `${score}/3 (${isWon ? t('common.won') : t('common.lost')})`,
          details: [
            ...activeCategories.map((cat) => {
              const st = getCategoryStatus(cat);
              const title = getCategoryTitle(cat);
              const label = st.solved ? t('profille.exact') : t('profille.notFound');
              return `${title} : ${label} (${st.attempts}/3)`;
            }),
            `${t('profille.finalScore')} ${score}/3`,
          ],
        }}
      />
    </div>
  );
};
