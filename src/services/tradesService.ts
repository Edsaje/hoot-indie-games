/**
 * 🃏 services/tradesService.ts
 * Client de communication avec l'API souveraine des échanges de cartes (trades.php).
 * Fonctionne à 100% sur le serveur OVH Hoot Indie Games, sans dépendance externe.
 */

import type {
  CardTradeOffer,
  CreateTradePayload,
  FriendBinderData,
} from '../types/trades';
import { getCardCollection, saveCardCollection } from './cardStorageService';

const TRADES_API = '/api/trades.php';
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
    const res = await fetch(`${TRADES_API}?action=fetch&friendCode=${encodeURIComponent(friendCode)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return {
          success: true,
          incoming: json.incoming || [],
          outgoing: json.outgoing || [],
          history: json.history || [],
          pendingCount: json.pendingCount || 0,
          unacknowledgedCount: json.unacknowledgedCount || 0,
        };
      }
    }
  } catch (_err) {
    // Fallback local storage
  }

  // Fallback local storage en cas de réseau indisponible
  const allLocal = getLocalTrades();
  const incoming = allLocal.filter((t) => t.toFriendCode === friendCode && t.status === 'pending');
  const outgoing = allLocal.filter((t) => t.fromFriendCode === friendCode && t.status === 'pending');
  const history = allLocal.filter(
    (t) => (t.fromFriendCode === friendCode || t.toFriendCode === friendCode) && t.status !== 'pending'
  );

  return {
    success: true,
    incoming,
    outgoing,
    history,
    pendingCount: incoming.length,
    unacknowledgedCount: 0,
  };
}

export async function createTradeApi(payload: CreateTradePayload): Promise<{
  success: boolean;
  trade?: CardTradeOffer;
  message?: string;
  error?: string;
}> {
  const now = Math.floor(Date.now() / 1000);
  const tradePayload: Partial<CardTradeOffer> = {
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

  try {
    const res = await fetch(`${TRADES_API}?action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ payload }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.trade) {
        return {
          success: true,
          trade: json.trade,
          message: json.message || "Offre d'échange envoyée avec succès !",
        };
      } else if (json.error) {
        return { success: false, error: json.error };
      }
    }
  } catch (_err) {
    // Fallback local
  }

  // Création locale
  const localTrade: CardTradeOffer = {
    id: `trade_loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...(tradePayload as any),
  };

  const currentLocal = getLocalTrades();
  saveLocalTrades([localTrade, ...currentLocal]);

  return {
    success: true,
    trade: localTrade,
    message: "Offre d'échange enregistrée localement !",
  };
}

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
    const res = await fetch(`${TRADES_API}?action=respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.trade) {
        if (params.response === 'accept') {
          applyTradeToLocalCollection(json.trade, params.friendCode);
        }
        return {
          success: true,
          trade: json.trade,
          message: json.message || 'Offre mise à jour avec succès.',
        };
      } else if (json.error) {
        return { success: false, error: json.error };
      }
    }
  } catch (_err) {
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

  return { success: false, error: "Impossible de joindre le serveur d'échange." };
}

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
    const res = await fetch(`${TRADES_API}?action=fetch_binder&friendCode=${encodeURIComponent(friendCode)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: json.data,
        };
      } else if (json.error) {
        return { success: false, error: json.error };
      }
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur réseau.' };
  }

  return { success: false, error: 'Classeur de cet ami introuvable.' };
}

export async function acknowledgeTradeApi(_tradeId: string, _friendCode: string): Promise<boolean> {
  return true;
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
    const set = getAppliedTradeIds();
    set.add(tradeId);
    localStorage.setItem(APPLIED_TRADES_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore
  }
}

export function applyTradeToLocalCollection(trade: CardTradeOffer, myFriendCode: string): void {
  try {
    const collection = getCardCollection();
    const isSender = trade.fromFriendCode === myFriendCode;

    const lostCardId = isSender ? trade.offeredCardId : trade.requestedCardId;
    const lostCardIsHolo = isSender ? trade.offeredCardIsHolo : trade.requestedCardIsHolo;

    const gainedCardId = isSender ? trade.requestedCardId : trade.offeredCardId;
    const gainedCardIsHolo = isSender ? trade.requestedCardIsHolo : trade.offeredCardIsHolo;

    if (lostCardId && collection[lostCardId]) {
      const entry = collection[lostCardId];
      if (lostCardIsHolo && entry.countHolo > 0) {
        entry.countHolo -= 1;
      } else if (entry.count > 0) {
        entry.count -= 1;
      }
    }

    if (gainedCardId && gainedCardId !== 'any') {
      if (!collection[gainedCardId]) {
        collection[gainedCardId] = { count: 0, countHolo: 0, firstObtainedAt: new Date().toISOString() };
      }
      const entry = collection[gainedCardId];
      if (gainedCardIsHolo) {
        entry.countHolo += 1;
      } else {
        entry.count += 1;
      }
    }

    saveCardCollection(collection);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hoot_cards_updated'));
    }
  } catch (err) {
    console.error('Erreur lors de l’application locale du trade:', err);
  }
}
