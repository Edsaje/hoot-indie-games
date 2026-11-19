import { describe, it, expect, beforeEach } from 'vitest';
import { getScheduledDailyGame, getScheduledDay } from '../utils/monthlyScheduler';
import {
  getEffectiveCurrentStreak,
  isDatePlayable,
  isDateFuture,
  isDatePastExpired,
  getTodayDateString,
  getYesterdayDateString,
  getDayDifference,
} from '../utils/streakManager';
import {
  sha256Sync,
  saveSecureJson,
  loadSecureJson,
  isScorePlausible,
  MAX_SCORE_BOUNDS,
} from '../utils/securityAntiCheat';
import { INDIE_GAMES } from '../data/games';

describe('🎮 Mini-Games Engines & Calendrier Quotidien', () => {
  describe('MonthlyScheduler & Déterminisme Quotidien', () => {
    it('génère un jeu déterministe et identique pour la même date', () => {
      const date = '2026-11-19';
      const day1 = getScheduledDay(date, INDIE_GAMES);
      const day2 = getScheduledDay(date, INDIE_GAMES);

      expect(day1.screenleGame.id).toBe(day2.screenleGame.id);
      expect(day1.indledleGame.id).toBe(day2.indledleGame.id);
      expect(day1.profilleGame.id).toBe(day2.profilleGame.id);
      expect(day1.dailyGem.id).toBe(day2.dailyGem.id);
    });

    it('attribue des jeux distincts entre les modes pour une même date (non-collision)', () => {
      const date = '2026-11-19';
      const screenle = getScheduledDailyGame(date, 'screenle', INDIE_GAMES);
      const indledle = getScheduledDailyGame(date, 'indledle', INDIE_GAMES);
      const profille = getScheduledDailyGame(date, 'profille', INDIE_GAMES);

      expect(screenle.id).toBeDefined();
      expect(indledle.id).toBeDefined();
      expect(profille.id).toBeDefined();
      // Au moins 2 jeux doivent être distincts pour varier l'expérience quotidienne
      const uniqueIds = new Set([screenle.id, indledle.id, profille.id]);
      expect(uniqueIds.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('StreakManager — Calcul des Séries & Fenêtres Jouables', () => {
    const today = '2026-11-19';
    const yesterday = '2026-11-18';
    const twoDaysAgo = '2026-11-17';
    const threeDaysAgo = '2026-11-16';

    it('maintient la série si le dernier gain date d’aujourd’hui ou d’hier', () => {
      expect(getEffectiveCurrentStreak(5, today, today)).toBe(5);
      expect(getEffectiveCurrentStreak(5, yesterday, today)).toBe(5);
    });

    it('maintient la série en sursis pour l’avant-veille tant que la veille peut être jouée', () => {
      expect(getEffectiveCurrentStreak(5, twoDaysAgo, today)).toBe(5);
    });

    it('rompt la série à 0 après plus de 2 jours sans gain', () => {
      expect(getEffectiveCurrentStreak(5, threeDaysAgo, today)).toBe(0);
    });

    it('détermine correctement les fenêtres de jeu (aujourd’hui et veille jouables)', () => {
      expect(isDatePlayable(today, today)).toBe(true);
      expect(isDatePlayable(yesterday, today)).toBe(true);
      expect(isDatePlayable(twoDaysAgo, today)).toBe(false);

      expect(isDateFuture('2026-11-20', today)).toBe(true);
      expect(isDateFuture(today, today)).toBe(false);

      expect(isDatePastExpired(twoDaysAgo, today)).toBe(true);
      expect(isDatePastExpired(yesterday, today)).toBe(false);
    });

    it('calcule la différence de jours correctement', () => {
      expect(getDayDifference('2026-11-19', '2026-11-19')).toBe(0);
      expect(getDayDifference('2026-11-19', '2026-11-18')).toBe(1);
      expect(getDayDifference('2026-11-19', '2026-11-15')).toBe(4);
    });
  });

  describe('SecurityAntiCheat & Signature des Données', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('hache une chaîne de façon déterministe avec sha256Sync', () => {
      const hash1 = sha256Sync('HootIndieGames_2026');
      const hash2 = sha256Sync('HootIndieGames_2026');
      const hash3 = sha256Sync('DifferentPayload');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1.length).toBe(64); // SHA-256 hex string
    });

    it('sauvegarde et recharge des données avec protection contre la corruption', () => {
      const payload = { isWon: true, score: 42, completedAt: '2026-11-19' };
      saveSecureJson('test_game_state', payload);

      const loaded = loadSecureJson<typeof payload>('test_game_state');
      expect(loaded).toEqual(payload);

      // Si le payload encodé est corrompu (base64 invalide)
      localStorage.setItem('test_game_state', '{"v":2,"d":"###invalid_base64###","s":"dummy_signature"}');
      const corrupted = loadSecureJson<typeof payload>('test_game_state');
      expect(corrupted).toBeNull();
    });

    it('valide les scores réalistes et rejette les valeurs aberrantes (anti-triche)', () => {
      // Score valide pour Snake (max 5000)
      expect(isScorePlausible('arcade', 'snake', 250)).toBe(true);
      expect(isScorePlausible('arcade', 'snake', 5000)).toBe(true);
      // Score aberrant pour Snake
      expect(isScorePlausible('arcade', 'snake', 999999)).toBe(false);

      // Score négatif ou NaN
      expect(isScorePlausible('arcade', 'snake', -10)).toBe(false);
      expect(isScorePlausible('arcade', 'snake', NaN)).toBe(false);
    });
  });
});
