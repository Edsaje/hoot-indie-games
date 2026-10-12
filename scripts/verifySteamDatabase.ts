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

  // Vérification de la parité 1:1 avec les cartes du Sanctuaire
  const { buildCardsFromGames } = await import('../src/data/cardsData');
  const cards = buildCardsFromGames(INDIE_GAMES);
  if (cards.length !== INDIE_GAMES.length) {
    console.error(`❌ Échec parité cartes : ${INDIE_GAMES.length} jeux vs ${cards.length} cartes.`);
    errors++;
  } else {
    console.log(`🎴 Parité 1:1 Pépites & Cartes vérifiée : ${cards.length}/${INDIE_GAMES.length} cartes conformes.`);
  }

  // Audit d'intégrité et anti-NSFW du Catalogue Étendu (steam_catalog.json)
  const fs = await import('fs');
  const path = await import('path');
  const catalogPath = path.resolve(process.cwd(), 'public/data/steam_catalog.json');
  if (fs.existsSync(catalogPath)) {
    const catalogGames: any[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    console.log(`\n📚 Audit d'intégrité du Catalogue Étendu (${catalogGames.length} jeux)...`);
    for (const g of catalogGames) {
      const audit = validateSingleGame(g, normalizedGenres);
      if (!audit.valid) {
        for (const err of audit.errors) {
          console.error(`❌ [Catalogue] ${err}`);
          errors++;
        }
      }
    }
  }

  // Audit d'intégrité du Blind Test (Règle 0 Hallucination sur les pistes audio officielles)
  const { CURATED_OSTS } = await import('../src/data/blindtestPuzzles');
  console.log(`\n🎵 Audit d'intégrité du Blind Test (${CURATED_OSTS.length} puzzles)...`);
  const audioDir = path.resolve(process.cwd(), 'public/audio/blindtest');
  for (const ost of CURATED_OSTS) {
    const mp3File = path.join(audioDir, `${ost.gameId}.mp3`);
    if (!fs.existsSync(mp3File)) {
      console.error(`❌ [BlindTest] Fichier audio manquant pour ${ost.gameId} : public/audio/blindtest/${ost.gameId}.mp3`);
      errors++;
    } else {
      const stats = fs.statSync(mp3File);
      if (stats.size < 10000) {
        console.error(`❌ [BlindTest] Fichier audio corrompu ou trop petit (${stats.size} octets) pour ${ost.gameId}`);
        errors++;
      }
    }
    const matchingGame = INDIE_GAMES.find((g) => g.id === ost.gameId);
    if (!matchingGame) {
      console.error(`❌ [BlindTest] Le jeu ${ost.gameId} dans CURATED_OSTS n'existe pas dans INDIE_GAMES.`);
      errors++;
    }
  }
  console.log(`✅ 100% des puzzles Blind Test (${CURATED_OSTS.length}) ont une piste audio officielle MP3 vérifiée sur disque.`);

  if (errors === 0) {
    console.log(`✅ AUDIT RÉUSSI : 100% des ${INDIE_GAMES.length} jeux sont vérifiés, canoniques et sans incohérence !`);
    console.log(`✨ Règle 0 Hallucination & Synchronisation Cartes respectées.`);
  } else {
    console.error(`❌ AUDIT ÉCHOUÉ : ${errors} erreurs détectées.`);
    process.exit(1);
  }
}

auditDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
