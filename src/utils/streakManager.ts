/**
 * streakManager.ts
 * Centralized utility for date management, streak calculation, and calendar restrictions
 * in Hoot Indie Games.
 */

export const getTodayDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (referenceDateStr?: string): string => {
  if (referenceDateStr) {
    const [y, m, d] = referenceDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayDifference = (dateStr1: string, dateStr2: string): number => {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

export const isDatePlayable = (
  dateStr: string,
  todayStr = getTodayDateString()
): boolean => {
  const yesterdayStr = getYesterdayDateString(todayStr);
  return dateStr === todayStr || dateStr === yesterdayStr;
};

export const isDatePastExpired = (
  dateStr: string,
  todayStr = getTodayDateString()
): boolean => {
  const yesterdayStr = getYesterdayDateString(todayStr);
  return dateStr < yesterdayStr;
};

export const isDateFuture = (
  dateStr: string,
  todayStr = getTodayDateString()
): boolean => {
  return dateStr > todayStr;
};

export type DayPlayStatus = 'won' | 'lost' | 'unplayed';

export interface DateChallengeStatus {
  screenle: DayPlayStatus;
  indledle: DayPlayStatus;
  linkle: DayPlayStatus;
  profille: DayPlayStatus;
}

export const getChallengeStatusForDate = (dateStr: string): DateChallengeStatus => {
  const getStatus = (key: string): DayPlayStatus => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return 'unplayed';
      const saved = localStorage.getItem(key);
      if (!saved) return 'unplayed';
      const parsed = JSON.parse(saved);
      if (parsed.isWon) return 'won';
      if (parsed.isCompleted) return 'lost';
      return 'unplayed';
    } catch {
      return 'unplayed';
    }
  };

  return {
    screenle: getStatus(`screenle_state_${dateStr}`),
    indledle: getStatus(`indledle_state_${dateStr}`),
    linkle: getStatus(`linkle_state_${dateStr}`),
    profille: getStatus(`profille_state_${dateStr}`),
  };
};
