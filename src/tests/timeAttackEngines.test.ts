import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTimeAttackStats,
  recordTimeAttackResult,
} from '../utils/timeAttackStorage';
import type { TimeAttackMode } from '../types/timeAttack';

describe('timeAttackEngines — Moteur de Sprints Chronométrés, Multiplicateurs de Combo & Records', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Persistance & Statistiques Globales (timeAttackStorage)', () => {
    it('renvoie les statistiques initiales par défaut pour les 8 modes de sprint', () => {
      const stats = getTimeAttackStats();
      const modes: TimeAttackMode[] = [
        'screenle',
        'indledle',
        'linkle',
        'profille',
        'chrono',
        'pixel',
        'review',
        'blindtest',
      ];

      expect(Object.keys(stats)).toHaveLength(8);

      modes.forEach((mode) => {
        expect(stats[mode]).toBeDefined();
        expect(stats[mode].highScore).toBe(0);
        expect(stats[mode].bestCombo).toBe(0);
        expect(stats[mode].gamesPlayed).toBe(0);
        expect(stats[mode].totalAnswered).toBe(0);
      });
    });

    it('enregistre un premier score, valide le statut isNewHighScore et met à jour les totaux', () => {
      const res = recordTimeAttackResult('screenle', 1500, 8, 10, 5);

      expect(res.mode).toBe('screenle');
      expect(res.score).toBe(1500);
      expect(res.isNewHighScore).toBe(true);
      expect(res.previousHighScore).toBe(0);

      const updated = getTimeAttackStats();
      expect(updated.screenle.highScore).toBe(1500);
      expect(updated.screenle.bestCombo).toBe(5);
      expect(updated.screenle.gamesPlayed).toBe(1);
      expect(updated.screenle.totalAnswered).toBe(8);
      expect(updated.screenle.lastPlayed).toBeDefined();

      // Les autres modes restent étanches et non pollués
      expect(updated.indledle.highScore).toBe(0);
      expect(updated.indledle.gamesPlayed).toBe(0);
    });

    it('préserve le record si une session ultérieure obtient un score inférieur', () => {
      // 1ère partie : Record à 2500 points
      recordTimeAttackResult('chrono', 2500, 12, 15, 7);

      // 2ème partie : Score plus faible (1200 points)
      const secondRound = recordTimeAttackResult('chrono', 1200, 6, 10, 4);

      expect(secondRound.isNewHighScore).toBe(false);
      expect(secondRound.previousHighScore).toBe(2500);

      const stats = getTimeAttackStats();
      expect(stats.chrono.highScore).toBe(2500); // Le meilleur score est préservé
      expect(stats.chrono.bestCombo).toBe(7); // Le meilleur combo est préservé
      expect(stats.chrono.gamesPlayed).toBe(2); // Le nombre de parties est incrémenté
      expect(stats.chrono.totalAnswered).toBe(18); // 12 + 6 réponses correctes cumulées
    });

    it('met à jour le meilleur combo même si le score total n’est pas battu', () => {
      recordTimeAttackResult('pixel', 3000, 15, 20, 5);

      // Session avec moins de points mais un combo record
      const res = recordTimeAttackResult('pixel', 2000, 10, 12, 9);

      expect(res.isNewHighScore).toBe(false);

      const stats = getTimeAttackStats();
      expect(stats.pixel.highScore).toBe(3000);
      expect(stats.pixel.bestCombo).toBe(9);
    });
  });

  describe('Formule Mathématique de Score & Calculateur de Combo', () => {
    function simulateSprintSession(
      answers: boolean[],
      basePointsPerAnswer = 100,
      initialTime = 60,
      bonusTime = 3,
      penaltyTime = 5
    ) {
      let score = 0;
      let combo = 1;
      let maxCombo = 1;
      let timeLeft = initialTime;
      let correctCount = 0;

      for (const isCorrect of answers) {
        if (timeLeft <= 0) break;

        if (isCorrect) {
          const earned = basePointsPerAnswer * combo;
          score += earned;
          correctCount++;

          const nextCombo = combo + 1;
          combo = nextCombo;
          if (nextCombo > maxCombo) maxCombo = nextCombo;

          timeLeft += bonusTime;
        } else {
          combo = 1;
          timeLeft = Math.max(0, timeLeft - penaltyTime);
        }
      }

      return { score, maxCombo, correctCount, finalTime: timeLeft };
    }

    it('calcule correctement la progression exponentielle du score lors d’une série parfaite', () => {
      // 5 bonnes réponses consécutives :
      // Rep 1 : 100 * 1 = 100  (combo devient 2)
      // Rep 2 : 100 * 2 = 200  (combo devient 3)
      // Rep 3 : 100 * 3 = 300  (combo devient 4)
      // Rep 4 : 100 * 4 = 400  (combo devient 5)
      // Rep 5 : 100 * 5 = 500  (combo devient 6)
      // Total attendu = 1500 points, maxCombo = 6, temps = 60 + 5*3 = 75s
      const sim = simulateSprintSession([true, true, true, true, true]);

      expect(sim.score).toBe(1500);
      expect(sim.maxCombo).toBe(6);
      expect(sim.correctCount).toBe(5);
      expect(sim.finalTime).toBe(75);
    });

    it('réinitialise le combo à 1 en cas d’erreur et applique la pénalité de temps sans passer sous 0', () => {
      // Rep 1 (Vrai) : 100 * 1 = 100 (combo 2, time +3)
      // Rep 2 (Faux) : combo -> 1, time -5
      // Rep 3 (Vrai) : 100 * 1 = 100 (combo 2, time +3)
      const sim = simulateSprintSession([true, false, true], 100, 60, 3, 5);

      expect(sim.score).toBe(200);
      expect(sim.maxCombo).toBe(2);
      expect(sim.correctCount).toBe(2);
      expect(sim.finalTime).toBe(61); // 60 + 3 - 5 + 3 = 61
    });

    it('interdit au temps restant de devenir négatif lors d’erreurs répétées', () => {
      // Temps initial 5s, 3 erreurs avec pénalité de 5s chacune
      const sim = simulateSprintSession([false, false, false], 100, 5, 3, 5);

      expect(sim.finalTime).toBe(0);
      expect(sim.score).toBe(0);
      expect(sim.correctCount).toBe(0);
    });
  });
});
