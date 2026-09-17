import React, { useState, useEffect } from 'react';
import type { OverallStats } from '../types/game';
import {
  GameStatsContext,
  defaultOverallStats,
  STATS_STORAGE_KEY,
} from './GameStatsContext';

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
    mode: 'screenle' | 'indledle' | 'linkle',
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

      if (isWon) {
        modeStats.won += 1;
        modeStats.currentStreak += 1;
        if (modeStats.currentStreak > modeStats.maxStreak) {
          modeStats.maxStreak = modeStats.currentStreak;
        }

        const dist = { ...modeStats.guessDistribution };
        dist[guessCount] = (dist[guessCount] || 0) + 1;
        modeStats.guessDistribution = dist;
      } else {
        modeStats.currentStreak = 0;
      }

      return {
        ...prev,
        [mode]: modeStats,
      };
    });
  };

  const resetStats = () => {
    setStats(defaultOverallStats);
  };

  return (
    <GameStatsContext.Provider value={{ stats, recordGameResult, resetStats }}>
      {children}
    </GameStatsContext.Provider>
  );
};
