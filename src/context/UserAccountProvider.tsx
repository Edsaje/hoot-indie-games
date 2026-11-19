/**
 * 🦉 Hoot Indie Games — Fournisseur Global de Compte et Synchronisation
 * Orchestrateur épuré, modulaire et hautement lisible composant les 5 sous-hooks dédiés.
 */

import React, { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { UserAccountContext } from './UserAccountContext';
import { useUserIdentity } from '../hooks/useUserIdentity';
import { useOwnedGamesManager } from '../hooks/useOwnedGamesManager';
import { useSteamAuth } from '../hooks/useSteamAuth';
import { useEmailAuth } from '../hooks/useEmailAuth';
import { useCloudSyncDebounce } from '../hooks/useCloudSyncDebounce';
import { gatherLocalSaveData, applyCloudSaveToLocalStorage } from '../services/cloudPayloadMapper';

export const UserAccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Identité, profils et personnalisation
  const {
    profile,
    setProfile,
    isCreator,
    isAdmin,
    isModerator,
    updateProfile,
    setAvatar,
    renameCooldown,
    setUsername,
    bypassRenameCooldown,
    setActiveTitle,
    setActiveFrame,
    unlockShopItem,
    recordVersusResult,
  } = useUserIdentity();

  // 2. Gestion des jeux possédés (Steam + ajouts manuels)
  const {
    hideOwnedGames,
    setHideOwnedGames,
    ownedAppIdsSet,
    isGameOwned,
    toggleGameOwned,
    setManualOwnedGames,
  } = useOwnedGamesManager(profile, setProfile);

  // 3. Authentification Email & Session
  const {
    isAuthenticated,
    setIsAuthenticated,
    isEmailVerified,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    verifyEmail,
    resendVerificationEmail,
    logout,
    deleteAccount,
  } = useEmailAuth(profile, setProfile, isCreator);

  // 4. Authentification Valve OpenID 2.0 & Bibliothèque Steam
  const {
    connectSteamWithOpenId,
    connectSteamByIdentifier,
    syncSteamLibrary,
    disconnectSteam,
  } = useSteamAuth(profile, setProfile, setIsAuthenticated);

  // 5. Orchestration de la synchronisation cloud et debounce
  const { syncCloud } = useCloudSyncDebounce(profile, isAuthenticated, setProfile);

  // 6. Exportation et importation de sauvegarde
  const exportSaveData = useCallback((): string => {
    return JSON.stringify(gatherLocalSaveData(), null, 2);
  }, []);

  const importSaveData = useCallback((jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      applyCloudSaveToLocalStorage(data, { strategy: 'replace' });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la lecture du fichier JSON.' };
    }
  }, []);

  const isSteamConnected = useMemo(
    () => Boolean(profile.steam?.steamId && !profile.steam.steamId.startsWith('local_')),
    [profile.steam]
  );

  const contextValue = useMemo(
    () => ({
      profile,
      isAuthenticated,
      isEmailVerified,
      isAdmin,
      isModerator,
      isCreator,
      updateProfile,
      setAvatar,
      setUsername,
      renameCooldown,
      bypassRenameCooldown,
      setActiveTitle,
      setActiveFrame,
      unlockShopItem,
      recordVersusResult,
      exportSaveData,
      importSaveData,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      verifyEmail,
      resendVerificationEmail,
      logout,
      deleteAccount,
      syncCloud,
      steamAccount: profile.steam,
      isSteamConnected,
      ownedAppIdsSet,
      hideOwnedGames,
      setHideOwnedGames,
      connectSteamWithOpenId,
      connectSteamByIdentifier,
      syncSteamLibrary,
      setManualOwnedGames,
      toggleGameOwned,
      isGameOwned,
      disconnectSteam,
    }),
    [
      profile,
      isAuthenticated,
      isEmailVerified,
      isAdmin,
      isModerator,
      isCreator,
      updateProfile,
      setAvatar,
      setUsername,
      renameCooldown,
      bypassRenameCooldown,
      setActiveTitle,
      setActiveFrame,
      unlockShopItem,
      recordVersusResult,
      exportSaveData,
      importSaveData,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      verifyEmail,
      resendVerificationEmail,
      logout,
      deleteAccount,
      syncCloud,
      isSteamConnected,
      ownedAppIdsSet,
      hideOwnedGames,
      setHideOwnedGames,
      connectSteamWithOpenId,
      connectSteamByIdentifier,
      syncSteamLibrary,
      setManualOwnedGames,
      toggleGameOwned,
      isGameOwned,
      disconnectSteam,
    ]
  );

  return (
    <UserAccountContext.Provider value={contextValue}>
      {children}
    </UserAccountContext.Provider>
  );
};
