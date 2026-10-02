import { createContext } from 'react';
import type {
  ChatChannel,
  ChatMessage,
  FeedbackCategory,
  PrivateConversation,
  PrivateMessage,
  PrivateParticipant,
} from '../services/chatService';

export interface ChatContextType {
  isOpen: boolean;
  openChat: (channel?: ChatChannel) => void;
  closeChat: () => void;
  toggleChat: () => void;

  // Navigation onglets (Salons publics vs Messages privés)
  activeTab: 'public' | 'private';
  setActiveTab: (tab: 'public' | 'private') => void;

  // Salons publics
  currentChannel: ChatChannel;
  setChannel: (channel: ChatChannel) => void;
  messages: ChatMessage[];
  allMessages: Record<ChatChannel, ChatMessage[]>;

  // Messagerie Privée Directe
  privateConversations: PrivateConversation[];
  activePrivateConversationId: string | null;
  setActivePrivateConversationId: (convId: string | null) => void;
  activePrivateMessages: PrivateMessage[];
  activePrivateParticipant: PrivateParticipant | null;
  openPrivateChat: (
    targetUsername: string,
    targetMeta?: Partial<PrivateParticipant>,
    explicitConvId?: string
  ) => void;
  sendPrivateMsg: (
    recipientUsername: string,
    text: string,
    recipientMeta?: Partial<PrivateParticipant>
  ) => Promise<{ success: boolean; error?: string; warning?: string }>;
  deletePrivateMsg: (
    messageId: string,
    conversationId: string,
    hardDelete?: boolean
  ) => Promise<{ success: boolean }>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  refreshPrivateConversations: () => Promise<void>;
  refreshPrivateMessages: (convId?: string) => Promise<void>;

  // État général & compteurs
  isLoading: boolean;
  isSending: boolean;
  unreadCount: number;
  publicUnreadCount: number;
  privateUnreadCount: number;
  cooldownSeconds: number;
  sendMessage: (
    text: string,
    category?: FeedbackCategory,
    scoreData?: { game: string; score: number; mode: string } | null
  ) => Promise<{ success: boolean; error?: string; warning?: string }>;
  deleteMessage: (messageId: string, hardDelete?: boolean) => Promise<{ success: boolean; message?: string; hardDeleted?: boolean }>;
  purgeUserMessages: (targetUsername: string, targetUserId?: string) => Promise<{ success: boolean; count?: number; message?: string }>;
  moderationWarning: string | null;
  setModerationWarning: (warning: string | null) => void;
  refreshMessages: (forceFull?: boolean) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

