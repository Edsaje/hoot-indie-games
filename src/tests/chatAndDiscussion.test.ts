import { describe, it, expect } from 'vitest';
import {
  checkTextForPhishing,
  getCanonicalConvKey,
  CHAT_CHANNELS,
} from '../services/chatService';

describe('chatAndDiscussion — Tchat Communautaire, Sécurité & Messagerie Privée', () => {
  it('valide la liste des salons publics autorisés (Le Perchoir)', () => {
    const channelIds = CHAT_CHANNELS.map((c) => c.id);
    expect(channelIds).toContain('global');
    expect(channelIds).toContain('fr');
    expect(channelIds).toContain('en');
    expect(channelIds).toContain('feedback');
    expect(CHAT_CHANNELS.length).toBeGreaterThanOrEqual(5);

    // Chaque salon doit avoir un nom, icône et description
    CHAT_CHANNELS.forEach((channel) => {
      expect(channel.name).toBeTruthy();
      expect(channel.icon).toBeTruthy();
      expect(channel.description).toBeTruthy();
    });
  });

  it('détecte et bloque les tentatives de phishing, scams et liens frauduleux', () => {
    // Message normal de jeu
    const legitimate = checkTextForPhishing('Salut tout le monde ! Vous avez battu le boss du Biome 3 ?');
    expect(legitimate.isSuspicious).toBe(false);

    // Domaines frauduleux ou raccourcisseurs
    const scamDomain = checkTextForPhishing('Regarde ce super jeu sur http://steamgift-promo.xyz');
    expect(scamDomain.isSuspicious).toBe(true);
    expect(scamDomain.reason).toBe('suspicious_domain_or_shortener');

    const bitlyLink = checkTextForPhishing('Télécharge la démo ici bit.ly/free-games');
    expect(bitlyLink.isSuspicious).toBe(true);

    // Mots-clés de scam connus
    const nitroScam = checkTextForPhishing('Gagne ton code Nitro gratuit en cliquant ici');
    expect(nitroScam.isSuspicious).toBe(true);
    expect(nitroScam.reason).toBe('scam_keywords');

    // Le staff / créateur est exempté
    const staffMessage = checkTextForPhishing('Annonce officielle avec lien bit.ly/demo', true);
    expect(staffMessage.isSuspicious).toBe(false);
  });

  it('garantit une clé de conversation canonique identique peu importe l’ordre des interlocuteurs', () => {
    const key1 = getCanonicalConvKey('Hibouxe', 'Explorateur_42');
    const key2 = getCanonicalConvKey('Explorateur_42', 'Hibouxe');

    expect(key1).toBe(key2);
    expect(key1).toBe('explorateur42__hibouxe');

    // Insensible à la casse
    const keyCase = getCanonicalConvKey('HIBOUXE', 'explorateur_42');
    expect(keyCase).toBe(key1);
  });
});
