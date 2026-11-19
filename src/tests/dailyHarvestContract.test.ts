import { describe, it, expect } from 'vitest';
import { INDIE_GAMES } from '../data/games';
import { UPCOMING_INDIE_GAMES } from '../data/upcomingGames';
import { buildCardsFromGames } from '../data/cardsData';
import { BANNED_APP_IDS } from '../../scripts/auditRules';

describe('🦉 Daily Harvest Contract — Intégrité des Données & Zéro Hallucination', () => {
  it('certifie que tous les jeux du sanctuaire respectent strictement le contrat Game', () => {
    expect(INDIE_GAMES.length).toBeGreaterThan(100);

    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    for (const game of INDIE_GAMES) {
      // 1. Identifiant unique et non vide
      expect(game.id).toBeDefined();
      expect(typeof game.id).toBe('string');
      expect(game.id.trim().length).toBeGreaterThan(0);
      expect(seenIds.has(game.id)).toBe(false);
      seenIds.add(game.id);

      // 2. Titre unique et non vide
      expect(game.title).toBeDefined();
      expect(typeof game.title).toBe('string');
      expect(game.title.trim().length).toBeGreaterThan(0);
      expect(seenTitles.has(game.title.toLowerCase())).toBe(false);
      seenTitles.add(game.title.toLowerCase());

      // 3. Année de sortie réaliste
      expect(game.releaseYear).toBeGreaterThanOrEqual(1985);
      expect(game.releaseYear).toBeLessThanOrEqual(2030);

      // 4. Genres renseignés
      expect(Array.isArray(game.genre)).toBe(true);
      expect(game.genre.length).toBeGreaterThan(0);

      // 5. Studio développeur valide
      expect(typeof game.developer).toBe('string');
      expect(game.developer.trim().length).toBeGreaterThan(0);

      // 6. Captures d'écran présentes pour Screenle
      expect(Array.isArray(game.screenshots)).toBe(true);
      expect(game.screenshots.length).toBeGreaterThanOrEqual(1);

      // 7. Localisation de base (FR et EN)
      expect(game.artStyle?.fr).toBeDefined();
      expect(game.artStyle?.en).toBeDefined();
      expect(game.camera?.fr).toBeDefined();
      expect(game.camera?.en).toBeDefined();
      expect(game.hints?.tagline?.fr).toBeDefined();
      expect(game.hints?.tagline?.en).toBeDefined();

      // 8. Aucun jeu banni ou adulte (Protection Sanctuaire)
      if (game.steamAppId) {
        expect(BANNED_APP_IDS.has(game.steamAppId)).toBe(false);
      }
    }
  });

  it('garantit une parité 1:1 stricte entre les jeux jouables et les cartes du Sanctuaire', () => {
    const cards = buildCardsFromGames(INDIE_GAMES);
    expect(cards.length).toBe(INDIE_GAMES.length);

    const validRarities = new Set(['common', 'rare', 'epic', 'legendary']);
    for (const card of cards) {
      expect(card.id).toBeDefined();
      expect(card.title).toBeDefined();
      expect(validRarities.has(card.rarity)).toBe(true);
      expect(card.cardNumber).toBeGreaterThan(0);
      expect(card.cardNumber).toBeLessThanOrEqual(cards.length);
    }
  });

  it('vérifie que la liste des jeux à venir (Radar) est cohérente et sans doublons', () => {
    expect(UPCOMING_INDIE_GAMES.length).toBeGreaterThan(0);

    const upcomingIds = new Set<string>();
    for (const game of UPCOMING_INDIE_GAMES) {
      expect(game.id).toBeDefined();
      expect(upcomingIds.has(game.id)).toBe(false);
      upcomingIds.add(game.id);

      expect(game.title).toBeDefined();
      expect(game.title.trim().length).toBeGreaterThan(0);
      expect(game.developer).toBeDefined();
    }
  });
});
