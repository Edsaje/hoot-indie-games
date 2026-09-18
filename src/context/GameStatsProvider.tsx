import React, { useState, useEffect } from 'react';
import type { OverallStats } from '../types/game';
import {
  GameStatsContext,
  defaultOverallStats,
  STATS_STORAGE_KEY,
  type DailyGameMode,
} from './GameStatsContext';
import {
  getTodayDateString,
  getYesterdayDateString,
  getChallengeStatusForDate,
} from '../utils/streakManager';

export const GameStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<OverallStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as OverallStats;
      }
    } catch {
      // Fallback
    }
    return defaultOverallStats;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Storage full or disabled
    }
  }, [stats]);

  const recordGameResult = (
    mode: DailyGameMode,
    dateStr: string,
    isWon: boolean,
    guessCount: number
  ) => {
    setStats((prev) => {
      const modeStats = { ...prev[mode] };

      // Prevent counting the same day twice for the same game
      if (modeStats.lastPlayedDate === dateStr) {
        return prev;
      }

      modeStats.played += 1;
      modeStats.lastPlayedDate = dateStr;

      const todayStr = getTodayDateString();
      const yesterdayStr = getYesterdayDateString(todayStr);

      if (isWon) {
        modeStats.won += 1;
        const dist = { ...modeStats.guessDistribution };
        dist[guessCount] = (dist[guessCount] || 0) + 1;
        modeStats.guessDistribution = dist;

        modeStats.streakRescued = false;
        const lastWon = modeStats.lastWonDate;

        if (dateStr === todayStr) {
          // Playing TODAY
          const yesterdayStatus = getChallengeStatusForDate(yesterdayStr)[mode];

          if (yesterdayStatus === 'won' || lastWon === yesterdayStr) {
            // Consecutive win from yesterday!
            modeStats.currentStreak += 1;
            modeStats.lastWonDate = todayStr;
            modeStats.activeStreakBreak = null;
          } else if (yesterdayStatus === 'unplayed') {
            // Yesterday was missed!
            const prevStreak = modeStats.currentStreak;
            if (prevStreak > 0) {
              modeStats.activeStreakBreak = {
                date: todayStr,
                missedDate: yesterdayStr,
                lostStreak: prevStreak,
                canRescueYesterday: true,
              };
              modeStats.currentStreak = 1;
            } else {
              modeStats.activeStreakBreak = null;
              modeStats.currentStreak = 1;
            }
            modeStats.lastWonDate = todayStr;
          } else {
            // Yesterday was played and lost
            modeStats.currentStreak = 1;
            modeStats.lastWonDate = todayStr;
            modeStats.activeStreakBreak = null;
          }
        } else if (dateStr === yesterdayStr) {
          // Playing YESTERDAY (la veille)
          const breakInfo = modeStats.activeStreakBreak;
          const todayStatus = getChallengeStatusForDate(todayStr)[mode];

          if (breakInfo && breakInfo.canRescueYesterday) {
            // Rescue previous broken streak!
            const restoredStreak = breakInfo.lostStreak + 1 + (todayStatus === 'won' ? 1 : 0);
            modeStats.currentStreak = restoredStreak;
            modeStats.activeStreakBreak = null;
            modeStats.streakRescued = true;
            modeStats.lastWonDate = todayStatus === 'won' ? todayStr : yesterdayStr;
          } else {
            const dayBeforeYesterdayStr = getYesterdayDateString(yesterdayStr);
            if (lastWon === dayBeforeYesterdayStr) {
              modeStats.currentStreak += 1;
            } else if (!lastWon || modeStats.currentStreak === 0) {
              modeStats.currentStreak = 1;
            }
            modeStats.streakRescued = true;
            modeStats.activeStreakBreak = null;
            modeStats.lastWonDate = yesterdayStr;
          }
        } else {
          // Normal fallback for any other date
          modeStats.currentStreak = 1;
          modeStats.lastWonDate = dateStr;
          modeStats.activeStreakBreak = null;
        }

        if (modeStats.currentStreak > modeStats.maxStreak) {
          modeStats.maxStreak = modeStats.currentStreak;
        }
      } else {
        // Player LOST
        const lostStreak = modeStats.currentStreak;
        modeStats.streakRescued = false;
        if (lostStreak > 0) {
          modeStats.activeStreakBreak = {
            date: dateStr,
            missedDate: dateStr,
            lostStreak,
            canRescueYesterday: false,
          };
        }
        modeStats.currentStreak = 0;
      }

      return {
        ...prev,
        [mode]: modeStats,
      };
    });
  };

  const dismissStreakBreak = (mode: DailyGameMode) => {
    setStats((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        activeStreakBreak: null,
      },
    }));
  };

  const resetStats = () => {
    setStats(defaultOverallStats);
  };

  return (
    <GameStatsContext.Provider value={{ stats, recordGameResult, resetStats, dismissStreakBreak }}>
      {children}
    </GameStatsContext.Provider>
  );
};
