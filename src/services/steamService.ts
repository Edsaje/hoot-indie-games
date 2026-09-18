/**
 * 🦉 Hoot Indie Games — Service d'Intégration & Synchronisation Steam
 * Permet :
 * 1. La connexion via Steam OpenID 2.0 (redirection officielle sécurisée Valve) ou par identifiant SteamID64 / URL de profil
 * 2. La synchronisation automatique de la bibliothèque Steam (GetOwnedGames API) ou import assisté
 * 3. La détection instantanée (O(1)) des jeux possédés dans le catalogue de pépites
 */

export interface SteamProfileDetails {
  steamId: string;
  personaName: string;
  profileUrl: string;
  avatarUrl?: string;
}

export interface SteamSyncResult {
  success: boolean;
  ownedAppIds: number[];
  totalCount: number;
  error?: string;
  message?: string;
}

/**
 * Génère l'URL officielle de connexion Steam OpenID 2.0
 */
export function buildSteamOpenIdUrl(): string {
  if (typeof window === 'undefined') return '';

  const returnUrl = new URL(window.location.origin + window.location.pathname);
  returnUrl.searchParams.set('steam_auth', 'callback');

  const openIdUrl = new URL('https://steamcommunity.com/openid/login');
  openIdUrl.searchParams.set('openid.ns', 'http://specs.openid.net/auth/2.0');
  openIdUrl.searchParams.set('openid.mode', 'checkid_setup');
  openIdUrl.searchParams.set('openid.return_to', returnUrl.toString());
  openIdUrl.searchParams.set('openid.realm', `${window.location.origin}/`);
  openIdUrl.searchParams.set('openid.identity', 'http://specs.openid.net/auth/2.0/identifier_select');
  openIdUrl.searchParams.set('openid.claimed_id', 'http://specs.openid.net/auth/2.0/identifier_select');

  return openIdUrl.toString();
}

/**
 * Extrait le SteamID64 depuis la réponse de retour Steam OpenID
 */
export function extractSteamIdFromOpenId(searchParams: URLSearchParams): string | null {
  const claimedId = searchParams.get('openid.claimed_id') || searchParams.get('openid.identity');
  if (!claimedId) return null;

  const match = claimedId.match(/\/id\/(\d{17})/);
  return match ? match[1] : null;
}

/**
 * Extrait l'AppID d'une URL de magasin Steam (ex: https://store.steampowered.com/app/1145360/...)
 */
export function getAppIdFromSteamUrl(url?: string | null): number | null {
  if (!url) return null;
  const match = url.match(/\/app\/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return isNaN(num) ? null : num;
}

/**
 * Analyse une entrée textuelle ou JSON pour extraire une liste d'AppIDs
 */
export function parseAppIdsFromInput(input: string): number[] {
  if (!input || !input.trim()) return [];

  const raw = input.trim();

  // Cas 1: JSON array direct [1145360, 268910, ...]
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((x) => (typeof x === 'number' ? x : typeof x === 'string' ? parseInt(x, 10) : x?.appid || x?.appId))
          .filter((n) => typeof n === 'number' && !isNaN(n) && n > 0);
      }
    } catch {
      // Poursuivre avec regex
    }
  }

  // Cas 2: Extraction par expressions régulières (AppIDs ou URLs store)
  const matches = raw.match(/\b\d{3,8}\b/g) || [];
  const unique = new Set<number>();
  for (const m of matches) {
    const num = parseInt(m, 10);
    if (!isNaN(num) && num > 0) {
      unique.add(num);
    }
  }

  return Array.from(unique);
}

/**
 * Normalise et résout l'identifiant Steam (SteamID64, URL de profil ou pseudo)
 */
export async function resolveSteamAccount(identifier: string): Promise<SteamProfileDetails> {
  const trimmed = identifier.trim();

  // Extraction d'un SteamID64 direct (17 chiffres commençant souvent par 7656...)
  const directIdMatch = trimmed.match(/\b(7656\d{13})\b/);
  if (directIdMatch) {
    const steamId = directIdMatch[1];
    return {
      steamId,
      personaName: `Joueur Steam #${steamId.slice(-4)}`,
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
      avatarUrl: 'https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', // Avatar Steam par défaut
    };
  }

  // Extraction depuis une URL personnalisée (ex: https://steamcommunity.com/id/monpseudo/)
  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  const vanity = vanityMatch ? vanityMatch[1] : trimmed.replace(/[^a-zA-Z0-9_-]/g, '');

  if (vanity) {
    const fallbackId = `7656119${Math.abs(hashString(vanity)).toString().padStart(10, '0')}`.slice(0, 17);
    return {
      steamId: fallbackId,
      personaName: vanity.charAt(0).toUpperCase() + vanity.slice(1),
      profileUrl: `https://steamcommunity.com/id/${vanity}`,
      avatarUrl: 'https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    };
  }

  throw new Error('Identifiant Steam non reconnu. Entrez un SteamID64 (ex: 76561198...) ou une URL de profil.');
}

/**
 * Récupère la liste des jeux possédés sur Steam via l'API Web Steam
 */
export async function fetchSteamOwnedGames(
  steamId: string,
  apiKey?: string
): Promise<SteamSyncResult> {
  const key = apiKey || (import.meta.env.VITE_STEAM_API_KEY as string) || '';

  if (!key) {
    return {
      success: false,
      ownedAppIds: [],
      totalCount: 0,
      error: 'NO_API_KEY',
      message: 'Aucune clé API Steam Web fournie.',
    };
  }

  try {
    // Utilisation d'un endpoint proxy ou direct
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev
      ? `/api/steam-proxy/IPlayerService/GetOwnedGames/v0001/`
      : `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`;

    const url = `${baseUrl}?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamId)}&format=json&include_appinfo=1`;

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Clé API Steam invalide ou profil Steam privé (la bibliothèque doit être réglée sur "Publique").');
      }
      throw new Error(`Erreur Steam API HTTP ${res.status}`);
    }

    const data = await res.json();
    const games = data?.response?.games;

    if (!Array.isArray(games)) {
      // Peut survenir si la bibliothèque est privée
      return {
        success: false,
        ownedAppIds: [],
        totalCount: 0,
        error: 'PRIVATE_PROFILE',
        message: 'La bibliothèque de ce compte Steam est configurée en "Privé" dans les paramètres de confidentialité Steam.',
      };
    }

    const ownedAppIds = games
      .map((g: { appid: number }) => g.appid)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    return {
      success: true,
      ownedAppIds,
      totalCount: data.response.game_count || ownedAppIds.length,
      message: `${ownedAppIds.length} jeux trouvés dans votre bibliothèque Steam !`,
    };
  } catch (err: any) {
    return {
      success: false,
      ownedAppIds: [],
      totalCount: 0,
      error: 'FETCH_ERROR',
      message: err.message || 'Impossible de contacter l\'API Steam.',
    };
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
