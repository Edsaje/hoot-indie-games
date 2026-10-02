import type { Game } from '../types/game';
import { INDIE_GAMES } from './games';
import routeMappingData from './odysseyRouteMapping.json';

export type RouteGameRarity = 'common' | 'uncommon' | 'rare';

export interface RouteGameEntry {
  game: Game;
  rarity: RouteGameRarity;
  dropChancePercent: number;
  isCaptured: boolean;
  captureCount: number;
  isHolo: boolean;
  level: number;
}

export interface RouteMasteryInfo {
  routeId: string;
  capturedCount: number;
  totalCount: number;
  isMastered: boolean;
  hasAllHolos: boolean;
  percentage: number;
  sapMultiplierBonus: number; // 1.15 si maîtrisé (+15%), 1.0 sinon
}

// Indexation rapide des pépites par identifiant
const GAMES_BY_ID = new Map<string, Game>(INDIE_GAMES.map((g) => [g.id, g]));

// Table de correspondance Route -> Liste ordonnée d'AppIDs
export const ROUTE_GAMES_MAPPING: Record<string, string[]> = routeMappingData;

/**
 * Récupère l'URL d'illustration officielle de la capsule Steam (ou premier screenshot en secours)
 */
export function getGameArtwork(game: Game): string {
  if (game.steamUrl) {
    const match = game.steamUrl.match(/\/app\/(\d+)/);
    if (match) {
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${match[1]}/header.jpg`;
    }
  }
  return (
    game.screenshots?.[0] ||
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg'
  );
}

/**
 * Retourne le poids de spawn de base en fonction de la position du jeu dans la liste de la route
 */
function getBaseRarityAndWeight(index: number): { rarity: RouteGameRarity; weight: number } {
  if (index < 4) {
    return { rarity: 'common', weight: 40 };
  } else if (index < 7) {
    return { rarity: 'uncommon', weight: 24 };
  } else {
    return { rarity: 'rare', weight: 12 };
  }
}

/**
 * Récupère l'inventaire complet des pépites assignées à une route spécifique
 * avec leur statut de capture, leur rareté et leur probabilité d'apparition.
 */
export function getRouteDexEntries(
  routeId: string,
  capturedGames: Record<string, { count: number; isHolo: boolean; level: number }> = {}
): RouteGameEntry[] {
  const gameIds = ROUTE_GAMES_MAPPING[routeId] || [];
  const games: { game: Game; rarity: RouteGameRarity; weight: number }[] = [];

  for (let i = 0; i < gameIds.length; i++) {
    const g = GAMES_BY_ID.get(gameIds[i]);
    if (g) {
      const { rarity, weight } = getBaseRarityAndWeight(i);
      games.push({ game: g, rarity, weight });
    }
  }

  const totalWeight = games.reduce((sum, item) => sum + item.weight, 0) || 1;

  return games.map(({ game, rarity, weight }) => {
    const userEntry = capturedGames[game.id];
    const isCaptured = Boolean(userEntry && userEntry.count > 0);
    const captureCount = userEntry?.count || 0;
    const isHolo = Boolean(userEntry?.isHolo);
    const level = userEntry?.level || 1;
    const dropChancePercent = Math.max(1, Math.round((weight / totalWeight) * 100));

    return {
      game,
      rarity,
      dropChancePercent,
      isCaptured,
      captureCount,
      isHolo,
      level,
    };
  });
}

/**
 * Calcule la complétion de la route (Route Mastery)
 * Débloque l'Étoile de Maîtrise (+15% Sève) si 100% des pépites sont capturées.
 */
export function getRouteMastery(
  routeId: string,
  capturedGames: Record<string, { count: number; isHolo: boolean }> = {}
): RouteMasteryInfo {
  const gameIds = ROUTE_GAMES_MAPPING[routeId] || [];
  const totalCount = gameIds.length;
  if (totalCount === 0) {
    return {
      routeId,
      capturedCount: 0,
      totalCount: 0,
      isMastered: false,
      hasAllHolos: false,
      percentage: 0,
      sapMultiplierBonus: 1.0,
    };
  }

  let capturedCount = 0;
  let holoCount = 0;

  for (const id of gameIds) {
    const entry = capturedGames[id];
    if (entry && entry.count > 0) {
      capturedCount++;
      if (entry.isHolo) holoCount++;
    }
  }

  const isMastered = capturedCount === totalCount;
  const hasAllHolos = isMastered && holoCount === totalCount;
  const percentage = Math.round((capturedCount / totalCount) * 100);
  const sapMultiplierBonus = isMastered ? 1.15 : 1.0;

  return {
    routeId,
    capturedCount,
    totalCount,
    isMastered,
    hasAllHolos,
    percentage,
    sapMultiplierBonus,
  };
}

/**
 * Sélectionne la pépite qui apparaîtra comme Écho Sauvage sur la route selon ses probabilités naturelles.
 */
export function pickWildEchoForRoute(routeId: string): Game | null {
  const gameIds = ROUTE_GAMES_MAPPING[routeId] || [];
  if (gameIds.length === 0) return null;

  const weightedCandidates: { game: Game; weight: number }[] = [];

  for (let i = 0; i < gameIds.length; i++) {
    const g = GAMES_BY_ID.get(gameIds[i]);
    if (!g) continue;

    const { weight } = getBaseRarityAndWeight(i);
    weightedCandidates.push({ game: g, weight });
  }

  const totalWeight = weightedCandidates.reduce((s, c) => s + c.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const candidate of weightedCandidates) {
    if (roll < candidate.weight) {
      return candidate.game;
    }
    roll -= candidate.weight;
  }

  return weightedCandidates[weightedCandidates.length - 1]?.game || null;
}
