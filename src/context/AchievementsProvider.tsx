import React, { useState, useEffect, useCallback } from 'react';
import { ACHIEVEMENTS_LIST } from '../data/achievements';
import type { Achievement } from '../types/achievements';
import { AchievementsContext } from './AchievementsContext';
import { soundFx } from '../utils/audio';
import { Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'hoot_unlocked_achievements_v1';

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const list = saved ? (JSON.parse(saved) as string[]) : [];
      const hour = new Date().getHours();
      if ((hour >= 23 || hour < 5) && !list.includes('night_watch')) {
        list.push('night_watch');
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {
          // Ignore
        }
      }
      return list;
    } catch {
      return [];
    }
  });

  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null);

  // Compute total feathers count
  const feathersCount = ACHIEVEMENTS_LIST.reduce((acc, ach) => {
    return unlockedIds.includes(ach.id) ? acc + ach.feathersReward : acc;
  }, 0);

  const unlockAchievement = useCallback((id: string) => {
    const ach = ACHIEVEMENTS_LIST.find((a) => a.id === id);
    if (!ach) return;

    setUnlockedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage error
      }
      soundFx.playAchievement();
      setRecentlyUnlocked(ach);
      return next;
    });
  }, []);

  const isUnlocked = useCallback(
    (id: string) => unlockedIds.includes(id),
    [unlockedIds]
  );

  const clearRecentAchievement = useCallback(() => {
    setRecentlyUnlocked(null);
  }, []);

  // Auto-dismiss achievement toast after 5s
  useEffect(() => {
    if (!recentlyUnlocked) return;
    const timer = setTimeout(() => {
      setRecentlyUnlocked(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [recentlyUnlocked]);

  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  return (
    <AchievementsContext.Provider
      value={{
        unlockedIds,
        feathersCount,
        unlockAchievement,
        isUnlocked,
        recentlyUnlocked,
        clearRecentAchievement,
        allAchievements: ACHIEVEMENTS_LIST,
      }}
    >
      {children}

      {/* Achievement Toast Banner */}
      {recentlyUnlocked && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#131a29] border border-amber-500/60 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 animate-bounce duration-300 flex items-start gap-3"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-[#f59e0b] border border-amber-500/40 shrink-0">
            <Sparkles className="w-5 h-5 animate-spin duration-1000" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                {currentLang === 'fr' ? '🏆 Succès Débloqué !' : '🏆 Achievement Unlocked!'}
              </span>
              <button
                onClick={clearRecentAchievement}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-white truncate mt-0.5">
              {recentlyUnlocked.title[currentLang]}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
              {recentlyUnlocked.description[currentLang]}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
              <span>+{recentlyUnlocked.feathersReward}</span>
              <span>🪶 {currentLang === 'fr' ? "Plumes d'Or" : 'Golden Feathers'}</span>
            </div>
          </div>
        </aside>
      )}
    </AchievementsContext.Provider>
  );
};
