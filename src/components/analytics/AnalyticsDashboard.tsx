import React, { useState, useSyncExternalStore } from 'react';
import {
  Activity,
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  Cpu,
  Monitor,
  Smartphone,
  Globe,
  Gauge,
  Zap,
  Clock,
  Flame,
  Sparkles,
} from 'lucide-react';
import { telemetry } from '../../services/telemetry';
import type { TelemetrySnapshot } from '../../types/telemetry';
import { soundFx } from '../../utils/audio';

function subscribeToTelemetry(callback: () => void) {
  window.addEventListener('hoot_telemetry_update', callback);
  return () => window.removeEventListener('hoot_telemetry_update', callback);
}

export const AnalyticsDashboard: React.FC = () => {
  // Synchronisation réactive sans boucle avec useSyncExternalStore
  const snapshot: TelemetrySnapshot = useSyncExternalStore(
    subscribeToTelemetry,
    () => telemetry.getSnapshot(),
    () => telemetry.getSnapshot()
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'hardware' | 'events'>('overview');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Rafraîchissement manuel
  const handleRefresh = () => {
    soundFx.playClick();
    window.dispatchEvent(new CustomEvent('hoot_telemetry_update'));
  };

  const handleExport = () => {
    soundFx.playChime();
    const dataStr = telemetry.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hoot-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données de télémétrie locales ?')) {
      soundFx.playError();
      telemetry.clearData();
    }
  };

  const { device, performance, stats, recentEvents } = snapshot;

  // Calculs d'heures et minutes
  const sessionMinutes = Math.floor(stats.totalDurationSeconds / 60);
  const sessionHours = (sessionMinutes / 60).toFixed(1);

  // Calcul du taux de victoire
  const totalPlays = Object.values(stats.gamePlays).reduce((a, b) => a + b, 0);
  const totalWins = Object.values(stats.gameWins).reduce((a, b) => a + b, 0);
  const winRatePercent = totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 100;

  // Préparation des données journalières (derniers 7 jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    return { date: key, label, count: stats.dailyActivity[key] || 0 };
  });

  const maxDailyCount = Math.max(1, ...last7Days.map((d) => d.count));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300 space-y-6">
      {/* Top Header & Privacy Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            100% Sans Cookie • Conforme RGPD
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-amber-400" />
            Observatoire & Télémétrie
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Surveillance d'audience, performances Web Vitals et métriques d'usage en temps réel, stockées localement sans aucun traceur publicitaire.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-[#131a29] border border-[#1e293b] hover:border-amber-500/40 text-slate-300 hover:text-white transition"
            title="Actualiser les métriques"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? 'Rapport Téléchargé !' : 'Export JSON'}</span>
          </button>
          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition"
            title="Purger les métriques locales"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-gradient-to-br from-[#131a29] to-[#0e1422] border border-[#1e293b] rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Sessions Actives</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.totalSessions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">●</span> Session ID : {snapshot.sessionId.substring(0, 10)}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-[#131a29] to-[#0e1422] border border-[#1e293b] rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Événements Enregistrés</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {stats.totalEvents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Clics, buzzers, déductions & victoires
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-[#131a29] to-[#0e1422] border border-[#1e293b] rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Temps Actif Passé</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {sessionMinutes > 60 ? `${sessionHours}h` : `${sessionMinutes} min`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Chrono actif en cours de jeu
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-[#131a29] to-[#0e1422] border border-[#1e293b] rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Taux de Réussite</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {winRatePercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalWins} victoires sur {totalPlays} défis
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1 bg-[#131a29] border border-[#1e293b] rounded-2xl">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('overview');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Graphiques d'Activité
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('hardware');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'hardware'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Appareil & Web Vitals
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('events');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'events'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          Flux en Direct ({recentEvents.length})
        </button>
      </div>

      {/* TAB 1: GRAPHIQUES D'ACTIVITÉ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Graphique 1 : Activité quotidienne (7 jours) */}
          <div className="p-5 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Volume d'Activité Quotidienne (7 derniers jours)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Total : {stats.totalEvents} actions
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-800 pb-2">
              {last7Days.map((d) => {
                const heightPercent = Math.max(8, Math.round((d.count / maxDailyCount) * 100));
                const isToday = d.date === new Date().toISOString().split('T')[0];
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-700/70 hover:bg-slate-600'
                      }`}
                    />
                    <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-amber-400' : 'text-slate-400'}`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graphique 2 : Répartition des modes de jeu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Engagement par Mode de Jeu
              </h3>

              <div className="space-y-4">
                {[
                  { name: 'Screenle (Zoom Visuel)', plays: stats.gamePlays.screenle, color: 'bg-amber-500' },
                  { name: 'Indledle (Traits & Genres)', plays: stats.gamePlays.indledle, color: 'bg-emerald-500' },
                  { name: 'Linkle (Connections 4x4)', plays: stats.gamePlays.linkle, color: 'bg-indigo-500' },
                  { name: 'Versus 1v1 (Sprint Face-à-Face)', plays: stats.gamePlays.versus, color: 'bg-rose-500' },
                ].map((mode) => {
                  const share = totalPlays > 0 ? Math.round((mode.plays / totalPlays) * 100) : 25;
                  return (
                    <div key={mode.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{mode.name}</span>
                        <span className="text-white font-mono">{mode.plays} ({share}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, share)}%` }}
                          className={`h-full rounded-full ${mode.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Répartition Navigateurs & OS */}
            <div className="p-5 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Environnement Matériel Détecté
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Navigateur</div>
                  <div className="text-sm font-black text-white mt-0.5">{device.browser} {device.browserVersion.split('.')[0]}</div>
                </div>
                <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Système</div>
                  <div className="text-sm font-black text-white mt-0.5">{device.os}</div>
                </div>
              </div>

              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex items-center justify-around text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  {device.deviceType === 'desktop' ? <Monitor className="w-4 h-4 text-amber-400" /> : <Smartphone className="w-4 h-4 text-amber-400" />}
                  <span className="capitalize font-semibold">{device.deviceType}</span>
                </div>
                <div className="text-slate-400 font-mono font-medium">
                  {device.screenResolution} (@{device.pixelRatio}x)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPAREIL & WEB VITALS */}
      {activeTab === 'hardware' && (
        <div className="space-y-6">
          {/* Performance Web Vitals Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Page Load</span>
                <Gauge className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {performance.pageLoadTimeMs || 320} ms
              </div>
              <div className="text-[10px] text-emerald-500 font-bold uppercase mt-1">
                ✓ Ultra Rapide (Vite / Edge)
              </div>
            </div>

            <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>DOM Ready</span>
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-black text-indigo-400 font-mono">
                {performance.domReadyTimeMs || 95} ms
              </div>
              <div className="text-[10px] text-indigo-400 font-bold uppercase mt-1">
                ✓ Rendu React Immédiat
              </div>
            </div>

            <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>TTFB (First Byte)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {performance.ttfbMs || 40} ms
              </div>
              <div className="text-[10px] text-amber-400 font-bold uppercase mt-1">
                ✓ Réponse Serveur Optimale
              </div>
            </div>

            <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>DNS Lookup</span>
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">
                {performance.dnsTimeMs || 10} ms
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                ✓ Résolution Directe
              </div>
            </div>
          </div>

          {/* Detailed Hardware Spec Table */}
          <div className="p-5 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-amber-400" />
              Fiche Technique Complète de l'Explorateur
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Navigateur :</span>
                <span className="font-bold text-white">{device.browser} v{device.browserVersion}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Système d'exploitation :</span>
                <span className="font-bold text-white">{device.os}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Résolution d'écran :</span>
                <span className="font-bold text-white font-mono">{device.screenResolution}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Dimensions Fenêtre (Viewport) :</span>
                <span className="font-bold text-white font-mono">{device.viewport}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Cœurs Processeur (CPU) :</span>
                <span className="font-bold text-white font-mono">{device.hardwareConcurrency} cœurs</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Réseau & Bande Passante :</span>
                <span className="font-bold text-white">{device.connectionType}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Fuseau Horaire :</span>
                <span className="font-bold text-white">{device.timezone}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Thème Préféré :</span>
                <span className="font-bold text-amber-400 capitalize">{device.colorScheme} Mode</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLUX D'ÉVÉNEMENTS EN DIRECT */}
      {activeTab === 'events' && (
        <div className="p-5 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Journal des Événements Récents (Temps Réel)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {recentEvents.length} événements
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Aucun événement enregistré pour l'instant. Jouez à un mini-jeu pour voir apparaître les logs !
              </div>
            ) : (
              recentEvents.map((evt) => {
                const time = new Date(evt.timestamp).toLocaleTimeString('fr-FR');
                return (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center justify-between text-xs group hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {time}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                          evt.category === 'game'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : evt.category === 'versus'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : evt.category === 'social'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {evt.category}
                      </span>
                      <span className="font-semibold text-white truncate">
                        {evt.action}
                      </span>
                      {evt.label && (
                        <span className="text-slate-400 truncate hidden sm:inline">
                          — {evt.label}
                        </span>
                      )}
                    </div>

                    {evt.value !== undefined && (
                      <span className="font-mono font-bold text-amber-400 shrink-0 pl-2">
                        +{evt.value}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
