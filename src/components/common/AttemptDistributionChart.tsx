import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Users, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { fetchCommunityStats, type CommunityDistributionData } from '../../services/leaderboardService';

interface AttemptDistributionChartProps {
  game: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest';
  date: string;
  playerAttempts?: number;
  isWon?: boolean;
  compact?: boolean;
}

export const AttemptDistributionChart: React.FC<AttemptDistributionChartProps> = ({
  game,
  date,
  playerAttempts,
  isWon,
  compact = false,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [data, setData] = useState<CommunityDistributionData | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchCommunityStats(game, date).then((res) => {
      if (isMounted) {
        setData(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [game, date]);

  // Determine tiers definition based on game
  const tiers: { key: string; label: string; isFail?: boolean }[] = (() => {
    if (game === 'linkle') {
      return [
        { key: '4', label: lang === 'fr' ? '4 (0 err)' : '4 (0 err)' },
        { key: '5', label: lang === 'fr' ? '5 (1 err)' : '5 (1 err)' },
        { key: '6', label: lang === 'fr' ? '6 (2 err)' : '6 (2 err)' },
        { key: '7', label: lang === 'fr' ? '7 (3 err)' : '7 (3 err)' },
        { key: 'fail', label: lang === 'fr' ? '❌ Échec' : '❌ Fail', isFail: true },
      ];
    }
    if (game === 'profille') {
      return [
        { key: '3', label: '3/3' },
        { key: '2', label: '2/3' },
        { key: '1', label: '1/3' },
        { key: 'fail', label: '0/3', isFail: true },
      ];
    }
    if (game === 'chrono') {
      return [
        { key: '3', label: lang === 'fr' ? '❤️❤️❤️' : '❤️❤️❤️' },
        { key: '2', label: lang === 'fr' ? '❤️❤️' : '❤️❤️' },
        { key: '1', label: lang === 'fr' ? '❤️' : '❤️' },
        { key: 'fail', label: lang === 'fr' ? '❌ Échec' : '❌ Fail', isFail: true },
      ];
    }
    if (game === 'pixel' || game === 'review' || game === 'blindtest') {
      return [
        { key: '1', label: '1' },
        { key: '2', label: '2' },
        { key: '3', label: '3' },
        { key: '4', label: '4' },
        { key: '5', label: '5' },
        { key: 'fail', label: lang === 'fr' ? '❌ Échec' : '❌ Fail', isFail: true },
      ];
    }
    // Screenle & Indledle
    return [
      { key: '1', label: '1' },
      { key: '2', label: '2' },
      { key: '3', label: '3' },
      { key: '4', label: '4' },
      { key: '5', label: '5' },
      { key: '6', label: '6' },
      { key: 'fail', label: '❌', isFail: true },
    ];
  })();

  const distribution = data?.distribution || {};
  const total = data?.total || 1;
  const maxCount = Math.max(1, ...Object.values(distribution));

  // Determine which key is the player's
  const playerKey = (() => {
    if (isWon === false) return 'fail';
    if (typeof playerAttempts === 'number' && playerAttempts > 0) {
      return String(playerAttempts);
    }
    return null;
  })();

  // Calculate percentile rank if player won
  const playerPercentile = (() => {
    if (!playerKey || playerKey === 'fail' || !data) return null;

    let playersWithWorseScore = 0;
    for (const [k, count] of Object.entries(distribution)) {
      if (k === 'fail') {
        playersWithWorseScore += count;
      } else {
        const attemptNum = parseInt(k, 10);
        const playerNum = parseInt(playerKey, 10);
        if (game === 'profille' || game === 'chrono') {
          // In profille and chrono, more is better (3 is better than 2)
          if (attemptNum < playerNum) playersWithWorseScore += count;
        } else {
          // In others, fewer attempts is better (2 is better than 4)
          if (attemptNum > playerNum) playersWithWorseScore += count;
        }
      }
    }
    const pct = Math.round((playersWithWorseScore / Math.max(1, total)) * 100);
    return Math.min(99, Math.max(1, pct));
  })();

  return (
    <div className={`rounded-2xl bg-[#0b0f19] border border-[#1e293b] p-4 sm:p-5 text-left shadow-lg ${compact ? 'max-w-md' : 'max-w-lg'} mx-auto w-full`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
              {lang === 'fr' ? 'Distribution des Essais' : 'Guess Distribution'}
            </h4>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Users className="w-3 h-3 text-slate-500" />
              <span>
                {data?.total || 0} {lang === 'fr' ? 'joueurs aujourd\'hui' : 'players today'}
              </span>
            </div>
          </div>
        </div>

        {data && data.averageAttempts > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-[#131a29] border border-[#1e293b] text-right shrink-0">
            <div className="text-[9px] uppercase font-bold text-slate-400">
              {lang === 'fr' ? 'Moyenne' : 'Average'}
            </div>
            <div className="text-xs font-mono font-black text-amber-400">
              {data.averageAttempts} {game === 'profille' ? 'pts' : game === 'chrono' ? (lang === 'fr' ? 'vies' : 'lives') : (lang === 'fr' ? 'essais' : 'tries')}
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Bar Chart Rows */}
      <div className="space-y-1.5 my-3">
        {tiers.map((tier) => {
          const count = distribution[tier.key] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidthPercent = maxCount > 0 ? Math.max(10, Math.round((count / maxCount) * 100)) : 10;
          const isCurrentPlayerTier = playerKey === tier.key;

          return (
            <div key={tier.key} className="flex items-center gap-2 text-xs">
              {/* Label */}
              <div
                className={`w-10 sm:w-12 text-right font-mono font-bold text-[11px] shrink-0 ${
                  isCurrentPlayerTier
                    ? 'text-amber-400 font-black'
                    : tier.isFail
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {tier.label}
              </div>

              {/* Bar */}
              <div className="flex-1 bg-[#131a29] rounded-lg overflow-hidden h-6 flex items-center p-0.5 border border-[#1e293b]/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidthPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-md flex items-center justify-between px-2 text-[11px] font-bold transition-all shadow-sm ${
                    isCurrentPlayerTier
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 ring-2 ring-amber-400/60 shadow-amber-500/20'
                      : tier.isFail
                      ? 'bg-gradient-to-r from-rose-900/60 to-rose-800/60 text-rose-200 border border-rose-700/40'
                      : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 hover:from-slate-700 hover:to-slate-600'
                  }`}
                >
                  <span className="font-mono font-bold">
                    {count} <span className="opacity-70 text-[9px]">({percentage}%)</span>
                  </span>

                  {isCurrentPlayerTier && (
                    <span className="ml-1.5 px-1 py-0.2 rounded bg-slate-950/80 text-amber-300 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                      {lang === 'fr' ? 'Vous' : 'You'}
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Percentile Insight Banner */}
      {playerPercentile !== null && playerPercentile > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center gap-2 text-[11px] text-amber-300/90 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {lang === 'fr'
              ? `Chapeau ! Vous avez été plus rapide que ${playerPercentile}% des joueurs aujourd'hui.`
              : `Great job! You scored better than ${playerPercentile}% of players today.`}
          </span>
        </div>
      )}

      {isWon && playerPercentile === null && (
        <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center gap-2 text-[11px] text-emerald-400/90 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            {lang === 'fr'
              ? 'Victoire enregistrée dans les statistiques de la communauté !'
              : 'Victory recorded in community statistics!'}
          </span>
        </div>
      )}

      {!isWon && isWon !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>
            {lang === 'fr'
              ? 'Partie complétée. Revanche demain sur le prochain défi !'
              : 'Game finished. Try again on tomorrow\'s challenge!'}
          </span>
        </div>
      )}
    </div>
  );
};
