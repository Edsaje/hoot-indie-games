/**
 * 🦉 Hoot Indie Games — Hook Modulaire d'Authentification Steam OpenID 2.0
 * Gère le retour de redirection Valve, la validation d'assertion et la synchronisation de bibliothèque.
 */

import { useCallback, useEffect } from 'react';
import type { UserProfile, SteamAccountInfo } from '../types/user';
import { extractSteamIdFromOpenId } from '../utils/steamUrl';
import { ADMIN_STEAM_ID, claimUsernameOnServer } from '../utils/usernameValidation';
import { apiVerifySteam } from '../services/userAuthService';
import { syncUserCloudSave } from '../services/userCloudSyncService';

export function useSteamAuth(
  profile: UserProfile,
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>,
  setIsAuthenticated: (auth: boolean) => void
) {
  const connectSteamWithOpenId = useCallback(async () => {
    try {
      const { buildSteamOpenIdUrl } = await import('../services/steamService');
      const authUrl = buildSteamOpenIdUrl();
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('[SteamAuth] Erreur initialisation OpenID:', err);
    }
  }, []);

  const connectSteamByIdentifier = useCallback(
    async (
      identifier: string,
      customApiKey?: string
    ): Promise<{ success: boolean; message: string }> => {
      try {
        const { resolveSteamAccount, fetchSteamOwnedGames } = await import('../services/steamService');
        const details = await resolveSteamAccount(identifier);

        const keyToUse = customApiKey || profile.steam?.apiKey;
        let ownedAppIds: number[] = profile.steam?.ownedAppIds || [];
        let gamesCount = profile.steam?.gamesCount || ownedAppIds.length;
        let syncNotice = '';

        const syncRes = await fetchSteamOwnedGames(details.steamId, keyToUse);
        if (syncRes.success) {
          ownedAppIds = syncRes.ownedAppIds;
          gamesCount = syncRes.totalCount;
          if (syncRes.player?.avatarUrl) details.avatarUrl = syncRes.player.avatarUrl;
          if (syncRes.player?.personaName) details.personaName = syncRes.player.personaName;
          if (syncRes.player?.profileUrl) details.profileUrl = syncRes.player.profileUrl;
          syncNotice = ` (${ownedAppIds.length} jeux synchronisés)`;
        } else if (syncRes.error === 'PRIVATE_LIBRARY') {
          syncNotice = ' (Note : bibliothèque Steam configurée en Privé)';
        }

        const steamInfo: SteamAccountInfo = {
          steamId: details.steamId,
          personaName: details.personaName,
          profileUrl: details.profileUrl,
          avatarUrl: details.avatarUrl,
          lastSyncedAt: new Date().toISOString(),
          ownedAppIds,
          gamesCount,
          apiKey: keyToUse,
        };

        const isOfficialAdmin = details.steamId === ADMIN_STEAM_ID;

        setProfile((prev) => {
          const targetUsername = isOfficialAdmin
            ? 'Hibouxe'
            : prev.username === 'Hibou Mystère'
            ? details.personaName
            : prev.username;
          return {
            ...prev,
            steam: steamInfo,
            username: targetUsername,
            isAdmin: isOfficialAdmin ? true : prev.isAdmin,
            role: isOfficialAdmin ? 'admin' : prev.role,
            avatarId: isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId,
            title: isOfficialAdmin ? '👑 Créateur du Site' : prev.title,
          };
        });

        setIsAuthenticated(true);

        claimUsernameOnServer(isOfficialAdmin ? 'Hibouxe' : details.personaName, profile.id, details.steamId).catch(() => {});

        // Chargement immédiat de la sauvegarde distante en mode replace
        syncUserCloudSave(
          { userId: profile.id, steamId: details.steamId, username: isOfficialAdmin ? 'Hibouxe' : details.personaName },
          { force: true, strategy: 'replace' }
        ).then((syncResCloud) => {
          if (syncResCloud.success && syncResCloud.data) {
            const cloudData = syncResCloud.data;
            setProfile((prev) => ({
              ...prev,
              username: isOfficialAdmin
                ? 'Hibouxe'
                : cloudData.username && cloudData.username !== 'Hibou Mystère' && !cloudData.username.startsWith('Explorateur_')
                ? cloudData.username
                : prev.username,
              avatarId: (cloudData.avatarId as any) || (isOfficialAdmin ? 'hibouxe_creator' : prev.avatarId),
              title: cloudData.title || (isOfficialAdmin ? '👑 Créateur du Site' : prev.title),
              isAdmin: isOfficialAdmin ? true : prev.isAdmin,
              role: isOfficialAdmin ? 'admin' : prev.role,
              activeFrame: cloudData.activeFrame || prev.activeFrame,
              unlockedAvatars: (cloudData.unlockedAvatars as any) || prev.unlockedAvatars,
              unlockedTitles: cloudData.unlockedTitles || prev.unlockedTitles,
              unlockedFrames: cloudData.unlockedFrames || prev.unlockedFrames,
              isCloudSynced: true,
            }));
          }
        }).catch(() => {});

        return {
          success: true,
          message: `Compte Steam "${details.personaName}" lié avec succès !${syncNotice}`,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Échec de liaison du compte Steam.',
        };
      }
    },
    [profile.id, profile.steam, setProfile, setIsAuthenticated]
  );

  const syncSteamLibrary = useCallback(
    async (customApiKey?: string): Promise<{ success: boolean; count?: number; message?: string }> => {
      if (!profile.steam?.steamId) {
        return { success: false, message: 'Aucun compte Steam lié.' };
      }

      const key = customApiKey || profile.steam.apiKey;
      const { fetchSteamOwnedGames } = await import('../services/steamService');
      const res = await fetchSteamOwnedGames(profile.steam.steamId, key, true);

      if (res.success) {
        setProfile((prev) => {
          if (!prev.steam) return prev;
          return {
            ...prev,
            steam: {
              ...prev.steam,
              personaName: res.player?.personaName || prev.steam.personaName,
              avatarUrl: res.player?.avatarUrl || prev.steam.avatarUrl,
              profileUrl: res.player?.profileUrl || prev.steam.profileUrl,
              ownedAppIds: res.ownedAppIds,
              gamesCount: res.totalCount,
              lastSyncedAt: new Date().toISOString(),
              apiKey: key || prev.steam.apiKey,
            },
          };
        });
        return { success: true, count: res.ownedAppIds.length, message: res.message };
      }

      return {
        success: false,
        count: 0,
        message: res.message || 'Erreur lors de la synchronisation de la bibliothèque.',
      };
    },
    [profile.steam, setProfile]
  );

  const disconnectSteam = useCallback(() => {
    setProfile((prev) => {
      const wasAdminBySteam = prev.steam?.steamId === ADMIN_STEAM_ID;
      const isAdminByEmail = prev.email && prev.email.toLowerCase().trim() === 'quentin.beaud@hotmail.fr';
      const keepAdmin = Boolean(isAdminByEmail);

      return {
        ...prev,
        steam: undefined,
        isAdmin: keepAdmin,
        role: keepAdmin ? 'admin' : (prev.role === 'admin' ? 'user' : prev.role),
        avatarId: wasAdminBySteam && !keepAdmin ? 'owl' : prev.avatarId,
        title: wasAdminBySteam && !keepAdmin ? 'Oisillon du Perchoir' : prev.title,
      };
    });
  }, [setProfile]);

  // Détection du retour d'authentification Valve OpenID 2.0 dans l'URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const claimedId =
      searchParams.get('openid.claimed_id') ||
      searchParams.get('openid_claimed_id') ||
      searchParams.get('openid.identity');

    if (!claimedId) return;

    const steamId = extractSteamIdFromOpenId(searchParams);
    if (!steamId) return;

    if (searchParams.has('openid.mode')) {
      apiVerifySteam(searchParams.toString())
        .then((data) => {
          if (data?.adminKey) {
            try {
              localStorage.setItem('hoot_admin_key', data.adminKey);
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('[SteamAuth] Vérification Valve en arrière-plan:', err);
        })
        .finally(() => {
          connectSteamByIdentifier(steamId);
        });
    }

    // Nettoyage de l'URL pour une expérience utilisateur soignée
    const cleanUrl = new URL(window.location.href);
    const steamParams = [
      'steam_auth',
      'openid.ns',
      'openid.mode',
      'openid.op_endpoint',
      'openid.claimed_id',
      'openid.identity',
      'openid.return_to',
      'openid.response_nonce',
      'openid.assoc_handle',
      'openid.signed',
      'openid.sig',
    ];
    steamParams.forEach((p) => cleanUrl.searchParams.delete(p));
    window.history.replaceState(
      {},
      document.title,
      cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash
    );
  }, [connectSteamByIdentifier]);

  return {
    connectSteamWithOpenId,
    connectSteamByIdentifier,
    syncSteamLibrary,
    disconnectSteam,
  };
}
