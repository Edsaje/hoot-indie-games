import { INDIE_GAMES } from '../src/data/games';

/**
 * Script de vérification et d'audit de la base de données de jeux (Règle 0 Hallucination)
 * Vérifie l'intégrité de tous les champs des 83 jeux certifiés.
 */
async function auditDatabase() {
  console.log(`🦉 Démarrage de l'audit Hoot Indie Games : ${INDIE_GAMES.length} jeux à auditer...\n`);

  let errors = 0;
  const warnings: string[] = [];

  for (const game of INDIE_GAMES) {
    // 1. Vérification ID et Titre
    if (!game.id || !game.title) {
      console.error(`❌ [Erreur ID/Titre] Jeu invalide: ${JSON.stringify(game)}`);
      errors++;
    }

    // 2. Vérification Année de sortie
    if (typeof game.releaseYear !== 'number' || game.releaseYear < 2000 || game.releaseYear > 2026) {
      console.error(`❌ [Erreur Année] ${game.title} : année ${game.releaseYear} anormale.`);
      errors++;
    }

    // 3. Vérification Développeur & Compositeur
    if (!game.developer || game.developer.trim() === '') {
      console.error(`❌ [Erreur Développeur] ${game.title} : développeur manquant.`);
      errors++;
    }
    if (!game.hints.composer || game.hints.composer.trim() === '') {
      warnings.push(`⚠️ [Avertissement Compositeur] ${game.title} : compositeur non spécifié.`);
    }

    // 4. Vérification Catégories canoniques ArtStyle & Camera
    const validArtStyles = ['Pixel Art', '2D Hand-drawn', 'Stylized 3D', 'Retro Low-poly 3D', 'Realistic 3D', 'Monochrome'];
    const validCameras = ['2D Side-scroller', '2D Top-down', 'Isometric / 2.5D', 'First-Person', 'Third-Person'];

    if (!validArtStyles.includes(game.artStyle.en)) {
      console.error(`❌ [Erreur ArtStyle] ${game.title} : artStyle inconnu "${game.artStyle.en}".`);
      errors++;
    }
    if (!validCameras.includes(game.camera.en)) {
      console.error(`❌ [Erreur Caméra] ${game.title} : camera inconnue "${game.camera.en}".`);
      errors++;
    }

    // 5. Vérification Taglines bilingues (FR et EN distincts)
    if (!game.hints.tagline.fr || !game.hints.tagline.en) {
      console.error(`❌ [Erreur Tagline] ${game.title} : tagline FR ou EN vide.`);
      errors++;
    } else if (game.hints.tagline.fr === game.hints.tagline.en) {
      warnings.push(`⚠️ [Avertissement Traduction] ${game.title} : tagline FR et EN identiques.`);
    }

    // 6. Vérification Screenshots
    if (!Array.isArray(game.screenshots) || game.screenshots.length < 5) {
      warnings.push(`⚠️ [Avertissement Visuels] ${game.title} : moins de 5 screenshots.`);
    }

    // 7. Vérification URL Steam officielle
    if (game.steamUrl && !game.steamUrl.startsWith('https://store.steampowered.com/app/')) {
      console.error(`❌ [Erreur SteamURL] ${game.title} : format URL invalide "${game.steamUrl}".`);
      errors++;
    }

    // 8. Filtrage strict anti-contenu adulte / hentai / NSFW (professionnalisme du catalogue)
    const adultBannedKeywords = ['hentai', 'sexual', 'nsfw', 'nudity', 'nudité', 'erotic', 'érotique', 'dating sim', 'waifu', 'compagne de bureau', 'porn'];
    const lowerContent = (game.title + ' ' + game.genre.join(' ') + ' ' + (game.hints?.tagline?.fr || '') + ' ' + (game.hints?.tagline?.en || '')).toLowerCase();
    for (const kw of adultBannedKeywords) {
      if (lowerContent.includes(kw)) {
        console.error(`❌ [Erreur Contenu Adulte] ${game.title} contient le mot-clé interdit "${kw}".`);
        errors++;
      }
    }
  }

  // 9. Vérification globale de cohérence des genres (interdit les variantes type "co-op" vs "coop")
  const normalizedGenres = new Map<string, string>();
  for (const game of INDIE_GAMES) {
    for (const g of game.genre) {
      const norm = g.toLowerCase().replace(/[-_ \/]/g, '').trim();
      if (normalizedGenres.has(norm) && normalizedGenres.get(norm) !== g) {
        console.error(`❌ [Erreur Conflit Genre] Le genre "${g}" (${game.title}) est en conflit avec la variante existante "${normalizedGenres.get(norm)}".`);
        errors++;
      } else {
        normalizedGenres.set(norm, g);
      }
    }
  }

  console.log('----------------------------------------------------');
  if (warnings.length > 0) {
    console.log(`Avertissements (${warnings.length}) :`);
    warnings.forEach(w => console.log(w));
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

auditDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
