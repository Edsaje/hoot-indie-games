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
  Sparkles,
  Link2,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { recordTimeAttackResult, getTimeAttackStats } from '../../utils/timeAttackStorage';
import { ShareResultModal } from '../common/ShareResultModal';
import type { ShareCardData } from '../../utils/generateShareCard';

interface LinkleSprintProps {
  games: Game[];
  onBackToHub: () => void;
}

interface Question {
  themeName: string;
  themeDescription: string;
  isIntruderMode: boolean;
  choices: Game[];
  correctGameId: string;
}

const STARTING_TIME = 60;
const BONUS_TIME = 3;
const PENALTY_TIME = 5;

export const LinkleSprint: React.FC<LinkleSprintProps> = ({ games, onBackToHub }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(STARTING_TIME);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatingTimeText, setFloatingTimeText] = useState<{ id: number; text: string; color: string } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const stats = getTimeAttackStats().linkle;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate a Linkle Sprint question
  const generateQuestion = useCallback((): Question | null => {
    if (!games || games.length < 8) return null;

    for (let attempt = 0; attempt < 10; attempt++) {
      // Pick between "Find the Match" (70%) or "Find the Intruder" (30%)
      const isIntruderMode = Math.random() < 0.3;

      // Available theme categories
      const themeTypes = ['genre', 'artStyle', 'yearRange', 'camera'];
      const themeType = themeTypes[Math.floor(Math.random() * themeTypes.length)];

      let themeName = '';
      let themeDescription = '';
      let matchingGames: Game[] = [];
      let nonMatchingGames: Game[] = [];

      if (themeType === 'genre') {
        const allGenres = Array.from(new Set(games.flatMap((g) => g.genre)));
        const targetGenre = allGenres[Math.floor(Math.random() * allGenres.length)];
        themeName = `Genre : ${targetGenre}`;
        themeDescription = isIntruderMode
          ? `Lequel de ces 4 jeux n'est PAS un ${targetGenre} ?`
          : `Lequel de ces 4 jeux est un ${targetGenre} ?`;

        matchingGames = games.filter((g) => g.genre.includes(targetGenre));
        nonMatchingGames = games.filter((g) => !g.genre.includes(targetGenre));
      } else if (themeType === 'artStyle') {
        const allStyles = Array.from(new Set(games.map((g) => g.artStyle.fr)));
        const targetStyle = allStyles[Math.floor(Math.random() * allStyles.length)];
        themeName = `Style visuel : ${targetStyle}`;
        themeDescription = isIntruderMode
          ? `Trouvez l'intrus qui n'est PAS en ${targetStyle}`
          : `Quel jeu arbore une direction artistique en ${targetStyle} ?`;

        matchingGames = games.filter((g) => g.artStyle.fr === targetStyle);
        nonMatchingGames = games.filter((g) => g.artStyle.fr !== targetStyle);
      } else if (themeType === 'camera') {
        const allCameras = Array.from(new Set(games.map((g) => g.camera.fr)));
        const targetCamera = allCameras[Math.floor(Math.random() * allCameras.length)];
        themeName = `Perspective : ${targetCamera}`;
        themeDescription = isIntruderMode
          ? `Trouvez l'intrus qui ne se joue PAS en ${targetCamera}`
          : `Quel jeu utilise une ${targetCamera} ?`;

        matchingGames = games.filter((g) => g.camera.fr === targetCamera);
        nonMatchingGames = games.filter((g) => g.camera.fr !== targetCamera);
      } else {
        const pivot = 2019;
        const isBefore = Math.random() < 0.5;
        themeName = isBefore ? 'Sorti avant 2019' : 'Sorti en 2019 ou après';
        themeDescription = isIntruderMode
          ? isBefore
            ? "Trouvez l'intrus sorti en 2019 ou plus tard"
            : "Trouvez l'intrus sorti avant 2019"
          : isBefore
          ? 'Lequel de ces jeux est paru avant 2019 ?'
          : 'Lequel de ces jeux est paru en 2019 ou plus tard ?';

        matchingGames = games.filter((g) => (isBefore ? g.releaseYear < pivot : g.releaseYear >= pivot));
        nonMatchingGames = games.filter((g) => (isBefore ? g.releaseYear >= pivot : g.releaseYear < pivot));
      }

      if (matchingGames.length < 1 || nonMatchingGames.length < 3) {
        continue;
      }

      let choices: Game[] = [];
      let correctGameId = '';

      if (isIntruderMode) {
        if (matchingGames.length < 3 || nonMatchingGames.length < 1) continue;
        const decoys = [...matchingGames].sort(() => Math.random() - 0.5).slice(0, 3);
        const intruder = nonMatchingGames[Math.floor(Math.random() * nonMatchingGames.length)];
        correctGameId = intruder.id;
        choices = [intruder, ...decoys].sort(() => Math.random() - 0.5);
      } else {
        const correct = matchingGames[Math.floor(Math.random() * matchingGames.length)];
        const decoys = [...nonMatchingGames].sort(() => Math.random() - 0.5).slice(0, 3);
        correctGameId = correct.id;
        choices = [correct, ...decoys].sort(() => Math.random() - 0.5);
      }

      return {
        themeName,
        themeDescription,
        isIntruderMode,
        choices,
        correctGameId,
      };
    }
    return null;
  }, [games]);

  const startGame = useCallback(() => {
    soundFx.playClick();
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setCorrectCount(0);
    setTotalCount(0);
    setTimeLeft(STARTING_TIME);
    setFeedback(null);
    setSelectedGameId(null);
    setFloatingTimeText(null);

    const firstQ = generateQuestion();
    setCurrentQuestion(firstQ);
    setGameState('playing');
  }, [generateQuestion]);

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

  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
      soundFx.playError();

      const result = recordTimeAttackResult('linkle', score, correctCount, totalCount, maxCombo);
      if (result.isNewHighScore && score > 0) {
        soundFx.playVictory();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8'],
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

  const handleSelectChoice = useCallback((game: Game) => {
    if (gameState !== 'playing' || !currentQuestion || selectedGameId) return;

    setSelectedGameId(game.id);
    setTotalCount((prev) => prev + 1);

    const isCorrect = game.id === currentQuestion.correctGameId;

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
        setSelectedGameId(null);
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
        setSelectedGameId(null);
        setFeedback(null);
        const nextQ = generateQuestion();
        setCurrentQuestion(nextQ);
      }, 550);
    }
  }, [gameState, currentQuestion, selectedGameId, combo, maxCombo, generateQuestion]);

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (currentQuestion.choices[index]) {
          handleSelectChoice(currentQuestion.choices[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentQuestion, handleSelectChoice]);

  const shareData: ShareCardData = {
    gameMode: 'Linkle Sprint',
    date: new Date().toISOString().slice(0, 10),
    isWon: score > 0,
    scoreText: `${score} pts • ${correctCount} connexions`,
    details: [
      `Score : ${score} points`,
      `Connexions trouvées : ${correctCount}`,
      `Combo Max : x${maxCombo} 🔥`,
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Hub Time Attack</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Record : {stats.highScore} pts</span>
          </div>
        </div>
      </div>

      {/* IDLE SCREEN */}
      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Linkle Sprint ⚡
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
            Reliez les jeux à leurs thématiques communes ou repérez l'intrus en <strong className="text-amber-400">60 secondes</strong> !
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-8 text-left">
            <div className="p-3.5 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-emerald-400 font-bold text-sm mb-0.5">+3s & Multiplicateur</div>
              <p className="text-xs text-slate-400">Chaque association correcte prolonge le compte à rebours.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-rose-400 font-bold text-sm mb-0.5">-5s de Pénalité</div>
              <p className="text-xs text-slate-400">Chaque fausse connexion ampute le chrono.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-amber-400 font-bold text-sm mb-0.5">Touches 1 à 4</div>
              <p className="text-xs text-slate-400">Jouez à la vitesse de l'éclair au clavier.</p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base transition shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer"
          >
            Lancer le Sprint Connexions (60s) 🚀
          </button>
        </motion.div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4">
          {/* HUD Banner */}
          <div className="flex items-center justify-between gap-3 p-4 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-xl">
            <div className="relative flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-black text-lg border transition ${
                  timeLeft <= 10
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                    : 'bg-[#131a29] border-[#1e293b] text-white'
                }`}
              >
                <Timer className="w-5 h-5 text-amber-400" />
                <span>{timeLeft}s</span>
              </div>

              <AnimatePresence>
                {floatingTimeText && (
                  <motion.span
                    key={floatingTimeText.id}
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1.2 }}
                    exit={{ opacity: 0, y: -30 }}
                    className={`absolute -top-6 left-12 font-black text-sm ${floatingTimeText.color}`}
                  >
                    {floatingTimeText.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs">
                <Flame className={`w-4 h-4 ${combo > 1 ? 'animate-bounce text-amber-400' : 'text-slate-500'}`} />
                <span>Combo x{combo}</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-xl font-black text-white font-mono">{score}</div>
              </div>
            </div>
          </div>

          {/* Theme Card */}
          <div
            className={`p-6 sm:p-8 bg-[#0f172a] border-2 rounded-3xl text-center shadow-2xl transition-all ${
              feedback === 'correct'
                ? 'border-emerald-500 ring-4 ring-emerald-500/30'
                : feedback === 'wrong'
                ? 'border-rose-500 ring-4 ring-rose-500/30 animate-shake'
                : 'border-[#1e293b]'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs mb-3">
              <Link2 className="w-3.5 h-3.5" />
              <span>{currentQuestion.themeName}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              {currentQuestion.themeDescription}
            </h2>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQuestion.choices.map((choice, index) => {
              const isSelected = selectedGameId === choice.id;
              const isCorrectAnswer = choice.id === currentQuestion.correctGameId;

              let btnStyle =
                'bg-[#0f172a] hover:bg-[#182133] border-[#1e293b] hover:border-slate-600 text-white';

              if (selectedGameId) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30';
                } else {
                  btnStyle = 'opacity-40 border-[#1e293b] text-slate-500';
                }
              }

              return (
                <button
                  key={choice.id}
                  disabled={Boolean(selectedGameId)}
                  onClick={() => handleSelectChoice(choice)}
                  className={`relative flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] shadow-md cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#131a29] border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-amber-400">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm tracking-tight">{choice.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {choice.releaseYear} • {choice.artStyle.fr}
                      </div>
                    </div>
                  </div>

                  {selectedGameId && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {selectedGameId && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            Temps Écoulé !
          </h2>
          <p className="text-xs text-slate-400 mb-6">Fin du sprint Linkle</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8">
            <div className="p-4 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Score Final</div>
              <div className="text-2xl font-black text-white font-mono">{score}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Connexions</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {correctCount}/{totalCount}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Combo Max</div>
              <div className="text-2xl font-black text-amber-400 font-mono">x{maxCombo}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Record</div>
              <div className="text-2xl font-black text-sky-400 font-mono">{stats.highScore}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Rejouer le Sprint</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setIsShareModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-white font-bold text-sm transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Partager mon score</span>
            </button>

            <button
              onClick={onBackToHub}
              className="px-5 py-3 rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white font-bold text-sm transition cursor-pointer"
            >
              Choisir un autre jeu
            </button>
          </div>

          <ShareResultModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            data={shareData}
          />
        </motion.div>
      )}
    </div>
  );
};
