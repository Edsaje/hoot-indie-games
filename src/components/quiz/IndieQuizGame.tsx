import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  ArrowRight,
  Heart,
  Flame,
  BookOpen,
  Music,
  Gamepad2,
  UserCheck,
  Check,
  Zap,
} from 'lucide-react';
import { QUIZ_QUESTIONS, type QuizQuestion, type QuizCategory } from '../../data/quizQuestions';
import { INDIE_GAMES } from '../../data/games';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { getAppLanguage } from '../../utils/localization';

type QuizMode = 'standard' | 'survival' | 'infinite';

interface ShuffledQuestion {
  original: QuizQuestion;
  shuffledIndices: number[];
  shuffledOptionsFr: string[];
  shuffledOptionsEn: string[];
  correctShuffledIndex: number;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helpers multi-langues pour le Quiz Indé
function getQuestionTitle(q: QuizQuestion, lang?: string): string {
  const target = getAppLanguage(lang);
  if (target === 'es' && q.questionEs) return q.questionEs;
  if (target === 'de' && q.questionDe) return q.questionDe;
  if (target === 'ja' && q.questionJa) return q.questionJa;
  if (target === 'pt-BR' && q.questionPt) return q.questionPt;
  if (target === 'fr') return q.questionFr || q.questionEn;
  return q.questionEn || q.questionFr;
}

function getQuestionExplanation(q: QuizQuestion, lang?: string): string {
  const target = getAppLanguage(lang);
  if (target === 'es' && q.explanationEs) return q.explanationEs;
  if (target === 'de' && q.explanationDe) return q.explanationDe;
  if (target === 'ja' && q.explanationJa) return q.explanationJa;
  if (target === 'pt-BR' && q.explanationPt) return q.explanationPt;
  if (target === 'fr') return q.explanationFr || q.explanationEn;
  return q.explanationEn || q.explanationFr;
}

function getShuffledQuestionOptions(sq: ShuffledQuestion, lang?: string): string[] {
  const target = getAppLanguage(lang);
  const q = sq.original;
  const indices = sq.shuffledIndices;
  if (target === 'es' && q.optionsEs) return indices.map((i) => q.optionsEs![i]);
  if (target === 'de' && q.optionsDe) return indices.map((i) => q.optionsDe![i]);
  if (target === 'ja' && q.optionsJa) return indices.map((i) => q.optionsJa![i]);
  if (target === 'pt-BR' && q.optionsPt) return indices.map((i) => q.optionsPt![i]);
  if (target === 'fr') return sq.shuffledOptionsFr;
  return sq.shuffledOptionsEn;
}

// Prépare une question avec options mélangées
function prepareQuestion(q: QuizQuestion): ShuffledQuestion {
  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffleArray(indices);
  const correctShuffledIndex = shuffledIndices.indexOf(q.correctAnswer);

  return {
    original: q,
    shuffledIndices,
    shuffledOptionsFr: shuffledIndices.map((idx) => q.optionsFr[idx]),
    shuffledOptionsEn: shuffledIndices.map((idx) => q.optionsEn[idx]),
    correctShuffledIndex,
  };
}

interface IndieQuizGameProps {
  onOpenLeaderboard?: (mode?: QuizMode) => void;
}

export const IndieQuizGame: React.FC<IndieQuizGameProps> = ({ onOpenLeaderboard }) => {
  const { t, i18n } = useTranslation();

  const { unlockAchievement } = useAchievements();

  // Mode de jeu
  const [mode, setMode] = useState<QuizMode>('standard');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'all'>('all');

  // Pool de questions préparées pour la session
  const [sessionQuestions, setSessionQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // État de la question courante
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  // Statistiques de la session
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [answersHistory, setAnswersHistory] = useState<boolean[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Record en mémoire locale
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('hoot_quiz_highscore') || 0);
    } catch {
      return 0;
    }
  });

  // Démarrer une nouvelle session
  const startNewSession = useCallback(
    (chosenMode: QuizMode = mode, chosenCategory: QuizCategory | 'all' = selectedCategory) => {
      soundFx.playClick();
      let pool = QUIZ_QUESTIONS;
      if (chosenCategory !== 'all') {
        pool = pool.filter((q) => q.category === chosenCategory);
      }
      if (pool.length === 0) pool = QUIZ_QUESTIONS;

      const shuffled = shuffleArray(pool);
      const sessionCount = chosenMode === 'standard' ? 10 : Math.min(pool.length, 50);
      const selected = shuffled.slice(0, sessionCount).map(prepareQuestion);

      setSessionQuestions(selected);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setLives(3);
      setAnswersHistory([]);
      setIsGameOver(false);
      setCopied(false);
    },
    [mode, selectedCategory]
  );

  // Initialisation
  useEffect(() => {
    startNewSession(mode, selectedCategory);
  }, []);

  const currentQ = sessionQuestions[currentIndex];

  // Trouver le jeu lié dans le catalogue INDIE_GAMES
  const linkedGame = useMemo(() => {
    if (!currentQ?.original.gameId) return null;
    return INDIE_GAMES.find((g) => g.id === currentQ.original.gameId);
  }, [currentQ]);

  // Validation d'une réponse
  const handleSelectOption = (index: number) => {
    if (isAnswerRevealed || !currentQ) return;

    setSelectedAnswer(index);
    setIsAnswerRevealed(true);

    const isCorrect = index === currentQ.correctShuffledIndex;
    const newHistory = [...answersHistory, isCorrect];
    setAnswersHistory(newHistory);

    if (isCorrect) {
      soundFx.playChime();
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('hoot_quiz_highscore', newScore.toString());
          localStorage.setItem(`hoot_quiz_hs_${mode}`, newScore.toString());
        } catch {
          // ignore
        }
      }

      if (newStreak >= 5) {
        unlockAchievement('quiz_streak_5');
      }
    } else {
      soundFx.playError();
      setStreak(0);

      if (mode === 'survival') {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
      }
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    soundFx.playClick();
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);

    if (mode === 'survival' && lives <= 0) {
      setIsGameOver(true);
      return;
    }

    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Fin de session
      setIsGameOver(true);
      if (score >= 7) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
        soundFx.playVictory();
      }
    }
  };

  // Raccourcis clavier (1, 2, 3, 4 et Espace / Entrée)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (!isAnswerRevealed) {
        if (e.key === '1') handleSelectOption(0);
        else if (e.key === '2') handleSelectOption(1);
        else if (e.key === '3') handleSelectOption(2);
        else if (e.key === '4') handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isGameOver) {
            handleNextQuestion();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, isGameOver, currentIndex, sessionQuestions, handleNextQuestion]);

  // Copier le résultat
  const handleShareResult = () => {
    const total = answersHistory.length;
    const correctCount = answersHistory.filter(Boolean).length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const emojiGrid = answersHistory.map((h) => (h ? '🟩' : '🟥')).join('');

    const text = `${t('quiz.shareCardTitle')}\n${t('quiz.shareScore', { score: correctCount, total, percentage })}\n${t('quiz.shareStreak', { streak: maxStreak })}\n${emojiGrid}\n\n${t('quiz.shareCta')}`;

    navigator.clipboard.writeText(text).then(() => {
      soundFx.playChime();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Catégorie icônes et labels
  const categoryMeta: Record<QuizCategory, { labelKey: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    lore: { labelKey: 'quiz.themeLore', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    ost: { labelKey: 'quiz.themeOst', icon: Music, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
    gameplay: { labelKey: 'quiz.themeGameplay', icon: Gamepad2, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    creator: { labelKey: 'quiz.themeCreator', icon: UserCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    trivia: { labelKey: 'quiz.themeTrivia', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    release: { labelKey: 'quiz.themeRelease', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  };

  if (!currentQ && !isGameOver) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400">
        {t('quiz.loading')}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 animate-in fade-in duration-300">
      {/* En-tête du Quiz */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('quiz.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('quiz.mainTitle')}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
          {t('quiz.description', { count: QUIZ_QUESTIONS.length })}
        </p>
      </div>

      {/* Barre de contrôle des modes & catégories */}
      <div className="bg-[#131a29]/90 border border-[#1e293b] rounded-2xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Sélecteur de Mode */}
        <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => {
              setMode('standard');
              startNewSession('standard', selectedCategory);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              mode === 'standard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('quiz.modeStandard')}
          </button>
          <button
            onClick={() => {
              setMode('survival');
              startNewSession('survival', selectedCategory);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
              mode === 'survival'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
            <span>{t('quiz.modeSurvival')}</span>
          </button>
          <button
            onClick={() => {
              setMode('infinite');
              startNewSession('infinite', selectedCategory);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              mode === 'infinite'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('quiz.modeInfinite')}
          </button>
        </div>

        {/* Filtre par Thème */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 hidden sm:inline">
            {t('quiz.themeLabel')}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              const cat = e.target.value as QuizCategory | 'all';
              setSelectedCategory(cat);
              startNewSession(mode, cat);
            }}
            className="bg-[#0b0f19] border border-[#1e293b] text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">{t('quiz.themeAll')}</option>
            <option value="lore">{t('quiz.themeLore')}</option>
            <option value="ost">{t('quiz.themeOst')}</option>
            <option value="gameplay">{t('quiz.themeGameplay')}</option>
            <option value="creator">{t('quiz.themeCreator')}</option>
            <option value="trivia">{t('quiz.themeTrivia')}</option>
          </select>
        </div>

        {/* Bouton Re-mélanger / Nouvelle Série & Record */}
        <div className="flex items-center gap-2 ml-auto">
          {highScore > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>{t('quiz.record', { score: highScore })}</span>
            </span>
          )}
          <button
            onClick={() => startNewSession(mode, selectedCategory)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            title={t('quiz.shuffleTip')}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('quiz.shuffle')}</span>
          </button>
        </div>
      </div>

      {/* ÉCRAN DE JEU ACTIF OU ÉCRAN DE RÉSULTATS */}
      {!isGameOver ? (
        <div className="bg-[#131a29] border border-[#1e293b] rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ligne d'état supérieure : Question N°, Vies, Streak, Score */}
          <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black tracking-wider text-amber-400">
                {mode === 'standard'
                  ? t('quiz.questionOf', { current: currentIndex + 1, total: sessionQuestions.length })
                  : t('quiz.questionNum', { current: currentIndex + 1 })}
              </span>

              {/* Tag Catégorie */}
              {currentQ && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    categoryMeta[currentQ.original.category].color
                  }`}
                >
                  {t(categoryMeta[currentQ.original.category].labelKey)}
                </span>
              )}
            </div>

            {/* Vies en mode survie */}
            {mode === 'survival' && (
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-all duration-300 ${
                      i < lives
                        ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : 'text-slate-600 fill-slate-800 opacity-40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Compteurs Score & Streak */}
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <div className="flex items-center gap-1 text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{t('quiz.combo', { count: streak })}</span>
                </div>
              )}
              <div className="text-xs font-mono font-bold bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1e293b] text-slate-200">
                <span className="text-amber-400 font-black">{score}</span>
                {mode === 'standard' && <span className="text-slate-500"> / {sessionQuestions.length}</span>}
              </div>
            </div>
          </div>

          {/* Question Intitulé */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-black text-white leading-relaxed">
              {getQuestionTitle(currentQ.original, i18n.language)}
            </h2>
          </div>

          {/* Grille des 4 Choix interactifs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {getShuffledQuestionOptions(currentQ, i18n.language).map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctShuffledIndex;

              let style =
                'bg-[#0b0f19] border-[#1e293b] text-slate-200 hover:border-amber-500/50 hover:bg-[#101726]';
              if (isAnswerRevealed) {
                if (isCorrect) {
                  style =
                    'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500';
                } else if (isSelected) {
                  style = 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold';
                } else {
                  style = 'bg-[#0b0f19]/60 border-[#1e293b]/60 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerRevealed}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl border text-left transition-all text-sm font-medium cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-black group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>

                  {isAnswerRevealed && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2 animate-in zoom-in-50" />
                  )}
                  {isAnswerRevealed && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2 animate-in zoom-in-50" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explication Pédagogique & Informations sur le Jeu */}
          <AnimatePresence>
            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-[#0b0f19] border border-amber-500/30 mb-6 text-xs text-slate-300 leading-relaxed shadow-inner"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                    {t('quiz.didYouKnow')}
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {getQuestionExplanation(currentQ.original, i18n.language)}
                </p>

                {linkedGame && (
                  <div className="mt-3 pt-3 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {t('quiz.certifiedGame')}{' '}
                      <strong className="text-white">{linkedGame.title}</strong> ({linkedGame.releaseYear}) •{' '}
                      {linkedGame.developer}
                    </span>
                    <a
                      href={linkedGame.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Steam</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton Suivant */}
          {isAnswerRevealed && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl shadow-amber-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {currentIndex + 1 < sessionQuestions.length
                  ? t('quiz.nextQuestion')
                  : t('quiz.viewResults')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Indication des raccourcis clavier */}
          <div className="text-center mt-3 text-[11px] text-slate-500">
            {t('quiz.keyboardTip')}
          </div>
        </div>
      ) : (
        /* ÉCRAN DE FIN DE PARTIE / BILAN DE SESSION */
        <div className="max-w-xl mx-auto bg-[#131a29] border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1">
            {score === sessionQuestions.length
              ? t('quiz.perfectTitle')
              : score >= 7
              ? t('quiz.greatTitle')
              : t('quiz.goodTitle')}
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            {t('quiz.scoreSummary', { score, total: answersHistory.length })}{' '}
            {maxStreak > 2 && (
              <span className="text-amber-400 font-bold">
                {t('quiz.maxStreak', { count: maxStreak })}
              </span>
            )}
          </p>

          {/* Grille emoji des réponses */}
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-4 mb-6 max-w-sm mx-auto">
            <div className="text-xs uppercase font-bold text-slate-400 mb-2">
              {t('quiz.sessionBreakdown')}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-lg">
              {answersHistory.map((isCorrect, idx) => (
                <span key={idx}>{isCorrect ? '🟩' : '🟥'}</span>
              ))}
            </div>
          </div>

          {/* Actions : Rejouer, Classement ou Partager */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => startNewSession(mode, selectedCategory)}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('quiz.playAgain')}</span>
            </button>

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLeaderboard(mode);
                }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm rounded-xl border border-amber-500/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{t('quiz.leaderboard')}</span>
              </button>
            )}

            <button
              onClick={handleShareResult}
              className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{t('quiz.copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>{t('quiz.share')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
