import React from 'react';
import { Download, Camera, Search, Sparkles, Users, Clock, Eye, MessageSquareText, Music, Zap, HelpCircle, Swords, Gamepad2, Trophy } from 'lucide-react';
import { getAdminExportCsvUrl } from '../../../services/adminService';

export interface GamesTabProps {
  summary: any;
  currentSteamId: any;
  games: any;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  summary,
  currentSteamId,
  games
}) => {
  return (
    <>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Sessions & Performances par Mode de Jeu (12 Disciplines)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Télémétrie des 8 énigmes quotidiennes + modes compétitifs et arcade
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-bold font-mono">
                          {summary?.games_played ?? 0} parties • {summary?.games_won ?? 0} victoires
                        </span>
                        <a
                          href={getAdminExportCsvUrl('games', currentSteamId)}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV Jeux</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { id: 'screenle', label: 'Screenle Quotidien', category: 'Quotidien', icon: Camera, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', ...games?.screenle },
                        { id: 'indledle', label: 'Indledle Découverte', category: 'Quotidien', icon: Search, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', ...games?.indledle },
                        { id: 'linkle', label: 'Linkle 4 Familles', category: 'Quotidien', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', ...games?.linkle },
                        { id: 'profille', label: 'Profille Silhouette', category: 'Quotidien', icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', ...games?.profille },
                        { id: 'chrono', label: 'Chrono Chronologie', category: 'Quotidien', icon: Clock, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', ...games?.chrono },
                        { id: 'pixel', label: 'Pixel Mystère', category: 'Quotidien', icon: Eye, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', ...games?.pixel },
                        { id: 'review', label: 'Review de Presse', category: 'Quotidien', icon: MessageSquareText, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', ...games?.review },
                        { id: 'blindtest', label: 'Blind Test Audio', category: 'Quotidien', icon: Music, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', ...games?.blindtest },
                        { id: 'timeattack', label: 'Time Attack Solo', category: 'Arcade Solo', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', ...games?.timeattack },
                        { id: 'quiz', label: 'Quiz Culture Indé', category: 'Culture Indé', icon: HelpCircle, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', ...games?.quiz },
                        { id: 'versus', label: 'Versus Arena 1v1', category: 'Multijoueur', icon: Swords, color: 'text-red-400 bg-red-500/10 border-red-500/20', ...games?.versus },
                        { id: 'arcade', label: "Salle d'Arcade (8 Bornes)", category: 'Rétro Gaming', icon: Gamepad2, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', ...games?.arcade },
                      ].map((g) => {
                        const Icon = g.icon;
                        const plays = g.plays || 0;
                        const wins = g.wins || 0;
                        const winRate = plays > 0 ? Math.round((wins / plays) * 100) : 0;
                        return (
                          <div
                            key={g.id}
                            className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3 hover:border-amber-500/30 transition flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${g.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-sm">
                                    {g.label}
                                  </h4>
                                  <span className="text-[10px] text-slate-400">{g.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-1">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <div className="text-xl font-black text-amber-400 font-mono">{plays}</div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">parties lancées</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-base font-bold text-emerald-400 font-mono flex items-center justify-end gap-1">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>{wins}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                                    victoires ({winRate}%)
                                  </div>
                                </div>
                              </div>

                              {/* Jauge visuelle de réussite */}
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, winRate)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                
    </>
  );
};
