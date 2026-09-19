import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  X,
  RotateCw,
  ExternalLink,
  Eye,
  Users,
  Gamepad2,
  Trophy,
  Lightbulb,
  Server,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  Lock,
  ArrowUpRight,
  Key,
  Shield,
  UserPlus,
  Edit3,
  Ban,
  Eraser,
  Tag,
  FileText,
  Star,
  Check,
} from 'lucide-react';
import {
  fetchAdminOverview,
  deleteRegisteredUsername,
  deleteCommunitySuggestion,
  resetServerStats,
  editAdminUser,
  toggleBanAdminUser,
  purgeUserLeaderboardScores,
  manageForbiddenNames,
  createAdminUser,
  ADMIN_STEAM_ID,
  type AdminOverviewPayload,
  type AdminUsernameEntry,
} from '../../services/adminService';
import {
  fetchSteamProxyStatus,
  saveMasterSteamApiKey,
} from '../../services/steamService';
import { useUserAccount } from '../../context/useUserAccount';
import { soundFx } from '../../utils/audio';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'overview' | 'games' | 'usernames' | 'suggestions' | 'system';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useUserAccount();
  const currentSteamId = profile.steam?.steamId || ADMIN_STEAM_ID;

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [data, setData] = useState<AdminOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtres et gestion des utilisateurs
  const [usernameFilter, setUsernameFilter] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'steam' | 'staff' | 'banned'>('all');

  // Modale d'édition utilisateur
  const [editingUser, setEditingUser] = useState<AdminUsernameEntry | null>(null);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editRole, setEditRole] = useState<'admin' | 'vip' | 'user'>('user');
  const [editStatus, setEditStatus] = useState<'active' | 'banned'>('active');
  const [editCustomTitle, setEditCustomTitle] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  // Modale de création / réservation utilisateur
  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);
  const [createUsername, setCreateUsername] = useState<string>('');
  const [createSteamId, setCreateSteamId] = useState<string>('');
  const [createRole, setCreateRole] = useState<'admin' | 'vip' | 'user'>('user');
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

  // Confirmation de suppression
  const [confirmDeleteUsername, setConfirmDeleteUsername] = useState<string | null>(null);
  const [confirmDeleteSuggestion, setConfirmDeleteSuggestion] = useState<string | null>(null);
  const [confirmResetStats, setConfirmResetStats] = useState<boolean>(false);

  // Clé Maîtresse Steam (Proxy Souverain Méthode 1)
  const [steamMasterStatus, setSteamMasterStatus] = useState<{ hasMasterKey: boolean; maskedKey?: string } | null>(null);
  const [adminMasterKeyInput, setAdminMasterKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [res, steamStatus] = await Promise.all([
        fetchAdminOverview(currentSteamId),
        fetchSteamProxyStatus().catch(() => ({ success: false, hasMasterKey: false })),
      ]);
      setData(res);
      if (steamStatus && typeof steamStatus.hasMasterKey === 'boolean') {
        setSteamMasterStatus(steamStatus);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de joindre le serveur de télémétrie.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSteamId]);

  const handleSaveMasterKeyFromAdmin = async () => {
    if (!adminMasterKeyInput.trim()) return;
    soundFx.playClick();
    setIsSavingKey(true);
    try {
      const res = await saveMasterSteamApiKey(adminMasterKeyInput, currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        setSteamMasterStatus({ hasMasterKey: true, maskedKey: res.maskedKey });
        setAdminMasterKeyInput('');
      } else {
        showNotice('error', res.message || 'Échec de l\'enregistrement de la clé.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de l\'enregistrement.');
    } finally {
      setIsSavingKey(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionNotice(null);
    }
  }, [isOpen, loadData]);

  // Écoute de la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Flash notification helper
  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  // Suppression d'un pseudonyme
  const handleDeleteUsername = async (targetName: string) => {
    soundFx.playClick();
    try {
      const res = await deleteRegisteredUsername(targetName, currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        setConfirmDeleteUsername(null);
        await loadData();
      } else {
        showNotice('error', res.message || 'Échec de la suppression.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la suppression.');
    }
  };

  // Ouvrir l'édition d'un utilisateur
  const handleOpenEditUser = (u: AdminUsernameEntry) => {
    soundFx.playClick();
    setEditingUser(u);
    setEditDisplayName(u.displayName);
    setEditRole(u.role || 'user');
    setEditStatus(u.status || 'active');
    setEditCustomTitle(u.customTitle || '');
    setEditNote(u.note || '');
  };

  // Enregistrer l'édition d'un utilisateur
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
        showNotice('success', res.message);
        setEditingUser(null);
        await loadData();
      } else {
        showNotice('error', res.message || 'Échec de la modification.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la mise à jour.');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Basculer le ban d'un utilisateur
  const handleToggleBan = async (u: AdminUsernameEntry) => {
    soundFx.playClick();
    const isCurrentlyBanned = u.status === 'banned';
    try {
      const res = await toggleBanAdminUser(u.normalized, !isCurrentlyBanned, currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        await loadData();
      } else {
        showNotice('error', res.message || 'Impossible de modifier le statut.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de l\'opération.');
    }
  };

  // Purger les scores d'un utilisateur
  const handleConfirmPurgeScores = async () => {
    if (!purgingUser) return;
    soundFx.playClick();
    setIsPurgingScores(true);
    try {
      const res = await purgeUserLeaderboardScores(purgingUser.displayName, currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        setPurgingUser(null);
        await loadData();
      } else {
        showNotice('error', res.message || 'Échec de la purge.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la purge.');
    } finally {
      setIsPurgingScores(false);
    }
  };

  // Créer / réserver un utilisateur
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
        showNotice('success', res.message);
        setIsCreateUserOpen(false);
        setCreateUsername('');
        setCreateSteamId('');
        setCreateRole('user');
        setCreateCustomTitle('');
        setCreateNote('');
        await loadData();
      } else {
        showNotice('error', res.message || 'Échec de la réservation.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la création.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Ajouter un terme à la blacklist
  const handleAddForbiddenWord = async () => {
    if (!newForbiddenWord.trim()) return;
    soundFx.playClick();
    setIsUpdatingBlacklist(true);
    try {
      const res = await manageForbiddenNames('add', newForbiddenWord.trim(), currentSteamId);
      if (res.success) {
        showNotice('success', res.message || 'Mot ajouté à la blacklist.');
        setNewForbiddenWord('');
        await loadData();
      } else {
        showNotice('error', 'Impossible d\'ajouter ce mot.');
      }
    } catch {
      showNotice('error', 'Erreur réseau.');
    } finally {
      setIsUpdatingBlacklist(false);
    }
  };

  // Retirer un terme de la blacklist
  const handleRemoveForbiddenWord = async (word: string) => {
    soundFx.playClick();
    setIsUpdatingBlacklist(true);
    try {
      const res = await manageForbiddenNames('remove', word, currentSteamId);
      if (res.success) {
        showNotice('success', res.message || 'Mot retiré de la blacklist.');
        await loadData();
      } else {
        showNotice('error', 'Impossible de retirer ce mot.');
      }
    } catch {
      showNotice('error', 'Erreur réseau.');
    } finally {
      setIsUpdatingBlacklist(false);
    }
  };

  // Suppression d'une suggestion
  const handleDeleteSuggestion = async (id: string) => {
    soundFx.playClick();
    try {
      const res = await deleteCommunitySuggestion(id, currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        setConfirmDeleteSuggestion(null);
        await loadData();
      } else {
        showNotice('error', res.message || 'Échec de la suppression.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la suppression.');
    }
  };

  // Réinitialisation des statistiques
  const handleResetStats = async () => {
    soundFx.playClick();
    try {
      const res = await resetServerStats(currentSteamId);
      if (res.success) {
        showNotice('success', res.message);
        setConfirmResetStats(false);
        await loadData();
      } else {
        showNotice('error', res.message || 'Échec de la réinitialisation.');
      }
    } catch {
      showNotice('error', 'Erreur réseau lors de la réinitialisation.');
    }
  };

  // Exportation complète en JSON
  const handleExportBackup = () => {
    soundFx.playClick();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoot_admin_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('success', 'Sauvegarde JSON téléchargée avec succès !');
  };

  // Liste filtrée des pseudonymes avec filtres de statut / rôle
  const filteredUsernames = useMemo(() => {
    if (!data?.usernames?.list) return [];
    let list = data.usernames.list;

    // Filtre par catégorie
    if (userStatusFilter === 'steam') {
      list = list.filter((u) => !!u.steamId);
    } else if (userStatusFilter === 'staff') {
      list = list.filter((u) => u.role === 'admin' || u.role === 'vip' || u.normalized === 'hibouxe' || u.normalized === 'edsaje');
    } else if (userStatusFilter === 'banned') {
      list = list.filter((u) => u.status === 'banned');
    }

    // Filtre textuel
    if (!usernameFilter.trim()) return list;
    const q = usernameFilter.toLowerCase().trim();
    return list.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.normalized.toLowerCase().includes(q) ||
        (u.steamId && u.steamId.toLowerCase().includes(q)) ||
        (u.customTitle && u.customTitle.toLowerCase().includes(q)) ||
        (u.note && u.note.toLowerCase().includes(q))
    );
  }, [data?.usernames?.list, usernameFilter, userStatusFilter]);

  if (!isOpen) return null;

  const summary = data?.analytics?.summary;
  const games = data?.analytics?.games;
  const referrers = data?.analytics?.referrers || {};
  const devices = data?.analytics?.devices || { desktop: 0, mobile: 0, tablet: 0 };
  const totalDevices = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0);

  const desktopPct = totalDevices > 0 ? Math.round((devices.desktop / totalDevices) * 100) : 0;
  const mobilePct = totalDevices > 0 ? Math.round((devices.mobile / totalDevices) * 100) : 0;
  const tabletPct = totalDevices > 0 ? Math.round((devices.tablet / totalDevices) * 100) : 0;

  const winRatePct =
    summary && summary.games_played > 0
      ? Math.round((summary.games_won / summary.games_played) * 100)
      : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop sombre avec blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Conteneur principal de la modale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-[#090d16] border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Ligne d'accent en dégradé supérieur */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 shrink-0" />

          {/* En-tête de la modale */}
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between gap-4 flex-wrap bg-[#0c1220] shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    Tableau de Bord Administrateur
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35">
                    👑 Accès Souverain Certifié
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Steam ID : <code className="text-amber-300 font-mono">{ADMIN_STEAM_ID}</code></span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Hébergement Souverain OVHcloud & RGPD
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  loadData();
                }}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Actualiser les métriques"
                aria-label="Actualiser"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              <a
                href="/api/track.php"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                title="Ouvrir la console PHP dédiée en plein écran"
              >
                <span>Console Plein Écran</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bannière de notification d'action */}
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b shrink-0 ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{actionNotice.message}</span>
            </motion.div>
          )}

          {/* Bandeau de navigation par Onglets */}
          <div className="flex overflow-x-auto border-b border-white/5 px-4 sm:px-6 bg-[#090d16] no-scrollbar shrink-0 gap-2 pt-3">
            {[
              { id: 'overview' as AdminTab, label: "Vue d'Ensemble & Trafic", icon: Activity },
              { id: 'games' as AdminTab, label: 'Activité des Jeux', icon: Gamepad2 },
              {
                id: 'usernames' as AdminTab,
                label: 'Pseudonymes',
                icon: Users,
                badge: data?.usernames?.total ? String(data.usernames.total) : undefined,
              },
              {
                id: 'suggestions' as AdminTab,
                label: 'Boîte à Pépites',
                icon: Lightbulb,
                badge: data?.suggestions?.total ? String(data.suggestions.total) : undefined,
              },
              { id: 'system' as AdminTab, label: 'Système & Fichiers', icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Corps de la modale avec défilement */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
            {isLoading && !data && (
              <div className="py-20 text-center space-y-3">
                <RotateCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm text-slate-400">Interrogation sécurisée du serveur souverain...</p>
              </div>
            )}

            {error && !data && (
              <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4 max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Validation Administrateur Steam Requise</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {error.includes('unauthorized') || error.includes('401')
                      ? 'Pour des raisons de cybersécurité, l\'accès aux métriques et à la modération requiert une session Steam validée par Valve.'
                      : error}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
                  <a
                    href="/api/track.php"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Activer ma Session Steam</span>
                  </a>
                  <button
                    onClick={loadData}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {data && (
              <>
                {/* ------------------------------------------------------------- */}
                {/* ONGLET 1 : VUE D'ENSEMBLE & TRAFIC                           */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Grille des 5 KPIs Supérieurs */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="p-4 rounded-2xl bg-[#0e1526] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                          <span>Pages Vues</span>
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono">
                          {(summary?.pageviews ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-medium">Trafic global</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0e1526] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                          <span>Visiteurs</span>
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                          {(summary?.unique_visitors ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-amber-300/80 font-medium">Hachage SHA-256</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0e1526] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                          <span>Parties</span>
                          <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                          {(summary?.games_played ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-300/80 font-medium">Tous modes confondus</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0e1526] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                          <span>Victoires</span>
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono">
                          {(summary?.games_won ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Ratio : {winRatePct}%</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0e1526] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                          <span>Clics Steam</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
                          {(summary?.steam_clicks ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-indigo-300/80 font-medium">Pépites visitées</div>
                      </div>
                    </div>

                    {/* Répartition : Appareils & Sources de Trafic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Appareils */}
                      <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-cyan-400" />
                          <span>Appareils Utilisés</span>
                          <span className="text-[11px] font-normal text-slate-400">({totalDevices} sessions)</span>
                        </h3>

                        <div className="space-y-2.5">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <Monitor className="w-3.5 h-3.5 text-slate-400" /> Ordinateur (Desktop)
                              </span>
                              <span className="font-mono font-bold text-white">{desktopPct}% ({devices.desktop || 0})</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${desktopPct}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Mobile
                              </span>
                              <span className="font-mono font-bold text-white">{mobilePct}% ({devices.mobile || 0})</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${mobilePct}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <Tablet className="w-3.5 h-3.5 text-slate-400" /> Tablette
                              </span>
                              <span className="font-mono font-bold text-white">{tabletPct}% ({devices.tablet || 0})</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${tabletPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sources de Trafic (Referrers) */}
                      <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Globe className="w-4 h-4 text-amber-400" />
                          <span>Sources de Trafic (Referrers)</span>
                        </h3>

                        {Object.keys(referrers).length === 0 ? (
                          <div className="text-xs text-slate-500 py-4 text-center">Aucun référent enregistré pour le moment.</div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {Object.entries(referrers)
                              .sort((a, b) => b[1] - a[1])
                              .map(([ref, count]) => {
                                const maxCount = Math.max(...Object.values(referrers));
                                const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                                return (
                                  <div key={ref} className="text-xs space-y-1">
                                    <div className="flex justify-between text-slate-300">
                                      <span className="font-semibold text-white">{ref}</span>
                                      <span className="font-mono text-amber-300 font-bold">{count}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                      <div className="h-full bg-amber-400/80 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Journal des Derniers Événements en Direct (Live Feed) */}
                    <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span>Journal des Événements Récents (Live Feed)</span>
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {data.analytics?.recent?.length || 0} entrées récentes
                        </span>
                      </div>

                      {(!data.analytics?.recent || data.analytics.recent.length === 0) ? (
                        <div className="text-xs text-slate-500 py-4 text-center">
                          Aucun événement récent dans le tampon mémoire.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                          {data.analytics.recent.slice(0, 40).map((item, idx) => {
                            const isWin = item.event.includes('win') || item.event.includes('complete');
                            const isGame = item.event.includes('game') || item.category === 'game';
                            const isPage = item.event.includes('page');
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs hover:bg-white/[0.05] transition"
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                      isWin
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : isGame
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : isPage
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                    }`}
                                  >
                                    {item.event}
                                  </span>
                                  {item.label && (
                                    <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                                      {item.label}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0 font-mono">
                                  {item.device && <span className="uppercase">{item.device}</span>}
                                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* ONGLET 2 : ACTIVITÉ DES JEUX                                  */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'games' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Sessions et Victoires par Mode de Jeu
                      </h3>
                      <span className="text-xs text-amber-400 font-bold">
                        {summary?.games_played ?? 0} parties au total
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { id: 'screenle', label: '🎬 Screenle (Capture)', icon: '📸', ...games?.screenle },
                        { id: 'indledle', label: '🔍 Indledle (Classic)', icon: '📚', ...games?.indledle },
                        { id: 'linkle', label: '🔗 Linkle (Connexions)', icon: '✨', ...games?.linkle },
                        { id: 'versus', label: '⚔️ Versus Arena 1v1', icon: '⚔️', ...games?.versus },
                        { id: 'arcade', label: "🕹️ Salle d'Arcade (8 Bornes)", icon: '🕹️', ...games?.arcade },
                      ].map((g) => {
                        const plays = g.plays || 0;
                        const wins = g.wins || 0;
                        const winRate = plays > 0 ? Math.round((wins / plays) * 100) : 0;
                        return (
                          <div
                            key={g.id}
                            className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-2 hover:border-amber-500/30 transition"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{g.icon}</span>
                                <span>{g.label}</span>
                              </h4>
                            </div>

                            <div className="flex items-baseline justify-between pt-1">
                              <div>
                                <div className="text-2xl font-black text-amber-400 font-mono">{plays}</div>
                                <div className="text-[11px] text-slate-400">parties lancées</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-400 font-mono">🏆 {wins}</div>
                                <div className="text-[11px] text-slate-400">victoires ({winRate}%)</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* ONGLET 3 : GESTION DES PSEUDONYMES & UTILISATEURS             */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'usernames' && (
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
                          {data.usernames?.total || data.usernames?.list?.length || 0}
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
                          {data.usernames?.list?.filter((u) => !!u.steamId).length || 0}
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
                          {data.usernames?.list?.filter((u) => u.role === 'admin' || u.role === 'vip' || u.normalized === 'hibouxe' || u.normalized === 'edsaje').length || 0}
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
                          {data.usernames?.bannedCount ?? (data.usernames?.list?.filter((u) => u.status === 'banned').length || 0)}
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
                          {data.usernames?.forbiddenNames?.length || 2}
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
                          className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                        />
                        {usernameFilter && (
                          <button
                            onClick={() => setUsernameFilter('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filtres par catégorie */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                        {[
                          { id: 'all', label: 'Tous', count: data.usernames?.list?.length || 0 },
                          { id: 'steam', label: 'Steam', count: data.usernames?.list?.filter((u) => !!u.steamId).length || 0 },
                          { id: 'staff', label: 'Staff / VIP', count: data.usernames?.list?.filter((u) => u.role === 'admin' || u.role === 'vip' || u.normalized === 'hibouxe' || u.normalized === 'edsaje').length || 0 },
                          { id: 'banned', label: 'Bannis', count: data.usernames?.list?.filter((u) => u.status === 'banned').length || 0 },
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
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                  Aucun utilisateur ne correspond à vos critères de recherche.
                                </td>
                              </tr>
                            ) : (
                              filteredUsernames.map((u) => {
                                const isCreator = u.normalized === 'hibouxe' || u.normalized === 'edsaje';
                                const isCurrentAdmin = u.steamId === ADMIN_STEAM_ID;
                                const isBanned = u.status === 'banned';
                                const role = u.role || (isCreator ? 'admin' : 'user');

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
                                              : role === 'vip'
                                              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                              : 'bg-white/10 text-slate-300'
                                          }`}
                                        >
                                          {isCreator ? (
                                            <Crown className="w-4 h-4" />
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
                                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 truncate max-w-[140px]">
                                                ✨ {u.customTitle}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                            <span>@{u.normalized}</span>
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
                                        <span className="text-slate-500 text-[10px]">Local / Sans Steam</span>
                                      )}
                                    </td>

                                    {/* Colonne 3: Rôle & Statut */}
                                    <td className="p-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${
                                            role === 'admin'
                                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                              : role === 'vip'
                                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                          }`}
                                        >
                                          {role === 'admin' ? 'Admin' : role === 'vip' ? 'VIP' : 'Joueur'}
                                        </span>

                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${
                                            isBanned
                                              ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-black'
                                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                          }`}
                                        >
                                          {isBanned ? '🚫 Banni' : '✓ Actif'}
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
                                        <span className="text-slate-600 text-[10px]">—</span>
                                      )}
                                    </td>

                                    {/* Colonne 5: Date Inscription */}
                                    <td className="p-3 hidden md:table-cell text-slate-400 text-[11px]">
                                      <div>{u.claimedAt ? new Date(u.claimedAt).toLocaleDateString() : 'N/A'}</div>
                                      {u.lastSeenAt && (
                                        <div className="text-[10px] text-slate-500">
                                          Vu : {new Date(u.lastSeenAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </td>

                                    {/* Colonne 6: Actions */}
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1">
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
                                          <span className="p-1.5 text-slate-600 cursor-not-allowed" title="Compte inaliénable">
                                            🔒
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
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* ONGLET 4 : BOÎTE À PÉPITES (SUGGESTIONS)                      */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Pépites Indés Suggérées par les Visiteurs
                      </h3>
                      <span className="text-xs text-amber-400 font-bold">
                        {data.suggestions?.total || 0} suggestions en attente
                      </span>
                    </div>

                    {(!data.suggestions?.list || data.suggestions.list.length === 0) ? (
                      <div className="p-12 rounded-2xl bg-[#0c1220] border border-white/5 text-center space-y-2">
                        <Lightbulb className="w-8 h-8 text-amber-400/50 mx-auto" />
                        <p className="text-sm font-bold text-white">Aucune suggestion pour le moment</p>
                        <p className="text-xs text-slate-400">
                          Les jeux indés suggérés par la communauté via la boîte à outils apparaîtront ici.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.suggestions.list.map((s) => (
                          <div
                            key={s.id}
                            className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3 hover:border-amber-500/30 transition flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-bold text-white text-sm">{s.title}</h4>
                                  <p className="text-xs text-slate-400">
                                    Studio : <strong className="text-slate-300">{s.developer}</strong> ({s.releaseYear})
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                                  AppID {s.appId}
                                </span>
                              </div>

                              {s.comment && (
                                <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5 italic">
                                  « {s.comment} »
                                </p>
                              )}

                              {s.genres && s.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {s.genres.map((g, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400"
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                              <span className="text-[10px] text-slate-500">
                                {new Date(s.submittedAt).toLocaleDateString()}
                              </span>

                              <div className="flex items-center gap-2">
                                <a
                                  href={s.steamUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                                >
                                  <span>Steam</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>

                                {confirmDeleteSuggestion === s.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteSuggestion(s.id)}
                                      className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold"
                                    >
                                      Confirmer
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteSuggestion(null)}
                                      className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteSuggestion(s.id)}
                                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                                    title="Archiver / Supprimer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* ONGLET 5 : SYSTÈME & FICHIERS                                 */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'system' && (
                  <div className="space-y-6">
                    {/* Santé des fichiers JSON du serveur */}
                    <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" />
                        <span>État des Bases de Données Souveraines (JSON)</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <div className="text-[11px] text-slate-400 font-mono">stats.json</div>
                          <div className="text-base font-bold text-white">
                            {Math.round((data.system?.statsFileSize || 0) / 1024)} Ko
                          </div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verrouillage atomique
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <div className="text-[11px] text-slate-400 font-mono">registered_usernames.json</div>
                          <div className="text-base font-bold text-white">
                            {Math.round((data.system?.usernamesFileSize || 0) / 1024)} Ko
                          </div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Unicité stricte
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <div className="text-[11px] text-slate-400 font-mono">suggestions.json</div>
                          <div className="text-base font-bold text-white">
                            {Math.round((data.system?.suggestionsFileSize || 0) / 1024)} Ko
                          </div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Anti-spam rate-limit
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <div className="text-[11px] text-slate-400 font-mono">leaderboard_data.json</div>
                          <div className="text-base font-bold text-white">
                            {Math.round((data.system?.leaderboardFileSize || 0) / 1024)} Ko
                          </div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 19 classements actifs
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clé Maîtresse Steam (Proxy Souverain Méthode 1) */}
                    <div className="p-4 rounded-2xl bg-[#0c1220] border border-cyan-500/25 space-y-3.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Key className="w-4 h-4 text-cyan-400" />
                          <span>Clé API Steam Maîtresse du Site (Proxy Souverain Méthode 1)</span>
                        </h3>

                        {steamMasterStatus?.hasMasterKey ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Active : {steamMasterStatus.maskedKey || 'Configurée'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            Non configurée sur le serveur
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Cette clé est conservée de façon confidentielle sur le serveur OVHcloud dans <code>public/api/.steam_key</code> (protégée par <code>.htaccess</code> et <code>.gitignore</code>). Elle permet à tous les visiteurs du site de synchroniser automatiquement leurs jeux Steam en un clic, sans devoir générer de clé API eux-mêmes et sans restriction CORS.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <input
                          type="password"
                          value={adminMasterKeyInput}
                          onChange={(e) => setAdminMasterKeyInput(e.target.value)}
                          placeholder="Collez ici votre clé API Steam Web (ex: 32 caractères hexadécimaux)..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          onClick={handleSaveMasterKeyFromAdmin}
                          disabled={isSavingKey || !adminMasterKeyInput.trim()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-black text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-cyan-500/20"
                        >
                          {isSavingKey ? (
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Key className="w-3.5 h-3.5" />
                          )}
                          <span>Enregistrer la Clé Maîtresse</span>
                        </button>
                      </div>
                    </div>

                    {/* Sauvegarde & Export */}
                    <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h4 className="text-sm font-bold text-white">Exportation Intégrale de Sauvegarde</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Téléchargez une copie JSON complète de toutes les métriques, pseudos et suggestions actuelles.
                        </p>
                      </div>

                      <button
                        onClick={handleExportBackup}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger la Sauvegarde (.JSON)</span>
                      </button>
                    </div>

                    {/* Zone de Danger (Réinitialisation) */}
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Zone Critique d'Administration</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        La réinitialisation des statistiques remet à zéro tous les compteurs de visites, de parties et le journal d'événements. Les pseudonymes et suggestions sont conservés.
                      </p>

                      {confirmResetStats ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleResetStats}
                            className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition cursor-pointer"
                          >
                            Confirmer la Réinitialisation Définitive
                          </button>
                          <button
                            onClick={() => setConfirmResetStats(false)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmResetStats(true)}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs transition cursor-pointer"
                        >
                          Réinitialiser les Statistiques
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ================================================================= */}
          {/* SOUS-MODALE 1 : ÉDITION D'UTILISATEUR                             */}
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
                        Pseudonyme Affiché <span className="text-slate-500 font-normal">(2 à 24 caractères)</span>
                      </label>
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        maxLength={24}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-amber-400"
                      />
                      {editDisplayName.trim().toLowerCase() !== editingUser.normalized && (
                        <p className="text-[10px] text-amber-400 mt-1">
                          ⚠️ Modifier le nom migrera automatiquement l'enregistrement tout en conservant le lien Steam.
                        </p>
                      )}
                    </div>

                    {/* Rôle */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Rôle & Privilèges</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['user', 'vip', 'admin'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setEditRole(r)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              editRole === r
                                ? r === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                : r === 'vip'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {r === 'admin' && <Crown className="w-3.5 h-3.5" />}
                            {r === 'vip' && <Star className="w-3.5 h-3.5" />}
                            <span>{r === 'admin' ? 'Admin' : r === 'vip' ? 'VIP' : 'Joueur'}</span>
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
                        Titre Personnalisé <span className="text-slate-500 font-normal">(Affiché à côté du pseudo)</span>
                      </label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={editCustomTitle}
                          onChange={(e) => setEditCustomTitle(e.target.value)}
                          placeholder="ex: Maître du Pixel, Hibou Alpha..."
                          maxLength={32}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Note interne privée */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Note Privée Administrateur <span className="text-slate-500 font-normal">(Invisible pour les visiteurs)</span>
                      </label>
                      <textarea
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Commentaire ou motif de surveillance..."
                        rows={2}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
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
                        Pseudonyme <span className="text-cyan-400">*</span> <span className="text-slate-500 font-normal">(2 à 24 caractères)</span>
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
                        Steam ID 64 <span className="text-slate-500 font-normal">(Optionnel, 17 chiffres)</span>
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
                      <div className="grid grid-cols-3 gap-2">
                        {(['user', 'vip', 'admin'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setCreateRole(r)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              createRole === r
                                ? r === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                : r === 'vip'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {r === 'admin' && <Crown className="w-3.5 h-3.5" />}
                            {r === 'vip' && <Star className="w-3.5 h-3.5" />}
                            <span>{r === 'admin' ? 'Admin' : r === 'vip' ? 'VIP' : 'Joueur'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Titre Personnalisé */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Titre Personnalisé <span className="text-slate-500 font-normal">(Optionnel)</span>
                      </label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
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
                        Note Privée Administrateur <span className="text-slate-500 font-normal">(Optionnel)</span>
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
                        Termes actuellement bloqués ({data?.usernames?.forbiddenNames?.length || 2})
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-3 rounded-xl bg-black/30 border border-white/5">
                        {(data?.usernames?.forbiddenNames || ['hibouxe', 'edsaje']).map((word) => {
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
                                  className="ml-1 text-purple-400 hover:text-red-400 cursor-pointer"
                                  title="Supprimer de la blacklist"
                                >
                                  ✕
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

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-300">
                    ⚠️ Cette opération est irréversible et recommandée en cas de triche ou de score anormal.
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
