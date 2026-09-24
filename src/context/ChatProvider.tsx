import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatContext } from './ChatContext';
import { useUserAccount } from './useUserAccount';
import {
  type ChatChannel,
  type ChatMessage,
  type FeedbackCategory,
  fetchChatMessages,
  sendChatMessage,
  deleteChatMessage,
} from '../services/chatService';
import { soundFx } from '../utils/audio';

const INITIAL_MESSAGES_MAP: Record<ChatChannel, ChatMessage[]> = {
  global: [],
  fr: [],
  en: [],
  es: [],
  de: [],
  ja: [],
  'pt-BR': [],
  feedback: [],
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { profile, isAuthenticated, isAdmin, isCreator, isModerator } = useUserAccount();

  // Canal initial basé sur la langue ou le hash d'URL
  const getInitialChannel = (): ChatChannel => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#feedback')) return 'feedback';
      if (hash.startsWith('#chat-fr')) return 'fr';
      if (hash.startsWith('#chat-en')) return 'en';
      if (hash.startsWith('#chat-es')) return 'es';
      if (hash.startsWith('#chat-de')) return 'de';
      if (hash.startsWith('#chat-ja')) return 'ja';
      if (hash.startsWith('#chat-pt')) return 'pt-BR';
      if (hash.startsWith('#chat')) return 'global';
    }
    const lang = i18n.language?.toLowerCase() || 'fr';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('de')) return 'de';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('pt')) return 'pt-BR';
    if (lang.startsWith('en')) return 'en';
    return 'global';
  };

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return hash.startsWith('#chat') || hash.startsWith('#feedback');
    }
    return false;
  });

  const [currentChannel, setCurrentChannel] = useState<ChatChannel>(getInitialChannel);
  const [allMessages, setAllMessages] = useState<Record<ChatChannel, ChatMessage[]>>(INITIAL_MESSAGES_MAP);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  const lastServerTimeRef = useRef<number>(0);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOpenRef = useRef<boolean>(isOpen);
  isOpenRef.current = isOpen;
  const isFetchingRef = useRef<boolean>(false);

  // Récupérer les messages (Delta polling intelligent avec 'since' pour éviter de surcharger le serveur)
  const refreshMessages = useCallback(
    async (forceFull = false) => {
      // Éviter les requêtes simultanées en vol
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const since = forceFull ? 0 : lastServerTimeRef.current;
        const res = await fetchChatMessages('all', since);

        if (res.success && Array.isArray(res.messages)) {
          // Si requête delta et aucun nouveau message reçu : rien à modifier, 0 re-render
          if (!forceFull && since > 0 && res.messages.length === 0) {
            lastServerTimeRef.current = res.serverTime || Math.floor(Date.now() / 1000);
            return;
          }

          let newFromOthers = false;

          if (forceFull || since === 0) {
            // Chargement initial ou forcé : regrouper tous les messages
            const grouped: Record<ChatChannel, ChatMessage[]> = {
              global: [],
              fr: [],
              en: [],
              es: [],
              de: [],
              ja: [],
              'pt-BR': [],
              feedback: [],
            };

            for (const msg of res.messages) {
              const ch = msg.channel;
              if (grouped[ch]) {
                grouped[ch].push(msg);
              }
              if (!knownMessageIdsRef.current.has(msg.id)) {
                knownMessageIdsRef.current.add(msg.id);
                if (msg.username !== profile.username && lastServerTimeRef.current > 0) {
                  newFromOthers = true;
                }
              }
            }

            setAllMessages(grouped);
          } else {
            // Requête incrémentale : fusionner uniquement les nouveaux messages reçus
            setAllMessages((prev) => {
              const next = { ...prev };
              let hasChanges = false;

              for (const msg of res.messages) {
                const ch = msg.channel;
                if (!next[ch]) next[ch] = [];
                const idx = next[ch].findIndex((m) => m.id === msg.id);
                if (idx === -1) {
                  next[ch] = [...next[ch], msg];
                  hasChanges = true;
                } else if (next[ch][idx].isDeleted !== msg.isDeleted || next[ch][idx].text !== msg.text) {
                  const updated = [...next[ch]];
                  updated[idx] = msg;
                  next[ch] = updated;
                  hasChanges = true;
                }

                if (next[ch].length > 60) {
                  next[ch] = next[ch].slice(-60);
                  hasChanges = true;
                }

                if (!knownMessageIdsRef.current.has(msg.id)) {
                  knownMessageIdsRef.current.add(msg.id);
                  if (msg.username !== profile.username) {
                    newFromOthers = true;
                  }
                }
              }

              return hasChanges ? next : prev;
            });
          }

          // Si nouveau message d'un autre joueur et que le chat est fermé
          if (newFromOthers && !isOpenRef.current) {
            setUnreadCount((prev) => prev + 1);
            soundFx.playChime();
          }

          lastServerTimeRef.current = res.serverTime || Math.floor(Date.now() / 1000);
        }
      } catch {
        // Ignore les erreurs réseau passagères
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [profile.username]
  );

  // Initial load au premier rendu (1 seule fois avec since=0)
  useEffect(() => {
    refreshMessages(true);
  }, [refreshMessages]);

  // Polling sobre & intelligent :
  // - Si onglet masqué / en arrière-plan : PAUSE COMPLÈTE (0 appel réseau !)
  // - Si le tiroir du chat est OUVERT : polling delta toutes les 8 secondes
  // - Si le tiroir du chat est FERMÉ : polling delta très espacé (toutes les 90 secondes) pour le compteur non-lu
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPoll = () => {
      if (pollTimer) clearInterval(pollTimer);
      if (typeof document !== 'undefined' && document.hidden) return;

      const delay = isOpen ? 8000 : 90000;
      pollTimer = setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          refreshMessages(false);
        }
      }, delay);
    };

    startPoll();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollTimer) clearInterval(pollTimer);
      } else {
        refreshMessages(false);
        startPoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, refreshMessages]);

  // Ouverture / Fermeture
  const openChat = useCallback((channel?: ChatChannel) => {
    soundFx.playClick();
    if (channel) {
      setCurrentChannel(channel);
    }
    setIsOpen(true);
    setUnreadCount(0);
    // Rafraîchir immédiatement à l'ouverture du tiroir
    refreshMessages(false);
  }, [refreshMessages]);

  const closeChat = useCallback(() => {
    soundFx.playClick();
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    soundFx.playClick();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        refreshMessages(false);
      }
      return next;
    });
  }, [refreshMessages]);

  const setChannel = useCallback((channel: ChatChannel) => {
    soundFx.playClick();
    setCurrentChannel(channel);
  }, []);

  // Envoi de message
  const sendMessage = useCallback(
    async (
      text: string,
      category?: FeedbackCategory,
      scoreData?: { game: string; score: number; mode: string } | null
    ): Promise<{ success: boolean; error?: string; warning?: string }> => {
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Vous devez être connecté à un compte pour participer au tchat.',
        };
      }

      if (cooldownSeconds > 0) {
        return { success: false, error: `Veuillez patienter ${cooldownSeconds}s.` };
      }

      setIsSending(true);

      const res = await sendChatMessage({
        channel: currentChannel,
        text,
        username: profile.username,
        avatarId: profile.avatarId,
        title: profile.title,
        activeFrame: profile.activeFrame,
        steamId: profile.steam?.steamId,
        email: profile.email,
        userId: profile.id,
        category,
        scoreData,
      });

      setIsSending(false);

      if (res.success && res.message) {
        soundFx.playClick();
        knownMessageIdsRef.current.add(res.message.id);

        // Ajout immédiat en local pour fluidité instantanée
        setAllMessages((prev) => ({
          ...prev,
          [currentChannel]: [...(prev[currentChannel] || []), res.message!],
        }));

        if (res.message.timestamp) {
          lastServerTimeRef.current = Math.max(lastServerTimeRef.current, res.message.timestamp);
        }

        // Démarrage du cooldown de 3s
        setCooldownSeconds(3);
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return { success: true };
      }

      if (res.warning) {
        setModerationWarning(res.warning);
      }

      return {
        success: false,
        error: res.error || 'Impossible d\'envoyer le message.',
        warning: res.warning,
      };
    },
    [isAuthenticated, cooldownSeconds, currentChannel, profile]
  );

  // Modération / suppression de message
  const deleteMessage = useCallback(
    async (messageId: string): Promise<{ success: boolean; message?: string }> => {
      const isActualAdmin = Boolean(isAdmin || isCreator || profile.isAdmin || profile.role === 'admin');
      const isActualMod = Boolean(isModerator || profile.isModerator || profile.role === 'moderator');

      const res = await deleteChatMessage(messageId, {
        steamId: profile.steam?.steamId,
        userId: profile.id,
        email: profile.email,
        username: profile.username,
        role: profile.role,
        isAdmin: isActualAdmin,
        isModerator: isActualMod,
      });

      if (res.success) {
        soundFx.playClick();
        setAllMessages((prev) => {
          const next = { ...prev };
          for (const ch of Object.keys(next) as ChatChannel[]) {
            next[ch] = next[ch].map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    isDeleted: true,
                    text:
                      m.username === profile.username
                        ? '[Message retiré par l\'auteur]'
                        : (isActualAdmin
                            ? '[Message retiré par l\'administrateur]'
                            : '[Message retiré par la modération]'),
                  }
                : m
            );
          }
          return next;
        });
        return { success: true };
      }

      return { success: false, message: res.message || 'Erreur lors de la modération du message.' };
    },
    [profile, isAdmin, isCreator, isModerator]
  );

  const activeMessages = useMemo(() => {
    return allMessages[currentChannel] || [];
  }, [allMessages, currentChannel]);

  const value = useMemo(
    () => ({
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      currentChannel,
      setChannel,
      messages: activeMessages,
      allMessages,
      isLoading,
      isSending,
      unreadCount,
      cooldownSeconds,
      sendMessage,
      deleteMessage,
      moderationWarning,
      setModerationWarning,
      refreshMessages,
    }),
    [
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      currentChannel,
      setChannel,
      activeMessages,
      allMessages,
      isLoading,
      isSending,
      unreadCount,
      cooldownSeconds,
      sendMessage,
      deleteMessage,
      moderationWarning,
      setModerationWarning,
      refreshMessages,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
