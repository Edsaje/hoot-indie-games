import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  History,
  Heart,
  CheckCircle2,
  XCircle,
  Share2,
  RotateCcw,
  Sparkles,
  Plus,
  ChevronDown,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { getDailyChronoPuzzle, getRandomChronoPuzzle, type ChronoPuzzle } from '../../data/chronoPuzzles';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { ShareResultModal } from '../common/ShareResultModal';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { type ShareCardData } from '../../utils/generateShareCard';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { telemetry } from '../../services/telemetry';

interface ChronoGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface PlacedCardItem {
  game: Game;
  wasGuessedCorrectly: boolean;
}

interface SavedChronoState {
  placedCards: PlacedCardItem[];
  remainingCardIds: string[];
  currentCardIndex: number;
  lives: number;
  correctPlacements: number;
  isCompleted: boolean;
  isWon: boolean;
}

export const ChronoGame: React.FC<ChronoGameProps> = ({ currentDate, onSelectDate }) => {
  const { t } = useTranslation();

  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();

  // Mode pratique ou quotidien
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [practiceSeed, setPracticeSeed] = useState<string>('');

  // Chargement du puzzle
  const puzzle: ChronoPuzzle = useMemo(() => {
    if (isPracticeMode) {
      return getRandomChronoPuzzle(practiceSeed);
    }
    return getDailyChronoPuzzle(currentDate);
  }, [isPracticeMode, practiceSeed, currentDate]);

  const storageKey = `chrono_state_${currentDate}`;

  // État sauvegardé pour reprise transparente
  const initialData = useMemo(() => {
    if (isPracticeMode) {
      return {
        placedCards: [{ game: puzzle.initialGame, wasGuessedCorrectly: true }],
        currentCardIndex: 0,
        lives: 3,
        correctPlacements: 0,
        isCompleted: false,
        isWon: false,
      };
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved: SavedChronoState = JSON.parse(raw);
        return saved;
      }
    } catch {
      // Ignorer
    }

    return {
      placedCards: [{ game: puzzle.initialGame, wasGuessedCorrectly: true }],
      currentCardIndex: 0,
      lives: 3,
      correctPlacements: 0,
      isCompleted: false,
      isWon: false,
    };
  }, [isPracticeMode, puzzle, storageKey]);

  const [placedCards, setPlacedCards] = useState<PlacedCardItem[]>(initialData.placedCards);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(initialData.currentCardIndex);
  const [lives, setLives] = useState<number>(initialData.lives);
  const [correctPlacements, setCorrectPlacements] = useState<number>(initialData.correctPlacements);
  const [isCompleted, setIsCompleted] = useState<boolean>(initialData.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(initialData.isWon);

  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Carte active actuellement présentée au joueur
  const currentCard: Game | undefined = puzzle.cardsToPlace[currentCardIndex];

  // Sauvegarde de l'état quotidien
  const persistDailyState = (
    nextPlaced: PlacedCardItem[],
    nextIndex: number,
    nextLives: number,
    nextCorrect: number,
    completed: boolean,
    won: boolean
  ) => {
    if (isPracticeMode) return;
    try {
      const stateToSave: SavedChronoState = {
        placedCards: nextPlaced,
        remainingCardIds: puzzle.cardsToPlace.slice(nextIndex).map((c) => c.id),
        currentCardIndex: nextIndex,
        lives: nextLives,
        correctPlacements: nextCorrect,
        isCompleted: completed,
        isWon: won,
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch {
      // Ignorer
    }
  };

  // Télémétrie au chargement
  useEffect(() => {
    telemetry.track('game', 'chrono_start', puzzle.id, undefined, {
      date: currentDate,
      isPractice: isPracticeMode,
      alreadyCompleted: isCompleted,
    });
  }, [puzzle.id, currentDate, isPracticeMode, isCompleted]);

  // Validation d'insertion
  const handleInsertSlot = (slotIndex: number) => {
    if (isCompleted || !currentCard) return;

    const targetYear = currentCard.releaseYear;
    let isCorrect = false;

    // Détermination de la validité du créneau temporel
    if (slotIndex === 0) {
      // Avant le premier jeu placé
      isCorrect = targetYear <= placedCards[0].game.releaseYear;
    } else if (slotIndex === placedCards.length) {
      // Après le dernier jeu placé
      isCorrect = targetYear >= placedCards[placedCards.length - 1].game.releaseYear;
    } else {
      // Entre slotIndex - 1 et slotIndex
      const prevYear = placedCards[slotIndex - 1].game.releaseYear;
      const nextYear = placedCards[slotIndex].game.releaseYear;
      isCorrect = targetYear >= prevYear && targetYear <= nextYear;
    }

    if (isCorrect) {
      // --- BONNE RÉPONSE ---
      soundFx.playChime();
      const nextCorrectCount = correctPlacements + 1;
      setCorrectPlacements(nextCorrectCount);
      setFeedback({
        text: t('chrono.feedbackCorrect', {
          title: currentCard.title,
          year: targetYear,
        }),
        isCorrect: true,
      });

      // Insérer la carte dans la frise et trier par année
      const newPlaced = [...placedCards, { game: currentCard, wasGuessedCorrectly: true }].sort(
        (a, b) => a.game.releaseYear - b.game.releaseYear
      );
      setPlacedCards(newPlaced);

      const nextIndex = currentCardIndex + 1;
      const hasFinishedAll = nextIndex >= puzzle.cardsToPlace.length;

      if (hasFinishedAll) {
        // VICTOIRE
        setIsWon(true);
        setIsCompleted(true);
        persistDailyState(newPlaced, nextIndex, lives, nextCorrectCount, true, true);

        if (!isPracticeMode) {
          recordGameResult('chrono', currentDate, true, lives);
          unlockAchievement('first_flight');
          if (lives === 3) {
            unlockAchievement('chrono_master');
          }
        }

        soundFx.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
        });
      } else {
        setCurrentCardIndex(nextIndex);
        persistDailyState(newPlaced, nextIndex, lives, nextCorrectCount, false, false);
      }
    } else {
      // --- ERREUR ---
      soundFx.playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      const nextLives = lives - 1;
      setLives(nextLives);
      setFeedback({
        text: t('chrono.feedbackWrong', {
          title: currentCard.title,
          year: targetYear,
        }),
        isCorrect: false,
      });

      // Insérer quand même la carte à son emplacement légitime pour continuer
      const newPlaced = [...placedCards, { game: currentCard, wasGuessedCorrectly: false }].sort(
        (a, b) => a.game.releaseYear - b.game.releaseYear
      );
      setPlacedCards(newPlaced);

      if (nextLives <= 0) {
        // DÉFAITE : Vies épuisées
        setIsWon(false);
        setIsCompleted(true);

        // Révéler également les cartes restantes de la pioche
        const allRemaining = puzzle.cardsToPlace.slice(currentCardIndex + 1);
        const finalPlaced = [
          ...newPlaced,
          ...allRemaining.map((g) => ({ game: g, wasGuessedCorrectly: false })),
        ].sort((a, b) => a.game.releaseYear - b.game.releaseYear);
        setPlacedCards(finalPlaced);

        persistDailyState(finalPlaced, puzzle.cardsToPlace.length, 0, correctPlacements, true, false);

        if (!isPracticeMode) {
          recordGameResult('chrono', currentDate, false, 0);
        }
      } else {
        const nextIndex = currentCardIndex + 1;
        const hasFinishedAll = nextIndex >= puzzle.cardsToPlace.length;

        if (hasFinishedAll) {
          // A terminé avec au moins 1 vie restante
          setIsWon(true);
          setIsCompleted(true);
          persistDailyState(newPlaced, nextIndex, nextLives, correctPlacements, true, true);
          if (!isPracticeMode) {
            recordGameResult('chrono', currentDate, true, nextLives);
            unlockAchievement('first_flight');
          }
          soundFx.playVictory();
        } else {
          setCurrentCardIndex(nextIndex);
          persistDailyState(newPlaced, nextIndex, nextLives, correctPlacements, false, false);
        }
      }
    }
  };

  // Partage texte simple
  const handleShare = () => {
    soundFx.playClick();
    const heartsEmoji = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    const resultText = isWon
      ? t('chrono.shareWon', { lives, hearts: heartsEmoji })
      : t('chrono.shareLost', { correct: correctPlacements });

    const text = `Hoot Indie Games — Chrono #${currentDate}\n${resultText}\nhttps://hootindiegames.com/#chrono`;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  };

  // Mode entraînement infini
  const startPracticeMode = () => {
    soundFx.playClick();
    setIsPracticeMode(true);
    setPracticeSeed(Date.now().toString());
    setPlacedCards([]);
    setCurrentCardIndex(0);
    setLives(3);
    setCorrectPlacements(0);
    setIsCompleted(false);
    setIsWon(false);
    setFeedback(null);
  };

  // Reprise du défi quotidien
  const returnToDailyChallenge = () => {
    soundFx.playClick();
    setIsPracticeMode(false);
  };

  const shareData: ShareCardData = {
    gameMode: 'Chrono-Timeline',
    date: currentDate,
    isWon,
    scoreText: isWon
      ? t('chrono.heartsRemaining', { lives })
      : t('chrono.gamesSlotted', { count: correctPlacements }),
    details: [
      `Date : #${currentDate}`,
      t('chrono.successfulPlacements', { count: correctPlacements }),
      t('chrono.livesRemaining', { lives }),
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('chrono.releaseTimeline')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide flex items-center justify-center gap-2">
          <span>{t('chrono.title')}</span>
          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {isPracticeMode ? t('chrono.practice') : t('chrono.daily')}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
          {t('chrono.instruction')}
        </p>

        {/* Lives & Progress Indicator */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-1.5 bg-[#131a29] border border-[#1e293b] px-3 py-1.5 rounded-xl shadow-inner">
            <span className="text-xs font-bold text-slate-400 mr-1">
              {t('chrono.livesLabel')}
            </span>
            {[1, 2, 3].map((heartIndex) => {
              const hasLife = heartIndex <= lives;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-transform duration-300 ${
                    hasLife
                      ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-600 fill-slate-800 scale-90 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          <div className="bg-[#131a29] border border-[#1e293b] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300">
            {t('chrono.progressLabel')}{' '}
            <span className="font-mono text-amber-400">
              {isCompleted ? '4/4' : `${currentCardIndex}/4`}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`max-w-md mx-auto mb-6 p-3 rounded-xl text-xs font-black text-center flex items-center justify-center gap-2 border animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.isCorrect
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/10'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* ACTIVE CARD TO PLACE (When game in progress) */}
      {!isCompleted && currentCard && (
        <motion.div
          animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto mb-8 bg-[#131a29] border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-black/50 border border-slate-700 shrink-0">
              <img
                src={currentCard.screenshots[0] || currentCard.screenshots[1]}
                alt={currentCard.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  const match = currentCard.steamUrl?.match(/app\/(\d+)/);
                  const appId = match ? match[1] : '';
                  const fallbackHeader = appId
                    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`
                    : '';
                  const alt = currentCard.screenshots.find((s: string) => s !== target.src) || fallbackHeader;
                  if (alt && target.src !== alt) {
                    target.src = alt;
                  }
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-amber-300 font-bold">
                <span className="truncate">{currentCard.developer}</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{t('chrono.cardToSlot')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {currentCard.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentCard.developer} • {currentCard.genre.join(', ')}
              </p>

              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {t('chrono.releaseYearLabel')}
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-black text-sm tracking-widest shadow-sm">
                  ????
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e293b] text-center text-xs font-bold text-amber-300/90 flex items-center justify-center gap-1.5">
            <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
            <span>
              {t('chrono.clickToInsert')}
            </span>
          </div>
        </motion.div>
      )}

      {/* THE TIMELINE (Vertical chronological list) */}
      <div className="max-w-xl mx-auto space-y-2 relative">
        {/* Timeline guide rail */}
        <div className="absolute left-6 sm:left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-500/20 via-amber-500/40 to-amber-500/20 pointer-events-none" />

        {/* Slot 0 : Before the first game */}
        {!isCompleted && (
          <div className="pl-12 sm:pl-16 relative">
            <button
              onClick={() => handleInsertSlot(0)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-[#131a29]/60 hover:bg-amber-500/10 text-amber-300 font-black text-xs transition flex items-center justify-center gap-2 group cursor-pointer shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
              <span>
                {t('chrono.slotBefore', {
                  title: placedCards[0]?.game.title || '',
                  year: placedCards[0]?.game.releaseYear || '',
                })}
              </span>
            </button>
          </div>
        )}

        {/* Placed Cards & In-Between Slots */}
        {placedCards.map((item, idx) => {
          const isNextSlotAvailable = !isCompleted && idx < placedCards.length - 1;

          return (
            <React.Fragment key={`${item.game.id}_${idx}`}>
              {/* Placed Game Card */}
              <div className="relative pl-12 sm:pl-16">
                {/* Year Marker Node on Rail */}
                <div
                  className={`absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-black text-[10px] z-10 shadow-lg ${
                    item.wasGuessedCorrectly
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950 border-rose-500 text-rose-300'
                  }`}
                >
                  {item.wasGuessedCorrectly ? '✓' : '✗'}
                </div>

                <div
                  className={`rounded-2xl border p-3 sm:p-4 transition flex items-center justify-between gap-3 shadow-md ${
                    item.wasGuessedCorrectly
                      ? 'bg-[#131a29] border-emerald-500/40'
                      : 'bg-[#131a29] border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.game.screenshots[0] || item.game.screenshots[1]}
                      alt={item.game.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const match = item.game.steamUrl?.match(/app\/(\d+)/);
                        const appId = match ? match[1] : '';
                        const fallbackHeader = appId
                          ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`
                          : '';
                        const alt = item.game.screenshots.find((s: string) => s !== target.src) || fallbackHeader;
                        if (alt && target.src !== alt) {
                          target.src = alt;
                        }
                      }}
                      className="w-16 sm:w-20 aspect-video object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-black text-white text-sm sm:text-base leading-snug truncate">
                        {item.game.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.game.developer} • {item.game.genre[0]}
                      </div>
                    </div>
                  </div>

                  {/* Year Tag */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-xl font-mono font-black text-sm sm:text-base border shadow-sm ${
                        item.wasGuessedCorrectly
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {item.game.releaseYear}
                    </span>
                  </div>
                </div>
              </div>

              {/* In-Between Slot */}
              {isNextSlotAvailable && (
                <div className="pl-12 sm:pl-16 my-1.5 relative">
                  <button
                    onClick={() => handleInsertSlot(idx + 1)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-[#131a29]/40 hover:bg-amber-500/10 text-amber-300/90 font-bold text-[11px] transition flex items-center justify-center gap-2 group cursor-pointer shadow-sm active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                    <span>
                      {t('chrono.slotBetween', {
                        year1: item.game.releaseYear,
                        year2: placedCards[idx + 1].game.releaseYear,
                      })}
                    </span>
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Slot After Last Game */}
        {!isCompleted && placedCards.length > 0 && (
          <div className="pl-12 sm:pl-16 relative pt-1">
            <button
              onClick={() => handleInsertSlot(placedCards.length)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-[#131a29]/60 hover:bg-amber-500/10 text-amber-300 font-black text-xs transition flex items-center justify-center gap-2 group cursor-pointer shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
              <span>
                {t('chrono.slotAfter', {
                  title: placedCards[placedCards.length - 1].game.title,
                  year: placedCards[placedCards.length - 1].game.releaseYear,
                })}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* END OF GAME DOSSIER (When completed) */}
      {isCompleted && (
        <div className="relative overflow-visible mt-8 max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-[#06241b] border-2 border-[#78350f] shadow-2xl animate-in fade-in zoom-in-95 duration-400">
          <SylvestreIvyFrame density="medium" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                {isWon ? (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-2 ring-emerald-500/40">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center ring-2 ring-rose-500/40">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-white">
                    {isWon
                      ? t('chrono.wonTitle')
                      : t('chrono.lostTitle')}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isWon
                      ? t('chrono.wonDesc', { lives })
                      : t('chrono.lostDesc', { correct: correctPlacements })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Share & Card */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? t('common.copied') : t('common.share')}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('common.downloadCard')}</span>
              </button>
            </div>
          </div>

          {/* Community Distribution Graph */}
          {!isPracticeMode && (
            <div className="mt-5">
              <AttemptDistributionChart
                game="chrono"
                date={currentDate}
                playerAttempts={lives}
                isWon={isWon}
              />
            </div>
          )}

          {/* Streak Notice Banner */}
          {!isPracticeMode && (
            <div className="mt-4">
              <StreakNoticeBanner
                mode="chrono"
                currentDate={currentDate}
                isWon={isWon}
                onSelectDate={onSelectDate}
              />
            </div>
          )}

          {/* Practice Mode Toggle */}
          <div className="mt-5 pt-4 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-xs">
            {isPracticeMode ? (
              <button
                onClick={returnToDailyChallenge}
                className="inline-flex items-center gap-1.5 text-amber-400 hover:underline font-bold cursor-pointer"
              >
                <span>{t('chrono.returnToDaily')}</span>
              </button>
            ) : (
              <span className="text-slate-400">
                {t('chrono.wantToReplay')}
              </span>
            )}

            <button
              onClick={startPracticeMode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('chrono.unlimitedPractice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Share Card Modal */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareData}
      />
    </div>
  );
};
