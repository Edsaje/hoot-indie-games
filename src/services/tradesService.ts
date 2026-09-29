/**
 * 🃏 services/tradesService.ts
 * Client de communication avec l'API souveraine des échanges de cartes (trades.php).
 */

import type {
  CardTradeOffer,
  CreateTradePayload,
  FriendBinderData,
} from '../types/trades';
import { getCardCollection, saveCardCollection } from './cardCollectionService';

const LOCAL_STORAGE_TRADES_KEY = 'hoot_local_card_trades_v1';

function getLocalTrades(): CardTradeOffer[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRADES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTrades(trades: CardTradeOffer[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TRADES_KEY, JSON.stringify(trades));
  } catch {
    // Ignore
  }
}

/**
 * Récupère les échanges reçus, envoyés et passés d'un joueur
 */
export async function fetchTradesApi(friendCode: string): Promise<{
  success: boolean;
  incoming: CardTradeOffer[];
  outgoing: CardTradeOffer[];
  history: CardTradeOffer[];
  pendingCount: number;
  unacknowledgedCount: number;
  error?: string;
}> {
  if (!friendCode) {
    return { success: true, incoming: [], outgoing: [], history: [], pendingCount: 0, unacknowledgedCount: 0 };
  }

  try {
    const res = await fetch(`/api/trades.php?action=get_trades&friendCode=${encodeURIComponent(friendCode)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          incoming: data.incoming || [],
          outgoing: data.outgoing || [],
          history: data.history || [],
          pendingCount: data.pendingCount || 0,
          unacknowledgedCount: data.unacknowledgedCount || 0,
        };
      }
    }
  } catch {
    // Fallback local
  }

  // Fallback local storage
  const allLocal = getLocalTrades();
  const incoming = allLocal.filter((t) => t.toFriendCode === friendCode && t.status === 'pending');
  const outgoing = allLocal.filter((t) => t.fromFriendCode === friendCode && t.status === 'pending');
  const history = allLocal.filter((t) => (t.fromFriendCode === friendCode || t.toFriendCode === friendCode) && t.status !== 'pending');

  return {
    success: true,
    incoming,
    outgoing,
    history,
    pendingCount: incoming.length,
    unacknowledgedCount: 0,
  };
}

/**
 * Émet une proposition d'échange de carte vers un compagnon
 */
export async function createTradeApi(payload: CreateTradePayload): Promise<{
  success: boolean;
  trade?: CardTradeOffer;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/trades.php?action=create_trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action: 'create_trade', ...payload }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return {
        success: true,
        trade: data.trade,
        message: data.message || 'Offre d\'échange envoyée avec succès !',
      };
    }

    if (data?.error || data?.message) {
      return {
        success: false,
        error: data.message || data.error,
      };
    }
  } catch {
    // Fallback local storage
  }

  // Création locale
  const now = Math.floor(Date.now() / 1000);
  const localTrade: CardTradeOffer = {
    id: `trade_loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fromFriendCode: payload.fromFriendCode,
    fromUsername: payload.fromUsername || 'Explorateur',
    fromAvatarId: payload.fromAvatarId || 'owl',
    toFriendCode: payload.toFriendCode,
    toUsername: payload.toUsername || 'Compagnon',
    toAvatarId: payload.toAvatarId || 'owl',

    offeredCardId: payload.offeredCardId,
    offeredCardIsHolo: payload.offeredCardIsHolo,
    offeredCardTitle: payload.offeredCardTitle,
    offeredCardRarity: payload.offeredCardRarity,
    offeredCardImageUrl: payload.offeredCardImageUrl,
    offeredCardNumber: payload.offeredCardNumber,

    requestedCardId: payload.requestedCardId || 'any',
    requestedCardIsHolo: Boolean(payload.requestedCardIsHolo),
    requestedCardTitle: payload.requestedCardTitle || 'Au choix',
    requestedCardRarity: payload.requestedCardRarity,
    requestedCardImageUrl: payload.requestedCardImageUrl,
    requestedCardNumber: payload.requestedCardNumber,

    note: payload.note,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    expiresAt: now + 7 * 86400,
  };

  const currentLocal = getLocalTrades();
  saveLocalTrades([localTrade, ...currentLocal]);

  return {
    success: true,
    trade: localTrade,
    message: 'Offre d\'échange enregistrée localement !',
  };
}

/**
 * Répond à un échange (Accepter, Refuser, Annuler)
 */
export async function respondTradeApi(params: {
  tradeId: string;
  response: 'accept' | 'decline' | 'cancel';
  friendCode: string;
  counterCardId?: string;
  counterCardIsHolo?: boolean;
  counterCardTitle?: string;
  counterCardRarity?: string;
  counterCardImageUrl?: string;
  counterCardNumber?: number;
}): Promise<{
  success: boolean;
  trade?: CardTradeOffer;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/trades.php?action=respond_trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action: 'respond_trade', ...params }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      // Si accepté avec succès, synchroniser immédiatement le classeur local !
      if (params.response === 'accept' && data.trade) {
        applyTradeToLocalCollection(data.trade, params.friendCode);
      }

      return {
        success: true,
        trade: data.trade,
        message: data.message || 'Action exécutée avec succès.',
      };
    }

    if (data?.error || data?.message) {
      return {
        success: false,
        error: data.message || data.error,
      };
    }
  } catch {
    // Fallback local
  }

  // Fallback local storage
  const allLocal = getLocalTrades();
  const idx = allLocal.findIndex((t) => t.id === params.tradeId);
  if (idx !== -1) {
    const updated = { ...allLocal[idx] };
    if (params.response === 'accept') {
      updated.status = 'accepted';
      updated.acceptedAt = Math.floor(Date.now() / 1000);
      if (params.counterCardId) {
        updated.requestedCardId = params.counterCardId;
        updated.requestedCardIsHolo = Boolean(params.counterCardIsHolo);
      }
      applyTradeToLocalCollection(updated, params.friendCode);
    } else if (params.response === 'decline') {
      updated.status = 'declined';
    } else if (params.response === 'cancel') {
      updated.status = 'canceled';
    }
    updated.updatedAt = Math.floor(Date.now() / 1000);
    allLocal[idx] = updated;
    saveLocalTrades(allLocal);

    return {
      success: true,
      trade: updated,
      message: params.response === 'accept' ? 'Échange accepté !' : 'Offre mise à jour.',
    };
  }

  return { success: false, error: 'Impossible de joindre le serveur d\'échange.' };
}

/**
 * Consulte les doubles possédés par un compagnon mutuel
 */
export async function fetchFriendBinderApi(
  myCode: string,
  friendCode: string
): Promise<{
  success: boolean;
  data?: FriendBinderData;
  error?: string;
}> {
  if (!myCode || !friendCode) return { success: false, error: 'Codes amis requis.' };

  try {
    const res = await fetch(
      `/api/trades.php?action=get_friend_binder&myCode=${encodeURIComponent(myCode)}&friendCode=${encodeURIComponent(friendCode)}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: true,
        data: {
          friendCode: data.friendCode,
          duplicates: data.duplicates || {},
          ownedCards: data.ownedCards || {},
        },
      };
    }
    return { success: false, error: data?.message || data?.error || 'Erreur chargement classeur ami.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur réseau.' };
  }
}

/**
 * Acquitte une notification d'échange
 */
export async function acknowledgeTradeApi(tradeId: string, friendCode: string): Promise<boolean> {
  try {
    const res = await fetch('/api/trades.php?action=acknowledge_trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acknowledge_trade', tradeId, friendCode }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const APPLIED_TRADES_STORAGE_KEY = 'hoot_applied_trades_v1';
export const TRADES_LAST_UPDATED_KEY = 'hoot_trades_last_updated_v1';

export function getAppliedTradeIds(): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) return new Set();
  try {
    const raw = localStorage.getItem(APPLIED_TRADES_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markTradeAsApplied(tradeId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const ids = getAppliedTradeIds();
    ids.add(tradeId);
    localStorage.setItem(APPLIED_TRADES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    localStorage.setItem(TRADES_LAST_UPDATED_KEY, String(Math.floor(Date.now() / 1000)));
  } catch {
    // Ignore
  }
}

/**
 * Applique le résultat d'un échange accepté au classeur local (Idempotent)
 */
export function applyTradeToLocalCollection(trade: CardTradeOffer, myCode: string): void {
  if (trade.status !== 'accepted') return;
  if (!trade.id) return;

  const appliedIds = getAppliedTradeIds();
  if (appliedIds.has(trade.id)) {
    return; // Déjà appliqué
  }

  const isSender = (trade.fromFriendCode === myCode);
  const isRecipient = (trade.toFriendCode === myCode);

  if (!isSender && !isRecipient) return;

  const collection = getCardCollection();
  const nextCollection = { ...collection };
  const nowIso = new Date().toISOString();

  if (isSender) {
    // Expéditeur : perd offeredCard, gagne receivedCard (acceptedCardId si disponible ou requestedCardId)
    const offered = nextCollection[trade.offeredCardId];
    if (offered) {
      if (trade.offeredCardIsHolo) {
        offered.countHolo = Math.max(0, (offered.countHolo || 0) - 1);
      } else {
        offered.count = Math.max(0, (offered.count || 0) - 1);
      }
    }

    const receivedId = trade.acceptedCardId || trade.requestedCardId;
    const isReceivedHolo = Boolean(trade.acceptedCardIsHolo ?? trade.requestedCardIsHolo);

    if (receivedId && receivedId !== 'any') {
      if (!nextCollection[receivedId]) {
        nextCollection[receivedId] = {
          count: isReceivedHolo ? 0 : 1,
          countHolo: isReceivedHolo ? 1 : 0,
          firstObtainedAt: nowIso,
        };
      } else {
        if (isReceivedHolo) {
          nextCollection[receivedId].countHolo = (nextCollection[receivedId].countHolo || 0) + 1;
        } else {
          nextCollection[receivedId].count = (nextCollection[receivedId].count || 0) + 1;
        }
      }
    }
  } else if (isRecipient) {
    // Destinataire : perd givenCard (acceptedCardId si disponible ou requestedCardId), gagne offeredCard
    const givenId = trade.acceptedCardId || trade.requestedCardId;
    const isGivenHolo = Boolean(trade.acceptedCardIsHolo ?? trade.requestedCardIsHolo);

    if (givenId && givenId !== 'any') {
      const given = nextCollection[givenId];
      if (given) {
        if (isGivenHolo) {
          given.countHolo = Math.max(0, (given.countHolo || 0) - 1);
        } else {
          given.count = Math.max(0, (given.count || 0) - 1);
        }
      }
    }

    const gainedId = trade.offeredCardId;
    const isGainedHolo = Boolean(trade.offeredCardIsHolo);

    if (gainedId) {
      if (!nextCollection[gainedId]) {
        nextCollection[gainedId] = {
          count: isGainedHolo ? 0 : 1,
          countHolo: isGainedHolo ? 1 : 0,
          firstObtainedAt: nowIso,
        };
      } else {
        if (isGainedHolo) {
          nextCollection[gainedId].countHolo = (nextCollection[gainedId].countHolo || 0) + 1;
        } else {
          nextCollection[gainedId].count = (nextCollection[gainedId].count || 0) + 1;
        }
      }
    }
  }

  saveCardCollection(nextCollection);
  markTradeAsApplied(trade.id);
}
