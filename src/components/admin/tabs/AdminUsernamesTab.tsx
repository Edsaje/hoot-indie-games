import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Globe,
  Star,
  Ban,
  Shield,
  Search,
  X,
  UserPlus,
  Crown,
  Sparkles,
  ExternalLink,
  Check,
  FileText,
  Gift,
  Edit3,
  Eraser,
  Lock,
  Trash2,
  AlertTriangle,
  RotateCw,
  Tag,
} from 'lucide-react';
import {
  ADMIN_STEAM_ID,
  deleteRegisteredUsername,
  editAdminUser,
  toggleBanAdminUser,
  purgeUserLeaderboardScores,
  manageForbiddenNames,
  createAdminUser,
  giveAdminReward,
  type AdminUsernameEntry,
  type AdminOverviewPayload,
} from '../../../services/adminService';
import { getDynamicCardsPool } from '../../../data/cardsData';
import { RARITY_CONFIG } from '../../../types/cards';
import { soundFx } from '../../../utils/audio';

interface AdminUsernamesTabProps {
  usernames?: AdminOverviewPayload['usernames'];
  currentSteamId: string;
  onRefresh: () => Promise<void>;
  onNotice: (type: 'success' | 'error', message: string) => void;
}

export const AdminUsernamesTab: React.FC<AdminUsernamesTabProps> = ({
  usernames,
  currentSteamId,
  onRefresh,
  onNotice,
}) => {
  // Filtres
  const [usernameFilter, setUsernameFilter] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'steam' | 'staff' | 'banned'>('all');

  // Confirmation de suppression
  const [confirmDeleteUsername, setConfirmDeleteUsername] = useState<string | null>(null);

  // Modale d'édition utilisateur
  const [editingUser, setEditingUser] = useState<AdminUsernameEntry | null>(null);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editRole, setEditRole] = useState<'admin' | 'moderator' | 'vip' | 'user'>('user');
  const [editStatus, setEditStatus] = useState<'active' | 'banned'>('active');
  const [editCustomTitle, setEditCustomTitle] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  // Modale de création / réservation utilisateur
  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);
  const [createUsername, setCreateUsername] = useState<string>('');
  const [createSteamId, setCreateSteamId] = useState<string>('');
  const [createRole, setCreateRole] = useState<'admin' | 'moderator' | 'vip' | 'user'>('user');
  const [createCustomTitle, setCreateCustomTitle] = useState<string>('');
  const [createNote, setCreateNote] = useState<string>('');
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  // Modale de gestion de la blacklist des pseudos
  const [isBlacklistOpen, setIsBlacklistOpen] = useState<boolean>(false);
  const [newForbiddenWord, setNewForbiddenWord] = useState<string>('');
  const [isUpdatingBlacklist, setIsUpdatingBlacklist] = useState<boolean>(false);

  // Confirmation de purge des scores
  const [purgingUser, setPurgingUser] = useState<AdminUsernameEntry | null>(null);
  const [isPurgingScores, setIsPurgingScores] = useState<boolean>(false);

  // Modale d'attribution de récompense souveraine (Gift)
  const [rewardingUser, setRewardingUser] = useState<AdminUsernameEntry | null>(null);
  const [rewardFeathers, setRewardFeathers] = useState<number>(100);
  const [rewardCardId, setRewardCardId] = useState<string>('');
  const [rewardIsHolo, setRewardIsHolo] = useState<boolean>(false);
  const [rewardReason, setRewardReason] = useState<string>('Récompense souveraine offerte par Hibouxe 👑');
  const [rewardCardSearch, setRewardCardSearch] = useState<string>('');
  const [isSubmittingReward, setIsSubmittingReward] = useState<boolean>(false);

  // Filtrage des pseudos
  const filteredUsernames = useMemo(() => {
    if (!usernames?.list) return [];
    let list = usernames.list;

    if (userStatusFilter === 'steam') {
      list = list.filter((u) => !!u.steamId);
    } else if (userStatusFilter === 'staff') {
      list = list.filter((u) => u.role === 'admin' || u.role === 'moderator' || u.role === 'vip' || u.normalized === 'hibouxe');
    } else if (userStatusFilter === 'banned') {
      list = list.filter((u) => u.status === 'banned');
    }

    const q = usernameFilter.trim().toLowerCase();
    if (!q) return list;

    return list.filter((u) => {
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.normalized.toLowerCase().includes(q) ||
        (u.steamId && u.steamId.includes(q)) ||
        (u.friendCode && u.friendCode.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.customTitle && u.customTitle.toLowerCase().includes(q)) ||
        (u.note && u.note.toLowerCase().includes(q))
      );
    });
  }, [usernames, usernameFilter, userStatusFilter]);

  // Pool de cartes pour attribution de récompenses
  const availableCards = useMemo(() => {
    const pool = getDynamicCardsPool();
    if (!rewardCardSearch.trim()) return pool;
    const q = rewardCardSearch.toLowerCase().trim();
    return pool.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.developer.toLowerCase().includes(q) ||
        c.rarity.toLowerCase().includes(q)
    );
  }, [rewardCardSearch]);

  // Handlers
  const handleDeleteUsername = async (targetName: string) => {
    soundFx.playClick();
    try {
      const res = await deleteRegisteredUsername(targetName, currentSteamId);
      if (res.success) {
        onNotice('success', res.message);
        setConfirmDeleteUsername(null);
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Échec de la suppression.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la suppression.');
    }
  };

  const handleOpenEditUser = (u: AdminUsernameEntry) => {
    soundFx.playClick();
    setEditingUser(u);
    setEditDisplayName(u.displayName);
    setEditRole(u.role || 'user');
    setEditStatus(u.status || 'active');
    setEditCustomTitle(u.customTitle || '');
    setEditNote(u.note || '');
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    soundFx.playClick();
    setIsSavingUser(true);
    try {
      const res = await editAdminUser(
        editingUser.normalized,
        {
          displayName: editDisplayName.trim(),
          role: editRole,
          status: editStatus,
          customTitle: editCustomTitle.trim(),
          note: editNote.trim(),
        },
        currentSteamId
      );
      if (res.success) {
        onNotice('success', res.message);
        setEditingUser(null);
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Échec de la modification.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la mise à jour.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleToggleBan = async (u: AdminUsernameEntry) => {
    soundFx.playClick();
    const isCurrentlyBanned = u.status === 'banned';
    try {
      const res = await toggleBanAdminUser(u.normalized, !isCurrentlyBanned, currentSteamId);
      if (res.success) {
        onNotice('success', res.message);
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Impossible de modifier le statut.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de l\'opération.');
    }
  };

  const handleConfirmPurgeScores = async () => {
    if (!purgingUser) return;
    soundFx.playClick();
    setIsPurgingScores(true);
    try {
      const res = await purgeUserLeaderboardScores(purgingUser.displayName, currentSteamId);
      if (res.success) {
        onNotice('success', res.message);
        setPurgingUser(null);
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Échec de la purge.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la purge.');
    } finally {
      setIsPurgingScores(false);
    }
  };

  const handleSendReward = async () => {
    if (!rewardingUser) return;
    if (rewardFeathers <= 0 && !rewardCardId) {
      onNotice('error', 'Veuillez spécifier un montant de plumes ou choisir une carte.');
      return;
    }
    soundFx.playClick();
    setIsSubmittingReward(true);
    try {
      const res = await giveAdminReward(
        rewardingUser.normalized,
        {
          feathers: rewardFeathers > 0 ? rewardFeathers : undefined,
          cardId: rewardCardId || undefined,
          isHolo: rewardIsHolo,
          reason: rewardReason.trim() || undefined,
        },
        currentSteamId
      );
      if (res.success) {
        soundFx.playVictory();
        onNotice('success', res.message || `Récompense attribuée avec succès à « ${rewardingUser.displayName} » !`);
        setRewardingUser(null);
      } else {
        onNotice('error', res.message || 'Impossible d\'attribuer la récompense.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de l\'attribution de la récompense.');
    } finally {
      setIsSubmittingReward(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createUsername.trim()) return;
    soundFx.playClick();
    setIsCreatingUser(true);
    try {
      const res = await createAdminUser(
        {
          username: createUsername.trim(),
          targetSteamId: createSteamId.trim() || undefined,
          role: createRole,
          customTitle: createCustomTitle.trim() || undefined,
          note: createNote.trim() || undefined,
        },
        currentSteamId
      );
      if (res.success) {
        onNotice('success', res.message);
        setIsCreateUserOpen(false);
        setCreateUsername('');
        setCreateSteamId('');
        setCreateRole('user');
        setCreateCustomTitle('');
        setCreateNote('');
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Échec de la réservation.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la création.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleAddForbiddenWord = async () => {
    if (!newForbiddenWord.trim()) return;
    soundFx.playClick();
    setIsUpdatingBlacklist(true);
    try {
      const res = await manageForbiddenNames('add', newForbiddenWord.trim(), currentSteamId);
      if (res.success) {
        onNotice('success', res.message || 'Mot ajouté à la blacklist.');
        setNewForbiddenWord('');
        await onRefresh();
      } else {
        onNotice('error', 'Impossible d\'ajouter ce mot.');
      }
    } catch {
      onNotice('error', 'Erreur réseau.');
    } finally {
      setIsUpdatingBlacklist(false);
    }
  };

  const handleRemoveForbiddenWord = async (word: string) => {
    soundFx.playClick();
    setIsUpdatingBlacklist(true);
    try {
      const res = await manageForbiddenNames('remove', word, currentSteamId);
      if (res.success) {
        onNotice('success', res.message || 'Mot retiré de la blacklist.');
        await onRefresh();
      } else {
        onNotice('error', 'Impossible de retirer ce mot.');
      }
    } catch {
      onNotice('error', 'Erreur réseau.');
    } finally {
      setIsUpdatingBlacklist(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 5 KPIs Métriques Clés Utilisateurs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Joueurs */}
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Pseudos</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {usernames?.total || usernames?.list?.length || 0}
          </div>
          <div className="text-[10px] text-cyan-300">Identités enregistrées</div>
        </div>

        {/* 2. Comptes Steam Liés */}
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Steam Liés</span>
            <Globe className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-blue-300 font-mono">
            {usernames?.list?.filter((u) => !!u.steamId).length || 0}
          </div>
          <div className="text-[10px] text-blue-400">Authentification Valve</div>
        </div>

        {/* 3. VIP & Staff */}
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Staff & VIP</span>
            <Star className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">
            {usernames?.list?.filter((u) => u.role === 'admin' || u.role === 'moderator' || u.role === 'vip' || u.normalized === 'hibouxe').length || 0}
          </div>
          <div className="text-[10px] text-amber-400">Rôles privilégiés</div>
        </div>

        {/* 4. Bannis */}
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Suspendus / Bannis</span>
            <Ban className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-black text-red-300 font-mono">
            {usernames?.bannedCount ?? (usernames?.list?.filter((u) => u.status === 'banned').length || 0)}
          </div>
          <div className="text-[10px] text-red-400">Bloqués de scores</div>
        </div>

        {/* 5. Blacklist */}
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Blacklist</span>
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-300 font-mono">
            {usernames?.forbiddenNames?.length || 2}
          </div>
          <div className="text-[10px] text-purple-400">Mots interdits actifs</div>
        </div>
      </div>

      {/* Barre de Filtres et d'Actions Rapides */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0c1220] p-3 rounded-2xl border border-white/5">
        {/* Recherche textuelle */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            placeholder="Rechercher par nom, slug, Steam ID, titre ou note..."
            className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition"
          />
          {usernameFilter && (
            <button
              onClick={() => setUsernameFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer p-0.5 rounded hover:bg-white/10 transition"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {[
            { id: 'all', label: 'Tous', count: usernames?.list?.length || 0 },
            { id: 'steam', label: 'Steam', count: usernames?.list?.filter((u) => !!u.steamId).length || 0 },
            { id: 'staff', label: 'Staff / VIP', count: usernames?.list?.filter((u) => u.role === 'admin' || u.role === 'moderator' || u.role === 'vip' || u.normalized === 'hibouxe').length || 0 },
            { id: 'banned', label: 'Bannis', count: usernames?.list?.filter((u) => u.status === 'banned').length || 0 },
          ].map((f) => {
            const isSelected = userStatusFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  soundFx.playClick();
                  setUserStatusFilter(f.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({f.count})</span>
              </button>
            );
          })}
        </div>

        {/* Boutons d'Action Admin */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsCreateUserOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Réserver un Joueur</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsBlacklistOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Blacklist Pseudos</span>
          </button>
        </div>
      </div>

      {/* Table des Utilisateurs */}
      <div className="rounded-2xl bg-[#0c1220] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="p-3">Joueur / Identité</th>
                <th className="p-3 hidden sm:table-cell">Compte Steam</th>
                <th className="p-3">Rôle & Statut</th>
                <th className="p-3 hidden lg:table-cell">Note Admin</th>
                <th className="p-3 hidden md:table-cell">Inscription</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsernames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Aucun utilisateur ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredUsernames.map((u) => {
                  const isCreator = u.normalized === 'hibouxe' && u.steamId === ADMIN_STEAM_ID;
                  const isCurrentAdmin = isCreator;
                  const isBanned = u.status === 'banned';
                  const role = isCreator ? 'admin' : (u.role === 'admin' ? 'user' : (u.role || 'user'));

                  return (
                    <tr key={u.normalized} className="hover:bg-white/[0.02] transition">
                      {/* Colonne 1: Identité */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              isCreator
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                                : role === 'admin'
                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                                : role === 'moderator'
                                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                                : role === 'vip'
                                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {isCreator ? (
                              <Crown className="w-4 h-4" />
                            ) : role === 'moderator' ? (
                              <Shield className="w-4 h-4 text-blue-300" />
                            ) : role === 'vip' ? (
                              <Star className="w-4 h-4" />
                            ) : (
                              u.displayName.slice(0, 1).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-bold ${isBanned ? 'text-red-400 line-through' : 'text-white'}`}>
                                {u.displayName}
                              </span>
                              {isCreator && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" /> Créateur
                                </span>
                              )}
                              {u.customTitle && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 truncate max-w-[140px] inline-flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>{u.customTitle}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                              <span>@{u.normalized}</span>
                              {u.friendCode && (
                                <span className="text-cyan-400/90 font-bold">• {u.friendCode}</span>
                              )}
                              {u.email && (
                                <span className="text-slate-400 truncate max-w-[160px]" title={u.email}>• {u.email}</span>
                              )}
                              {u.isAdminReserved && !isCreator && (
                                <span className="text-amber-400/80">• Réservé admin</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Colonne 2: Steam */}
                      <td className="p-3 hidden sm:table-cell font-mono text-[11px]">
                        {u.steamId ? (
                          <a
                            href={`https://steamcommunity.com/profiles/${u.steamId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline transition"
                            title="Voir le profil Steam Community"
                          >
                            <span>{u.steamId}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Local / Sans Steam</span>
                        )}
                      </td>

                      {/* Colonne 3: Rôle & Statut */}
                      <td className="p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${
                              role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : role === 'moderator'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : role === 'vip'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {role === 'admin' && <Crown className="w-2.5 h-2.5" />}
                            {role === 'moderator' && <Shield className="w-2.5 h-2.5" />}
                            {role === 'vip' && <Star className="w-2.5 h-2.5" />}
                            {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Modérateur' : role === 'vip' ? 'VIP' : 'Joueur'}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${
                              isBanned
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-black'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isBanned ? (
                              <span className="inline-flex items-center gap-1">
                                <Ban className="w-2.5 h-2.5 text-red-400" /> Banni
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-emerald-400" /> Actif
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Colonne 4: Note Admin Privée */}
                      <td className="p-3 hidden lg:table-cell text-[11px] text-slate-400">
                        {u.note ? (
                          <div className="flex items-center gap-1 text-slate-300 max-w-xs truncate" title={u.note}>
                            <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate italic">« {u.note} »</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Colonne 5: Date Inscription */}
                      <td className="p-3 hidden md:table-cell text-slate-400 text-[11px]">
                        <div>{u.claimedAt ? new Date(u.claimedAt).toLocaleDateString() : 'N/A'}</div>
                        {u.lastSeenAt && (
                          <div className="text-[10px] text-slate-400">
                            Vu : {new Date(u.lastSeenAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Colonne 6: Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton Offrir Cadeau (Plumes / Cartes) */}
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setRewardingUser(u);
                              setRewardFeathers(100);
                              setRewardCardId('');
                              setRewardIsHolo(false);
                              setRewardReason('Récompense souveraine offerte par Hibouxe 👑');
                              setRewardCardSearch('');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                            title="Offrir des plumes ou une carte à ce joueur"
                          >
                            <Gift className="w-3.5 h-3.5" />
                          </button>

                          {/* Bouton Éditer */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                            title="Modifier le joueur (Pseudo, rôle, titre, note)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Bouton Bannir / Débannir */}
                          {!isCreator && !isCurrentAdmin && (
                            <button
                              onClick={() => handleToggleBan(u)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isBanned
                                  ? 'text-emerald-400 hover:bg-emerald-500/10'
                                  : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                              }`}
                              title={isBanned ? 'Réactiver le joueur' : 'Bannir / suspendre le joueur'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Bouton Purger Scores */}
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setPurgingUser(u);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition cursor-pointer"
                            title="Purger tous les scores Leaderboard de ce joueur"
                          >
                            <Eraser className="w-3.5 h-3.5" />
                          </button>

                          {/* Bouton Supprimer / Libérer */}
                          {isCreator || isCurrentAdmin ? (
                            <span className="p-1.5 text-slate-500 cursor-not-allowed inline-flex items-center justify-center" title="Compte inaliénable">
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                            </span>
                          ) : confirmDeleteUsername === u.normalized ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteUsername(u.normalized)}
                                className="px-2 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Oui
                              </button>
                              <button
                                onClick={() => setConfirmDeleteUsername(null)}
                                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] cursor-pointer"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteUsername(u.normalized)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                              title="Libérer / Supprimer cette réservation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SOUS-MODALE 1 : ÉDITION D'UN UTILISATEUR                          */}
      {/* ================================================================= */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#0d1424] border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4 text-white z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Modifier le Joueur</h3>
                    <p className="text-xs text-slate-400 font-mono">@{editingUser.normalized}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Nom d'affichage */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Pseudonyme Affiché <span className="text-slate-400 font-normal">(2 à 24 caractères)</span>
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    maxLength={24}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                  />
                  {editDisplayName.trim().toLowerCase() !== editingUser.normalized && (
                    <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Modifier le nom migrera automatiquement l'enregistrement tout en conservant le lien Steam.</span>
                    </p>
                  )}
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Rôle & Privilèges</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['user', 'moderator', 'vip', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditRole(r)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          editRole === r
                            ? r === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                            : r === 'moderator'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                            : r === 'vip'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {r === 'admin' && <Crown className="w-3.5 h-3.5" />}
                        {r === 'moderator' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
                        {r === 'vip' && <Star className="w-3.5 h-3.5" />}
                        <span>{r === 'admin' ? 'Admin' : r === 'moderator' ? 'Modérateur' : r === 'vip' ? 'VIP' : 'Joueur'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Statut du Compte</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditStatus('active')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        editStatus === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Actif (Autorisé)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditStatus('banned')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        editStatus === 'banned'
                          ? 'bg-red-500/20 text-red-300 border-red-500/50'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Banni / Suspendu</span>
                    </button>
                  </div>
                </div>

                {/* Titre Personnalisé */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Titre Personnalisé <span className="text-slate-400 font-normal">(Affiché à côté du pseudo)</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editCustomTitle}
                      onChange={(e) => setEditCustomTitle(e.target.value)}
                      placeholder="ex: Maître du Pixel, Hibou Alpha..."
                      maxLength={32}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Note interne privée */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Note Privée Administrateur <span className="text-slate-400 font-normal">(Invisible pour les visiteurs)</span>
                  </label>
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Commentaire ou motif de surveillance..."
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 resize-none"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleSaveUserEdit}
                  disabled={isSavingUser || !editDisplayName.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingUser ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* SOUS-MODALE 2 : CRÉATION / RÉSERVATION MANUELLE                   */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isCreateUserOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateUserOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#0d1424] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 space-y-4 text-white z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Réserver un Pseudo Joueur</h3>
                    <p className="text-xs text-slate-400">Création manuelle d'identité par l'administrateur</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateUserOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Pseudonyme */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Pseudonyme <span className="text-cyan-400">*</span> <span className="text-slate-400 font-normal">(2 à 24 caractères)</span>
                  </label>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="ex: PixelMaster..."
                    maxLength={24}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Steam ID 64 */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Steam ID 64 <span className="text-slate-400 font-normal">(Optionnel, 17 chiffres)</span>
                  </label>
                  <input
                    type="text"
                    value={createSteamId}
                    onChange={(e) => setCreateSteamId(e.target.value)}
                    placeholder="ex: 76561198035270542..."
                    maxLength={25}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Rôle initial</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['user', 'moderator', 'vip', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCreateRole(r)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          createRole === r
                            ? r === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                            : r === 'moderator'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                            : r === 'vip'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {r === 'admin' && <Crown className="w-3.5 h-3.5" />}
                        {r === 'moderator' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
                        {r === 'vip' && <Star className="w-3.5 h-3.5" />}
                        <span>{r === 'admin' ? 'Admin' : r === 'moderator' ? 'Modérateur' : r === 'vip' ? 'VIP' : 'Joueur'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre Personnalisé */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Titre Personnalisé <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={createCustomTitle}
                      onChange={(e) => setCreateCustomTitle(e.target.value)}
                      placeholder="ex: Ami du Studio, Vainqueur Tournoi..."
                      maxLength={32}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Note Privée Administrateur <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <textarea
                    value={createNote}
                    onChange={(e) => setCreateNote(e.target.value)}
                    placeholder="Commentaire de création..."
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={isCreatingUser || !createUsername.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingUser ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Créer et Réserver</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* SOUS-MODALE 3 : GESTION DE LA BLACKLIST DES PSEUDOS               */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isBlacklistOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBlacklistOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#0d1424] border border-purple-500/30 rounded-2xl shadow-2xl p-6 space-y-4 text-white z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Blacklist des Pseudos</h3>
                    <p className="text-xs text-slate-400">Termes et mots interdits à la réservation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBlacklistOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Les termes figurant dans cette liste sont automatiquement rejetés lors de la tentative de réservation de pseudonyme sur le site.
                </p>

                {/* Formulaire d'ajout */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newForbiddenWord}
                    onChange={(e) => setNewForbiddenWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddForbiddenWord();
                    }}
                    placeholder="Ajouter un terme interdit (ex: vulgarité, usurpation)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleAddForbiddenWord}
                    disabled={isUpdatingBlacklist || !newForbiddenWord.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Liste des termes */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Termes actuellement bloqués ({usernames?.forbiddenNames?.length || 2})
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-3 rounded-xl bg-black/30 border border-white/5">
                    {(usernames?.forbiddenNames || ['hibouxe', 'edsaje']).map((word) => {
                      const isProtected = word === 'hibouxe' || word === 'edsaje';
                      return (
                        <span
                          key={word}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                            isProtected
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isProtected && <Lock className="w-3 h-3 text-amber-400" />}
                          <span>{word}</span>
                          {!isProtected && (
                            <button
                              onClick={() => handleRemoveForbiddenWord(word)}
                              className="ml-1 text-purple-400 hover:text-red-400 cursor-pointer p-0.5 rounded hover:bg-white/10 transition"
                              title="Supprimer de la blacklist"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  onClick={() => setIsBlacklistOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* SOUS-MODALE 4 : CONFIRMATION DE PURGE DES SCORES                  */}
      {/* ================================================================= */}
      <AnimatePresence>
        {purgingUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPurgingUser(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0d1424] border border-orange-500/40 rounded-2xl shadow-2xl p-6 space-y-4 text-white z-10"
            >
              <div className="flex items-center gap-3 text-orange-400">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Eraser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Purger les Scores ?</h3>
                  <p className="text-xs text-orange-400 font-bold">{purgingUser.displayName}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Cette action va scanner l'ensemble des classements du serveur (Indledle, Screenle, Linkle, Snake, Flappy, Pong...) et <strong>supprimer définitivement tous les scores</strong> enregistrés sous le pseudonyme « <span className="text-white font-bold">{purgingUser.displayName}</span> ».
              </p>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Cette opération est irréversible et recommandée en cas de triche ou de score anormal.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPurgingUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPurgeScores}
                  disabled={isPurgingScores}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isPurgingScores ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Purger Définitivement</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* SOUS-MODALE 5 : ATTRIBUTION DE RÉCOMPENSE SOUVERAINE (GIFT)        */}
      {/* ================================================================= */}
      <AnimatePresence>
        {rewardingUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRewardingUser(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#0d1424] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4 text-white z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      <span>Offrir un Cadeau Souverain</span>
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Destinataire : <span className="text-amber-300 font-bold">{rewardingUser.displayName}</span> (@{rewardingUser.normalized})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRewardingUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body (scrollable) */}
              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* Section 1 : Plumes d'Or */}
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🪶 Plumes d'Or à Offrir</span>
                    </label>
                    <span className="text-[11px] font-mono text-amber-400/90 font-bold">
                      Total : +{rewardFeathers.toLocaleString()} Plumes
                    </span>
                  </div>

                  {/* Presets rapides */}
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 50, 100, 250, 500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRewardFeathers(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          rewardFeathers === amt
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {amt === 0 ? '0' : `+${amt}`}
                      </button>
                    ))}
                  </div>

                  {/* Champ montant personnalisé */}
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="10"
                    value={rewardFeathers}
                    onChange={(e) => setRewardFeathers(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    placeholder="Montant libre de plumes..."
                  />
                </div>

                {/* Section 2 : Carte de Collection */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Carte de Collection (Optionnel)</span>
                    </label>
                    {rewardCardId && (
                      <button
                        type="button"
                        onClick={() => {
                          setRewardCardId('');
                          setRewardIsHolo(false);
                        }}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Retirer la carte
                      </button>
                    )}
                  </div>

                  {/* Barre de recherche de carte */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rewardCardSearch}
                      onChange={(e) => setRewardCardSearch(e.target.value)}
                      placeholder="Rechercher par nom de jeu, dev, rareté..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    />
                  </div>

                  {/* Liste compacte des cartes */}
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-white/5 rounded-xl p-1 bg-black/20">
                    {availableCards.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-[11px]">
                        Aucune carte trouvée pour cette recherche
                      </div>
                    ) : (
                      availableCards.slice(0, 50).map((card) => {
                        const isSelected = rewardCardId === card.id;
                        const rCfg = RARITY_CONFIG[card.rarity];
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setRewardCardId('');
                                setRewardIsHolo(false);
                              } else {
                                setRewardCardId(card.id);
                              }
                            }}
                            className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 border border-amber-400 text-white'
                                : 'hover:bg-white/5 text-slate-300'
                            }`}
                          >
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              className="w-6 h-8 object-cover rounded bg-slate-900 shrink-0"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs truncate flex items-center gap-1.5">
                                <span>{card.title}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded border ${rCfg?.badgeClass || ''}`}>
                                  {rCfg?.nameFr || card.rarity}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{card.developer}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Option Holographique si une carte est sélectionnée */}
                  {rewardCardId && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <div>
                          <div className="text-xs font-bold text-yellow-200">Variante Holographique (Brillante)</div>
                          <div className="text-[10px] text-yellow-300/70">Effet arc-en-ciel brillant rare</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={rewardIsHolo}
                        onChange={(e) => setRewardIsHolo(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Section 3 : Motif / Message */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Motif ou Message du Don <span className="text-slate-400 font-normal">(Visible par le joueur)</span>
                  </label>
                  <input
                    type="text"
                    value={rewardReason}
                    onChange={(e) => setRewardReason(e.target.value)}
                    placeholder="ex: Récompense souveraine offerte par Hibouxe 👑"
                    maxLength={80}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 text-xs"
                  />
                  {/* Presets rapides de motif */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      'Cadeau offert par Hibouxe 👑',
                      'Vainqueur Tournoi de la Communauté 🏆',
                      'Remerciement Signalement de Bug 🐛',
                      'Bienvenue parmi nous ! 🎉',
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRewardReason(m)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setRewardingUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleSendReward}
                  disabled={isSubmittingReward || (rewardFeathers <= 0 && !rewardCardId)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReward ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Gift className="w-3.5 h-3.5" />
                  )}
                  <span>Envoyer le Cadeau</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
