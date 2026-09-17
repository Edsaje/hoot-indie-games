import type { IndieAvatarId } from './user';
import type { Game } from './game';

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
  game: Game;
  zoomLevel: number;
  timerSeconds: number;
  winnerId?: string;
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
