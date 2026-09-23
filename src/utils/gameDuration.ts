import type { Game } from '../types/game';
import { getAppLanguage } from './localization';

/**
 * 🦉 Hoot Indie Games — Durées d'achèvement estimées (HowLongToBeat / Données vérifiées)
 * Heures moyennes pour l'histoire principale et une session typique.
 */
export const VERIFIED_GAME_DURATIONS: Record<string, number> = {
  // Pépites cultes majeures
  'hollow-knight': 32,
  'celeste': 9,
  'outer-wilds': 22,
  'hades': 35,
  'dead-cells': 25,
  'undertale': 7,
  'slay-the-spire': 45,
  'tunic': 14,
  'cuphead': 12,
  'disco-elysium': 30,
  'inscryption': 14,
  'stardew-valley': 60,
  'subnautica': 30,
  'balatro': 40,
  'animal-well': 11,
  'sea-of-stars': 28,
  'blasphemous': 16,
  'signalis': 10,
  'dave-the-diver': 25,
  'a-short-hike': 3,
  'untitled-goose-game': 4,
  'inside': 4,
  'limbo': 4,
  'gris': 4,
  'katana-zero': 6,
  'hotline-miami': 6,
  'hotline-miami-2': 9,
  'baba-is-you': 25,
  'return-of-the-obra-dinn': 10,
  'chants-of-sennaar': 10,
  'pizza-tower': 10,
  'dredge': 12,
  'cult-of-the-lamb': 18,
  'rain-world': 30,
  'omori': 28,
  'to-the-moon': 5,
  'what-remains-of-edith-finch': 3,
  'darkwood': 20,
  'the-witness': 25,
  'the-binding-of-isaac-rebirth': 50,
  'enter-the-gungeon': 35,
  'ftl-faster-than-light': 20,
  'into-the-breach': 15,
  'terraria': 70,
  'factorio': 80,
  'rimworld': 80,
  'vampire-survivors': 25,
  'risk-of-rain-2': 35,
  'rogue-legacy-2': 30,
  'shovel-knight-treasure-trove': 15,
  'shovel-knight': 12,
  'axiom-verge': 12,
  'ori-and-the-blind-forest': 10,
  'ori-and-the-will-of-the-wisps': 12,
  'spiritfarer': 30,
  'cocoon': 6,
  'jusant': 6,
  'brotato': 20,
  'buckshot-roulette': 3,
  'crow-country': 7,
  'pacific-drive': 25,
  'chadder': 8,
  'megabonk': 15,
  'planet-of-lana': 5,
  'slime-rancher': 16,
  'hyper-light-drifter': 8,
  'crypt-of-the-necrodancer': 25,
  'super-meat-boy': 12,
  'spelunky-2': 35,
  'noita': 35,
  'furi': 6,
  'dorfromantik': 20,
  'unpacking': 4,
  'lil-gator-game': 4,
  'minami-lane': 3,
  'tiny-glade': 10,
  'road-96': 8,
  'citizen-sleeper': 7,
  'norco': 6,
  'pentiment': 15,
  'oxenfree': 5,
  'kentucky-route-zero': 10,
  'night-in-the-woods': 9,
  'fezpuzzle': 10,
  'fez': 10,
  'braid': 6,
  'the-talos-principle': 20,
  'the-talos-principle-2': 25,
  'manifold-garden': 8,
  'superhot': 3,
  'ultrakill': 15,
  'dusk': 8,
  'amid-evil': 9,
  'slay-the-princess': 7,
  'in-stars-and-time': 18,
  'crosscode': 45,
  'eastward': 22,
  'chicory-a-colorful-tale': 12,
  'albas-wildlife-adventure': 4,
  'a-hat-in-time': 10,
  'neon-white': 12,
  'ghostrunner': 8,
  'outer-wilds-echoes-of-the-eye': 12,
  'blasphemous-2': 16,
  'ender-lilies': 18,
  'nine-sols': 22,
  'bo-path-of-the-teal-lotus': 12,
  'lorelei-and-the-laser-eyes': 18,
  'case-of-the-golden-idol': 8,
  'void-stranger': 25,
  'soma': 10,
  'little-nightmares': 4,
  'little-nightmares-2': 6,
  'bramble-the-mountain-king': 5,
  'amnesia-the-dark-descent': 8,
  'fear-and-hunger': 15,
};

/**
 * Calcule une durée réaliste en heures pour un jeu donné (HLTB direct ou heuristique selon genres).
 */
export function getGameDurationHours(game: Game): number {
  if (VERIFIED_GAME_DURATIONS[game.id]) {
    return VERIFIED_GAME_DURATIONS[game.id];
  }

  // Normalisation de l'id
  const normalizedId = game.id.toLowerCase().replace(/_/g, '-');
  if (VERIFIED_GAME_DURATIONS[normalizedId]) {
    return VERIFIED_GAME_DURATIONS[normalizedId];
  }

  const genreStr = game.genre.map((g) => g.toLowerCase()).join(' ');

  // Heuristique basée sur les genres
  if (genreStr.includes('simulation') || genreStr.includes('farming') || genreStr.includes('gestion')) {
    return 45;
  }
  if (genreStr.includes('rpg') || genreStr.includes('jrpg')) {
    return 30;
  }
  if (genreStr.includes('deckbuilder') || genreStr.includes('auto-battler') || genreStr.includes('roguelike') || genreStr.includes('roguelite')) {
    return 35;
  }
  if (genreStr.includes('metroidvania') || genreStr.includes('souls-like')) {
    return 20;
  }
  if (genreStr.includes('action') || genreStr.includes('platformer') || genreStr.includes('combat')) {
    return 12;
  }
  if (genreStr.includes('puzzle') || genreStr.includes('réflexion') || genreStr.includes('point & click')) {
    return 9;
  }
  if (genreStr.includes('narratif') || genreStr.includes('aventure') || genreStr.includes('visual novel')) {
    return 8;
  }
  if (genreStr.includes('horreur')) {
    return 7;
  }

  return 12;
}

export type DurationCategory = 'short' | 'medium' | 'long' | 'infinite';

export function getDurationCategory(hours: number): DurationCategory {
  if (hours < 10) return 'short';
  if (hours <= 25) return 'medium';
  if (hours <= 50) return 'long';
  return 'infinite';
}

const DURATION_LABELS: Record<DurationCategory, Record<string, string>> = {
  short: {
    fr: 'Court (< 10h)',
    en: 'Short (< 10h)',
    es: 'Corto (< 10h)',
    de: 'Kurz (< 10 Std.)',
    ja: '短編（10時間未満）',
    'pt-BR': 'Curto (< 10h)',
  },
  medium: {
    fr: 'Équilibré (10-25h)',
    en: 'Balanced (10-25h)',
    es: 'Equilibrado (10-25h)',
    de: 'Ausgewogen (10-25 Std.)',
    ja: '中編（10〜25時間）',
    'pt-BR': 'Equilibrado (10-25h)',
  },
  long: {
    fr: 'Longue épopée (25-50h)',
    en: 'Long Epic (25-50h)',
    es: 'Larga epopeya (25-50h)',
    de: 'Langes Epos (25-50 Std.)',
    ja: '大作（25〜50時間）',
    'pt-BR': 'Longa epopeia (25-50h)',
  },
  infinite: {
    fr: 'Rejouabilité infinie (50h+)',
    en: 'Endless / Replayable (50h+)',
    es: 'Rejugabilidad infinita (50h+)',
    de: 'Endlose Wiederspielbarkeit (50+ Std.)',
    ja: '無限のやり込み（50時間以上）',
    'pt-BR': 'Rejogabilidade infinita (50h+)',
  },
};

export function getDurationCategoryLabel(category: DurationCategory, lang: string = 'fr'): string {
  const target = getAppLanguage(lang);
  return DURATION_LABELS[category]?.[target] || DURATION_LABELS[category]?.en || '';
}
