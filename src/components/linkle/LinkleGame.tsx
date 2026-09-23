import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Share2,
  Feather,
  AlertTriangle,
  Download,
  PlusCircle,
  Undo,
  Zap,
  Lightbulb,
} from 'lucide-react';
import type { ConnectionCategory, DifficultyLevel, DailyConnectionsPuzzle } from '../../types/game';
import { getDailyConnectionsPuzzle } from '../../data/connectionsPuzzles';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { downloadShareCard, type ShareCardData } from '../../utils/generateShareCard';
import { ShareResultModal } from '../common/ShareResultModal';
import { getLocalizedText } from '../../utils/localization';
import { StreakNoticeBanner } from '../common/StreakNoticeBanner';
import { AttemptDistributionChart } from '../common/AttemptDistributionChart';
import { CustomLinkleBuilder } from './CustomLinkleBuilder';
import { DifficultySelector, type GameDifficulty } from '../common/DifficultySelector';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { telemetry } from '../../services/telemetry';

interface LinkleGameProps {
  currentDate: string;
  onSelectDate?: (date: string) => void;
}

interface TileItem {
  gameId: string;
  gameTitle: string;
  imageUrl: string;
  fallbackUrl?: string;
  categoryId: string;
}

const difficultyColors: Record<DifficultyLevel, { bg: string; text: string; border: string; labelKey: string }> = {
  easy: {
    bg: 'bg-[#eab308]',
    text: 'text-slate-950 font-black',
    border: 'border-yellow-500',
    labelKey: 'linkle.easyCategory',
  },
  medium: {
    bg: 'bg-[#10b981]',
    text: 'text-slate-950 font-black',
    border: 'border-emerald-500',
    labelKey: 'linkle.mediumCategory',
  },
  hard: {
    bg: 'bg-[#3b82f6]',
    text: 'text-white font-black',
    border: 'border-blue-500',
    labelKey: 'linkle.hardCategory',
  },
  expert: {
    bg: 'bg-[#8b5cf6]',
    text: 'text-white font-black',
    border: 'border-purple-500',
    labelKey: 'linkle.expertCategory',
  },
};

function deterministicShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  }
  for (let i = result.length - 1; i > 0; i--) {
    hash = Math.imul(hash, 1664525) + 1013904223;
    const j = Math.abs(hash) % (i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

const decodePuzzleFromHash = (): DailyConnectionsPuzzle | null => {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash;
    if (hash.startsWith('#linkle=')) {
      const base64 = hash.replace('#linkle=', '');
      const json = decodeURIComponent(atob(base64));
      return JSON.parse(json) as DailyConnectionsPuzzle;
    }
  } catch {
    // Ignore invalid hash
  }
  return null;
};

export const LinkleGame: React.FC<LinkleGameProps> = ({ currentDate, onSelectDate }) => {
  const { t, i18n } = useTranslation();
  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();

  const [customPuzzle, setCustomPuzzle] = useState<DailyConnectionsPuzzle | null>(() => decodePuzzleFromHash());
  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Active puzzle is either custom or daily
  const puzzle = customPuzzle || getDailyConnectionsPuzzle(currentDate);
  const isCustomMode = Boolean(customPuzzle);
  const storageKey = isCustomMode ? `linkle_custom_${puzzle.id}` : `linkle_state_${currentDate}`;

  const savedState = (() => {
    // Flatten 16 tiles
    const allItems: TileItem[] = [];
    puzzle.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        allItems.push({
          gameId: item.gameId,
          gameTitle: item.gameTitle,
          imageUrl: item.imageUrl,
          fallbackUrl: item.fallbackUrl,
          categoryId: cat.id,
        });
      });
    });

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const solvedCats = puzzle.categories.filter((c) =>
          (parsed.solvedCategoryIds || []).includes(c.id)
        );
        const remainingTiles = allItems.filter(
          (tile) => !solvedCats.some((c) => c.id === tile.categoryId)
        );
        const defaultMistakes = (localStorage.getItem('linkle_difficulty') === 'novice' ? 6 : localStorage.getItem('linkle_difficulty') === 'expert' ? 1 : 4);
        return {
          tiles: remainingTiles,
          solvedCategories: solvedCats,
          mistakesRemaining: parsed.mistakesRemaining ?? defaultMistakes,
          isCompleted: Boolean(parsed.isCompleted),
          isWon: Boolean(parsed.isWon),
          previousGuesses: (parsed.previousGuesses || []) as string[][],
        };
      }
    } catch {
      // Fallback
    }

    const defaultMistakes = (localStorage.getItem('linkle_difficulty') === 'novice' ? 6 : localStorage.getItem('linkle_difficulty') === 'expert' ? 1 : 4);
    const shuffled = deterministicShuffle(allItems, puzzle.date || currentDate);
    return {
      tiles: shuffled,
      solvedCategories: [] as ConnectionCategory[],
      mistakesRemaining: defaultMistakes,
      isCompleted: false,
      isWon: false,
      previousGuesses: [] as string[][],
    };
  })();

  const [difficulty, setDifficulty] = useState<GameDifficulty>(() => {
    return (localStorage.getItem('linkle_difficulty') as GameDifficulty) || 'standard';
  });

  const maxMistakes = difficulty === 'novice' ? 6 : difficulty === 'expert' ? 1 : 4;

  const handleDifficultyChange = (d: GameDifficulty) => {
    setDifficulty(d);
    localStorage.setItem('linkle_difficulty', d);
    const newMax = d === 'novice' ? 6 : d === 'expert' ? 1 : 4;
    setMistakesRemaining(newMax);
  };

  const [tiles, setTiles] = useState<TileItem[]>(savedState.tiles);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<ConnectionCategory[]>(savedState.solvedCategories);
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(savedState.mistakesRemaining);
  const [isCompleted, setIsCompleted] = useState<boolean>(savedState.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(savedState.isWon);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [previousGuesses, setPreviousGuesses] = useState<string[][]>(savedState.previousGuesses);
  const [showCategoryHints, setShowCategoryHints] = useState<boolean>(() => {
    return localStorage.getItem('linkle_show_hints') === 'true';
  });

  const toggleCategoryHints = () => {
    soundFx.playClick();
    const next = !showCategoryHints;
    setShowCategoryHints(next);
    localStorage.setItem('linkle_show_hints', String(next));
  };

  // Suivi télémétrie cookieless au lancement de Linkle
  useEffect(() => {
    telemetry.track('game', 'linkle_play', puzzle.id, undefined, {
      isCustomMode,
      date: currentDate,
      alreadyCompleted: isCompleted,
      difficulty,
    });
  }, [puzzle.id, isCustomMode, currentDate, isCompleted, difficulty]);

  // Listen to hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const p = decodePuzzleFromHash();
      if (p) {
        setCustomPuzzle(p);
        unlockAchievement('custom_linkle_builder');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [unlockAchievement]);

  const saveGameState = (
    solvedCats: ConnectionCategory[],
    mistakes: number,
    completed: boolean,
    won: boolean,
    prevGuesses: string[][]
  ) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: puzzle.date || currentDate,
          solvedCategoryIds: solvedCats.map((c) => c.id),
          mistakesRemaining: mistakes,
          isCompleted: completed,
          isWon: won,
          previousGuesses: prevGuesses,
        })
      );
    } catch {
      // Ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleSelectTile = (gameId: string) => {
    if (isCompleted) return;

    soundFx.playClick();
    if (selectedGameIds.includes(gameId)) {
      setSelectedGameIds(selectedGameIds.filter((id) => id !== gameId));
    } else {
      if (selectedGameIds.length >= 4) return;
      setSelectedGameIds([...selectedGameIds, gameId]);
    }
  };

  const handleShuffle = () => {
    soundFx.playClick();
    setTiles((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleDeselectAll = () => {
    soundFx.playClick();
    setSelectedGameIds([]);
  };

  const checkDailyTrifecta = () => {
    try {
      const s1 = localStorage.getItem(`screenle_state_${currentDate}`);
      const s2 = localStorage.getItem(`indledle_state_${currentDate}`);
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

  const handleSubmit = () => {
    if (selectedGameIds.length !== 4 || isCompleted) return;

    const sortedSelection = [...selectedGameIds].sort();

    // Check if duplicate guess
    const isDuplicate = previousGuesses.some(
      (g) => [...g].sort().join(',') === sortedSelection.join(',')
    );
    if (isDuplicate) {
      showToast(t('linkle.alreadyGuessed'));
      soundFx.playError();
      return;
    }

    const nextPreviousGuesses = [...previousGuesses, sortedSelection];
    setPreviousGuesses(nextPreviousGuesses);

    // Check matches
    let matchedCategory: ConnectionCategory | null = null;
    let maxMatchInSingleCat = 0;

    for (const cat of puzzle.categories) {
      if (solvedCategories.some((sc) => sc.id === cat.id)) continue;
      const catGameIds = cat.items.map((i) => i.gameId);
      const matchCount = selectedGameIds.filter((id) => catGameIds.includes(id)).length;
      if (matchCount > maxMatchInSingleCat) {
        maxMatchInSingleCat = matchCount;
      }
      if (matchCount === 4) {
        matchedCategory = cat;
        break;
      }
    }

    if (matchedCategory) {
      // Correct group!
      soundFx.playChime();
      const newSolved = [...solvedCategories, matchedCategory];
      setSolvedCategories(newSolved);
      setSelectedGameIds([]);

      telemetry.track(
        'interaction',
        'linkle_category_solved',
        getLocalizedText(matchedCategory.label, i18n.language),
        newSolved.length
      );

      // Remove solved tiles
      const remainingTiles = tiles.filter(
        (tile) => tile.categoryId !== matchedCategory!.id
      );
      setTiles(remainingTiles);

      if (newSolved.length === 4) {
        // Victory!
        setIsWon(true);
        setIsCompleted(true);
        saveGameState(newSolved, mistakesRemaining, true, true, nextPreviousGuesses);

        if (!isCustomMode) {
          const totalAttempts = nextPreviousGuesses.length;
          recordGameResult('linkle', currentDate, true, totalAttempts);
          unlockAchievement('first_flight');
          if (mistakesRemaining === 4) {
            unlockAchievement('linkle_flawless');
          }
          checkDailyTrifecta();
        } else {
          unlockAchievement('custom_linkle_builder');
        }

        soundFx.playVictory();
        telemetry.track('game', 'linkle_win', puzzle.id, mistakesRemaining, {
          mistakesRemaining,
          isCustomMode,
        });
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#eab308', '#10b981', '#3b82f6', '#8b5cf6'],
        });
      } else {
        saveGameState(newSolved, mistakesRemaining, false, false, nextPreviousGuesses);
      }
    } else {
      // Incorrect!
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      soundFx.playError();

      const newMistakes = mistakesRemaining - 1;
      setMistakesRemaining(newMistakes);

      if (maxMatchInSingleCat === 3) {
        showToast(t('linkle.oneAway'));
      }

      if (newMistakes <= 0) {
        // Lost! Reveal all remaining categories
        setIsWon(false);
        setIsCompleted(true);
        setSolvedCategories(puzzle.categories);
        setTiles([]);
        saveGameState(puzzle.categories, 0, true, false, nextPreviousGuesses);
        telemetry.track('game', 'linkle_loss', puzzle.id, 0, {
          isCustomMode,
        });
        if (!isCustomMode) {
          recordGameResult('linkle', currentDate, false, 0);
          unlockAchievement('first_flight');
        }
      } else {
        saveGameState(solvedCategories, newMistakes, false, false, nextPreviousGuesses);
      }
    }
  };

  const shareData: ShareCardData = useMemo(() => {
    const categoryDifficultyMap: Record<string, string> = {};
    puzzle.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        categoryDifficultyMap[item.gameId] = cat.difficulty;
      });
    });

    const lines = previousGuesses.map((guess) => {
      return guess
        .map((gameId) => {
          const diff = categoryDifficultyMap[gameId];
          switch (diff) {
            case 'easy':
              return '🟨';
            case 'medium':
              return '🟩';
            case 'hard':
              return '🟦';
            case 'expert':
              return '🟪';
            default:
              return '⬛';
          }
        })
        .join('');
    });

    return {
      gameMode: 'Linkle',
      date: isCustomMode ? 'Custom' : currentDate,
      isWon,
      scoreText: isWon ? `4/4 Catégories résolues !` : `${solvedCategories.length}/4 Catégories`,
      details: lines.length > 0 ? lines.slice(0, 4) : ['Défi terminé'],
    };
  }, [puzzle, previousGuesses, isCustomMode, currentDate, isWon, solvedCategories.length]);

  const handleShare = () => {
    soundFx.playClick();
    setIsShareModalOpen(true);
  };

  const handleDownloadCard = async () => {
    soundFx.playClick();
    setIsDownloadingImage(true);
    try {
      const categoryDifficultyMap: Record<string, string> = {};
      puzzle.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          categoryDifficultyMap[item.gameId] = cat.difficulty;
        });
      });

      const lines = previousGuesses.slice(0, 4).map((guess) => {
        return guess
          .map((gameId) => {
            const diff = categoryDifficultyMap[gameId];
            switch (diff) {
              case 'easy':
                return '🟨';
              case 'medium':
                return '🟩';
              case 'hard':
                return '🟦';
              case 'expert':
                return '🟪';
              default:
                return '⬛';
            }
          })
          .join(' ');
      });

      await downloadShareCard({
        gameMode: 'Linkle',
        date: isCustomMode ? 'Community-Puzzle' : currentDate,
        isWon,
        scoreText: isWon
          ? mistakesRemaining === 4
            ? 'Sans faute ! (4/4)'
            : `${4 - mistakesRemaining} erreurs`
          : 'Partie terminée',
        details: lines.length > 0 ? lines : ['🟨 🟨 🟨 🟨', '🟩 🟩 🟩 🟩', '🟦 🟦 🟦 🟦', '🟪 🟪 🟪 🟪'],
      });
      soundFx.playChime();
    } catch {
      // Ignore
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const resetToDaily = () => {
    soundFx.playClick();
    window.location.hash = '';
    setCustomPuzzle(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <AlertTriangle className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Custom Puzzle Active Banner */}
      {isCustomMode && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">
                {t('linkle.communityChallenge')}
              </p>
              <p className="text-xs text-slate-300">
                {t('linkle.communityChallengeDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={resetToDaily}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-xs font-bold text-amber-400 hover:text-white transition"
          >
            <Undo className="w-3.5 h-3.5" />
            {t('linkle.backToDaily')}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Mode 3 • Regroupement d'Indices
          </div>
          <button
            onClick={toggleCategoryHints}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
              showCategoryHints
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-[#131a29] border-[#1e293b] text-slate-300 hover:text-amber-400 hover:border-amber-500/40'
            }`}
            title={showCategoryHints ? t('linkle.hideHints') : t('linkle.showHints')}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showCategoryHints ? 'text-amber-400 fill-amber-400/20' : 'text-slate-400'}`} />
            <span>{showCategoryHints ? t('linkle.hideHints') : t('linkle.showHints')}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setIsBuilderOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-xs font-bold transition cursor-pointer"
            title="Créer votre propre Linkle"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('linkle.createGrid')}</span>
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t('linkle.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          {t('linkle.subtitle')}
        </p>
      </div>

      {/* Difficulty Selector */}
      <DifficultySelector
        difficulty={difficulty}
        onSelect={handleDifficultyChange}
        disabled={isCompleted || previousGuesses.length > 0}
      />

      {/* Mistakes Counter */}
      <div className="flex items-center justify-center gap-2 mb-6 text-sm font-semibold text-slate-300">
        <span>{t('linkle.mistakesRemaining')}</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxMistakes }).map((_, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 ${
                i < mistakesRemaining
                  ? 'bg-amber-500/20 text-[#f59e0b] ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-600'
              }`}
            >
              <Feather className="w-3 h-3" />
            </span>
          ))}
        </div>
      </div>

      {/* Secret Category Hints Panel */}
      {showCategoryHints && (
        <div className="mb-6 p-4 rounded-2xl bg-[#0f172a]/90 border border-amber-500/30 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {t('linkle.hintsTitle')}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {t('linkle.hintsDesc')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {puzzle.categories.map((cat) => {
              const isSolved = solvedCategories.some((sc) => sc.id === cat.id);
              return (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isSolved
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 opacity-70'
                      : 'bg-[#131a29] border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        cat.difficulty === 'easy'
                          ? 'bg-[#eab308]'
                          : cat.difficulty === 'medium'
                          ? 'bg-[#10b981]'
                          : cat.difficulty === 'hard'
                          ? 'bg-[#3b82f6]'
                          : 'bg-[#8b5cf6]'
                      }`}
                    />
                    <span className={`text-xs font-bold truncate ${isSolved ? 'line-through opacity-80' : ''}`}>
                      {getLocalizedText(cat.label, i18n.language)}
                    </span>
                  </div>
                  {isSolved && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 ml-2">
                      ✓ {t('linkle.solvedBadge')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Solved Category Banners */}
      <div className="space-y-3 mb-6">
        {solvedCategories.map((cat) => {
          const config = difficultyColors[cat.difficulty];
          return (
            <motion.div
              key={cat.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`${config.bg} ${config.text} rounded-2xl p-4 shadow-lg text-center transition-all`}
            >
              <div className="text-xs uppercase tracking-widest opacity-80 mb-0.5">
                {t(config.labelKey)}
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-wide">
                {getLocalizedText(cat.label, i18n.language)}
              </h3>
              <p className="text-xs opacity-90 mt-1 font-medium">
                {cat.items.map((i) => i.gameTitle).join(', ')}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* 4x4 Tiles Grid */}
      {tiles.length > 0 && (
        <motion.div
          animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-4 gap-1.5 sm:gap-3 mb-8"
        >
          {tiles.map((tile) => {
            const isSelected = selectedGameIds.includes(tile.gameId);
            return (
              <button
                key={tile.gameId}
                onClick={() => toggleSelectTile(tile.gameId)}
                className={`group relative h-24 sm:h-32 rounded-xl sm:rounded-2xl p-1 sm:p-2 border flex flex-col items-center justify-between transition-all duration-200 text-left select-none overflow-hidden touch-manipulation ${
                  isSelected
                    ? 'bg-amber-500/20 border-[#f59e0b] ring-2 ring-[#f59e0b] -translate-y-1 shadow-lg shadow-amber-500/20'
                    : 'bg-[#131a29] border-[#1e293b] hover:border-slate-500 hover:bg-[#1a2336]'
                }`}
              >
                {/* Background image preview */}
                <div className="w-full h-3/4 rounded-lg sm:rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={tile.imageUrl}
                    alt={tile.gameTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (tile.fallbackUrl && target.src !== tile.fallbackUrl) {
                        target.src = tile.fallbackUrl;
                      } else {
                        const safeTitle = encodeURIComponent(tile.gameTitle.slice(0, 24));
                        target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="150" cy="55" r="22" fill="%23f59e0b" fill-opacity="0.15"/><path d="M142 55h16M150 47v16" stroke="%23f59e0b" stroke-width="2.5" stroke-linecap="round"/><text x="150" y="100" fill="%23e2e8f0" font-size="12" font-family="system-ui,sans-serif" font-weight="bold" text-anchor="middle">${safeTitle}</text></svg>`;
                      }
                    }}
                  />
                </div>

                {/* Game Title */}
                <span
                  className={`text-[10px] sm:text-xs font-bold sm:font-black text-center mt-0.5 sm:mt-1 truncate w-full px-0.5 sm:px-1 ${
                    isSelected ? 'text-[#f59e0b]' : 'text-slate-200'
                  }`}
                >
                  {tile.gameTitle}
                </span>

                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Control Buttons */}
      {!isCompleted ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Shuffle className="w-4 h-4" />
            {t('linkle.shuffle')}
          </button>

          <button
            onClick={handleDeselectAll}
            disabled={selectedGameIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            {t('linkle.deselectAll')}
          </button>

          <button
            onClick={handleSubmit}
            disabled={selectedGameIds.length !== 4}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {t('linkle.submit', { count: selectedGameIds.length })}
          </button>
        </div>
      ) : (
        /* Completed Summary */
        <div className="relative overflow-visible bg-[#06241b] border-2 border-[#78350f] rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <SylvestreIvyFrame density="medium" />
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

          <p className="text-sm text-slate-300 mb-6">
            {isWon ? t('linkle.wonText') : t('linkle.lostText')}
          </p>

          {/* Community Attempt Distribution Graph */}
          {!isCustomMode && (
            <div className="mb-6">
              <AttemptDistributionChart
                game="linkle"
                date={currentDate}
                playerAttempts={previousGuesses.length || (isWon ? (4 + (maxMistakes - mistakesRemaining)) : 0)}
                isWon={isWon}
              />
            </div>
          )}

          {/* Streak preservation / broken notice banner */}
          <StreakNoticeBanner
            mode="linkle"
            currentDate={currentDate}
            isWon={isWon}
            onSelectDate={onSelectDate}
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('common.share')}</span>
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={isDownloadingImage}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1e293b] hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-600 transition shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isDownloadingImage ? t('common.generating') : t('common.downloadCard')}</span>
            </button>
          </div>

          {/* Time Attack Gateway */}
          <div className="mt-4 pt-4 border-t border-[#1e293b] flex items-center justify-center">
            <button
              onClick={() => {
                soundFx.playClick();
                window.location.hash = '#timeattack=linkle';
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-black transition active:scale-95 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Envie d'un défi rapide ? Tentez le Linkle Sprint ⚡ (60s)</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Linkle Builder Modal */}
      <CustomLinkleBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onPlayCustomPuzzle={(p) => {
          setCustomPuzzle(p);
          setTiles([]);
          setSolvedCategories([]);
          setMistakesRemaining(4);
          setIsCompleted(false);
          setIsWon(false);
          setPreviousGuesses([]);
        }}
      />

      {/* Zero-Spoil Social Share Modal */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareData}
      />
    </div>
  );
};
