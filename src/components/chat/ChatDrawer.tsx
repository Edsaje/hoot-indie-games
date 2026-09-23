import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { useChat } from '../../context/useChat';
import { useUserAccount } from '../../context/useUserAccount';
import {
  CHAT_CHANNELS,
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
} from '../../services/chatService';
import { INDIE_AVATARS } from '../../data/avatars';
import { getFrameDefinition } from '../../utils/featherEconomy';
import { soundFx } from '../../utils/audio';

const QUICK_EMOJIS = ['🦉', '🎮', '💎', '🏆', '✨', '❤️', '🔥', '👏', '👋', '🎉'];

export const ChatDrawer: React.FC = () => {
  const { t } = useTranslation();
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
  } = useChat();

  const { profile } = useUserAccount();

  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>('suggestion');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (!inputText.trim() || isSending || cooldownSeconds > 0) return;

    setErrorMessage(null);
    const categoryToSend = currentChannel === 'feedback' ? selectedCategory : undefined;

    const res = await sendMessage(inputText.trim(), categoryToSend);
    if (res.success) {
      setInputText('');
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

  // 1. Bouton flottant détaché en bas à droite lorsque la fenêtre est fermée / réduite
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => openChat()}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-[100] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#06241b]/95 hover:bg-[#093a2b] border-2 border-[#78350f] hover:border-amber-400 text-amber-200 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer"
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
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] right-3 sm:bottom-6 sm:right-6 z-[120] w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[440px] h-[540px] max-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] rounded-2xl bg-[#04120e] text-[#f1f5f9] border-2 border-[#78350f] shadow-[0_12px_45px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
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
            {/* Bouton Réduire */}
            <button
              onClick={closeChat}
              className="p-1 rounded-lg text-emerald-300/80 hover:text-white hover:bg-emerald-800/40 transition-colors"
              title={t('chat.minimize')}
              aria-label={t('chat.minimize')}
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Bouton Fermer */}
            <button
              onClick={closeChat}
              className="p-1 rounded-lg text-emerald-300/80 hover:text-white hover:bg-emerald-800/40 transition-colors"
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
              <span className="text-amber-100 font-bold">{currentChannelInfo.name}</span>
              <span className="text-[11px] text-emerald-400/70 truncate hidden sm:inline">
                — {currentChannelInfo.description}
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
                Salons & Retours
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
                        <div className="font-semibold text-slate-100">{ch.label}</div>
                        <div className="text-[10px] text-emerald-400/70 truncate">
                          {ch.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-900/60 px-1 py-0.2 rounded font-bold shrink-0">
                        Actif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bandeau contextuel / Catégories pour Feedback */}
        {currentChannel === 'feedback' && (
          <div className="flex flex-col gap-1 pt-0.5">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              {t('chat.feedbackCategory')}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const isCatSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all flex items-center gap-1 shrink-0 ${
                      isCatSelected
                        ? `${cat.badgeColor} ring-1 ring-amber-400 font-bold scale-105`
                        : 'bg-[#020d0a] text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fil des messages */}
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
            const isMe = msg.username === profile.username;
            const avatar = getAvatarInfo(msg.avatarId);
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-gradient-to-br ${
                    avatar.bgGradient
                  } ${frameDef.borderClass} ${frameDef.glowClass || ''} shadow-md overflow-hidden`}
                  title={avatar.name}
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
                    <span className="font-bold text-[11px] text-amber-100 flex items-center gap-1">
                      {msg.username}
                      {msg.isCreator && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold"
                          title="Créateur & Développeur officiel"
                        >
                          <Crown className="w-2.5 h-2.5 text-amber-400" />
                          Créateur
                        </span>
                      )}
                    </span>

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
                        return (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full border inline-flex items-center gap-1 ${
                              catInfo?.badgeColor || 'bg-emerald-900/40 text-emerald-300'
                            }`}
                          >
                            <span>{catInfo?.icon}</span>
                            <span className="font-semibold">{catInfo?.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  )}

                  {/* Bulle de texte */}
                  <div
                    className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed shadow border ${
                      isMe
                        ? 'bg-[#064e3b]/90 text-emerald-50 border-[#059669]/60 rounded-tr-none'
                        : msg.isCreator
                        ? 'bg-[#291b07]/90 text-amber-100 border-amber-500/50 rounded-tl-none ring-1 ring-amber-500/30'
                        : 'bg-[#061e16]/90 text-slate-200 border-[#78350f]/40 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                    {/* Carte de score partagé éventuelle */}
                    {msg.scoreData && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-black/40 border border-amber-500/30 flex items-center gap-1.5 text-[11px] text-amber-200">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-white">{msg.scoreData.game}</span> —{' '}
                          <span>Score : {msg.scoreData.score}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barre d'erreur éventuelle */}
      {errorMessage && (
        <div className="px-3 py-1.5 bg-rose-950/80 border-t border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Barre de saisie inférieure */}
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
      </div>
    </div>
  );
};
