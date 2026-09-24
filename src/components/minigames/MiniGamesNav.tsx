import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  Camera,
  Layers,
  Sparkles,
  FileSearch,
  History,
  Sliders,
  MessageSquareQuote,
  Music,
  Zap,
  Swords,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getChallengeStatusForDate } from '../../utils/streakManager';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';

export type MiniGameSubTab =
  | 'hub'
  | 'screenle'
  | 'indledle'
  | 'linkle'
  | 'profille'
  | 'chrono'
  | 'pixel'
  | 'review'
  | 'blindtest'
  | 'timeattack'
  | 'versus'
  | 'quiz';

interface MiniGamesNavProps {
  activeSubTab: MiniGameSubTab;
  onSelectSubTab: (subTab: MiniGameSubTab) => void;
  currentDate: string;
}

export const MiniGamesNav: React.FC<MiniGamesNavProps> = ({
  activeSubTab,
  onSelectSubTab,
  currentDate,
}) => {
  const { t } = useTranslation();
  const dailyStatuses = getChallengeStatusForDate(currentDate);

  const dailyItems: {
    id: MiniGameSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    showDailyDot?: boolean;
    dailyKey: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest';
  }[] = [
    {
      id: 'screenle',
      label: t('nav.screenle'),
      icon: Camera,
      showDailyDot: true,
      dailyKey: 'screenle',
    },
    {
      id: 'indledle',
      label: t('nav.indledle'),
      icon: Layers,
      showDailyDot: true,
      dailyKey: 'indledle',
    },
    {
      id: 'linkle',
      label: t('nav.linkle'),
      icon: Sparkles,
      showDailyDot: true,
      dailyKey: 'linkle',
    },
    {
      id: 'profille',
      label: t('nav.profille'),
      icon: FileSearch,
      showDailyDot: true,
      dailyKey: 'profille',
    },
    {
      id: 'chrono',
      label: t('nav.chrono'),
      icon: History,
      showDailyDot: true,
      dailyKey: 'chrono',
    },
    {
      id: 'pixel',
      label: t('nav.pixel'),
      icon: Sliders,
      showDailyDot: true,
      dailyKey: 'pixel',
    },
    {
      id: 'review',
      label: t('nav.review'),
      icon: MessageSquareQuote,
      showDailyDot: true,
      dailyKey: 'review',
    },
    {
      id: 'blindtest',
      label: t('nav.blindtest'),
      icon: Music,
      showDailyDot: true,
      dailyKey: 'blindtest',
    },
  ];

  const specialItems: {
    id: MiniGameSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'timeattack',
      label: t('nav.timeattack'),
      icon: Zap,
      badge: 'Sprint',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    },
    {
      id: 'versus',
      label: t('nav.versus'),
      icon: Swords,
      badge: 'Live',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'quiz',
      label: t('nav.quiz'),
      icon: HelpCircle,
      badge: `${QUIZ_QUESTIONS.length} Q.`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  ];

  const handleNavSelect = (subTab: MiniGameSubTab, e?: React.MouseEvent) => {
    if (e && (e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey)) {
      return; // Clic molette ou touche modificatrice : laisser le navigateur ouvrir dans un nouvel onglet
    }
    if (e) {
      e.preventDefault();
    }
    soundFx.playClick();
    onSelectSubTab(subTab);
    if (typeof window !== 'undefined') {
      window.location.hash = subTab === 'hub' ? '#minigames' : `#${subTab}`;
    }
  };

  return (
    <div className="relative w-full bg-[#020e0a]/95 border-b border-[#0d543e]/70 backdrop-blur-md sticky top-16 z-30 shadow-md">
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-2.5 space-y-1.5 sm:space-y-2">
        {/* Étage 1 : Hub & Modes Compétitifs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Bouton Hub proéminent pour revenir à l'accueil des mini-jeux à tout moment */}
          <a
            href="#minigames"
            onClick={(e) => handleNavSelect('hub', e)}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'hub'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400'
            }`}
            title={t('minigamesHub.viewAllInHub')}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${activeSubTab === 'hub' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>
              {activeSubTab === 'hub'
                ? t('minigamesHub.hubTitle')
                : t('minigamesHub.backToHub')}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                activeSubTab === 'hub'
                  ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              11
            </span>
          </a>

          <div className="hidden sm:block h-4 w-px bg-emerald-800/50 mx-1" />

          {/* Modes Compétitifs & Sprints */}
          {specialItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavSelect(item.id, e)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-[#06241b]/80 text-emerald-100/80 hover:text-white hover:bg-[#093a2b] border border-[#0d543e]/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-slate-950' : 'text-emerald-300/70 group-hover:text-amber-400'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && !isActive && (
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Étage 2 : Les 8 Défis Quotidiens (100% visibles, sans aucun scroll caché) */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-0.5">
          {dailyItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            const isSolved = dailyStatuses[item.dailyKey] === 'won';

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavSelect(item.id, e)}
                className={`group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-[#06241b]/70 text-emerald-100/80 hover:text-white hover:bg-[#093a2b] border border-[#0d543e]/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-slate-950' : 'text-emerald-300/70 group-hover:text-amber-400'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>

                {item.badge && !isActive && (
                  <span
                    className={`hidden md:inline text-[9px] font-black uppercase px-1 py-0.2 rounded border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.showDailyDot && isSolved && (
                  <span
                    title={t('minigamesHub.dailySolved')}
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive ? 'bg-slate-950 ring-1 ring-slate-900' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
