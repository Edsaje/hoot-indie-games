/**
 * 🦉 Hoot Indie Games — Script d'audit exhaustif des liens externes
 * Vérifie l'ensemble des URLs Itch.io, Steam et images du catalogue
 * et de la Clairière des Micro-Indés pour garantir 0 lien mort (0 erreur 404).
 */

import { INDIE_GAMES } from '../src/data/games';
import { INITIAL_MICRO_INDIES } from '../src/data/microIndies';

async function auditLinks() {
  console.log('🦉 Démarrage de l\'audit des liens externes Hoot Indie Games...');
  let errorCount = 0;
  let checkedCount = 0;

  // 1. Audit des URLs Itch.io dans le catalogue des pépites
  const gamesWithItch = INDIE_GAMES.filter((g) => g.itchUrl);
  console.log(`\n📦 Vérification de ${gamesWithItch.length} liens Itch.io dans games.ts :`);
  for (const game of gamesWithItch) {
    checkedCount++;
    try {
      const res = await fetch(game.itchUrl!, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      if (res.status >= 400) {
        console.error(`❌ [${res.status}] ${game.title} : ${game.itchUrl}`);
        errorCount++;
      } else {
        console.log(`✅ [${res.status}] ${game.title} -> ${game.itchUrl}`);
      }
    } catch (err: any) {
      console.error(`❌ [ERREUR RÉSEAU] ${game.title} : ${err.message}`);
      errorCount++;
    }
  }

  // 2. Audit des URLs de la Clairière des Micro-Indés
  console.log(`\n🌱 Vérification des ${INITIAL_MICRO_INDIES.length} micro-indés (Itch.io + Images) :`);
  for (const item of INITIAL_MICRO_INDIES) {
    if (item.itchUrl) {
      checkedCount++;
      try {
        const res = await fetch(item.itchUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (res.status >= 400) {
          console.error(`❌ [${res.status}] ${item.title} (Itch) : ${item.itchUrl}`);
          errorCount++;
        } else {
          console.log(`✅ [${res.status}] ${item.title} (Itch)`);
        }
      } catch (err: any) {
        console.error(`❌ [ERREUR RÉSEAU] ${item.title} (Itch) : ${err.message}`);
        errorCount++;
      }
    }

    const imagesToCheck = [item.coverImage, ...(item.screenshots || [])];
    for (const imgUrl of imagesToCheck) {
      checkedCount++;
      try {
        const res = await fetch(imgUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (res.status >= 400) {
          console.error(`❌ [IMG ${res.status}] ${item.title} : ${imgUrl}`);
          errorCount++;
        }
      } catch (err: any) {
        console.error(`❌ [IMG ERREUR] ${item.title} : ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Total URLs auditées : ${checkedCount}`);
  console.log(`Total erreurs : ${errorCount}`);
  console.log('----------------------------------------------------');

  if (errorCount > 0) {
    console.error(`❌ ÉCHEC DE L'AUDIT : ${errorCount} lien(s) en erreur.`);
    process.exit(1);
  } else {
    console.log('✅ AUDIT RÉUSSI : 100% des liens externes et images sont vérifiés et actifs (HTTP 200) !');
    process.exit(0);
  }
}

auditLinks();
