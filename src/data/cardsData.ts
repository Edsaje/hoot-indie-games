/**
 * cardsData.ts
 * Catalogue des 185 Cartes à Collectionner du Sanctuaire et algorithme d'ouverture de booster.
 */

import { INDIE_GAMES } from './games';
import type { CardItem, CardRarity, BoosterCardResult } from '../types/cards';
import { CARDS_PER_BOOSTER, HOLO_PROBABILITY } from '../types/cards';

// Pépites sacrées du panthéon indé (Légendaires)
const LEGENDARY_GAME_IDS = new Set([
  'hollow-knight',
  'hollow-knight-silksong',
  'celeste',
  'hades',
  'hades-ii',
  'outer-wilds',
  'balatro',
  'undertale',
  'dead-cells',
  'the-binding-of-isaac',
  'the-binding-of-isaac-rebirth',
  'slay-the-spire',
  'slay-the-spire-2',
  'disco-elysium',
  'stardew-valley',
  'subnautica',
  'terraria',
  'factorio',
]);

// Chefs-d'œuvre majeurs acclamés (Épiques)
const EPIC_GAME_IDS = new Set([
  'sea-of-stars',
  'tunic',
  'chants-of-sennaar',
  'cult-of-the-lamb',
  'inscryption',
  'cuphead',
  'shovel-knight',
  'return-of-the-obra-dinn',
  'into-the-breach',
  'hotline-miami',
  'blasphemous',
  'risk-of-rain-2',
  'animal-well',
  'dave-the-diver',
  'cocoon',
  'gris',
  'super-meat-boy',
  'braid',
  'fez',
  'katana-zero',
  'darkest-dungeon',
  'enter-the-gungeon',
  'baba-is-you',
  'omori',
  'signalis',
  'a-short-hike',
  'hyper-light-drifter',
  'rain-world',
  'dredge',
  'pacific-drive',
  'inside',
  'limbo',
  'papers-please',
  'bastion',
  'transistor',
  'crow-country',
  'lorelei-and-the-laser-eyes',
  'pizza-tower',
  'nine-sols',
  'ufo-50',
  'lethal-company',
  'palworld',
  'manor-lords',
  'neva',
  'slay-the-princess',
  'buckshot-roulette',
  'ultrakill',
  'ftl-faster-than-light',
  'ori-and-the-blind-forest',
  'ori-and-the-will-of-the-wisps',
  'stray',
  'vampire-survivors',
  'the-stanley-parable-ultra-deluxe',
  'doki-doki-literature-club',
  'spiritfarer',
  'rimworld',
  'frostpunk',
  'beat-saber',
]);

// Pépites primées et reconnues (Rares)
const RARE_GAME_IDS = new Set([
  'neon-white',
  'chained-echoes',
  'traversee',
  'jusant',
  'sanabi',
  'rogue-legacy-2',
  'unturned',
  'moonlighter',
  'spelunky-2',
  'blasphemous-2',
  'curse-of-the-dead-gods',
  'skul-the-hero-slayer',
  'dead-cells-return-to-castlevania',
  'have-a-nice-death',
  'warm-snow',
  'astlibra-revision',
  'crosscode',
  'eastward',
  'oxenfree',
  'kentucky-route-zero',
  'what-remains-of-edith-finch',
  'firewatch',
  'norco',
  'citizen-sleeper',
  'pentiment',
  'the-case-of-the-golden-idol',
  'viewfinder',
  'the-talos-principle',
  'the-talos-principle-2',
  'the-witness',
  'supraland',
  'the-messenger',
  'haiku-the-robot',
  'ender-lilies',
  'ghost-song',
  'minishoot-adventures',
  'afterimage',
  'grime',
  'islets',
  'crypt-of-the-necrodancer',
  'loop-hero',
  'cultist-simulator',
  'card-shark',
  'wildfrost',
  'backpack-hero',
  'peglin',
  'stacklands',
  'brotato',
  'halls-of-torment',
  'death-must-die',
  '20-minutes-till-dawn',
  'valheim',
  'raft',
  'project-zomboid',
  'the-forest',
  'sons-of-the-forest',
  'dont-starve',
  'shadows-of-doubt',
  'mouthwashing',
  'tactical-breach-wizards',
  '1000xresist',
  'fields-of-mistria',
  'core-keeper',
  'no-rest-for-the-wicked',
  'darkest-dungeon-2',
  'cassette-beasts',
  'bramble',
  'planet-of-lana',
  'cryptmaster',
  'sifu',
  'mullet-madjack',
  'thank-goodness-youre-here',
  'rusty-s-retirement',
  'arco',
  'antonblast',
  'emberward',
  'subnautica-below-zero',
  'tinykin',
  'unpacking',
  'dorfromantik',
  'a-little-to-the-left',
  'night-in-the-woods',
  'teardown',
  'cookie-clicker',
  'townscaper',
  'deaths-door',
  'slime-rancher',
  'oxygen-not-included',
  'chicory-a-colorful-tale',
  'to-the-moon',
  'gorogoa',
  'dusk',
  'superhot',
  'kingdom-two-crowns',
  'ghostrunner',
  'furi',
  'haven',
  'wartales',
  'northgard',
  'broforce',
  'rhythm-doctor',
  'iron-lung',
  'far-lone-sails',
  'soma',
  'owlboy',
  'graveyard-keeper',
  'starbound',
]);

/**
 * Détermine la rareté d'une carte d'après l'aura du jeu
 */
function getGameRarity(gameId: string): CardRarity {
  if (LEGENDARY_GAME_IDS.has(gameId)) return 'legendary';
  if (EPIC_GAME_IDS.has(gameId)) return 'epic';
  if (RARE_GAME_IDS.has(gameId)) return 'rare';
  return 'common';
}

/**
 * Liste complète et ordonnée des 185 Cartes de Pépites
 */
export const ALL_CARDS: CardItem[] = INDIE_GAMES.map((game, index) => {
  const rarity = getGameRarity(game.id);
  const imageUrl =
    game.headerImage ||
    game.screenshots[0] ||
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg';

  return {
    id: game.id,
    gameId: game.id,
    title: game.title,
    cardNumber: index + 1,
    rarity,
    releaseYear: game.releaseYear,
    developer: game.developer,
    genres: game.genre || [],
    imageUrl,
    tagline: {
      fr: game.hints.tagline.fr || game.title,
      en: game.hints.tagline.en || game.title,
      es: game.hints.tagline.es,
      de: game.hints.tagline.de,
      ja: game.hints.tagline.ja,
      'pt-BR': game.hints.tagline['pt-BR'],
    },
  };
});

export const CARDS_BY_ID = new Map<string, CardItem>(ALL_CARDS.map((c) => [c.id, c]));

export const CARDS_BY_RARITY: Record<CardRarity, CardItem[]> = {
  legendary: ALL_CARDS.filter((c) => c.rarity === 'legendary'),
  epic: ALL_CARDS.filter((c) => c.rarity === 'epic'),
  rare: ALL_CARDS.filter((c) => c.rarity === 'rare'),
  common: ALL_CARDS.filter((c) => c.rarity === 'common'),
};

/**
 * Tire une rareté selon les probabilités officielles :
 * - Commune : ~65%
 * - Rare : ~24%
 * - Épique : ~9%
 * - Légendaire : ~2%
 */
export function rollRarity(guaranteeRareOrHigher = false): CardRarity {
  const roll = Math.random();

  if (guaranteeRareOrHigher) {
    // Drop garanti Rare+ pour au moins une carte du booster
    if (roll < 0.08) return 'legendary'; // ~8% de chance que la carte garantie soit légendaire
    if (roll < 0.32) return 'epic'; // ~24% qu'elle soit épique
    return 'rare'; // ~68% qu'elle soit rare
  }

  if (roll < 0.02) return 'legendary';
  if (roll < 0.11) return 'epic';
  if (roll < 0.35) return 'rare';
  return 'common';
}

/**
 * Pioche une carte aléatoire d'une rareté donnée, en évitant les doublons dans le même booster
 */
function pickCardOfRarity(rarity: CardRarity, excludeIds: Set<string>): CardItem {
  const targetPool = CARDS_BY_RARITY[rarity] || [];
  const pool = targetPool.filter((c) => c && !excludeIds.has(c.id));
  if (pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }
  // Fallback sur tout le pool de rareté si épuisé
  if (targetPool.length > 0) {
    const idx = Math.floor(Math.random() * targetPool.length);
    return targetPool[idx];
  }
  // Fallback ultime sur toutes les cartes valides
  const allValid = ALL_CARDS.filter(Boolean);
  const idx = Math.floor(Math.random() * allValid.length);
  return allValid[idx];
}

/**
 * Génère un tirage complet d'un booster de 5 cartes :
 * - Au moins 1 carte Rare ou supérieure garantie
 * - 5% de chance de variante Holographique par carte
 * - Aucune carte identique dans le même paquet de 5
 */
export function generateBoosterCards(alreadyOwnedIds: Set<string>): BoosterCardResult[] {
  const pickedIds = new Set<string>();
  const results: BoosterCardResult[] = [];

  for (let i = 0; i < CARDS_PER_BOOSTER; i++) {
    // La 5e carte (dernière) garantit une rareté Rare ou supérieure
    const isGuaranteedSlot = i === CARDS_PER_BOOSTER - 1;
    const rarity = rollRarity(isGuaranteedSlot);
    const card = pickCardOfRarity(rarity, pickedIds);
    if (card && card.id) {
      pickedIds.add(card.id);
    }

    // Tirage variante holographique (5% de chance)
    const isHolo = Math.random() < HOLO_PROBABILITY;
    const isNew = card && card.id ? !alreadyOwnedIds.has(card.id) : true;

    results.push({
      card,
      isHolo,
      isNew,
    });
  }

  // Trier pour le suspense : la plus rare à la fin !
  const rarityWeight: Record<CardRarity, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
  };
  results.sort((a, b) => {
    const rA = a?.card?.rarity || 'common';
    const rB = b?.card?.rarity || 'common';
    const wA = (rarityWeight[rA] || 1) + (a.isHolo ? 0.5 : 0);
    const wB = (rarityWeight[rB] || 1) + (b.isHolo ? 0.5 : 0);
    return wA - wB;
  });

  return results;
}
