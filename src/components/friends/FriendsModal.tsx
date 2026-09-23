import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useFriends } from '../../context/useFriends';
import { useUserAccount } from '../../context/useUserAccount';
import { useChat } from '../../context/useChat';
import { INDIE_AVATARS } from '../../data/avatars';
import { SteamIcon } from '../common/SteamIcon';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { soundFx } from '../../utils/audio';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVersusDuel?: (roomCode: string) => void;
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
}) => {
  const {
    friends,
    myFriendCode,
    isLoading,
    addFriend,
    removeFriend,
    refreshFriends,
    syncSteamFriends,
    createVersusChallengeUrl,
    favoriteFriendCodes,
    isFavoriteFriend,
    toggleFavoriteFriend,
  } = useFriends();

  const { isSteamConnected } = useUserAccount();
  const { openChat } = useChat();

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

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.location.hash.toLowerCase().startsWith('#friend=')) {
      const codeFromHash = window.location.hash.split('=')[1]?.trim().toUpperCase();
      if (codeFromHash && codeFromHash !== myFriendCode) {
        setAddInput(codeFromHash);
      }
    }
  }, [isOpen, myFriendCode]);

  if (!isOpen) return null;

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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addInput.trim()) return;

    soundFx.playClick();
    setFeedback(null);
    setIsAddingFriend(true);
    try {
      const res = await addFriend(addInput.trim());
      if (res.success) {
        setFeedback({ type: 'success', text: res.message || 'Compagnon ajouté avec succès !' });
        setAddInput('');
      } else {
        setFeedback({ type: 'error', text: res.error || 'Impossible d’ajouter ce compagnon.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Impossible d’ajouter ce compagnon.' });
    } finally {
      setIsAddingFriend(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="group relative bg-[#072a20] border-2 border-[#78350f] rounded-3xl w-full max-w-2xl overflow-visible shadow-2xl space-y-5 p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        <SylvestreIvyFrame density="delicate" />

        {/* Header Modal */}
        <div className="flex items-center justify-between gap-3 border-b border-[#1b4332] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  Cercle des Compagnons
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Social
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Suivez les exploits quotidiens de vos amis et défiez-les en duels 1v1 !
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer hover:border-amber-500/50"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carte : Mon Code Joueur Unique */}
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

        {/* Section : Ajouter un Compagnon */}
        <div className="p-4 rounded-2xl bg-[#0b1b14] border border-[#1b4332]">
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Ajouter un compagnon</span>
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
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#071810] border border-[#1b4332] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 uppercase"
              />
              <button
                type="submit"
                disabled={isAddingFriend || !addInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer active:scale-95 shrink-0"
              >
                {isAddingFriend ? 'Recherche...' : 'Ajouter'}
              </button>
            </div>

            {feedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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
          </form>
        </div>

        {/* Liste des Compagnons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Vos Compagnons ({friends.length})
              </h3>
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

          {friends.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#081b13] border border-[#1b4332] text-slate-400">
              <Users className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
              <div className="font-bold text-slate-200 text-sm mb-1">Aucun compagnon pour le moment</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Partagez votre code ami <strong>{myFriendCode}</strong> avec vos camarades de jeu pour comparer vos victoires du jour et vous défier !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => {
                const avatar = INDIE_AVATARS.find((a) => a.id === friend.avatarId) || INDIE_AVATARS[0];
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
                            {friend.friendCode === 'HOOT-HIBOU' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black">
                                Créateur
                              </span>
                            )}
                            {friend.steamId && (
                              <span title="Compte Steam lié">
                                <SteamIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              </span>
                            )}
                            {friend.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="En ligne" />
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
                              : 'bg-[#06140e] border-[#163627] text-slate-500 hover:text-amber-300 hover:border-amber-500/30'
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
                            openChat('global');
                          }}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          title={`Discuter sur Le Perchoir avec ${friend.username}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Tchat</span>
                        </button>

                        {friend.friendCode !== 'HOOT-HIBOU' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Retirer ${friend.username} de vos compagnons ?`)) {
                                removeFriend(friend.friendCode);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
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
                          {daily ? `${daily.totalWonToday}/8 réussis` : 'Non synchronisé'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {DISCIPLINES.map((d) => {
                          const discScore = daily ? (daily as any)[d.id] : null;
                          const status = discScore ? discScore.status : 'unplayed';
                          const guesses = discScore ? discScore.guessCount : null;

                          let bgClass = 'bg-[#06140e] border-[#163627] text-slate-500';
                          let statusLabel = 'Non tenté';

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
  );
};
