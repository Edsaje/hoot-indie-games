/**
 * cardCollectionService.ts
 * Gestion centralisée du classeur de cartes, de l'ouverture de boosters et du désenchantement.
 */

import type { UserCardCollection, BoosterOpenResult } from '../types/cards';
import { BOOSTER_COST, DISENCHANT_VALUES } from '../types/cards';
import { ALL_CARDS, CARDS_BY_ID, generateBoosterCards } from '../data/cardsData';
import { addBonusFeathers, spendFeathers, isLocalAdminProfile } from '../utils/featherEconomy';
import { getTodayDateString } from '../utils/streakManager';

export const STORAGE_CARD_COLLECTION = 'hoot_cards_collection_v1';
export const STORAGE_LAST_DAILY_BOOSTER = 'hoot_last_daily_booster_claim_v1';

/**
 * Récupère la collection locale actuelle du joueur
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
  } catch {
    // Ignore
  }
  return {};
}

/**
 * Sauvegarde la collection locale et déclenche l'événement de mise à jour
 */
export function saveCardCollection(collection: UserCardCollection): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_CARD_COLLECTION, JSON.stringify(collection));
    window.dispatchEvent(new CustomEvent('hoot_cards_updated', { detail: collection }));
  } catch (err) {
    console.warn('[CardCollection] Erreur de sauvegarde:', err);
  }
}

/**
 * Vérifie si le booster gratuit quotidien est disponible aujourd'hui
 */
export function canClaimDailyBooster(todayStr = getTodayDateString(), bypassDailyLimit = false): boolean {
  if (bypassDailyLimit || isLocalAdminProfile()) return true;
  if (typeof window === 'undefined' || !window.localStorage) return true;
  try {
    const lastClaim = localStorage.getItem(STORAGE_LAST_DAILY_BOOSTER);
    return lastClaim !== todayStr;
  } catch {
    return true;
  }
}

/**
 * Réclame le booster quotidien gratuit (1 offert chaque jour !)
 */
export function claimDailyBooster(todayStr = getTodayDateString(), bypassDailyLimit = false): BoosterOpenResult | null {
  if (!bypassDailyLimit && !canClaimDailyBooster(todayStr, bypassDailyLimit)) return null;

  const collection = getCardCollection();
  const ownedIds = new Set(
    Object.keys(collection).filter(
      (id) => (collection[id]?.count || 0) + (collection[id]?.countHolo || 0) > 0
    )
  );

  const boosterCards = generateBoosterCards(ownedIds);

  // Mettre à jour la collection
  const now = new Date().toISOString();
  const nextCollection: UserCardCollection = { ...collection };

  for (const item of boosterCards) {
    if (!item || !item.card || !item.card.id) continue;
    const prevEntry = nextCollection[item.card.id];
    const prevCount = (typeof prevEntry === 'object' && prevEntry !== null) ? (Number(prevEntry.count) || 0) : 0;
    const prevHolo = (typeof prevEntry === 'object' && prevEntry !== null) ? (Number(prevEntry.countHolo) || 0) : 0;
    const prevFirstObtained = (typeof prevEntry === 'object' && prevEntry !== null) ? prevEntry.firstObtainedAt : undefined;

    nextCollection[item.card.id] = {
      count: item.isHolo ? prevCount : prevCount + 1,
      countHolo: item.isHolo ? prevHolo + 1 : prevHolo,
      firstObtainedAt: prevFirstObtained || now,
    };
  }

  saveCardCollection(nextCollection);

  try {
    localStorage.setItem(STORAGE_LAST_DAILY_BOOSTER, todayStr);
    window.dispatchEvent(new CustomEvent('hoot_daily_booster_claimed'));
  } catch {
    // Ignore
  }

  return {
    cards: boosterCards,
    openedAt: now,
    isFreeDaily: true,
  };
}

/**
 * Achète un booster supplémentaire pour 150 Plumes d'Or
 */
export function buyBoosterWithFeathers(currentFeathers: number): BoosterOpenResult | { error: string } {
  if (currentFeathers < BOOSTER_COST) {
    return { error: `Il vous manque ${BOOSTER_COST - currentFeathers} plumes d'or pour acheter ce booster.` };
  }

  const success = spendFeathers(BOOSTER_COST, currentFeathers, 'Achat Booster de Cartes (150 🪶)');
  if (!success) {
    return { error: "Échec de la transaction en plumes d'or." };
  }

  const collection = getCardCollection();
  const ownedIds = new Set(
    Object.keys(collection).filter(
      (id) => (collection[id]?.count || 0) + (collection[id]?.countHolo || 0) > 0
    )
  );

  const boosterCards = generateBoosterCards(ownedIds);
  const now = new Date().toISOString();
  const nextCollection: UserCardCollection = { ...collection };

  for (const item of boosterCards) {
    if (!item || !item.card || !item.card.id) continue;
    const prevEntry = nextCollection[item.card.id];
    const prevCount = (typeof prevEntry === 'object' && prevEntry !== null) ? (Number(prevEntry.count) || 0) : 0;
    const prevHolo = (typeof prevEntry === 'object' && prevEntry !== null) ? (Number(prevEntry.countHolo) || 0) : 0;
    const prevFirstObtained = (typeof prevEntry === 'object' && prevEntry !== null) ? prevEntry.firstObtainedAt : undefined;

    nextCollection[item.card.id] = {
      count: item.isHolo ? prevCount : prevCount + 1,
      countHolo: item.isHolo ? prevHolo + 1 : prevHolo,
      firstObtainedAt: prevFirstObtained || now,
    };
  }

  saveCardCollection(nextCollection);

  return {
    cards: boosterCards,
    openedAt: now,
    isFreeDaily: false,
  };
}

/**
 * Désenchante / recycle un exemplaire en surplus pour obtenir des plumes d'or.
 * Sécurité garantie : on ne peut désenchanter que si le joueur possède au moins 2 exemplaires au total !
 */
export function disenchantCard(
  cardId: string,
  isHolo: boolean
): { success: boolean; feathersGained: number; error?: string } {
  const card = CARDS_BY_ID.get(cardId);
  if (!card) return { success: false, feathersGained: 0, error: 'Carte introuvable.' };

  const collection = getCardCollection();
  const entry = collection[cardId];
  if (!entry) return { success: false, feathersGained: 0, error: 'Vous ne possédez pas cette carte.' };

  const totalCopies = (entry.count || 0) + (entry.countHolo || 0);
  if (totalCopies <= 1) {
    return {
      success: false,
      feathersGained: 0,
      error: 'Impossible de désenchanter votre dernier exemplaire conservé dans le classeur.',
    };
  }

  if (isHolo && (entry.countHolo || 0) <= 0) {
    return { success: false, feathersGained: 0, error: 'Vous ne possédez aucun exemplaire holographique de cette carte.' };
  }

  if (!isHolo && (entry.count || 0) <= 0) {
    return { success: false, feathersGained: 0, error: 'Vous ne possédez aucun exemplaire standard de cette carte.' };
  }

  const values = DISENCHANT_VALUES[card.rarity];
  const feathersGained = isHolo ? values.holo : values.normal;

  const nextEntry = {
    ...entry,
    count: isHolo ? entry.count : Math.max(0, entry.count - 1),
    countHolo: isHolo ? Math.max(0, entry.countHolo - 1) : entry.countHolo,
  };

  const nextCollection = {
    ...collection,
    [cardId]: nextEntry,
  };

  saveCardCollection(nextCollection);
  addBonusFeathers(
    feathersGained,
    `Recyclage carte ${card.title} (${isHolo ? 'Holo' : 'Standard'} - ${card.rarity})`
  );

  return {
    success: true,
    feathersGained,
  };
}

export interface CollectionStats {
  totalUnique: number;
  totalCards: number;
  totalHolo: number;
  totalDuplicates: number;
  completionPercent: number;
  byRarity: Record<
    'common' | 'rare' | 'epic' | 'legendary',
    { owned: number; total: number }
  >;
}

/**
 * Calcule les métriques globales de l'album de cartes
 */
export function getCollectionStats(collection: UserCardCollection): CollectionStats {
  let totalUnique = 0;
  let totalCards = 0;
  let totalHolo = 0;
  let totalDuplicates = 0;

  const byRarity: Record<'common' | 'rare' | 'epic' | 'legendary', { owned: number; total: number }> = {
    common: { owned: 0, total: 0 },
    rare: { owned: 0, total: 0 },
    epic: { owned: 0, total: 0 },
    legendary: { owned: 0, total: 0 },
  };

  const safeCollection = collection && typeof collection === 'object' && !Array.isArray(collection) ? collection : {};

  for (const card of ALL_CARDS) {
    if (!card || !card.id) continue;
    const rarity = (card.rarity && byRarity[card.rarity]) ? card.rarity : 'common';
    byRarity[rarity].total += 1;

    const entry = safeCollection[card.id];
    if (entry && typeof entry === 'object') {
      const normalCount = Number(entry.count) || 0;
      const holoCount = Number(entry.countHolo) || 0;
      const totalForCard = normalCount + holoCount;

      if (totalForCard > 0) {
        totalUnique += 1;
        byRarity[rarity].owned += 1;
        totalCards += totalForCard;
        totalHolo += holoCount;
        if (totalForCard > 1) {
          totalDuplicates += totalForCard - 1;
        }
      }
    }
  }

  const completionPercent = ALL_CARDS.length > 0 ? Math.min(100, Math.round((totalUnique / ALL_CARDS.length) * 100)) : 0;

  return {
    totalUnique,
    totalCards,
    totalHolo,
    totalDuplicates,
    completionPercent,
    byRarity,
  };
}
