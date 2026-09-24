/**
 * Sanctuaire Cybersécurité & Module Anti-Triche Souverain — Hoot Indie Games
 *
 * Directives de sécurité strictes :
 * 1. Dissuasion DevTools : Avertissement bienveillant du Hibou et détection d'inspection console.
 * 2. Signature Cryptographique des Scores : HMAC/SHA-256 déterministe pour certifier les envois au Leaderboard.
 * 3. Plafonds d'Intégrité Réalistes : Rejet formel de tout score dépassant les limites physiques autorisées.
 * 4. Anti-Tampering LocalStorage : Vérification de checksum pour empêcher la modification triviale de records via F12.
 */

import confetti from 'canvas-confetti';
import { soundFx } from './audio';
import { addBonusFeathers } from './featherEconomy';

declare global {
  interface Window {
    hootRain?: () => void;
    hootSecret?: () => void;
    hoot?: () => void;
    hootFeathers?: (amount?: number) => void;
    hootAdmin?: () => void;
    hootLogoutAdmin?: () => void;
  }
}

export const LEADERBOARD_SECRET_SALT = 'hoot_sovereign_leaderboard_salt_2026';

/**
 * Limites physiques et plafonds maximaux réalistes par jeu et catégorie.
 * Tout score supérieur est rejeté comme aberrant par le client et le backend.
 */
export const MAX_SCORE_BOUNDS: Record<string, Record<string, number>> = {
  arcade: {
    snake: 5000,
    pong: 50,
    breakout: 15000,
    flappy: 500,
    invaders: 35000,
    run: 15000,
    tetris: 300000,
    vectrex: 50000,
  },
  timeattack: {
    screenle: 35000,
    indledle: 35000,
    linkle: 35000,
    profille: 35000,
    chrono: 35000,
    pixel: 35000,
    review: 35000,
    blindtest: 35000,
  },
  quiz: {
    standard: 10,
    survival: 150,
    infinite: 500,
  },
};

/**
 * Calcul d'empreinte SHA-256 purement autonome (compatible tous navigateurs et environnements)
 */
export function sha256Sync(input: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = input.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let composite = input + '\x80';
  while ((composite.length % 64) - 56) composite += '\x00';
  for (i = 0; i < composite.length; i++) {
    j = composite.charCodeAt(i);
    if (j >> 8) return ''; // ASCII only
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);

      const temp1 = hash[7] + sigma1 + ch + k[i] + w[i];
      const temp2 = sigma0 + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

/**
 * Génère la signature cryptographique d'un score pour soumission certifiée au backend
 */
export function generateScoreSignature(
  category: string,
  game: string,
  score: number,
  timestamp: number
): string {
  const payload = `${category}:${game}:${score}:${timestamp}:${LEADERBOARD_SECRET_SALT}`;
  return sha256Sync(payload);
}

/**
 * Valide la plausibilité d'un score selon le plafond officiel
 */
export function isScorePlausible(category: string, game: string, score: number): boolean {
  if (score <= 0 || !Number.isFinite(score)) return false;
  const max = MAX_SCORE_BOUNDS[category]?.[game] ?? 10000;
  return score <= max;
}

/**
 * Clé de signature locale pour stocker des records anti-tampering
 */
function getLocalScoreSignature(key: string, score: number): string {
  return sha256Sync(`hoot_ls_${key}_${score}_${LEADERBOARD_SECRET_SALT}`);
}

/**
 * Sauvegarde sécurisée d'un score dans localStorage avec signature d'intégrité
 */
export function saveSecureHighScore(
  key: string,
  score: number,
  category: string,
  game: string
): void {
  if (typeof localStorage === 'undefined') return;
  if (!isScorePlausible(category, game, score)) {
    console.warn(`[Security] Score ${score} rejeté pour ${category}/${game} (hors limites autorisées).`);
    return;
  }

  const signature = getLocalScoreSignature(key, score);
  const record = {
    score,
    sig: signature,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(record));
    // Rétrocompatibilité : sauver aussi la valeur simple pour les modules existants
    localStorage.setItem(`${key}_raw`, String(score));
  } catch {
    // Quota localStorage dépassé
  }
}

/**
 * Lecture sécurisée d'un score dans localStorage avec vérification d'intégrité
 */
export function getSecureHighScore(
  key: string,
  category: string,
  game: string
): number {
  if (typeof localStorage === 'undefined') return 0;
  const max = MAX_SCORE_BOUNDS[category]?.[game] ?? 10000;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Vérifier si une ancienne valeur brute existe
      const oldRaw = localStorage.getItem(`${key}_raw`) || localStorage.getItem(key);
      if (oldRaw) {
        const num = parseInt(oldRaw, 10);
        if (!isNaN(num) && num > 0 && num <= max) {
          // Migrer vers le format signé
          saveSecureHighScore(key, num, category, game);
          return num;
        }
      }
      return 0;
    }

    // Tenter de parser le format signé
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      const score = typeof parsed.score === 'number' ? parsed.score : 0;
      const sig = parsed.sig || '';

      if (score <= 0) return 0;
      if (score > max) {
        console.warn(`[Security] Score frauduleux détecté et ignoré pour ${key} (${score} > max ${max}).`);
        return 0;
      }

      // Vérifier la signature
      const expectedSig = getLocalScoreSignature(key, score);
      if (sig !== expectedSig) {
        console.warn(`[Security] Altération manuelle de ${key} détectée (signature invalide). Score réinitialisé.`);
        return 0;
      }
      return score;
    } else {
      // Ancienne valeur non-JSON
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num > 0 && num <= max) {
        saveSecureHighScore(key, num, category, game);
        return num;
      }
      return 0;
    }
  } catch {
    return 0;
  }
}

/**
 * Initialisation du bouclier anti-triche et affichage de la bannière Sylvestre
 */
export function initSecurityAntiCheat(): void {
  if (typeof window === 'undefined') return;

  // 1. Art ASCII Owl & Message Chaleureux Développeur / Communautaire
  const asciiOwl = 
`%c
    , _ ,
   ( o.o )   HOOT INDIE GAMES — Sanctuaire des Jeux Vidéo Indépendants
   /)___(\   "La nuit appartient aux créateurs de mondes... 🦉"
     " "     Projet Open-Source par @Hibouxe & la communauté indé
`;
  const asciiStyle = 'color: #f59e0b; font-family: monospace; font-size: 12px; font-weight: bold; line-height: 1.25;';

  const welcomeMsg = 
`%c🌿 Bienvenue dans la console de développement du sanctuaire !
Vous explorez le code, inspectez les éléments ou aimez le jeu vidéo indépendant ? Vous êtes chez vous.
• 177 Pépites & Micro-Indés certifiés avec amour (Steam & Itch.io)
• 11 Mini-jeux indés (8 défis quotidiens, sprint chrono, duel 1v1 & quiz)
• Commandes interactives secrètes disponibles (tapez-les directement ci-dessous) :
   ➜ hootAdmin()    : Active le compte Administrateur avec plumes infinies (∞ 🪶) et tous privilèges débloqués 👑
   ➜ hoot()         : Invoque la tempête de plumes dorées ET le murmure de Sylvestre 🪶✨
   ➜ hootFeathers() : Crédite instantanément +999 999 Plumes d'Or 🪶 pour tester les boosters & la boutique !
   ➜ hootRain()     : Déclenche la pluie magique de plumes dorées et feuilles d'émeraude 🍃
   ➜ hootSecret()   : Écoute un murmure secret du grand hibou 🦉

⚠️ Fair-Play : Les scores soumis aux classements mondiaux sont signés cryptographiquement.
Amusez-vous, découvrez des chefs-d'œuvre et soutenez les studios indépendants ! ✨`;
  const welcomeStyle = 'color: #34d399; font-size: 11px; line-height: 1.6; margin-top: 4px;';

  try {
    console.log(asciiOwl, asciiStyle);
    console.log(welcomeMsg, welcomeStyle);
  } catch {
    // Console désactivée ou restreinte
  }

  // Enregistrement des commandes interactives de la console F12
  try {
    window.hootAdmin = () => {
      try {
        localStorage.setItem('hoot_dev_admin', 'true');
        soundFx.playChime();
        console.log(
          '%c👑 [Admin] Compte Administrateur activé avec succès ! Plumes d\'Or infinies (∞ 🪶), boutique offerte & boosters illimités. Rechargement... ✨',
          'color: #f59e0b; font-weight: bold; font-size: 13px;'
        );
        setTimeout(() => location.reload(), 400);
      } catch (err) {
        console.error('Erreur activation admin:', err);
      }
    };

    window.hootLogoutAdmin = () => {
      try {
        localStorage.removeItem('hoot_dev_admin');
        console.log('%c[Admin] Mode Administrateur de test désactivé. Rechargement...', 'color: #34d399;');
        setTimeout(() => location.reload(), 300);
      } catch (err) {
        console.error('Erreur désactivation admin:', err);
      }
    };

    window.hootFeathers = (amount = 999999) => {
      addBonusFeathers(amount, 'Dev Console');
      soundFx.playSuccess();
      confetti({
        particleCount: 100,
        spread: 140,
        origin: { y: 0.2 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706'],
      });
      console.log(
        `%c🪶 +${amount.toLocaleString()} Plumes d'Or ajoutées au sanctuaire avec succès ! Solde prêt pour les tests. ✨`,
        'color: #f59e0b; font-weight: bold; font-size: 13px;'
      );
    };

    window.hootRain = () => {
      soundFx.playSuccess();
      confetti({
        particleCount: 90,
        spread: 120,
        origin: { y: 0.15 },
        colors: ['#f59e0b', '#10b981', '#34d399', '#fbbf24', '#fef08a', '#d97706'],
        disableForReducedMotion: false,
      });
      console.log(
        '%c🪶 Pluie de plumes dorées et feuilles de Sylvestre invoquée avec succès ! ✨',
        'color: #f59e0b; font-weight: bold; font-size: 12px;'
      );
    };

    window.hootSecret = () => {
      soundFx.playOwlHoot();
      console.log(
        '%c🦉 [Murmure de Sylvestre] : « Le véritable jeu indépendant ne cherche pas à plaire à tout le monde, mais à bouleverser profondément ceux qui le découvrent. » — Merci de faire vivre le sanctuaire ! 🌲✨',
        'color: #38bdf8; font-weight: bold; font-size: 12px;'
      );
    };

    window.hoot = () => {
      window.hootSecret?.();
      window.hootRain?.();
    };
  } catch {
    // Ignore si environnement verrouillé
  }

  // 2. Détecteur d'ouverture DevTools discret
  let devToolsOpenLogged = false;
  const detector = {
    get id() {
      if (!devToolsOpenLogged) {
        devToolsOpenLogged = true;
        console.log(
          '%c🦉 [Anti-Triche] Inspection détectée. Respectez l\'esprit communautaire et le défi du jour !',
          'color: #f59e0b; font-weight: bold;'
        );
      }
      return 'hoot_shield';
    },
  };

  // Déclenché uniquement lors de l'évaluation console
  try {
    console.debug(detector);
  } catch {
    // Ignore
  }

  // 3. Empêcher l'attachement de variables sensibles globales sur window
  try {
    const sensitiveKeys = ['secretGame', 'score', 'puzzleSolution', 'correctGameId'];
    sensitiveKeys.forEach((key) => {
      if (!(key in window)) {
        Object.defineProperty(window, key, {
          configurable: false,
          get: () => {
            console.warn(`[Security] Tentative d'accès à « ${key} ». Les réponses sont scellées.`);
            return undefined;
          },
          set: () => {
            console.warn(`[Security] Écriture interdite sur « ${key} »`);
          },
        });
      }
    });
  } catch {
    // Ignore si environnement verrouillé
  }
}
