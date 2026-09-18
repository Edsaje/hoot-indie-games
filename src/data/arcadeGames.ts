export type ArcadeGameId =
  | 'snake'
  | 'pong'
  | 'breakout'
  | 'flappy'
  | 'invaders'
  | 'run'
  | 'tetris'
  | 'vectrex';

export interface ArcadeGameMeta {
  id: ArcadeGameId;
  name: string;
  icon: string;
  instructions: string;
}

export const ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: 'snake',
    name: 'Snake Doré',
    icon: '🐍',
    instructions: 'Flèches directionnelles (ou ZQSD). Mange les lucioles sans heurter les murs ni ta queue !',
  },
  {
    id: 'pong',
    name: 'Pong Magique',
    icon: '🏓',
    instructions: 'Flèches HAUT / BAS pour bouger. ESPACE pour lancer la balle magique.',
  },
  {
    id: 'breakout',
    name: 'Casse-Briques',
    icon: '🧱',
    instructions: 'Flèches GAUCHE / DROITE pour déplacer la barre. ESPACE pour lancer la bille.',
  },
  {
    id: 'flappy',
    name: 'Flappy Hibou',
    icon: '🦉',
    instructions: 'ESPACE, HAUT ou Clic pour faire battre les ailes du hibou et franchir les colonnes.',
  },
  {
    id: 'invaders',
    name: 'Space Invaders',
    icon: '👾',
    instructions: 'Flèches GAUCHE / DROITE pour piloter. ESPACE ou Clic pour désintégrer les vagues extraterrestres.',
  },
  {
    id: 'run',
    name: 'Course Sylvestre',
    icon: '🏃',
    instructions: 'ESPACE ou HAUT pour sauter par-dessus les ronces, rochers et gouffres de la forêt.',
  },
  {
    id: 'tetris',
    name: 'Tétris Sylvestre',
    icon: '🧩',
    instructions: 'GAUCHE/DROITE pour glisser, HAUT pour tourner le tétramino, BAS pour accélérer la chute.',
  },
  {
    id: 'vectrex',
    name: 'Mine Storm 1982',
    icon: '⚡',
    instructions: 'GAUCHE/DROITE pour pivoter, HAUT pour propulser l\'aéronef, ESPACE pour atomiser les mines.',
  },
];
