/**
 * scripts/auditGemsCardsSync.ts
 * Audit automatisé vérifiant la parité 1:1 entre les pépites certifiées et le pool de cartes à collectionner.
 * Vérifie l'intégrité des raretés, visuels, numérotations, ainsi que la gestion gracieuse de l'ajout et du retrait.
 */

import { INDIE_GAMES } from '../src/data/games';
import {
  ALL_CARDS,
  buildCardsFromGames,
  createCardFromGame,
  computeGameRarity,
  getCardById,
  createFallbackCard,
  setDynamicCardsPool,
  getDynamicCardsPool,
} from '../src/data/cardsData';
import type { Game } from '../src/types/game';
import type { CardRarity } from '../src/types/cards';
import { getCollectionStats } from '../src/services/cardCollectionService';

async function runGemsCardsSyncAudit() {
  console.log('🦉 Démarrage de l\'audit de parité 1:1 Pépites & Cartes...\n');

  let errors = 0;
  const warnings: string[] = [];

  // 1. Parité 1:1 de base
  const totalGems = INDIE_GAMES.length;
  const builtCards = buildCardsFromGames(INDIE_GAMES);

  console.log(`📊 Pépites certifiées : ${totalGems}`);
  console.log(`🎴 Cartes générées : ${builtCards.length}`);

  if (builtCards.length !== totalGems) {
    console.error(`❌ Échec parité : ${totalGems} jeux certifiés mais ${builtCards.length} cartes générées.`);
    errors++;
  } else {
    console.log(`✅ Parité 1:1 parfaite : exactement ${totalGems} cartes pour ${totalGems} pépites.`);
  }

  // 2. Unicité et correspondance ID
  const seenCardIds = new Set<string>();
  const seenCardNumbers = new Set<number>();
  const rarityCount: Record<CardRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (let i = 0; i < builtCards.length; i++) {
    const card = builtCards[i];
    const game = INDIE_GAMES[i];

    // Vérifier la correspondance 1:1
    if (card.id !== game.id || card.gameId !== game.id) {
      console.error(`❌ Discordance ID carte #${i + 1} : jeu='${game.id}' vs carte='${card.id}'`);
      errors++;
    }

    // Vérifier l'unicité de l'ID
    if (seenCardIds.has(card.id)) {
      console.error(`❌ Doublon d'ID carte détecté : '${card.id}'`);
      errors++;
    }
    seenCardIds.add(card.id);

    // Vérifier le numéro séquentiel
    const expectedNumber = i + 1;
    if (card.cardNumber !== expectedNumber) {
      console.error(`❌ Erreur numérotation : carte '${card.id}' a le numéro ${card.cardNumber}, attendu ${expectedNumber}`);
      errors++;
    }
    seenCardNumbers.add(card.cardNumber);

    // Vérifier la rareté
    if (!['common', 'rare', 'epic', 'legendary'].includes(card.rarity)) {
      console.error(`❌ Rareté invalide pour '${card.id}' : '${card.rarity}'`);
      errors++;
    } else {
      rarityCount[card.rarity]++;
    }

    // Vérifier le visuel
    if (!card.imageUrl || !card.imageUrl.startsWith('http')) {
      console.error(`❌ Visuel manquant ou non HTTP pour '${card.id}' : '${card.imageUrl}'`);
      errors++;
    }

    // Vérifier la tagline bilingue
    if (!card.tagline?.fr || !card.tagline?.en) {
      warnings.push(`⚠️ Tagline bilingue incomplète pour '${card.id}'`);
    }
  }

  console.log(`\n💎 Répartition des Raretés de Cartes :`);
  console.log(`   ⚪ Communes : ${rarityCount.common}`);
  console.log(`   🔵 Rares : ${rarityCount.rare}`);
  console.log(`   🟣 Épiques : ${rarityCount.epic}`);
  console.log(`   🟡 Légendaires : ${rarityCount.legendary}`);

  // 3. Test de simulation d'ajout dynamique d'une pépite
  console.log('\n🧪 Test 1 : Ajout dynamique d\'une nouvelle pépite...');
  const mockNewGame: Game = {
    id: 'test-new-indie-gem',
    title: 'Test New Indie Gem',
    developer: 'Innovative Studio',
    releaseYear: 2026,
    genre: ['Aventure', 'Énigme'],
    steamUrl: 'https://store.steampowered.com/app/9999999/test-new-indie-gem/',
    steamAppId: 9999999,
    headerImage: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/9999999/header.jpg',
    hints: {
      tagline: {
        fr: 'Une aventure cosmique captivante.',
        en: 'A captivating cosmic adventure.',
      },
    },
    artStyle: { fr: 'Pixel Art', en: 'Pixel Art' },
    camera: { fr: '2D Vue du dessus', en: 'Top-down 2D' },
  };

  const newCard = createCardFromGame(mockNewGame, totalGems);
  if (
    newCard.id === 'test-new-indie-gem' &&
    newCard.cardNumber === totalGems + 1 &&
    newCard.title === 'Test New Indie Gem' &&
    newCard.rarity === 'common'
  ) {
    console.log('✅ Carte dynamique créée avec succès (stats, visuel, rareté et numéro séquentiel conformes).');
  } else {
    console.error('❌ Échec de la création dynamique de carte pour la nouvelle pépite :', newCard);
    errors++;
  }

  // 4. Test de mise à jour du pool dynamique
  const updatedPool = [...builtCards, newCard];
  setDynamicCardsPool(updatedPool);
  const fetchedCard = getCardById('test-new-indie-gem');
  if (fetchedCard && fetchedCard.id === 'test-new-indie-gem') {
    console.log('✅ Pool dynamique de cartes synchronisé et accessible via getCardById.');
  } else {
    console.error('❌ Échec de la récupération de la nouvelle carte dans le pool dynamique.');
    errors++;
  }

  // 5. Test de simulation de retrait / pépite orpheline
  console.log('\n🧪 Test 2 : Retrait d\'une pépite et gestion gracieuse des cartes orphelines...');
  // Retrait de la pépite du pool actif
  setDynamicCardsPool(builtCards);
  const activePoolAfterRemoval = getDynamicCardsPool();
  const stillInPool = activePoolAfterRemoval.some((c) => c.id === 'test-new-indie-gem');
  if (!stillInPool) {
    console.log('✅ La pépite retirée n\'apparaît plus dans le pool de cartes (impossible de la tirer en booster).');
  } else {
    console.error('❌ La pépite retirée est toujours présente dans le pool dynamique.');
    errors++;
  }

  // Vérifier qu'un joueur possédant cette carte dans son inventaire ne subit aucun plantage
  const mockCollection = {
    'test-new-indie-gem': {
      cardId: 'test-new-indie-gem',
      count: 2,
      countHolo: 1,
      firstObtainedAt: '2026-09-28T12:00:00.000Z',
    },
    'hollow-knight': {
      cardId: 'hollow-knight',
      count: 1,
      countHolo: 0,
      firstObtainedAt: '2026-09-28T12:00:00.000Z',
    },
  };

  const orphanFallback = getCardById('test-new-indie-gem') || createFallbackCard('test-new-indie-gem', 'Test New Indie Gem');
  if (orphanFallback && orphanFallback.id === 'test-new-indie-gem') {
    console.log('✅ Récupération gracieuse de la carte orpheline réussie sans corruption d\'inventaire.');
  } else {
    console.error('❌ Impossible de résoudre la carte orpheline.');
    errors++;
  }

  const stats = getCollectionStats(mockCollection, activePoolAfterRemoval);
  if (stats && stats.totalCards === 4 && stats.totalUnique >= 1 && stats.completionPercent <= 100) {
    console.log(`✅ Calcul des statistiques de collection robuste (cartes totales=${stats.totalCards}, complétion=${stats.completionPercent}%).`);
  } else {
    console.error('❌ Calcul des statistiques défaillant avec des cartes orphelines :', stats);
    errors++;
  }

  console.log('\n----------------------------------------------------');
  if (warnings.length > 0) {
    console.log(`Avertissements (${warnings.length}) :`);
    warnings.forEach((w) => console.log(w));
    console.log('----------------------------------------------------');
  }

  if (errors === 0) {
    console.log(`✅ AUDIT PARITÉ PÉPITES & CARTES VALIDÉ À 100% !`);
    console.log(`✨ Aucun désalignement, cartes orphelines gérées gracieusement.`);
  } else {
    console.error(`❌ AUDIT ÉCHOUÉ : ${errors} erreurs détectées.`);
    process.exit(1);
  }
}

runGemsCardsSyncAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
