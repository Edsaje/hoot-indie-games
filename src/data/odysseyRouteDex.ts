import type React from 'react';
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

// Ensemble des IDs de jeux actuellement implémentés sur les routes de l'Odyssée
export const IMPLEMENTED_GAME_IDS: Set<string> = new Set(
  Object.values(ROUTE_GAMES_MAPPING).flat()
);

// Liste ordonnée de tous les jeux effectivement implémentés dans l'Odyssée
export const IMPLEMENTED_ODYSSEY_GAMES: Game[] = INDIE_GAMES.filter((g) =>
  IMPLEMENTED_GAME_IDS.has(g.id)
);

/**
 * Vérifie si une pépite est actuellement intégrée et disponible sur une route de l'Odyssée
 */
export function isGameImplementedInOdyssey(gameId: string): boolean {
  return IMPLEMENTED_GAME_IDS.has(gameId);
}

export const DEFAULT_ODYSSEY_FALLBACK_ARTWORK =
  'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg';

export const ODYSSEY_STANDALONE_FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="460" height="215" viewBox="0 0 460 215"><rect width="100%" height="100%" fill="%230f172a"/><path d="M230 65 L265 125 L195 125 Z" fill="%2310b981" opacity="0.7"/><circle cx="230" cy="90" r="8" fill="%23fbbf24"/><text x="50%" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="%2394a3b8" text-anchor="middle">HOOT SANCTUARY</text></svg>';

/**
 * Récupère la liste hiérarchisée des URLs d'illustration possibles pour un jeu
 */
export function getGameArtworkCandidates(game: Game): string[] {
  const candidates: string[] = [];

  // 1. Image d'en-tête explicite (si renseignée, contient les hash d'assets Steam récents ou CDN itch)
  if (game.headerImage && game.headerImage.trim()) {
    candidates.push(game.headerImage.trim());
  }

  // 2. Premier screenshot haute résolution
  if (Array.isArray(game.screenshots) && game.screenshots.length > 0) {
    for (const ss of game.screenshots.slice(0, 3)) {
      if (ss && ss.trim() && !candidates.includes(ss.trim())) {
        candidates.push(ss.trim());
      }
    }
  }

  // 3. Header CDN Steam direct via AppID ou regex Steam URL
  let appId = game.steamAppId ? String(game.steamAppId) : null;
  if (!appId && game.steamUrl) {
    const match = game.steamUrl.match(/\/app\/(\d+)/);
    if (match) appId = match[1];
  }

  if (appId) {
    const cfUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
    const akamaiUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
    if (!candidates.includes(cfUrl)) candidates.push(cfUrl);
    if (!candidates.includes(akamaiUrl)) candidates.push(akamaiUrl);
  }

  // 4. Fallbacks ultimes
  if (!candidates.includes(DEFAULT_ODYSSEY_FALLBACK_ARTWORK)) {
    candidates.push(DEFAULT_ODYSSEY_FALLBACK_ARTWORK);
  }
  candidates.push(ODYSSEY_STANDALONE_FALLBACK_SVG);

  return candidates;
}

/**
 * Récupère l'URL d'illustration officielle de la capsule Steam (ou premier screenshot en secours)
 */
export function getGameArtwork(game: Game): string {
  const candidates = getGameArtworkCandidates(game);
  return candidates[0] || DEFAULT_ODYSSEY_FALLBACK_ARTWORK;
}

/**
 * Gestionnaire d'erreur robuste pour les balises <img> de l'Odyssée.
 * En cas d'erreur de chargement (404, CORS, réseau), passe au candidat suivant ou au fallback SVG.
 */
export function handleOdysseyImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  game?: Game
): void {
  const img = event.currentTarget;
  if (!img) return;

  const currentStep = parseInt(img.dataset.odysseyFallbackStep || '0', 10);
  img.dataset.odysseyFallbackStep = String(currentStep + 1);

  if (game) {
    const candidates = getGameArtworkCandidates(game);
    for (let i = currentStep + 1; i < candidates.length; i++) {
      const nextCandidate = candidates[i];
      if (nextCandidate && nextCandidate !== img.src) {
        img.src = nextCandidate;
        return;
      }
    }
  }

  // Si aucun candidat de jeu n'a fonctionné ou si game non fourni
  if (img.src !== DEFAULT_ODYSSEY_FALLBACK_ARTWORK && !img.src.startsWith('data:image/svg+xml')) {
    img.src = DEFAULT_ODYSSEY_FALLBACK_ARTWORK;
    return;
  }

  // Fallback SVG autonome sans requête réseau
  if (!img.src.startsWith('data:image/svg+xml')) {
    img.src = ODYSSEY_STANDALONE_FALLBACK_SVG;
  }
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

// Indexation rapide des pépites par numéro de Biome (1 à 6)
const GAME_BIOME_INDEX_MAP = new Map<string, number>();
for (const [routeId, gameIds] of Object.entries(ROUTE_GAMES_MAPPING)) {
  const match = routeId.match(/^b(\d+)_/);
  const biomeIdx = match ? parseInt(match[1], 10) : 1;
  for (const gid of gameIds) {
    if (!GAME_BIOME_INDEX_MAP.has(gid)) {
      GAME_BIOME_INDEX_MAP.set(gid, biomeIdx);
    }
  }
}

/**
 * Récupère le numéro de biome (1 à 6) associé à une pépite indé
 */
export function getGameBiomeIndex(gameId: string): number {
  return GAME_BIOME_INDEX_MAP.get(gameId) || 1;
}

