/**
 * streakManager.ts
 * Centralized utility for date management, streak calculation, and calendar restrictions
 * in Hoot Indie Games.
 */

const PARIS_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const getTodayDateString = (date = new Date()): string => {
  return PARIS_DATE_FORMATTER.format(date);
};

export const getYesterdayDateString = (referenceDateStr?: string): string => {
  const baseDateStr = referenceDateStr || getTodayDateString();
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const prevUtc = new Date(Date.UTC(y, m - 1, d - 1));
  const year = prevUtc.getUTCFullYear();
  const month = String(prevUtc.getUTCMonth() + 1).padStart(2, '0');
  const day = String(prevUtc.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayDifference = (dateStr1: string, dateStr2: string): number => {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

/**
 * Calcule la série active effective en tenant compte de l'écoulement des jours.
 * Une série est active si le dernier gain date d'aujourd'hui, d'hier,
 * ou d'avant-hier (fenêtre de rattrapage de la veille encore ouverte).
 * Si plus de 2 jours se sont écoulés sans victoire, la série est rompue (0).
 */
export function getEffectiveCurrentStreak(
  currentStreak: number,
  lastWonDate?: string,
  todayStr = getTodayDateString()
): number {
  if (!currentStreak || currentStreak <= 0 || !lastWonDate) return 0;
  if (lastWonDate === todayStr) return currentStreak;
  const yesterdayStr = getYesterdayDateString(todayStr);
  if (lastWonDate === yesterdayStr) return currentStreak;
  const dayBeforeYesterdayStr = getYesterdayDateString(yesterdayStr);
  if (lastWonDate === dayBeforeYesterdayStr) {
    // Si la veille n'a pas encore été perdue définitivement, la série est en sursis (sauvable)
    return currentStreak;
  }
  // Plus de 2 jours écoulés sans gain : la série est rompue
  return 0;
}

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
  chrono: DayPlayStatus;
  pixel: DayPlayStatus;
  review: DayPlayStatus;
  blindtest: DayPlayStatus;
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
    chrono: getStatus(`chrono_state_${dateStr}`),
    pixel: getStatus(`pixel_state_${dateStr}`),
    review: getStatus(`review_state_${dateStr}`),
    blindtest: getStatus(`blindtest_state_${dateStr}`),
  };
};
