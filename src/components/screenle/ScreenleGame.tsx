import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Music,
  Quote,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { INDIE_GAMES, getDailyGame } from '../../data/games';
import { GameSearchBar } from '../common/GameSearchBar';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { downloadShareCard } from '../../utils/generateShareCard';
import { telemetry } from '../../services/telemetry';

interface ScreenleGameProps {
  currentDate: string;
}

export const ScreenleGame: React.FC<ScreenleGameProps> = ({ currentDate }) => {
  const { t, i18n } = useTranslation();
  const { recordGameResult } = useGameStats();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  // The secret game of the day
  const secretGame = getDailyGame(currentDate, 0);

  // Local storage state key
  const storageKey = `screenle_state_${currentDate}`;

  const savedState = (() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restoredGuesses = (parsed.guessIds || [])
          .map((id: string) => INDIE_GAMES.find((g) => g.id === id))
          .filter(Boolean) as Game[];
        return {
          guesses: restoredGuesses,
          isCompleted: Boolean(parsed.isCompleted),
          isWon: Boolean(parsed.isWon),
          activeStageIndex: parsed.isCompleted ? 5 : Math.min(5, restoredGuesses.length),
        };
      }
    } catch {
      // Fallback
    }
    return {
      guesses: [] as Game[],
      isCompleted: false,
      isWon: false,
      activeStageIndex: 0,
    };
  })();

  const { unlockAchievement } = useAchievements();
  const { allPlayableGames } = useSteamCatalog();
  const [guesses, setGuesses] = useState<Game[]>(savedState.guesses);
  const [isCompleted, setIsCompleted] = useState<boolean>(savedState.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(savedState.isWon);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(savedState.activeStageIndex);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);

  // Sync to local storage
  const saveGameState = (
    newGuesses: Game[],
    completed: boolean,
    won: boolean
  ) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: currentDate,
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
      const s1 = localStorage.getItem(`indledle_state_${currentDate}`);
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

  // Suivi télémétrie cookieless au chargement du défi
  useEffect(() => {
    telemetry.track('game', 'screenle_play', secretGame.title, undefined, {
      date: currentDate,
      alreadyCompleted: isCompleted,
    });
  }, [currentDate, secretGame.title, isCompleted]);

  const unlockedStagesCount = isCompleted
    ? 6
    : Math.min(6, guesses.length + 1);

  const handleGuess = (game: Game) => {
    if (isCompleted) return;

    const newGuesses = [...guesses, game];
    setGuesses(newGuesses);

    if (game.id === secretGame.id) {
      // Won!
      setIsWon(true);
      setIsCompleted(true);
      setActiveStageIndex(5);
      saveGameState(newGuesses, true, true);
      recordGameResult('screenle', currentDate, true, newGuesses.length);
      unlockAchievement('first_flight');
      if (newGuesses.length <= 2) {
        unlockAchievement('owl_eyes');
      }
      checkDailyTrifecta();
      soundFx.playVictory();
      telemetry.track('game', 'screenle_win', secretGame.title, newGuesses.length, {
        attempts: newGuesses.length,
        game: secretGame.title,
      });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'],
      });
    } else if (newGuesses.length >= 6) {
      // Lost
      setIsWon(false);
      setIsCompleted(true);
      setActiveStageIndex(5);
      saveGameState(newGuesses, true, false);
      recordGameResult('screenle', currentDate, false, 6);
      unlockAchievement('first_flight');
      soundFx.playError();
      telemetry.track('game', 'screenle_loss', secretGame.title, 6, {
        attempts: 6,
        game: secretGame.title,
      });
    } else {
      // Reveal next stage
      setActiveStageIndex(newGuesses.length);
      saveGameState(newGuesses, false, false);
      soundFx.playError();
      telemetry.track('interaction', 'screenle_guess', game.title, newGuesses.length, {
        stage: newGuesses.length,
      });
    }
  };

  const handleDownloadCard = async () => {
    soundFx.playClick();
    setIsDownloadingImage(true);
    try {
      const lines = guesses.slice(0, 4).map((g, idx) => {
        const isHit = g.id === secretGame.id;
        return `${idx + 1}. ${isHit ? '🟩' : '⬛'} ${g.title}`;
      });
      await downloadShareCard({
        gameMode: 'Screenle',
        date: currentDate,
        isWon,
        scoreText: isWon ? `${guesses.length}/6 tentatives` : 'Défi non résolu',
        details: lines.length > 0 ? lines : ['Défi du jour terminé'],
      });
      soundFx.playChime();
    } catch {
      // Ignore
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleSkip = () => {
    if (isCompleted || guesses.length >= 5) return;
    // Add a null/empty guess representation by passing a skip placeholder
    const dummySkipGame: Game = {
      id: `skipped-${guesses.length}`,
      title: 'Passé / Skipped',
      releaseYear: 0,
      genre: [],
      artStyle: { fr: '', en: '' },
      camera: { fr: '', en: '' },
      developer: '',
      screenshots: [],
      hints: { tagline: { fr: '', en: '' } },
    };
    const newGuesses = [...guesses, dummySkipGame];
    setGuesses(newGuesses);

    if (newGuesses.length >= 6) {
      setIsWon(false);
      setIsCompleted(true);
      setActiveStageIndex(5);
      saveGameState(newGuesses, true, false);
      recordGameResult('screenle', currentDate, false, 6);
      soundFx.playError();
    } else {
      setActiveStageIndex(newGuesses.length);
      saveGameState(newGuesses, false, false);
      soundFx.playClick();
    }
  };

  const handleShare = () => {
    soundFx.playClick();
    const squares = Array.from({ length: 6 }, (_, i) => {
      if (i < guesses.length) {
        return guesses[i].id === secretGame.id ? '🟩' : '🟥';
      }
      return '⬛';
    }).join('');

    const text = `🦉 Screenle #${currentDate} - ${
      isWon ? `${guesses.length}/6` : 'X/6'
    }\n${squares}\n🎮 Jouez sur Hoot Indie Games : https://hootindiegames.com`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  // Zoom / crop styling based on stage
  // Stage 0: 300% zoom on a crop
  // Stage 1: 250%
  // Stage 2: 200%
  // Stage 3: 160%
  // Stage 4: 120%
  // Stage 5: 100% full view
  const zoomScales = [3.2, 2.5, 2.0, 1.6, 1.25, 1.0];
  const zoomOrigins = ['center center', '25% 35%', '70% 60%', '30% 70%', '50% 40%', 'center center'];
  const currentScale = isCompleted && isWon ? 1.0 : zoomScales[activeStageIndex] || 1.0;
  const currentOrigin = zoomOrigins[activeStageIndex] || 'center center';

  // Get current screenshot url
  const currentScreenshotUrl =
    secretGame.screenshots[activeStageIndex] ||
    secretGame.screenshots[0] ||
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Game Mode Title & Subtitle */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Eye className="w-3.5 h-3.5" />
          Mode 1 • Déduction Visuelle
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t('screenle.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          {t('screenle.subtitle')}
        </p>
      </div>

      {/* Stage Navigation Pills */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => {
          const isUnlocked = i < unlockedStagesCount;
          const isActive = i === activeStageIndex;
          return (
            <button
              key={i}
              onClick={() => {
                if (isUnlocked) {
                  soundFx.playClick();
                  setActiveStageIndex(i);
                }
              }}
              disabled={!isUnlocked}
              className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-[#f59e0b] text-slate-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0b0f19] scale-105'
                  : isUnlocked
                  ? 'bg-[#131a29] border border-[#1e293b] text-slate-300 hover:border-amber-500/40'
                  : 'bg-[#0e1422]/60 text-slate-600 border border-slate-900 cursor-not-allowed'
              }`}
              title={`Étape ${i + 1} / 6`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Screenshot Frame Container */}
      <div className="relative w-full aspect-video bg-[#0b0f19] border-2 border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl group mb-6">
        {/* The screenshot image with animated transform */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center bg-slate-950">
          <img
            src={currentScreenshotUrl}
            alt={`Screenle Indice ${activeStageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-700 ease-out select-none pointer-events-none"
            style={{
              transform: isZoomedIn ? `scale(${currentScale * 1.5})` : `scale(${currentScale})`,
              transformOrigin: currentOrigin,
              filter: isCompleted ? 'none' : 'contrast(105%) brightness(95%)',
            }}
          />
        </div>

        {/* Stage overlay badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0b0f19]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs font-semibold text-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
          {t('screenle.stage', { current: activeStageIndex + 1, total: 6 })}
        </div>

        {/* Image Controls Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsZoomedIn(!isZoomedIn);
            }}
            className="p-2 rounded-xl bg-[#0b0f19]/80 backdrop-blur-md border border-[#1e293b] text-slate-300 hover:text-[#f59e0b] transition"
            title={isZoomedIn ? 'Dézoomer' : 'Zoomer'}
          >
            {isZoomedIn ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>

        {/* Next / Previous arrows on screenshot */}
        {activeStageIndex > 0 && (
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveStageIndex((prev) => prev - 1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition border border-white/10"
            aria-label="Étape précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {activeStageIndex < unlockedStagesCount - 1 && (
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveStageIndex((prev) => prev + 1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition border border-white/10"
            aria-label="Étape suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bonus Hints Accordion / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Tagline Clue (unlocked at 3 guesses or if completed) */}
        <div
          className={`p-4 rounded-2xl border transition ${
            guesses.length >= 2 || isCompleted
              ? 'bg-[#131a29] border-[#1e293b] text-slate-200'
              : 'bg-[#131a29]/40 border-dashed border-slate-800 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Quote className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('screenle.taglineHint')}
            </span>
            {guesses.length < 2 && !isCompleted && (
              <span className="text-[10px] ml-auto font-mono text-slate-500">
                {t('screenle.unlockHintAt', { step: 3 })}
              </span>
            )}
          </div>
          <p className="text-xs italic leading-relaxed">
            {guesses.length >= 2 || isCompleted
              ? `"${secretGame.hints.tagline[lang]}"`
              : 'Verrouillé : faites au moins 2 propositions pour révéler cet indice.'}
          </p>
        </div>

        {/* Composer Clue (unlocked at 4 guesses or if completed) */}
        <div
          className={`p-4 rounded-2xl border transition ${
            guesses.length >= 3 || isCompleted
              ? 'bg-[#131a29] border-[#1e293b] text-slate-200'
              : 'bg-[#131a29]/40 border-dashed border-slate-800 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Music className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('screenle.composerHint')}
            </span>
            {guesses.length < 3 && !isCompleted && (
              <span className="text-[10px] ml-auto font-mono text-slate-500">
                {t('screenle.unlockHintAt', { step: 4 })}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed">
            {guesses.length >= 3 || isCompleted
              ? secretGame.hints.composer || 'Compositeur indépendant'
              : 'Verrouillé : faites au moins 3 propositions pour révéler le compositeur.'}
          </p>
        </div>
      </div>

      {/* Game Play Inputs or Completion Banner */}
      {!isCompleted ? (
        <div className="space-y-4">
          <GameSearchBar
            games={allPlayableGames}
            guessedGameIds={guesses.map((g) => g.id)}
            onSelectGame={handleGuess}
            placeholder={t('screenle.searchPlaceholder')}
          />

          <div className="flex items-center justify-between max-w-xl mx-auto px-2">
            <span className="text-xs text-slate-400">
              {t('screenle.attemptsLeft', { count: 6 - guesses.length })}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 hover:underline transition"
            >
              {t('screenle.skipStep')} →
            </button>
          </div>
        </div>
      ) : (
        /* Victory or Defeat Card */
        <div className="bg-[#131a29] border border-amber-500/40 rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
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
              ? t('screenle.wonText', { step: guesses.length })
              : t('screenle.lostText')}
          </p>

          {/* Solution Game Details Card */}
          <div className="max-w-md mx-auto bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-4 mb-6 text-left flex items-center gap-4">
            <img
              src={secretGame.screenshots[5] || secretGame.screenshots[0]}
              alt={secretGame.title}
              className="w-24 h-16 object-cover rounded-xl border border-[#1e293b]"
            />
            <div className="flex-1">
              <div className="font-black text-white text-lg leading-snug">
                {secretGame.title}
              </div>
              <div className="text-xs text-[#f59e0b] font-medium">
                {secretGame.releaseYear} • {secretGame.developer}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {secretGame.genre.join(', ')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {secretGame.steamUrl && (
              <a
                href={secretGame.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition"
              >
                {t('common.viewOnSteam')}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('common.copied')}
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {t('common.share')}
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={isDownloadingImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-600 transition shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isDownloadingImage ? 'Génération...' : 'Partager en Image 🪶'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Previous Guesses List */}
      {guesses.length > 0 && (
        <div className="mt-8 max-w-xl mx-auto">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
            Historique des tentatives ({guesses.length}/6)
          </h3>
          <div className="space-y-2">
            {guesses.map((guess, idx) => {
              const isMatch = guess.id === secretGame.id;
              const isSkipped = guess.id.startsWith('skipped');
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    isMatch
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : isSkipped
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500 italic'
                      : 'bg-[#131a29] border-[#1e293b] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-xs text-slate-500">{idx + 1}.</span>
                    <span>{guess.title}</span>
                  </div>
                  {isMatch ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isSkipped ? (
                    <span className="text-xs uppercase">Passé</span>
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
