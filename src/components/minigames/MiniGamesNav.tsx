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
  const { i18n } = useTranslation();
  const isFr = i18n.language.startsWith('fr');
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
      label: isFr ? 'Capture' : 'Framed',
      icon: Camera,
      showDailyDot: true,
      dailyKey: 'screenle',
    },
    {
      id: 'indledle',
      label: 'Classic',
      icon: Layers,
      showDailyDot: true,
      dailyKey: 'indledle',
    },
    {
      id: 'linkle',
      label: isFr ? 'Connexions' : 'Connections',
      icon: Sparkles,
      showDailyDot: true,
      dailyKey: 'linkle',
    },
    {
      id: 'profille',
      label: isFr ? 'Profil' : 'Profile',
      icon: FileSearch,
      showDailyDot: true,
      dailyKey: 'profille',
    },
    {
      id: 'chrono',
      label: isFr ? 'Chrono' : 'Timeline',
      icon: History,
      badge: isFr ? 'Nouveau' : 'New',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      showDailyDot: true,
      dailyKey: 'chrono',
    },
    {
      id: 'pixel',
      label: 'Pixel',
      icon: Sliders,
      badge: isFr ? 'Nouveau' : 'New',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      showDailyDot: true,
      dailyKey: 'pixel',
    },
    {
      id: 'review',
      label: isFr ? 'Critique' : 'Review',
      icon: MessageSquareQuote,
      badge: isFr ? 'Nouveau' : 'New',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      showDailyDot: true,
      dailyKey: 'review',
    },
    {
      id: 'blindtest',
      label: 'Blind Test',
      icon: Music,
      badge: isFr ? 'Nouveau' : 'New',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
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
      label: 'Time Attack',
      icon: Zap,
      badge: 'Sprint',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    },
    {
      id: 'versus',
      label: isFr ? 'Duel 1v1' : '1v1 Duel',
      icon: Swords,
      badge: 'Live',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'quiz',
      label: isFr ? 'Quiz Indé' : 'Indie Quiz',
      icon: HelpCircle,
      badge: isFr ? '76 Q.' : '76 Q.',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  ];

  return (
    <div className="w-full bg-[#0d1322]/95 border-b border-[#1e293b]/80 backdrop-blur-md sticky top-16 z-30 shadow-md">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-2.5 space-y-1.5 sm:space-y-2">
        {/* Étage 1 : Hub & Modes Compétitifs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Bouton Hub proéminent pour revenir à l'accueil des mini-jeux à tout moment */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectSubTab('hub');
            }}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'hub'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400'
            }`}
            title={isFr ? 'Voir tous les mini-jeux dans le Hub' : 'View all mini-games in Hub'}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${activeSubTab === 'hub' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>
              {activeSubTab === 'hub'
                ? isFr ? 'Hub des Jeux' : 'Games Hub'
                : isFr ? '← Hub des Mini-Jeux' : '← Games Hub'}
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
          </button>

          <div className="hidden sm:block h-4 w-px bg-slate-700/60 mx-1" />

          {/* Modes Compétitifs & Sprints */}
          {specialItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectSubTab(item.id);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-[#131a29]/80 text-slate-300 hover:text-white hover:bg-slate-800/90 border border-[#1e293b]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
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
              </button>
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
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectSubTab(item.id);
                }}
                className={`group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-[#131a29]/70 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-[#1e293b]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
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
                    title={isFr ? 'Défi du jour résolu' : 'Daily solved'}
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive ? 'bg-slate-950 ring-1 ring-slate-900' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
