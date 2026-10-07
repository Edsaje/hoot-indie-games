import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TradesContext } from './TradesContext';
import { useFriends } from './useFriends';
import type { CardTradeOffer, CreateTradePayload, FriendBinderData } from '../types/trades';
import type { CardItem } from '../types/cards';
import type { FriendPlayer } from '../types/friends';
import { soundFx } from '../utils/audio';

// Lazy loader for sovereign trades service
const getTradesApi = () => import('../services/tradesService');

const fetchTradesApi = async (...args: Parameters<typeof import('../services/tradesService')['fetchTradesApi']>) => {
  const mod = await getTradesApi();
  return mod.fetchTradesApi(...args);
};

const createTradeApi = async (...args: Parameters<typeof import('../services/tradesService')['createTradeApi']>) => {
  const mod = await getTradesApi();
  return mod.createTradeApi(...args);
};

const respondTradeApi = async (...args: Parameters<typeof import('../services/tradesService')['respondTradeApi']>) => {
  const mod = await getTradesApi();
  return mod.respondTradeApi(...args);
};

const fetchFriendBinderApi = async (...args: Parameters<typeof import('../services/tradesService')['fetchFriendBinderApi']>) => {
  const mod = await getTradesApi();
  return mod.fetchFriendBinderApi(...args);
};

const acknowledgeTradeApi = async (...args: Parameters<typeof import('../services/tradesService')['acknowledgeTradeApi']>) => {
  const mod = await getTradesApi();
  return mod.acknowledgeTradeApi(...args);
};

const applyTradeToLocalCollection = async (...args: Parameters<typeof import('../services/tradesService')['applyTradeToLocalCollection']>) => {
  const mod = await getTradesApi();
  return mod.applyTradeToLocalCollection(...args);
};

export const TradesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { myFriendCode } = useFriends();

  const [incomingTrades, setIncomingTrades] = useState<CardTradeOffer[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<CardTradeOffer[]>([]);
  const [tradeHistory, setTradeHistory] = useState<CardTradeOffer[]>([]);
  const [pendingIncomingCount, setPendingIncomingCount] = useState<number>(0);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState<number>(0);
  const [isLoadingTrades, setIsLoadingTrades] = useState<boolean>(false);

  // États de la modale d'échange
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [selectedTradeTargetFriend, setSelectedTradeTargetFriend] = useState<FriendPlayer | null>(null);
  const [prefilledOfferedCard, setPrefilledOfferedCard] = useState<CardItem | null>(null);
  const [prefilledRequestedCard, setPrefilledRequestedCard] = useState<CardItem | null>(null);
  const [tradeModalInitialTab, setTradeModalInitialTab] = useState<'create' | 'incoming' | 'outgoing' | 'history'>('create');

  const knownIncomingIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef<boolean>(false);

  // Rafraîchissement des échanges
  const refreshTrades = useCallback(async () => {
    if (!myFriendCode) return;
    setIsLoadingTrades(true);
    try {
      const res = await fetchTradesApi(myFriendCode);
      if (res.success) {
        setIncomingTrades(res.incoming);
        setOutgoingTrades(res.outgoing);
        setTradeHistory(res.history);
        setPendingIncomingCount(res.pendingCount);
        setUnacknowledgedCount(res.unacknowledgedCount);

        // Détection de nouvelles offres entrantes pour carillon audio
        if (initialFetchDoneRef.current) {
          let hasNewOffer = false;
          for (const inc of res.incoming) {
            if (!knownIncomingIdsRef.current.has(inc.id)) {
              hasNewOffer = true;
              break;
            }
          }
          if (hasNewOffer) {
            soundFx.playChime();
          }
        }

        // Mettre à jour l'ensemble des IDs connus
        const nextIds = new Set<string>();
        for (const inc of res.incoming) {
          nextIds.add(inc.id);
        }
        knownIncomingIdsRef.current = nextIds;
        initialFetchDoneRef.current = true;
      }
    } finally {
      setIsLoadingTrades(false);
    }
  }, [myFriendCode]);

  // Chargement initial différé et synchronisation périodique
  useEffect(() => {
    if (!myFriendCode) return;

    let idleTimer: any;
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && typeof win.requestIdleCallback === 'function') {
      idleTimer = win.requestIdleCallback(refreshTrades, { timeout: 8000 });
    } else {
      idleTimer = setTimeout(refreshTrades, 6000);
    }

    const interval = setInterval(() => {
      refreshTrades();
    }, 90000); // Polling toutes les 90s

    const handleFocus = () => refreshTrades();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (win && typeof win.cancelIdleCallback === 'function' && idleTimer) {
        win.cancelIdleCallback(idleTimer);
      } else {
        clearTimeout(idleTimer);
      }
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [myFriendCode, refreshTrades]);

  // Création d'une proposition d'échange
  const createTrade = useCallback(
    async (payload: CreateTradePayload) => {
      const res = await createTradeApi(payload);
      if (res.success && res.trade) {
        setOutgoingTrades((prev) => [res.trade!, ...prev]);
        soundFx.playSuccess();
      }
      return res;
    },
    []
  );

  // Réponse à un échange (Accepter, Refuser, Annuler)
  const respondTrade = useCallback(
    async (params: {
      tradeId: string;
      response: 'accept' | 'decline' | 'cancel';
      counterCardId?: string;
      counterCardIsHolo?: boolean;
      counterCardTitle?: string;
      counterCardRarity?: string;
      counterCardImageUrl?: string;
      counterCardNumber?: number;
    }) => {
      const res = await respondTradeApi({ ...params, friendCode: myFriendCode });
      if (res.success && res.trade) {
        if (params.response === 'accept') {
          soundFx.playSuccess();
          // Mettre à jour le classeur local immédiatement
          applyTradeToLocalCollection(res.trade, myFriendCode);
        } else if (params.response === 'decline') {
          soundFx.playClick();
        } else if (params.response === 'cancel') {
          soundFx.playClick();
        }
        await refreshTrades();
      }
      return res;
    },
    [myFriendCode, refreshTrades]
  );

  // Consultation du classeur d'un ami
  const fetchFriendBinder = useCallback(
    async (friendCode: string): Promise<FriendBinderData | null> => {
      if (!myFriendCode || !friendCode) return null;
      const res = await fetchFriendBinderApi(myFriendCode, friendCode);
      return res.success && res.data ? res.data : null;
    },
    [myFriendCode]
  );

  // Acquittement d'un échange
  const acknowledgeTrade = useCallback(
    async (tradeId: string) => {
      if (!myFriendCode || !tradeId) return;
      await acknowledgeTradeApi(tradeId, myFriendCode);
      setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
    },
    [myFriendCode]
  );

  // Ouverture de la modale
  const openTradeModal = useCallback(
    (options?: {
      targetFriend?: FriendPlayer;
      prefilledOfferedCard?: CardItem;
      prefilledRequestedCard?: CardItem;
      initialTab?: 'create' | 'incoming' | 'outgoing' | 'history';
    }) => {
      soundFx.playClick();
      setSelectedTradeTargetFriend(options?.targetFriend || null);
      setPrefilledOfferedCard(options?.prefilledOfferedCard || null);
      setPrefilledRequestedCard(options?.prefilledRequestedCard || null);
      setTradeModalInitialTab(options?.initialTab || 'create');
      setIsTradeModalOpen(true);
      refreshTrades();
    },
    [refreshTrades]
  );

  // Fermeture de la modale
  const closeTradeModal = useCallback(() => {
    setIsTradeModalOpen(false);
    setSelectedTradeTargetFriend(null);
    setPrefilledOfferedCard(null);
    setPrefilledRequestedCard(null);
  }, []);

  return (
    <TradesContext.Provider
      value={{
        incomingTrades,
        outgoingTrades,
        tradeHistory,
        pendingIncomingCount,
        unacknowledgedCount,
        isLoadingTrades,
        createTrade,
        respondTrade,
        fetchFriendBinder,
        refreshTrades,
        acknowledgeTrade,
        isTradeModalOpen,
        openTradeModal,
        closeTradeModal,
        selectedTradeTargetFriend,
        prefilledOfferedCard,
        prefilledRequestedCard,
        tradeModalInitialTab,
      }}
    >
      {children}
    </TradesContext.Provider>
  );
};
