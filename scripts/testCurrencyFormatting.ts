/**
 * scripts/testCurrencyFormatting.ts
 * Validation de l'affichage des prix multi-devises et conversion selon la locale.
 */

import {
  formatCurrencyAmount,
  convertEurCentsToLocale,
  formatSteamPrice,
  formatMicroIndiePrice,
  generateMultilingualPricingText,
} from '../src/utils/currencyFormatter';
import type { SteamStoreGameData } from '../src/data/steamStoreData';

console.log('🦉 Lancement des tests de formatage monétaire et multi-devises...\n');

// Test 1 : Formatage des montants dans les différentes devises
const testAmountEur = 19.99;
console.log('Test 1 : Formatage par langue (base 19.99 EUR)');
const frPrice = formatCurrencyAmount(testAmountEur, 'fr');
const enPrice = formatCurrencyAmount(testAmountEur * 1.08, 'en');
const jaPrice = formatCurrencyAmount(testAmountEur * 160, 'ja');
const brPrice = formatCurrencyAmount(testAmountEur * 5.5, 'pt-BR');

console.log(`  🇫🇷 FR : ${frPrice}`);
console.log(`  🇬🇧 EN : ${enPrice}`);
console.log(`  🇯🇵 JA : ${jaPrice}`);
console.log(`  🇧🇷 PT-BR : ${brPrice}`);

if (!frPrice.includes('€') || !enPrice.includes('$') || !jaPrice.includes('¥') || !brPrice.includes('R$')) {
  throw new Error('Échec Test 1 : Symbole de devise manquant !');
}
if (jaPrice.includes('.')) {
  throw new Error('Échec Test 1 : Le Yen ne doit comporter aucune décimale !');
}
console.log('✅ Test 1 validé !\n');

// Test 2 : Conversion de centimes Steam Store
console.log('Test 2 : Conversion de centimes Steam Store (999 cents)');
const convFr = convertEurCentsToLocale(999, 'fr');
const convJa = convertEurCentsToLocale(999, 'ja');
const convUs = convertEurCentsToLocale(999, 'en');
console.log(`  FR : ${convFr} | JA : ${convJa} | EN : ${convUs}`);
if (!convJa.startsWith('¥') || convJa.includes('.')) {
  throw new Error('Échec Test 2 : Format JPY incorrect !');
}
console.log('✅ Test 2 validé !\n');

// Test 3 : formatSteamPrice avec réduction
console.log('Test 3 : formatSteamPrice avec réduction (Balatro 14.99€ -10%)');
const mockStoreData: SteamStoreGameData = {
  appId: 2379780,
  isFree: false,
  currency: 'EUR',
  initialPriceCents: 1499,
  finalPriceCents: 1349,
  discountPercent: 10,
  formattedFinalPrice: '13,49€',
  formattedInitialPrice: '14,99€',
  totalReviews: 85000,
  totalPositive: 83000,
  positivePercent: 98,
  reviewScoreDesc: { fr: 'Extrêmement positifs', en: 'Overwhelmingly Positive' },
};

const steamResFr = formatSteamPrice(mockStoreData, 'fr');
const steamResJa = formatSteamPrice(mockStoreData, 'ja');
const steamResEn = formatSteamPrice(mockStoreData, 'en');

console.log(`  FR : ${steamResFr.formattedFinal} (barré: ${steamResFr.formattedInitial})`);
console.log(`  JA : ${steamResJa.formattedFinal} (barré: ${steamResJa.formattedInitial})`);
console.log(`  EN : ${steamResEn.formattedFinal} (barré: ${steamResEn.formattedInitial})`);

if (!steamResJa.formattedFinal.includes('¥') || !steamResEn.formattedFinal.includes('$')) {
  throw new Error('Échec Test 3 : Conversion Steam multi-locale invalide !');
}
console.log('✅ Test 3 validé !\n');

// Test 4 : Jeux gratuits
console.log('Test 4 : Jeux gratuits (Free games)');
const mockFreeStore: SteamStoreGameData = {
  appId: 100,
  isFree: true,
  currency: 'EUR',
  initialPriceCents: 0,
  finalPriceCents: 0,
  discountPercent: 0,
  formattedFinalPrice: 'Gratuit',
  totalReviews: 500,
  totalPositive: 450,
  positivePercent: 90,
  reviewScoreDesc: { fr: 'Très positifs', en: 'Very Positive' },
};

const freeFr = formatSteamPrice(mockFreeStore, 'fr');
const freeJa = formatSteamPrice(mockFreeStore, 'ja');
const freeEn = formatSteamPrice(mockFreeStore, 'en');
const freeDe = formatSteamPrice(mockFreeStore, 'de');

console.log(`  FR : ${freeFr.formattedFinal}`);
console.log(`  JA : ${freeJa.formattedFinal}`);
console.log(`  EN : ${freeEn.formattedFinal}`);
console.log(`  DE : ${freeDe.formattedFinal}`);

if (freeJa.formattedFinal !== '無料' || freeEn.formattedFinal !== 'Free' || freeDe.formattedFinal !== 'Kostenlos') {
  throw new Error('Échec Test 4 : Libellé gratuit non traduit !');
}
console.log('✅ Test 4 validé !\n');

// Test 5 : Micro-indés et extraction de chaîne existante
console.log('Test 5 : formatMicroIndiePrice avec chaîne brute FR ("1,99 € sur Steam")');
const rawFr = '1,99 € sur Steam';
const indieJa = formatMicroIndiePrice(rawFr, false, 'ja');
const indieEn = formatMicroIndiePrice(rawFr, false, 'en');
const indieBr = formatMicroIndiePrice(rawFr, false, 'pt-BR');

console.log(`  Source : "${rawFr}"`);
console.log(`  -> JA : "${indieJa}"`);
console.log(`  -> EN : "${indieEn}"`);
console.log(`  -> PT-BR : "${indieBr}"`);

if (!indieJa.includes('¥') || !indieEn.includes('$') || !indieBr.includes('R$')) {
  throw new Error('Échec Test 5 : Conversion chaîne brute échouée !');
}
console.log('✅ Test 5 validé !\n');

// Test 6 : Génération multilingue pour nouvelle soumission
console.log('Test 6 : generateMultilingualPricingText');
const multi = generateMultilingualPricingText(4.99, 'steam');
console.log(JSON.stringify(multi, null, 2));

if (!multi.ja.includes('¥') || !multi.en.includes('$') || !multi['pt-BR'].includes('R$')) {
  throw new Error('Échec Test 6 : Dictionnaire multilingue incomplet !');
}
console.log('✅ Test 6 validé !\n');

console.log('🎉 TOUS LES TESTS DE TARIFICATION LOCALISÉE SONT VALIDÉS AVEC SUCCÈS !');
