import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { useGameStats } from '../../context/useGameStats';
import { getTodayDateString, getYesterdayDateString, getChallengeStatusForDate } from '../../utils/streakManager';
import { soundFx } from '../../utils/audio';

import { type DailyGameMode, defaultModeStats } from '../../context/GameStatsContext';

interface StreakNoticeBannerProps {
  mode: DailyGameMode;
  currentDate: string;
  isWon: boolean;
  onSelectDate?: (date: string) => void;
}

export const StreakNoticeBanner: React.FC<StreakNoticeBannerProps> = ({
  mode,
  currentDate,
  isWon,
  onSelectDate,
}) => {
  const { t } = useTranslation();
  const { stats } = useGameStats();

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(todayStr);

  const modeStats = stats[mode] || defaultModeStats;
  const breakInfo = modeStats.activeStreakBreak;
  const isRescued = Boolean(modeStats.streakRescued) && currentDate === yesterdayStr && isWon;

  // Case 1: Yesterday was rescued and won!
  if (isRescued) {
    const todayStatus = getChallengeStatusForDate(todayStr)[mode];
    const canContinueToToday = todayStatus !== 'won';

    return (
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-500/40 shadow-lg shadow-amber-500/10 text-left animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0 animate-bounce">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>{t('streak.flamePreserved')}</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                {t('streak.daysCount', { count: modeStats.currentStreak })}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {t('streak.rescueSuccess')}
            </p>

            {canContinueToToday && onSelectDate && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectDate(todayStr);
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('streak.playToday')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Streak broken due to missing yesterday
  if (breakInfo && breakInfo.canRescueYesterday) {
    return (
      <div className="my-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-lg shadow-amber-900/20 text-left animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-sm font-black text-amber-200">
                {t('streak.yesterdayMissedTitle')}
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                {t('streak.lostStreak', { count: breakInfo.lostStreak })}
              </span>
            </div>

            <p className="text-xs text-amber-100/90 leading-relaxed mb-3">
              {t('streak.rescueOpportunityDesc')}
            </p>

            {onSelectDate && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSelectDate(yesterdayStr);
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>{t('streak.rescueAction')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Streak ended without rescue possibility (e.g. defeat or missed 2+ days)
  if (breakInfo && !breakInfo.canRescueYesterday && breakInfo.lostStreak > 0) {
    return (
      <div className="my-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-left text-xs text-slate-300 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-800 text-slate-400 shrink-0">
          <AlertTriangle className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <span className="font-bold text-slate-200">
            {t('streak.streakEnded')} :
          </span>{' '}
          {t('streak.streakEndedDesc', { count: breakInfo.lostStreak })}
        </div>
      </div>
    );
  }

  return null;
};
