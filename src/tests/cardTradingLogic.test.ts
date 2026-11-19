import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTradeApi,
  respondTradeApi,
  getAppliedTradeIds,
  applyTradeToLocalCollection,
} from '../services/tradesService';
import { getCardCollection, saveCardCollection } from '../services/cardStorageService';
import type { CardTradeOffer } from '../types/trades';

describe('🃏 Card Trading Logic — Propositions & Échanges de Cartes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('crée une offre d’échange locale avec identifiant et statut pending', async () => {
    const payload: any = {
      fromFriendCode: 'FC_USER_1',
      fromUsername: 'Joueur Un',
      toFriendCode: 'FC_USER_2',
      toUsername: 'Joueur Deux',
      offeredCardId: 'celeste',
      offeredCardIsHolo: false,
      offeredCardTitle: 'Celeste',
      offeredCardRarity: 'rare',
      offeredCardImageUrl: '/celeste.jpg',
      offeredCardNumber: 12,
      requestedCardId: 'hollow-knight',
      requestedCardIsHolo: false,
      requestedCardTitle: 'Hollow Knight',
      requestedCardRarity: 'legendary',
      requestedCardNumber: 1,
    };

    const res = await createTradeApi(payload);
    expect(res.success).toBe(true);
    expect(res.trade).toBeDefined();
    expect(res.trade?.status).toBe('pending');
    expect(res.trade?.offeredCardId).toBe('celeste');
    expect(res.trade?.requestedCardId).toBe('hollow-knight');
  });

  it('permet d’annuler ou refuser une offre en attente', async () => {
    const payload: any = {
      fromFriendCode: 'FC_USER_1',
      fromUsername: 'Joueur Un',
      toFriendCode: 'FC_USER_2',
      toUsername: 'Joueur Deux',
      offeredCardId: 'celeste',
      offeredCardIsHolo: false,
      offeredCardTitle: 'Celeste',
      offeredCardRarity: 'rare',
      offeredCardImageUrl: '/celeste.jpg',
      offeredCardNumber: 12,
      requestedCardId: 'hollow-knight',
      requestedCardIsHolo: false,
      requestedCardTitle: 'Hollow Knight',
      requestedCardRarity: 'legendary',
      requestedCardNumber: 1,
    };

    const created = await createTradeApi(payload);
    expect(created.trade).toBeDefined();
    const tradeId = created.trade!.id;

    const resDecline = await respondTradeApi({
      tradeId,
      response: 'decline',
      friendCode: 'FC_USER_2',
    });

    expect(resDecline.success).toBe(true);
    expect(resDecline.trade?.status).toBe('declined');
  });

  it('applique correctement les cartes échangées dans la collection locale sans perte', () => {
    // Initialisation de la collection du destinataire : possède Hollow Knight x2
    saveCardCollection({
      'hollow-knight': { count: 2, countHolo: 0, firstObtainedAt: '2026-01-01' },
    });

    const trade: CardTradeOffer = {
      id: 'trade_sample_123',
      fromFriendCode: 'FC_SENDER',
      fromUsername: 'Ami Expéditeur',
      toFriendCode: 'FC_ME',
      toUsername: 'Moi-même',
      offeredCardId: 'celeste',
      offeredCardIsHolo: false,
      offeredCardTitle: 'Celeste',
      offeredCardRarity: 'rare',
      offeredCardImageUrl: '/celeste.jpg',
      offeredCardNumber: 12,
      requestedCardId: 'hollow-knight',
      requestedCardIsHolo: false,
      requestedCardTitle: 'Hollow Knight',
      requestedCardRarity: 'legendary',
      requestedCardNumber: 1,
      status: 'accepted',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + 86400,
      acceptedAt: Math.floor(Date.now() / 1000),
    };

    // Le destinataire (FC_ME) applique l'échange accepté
    applyTradeToLocalCollection(trade, 'FC_ME');

    const updatedCol = getCardCollection();
    // Doit avoir reçu Celeste x1
    expect(updatedCol['celeste']?.count).toBe(1);
    // Doit avoir donné Hollow Knight x1 (reste 1)
    expect(updatedCol['hollow-knight']?.count).toBe(1);

    // L'échange doit être enregistré dans les transactions appliquées (idempotence)
    const applied = getAppliedTradeIds();
    expect(applied.has('trade_sample_123')).toBe(true);

    // Une seconde exécution ne doit pas réappliquer l'échange (protection double-dépense)
    applyTradeToLocalCollection(trade, 'FC_ME');
    const idempotentCol = getCardCollection();
    expect(idempotentCol['celeste']?.count).toBe(1);
    expect(idempotentCol['hollow-knight']?.count).toBe(1);
  });
});
