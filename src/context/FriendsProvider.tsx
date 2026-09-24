import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { FriendPlayer } from '../types/friends';
import { FriendsContext } from './FriendsContext';
import { useUserAccount } from './useUserAccount';
import {
  getOrCreateFriendCode,
  getStoredFriendCodes,
  saveStoredFriendCodes,
  registerSelfOnServer,
  fetchFriendsData,
  lookupFriend,
  syncSteamFriendsList,
} from '../services/friendsService';
import { getTodayDateString } from '../utils/streakManager';
import { ADMIN_STEAM_ID } from '../utils/usernameValidation';

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile, isSteamConnected, steamAccount, isAuthenticated } = useUserAccount();

  const profileRef = useRef(profile);
  profileRef.current = profile;

  const myFriendCode = useMemo(() => {
    if (!isAuthenticated) return '';
    return getOrCreateFriendCode(profile);
  }, [isAuthenticated, profile.steam?.steamId, profile.id, profile.username, profile.friendCode]);

  // Si le profil n'avait pas encore le friendCode stocké, on le persiste uniquement pour un utilisateur connecté
  useEffect(() => {
    if (isAuthenticated && myFriendCode && profile.friendCode !== myFriendCode) {
      updateProfile({ friendCode: myFriendCode });
    }
  }, [isAuthenticated, profile.friendCode, myFriendCode, updateProfile]);

  // Vérifie si un joueur ou un code correspond à l'utilisateur lui-même
  const isSelf = useCallback(
    (playerOrCode: FriendPlayer | string): boolean => {
      const code = (typeof playerOrCode === 'string' ? playerOrCode : playerOrCode.friendCode || '')
        .trim()
        .toUpperCase();
      const myCode = myFriendCode.trim().toUpperCase();
      if (code && myCode && code === myCode) return true;

      const currentProfile = profileRef.current;

      // Cas spécial créateur / admin
      const isUserAdminOrHibouxe =
        currentProfile.steam?.steamId === ADMIN_STEAM_ID ||
        currentProfile.id === 'admin_hibouxe' ||
        currentProfile.username?.toLowerCase() === 'hibouxe';

      if (
        isUserAdminOrHibouxe &&
        (code === 'HOOT-HIBOU' || (typeof playerOrCode !== 'string' && playerOrCode.username?.toLowerCase() === 'hibouxe'))
      ) {
        return true;
      }

      if (typeof playerOrCode !== 'string') {
        if (currentProfile.steam?.steamId && playerOrCode.steamId && playerOrCode.steamId === currentProfile.steam.steamId) {
          return true;
        }
        if (
          currentProfile.username &&
          playerOrCode.username &&
          playerOrCode.username.toLowerCase() === currentProfile.username.toLowerCase()
        ) {
          return true;
        }
      }
      return false;
    },
    [myFriendCode]
  );

  const [friendCodes, setFriendCodes] = useState<string[]>(() => {
    const rawCodes = getStoredFriendCodes(getOrCreateFriendCode(profile));
    const isCreator = profile.steam?.steamId === ADMIN_STEAM_ID || profile.id === 'admin_hibouxe' || profile.username?.toLowerCase() === 'hibouxe';
    let initial = rawCodes.filter((c) => c !== 'HOOT-HIBOU' || !isCreator);
    if (!isCreator && !initial.includes('HOOT-HIBOU')) {
      initial = ['HOOT-HIBOU', ...initial];
    }
    return initial;
  });

  const friendCodesRef = useRef(friendCodes);
  friendCodesRef.current = friendCodes;

  const isSelfRef = useRef(isSelf);
  isSelfRef.current = isSelf;

  const [friends, setFriends] = useState<FriendPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Nettoyage immédiat et garantie :
  // - S'assurer que soi-même n'est JAMAIS stocké dans friendCodes ni dans localStorage
  // - S'assurer que pour tout nouvel utilisateur / visiteur, le Créateur (HOOT-HIBOU) est présent dès la création
  useEffect(() => {
    const isCreator = isSelf('HOOT-HIBOU');
    let updated = friendCodes.filter((c) => !isSelf(c));
    if (!isCreator && !updated.includes('HOOT-HIBOU')) {
      updated = ['HOOT-HIBOU', ...updated];
    }
    const isDifferent = updated.length !== friendCodes.length || updated.some((c, i) => c !== friendCodes[i]);
    if (isDifferent) {
      setFriendCodes(updated);
      saveStoredFriendCodes(updated);
    }
  }, [friendCodes, isSelf]);

  // Synchronisation de soi-même sur le serveur souverain (uniquement si connecté avec code ami)
  const syncSelf = useCallback(async () => {
    if (!isAuthenticated || !myFriendCode) return;
    try {
      await registerSelfOnServer(profileRef.current, myFriendCode);
    } catch {
      // Ignorer
    }
  }, [isAuthenticated, myFriendCode]);

  // Chargement des données des amis (en excluant soi-même)
  const refreshFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      await syncSelf();
      const activeCodes = friendCodesRef.current.filter((c) => !isSelfRef.current(c));
      const list = await fetchFriendsData(activeCodes, myFriendCode);
      setFriends(list.filter((f) => !isSelfRef.current(f)));
    } catch (err) {
      console.warn('Erreur rafraîchissement amis :', err);
    } finally {
      setIsLoading(false);
    }
  }, [syncSelf, myFriendCode]);

  // Chargement initial unique au montage
  const hasInitiallyLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasInitiallyLoadedRef.current) {
      hasInitiallyLoadedRef.current = true;
      refreshFriends();
    }
  }, [refreshFriends]);

  // Synchronisation périodique discrète toutes les 2 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      syncSelf();
      const activeCodes = friendCodesRef.current.filter((c) => !isSelfRef.current(c));
      fetchFriendsData(activeCodes, myFriendCode).then((list) => {
        setFriends(list.filter((f) => !isSelfRef.current(f)));
      });
    }, 120000);
    return () => clearInterval(timer);
  }, [syncSelf, myFriendCode]);

  // Écoute de réinitialisation lors d'une déconnexion
  useEffect(() => {
    const handleReset = () => {
      const defaultCodes = ['HOOT-HIBOU'];
      setFriendCodes(defaultCodes);
      setFriends([]);
      saveStoredFriendCodes(defaultCodes);
    };

    window.addEventListener('hoot_friends_updated', handleReset);
    window.addEventListener('hoot_cloud_reset', handleReset);
    return () => {
      window.removeEventListener('hoot_friends_updated', handleReset);
      window.removeEventListener('hoot_cloud_reset', handleReset);
    };
  }, []);

  // Ajouter un ami (par code ou par pseudo)
  const addFriend = async (query: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { success: false, error: 'Veuillez renseigner un code ami ou un pseudonyme.' };
    }

    if (isSelf(cleanQuery)) {
      return { success: false, error: 'Vous ne pouvez pas vous ajouter vous-même en compagnon.' };
    }

    setIsLoading(true);
    try {
      const res = await lookupFriend(cleanQuery);
      if (!res.success || !res.player) {
        return { success: false, error: res.error || 'Compagnon introuvable.' };
      }

      const targetPlayer = res.player;
      if (isSelf(targetPlayer)) {
        return { success: false, error: 'Vous ne pouvez pas vous ajouter vous-même en compagnon.' };
      }

      if (friendCodes.includes(targetPlayer.friendCode)) {
        return { success: false, error: `${targetPlayer.username} fait déjà partie de vos compagnons.` };
      }

      const updatedCodes = [...friendCodes.filter((c) => !isSelf(c)), targetPlayer.friendCode];
      setFriendCodes(updatedCodes);
      saveStoredFriendCodes(updatedCodes);

      // Ajouter localement à la liste des amis
      setFriends((prev) => {
        const withoutTarget = prev.filter((f) => f.friendCode !== targetPlayer.friendCode && !isSelf(f));
        return [targetPlayer, ...withoutTarget];
      });

      return {
        success: true,
        message: `${targetPlayer.username} a été ajouté à votre Cercle de Compagnons !`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’ajout du compagnon.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Retirer un ami
  const removeFriend = (targetCode: string) => {
    const clean = targetCode.trim().toUpperCase();
    const updatedCodes = friendCodes.filter((c) => c !== clean && !isSelf(c));
    setFriendCodes(updatedCodes);
    saveStoredFriendCodes(updatedCodes);
    setFriends((prev) => prev.filter((f) => f.friendCode !== clean && !isSelf(f)));
  };

  // Synchronisation des amis Steam
  const syncSteamFriends = async (): Promise<{ success: boolean; count?: number; message?: string; error?: string }> => {
    if (!isSteamConnected || !steamAccount?.steamId) {
      return { success: false, error: 'Veuillez connecter votre compte Steam pour synchroniser vos amis.' };
    }

    setIsLoading(true);
    try {
      const res = await syncSteamFriendsList(steamAccount.steamId);
      if (!res.success) {
        return { success: false, error: res.error || 'Impossible de synchroniser vos amis Steam.' };
      }

      const newFound = res.matchedFriends.filter(
        (f) => !friendCodes.includes(f.friendCode) && !isSelf(f)
      );

      if (newFound.length === 0) {
        return {
          success: true,
          count: 0,
          message: 'Aucun nouvel ami Steam détecté sur Hoot Indie Games pour le moment.',
        };
      }

      const newCodes = newFound.map((f) => f.friendCode);
      const updatedCodes = Array.from(new Set([...friendCodes.filter((c) => !isSelf(c)), ...newCodes]));
      setFriendCodes(updatedCodes);
      saveStoredFriendCodes(updatedCodes);

      setFriends((prev) => {
        const existingCodes = new Set(prev.map((f) => f.friendCode));
        const toAdd = newFound.filter((f) => !existingCodes.has(f.friendCode) && !isSelf(f));
        return [...toAdd, ...prev.filter((f) => !isSelf(f))];
      });

      return {
        success: true,
        count: newFound.length,
        message: `${newFound.length} ami(s) Steam ajouté(s) à votre Cercle de Compagnons !`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur réseau lors de la synchronisation.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Création du lien d'invitation à un duel 1v1 Versus
  const createVersusChallengeUrl = (customRoomCode?: string) => {
    const code = customRoomCode || `VS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const url = `${window.location.origin}${window.location.pathname}#versus=${code}`;
    return { roomCode: code, inviteUrl: url };
  };

  const isFriendAdded = (code: string) => {
    return !isSelf(code) && friendCodes.includes(code.trim().toUpperCase());
  };

  const FAVORITES_STORAGE_KEY = 'hoot_favorite_friends_v1';

  const [favoriteFriendCodes, setFavoriteFriendCodes] = useState<string[]>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((c) => String(c).trim().toUpperCase());
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const isFavoriteFriend = useCallback(
    (code: string): boolean => {
      const clean = code.trim().toUpperCase();
      return favoriteFriendCodes.includes(clean);
    },
    [favoriteFriendCodes]
  );

  const toggleFavoriteFriend = useCallback((code: string) => {
    const clean = code.trim().toUpperCase();
    setFavoriteFriendCodes((prev) => {
      const exists = prev.includes(clean);
      const next = exists ? prev.filter((c) => c !== clean) : [...prev, clean];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // Ignorer
      }
      return next;
    });
  }, []);

  // Liste garantie sans l'utilisateur lui-même, avec les FAVORIS en tout premier !
  const validFriends = useMemo(() => {
    const list = friends.filter((f) => !isSelf(f));
    return [...list].sort((a, b) => {
      const codeA = (a.friendCode || '').trim().toUpperCase();
      const codeB = (b.friendCode || '').trim().toUpperCase();

      const favA = favoriteFriendCodes.includes(codeA) ? 1 : 0;
      const favB = favoriteFriendCodes.includes(codeB) ? 1 : 0;

      // 1. Les compagnons favoris (étoile dorée) en tout premier
      if (favB !== favA) {
        return favB - favA;
      }

      // 2. Le Créateur (s'il n'est pas déjà ordonné par statut favori)
      const isCreatorA = codeA === 'HOOT-HIBOU' ? 1 : 0;
      const isCreatorB = codeB === 'HOOT-HIBOU' ? 1 : 0;
      if (isCreatorB !== isCreatorA) {
        return isCreatorB - isCreatorA;
      }

      // 3. Statut en ligne
      const isOnlineA = a.isOnline ? 1 : 0;
      const isOnlineB = b.isOnline ? 1 : 0;
      if (isOnlineB !== isOnlineA) {
        return isOnlineB - isOnlineA;
      }

      // 4. Ordre alphabétique
      return a.username.localeCompare(b.username);
    });
  }, [friends, isSelf, favoriteFriendCodes]);

  const totalFriendsCount = validFriends.length;

  const friendsActiveTodayCount = useMemo(() => {
    const todayStr = getTodayDateString();
    return validFriends.filter(
      (f) => f.dailyScores?.date === todayStr && f.dailyScores.totalWonToday > 0
    ).length;
  }, [validFriends]);

  const friendsOnlineCount = useMemo(() => {
    return validFriends.filter((f) => {
      if (f.isOnline) return true;
      if (f.lastActive) {
        const diffMs = Date.now() - new Date(f.lastActive).getTime();
        return !isNaN(diffMs) && diffMs < 15 * 60 * 1000;
      }
      return false;
    }).length;
  }, [validFriends]);

  return (
    <FriendsContext.Provider
      value={{
        friends: validFriends,
        myFriendCode,
        isLoading,
        addFriend,
        removeFriend,
        refreshFriends,
        syncSteamFriends,
        createVersusChallengeUrl,
        isFriendAdded,
        totalFriendsCount,
        friendsActiveTodayCount,
        friendsOnlineCount,
        favoriteFriendCodes,
        isFavoriteFriend,
        toggleFavoriteFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};
