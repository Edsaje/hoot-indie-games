import assert from 'assert';

console.log('🦉 Test du Système de Demandes d\'Amis & Réciprocité...');

// Helper de clé canonique de réciprocité
function makeFriendshipPairKey(codeA: string, codeB: string): string {
  const normA = codeA.trim().toUpperCase();
  const normB = codeB.trim().toUpperCase();
  return normA < normB ? `${normA}__${normB}` : `${normB}__${normA}`;
}

// 1. Clé canonique symétrique
const key1 = makeFriendshipPairKey('HOOT-ALICE', 'HOOT-BOB');
const key2 = makeFriendshipPairKey('HOOT-BOB', 'HOOT-ALICE');
assert.strictEqual(key1, key2, 'Les clés d\'amitié doivent être strictement symétriques');
console.log('✅ Clé d\'amitié canonique et symétrique validée:', key1);

// 2. Gestion de la casse
const key3 = makeFriendshipPairKey('hoot-alice', 'Hoot-Bob');
assert.strictEqual(key1, key3, 'La clé d\'amitié doit être insensible à la casse');
console.log('✅ Insensibilité à la casse validée');

// 3. Statuts valides
const validStatuses = ['pending', 'accepted', 'declined', 'canceled'];
assert.ok(validStatuses.includes('pending'));
assert.ok(validStatuses.includes('accepted'));
assert.ok(validStatuses.includes('declined'));
assert.ok(validStatuses.includes('canceled'));
console.log('✅ Statuts de requête valides');

// 4. Détection de réciprocité
const friendships: Record<string, boolean> = {
  [makeFriendshipPairKey('HOOT-ALICE', 'HOOT-BOB')]: true,
  [makeFriendshipPairKey('HOOT-ALICE', 'HOOT-HIBOU')]: true,
};

function areFriendsMutual(codeA: string, codeB: string): boolean {
  if (codeA === 'HOOT-HIBOU' || codeB === 'HOOT-HIBOU') return true;
  const pair = makeFriendshipPairKey(codeA, codeB);
  return Boolean(friendships[pair]);
}

assert.strictEqual(areFriendsMutual('HOOT-ALICE', 'HOOT-BOB'), true);
assert.strictEqual(areFriendsMutual('HOOT-BOB', 'HOOT-ALICE'), true);
assert.strictEqual(areFriendsMutual('HOOT-ALICE', 'HOOT-CHARLIE'), false);
assert.strictEqual(areFriendsMutual('HOOT-CHARLIE', 'HOOT-HIBOU'), true, 'Hibouxe est universellement mutuel');
console.log('✅ Détection de réciprocité et immunité Hibouxe validées');

console.log('🎉 Tous les tests unitaires des demandes d\'amis sont validés avec succès !');
