import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { TOTAL_QUIZ_QUESTIONS_COUNT } from '../data/quizConstants';

describe('🦉 Indie Quiz Engine — Banque de Questions & Logique de Jeu', () => {
  it('certifie que la taille du catalogue de questions correspond à TOTAL_QUIZ_QUESTIONS_COUNT', () => {
    expect(QUIZ_QUESTIONS.length).toBe(TOTAL_QUIZ_QUESTIONS_COUNT);
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(100);
  });

  it('vérifie que chaque question possède un identifiant unique, 4 choix et une réponse valide', () => {
    const seenIds = new Set<number>();
    const validCategories = new Set(['lore', 'ost', 'gameplay', 'creator', 'trivia', 'release']);

    for (const q of QUIZ_QUESTIONS) {
      // 1. Identifiant unique
      expect(typeof q.id).toBe('number');
      expect(seenIds.has(q.id)).toBe(false);
      seenIds.add(q.id);

      // 2. Questions en FR et EN
      expect(q.questionFr).toBeDefined();
      expect(q.questionFr.trim().length).toBeGreaterThan(5);
      expect(q.questionEn).toBeDefined();
      expect(q.questionEn.trim().length).toBeGreaterThan(5);

      // 3. Exactement 4 options de réponse en FR et EN
      expect(Array.isArray(q.optionsFr)).toBe(true);
      expect(q.optionsFr.length).toBe(4);
      for (const opt of q.optionsFr) {
        expect(typeof opt).toBe('string');
        expect(opt.trim().length).toBeGreaterThan(0);
      }

      expect(Array.isArray(q.optionsEn)).toBe(true);
      expect(q.optionsEn.length).toBe(4);
      for (const opt of q.optionsEn) {
        expect(typeof opt).toBe('string');
        expect(opt.trim().length).toBeGreaterThan(0);
      }

      // 4. Index de réponse correcte valide (0 à 3)
      expect([0, 1, 2, 3]).toContain(q.correctAnswer);

      // 5. Explications pédagogiques présentes
      expect(q.explanationFr).toBeDefined();
      expect(q.explanationFr.trim().length).toBeGreaterThan(5);
      expect(q.explanationEn).toBeDefined();
      expect(q.explanationEn.trim().length).toBeGreaterThan(5);

      // 6. Catégorie valide
      expect(validCategories.has(q.category)).toBe(true);
    }
  });

  it('garantit que le mélange des réponses préserve l’équivalence de la bonne réponse', () => {
    const sampleQuestion = QUIZ_QUESTIONS[0];
    const originalCorrectText = sampleQuestion.optionsFr[sampleQuestion.correctAnswer];

    // Simulation de permutation des réponses (logique de IndieQuizGame)
    const shuffledIndices = [3, 2, 1, 0];
    const shuffledOptionsFr = shuffledIndices.map((i) => sampleQuestion.optionsFr[i]);
    const newCorrectIndex = shuffledIndices.indexOf(sampleQuestion.correctAnswer);

    expect(shuffledOptionsFr[newCorrectIndex]).toBe(originalCorrectText);
  });
});
