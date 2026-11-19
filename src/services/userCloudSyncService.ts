/**
 * 🦉 Hoot Indie Games — Service Réseau de Synchronisation Cloud Souverain
 * Service communicant épuré, modulaire et hautement sécurisé
 */

import type { OdysseySaveState } from '../types/odyssey';
import {
  type UserCloudSavePayload,
  gatherLocalSaveData,
  applyCloudSaveToLocalStorage,
  getOrCreateCloudSyncKey,
  computeSaveFingerprint,
} from './cloudPayloadMapper';

export type { UserCloudSavePayload, AdminRewardNotification } from './cloudPayloadMapper';
export {
  gatherLocalSaveData,
  applyCloudSaveToLocalStorage,
  getOrCreateCloudSyncKey,
  setCloudSyncKey,
} from './cloudPayloadMapper';

const SOVEREIGN_SYNC_API = '/api/user_cloud_sync.php';

export interface UserCloudSyncIdentifiers {
  steamId?: string;
  userId?: string;
  username?: string;
  syncKey?: string;
}

/**
 * Récupère la sauvegarde cloud distante pour un utilisateur
 */
export async function fetchUserCloudSave(
  identifiers: UserCloudSyncIdentifiers
): Promise<{ success: boolean; exists: boolean; data?: UserCloudSavePayload; message?: string }> {
  try {
    const syncKey = identifiers.syncKey || getOrCreateCloudSyncKey();
    const params = new URLSearchParams({ action: 'load' });
    if (identifiers.steamId) params.set('steamId', identifiers.steamId);
    if (identifiers.userId) params.set('userId', identifiers.userId);
    if (identifiers.username) params.set('username', identifiers.username);
    if (syncKey) params.set('syncKey', syncKey);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Sync-Key': syncKey,
    };
    if (typeof window !== 'undefined') {
      const adminKey = localStorage.getItem('hoot_admin_key');
      if (adminKey) headers['X-Admin-Key'] = adminKey;
    }

    const res = await fetch(`${SOVEREIGN_SYNC_API}?${params.toString()}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 404) return { success: true, exists: false };
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Erreur serveur (${res.status})`);
    }

    const json = await res.json();
    let data = json.data;
    if (data && data.payload && typeof data.payload === 'object') {
      const sub = data.payload;
      delete data.payload;
      data = { ...data, ...sub };
    }

    return {
      success: Boolean(json.success),
      exists: Boolean(json.exists),
      data,
      message: json.message,
    };
  } catch (err: any) {
    return { success: false, exists: false, message: err.message || 'Erreur réseau.' };
  }
}

/**
 * Envoie une sauvegarde vers le serveur souverain
 */
export async function pushUserCloudSave(
  identifiers: UserCloudSyncIdentifiers,
  payload: UserCloudSavePayload,
  options?: { strategy?: 'merge' | 'replace'; odysseyStrategy?: 'replace' }
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  try {
    const syncKey = identifiers.syncKey || getOrCreateCloudSyncKey();
    const params = new URLSearchParams({ action: 'save' });
    if (identifiers.steamId) params.set('steamId', identifiers.steamId);
    if (identifiers.userId) params.set('userId', identifiers.userId);
    if (identifiers.username) params.set('username', identifiers.username);
    if (options?.strategy) params.set('strategy', options.strategy);
    if (options?.odysseyStrategy) params.set('odysseyStrategy', options.odysseyStrategy);

    payload.syncedAt = new Date().toISOString();

    const bodyData = {
      ...payload,
      syncStrategy: options?.strategy,
      odysseyStrategy: options?.odysseyStrategy,
      syncKey,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Sync-Key': syncKey,
    };
    if (typeof window !== 'undefined') {
      const adminKey = localStorage.getItem('hoot_admin_key');
      if (adminKey) headers['X-Admin-Key'] = adminKey;
    }

    const res = await fetch(`${SOVEREIGN_SYNC_API}?${params.toString()}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify(bodyData),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Erreur serveur (${res.status})`);
    }

    const json = await res.json();
    let data = json.data;
    if (data && data.payload && typeof data.payload === 'object') {
      const sub = data.payload;
      delete data.payload;
      data = { ...data, ...sub };
    }

    return {
      success: Boolean(json.success),
      message: json.message || 'Sauvegarde synchronisée avec succès dans le Cloud Souverain (OVH) !',
      data: data || payload,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erreur réseau.' };
  }
}

/**
 * Force la synchronisation immédiate de l'état réinitialisé de l'Odyssée (Hard Reset)
 */
export async function forcePushOdysseyReset(
  identifiers: UserCloudSyncIdentifiers,
  freshOdysseyState: OdysseySaveState
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  const local = gatherLocalSaveData();
  local.odysseyState = { ...freshOdysseyState, version: 1 as const };
  const res = await pushUserCloudSave(identifiers, local, { strategy: 'replace', odysseyStrategy: 'replace' });
  if (res.success && res.data) {
    applyCloudSaveToLocalStorage(res.data, { strategy: 'replace' });
  }
  return res;
}

let inFlightSyncPromise: Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> | null = null;
let lastSyncTimestamp = 0;
let lastSyncedDataHash = '';

export function getLastSyncTimestamp(): number {
  return lastSyncTimestamp;
}

/**
 * Exécute une synchronisation bidirectionnelle intelligente
 * Avec dédoublonnage en vol, détection des changements locaux et anti-boucle
 */
export async function syncUserCloudSave(
  identifiers: UserCloudSyncIdentifiers,
  options?: { force?: boolean; strategy?: 'merge' | 'replace' }
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  const syncKey = identifiers.syncKey || getOrCreateCloudSyncKey();
  if (!identifiers.steamId && !identifiers.userId && !identifiers.username && !syncKey) {
    return { success: false, message: 'Aucun identifiant utilisateur disponible pour la synchronisation.' };
  }

  const effectiveIdentifiers = {
    ...identifiers,
    syncKey,
  };

  // Si une synchronisation est déjà en vol
  if (inFlightSyncPromise) {
    if (options?.force) {
      try {
        await inFlightSyncPromise;
      } catch {}
    } else {
      return inFlightSyncPromise;
    }
  }

  const now = Date.now();
  const currentLocal = gatherLocalSaveData();
  const currentFingerprint = computeSaveFingerprint(currentLocal);

  // Si non forcé, vérifier s'il y a un changement réel
  if (!options?.force) {
    if (currentFingerprint === lastSyncedDataHash && now - lastSyncTimestamp < 60000) {
      return { success: true, message: 'Données déjà synchronisées.', data: currentLocal };
    }
    if (now - lastSyncTimestamp < 4000) {
      return { success: true, message: 'Synchronisation temporisée.', data: currentLocal };
    }
  }

  inFlightSyncPromise = (async () => {
    try {
      const isReplace = options?.strategy === 'replace';

      // 1. Récupération des données distantes
      const cloudRes = await fetchUserCloudSave(effectiveIdentifiers);

      // Si données distantes existantes en mode replace (connexion à un compte existant)
      if (cloudRes.success && cloudRes.exists && cloudRes.data && isReplace) {
        applyCloudSaveToLocalStorage(cloudRes.data, { strategy: 'replace' });
        lastSyncTimestamp = Date.now();
        lastSyncedDataHash = computeSaveFingerprint(cloudRes.data);
        return {
          success: true,
          message: 'Compte chargé depuis le Cloud Souverain !',
          data: cloudRes.data,
        };
      }

      // Si données distantes existantes en mode merge
      if (cloudRes.success && cloudRes.exists && cloudRes.data) {
        applyCloudSaveToLocalStorage(cloudRes.data, { strategy: 'merge' });
      }

      // 3. Envoi de l'état local fusionné au serveur pour persistance
      const updatedLocal = gatherLocalSaveData();
      const pushRes = await pushUserCloudSave(effectiveIdentifiers, updatedLocal, options);

      lastSyncTimestamp = Date.now();
      lastSyncedDataHash = computeSaveFingerprint(updatedLocal);

      if (pushRes.success) {
        if (pushRes.data) {
          applyCloudSaveToLocalStorage(pushRes.data, { strategy: 'merge' });
        }
        return {
          success: true,
          message: pushRes.message || 'Compte synchronisé avec succès sur le Cloud Souverain !',
          data: pushRes.data || updatedLocal,
        };
      }

      return {
        success: false,
        message: pushRes.message || 'Échec de synchronisation.',
        data: updatedLocal,
      };
    } catch (err: any) {
      console.warn('[UserCloudSync] Échec synchronisation cloud:', err);
      return { success: false, message: err.message || 'Erreur réseau.' };
    } finally {
      inFlightSyncPromise = null;
    }
  })();

  return inFlightSyncPromise;
}

export async function acknowledgeAdminReward(_rewardId?: string): Promise<boolean> {
  return true;
}
