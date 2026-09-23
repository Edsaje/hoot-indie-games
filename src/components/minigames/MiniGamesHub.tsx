import React from 'react';
import { useTranslation } from 'react-i18next';
import {
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
  Flame,
  CheckCircle2,
  ArrowRight,
  Trophy,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { getChallengeStatusForDate, getTodayDateString } from '../../utils/streakManager';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

export type MiniGameId =
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

interface MiniGamesHubProps {
  onSelectGame: (gameId: MiniGameId) => void;
  currentDate: string;
}

export const MiniGamesHub: React.FC<MiniGamesHubProps> = ({
  onSelectGame,
  currentDate,
}) => {
  const { t } = useTranslation();
  const { stats } = useGameStats();

  const todayStr = getTodayDateString();
  const dailyStatuses = getChallengeStatusForDate(currentDate);

  const gamesList: {
    id: MiniGameId;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeText?: string;
    badgeColor?: string;
    isDaily: boolean;
    dailyKey?: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest';
  }[] = [
    {
      id: 'screenle',
      title: t('minigamesHub.screenle.title'),
      subtitle: t('minigamesHub.screenle.subtitle'),
      description: t('minigamesHub.screenle.desc'),
      icon: Camera,
      accentColor: 'from-blue-600/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400',
      isDaily: true,
      dailyKey: 'screenle',
    },
    {
      id: 'indledle',
      title: t('minigamesHub.indledle.title'),
      subtitle: t('minigamesHub.indledle.subtitle'),
      description: t('minigamesHub.indledle.desc'),
      icon: Layers,
      accentColor: 'from-amber-600/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      isDaily: true,
      dailyKey: 'indledle',
    },
    {
      id: 'linkle',
      title: t('minigamesHub.linkle.title'),
      subtitle: t('minigamesHub.linkle.subtitle'),
      description: t('minigamesHub.linkle.desc'),
      icon: Sparkles,
      accentColor: 'from-purple-600/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      isDaily: true,
      dailyKey: 'linkle',
    },
    {
      id: 'profille',
      title: t('minigamesHub.profille.title'),
      subtitle: t('minigamesHub.profille.subtitle'),
      description: t('minigamesHub.profille.desc'),
      icon: FileSearch,
      accentColor: 'from-emerald-600/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      isDaily: true,
      dailyKey: 'profille',
    },
    {
      id: 'chrono',
      title: t('minigamesHub.chrono.title'),
      subtitle: t('minigamesHub.chrono.subtitle'),
      description: t('minigamesHub.chrono.desc'),
      icon: History,
      accentColor: 'from-amber-600/20 to-yellow-500/20 border-yellow-500/30 text-yellow-400',
      badgeText: t('minigamesHub.newBadge'),
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isDaily: true,
      dailyKey: 'chrono',
    },
    {
      id: 'pixel',
      title: t('minigamesHub.pixel.title'),
      subtitle: t('minigamesHub.pixel.subtitle'),
      description: t('minigamesHub.pixel.desc'),
      icon: Sliders,
      accentColor: 'from-cyan-600/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
      badgeText: t('minigamesHub.newBadge'),
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isDaily: true,
      dailyKey: 'pixel',
    },
    {
      id: 'review',
      title: t('minigamesHub.review.title'),
      subtitle: t('minigamesHub.review.subtitle'),
      description: t('minigamesHub.review.desc'),
      icon: MessageSquareQuote,
      accentColor: 'from-sky-600/20 to-blue-500/20 border-sky-500/30 text-sky-400',
      badgeText: t('minigamesHub.newBadge'),
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      isDaily: true,
      dailyKey: 'review',
    },
    {
      id: 'blindtest',
      title: t('minigamesHub.blindtest.title'),
      subtitle: t('minigamesHub.blindtest.subtitle'),
      description: t('minigamesHub.blindtest.desc'),
      icon: Music,
      accentColor: 'from-purple-600/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      badgeText: t('minigamesHub.newBadge'),
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isDaily: true,
      dailyKey: 'blindtest',
    },
    {
      id: 'timeattack',
      title: t('minigamesHub.timeattack.title'),
      subtitle: t('minigamesHub.timeattack.subtitle'),
      description: t('minigamesHub.timeattack.desc'),
      icon: Zap,
      accentColor: 'from-yellow-600/20 to-amber-500/20 border-yellow-500/30 text-yellow-400',
      badgeText: 'Sprint',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      isDaily: false,
    },
    {
      id: 'versus',
      title: t('minigamesHub.versus.title'),
      subtitle: t('minigamesHub.versus.subtitle'),
      description: t('minigamesHub.versus.desc'),
      icon: Swords,
      accentColor: 'from-rose-600/20 to-red-500/20 border-rose-500/30 text-rose-400',
      badgeText: 'Live 1v1',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      isDaily: false,
    },
    {
      id: 'quiz',
      title: t('minigamesHub.quiz.title'),
      subtitle: t('minigamesHub.quiz.subtitle'),
      description: t('minigamesHub.quiz.desc'),
      icon: HelpCircle,
      accentColor: 'from-amber-600/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
      badgeText: `${QUIZ_QUESTIONS.length} Questions`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isDaily: false,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Hub Hero */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-6 sm:p-10 shadow-2xl mb-10 text-center">
        <SylvestreIvyFrame density="medium" />
        {/* Soft emerald forest glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-950/40 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('minigamesHub.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t('minigamesHub.title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3 leading-relaxed">
            {t('minigamesHub.subtitle')}
          </p>
        </div>
      </div>

      {/* Grid of Mini-Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gamesList.map((game) => {
          const Icon = game.icon;
          const isDaily = game.isDaily;
          const status = game.dailyKey ? dailyStatuses[game.dailyKey] : null;
          const modeStats = game.dailyKey ? stats[game.dailyKey] : null;

          return (
            <div
              key={game.id}
              onClick={() => {
                soundFx.playClick();
                onSelectGame(game.id);
              }}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#06241b]/90 hover:bg-[#093a2b]/90 border-2 border-[#78350f] hover:border-[#b45309] p-5 transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-amber-950/30 cursor-pointer transform hover:-translate-y-0.5 overflow-visible"
            >
              <SylvestreIvyFrame density="delicate" />
              <div>
                {/* Top Row: Icon + Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${game.accentColor} border shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {game.badgeText && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          game.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {game.badgeText}
                      </span>
                    )}

                    {isDaily && status && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          status === 'won'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : status === 'lost'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {status === 'won' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{t('minigamesHub.solved')}</span>
                          </>
                        ) : status === 'lost' ? (
                          <span>{t('minigamesHub.failed')}</span>
                        ) : (
                          <span>{t('minigamesHub.toPlay')}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Game Title & Subtitle */}
                <h3 className="text-xl font-black text-white tracking-wide group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>{game.title}</span>
                </h3>
                <div className="text-xs font-semibold text-amber-400/90 mb-2">
                  {game.subtitle}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {game.description}
                </p>
              </div>

              {/* Bottom Footer: Streak / Stats & Play button */}
              <div className="pt-3 border-t border-[#0d543e]/60 flex items-center justify-between gap-2 mt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  {isDaily && modeStats && (
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>
                        {t('minigamesHub.daysShort', { count: modeStats.currentStreak })}
                      </span>
                    </span>
                  )}
                  {isDaily && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      • {currentDate === todayStr ? t('minigamesHub.today') : currentDate}
                    </span>
                  )}
                  {!isDaily && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {t('minigamesHub.unlimited')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-black text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{t('minigamesHub.play')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
