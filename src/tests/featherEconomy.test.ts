import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatFeathers,
  getRenameCooldownInfo,
  getFeathersBalance,
  addBonusFeathers,
  spendFeathers,
  getFrameDefinition,
} from '../utils/featherEconomy';

describe('featherEconomy — Économie des Plumes d’Or, Cooldowns & Boutique', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('formate correctement les Plumes d’Or avec séparateurs ou symbole infini pour le créateur', () => {
    expect(formatFeathers(0)).toBe('0');
    expect(formatFeathers(1500)).toBe((1500).toLocaleString());
    expect(formatFeathers(1500, 'fr-FR')).toBe('1\u202f500');
    expect(formatFeathers(1500, 'en-US')).toBe('1,500');
    expect(formatFeathers(Infinity)).toBe('∞');
    expect(formatFeathers(99999999999)).toBe('∞');
  });

  it('calcule rigoureusement le cooldown de renommage de 14 jours', () => {
    // Cas 1 : jamais renommé -> libre
    const fresh = getRenameCooldownInfo(undefined, false);
    expect(fresh.canChange).toBe(true);
    expect(fresh.daysRemaining).toBe(0);

    // Cas 2 : admin officiel -> toujours libre
    const admin = getRenameCooldownInfo(new Date().toISOString(), true);
    expect(admin.canChange).toBe(true);

    // Cas 3 : renommé il y a 3 jours -> bloqué avec ~11 jours restants
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const locked = getRenameCooldownInfo(threeDaysAgo, false);
    expect(locked.canChange).toBe(false);
    expect(locked.daysRemaining).toBe(11);
    expect(locked.nextChangeDate).toBeTruthy();

    // Cas 4 : renommé il y a 15 jours -> cooldown expiré, libre
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const expired = getRenameCooldownInfo(fifteenDaysAgo, false);
    expect(expired.canChange).toBe(true);
  });

  it('gère correctement le solde de plumes, les gains bonus et les dépenses', () => {
    // Base de 50 plumes issues de succès
    let balance = getFeathersBalance(50, false);
    expect(balance).toBe(50);

    // Gain de 100 plumes bonus
    addBonusFeathers(100, 'Daily Reward');
    balance = getFeathersBalance(50, false);
    expect(balance).toBe(150);

    // Dépense autorisée
    const spentSuccess = spendFeathers(50, balance, 'Item Shop');
    expect(spentSuccess).toBe(true);
    balance = getFeathersBalance(50, false);
    expect(balance).toBe(100);

    // Dépense refusée si solde insuffisant
    const spentFail = spendFeathers(200, balance, 'Expensive Item');
    expect(spentFail).toBe(false);
    balance = getFeathersBalance(50, false);
    expect(balance).toBe(100); // Inchangé
  });

  it('renvoie les définitions de cadres cosmétiques avec leur fallback', () => {
    const emeraldFrame = getFrameDefinition('frame_dark_emerald');
    expect(emeraldFrame).toBeDefined();
    expect(emeraldFrame.id).toBe('frame_dark_emerald');
    expect(emeraldFrame.name).toContain('Émeraude');

    // Fallback si cadre inexistant
    const unknown = getFrameDefinition('non_existent_frame_id');
    expect(unknown.id).toBe('frame_wood');
  });
});
