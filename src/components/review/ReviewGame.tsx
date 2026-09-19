import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Share2,
  RotateCcw,
  MessageSquareQuote,
  ThumbsUp,
  Clock,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import { getDailyReviewPuzzle, getRandomReviewPuzzle, type ReviewPuzzle } from '../../data/reviewPuzzles';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { ShareResultModal } from '../common/ShareResultModal';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { recordDailyCommunityCompletion } from '../../services/leaderboardService';
import { type ShareCardData } from '../../utils/generateShareCard';
import { telemetry } from '../../services/telemetry';

interface ReviewGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface SavedReviewState {
  guesses: string[];
  isCompleted: boolean;
  isWon: boolean;
  attemptsCount: number;
}

export const ReviewGame: React.FC<ReviewGameProps> = ({ currentDate, onSelectDate }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const isFr = lang === 'fr';

  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();

  // Mode pratique vs Quotidien
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [practiceSeed, setPracticeSeed] = useState<string>('');

  // Chargement du puzzle
  const puzzle: ReviewPuzzle = useMemo(() => {
    if (isPracticeMode) {
      return getRandomReviewPuzzle(practiceSeed);
    }
    return getDailyReviewPuzzle(currentDate);
  }, [isPracticeMode, practiceSeed, currentDate]);

  const storageKey = `review_state_${currentDate}`;

  // État initial (restauration de la sauvegarde locale)
  const initialData = useMemo(() => {
    if (isPracticeMode) {
      return {
        guesses: [],
        isCompleted: false,
        isWon: false,
        attemptsCount: 0,
      };
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved: SavedReviewState = JSON.parse(raw);
        return saved;
      }
    } catch {
      // Ignorer
    }

    return {
      guesses: [],
      isCompleted: false,
      isWon: false,
      attemptsCount: 0,
    };
  }, [isPracticeMode, storageKey]);

  const [guesses, setGuesses] = useState<string[]>(initialData.guesses);
  const [isCompleted, setIsCompleted] = useState<boolean>(initialData.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(initialData.isWon);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Sauvegarde quotidienne
  const persistDailyState = (nextGuesses: string[], completed: boolean, won: boolean) => {
    if (isPracticeMode) return;
    try {
      const stateToSave: SavedReviewState = {
        guesses: nextGuesses,
        isCompleted: completed,
        isWon: won,
        attemptsCount: nextGuesses.length,
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch {
      // Ignorer
    }
  };

  // Télémétrie
  useEffect(() => {
    telemetry.track('game', 'review_start', puzzle.id, undefined, {
      date: currentDate,
      isPractice: isPracticeMode,
      alreadyCompleted: isCompleted,
    });
  }, [puzzle.id, currentDate, isPracticeMode, isCompleted]);

  // Filtrage pour l'autocomplétion
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return INDIE_GAMES.filter(
      (game) =>
        !guesses.includes(game.id) &&
        (game.title.toLowerCase().includes(q) ||
          game.developer.toLowerCase().includes(q) ||
          game.genre.some((g) => g.toLowerCase().includes(q)))
    ).slice(0, 8);
  }, [searchQuery, guesses]);

  // Validation d'une proposition
  const handleGuess = (game: Game) => {
    if (isCompleted) return;

    soundFx.playClick();
    setSearchQuery('');
    setIsSearchOpen(false);

    const isCorrect = game.id === puzzle.targetGame.id;
    const nextGuesses = [...guesses, game.id];
    setGuesses(nextGuesses);

    if (isCorrect) {
      // VICTOIRE
      soundFx.playChime();
      soundFx.playVictory();
      setIsWon(true);
      setIsCompleted(true);
      persistDailyState(nextGuesses, true, true);

      if (!isPracticeMode) {
        recordGameResult('review', currentDate, true, nextGuesses.length);
        recordDailyCommunityCompletion('review', currentDate, true, nextGuesses.length);
        unlockAchievement('first_flight');
        if (nextGuesses.length === 1) {
          unlockAchievement('review_critic');
        }
      }

      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } else {
      // ERREUR
      soundFx.playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (nextGuesses.length >= 5) {
        // DÉFAITE
        setIsWon(false);
        setIsCompleted(true);
        persistDailyState(nextGuesses, true, false);

        if (!isPracticeMode) {
          recordGameResult('review', currentDate, false, 5);
          recordDailyCommunityCompletion('review', currentDate, false, 5);
        }
      } else {
        persistDailyState(nextGuesses, false, false);
      }
    }
  };

  // Passer un essai pour débloquer le prochain indice
  const handleSkip = () => {
    if (isCompleted || guesses.length >= 5) return;
    soundFx.playClick();
    const nextGuesses = [...guesses, '__skip__'];
    setGuesses(nextGuesses);

    if (nextGuesses.length >= 5) {
      setIsWon(false);
      setIsCompleted(true);
      persistDailyState(nextGuesses, true, false);

      if (!isPracticeMode) {
        recordGameResult('review', currentDate, false, 5);
        recordDailyCommunityCompletion('review', currentDate, false, 5);
      }
    } else {
      persistDailyState(nextGuesses, false, false);
    }
  };

  // Nouvelle partie aléatoire
  const startNewPracticeGame = () => {
    soundFx.playClick();
    setIsPracticeMode(true);
    setPracticeSeed(Date.now().toString());
    setGuesses([]);
    setIsCompleted(false);
    setIsWon(false);
    setSearchQuery('');
  };

  // Données de carte de partage HD
  const shareCardData: ShareCardData = useMemo(() => {
    const totalAttempts = guesses.length;
    const blocksLine = Array.from({ length: 5 }, (_, i) => {
      if (i < totalAttempts - 1) return '🟥';
      if (i === totalAttempts - 1) return isWon ? '🟩' : '🟥';
      return '⬛';
    }).join(' ');

    const scoreHeadline = isWon
      ? `${totalAttempts}/5 ${isFr ? 'Essais' : 'Tries'}`
      : isFr
      ? 'Non résolu'
      : 'Unsolved';

    return {
      gameMode: 'Critique Steam',
      date: isPracticeMode ? (isFr ? 'Entraînement' : 'Practice') : currentDate,
      isWon,
      scoreText: scoreHeadline,
      details: [
        isFr ? '📝 DÉDUCTION CRITIQUE STEAM' : '📝 STEAM REVIEW DEDUCTION',
        blocksLine,
        isWon
          ? isFr
            ? `🎯 Découvert en ${totalAttempts} essai${totalAttempts > 1 ? 's' : ''} !`
            : `🎯 Solved in ${totalAttempts} try${totalAttempts > 1 ? 's' : ''}!`
          : `Revealed: ${puzzle.targetGame.title}`,
      ],
    };
  }, [guesses, isWon, isFr, isPracticeMode, currentDate, puzzle.targetGame.title]);

  const displayedReviewText = isCompleted
    ? isFr
      ? puzzle.fullReviewFr
      : puzzle.fullReviewEn
    : isFr
    ? puzzle.redactedReviewFr
    : puzzle.redactedReviewEn;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Bannière de Préservation de Flamme (J / J-1) */}
      {!isPracticeMode && onSelectDate && (
        <StreakNoticeBanner
          mode="review"
          currentDate={currentDate}
          isWon={isWon}
          onSelectDate={onSelectDate}
        />
      )}

      {/* En-tête avec modes et commandes */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-3.5 sm:p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                {isFr ? 'Critique Steam' : 'Steam Review'}
              </h2>
              {isPracticeMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {isFr ? 'Entraînement' : 'Practice'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isFr
                ? 'Identifiez le jeu indé derrière cette authentique critique caviardée'
                : 'Identify the indie game behind this authentic redacted review'}
            </p>
          </div>
        </div>

        {/* Boutons d'Action (Entraînement / Partage) */}
        <div className="flex items-center gap-2">
          {isCompleted && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isFr ? 'Partager' : 'Share'}</span>
            </button>
          )}

          <button
            onClick={startNewPracticeGame}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isPracticeMode
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/30'
                : 'bg-[#131a29] text-slate-300 border-[#1e293b] hover:bg-[#1a2337] hover:text-white'
            }`}
            title={isFr ? 'Partie d’entraînement illimitée' : 'Unlimited practice game'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPracticeMode ? (isFr ? 'Recommencer' : 'Restart') : (isFr ? 'Entraînement' : 'Practice')}
            </span>
          </button>
        </div>
      </div>

      {/* Carte d'Avis Steam Officielle Stylisée */}
      <div
        className={`relative bg-gradient-to-b from-[#1b2838] to-[#171a21] border border-[#2a475e] rounded-2xl overflow-hidden shadow-2xl transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* En-tête Steam Review avec Profil & Heures de jeu */}
        <div className="px-4 py-3.5 bg-[#121a24] border-b border-[#2a475e]/80 flex flex-wrap items-center justify-between gap-3">
          {/* Auteur */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#38bdf8]/30 to-[#1d4ed8]/30 border border-[#38bdf8]/50 flex items-center justify-center text-sky-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{puzzle.author}</div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{puzzle.hoursPlayed} h {isFr ? 'enregistrées' : 'recorded'}</span>
              </div>
            </div>
          </div>

          {/* Badge Steam Recommandé */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#2a475e]/40 border border-[#38bdf8]/30 text-sky-300 text-xs font-bold">
            <div className="w-5 h-5 rounded bg-sky-500 flex items-center justify-center text-slate-950">
              <ThumbsUp className="w-3 h-3" />
            </div>
            <span>{isFr ? 'Recommandé' : 'Recommended'}</span>
          </div>
        </div>

        {/* Corps de la Critique avec Mots Caviardés */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
            {isFr ? `Évaluation postée le ${puzzle.reviewDate}` : `Posted on ${puzzle.reviewDate}`}
          </div>

          <div className="relative text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-medium bg-[#0e1422]/60 p-4 sm:p-5 rounded-xl border border-[#2a475e]/50">
            <p className="whitespace-pre-wrap">
              {displayedReviewText}
            </p>
          </div>

          {/* Indicateur de Statut */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="font-mono text-[11px]">
              {isCompleted
                ? isFr
                  ? 'Critique complète dévoilée'
                  : 'Full review unveiled'
                : isFr
                ? 'Termes spoilers caviardés (████)'
                : 'Spoiler terms redacted (████)'}
            </span>
            <span className="text-[11px] text-sky-400 font-mono">
              🦉 Steam Community Review
            </span>
          </div>
        </div>

        {/* Barre de Progression des 5 Essais */}
        <div className="px-4 py-3 bg-[#0e1422] border-t border-[#2a475e] flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, idx) => {
            const isCurrent = idx === guesses.length && !isCompleted;
            const isGuessed = idx < guesses.length;
            const isCorrectGuess = isGuessed && isWon && idx === guesses.length - 1;

            return (
              <div
                key={idx}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-sm font-black transition-all border ${
                  isCorrectGuess
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-md shadow-emerald-500/20'
                    : isGuessed
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    : isCurrent
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 ring-2 ring-sky-500/30'
                    : 'bg-[#131b2e]/60 text-slate-600 border-[#1e293b]'
                }`}
              >
                {isCorrectGuess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isGuessed ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grille d'Indices Débloquables */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFr ? 'Indices Révélés' : 'Unlocked Clues'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {puzzle.clues.map((clue, idx) => {
            const isUnlocked = isCompleted || guesses.length >= idx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-[#0f172a] border-sky-500/30 text-white shadow-sm'
                    : 'bg-[#0b0f19]/60 border-[#1e293b]/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                    {isUnlocked ? (
                      <Unlock className="w-3 h-3 text-sky-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600" />
                    )}
                    {isFr ? clue.labelFr : clue.labelEn}
                  </span>
                  {!isUnlocked && (
                    <span className="text-[9px] font-mono text-slate-500">
                      {isFr ? `Essai ${idx + 1}` : `Guess ${idx + 1}`}
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold leading-relaxed">
                  {isUnlocked ? (
                    <span className="text-slate-200">{isFr ? clue.valueFr : clue.valueEn}</span>
                  ) : (
                    <span className="italic text-slate-600">
                      {isFr ? 'Indice verrouillé' : 'Clue locked'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barre de Recherche Autocomplétée (si non terminé) */}
      {!isCompleted && (
        <div className="space-y-2">
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setSelectedIndex(0);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (!isSearchOpen || filteredGames.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % filteredGames.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + filteredGames.length) % filteredGames.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredGames[selectedIndex]) {
                      handleGuess(filteredGames[selectedIndex]);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder={
                  isFr
                    ? 'Tapez le nom d’un jeu indé (ex: Hollow Knight, Celeste)...'
                    : 'Type an indie game name (e.g. Hollow Knight, Celeste)...'
                }
                className="w-full pl-10 pr-24 py-3 bg-[#0f172a] border border-[#1e293b] focus:border-sky-400 rounded-xl text-sm text-white placeholder-slate-500 outline-hidden transition-all shadow-inner"
              />

              {/* Bouton Passer un essai */}
              <button
                onClick={handleSkip}
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title={isFr ? 'Dévoile le prochain indice sans deviner' : 'Unveil next clue without guessing'}
              >
                {isFr ? 'Passer' : 'Skip'}
              </button>
            </div>

            {/* Menu Déroulant Autocomplétion */}
            <AnimatePresence>
              {isSearchOpen && filteredGames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#1e293b]/60"
                >
                  {filteredGames.map((game, idx) => (
                    <button
                      key={game.id}
                      onClick={() => handleGuess(game)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center gap-3 transition-all cursor-pointer ${
                        idx === selectedIndex ? 'bg-sky-500/15 text-white' : 'text-slate-300 hover:bg-[#131d36]'
                      }`}
                    >
                      <img
                        src={game.screenshots[0]}
                        alt=""
                        className="w-10 h-7 object-cover rounded-md border border-[#1e293b] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate text-white">{game.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {game.developer} • {game.releaseYear}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Écran de Fin de Partie (Victoire ou Défaite) */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-[#0b0f19] border border-[#1e293b] p-5 text-center space-y-4 shadow-xl"
        >
          {isWon ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFr ? 'Déduction Impeccable !' : 'Flawless Deduction!'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {puzzle.targetGame.title}
              </h3>
              <p className="text-xs text-slate-400">
                {isFr
                  ? `Jeu identifié avec succès en ${guesses.length} essai${guesses.length > 1 ? 's' : ''}.`
                  : `Successfully identified in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase">
                <XCircle className="w-4 h-4" />
                <span>{isFr ? 'Manche Terminée' : 'Round Over'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {puzzle.targetGame.title}
              </h3>
              <p className="text-xs text-slate-400">
                {isFr
                  ? 'Les 5 essais ont été épuisés. Revanche demain ou en mode entraînement !'
                  : 'All 5 guesses used. Revenge tomorrow or in practice mode!'}
              </p>
            </div>
          )}

          {/* Fiche de la Pépite Dévoilée */}
          <div className="p-3.5 rounded-xl bg-[#131a29] border border-[#1e293b] flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={puzzle.targetGame.screenshots[0]}
                alt=""
                className="w-14 h-10 object-cover rounded-lg border border-[#1e293b] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate">
                  {puzzle.targetGame.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {puzzle.targetGame.developer} • {puzzle.targetGame.releaseYear}
                </div>
              </div>
            </div>

            {puzzle.targetGame.steamUrl && (
              <a
                href={puzzle.targetGame.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-slate-950 text-xs font-black flex items-center gap-1 shrink-0 transition-all shadow-sm"
              >
                <span>Steam</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Boutons d'Action (Partage / Rejouer) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{isFr ? 'Partager le Résultat' : 'Share Result'}</span>
            </button>

            <button
              onClick={startNewPracticeGame}
              className="px-4 py-2.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Rejouer en Entraînement' : 'Play Practice Mode'}</span>
            </button>
          </div>

          {/* Graphique de distribution des essais communautaire */}
          {!isPracticeMode && (
            <div className="mt-4 pt-4 border-t border-[#1e293b]">
              <AttemptDistributionChart
                game="review"
                date={currentDate}
                playerAttempts={guesses.length}
                isWon={isWon}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Modale de Partage Zéro-Spoil */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareCardData}
      />
    </div>
  );
};
