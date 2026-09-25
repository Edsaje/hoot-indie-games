import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Trash2,
  Crown,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  UserX,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useUserAccount } from '../../context/useUserAccount';
import { useChat } from '../../context/useChat';
import {
  getUserModerationInfo,
  executeUserModeration,
  type UserModerationProfile,
} from '../../services/chatService';
import { INDIE_AVATARS } from '../../data/avatars';
import { getFrameDefinition } from '../../utils/featherEconomy';
import { soundFx } from '../../utils/audio';

export interface ChatUserModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    username: string;
    userId?: string;
    steamId?: string;
    avatarId?: string;
    title?: string;
    activeFrame?: string;
    isCreator?: boolean;
    isModerator?: boolean;
    role?: string;
  } | null;
  onUserPurged?: (username: string) => void;
}

export const ChatUserModerationModal: React.FC<ChatUserModerationModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onUserPurged,
}) => {
  const { profile, isAdmin, isCreator, isModerator } = useUserAccount();
  const { purgeUserMessages } = useChat();

  const isStrictAdmin = Boolean(isAdmin || isCreator || profile.role === 'admin' || profile.isAdmin);
  const isStrictModerator = Boolean(!isStrictAdmin && (isModerator || profile.role === 'moderator' || profile.isModerator));

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserModerationProfile | null>(null);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [recentMessages, setRecentMessages] = useState<Array<{ id: string; channel: string; text: string; timestamp: number; isDeleted: boolean }>>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [banReason, setBanReason] = useState('');
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const authData = {
    steamId: profile.steam?.steamId,
    userId: profile.id,
    username: profile.username,
    role: profile.role,
    isAdmin: isStrictAdmin,
  };

  const loadData = useCallback(async () => {
    if (!targetUser) return;
    setLoading(true);
    setFeedback(null);
    setShowBanConfirm(false);
    setShowPurgeConfirm(false);

    try {
      const res = await getUserModerationInfo(
        { username: targetUser.username, userId: targetUser.userId },
        authData
      );
      if (res.success) {
        setProfileData(res.user || null);
        setMessageCount(res.messageCount ?? 0);
        setRecentMessages(res.recentMessages || []);
      } else if (res.message) {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors du chargement des données utilisateur.' });
    } finally {
      setLoading(false);
    }
  }, [targetUser, profile.steam?.steamId, profile.id, profile.username, profile.role, isStrictAdmin]);

  useEffect(() => {
    if (isOpen && targetUser) {
      loadData();
    } else {
      setProfileData(null);
      setFeedback(null);
      setShowBanConfirm(false);
      setShowPurgeConfirm(false);
    }
  }, [isOpen, targetUser, loadData]);

  if (!isOpen || !targetUser) return null;

  const targetIsCreator = Boolean(
    targetUser.isCreator ||
    targetUser.username.toLowerCase() === 'hibouxe' ||
    profileData?.isCreator
  );

  const targetIsModerator = Boolean(
    targetUser.isModerator ||
    profileData?.isModerator ||
    profileData?.role === 'moderator'
  );

  // Un modérateur ne peut modérer ni le créateur ni un autre modérateur
  const canModerateTarget = isStrictAdmin ? !targetIsCreator : (!targetIsCreator && !targetIsModerator);

  const handleToggleBan = async (banStatus: boolean) => {
    if (!canModerateTarget) return;
    setActionLoading(true);
    setFeedback(null);
    soundFx.playClick();

    const res = await executeUserModeration(
      {
        subAction: 'toggle_ban',
        targetUsername: targetUser.username,
        targetUserId: targetUser.userId,
        ban: banStatus,
        reason: banReason || (banStatus ? 'Non-respect des règles de la communauté' : ''),
      },
      authData
    );

    setActionLoading(false);
    setShowBanConfirm(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Statut mis à jour.' });
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Impossible de mettre à jour le statut.' });
    }
  };

  const handlePurgeMessages = async () => {
    if (!canModerateTarget) return;
    setActionLoading(true);
    setFeedback(null);
    soundFx.playClick();

    const res = await purgeUserMessages(targetUser.username, targetUser.userId);
    setActionLoading(false);
    setShowPurgeConfirm(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message || `${res.count || 0} messages supprimés définitivement.`,
      });
      setMessageCount(0);
      setRecentMessages([]);
      onUserPurged?.(targetUser.username);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Erreur lors de la purge.' });
    }
  };

  const handleResetUsername = async () => {
    if (!canModerateTarget) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir réinitialiser le pseudonyme de "${targetUser.username}" ?`)) {
      return;
    }
    setActionLoading(true);
    setFeedback(null);
    soundFx.playClick();

    const res = await executeUserModeration(
      {
        subAction: 'reset_username',
        targetUsername: targetUser.username,
        targetUserId: targetUser.userId,
      },
      authData
    );

    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Pseudonyme réinitialisé.' });
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Erreur lors de la réinitialisation.' });
    }
  };

  const handleRoleChange = async (newRole: 'user' | 'vip' | 'moderator') => {
    if (!isStrictAdmin || targetIsCreator) return;
    setActionLoading(true);
    setFeedback(null);
    soundFx.playClick();

    const res = await executeUserModeration(
      {
        subAction: 'set_role',
        targetUsername: targetUser.username,
        targetUserId: targetUser.userId,
        role: newRole,
      },
      authData
    );

    setActionLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || `Rôle mis à jour en : ${newRole}` });
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Erreur lors de la mise à jour du rôle.' });
    }
  };

  // Avatar et cadre
  const avatarId = profileData?.avatarId || targetUser.avatarId || 'default';
  const foundAvatar = INDIE_AVATARS.find((a) => a.id === avatarId) || {
    name: 'Explorateur',
    emoji: '🦉',
    bgGradient: 'from-emerald-900 to-teal-950',
    imageUrl: '',
  };
  const activeFrame = profileData?.activeFrame || targetUser.activeFrame;
  const frameDef = getFrameDefinition(activeFrame);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#04120e] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-500/20 bg-emerald-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Modération du Profil</span>
                {isStrictAdmin && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Admin
                  </span>
                )}
                {isStrictModerator && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Modérateur
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400">
                Action immédiate et synchronisée sur le Sanctuaire
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Notifications de retour */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="flex-1">{feedback.message}</span>
            </div>
          )}

          {/* Fiche Profil Joueur */}
          <div className="p-3.5 rounded-xl bg-[#020d0a] border border-emerald-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0 bg-gradient-to-br ${
                  foundAvatar.bgGradient
                } ${frameDef.borderClass} ${frameDef.glowClass || ''} shadow-md overflow-hidden`}
              >
                {foundAvatar.imageUrl ? (
                  <img
                    src={foundAvatar.imageUrl}
                    alt={foundAvatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{foundAvatar.emoji}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-white truncate">
                    {profileData?.username || targetUser.username}
                  </span>
                  {targetIsCreator && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      <Crown className="w-3 h-3 text-amber-400" />
                      Créateur
                    </span>
                  )}
                  {targetIsModerator && !targetIsCreator && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                      <Shield className="w-3 h-3 text-blue-400" />
                      Modérateur
                    </span>
                  )}
                  {profileData?.isBanned && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      <UserX className="w-3 h-3 text-rose-400" />
                      Banni
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                  {profileData?.title || targetUser.title ? (
                    <span className="text-emerald-400">
                      • {profileData?.title || targetUser.title}
                    </span>
                  ) : null}
                  {(profileData?.steamId || targetUser.steamId) && (
                    <span className="text-slate-500 font-mono text-[10px]">
                      Steam: {profileData?.steamId || targetUser.steamId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span className="font-bold text-white">{messageCount}</span> messages
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {profileData?.isBanned ? 'Compte restreint' : 'Compte actif'}
              </div>
            </div>
          </div>

          {/* Si la cible est protégée (créateur ou modérateur pour un modo) */}
          {!canModerateTarget ? (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {targetIsCreator
                  ? "Ce profil est le compte officiel du Fondateur/Créateur. Les actions de modération sont impossibles."
                  : "Vous ne pouvez pas modérer un confrère modérateur."}
              </span>
            </div>
          ) : (
            <>
              {/* Actions de modération */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Actions de Sécurité & Sanctions
                </h4>

                {/* Bouton Bannir / Débannir */}
                <div className="p-3 rounded-xl bg-[#020d0a] border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {profileData?.isBanned ? (
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <UserX className="w-4 h-4 text-rose-400" />
                        )}
                        <span>
                          {profileData?.isBanned
                            ? "Réactiver l'accès au tchat"
                            : "Bannir de la discussion"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {profileData?.isBanned
                          ? "L'utilisateur pourra de nouveau poster des messages."
                          : "Bloque l'envoi de messages et révoque les privilèges sociaux."}
                      </p>
                    </div>

                    {!showBanConfirm ? (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setShowBanConfirm(true);
                        }}
                        disabled={actionLoading || loading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                          profileData?.isBanned
                            ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40'
                            : 'bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40'
                        }`}
                      >
                        {profileData?.isBanned ? 'Débannir' : 'Bannir'}
                      </button>
                    ) : null}
                  </div>

                  {showBanConfirm && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      {!profileData?.isBanned && (
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Motif du bannissement (optionnel)..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                      )}
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowBanConfirm(false)}
                          className="px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBan(!profileData?.isBanned)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-xs font-bold rounded-lg text-white transition cursor-pointer ${
                            profileData?.isBanned
                              ? 'bg-emerald-600 hover:bg-emerald-500'
                              : 'bg-rose-600 hover:bg-rose-500'
                          }`}
                        >
                          {actionLoading
                            ? 'Traitement...'
                            : profileData?.isBanned
                            ? 'Confirmer le déban'
                            : 'Confirmer le bannissement'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Purge des messages */}
                <div className="p-3 rounded-xl bg-[#020d0a] border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>Faire disparaître tous ses messages</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Supprime et purge physiquement l'intégralité de ses messages du Sanctuaire.
                      </p>
                    </div>

                    {!showPurgeConfirm ? (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setShowPurgeConfirm(true);
                        }}
                        disabled={actionLoading || loading || messageCount === 0}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Purger ({messageCount})
                      </button>
                    ) : null}
                  </div>

                  {showPurgeConfirm && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-rose-300">
                        ⚠️ Tous les {messageCount} messages vont disparaître définitivement.
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowPurgeConfirm(false)}
                          className="px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={handlePurgeMessages}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                        >
                          {actionLoading ? 'Purge...' : 'Confirmer la purge'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Réinitialiser le pseudo offensant */}
                <div className="p-3 rounded-xl bg-[#020d0a] border border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>Réinitialiser le pseudonyme</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Remplace un pseudo inapproprié par un identifiant anonyme générique (ex: Joueur_XXXX).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetUsername}
                    disabled={actionLoading || loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer shrink-0"
                  >
                    Réinitialiser
                  </button>
                </div>

                {/* Gestion de Rôle (Admin uniquement) */}
                {isStrictAdmin && !targetIsCreator && (
                  <div className="p-3 rounded-xl bg-[#020d0a] border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Attribuer un Rôle (Action Admin)</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Définir le niveau de privilège de ce compte.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('user')}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                          profileData?.role === 'user' || (!profileData?.role && targetUser.role === 'user')
                            ? 'bg-emerald-500/30 border-emerald-400 text-white font-bold'
                            : 'bg-black/40 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Membre
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('vip')}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                          profileData?.role === 'vip'
                            ? 'bg-purple-500/30 border-purple-400 text-white font-bold'
                            : 'bg-black/40 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        VIP ✨
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('moderator')}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                          profileData?.role === 'moderator'
                            ? 'bg-blue-500/30 border-blue-400 text-white font-bold'
                            : 'bg-black/40 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Modérateur 🛡️
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Derniers messages de l'utilisateur */}
              {recentMessages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Derniers messages ({recentMessages.length})</span>
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {recentMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-lg text-[11px] border ${
                          m.isDeleted
                            ? 'bg-black/30 border-slate-800 text-slate-500 italic'
                            : 'bg-[#020d0a] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span className="font-mono">#{m.channel}</span>
                          <span>
                            {new Date(m.timestamp * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="truncate">{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pied de la modale */}
        <div className="px-5 py-3 border-t border-emerald-500/20 bg-emerald-950/20 flex items-center justify-between text-xs">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Sécurité souveraine Hoot Indie Games</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
