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
    name: 'Snake',
    icon: '🐍',
    instructions: 'Flèches directionnelles (ou ZQSD). Mange les pastilles sans heurter les murs ni ta queue !',
  },
  {
    id: 'pong',
    name: 'Pong',
    icon: '🏓',
    instructions: 'Flèches HAUT / BAS pour bouger la raquette. ESPACE pour engager la balle.',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    icon: '🧱',
    instructions: 'Flèches GAUCHE / DROITE pour déplacer la raquette. ESPACE pour lancer la bille.',
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
    name: 'Tetris',
    icon: '🧩',
    instructions: 'GAUCHE/DROITE pour glisser, HAUT pour tourner le tétramino, BAS pour accélérer la chute.',
  },
  {
    id: 'vectrex',
    name: 'Mine Storm',
    icon: '⚡',
    instructions: 'GAUCHE/DROITE pour pivoter, HAUT pour propulser l\'aéronef, ESPACE pour tirer, TOUCHE E pour fuir en Hyperdrive.',
  },
];
