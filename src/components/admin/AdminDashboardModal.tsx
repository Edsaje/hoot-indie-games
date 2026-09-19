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
} from 'lucide-react';
import {
  fetchAdminOverview,
  deleteRegisteredUsername,
  deleteCommunitySuggestion,
  resetServerStats,
  ADMIN_STEAM_ID,
  type AdminOverviewPayload,
} from '../../services/adminService';
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

  // Filtre de recherche pour les pseudonymes
  const [usernameFilter, setUsernameFilter] = useState<string>('');

  // Confirmation de suppression
  const [confirmDeleteUsername, setConfirmDeleteUsername] = useState<string | null>(null);
  const [confirmDeleteSuggestion, setConfirmDeleteSuggestion] = useState<string | null>(null);
  const [confirmResetStats, setConfirmResetStats] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminOverview(currentSteamId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Impossible de joindre le serveur de télémétrie.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSteamId]);

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

  // Liste filtrée des pseudonymes
  const filteredUsernames = useMemo(() => {
    if (!data?.usernames?.list) return [];
    if (!usernameFilter.trim()) return data.usernames.list;
    const q = usernameFilter.toLowerCase();
    return data.usernames.list.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.normalized.toLowerCase().includes(q) ||
        (u.steamId && u.steamId.includes(q))
    );
  }, [data?.usernames?.list, usernameFilter]);

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
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Impossible de charger le tableau de bord</h3>
                <p className="text-xs text-slate-400">{error}</p>
                <button
                  onClick={loadData}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  Réessayer
                </button>
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
                {/* ONGLET 3 : GESTION DES PSEUDONYMES                            */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'usernames' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={usernameFilter}
                          onChange={(e) => setUsernameFilter(e.target.value)}
                          placeholder="Rechercher un pseudonyme ou un Steam ID..."
                          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      <span className="text-xs font-bold text-slate-400">
                        {filteredUsernames.length} / {data.usernames?.total || 0} pseudos enregistrés
                      </span>
                    </div>

                    <div className="rounded-2xl bg-[#0c1220] border border-white/5 overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                            <th className="p-3">Pseudonyme</th>
                            <th className="p-3 hidden sm:table-cell">Steam ID / Compte</th>
                            <th className="p-3 hidden md:table-cell">Date de Réservation</th>
                            <th className="p-3 text-right">Statut & Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsernames.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-500">
                                Aucun pseudonyme ne correspond à votre recherche.
                              </td>
                            </tr>
                          ) : (
                            filteredUsernames.map((u) => {
                              const isReserved = u.isAdminReserved || u.normalized === 'hibouxe' || u.normalized === 'edsaje';
                              const isCurrentAdmin = u.steamId === ADMIN_STEAM_ID;
                              return (
                                <tr key={u.normalized} className="hover:bg-white/[0.02] transition">
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">{u.displayName}</span>
                                      {isReserved && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                          <Crown className="w-2.5 h-2.5" /> Créateur
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono sm:hidden">
                                      {u.steamId ? `Steam: ${u.steamId}` : u.userId || 'Local'}
                                    </div>
                                  </td>
                                  <td className="p-3 hidden sm:table-cell font-mono text-slate-400 text-[11px]">
                                    {u.steamId ? (
                                      <span className="text-cyan-300 flex items-center gap-1">
                                        Steam: {u.steamId} {isCurrentAdmin && '👑'}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500">{u.userId || 'Local'}</span>
                                    )}
                                  </td>
                                  <td className="p-3 hidden md:table-cell text-slate-400 text-[11px]">
                                    {u.claimedAt ? new Date(u.claimedAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="p-3 text-right">
                                    {isReserved ? (
                                      <span className="text-[11px] font-bold text-amber-400/80">
                                        Inaliénable 🔒
                                      </span>
                                    ) : confirmDeleteUsername === u.normalized ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleDeleteUsername(u.normalized)}
                                          className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold transition cursor-pointer"
                                        >
                                          Confirmer
                                        </button>
                                        <button
                                          onClick={() => setConfirmDeleteUsername(null)}
                                          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] transition cursor-pointer"
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmDeleteUsername(u.normalized)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                        title="Libérer / Supprimer ce pseudonyme"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
