import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Timer,
  Zap,
  RotateCcw,
  Share2,
  ChevronRight,
  Flame,
  XCircle,
  CheckCircle2,
  Sliders,
  Forward,
  Trophy,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { recordTimeAttackResult, getTimeAttackStats } from '../../utils/timeAttackStorage';
import { ShareResultModal } from '../common/ShareResultModal';
import type { ShareCardData } from '../../utils/generateShareCard';
import { useTranslation } from 'react-i18next';

interface PixelSprintProps {
  games: Game[];
  onBackToHub: () => void;
}

interface Question {
  targetGame: Game;
  imageUrl: string;
  choices: Game[];
}

const STARTING_TIME = 60;
const BONUS_TIME = 3;
const PENALTY_TIME = 5;
const PIXEL_RESOLUTION = 24; // Résolution de dé-pixellisation pour le sprint (24px)

export const PixelSprint: React.FC<PixelSprintProps> = ({ games, onBackToHub }) => {
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stats = getTimeAttackStats().pixel;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousGameIdsRef = useRef<Set<string>>(new Set());

  // Génération de question Pixel Sprint
  const generateQuestion = useCallback((): Question | null => {
    if (!games || games.length < 4) return null;

    let pool = games.filter((g) => !previousGameIdsRef.current.has(g.id) && g.screenshots && g.screenshots.length > 0);
    if (pool.length === 0) {
      previousGameIdsRef.current.clear();
      pool = games.filter((g) => g.screenshots && g.screenshots.length > 0);
    }

    const targetGame = pool[Math.floor(Math.random() * pool.length)];
    previousGameIdsRef.current.add(targetGame.id);

    const imageUrl = targetGame.screenshots[0];

    const decoys = games
      .filter((g) => g.id !== targetGame.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const choices = [targetGame, ...decoys].sort(() => Math.random() - 0.5);

    return {
      targetGame,
      imageUrl,
      choices,
    };
  }, [games]);

  // Rendu de la pixellisation sur le canevas HTML5
  useEffect(() => {
    if (!currentQuestion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentQuestion.imageUrl;

    img.onload = () => {
      canvas.width = 384;
      canvas.height = 216;

      if (feedback !== null) {
        // En cas de feedback (réponse donnée), révéler l'image nette !
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return;
      }

      // Sous-échantillonnage dynamique pour la pixellisation
      const offscreen = document.createElement('canvas');
      const targetW = PIXEL_RESOLUTION;
      const targetH = Math.round(targetW * (9 / 16));
      offscreen.width = targetW;
      offscreen.height = targetH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, targetW, targetH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, targetW, targetH, 0, 0, canvas.width, canvas.height);
    };
  }, [currentQuestion, feedback]);

  const startGame = useCallback(() => {
    soundFx.playClick();
    previousGameIdsRef.current.clear();
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setCorrectCount(0);
    setTotalCount(0);
    setTimeLeft(STARTING_TIME);
    setFeedback(null);
    setSelectedChoiceId(null);
    setFloatingTimeText(null);

    const firstQ = generateQuestion();
    setCurrentQuestion(firstQ);
    setGameState('playing');
  }, [generateQuestion]);

  // Horloge du sprint
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Fin de partie
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
      soundFx.playError();

      const result = recordTimeAttackResult('pixel', score, correctCount, totalCount, maxCombo);
      if (result.isNewHighScore && score > 0) {
        soundFx.playVictory();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981'],
        });
      }
    }
  }, [timeLeft, gameState, score, correctCount, totalCount, maxCombo]);

  const triggerFloatingText = (text: string, color: string) => {
    setFloatingTimeText({ id: Date.now(), text, color });
    setTimeout(() => {
      setFloatingTimeText(null);
    }, 800);
  };

  const handleSelectChoice = useCallback(
    (game: Game) => {
      if (gameState !== 'playing' || !currentQuestion || selectedChoiceId) return;

      setSelectedChoiceId(game.id);
      setTotalCount((prev) => prev + 1);

      const isCorrect = game.id === currentQuestion.targetGame.id;

      if (isCorrect) {
        soundFx.playChime();
        setFeedback('correct');
        const earned = 100 * combo;
        setScore((prev) => prev + earned);
        setCorrectCount((prev) => prev + 1);

        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        setTimeLeft((prev) => prev + BONUS_TIME);
        triggerFloatingText(`+${BONUS_TIME}s`, 'text-emerald-400');

        setTimeout(() => {
          setSelectedChoiceId(null);
          setFeedback(null);
          const nextQ = generateQuestion();
          setCurrentQuestion(nextQ);
        }, 350);
      } else {
        soundFx.playError();
        setFeedback('wrong');
        setCombo(1);

        setTimeLeft((prev) => Math.max(0, prev - PENALTY_TIME));
        triggerFloatingText(`-${PENALTY_TIME}s`, 'text-rose-500');

        setTimeout(() => {
          setSelectedChoiceId(null);
          setFeedback(null);
          const nextQ = generateQuestion();
          setCurrentQuestion(nextQ);
        }, 550);
      }
    },
    [gameState, currentQuestion, selectedChoiceId, combo, maxCombo, generateQuestion]
  );

  const handleSkip = useCallback(() => {
    if (gameState !== 'playing' || !currentQuestion || selectedChoiceId) return;
    soundFx.playClick();
    setCombo(1);
    setTotalCount((prev) => prev + 1);
    setTimeLeft((prev) => Math.max(0, prev - 2));
    triggerFloatingText('-2s', 'text-amber-400');

    const nextQ = generateQuestion();
    setCurrentQuestion(nextQ);
  }, [gameState, currentQuestion, selectedChoiceId, generateQuestion]);

  // Raccourcis clavier (1, 2, 3, 4 et Espace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startGame();
        return;
      }
      if (gameState !== 'playing') return;

      if (e.key === '1' && currentQuestion?.choices[0]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[0]);
      } else if (e.key === '2' && currentQuestion?.choices[1]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[1]);
      } else if (e.key === '3' && currentQuestion?.choices[2]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[2]);
      } else if (e.key === '4' && currentQuestion?.choices[3]) {
        e.preventDefault();
        handleSelectChoice(currentQuestion.choices[3]);
      } else if (e.key === ' ') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentQuestion, startGame, handleSelectChoice, handleSkip]);

  const shareCardData: ShareCardData = {
    gameMode: 'Pixel Sprint ⚡',
    date: new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US'),
    isWon: score > 0,
    scoreText: `${score} pts`,
    details: [
      `🎯 ${correctCount}/${totalCount} ${isFr ? 'mosaïques devinées' : 'mosaics guessed'}`,
      `🔥 Combo Max : x${maxCombo}`,
      `⚡ ${isFr ? 'Sprint Dé-pixellisation 60s' : '60-second Pixel Sprint'}`,
    ],
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Barre supérieure */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundFx.playClick();
            onBackToHub();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          <span>{isFr ? 'Hub Time Attack' : 'Time Attack Hub'}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Pixel Sprint
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              High Score : <span className="text-cyan-400 font-bold">{stats.highScore} pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* ÉCRAN D'ACCUEIL IDLE */}
      {gameState === 'idle' && (
        <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Sliders className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Pixel Sprint ⚡
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isFr
                ? 'Reconnaîtrez-vous les jeux indés sous leur mosaïque ultra-pixelisée ? Répondez le plus vite possible avant la fin des 60 secondes !'
                : 'Can you identify indie games beneath heavy pixelation? Answer as fast as possible before the 60 seconds run out!'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto text-left">
            <div className="p-3 rounded-xl bg-[#131a29]/80 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Temps' : 'Time'}</div>
              <div className="text-lg font-black text-cyan-400">60s</div>
            </div>
            <div className="p-3 rounded-xl bg-[#131a29]/80 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Bonne réponse' : 'Correct'}</div>
              <div className="text-lg font-black text-emerald-400">+3s & +100pts</div>
            </div>
            <div className="p-3 rounded-xl bg-[#131a29]/80 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Erreur' : 'Error'}</div>
              <div className="text-lg font-black text-rose-400">-5s & Combo 0</div>
            </div>
            <div className="p-3 rounded-xl bg-[#131a29]/80 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Multiplicateur</div>
              <div className="text-lg font-black text-amber-400">x Combo</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>{isFr ? 'Démarrer le Sprint (Entrée / Espace)' : 'Start Sprint (Enter / Space)'}</span>
          </button>
        </div>
      )}

      {/* ÉCRAN DE JEU PLAYING */}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4">
          {/* Dashboard HUD */}
          <div className="flex items-center justify-between p-3.5 bg-[#0b0f19] border border-[#1e293b] rounded-2xl shadow-lg">
            {/* Timer */}
            <div className="flex items-center gap-2 relative">
              <div className={`p-2 rounded-xl ${timeLeft <= 10 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-cyan-500/20 text-cyan-400'}`}>
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isFr ? 'Temps' : 'Time'}</div>
                <div className={`text-xl font-black font-mono ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>

              {/* Texte flottant */}
              <AnimatePresence>
                {floatingTimeText && (
                  <motion.div
                    key={floatingTimeText.id}
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -25, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className={`absolute -top-3 left-16 font-black text-sm ${floatingTimeText.color}`}
                  >
                    {floatingTimeText.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Score & Combo */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                <div className="text-xl font-black font-mono text-cyan-400">{score}</div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-mono font-black text-sm">x{combo}</span>
              </div>
            </div>
          </div>

          {/* Zone Visuelle Pixellisée (Canvas) */}
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-center relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Mosaïque 24px</span>
              </span>

              <button
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title={isFr ? 'Passer cette question (-2s)' : 'Skip question (-2s)'}
              >
                <span>{isFr ? 'Passer' : 'Skip'}</span>
                <Forward className="w-3 h-3" />
                <span className="text-[10px] text-slate-500">(Espace)</span>
              </button>
            </div>

            {/* Canevas Pixel */}
            <div className="w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden border border-cyan-500/30 shadow-inner bg-black flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>

            {/* 4 Choix de réponses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {currentQuestion.choices.map((game, idx) => {
                const isSelected = selectedChoiceId === game.id;
                let btnStyle = 'bg-[#131a29] hover:bg-slate-800 border-[#1e293b] text-slate-200 hover:border-cyan-500/50';

                if (isSelected) {
                  if (feedback === 'correct') {
                    btnStyle = 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/30';
                  } else if (feedback === 'wrong') {
                    btnStyle = 'bg-rose-500 text-white font-black border-rose-400 shadow-lg shadow-rose-500/30';
                  }
                } else if (feedback && game.id === currentQuestion.targetGame.id) {
                  btnStyle = 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300';
                }

                return (
                  <button
                    key={game.id}
                    onClick={() => handleSelectChoice(game)}
                    disabled={selectedChoiceId !== null}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-slate-300">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{game.title}</div>
                        <div className="text-[11px] text-slate-400 truncate opacity-80">{game.developer} • {game.releaseYear}</div>
                      </div>
                    </div>

                    {isSelected && feedback === 'correct' && (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-slate-950" />
                    )}
                    {isSelected && feedback === 'wrong' && (
                      <XCircle className="w-5 h-5 shrink-0 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ÉCRAN DE FIN GAMEOVER */}
      {gameState === 'gameover' && (
        <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isFr ? 'Temps Écoulé !' : "Time's Up!"}
            </h2>
            <p className="text-xs text-slate-400">
              {isFr ? 'Bilan de votre session Pixel Sprint' : 'Your Pixel Sprint breakdown'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131a29]/90 border border-cyan-500/30 max-w-sm mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">Score Final</div>
            <div className="text-4xl font-black font-mono text-cyan-400 py-1">{score} pts</div>
            {score > stats.highScore && score > 0 && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase">
                🎉 {isFr ? 'Nouveau Record Personnel !' : 'New High Score!'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
            <div className="p-3 rounded-xl bg-[#131a29]/60 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Précision' : 'Accuracy'}</div>
              <div className="text-base font-black text-emerald-400">
                {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#131a29]/60 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Réussies' : 'Solved'}</div>
              <div className="text-base font-black text-white">{correctCount}/{totalCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#131a29]/60 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Combo Max</div>
              <div className="text-base font-black text-amber-400">x{maxCombo}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFr ? 'Rejouer (Entrée)' : 'Play Again (Enter)'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-slate-200 font-bold text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>{isFr ? 'Partager mon score' : 'Share Score'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modale de partage */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareCardData}
      />
    </div>
  );
};
