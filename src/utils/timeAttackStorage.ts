import type { TimeAttackGlobalStats, TimeAttackMode, TimeAttackRoundResult } from '../types/timeAttack';

const TIME_ATTACK_STORAGE_KEY = 'hoot_time_attack_stats_v1';

const defaultStats: TimeAttackGlobalStats = {
  screenle: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  indledle: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  linkle: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  profille: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  chrono: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  pixel: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  review: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
  blindtest: { highScore: 0, bestCombo: 0, gamesPlayed: 0, totalAnswered: 0 },
};

export function getTimeAttackStats(): TimeAttackGlobalStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(TIME_ATTACK_STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      screenle: { ...defaultStats.screenle, ...parsed.screenle },
      indledle: { ...defaultStats.indledle, ...parsed.indledle },
      linkle: { ...defaultStats.linkle, ...parsed.linkle },
      profille: { ...defaultStats.profille, ...parsed.profille },
      chrono: { ...defaultStats.chrono, ...parsed.chrono },
      pixel: { ...defaultStats.pixel, ...parsed.pixel },
      review: { ...defaultStats.review, ...parsed.review },
      blindtest: { ...defaultStats.blindtest, ...parsed.blindtest },
    };
  } catch {
    return defaultStats;
  }
}

export function recordTimeAttackResult(
  mode: TimeAttackMode,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  maxCombo: number
): TimeAttackRoundResult {
  const current = getTimeAttackStats();
  const modeStats = current[mode];
  const previousHighScore = modeStats.highScore;
  const isNewHighScore = score > previousHighScore;

  const updatedStats: TimeAttackGlobalStats = {
    ...current,
    [mode]: {
      highScore: Math.max(previousHighScore, score),
      bestCombo: Math.max(modeStats.bestCombo, maxCombo),
      gamesPlayed: modeStats.gamesPlayed + 1,
      totalAnswered: modeStats.totalAnswered + correctAnswers,
      lastPlayed: new Date().toISOString(),
    },
  };

  try {
    localStorage.setItem(TIME_ATTACK_STORAGE_KEY, JSON.stringify(updatedStats));
  } catch {
    // Ignore storage full
  }

  return {
    mode,
    score,
    correctAnswers,
    totalQuestions,
    maxCombo,
    isNewHighScore,
    previousHighScore,
  };
}
