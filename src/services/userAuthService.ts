/**
 * 🦉 Hoot Indie Games — Service d'Authentification Utilisateur Souverain
 * Communication avec l'API souveraine /api/user_auth.php (Comptes Hoot & liaison Steam)
 */

export interface UserAuthAccount {
  id: string;
  email?: string;
  username: string;
  steamId?: string | null;
  createdAt?: string;
  lastLoginAt?: string;
  isSteamOnly?: boolean;
}

export interface AuthApiResponse {
  success: boolean;
  authenticated?: boolean;
  user?: UserAuthAccount | null;
  message?: string;
  error?: string;
  steamId?: string;
}

const AUTH_API_URL = '/api/user_auth.php';

/**
 * Récupère la session active côté serveur (cookie de session HttpOnly)
 */
export async function apiGetSession(): Promise<AuthApiResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}?action=me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      authenticated: false,
      error: 'network_error',
      message: err?.message || 'Erreur réseau lors de la vérification de session.',
    };
  }
}

/**
 * Inscription d'un nouveau compte Hoot souverain
 */
export async function apiRegister(
  email: string,
  password: string,
  username?: string,
  steamId?: string
): Promise<AuthApiResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        username,
        steamId,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'network_error',
      message: err?.message || 'Erreur réseau lors de la création du compte.',
    };
  }
}

/**
 * Connexion à un compte Hoot existant
 */
export async function apiLogin(email: string, password: string): Promise<AuthApiResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'network_error',
      message: err?.message || 'Erreur réseau lors de la connexion.',
    };
  }
}

/**
 * Liaison d'un compte Steam au compte Hoot connecté
 */
export async function apiLinkSteam(steamId: string): Promise<AuthApiResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}?action=link_steam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        steamId,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'network_error',
      message: err?.message || 'Erreur réseau lors de la liaison Steam.',
    };
  }
}

/**
 * Déconnexion de la session serveur
 */
export async function apiLogout(): Promise<AuthApiResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}?action=logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: 'network_error',
      message: err?.message || 'Erreur réseau lors de la déconnexion.',
    };
  }
}
