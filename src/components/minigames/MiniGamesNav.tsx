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
  Zap,
  Swords,
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
  | 'timeattack'
  | 'versus';

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

  const navItems: {
    id: MiniGameSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    showDailyDot?: boolean;
    dailyKey?: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review';
  }[] = [
    {
      id: 'hub',
      label: 'Hub',
      icon: LayoutGrid,
    },
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
      id: 'timeattack',
      label: 'Time Attack',
      icon: Zap,
      badge: 'Sprint',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'versus',
      label: isFr ? 'Duel 1v1' : '1v1 Duel',
      icon: Swords,
      badge: 'Live',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  ];

  return (
    <div className="w-full bg-[#0d1322]/90 border-b border-[#1e293b]/70 backdrop-blur-md sticky top-16 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar justify-start sm:justify-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            const isSolved = item.dailyKey && dailyStatuses[item.dailyKey] === 'won';

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectSubTab(item.id);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${item.badgeColor}`}
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
