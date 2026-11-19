import { describe, it, expect } from 'vitest';
import {
  generateRoomCode,
  generatePeerId,
  getRandomBot,
  pickRandomGame,
  getBotDecision,
  VERSUS_DISCIPLINES,
  getDisciplineMeta,
} from '../components/versus/versusConstants';
import { INDIE_GAMES } from '../data/games';

describe('versusLogic — Moteur & Paramètres de Duels 1v1', () => {
  it('génère un code de salon au format HOOT-XXX valide', () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^HOOT-\d{3,4}$/);
  });

  it('génère un identifiant de pair aléatoire unique', () => {
    const peer1 = generatePeerId();
    const peer2 = generatePeerId();
    expect(peer1).toMatch(/^peer_[a-z0-9]+$/);
    expect(peer2).toMatch(/^peer_[a-z0-9]+$/);
    expect(peer1).not.toBe(peer2);
  });

  it('génère un bot d\'entraînement avec un ELO cohérent avec celui du joueur', () => {
    const playerElo = 1200;
    const bot = getRandomBot(playerElo);

    expect(bot.id).toBeDefined();
    expect(bot.name).toBeTruthy();
    expect(bot.avatarId).toBeTruthy();
    expect(bot.isBot).toBe(true);
    expect(bot.score).toBe(0);
    // ELO du bot doit être au minimum 800 et proche du joueur
    expect(bot.elo).toBeGreaterThanOrEqual(800);
    expect(Math.abs(bot.elo - playerElo)).toBeLessThanOrEqual(50);
  });

  it('calibre les décisions du bot IA avec des bornes de délai réalistes', () => {
    const decision = getBotDecision();
    expect(typeof decision.willGuess).toBe('boolean');
    // Délai entre 8s et 16s (8000ms - 16000ms)
    expect(decision.delayMs).toBeGreaterThanOrEqual(8000);
    expect(decision.delayMs).toBeLessThanOrEqual(16000);
  });

  it('sélectionne un jeu aléatoire dans le pool avec repli défensif', () => {
    const selected = pickRandomGame(INDIE_GAMES);
    expect(selected).toBeDefined();
    expect(selected.title).toBeTruthy();

    // Pool vide -> repli sur INDIE_GAMES[0]
    const fallback = pickRandomGame([]);
    expect(fallback).toBe(INDIE_GAMES[0]);
  });

  it('définit 9 disciplines de duel exhaustives avec métadonnées valides', () => {
    expect(VERSUS_DISCIPLINES.length).toBe(9);
    const expectedIds = [
      'all',
      'screenle',
      'pixel',
      'review',
      'blindtest',
      'chrono',
      'profille',
      'indledle',
      'linkle',
    ];
    expectedIds.forEach((id) => {
      const found = VERSUS_DISCIPLINES.find((d) => d.id === id);
      expect(found, `Discipline ${id} manquante`).toBeDefined();
      expect(found?.label).toBeTruthy();
      expect(found?.desc).toBeTruthy();
    });
  });

  it('résout les métadonnées de discipline avec repli sur la première en cas d\'inconnu', () => {
    const meta = getDisciplineMeta('screenle');
    expect(meta.id).toBe('screenle');
    expect(meta.label).toBe("Capture d'écran");

    // Valeur inconnue / castée -> repli
    const unknownMeta = getDisciplineMeta('unknown_disc' as any);
    expect(unknownMeta.id).toBe('all');
  });
});
