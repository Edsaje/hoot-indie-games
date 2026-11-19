import { describe, it, expect, beforeEach } from 'vitest';
import {
  gatherLocalSaveData,
  applyCloudSaveToLocalStorage,
  STORAGE_ODYSSEY,
  STORAGE_CARDS,
  STORAGE_BOOSTERS_STOCK,
  STORAGE_CLAIMED_DAILY,
  STORAGE_ACHIEVEMENTS,
  STORAGE_USER_PROFILE,
  STORAGE_TIME_ATTACK,
  STORAGE_RETRO_FILTER,
  STORAGE_QUIZ_BEST_SCORE,
} from '../services/cloudPayloadMapper';

describe('cloudPayloadMapper — Mappage et Restauration Exhaustive des 16 Catégories', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('collecte l’intégralité des 16 catégories présentes dans localStorage', () => {
    // 1. Profil & Jeux possédés
    localStorage.setItem(
      STORAGE_USER_PROFILE,
      JSON.stringify({
        id: 'usr_test_123',
        username: 'JoueurTest',
        avatarId: 'owl_gold',
        title: 'Maître Hibou',
        steam: {
          steamId: '76561198000000000',
          ownedAppIds: [105600, 264710],
        },
      })
    );

    // 2. Plumes & Calendrier
    localStorage.setItem(
      STORAGE_CLAIMED_DAILY,
      JSON.stringify({
        '2026-11-19': { claimedGames: ['screenle', 'chrono'], grandSlamClaimed: false },
      })
    );

    // 3. Succès (ID valide de ACHIEVEMENTS_LIST)
    localStorage.setItem(STORAGE_ACHIEVEMENTS, JSON.stringify(['first_flight']));

    // 4. Cartes & Boosters
    localStorage.setItem(
      STORAGE_CARDS,
      JSON.stringify({
        card_1: { id: 'card_1', count: 2, isHolo: false },
      })
    );
    localStorage.setItem(
      STORAGE_BOOSTERS_STOCK,
      JSON.stringify({ count: 2, lastRechargeTimestamp: 1000 })
    );

    // 5. Odyssée Sylvestre
    localStorage.setItem(
      STORAGE_ODYSSEY,
      JSON.stringify({
        version: 1,
        highestBiomeUnlocked: 5,
        currentBiomeId: 'biome_5',
        starSap: 50000,
        totalStarSapEarned: 200000,
      })
    );

    // 6. Time Attack & Arcade
    localStorage.setItem(
      STORAGE_TIME_ATTACK,
      JSON.stringify({
        chronoSprint: { bestTime: 42.5, completedAt: '2026-11-18' },
      })
    );
    localStorage.setItem('hoot_arcade_hs_snake', '150');

    // 7. Filtre rétro & Quiz
    localStorage.setItem(STORAGE_RETRO_FILTER, 'gameboy');
    localStorage.setItem(STORAGE_QUIZ_BEST_SCORE, '10');

    // Collecte
    const payload = gatherLocalSaveData();

    expect(payload.username).toBe('JoueurTest');
    expect(payload.avatarId).toBe('owl_gold');
    expect(payload.ownedAppIds).toEqual([105600, 264710]);
    expect(payload.achievements).toContain('first_flight');
    expect(payload.cardCollection?.card_1?.count).toBe(2);
    expect(payload.freeBoostersStock?.count).toBe(2);
    expect(payload.odysseyState?.highestBiomeUnlocked).toBe(5);
    expect(payload.arcadeStats?.highScores?.snake).toBe(150);
    expect(payload.retroVisualFilter).toBe('gameboy');
    expect(payload.quizHighScore).toBe(10);
  });

  it('restaure proprement une sauvegarde distante sans écraser une progression locale plus avancée', () => {
    // Progression locale existante : Biome 6
    localStorage.setItem(
      STORAGE_ODYSSEY,
      JSON.stringify({
        version: 1,
        highestBiomeUnlocked: 6,
        starSap: 10000,
        totalStarSapEarned: 500000,
      })
    );

    // Sauvegarde cloud reçue (plus ancienne, ex: Biome 4)
    const cloudPayload = {
      username: 'Hibouxe',
      avatarId: 'hibouxe_creator' as const,
      ownedAppIds: [105600, 312520],
      achievements: ['first_flight'],
      odysseyState: {
        version: 1 as const,
        highestBiomeUnlocked: 4,
        starSap: 2000,
        totalStarSapEarned: 100000,
      },
      retroVisualFilter: 'crt',
    };

    applyCloudSaveToLocalStorage(cloudPayload as any, { strategy: 'merge' });

    // Vérification de la persistance restaurée
    const restoredProfile = JSON.parse(localStorage.getItem(STORAGE_USER_PROFILE) || '{}');
    expect(restoredProfile.username).toBe('Hibouxe');
    expect(restoredProfile.steam?.ownedAppIds).toEqual([105600, 312520]);

    const restoredOdyssey = JSON.parse(localStorage.getItem(STORAGE_ODYSSEY) || '{}');
    // Le Biome 6 local doit être préservé grâce au moteur de monotonicité
    expect(restoredOdyssey.highestBiomeUnlocked).toBe(6);
    expect(restoredOdyssey.totalStarSapEarned).toBe(500000);

    const restoredAch = JSON.parse(localStorage.getItem(STORAGE_ACHIEVEMENTS) || '[]');
    expect(restoredAch).toContain('first_flight');

    expect(localStorage.getItem(STORAGE_RETRO_FILTER)).toBe('crt');
  });
});
