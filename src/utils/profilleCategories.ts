/**
 * Utilitaires pour le système de rotation dynamique des catégories quotidiennes dans Profille
 * Directive 63 — Section 26.2
 */

import type { Game, LocalizedText } from '../types/game';

export type ProfilleCategory =
  | 'year'
  | 'developer'
  | 'genres'
  | 'composer'
  | 'artStyle'
  | 'camera';

export interface ArtStyleOption {
  id: string;
  labelFr: string;
  labelEn: string;
}

export interface CameraOption {
  id: string;
  labelFr: string;
  labelEn: string;
}

export const CANONICAL_ART_STYLES: ArtStyleOption[] = [
  { id: 'pixel_art', labelFr: 'Pixel Art', labelEn: 'Pixel Art' },
  { id: 'hand_drawn_2d', labelFr: '2D Dessiné à la main', labelEn: 'Hand-drawn 2D' },
  { id: 'stylized_3d', labelFr: '3D Stylisée', labelEn: 'Stylized 3D' },
  { id: 'low_poly_3d', labelFr: '3D Low-Poly / Rétro', labelEn: '3D Low-Poly / Retro' },
  { id: 'realistic_3d', labelFr: '3D Réaliste', labelEn: 'Realistic 3D' },
  { id: 'monochrome', labelFr: 'Monochrome / Minimaliste', labelEn: 'Monochrome / Minimalist' },
];

export const CANONICAL_CAMERAS: CameraOption[] = [
  { id: 'side_2d', labelFr: 'Vue de côté 2D', labelEn: '2D Side-scroller' },
  { id: 'topdown_2d', labelFr: 'Vue du dessus 2D', labelEn: '2D Top-down' },
  { id: 'isometric', labelFr: 'Isométrique / 2.5D', labelEn: 'Isometric / 2.5D' },
  { id: 'first_person', labelFr: 'Première personne', labelEn: 'First-Person' },
  { id: 'third_person', labelFr: 'Troisième personne', labelEn: 'Third-Person' },
];

/**
 * Normalisation robuste des chaînes de texte pour comparaison insensible
 */
export function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

/**
 * Normalisation de studio ou de compositeur (tolérance GmbH, Inc, etc.)
 */
export function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(gmbh|inc\.?|llc|ltd\.?|corp\.?|co\.|studios?|games?|entertainment|interactive)\b/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

export function isStudioMatch(guess: string, targetDev: string): boolean {
  if (!guess || !targetDev) return false;
  const gNorm = normalizeName(guess);
  const tNorm = normalizeName(targetDev);
  if (gNorm === tNorm) return true;
  return gNorm.length >= 3 && tNorm.includes(gNorm);
}

export function isComposerMatch(guess: string, targetComposer?: string): boolean {
  if (!guess || !targetComposer) return false;
  const gNorm = normalizeName(guess);
  const tNorm = normalizeName(targetComposer);
  if (gNorm === tNorm) return true;
  return gNorm.length >= 3 && (tNorm.includes(gNorm) || gNorm.includes(tNorm));
}

export function isArtStyleMatch(guess: string, target: LocalizedText): boolean {
  const gNorm = normalizeKey(guess);
  const frNorm = normalizeKey(target.fr);
  const enNorm = normalizeKey(target.en);
  if (gNorm === frNorm || gNorm === enNorm) return true;

  // Variantes lowpoly & retro
  if (gNorm.includes('lowpoly') && (frNorm.includes('lowpoly') || enNorm.includes('lowpoly'))) return true;
  if (gNorm.includes('pixel') && (frNorm.includes('pixel') || enNorm.includes('pixel'))) return true;
  if (gNorm.includes('dessine') && frNorm.includes('dessine')) return true;
  if (gNorm.includes('stylise') && (frNorm.includes('stylise') || enNorm.includes('stylized'))) return true;
  if (gNorm.includes('monochrome') && frNorm.includes('monochrome')) return true;
  if (gNorm.includes('realiste') && (frNorm.includes('realiste') || enNorm.includes('realistic'))) return true;
  return false;
}

export function isCameraMatch(guess: string, target: LocalizedText): boolean {
  const gNorm = normalizeKey(guess);
  const frNorm = normalizeKey(target.fr);
  const enNorm = normalizeKey(target.en);
  if (gNorm === frNorm || gNorm === enNorm) return true;

  if (gNorm.includes('cote') && (frNorm.includes('cote') || enNorm.includes('side'))) return true;
  if (gNorm.includes('dessus') && (frNorm.includes('dessus') || enNorm.includes('topdown'))) return true;
  if (gNorm.includes('isometrique') && (frNorm.includes('isometrique') || enNorm.includes('isometric'))) return true;
  if (gNorm.includes('premiere') && (frNorm.includes('premiere') || enNorm.includes('first'))) return true;
  if (gNorm.includes('troisieme') && (frNorm.includes('troisieme') || enNorm.includes('third'))) return true;
  return false;
}

/**
 * Générateur déterministe de 3 catégories quotidiennes distinctes pour Profille.
 * Garantit la pertinence des données (ex: compositeur inclus uniquement si documenté).
 */
export function getDailyProfilleCategories(dateString: string, secretGame: Game): ProfilleCategory[] {
  const eligibleCategories: ProfilleCategory[] = ['year', 'developer', 'genres', 'artStyle', 'camera'];
  if (secretGame?.hints?.composer && secretGame.hints.composer.trim().length > 0) {
    eligibleCategories.push('composer');
  }

  // Calcul du hash de graine calendaire
  let hash = 0;
  const seed = `profille_rotation_v2_${dateString}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  // LCG déterministe
  let state = Math.abs(hash) || 987654321;
  const nextRandom = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  // Mélange Fisher-Yates
  const pool = [...eligibleCategories];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 3);
}
