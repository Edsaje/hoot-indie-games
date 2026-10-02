import React, { useState, useEffect } from 'react';
import {
  Sword,
  Map,
  Backpack,
  Sparkles,
  Network,
  BarChart3,
} from 'lucide-react';
import type { OdysseySaveState, OfflineGainsSummary } from '../../types/odyssey';
import {
  loadOdysseyState,
  saveOdysseyState,
  computePlayerStats,
  calculateOfflineGains,
  getCurrentRoute,
} from '../../services/odysseyEngineService';
import { OdysseyArena } from './OdysseyArena';
import { CelestialTreeView } from './CelestialTreeView';
import { CompanionsDexView } from './CompanionsDexView';
import { BiomesMapView } from './BiomesMapView';
import { OdysseyStatsView } from './OdysseyStatsView';
import { OdysseyOfflineModal } from './OdysseyOfflineModal';
import { soundFx } from '../../utils/audio';

type HubView = 'arena' | 'tree' | 'companions' | 'map' | 'stats';

export const OdysseyHub: React.FC = () => {
  const [odysseyState, setOdysseyState] = useState<OdysseySaveState>(() => loadOdysseyState());
  const [activeView, setActiveView] = useState<HubView>('arena');
  const [offlineSummary, setOfflineSummary] = useState<OfflineGainsSummary | null>(null);

  const playerStats = computePlayerStats(odysseyState);

  // Vérification des gains hors-ligne au montage
  useEffect(() => {
    const currentRoute = getCurrentRoute(odysseyState.currentBiomeId, odysseyState.currentRouteNumber);
    const gains = calculateOfflineGains(odysseyState.lastSavedAt, playerStats, currentRoute);
    if (gains && gains.starSapEarned > 0) {
      setOfflineSummary(gains);
    }
  }, []);

  // Récolte des gains hors-ligne
  const handleClaimOfflineGains = () => {
    if (!offlineSummary) return;

    setOdysseyState((prev) => {
      const activeRoute = getCurrentRoute(prev.currentBiomeId, prev.currentRouteNumber);
      const prevRouteKills = (prev.routeKills && prev.routeKills[activeRoute.id]) || 0;
      const updatedRouteKills = {
        ...(prev.routeKills || {}),
        [activeRoute.id]: prevRouteKills + offlineSummary.monstersDefeatedEstimate,
      };

      const updated: OdysseySaveState = {
        ...prev,
        starSap: prev.starSap + offlineSummary.starSapEarned,
        totalStarSapEarned: prev.totalStarSapEarned + offlineSummary.starSapEarned,
        routeKills: updatedRouteKills,
        stats: {
          ...prev.stats,
          monstersDefeated: prev.stats.monstersDefeated + offlineSummary.monstersDefeatedEstimate,
        },
        lastSavedAt: Date.now(),
      };
      saveOdysseyState(updated);
      return updated;
    });

    setOfflineSummary(null);
  };

  // Écoute des synchronisations externes (Cloud Sync ou autre onglet)
  useEffect(() => {
    const handleSaveRestored = () => {
      setOdysseyState(loadOdysseyState());
    };
    window.addEventListener('hoot_odyssey_updated', handleSaveRestored);
    return () => window.removeEventListener('hoot_odyssey_updated', handleSaveRestored);
  }, []);

  // Sauvegarde automatique périodique (toutes les 10 secondes)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveOdysseyState(odysseyState);
    }, 10000);

    const handleBeforeUnload = () => {
      saveOdysseyState(odysseyState);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [odysseyState]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 animate-in fade-in duration-300">
      {/* Modale des Gains Hors-Ligne */}
      {offlineSummary && (
        <OdysseyOfflineModal summary={offlineSummary} onClaim={handleClaimOfflineGains} />
      )}

      {/* Header Titre & Badge Bêta */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-black tracking-wider uppercase text-[10px]">Fonctionnalité en Bêta</span>
          <span className="text-slate-500 text-[11px]">•</span>
          <span className="text-slate-300 text-[11px] hidden sm:inline">Équilibrage actif — Vos avis et suggestions sont bienvenus sur Le Perchoir !</span>
          <span className="text-slate-300 text-[11px] sm:hidden">Équilibrage actif</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2.5">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span>L’Odyssée Sylvestre</span>
        </h1>
      </div>

      {/* Navigation Interne de l'Odyssée (Pills en tête de page) */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-center p-1.5 rounded-2xl bg-[#06241b] border border-[#78350f] mb-6 shadow-xl">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveView('arena');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeView === 'arena'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sword className="w-3.5 h-3.5" />
          <span>Combat</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveView('tree');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeView === 'tree'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Arbre</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveView('companions');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeView === 'companions'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Backpack className="w-3.5 h-3.5" />
          <span>Compagnons</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveView('map');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeView === 'map'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Biomes</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveView('stats');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeView === 'stats'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Stats</span>
        </button>
      </div>

      {/* Rendu de la vue active */}
      {activeView === 'arena' && (
        <OdysseyArena
          state={odysseyState}
          playerStats={playerStats}
          onStateChange={setOdysseyState}
          onOpenTree={() => setActiveView('tree')}
          onOpenCompanions={() => setActiveView('companions')}
          onOpenMap={() => setActiveView('map')}
        />
      )}

      {activeView === 'tree' && (
        <CelestialTreeView
          state={odysseyState}
          onStateChange={setOdysseyState}
          onBackToArena={() => setActiveView('arena')}
        />
      )}

      {activeView === 'companions' && (
        <CompanionsDexView
          state={odysseyState}
          onBackToArena={() => setActiveView('arena')}
        />
      )}

      {activeView === 'map' && (
        <BiomesMapView
          state={odysseyState}
          onStateChange={setOdysseyState}
          onBackToArena={() => setActiveView('arena')}
        />
      )}

      {activeView === 'stats' && (
        <OdysseyStatsView
          state={odysseyState}
          playerStats={playerStats}
        />
      )}
    </div>
  );
};
