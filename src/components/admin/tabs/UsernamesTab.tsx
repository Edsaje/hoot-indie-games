import React from 'react';
import { Users, Globe, Star, Ban, Shield, Search, X, UserPlus, Crown, Sparkles, ExternalLink, Check, FileText, Edit3, Eraser, Trash2, Lock } from 'lucide-react';
import { ADMIN_STEAM_ID } from '../../../services/adminService';
import { soundFx } from '../../../utils/audio';

export interface UsernamesTabProps {
  data: any;
  usernameFilter: any;
  setUsernameFilter: any;
  userStatusFilter: any;
  setUserStatusFilter: any;
  setIsCreateUserOpen: any;
  setIsBlacklistOpen: any;
  filteredUsernames: any;
  handleOpenEditUser: any;
  handleToggleBan: any;
  setPurgingUser: any;
  confirmDeleteUsername: any;
  handleDeleteUsername: any;
  setConfirmDeleteUsername: any;
}

export const UsernamesTab: React.FC<UsernamesTabProps> = ({
  data,
  usernameFilter,
  setUsernameFilter,
  userStatusFilter,
  setUserStatusFilter,
  setIsCreateUserOpen,
  setIsBlacklistOpen,
  filteredUsernames,
  handleOpenEditUser,
  handleToggleBan,
  setPurgingUser,
  confirmDeleteUsername,
  handleDeleteUsername,
  setConfirmDeleteUsername
}) => {
  return (
    <>

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
                          {data.usernames?.list?.filter((u: any) => !!u.steamId).length || 0}
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
                          {data.usernames?.list?.filter((u: any) => u.role === 'admin' || u.role === 'moderator' || u.role === 'vip' || u.normalized === 'hibouxe').length || 0}
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
                          {data.usernames?.bannedCount ?? (data.usernames?.list?.filter((u: any) => u.status === 'banned').length || 0)}
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
                          { id: 'all', label: 'Tous', count: data.usernames?.list?.length || 0 },
                          { id: 'steam', label: 'Steam', count: data.usernames?.list?.filter((u: any) => !!u.steamId).length || 0 },
                          { id: 'staff', label: 'Staff / VIP', count: data.usernames?.list?.filter((u: any) => u.role === 'admin' || u.role === 'moderator' || u.role === 'vip' || u.normalized === 'hibouxe').length || 0 },
                          { id: 'banned', label: 'Bannis', count: data.usernames?.list?.filter((u: any) => u.status === 'banned').length || 0 },
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
                              filteredUsernames.map((u: any) => {
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
                                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
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
                  </div>
                
    </>
  );
};
