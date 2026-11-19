import React, { useState, useMemo } from 'react';
import {
  Eye,
  Users,
  Gamepad2,
  Trophy,
  ArrowUpRight,
  Activity,
  Flame,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Search,
} from 'lucide-react';
import type { AdminOverviewPayload, AdminEventLog } from '../../../services/adminService';

interface AdminOverviewTabProps {
  analytics?: AdminOverviewPayload['analytics'];
  recentEvents?: AdminEventLog[];
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ analytics, recentEvents = [] }) => {
  const [eventFilter, setEventFilter] = useState<string>('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'all' | 'game' | 'win' | 'page' | 'streak'>('all');

  const summary = analytics?.summary;
  const referrers = analytics?.referrers || {};
  const devices = analytics?.devices || { desktop: 0, mobile: 0, tablet: 0 };
  const totalDevices = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0);

  const desktopPct = totalDevices > 0 ? Math.round((devices.desktop / totalDevices) * 100) : 0;
  const mobilePct = totalDevices > 0 ? Math.round((devices.mobile / totalDevices) * 100) : 0;
  const tabletPct = totalDevices > 0 ? Math.round((devices.tablet / totalDevices) * 100) : 0;

  const winRatePct =
    summary && summary.games_played > 0
      ? Math.round((summary.games_won / summary.games_played) * 100)
      : 0;

  const filteredRecentEvents = useMemo(() => {
    return recentEvents.filter((item) => {
      const ev = (item.event || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const lbl = (item.label || '').toLowerCase();

      if (eventCategoryFilter === 'game') {
        if (!ev.includes('play') && !cat.includes('game')) return false;
      } else if (eventCategoryFilter === 'win') {
        if (!ev.includes('win') && !ev.includes('complete') && !cat.includes('win')) return false;
      } else if (eventCategoryFilter === 'page') {
        if (!ev.includes('page') && !cat.includes('page')) return false;
      } else if (eventCategoryFilter === 'streak') {
        if (!ev.includes('streak') && !cat.includes('streak')) return false;
      }

      const q = eventFilter.trim().toLowerCase();
      if (!q) return true;
      return ev.includes(q) || cat.includes(q) || lbl.includes(q);
    });
  }, [recentEvents, eventFilter, eventCategoryFilter]);

  return (
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

      {/* Grille des 5 Indicateurs de Rétention & Fidélité (Cookieless) */}
      <div className="p-4 rounded-2xl bg-[#0a1120] border border-cyan-500/20 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Rétention, Fidélité & Séries (Cookieless)</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-300/80 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            Hachage compact 16 car. • J vs J-1
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Visiteurs Récurrents</div>
            <div className="text-xl font-black text-cyan-300 font-mono">
              {(analytics?.retention?.returning_visitors ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Revenus à J-1</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Taux de Rétention</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {analytics?.retention?.returning_rate ?? 0}%
            </div>
            <div className="text-[10px] text-slate-400">Fidélité globale</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Parties / Visiteur</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {analytics?.retention?.avg_games_per_visitor ?? 0}
            </div>
            <div className="text-[10px] text-slate-400">Intensité de jeu</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
              <span>Sauvetages Flamme</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-xl font-black text-orange-400 font-mono">
              {(analytics?.retention?.streak_rescues ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-orange-300/80">Rattrapages J-1</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Victoires Globales</div>
            <div className="text-xl font-black text-white font-mono">
              {analytics?.retention?.global_win_rate ?? winRatePct}%
            </div>
            <div className="text-[10px] text-slate-400">Moyenne 12 jeux</div>
          </div>
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
            <div className="text-xs text-slate-400 py-4 text-center">Aucun référent enregistré pour le moment.</div>
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

      {/* Journal d'Événements en Direct (Live Feed) */}
      <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Journal d'Événements Récents (Live Feed)</span>
          </h3>
          <span className="text-[10px] text-slate-400">
            {filteredRecentEvents.length} affichés sur {recentEvents.length}
          </span>
        </div>

        {/* Barre de Filtres Live Feed */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer un événement (screenle, win, steam_click...)..."
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full bg-[#070b14] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'all' as const, label: 'Tous' },
              { id: 'game' as const, label: 'Parties' },
              { id: 'win' as const, label: 'Victoires' },
              { id: 'page' as const, label: 'Pages' },
              { id: 'streak' as const, label: 'Flammes' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEventCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  eventCategoryFilter === f.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRecentEvents.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            Aucun événement ne correspond aux critères de recherche.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredRecentEvents.slice(0, 40).map((item, idx) => {
              const isWin = item.event.includes('win') || item.event.includes('complete');
              const isGame = item.event.includes('_play') || item.category === 'game';
              const isPage = item.event.includes('page');
              const isStreak = item.event.includes('streak');
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center gap-1 ${
                        isWin
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isStreak
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : isGame
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isPage
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {isWin && <Trophy className="w-2.5 h-2.5" />}
                      {isStreak && <Flame className="w-2.5 h-2.5" />}
                      <span>{item.event}</span>
                    </span>
                    {item.label && (
                      <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                        {item.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0 font-mono">
                    {item.device && <span className="uppercase">{item.device}</span>}
                    <span>{new Date(item.timestamp || (item as any).time || 0).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
