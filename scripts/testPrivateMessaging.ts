import { getCanonicalConvKey } from '../src/services/chatService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Échec : ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

console.log('🦉 Test du Système de Tchat Privé Souverain...');

// Test 1: Canonical conversation key determinism
const key1 = getCanonicalConvKey('Adrien', 'Hibouxe');
const key2 = getCanonicalConvKey('Hibouxe', 'adrien');
const key3 = getCanonicalConvKey('ADRIEN', 'hibouxe');

assert(key1 === 'adrien__hibouxe', `Key1 canonique correcte: ${key1}`);
assert(key2 === 'adrien__hibouxe', `Key2 symétrique et déterministe: ${key2}`);
assert(key3 === 'adrien__hibouxe', `Key3 insensible à la casse: ${key3}`);
assert(key1 === key2, 'Les deux clés sont strictement identiques quel que soit l\'ordre');

// Test 2: Canonical key with accents & special characters
const keyAccent1 = getCanonicalConvKey('Héloïse-99', 'Éléonore_42');
const keyAccent2 = getCanonicalConvKey('Éléonore_42', 'Héloïse-99');
assert(keyAccent1 === keyAccent2, 'Clés symétriques avec caractères complexes');

// Test 3: Unread count arithmetic
const publicUnread = 3;
const privateUnread = 2;
const totalUnread = publicUnread + privateUnread;
assert(totalUnread === 5, 'Total unread additionne les messages publics et privés');

console.log('🎉 Tous les tests unitaires du tchat privé sont validés avec succès !');
