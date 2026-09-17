import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievements } from '../../context/useAchievements';
import { soundFx } from '../../utils/audio';
import {
  X,
  Feather,
  Eye,
  Sparkles,
  Globe,
  Moon,
  BookOpen,
  Dices,
  Compass,
  Award,
  Trophy,
  Puzzle,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import type { Achievement } from '../../types/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const renderIcon = (iconName: string, isUnlocked: boolean) => {
  const className = `w-5 h-5 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`;
  switch (iconName) {
    case 'Feather':
      return <Feather className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Dices':
      return <Dices className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Puzzle':
      return <Puzzle className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { allAchievements, unlockedIds, feathersCount } = useAchievements();
  const [filter, setFilter] = useState<'all' | 'gameplay' | 'exploration' | 'mastery'>('all');

  if (!isOpen) return null;

  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const filteredAchievements = allAchievements.filter((ach) => {
    if (filter === 'all') return true;
    return ach.category === filter;
  });

  const totalPossibleFeathers = allAchievements.reduce((acc, a) => acc + a.feathersReward, 0);
  const progressPercent = Math.round((unlockedIds.length / allAchievements.length) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#0e1422] border border-[#1e293b] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <h2 id="achievements-modal-title" className="text-xl font-black text-white flex items-center gap-2">
                {currentLang === 'fr' ? 'Le Trésor des Plumes' : 'The Feather Trove'}
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {feathersCount} 🪶
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'fr'
                  ? 'Accomplissez des faits d’armes indés pour garnir votre perchoir.'
                  : 'Achieve indie feats to feather your nocturnal roost.'}
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

        {/* Global Progress Bar */}
        <div className="py-4 border-b border-[#1e293b]/70">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-semibold">
              {currentLang === 'fr' ? 'Progression globale' : 'Overall Progress'}
            </span>
            <span className="text-amber-400 font-mono font-bold">
              {unlockedIds.length} / {allAchievements.length} ({progressPercent}%) • {feathersCount} / {totalPossibleFeathers} 🪶
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#131a29] rounded-full overflow-hidden border border-[#1e293b]">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: currentLang === 'fr' ? 'Tous' : 'All' },
              { id: 'gameplay', label: 'Gameplay' },
              { id: 'mastery', label: currentLang === 'fr' ? 'Maîtrise' : 'Mastery' },
              { id: 'exploration', label: 'Exploration' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setFilter(cat.id);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#131a29] text-slate-400 hover:text-slate-200 border border-[#1e293b]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 mt-1 no-scrollbar">
          {filteredAchievements.map((achievement: Achievement) => {
            const unlocked = unlockedIds.includes(achievement.id);
            const isSecret = achievement.secret && !unlocked;

            return (
              <div
                key={achievement.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                  unlocked
                    ? 'bg-[#131a29]/90 border-amber-500/30 shadow-sm'
                    : 'bg-[#0f1422]/50 border-[#1e293b]/60 opacity-70'
                }`}
              >
                {/* Icon Circle */}
                <div
                  className={`p-3 rounded-xl border shrink-0 ${
                    unlocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-[#131a29] border-[#1e293b] text-slate-500'
                  }`}
                >
                  {isSecret ? <Lock className="w-5 h-5 text-slate-600" /> : renderIcon(achievement.icon, unlocked)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        unlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {isSecret
                        ? currentLang === 'fr'
                          ? 'Succès Secret'
                          : 'Secret Achievement'
                        : achievement.title[currentLang]}
                    </h4>
                    {unlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isSecret
                      ? currentLang === 'fr'
                        ? 'Gardez les yeux grands ouverts dans la nuit...'
                        : 'Keep your eyes peeled during the dead of night...'
                      : achievement.description[currentLang]}
                  </p>
                </div>

                {/* Feathers Reward */}
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 border ${
                    unlocked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#131a29] text-slate-500 border-[#1e293b]'
                  }`}
                >
                  +{achievement.feathersReward} 🪶
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1e293b] mt-3 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
