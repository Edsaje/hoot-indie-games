import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  Smile,
  Search,
  UserPlus,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useChat } from '../../context/useChat';
import { useUserAccount } from '../../context/useUserAccount';
import { useFriends } from '../../context/useFriends';
import {
  type PrivateMessage,
  checkTextForPhishing,
} from '../../services/chatService';
import { INDIE_AVATARS } from '../../data/avatars';
import { getFrameDefinition } from '../../utils/featherEconomy';
import { soundFx } from '../../utils/audio';
import { SteamIcon } from '../common/SteamIcon';

const QUICK_EMOJIS = ['🦉', '🎮', '💎', '🏆', '✨', '❤️', '🔥', '👏', '👋', '🎉'];

export interface ChatPrivateViewProps {
  onOpenAuth?: () => void;
  onOpenProfile?: (username: string) => void;
}

export const ChatPrivateView: React.FC<ChatPrivateViewProps> = ({ onOpenAuth }) => {
  const {
    privateConversations,
    activePrivateConversationId,
    setActivePrivateConversationId,
    activePrivateMessages,
    activePrivateParticipant,
    openPrivateChat,
    sendPrivateMsg,
    deletePrivateMsg,
    refreshPrivateConversations,
    refreshPrivateMessages,
    cooldownSeconds,
    isSending,
    setModerationWarning,
  } = useChat();

  const { profile, isAuthenticated, isAdmin, isCreator, isModerator } = useUserAccount();
  const { friends, pendingRequests, sentRequests, sendFriendRequest } = useFriends();

  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [newConvUsername, setNewConvUsername] = useState('');
  const [newConvError, setNewConvError] = useState<string | null>(null);
  const [newConvSuccess, setNewConvSuccess] = useState<string | null>(null);
  const [isSendingFriendReq, setIsSendingFriendReq] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<PrivateMessage | null>(null);
  const [externalLinkToConfirm, setExternalLinkToConfirm] = useState<string | null>(null);

  const mutualFriendsList = useMemo(() => {
    return friends.filter((f) => f.isMutual !== false);
  }, [friends]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll en bas quand les messages changent
  useEffect(() => {
    if (activePrivateConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activePrivateMessages, activePrivateConversationId]);

  // Focus automatique du champ texte à l'ouverture d'un fil
  useEffect(() => {
    if (activePrivateConversationId) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activePrivateConversationId]);

  // Récupération systématique des messages à la sélection d'un fil
  useEffect(() => {
    if (activePrivateConversationId) {
      refreshPrivateMessages(activePrivateConversationId);
    }
  }, [activePrivateConversationId, refreshPrivateMessages]);

  const effectiveParticipant = useMemo(() => {
    if (activePrivateParticipant) return activePrivateParticipant;
    if (!activePrivateConversationId) return null;
    const found = privateConversations.find((c) => c.conversationId === activePrivateConversationId);
    if (found?.otherParticipant) return found.otherParticipant;
    const parts = activePrivateConversationId.split('__');
    if (parts.length === 2) {
      const myNorm = (profile.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const otherNorm = parts[0] === myNorm ? parts[1] : parts[0];
      return {
        username: otherNorm,
        avatarId: 'owl',
        title: 'Explorateur',
      };
    }
    return null;
  }, [activePrivateParticipant, activePrivateConversationId, privateConversations, profile.username]);

  // Formatage relatif des dates
  const formatTime = (ts: number): string => {
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
      name: 'Explorateur',
      bgGradient: 'from-emerald-800 to-teal-950',
    };
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      else window.dispatchEvent(new CustomEvent('hoot_open_auth'));
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed || isSending || cooldownSeconds > 0 || !activePrivateParticipant) return;

    // Pré-validation anti-hameçonnage côté client
    const canModerate = Boolean(isAdmin || isCreator || isModerator);
    const phishingCheck = checkTextForPhishing(trimmed, canModerate);
    if (phishingCheck.isSuspicious) {
      soundFx.playError();
      setModerationWarning(
        phishingCheck.warning ||
          '🛡️ Bouclier Sécurité & Anti-Hameçonnage : Ce message contient un lien ou motif suspect non autorisé.'
      );
      return;
    }

    const res = await sendPrivateMsg(
      activePrivateParticipant.username,
      trimmed,
      activePrivateParticipant
    );

    if (res.success) {
      setInputText('');
    } else {
      soundFx.playError();
      if (res.error) {
        setModerationWarning(res.error);
      }
    }
  };

  const handleStartNewConv = (e: React.FormEvent) => {
    e.preventDefault();
    const target = newConvUsername.trim();
    if (!target) return;

    if (profile.username && target.toLowerCase() === profile.username.toLowerCase()) {
      setNewConvError('Vous ne pouvez pas vous écrire à vous-même.');
      soundFx.playError();
      return;
    }

    const isTargetHibouxe = target.toLowerCase() === 'hibouxe';
    const foundMutual = friends.find(
      (f) =>
        (f.username.toLowerCase() === target.toLowerCase() ||
          f.friendCode.toUpperCase() === target.toUpperCase()) &&
        f.isMutual !== false
    );

    if (isTargetHibouxe || foundMutual) {
      soundFx.playClick();
      setNewConvError(null);
      setNewConvSuccess(null);
      setShowNewConvModal(false);
      setNewConvUsername('');
      if (foundMutual) {
        openPrivateChat(foundMutual.username, {
          avatarId: foundMutual.avatarId,
          title: foundMutual.title,
          steamId: foundMutual.steamId,
        });
      } else {
        openPrivateChat('Hibouxe', {
          avatarId: 'hibouxe_creator',
          title: 'Fondateur du Perchoir',
        });
      }
      return;
    }

    soundFx.playError();
    setNewConvSuccess(null);
    setNewConvError(
      `🛡️ ${target} ne fait pas encore partie de vos compagnons mutuels. Pour éviter les spams et arnaques, une demande d'amitié mutuelle est requise avant d'ouvrir un salon privé.`
    );
  };

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
            title="Lien externe - Vérifier la redirection sécurisée"
          >
            <span>{part}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 inline ml-0.5 opacity-80" />
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // -------------------------------------------------------------
  // VUE 1 : FIL DE DISCUSSION ACTIF AVEC UN JOUEUR
  // -------------------------------------------------------------
  const currentParticipant = activePrivateParticipant || effectiveParticipant;
  if (activePrivateConversationId && currentParticipant) {
    const otherAvatar = getAvatarInfo(currentParticipant.avatarId);
    const otherFrame = getFrameDefinition(currentParticipant.activeFrame);
    const isOtherCreator =
      currentParticipant.username.toLowerCase() === 'hibouxe' ||
      currentParticipant.avatarId === 'hibouxe_creator';

    const isMutualFriend =
      isOtherCreator ||
      friends.some(
        (f) =>
          f.username.toLowerCase() === currentParticipant.username.toLowerCase() &&
          f.isMutual !== false
      );

    const hasSentFriendReq = sentRequests.some(
      (r) => r.toUsername.toLowerCase() === currentParticipant.username.toLowerCase()
    );

    const hasReceivedFriendReq = pendingRequests.some(
      (r) => r.fromUsername.toLowerCase() === currentParticipant.username.toLowerCase()
    );

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#04120e] relative overflow-hidden">
        {/* Entête du fil privé */}
        <div className="px-3 py-2 bg-[#061e16] border-b border-[#059669]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActivePrivateConversationId(null);
                refreshPrivateConversations();
              }}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800/40 transition cursor-pointer shrink-0"
              title="Retour aux conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Avatar de l'interlocuteur */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-gradient-to-br ${
                otherAvatar.bgGradient
              } ${otherFrame.borderClass} ${otherFrame.glowClass || ''} shadow-md overflow-hidden relative`}
            >
              {otherAvatar.imageUrl ? (
                <img
                  src={otherAvatar.imageUrl}
                  alt={currentParticipant.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{otherAvatar.emoji}</span>
              )}
              {currentParticipant.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-xs text-white truncate">
                  {currentParticipant.username}
                </span>
                {isOtherCreator ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black shrink-0 flex items-center gap-1">
                    <span>👑</span>
                    <span>Fondateur</span>
                  </span>
                ) : isMutualFriend ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Compagnon Mutuel</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold shrink-0 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>Non-ami (Verrouillé)</span>
                  </span>
                )}
                {currentParticipant.steamId && (
                  <SteamIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-emerald-400/80 truncate">
                {currentParticipant.title || 'Explorateur sylvestre'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => refreshPrivateMessages()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/40 transition cursor-pointer text-xs flex items-center gap-1"
              title="Actualiser le fil"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Corps des messages du fil */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
          {activePrivateMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-slate-300">
                Début de votre correspondance privée avec {currentParticipant.username}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                Les échanges sont directs, sécurisés et protégés par le bouclier sylvestre.
              </p>
            </div>
          ) : (
            activePrivateMessages.map((msg) => {
              const isMe = Boolean(
                profile.username &&
                  msg.senderUsername.toLowerCase() === profile.username.toLowerCase()
              );
              const avatar = getAvatarInfo(msg.senderAvatarId);

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 group ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isMe && (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 bg-gradient-to-br ${avatar.bgGradient} overflow-hidden shadow-sm`}
                      title={msg.senderUsername}
                    >
                      {avatar.imageUrl ? (
                        <img src={avatar.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{avatar.emoji}</span>
                      )}
                    </div>
                  )}

                  <div
                    className={`relative max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-md transition ${
                      isMe
                        ? 'bg-gradient-to-r from-emerald-800 to-teal-800 border border-emerald-500/40 text-emerald-50 rounded-br-xs'
                        : 'bg-[#09241b] border border-[#174d39] text-slate-100 rounded-bl-xs'
                    } ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
                  >
                    <div className="break-words leading-relaxed">
                      {renderMessageContent(msg.text)}
                    </div>

                    <div
                      className={`flex items-center gap-1.5 mt-1 text-[9px] ${
                        isMe ? 'justify-end text-emerald-300/70' : 'text-slate-400'
                      }`}
                    >
                      <span>{formatTime(msg.timestamp)}</span>
                      {isMe && (
                        <span>
                          {msg.read ? (
                            <span title="Message lu"><CheckCheck className="w-3 h-3 text-cyan-300 inline" /></span>
                          ) : (
                            <span title="Message envoyé"><Check className="w-3 h-3 text-emerald-400 inline" /></span>
                          )}
                        </span>
                      )}
                      {isMe && !msg.isDeleted && (
                        <button
                          type="button"
                          onClick={() => setMessageToDelete(msg)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-200 transition ml-1 cursor-pointer"
                          title="Supprimer ce message"
                        >
                          <Trash2 className="w-3 h-3" />
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

        {/* Barre de saisie privée */}
        {isAuthenticated ? (
          !isMutualFriend && !isOtherCreator ? (
            <div className="p-3 bg-[#061e16] border-t border-rose-500/30 flex flex-col gap-2 shrink-0">
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-rose-200">
                    🛡️ Bouclier Anti-Bot & Anti-Arnaque Actif
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    Pour préserver la sécurité de la communauté contre le démarchage et les arnaques, les échanges privés sont exclusivement réservés aux <strong>compagnons mutuels</strong>.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    {hasSentFriendReq ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Demande d'amitié envoyée (en attente d'acceptation)</span>
                      </span>
                    ) : hasReceivedFriendReq ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Demande reçue ! Acceptez-la dans vos Compagnons pour discuter</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setIsSendingFriendReq(true);
                          const res = await sendFriendRequest(currentParticipant.username);
                          setIsSendingFriendReq(false);
                          if (res.success) {
                            soundFx.playSuccess();
                          } else {
                            soundFx.playError();
                          }
                        }}
                        disabled={isSendingFriendReq}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>
                          {isSendingFriendReq
                            ? 'Envoi en cours...'
                            : `Envoyer une demande d'amitié à ${currentParticipant.username}`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-[#061e16] border-t border-[#059669]/30 flex flex-col gap-1.5 shrink-0">
              {/* Emojis rapides */}
              <div className="flex flex-wrap items-center gap-1 py-0.5">
                <span className="text-[10px] text-amber-300/80 font-bold px-1 flex items-center gap-0.5 shrink-0">
                  <Smile className="w-3 h-3" />
                </span>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setInputText((prev) => prev + emoji)}
                    className="px-1.5 py-0.5 rounded hover:bg-emerald-900/60 text-xs transition cursor-pointer active:scale-95 shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message privé à ${currentParticipant.username}...`}
                  maxLength={400}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#020d0a] border border-[#78350f]/60 focus:border-amber-400 text-xs text-white placeholder:text-slate-400 focus:outline-none transition shadow-inner"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending || cooldownSeconds > 0}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                  title={cooldownSeconds > 0 ? `Attente (${cooldownSeconds}s)` : 'Envoyer'}
                >
                  {cooldownSeconds > 0 ? (
                    <span className="font-mono text-[10px]">{cooldownSeconds}s</span>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="p-3 bg-[#061e16] border-t border-[#059669]/30 text-center">
            <p className="text-xs text-slate-400 mb-2">
              Connectez-vous pour envoyer un message privé.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Se connecter
            </button>
          </div>
        )}

        {/* Modale de suppression de message */}
        {messageToDelete && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
            <div className="bg-[#03150f] border-2 border-rose-500/50 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Supprimer le message</span>
              </div>
              <p className="text-xs text-slate-300">
                Souhaitez-vous retirer ce message de la conversation ?
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMessageToDelete(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deletePrivateMsg(messageToDelete.id, activePrivateConversationId, false);
                    setMessageToDelete(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation lien externe */}
        {externalLinkToConfirm && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
            <div className="bg-[#03150f] border-2 border-amber-500/60 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Lien Externe</span>
              </div>
              <p className="text-xs text-slate-300 break-all select-all font-mono bg-black/50 p-2 rounded-lg">
                {externalLinkToConfirm}
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExternalLinkToConfirm(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Fermer
                </button>
                <a
                  href={externalLinkToConfirm}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExternalLinkToConfirm(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <span>Ouvrir</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VUE 2 : LISTE DES CONVERSATIONS PRIVÉES
  // -------------------------------------------------------------
  const filteredConversations = privateConversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      c.otherParticipant.username.toLowerCase().includes(term) ||
      (c.otherParticipant.title && c.otherParticipant.title.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#04120e] relative overflow-hidden">
      {/* Barre d'outils et recherche */}
      <div className="p-3 bg-[#061e16] border-b border-[#059669]/30 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher une correspondance..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#020d0a] border border-[#78350f]/60 focus:border-amber-400 text-xs text-white placeholder:text-slate-400 focus:outline-none transition shadow-inner"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowNewConvModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            title="Démarrer une nouvelle discussion"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Liste des discussions */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {filteredConversations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 mb-1">
                Aucune conversation privée pour le moment
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mx-auto">
                Envoyez un message direct à un compagnon depuis votre liste d'amis ou discutez avec le Fondateur !
              </p>
            </div>

            {profile.username?.toLowerCase() !== 'hibouxe' && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  openPrivateChat('Hibouxe', {
                    avatarId: 'hibouxe_creator',
                    title: 'Fondateur du Perchoir',
                  });
                }}
                className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Écrire à Hibouxe (Fondateur)</span>
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const avatar = getAvatarInfo(conv.otherParticipant.avatarId);
            const frame = getFrameDefinition(conv.otherParticipant.activeFrame);
            const isCreatorUser =
              conv.otherParticipant.username.toLowerCase() === 'hibouxe' ||
              conv.otherParticipant.avatarId === 'hibouxe_creator';

            return (
              <button
                key={conv.conversationId}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  openPrivateChat(conv.otherParticipant.username, conv.otherParticipant, conv.conversationId);
                }}
                className={`w-full p-2.5 rounded-xl border transition flex items-center gap-3 text-left cursor-pointer group ${
                  conv.unreadCount > 0
                    ? 'bg-gradient-to-r from-[#0d281e] to-[#071d15] border-amber-500/60 shadow-md shadow-amber-950/20'
                    : 'bg-[#061811] border-[#153e2e] hover:border-emerald-500/50 hover:bg-[#082218]'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 bg-gradient-to-br ${
                    avatar.bgGradient
                  } ${frame.borderClass} ${frame.glowClass || ''} shadow-md overflow-hidden relative`}
                >
                  {avatar.imageUrl ? (
                    <img
                      src={avatar.imageUrl}
                      alt={conv.otherParticipant.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{avatar.emoji}</span>
                  )}
                  {conv.otherParticipant.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
                  )}
                </div>

                {/* Infos & Dernier message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs text-white truncate">
                        {conv.otherParticipant.username}
                      </span>
                      {isCreatorUser && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black shrink-0">
                          Fondateur
                        </span>
                      )}
                      {conv.otherParticipant.steamId && (
                        <SteamIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatTime(conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 truncate flex-1">
                      {conv.lastMessage ? conv.lastMessage.text : 'Discussion ouverte'}
                    </p>

                    {conv.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 animate-pulse">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Modale "Nouvelle discussion" */}
      {showNewConvModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-[#03150f] border-2 border-emerald-500/50 rounded-2xl p-4 max-w-md w-full max-h-[85vh] flex flex-col space-y-3 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30 shrink-0">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Nouvelle Correspondance</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewConvModal(false);
                  setNewConvError(null);
                  setNewConvSuccess(null);
                  setNewConvUsername('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corps défilable */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Section 1 : Vos Compagnons Mutuels Disponibles en 1-clic */}
              <div>
                <div className="text-[11px] font-bold text-emerald-400/90 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vos Compagnons Mutuels Certifiés</span>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {/* Option rapide Hibouxe (Fondateur) */}
                  {profile.username?.toLowerCase() !== 'hibouxe' && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setShowNewConvModal(false);
                        setNewConvError(null);
                        setNewConvSuccess(null);
                        setNewConvUsername('');
                        openPrivateChat('Hibouxe', {
                          avatarId: 'hibouxe_creator',
                          title: 'Fondateur du Perchoir',
                        });
                      }}
                      className="w-full p-2 rounded-xl bg-gradient-to-r from-amber-950/40 to-[#072418] border border-amber-500/40 hover:border-amber-400 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400 flex items-center justify-center text-xs shrink-0">
                          🦉
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5 truncate">
                            <span>Hibouxe</span>
                            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black">
                              Fondateur
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">Support officiel & Créateur</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 group-hover:underline shrink-0">
                        Écrire →
                      </span>
                    </button>
                  )}

                  {/* Compagnons mutuels du joueur */}
                  {mutualFriendsList.length > 0 ? (
                    mutualFriendsList.map((friend) => {
                      const avatar = getAvatarInfo(friend.avatarId);
                      return (
                        <button
                          key={friend.friendCode}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setShowNewConvModal(false);
                            setNewConvError(null);
                            setNewConvSuccess(null);
                            setNewConvUsername('');
                            openPrivateChat(friend.username, {
                              avatarId: friend.avatarId,
                              title: friend.title,
                              steamId: friend.steamId,
                            });
                          }}
                          className="w-full p-2 rounded-xl bg-[#061e16] border border-[#174d39] hover:border-emerald-500/60 hover:bg-[#09291e] text-left transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 bg-gradient-to-br ${avatar.bgGradient} overflow-hidden shadow-sm`}
                            >
                              {avatar.imageUrl ? (
                                <img src={avatar.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{avatar.emoji}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                                <span>{friend.username}</span>
                                {friend.isOnline && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="En ligne" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">
                                {friend.title || 'Explorateur sylvestre'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 group-hover:underline shrink-0">
                            Discuter →
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 text-center">
                      <p className="text-[11px] text-slate-400">
                        Aucun autre compagnon mutuel pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2 : Recherche ou invitation externe */}
              <div className="pt-2 border-t border-emerald-500/20">
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  Ou recherchez un autre joueur par pseudonyme ou code ami :
                </p>

                <form onSubmit={handleStartNewConv} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newConvUsername}
                      onChange={(e) => {
                        setNewConvUsername(e.target.value);
                        if (newConvError) setNewConvError(null);
                        if (newConvSuccess) setNewConvSuccess(null);
                      }}
                      placeholder="Ex: adrien, HOOT-..."
                      maxLength={30}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-emerald-500/40 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!newConvUsername.trim()}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Démarrer
                    </button>
                  </div>

                  {newConvError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] space-y-2">
                      <p>{newConvError}</p>
                      {newConvError.includes("demande d'amitié") && (
                        <button
                          type="button"
                          disabled={isSendingFriendReq}
                          onClick={async () => {
                            setIsSendingFriendReq(true);
                            try {
                              const res = await sendFriendRequest(newConvUsername.trim());
                              if (res.success) {
                                soundFx.playSuccess();
                                if (res.isImmediate) {
                                  setNewConvSuccess(`🎉 Amitié mutuelle confirmée avec ${newConvUsername} !`);
                                  setNewConvError(null);
                                  setTimeout(() => {
                                    setShowNewConvModal(false);
                                    openPrivateChat(newConvUsername.trim());
                                  }, 1000);
                                } else {
                                  setNewConvSuccess(`🤝 Demande d'amitié envoyée avec succès à ${newConvUsername} ! Le salon privé sera déverrouillé dès acceptation.`);
                                  setNewConvError(null);
                                }
                              } else {
                                soundFx.playError();
                                setNewConvError(res.error || res.message || 'Impossible d\'envoyer la demande.');
                              }
                            } finally {
                              setIsSendingFriendReq(false);
                            }
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{isSendingFriendReq ? 'Envoi en cours...' : `Envoyer une demande d'amitié à ${newConvUsername}`}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {newConvSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{newConvSuccess}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-emerald-500/20 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowNewConvModal(false);
                  setNewConvError(null);
                  setNewConvSuccess(null);
                  setNewConvUsername('');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
