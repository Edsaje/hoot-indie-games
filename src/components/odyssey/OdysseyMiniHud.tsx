import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sword,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { OdysseySaveState, OdysseyMonster } from '../../types/odyssey';
import {
  loadOdysseyState,
  saveOdysseyState,
  computePlayerStats,
  getCurrentBiome,
  getCurrentRoute,
  formatOdysseyNumber,
  performAttack,
  defeatMonster,
  spawnNextMonster,
} from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';

interface OdysseyMiniHudProps {
  onNavigateToOdyssey: () => void;
  isModalActive?: boolean;
}

export const OdysseyMiniHud: React.FC<OdysseyMiniHudProps> = ({
  onNavigateToOdyssey,
  isModalActive = false,
}) => {
  const [odysseyState, setOdysseyState] = useState<OdysseySaveState>(() => loadOdysseyState());
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hoot_odyssey_hud_collapsed') === 'true';
    }
    return false;
  });

  const playerStats = computePlayerStats(odysseyState);
  const currentBiome = getCurrentBiome(odysseyState.currentBiomeId);
  const currentRoute = getCurrentRoute(odysseyState.currentBiomeId, odysseyState.currentRouteNumber);

  // Monstre local pour le mini-hud
  const [monster, setMonster] = useState<OdysseyMonster>(() =>
    spawnNextMonster(currentRoute, playerStats.holoChanceBonus)
  );

  const stateRef = useRef(odysseyState);
  stateRef.current = odysseyState;

  const monsterRef = useRef(monster);
  monsterRef.current = monster;

  const statsRef = useRef(playerStats);
  statsRef.current = playerStats;

  // Écoute des mises à jour globales
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setOdysseyState(e.detail);
      } else {
        setOdysseyState(loadOdysseyState());
      }
    };
    window.addEventListener('hoot_odyssey_updated', handleUpdate);
    return () => window.removeEventListener('hoot_odyssey_updated', handleUpdate);
  }, []);

  // Défaite d'un monstre en arrière-plan
  const handleDefeat = useCallback(() => {
    const curMob = monsterRef.current;
    const curStats = statsRef.current;
    const curState = stateRef.current;

    const { nextState } = defeatMonster(curState, curMob, curStats, 1);
    setOdysseyState(nextState);
    saveOdysseyState(nextState);

    const nextMob = spawnNextMonster(currentRoute, curStats.holoChanceBonus);
    setMonster(nextMob);
  }, [currentRoute]);

  // Boucle de combat passif de fond (Tick chaque seconde)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // Si la page est en arrière-plan ou passiveDps = 0, on économise
      if (typeof document !== 'undefined' && document.hidden) return;
      const stats = statsRef.current;
      if (stats.passiveDps <= 0) return;

      const curMob = monsterRef.current;
      const damage = Math.max(1, stats.passiveDps);
      const nextHp = Math.max(0, curMob.currentHp - damage);

      if (nextHp <= 0) {
        handleDefeat();
      } else {
        setMonster((prev) => ({ ...prev, currentHp: nextHp }));
      }
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [handleDefeat]);

  // Attaque rapide au clic
  const handleQuickAttack = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const curMob = monsterRef.current;
    const curStats = statsRef.current;

    const { nextHp, isKilled } = performAttack(curMob, curStats, true, 1);

    if (isKilled) {
      handleDefeat();
    } else {
      setMonster((prev) => ({ ...prev, currentHp: nextHp }));
    }
  };

  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('hoot_odyssey_hud_collapsed', String(next));
      return next;
    });
  };

  if (isModalActive) return null;

  const hpPercent = Math.max(0, Math.min(100, (monster.currentHp / monster.maxHp) * 100));

  // 1. Vue Minimisée (Pastille compacte)
  if (isCollapsed) {
    return (
      <div
        onClick={toggleCollapsed}
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[45] px-3 py-1.5 rounded-full bg-[#06241b]/95 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-mono text-xs shadow-2xl backdrop-blur-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none group"
        title="Ouvrir le Mini-HUD de l'Odyssée Sylvestre"
      >
        <span>🌲</span>
        <span className="font-bold text-cyan-300">💧 {formatOdysseyNumber(odysseyState.starSap)}</span>
        <ChevronUp className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    );
  }

  // 2. Vue Complète Déployée
  return (
    <div className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-[45] w-[280px] sm:w-[310px] p-3 rounded-2xl bg-[#06241b]/95 border-2 border-[#78350f] hover:border-amber-500/70 shadow-[0_12px_35px_rgba(0,0,0,0.8)] backdrop-blur-md select-none transition-all flex flex-col gap-2">
      {/* Header Mini-HUD */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-white truncate max-w-[190px]">
          <span>{currentBiome.icon}</span>
          <span className="truncate">{currentBiome.name}</span>
          <span className="text-[10px] font-mono font-bold text-amber-400">R{odysseyState.currentRouteNumber}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleCollapsed}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title="Réduire le HUD"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Monstre & Jauge de Vie */}
      <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xl shrink-0">{monster.emoji}</span>
          <div className="truncate">
            <div className="text-[11px] font-black text-white truncate">{monster.name}</div>
            <div className="text-[9px] font-mono text-slate-400">
              {formatOdysseyNumber(monster.currentHp)} / {formatOdysseyNumber(monster.maxHp)}
            </div>
          </div>
        </div>

        <button
          onClick={handleQuickAttack}
          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow transition-transform active:scale-90 shrink-0 flex items-center gap-1 cursor-pointer"
          title="Frapper le monstre"
        >
          <Sword className="w-3 h-3" />
          <span>Frapper</span>
        </button>
      </div>

      {/* Barre de Progression PV */}
      <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-700/60 overflow-hidden">
        <div
          style={{ width: `${hpPercent}%` }}
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200"
        />
      </div>

      {/* Footer Mini-HUD : Sève & Bouton Ouvrir */}
      <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
        <div className="flex items-center gap-1 text-cyan-300 font-bold">
          <span>💧</span>
          <span>{formatOdysseyNumber(odysseyState.starSap)}</span>
          <span className="text-[9px] text-slate-400">
            (+{formatOdysseyNumber(playerStats.passiveDps)}/s)
          </span>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigateToOdyssey();
          }}
          className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Ouvrir</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
