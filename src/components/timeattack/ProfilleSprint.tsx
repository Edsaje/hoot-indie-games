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
  FileSearch,
  Calendar,
  Building,
  Tag,
  Trophy,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { recordTimeAttackResult, getTimeAttackStats } from '../../utils/timeAttackStorage';
import { ShareResultModal } from '../common/ShareResultModal';
import type { ShareCardData } from '../../utils/generateShareCard';
import { useTranslation } from 'react-i18next';
import { checkGenreMatch } from '../profille/ProfilleGame';

interface ProfilleSprintProps {
  games: Game[];
  onBackToHub: () => void;
  onOpenLeaderboard?: () => void;
}

interface Question {
  game: Game;
  category: 'year' | 'developer' | 'genre';
  prompt: string;
  categoryBadge: string;
  choices: string[];
  correctChoice: string;
}

const STARTING_TIME = 60;
const BONUS_TIME = 3;
const PENALTY_TIME = 5;

export const ProfilleSprint: React.FC<ProfilleSprintProps> = ({ games, onBackToHub, onOpenLeaderboard }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(STARTING_TIME);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatingTimeText, setFloatingTimeText] = useState<{ id: number; text: string; color: string } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const stats = getTimeAttackStats().profille;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousGameIdsRef = useRef<Set<string>>(new Set());

  // Generate a Profille Sprint question (Year, Developer, or Genre for a showcased game)
  const generateQuestion = useCallback((): Question | null => {
    if (!games || games.length < 5) return null;

    let pool = games.filter((g) => !previousGameIdsRef.current.has(g.id));
    if (pool.length < 5) {
      previousGameIdsRef.current.clear();
      pool = games;
    }

    const game = pool[Math.floor(Math.random() * pool.length)];
    previousGameIdsRef.current.add(game.id);

    // Pick between Year (35%), Developer (35%), Genre (30%)
    const rand = Math.random();
    let category: 'year' | 'developer' | 'genre' = 'year';
    if (rand < 0.35) {
      category = 'year';
    } else if (rand < 0.7) {
      category = 'developer';
    } else {
      category = 'genre';
    }

    if (category === 'year') {
      const correctChoice = String(game.releaseYear);
      const deltaYears = [-4, -3, -2, -1, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
      const decoyYears: string[] = [];
      for (const d of deltaYears) {
        const y = String(game.releaseYear + d);
        if (y !== correctChoice && !decoyYears.includes(y)) {
          decoyYears.push(y);
        }
        if (decoyYears.length >= 3) break;
      }

      const choices = [correctChoice, ...decoyYears].sort(() => Math.random() - 0.5);
      return {
        game,
        category: 'year',
        prompt: lang === 'fr'
          ? `Quelle est l'année de sortie de "${game.title}" ?`
          : `What year was "${game.title}" released?`,
        categoryBadge: lang === 'fr' ? 'Année de Sortie' : 'Release Year',
        choices,
        correctChoice,
      };
    }

    if (category === 'developer') {
      const correctChoice = game.developer;
      const allDevs = Array.from(new Set(games.map((g) => g.developer).filter((d) => d && d !== correctChoice)));
      const decoyDevs = allDevs.sort(() => Math.random() - 0.5).slice(0, 3);

      if (decoyDevs.length < 3) {
        // Fallback to year question if not enough unique devs
        const correctYear = String(game.releaseYear);
        return {
          game,
          category: 'year',
          prompt: `Année de sortie de "${game.title}" ?`,
          categoryBadge: 'Année de Sortie',
          choices: [correctYear, String(game.releaseYear - 1), String(game.releaseYear + 1), String(game.releaseYear + 2)].sort(() => Math.random() - 0.5),
          correctChoice: correctYear,
        };
      }

      const choices = [correctChoice, ...decoyDevs].sort(() => Math.random() - 0.5);
      return {
        game,
        category: 'developer',
        prompt: lang === 'fr'
          ? `Quel studio ou créateur a développé "${game.title}" ?`
          : `Which developer or studio created "${game.title}"?`,
        categoryBadge: lang === 'fr' ? 'Studio de Dév' : 'Developer Studio',
        choices,
        correctChoice,
      };
    }

    // category === 'genre'
    const correctChoice = game.genre[0] || 'Aventure';
    const allGenres = Array.from(new Set(games.flatMap((g) => g.genre).filter((gen) => !checkGenreMatch(gen, game.genre))));
    const decoyGenres = allGenres.sort(() => Math.random() - 0.5).slice(0, 3);

    const choices = [correctChoice, ...decoyGenres].sort(() => Math.random() - 0.5);
    return {
      game,
      category: 'genre',
      prompt: lang === 'fr'
        ? `Quel est le genre principal de "${game.title}" ?`
        : `What is the primary genre of "${game.title}"?`,
      categoryBadge: lang === 'fr' ? 'Genre & Style' : 'Genre & Style',
      choices,
      correctChoice,
    };
  }, [games, lang]);

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
    setSelectedChoice(null);
    setFloatingTimeText(null);

    const firstQ = generateQuestion();
    setCurrentQuestion(firstQ);
    setGameState('playing');
  }, [generateQuestion]);

  // Main countdown timer
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

  // Game over check when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
      soundFx.playError();
      recordTimeAttackResult('profille', score, correctCount, totalCount, maxCombo);

      if (score > stats.highScore && score > 0) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6'],
        });
      }
    }
  }, [timeLeft, gameState, score, correctCount, totalCount, maxCombo, stats.highScore]);

  // Handle user's answer
  const handleAnswer = useCallback((choice: string) => {
    if (gameState !== 'playing' || feedback !== null || !currentQuestion) return;

    setSelectedChoice(choice);
    setTotalCount((prev) => prev + 1);

    const isCorrect = choice === currentQuestion.correctChoice;

    if (isCorrect) {
      soundFx.playChime();
      setFeedback('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const pointsEarned = 100 * combo;
      setScore((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);

      setTimeLeft((prev) => Math.min(STARTING_TIME * 1.5, prev + BONUS_TIME));
      setFloatingTimeText({
        id: Date.now(),
        text: `+${BONUS_TIME}s`,
        color: 'text-emerald-400',
      });
    } else {
      soundFx.playError();
      setFeedback('wrong');
      setCombo(1);

      setTimeLeft((prev) => Math.max(0, prev - PENALTY_TIME));
      setFloatingTimeText({
        id: Date.now(),
        text: `-${PENALTY_TIME}s`,
        color: 'text-rose-400',
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedChoice(null);
      setFloatingTimeText(null);

      const nextQ = generateQuestion();
      if (nextQ) {
        setCurrentQuestion(nextQ);
      }
    }, 450);
  }, [gameState, feedback, currentQuestion, combo, maxCombo, generateQuestion]);

  // Keyboard controls (1, 2, 3, 4)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== null || !currentQuestion) return;

      const keyIndex = parseInt(e.key, 10);
      if (keyIndex >= 1 && keyIndex <= currentQuestion.choices.length) {
        e.preventDefault();
        handleAnswer(currentQuestion.choices[keyIndex - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, feedback, currentQuestion, handleAnswer]);

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isNewRecord = score > stats.highScore && score > 0;

  const shareData: ShareCardData = {
    gameMode: lang === 'fr' ? 'Sprint Profil' : 'Profile Sprint',
    date: new Date().toISOString().split('T')[0],
    isWon: true,
    scoreText: `${score} pts (${correctCount} fiches résolues)`,
    details: [
      `Score : ${score} pts (Record : ${Math.max(score, stats.highScore)} pts)`,
      `Précision : ${accuracy}% (${correctCount}/${totalCount})`,
      `Combo Max : x${maxCombo}`,
    ],
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Top Header / Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Hub Time Attack</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'fr' ? 'Record :' : 'Best :'} {stats.highScore} pts</span>
          </div>
        </div>
      </div>

      {/* IDLE SCREEN (Ready to start) */}
      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <FileSearch className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            {lang === 'fr' ? 'Sprint Profil ⚡' : 'Profile Sprint ⚡'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
            {lang === 'fr'
              ? 'Identifiez les studios, années de sortie et genres des pépites indés sous un chrono de 60 secondes !'
              : 'Identify developers, release years, and primary genres under a 60-second timer!'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-8 text-left">
            <div className="p-3.5 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-emerald-400 font-bold text-sm mb-0.5">+3s & Multiplicateur</div>
              <p className="text-xs text-slate-400">
                {lang === 'fr' ? 'Chaque bonne réponse augmente le combo et ajoute du temps.' : 'Each correct answer builds combo & adds time.'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-rose-400 font-bold text-sm mb-0.5">-5s de Pénalité</div>
              <p className="text-xs text-slate-400">
                {lang === 'fr' ? 'Attention aux erreurs qui vident le chrono et réinitialisent le combo.' : 'Mistakes drain the clock and reset combo.'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-purple-400 font-bold text-sm mb-0.5">Touches 1, 2, 3, 4</div>
              <p className="text-xs text-slate-400">
                {lang === 'fr' ? 'Utilisez votre clavier ou appuyez directement pour aller plus vite.' : 'Use keyboard numbers 1-4 for fast inputs.'}
              </p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-base transition shadow-xl shadow-purple-500/25 active:scale-95 cursor-pointer"
          >
            {lang === 'fr' ? 'Lancer le Sprint (60s) 🚀' : 'Start Sprint (60s) 🚀'}
          </button>
        </motion.div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4">
          {/* HUD Banner */}
          <div className="flex items-center justify-between gap-3 p-4 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-xl">
            {/* Timer */}
            <div className="relative flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-black text-lg border transition ${
                  timeLeft <= 10
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                    : 'bg-[#131a29] border-[#1e293b] text-white'
                }`}
              >
                <Timer className="w-5 h-5 text-purple-400" />
                <span>{timeLeft}s</span>
              </div>

              {/* Floating +/- time notification */}
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

            {/* Score & Combo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-xs">
                <Flame className={`w-4 h-4 ${combo > 1 ? 'animate-bounce text-purple-400' : 'text-slate-500'}`} />
                <span>Combo x{combo}</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-xl font-black text-white font-mono">{score}</div>
              </div>
            </div>
          </div>

          {/* Showcased Game Identity Card */}
          <div
            className={`p-5 rounded-3xl bg-[#0f172a] border-2 transition-all shadow-2xl relative overflow-hidden ${
              feedback === 'correct'
                ? 'border-emerald-500 ring-4 ring-emerald-500/30'
                : feedback === 'wrong'
                ? 'border-rose-500 ring-4 ring-rose-500/30 animate-shake'
                : 'border-[#1e293b]'
            }`}
          >
            {/* Visual thumbnail & title banner */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-full sm:w-44 aspect-video rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                <img
                  src={
                    currentQuestion.game.screenshots[0] ||
                    'https://images.unsplash.com/photo-1550745165-9bc0b252726f'
                  }
                  alt={currentQuestion.game.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-1.5">
                  {currentQuestion.category === 'year' && <Calendar className="w-3 h-3 text-purple-400" />}
                  {currentQuestion.category === 'developer' && <Building className="w-3 h-3 text-purple-400" />}
                  {currentQuestion.category === 'genre' && <Tag className="w-3 h-3 text-purple-400" />}
                  <span>{currentQuestion.categoryBadge}</span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight">
                  {currentQuestion.game.title}
                </h3>
                <p className="text-xs text-slate-300 italic mt-0.5 line-clamp-2">
                  "{currentQuestion.game.hints.tagline[lang]}"
                </p>
              </div>
            </div>

            {/* Question prompt */}
            <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl text-center mb-4">
              <span className="text-sm font-bold text-white">{currentQuestion.prompt}</span>
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.choices.map((choice, idx) => {
                const isSelected = selectedChoice === choice;
                const isCorrect = choice === currentQuestion.correctChoice;

                let btnStyle = 'bg-[#131a29] hover:bg-[#1a233a] border-[#1e293b] text-slate-100';

                if (feedback !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                  } else {
                    btnStyle = 'opacity-40 bg-[#0b0f19] border-[#1e293b] text-slate-400';
                  }
                }

                return (
                  <button
                    key={choice}
                    onClick={() => handleAnswer(choice)}
                    disabled={feedback !== null}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition shadow cursor-pointer active:scale-98 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center text-xs font-mono font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-left leading-tight">{choice}</span>
                    </div>

                    {feedback !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {feedback !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 text-center shadow-2xl space-y-6"
        >
          {isNewRecord && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs animate-bounce">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Nouveau Record Personnel !</span>
            </div>
          )}

          <div>
            <h2 className="text-3xl font-black text-white mb-1">
              {lang === 'fr' ? 'Chrono Écoulé !' : "Time's Up!"}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'fr' ? 'Fin de la session Sprint Profil 60s' : 'End of Profile Sprint 60s session'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#131a29] border border-[#1e293b] max-w-sm mx-auto">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Score Final</div>
            <div className="text-5xl font-black text-purple-400 font-mono tracking-tight">{score}</div>
            <div className="text-xs text-slate-400 mt-2">
              Record précédent : {stats.highScore} pts
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
            <div className="p-3 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-xl font-black text-white">{correctCount}/{totalCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Résolus</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-xl font-black text-emerald-400">{accuracy}%</div>
              <div className="text-[11px] text-slate-400 font-medium">Précision</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#131a29] border border-[#1e293b]">
              <div className="text-xl font-black text-purple-400 font-mono">x{maxCombo}</div>
              <div className="text-[11px] text-slate-400 font-medium">Combo Max</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Rejouer (60s)' : 'Play Again (60s)'}</span>
            </button>

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLeaderboard();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>{lang === 'fr' ? 'Classement' : 'Leaderboard'}</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                setIsShareModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>{lang === 'fr' ? 'Partager mon score' : 'Share Score'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Share Modal */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareData}
      />
    </div>
  );
};
