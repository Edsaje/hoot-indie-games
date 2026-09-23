import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ACHIEVEMENTS_LIST } from '../data/achievements';
import type { Achievement } from '../types/achievements';
import { AchievementsContext } from './AchievementsContext';
import { soundFx } from '../utils/audio';
import {
  getFeathersBalance,
  addBonusFeathers as addBonusFeathersUtil,
  spendFeathers as spendFeathersUtil,
  checkAndClaimAllPendingDailyRewards,
} from '../utils/featherEconomy';
import { getTodayDateString } from '../utils/streakManager';
import { Feather, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/localization';
import type { FeatherToast } from './AchievementsContext';

const STORAGE_KEY = 'hoot_unlocked_achievements_v1';

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
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
  const [recentFeatherToast, setRecentFeatherToast] = useState<FeatherToast | null>(null);
  const [economyTick, setEconomyTick] = useState(0);

  // Somme des plumes gagnées via les succès
  const baseAchievementsFeathers = React.useMemo(() => {
    return ACHIEVEMENTS_LIST.reduce((acc, ach) => {
      return unlockedIds.includes(ach.id) ? acc + ach.feathersReward : acc;
    }, 0);
  }, [unlockedIds]);

  // Solde disponible dynamique (Succès + Farm journalier - Dépenses en boutique)
  const feathersCount = React.useMemo(() => {
    return getFeathersBalance(baseAchievementsFeathers);
  }, [baseAchievementsFeathers, economyTick]);

  // Écoute de la synchronisation cloud et des mises à jour d'économie
  useEffect(() => {
    const handleCloudRestored = (e: any) => {
      const cloudData = e.detail;
      if (cloudData && Array.isArray(cloudData.achievements)) {
        setUnlockedIds((prev) => Array.from(new Set([...prev, ...cloudData.achievements])));
      }
      setEconomyTick((t) => t + 1);
    };

    const handleFeathersUpdated = () => {
      setEconomyTick((t) => t + 1);
    };

    window.addEventListener('hoot_cloud_save_restored', handleCloudRestored as any);
    window.addEventListener('hoot_feathers_updated', handleFeathersUpdated);
    return () => {
      window.removeEventListener('hoot_cloud_save_restored', handleCloudRestored as any);
      window.removeEventListener('hoot_feathers_updated', handleFeathersUpdated);
    };
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    const ach = ACHIEVEMENTS_LIST.find((a) => a.id === id);
    if (!ach) return;

    setUnlockedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('hoot_feathers_updated'));
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

  const clearRecentFeatherToast = useCallback(() => {
    setRecentFeatherToast(null);
  }, []);

  const spendFeathers = useCallback(
    (amount: number, reason?: string) => {
      const success = spendFeathersUtil(amount, feathersCount, reason);
      if (success) {
        setEconomyTick((v) => v + 1);
      }
      return success;
    },
    [feathersCount]
  );

  const addBonusFeathers = useCallback((amount: number, reason?: string) => {
    addBonusFeathersUtil(amount, reason);
    setEconomyTick((v) => v + 1);
  }, []);

  const alreadyNotifiedKeysRef = useRef<Set<string>>(new Set());

  const checkPendingDailyRewards = useCallback((dateStr?: string) => {
    const targetDate = dateStr || getTodayDateString();
    const result = checkAndClaimAllPendingDailyRewards(targetDate);
    if (result.totalAwarded > 0) {
      // Circuit-court : Empêche formellement de réafficher le même toast dans la même session
      const signature = `${targetDate}_${result.newGames.slice().sort().join('_')}_${result.grandSlamAwarded}`;
      if (!alreadyNotifiedKeysRef.current.has(signature)) {
        alreadyNotifiedKeysRef.current.add(signature);
        setEconomyTick((v) => v + 1);
        soundFx.playChime();
        setRecentFeatherToast({
          amount: result.totalAwarded,
          message: result.grandSlamAwarded
            ? 'Grand Chelem quotidien validé ! (+25 plumes)'
            : `Défi${result.newGames.length > 1 ? 's' : ''} quotidien${result.newGames.length > 1 ? 's' : ''} résolu${result.newGames.length > 1 ? 's' : ''} !`,
        });
      }
    }
    return result;
  }, []);

  // Détection des récompenses au chargement, au focus de l'onglet et lors d'une victoire
  useEffect(() => {
    checkPendingDailyRewards();

    const handleCheck = () => {
      checkPendingDailyRewards();
    };

    window.addEventListener('focus', handleCheck);
    window.addEventListener('visibilitychange', handleCheck);
    window.addEventListener('hoot_daily_game_completed', handleCheck);

    return () => {
      window.removeEventListener('focus', handleCheck);
      window.removeEventListener('visibilitychange', handleCheck);
      window.removeEventListener('hoot_daily_game_completed', handleCheck);
    };
  }, [checkPendingDailyRewards]);

  // Auto-dismiss achievement toast after 5s
  useEffect(() => {
    if (!recentlyUnlocked) return;
    const timer = setTimeout(() => {
      setRecentlyUnlocked(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [recentlyUnlocked]);

  // Auto-dismiss feather reward toast after 4.5s
  useEffect(() => {
    if (!recentFeatherToast) return;
    const timer = setTimeout(() => {
      setRecentFeatherToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [recentFeatherToast]);

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
        spendFeathers,
        addBonusFeathers,
        checkPendingDailyRewards,
        recentFeatherToast,
        clearRecentFeatherToast,
      }}
    >
      {children}

      {/* Toast Notification : Récompense Farm Journalier de Plumes */}
      {recentFeatherToast && !recentlyUnlocked && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#041d15] border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl shadow-amber-500/25 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/25 text-amber-300 border border-amber-400/50 shrink-0">
            <Feather className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                Récompense Quotidienne
              </span>
              <button
                onClick={clearRecentFeatherToast}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
              <span>+{recentFeatherToast.amount} Plumes d’Or</span>
              <span>🪶</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {recentFeatherToast.message}
            </p>
          </div>
        </aside>
      )}

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
                {t('achievementsModal.toast')}
              </span>
              <button
                onClick={clearRecentAchievement}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-white truncate mt-0.5">
              {getLocalizedText(recentlyUnlocked.title, i18n.language)}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
              {getLocalizedText(recentlyUnlocked.description, i18n.language)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
              <span>+{recentlyUnlocked.feathersReward}</span>
              <span>🪶 {t('nav.achievements')}</span>
            </div>
          </div>
        </aside>
      )}
    </AchievementsContext.Provider>
  );
};
