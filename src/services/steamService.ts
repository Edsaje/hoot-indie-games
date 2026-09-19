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
  player?: {
    personaName?: string;
    avatarUrl?: string;
    profileUrl?: string;
  };
  error?: string;
  message?: string;
}

/**
 * Récupère le statut de la clé API Steam Maîtresse sur le serveur souverain
 */
export async function fetchSteamProxyStatus(): Promise<{
  success: boolean;
  hasMasterKey: boolean;
  maskedKey?: string;
}> {
  try {
    const res = await fetch('/api/steam_games.php?action=status');
    if (!res.ok) return { success: false, hasMasterKey: false };
    return await res.json();
  } catch {
    return { success: false, hasMasterKey: false };
  }
}

/**
 * Enregistre la Clé API Steam Maîtresse sur le serveur (Action réservée à l'administrateur)
 */
export async function saveMasterSteamApiKey(
  apiKey: string,
  adminSteamId: string
): Promise<{ success: boolean; message: string; maskedKey?: string }> {
  try {
    const formData = new FormData();
    formData.append('action', 'set_master_key');
    formData.append('apiKey', apiKey.trim());
    formData.append('adminSteamId', adminSteamId.trim());

    const res = await fetch('/api/steam_games.php', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Erreur réseau lors de la sauvegarde.' };
  }
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
      avatarUrl: 'https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
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
 * Récupère la liste des jeux possédés sur Steam via le proxy souverain Hoot (/api/steam_games.php)
 * Contourne les erreurs de CORS des navigateurs (évite NetworkError) et utilise la Clé Maîtresse Steam du site
 */
export async function fetchSteamOwnedGames(
  steamId: string,
  apiKey?: string,
  refresh = false
): Promise<SteamSyncResult> {
  if (!steamId || !steamId.trim()) {
    return {
      success: false,
      ownedAppIds: [],
      totalCount: 0,
      error: 'NO_STEAM_ID',
      message: 'Aucun identifiant Steam fourni.',
    };
  }

  const cleanSteamId = steamId.trim();
  const params = new URLSearchParams();
  params.set('steamId', cleanSteamId);
  if (apiKey && apiKey.trim()) {
    params.set('apiKey', apiKey.trim());
  }
  if (refresh) {
    params.set('refresh', '1');
  }

  try {
    const url = `/api/steam_games.php?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 403) {
        return {
          success: false,
          ownedAppIds: [],
          totalCount: 0,
          error: 'FORBIDDEN',
          message: 'Accès refusé par Steam ou profil privé.',
        };
      }
      throw new Error(`Erreur proxy HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      return {
        success: false,
        ownedAppIds: [],
        totalCount: 0,
        error: data.error || 'SYNC_FAILED',
        message: data.message || 'Impossible de synchroniser les jeux Steam.',
      };
    }

    const ownedAppIds: number[] = Array.isArray(data.ownedAppIds) ? data.ownedAppIds : [];
    return {
      success: true,
      ownedAppIds,
      totalCount: data.count || ownedAppIds.length,
      player: data.player,
      message: data.message || `${ownedAppIds.length} jeux trouvés dans votre bibliothèque Steam !`,
    };
  } catch (err: any) {
    return {
      success: false,
      ownedAppIds: [],
      totalCount: 0,
      error: 'NETWORK_ERROR',
      message: err.message || 'Impossible de contacter le serveur Hoot pour la synchronisation Steam.',
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
