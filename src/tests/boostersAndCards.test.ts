import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadFreeBoostersStock,
  saveFreeBoostersStock,
  getFreeBoostersInfo,
  canClaimDailyBooster,
  claimDailyBooster,
  disenchantCard,
  MAX_FREE_BOOSTERS,
  BOOSTER_RECHARGE_MS,
} from '../services/cardCollectionService';
import { getCardCollection, saveCardCollection } from '../services/cardStorageService';
import { DISENCHANT_VALUES } from '../types/cards';

describe('boostersAndCards — Mécanique des Boosters, Tirages et Classeur Indiedex', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gère correctement le stock de boosters gratuits (max 2) et la recharge de 12h', () => {
    const now = 1000000000000;

    // État initial vide : stock à 0, recharge démarrée
    saveFreeBoostersStock({ count: 0, lastRechargeTimestamp: now });

    let info = getFreeBoostersInfo(now);
    expect(info.count).toBe(0);
    expect(info.isFull).toBe(false);
    expect(info.canClaim).toBe(false);
    expect(info.msUntilNext).toBe(BOOSTER_RECHARGE_MS);

    // Après 6h (50% de progression)
    info = getFreeBoostersInfo(now + BOOSTER_RECHARGE_MS / 2);
    expect(info.count).toBe(0);
    expect(info.progressPercent).toBe(50);
    expect(info.canClaim).toBe(false);

    // Après 12h (+1 booster régénéré)
    info = getFreeBoostersInfo(now + BOOSTER_RECHARGE_MS);
    expect(info.count).toBe(1);
    expect(info.canClaim).toBe(true);

    // Après 24h (+2 boosters : stock plein plafonné à MAX_FREE_BOOSTERS)
    info = getFreeBoostersInfo(now + BOOSTER_RECHARGE_MS * 2.5);
    expect(info.count).toBe(MAX_FREE_BOOSTERS);
    expect(info.isFull).toBe(true);
    expect(info.canClaim).toBe(true);
  });

  it('ouvre un booster en générant exactement 5 cartes et les intègre au classeur', () => {
    saveFreeBoostersStock({ count: 1, lastRechargeTimestamp: Date.now() });

    expect(canClaimDailyBooster()).toBe(true);

    const result = claimDailyBooster();
    expect(result).not.toBeNull();
    expect(result?.cards).toHaveLength(5);

    // Chaque carte a un id, un titre, une rareté
    result?.cards.forEach((item) => {
      expect(item.card.id).toBeDefined();
      expect(item.card.title).toBeDefined();
      expect(['common', 'rare', 'epic', 'legendary', 'secret']).toContain(item.card.rarity);
    });

    // Le classeur local doit contenir ces cartes
    const collection = getCardCollection();
    expect(Object.keys(collection).length).toBeGreaterThanOrEqual(1);

    // Le stock de booster a été décrémenté
    const stock = loadFreeBoostersStock();
    expect(stock.count).toBe(0);
  });

  it('désenchante une carte en créditant le bon montant de Plumes d’Or selon sa rareté', () => {
    const testCard = {
      id: 'hollow-knight',
      title: 'Hollow Knight',
      rarity: 'epic' as const,
      isFoil: false,
      year: 2017,
      imageUrl: '',
    };

    // Ajout de 2 exemplaires dans le classeur
    saveCardCollection({
      'hollow-knight': {
        card: testCard,
        count: 2,
        isHolo: false,
        firstObtainedAt: new Date().toISOString(),
      },
    });

    const disenchantResult = disenchantCard('hollow-knight', false);
    expect(disenchantResult.success).toBe(true);
    // Hollow Knight est légendaire dans cardsData = 250 plumes
    expect(disenchantResult.feathersGained).toBe(DISENCHANT_VALUES.legendary.normal);

    // Il ne reste qu'un exemplaire dans le classeur
    const updatedCollection = getCardCollection();
    expect(updatedCollection['hollow-knight']?.count).toBe(1);
  });
});
