/**
 * 🃏 types/trades.ts
 * Typages stricts pour le système d'échange bilatéral de cartes entre compagnons.
 */

export type TradeStatus = 'pending' | 'accepted' | 'declined' | 'canceled' | 'expired';

export interface CardTradeOffer {
  id: string;
  fromFriendCode: string;
  fromUsername: string;
  fromAvatarId?: string;
  toFriendCode: string;
  toUsername: string;
  toAvatarId?: string;

  // Carte offerte par l'initiateur
  offeredCardId: string;
  offeredCardIsHolo: boolean;
  offeredCardTitle: string;
  offeredCardRarity: 'common' | 'rare' | 'epic' | 'legendary';
  offeredCardImageUrl: string;
  offeredCardNumber: number;

  // Carte demandée en contrepartie
  requestedCardId: string; // 'any' ou identifiant précis
  requestedCardIsHolo: boolean;
  requestedCardTitle: string;
  requestedCardRarity?: string;
  requestedCardImageUrl?: string;
  requestedCardNumber?: number;

  note?: string;
  status: TradeStatus;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  acceptedAt?: number;
  acceptedCardId?: string;
  acceptedCardIsHolo?: boolean;
  acknowledgedBySender?: boolean;
  acknowledgedByRecipient?: boolean;
}

export interface CreateTradePayload {
  fromFriendCode: string;
  fromUsername?: string;
  fromAvatarId?: string;
  toFriendCode: string;
  toUsername?: string;
  toAvatarId?: string;

  offeredCardId: string;
  offeredCardIsHolo: boolean;
  offeredCardTitle: string;
  offeredCardRarity: 'common' | 'rare' | 'epic' | 'legendary';
  offeredCardImageUrl: string;
  offeredCardNumber: number;

  requestedCardId?: string;
  requestedCardIsHolo?: boolean;
  requestedCardTitle?: string;
  requestedCardRarity?: string;
  requestedCardImageUrl?: string;
  requestedCardNumber?: number;

  note?: string;
}

export interface FriendDuplicateEntry {
  count: number;
  countHolo: number;
  tradableNormal: number;
  tradableHolo: number;
}

export interface FriendBinderData {
  friendCode: string;
  duplicates: Record<string, FriendDuplicateEntry>;
  ownedCards: Record<string, { count: number; countHolo: number }>;
}
