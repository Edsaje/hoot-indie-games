import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  UserPlus,
  RefreshCw,
  Trash2,
  Swords,
  Flame,
  Star,
  Sparkles,
  HelpCircle,
  Gamepad2,
  Camera,
  Clock,
  Music,
  User,
  MessageSquare,
  LogIn,
  Inbox,
  ShieldCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { useFriends } from '../../context/useFriends';
import { useTrades } from '../../context/useTrades';
import type { FriendPlayer } from '../../types/friends';
import { useUserAccount } from '../../context/useUserAccount';
import { useChat } from '../../context/useChat';
import { INDIE_AVATARS } from '../../data/avatars';
import { SteamIcon } from '../common/SteamIcon';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { soundFx } from '../../utils/audio';
import { getTodayDateString } from '../../utils/streakManager';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVersusDuel?: (roomCode: string) => void;
  onOpenAuth?: () => void;
  initialTab?: 'friends' | 'requests';
}

const DISCIPLINES = [
  { id: 'screenle', label: 'Capture', short: 'Scr', Icon: Camera },
  { id: 'indledle', label: 'Classic', short: 'Cls', Icon: Gamepad2 },
  { id: 'linkle', label: 'Connexions', short: 'Lnk', Icon: Sparkles },
  { id: 'profille', label: 'Profil', short: 'Pro', Icon: User },
  { id: 'chrono', label: 'Chrono', short: 'Chr', Icon: Clock },
  { id: 'pixel', label: 'Pixel', short: 'Pix', Icon: HelpCircle },
  { id: 'review', label: 'Critique', short: 'Rev', Icon: Star },
  { id: 'blindtest', label: 'Blind Test', short: 'Ost', Icon: Music },
] as const;

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  onStartVersusDuel,
  onOpenAuth,
  initialTab = 'friends',
}) => {
  const {
    friends,
    myFriendCode,
    isLoading,
    sendFriendRequest,
    respondFriendRequest,
    removeFriend,
    refreshFriends,
    refreshRequests,
    syncSteamFriends,
    createVersusChallengeUrl,
    favoriteFriendCodes,
    isFavoriteFriend,
    toggleFavoriteFriend,
    pendingRequests,
    sentRequests,
    pendingRequestsCount,
  } = useFriends();

  const { isSteamConnected, isAuthenticated } = useUserAccount();
  const { openPrivateChat } = useChat();
  const { openTradeModal } = useTrades();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>(initialTab);
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);

  const [addInput, setAddInput] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase().startsWith('#friend=')) {
      return window.location.hash.split('=')[1]?.trim().toUpperCase() || '';
    }
    return '';
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const [versusPromptFriend, setVersusPromptFriend] = useState<{
    friendName: string;
    roomCode: string;
    inviteUrl: string;
  } | null>(null);

  const validFriends = useMemo(() => {
    return (friends || []).filter((f): f is FriendPlayer => Boolean(f && f.friendCode));
  }, [friends]);

  const onlineFriends = useMemo(() => {
    return validFriends.filter((f) => f.isOnline);
  }, [validFriends]);

  const offlineFriends = useMemo(() => {
    return validFriends.filter((f) => !f.isOnline);
  }, [validFriends]);

  const displayedFriends = useMemo(() => {
    let list: FriendPlayer[];
    if (presenceFilter === 'online') {
      list = onlineFriends;
    } else if (presenceFilter === 'offline') {
      list = offlineFriends;
    } else {
      list = validFriends;
    }

    // Tri : Favoris d'abord, puis en ligne, puis nom
    return [...list].sort((a, b) => {
      const aFav = isFavoriteFriend(a.friendCode) ? 1 : 0;
      const bFav = isFavoriteFriend(b.friendCode) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      const aOnline = a.isOnline ? 1 : 0;
      const bOnline = b.isOnline ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;

      return a.username.localeCompare(b.username);
    });
  }, [validFriends, onlineFriends, offlineFriends, presenceFilter, isFavoriteFriend]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.location.hash.toLowerCase().startsWith('#friend=')) {
      const codeFromHash = window.location.hash.split('=')[1]?.trim().toUpperCase();
      if (codeFromHash && codeFromHash !== myFriendCode) {
        setAddInput(codeFromHash);
      }
    }
  }, [isOpen, myFriendCode]);

  const todayStr = getTodayDateString();

  useEffect(() => {
    if (isOpen) {
      refreshFriends();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, refreshFriends]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopyCode = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(myFriendCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleCopyInviteLink = () => {
    soundFx.playClick();
    const url = `${window.location.origin}${window.location.pathname}#friend=${myFriendCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const formatRequestDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addInput.trim()) return;

    soundFx.playClick();
    setFeedback(null);
    setIsAddingFriend(true);
    try {
      const res = await sendFriendRequest(addInput.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.message || 'Invitation envoyée ! En attente de confirmation.',
        });
        setAddInput('');
      } else {
        setFeedback({ type: 'error', text: res.error || 'Impossible d’envoyer l’invitation.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Impossible d’envoyer l’invitation.' });
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRespondRequest = async (
    requestId: string,
    action: 'accept' | 'decline' | 'cancel'
  ) => {
    soundFx.playClick();
    setRespondingReqId(requestId);
    setFeedback(null);
    try {
      const res = await respondFriendRequest(requestId, action);
      if (res.success) {
        if (action === 'accept') {
          soundFx.playSuccess();
        }
        setFeedback({ type: 'success', text: res.message || 'Action validée avec succès !' });
      } else {
        soundFx.playError();
        setFeedback({ type: 'error', text: res.error || 'Erreur lors du traitement de l’invitation.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erreur lors du traitement de l’invitation.' });
    } finally {
      setRespondingReqId(null);
    }
  };

  const handleSyncSteam = async () => {
    soundFx.playClick();
    setFeedback(null);
    setIsSyncingSteam(true);
    try {
      const res = await syncSteamFriends();
      if (res.success) {
        setFeedback({ type: 'success', text: res.message || 'Amis Steam synchronisés !' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Erreur lors de la synchronisation Steam.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erreur lors de la synchronisation Steam.' });
    } finally {
      setIsSyncingSteam(false);
    }
  };

  const handleChallengeVersus = (friendName: string) => {
    soundFx.playClick();
    const { roomCode, inviteUrl } = createVersusChallengeUrl();
    setVersusPromptFriend({
      friendName,
      roomCode,
      inviteUrl,
    });
  };

  const handleLaunchVersusRoom = (roomCode: string) => {
    soundFx.playClick();
    onClose();
    if (onStartVersusDuel) {
      onStartVersusDuel(roomCode);
    } else {
      window.location.hash = `#versus=${roomCode}`;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative bg-[#072a20] sm:border-2 border-0 border-[#78350f] rounded-none sm:rounded-3xl w-full h-full sm:h-auto max-w-2xl shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[90vh] overflow-hidden">
        <div className="hidden sm:block pointer-events-none">
          <SylvestreIvyFrame density="delicate" />
        </div>

        {/* Header Modal */}
        <div className="flex items-center justify-between gap-3 border-b border-[#1b4332] p-4 sm:p-6 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                  Cercle des Compagnons
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Social
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Suivez les exploits quotidiens de vos amis et défiez-les en duels 1v1 !
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer hover:border-amber-500/50 shrink-0"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation par Onglets */}
        <div className="flex border-b border-[#1b4332] bg-[#051a13] px-4 sm:px-6 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('friends');
              setFeedback(null);
            }}
            className={`pb-2.5 px-3 font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'friends'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mes Compagnons ({friends.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('requests');
              setFeedback(null);
              refreshRequests();
            }}
            className={`pb-2.5 px-3 font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'requests'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Demandes reçues</span>
            {pendingRequestsCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-black animate-pulse shadow-sm shadow-rose-950">
                {pendingRequestsCount}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">({pendingRequests.length})</span>
            )}
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <X className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {activeTab === 'friends' && (
            <>
              {/* Carte : Mon Code Joueur Unique */}
              {isAuthenticated && myFriendCode ? (
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#123829] via-[#0d281e] to-[#071d15] border border-amber-500/30 shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Votre Code Joueur Unique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-amber-400 bg-black/40 px-3.5 py-1 rounded-xl border border-amber-500/40 shadow-inner select-all">
                          {myFriendCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2 max-w-md leading-relaxed">
                        Partagez ce code avec vos amis pour leur permettre de voir vos réussites du jour et vous lancer des duels !
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Code copié !' : 'Copier le code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#0b0f19] hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-bold text-xs transition active:scale-95 cursor-pointer"
                        title="Copie un lien direct ouvrant le site pour ajouter votre ami"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Lien copié !' : 'Partager le lien'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#123829] via-[#0d281e] to-[#071d15] border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Code Ami & Compagnons en Ligne</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          Compte requis
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Le Cercle des Compagnons est synchronisé en ligne. Connectez-vous à votre compte pour obtenir votre Code Ami unique, retrouver vos compagnons et comparer vos streaks quotidiens !
                      </p>
                    </div>
                  </div>

                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onClose();
                        onOpenAuth();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 self-stretch sm:self-auto shrink-0 cursor-pointer touch-manipulation whitespace-nowrap"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Se connecter</span>
                    </button>
                  )}
                </div>
              )}

              {/* Section : Inviter un Compagnon */}
              <div className="p-4 rounded-2xl bg-[#0b1b14] border border-[#1b4332]">
                <form onSubmit={handleAddSubmit} className="space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>Envoyer une invitation d'amitié</span>
                    </span>

                    {isSteamConnected && (
                      <button
                        type="button"
                        onClick={handleSyncSteam}
                        disabled={isSyncingSteam}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer disabled:opacity-50"
                      >
                        <SteamIcon className="w-3 h-3 text-cyan-400" />
                        <span>{isSyncingSteam ? 'Synchronisation...' : 'Synchroniser amis Steam'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addInput}
                      onChange={(e) => setAddInput(e.target.value)}
                      placeholder="Code joueur (ex: HOOT-7K9A) ou pseudo..."
                      maxLength={30}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#071810] border border-[#1b4332] text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isAddingFriend || !addInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer active:scale-95 shrink-0"
                    >
                      {isAddingFriend ? 'Envoi...' : 'Inviter'}
                    </button>
                  </div>
                </form>
              </div>

        {/* Liste des Compagnons */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Vos Compagnons ({validFriends.length})
              </h3>
              <span className="text-slate-600 text-xs hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{onlineFriends.length} en ligne</span>
              </span>
              {favoriteFriendCodes.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{favoriteFriendCodes.length} favori{favoriteFriendCodes.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => refreshFriends()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition cursor-pointer disabled:opacity-50"
              title="Rafraîchir les scores"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isLoading ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
          </div>

          {/* Filtres de Présence Rapides (Tous / En ligne / Hors ligne) */}
          {validFriends.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#06140e] border border-[#163627] text-xs">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPresenceFilter('all');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  presenceFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({validFriends.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPresenceFilter('online');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  presenceFilter === 'online'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-emerald-400/90 hover:text-emerald-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>En ligne ({onlineFriends.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPresenceFilter('offline');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  presenceFilter === 'offline'
                    ? 'bg-slate-700 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Hors ligne ({offlineFriends.length})</span>
              </button>
            </div>
          )}

          {validFriends.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#081b13] border border-[#1b4332] text-slate-400">
              <Users className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
              <div className="font-bold text-slate-200 text-sm mb-1">Aucun compagnon pour le moment</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Partagez votre code ami <strong>{myFriendCode}</strong> avec vos camarades de jeu pour comparer vos victoires du jour et vous défier !
              </p>
            </div>
          ) : displayedFriends.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#081b13] border border-[#1b4332] text-slate-400">
              <p className="text-xs text-slate-400">
                Aucun compagnon {presenceFilter === 'online' ? 'en ligne' : 'hors ligne'} actuellement.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedFriends.map((friend) => {
                  const avatar =
                    (friend.avatarId && INDIE_AVATARS.find((a) => a.id === friend.avatarId)) ||
                    INDIE_AVATARS[0] || {
                      id: 'default',
                      name: 'Compagnon',
                      emoji: '🦉',
                      bgGradient: 'from-amber-600 via-[#0d543e] to-[#041d15]',
                      imageUrl: '/logo.png',
                    };
                  const daily = friend.dailyScores;
                  const isFav = isFavoriteFriend(friend.friendCode);

                  return (
                    <div
                      key={friend.friendCode}
                    className={`p-4 rounded-2xl transition shadow-md flex flex-col gap-3 group border ${
                      isFav
                        ? 'bg-gradient-to-r from-[#0d281e] to-[#0a1e16] border-amber-500/40 ring-1 ring-amber-500/20 shadow-amber-950/20'
                        : 'bg-[#0a1e16] border-[#1b4332] hover:border-amber-500/40'
                    }`}
                  >
                    {/* Ligne 1 : Profil, Statut & Flamme */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${avatar.bgGradient} shadow-md shrink-0 border border-white/10 p-1.5 overflow-hidden`}
                        >
                          {avatar.imageUrl ? (
                            <img
                              src={avatar.imageUrl}
                              alt={avatar.name}
                              className="w-full h-full object-contain drop-shadow-sm"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-sm truncate">
                              {friend.username}
                            </span>
                            {isFav && (
                              <span title="Compagnon favori (épinglé en tête de liste)">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                              </span>
                            )}
                            {friend.friendCode === 'HOOT-HIBOU' ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black">
                                👑 Fondateur
                              </span>
                            ) : friend.isMutual ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>Ami Mutuel</span>
                              </span>
                            ) : null}
                            {friend.steamId && (
                              <span title="Compte Steam lié">
                                <SteamIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              </span>
                            )}
                            {friend.isOnline ? (
                              <span
                                className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0"
                                title="En ligne sur le Perchoir"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>En ligne</span>
                              </span>
                            ) : (
                              <span
                                className="px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[10px] font-mono flex items-center gap-1 shrink-0"
                                title="Actuellement hors ligne"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                <span>Hors ligne</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                            <span>{friend.title}</span>
                            <span>·</span>
                            <span className="font-mono text-amber-300/80">{friend.friendCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Bouton Favori (Étoile) */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            toggleFavoriteFriend(friend.friendCode);
                          }}
                          className={`p-2 rounded-xl border transition cursor-pointer active:scale-90 ${
                            isFav
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/20'
                              : 'bg-[#06140e] border-[#163627] text-slate-400 hover:text-amber-300 hover:border-amber-500/30'
                          }`}
                          title={
                            isFav
                              ? 'Retirer des favoris'
                              : 'Ajouter aux favoris (épingler en premier)'
                          }
                          aria-label="Favori"
                        >
                          <Star
                            className={`w-3.5 h-3.5 transition-transform ${
                              isFav
                                ? 'fill-amber-400 text-amber-400 scale-110'
                                : 'fill-transparent'
                            }`}
                          />
                        </button>

                        {friend.streak > 0 && (
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono"
                            title={`Série de ${friend.streak} jours consécutifs`}
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{friend.streak}j</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleChallengeVersus(friend.username)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                          title={`Défier ${friend.username} en duel 1v1`}
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Défier en 1v1</span>
                          <span className="sm:hidden">Duel</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            onClose();
                            openPrivateChat(friend.username, {
                              avatarId: friend.avatarId,
                              title: friend.title,
                              steamId: friend.steamId,
                              friendCode: friend.friendCode,
                              isOnline: friend.isOnline,
                            });
                          }}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          title={`Envoyer un message privé à ${friend.username}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Message</span>
                        </button>

                        {/* Échange de Cartes Bilatéral */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            onClose();
                            openTradeModal({
                              targetFriend: friend,
                              initialTab: 'create',
                            });
                          }}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 hover:text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title={`Proposer un échange de cartes à ${friend.username}`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Échanger</span>
                        </button>

                        {friend.friendCode !== 'HOOT-HIBOU' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Retirer ${friend.username} de vos compagnons ?`)) {
                                removeFriend(friend.friendCode);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Retirer ce compagnon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ligne 2 : Grille des 8 Défis du Jour (Zéro Spoil) */}
                    <div className="pt-2.5 border-t border-[#143224]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Progression du jour :
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {daily && daily.date === todayStr
                            ? `${daily.totalWonToday}/8 réussis`
                            : 'Non débuté aujourd’hui'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {DISCIPLINES.map((d) => {
                          const isToday = daily && daily.date === todayStr;
                          const discScore = isToday && daily ? daily[d.id] : null;
                          const status = discScore ? discScore.status : 'unplayed';
                          const guesses = discScore ? discScore.guessCount : null;

                          let bgClass = 'bg-[#06140e] border-[#163627] text-slate-400';
                          let statusLabel = isToday ? 'Non tenté' : 'Pas encore joué aujourd’hui';

                          if (status === 'won') {
                            bgClass = 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm';
                            statusLabel = guesses ? `Réussi en ${guesses} essai(s)` : 'Réussi !';
                          } else if (status === 'lost') {
                            bgClass = 'bg-rose-950/40 border-rose-500/40 text-rose-300';
                            statusLabel = 'Échec aujourd’hui';
                          }

                          const DisciplineIcon = d.Icon;

                          return (
                            <div
                              key={d.id}
                              className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${bgClass}`}
                              title={`${d.label} : ${statusLabel}`}
                            >
                              <DisciplineIcon className="w-3.5 h-3.5 mb-1 shrink-0" />
                              <div className="text-[10px] font-bold truncate max-w-full">
                                {d.short}
                              </div>
                              <div className="text-[9px] font-mono font-bold mt-0.5">
                                {status === 'won' ? (guesses ? `✓ ${guesses}` : '✓') : status === 'lost' ? '✗' : '—'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    )}

        {/* ========================================================= */}
        {/* ONGLET 2 : DEMANDES REÇUES & ENVOYÉES                     */}
        {/* ========================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Bannière de Sécurité & Pédagogie */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d281e] to-[#061811] border border-emerald-500/30 text-slate-300 text-xs flex items-start gap-3 shadow-md">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span>Protection Anti-Spam & Consentement Bilatéral</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Pour préserver la communauté contre le spam et les messages frauduleux, l'amitié doit être mutuellement consentie. Seuls vos compagnons validés peuvent échanger des messages privés directs avec vous.
                </p>
              </div>
            </div>

            {/* Demandes Reçues */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-emerald-400" />
                  <span>Demandes reçues ({pendingRequests.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => refreshRequests()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#081b13] border border-[#1b4332] text-slate-400 space-y-2">
                  <Inbox className="w-10 h-10 text-emerald-400 mx-auto opacity-50" />
                  <div className="font-bold text-slate-200 text-sm">
                    Aucune demande reçue en attente
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Votre boîte aux lettres sylvestre est paisible. Lorsqu'un autre explorateur vous envoie une invitation d'amitié, elle apparaîtra ici afin que vous puissiez l'accepter ou la décliner !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => {
                    const avatar =
                      (req.fromAvatarId && INDIE_AVATARS.find((a) => a.id === req.fromAvatarId)) ||
                      INDIE_AVATARS[0];
                    const isResponding = respondingReqId === req.id;

                    return (
                      <div
                        key={req.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#0a1e16] border border-amber-500/30 hover:border-amber-500/60 transition shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${avatar.bgGradient} shadow-md shrink-0 border border-white/10 p-1.5 overflow-hidden`}
                          >
                            {avatar.imageUrl ? (
                              <img
                                src={avatar.imageUrl}
                                alt={avatar.name}
                                className="w-full h-full object-contain drop-shadow-sm"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white text-sm truncate">
                                {req.fromUsername}
                              </span>
                              {req.fromPlayer?.streak ? (
                                <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">
                                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span>{req.fromPlayer.streak}j</span>
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                              <span>{req.fromTitle || 'Explorateur'}</span>
                              <span>·</span>
                              <span className="font-mono text-amber-300/80">{req.fromCode}</span>
                              {req.createdAt && (
                                <>
                                  <span>·</span>
                                  <span className="text-[10px] text-slate-400">
                                    reçue le {formatRequestDate(req.createdAt)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            disabled={isResponding}
                            onClick={() => handleRespondRequest(req.id, 'accept')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950 active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isResponding ? 'Validation...' : 'Accepter'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isResponding}
                            onClick={() => handleRespondRequest(req.id, 'decline')}
                            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-bold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                            title="Refuser cette demande"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Refuser</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Demandes Envoyées en attente */}
            {sentRequests.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#143224]">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vos invitations envoyées ({sentRequests.length})</span>
                </h3>

                <div className="space-y-2">
                  {sentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-[#061811] border border-[#1b4332] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="text-slate-200 font-bold truncate flex items-center gap-1.5">
                          <span>Invitation pour</span>
                          <span className="text-amber-300 font-semibold">{req.toUsername}</span>
                          <span className="font-mono text-slate-400 text-[10px]">({req.toCode})</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          En attente de son acceptation · envoyée le {formatRequestDate(req.createdAt)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req.id, 'cancel')}
                        disabled={respondingReqId === req.id}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-[11px] font-medium transition cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal d'invitation Versus 1v1 générée */}
        {versusPromptFriend && (
          <div className="p-4 rounded-2xl bg-[#143224] border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Duel 1v1 prêt contre {versusPromptFriend.friendName} !</span>
              </div>
              <button
                type="button"
                onClick={() => setVersusPromptFriend(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200">
              Un salon multijoueur privé a été créé sur le relais souverain. Envoyez ce lien à votre ami pour lancer le duel instantanément !
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={versusPromptFriend.inviteUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-xs font-mono text-amber-300 select-all"
              />
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  navigator.clipboard.writeText(versusPromptFriend.inviteUrl);
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
              >
                Copier
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLaunchVersusRoom(versusPromptFriend.roomCode)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
              >
                Rejoindre le salon maintenant
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
};
