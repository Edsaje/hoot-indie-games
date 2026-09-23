import type { Game } from '../types/game';

export type GameMood = 'all' | 'cozy' | 'action' | 'cerebral' | 'dark' | 'narrative' | 'challenge';

export interface MoodDefinition {
  id: GameMood;
  label: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
}

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  {
    id: 'all',
    label: { fr: 'Toutes les Pépites', en: 'All Indie Gems' },
    description: {
      fr: 'Tirage au sort libre parmi les 161 chefs-d\'œuvre certifiés du sanctuaire.',
      en: 'Open draw across all 161 certified masterpieces in the sanctuary.',
    },
  },
  {
    id: 'cozy',
    label: { fr: 'Détente & Douceur', en: 'Cozy & Peaceful' },
    description: {
      fr: 'Jeux contemplatifs, simulation apaisante, farming et exploration sans pression.',
      en: 'Contemplative, relaxing farming, gentle simulation, and peaceful worlds.',
    },
  },
  {
    id: 'action',
    label: { fr: 'Action & Frénésie', en: 'Action & Frenzy' },
    description: {
      fr: 'Combats vifs, esquives au millimètre, bullet hell, roguelikes rythmés et boss épiques.',
      en: 'High-octane combat, razor-sharp dodges, bullet hell, and frantic roguelikes.',
    },
  },
  {
    id: 'cerebral',
    label: { fr: 'Cérébral & Énigmes', en: 'Brainy & Puzzles' },
    description: {
      fr: 'Énigmes stimulantes, deckbuilding ingénieux, déduction et mécaniques systémiques.',
      en: 'Clever puzzles, deep deckbuilding, sharp deduction, and systemic mysteries.',
    },
  },
  {
    id: 'dark',
    label: { fr: 'Sombre & Frisson', en: 'Dark & Atmospheric' },
    description: {
      fr: 'Horreur psychologique, mondes crépusculaires, survie oppressante et dark fantasy.',
      en: 'Psychological horror, twilight ruins, tense survival, and gothic dark fantasy.',
    },
  },
  {
    id: 'narrative',
    label: { fr: 'Récit & Émotion', en: 'Story & Emotion' },
    description: {
      fr: 'Épopées bouleversantes, dialogues ciselés, destins inoubliables et aventures poétiques.',
      en: 'Poignant narratives, brilliant dialogue, unforgettable fates, and poetic journeys.',
    },
  },
  {
    id: 'challenge',
    label: { fr: 'Défi & Dépassement', en: 'Hardcore Challenge' },
    description: {
      fr: 'Plateforme millimétrée, die & retry impitoyable, timing parfait et pure maîtrise.',
      en: 'Pixel-perfect platforming, unforgiving die-and-retry, and supreme mastery.',
    },
  },
];

/**
 * Associe un ensemble d'ambiances à un jeu donné.
 */
export function getGameMoods(game: Game): GameMood[] {
  const moods: GameMood[] = ['all'];
  const genresLower = game.genre.map((g) => g.toLowerCase());
  const idLower = game.id.toLowerCase();
  const textHints = (
    (game.hints?.tagline?.fr || '') +
    ' ' +
    (game.hints?.tagline?.en || '') +
    ' ' +
    game.title
  ).toLowerCase();

  // 1. Cozy
  const isCozyExplicit = [
    'stardew-valley', 'a-short-hike', 'dave-the-diver', 'celeste', 'tunic', 'sea-of-stars',
    'spiritfarer', 'gris', 'cocoon', 'jusant', 'dorfromantik', 'unpacking', 'lil-gator-game',
    'minami-lane', 'tiny-glade', 'chants-of-sennaar', 'untitled-goose-game', 'to-the-moon',
    'chicory-a-colorful-tale', 'albas-wildlife-adventure', 'slime-rancher', 'chadder'
  ].includes(idLower);

  const hasCozyGenre = genresLower.some((g) =>
    ['simulation', 'cozy', 'point & click', 'casual', 'gestion', 'puzzle reposant'].some((k) =>
      g.includes(k)
    )
  );

  if (isCozyExplicit || hasCozyGenre) {
    moods.push('cozy');
  }

  // 2. Action
  const isActionExplicit = [
    'hades', 'dead-cells', 'cuphead', 'blasphemous', 'hollow-knight', 'hotline-miami',
    'hotline-miami-2', 'ultrakill', 'katana-zero', 'enter-the-gungeon', 'megabonk',
    'risk-of-rain-2', 'vampire-survivors', 'brotato', 'furi', 'my-friend-pedro',
    'ghostrunner', 'neon-white', 'dusk', 'amid-evil', 'nine-sols'
  ].includes(idLower);

  const hasActionGenre = genresLower.some((g) =>
    ['action', 'bullet hell', 'hack', 'shooter', 'combat', 'roguelike', 'roguelite', 'beat'].some((k) =>
      g.includes(k)
    )
  );

  if (isActionExplicit || hasActionGenre) {
    moods.push('action');
  }

  // 3. Cerebral
  const isCerebralExplicit = [
    'outer-wilds', 'slay-the-spire', 'balatro', 'baba-is-you', 'animal-well', 'inscryption',
    'the-witness', 'return-of-the-obra-dinn', 'chants-of-sennaar', 'lorelei-and-the-laser-eyes',
    'case-of-the-golden-idol', 'void-stranger', 'into-the-breach', 'ftl-faster-than-light',
    'the-talos-principle', 'the-talos-principle-2', 'manifold-garden', 'fezpuzzle', 'fez'
  ].includes(idLower);

  const hasCerebralGenre = genresLower.some((g) =>
    ['puzzle', 'stratégie', 'strategy', 'deckbuilder', 'tactique', 'tactical', 'mystery', 'enquête', 'réflexion'].some((k) =>
      g.includes(k)
    )
  );

  if (isCerebralExplicit || hasCerebralGenre) {
    moods.push('cerebral');
  }

  // 4. Dark
  const isDarkExplicit = [
    'darkwood', 'signalis', 'soma', 'fear-and-hunger', 'blasphemous', 'blasphemous-2',
    'hollow-knight', 'inside', 'limbo', 'dredge', 'omori', 'little-nightmares',
    'little-nightmares-2', 'bramble-the-mountain-king', 'amnesia-the-dark-descent',
    'crow-country', 'slay-the-princess', 'buckshot-roulette', 'pacific-drive'
  ].includes(idLower);

  const hasDarkGenre = genresLower.some((g) =>
    ['horreur', 'horror', 'dark', 'souls-like', 'survie', 'survival', 'post-apocalyptique'].some((k) =>
      g.includes(k)
    )
  );

  if (isDarkExplicit || hasDarkGenre || textHints.includes('sombre') || textHints.includes('ruine')) {
    moods.push('dark');
  }

  // 5. Narrative
  const isNarrativeExplicit = [
    'disco-elysium', 'omori', 'to-the-moon', 'undertale', 'citizen-sleeper', 'sea-of-stars',
    'what-remains-of-edith-finch', 'road-96', 'norco', 'pentiment', 'kentucky-route-zero',
    'night-in-the-woods', 'oxenfree', 'in-stars-and-time', 'slay-the-princess', 'crosscode'
  ].includes(idLower);

  const hasNarrativeGenre = genresLower.some((g) =>
    ['narrat', 'aventure', 'adventure', 'rpg', 'visual novel', 'histoire'].some((k) =>
      g.includes(k)
    )
  );

  if (isNarrativeExplicit || hasNarrativeGenre) {
    moods.push('narrative');
  }

  // 6. Challenge
  const isChallengeExplicit = [
    'celeste', 'super-meat-boy', 'rain-world', 'noita', 'cuphead', 'hollow-knight',
    'furi', 'spelunky-2', 'neon-white', 'ghostrunner', 'ultrakill', 'nine-sols'
  ].includes(idLower);

  const hasChallengeGenre = genresLower.some((g) =>
    ['platformer', 'plateforme', 'souls-like', 'difficile', 'précision', 'die & retry'].some((k) =>
      g.includes(k)
    )
  );

  if (isChallengeExplicit || hasChallengeGenre) {
    moods.push('challenge');
  }

  return moods;
}

/**
 * Filtre les jeux correspondant à une ambiance précise.
 */
export function filterGamesByMood(games: Game[], mood: GameMood): Game[] {
  if (mood === 'all') return games;
  return games.filter((g) => getGameMoods(g).includes(mood));
}
