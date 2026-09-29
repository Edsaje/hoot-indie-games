import { createContext } from 'react';
import type { CardTradeOffer, CreateTradePayload, FriendBinderData } from '../types/trades';
import type { CardItem } from '../types/cards';
import type { FriendPlayer } from '../types/friends';

export interface TradesContextType {
  incomingTrades: CardTradeOffer[];
  outgoingTrades: CardTradeOffer[];
  tradeHistory: CardTradeOffer[];
  pendingIncomingCount: number;
  unacknowledgedCount: number;
  isLoadingTrades: boolean;
  createTrade: (payload: CreateTradePayload) => Promise<{ success: boolean; trade?: CardTradeOffer; message?: string; error?: string }>;
  respondTrade: (params: {
    tradeId: string;
    response: 'accept' | 'decline' | 'cancel';
    counterCardId?: string;
    counterCardIsHolo?: boolean;
    counterCardTitle?: string;
    counterCardRarity?: string;
    counterCardImageUrl?: string;
    counterCardNumber?: number;
  }) => Promise<{ success: boolean; trade?: CardTradeOffer; message?: string; error?: string }>;
  fetchFriendBinder: (friendCode: string) => Promise<FriendBinderData | null>;
  refreshTrades: () => Promise<void>;
  acknowledgeTrade: (tradeId: string) => Promise<void>;

  // Contrôles de la modale d'échange
  isTradeModalOpen: boolean;
  openTradeModal: (options?: {
    targetFriend?: FriendPlayer;
    prefilledOfferedCard?: CardItem;
    prefilledRequestedCard?: CardItem;
    initialTab?: 'create' | 'incoming' | 'outgoing' | 'history';
  }) => void;
  closeTradeModal: () => void;
  selectedTradeTargetFriend: FriendPlayer | null;
  prefilledOfferedCard: CardItem | null;
  prefilledRequestedCard: CardItem | null;
  tradeModalInitialTab: 'create' | 'incoming' | 'outgoing' | 'history';
}

export const TradesContext = createContext<TradesContextType | null>(null);
