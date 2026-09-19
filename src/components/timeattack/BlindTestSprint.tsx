import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Timer,
  Zap,
  RotateCcw,
  Share2,
  Flame,
  XCircle,
  CheckCircle2,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Forward,
  Trophy,
  Disc,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { recordTimeAttackResult, getTimeAttackStats } from '../../utils/timeAttackStorage';
import { ShareResultModal } from '../common/ShareResultModal';
import type { ShareCardData } from '../../utils/generateShareCard';
import {
  getRandomBlindTestPuzzle,
  noteToFrequency,
  type BlindTestPuzzle,
} from '../../data/blindtestPuzzles';
import { useTranslation } from 'react-i18next';

interface BlindTestSprintProps {
  games: Game[];
  onBackToHub: () => void;
  onOpenLeaderboard?: () => void;
}

interface Question {
  puzzle: BlindTestPuzzle;
  choices: Game[];
}

const STARTING_TIME = 60;
const BONUS_TIME = 3;
const PENALTY_TIME = 5;
const CLIP_DURATION = 4.0; // 4 secondes d'extrait pour le sprint rapide

export const BlindTestSprint: React.FC<BlindTestSprintProps> = ({ games, onBackToHub, onOpenLeaderboard }) => {
  const { i18n } = useTranslation();
  const isFr = i18n.language.startsWith('fr');

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(STARTING_TIME);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatingTimeText, setFloatingTimeText] = useState<{ id: number; text: string; color: string } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Audio state
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ stop: () => void }[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stats = getTimeAttackStats().blindtest;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousGameIdsRef = useRef<Set<string>>(new Set());

  // Arrêter l'audio en cours
  const stopAudio = useCallback(() => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    activeNodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        // Ignorer
      }
    });
    activeNodesRef.current = [];
    setIsPlayingSound(false);
    setFrequencies(new Array(16).fill(0));
  }, []);

  // Nettoyage complet au démontage
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  // Jouer l'extrait synthétisé du puzzle
  const playPuzzleAudio = useCallback((puzzle: BlindTestPuzzle) => {
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

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.28, ctx.currentTime);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    const startTime = ctx.currentTime + 0.05;
    let noteTime = startTime;
    const melody = puzzle.audioConfig.melody;
    const instrument = puzzle.audioConfig.instrument;
    const nodes: { stop: () => void }[] = [];
    const playDuration = CLIP_DURATION;

    let noteIdx = 0;
    while (noteTime < startTime + playDuration && melody.length > 0) {
      const item = melody[noteIdx % melody.length];
      const dur = item.duration;
      const freq = noteToFrequency(item.note, item.octave);

      const timeLeftSec = (startTime + playDuration) - noteTime;
      if (timeLeftSec <= 0.02) break;

      const effectiveDur = Math.min(dur, timeLeftSec);

      if (freq > 0) {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        if (instrument === 'chiptune') {
          osc.type = 'square';
        } else if (instrument === 'synth') {
          osc.type = 'sawtooth';
        } else if (instrument === 'piano' || instrument === 'guitar') {
          osc.type = 'triangle';
        } else {
          osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(freq, noteTime);

        const attack = Math.min(0.04, effectiveDur * 0.2);
        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.3, noteTime + attack);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + effectiveDur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + effectiveDur);
        nodes.push(osc);
      }

      noteTime += dur;
      noteIdx++;
    }

    activeNodesRef.current = nodes;
    setIsPlayingSound(true);

    // Boucle d'animation pour l'analyseur de fréquence
    const updateFreqs = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const sampled: number[] = [];
      const step = Math.max(1, Math.floor(dataArray.length / 16));
      for (let i = 0; i < 16; i++) {
        sampled.push(dataArray[i * step] || 0);
      }
      setFrequencies(sampled);
      animFrameRef.current = requestAnimationFrame(updateFreqs);
    };
    animFrameRef.current = requestAnimationFrame(updateFreqs);

    playbackTimeoutRef.current = setTimeout(() => {
      stopAudio();
    }, playDuration * 1000);
  }, [isMuted, stopAudio]);

  // Génération de question de Blind Test
  const generateQuestion = useCallback((): Question | null => {
    if (!games || games.length < 4) return null;

    let puzzle: BlindTestPuzzle;
    let attempts = 0;
    do {
      const seed = `${Date.now()}_${Math.random()}`;
      puzzle = getRandomBlindTestPuzzle(seed);
      attempts++;
    } while (previousGameIdsRef.current.has(puzzle.targetGame.id) && attempts < 10);

    previousGameIdsRef.current.add(puzzle.targetGame.id);
    if (previousGameIdsRef.current.size > 20) {
      previousGameIdsRef.current.clear();
    }

    const decoys = games
      .filter((g) => g.id !== puzzle.targetGame.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const choices = [puzzle.targetGame, ...decoys].sort(() => Math.random() - 0.5);

    return {
      puzzle,
      choices,
    };
  }, [games]);

  // Début de partie
  const startGame = () => {
    setTimeLeft(STARTING_TIME);
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setCorrectCount(0);
    setTotalCount(0);
    setFeedback(null);
    setSelectedChoiceId(null);
    setGameState('playing');
    previousGameIdsRef.current.clear();

    const q = generateQuestion();
    if (q) {
      setCurrentQuestion(q);
      playPuzzleAudio(q.puzzle);
    }
  };

  // Fin du jeu
  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    stopAudio();
    soundFx.playVictory();

    const currentStats = getTimeAttackStats().blindtest;
    const isNewHigh = score > currentStats.highScore;

    if (isNewHigh && score > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    recordTimeAttackResult('blindtest', score, correctCount, totalCount, maxCombo);
  }, [score, correctCount, totalCount, maxCombo, stopAudio]);

  // Horloge 60s
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, handleGameOver]);

  // Clic sur un choix
  const handleSelectChoice = (chosenGame: Game) => {
    if (feedback !== null || !currentQuestion || gameState !== 'playing') return;

    stopAudio();
    const isCorrect = chosenGame.id === currentQuestion.puzzle.targetGame.id;
    setSelectedChoiceId(chosenGame.id);
    setTotalCount((prev) => prev + 1);

    if (isCorrect) {
      soundFx.playSuccess();
      setFeedback('correct');
      setCorrectCount((prev) => prev + 1);

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      const pointsEarned = 100 * combo;
      setScore((prev) => prev + pointsEarned);

      setTimeLeft((prev) => Math.min(prev + BONUS_TIME, 99));
      setFloatingTimeText({
        id: Date.now(),
        text: `+${BONUS_TIME}s (+${pointsEarned} pts)`,
        color: 'text-emerald-400',
      });
    } else {
      soundFx.playError();
      setFeedback('wrong');
      setCombo(1);

      setTimeLeft((prev) => {
        const next = prev - PENALTY_TIME;
        if (next <= 0) {
          setTimeout(handleGameOver, 400);
          return 0;
        }
        return next;
      });

      setFloatingTimeText({
        id: Date.now(),
        text: `-${PENALTY_TIME}s`,
        color: 'text-rose-400',
      });
    }

    // Charger la prochaine question
    setTimeout(() => {
      setFeedback(null);
      setSelectedChoiceId(null);
      setFloatingTimeText(null);
      const nextQ = generateQuestion();
      if (nextQ) {
        setCurrentQuestion(nextQ);
        playPuzzleAudio(nextQ.puzzle);
      } else {
        handleGameOver();
      }
    }, 700);
  };

  // Passer la question
  const handleSkip = useCallback(() => {
    if (feedback !== null || gameState !== 'playing') return;
    stopAudio();
    soundFx.playPop();
    setCombo(1);
    setTotalCount((prev) => prev + 1);
    const nextQ = generateQuestion();
    if (nextQ) {
      setCurrentQuestion(nextQ);
      playPuzzleAudio(nextQ.puzzle);
    }
  }, [feedback, gameState, generateQuestion, playPuzzleAudio, stopAudio]);

  // Raccourcis clavier (1, 2, 3, 4, Espace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || feedback !== null || !currentQuestion) return;

      if (['1', '&'].includes(e.key) && currentQuestion.choices[0]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[0]);
      } else if (['2', 'é'].includes(e.key) && currentQuestion.choices[1]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[1]);
      } else if (['3', '"'].includes(e.key) && currentQuestion.choices[2]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[2]);
      } else if (['4', "'"].includes(e.key) && currentQuestion.choices[3]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[3]);
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, feedback, currentQuestion, handleSkip]);

  // Données de partage
  const shareCardData: ShareCardData = {
    gameMode: 'Blind Test Sprint ⚡',
    date: new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US'),
    isWon: score > 0,
    scoreText: `${score} pts`,
    details: [
      `🎯 ${correctCount}/${totalCount} ${isFr ? 'bonnes réponses' : 'correct answers'}`,
      `🔥 Combo Max : x${maxCombo}`,
      `🎵 ${isFr ? 'Reconnaissance auditive OST' : 'OST audio recognition'}`,
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8 select-none">
      {/* NAVIGATION */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            stopAudio();
            onBackToHub();
          }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isFr ? 'Hub Time Attack' : 'Time Attack Hub'}</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>{isFr ? 'Record :' : 'Best:'} {stats.highScore} pts</span>
          </div>
        </div>
      </div>

      {/* ÉCRAN ACCUEIL */}
      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 md:p-10 text-center relative overflow-hidden backdrop-blur-md shadow-2xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-fuchsia-600/30 to-pink-500/20 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner text-fuchsia-400">
            <Music className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-3">
            {isFr ? 'Sprint Blind Test OST' : 'OST Blind Test Sprint'}
          </h2>
          <p className="text-slate-300 max-w-md mx-auto text-sm md:text-base mb-8 leading-relaxed">
            {isFr
              ? 'Écoutez les hooks mélodiques synthétisés des plus grandes OST indés et devinez le jeu en une fraction de seconde !'
              : 'Listen to synthesized melodic hooks from iconic indie OSTs and guess the game in a fraction of a second!'}
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8 text-center">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="text-lg font-black text-amber-400">60s</div>
              <div className="text-[11px] text-slate-400">{isFr ? 'Chrono' : 'Timer'}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="text-lg font-black text-emerald-400">+{BONUS_TIME}s</div>
              <div className="text-[11px] text-slate-400">{isFr ? 'Bonne rép.' : 'Correct'}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="text-lg font-black text-rose-400">-{PENALTY_TIME}s</div>
              <div className="text-[11px] text-slate-400">{isFr ? 'Erreur' : 'Wrong'}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{isFr ? 'Lancer le Sprint' : 'Start Sprint'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* EN JEU */}
      {gameState === 'playing' && currentQuestion && (
        <div className="flex flex-col gap-5">
          {/* BARRE DE SCORE & TIMER */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
            {/* TIMER */}
            <div className="flex items-center gap-3 relative">
              <div
                className={`p-2.5 rounded-lg font-mono font-bold flex items-center gap-2 text-lg ${
                  timeLeft <= 10
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-fuchsia-400 border border-slate-700'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>

              <AnimatePresence>
                {floatingTimeText && (
                  <motion.span
                    key={floatingTimeText.id}
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -24, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute -top-3 left-24 font-black text-sm ${floatingTimeText.color}`}
                  >
                    {floatingTimeText.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* COMBO */}
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  combo > 1
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 scale-105'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <Flame className={`w-4 h-4 ${combo > 1 ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>x{combo}</span>
              </div>
            </div>

            {/* SCORE */}
            <div className="text-right">
              <div className="text-xs text-slate-400">{isFr ? 'Score' : 'Score'}</div>
              <div className="text-2xl font-black text-white font-mono">{score}</div>
            </div>
          </div>

          {/* LECTEUR AUDIO SYNTH & VISUALISEUR */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md shadow-xl flex flex-col items-center">
            {/* Vinyle en rotation */}
            <div className="relative mb-5">
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-700 bg-slate-950 flex items-center justify-center shadow-2xl transition-transform ${
                  isPlayingSound ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '3s' }}
              >
                <div className="w-10 h-10 rounded-full bg-fuchsia-600/30 border-2 border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                  <Disc className="w-6 h-6" />
                </div>
              </div>

              {/* Bouton Play / Replay au survol ou clic */}
              <button
                onClick={() => {
                  if (isPlayingSound) {
                    stopAudio();
                  } else {
                    playPuzzleAudio(currentQuestion.puzzle);
                  }
                }}
                className="absolute -bottom-2 right-0 p-2.5 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/40 transition-transform active:scale-90"
              >
                {isPlayingSound ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
            </div>

            {/* Titre du morceau / Instrument */}
            <div className="text-center mb-5">
              <div className="text-xs text-fuchsia-400/90 font-medium tracking-wide uppercase mb-1">
                {currentQuestion.puzzle.audioConfig.instrument} • {currentQuestion.puzzle.audioConfig.bpm} BPM
              </div>
              <div className="text-lg font-bold text-white">
                {isPlayingSound ? (isFr ? 'Lecture de l’extrait en cours...' : 'Playing track hook...') : (isFr ? 'Morceau en pause' : 'Track paused')}
              </div>
            </div>

            {/* Spectre de fréquence (16 barres animées) */}
            <div className="w-full max-w-sm h-12 flex items-end justify-center gap-1.5 px-4 mb-4">
              {frequencies.map((val, i) => {
                const heightPercent = isPlayingSound ? Math.max(12, Math.round((val / 255) * 100)) : 10;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-fuchsia-600 to-pink-400 rounded-t-sm transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Contrôle Muet & Passer */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isMuted ? (isFr ? 'Son coupé' : 'Muted') : (isFr ? 'Actif' : 'Sound on')}</span>
              </button>

              <button
                onClick={handleSkip}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <span>{isFr ? 'Passer (Espace)' : 'Skip (Space)'}</span>
                <Forward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CHOIX DES 4 JEUX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.choices.map((choice, idx) => {
              const isSelected = selectedChoiceId === choice.id;
              const isTarget = choice.id === currentQuestion.puzzle.targetGame.id;

              let btnStyle = 'bg-slate-800/80 border-slate-700 hover:border-fuchsia-500/50 hover:bg-slate-800 text-white';

              if (feedback !== null) {
                if (isTarget) {
                  btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected && !isTarget) {
                  btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold';
                } else {
                  btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={choice.id}
                  disabled={feedback !== null}
                  onClick={() => handleSelectChoice(choice)}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all transform active:scale-98 ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex-1 text-left truncate font-semibold text-sm">
                    {choice.title}
                  </div>

                  {feedback !== null && isTarget && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {feedback !== null && isSelected && !isTarget && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FIN DE PARTIE */}
      {gameState === 'gameover' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 md:p-8 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-white mb-1">
            {isFr ? 'Temps Écoulé !' : 'Time Out!'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {score > stats.highScore
              ? (isFr ? '🔥 Nouveau record personnel !' : '🔥 New personal best!')
              : (isFr ? 'Session Time Attack terminée' : 'Time Attack session completed')}
          </p>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-6">
            <div className="text-xs text-slate-400 mb-1">{isFr ? 'Score Final' : 'Final Score'}</div>
            <div className="text-4xl font-black text-amber-400 font-mono mb-4">{score} pts</div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-center">
              <div>
                <div className="text-xs text-slate-400">{isFr ? 'Bonnes Rép.' : 'Correct'}</div>
                <div className="text-base font-bold text-white">{correctCount} / {totalCount}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">{isFr ? 'Précision' : 'Accuracy'}</div>
                <div className="text-base font-bold text-white">
                  {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">{isFr ? 'Combo Max' : 'Max Combo'}</div>
                <div className="text-base font-bold text-amber-300">x{maxCombo}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-fuchsia-600/20 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFr ? 'Rejouer un Sprint' : 'Play Again'}</span>
            </button>

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLeaderboard();
                }}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-fuchsia-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-fuchsia-500/40 shadow-sm active:scale-95 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-fuchsia-400" />
                <span>{isFr ? 'Classement' : 'Leaderboard'}</span>
              </button>
            )}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-fuchsia-400" />
              <span>{isFr ? 'Partager le score' : 'Share Score'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* MODAL PARTAGE */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareCardData}
      />
    </div>
  );
};
