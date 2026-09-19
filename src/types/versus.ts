import type { IndieAvatarId } from './user';
import type { Game } from './game';

export type VersusDiscipline =
  | 'all'
  | 'screenle'
  | 'indledle'
  | 'linkle'
  | 'profille'
  | 'chrono'
  | 'pixel'
  | 'review'
  | 'blindtest';

export interface VersusPlayer {
  id: string;
  username: string;
  avatarId: IndieAvatarId;
  elo: number;
  score: number;
  isReady: boolean;
  hasGuessedCorrectly?: boolean;
  lastGuess?: string;
  isLockedOut?: boolean;
}

export interface VersusRound {
  roundNumber: number;
  discipline: VersusDiscipline;
  game: Game;
  zoomLevel: number;
  timerSeconds: number;
  winnerId?: string;
  choices?: Game[];
}

export type VersusMatchStatus =
  | 'idle'
  | 'queueing'
  | 'lobby'
  | 'countdown'
  | 'in_round'
  | 'round_over'
  | 'match_over';

export interface VersusMessage {
  type: 'join' | 'ready' | 'guess' | 'score' | 'rematch';
  senderId: string;
  payload: any;
}
