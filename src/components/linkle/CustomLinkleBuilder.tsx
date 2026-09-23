import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { INDIE_GAMES } from '../../data/games';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import {
  X,
  Sparkles,
  Check,
  Share2,
  HelpCircle,
} from 'lucide-react';
import type { ConnectionCategory, DailyConnectionsPuzzle, DifficultyLevel } from '../../types/game';

interface CustomLinkleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomPuzzle: (puzzle: DailyConnectionsPuzzle) => void;
}

interface ItemDraft {
  id: string;
  name: string;
  coverUrl: string;
}

interface CategoryDraft {
  titleFr: string;
  titleEn: string;
  difficulty: 1 | 2 | 3 | 4;
  items: ItemDraft[];
}

const DEFAULT_CATEGORIES: CategoryDraft[] = [
  {
    titleFr: 'Jeux créés par un seul développeur',
    titleEn: 'Solo-developed masterpieces',
    difficulty: 1,
    items: [
      { id: 'stardew-valley', name: 'Stardew Valley', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg' },
      { id: 'undertale', name: 'Undertale', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/header.jpg' },
      { id: 'axiom-verge', name: 'Axiom Verge', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/header.jpg' },
      { id: 'animal-well', name: 'Animal Well', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/header.jpg' },
    ],
  },
  {
    titleFr: 'Bandes originales composées par Lena Raine',
    titleEn: 'Soundtracks composed by Lena Raine',
    difficulty: 2,
    items: [
      { id: 'celeste', name: 'Celeste', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg' },
      { id: 'chicory', name: 'Chicory: A Colorful Tale', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/header.jpg' },
      { id: 'earthblade', name: 'Earthblade', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2224440/header.jpg' },
      { id: 'moonglow-bay', name: 'Moonglow Bay', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1361400/header.jpg' },
    ],
  },
  {
    titleFr: 'Jeux avec une mécanique de boucle temporelle',
    titleEn: 'Games featuring a time loop mechanic',
    difficulty: 3,
    items: [
      { id: 'outer-wilds', name: 'Outer Wilds', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg' },
      { id: 'twelve-minutes', name: 'Twelve Minutes', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1097200/header.jpg' },
      { id: 'loop-hero', name: 'Loop Hero', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/header.jpg' },
      { id: 'the-forgotten-city', name: 'The Forgotten City', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/874260/header.jpg' },
    ],
  },
  {
    titleFr: 'Jeux d’horreur psychologique en basse résolution (PS1 / Retro)',
    titleEn: 'Low-poly retro psychological horror gems',
    difficulty: 4,
    items: [
      { id: 'crow-country', name: 'Crow Country', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/header.jpg' },
      { id: 'signalis', name: 'Signalis', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/header.jpg' },
      { id: 'iron-lung', name: 'Iron Lung', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/header.jpg' },
      { id: 'faith', name: 'FAITH: The Unholy Trinity', coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1179080/header.jpg' },
    ],
  },
];

const DIFFICULTY_COLORS = {
  1: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400',
  2: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400',
  3: 'border-blue-500/60 bg-blue-500/10 text-blue-400',
  4: 'border-purple-500/60 bg-purple-500/10 text-purple-400',
};

export const CustomLinkleBuilder: React.FC<CustomLinkleBuilderProps> = ({
  isOpen,
  onClose,
  onPlayCustomPuzzle,
}) => {
  const { t } = useTranslation();
  const { unlockAchievement } = useAchievements();
  const [categories, setCategories] = useState<CategoryDraft[]>(DEFAULT_CATEGORIES);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const updateCategoryTitle = (catIdx: number, langKey: 'titleFr' | 'titleEn', value: string) => {
    setCategories((prev) => {
      const copy = [...prev];
      copy[catIdx] = { ...copy[catIdx], [langKey]: value };
      return copy;
    });
  };

  const updateItem = (catIdx: number, itemIdx: number, field: keyof ItemDraft, value: string) => {
    setCategories((prev) => {
      const copy = [...prev];
      const items = [...copy[catIdx].items];
      items[itemIdx] = { ...items[itemIdx], [field]: value };
      copy[catIdx] = { ...copy[catIdx], items };
      return copy;
    });
  };

  const handlePickPresetGame = (catIdx: number, itemIdx: number, gameId: string) => {
    const found = INDIE_GAMES.find((g) => g.id === gameId);
    if (!found) return;
    setCategories((prev) => {
      const copy = [...prev];
      const items = [...copy[catIdx].items];
      items[itemIdx] = {
        id: found.id,
        name: found.title,
        coverUrl: found.screenshots[5] || found.screenshots[0] || '',
      };
      copy[catIdx] = { ...copy[catIdx], items };
      return copy;
    });
  };

  const difficultyMap: Record<number, DifficultyLevel> = {
    1: 'easy',
    2: 'medium',
    3: 'hard',
    4: 'expert',
  };

  const buildPuzzleObject = (): DailyConnectionsPuzzle => {
    const formattedCategories: ConnectionCategory[] = categories.map((cat, idx) => ({
      id: `custom-cat-${idx + 1}`,
      label: {
        fr: cat.titleFr || cat.titleEn || `Catégorie ${idx + 1}`,
        en: cat.titleEn || cat.titleFr || `Category ${idx + 1}`,
      },
      difficulty: difficultyMap[cat.difficulty] || 'easy',
      items: cat.items.map((item, itemIdx) => ({
        gameId: item.id || `custom-item-${idx}-${itemIdx}`,
        gameTitle: item.name || `Jeu #${itemIdx + 1}`,
        imageUrl: item.coverUrl || 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg',
      })),
    }));

    return {
      id: `custom-${Date.now()}`,
      date: 'custom',
      categories: formattedCategories,
    };
  };

  const generateLink = () => {
    soundFx.playClick();
    const puzzle = buildPuzzleObject();
    const jsonStr = JSON.stringify(puzzle);
    const base64Str = btoa(encodeURIComponent(jsonStr));
    const fullUrl = `${window.location.origin}${window.location.pathname}#linkle=${base64Str}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      soundFx.playChime();
      unlockAchievement('custom_linkle_builder');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handlePlayNow = () => {
    soundFx.playVictory();
    const puzzle = buildPuzzleObject();
    unlockAchievement('custom_linkle_builder');
    onPlayCustomPuzzle(puzzle);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-linkle-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-[#0e1422] border border-[#1e293b] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 id="custom-linkle-title" className="text-xl font-black text-white flex items-center gap-2">
                {t('linkle.builderTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('linkle.builderSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Editor Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 no-scrollbar">
          {categories.map((cat, catIdx) => (
            <div
              key={cat.difficulty}
              className={`p-4 rounded-xl border ${DIFFICULTY_COLORS[cat.difficulty]} transition-all`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-current" />
                  <span className="text-xs uppercase font-bold tracking-wider">
                    {t('linkle.builderDifficultyLabel', { level: catIdx + 1, count: cat.difficulty })}
                  </span>
                </div>
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                    Titre du lien secret (FR)
                  </label>
                  <input
                    type="text"
                    value={cat.titleFr}
                    onChange={(e) => updateCategoryTitle(catIdx, 'titleFr', e.target.value)}
                    placeholder="ex: Jeux créés sous Godot"
                    className="w-full bg-[#131a29] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                    Secret category connection (EN)
                  </label>
                  <input
                    type="text"
                    value={cat.titleEn}
                    onChange={(e) => updateCategoryTitle(catIdx, 'titleEn', e.target.value)}
                    placeholder="ex: Games made with Godot"
                    className="w-full bg-[#131a29] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 4 Items in category */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Jeu #{itemIdx + 1}
                      </span>
                      {/* Fast selector dropdown from DB */}
                      <select
                        onChange={(e) => handlePickPresetGame(catIdx, itemIdx, e.target.value)}
                        defaultValue=""
                        className="bg-[#131a29] border border-[#1e293b] text-[10px] text-amber-400 rounded px-1 py-0.5 max-w-[90px] truncate"
                      >
                        <option value="" disabled>
                          Piocher...
                        </option>
                        {INDIE_GAMES.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(catIdx, itemIdx, 'name', e.target.value)}
                      placeholder="Nom du jeu"
                      className="w-full bg-[#131a29] border border-[#1e293b] rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />

                    <div className="flex items-center gap-1.5">
                      <img
                        src={item.coverUrl}
                        alt=""
                        className="w-6 h-6 rounded object-cover border border-[#1e293b] shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const safeTitle = encodeURIComponent(item.name?.slice(0, 16) || 'Jeu');
                          target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="30" cy="30" r="12" fill="%23f59e0b" fill-opacity="0.2"/><text x="30" y="34" fill="%23e2e8f0" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">${safeTitle}</text></svg>`;
                        }}
                      />
                      <input
                        type="text"
                        value={item.coverUrl}
                        onChange={(e) => updateItem(catIdx, itemIdx, 'coverUrl', e.target.value)}
                        placeholder="Image URL"
                        className="w-full bg-[#131a29] border border-[#1e293b] rounded px-1.5 py-0.5 text-[10px] text-slate-400 placeholder-slate-600 truncate focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>
              {t('linkle.builderShuffled')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayNow}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              {t('linkle.builderTest')}
            </button>

            <button
              onClick={generateLink}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>{t('linkle.builderLinkCopied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{t('linkle.builderShare')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
