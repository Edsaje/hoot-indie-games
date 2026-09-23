import { INDIE_GAMES } from '../src/data/games';
import { validateSingleGame } from './auditRules';

/**
 * Script de vérification et d'audit de la base de données de jeux (Règle 0 Hallucination)
 * Vérifie l'intégrité de tous les champs des jeux certifiés selon les règles partagées.
 */
async function auditDatabase() {
  console.log(`🦉 Démarrage de l'audit Hoot Indie Games : ${INDIE_GAMES.length} jeux à auditer...\n`);

  let errors = 0;
  const warnings: string[] = [];
  const normalizedGenres = new Map<string, string>();

  for (const game of INDIE_GAMES) {
    const audit = validateSingleGame(game, normalizedGenres);

    if (!audit.valid) {
      for (const err of audit.errors) {
        console.error(`❌ ${err}`);
        errors++;
      }
    }

    for (const warn of audit.warnings) {
      warnings.push(warn);
    }
  }

  console.log('----------------------------------------------------');
  if (warnings.length > 0) {
    console.log(`Avertissements (${warnings.length}) :`);
    warnings.forEach((w) => console.log(w));
    console.log('----------------------------------------------------');
  }

  if (errors === 0) {
    console.log(`✅ AUDIT RÉUSSI : 100% des ${INDIE_GAMES.length} jeux sont vérifiés, canoniques et sans incohérence !`);
    console.log(`✨ Règle 0 Hallucination respectée.`);
  } else {
    console.error(`❌ AUDIT ÉCHOUÉ : ${errors} erreurs détectées.`);
    process.exit(1);
  }
}

auditDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
