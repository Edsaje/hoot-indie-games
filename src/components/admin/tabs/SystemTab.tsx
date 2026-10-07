import React from 'react';
import { Server, CheckCircle2, Key, AlertTriangle, RotateCw, FileSpreadsheet, Download } from 'lucide-react';
import { getAdminExportCsvUrl } from '../../../services/adminService';

export interface SystemTabProps {
  data: any;
  steamMasterStatus: any;
  adminMasterKeyInput: any;
  setAdminMasterKeyInput: any;
  handleSaveMasterKeyFromAdmin: any;
  isSavingKey: any;
  currentSteamId: any;
  handleExportBackup: any;
  confirmResetStats: any;
  handleResetStats: any;
  setConfirmResetStats: any;
}

export const SystemTab: React.FC<SystemTabProps> = ({
  data,
  steamMasterStatus,
  adminMasterKeyInput,
  setAdminMasterKeyInput,
  handleSaveMasterKeyFromAdmin,
  isSavingKey,
  currentSteamId,
  handleExportBackup,
  confirmResetStats,
  handleResetStats,
  setConfirmResetStats
}) => {
  return (
    <>

                  <div className="space-y-6">
                    {/* Santé des fichiers JSON du serveur */}
                    <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" />
                        <span>État des Bases de Données Souveraines (JSON)</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                          <div className="text-[11px] text-slate-400 font-mono">micro_indies.json</div>
                          <div className="text-base font-bold text-white">
                            {Math.round((data.system?.microIndiesFileSize || 0) / 1024)} Ko
                          </div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Modération souveraine
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

                    {/* Sauvegarde & Exports Souverains */}
                    <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                          <span>Exports Souverains & Sauvegardes Autonomes</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Téléchargez les données brutes certifiées au format CSV (compatible Excel, BOM UTF-8) ou JSON complet.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                        <a
                          href={getAdminExportCsvUrl('daily', currentSteamId)}
                          download
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition flex flex-col justify-between group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300">Rapport Journalier</span>
                            <Download className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">Pages vues, parties & conversion (.CSV)</span>
                        </a>

                        <a
                          href={getAdminExportCsvUrl('games', currentSteamId)}
                          download
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 transition flex flex-col justify-between group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-amber-300">Statistiques 12 Jeux</span>
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">Parties, victoires & ratios (.CSV)</span>
                        </a>

                        <a
                          href={getAdminExportCsvUrl('recent', currentSteamId)}
                          download
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition flex flex-col justify-between group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300">Journal d'Événements</span>
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">Logs légers & terminaux (.CSV)</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleExportBackup}
                          className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/30 hover:bg-amber-500/25 transition flex flex-col justify-between group text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-300">Sauvegarde Complète</span>
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">Archive intégrale JSON (.JSON)</span>
                        </button>
                      </div>
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
                
    </>
  );
};
