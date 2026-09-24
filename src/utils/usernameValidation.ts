/**
 * 🦉 Hoot Indie Games — Utilitaires de Validation et d'Unicité des Pseudonymes
 * 
 * Règles :
 * 1. Pseudos "Hibouxe" et "Edsaje" strictement réservés au créateur / administrateur (Steam ID 76561198035270542).
 * 2. Unicité globale des pseudonymes vérifiée via l'API souveraine /api/usernames.php.
 * 3. Longueur comprise entre 2 et 24 caractères, format lisible et propre.
 */

export const ADMIN_STEAM_ID = '76561198035270542';
export const FORBIDDEN_USERNAMES = ['hibouxe', 'edsaje'];

/**
 * Normalise un pseudonyme (minuscules, sans accents, sans séparateurs)
 * pour éviter les tentatives de squatting (ex: "H i b o u x e", "Édsaje", etc.)
 */
export function normalizeUsername(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Vérifie si le pseudonyme est interdit pour un utilisateur donné
 * (Seul le compte Steam officiel du créateur peut s'appeler Hibouxe ou Edsaje)
 */
export function isForbiddenUsername(name: string, _steamId?: string, isAdminOrOwner?: boolean): boolean {
  if (isAdminOrOwner) {
    return false;
  }
  const norm = normalizeUsername(name);
  if (!norm) return false;

  return FORBIDDEN_USERNAMES.some((forbidden) => norm === forbidden || norm.includes(forbidden));
}

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validation synchrone du format et des noms réservés
 */
export function validateUsernameFormat(
  name: string,
  steamId?: string,
  isAdminOrOwner?: boolean
): UsernameValidationResult {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: 'Le pseudonyme doit comporter au moins 2 caractères.',
    };
  }

  if (trimmed.length > 24) {
    return {
      valid: false,
      error: 'Le pseudonyme ne peut pas dépasser 24 caractères.',
    };
  }

  // Vérification de la liste des noms réservés (Hibouxe / Edsaje)
  if (isForbiddenUsername(trimmed, steamId, isAdminOrOwner)) {
    return {
      valid: false,
      error: 'Les pseudonymes "Hibouxe" et "Edsaje" sont strictement réservés au créateur du site.',
    };
  }

  // Caractères autorisés : lettres, chiffres, espaces, tirets, underscores, apostrophes, hashtags, ponctuation gamer
  const validCharsRegex = /^[\p{L}\p{N}\s_'#.\-[\]()|!?*~^:@]+$/u;
  if (!validCharsRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Caractères spéciaux non autorisés dans le pseudonyme.',
    };
  }

  return { valid: true };
}

/**
 * Nettoie doucement un pseudonyme (ex: provenant de Steam ou Google)
 * pour en retirer d'éventuels caractères incompatibles ou tags invalides.
 */
export function cleanDisplayName(name: string): string {
  if (!name) return '';
  let cleaned = name.replace(/<[^>]*>/g, '').replace(/[\x00-\x1F\x7F]/g, '').trim();
  cleaned = cleaned.replace(/[^\p{L}\p{N}\s_'#.\-[\]()|!?*~^:@]/gu, '');
  cleaned = cleaned.trim();
  if (cleaned.length < 2) return '';
  if (cleaned.length > 24) return cleaned.slice(0, 24).trim();
  return cleaned;
}

/**
 * Vérifie la disponibilité d'un pseudonyme en temps réel auprès de l'API souveraine
 */
export async function checkUsernameAvailability(
  username: string,
  userId?: string,
  steamId?: string
): Promise<{ available: boolean; message: string; reason?: string }> {
  const localCheck = validateUsernameFormat(username, steamId);
  if (!localCheck.valid) {
    return {
      available: false,
      reason: 'invalid_format',
      message: localCheck.error || 'Pseudonyme non valide.',
    };
  }

  try {
    const params = new URLSearchParams({
      action: 'check',
      username: username.trim(),
      userId: userId || '',
      steamId: steamId || '',
    });

    const res = await fetch(`/api/usernames.php?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return {
        available: Boolean(data.available),
        message: data.message || (data.available ? 'Pseudonyme disponible.' : 'Pseudonyme indisponible.'),
        reason: data.reason,
      };
    }
  } catch {
    // Mode hors-ligne ou dev local sans serveur PHP
  }

  // Repli local
  return {
    available: true,
    message: 'Pseudonyme disponible.',
  };
}

/**
 * Enregistre / revendique un pseudonyme unique auprès de l'API
 */
export async function claimUsernameOnServer(
  username: string,
  userId: string,
  steamId?: string
): Promise<{
  success: boolean;
  username?: string;
  message: string;
  role?: 'admin' | 'moderator' | 'vip' | 'user';
  isModerator?: boolean;
  customTitle?: string;
}> {
  let targetName = username.trim();
  const localCheck = validateUsernameFormat(targetName, steamId);
  if (!localCheck.valid) {
    const sanitized = cleanDisplayName(targetName);
    if (sanitized && validateUsernameFormat(sanitized, steamId).valid) {
      targetName = sanitized;
    } else {
      return {
        success: false,
        message: localCheck.error || 'Pseudonyme non valide.',
      };
    }
  }

  try {
    const res = await fetch('/api/usernames.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claim',
        username: targetName,
        userId,
        steamId: steamId || '',
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        username: data.username || targetName,
        role: data.role,
        isModerator: data.isModerator,
        customTitle: data.customTitle,
        message: data.message || 'Pseudonyme réservé avec succès !',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Ce pseudonyme est déjà pris par un autre joueur.',
      };
    }
  } catch {
    // Si l'environnement n'exécute pas PHP (mode simulation locale vite)
    return {
      success: true,
      username: targetName,
      message: 'Pseudonyme enregistré localement.',
    };
  }
}
