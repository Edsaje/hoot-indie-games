import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  X,
  RotateCw,
  ExternalLink,
  Users,
  Gamepad2,
  Lightbulb,
  Server,
  Activity,
  Shield,
  Sparkles,
  FileSpreadsheet,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Download,
  Lock,
} from 'lucide-react';
import {
  ADMIN_STEAM_ID,
  getAdminExportCsvUrl,
  getAdminExportJsonUrl,
  deleteCommunitySuggestion,
} from '../../services/adminService';
import { useUserAccount } from '../../context/useUserAccount';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { AdminGamesManager } from './AdminGamesManager';
import { useAdminDashboard, type AdminTab } from '../../hooks/useAdminDashboard';
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminGamesTab } from './tabs/AdminGamesTab';
import { AdminUsernamesTab } from './tabs/AdminUsernamesTab';
import { AdminSuggestionsTab } from './tabs/AdminSuggestionsTab';
import { AdminMicroIndiesTab } from './tabs/AdminMicroIndiesTab';
import { AdminSystemTab } from './tabs/AdminSystemTab';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AdminTab;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose, initialTab }) => {
  const { profile, isAuthenticated, isAdmin } = useUserAccount();
  const currentSteamId = profile?.steam?.steamId || ADMIN_STEAM_ID;

  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    data,
    setData,
    isLoading,
    error,
    actionNotice,
    showNotice,
    loadData,
    steamMasterStatus,
    setSteamMasterStatus,
    validatingSuggestionId,
    prefilledGameForCatalog,
    setPrefilledGameForCatalog,
    handleQuickApproveSuggestion,
    handleEditAndApproveSuggestion,
    handleDeleteSuggestion,
  } = useAdminDashboard({ isOpen, currentSteamId, initialTab });

  if (!isOpen || !isAuthenticated || !isAdmin) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-5 overflow-y-auto">
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
          className="relative overflow-visible w-full h-full sm:h-auto max-w-5xl bg-[#052118] sm:border-2 border-0 border-[#78350f] rounded-none sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[100dvh] sm:max-h-[92vh]"
        >
          <SylvestreIvyFrame density="medium" />
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
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>Accès Souverain Certifié</span>
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
                  void loadData();
                }}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Actualiser les métriques"
                aria-label="Actualiser"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              {/* Menu Déroulant Exports Souverains */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsExportDropdownOpen(!isExportDropdownOpen);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
                  title="Télécharger les exports CSV / JSON"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exports</span>
                  <ChevronDown className="w-3 h-3 text-amber-400" />
                </button>

                {isExportDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0c1220] border border-amber-500/30 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Exports CSV (BOM UTF-8)
                    </div>
                    <a
                      href={getAdminExportCsvUrl('daily', currentSteamId)}
                      download
                      onClick={() => setIsExportDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rapport Journalier (.CSV)</span>
                    </a>
                    <a
                      href={getAdminExportCsvUrl('games', currentSteamId)}
                      download
                      onClick={() => setIsExportDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Statistiques 12 Jeux (.CSV)</span>
                    </a>
                    <a
                      href={getAdminExportCsvUrl('recent', currentSteamId)}
                      download
                      onClick={() => setIsExportDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Journal des Logs (.CSV)</span>
                    </a>

                    <div className="h-px bg-white/10 my-1" />
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sauvegarde JSON
                    </div>
                    <a
                      href={getAdminExportJsonUrl(currentSteamId)}
                      download
                      onClick={() => setIsExportDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Sauvegarde Complète (.JSON)</span>
                    </a>
                  </div>
                )}
              </div>

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
          <div className="flex flex-wrap border-b border-white/5 px-4 sm:px-6 bg-[#090d16] shrink-0 gap-2 pt-3">
            {[
              { id: 'overview' as AdminTab, label: "Vue d'Ensemble & Trafic", icon: Activity },
              { id: 'catalog' as AdminTab, label: 'Catalogue & CRUD Jeux', icon: Sparkles },
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
              {
                id: 'microIndies' as AdminTab,
                label: 'Micro-Indés',
                icon: Gamepad2,
                badge: data?.microIndies?.pending ? String(data.microIndies.pending) : undefined,
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
                    href="/api/track.php?redirect=admin"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Activer ma Session Steam</span>
                  </a>
                  <button
                    onClick={() => void loadData()}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {data && (
              <>
                {/* 1. VUE D'ENSEMBLE */}
                {activeTab === 'overview' && (
                  <AdminOverviewTab
                    analytics={data.analytics}
                    recentEvents={data.analytics?.recent}
                  />
                )}

                {/* 2. CATALOGUE CRUD EN DIRECT */}
                {activeTab === 'catalog' && (
                  <AdminGamesManager
                    currentSteamId={currentSteamId}
                    initialPrefillGame={prefilledGameForCatalog?.game}
                    onPrefillConsumed={() => {}}
                    onGameSaved={async () => {
                      if (prefilledGameForCatalog?.suggestionId) {
                        const sugId = prefilledGameForCatalog.suggestionId;
                        await deleteCommunitySuggestion(sugId, currentSteamId);
                        setData((prev) => {
                          if (!prev || !prev.suggestions) return prev;
                          const nextList = prev.suggestions.list.filter((s) => s.id !== sugId);
                          return {
                            ...prev,
                            suggestions: {
                              ...prev.suggestions,
                              total: nextList.length,
                              list: nextList,
                            },
                          };
                        });
                        setPrefilledGameForCatalog(null);
                        await loadData();
                      }
                    }}
                    onNotice={(type, msg) => showNotice(type, msg)}
                  />
                )}

                {/* 3. ACTIVITÉ DES JEUX */}
                {activeTab === 'games' && (
                  <AdminGamesTab
                    games={data.analytics?.games}
                    summary={data.analytics?.summary}
                    currentSteamId={currentSteamId}
                  />
                )}

                {/* 4. GESTION DES PSEUDONYMES & MODALES JOUEURS */}
                {activeTab === 'usernames' && (
                  <AdminUsernamesTab
                    usernames={data.usernames}
                    currentSteamId={currentSteamId}
                    onRefresh={loadData}
                    onNotice={showNotice}
                  />
                )}

                {/* 5. BOÎTE À PÉPITES (SUGGESTIONS) */}
                {activeTab === 'suggestions' && (
                  <AdminSuggestionsTab
                    suggestions={data.suggestions}
                    validatingSuggestionId={validatingSuggestionId}
                    onQuickApprove={handleQuickApproveSuggestion}
                    onEditAndApprove={handleEditAndApproveSuggestion}
                    onDelete={handleDeleteSuggestion}
                  />
                )}

                {/* 6. MICRO-INDÉS DE LA COMMUNAUTÉ */}
                {activeTab === 'microIndies' && (
                  <AdminMicroIndiesTab
                    microIndies={data.microIndies}
                    currentSteamId={currentSteamId}
                    onRefresh={loadData}
                    onNotice={showNotice}
                  />
                )}

                {/* 7. SYSTÈME & FICHIERS */}
                {activeTab === 'system' && (
                  <AdminSystemTab
                    data={data}
                    currentSteamId={currentSteamId}
                    steamMasterStatus={steamMasterStatus}
                    onRefresh={loadData}
                    onNotice={showNotice}
                    onUpdateSteamMasterStatus={setSteamMasterStatus}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
