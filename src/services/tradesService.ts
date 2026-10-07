/**
 * 🃏 services/tradesService.ts
 * Client de communication avec l'API souveraine des échanges de cartes (trades.php).
 */

import type {
  CardTradeOffer,
  CreateTradePayload,
  FriendBinderData,
} from '../types/trades';
import { getCardCollection, saveCardCollection } from './cardStorageService';

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
    const supabase = await import('./supabase').then(m => m.getSupabaseClient());
    if (supabase) {
      const { data, error } = await supabase
        .from('card_trades')
        .select('*')
        .or(`sender_code.eq.${friendCode},receiver_code.eq.${friendCode}`);

      if (!error && data) {
        const trades: CardTradeOffer[] = data.map((row: any) => ({
          ...row.payload,
          id: row.id,
          status: row.status,
        }));

        const incoming = trades.filter((t) => t.toFriendCode === friendCode && t.status === 'pending');
        const outgoing = trades.filter((t) => t.fromFriendCode === friendCode && t.status === 'pending');
        const history = trades.filter((t) => t.status !== 'pending');

        return {
          success: true,
          incoming,
          outgoing,
          history,
          pendingCount: incoming.length,
          unacknowledgedCount: 0,
        };
      }
    }
  } catch (_err) {
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
    const supabase = await import('./supabase').then(m => m.getSupabaseClient());
    if (supabase) {
      const { data, error } = await supabase
        .from('card_trades')
        .insert({
          sender_code: payload.fromFriendCode,
          receiver_code: payload.toFriendCode,
          status: 'pending',
          payload: tradePayload,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          success: true,
          trade: { ...data.payload, id: data.id, status: data.status } as CardTradeOffer,
          message: 'Offre d\'échange envoyée avec succès !',
        };
      } else if (error) {
        return { success: false, error: error.message };
      }
    }
  } catch (_err) {
    // Fallback local storage
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
    message: 'Offre d\'échange enregistrée localement !',
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
    const supabase = await import('./supabase').then(m => m.getSupabaseClient());
    if (supabase) {
      if (params.response === 'accept') {
        const { error } = await supabase.rpc('accept_card_trade', { trade_id: params.tradeId });
        
        if (!error) {
          // Fetch updated trade to sync locally
          const { data: updatedTrade } = await supabase
            .from('card_trades')
            .select('*')
            .eq('id', params.tradeId)
            .single();

          if (updatedTrade) {
            const mappedTrade = { ...updatedTrade.payload, id: updatedTrade.id, status: updatedTrade.status } as CardTradeOffer;
            applyTradeToLocalCollection(mappedTrade, params.friendCode);
            return { success: true, trade: mappedTrade, message: 'Échange accepté !' };
          }
          return { success: true, message: 'Échange accepté !' };
        } else {
          return { success: false, error: error.message };
        }
      } else {
        // Decline or Cancel
        const { data, error } = await supabase
          .from('card_trades')
          .update({ status: params.response === 'decline' ? 'declined' : 'canceled' })
          .eq('id', params.tradeId)
          .select()
          .single();

        if (!error && data) {
          return {
            success: true,
            trade: { ...data.payload, id: data.id, status: data.status } as CardTradeOffer,
            message: 'Offre mise à jour.',
          };
        } else if (error) {
          return { success: false, error: error.message };
        }
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

  return { success: false, error: 'Impossible de joindre le serveur d\'échange.' };
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
    const supabase = await import('./supabase').then(m => m.getSupabaseClient());
    if (supabase) {
      // Find the friend by friend_code
      const { data, error } = await supabase
        .from('user_profiles')
        .select('save_data')
        .eq('friend_code', friendCode)
        .single();

      if (!error && data) {
        const friendData = data.save_data || {};
        const collection = friendData.cardCollection || {};
        const ownedCards: Record<string, { count: number; countHolo: number }> = {};
        const duplicates: Record<string, { count: number; countHolo: number; tradableNormal: number; tradableHolo: number }> = {};

        for (const [cardId, entry] of Object.entries<any>(collection)) {
          const count = entry.count || 0;
          const countHolo = entry.countHolo || 0;
          ownedCards[cardId] = { count, countHolo };

          if (count > 1 || countHolo > 1) {
            duplicates[cardId] = {
              count,
              countHolo,
              tradableNormal: Math.max(0, count - 1),
              tradableHolo: Math.max(0, countHolo - 1),
            };
          }
        }

        return {
          success: true,
          data: {
            friendCode,
            duplicates,
            ownedCards,
          },
        };
      } else if (error) {
         return { success: false, error: error.message };
      }
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur réseau.' };
  }
  
  return { success: false, error: 'Erreur chargement classeur ami.' };
}

export async function acknowledgeTradeApi(_tradeId: string, _friendCode: string): Promise<boolean> {
  // Optionnel : on pourrait stocker les acknowledged dans le json payload, mais le frontend gère les IDs localement via APPLIED_TRADES_STORAGE_KEY
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
