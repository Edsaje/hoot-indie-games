import React, { useState, useEffect } from 'react';
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
  Check,
  Feather,
  AlertTriangle,
  Download,
  PlusCircle,
  Undo,
} from 'lucide-react';
import type { ConnectionCategory, DifficultyLevel, DailyConnectionsPuzzle } from '../../types/game';
import { getDailyConnectionsPuzzle } from '../../data/connectionsPuzzles';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { useAchievements } from '../../context/useAchievements';
import { downloadShareCard } from '../../utils/generateShareCard';
import { CustomLinkleBuilder } from './CustomLinkleBuilder';

interface LinkleGameProps {
  currentDate: string;
}

interface TileItem {
  gameId: string;
  gameTitle: string;
  imageUrl: string;
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

export const LinkleGame: React.FC<LinkleGameProps> = ({ currentDate }) => {
  const { t, i18n } = useTranslation();
  const { recordGameResult } = useGameStats();
  const { unlockAchievement } = useAchievements();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [customPuzzle, setCustomPuzzle] = useState<DailyConnectionsPuzzle | null>(() => decodePuzzleFromHash());
  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);

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
        return {
          tiles: remainingTiles,
          solvedCategories: solvedCats,
          mistakesRemaining: parsed.mistakesRemaining ?? 4,
          isCompleted: Boolean(parsed.isCompleted),
          isWon: Boolean(parsed.isWon),
          previousGuesses: (parsed.previousGuesses || []) as string[][],
        };
      }
    } catch {
      // Fallback
    }

    const shuffled = deterministicShuffle(allItems, puzzle.date || currentDate);
    return {
      tiles: shuffled,
      solvedCategories: [] as ConnectionCategory[],
      mistakesRemaining: 4,
      isCompleted: false,
      isWon: false,
      previousGuesses: [] as string[][],
    };
  })();

  const [tiles, setTiles] = useState<TileItem[]>(savedState.tiles);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<ConnectionCategory[]>(savedState.solvedCategories);
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(savedState.mistakesRemaining);
  const [isCompleted, setIsCompleted] = useState<boolean>(savedState.isCompleted);
  const [isWon, setIsWon] = useState<boolean>(savedState.isWon);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [previousGuesses, setPreviousGuesses] = useState<string[][]>(savedState.previousGuesses);

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
          recordGameResult('linkle', currentDate, true, 4);
          unlockAchievement('first_flight');
          if (mistakesRemaining === 4) {
            unlockAchievement('linkle_flawless');
          }
          checkDailyTrifecta();
        } else {
          unlockAchievement('custom_linkle_builder');
        }

        soundFx.playVictory();
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
        if (!isCustomMode) {
          recordGameResult('linkle', currentDate, false, 0);
          unlockAchievement('first_flight');
        }
      } else {
        saveGameState(solvedCategories, newMistakes, false, false, nextPreviousGuesses);
      }
    }
  };

  const handleShare = () => {
    soundFx.playClick();
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

    const text = `🦉 Linkle #${isCustomMode ? 'Custom' : currentDate}\n${lines.join('\n')}\n🎮 https://hootindiegames.com`;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
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
              <p className="text-xs font-black text-white">
                {lang === 'fr' ? '🌟 Défi Linkle Communautaire Personnalisé' : '🌟 Community Custom Linkle Challenge'}
              </p>
              <p className="text-[11px] text-slate-300">
                {lang === 'fr'
                  ? 'Vous jouez à une grille partagée par un joueur.'
                  : 'You are playing a player-crafted puzzle.'}
              </p>
            </div>
          </div>
          <button
            onClick={resetToDaily}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-xs font-bold text-amber-400 hover:text-white transition"
          >
            <Undo className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Revenir au quotidien' : 'Back to Daily'}
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
            onClick={() => {
              soundFx.playClick();
              setIsBuilderOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-xs font-bold transition"
            title="Créer votre propre Linkle"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'fr' ? 'Créer un Linkle' : 'Create Linkle'}</span>
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t('linkle.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          {t('linkle.subtitle')}
        </p>
      </div>

      {/* Mistakes Counter */}
      <div className="flex items-center justify-center gap-2 mb-6 text-sm font-semibold text-slate-300">
        <span>{t('linkle.mistakesRemaining')}</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
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
                {cat.label[lang] || cat.label.fr}
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
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {tiles.map((tile) => {
            const isSelected = selectedGameIds.includes(tile.gameId);
            return (
              <button
                key={tile.gameId}
                onClick={() => toggleSelectTile(tile.gameId)}
                className={`group relative h-28 sm:h-32 rounded-2xl p-2 border flex flex-col items-center justify-between transition-all duration-200 text-left select-none overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/20 border-[#f59e0b] ring-2 ring-[#f59e0b] -translate-y-1 shadow-lg shadow-amber-500/20'
                    : 'bg-[#131a29] border-[#1e293b] hover:border-slate-500 hover:bg-[#1a2336]'
                }`}
              >
                {/* Background image preview */}
                <div className="w-full h-3/4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={tile.imageUrl}
                    alt={tile.gameTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>

                {/* Game Title */}
                <span
                  className={`text-xs font-black text-center mt-1 truncate w-full px-1 ${
                    isSelected ? 'text-[#f59e0b]' : 'text-slate-200'
                  }`}
                >
                  {tile.gameTitle}
                </span>

                {isSelected && (
                  <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
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
        <div className="bg-[#131a29] border border-amber-500/40 rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
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

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('common.copied')}
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {t('common.share')}
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={isDownloadingImage}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1e293b] hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-600 transition shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isDownloadingImage ? 'Génération...' : 'Partager en Image 🪶'}</span>
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
    </div>
  );
};
