/**
 * cardCollectionService.ts
 * Gestion centralisée du classeur de cartes, de l'ouverture de boosters et du désenchantement.
 */

import { useState, useEffect } from 'react';
import type { UserCardCollection, BoosterOpenResult, CardItem } from '../types/cards';
import { BOOSTER_COST, DISENCHANT_VALUES } from '../types/cards';
import { CARDS_BY_ID, generateBoosterCards, getDynamicCardsPool } from '../data/cardsData';
import { addBonusFeathers, spendFeathers, isLocalAdminProfile } from '../utils/featherEconomy';
import { getTodayDateString } from '../utils/streakManager';

export const STORAGE_CARD_COLLECTION = 'hoot_cards_collection_v1';
export const STORAGE_LAST_DAILY_BOOSTER = 'hoot_last_daily_booster_claim_v1';
export const STORAGE_FREE_BOOSTERS_STOCK = 'hoot_free_boosters_stock_v2';

export const MAX_FREE_BOOSTERS = 2;
export const BOOSTER_RECHARGE_MS = 12 * 60 * 60 * 1000; // 12 heures par booster gratuit

export interface FreeBoostersStock {
  count: number; // 0, 1 ou 2
  lastRechargeTimestamp: number; // Timestamp ms du début du décompte en cours
}

export interface FreeBoostersInfo {
  count: number;
  max: number;
  isFull: boolean;
  msUntilNext: number;
  formattedCountdown: string; // Ex: "11:42:15"
  progressPercent: number; // 0 à 100% de la recharge courante
  canClaim: boolean;
}

/**
 * Charge l'état brut du stock de boosters depuis le stockage local
 */
export function loadFreeBoostersStock(now = Date.now()): FreeBoostersStock {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { count: MAX_FREE_BOOSTERS, lastRechargeTimestamp: now };
  }
  try {
    const raw = localStorage.getItem(STORAGE_FREE_BOOSTERS_STOCK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && typeof parsed.count === 'number') {
        return {
          count: Math.max(0, Math.min(MAX_FREE_BOOSTERS, Math.floor(parsed.count))),
          lastRechargeTimestamp: Number(parsed.lastRechargeTimestamp) || now,
        };
      }
    }
    // Migration transparente depuis l'ancienne clé unique quotidienne
    const oldClaim = localStorage.getItem(STORAGE_LAST_DAILY_BOOSTER);
    const todayStr = getTodayDateString();
    if (oldClaim === todayStr) {
      // Déjà réclamé aujourd'hui sous l'ancien format : 1 en stock, décompte pour le 2ème lancé
      const initStock: FreeBoostersStock = { count: 1, lastRechargeTimestamp: now };
      localStorage.setItem(STORAGE_FREE_BOOSTERS_STOCK, JSON.stringify(initStock));
      return initStock;
    } else {
      // Non réclamé : commence avec le stock plein (2/2) !
      const initStock: FreeBoostersStock = { count: MAX_FREE_BOOSTERS, lastRechargeTimestamp: now };
      localStorage.setItem(STORAGE_FREE_BOOSTERS_STOCK, JSON.stringify(initStock));
      return initStock;
    }
  } catch {
    return { count: MAX_FREE_BOOSTERS, lastRechargeTimestamp: now };
  }
}

/**
 * Sauvegarde l'état du stock de boosters et émet un événement réactif
 */
export function saveFreeBoostersStock(stock: FreeBoostersStock): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_FREE_BOOSTERS_STOCK, JSON.stringify(stock));
    window.dispatchEvent(new CustomEvent('hoot_free_boosters_updated', { detail: stock }));
  } catch (err) {
    console.warn('[CardCollection] Erreur sauvegarde stock boosters:', err);
  }
}

/**
 * Calcule l'état dynamique en temps réel du stock de boosters gratuits (0 à 2)
 * et applique les recharges de 12h écoulées
 */
export function getFreeBoostersInfo(now = Date.now(), isSuperAdmin = false): FreeBoostersInfo {
  const stock = loadFreeBoostersStock(now);
  let count = stock.count;
  let lastRechargeTimestamp = stock.lastRechargeTimestamp;

  if (count >= MAX_FREE_BOOSTERS) {
    count = MAX_FREE_BOOSTERS;
    lastRechargeTimestamp = now;
    if (stock.count !== count || stock.lastRechargeTimestamp !== lastRechargeTimestamp) {
      saveFreeBoostersStock({ count, lastRechargeTimestamp });
    }
    return {
      count: MAX_FREE_BOOSTERS,
      max: MAX_FREE_BOOSTERS,
      isFull: true,
      msUntilNext: 0,
      formattedCountdown: 'Stock plein (2/2)',
      progressPercent: 100,
      canClaim: true,
    };
  }

  // Stock inférieur à 2 : calculer les intervalles de 12h écoulés
  const elapsed = Math.max(0, now - lastRechargeTimestamp);
  const rechargesEarned = Math.floor(elapsed / BOOSTER_RECHARGE_MS);

  if (rechargesEarned > 0) {
    count = Math.min(MAX_FREE_BOOSTERS, count + rechargesEarned);
    if (count >= MAX_FREE_BOOSTERS) {
      lastRechargeTimestamp = now;
    } else {
      lastRechargeTimestamp += rechargesEarned * BOOSTER_RECHARGE_MS;
    }
    saveFreeBoostersStock({ count, lastRechargeTimestamp });
  }

  if (count >= MAX_FREE_BOOSTERS) {
    return {
      count: MAX_FREE_BOOSTERS,
      max: MAX_FREE_BOOSTERS,
      isFull: true,
      msUntilNext: 0,
      formattedCountdown: 'Stock plein (2/2)',
      progressPercent: 100,
      canClaim: true,
    };
  }

  // Décompte actif vers le prochain booster
  const currentElapsed = Math.max(0, now - lastRechargeTimestamp);
  const msRemaining = Math.max(0, BOOSTER_RECHARGE_MS - currentElapsed);
  const progressPercent = Math.min(100, Math.max(0, (currentElapsed / BOOSTER_RECHARGE_MS) * 100));

  const totalSec = Math.ceil(msRemaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    count,
    max: MAX_FREE_BOOSTERS,
    isFull: false,
    msUntilNext: msRemaining,
    formattedCountdown,
    progressPercent,
    canClaim: isSuperAdmin || isLocalAdminProfile() || count > 0,
  };
}

/**
 * Hook React personnalisé offrant une réactivité à la seconde pour le décompte des boosters gratuits
 */
export function useFreeBoostersStock(isSuperAdmin = false): FreeBoostersInfo {
  const [info, setInfo] = useState<FreeBoostersInfo>(() => getFreeBoostersInfo(Date.now(), isSuperAdmin));

  useEffect(() => {
    const update = () => {
      setInfo(getFreeBoostersInfo(Date.now(), isSuperAdmin));
    };

    update();
    const interval = setInterval(update, 1000);

    const handleStockEvent = () => update();
    window.addEventListener('hoot_free_boosters_updated', handleStockEvent);
    window.addEventListener('hoot_daily_booster_claimed', handleStockEvent);
    document.addEventListener('visibilitychange', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('hoot_free_boosters_updated', handleStockEvent);
      window.removeEventListener('hoot_daily_booster_claimed', handleStockEvent);
      document.removeEventListener('visibilitychange', update);
    };
  }, [isSuperAdmin]);

  return info;
}

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
 * Vérifie si au moins un booster gratuit est disponible en réserve
 */
export function canClaimDailyBooster(_todayStr = getTodayDateString(), bypassDailyLimit = false): boolean {
  if (bypassDailyLimit || isLocalAdminProfile()) return true;
  const info = getFreeBoostersInfo();
  return info.count > 0;
}

/**
 * Réclame un booster gratuit depuis la réserve (2 max cumulables, recharge 1 booster toutes les 12h)
 */
export function claimDailyBooster(
  _todayStr = getTodayDateString(),
  bypassDailyLimit = false,
  cardsPool: CardItem[] = getDynamicCardsPool()
): BoosterOpenResult | null {
  const info = getFreeBoostersInfo(Date.now(), bypassDailyLimit || isLocalAdminProfile());
  if (!bypassDailyLimit && !isLocalAdminProfile() && info.count <= 0) {
    return null;
  }

  const now = Date.now();
  // Mise à jour de la réserve de boosters
  if (info.count >= MAX_FREE_BOOSTERS) {
    // Le stock était plein : ouvrir 1 booster enclenche le décompte de 12h pour le second dès maintenant
    saveFreeBoostersStock({ count: 1, lastRechargeTimestamp: now });
  } else if (info.count === 1) {
    // Il restait 1 booster : ouvrir le dernier passe le stock à 0, le compte à rebours de 12h en cours continue
    const stock = loadFreeBoostersStock(now);
    saveFreeBoostersStock({ count: 0, lastRechargeTimestamp: stock.lastRechargeTimestamp });
  } else {
    // Mode administrateur ou bypass
    const stock = loadFreeBoostersStock(now);
    saveFreeBoostersStock({ count: 0, lastRechargeTimestamp: stock.lastRechargeTimestamp });
  }

  const collection = getCardCollection();
  const ownedIds = new Set(
    Object.keys(collection).filter(
      (id) => (collection[id]?.count || 0) + (collection[id]?.countHolo || 0) > 0
    )
  );

  const boosterCards = generateBoosterCards(ownedIds, cardsPool);

  // Mettre à jour la collection
  const nowIso = new Date(now).toISOString();
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
      firstObtainedAt: prevFirstObtained || nowIso,
    };
  }

  saveCardCollection(nextCollection);

  try {
    localStorage.setItem(STORAGE_LAST_DAILY_BOOSTER, getTodayDateString(new Date(now)));
    window.dispatchEvent(new CustomEvent('hoot_daily_booster_claimed'));
  } catch {
    // Ignore
  }

  return {
    cards: boosterCards,
    openedAt: nowIso,
    isFreeDaily: true,
  };
}

/**
 * Achète un booster supplémentaire pour 150 Plumes d'Or
 */
export function buyBoosterWithFeathers(
  currentFeathers: number,
  cardsPool: CardItem[] = getDynamicCardsPool()
): BoosterOpenResult | { error: string } {
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

  const boosterCards = generateBoosterCards(ownedIds, cardsPool);
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
export function getCollectionStats(
  collection: UserCardCollection,
  cardsPool: CardItem[] = getDynamicCardsPool()
): CollectionStats {
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

  for (const card of cardsPool) {
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

  const completionPercent = cardsPool.length > 0 ? Math.min(100, Math.round((totalUnique / cardsPool.length) * 100)) : 0;

  return {
    totalUnique,
    totalCards,
    totalHolo,
    totalDuplicates,
    completionPercent,
    byRarity,
  };
}
