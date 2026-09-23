import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Eye,
  Sliders,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import { getDailyPixelPuzzle, getRandomPixelPuzzle, type PixelPuzzle } from '../../data/pixelPuzzles';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { ShareResultModal } from '../common/ShareResultModal';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { recordDailyCommunityCompletion } from '../../services/leaderboardService';
import { type ShareCardData } from '../../utils/generateShareCard';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { telemetry } from '../../services/telemetry';
import { getClueLabel, getClueValue } from '../../utils/localization';

interface PixelGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface SavedPixelState {
  guesses: string[]; // List of guessed game IDs
  isCompleted: boolean;
  isWon: boolean;
  attemptsCount: number;
}

const RESOLUTION_STEPS = [12, 24, 48, 96, 192]; // Downscaled width in pixels

export const PixelGame: React.FC<PixelGameProps> = ({ currentDate, onSelectDate }) => {
  const { t, i18n } = useTranslation();

  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();

  // Mode Pratique vs Quotidien
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [practiceSeed, setPracticeSeed] = useState<string>('');

  // Mode Visuel: Pixel (mosaïque rétro couleur) vs Silhouette (ombre chinoise sur halo)
  const [visualMode, setVisualMode] = useState<'pixel' | 'silhouette'>('pixel');

  // Chargement du puzzle
  const puzzle: PixelPuzzle = useMemo(() => {
    if (isPracticeMode) {
      return getRandomPixelPuzzle(practiceSeed);
    }
    return getDailyPixelPuzzle(currentDate);
  }, [isPracticeMode, practiceSeed, currentDate]);

  const storageKey = `pixel_state_${currentDate}`;

  // État initial (restauration si déjà commencé aujourd'hui)
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
        const saved: SavedPixelState = JSON.parse(raw);
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
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // Références Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const mistakesCount = guesses.length;
  const currentStep = Math.min(mistakesCount, RESOLUTION_STEPS.length - 1);
  const targetResolution = RESOLUTION_STEPS[currentStep];

  // Sauvegarde quotidienne persistante
  const persistDailyState = (nextGuesses: string[], completed: boolean, won: boolean) => {
    if (isPracticeMode) return;
    try {
      const stateToSave: SavedPixelState = {
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

  // Chargement de l'image source avec gestion CORS
  useEffect(() => {
    setImageLoaded(false);
    setImageLoadError(false);

    const fallbackUrl = puzzle.targetGame.screenshots[0] || '';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = puzzle.imageUrl || fallbackUrl;

    img.onload = () => {
      imageElementRef.current = img;
      setImageLoaded(true);
    };

    img.onerror = () => {
      if (fallbackUrl && img.src !== fallbackUrl) {
        img.src = fallbackUrl;
      } else {
        setImageLoadError(true);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [puzzle.imageUrl, puzzle.targetGame.screenshots]);

  // Rendu Canvas dynamique (Pixel / Silhouette)
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const displayWidth = canvas.width;
    const displayHeight = canvas.height;

    // Si la partie est terminée, afficher l'image complète nette
    if (isCompleted) {
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      return;
    }

    // Sinon, pixellisation dynamique par sous-échantillonnage
    const downW = targetResolution;
    const downH = Math.max(1, Math.round(downW * (img.naturalHeight / img.naturalWidth)));

    const offscreen = document.createElement('canvas');
    offscreen.width = downW;
    offscreen.height = downH;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    // Dessin basse résolution
    offCtx.drawImage(img, 0, 0, downW, downH);

    // Traitement Silhouette si activé
    if (visualMode === 'silhouette') {
      try {
        const imgData = offCtx.getImageData(0, 0, downW, downH);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Luminance perceptuelle
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (lum < 130) {
            // Silhouette sombre / ombre noire
            data[i] = 7;
            data[i + 1] = 11;
            data[i + 2] = 20;
            data[i + 3] = 255;
          } else {
            // Fond lumineux (halo émeraude / cyan rétro)
            data[i] = 56;
            data[i + 1] = 189;
            data[i + 2] = 248;
            data[i + 3] = 255;
          }
        }
        offCtx.putImageData(imgData, 0, 0);
      } catch {
        // Fallback transparent si CORS bloque getImageData
      }
    }

    // Ré-agrandissement sans lissage pour obtenir de gros pixels rétro nets
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, displayWidth, displayHeight);
  }, [imageLoaded, isCompleted, mistakesCount, targetResolution, visualMode]);

  // Télémétrie
  useEffect(() => {
    telemetry.track('game', 'pixel_start', puzzle.id, undefined, {
      date: currentDate,
      isPractice: isPracticeMode,
      alreadyCompleted: isCompleted,
    });
  }, [puzzle.id, currentDate, isPracticeMode, isCompleted]);

  // Filtrage des jeux pour l'autocomplétion
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
        recordGameResult('pixel', currentDate, true, nextGuesses.length);
        recordDailyCommunityCompletion('pixel', currentDate, true, nextGuesses.length);
        unlockAchievement('first_flight');
        if (nextGuesses.length === 1) {
          unlockAchievement('pixel_genius');
        }
      }

      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } else {
      // ERREUR
      soundFx.playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (nextGuesses.length >= 5) {
        // DÉFAITE (5 erreurs atteintes)
        setIsWon(false);
        setIsCompleted(true);
        persistDailyState(nextGuesses, true, false);

        if (!isPracticeMode) {
          recordGameResult('pixel', currentDate, false, 5);
          recordDailyCommunityCompletion('pixel', currentDate, false, 5);
        }
      } else {
        persistDailyState(nextGuesses, false, false);
      }
    }
  };

  // Passer un essai pour débloquer plus de pixels et le prochain indice
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
        recordGameResult('pixel', currentDate, false, 5);
        recordDailyCommunityCompletion('pixel', currentDate, false, 5);
      }
    } else {
      persistDailyState(nextGuesses, false, false);
    }
  };

  // Redémarrer en mode entraînement
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
      ? `${totalAttempts}/5 ${t('pixel.tries')}`
      : t('pixel.unsolved');

    return {
      gameMode: 'Pixel',
      date: isPracticeMode ? t('pixel.practice') : currentDate,
      isWon,
      scoreText: scoreHeadline,
      details: [
        t('pixel.pixelSilhouetteShare'),
        blocksLine,
        isWon
          ? t('pixel.shareWonStep', { count: totalAttempts })
          : t('pixel.revealedGame', { title: puzzle.targetGame.title }),
      ],
    };
  }, [guesses, isWon, t, isPracticeMode, currentDate, puzzle.targetGame.title]);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-36 sm:pb-48 min-h-[calc(100vh-140px)] space-y-5">
      {/* Bannière de Préservation de Flamme (J / J-1) */}
      {!isPracticeMode && onSelectDate && (
        <StreakNoticeBanner
          mode="pixel"
          currentDate={currentDate}
          isWon={isWon}
          onSelectDate={onSelectDate}
        />
      )}

      {/* En-tête avec modes et stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-3.5 sm:p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                {t('pixel.title')}
              </h2>
              {isPracticeMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {t('pixel.practice')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {t('pixel.gameSubtitle')}
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
              <span>{t('common.share')}</span>
            </button>
          )}

          <button
            onClick={startNewPracticeGame}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isPracticeMode
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/30'
                : 'bg-[#131a29] text-slate-300 border-[#1e293b] hover:bg-[#1a2337] hover:text-white'
            }`}
            title={t('pixel.unlimitedPracticeTip')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPracticeMode ? t('pixel.restart') : t('pixel.practice')}
            </span>
          </button>
        </div>
      </div>

      {/* Cadre Visuel Principal (Canvas avec toggle Pixel / Silhouette) */}
      <div
        className={`relative bg-[#06241b] border-2 border-[#78350f] rounded-2xl overflow-visible shadow-2xl transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <SylvestreIvyFrame density="delicate" />
        {/* Barre d'outils du visuel (Toggle Pixel / Silhouette & Indicateur de Résolution) */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0e1526]/80 border-b border-[#1e293b] backdrop-blur-xs">
          {/* Indicateur d'étape */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              {t('pixel.resolutionLabel')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 text-xs font-mono font-black border border-cyan-800/40">
              {isCompleted
                ? t('pixel.fullyUnveiled')
                : `${targetResolution}x${Math.round(targetResolution * 0.56)} px`}
            </span>
          </div>

          {/* Sélecteur de Mode Visuel (Pixel vs Silhouette) */}
          {!isCompleted && (
            <div className="flex items-center bg-[#131b2e] p-0.5 rounded-lg border border-[#1e293b]">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setVisualMode('pixel');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'pixel'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Pixel</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setVisualMode('silhouette');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'silhouette'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{t('pixel.silhouette')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Zone Canvas Responsive */}
        <div className="relative w-full aspect-video flex items-center justify-center bg-slate-950 overflow-hidden">
          {!imageLoaded && !imageLoadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950">
              <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-mono">
                {t('pixel.generatingMosaic')}
              </span>
            </div>
          )}

          {imageLoadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-xs">{t('pixel.imageUnavailable')}</p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Filigrane discret d'ambiance */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-slate-400 font-mono pointer-events-none">
            🦉 Hoot Pixel
          </div>
        </div>

        {/* Barre de Progression des 5 Essais */}
        <div className="px-4 py-3 bg-[#0a0f1d] border-t border-[#1e293b] flex items-center justify-center gap-2">
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
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-2 ring-cyan-500/30'
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

      {/* Grille d'Indices Débloquables Progressivement */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('pixel.unlockedClues')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {puzzle.clues.map((clue, idx) => {
            // L'indice 0 est débloqué dès l'essai 1, l'indice 1 à l'essai 2, etc.
            const isUnlocked = isCompleted || guesses.length >= idx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-[#0f172a] border-cyan-500/30 text-white shadow-sm'
                    : 'bg-[#0b0f19]/60 border-[#1e293b]/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    {isUnlocked ? (
                      <Unlock className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600" />
                    )}
                    {getClueLabel(clue.labelFr, i18n.language)}
                  </span>
                  {!isUnlocked && (
                    <span className="text-[9px] font-mono text-slate-500">
                      {t('pixel.guessCount', { count: idx + 1 })}
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold leading-relaxed">
                  {isUnlocked ? (
                    <span className="text-slate-200">{getClueValue(clue, i18n.language)}</span>
                  ) : (
                    <span className="italic text-slate-600">
                      {t('pixel.clueLocked')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barre de Recherche / Saisie Autocomplétée (si non terminé) */}
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
                placeholder={t('pixel.searchPlaceholder')}
                className="w-full pl-10 pr-24 py-3 bg-[#0f172a] border border-[#1e293b] focus:border-cyan-400 rounded-xl text-sm text-white placeholder-slate-500 outline-hidden transition-all shadow-inner"
              />

              {/* Bouton Passer un essai */}
              <button
                onClick={handleSkip}
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title={t('pixel.skipTip')}
              >
                {t('pixel.skip')}
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
                        idx === selectedIndex ? 'bg-cyan-500/15 text-white' : 'text-slate-300 hover:bg-[#131d36]'
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
          className="relative overflow-visible rounded-2xl bg-[#06241b] border-2 border-[#78350f] p-5 text-center space-y-4 shadow-xl"
        >
          <SylvestreIvyFrame density="medium" />
          {isWon ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('pixel.brilliantVictory')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {puzzle.targetGame.title}
              </h3>
              <p className="text-xs text-slate-400">
                {t('pixel.identifiedInGuesses', { count: guesses.length })}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase">
                <XCircle className="w-4 h-4" />
                <span>{t('pixel.roundOver')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {puzzle.targetGame.title}
              </h3>
              <p className="text-xs text-slate-400">
                {t('pixel.guessesExhausted')}
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
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 shrink-0 transition-all shadow-sm"
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
              <span>{t('pixel.shareResult')}</span>
            </button>

            <button
              onClick={startNewPracticeGame}
              className="px-4 py-2.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('pixel.playPracticeMode')}</span>
            </button>
          </div>

          {/* Graphique de distribution des essais communautaire */}
          {!isPracticeMode && (
            <div className="mt-4 pt-4 border-t border-[#1e293b]">
              <AttemptDistributionChart
                game="pixel"
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
