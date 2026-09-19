export type TimeAttackMode = 'screenle' | 'indledle' | 'linkle' | 'profille';

export interface TimeAttackModeStats {
  highScore: number;
  bestCombo: number;
  gamesPlayed: number;
  totalAnswered: number;
  lastPlayed?: string;
}

export interface TimeAttackGlobalStats {
  screenle: TimeAttackModeStats;
  indledle: TimeAttackModeStats;
  linkle: TimeAttackModeStats;
  profille: TimeAttackModeStats;
}

export interface TimeAttackRoundResult {
  mode: TimeAttackMode;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  maxCombo: number;
  isNewHighScore: boolean;
  previousHighScore: number;
}
