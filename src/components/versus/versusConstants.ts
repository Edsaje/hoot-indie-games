import {
  Camera,
  Sliders,
  MessageSquareQuote,
  Music,
  Calendar,
  FileSearch,
  Target,
  Sparkles,
  Dices,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import { INDIE_AVATARS } from '../../data/avatars';
import type { Game } from '../../types/game';
import type { VersusDiscipline } from '../../types/versus';

export type VersusPhase =
  | 'lobby'
  | 'waiting_friend'
  | 'queueing'
  | 'countdown'
  | 'playing'
  | 'round_end'
  | 'match_end';

export interface OpponentData {
  id: string;
  name: string;
  avatarId: string;
  elo: number;
  score: number;
  isBot?: boolean;
}

export interface PeerMessage {
  type:
    | 'handshake'
    | 'handshake_ack'
    | 'start_countdown'
    | 'round_start'
    | 'guess_wrong'
    | 'round_won'
    | 'round_timeout'
    | 'rematch_ready'
    | 'player_left'
    | 'duel_chat';
  profile?: {
    name: string;
    avatarId: string;
    elo: number;
  };
  gameId?: string;
  secretToken?: string;
  roundNum?: number;
  guessTitle?: string;
  gameTitle?: string;
  score?: number;
  discipline?: VersusDiscipline;
  choiceIds?: string[];
  puzzleSeed?: string;
  chatText?: string;
  chatEmote?: string;
  senderName?: string;
}

export function generateRoomCode(): string {
  return `HOOT-${Math.floor(100 + Math.random() * 900)}`;
}

export function generatePeerId(): string {
  return `peer_${Math.random().toString(36).substring(2, 7)}`;
}

export const BOT_NAMES = [
  'Grand-Duc de la Canopée',
  'Chouette Harfang',
  'Effraie des Ombres',
  'SilksongBeliever',
  'KnightOfHallownest',
  'CelesteSpeedrunner',
  'BalatroAddict',
];

export function getRandomBot(playerElo: number): OpponentData {
  const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  const avatar = INDIE_AVATARS[Math.floor(Math.random() * INDIE_AVATARS.length)];
  const elo = Math.max(800, playerElo + Math.floor((Math.random() - 0.5) * 80));
  return {
    id: generatePeerId(),
    name,
    avatarId: avatar.id,
    elo,
    score: 0,
    isBot: true,
  };
}

export function pickRandomGame(pool: Game[]): Game {
  if (!pool || pool.length === 0) return INDIE_GAMES[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getBotDecision(): { willGuess: boolean; delayMs: number } {
  return {
    willGuess: Math.random() < 0.72,
    delayMs: (8 + Math.random() * 8) * 1000,
  };
}

export interface VersusDisciplineConfig {
  id: VersusDiscipline;
  label: string;
  icon: any;
  color: string;
  desc: string;
}

export const VERSUS_DISCIPLINES: VersusDisciplineConfig[] = [
  {
    id: 'all',
    label: 'Décathlon Indé (Mixte)',
    icon: Dices,
    color: 'from-amber-500 to-orange-600',
    desc: 'Alterne les épreuves : Capture, Pixel, Critique Steam, Blind Test, Chronologie...',
  },
  {
    id: 'screenle',
    label: 'Capture d\'écran',
    icon: Camera,
    color: 'from-amber-500 to-amber-600',
    desc: 'Dé-zoom & dé-floutage progressif d\'une capture',
  },
  {
    id: 'pixel',
    label: 'Pixel & Silhouette',
    icon: Sliders,
    color: 'from-rose-500 to-pink-600',
    desc: 'Mosaïque pixellisée qui s\'affine seconde par seconde',
  },
  {
    id: 'review',
    label: 'Critique Steam',
    icon: MessageSquareQuote,
    color: 'from-cyan-500 to-blue-600',
    desc: 'Avis Steam de joueurs authentiques caviardés (████)',
  },
  {
    id: 'blindtest',
    label: 'Blind Test OST',
    icon: Music,
    color: 'from-fuchsia-500 to-pink-600',
    desc: 'Extrait sonore synthétisé en direct et visualiseur',
  },
  {
    id: 'chrono',
    label: 'Chronologie',
    icon: Calendar,
    color: 'from-orange-500 to-amber-600',
    desc: 'Défis temporels : avant, après et millésimes cultes',
  },
  {
    id: 'profille',
    label: 'Profil Identité',
    icon: FileSearch,
    color: 'from-purple-500 to-indigo-600',
    desc: 'Déduction par studio de dev, année et genre',
  },
  {
    id: 'indledle',
    label: 'Classic Indle',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    desc: 'Déduction progressive par attributs et moteur',
  },
  {
    id: 'linkle',
    label: 'Connexions',
    icon: Sparkles,
    color: 'from-sky-500 to-indigo-500',
    desc: 'Repérez le lien commun ou complétez le groupe',
  },
];

export function getDisciplineMeta(disc: VersusDiscipline): VersusDisciplineConfig {
  return VERSUS_DISCIPLINES.find((d) => d.id === disc) || VERSUS_DISCIPLINES[0];
}
