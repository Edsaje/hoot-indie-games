import { describe, it, expect } from 'vitest';
import { getOrCreateFriendCode } from '../services/friendsService';
import type { UserProfile } from '../types';

describe('friendsLogic — Codes Amis et Amis Souverains', () => {
  it('attribue le code souverain HOOT-HIBOU pour le créateur du site', () => {
    const creatorBySteam: UserProfile = {
      username: 'Quelquun',
      steam: { steamId: '76561198035270542' },
    } as any;
    expect(getOrCreateFriendCode(creatorBySteam)).toBe('HOOT-HIBOU');

    const creatorByName: UserProfile = {
      username: 'Hibouxe',
    } as any;
    expect(getOrCreateFriendCode(creatorByName)).toBe('HOOT-HIBOU');

    const creatorById: UserProfile = {
      id: 'admin_hibouxe',
      username: 'Mystere',
    } as any;
    expect(getOrCreateFriendCode(creatorById)).toBe('HOOT-HIBOU');
  });

  it('attribue de manière déterministe le code HOOT-MOIN pour Moineau', () => {
    const moineauProfile: UserProfile = {
      username: 'Moineau',
    } as any;
    expect(getOrCreateFriendCode(moineauProfile)).toBe('HOOT-MOIN');

    const moineauLowercase: UserProfile = {
      username: 'moineau',
    } as any;
    expect(getOrCreateFriendCode(moineauLowercase)).toBe('HOOT-MOIN');
  });

  it('préserve un code ami valide déjà existant dans le profil', () => {
    const userWithCode: UserProfile = {
      username: 'RandomPlayer',
      friendCode: 'HOOT-XYZ9',
    } as any;
    expect(getOrCreateFriendCode(userWithCode)).toBe('HOOT-XYZ9');
  });

  it('génère un format canonique HOOT-XXXX pour un nouveau joueur', () => {
    const newPlayer: UserProfile = {
      username: 'NouveauJoueur',
    } as any;
    const code = getOrCreateFriendCode(newPlayer);
    expect(code).toMatch(/^HOOT-[2-9A-HJ-NP-Z]{4}$/);
  });
});
