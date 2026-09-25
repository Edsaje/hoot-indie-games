import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Minus,
  Send,
  MessageSquare,
  Crown,
  Lightbulb,
  Trophy,
  Smile,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Trash2,
  ChevronDown,
  LogIn,
  RotateCw,
  ExternalLink,
  Lock,
  Languages,
} from 'lucide-react';
import { useChat } from '../../context/useChat';
import { useUserAccount } from '../../context/useUserAccount';
import {
  CHAT_CHANNELS,
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
  type ChatModerationLog,
  type ChatMessage,
  fetchChatModerationLogs,
  dismissChatModerationLog,
  checkTextForPhishing,
} from '../../services/chatService';
import { translateChatMessage } from '../../services/translationService';
import { INDIE_AVATARS } from '../../data/avatars';
import { getFrameDefinition } from '../../utils/featherEconomy';
import { soundFx } from '../../utils/audio';
import { ChatUserModerationModal } from './ChatUserModerationModal';

const QUICK_EMOJIS = ['🦉', '🎮', '💎', '🏆', '✨', '❤️', '🔥', '👏', '👋', '🎉'];

export interface ChatDrawerProps {
  onOpenAuth?: () => void;
  isModalActive?: boolean;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ onOpenAuth, isModalActive = false }) => {
  const { t, i18n } = useTranslation();
  const {
    isOpen,
    openChat,
    closeChat,
    currentChannel,
    setChannel,
    messages,
    isLoading,
    isSending,
    unreadCount,
    cooldownSeconds,
    sendMessage,
    deleteMessage,
    moderationWarning,
    setModerationWarning,
  } = useChat();

  const { profile, isAuthenticated, isAdmin, isCreator, isModerator } = useUserAccount();
  const isStrictAdmin = Boolean(
    isAdmin || isCreator || profile.role === 'admin' || profile.isAdmin
  );
  const isStrictModerator = Boolean(
    !isStrictAdmin && (isModerator || profile.role === 'moderator' || profile.isModerator)
  );
  const canModerate = isStrictAdmin || isStrictModerator;

  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>('suggestion');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper i18n pour salons et catégories
  const getChannelName = (chId: string, fallback: string) =>
    t(`chat.channels.${chId}.name`, fallback);
  const getChannelDesc = (chId: string, fallback: string) =>
    t(`chat.channels.${chId}.desc`, fallback);
  const getCategoryLabel = (catId: string, fallback: string) =>
    t(`chat.categories.${catId}`, fallback);

  // Traduction automatique et par message
  const [isAutoTranslate, setIsAutoTranslate] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('hoot_chat_auto_translate') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingMsgIds, setTranslatingMsgIds] = useState<Record<string, boolean>>({});
  const [showOriginalMsgIds, setShowOriginalMsgIds] = useState<Record<string, boolean>>({});

  const handleTranslateSingleMessage = async (msg: { id: string; text: string; channel: string }) => {
    if (translatingMsgIds[msg.id] || !msg.text) return;
    setTranslatingMsgIds((prev) => ({ ...prev, [msg.id]: true }));
    soundFx.playClick();
    const res = await translateChatMessage(msg.text, i18n.language, msg.channel);
    setTranslatingMsgIds((prev) => ({ ...prev, [msg.id]: false }));
    if (res.success && res.translatedText !== msg.text) {
      setTranslations((prev) => ({ ...prev, [msg.id]: res.translatedText }));
      setShowOriginalMsgIds((prev) => ({ ...prev, [msg.id]: false }));
    }
  };

  // Auto-traduction des messages si le mode est activé
  useEffect(() => {
    if (!isAutoTranslate || !isOpen || messages.length === 0) return;
    const userLang = i18n.language;

    messages.forEach((msg) => {
      if (msg.isDeleted || !msg.text || translations[msg.id] || translatingMsgIds[msg.id]) return;
      translateChatMessage(msg.text, userLang, msg.channel).then((res) => {
        if (res.success && res.translatedText !== msg.text) {
          setTranslations((prev) => ({ ...prev, [msg.id]: res.translatedText }));
        }
      });
    });
  }, [isAutoTranslate, isOpen, messages, i18n.language, translations, translatingMsgIds]);

  // Guide de prévention & anti-hameçonnage
  const [showSecurityGuide, setShowSecurityGuide] = useState(false);

  // Confirmation de redirection pour lien externe sécurisé
  const [externalLinkToConfirm, setExternalLinkToConfirm] = useState<string | null>(null);

  // Vue du Journal de modération anti-injure et anti-phishing
  const [showModLogs, setShowModLogs] = useState(false);
  const [modLogs, setModLogs] = useState<ChatModerationLog[]>([]);
  const [loadingModLogs, setLoadingModLogs] = useState(false);

  const loadModLogs = useCallback(async () => {
    if (!canModerate) return;
    setLoadingModLogs(true);
    const res = await fetchChatModerationLogs({
      steamId: profile.steam?.steamId,
      userId: profile.id,
    });
    if (res.success && Array.isArray(res.logs)) {
      setModLogs(res.logs);
    }
    setLoadingModLogs(false);
  }, [canModerate, profile.steam?.steamId, profile.id]);

  useEffect(() => {
    if (showModLogs) {
      loadModLogs();
    }
  }, [showModLogs, loadModLogs]);

  const handleDismissLog = async (logId: string) => {
    soundFx.playClick();
    await dismissChatModerationLog(logId, {
      steamId: profile.steam?.steamId,
      userId: profile.id,
    });
    setModLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // Modale de modération d'un profil utilisateur (accessible pour Hibouxe et les modérateurs)
  const [userToModerate, setUserToModerate] = useState<{
    username: string;
    userId?: string;
    steamId?: string;
    avatarId?: string;
    title?: string;
    activeFrame?: string;
    isCreator?: boolean;
    isModerator?: boolean;
  } | null>(null);

  // Modale d'action de suppression / effacement d'un message
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);

  const canDeleteMessage = (msg: ChatMessage): boolean => {
    if (!isAuthenticated) return false;

    const isMe = Boolean(
      (profile.username && msg.username && msg.username.toLowerCase() === profile.username.toLowerCase()) ||
      (profile.id && msg.userId && msg.userId === profile.id) ||
      (profile.steam?.steamId && msg.steamId && msg.steamId === profile.steam.steamId)
    );

    // 1. Admin / Créateur : peut supprimer ou effacer TOUS les messages (les siens, ceux des modos, ceux des utilisateurs)
    if (isStrictAdmin) {
      return true;
    }

    // 2. Modérateur : peut supprimer UNIQUEMENT les messages des utilisateurs et son propre message
    if (isStrictModerator) {
      // Ne peut JAMAIS supprimer le message du créateur / admin
      if (msg.isCreator) {
        return false;
      }
      // Ne peut pas supprimer le message d'un autre modérateur
      if (msg.isModerator && !isMe) {
        return false;
      }
      // Son propre message ou message utilisateur ordinaire
      return true;
    }

    // 3. Utilisateur standard : peut supprimer ou faire disparaître son propre message
    if (isMe) {
      return true;
    }

    return false;
  };

  const handleDeleteMessage = (msg: ChatMessage) => {
    soundFx.playClick();
    setMessageToDelete(msg);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll en bas à l'arrivée d'un message ou ouverture
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, currentChannel]);

  // Focus automatique du champ à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const currentChannelInfo =
    CHAT_CHANNELS.find((c) => c.id === currentChannel) || CHAT_CHANNELS[0];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        window.dispatchEvent(new CustomEvent('hoot_open_auth'));
      }
      return;
    }
    const trimmed = inputText.trim();
    if (!trimmed || isSending || cooldownSeconds > 0) return;

    // Pré-validation client-side anti-hameçonnage
    const clientPhishingCheck = checkTextForPhishing(trimmed, canModerate);
    if (clientPhishingCheck.isSuspicious) {
      soundFx.playError();
      setModerationWarning(
        clientPhishingCheck.warning ||
          '🛡️ Bouclier Sécurité & Anti-Hameçonnage : Ce message contient un lien ou motif suspect non autorisé.'
      );
      return;
    }

    setErrorMessage(null);
    const categoryToSend = currentChannel === 'feedback' ? selectedCategory : undefined;

    const res = await sendMessage(trimmed, categoryToSend);
    if (res.success) {
      setInputText('');
    } else if (res.warning) {
      soundFx.playError();
    } else if (res.error) {
      setErrorMessage(res.error);
      soundFx.playError();
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    soundFx.playClick();
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTimestamp = (ts: number): string => {
    if (!ts) return '';
    const date = new Date(ts * 1000);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (isToday) {
      return `${hours}:${minutes}`;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  };

  const getAvatarInfo = (avatarId: string) => {
    const avatar = INDIE_AVATARS.find((a) => a.id === avatarId);
    if (avatar) {
      return {
        emoji: avatar.emoji,
        name: avatar.name,
        bgGradient: avatar.bgGradient,
        imageUrl: avatar.imageUrl,
      };
    }
    return {
      emoji: '🦉',
      name: 'Hibou',
      bgGradient: 'from-amber-700 to-amber-900',
    };
  };

  // Rendu sécurisé des messages avec confirmation sur les liens externes
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playClick();
              setExternalLinkToConfirm(part);
            }}
            className="text-amber-300 underline hover:text-amber-200 transition-colors inline-flex items-center gap-0.5 break-all cursor-pointer font-medium"
            title="Lien externe - Cliquez pour vérifier la redirection sécurisée"
          >
            <span>{part}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 inline ml-0.5 opacity-80" />
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // 1. Bouton flottant détaché en bas à droite lorsque la fenêtre est fermée / réduite
  if (!isOpen) {
    if (isModalActive) return null;
    return (
      <button
        type="button"
        onClick={() => openChat()}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-[50] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#06241b]/95 hover:bg-[#093a2b] border-2 border-[#78350f] hover:border-amber-400 text-amber-200 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title={t('chat.open')}
        aria-label={t('chat.discussion')}
      >
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:text-amber-300 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold flex items-center justify-center animate-bounce">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="font-extrabold tracking-wide">{t('chat.discussion')}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
      </button>
    );
  }

  // 2. Fenêtre de discussion détachée — Rectangle flottant en bas à droite
  return (
    <div className={`fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] right-3 sm:bottom-6 sm:right-6 z-[55] w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[440px] h-[540px] max-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] rounded-2xl bg-[#04120e] text-[#f1f5f9] border-2 border-[#78350f] shadow-[0_12px_45px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${isModalActive ? 'opacity-20 pointer-events-none' : ''}`}>
      {/* Entête avec Titre "Discussion", Sélecteur de Canaux & Commandes Réduire / Fermer */}
      <div className="p-3 bg-[#061e16] border-b border-[#059669]/30 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#059669]/20 border border-[#059669]/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-200 flex items-center gap-1.5 leading-tight">
                <span>{t('chat.discussion')}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {t('chat.live')}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Bouton Traduction Automatique du Tchat */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsAutoTranslate((prev) => {
                  const next = !prev;
                  try {
                    localStorage.setItem('hoot_chat_auto_translate', String(next));
                  } catch {
                    // Ignore
                  }
                  return next;
                });
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isAutoTranslate
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={isAutoTranslate ? t('chat.autoTranslateActive') : t('chat.autoTranslate')}
              aria-label={t('chat.autoTranslate')}
            >
              <Languages className={`w-3.5 h-3.5 ${isAutoTranslate ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[10px] hidden sm:inline">{t('chat.autoTranslate')}</span>
            </button>

            {/* Bouton Journal de Modération (si admin ou modérateur) */}
            {canModerate && (
              <button
                type="button"
                onClick={() => setShowModLogs((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  showModLogs
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-400/50'
                    : 'text-blue-300/80 hover:text-white hover:bg-blue-900/30'
                }`}
                title="Journal des alertes de modération anti-injure"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] hidden sm:inline">Modération</span>
              </button>
            )}

            {/* Bouton Réduire */}
            <button
              onClick={closeChat}
              className="p-1 rounded-lg text-emerald-300/80 hover:text-white hover:bg-emerald-800/40 transition-colors cursor-pointer"
              title={t('chat.minimize')}
              aria-label={t('chat.minimize')}
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Bouton Fermer */}
            <button
              onClick={closeChat}
              className="p-1 rounded-lg text-emerald-300/80 hover:text-white hover:bg-emerald-800/40 transition-colors cursor-pointer"
              title={t('chat.close')}
              aria-label={t('chat.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barre du sélecteur de Salon / Langue */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowChannelDropdown((prev) => !prev)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#020d0a] border border-[#78350f]/60 hover:border-amber-500/60 text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm">{currentChannelInfo.icon}</span>
              <span className="text-amber-100 font-bold">
                {getChannelName(currentChannelInfo.id, currentChannelInfo.name)}
              </span>
              <span className="text-[11px] text-emerald-400/70 truncate hidden sm:inline">
                — {getChannelDesc(currentChannelInfo.id, currentChannelInfo.description)}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform ${
                showChannelDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu déroulant des Salons */}
          {showChannelDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#03150f] border-2 border-[#78350f] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 max-h-64 overflow-y-auto">
              <div className="px-2 py-0.5 text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                {t('chat.channelsDropdownTitle', 'Salons & Retours')}
              </div>
              {CHAT_CHANNELS.map((ch) => {
                const isSelected = ch.id === currentChannel;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChannel(ch.id);
                      setShowChannelDropdown(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#059669]/30 text-amber-200 font-bold border border-emerald-500/50'
                        : 'text-slate-300 hover:bg-emerald-950/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm shrink-0">{ch.icon}</span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-100">
                          {getChannelName(ch.id, ch.label)}
                        </div>
                        <div className="text-[10px] text-emerald-400/70 truncate">
                          {getChannelDesc(ch.id, ch.description)}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-900/60 px-1 py-0.2 rounded font-bold shrink-0">
                        {t('chat.activeChannel', 'Actif')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bandeau contextuel / Catégories pour Feedback (Conteneur fluide sans dépassement) */}
        {currentChannel === 'feedback' && (
          <div className="flex flex-col gap-1 pt-0.5 w-full max-w-full overflow-hidden">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>{t('chat.feedbackCategory')}</span>
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 w-full max-w-full">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const isCatSelected = selectedCategory === cat.id;
                const catLabel = getCategoryLabel(cat.id, cat.label);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium whitespace-nowrap border transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                      isCatSelected
                        ? `${cat.badgeColor} ring-1 ring-amber-400 font-bold bg-amber-500/20`
                        : 'bg-[#020d0a] text-slate-400 border-slate-700/80 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{catLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bandeau de Prévention Sécurité & Anti-Hameçonnage */}
        <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-200/90 truncate">
              <span className="font-bold text-emerald-300">{t('chat.security.tipPrefix')} </span>
              {t('chat.security.tip')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowSecurityGuide(true);
            }}
            className="text-[10px] font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {t('chat.security.vigilanceBtn')}
          </button>
        </div>
      </div>

      {/* Vue modérateur : Journal des incidents anti-injure & anti-phishing OU Fil des messages */}
      {showModLogs ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#020d0a] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-blue-500/30">
            <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Modération & Sécurité ({modLogs.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={loadModLogs}
                disabled={loadingModLogs}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 text-xs cursor-pointer"
                title="Rafraîchir"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingModLogs ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setShowModLogs(false)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Retour tchat
              </button>
            </div>
          </div>

          {loadingModLogs ? (
            <div className="flex items-center justify-center h-40 text-blue-400 text-xs animate-pulse">
              Chargement des signalements...
            </div>
          ) : modLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 p-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-xl mb-1.5">
                🕊️
              </div>
              <p className="font-bold text-emerald-300 text-xs">Aucun incident de modération</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Le tchat est sécurisé, courtois et respectueux.</p>
            </div>
          ) : (
            modLogs.map((log) => {
              const isPhishing = log.type === 'phishing_blocked' || log.id.startsWith('mod_phish_');
              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                    isPhishing ? 'bg-rose-950/20 border-rose-500/40' : 'bg-[#03150f] border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-amber-200">{log.username}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{log.channel}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isPhishing ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          <span>Phishing bloqué</span>
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Propos inappropriés
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismissLog(log.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-100 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded transition cursor-pointer"
                      title="Archiver ce rapport"
                    >
                      Archiver
                    </button>
                  </div>

                  <div
                    className={`text-[11px] px-2 py-1 rounded-lg ${
                      isPhishing
                        ? 'text-rose-200 bg-rose-950/60 border border-rose-500/40'
                        : 'text-amber-200 bg-amber-950/40 border border-amber-500/30'
                    }`}
                  >
                    <span className="font-bold">
                      {isPhishing ? 'Motifs d\'hameçonnage : ' : 'Mots détectés : '}
                    </span>
                    {log.flaggedWords.join(', ')}
                  </div>

                  <div className="text-[11px] text-slate-300 bg-black/40 p-2 rounded-lg break-words">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">
                      {isPhishing ? 'Message neutralisé :' : 'Message bloqué :'}
                    </span>
                    "{log.originalText}"
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Fil des messages */
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gradient-to-b from-[#04120e] via-[#020d0a] to-[#04120e]">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-emerald-400 text-xs animate-pulse">
              Chargement de la discussion...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 p-3">
              <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-600/30 flex items-center justify-center text-xl mb-1.5">
                {currentChannelInfo.icon}
              </div>
              <p className="font-bold text-amber-200 text-xs">
                Soyez le premier à participer !
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs leading-relaxed">
                {currentChannel === 'feedback'
                  ? 'Une suggestion, un coup de cœur ou un signalement ? Partagez-le avec l\'équipe !'
                  : 'Partagez vos impressions et discutez entre explorateurs de jeux indépendants.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCreatorMsg = Boolean(
                msg.isCreator ||
                msg.avatarId === 'hibouxe_creator' ||
                (msg.title && msg.title.toLowerCase().includes('créateur'))
              );
              const isMe = Boolean(
                (profile.username && (msg.username.toLowerCase() === profile.username.toLowerCase() || (isStrictAdmin && isCreatorMsg))) ||
                (profile.id && msg.userId && msg.userId === profile.id) ||
                (profile.steam?.steamId && msg.steamId && msg.steamId === profile.steam.steamId)
              );
              const avatar = getAvatarInfo(isCreatorMsg ? 'hibouxe_creator' : msg.avatarId);
              const frameDef = getFrameDefinition(msg.activeFrame);

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 group transition-opacity ${
                    isMe ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar avec cadre éventuel */}
                  <div
                    onClick={() => {
                      if (canModerate) {
                        soundFx.playClick();
                        setUserToModerate({
                          username: isCreatorMsg && msg.username.startsWith('Explorateur_') ? 'Hibouxe' : msg.username,
                          userId: msg.userId,
                          steamId: msg.steamId,
                          avatarId: isCreatorMsg ? 'hibouxe_creator' : msg.avatarId,
                          title: msg.title,
                          activeFrame: msg.activeFrame,
                          isCreator: isCreatorMsg,
                          isModerator: msg.isModerator,
                        });
                      }
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-gradient-to-br ${
                      avatar.bgGradient
                    } ${frameDef.borderClass} ${frameDef.glowClass || ''} shadow-md overflow-hidden ${
                      canModerate ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all hover:scale-105' : ''
                    }`}
                    title={canModerate ? `Modérer le profil de ${msg.username}` : avatar.name}
                  >
                    {avatar.imageUrl ? (
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{avatar.emoji}</span>
                    )}
                  </div>

                  {/* Corps du message */}
                  <div
                    className={`flex flex-col max-w-[84%] ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Header info utilisateur */}
                    <div className="flex items-center gap-1.5 mb-0.5 px-0.5 flex-wrap">
                      {(() => {
                        const isCreatorMsg = Boolean(
                          msg.isCreator ||
                          msg.avatarId === 'hibouxe_creator' ||
                          (msg.title && msg.title.toLowerCase().includes('créateur'))
                        );
                        const authorDisplayName = (isCreatorMsg && msg.username.startsWith('Explorateur_')) ? 'Hibouxe' : msg.username;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (canModerate) {
                                soundFx.playClick();
                                setUserToModerate({
                                  username: authorDisplayName,
                                  userId: msg.userId,
                                  steamId: msg.steamId,
                                  avatarId: isCreatorMsg ? 'hibouxe_creator' : msg.avatarId,
                                  title: msg.title,
                                  activeFrame: msg.activeFrame,
                                  isCreator: isCreatorMsg,
                                  isModerator: msg.isModerator,
                                });
                              }
                            }}
                            className={`font-bold text-[11px] text-amber-100 flex items-center gap-1 text-left ${
                              canModerate ? 'cursor-pointer hover:underline hover:text-amber-300' : ''
                            }`}
                            title={canModerate ? `Modérer le profil de ${authorDisplayName}` : undefined}
                          >
                            <span>{authorDisplayName}</span>
                            {isCreatorMsg && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold"
                                title="Créateur & Développeur officiel"
                              >
                                <Crown className="w-2.5 h-2.5 text-amber-400" />
                                Créateur
                              </span>
                            )}
                            {msg.isModerator && !isCreatorMsg && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/50 font-bold"
                                title="Modérateur officiel"
                              >
                                <Shield className="w-2.5 h-2.5 text-blue-400" />
                                Modérateur
                              </span>
                            )}
                          </button>
                        );
                      })()}

                      {msg.title && (
                        <span className="text-[10px] text-emerald-400/80 truncate max-w-[100px]">
                          • {msg.title}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>

                    {/* Badge catégorie pour les retours */}
                    {msg.channel === 'feedback' && msg.category && (
                      <div className="mb-0.5">
                        {(() => {
                          const catInfo = FEEDBACK_CATEGORIES.find((c) => c.id === msg.category);
                          const catLabel = getCategoryLabel(msg.category, catInfo?.label || msg.category);
                          return (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full border inline-flex items-center gap-1 ${
                                catInfo?.badgeColor || 'bg-emerald-900/40 text-emerald-300'
                              }`}
                            >
                              <span>{catInfo?.icon}</span>
                              <span className="font-semibold">{catLabel}</span>
                            </span>
                          );
                        })()}
                      </div>
                    )}

                    {/* Bulle de texte et action modération */}
                    <div className="flex items-center gap-1 group/bubble">
                      <div
                        className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed shadow border ${
                          msg.isDeleted
                            ? 'bg-[#020d0a]/80 text-slate-400 border-slate-700/40 italic'
                            : isMe
                            ? 'bg-[#064e3b]/90 text-emerald-50 border-[#059669]/60 rounded-tr-none'
                            : (msg.isCreator || msg.avatarId === 'hibouxe_creator' || (msg.title && msg.title.toLowerCase().includes('créateur')))
                            ? 'bg-[#291b07]/90 text-amber-100 border-amber-500/50 rounded-tl-none ring-1 ring-amber-500/30'
                            : msg.isModerator
                            ? 'bg-[#091b2c]/90 text-blue-100 border-blue-500/40 rounded-tl-none'
                            : 'bg-[#061e16]/90 text-slate-200 border-[#78350f]/40 rounded-tl-none'
                        }`}
                      >
                        {(() => {
                          const isTranslated = Boolean(translations[msg.id]) && !showOriginalMsgIds[msg.id];
                          const textToRender = isTranslated ? translations[msg.id] : msg.text;
                          const hasTranslation = Boolean(translations[msg.id]);

                          return (
                            <>
                              <p className="whitespace-pre-wrap break-words">
                                {msg.isDeleted ? msg.text : renderMessageContent(textToRender)}
                              </p>

                              {/* Indicateur de traduction et bascule Original/Traduit */}
                              {hasTranslation && !msg.isDeleted && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-300/80 font-mono">
                                  <Languages className="w-3 h-3 text-amber-400" />
                                  <span>{isTranslated ? t('chat.translated') : 'Original'}</span>
                                  <span>•</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowOriginalMsgIds((prev) => ({
                                        ...prev,
                                        [msg.id]: !prev[msg.id],
                                      }))
                                    }
                                    className="underline hover:text-white cursor-pointer"
                                  >
                                    {isTranslated ? t('chat.showOriginal') : t('chat.translated')}
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Carte de score partagé éventuelle */}
                        {msg.scoreData && !msg.isDeleted && (
                          <div className="mt-1.5 p-1.5 rounded-lg bg-black/40 border border-amber-500/30 flex items-center gap-1.5 text-[11px] text-amber-200">
                            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-white">{msg.scoreData.game}</span> —{' '}
                              <span>Score : {msg.scoreData.score}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bouton de traduction manuelle par message */}
                      {!msg.isDeleted && !translations[msg.id] && (
                        <button
                          type="button"
                          onClick={() => handleTranslateSingleMessage(msg)}
                          disabled={translatingMsgIds[msg.id]}
                          className="opacity-0 group-hover/bubble:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition cursor-pointer self-center shrink-0"
                          title={t('chat.translate')}
                        >
                          <Languages className={`w-3.5 h-3.5 ${translatingMsgIds[msg.id] ? 'animate-spin text-amber-400' : ''}`} />
                        </button>
                      )}

                      {canDeleteMessage(msg) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg)}
                          className={`p-1 rounded transition cursor-pointer self-center shrink-0 ${
                            msg.isDeleted
                              ? 'opacity-60 hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                              : 'opacity-0 group-hover/bubble:opacity-100 focus:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          title={
                            msg.isDeleted
                              ? 'Faire disparaître définitivement ce message retiré'
                              : isStrictAdmin
                              ? msg.username === profile.username
                                ? 'Supprimer ou faire disparaître mon message'
                                : `Modérer ce message de ${msg.username}`
                              : msg.username === profile.username
                              ? 'Supprimer ou faire disparaître mon message'
                              : `Modérer ce message de ${msg.username}`
                          }
                          aria-label="Supprimer ou faire disparaître le message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Avertissement visible de modération (anti-injure ou anti-phishing) */}
      {moderationWarning && (
        <div className="p-2.5 bg-amber-950/95 border-t border-amber-500/60 text-amber-200 text-xs flex items-start justify-between gap-2 animate-in fade-in shrink-0">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Alerte de Sécurité & Modération</p>
              <p className="text-[11px] text-amber-100/90 leading-tight mt-0.5">
                {moderationWarning}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModerationWarning(null)}
            className="text-amber-400 hover:text-white p-1 rounded hover:bg-amber-900/40 cursor-pointer"
            title="Fermer l'avertissement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Barre d'erreur éventuelle */}
      {errorMessage && (
        <div className="px-3 py-1.5 bg-rose-950/80 border-t border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Barre de saisie inférieure ou invite de connexion */}
      {isAuthenticated ? (
        <div className="p-2.5 bg-[#061e16] border-t border-[#059669]/30 flex flex-col gap-1.5 shrink-0">
          {/* Barre de réactions rapides / emojis */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] text-emerald-400/70 shrink-0 flex items-center gap-0.5 mr-0.5">
              <Smile className="w-3 h-3" />
            </span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-[#020d0a] hover:bg-emerald-900/60 border border-[#78350f]/40 text-xs flex items-center justify-center shrink-0 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title={`Insérer ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSend} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={350}
                placeholder={
                  currentChannel === 'feedback'
                    ? t('chat.feedbackPlaceholder')
                    : `${t('chat.placeholder')}`
                }
                className="w-full px-3 py-2 rounded-xl bg-[#020d0a] border border-[#78350f]/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/60 placeholder:text-slate-500"
              />
              <span className="absolute right-2 bottom-1.5 text-[9px] text-slate-500">
                {inputText.length}/350
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isSending || cooldownSeconds > 0}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-md shrink-0 cursor-pointer ${
                !inputText.trim() || isSending || cooldownSeconds > 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white hover:from-emerald-500 hover:to-amber-500 border border-amber-400/50 shadow-emerald-950/40 active:scale-95'
              }`}
            >
              {cooldownSeconds > 0 ? (
                <span>⏳ {cooldownSeconds}s</span>
              ) : isSending ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('chat.send')}</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Note de prévention discrète sous l'input */}
          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400/80">
              <Lock className="w-2.5 h-2.5" />
              <span>Bouclier anti-hameçonnage actif</span>
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowSecurityGuide(true);
              }}
              className="hover:text-amber-300 transition-colors underline cursor-pointer"
            >
              {t('chat.security.vigilanceBtn')}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#061e16] border-t border-[#059669]/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                Mode lecture seule
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                Connectez-vous pour envoyer des messages et échanger avec la communauté.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              if (onOpenAuth) {
                onOpenAuth();
              } else {
                window.dispatchEvent(new CustomEvent('hoot_open_auth'));
              }
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer touch-manipulation whitespace-nowrap active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t('chat.signIn')}</span>
          </button>
        </div>
      )}

      {/* Volet / Modale du Guide de Prévention & Anti-Hameçonnage */}
      {showSecurityGuide && (
        <div className="absolute inset-0 z-50 bg-[#03150f]/95 backdrop-blur-md p-4 flex flex-col justify-between animate-in fade-in overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-200 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('chat.security.guideTitle')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                title={t('chat.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t('chat.security.guideIntro')}
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 flex items-start gap-2.5">
                <span className="text-base leading-none">🔑</span>
                <div>
                  <h5 className="font-bold text-emerald-300">{t('chat.security.rule1Title')}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {t('chat.security.rule1Desc')}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30 flex items-start gap-2.5">
                <span className="text-base leading-none">🚫</span>
                <div>
                  <h5 className="font-bold text-amber-300">{t('chat.security.rule2Title')}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {t('chat.security.rule2Desc')}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-blue-500/30 flex items-start gap-2.5">
                <span className="text-base leading-none">👑</span>
                <div>
                  <h5 className="font-bold text-blue-300">{t('chat.security.rule3Title')}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {t('chat.security.rule3Desc')}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/30 flex items-start gap-2.5">
                <span className="text-base leading-none">🛡️</span>
                <div>
                  <h5 className="font-bold text-rose-300">{t('chat.security.rule4Title')}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {t('chat.security.rule4Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setShowSecurityGuide(false)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {t('chat.security.understandBtn')}
            </button>
          </div>
        </div>
      )}

      {/* Modale de confirmation de redirection externe sécurisée */}
      {externalLinkToConfirm && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-[#03150f] border-2 border-amber-500/60 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{t('chat.security.externalTitle')}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('chat.security.externalWarning')}
            </p>
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-amber-200 break-all select-all">
              {externalLinkToConfirm}
            </div>
            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200 leading-tight">
              ⚠️ <strong>{t('chat.security.externalRule')}</strong>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setExternalLinkToConfirm(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                {t('chat.security.cancel')}
              </button>
              <a
                href={externalLinkToConfirm}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={() => setExternalLinkToConfirm(null)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1 cursor-pointer"
              >
                <span>{t('chat.security.proceed')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modale de modération d'un profil joueur (clic sur pseudo / avatar pour Hibouxe et modérateurs) */}
      <ChatUserModerationModal
        isOpen={Boolean(userToModerate)}
        onClose={() => setUserToModerate(null)}
        targetUser={userToModerate}
        onUserPurged={() => {
          setTimeout(() => setUserToModerate(null), 1000);
        }}
      />

      {/* Modale de confirmation de suppression / effacement d'un message */}
      {messageToDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setMessageToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#04120e] border border-emerald-500/40 p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>{messageToDelete.isDeleted ? 'Effacement définitif' : 'Gestion du message'}</span>
              </div>
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              <p className="font-semibold text-amber-200 mb-1">
                Auteur : {messageToDelete.username}
              </p>
              <div className="p-2 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-400 italic break-words line-clamp-3">
                "{messageToDelete.text}"
              </div>
            </div>

            {messageToDelete.isDeleted ? (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Ce message a déjà été masqué. Souhaitez-vous le faire disparaître définitivement de la base et du salon ?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMessageToDelete(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const msg = messageToDelete;
                      setMessageToDelete(null);
                      const res = await deleteMessage(msg.id, true);
                      if (!res.success && res.message) {
                        setErrorMessage(res.message);
                        setTimeout(() => setErrorMessage(null), 4000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Faire disparaître
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-300">
                  Choisissez l'action à appliquer :
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const msg = messageToDelete;
                      setMessageToDelete(null);
                      const res = await deleteMessage(msg.id, true);
                      if (!res.success && res.message) {
                        setErrorMessage(res.message);
                        setTimeout(() => setErrorMessage(null), 4000);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs transition cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Faire disparaître complètement</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Efface physiquement le message du salon pour tout le monde.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const msg = messageToDelete;
                      setMessageToDelete(null);
                      const res = await deleteMessage(msg.id, false);
                      if (!res.success && res.message) {
                        setErrorMessage(res.message);
                        setTimeout(() => setErrorMessage(null), 4000);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 text-slate-300 text-xs transition cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Masquer le texte uniquement</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Remplace le texte par [Message retiré], la bulle reste visible.
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setMessageToDelete(null)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
