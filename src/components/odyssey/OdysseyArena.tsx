import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Sword,
  Award,
  Clock,
  Lock,
  Crown,
  Droplets,
  Network,
  Backpack,
  MousePointerClick,
  Trees,
  Gamepad2,
  Gem,
  Mountain,
  Flame,
  Map,
  Check,
  Target,
  FastForward,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertCircle,
  Waves,
} from 'lucide-react';
import { RouteLootDex } from './RouteLootDex';
import { OdysseyArenaBackdrop } from './OdysseyArenaBackdrop';
import { OdysseyWorldMap } from './OdysseyWorldMap';
import {
  OdysseySlashOverlay,
  OdysseySapBurstOverlay,
  OdysseyHealthBar,
  type SlashEffect,
  type SapOrbParticle,
} from './OdysseyCombatJuice';
import type {
  OdysseySaveState,
  OdysseyPlayerStats,
  OdysseyMonster,
  DamagePopup,
  GoldenFireflyState,
  GoldenBuffType,
} from '../../types/odyssey';
import { ODYSSEY_BIOMES } from '../../data/odysseyData';
import {
  getCurrentBiome,
  getCurrentRoute,
  formatOdysseyNumber,
  performAttack,
  defeatMonster,
  spawnNextMonster,
  switchRoute,
  switchBiome,
  saveOdysseyState,
} from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';
import { INDIE_GAMES } from '../../data/games';
import { handleOdysseyImageError, IMPLEMENTED_ODYSSEY_GAMES } from '../../data/odysseyRouteDex';

interface OdysseyArenaProps {
  state: OdysseySaveState;
  playerStats: OdysseyPlayerStats;
  onStateChange: (newState: OdysseySaveState) => void;
  onOpenTree: () => void;
  onOpenCompanions: (gameId?: string) => void;
}

const getBiomeLucideIcon = (biomeId: string) => {
  switch (biomeId) {
    case 'biome_1_clearing':
      return <Trees className="w-5 h-5 text-emerald-400" />;
    case 'biome_2_pixel_canopy':
      return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
    case 'biome_3_crystal_caves':
      return <Gem className="w-5 h-5 text-purple-400" />;
    case 'biome_4_celestial_summit':
      return <Mountain className="w-5 h-5 text-sky-400" />;
    case 'biome_5_infernal_abyss':
      return <Flame className="w-5 h-5 text-rose-400" />;
    case 'biome_6_cosmic_void':
      return <Sparkles className="w-5 h-5 text-amber-400" />;
    case 'biome_7_chrono_rift':
      return <Clock className="w-5 h-5 text-amber-300" />;
    case 'biome_8_ocean_abyss':
      return <Waves className="w-5 h-5 text-cyan-400" />;
    default:
      return <Map className="w-5 h-5 text-amber-400" />;
  }
};

export const OdysseyArena: React.FC<OdysseyArenaProps> = ({
  state,
  playerStats,
  onStateChange,
  onOpenTree,
  onOpenCompanions,
}) => {
  const currentBiome = getCurrentBiome(state.currentBiomeId);
  const currentRoute = getCurrentRoute(state.currentBiomeId, state.currentRouteNumber);

  // Monstre actif
  const [currentMonster, setCurrentMonster] = useState<OdysseyMonster>(() =>
    spawnNextMonster(currentRoute, playerStats.holoChanceBonus, state.capturedGames, playerStats.echoChanceBonus)
  );

  // Kills sur la route courante (persistant dans la sauvegarde globale)
  const routeKills = (state.routeKills && state.routeKills[currentRoute.id]) || 0;

  // Popups de dégâts flottants
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);

  // Animation d'impact et critique sur le monstre
  const [isHit, setIsHit] = useState<boolean>(false);
  const [isCritHit, setIsCritHit] = useState<boolean>(false);

  // Tranchants au clic (Slash FX)
  const [slashes, setSlashes] = useState<SlashEffect[]>([]);

  // Éclats d'orbes de Sève à la victoire
  const [sapBursts, setSapBursts] = useState<SapOrbParticle[]>([]);

  // Secousse d'écran (Screen Shake) et accessibilité
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [screenShakeEnabled, setScreenShakeEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hoot_screen_shake') !== 'false';
  });

  const [mobileTab, setMobileTab] = useState<'arena' | 'map'>('arena');
  const arenaRef = useRef<HTMLDivElement>(null);

  const toggleScreenShake = () => {
    setScreenShakeEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('hoot_screen_shake', String(next));
      soundFx.playClick();
      return next;
    });
  };

  // Timer du boss
  const [bossTimeLeft, setBossTimeLeft] = useState<number>(30);

  // Luciole Dorée
  const [firefly, setFirefly] = useState<GoldenFireflyState>({
    isActive: false,
    x: 50,
    y: 50,
    spawnTimestamp: 0,
  });

  // Buff actif
  const [activeBuff, setActiveBuff] = useState<{
    type: GoldenBuffType;
    durationRemaining: number;
    multiplier: number;
    label: string;
  } | null>(null);

  // Capture récente pour célébration
  const [recentCapture, setRecentCapture] = useState<string | null>(null);
  // Alerte visuelle en cas d'échec face au Boss
  const [bossFailureNotice, setBossFailureNotice] = useState<string | null>(null);

  // Référence d'état pour éviter les fermetures obsolètes dans la boucle
  const stateRef = useRef(state);
  stateRef.current = state;

  const monsterRef = useRef(currentMonster);
  monsterRef.current = currentMonster;

  const playerStatsRef = useRef(playerStats);
  playerStatsRef.current = playerStats;

  const buffRef = useRef(activeBuff);
  buffRef.current = activeBuff;

  // Réinitialiser le monstre quand on change de route (sans effacer les kills persistant sur la route)
  useEffect(() => {
    const nextMob = spawnNextMonster(
      currentRoute,
      playerStats.holoChanceBonus,
      stateRef.current.capturedGames,
      playerStats.echoChanceBonus
    );
    setCurrentMonster(nextMob);
    if (currentRoute.isBossRoute) {
      setBossTimeLeft(currentRoute.bossTimerSeconds || 30);
    }
  }, [currentRoute.id, playerStats.holoChanceBonus, playerStats.echoChanceBonus]);

  // Boucle de minuterie du Boss (30s)
  useEffect(() => {
    if (!currentRoute.isBossRoute) return;

    const timer = setInterval(() => {
      setBossTimeLeft((prev) => {
        if (prev <= 1) {
          // Échec du boss : repli immédiat vers la route 4 précédente et désactivation de "avancer automatique"
          setTimeout(() => {
            soundFx.playError();
            const targetRouteNum = Math.max(1, currentRoute.routeNumber - 1);
            const fallback: OdysseySaveState = {
              ...switchRoute(stateRef.current, targetRouteNum),
              autoAdvance: false,
            };
            saveOdysseyState(fallback);
            onStateChange(fallback);
            setBossFailureNotice(`Temps écoulé face au Boss ! Repli stratégique vers la Route ${targetRouteNum}.`);
            setTimeout(() => setBossFailureNotice(null), 4000);
          }, 0);
          return currentRoute.bossTimerSeconds || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRoute.isBossRoute, currentRoute.routeNumber, currentRoute.bossTimerSeconds, onStateChange]);

  // Boucle de buff et de spawn aléatoire de Luciole Dorée
  useEffect(() => {
    const fireflyInterval = setInterval(() => {
      // 20% de chance toutes les 45 secondes de faire apparaître une luciole si inactive
      if (!firefly.isActive && Math.random() < 0.25) {
        setFirefly({
          isActive: true,
          x: 10 + Math.random() * 80,
          y: 15 + Math.random() * 65,
          spawnTimestamp: Date.now(),
        });
        soundFx.playAchievement();
      }
    }, 45000);

    return () => clearInterval(fireflyInterval);
  }, [firefly.isActive]);

  // Gestion du décompte du buff actif
  useEffect(() => {
    if (!activeBuff) return;

    const buffInterval = setInterval(() => {
      setActiveBuff((prev) => {
        if (!prev) return null;
        if (prev.durationRemaining <= 1) {
          return null;
        }
        return { ...prev, durationRemaining: prev.durationRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(buffInterval);
  }, [activeBuff]);

  // Nettoyage des popups de dégâts après 800ms
  const addDamagePopup = useCallback((amount: number, isCrit: boolean) => {
    const id = `${Date.now()}_${Math.random()}`;
    const x = 40 + (Math.random() * 20 - 10);
    const y = 35 + (Math.random() * 15 - 7);

    setDamagePopups((prev) => [...prev.slice(-12), { id, amount, isCrit, x, y, createdAt: Date.now() }]);
  }, []);

  useEffect(() => {
    if (damagePopups.length === 0) return;
    const cleanup = setTimeout(() => {
      const now = Date.now();
      setDamagePopups((prev) => prev.filter((p) => now - p.createdAt < 750));
    }, 750);
    return () => clearTimeout(cleanup);
  }, [damagePopups]);

  // Nettoyage automatique des tranchants visuels de lame (Slash FX)
  useEffect(() => {
    if (slashes.length === 0) return;
    const cleanup = setTimeout(() => {
      const now = Date.now();
      setSlashes((prev) => prev.filter((s) => now - s.createdAt < 300));
    }, 300);
    return () => clearTimeout(cleanup);
  }, [slashes]);

  // Nettoyage automatique des particules de sève éclatées
  useEffect(() => {
    if (sapBursts.length === 0) return;
    const cleanup = setTimeout(() => {
      setSapBursts([]);
    }, 700);
    return () => clearTimeout(cleanup);
  }, [sapBursts]);

  // Fonction de victoire contre un monstre
  const handleDefeat = useCallback(() => {
    const mob = monsterRef.current;
    const stats = playerStatsRef.current;
    const curState = stateRef.current;

    const sapMultiplier = buffRef.current?.type === 'sap_rain' ? 3 : 1;
    const { nextState, newlyCapturedGameTitle } = defeatMonster(
      curState,
      mob,
      stats,
      sapMultiplier
    );

    // Éclats d'orbes de Sève à la victoire
    const burstCount = mob.isBoss ? 16 : 8;
    const burstParticles: SapOrbParticle[] = Array.from({ length: burstCount }).map((_, i) => {
      const angle = (i / burstCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = 45 + Math.random() * 80;
      return {
        id: `${Date.now()}_${i}_${Math.random()}`,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        color: mob.isBoss
          ? Math.random() > 0.4
            ? 'bg-amber-300'
            : 'bg-rose-400'
          : Math.random() > 0.3
          ? 'bg-cyan-400'
          : 'bg-emerald-300',
        size: 5 + Math.random() * 5,
      };
    });
    setSapBursts(burstParticles);
    soundFx.playSapBurst();

    // Micro-secousse lors de la mort d'un Boss
    if (mob.isBoss && screenShakeEnabled) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 280);
    }

    if (newlyCapturedGameTitle) {
      setRecentCapture(newlyCapturedGameTitle);
      soundFx.playAchievement();
      setTimeout(() => setRecentCapture(null), 3500);
    }

    if (mob.isHolo) {
      soundFx.playVictory();
    }

    // Auto-advance de route
    const nextKills = (nextState.routeKills && nextState.routeKills[currentRoute.id]) || (routeKills + 1);

    if (curState.autoAdvance && nextKills >= currentRoute.requiredKillsToAdvance) {
      if (!currentRoute.isBossRoute && curState.currentRouteNumber < 5) {
        const nextRouteNum = curState.currentRouteNumber + 1;
        const advancedState = switchRoute(nextState, nextRouteNum);
        onStateChange(advancedState);
        return;
      }
    }

    onStateChange(nextState);
    saveOdysseyState(nextState);

    // Spawner le monstre suivant
    const nextMob = spawnNextMonster(
      currentRoute,
      stats.holoChanceBonus,
      nextState.capturedGames,
      stats.echoChanceBonus
    );
    setCurrentMonster(nextMob);
    if (currentRoute.isBossRoute) {
      setBossTimeLeft(currentRoute.bossTimerSeconds || 30);
    }
  }, [currentRoute, routeKills, onStateChange, screenShakeEnabled]);

  // Attaque par clic du joueur
  const handleMonsterClick = useCallback((e?: React.MouseEvent<HTMLDivElement>) => {
    const mob = monsterRef.current;
    const stats = playerStatsRef.current;
    const frenzyMult = buffRef.current?.type === 'frenzy_click' ? 7 : 1;

    const { damage, isCrit, nextHp, isKilled } = performAttack(mob, stats, true, frenzyMult);

    addDamagePopup(damage, isCrit);
    setIsHit(true);
    setIsCritHit(isCrit);
    setTimeout(() => setIsHit(false), 90);

    // Bruitage procédural de lame tranchante
    soundFx.playSlash(isCrit);

    // Secousse dynamique sur coup critique
    if (isCrit && screenShakeEnabled) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 180);
    }

    // Apparition du tracé de taillade SVG à l'endroit exact du clic
    if (e && arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const angle = Math.random() * 68 - 34;
      const newSlash: SlashEffect = {
        id: `${Date.now()}_${Math.random()}`,
        x,
        y,
        angle,
        isCrit,
        createdAt: Date.now(),
      };
      setSlashes((prev) => [...prev.slice(-6), newSlash]);
    }
      if (isKilled) {
        React.startTransition(() => {
          handleDefeat();
        });
      } else {
        React.startTransition(() => {
          setCurrentMonster((prev) => ({ ...prev, currentHp: nextHp }));
        });
      }
  }, [addDamagePopup, handleDefeat, screenShakeEnabled]);

  // Boucle DPS Passif (Tick toutes les 200ms via Web Worker pour ?viter le throttling CPU du navigateur en arri?re-plan)
  useEffect(() => {
    const tickIntervalMs = 200;
    
    // Initialiser le worker
    const worker = new Worker(new URL('../../workers/idleTimerWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      if (e.data.type === 'tick') {
        const stats = playerStatsRef.current;
        if (stats.passiveDps <= 0) return;
  
        const mob = monsterRef.current;
        const damageThisTick = Math.max(1, Math.floor((stats.passiveDps * tickIntervalMs) / 1000));
  
        const nextHp = Math.max(0, mob.currentHp - damageThisTick);
        if (nextHp <= 0) {
          React.startTransition(() => {
            handleDefeat();
          });
        } else {
          React.startTransition(() => {
            setCurrentMonster((prev) => ({ ...prev, currentHp: nextHp }));
          });
        }
      }
    };

    worker.postMessage({ action: 'start', intervalMs: tickIntervalMs });

    return () => {
      worker.postMessage({ action: 'stop' });
      worker.terminate();
    };
  }, [handleDefeat]);

  // Clic sur la Luciole Dorée
  const handleFireflyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playVictory();
    setFirefly({ isActive: false, x: 50, y: 50, spawnTimestamp: 0 });

    const buffs: { type: GoldenBuffType; duration: number; multiplier: number; label: string }[] = [
      {
        type: 'frenzy_click',
        duration: 30,
        multiplier: 7,
        label: 'Frénésie de Frappe (Dégâts x7 pendant 30s)',
      },
      {
        type: 'sap_rain',
        duration: 30,
        multiplier: 3,
        label: 'Pluie de Sève (Sève x3 pendant 30s)',
      },
    ];

    const chosen = buffs[Math.floor(Math.random() * buffs.length)];
    setActiveBuff({
      type: chosen.type,
      durationRemaining: chosen.duration,
      multiplier: chosen.multiplier,
      label: chosen.label,
    });
  };

  // Navigation rapide entre les biomes débloqués
  const canPrevBiome = currentBiome.index > 1;
  const canNextBiome = currentBiome.index < state.highestBiomeUnlocked;

  const handlePrevBiome = () => {
    if (!canPrevBiome) return;
    const targetBiome = ODYSSEY_BIOMES.find((b) => b.index === currentBiome.index - 1);
    if (targetBiome) {
      soundFx.playClick();
      onStateChange(switchBiome(state, targetBiome.id));
    }
  };

  const handleNextBiome = () => {
    if (!canNextBiome) return;
    const targetBiome = ODYSSEY_BIOMES.find((b) => b.index === currentBiome.index + 1);
    if (targetBiome) {
      soundFx.playClick();
      onStateChange(switchBiome(state, targetBiome.id));
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center select-none">
      {/* 1. Bandeau supérieur : Choix de Route & Sève */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#06241b]/90 border border-[#78350f] backdrop-blur-md mb-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
            {getBiomeLucideIcon(currentBiome.id)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {state.highestBiomeUnlocked > 1 && (
                <button
                  type="button"
                  disabled={!canPrevBiome}
                  onClick={handlePrevBiome}
                  aria-label="Monde précédent"
                  className="p-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <h3 className="text-sm sm:text-base font-black text-white">{currentBiome.name}</h3>
              {state.highestBiomeUnlocked > 1 && (
                <button
                  type="button"
                  disabled={!canNextBiome}
                  onClick={handleNextBiome}
                  aria-label="Monde suivant"
                  className="p-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Route {state.currentRouteNumber}/5
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">{currentRoute.name}</p>
          </div>
        </div>

        {/* Compteur de Sève Stellaire */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Sève Stellaire
            </div>
            <div className="text-lg sm:text-2xl font-black font-mono text-cyan-400 flex items-center justify-end gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>{formatOdysseyNumber(state.starSap)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setMobileTab((prev) => (prev === 'arena' ? 'map' : 'arena'));
            }}
            className="lg:hidden px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>{mobileTab === 'arena' ? 'Carte' : 'Combat'}</span>
          </button>

          <button
            onClick={onOpenTree}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arbre Céleste</span>
          </button>
        </div>
      </div>

      {/* 2. Sélecteur de Route (1 à 5) & Case Auto-Progression */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex-1 min-w-[200px] flex items-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((rNum) => {
            const isBoss = rNum === 5;
            const maxUnlocked = state.highestRouteUnlocked[state.currentBiomeId] || 1;
            const isUnlocked = rNum <= maxUnlocked;
            const isCurrent = rNum === state.currentRouteNumber;

            return (
              <button
                key={rNum}
                disabled={!isUnlocked}
                onClick={() => {
                  soundFx.playClick();
                  const next = switchRoute(state, rNum);
                  onStateChange(next);
                }}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-xs font-black font-mono transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 scale-102'
                    : isUnlocked
                    ? 'bg-[#06241b] text-slate-300 hover:text-white hover:bg-slate-800/80 border-[#78350f]'
                    : 'bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed'
                }`}
              >
                {isBoss ? (
                  <>
                    <Crown className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="hidden sm:inline">Boss</span>
                  </>
                ) : (
                  <span>R{rNum}</span>
                )}
                {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-600" />}
              </button>
            );
          })}
        </div>

        {/* Commutateur ergonomique : Auto-progression vs Farm sécurisé */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            const nextState = { ...state, autoAdvance: !state.autoAdvance };
            onStateChange(nextState);
            saveOdysseyState(nextState);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold select-none transition-all cursor-pointer shadow-sm active:scale-95 ${
            state.autoAdvance
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
              : 'bg-slate-900/90 text-slate-400 border-slate-700/70 hover:bg-slate-800 hover:text-white'
          }`}
          title={
            state.autoAdvance
              ? 'Auto-progression active : avance vers la route suivante dès que le quota est atteint'
              : 'Farm sécurisé actif : reste sur la route actuelle pour récolter sève et pépites en boucle'
          }
        >
          {state.autoAdvance ? (
            <>
              <FastForward className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Auto-progression</span>
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Farm sécurisé</span>
            </>
          )}
        </button>

        {/* Case à cocher : Gadget flottant (Désactivé par défaut pour éviter toute intrusion au premier lancement) */}
        <label
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs font-mono font-bold text-slate-300 hover:text-white cursor-pointer select-none transition-all hover:bg-slate-800 shrink-0 shadow-sm"
          title="Afficher le mini-gadget flottant de l'Odyssée sur l'ensemble du site (désactivé par défaut)."
        >
          <input
            type="checkbox"
            checked={Boolean(state.miniHudEnabled ?? state.miniHudMobileEnabled)}
            onChange={(e) => {
              soundFx.playClick();
              const nextVal = e.target.checked;
              const nextState = { ...state, miniHudEnabled: nextVal, miniHudMobileEnabled: nextVal };
              onStateChange(nextState);
              saveOdysseyState(nextState);
              try {
                localStorage.setItem('hoot_odyssey_hud_enabled', String(nextVal));
                localStorage.setItem('hoot_odyssey_hud_mobile_enabled', String(nextVal));
              } catch {}
              window.dispatchEvent(new CustomEvent('hoot_odyssey_hud_pref_updated', { detail: nextVal }));
            }}
            className="w-3.5 h-3.5 rounded border-slate-600 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 cursor-pointer accent-amber-500"
          />
          <span className="text-[11px] flex items-center gap-1.5">
            <Gamepad2 className={`w-3.5 h-3.5 ${(state.miniHudEnabled ?? state.miniHudMobileEnabled) ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Gadget</span>
          </span>
        </label>
      </div>

      {/* Sélecteur d'onglet Mobile (Combat & Indiedex vs Carte du Monde) */}
      <div className="flex lg:hidden w-full items-center p-1 rounded-xl bg-slate-950/80 border border-white/10 mb-3">
        <button
          onClick={() => {
            soundFx.playClick();
            setMobileTab('arena');
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'arena'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sword className="w-3.5 h-3.5" />
          <span>Combat & Pépites</span>
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setMobileTab('map');
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'map'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Carte du Monde</span>
        </button>
      </div>

      {/* 3. Grille Principale Odyssée (Arène à gauche 50%, Carte interactive à droite 50% sur Desktop) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Colonne Gauche : Combat & Indiedex de Route */}
        <div className={`lg:col-span-6 flex flex-col gap-3.5 ${mobileTab === 'map' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Indiedex de Route / Loot Radar des Pépites */}
          <RouteLootDex
            currentRoute={currentRoute}
            capturedGames={state.capturedGames}
            onSelectGameInspect={onOpenCompanions}
          />

          {/* L'Arène de Combat Centrale */}
          <div
        ref={arenaRef}
        onClick={handleMonsterClick}
        className={`relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[460px] rounded-3xl border-2 ${currentBiome.borderColor} bg-gradient-to-b ${currentBiome.bgGradient} shadow-2xl overflow-hidden flex flex-col justify-between p-4 sm:p-6 cursor-crosshair select-none active:scale-[0.99] group ${
          screenShake ? 'arena-screen-shake' : ''
        }`}
      >
        {/* Décors vivants multi-couches spécifiques au Biome */}
        <OdysseyArenaBackdrop
          biomeId={currentBiome.id}
          isBoss={Boolean(currentRoute.isBossRoute)}
        />

        {/* Effets de tranchant SVG au clic */}
        <OdysseySlashOverlay slashes={slashes} />

        {/* Éclats de Sève à la victoire */}
        <OdysseySapBurstOverlay particles={sapBursts} />

        {/* Luciole Dorée Flottante */}
        {firefly.isActive && (
          <div
            onClick={handleFireflyClick}
            style={{ left: `${firefly.x}%`, top: `${firefly.y}%` }}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2 animate-bounce hover:scale-125 transition-transform"
            title="Luciole Dorée — Cliquez pour activer un bonus temporaire !"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-400/40 border-2 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </div>
          </div>
        )}

        {/* Alerte Buff Actif */}
        {activeBuff && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-amber-500/90 border border-amber-300 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1.5 animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>{activeBuff.label}</span>
            <span className="font-mono text-slate-900">({activeBuff.durationRemaining}s)</span>
          </div>
        )}

        {/* Notification Célébration Nouvelle Capture */}
        {recentCapture && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-emerald-600 text-white border-2 border-emerald-300 text-xs sm:text-sm font-black shadow-2xl flex items-center gap-2 animate-bounce">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Pépite Capturée : {recentCapture} !</span>
          </div>
        )}

        {/* Notification Échec du Boss & Repli Stratégique */}
        {bossFailureNotice && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-rose-950/95 text-rose-200 border-2 border-rose-500 text-xs sm:text-sm font-black shadow-2xl flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{bossFailureNotice}</span>
          </div>
        )}

        {/* Header Arène : Progression et Timer Boss */}
        <div className="flex flex-col gap-1.5 z-10 w-full max-w-sm sm:max-w-md">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 font-mono text-slate-300 font-bold shadow-md">
              {currentRoute.isBossRoute ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gardien du Biome</span>
                </>
              ) : routeKills < currentRoute.requiredKillsToAdvance ? (
                <>
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Progression : {routeKills} / {currentRoute.requiredKillsToAdvance}
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">
                    Route validée ({routeKills} vaincus)
                  </span>
                </>
              )}
            </div>

            {currentRoute.isBossRoute && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black border shadow-md ${
                  bossTimeLeft <= 10
                    ? 'bg-rose-600/80 text-white border-rose-400 animate-pulse'
                    : 'bg-black/60 text-amber-300 border-amber-500/40'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{bossTimeLeft}s</span>
              </div>
            )}
          </div>

          {!currentRoute.isBossRoute && (
            <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  routeKills >= currentRoute.requiredKillsToAdvance
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                    : 'bg-amber-400'
                }`}
                style={{
                  width: `${Math.min(100, Math.floor((routeKills / currentRoute.requiredKillsToAdvance) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Centre Arène : Monstre / Écho Sauvage */}
        <div className="relative my-auto flex flex-col items-center justify-center z-15">
          {/* Popups de dégâts bondissants */}
          {damagePopups.map((p) => (
            <div
              key={p.id}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 font-mono font-black tracking-tight animate-out fade-out slide-out-to-top duration-700 z-30 ${
                p.isCrit
                  ? 'text-xl sm:text-3xl text-amber-300 drop-shadow-[0_4px_10px_rgba(245,158,11,0.9)]'
                  : 'text-base sm:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
              }`}
            >
              {p.isCrit ? `CRIT! -${formatOdysseyNumber(p.amount)}` : `-${formatOdysseyNumber(p.amount)}`}
            </div>
          ))}

          {/* Sprite / Médaillon du Monstre */}
          <div
            className={`relative flex flex-col items-center justify-center transition-all duration-100 ${
              isHit
                ? isCritHit
                  ? 'scale-90 rotate-2 brightness-150 contrast-125'
                  : 'scale-95 -rotate-1 brightness-130'
                : 'animate-monster-idle hover:scale-105'
            }`}
          >
            {currentMonster.isHolo && (
              <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-cyan-400/30 border border-cyan-300 text-cyan-100 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg shadow-cyan-500/50 animate-pulse z-20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                <span>HOLOGRAPHIQUE SHINY (1/1024)</span>
              </div>
            )}

            {currentMonster.artworkUrl ? (
              <div
                className={`relative w-40 sm:w-56 aspect-[16/9] rounded-2xl overflow-hidden border-2 shadow-2xl bg-black ${
                  currentMonster.isHolo
                    ? 'border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.6)] ring-2 ring-amber-400/60'
                    : 'border-amber-400/60 shadow-black/80'
                }`}
              >
                <img
                  key={currentMonster.id}
                  src={currentMonster.artworkUrl}
                  alt={currentMonster.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const monsterGame = currentMonster.gameId
                      ? INDIE_GAMES.find((g) => g.id === currentMonster.gameId)
                      : undefined;
                    handleOdysseyImageError(e, monsterGame);
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                {currentMonster.isHolo && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge"
                    style={{
                      background:
                        'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.7) 45%, rgba(6,182,212,0.8) 55%, transparent 80%)',
                    }}
                  />
                )}
              </div>
            ) : currentMonster.isBoss ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/90 border-2 border-amber-400/80 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-amber-400 mb-1" />
                <span className="text-[10px] font-black uppercase text-amber-300 font-mono tracking-wider">BOSS</span>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/80 border-2 border-[#78350f] flex flex-col items-center justify-center shadow-xl">
                <Sword className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400 font-bold">ÉCHO R{state.currentRouteNumber}</span>
              </div>
            )}

            {/* Badge discret de statut de capture pour les Échos Sauvages */}
            {currentMonster.isWildEcho && currentMonster.gameId && (
              <div className="mt-1.5 flex items-center justify-center">
                {state.capturedGames[currentMonster.gameId] ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/40 shadow-sm">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Capturé (x{state.capturedGames[currentMonster.gameId].count})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-sm shadow-amber-500/20 animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Nouvelle pépite</span>
                  </span>
                )}
              </div>
            )}

            <div className="mt-1.5 text-center">
              <h4 className="text-sm sm:text-base font-black text-white drop-shadow-md">
                {currentMonster.name}
              </h4>
              <span className="text-[11px] font-mono text-emerald-300 font-bold flex items-center justify-center gap-1 mt-0.5">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>+{formatOdysseyNumber(currentMonster.sapReward * playerStats.sapMultiplier)} Sève</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Arène : Jauge de PV RPG Double-Couche avec Impact Flash */}
        <OdysseyHealthBar
          currentHp={currentMonster.currentHp}
          maxHp={currentMonster.maxHp}
          isBoss={Boolean(currentMonster.isBoss)}
          isHit={isHit}
        />
      </div>

      {/* 4. Barre d'action rapide sous l'arène */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-3 px-1 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            <span>Clic : <strong className="text-amber-400 font-bold">{formatOdysseyNumber(playerStats.clickDamage)}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Passif : <strong className="text-cyan-400 font-bold">{formatOdysseyNumber(playerStats.passiveDps)}/s</strong></span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Commutateur de Secousses d'Écran (Accessibilité) */}
          <button
            onClick={toggleScreenShake}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
              screenShakeEnabled
                ? 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                : 'bg-slate-950/80 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title="Activer ou désactiver les micro-secousses d'écran lors des coups critiques"
          >
            <Activity className={`w-3.5 h-3.5 ${screenShakeEnabled ? 'text-amber-400' : 'text-slate-600'}`} />
            <span>Secousses {screenShakeEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => onOpenCompanions()}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Backpack className="w-3.5 h-3.5 text-amber-400" />
            <span>Indiedex ({Object.keys(state.capturedGames).length}/{IMPLEMENTED_ODYSSEY_GAMES.length})</span>
          </button>
        </div>
      </div>
    </div>

    {/* Colonne Droite : Carte Interactive du Monde & Sentier des Routes (50%) */}
    <div className={`lg:col-span-6 flex flex-col gap-3.5 w-full ${mobileTab === 'arena' ? 'hidden lg:flex' : 'flex'}`}>
      <OdysseyWorldMap state={state} onStateChange={onStateChange} />
    </div>
  </div>

  </div>
);
};
