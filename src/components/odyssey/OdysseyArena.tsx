import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Sword,
  Award,
  Clock,
  Lock,
  Crown,
} from 'lucide-react';
import type {
  OdysseySaveState,
  OdysseyPlayerStats,
  OdysseyMonster,
  DamagePopup,
  GoldenFireflyState,
  GoldenBuffType,
} from '../../types/odyssey';
import {
  getCurrentBiome,
  getCurrentRoute,
  formatOdysseyNumber,
  performAttack,
  defeatMonster,
  spawnNextMonster,
  switchRoute,
  saveOdysseyState,
} from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';

interface OdysseyArenaProps {
  state: OdysseySaveState;
  playerStats: OdysseyPlayerStats;
  onStateChange: (newState: OdysseySaveState) => void;
  onOpenTree: () => void;
  onOpenCompanions: () => void;
}

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
    spawnNextMonster(currentRoute, playerStats.holoChanceBonus)
  );

  // Kills sur la route courante (pour débloquer la suite)
  const [routeKills, setRouteKills] = useState<number>(0);

  // Popups de dégâts flottants
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);

  // Animation d'impact sur le monstre
  const [isHit, setIsHit] = useState<boolean>(false);

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

  // Référence d'état pour éviter les fermetures obsolètes dans la boucle
  const stateRef = useRef(state);
  stateRef.current = state;

  const monsterRef = useRef(currentMonster);
  monsterRef.current = currentMonster;

  const playerStatsRef = useRef(playerStats);
  playerStatsRef.current = playerStats;

  const buffRef = useRef(activeBuff);
  buffRef.current = activeBuff;

  // Réinitialiser le monstre quand on change de route
  useEffect(() => {
    const nextMob = spawnNextMonster(currentRoute, playerStats.holoChanceBonus);
    setCurrentMonster(nextMob);
    setRouteKills(0);
    if (currentRoute.isBossRoute) {
      setBossTimeLeft(currentRoute.bossTimerSeconds || 30);
    }
  }, [currentRoute.id, playerStats.holoChanceBonus]);

  // Boucle de minuterie du Boss
  useEffect(() => {
    if (!currentRoute.isBossRoute) return;

    const timer = setInterval(() => {
      setBossTimeLeft((prev) => {
        if (prev <= 1) {
          // Échec du boss : retour à la route 4
          soundFx.playError();
          const fallback = switchRoute(stateRef.current, 4);
          onStateChange(fallback);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRoute.isBossRoute, onStateChange]);

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

    if (newlyCapturedGameTitle) {
      setRecentCapture(newlyCapturedGameTitle);
      soundFx.playAchievement();
      setTimeout(() => setRecentCapture(null), 3500);
    }

    if (mob.isHolo) {
      soundFx.playVictory();
    }

    // Auto-advance de route
    const nextKills = routeKills + 1;
    setRouteKills(nextKills);

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
    const nextMob = spawnNextMonster(currentRoute, stats.holoChanceBonus);
    setCurrentMonster(nextMob);
    if (currentRoute.isBossRoute) {
      setBossTimeLeft(currentRoute.bossTimerSeconds || 30);
    }
  }, [currentRoute, routeKills, onStateChange]);

  // Attaque par clic du joueur
  const handleMonsterClick = useCallback(() => {
    const mob = monsterRef.current;
    const stats = playerStatsRef.current;
    const frenzyMult = buffRef.current?.type === 'frenzy_click' ? 7 : 1;

    const { damage, isCrit, nextHp, isKilled } = performAttack(mob, stats, true, frenzyMult);

    addDamagePopup(damage, isCrit);
    setIsHit(true);
    setTimeout(() => setIsHit(false), 80);
    soundFx.playClick();

    if (isKilled) {
      handleDefeat();
    } else {
      setCurrentMonster((prev) => ({ ...prev, currentHp: nextHp }));
    }
  }, [addDamagePopup, handleDefeat]);

  // Boucle DPS Passif (Tick toutes les 200ms)
  useEffect(() => {
    const tickIntervalMs = 200;
    const interval = setInterval(() => {
      const stats = playerStatsRef.current;
      if (stats.passiveDps <= 0) return;

      const mob = monsterRef.current;
      const damageThisTick = Math.max(1, Math.floor((stats.passiveDps * tickIntervalMs) / 1000));

      const nextHp = Math.max(0, mob.currentHp - damageThisTick);
      if (nextHp <= 0) {
        handleDefeat();
      } else {
        setCurrentMonster((prev) => ({ ...prev, currentHp: nextHp }));
      }
    }, tickIntervalMs);

    return () => clearInterval(interval);
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
        label: '⚡ Frénésie de Clic (Dégâts x7 pendant 30s)',
      },
      {
        type: 'sap_rain',
        duration: 30,
        multiplier: 3,
        label: '💧 Pluie de Sève (Sève x3 pendant 30s)',
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

  const hpPercent = Math.max(0, Math.min(100, (currentMonster.currentHp / currentMonster.maxHp) * 100));

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* 1. Bandeau supérieur : Choix de Route & Sève */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#06241b]/90 border border-[#78350f] backdrop-blur-md mb-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{currentBiome.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">{currentBiome.name}</h3>
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
            <div className="text-lg sm:text-2xl font-black font-mono text-cyan-400 flex items-center justify-end gap-1">
              <span>💧</span>
              <span>{formatOdysseyNumber(state.starSap)}</span>
            </div>
          </div>

          <button
            onClick={onOpenTree}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🌲</span>
            <span className="hidden sm:inline">Arbre Céleste</span>
          </button>
        </div>
      </div>

      {/* 2. Sélecteur de Route (1 à 5) */}
      <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 mb-4 px-1">
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

      {/* 3. L'Arène de Combat Centrale */}
      <div
        onClick={handleMonsterClick}
        className={`relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[460px] rounded-3xl border-2 ${currentBiome.borderColor} bg-gradient-to-b ${currentBiome.bgGradient} shadow-2xl overflow-hidden flex flex-col justify-between p-4 sm:p-6 cursor-crosshair transition-transform select-none active:scale-[0.99] group`}
      >
        {/* Luciole Dorée Flottante */}
        {firefly.isActive && (
          <div
            onClick={handleFireflyClick}
            style={{ left: `${firefly.x}%`, top: `${firefly.y}%` }}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2 animate-bounce hover:scale-125 transition-transform"
            title="✨ Cliquez sur la Luciole Dorée pour activer la Frénésie !"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-400/40 border-2 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse">
              <span className="text-xl">✨</span>
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

        {/* Header Arène : Progression et Timer Boss */}
        <div className="flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 font-mono text-slate-300 font-bold">
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Vague {routeKills} / {currentRoute.requiredKillsToAdvance}
            </span>
          </div>

          {currentRoute.isBossRoute && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black border ${
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

        {/* Centre Arène : Monstre / Écho Sauvage */}
        <div className="relative my-auto flex flex-col items-center justify-center">
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
            className={`relative flex flex-col items-center justify-center transition-transform duration-75 ${
              isHit ? 'scale-90 brightness-130' : 'hover:scale-105'
            }`}
          >
            {currentMonster.isHolo && (
              <div className="absolute -top-6 px-2 py-0.5 rounded-full bg-cyan-400/25 border border-cyan-400 text-cyan-200 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg shadow-cyan-500/50 animate-pulse">
                <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
                <span>SHINY HOLOGRAPHIQUE (1/1024)</span>
              </div>
            )}

            {currentMonster.artworkUrl ? (
              <div className="relative w-40 sm:w-56 aspect-[16/9] rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-2xl bg-black">
                <img
                  src={currentMonster.artworkUrl}
                  alt={currentMonster.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/80 border-2 border-[#78350f] flex items-center justify-center text-5xl sm:text-6xl shadow-2xl">
                {currentMonster.emoji}
              </div>
            )}

            <div className="mt-2 text-center">
              <h4 className="text-sm sm:text-base font-black text-white drop-shadow-md">
                {currentMonster.name}
              </h4>
              <span className="text-[11px] font-mono text-emerald-300 font-bold">
                +💧 {formatOdysseyNumber(currentMonster.sapReward * playerStats.sapMultiplier)} Sève
              </span>
            </div>
          </div>
        </div>

        {/* Footer Arène : Jauge de PV du Monstre */}
        <div className="w-full max-w-md mx-auto z-10">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300 mb-1 px-1">
            <span>Points de Vie</span>
            <span>
              {formatOdysseyNumber(currentMonster.currentHp)} / {formatOdysseyNumber(currentMonster.maxHp)}
            </span>
          </div>

          <div className="w-full h-3 sm:h-3.5 rounded-full bg-black/60 border border-white/20 overflow-hidden shadow-inner p-0.5">
            <div
              style={{ width: `${hpPercent}%` }}
              className={`h-full rounded-full transition-all duration-100 ${
                currentMonster.isBoss
                  ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-400'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 4. Barre d'action rapide sous l'arène */}
      <div className="w-full flex items-center justify-between gap-3 mt-3 px-1 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>
            🗡️ Clic : <strong className="text-amber-400 font-bold">{formatOdysseyNumber(playerStats.clickDamage)}</strong>
          </span>
          <span>
            🦉 Passif : <strong className="text-cyan-400 font-bold">{formatOdysseyNumber(playerStats.passiveDps)}/s</strong>
          </span>
        </div>

        <button
          onClick={onOpenCompanions}
          className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>🎒 Compagnons ({Object.keys(state.capturedGames).length}/256)</span>
        </button>
      </div>
    </div>
  );
};
