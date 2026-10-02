import React from 'react';
import { Compass, Sword } from 'lucide-react';
import type { OdysseySaveState } from '../../types/odyssey';
import { getCurrentBiome } from '../../services/odysseyEngineService';
import { OdysseyWorldMap } from './OdysseyWorldMap';

interface BiomesMapViewProps {
  state: OdysseySaveState;
  onStateChange: (newState: OdysseySaveState) => void;
  onBackToArena: () => void;
}

export const BiomesMapView: React.FC<BiomesMapViewProps> = ({
  state,
  onStateChange,
  onBackToArena,
}) => {
  const currentBiome = getCurrentBiome(state.currentBiomeId);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in duration-300 gap-4">
      {/* Header Carte & Navigation */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#06241b]/95 border border-[#78350f] backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Compass className="w-5 h-5 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Carte Interactive du Monde</span>
            </h2>
            <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
              <span>📍 Position actuelle :</span>
              <strong className="text-amber-400 font-bold">{currentBiome.name}</strong>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">Route {state.currentRouteNumber}/5</span>
            </p>
          </div>
        </div>

        <button
          onClick={onBackToArena}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Sword className="w-3.5 h-3.5" />
          <span>Retour à l'Arène</span>
        </button>
      </div>

      {/* Véritable Carte Interactive avec Sentier SVG & Atlas */}
      <OdysseyWorldMap state={state} onStateChange={onStateChange} />
    </div>
  );
};
