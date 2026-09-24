import { createContext } from 'react';
import type { ChatChannel, ChatMessage, FeedbackCategory } from '../services/chatService';

export interface ChatContextType {
  isOpen: boolean;
  openChat: (channel?: ChatChannel) => void;
  closeChat: () => void;
  toggleChat: () => void;
  currentChannel: ChatChannel;
  setChannel: (channel: ChatChannel) => void;
  messages: ChatMessage[];
  allMessages: Record<ChatChannel, ChatMessage[]>;
  isLoading: boolean;
  isSending: boolean;
  unreadCount: number;
  cooldownSeconds: number;
  sendMessage: (
    text: string,
    category?: FeedbackCategory,
    scoreData?: { game: string; score: number; mode: string } | null
  ) => Promise<{ success: boolean; error?: string; warning?: string }>;
  deleteMessage: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  moderationWarning: string | null;
  setModerationWarning: (warning: string | null) => void;
  refreshMessages: (forceFull?: boolean) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);
