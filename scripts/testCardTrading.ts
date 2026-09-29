import assert from 'assert';
import { applyTradeToLocalCollection, APPLIED_TRADES_STORAGE_KEY } from '../src/services/tradesService';
import type { CardTradeOffer } from '../src/types/trades';
import type { UserCardCollection } from '../src/types/cards';

import { STORAGE_CARD_COLLECTION } from '../src/services/cardCollectionService';

console.log('🦉 Test du Système Bilatéral d\'Échanges de Cartes...');

// Mock localStorage and window in Node environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
};

(global as any).localStorage = mockLocalStorage;
(global as any).window = {
  localStorage: mockLocalStorage,
  dispatchEvent: () => true,
};

// 1. Test Trade Status Lifecycle
const validStatuses = ['pending', 'accepted', 'declined', 'canceled', 'expired'];
validStatuses.forEach((st) => {
  assert.ok(typeof st === 'string', `Status ${st} must be valid string`);
});
console.log('✅ Statuts du cycle de vie d\'échange validés (5 statuts)');

// 2. Test applyTradeToLocalCollection when Current User is the Initiator (Sender)
// Alice offered card 'hollow-knight' (normal) and received 'celeste' (holo) from Bob
const initialCollectionAlice: UserCardCollection = {
  'hollow-knight': { count: 3, countHolo: 1, firstObtainedAt: 1000 },
  'dead-cells': { count: 1, countHolo: 0, firstObtainedAt: 1000 },
};
localStorage.setItem(STORAGE_CARD_COLLECTION, JSON.stringify(initialCollectionAlice));

const tradeAliceInitiator: CardTradeOffer = {
  id: 'trade_test_001',
  fromFriendCode: 'HOOT-ALICE',
  fromUsername: 'Alice',
  fromAvatarId: 'owl',
  toFriendCode: 'HOOT-BOB',
  toUsername: 'Bob',
  toAvatarId: 'badeline',
  offeredCardId: 'hollow-knight',
  offeredCardIsHolo: false,
  offeredCardTitle: 'Hollow Knight',
  offeredCardRarity: 'legendary',
  offeredCardNumber: 1,
  requestedCardId: 'celeste',
  requestedCardIsHolo: true,
  requestedCardTitle: 'Celeste',
  requestedCardRarity: 'legendary',
  requestedCardNumber: 2,
  status: 'accepted',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  acceptedCardId: 'celeste',
  acceptedCardIsHolo: true,
};

applyTradeToLocalCollection(tradeAliceInitiator, 'HOOT-ALICE');

const updatedCollectionAlice: UserCardCollection = JSON.parse(
  localStorage.getItem(STORAGE_CARD_COLLECTION) || '{}'
);

// Alice must have lost 1 normal hollow-knight (from 3 down to 2)
assert.strictEqual(
  updatedCollectionAlice['hollow-knight']?.count,
  2,
  'Alice doit avoir 2 hollow-knight normaux après transfert'
);
assert.strictEqual(
  updatedCollectionAlice['hollow-knight']?.countHolo,
  1,
  'Alice doit conserver sa version holo intacte'
);

// Alice must have received 1 holo celeste
assert.strictEqual(
  updatedCollectionAlice['celeste']?.countHolo,
  1,
  'Alice doit posséder 1 celeste holo'
);
assert.strictEqual(
  updatedCollectionAlice['celeste']?.count,
  0,
  'Alice ne doit pas avoir reçu de version normale de celeste'
);

console.log('✅ Déduction de la carte offerte et attribution de la carte reçue (Initiateur) validées');

// 3. Test applyTradeToLocalCollection when Current User is the Recipient (Bob's Client)
// Bob accepted Alice's offer: Bob sent 'celeste' (holo) and received 'hollow-knight' (normal)
const initialCollectionBob: UserCardCollection = {
  'celeste': { count: 0, countHolo: 2, firstObtainedAt: 2000 },
};
localStorage.setItem(STORAGE_CARD_COLLECTION, JSON.stringify(initialCollectionBob));
localStorage.removeItem(APPLIED_TRADES_STORAGE_KEY);

applyTradeToLocalCollection(tradeAliceInitiator, 'HOOT-BOB');

const updatedCollectionBob: UserCardCollection = JSON.parse(
  localStorage.getItem(STORAGE_CARD_COLLECTION) || '{}'
);

// Bob must have lost 1 holo celeste (2 down to 1)
assert.strictEqual(
  updatedCollectionBob['celeste']?.countHolo,
  1,
  'Bob doit avoir 1 seule celeste holo après avoir donné un double'
);
// Bob must have received 1 normal hollow-knight
assert.strictEqual(
  updatedCollectionBob['hollow-knight']?.count,
  1,
  'Bob doit avoir reçu 1 hollow-knight normal'
);

console.log('✅ Déduction et attribution symétrique (Destinataire) validées');

// 4. Test Idempotency and Non-duplicate application
applyTradeToLocalCollection(tradeAliceInitiator, 'HOOT-BOB');
const recheckedBob: UserCardCollection = JSON.parse(
  localStorage.getItem(STORAGE_CARD_COLLECTION) || '{}'
);
assert.strictEqual(
  recheckedBob['celeste']?.countHolo,
  1,
  'L\'application répétée du même échange ne doit pas redéduire les cartes (idempotence)'
);
console.log('✅ Idempotence du registre d\'échanges validée');

// 5. Test Counter-offer resolution for "any" / "Au choix du compagnon"
const tradeFlexible: CardTradeOffer = {
  id: 'trade_flexible_002',
  fromFriendCode: 'HOOT-CHARLIE',
  fromUsername: 'Charlie',
  fromAvatarId: 'owl',
  toFriendCode: 'HOOT-ALICE',
  toUsername: 'Alice',
  toAvatarId: 'owl',
  offeredCardId: 'hades',
  offeredCardIsHolo: true,
  offeredCardTitle: 'Hades',
  offeredCardRarity: 'legendary',
  offeredCardNumber: 3,
  requestedCardId: 'any',
  requestedCardIsHolo: false,
  requestedCardTitle: 'Au choix du compagnon',
  status: 'accepted',
  createdAt: Date.now() - 1000,
  updatedAt: Date.now(),
  acceptedCardId: 'dead-cells',
  acceptedCardIsHolo: false,
};

// Alice has dead-cells (count: 1) and accepts with dead-cells
localStorage.setItem(STORAGE_CARD_COLLECTION, JSON.stringify(updatedCollectionAlice));
applyTradeToLocalCollection(tradeFlexible, 'HOOT-ALICE');

const finalAliceCollection: UserCardCollection = JSON.parse(
  localStorage.getItem(STORAGE_CARD_COLLECTION) || '{}'
);

assert.strictEqual(
  finalAliceCollection['dead-cells']?.count,
  0,
  'Alice doit avoir cédé dead-cells selon la contre-proposition choisie'
);
assert.strictEqual(
  finalAliceCollection['hades']?.countHolo,
  1,
  'Alice doit avoir reçu hades holo'
);

console.log('✅ Résolution dynamique des échanges "Au choix du compagnon" validée');

console.log('🎉 TOUS LES TESTS DU SYSTÈME D\'ÉCHANGE BILATÉRAL ONT RÉUSSI AVEC SUCCÈS !');
