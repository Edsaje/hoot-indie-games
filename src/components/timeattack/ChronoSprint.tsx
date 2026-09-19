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
  History,
  Forward,
  Trophy,
  ArrowUpDown,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';
import { recordTimeAttackResult, getTimeAttackStats } from '../../utils/timeAttackStorage';
import { ShareResultModal } from '../common/ShareResultModal';
import type { ShareCardData } from '../../utils/generateShareCard';
import { useTranslation } from 'react-i18next';

interface ChronoSprintProps {
  games: Game[];
  onBackToHub: () => void;
}

interface Question {
  type: 'first' | 'before_after' | 'exact_year';
  prompt: string;
  badge: string;
  anchorGame?: Game;
  choices: { label: string; isCorrect: boolean; subtext?: string }[];
}

const STARTING_TIME = 60;
const BONUS_TIME = 3;
const PENALTY_TIME = 5;

export const ChronoSprint: React.FC<ChronoSprintProps> = ({ games, onBackToHub }) => {
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
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatingTimeText, setFloatingTimeText] = useState<{ id: number; text: string; color: string } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const stats = getTimeAttackStats().chrono;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousGameIdsRef = useRef<Set<string>>(new Set());

  // Générateur de questions chronologiques express
  const generateQuestion = useCallback((): Question | null => {
    if (!games || games.length < 6) return null;

    let pool = games.filter((g) => !previousGameIdsRef.current.has(g.id));
    if (pool.length < 6) {
      previousGameIdsRef.current.clear();
      pool = games;
    }

    const rand = Math.random();

    // Type 1 (45%) : Duel temporel direct "Lequel est sorti en premier ?"
    if (rand < 0.45) {
      const g1 = pool[Math.floor(Math.random() * pool.length)];
      const otherPool = games.filter((g) => g.id !== g1.id && Math.abs(g.releaseYear - g1.releaseYear) >= 1);
      const g2 = otherPool[Math.floor(Math.random() * otherPool.length)];

      previousGameIdsRef.current.add(g1.id);
      previousGameIdsRef.current.add(g2.id);

      const isG1First = g1.releaseYear < g2.releaseYear;
      const choices = [
        { label: g1.title, isCorrect: isG1First, subtext: `${g1.developer}` },
        { label: g2.title, isCorrect: !isG1First, subtext: `${g2.developer}` },
      ].sort(() => Math.random() - 0.5);

      return {
        type: 'first',
        prompt: isFr ? 'Lequel de ces deux jeux est sorti le PREMIER ?' : 'Which of these games was released FIRST?',
        badge: isFr ? 'Duel Chrono' : 'Chrono Duel',
        choices,
      };
    }

    // Type 2 (35%) : "Par rapport à [Jeu A], [Jeu B] est sorti :" (Avant ou Après)
    if (rand < 0.80) {
      const anchor = pool[Math.floor(Math.random() * pool.length)];
      const targetPool = games.filter((g) => g.id !== anchor.id && g.releaseYear !== anchor.releaseYear);
      const target = targetPool[Math.floor(Math.random() * targetPool.length)];

      previousGameIdsRef.current.add(anchor.id);
      previousGameIdsRef.current.add(target.id);

      const isBefore = target.releaseYear < anchor.releaseYear;

      const choices = [
        {
          label: isFr ? `AVANT (${anchor.title})` : `BEFORE (${anchor.title})`,
          isCorrect: isBefore,
        },
        {
          label: isFr ? `APRÈS (${anchor.title})` : `AFTER (${anchor.title})`,
          isCorrect: !isBefore,
        },
      ];

      return {
        type: 'before_after',
        prompt: isFr
          ? `"${target.title}" est sorti AVANT ou APRÈS "${anchor.title}" (${anchor.releaseYear}) ?`
          : `Was "${target.title}" released BEFORE or AFTER "${anchor.title}" (${anchor.releaseYear})?`,
        badge: isFr ? 'Avant ou Après ?' : 'Before or After?',
        anchorGame: anchor,
        choices,
      };
    }

    // Type 3 (20%) : "Lequel de ces 4 jeux est sorti en [Année] ?"
    const targetGame = pool[Math.floor(Math.random() * pool.length)];
    previousGameIdsRef.current.add(targetGame.id);

    const decoys = games
      .filter((g) => g.id !== targetGame.id && g.releaseYear !== targetGame.releaseYear)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const fourGames = [targetGame, ...decoys].sort(() => Math.random() - 0.5);

    return {
      type: 'exact_year',
      prompt: isFr
        ? `Quel jeu indé est sorti en ${targetGame.releaseYear} ?`
        : `Which indie game was released in ${targetGame.releaseYear}?`,
      badge: isFr ? 'Année Précise' : 'Exact Year',
      choices: fourGames.map((g) => ({
        label: g.title,
        isCorrect: g.id === targetGame.id,
        subtext: `${g.developer}`,
      })),
    };
  }, [games, isFr]);

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
    setSelectedChoiceIdx(null);
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

      const result = recordTimeAttackResult('chrono', score, correctCount, totalCount, maxCombo);
      if (result.isNewHighScore && score > 0) {
        soundFx.playVictory();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#eab308', '#fbbf24'],
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
    (choiceIdx: number) => {
      if (gameState !== 'playing' || !currentQuestion || selectedChoiceIdx !== null) return;

      setSelectedChoiceIdx(choiceIdx);
      setTotalCount((prev) => prev + 1);

      const chosen = currentQuestion.choices[choiceIdx];
      const isCorrect = chosen.isCorrect;

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
          setSelectedChoiceIdx(null);
          setFeedback(null);
          const nextQ = generateQuestion();
          setCurrentQuestion(nextQ);
        }, 320);
      } else {
        soundFx.playError();
        setFeedback('wrong');
        setCombo(1);

        setTimeLeft((prev) => Math.max(0, prev - PENALTY_TIME));
        triggerFloatingText(`-${PENALTY_TIME}s`, 'text-rose-500');

        setTimeout(() => {
          setSelectedChoiceIdx(null);
          setFeedback(null);
          const nextQ = generateQuestion();
          setCurrentQuestion(nextQ);
        }, 500);
      }
    },
    [gameState, currentQuestion, selectedChoiceIdx, combo, maxCombo, generateQuestion]
  );

  const handleSkip = useCallback(() => {
    if (gameState !== 'playing' || !currentQuestion || selectedChoiceIdx !== null) return;
    soundFx.playClick();
    setCombo(1);
    setTotalCount((prev) => prev + 1);
    setTimeLeft((prev) => Math.max(0, prev - 2));
    triggerFloatingText('-2s', 'text-amber-400');

    const nextQ = generateQuestion();
    setCurrentQuestion(nextQ);
  }, [gameState, currentQuestion, selectedChoiceIdx, generateQuestion]);

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
        handleSelectChoice(0);
      } else if (e.key === '2' && currentQuestion?.choices[1]) {
        e.preventDefault();
        handleSelectChoice(1);
      } else if (e.key === '3' && currentQuestion?.choices[2]) {
        e.preventDefault();
        handleSelectChoice(2);
      } else if (e.key === '4' && currentQuestion?.choices[3]) {
        e.preventDefault();
        handleSelectChoice(3);
      } else if (e.key === ' ') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentQuestion, startGame, handleSelectChoice, handleSkip]);

  const shareCardData: ShareCardData = {
    gameMode: 'Chrono Sprint ⚡',
    date: new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US'),
    isWon: score > 0,
    scoreText: `${score} pts`,
    details: [
      `🎯 ${correctCount}/${totalCount} ${isFr ? 'bonnes réponses' : 'correct answers'}`,
      `🔥 Combo Max : x${maxCombo}`,
      `⚡ ${isFr ? 'Sprint Chrono 60 secondes' : '60-second Chrono Sprint'}`,
    ],
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Barre supérieure : Bouton retour Hub + Titre */}
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
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              {isFr ? 'Chrono Sprint' : 'Timeline Sprint'}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              High Score : <span className="text-yellow-400 font-bold">{stats.highScore} pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* ÉCRAN D'ACCUEIL IDLE */}
      {gameState === 'idle' && (
        <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/10">
            <ArrowUpDown className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {isFr ? 'Chrono Sprint ⚡' : 'Timeline Sprint ⚡'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isFr
                ? 'Testez vos repères temporels ! Décidez à toute vitesse quel jeu est sorti en premier ou avant/après un repère.'
                : 'Test your chronological radar! Rapidly decide which indie game came first or before/after an anchor.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto text-left">
            <div className="p-3 rounded-xl bg-[#131a29]/80 border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Temps' : 'Time'}</div>
              <div className="text-lg font-black text-yellow-400">60s</div>
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
            className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-base transition-all shadow-lg shadow-yellow-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>{isFr ? 'Démarrer le Sprint (Entrée / Espace)' : 'Start Sprint (Enter / Space)'}</span>
          </button>
        </div>
      )}

      {/* ÉCRAN DE JEU PLAYING */}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4">
          {/* Dashboard HUD en temps réel */}
          <div className="flex items-center justify-between p-3.5 bg-[#0b0f19] border border-[#1e293b] rounded-2xl shadow-lg">
            {/* Timer */}
            <div className="flex items-center gap-2 relative">
              <div className={`p-2 rounded-xl ${timeLeft <= 10 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-yellow-500/20 text-yellow-400'}`}>
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isFr ? 'Temps' : 'Time'}</div>
                <div className={`text-xl font-black font-mono ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>

              {/* Texte flottant (+3s / -5s) */}
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
                <div className="text-[10px] text-slate-400 font-bold uppercase">{isFr ? 'Score' : 'Score'}</div>
                <div className="text-xl font-black font-mono text-yellow-400">{score}</div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-mono font-black text-sm">x{combo}</span>
              </div>
            </div>
          </div>

          {/* Carte Question */}
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>{currentQuestion.badge}</span>
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

            {/* Intitulé */}
            <div className="text-center py-2">
              <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                {currentQuestion.prompt}
              </h3>
            </div>

            {/* Choix de réponses */}
            <div className={`grid gap-2.5 ${currentQuestion.choices.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {currentQuestion.choices.map((choice, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                let btnStyle = 'bg-[#131a29] hover:bg-slate-800 border-[#1e293b] text-slate-200 hover:border-yellow-500/50';

                if (isSelected) {
                  if (feedback === 'correct') {
                    btnStyle = 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/30';
                  } else if (feedback === 'wrong') {
                    btnStyle = 'bg-rose-500 text-white font-black border-rose-400 shadow-lg shadow-rose-500/30';
                  }
                } else if (feedback && choice.isCorrect) {
                  btnStyle = 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectChoice(idx)}
                    disabled={selectedChoiceIdx !== null}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-slate-300">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{choice.label}</div>
                        {choice.subtext && (
                          <div className="text-[11px] text-slate-400 truncate opacity-80">{choice.subtext}</div>
                        )}
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
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/10">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isFr ? 'Temps Écoulé !' : "Time's Up!"}
            </h2>
            <p className="text-xs text-slate-400">
              {isFr ? 'Bilan de votre session Chrono Sprint' : 'Your Chrono Sprint breakdown'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131a29]/90 border border-yellow-500/30 max-w-sm mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase">{isFr ? 'Score Final' : 'Final Score'}</div>
            <div className="text-4xl font-black font-mono text-yellow-400 py-1">{score} pts</div>
            {score > stats.highScore && score > 0 && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-black uppercase">
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isFr ? 'Rejouer (Entrée)' : 'Play Again (Enter)'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] text-slate-200 font-bold text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-yellow-400" />
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
