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
  ThumbsUp,
  MessageSquareQuote,
  Forward,
  Trophy,
  Clock,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { recordTimeAttackResult, getTimeAttackStats } from '../../utils/timeAttackStorage';
import { ShareResultModal } from '../common/ShareResultModal';
import type { ShareCardData } from '../../utils/generateShareCard';
import { getRandomReviewPuzzle, type ReviewPuzzle } from '../../data/reviewPuzzles';
import { useTranslation } from 'react-i18next';

interface ReviewSprintProps {
  games: Game[];
  onBackToHub: () => void;
}

interface Question {
  puzzle: ReviewPuzzle;
  choices: Game[];
}

const STARTING_TIME = 60;
const BONUS_TIME = 3;
const PENALTY_TIME = 5;

export const ReviewSprint: React.FC<ReviewSprintProps> = ({ games, onBackToHub }) => {
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

  const stats = getTimeAttackStats().review;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousGameIdsRef = useRef<Set<string>>(new Set());

  // Génération d'une question de sprint Review
  const generateQuestion = useCallback((): Question | null => {
    if (!games || games.length < 4) return null;

    // Récupérer un puzzle de review
    let puzzle: ReviewPuzzle;
    let attempts = 0;
    do {
      const seed = `${Date.now()}_${Math.random()}`;
      puzzle = getRandomReviewPuzzle(seed);
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

  // Initialisation du sprint
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
    setCurrentQuestion(q);
  };

  // Fin du jeu
  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    soundFx.playVictory();

    const currentStats = getTimeAttackStats().review;
    const isNewHigh = score > currentStats.highScore;

    if (isNewHigh && score > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    recordTimeAttackResult('review', score, correctCount, totalCount, maxCombo);
  }, [score, correctCount, totalCount, maxCombo]);

  // Boucle de chronomètre
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

  // Gestion d'un choix
  const handleSelectChoice = (chosenGame: Game) => {
    if (feedback !== null || !currentQuestion || gameState !== 'playing') return;

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

    // Prochaine question après un court délai pour voir le dé-caviardage
    setTimeout(() => {
      setFeedback(null);
      setSelectedChoiceId(null);
      setFloatingTimeText(null);
      const nextQ = generateQuestion();
      if (nextQ) {
        setCurrentQuestion(nextQ);
      } else {
        handleGameOver();
      }
    }, 850);
  };

  // Sauter la question (Space)
  const handleSkip = useCallback(() => {
    if (feedback !== null || gameState !== 'playing') return;
    soundFx.playPop();
    setCombo(1);
    setTotalCount((prev) => prev + 1);
    const nextQ = generateQuestion();
    if (nextQ) {
      setCurrentQuestion(nextQ);
    }
  }, [feedback, gameState, generateQuestion]);

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

  // Données pour la modal de partage
  const shareCardData: ShareCardData = {
    gameMode: 'Review Sprint ⚡',
    date: new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US'),
    isWon: score > 0,
    scoreText: `${score} pts`,
    details: [
      `🎯 ${correctCount}/${totalCount} ${isFr ? 'bonnes réponses' : 'correct answers'}`,
      `🔥 Combo Max : x${maxCombo}`,
      `💬 ${isFr ? 'Critiques Steam authentiques' : 'Authentic Steam Reviews'}`,
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8 select-none">
      {/* HEADER / NAVIGATION */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToHub}
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

      {/* ÉTAT 1 : ÉCRAN D'ACCUEIL (IDLE) */}
      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 md:p-10 text-center relative overflow-hidden backdrop-blur-md shadow-2xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner text-cyan-400">
            <MessageSquareQuote className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-3">
            {isFr ? 'Sprint Critique Steam' : 'Steam Review Sprint'}
          </h2>
          <p className="text-slate-300 max-w-md mx-auto text-sm md:text-base mb-8 leading-relaxed">
            {isFr
              ? 'Identifiez les jeux indés d’après de vraies critiques de joueurs Steam caviardées (████) ! Enchaînez les bonnes réponses en 60 secondes.'
              : 'Identify indie games from authentic redacted Steam reviews! Chain correct answers within 60 seconds.'}
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
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{isFr ? 'Lancer le Sprint' : 'Start Sprint'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ÉTAT 2 : EN JEU (PLAYING) */}
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
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>

              {/* FLOATING BONUS/PENALTY */}
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

          {/* CARTE DE CRITIQUE STEAM */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 md:p-7 relative overflow-hidden backdrop-blur-md shadow-xl">
            {/* Header Steam Authentique */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  {currentQuestion.puzzle.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {currentQuestion.puzzle.author}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{currentQuestion.puzzle.hoursPlayed} {isFr ? 'h enregistrées' : 'hrs on record'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{isFr ? 'Recommandé' : 'Recommended'}</span>
                <span className="text-slate-500 text-[10px] ml-1">({currentQuestion.puzzle.reviewDate})</span>
              </div>
            </div>

            {/* Texte de la critique avec caviardage ou révélation */}
            <div className="mt-5 mb-3">
              <p className="text-base md:text-lg text-slate-200 leading-relaxed font-sans italic relative">
                "{feedback !== null
                  ? (isFr ? currentQuestion.puzzle.fullReviewFr : currentQuestion.puzzle.fullReviewEn)
                  : (isFr ? currentQuestion.puzzle.redactedReviewFr : currentQuestion.puzzle.redactedReviewEn)}"
              </p>
            </div>

            {/* Hint subtil si bloqué */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{isFr ? 'Clavier : touches 1 à 4 pour répondre' : 'Keyboard: keys 1 to 4 to answer'}</span>
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

              let btnStyle = 'bg-slate-800/80 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-white';

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

      {/* ÉTAT 3 : FIN DE PARTIE (GAMEOVER) */}
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

          <div className="flex flex-col gap-2.5">
            <button
              onClick={startGame}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFr ? 'Rejouer un Sprint' : 'Play Again'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>{isFr ? 'Partager le score' : 'Share Score'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* MODAL DE PARTAGE */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareCardData}
      />
    </div>
  );
};
