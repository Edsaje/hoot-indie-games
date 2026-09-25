import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Share2,
  CheckCircle2,
  XCircle,
  Download,
  Zap,
  Calendar,
  Palette,
  Eye,
  User,
  Tag,
  Sparkles,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { INDIE_GAMES, getDailyGame } from '../../data/games';
import { GameSearchBar, type ClueBadge } from '../common/GameSearchBar';
import { DifficultySelector, type GameDifficulty } from '../common/DifficultySelector';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { downloadShareCard, type ShareCardData } from '../../utils/generateShareCard';
import { ShareResultModal } from '../common/ShareResultModal';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { telemetry } from '../../services/telemetry';
import { getTranslatedGenre, getTranslatedArtStyle, getTranslatedCamera } from '../../utils/localization';

interface IndledleGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

export const IndledleGame: React.FC<IndledleGameProps> = ({ currentDate, onSelectDate }) => {
  const { t, i18n } = useTranslation();
  const { recordGameResult } = useGameStats();
  const { isGameOwned } = useUserAccount();
  const { allPlayableGames } = useSteamCatalog();

  const storageKey = `indledle_state_${currentDate}`;

  // Récupération de l'état sauvegardé avec restauration complète du jeu secret et des essais
  const savedState = (() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = (parsed.guessIds || [])
          .map((id: string) => allPlayableGames.find((g) => g.id === id) || INDIE_GAMES.find((g) => g.id === id))
          .filter(Boolean) as Game[];
        return {
          guesses: restored,
          isCompleted: Boolean(parsed.isCompleted),
          isWon: Boolean(parsed.isWon),
          savedSecretGameId: parsed.secretGameId as string | undefined,
        };
      }
    } catch {
      // Fallback
    }
    return { guesses: [] as Game[], isCompleted: false, isWon: false, savedSecretGameId: undefined };
  })();

  // Jeu secret du jour : pioché de manière déterministe et immuable dans INDIE_GAMES ou verrouillé si déjà commencé
  const secretGame = useMemo(() => {
    if (savedState.savedSecretGameId) {
      const lockedGame =
        allPlayableGames.find((g) => g.id === savedState.savedSecretGameId) ||
        INDIE_GAMES.find((g) => g.id === savedState.savedSecretGameId);
      if (lockedGame) return lockedGame;
    }
    return getDailyGame(currentDate, 3);
  }, [currentDate, allPlayableGames, savedState.savedSecretGameId]);

  const { unlockAchievement } = useAchievements();
  const [guesses, setGuesses] = useState<Game[]>(savedState.guesses);
  const [isCompleted, setIsCompleted] = useState<boolean>(savedState.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(savedState.isWon);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [difficulty, setDifficulty] = useState<GameDifficulty>(() => {
    return (localStorage.getItem('indledle_difficulty') as GameDifficulty) || 'standard';
  });

  const [adaptiveCluesEnabled, setAdaptiveCluesEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('indledle_adaptive_clues');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleAdaptiveClues = () => {
    soundFx.playClick();
    setAdaptiveCluesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('indledle_adaptive_clues', String(next));
      } catch {
        // Ignorer
      }
      return next;
    });
  };

  // Max attempts: Novice (8), Standard (6), Expert (4)
  const MAX_GUESSES = difficulty === 'novice' ? 8 : difficulty === 'expert' ? 4 : 6;

  const saveGameState = (newGuesses: Game[], completed: boolean, won: boolean) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: currentDate,
          secretGameId: secretGame.id,
          guessIds: newGuesses.map((g) => g.id),
          isCompleted: completed,
          isWon: won,
        })
      );
    } catch {
      // Ignore
    }
  };

  const checkDailyTrifecta = () => {
    try {
      const s1 = localStorage.getItem(`screenle_state_${currentDate}`);
      const s2 = localStorage.getItem(`linkle_state_${currentDate}`);
      if (s1 && s2) {
        const p1 = JSON.parse(s1);
        const p2 = JSON.parse(s2);
        if (p1.isWon && p2.isWon) {
          unlockAchievement('daily_trifecta');
        }
      }
    } catch {
      // Ignore
    }
  };

  // Suivi télémétrie cookieless au lancement (sans spoiler de titre en clair dans l'onglet Réseau)
  useEffect(() => {
    telemetry.track('game', 'indledle_play', `session_${currentDate}`, undefined, {
      date: currentDate,
      alreadyCompleted: isCompleted,
      difficulty,
    });
  }, [currentDate, isCompleted, difficulty]);

  const handleGuess = (guessedGame: Game) => {
    if (isCompleted || guesses.some((g) => g.id === guessedGame.id)) return;

    const newGuesses = [guessedGame, ...guesses]; // Most recent on top
    setGuesses(newGuesses);

    if (guessedGame.id === secretGame.id) {
      setIsWon(true);
      setIsCompleted(true);
      saveGameState(newGuesses, true, true);
      recordGameResult('indledle', currentDate, true, newGuesses.length);
      unlockAchievement('first_flight');
      if (newGuesses.length <= 4) {
        unlockAchievement('archive_master');
      }
      checkDailyTrifecta();
      soundFx.playVictory();
      telemetry.track('game', 'indledle_win', secretGame.title, newGuesses.length, {
        attempts: newGuesses.length,
        game: secretGame.title,
      });
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'],
      });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setIsWon(false);
      setIsCompleted(true);
      saveGameState(newGuesses, true, false);
      recordGameResult('indledle', currentDate, false, MAX_GUESSES);
      unlockAchievement('first_flight');
      soundFx.playError();
      telemetry.track('game', 'indledle_loss', secretGame.title, MAX_GUESSES, {
        attempts: MAX_GUESSES,
        game: secretGame.title,
      });
    } else {
      saveGameState(newGuesses, false, false);
      soundFx.playClick();
      telemetry.track('interaction', 'indledle_guess', guessedGame.title, newGuesses.length);
    }
  };

  const handleDownloadCard = async () => {
    soundFx.playClick();
    setIsDownloadingImage(true);
    try {
      const rows = guesses
        .slice()
        .reverse()
        .slice(0, 4)
        .map((g) => {
          const yearEmoji =
            g.releaseYear === secretGame.releaseYear
              ? '🟩'
              : g.releaseYear < secretGame.releaseYear
              ? '⬆️'
              : '⬇️';
          const genresOverlap = g.genre.filter((gen) =>
            secretGame.genre.includes(gen)
          );
          const genreEmoji =
            genresOverlap.length === secretGame.genre.length &&
            g.genre.length === secretGame.genre.length
              ? '🟩'
              : genresOverlap.length > 0
              ? '🟨'
              : '🟥';
          const artEmoji = g.artStyle.en === secretGame.artStyle.en ? '🟩' : '🟥';
          const camEmoji = g.camera.en === secretGame.camera.en ? '🟩' : '🟥';
          return `${g.title}: ${yearEmoji} ${genreEmoji} ${artEmoji} ${camEmoji}`;
        });

      await downloadShareCard({
        gameMode: t('indledle.title'),
        date: currentDate,
        isWon,
        scoreText: isWon ? `${guesses.length}/8 essais` : 'Défi non résolu',
        details: rows.length > 0 ? rows : ['Défi terminé'],
      });
      soundFx.playChime();
    } catch {
      // Ignore
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const shareData: ShareCardData = useMemo(() => {
    const rows = guesses
      .slice()
      .reverse()
      .map((g) => {
        const yearEmoji = g.releaseYear === secretGame.releaseYear ? '🟩' : g.releaseYear < secretGame.releaseYear ? '⬆️' : '⬇️';
        const genresOverlap = g.genre.filter((gen) => secretGame.genre.includes(gen));
        const genreEmoji =
          genresOverlap.length === secretGame.genre.length && g.genre.length === secretGame.genre.length
            ? '🟩'
            : genresOverlap.length > 0
            ? '🟨'
            : '🟥';
        const artEmoji = g.artStyle.en === secretGame.artStyle.en ? '🟩' : '🟥';
        const camEmoji = g.camera.en === secretGame.camera.en ? '🟩' : '🟥';
        const devEmoji = g.developer === secretGame.developer ? '🟩' : '🟥';
        return `${yearEmoji}${genreEmoji}${artEmoji}${camEmoji}${devEmoji}`;
      });

    return {
      gameMode: t('indledle.title'),
      date: currentDate,
      isWon,
      scoreText: isWon ? `${guesses.length}/${MAX_GUESSES} Essais` : `Échec (${MAX_GUESSES} essais)`,
      details: rows.length > 0 ? rows.slice(0, 4) : ['Défi terminé'],
    };
  }, [currentDate, isWon, guesses, secretGame, MAX_GUESSES, t]);

  const handleShare = () => {
    soundFx.playClick();
    setIsShareModalOpen(true);
  };

  // Deduction of clues discovered through guesses
  const { candidateGames, activeClues } = useMemo(() => {
    if (guesses.length === 0) {
      return {
        candidateGames: allPlayableGames,
        activeClues: [] as ClueBadge[],
      };
    }

    let exactYear: number | undefined = undefined;
    let minYear: number | undefined = undefined;
    let maxYear: number | undefined = undefined;
    let exactArtStyle: string | undefined = undefined;
    const eliminatedArtStyles = new Set<string>();
    let exactCamera: string | undefined = undefined;
    const eliminatedCameras = new Set<string>();
    let exactDev: string | undefined = undefined;
    const eliminatedDevs = new Set<string>();
    let exactGenres: string[] | undefined = undefined;
    const forbiddenGenres = new Set<string>();
    const partialGenreSets: string[][] = [];

    for (const guess of guesses) {
      // 1. Release Year
      if (guess.releaseYear === secretGame.releaseYear) {
        exactYear = secretGame.releaseYear;
      } else if (secretGame.releaseYear > guess.releaseYear) {
        const bound = guess.releaseYear + 1;
        minYear = minYear !== undefined ? Math.max(minYear, bound) : bound;
      } else {
        const bound = guess.releaseYear - 1;
        maxYear = maxYear !== undefined ? Math.min(maxYear, bound) : bound;
      }

      if (difficulty === 'novice' && Math.abs(guess.releaseYear - secretGame.releaseYear) <= 2) {
        const nMin = guess.releaseYear - 2;
        const nMax = guess.releaseYear + 2;
        minYear = minYear !== undefined ? Math.max(minYear, nMin) : nMin;
        maxYear = maxYear !== undefined ? Math.min(maxYear, nMax) : nMax;
      }

      // 2. Art Style
      if (guess.artStyle.en === secretGame.artStyle.en) {
        exactArtStyle = secretGame.artStyle.en;
      } else {
        eliminatedArtStyles.add(guess.artStyle.en);
      }

      // 3. Camera
      if (guess.camera.en === secretGame.camera.en) {
        exactCamera = secretGame.camera.en;
      } else {
        eliminatedCameras.add(guess.camera.en);
      }

      // 4. Developer
      if (guess.developer === secretGame.developer) {
        exactDev = secretGame.developer;
      } else {
        eliminatedDevs.add(guess.developer);
      }

      // 5. Genres
      const common = guess.genre.filter((g) => secretGame.genre.includes(g));
      const isExact =
        common.length === secretGame.genre.length &&
        guess.genre.length === secretGame.genre.length;

      if (isExact) {
        exactGenres = guess.genre;
      } else if (common.length === 0) {
        guess.genre.forEach((g) => forbiddenGenres.add(g));
      } else {
        partialGenreSets.push(guess.genre);
      }
    }

    if (exactYear !== undefined) {
      minYear = undefined;
      maxYear = undefined;
    }

    // Filter candidate games matching all discovered constraints
    const candidates = allPlayableGames.filter((game) => {
      // Exclude already guessed
      if (guesses.some((g) => g.id === game.id)) return false;

      // Year
      if (exactYear !== undefined) {
        if (game.releaseYear !== exactYear) return false;
      } else {
        if (minYear !== undefined && game.releaseYear < minYear) return false;
        if (maxYear !== undefined && game.releaseYear > maxYear) return false;
      }

      // Art Style
      if (exactArtStyle !== undefined) {
        if (game.artStyle.en !== exactArtStyle) return false;
      } else if (eliminatedArtStyles.has(game.artStyle.en)) {
        return false;
      }

      // Camera
      if (exactCamera !== undefined) {
        if (game.camera.en !== exactCamera) return false;
      } else if (eliminatedCameras.has(game.camera.en)) {
        return false;
      }

      // Developer
      if (exactDev !== undefined) {
        if (game.developer !== exactDev) return false;
      } else if (eliminatedDevs.has(game.developer)) {
        return false;
      }

      // Forbidden genres
      if (game.genre.some((g) => forbiddenGenres.has(g))) {
        return false;
      }

      // Exact genres
      if (exactGenres !== undefined) {
        if (game.genre.length !== exactGenres.length) return false;
        if (!game.genre.every((g) => exactGenres!.includes(g))) return false;
      }

      // Partial genre sets (game must share at least 1 genre with each yellow guess)
      for (const set of partialGenreSets) {
        if (!game.genre.some((g) => set.includes(g))) {
          return false;
        }
      }

      return true;
    });

    // Generate active clue badges for display
    const badges: ClueBadge[] = [];

    // Year
    if (exactYear !== undefined) {
      badges.push({
        id: 'year',
        icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" />,
        label: `${exactYear}`,
        type: 'success',
      });
    } else if (minYear !== undefined && maxYear !== undefined) {
      badges.push({
        id: 'year',
        icon: <Calendar className="w-3.5 h-3.5 text-amber-400" />,
        label: `${minYear} - ${maxYear}`,
        type: 'info',
      });
    } else if (minYear !== undefined) {
      badges.push({
        id: 'year',
        icon: <ArrowUp className="w-3.5 h-3.5 text-amber-400" />,
        label: `≥ ${minYear}`,
        type: 'info',
      });
    } else if (maxYear !== undefined) {
      badges.push({
        id: 'year',
        icon: <ArrowDown className="w-3.5 h-3.5 text-amber-400" />,
        label: `≤ ${maxYear}`,
        type: 'info',
      });
    }

    // Art Style
    if (exactArtStyle !== undefined) {
      badges.push({
        id: 'art',
        icon: <Palette className="w-3.5 h-3.5 text-emerald-400" />,
        label: getTranslatedArtStyle(secretGame.artStyle, i18n.language) || exactArtStyle,
        type: 'success',
      });
    }

    // Camera
    if (exactCamera !== undefined) {
      badges.push({
        id: 'camera',
        icon: <Eye className="w-3.5 h-3.5 text-emerald-400" />,
        label: getTranslatedCamera(secretGame.camera, i18n.language) || exactCamera,
        type: 'success',
      });
    }

    // Developer
    if (exactDev !== undefined) {
      badges.push({
        id: 'dev',
        icon: <User className="w-3.5 h-3.5 text-emerald-400" />,
        label: exactDev,
        type: 'success',
      });
    }

    // Exact Genres
    if (exactGenres !== undefined) {
      badges.push({
        id: 'genres',
        icon: <Tag className="w-3.5 h-3.5 text-emerald-400" />,
        label: exactGenres.slice(0, 2).join(', '),
        type: 'success',
      });
    }

    return {
      candidateGames: candidates,
      activeClues: badges,
    };
  }, [guesses, secretGame, difficulty, allPlayableGames, i18n.language]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-36 sm:pb-48 min-h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5" />
          Mode 2 • Comparaison de Traits
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t('indledle.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          {t('indledle.subtitle')}
        </p>
      </div>

      {/* Difficulty Selector */}
      <DifficultySelector
        difficulty={difficulty}
        onSelect={(d) => {
          setDifficulty(d);
          localStorage.setItem('indledle_difficulty', d);
        }}
        disabled={isCompleted || guesses.length > 0}
      />

      {/* Color Legend */}
      <div className="relative overflow-visible max-w-2xl mx-auto bg-[#06241b] border-2 border-[#78350f] rounded-2xl p-3 mb-6 flex flex-wrap items-center justify-around gap-2 text-xs">
        <SylvestreIvyFrame density="delicate" />
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#10b981]" />
          <span className="text-slate-300 font-medium">{t('indledle.legendGreen')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#eab308]" />
          <span className="text-slate-300 font-medium">{t('indledle.legendYellow')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#ef4444]" />
          <span className="text-slate-300 font-medium">{t('indledle.legendRed')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-4 h-4 rounded bg-slate-800 text-[#f59e0b] font-bold">
            <ArrowUp className="w-3 h-3" />
          </span>
          <span className="text-slate-300">{t('indledle.higher')}</span>
        </div>
      </div>

      {/* Search Input or Completion Banner */}
      {!isCompleted ? (
        <div className="mb-8">
          {/* Contrôle Mode Adaptatif (Indices actifs) vs Puriste (Catalogue libre) */}
          {guesses.length > 0 && (
            <div className="flex items-center justify-between gap-2 max-w-xl mx-auto mb-2 px-1">
              <button
                type="button"
                onClick={toggleAdaptiveClues}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border shadow-sm ${
                  adaptiveCluesEnabled
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title={
                  adaptiveCluesEnabled
                    ? 'Mode Adaptatif : les suggestions de recherche sont restreintes aux jeux compatibles avec vos indices déduits'
                    : 'Mode Puriste : les suggestions couvrent l’ensemble du catalogue des 187 jeux sans assistance'
                }
              >
                <Zap className={`w-3.5 h-3.5 ${adaptiveCluesEnabled ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                <span>
                  {adaptiveCluesEnabled
                    ? 'Mode Adaptatif (Indices actifs)'
                    : 'Mode Puriste (Défi libre)'}
                </span>
              </button>

              {adaptiveCluesEnabled && candidateGames.length > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30 shadow-xs">
                  🎯 {candidateGames.length} jeu{candidateGames.length > 1 ? 'x' : ''} possible{candidateGames.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          <GameSearchBar
            games={allPlayableGames}
            guessedGameIds={guesses.map((g) => g.id)}
            onSelectGame={handleGuess}
            placeholder={
              adaptiveCluesEnabled && candidateGames.length > 0
                ? `${t('indledle.searchPlaceholder')} (${candidateGames.length} candidats)...`
                : t('indledle.searchPlaceholder')
            }
            candidateGames={adaptiveCluesEnabled ? candidateGames : undefined}
            activeClues={adaptiveCluesEnabled ? activeClues : undefined}
          />
          <div className="text-center mt-2.5 text-xs text-slate-400 flex items-center justify-center gap-3">
            <span>{t('indledle.attempts', { count: guesses.length, max: MAX_GUESSES })}</span>
            {adaptiveCluesEnabled && guesses.length > 0 && candidateGames.length > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-bold">
                  {t('indledle.candidatesRemaining', { count: candidateGames.length })}
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Victory / Defeat Card */
        <div className="relative overflow-visible max-w-xl mx-auto bg-[#06241b] border-2 border-[#78350f] rounded-2xl p-6 text-center shadow-2xl mb-8 animate-in zoom-in-95 duration-300">
          <SylvestreIvyFrame density="medium" />
          <div className="flex justify-center mb-3">
            {isWon ? (
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center ring-4 ring-red-500/30">
                <XCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-1">
            {isWon ? t('common.congratulations') : t('common.gameOver')}
          </h2>

          <p className="text-sm text-slate-300 mb-4">
            {isWon
              ? t('indledle.wonText', { guesses: guesses.length })
              : t('indledle.lostText')}
          </p>

          {/* Solution Game Reveal */}
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-4 mb-5 text-left flex items-center gap-4">
            <img
              src={secretGame.screenshots[5] || secretGame.screenshots[0]}
              alt={secretGame.title}
              className="w-24 h-16 object-cover rounded-xl border border-[#1e293b]"
            />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-[#f59e0b] font-bold">
                {t('common.theSecretGameWas')}
              </div>
              <div className="font-black text-white text-lg leading-snug">
                {secretGame.title}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {secretGame.releaseYear} • {secretGame.developer} • {secretGame.genre.join(', ')}
              </div>
              {isGameOwned(secretGame.steamUrl) && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                  <SteamIcon className="w-3 h-3 text-cyan-400" />
                  <span>Dans votre bibliothèque Steam !</span>
                </div>
              )}
            </div>
          </div>

          {/* Community Attempt Distribution Graph */}
          <div className="mb-5">
            <AttemptDistributionChart
              game="indledle"
              date={currentDate}
              playerAttempts={guesses.length}
              isWon={isWon}
            />
          </div>

          {/* Streak preservation / broken notice banner */}
          <StreakNoticeBanner
            mode="indledle"
            currentDate={currentDate}
            isWon={isWon}
            onSelectDate={onSelectDate}
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            {secretGame.steamUrl && (
              <a
                href={secretGame.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition ${
                  isGameOwned(secretGame.steamUrl)
                    ? 'bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <SteamIcon className="w-4 h-4 text-cyan-400" />
                <span>{isGameOwned(secretGame.steamUrl) ? 'Dans votre bibliothèque Steam' : t('common.viewOnSteam')}</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('common.share')}</span>
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={isDownloadingImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-600 transition shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isDownloadingImage ? t('common.generating') : t('common.downloadCard')}</span>
            </button>
          </div>

          {/* Time Attack Gateway */}
          <div className="mt-4 pt-4 border-t border-[#1e293b] flex items-center justify-center">
            <button
              onClick={() => {
                soundFx.playClick();
                window.location.hash = '#timeattack=indledle';
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black transition active:scale-95 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{t('indledle.timeAttackGateway', "Envie d'un quiz rapide ? Tentez l'Indledle Sprint ⚡ (60s)")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State Onboarding Hint (when 0 guesses) */}
      {guesses.length === 0 && !isCompleted && (
        <div className="max-w-lg mx-auto p-6 rounded-2xl bg-[#06241b] border-2 border-[#78350f] text-center shadow-xl animate-in fade-in duration-300">
          <div className="w-11 h-11 mx-auto mb-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">
            {t('indledle.firstGuessTitle')}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {t('indledle.firstGuessDesc')}
          </p>
        </div>
      )}

      {/* Comparison Table */}
      {guesses.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[720px]">
            {/* Table Headers */}
            <div className="grid grid-cols-6 gap-2 mb-2 px-2 text-center text-xs font-bold uppercase tracking-wider text-slate-200">
              <div className="text-left pl-2">{t('indledle.tableGame')}</div>
              <div>{t('indledle.tableYear')}</div>
              <div>{t('indledle.tableGenres')}</div>
              <div>{t('indledle.tableArt')}</div>
              <div>{t('indledle.tableCamera')}</div>
              <div>{t('indledle.tableDev')}</div>
            </div>

            {/* Guesses Rows */}
            <div className="space-y-2">
              {guesses.map((guess, rowIndex) => {
                const isMatchYear = guess.releaseYear === secretGame.releaseYear;
                const isHigherYear = secretGame.releaseYear > guess.releaseYear;

                // Genres matching
                const commonGenres = guess.genre.filter((g) => secretGame.genre.includes(g));
                const isExactGenres =
                  commonGenres.length === secretGame.genre.length &&
                  guess.genre.length === secretGame.genre.length;
                const isPartialGenres = commonGenres.length > 0;

                // Art style match
                const isMatchArt = guess.artStyle.en === secretGame.artStyle.en;

                // Camera match
                const isMatchCamera = guess.camera.en === secretGame.camera.en;

                // Developer match
                const isMatchDev = guess.developer === secretGame.developer;

                return (
                  <motion.div
                    key={guess.id}
                    initial={{ opacity: 0, y: -20, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.4, delay: rowIndex === 0 ? 0.05 : 0 }}
                    className="grid grid-cols-6 gap-2 p-2 bg-[#06241b] border-2 border-[#78350f] rounded-2xl shadow-lg text-center items-stretch"
                  >
                    {/* Game Title & Thumb */}
                    <div className="flex items-center gap-2.5 text-left p-1 rounded-xl bg-[#03150f] border border-[#78350f]/60">
                      <img
                        src={guess.screenshots[5] || guess.screenshots[0]}
                        alt={guess.title}
                        className="w-12 h-9 object-cover rounded-lg shrink-0 border border-[#78350f]/40"
                      />
                      <div className="font-bold text-xs text-white leading-tight truncate">
                        {guess.title}
                      </div>
                    </div>

                  {/* Release Year */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl p-2 font-bold text-xs transition-colors ${
                      isMatchYear
                        ? 'bg-[#10b981] text-slate-950 font-black'
                        : 'bg-[#eab308]/90 text-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{guess.releaseYear}</span>
                      {!isMatchYear && (
                        isHigherYear ? (
                          <ArrowUp className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        )
                      )}
                    </div>
                    {difficulty === 'novice' && !isMatchYear && Math.abs(guess.releaseYear - secretGame.releaseYear) <= 2 && (
                      <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-1 py-0.2 rounded mt-0.5 shadow-sm">
                        ±2 ans
                      </span>
                    )}
                  </div>

                  {/* Genres */}
                  <div
                    className={`flex flex-wrap items-center justify-center gap-1 rounded-xl p-2 text-[11px] font-semibold transition-colors ${
                      isExactGenres
                        ? 'bg-[#10b981] text-slate-950'
                        : isPartialGenres
                        ? 'bg-[#eab308]/90 text-slate-950'
                        : 'bg-[#ef4444]/90 text-white'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight">
                      {guess.genre.map((g) => getTranslatedGenre(g, i18n.language)).join(', ')}
                    </span>
                  </div>

                  {/* Art Style */}
                  <div
                    className={`flex items-center justify-center rounded-xl p-2 text-[11px] font-semibold transition-colors text-center ${
                      isMatchArt
                        ? 'bg-[#10b981] text-slate-950'
                        : 'bg-[#ef4444]/90 text-white'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight">
                      {getTranslatedArtStyle(guess.artStyle, i18n.language)}
                    </span>
                  </div>

                  {/* Camera */}
                  <div
                    className={`flex items-center justify-center rounded-xl p-2 text-[11px] font-semibold transition-colors text-center ${
                      isMatchCamera
                        ? 'bg-[#10b981] text-slate-950'
                        : 'bg-[#ef4444]/90 text-white'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight">
                      {getTranslatedCamera(guess.camera, i18n.language)}
                    </span>
                  </div>

                  {/* Developer */}
                  <div
                    className={`flex items-center justify-center rounded-xl p-2 text-[11px] font-semibold transition-colors text-center ${
                      isMatchDev
                        ? 'bg-[#10b981] text-slate-950'
                        : 'bg-[#ef4444]/90 text-white'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight truncate">
                      {guess.developer}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Zero-Spoil Social Share Modal */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareData}
      />
    </div>
  );
};
