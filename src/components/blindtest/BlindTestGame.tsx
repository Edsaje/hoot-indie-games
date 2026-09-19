import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  Disc,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import {
  getDailyBlindTestPuzzle,
  getRandomBlindTestPuzzle,
  noteToFrequency,
  AUDIO_UNLOCK_DURATIONS,
  type BlindTestPuzzle,
} from '../../data/blindtestPuzzles';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { ShareResultModal } from '../common/ShareResultModal';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { recordDailyCommunityCompletion } from '../../services/leaderboardService';
import { type ShareCardData } from '../../utils/generateShareCard';
import { telemetry } from '../../services/telemetry';

interface BlindTestGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface SavedBlindTestState {
  guesses: string[];
  isCompleted: boolean;
  isWon: boolean;
  attemptsCount: number;
}

export const BlindTestGame: React.FC<BlindTestGameProps> = ({ currentDate, onSelectDate }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const isFr = lang === 'fr';

  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();

  // Mode Pratique vs Quotidien
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [practiceSeed, setPracticeSeed] = useState<string>('');

  // Puzzle actif
  const puzzle: BlindTestPuzzle = useMemo(() => {
    if (isPracticeMode) {
      return getRandomBlindTestPuzzle(practiceSeed);
    }
    return getDailyBlindTestPuzzle(currentDate);
  }, [isPracticeMode, practiceSeed, currentDate]);

  const storageKey = `blindtest_state_${currentDate}`;

  // État initial sauvegardé
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
        const saved: SavedBlindTestState = JSON.parse(raw);
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

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0); // 0 to 1
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0));

  // Web Audio synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ stop: () => void }[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mistakesCount = guesses.length;
  const currentStep = Math.min(mistakesCount, AUDIO_UNLOCK_DURATIONS.length - 1);
  const maxAllowedDuration = isCompleted ? 20.0 : AUDIO_UNLOCK_DURATIONS[currentStep];

  // Sauvegarde quotidienne
  const persistDailyState = (nextGuesses: string[], completed: boolean, won: boolean) => {
    if (isPracticeMode) return;
    try {
      const stateToSave: SavedBlindTestState = {
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

  // Arrêter la lecture audio
  const stopAudio = useCallback(() => {
    activeNodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        // Déjà arrêté
      }
    });
    activeNodesRef.current = [];

    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsPlaying(false);
    setPlaybackProgress(0);
    setPlaybackSeconds(0);
    setFrequencies(new Array(16).fill(0));
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  // Jouer la mélodie synthétisée
  const playAudio = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Master Analyser & Gain
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.25, ctx.currentTime);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    const startTime = ctx.currentTime + 0.05;
    let noteTime = startTime;
    const melody = puzzle.audioConfig.melody;
    const instrument = puzzle.audioConfig.instrument;
    const nodes: { stop: () => void }[] = [];
    const playDuration = maxAllowedDuration;

    // Planifier les notes en boucle continue jusqu'à couvrir l'intégralité du palier débloqué
    let noteIdx = 0;
    while (noteTime < startTime + playDuration && melody.length > 0) {
      const item = melody[noteIdx % melody.length];
      const loopPass = Math.floor(noteIdx / melody.length);
      const dur = item.duration;
      const freq = noteToFrequency(item.note, item.octave);

      const timeLeft = (startTime + playDuration) - noteTime;
      if (timeLeft <= 0.02) break;

      const effectiveDur = Math.min(dur, timeLeft);

      if (freq > 0) {
        // Oscillateur mélodique principal (Lead)
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Timbre de l'instrument
        if (instrument === 'chiptune') {
          osc.type = 'square';
        } else if (instrument === 'synth') {
          osc.type = 'sawtooth';
        } else if (instrument === 'piano') {
          osc.type = 'triangle';
        } else if (instrument === 'bell') {
          osc.type = 'sine';
        } else if (instrument === 'guitar') {
          osc.type = 'triangle';
        } else {
          osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(freq, noteTime);

        // Enveloppe ADSR dynamique adaptée à la durée effective
        const attackTime = Math.min(0.04, effectiveDur * 0.2);
        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.28, noteTime + attackTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + effectiveDur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + effectiveDur);
        nodes.push(osc);

        // Enrichissement harmonique sur les boucles suivantes (paliers 6s, 11s, 18s)
        if (loopPass > 0 && freq > 65) {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = instrument === 'chiptune' ? 'triangle' : 'sine';
          subOsc.frequency.setValueAtTime(freq / 2, noteTime);

          subGain.gain.setValueAtTime(0.001, noteTime);
          subGain.gain.linearRampToValueAtTime(0.12, noteTime + attackTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, noteTime + effectiveDur);

          subOsc.connect(subGain);
          subGain.connect(masterGain);

          subOsc.start(noteTime);
          subOsc.stop(noteTime + effectiveDur);
          nodes.push(subOsc);
        }
      }

      noteTime += dur;
      noteIdx++;
    }

    activeNodesRef.current = nodes;
    setIsPlaying(true);

    const startRealTime = performance.now();

    // Boucle d'animation pour l'égaliseur et la barre de progression
    const updateLoop = () => {
      const elapsed = (performance.now() - startRealTime) / 1000;
      if (elapsed >= playDuration) {
        stopAudio();
        return;
      }

      setPlaybackSeconds(Number(Math.min(elapsed, playDuration).toFixed(1)));
      setPlaybackProgress(Math.min(1, elapsed / 18.0));

      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const sampled = Array.from(data.slice(0, 16)).map((v) => v / 255);
        setFrequencies(sampled);
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    playbackTimeoutRef.current = setTimeout(() => {
      stopAudio();
    }, playDuration * 1000 + 80);
  };

  // Télémétrie
  useEffect(() => {
    telemetry.track('game', 'blindtest_start', puzzle.id, undefined, {
      date: currentDate,
      isPractice: isPracticeMode,
      alreadyCompleted: isCompleted,
    });
  }, [puzzle.id, currentDate, isPracticeMode, isCompleted]);

  // Filtrage pour autocomplétion
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return INDIE_GAMES.filter(
      (game) =>
        !guesses.includes(game.id) &&
        (game.title.toLowerCase().includes(q) ||
          game.developer.toLowerCase().includes(q) ||
          (game.hints.composer && game.hints.composer.toLowerCase().includes(q)) ||
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
        recordGameResult('blindtest', currentDate, true, nextGuesses.length);
        recordDailyCommunityCompletion('blindtest', currentDate, true, nextGuesses.length);
        unlockAchievement('first_flight');
        if (nextGuesses.length === 1) {
          unlockAchievement('musical_ear');
        }
      }

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#38bdf8', '#f59e0b'],
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
          recordGameResult('blindtest', currentDate, false, 5);
          recordDailyCommunityCompletion('blindtest', currentDate, false, 5);
        }
      } else {
        persistDailyState(nextGuesses, false, false);
      }
    }
  };

  // Passer un essai pour débloquer plus de secondes audio
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
        recordGameResult('blindtest', currentDate, false, 5);
        recordDailyCommunityCompletion('blindtest', currentDate, false, 5);
      }
    } else {
      persistDailyState(nextGuesses, false, false);
    }
  };

  // Recommencer en mode entraînement
  const startNewPracticeGame = () => {
    soundFx.playClick();
    stopAudio();
    setIsPracticeMode(true);
    setPracticeSeed(Date.now().toString());
    setGuesses([]);
    setIsCompleted(false);
    setIsWon(false);
    setSearchQuery('');
  };

  // Données de carte de partage
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
      gameMode: 'Blind Test OST',
      date: isPracticeMode ? (isFr ? 'Entraînement' : 'Practice') : currentDate,
      isWon,
      scoreText: scoreHeadline,
      details: [
        isFr ? '🎵 BLIND TEST OST INDÉ' : '🎵 INDIE OST BLIND TEST',
        `🔊 ${AUDIO_UNLOCK_DURATIONS[Math.min(totalAttempts - 1, 4)]}s / 18.0s`,
        blocksLine,
        isWon
          ? isFr
            ? `🎯 Découvert en ${totalAttempts} écoute${totalAttempts > 1 ? 's' : ''} !`
            : `🎯 Solved in ${totalAttempts} listen${totalAttempts > 1 ? 's' : ''}!`
          : `Revealed: ${puzzle.targetGame.title}`,
      ],
    };
  }, [guesses, isWon, isFr, isPracticeMode, currentDate, puzzle.targetGame.title]);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Bannière de Préservation de Flamme (J / J-1) */}
      {!isPracticeMode && onSelectDate && (
        <StreakNoticeBanner
          mode="blindtest"
          currentDate={currentDate}
          isWon={isWon}
          onSelectDate={onSelectDate}
        />
      )}

      {/* En-tête avec modes et stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-3.5 sm:p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                {isFr ? 'Blind Test OST' : 'Indie Blind Test'}
              </h2>
              {isPracticeMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {isFr ? 'Entraînement' : 'Practice'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isFr
                ? 'Écoutez l’extrait musical et identifiez la pépite indé correspondante'
                : 'Listen to the soundtrack excerpt and identify the matching indie gem'}
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

      {/* Lecteur Audio Interactif avec Visualiseur Néon */}
      <div
        className={`relative bg-gradient-to-b from-[#131127] to-[#0b0918] border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Barre Supérieure du Lecteur */}
        <div className="px-4 py-3 bg-[#181432]/70 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className={`w-4 h-4 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <span className="text-xs font-mono font-bold text-slate-300">
              {isCompleted
                ? puzzle.trackTitle
                : isFr
                ? 'Piste Mystère Déverrouillée'
                : 'Mystery Track Unlocked'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/40 transition cursor-pointer"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 text-[11px] font-mono font-black border border-purple-700/40">
              {maxAllowedDuration}s {isFr ? 'débloquées' : 'unlocked'}
            </span>
          </div>
        </div>

        {/* Visualiseur de Fréquences Réactif */}
        <div className="p-6 flex flex-col items-center justify-center space-y-6">
          {/* Égaliseur Visuel */}
          <div className="h-20 flex items-end justify-center gap-1.5 w-full max-w-sm px-4">
            {frequencies.map((val, idx) => {
              const heightPct = isPlaying ? Math.max(12, Math.round(val * 100)) : 10;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-purple-500/20 rounded-t-sm overflow-hidden transition-all duration-75"
                  style={{ height: '100%' }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 via-pink-500 to-amber-400 rounded-t-sm shadow-sm transition-all duration-75"
                    style={{
                      height: `${heightPct}%`,
                      opacity: isPlaying ? 0.9 : 0.25,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bouton Central de Lecture Play/Pause */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={playAudio}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer active:scale-95 ${
                isPlaying
                  ? 'bg-gradient-to-tr from-pink-600 to-purple-600 ring-4 ring-pink-500/30 shadow-purple-500/30'
                  : 'bg-gradient-to-tr from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 ring-4 ring-purple-500/20 hover:scale-105 shadow-purple-500/20'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              )}
            </button>

            {/* Compteur de Temps */}
            <div className="text-xs font-mono text-slate-300">
              <span className="font-bold text-pink-400">{playbackSeconds.toFixed(1)}s</span>
              <span className="text-slate-500"> / {maxAllowedDuration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Barre de Progression Segmentée Heardle-Style */}
          <div className="w-full max-w-md space-y-1.5">
            <div className="relative w-full h-3 bg-[#0a0715] rounded-full overflow-hidden border border-purple-500/30 p-0.5">
              {/* Zone débloquée du palier courant */}
              <div
                className="absolute top-0.5 bottom-0.5 left-0.5 bg-purple-500/25 rounded-full pointer-events-none transition-all duration-300"
                style={{ width: `${Math.min(100, (maxAllowedDuration / 18.0) * 100)}%` }}
              />

              {/* Remplissage de lecture active */}
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-75 relative z-10"
                style={{ width: `${Math.min(100, playbackProgress * 100)}%` }}
              />

              {/* Lignes de découpe des paliers d'écoute */}
              {AUDIO_UNLOCK_DURATIONS.map((dur, i) => {
                const leftPct = (dur / 18.0) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700/80 pointer-events-none z-20"
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}
            </div>

            {/* Paliers temporels sous la barre */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>0s</span>
              {AUDIO_UNLOCK_DURATIONS.map((dur, i) => (
                <span
                  key={i}
                  className={i <= currentStep ? 'text-purple-300 font-bold' : 'text-slate-600'}
                >
                  {dur}s
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Barre de Progression des 5 Essais */}
        <div className="px-4 py-3 bg-[#0c0a18] border-t border-purple-500/20 flex items-center justify-center gap-2">
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
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400 ring-2 ring-purple-500/30'
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
                    ? 'bg-[#0f172a] border-purple-500/30 text-white shadow-sm'
                    : 'bg-[#0b0f19]/60 border-[#1e293b]/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    {isUnlocked ? (
                      <Unlock className="w-3 h-3 text-purple-400" />
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
                    ? 'Rechercher un jeu indé (ex: Undertale, Celeste, Hollow Knight)...'
                    : 'Search an indie game (e.g. Undertale, Celeste, Hollow Knight)...'
                }
                className="w-full pl-10 pr-24 py-3 bg-[#0f172a] border border-[#1e293b] focus:border-purple-400 rounded-xl text-sm text-white placeholder-slate-500 outline-hidden transition-all shadow-inner"
              />

              {/* Bouton Passer un essai */}
              <button
                onClick={handleSkip}
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title={isFr ? 'Débloque plus de secondes audio sans deviner' : 'Unlock more audio seconds without guessing'}
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
                        idx === selectedIndex ? 'bg-purple-500/15 text-white' : 'text-slate-300 hover:bg-[#131d36]'
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
                          {game.hints.composer ? `${game.hints.composer} • ` : ''}
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
                <span>{isFr ? 'Oreille Absolue !' : 'Perfect Pitch!'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {puzzle.targetGame.title}
              </h3>
              <p className="text-xs text-slate-400">
                {isFr
                  ? `Morceau identifié en ${guesses.length} essai${guesses.length > 1 ? 's' : ''} (${puzzle.trackTitle} par ${puzzle.composer}).`
                  : `Track identified in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''} (${puzzle.trackTitle} by ${puzzle.composer}).`}
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
                  ? `C'était « ${puzzle.trackTitle} » composé par ${puzzle.composer}.`
                  : `It was "${puzzle.trackTitle}" composed by ${puzzle.composer}.`}
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
                <div className="text-[11px] text-purple-300 truncate font-mono">
                  🎵 {puzzle.trackTitle}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {puzzle.composer} • {puzzle.targetGame.releaseYear}
                </div>
              </div>
            </div>

            {puzzle.targetGame.steamUrl && (
              <a
                href={puzzle.targetGame.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1 shrink-0 transition-all shadow-sm"
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
                game="blindtest"
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
