/**
 * cardStorageService.ts
 * Stockage local léger et découplé de la collection de cartes du joueur.
 * Ne dépend d'aucun catalogue lourd (cardsData / games) pour préserver le bundle critique.
 */

import type { UserCardCollection } from '../types/cards';

export const STORAGE_CARD_COLLECTION = 'hoot_cards_collection_v1';

/**
 * Récupère la collection locale actuelle du joueur depuis localStorage
 */
export function getCardCollection(): UserCardCollection {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(STORAGE_CARD_COLLECTION);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Sauvegarde la collection locale du joueur et émet un événement réactif
 */
export function saveCardCollection(collection: UserCardCollection): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_CARD_COLLECTION, JSON.stringify(collection));
    window.dispatchEvent(new CustomEvent('hoot_card_collection_updated', { detail: collection }));
  } catch (err) {
    console.warn('Impossible de sauvegarder la collection de cartes :', err);
  }
}
