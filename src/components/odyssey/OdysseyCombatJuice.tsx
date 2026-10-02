import React, { useEffect, useState, useRef } from 'react';
import { formatOdysseyNumber } from '../../services/odysseyEngineService';

export interface SlashEffect {
  id: string;
  x: number;
  y: number;
  angle: number;
  isCrit: boolean;
  createdAt: number;
}

export interface SapOrbParticle {
  id: string;
  tx: number;
  ty: number;
  color: string;
  size: number;
}

/**
 * Superposition des tranchants SVG (Slash Blade FX) au clic
 */
export const OdysseySlashOverlay: React.FC<{ slashes: SlashEffect[] }> = ({ slashes }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {slashes.map((s) => (
        <div
          key={s.id}
          style={
            {
              left: `${s.x}px`,
              top: `${s.y}px`,
              '--slash-angle': `${s.angle}deg`,
            } as React.CSSProperties
          }
          className="absolute -translate-x-1/2 -translate-y-1/2 animate-combat-slash"
        >
          <svg
            viewBox="0 0 140 140"
            className={`${s.isCrit ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-20 h-20 sm:w-28 sm:h-28'}`}
          >
            <defs>
              <linearGradient id={`slash_grad_${s.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="45%" stopColor={s.isCrit ? '#fde047' : '#67e8f9'} stopOpacity="1" />
                <stop offset="100%" stopColor={s.isCrit ? '#ef4444' : '#059669'} stopOpacity="0.85" />
              </linearGradient>
            </defs>
            {/* Arc en croissant de la lame */}
            <path
              d="M 12 128 Q 70 42 128 12 Q 74 68 12 128 Z"
              fill={`url(#slash_grad_${s.id})`}
            />
            {/* Ligne blanche centrale haute vélocité */}
            <path
              d="M 22 118 Q 70 52 118 22"
              stroke="#ffffff"
              strokeWidth={s.isCrit ? '4' : '2.5'}
              strokeLinecap="round"
            />
            {/* Étincelle d'impact centrale */}
            <circle
              cx="70"
              cy="52"
              r={s.isCrit ? '6' : '4'}
              fill={s.isCrit ? '#fef08a' : '#e0f2fe'}
            />
            {/* Éclats de frappe */}
            <line x1="70" y1="52" x2="88" y2="36" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="70" y1="52" x2="52" y2="38" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="70" y1="52" x2="84" y2="68" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </div>
  );
};

/**
 * Superposition d'éclats d'orbes de Sève à la mort d'un monstre
 */
export const OdysseySapBurstOverlay: React.FC<{ particles: SapOrbParticle[] }> = ({ particles }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {particles.map((p) => (
        <div
          key={p.id}
          style={
            {
              left: '50%',
              top: '50%',
              '--orb-tx': `${p.tx}px`,
              '--orb-ty': `${p.ty}px`,
            } as React.CSSProperties
          }
          className="absolute -translate-x-1/2 -translate-y-1/2 animate-sap-burst"
        >
          <div
            className={`rounded-full ${p.color}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: '0 0 10px rgba(56,189,248,0.9)',
            }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Barre de Vie RPG à double couche (Instantanée + Buffer de blessure résiduel)
 */
export const OdysseyHealthBar: React.FC<{
  currentHp: number;
  maxHp: number;
  isBoss: boolean;
  isHit: boolean;
}> = ({ currentHp, maxHp, isBoss, isHit }) => {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const [bufferPercent, setBufferPercent] = useState(hpPercent);
  const prevHpRef = useRef(currentHp);

  useEffect(() => {
    // Si la vie augmente (nouveau monstre), recalage direct sans animation lente
    if (currentHp >= prevHpRef.current) {
      setBufferPercent(hpPercent);
      prevHpRef.current = currentHp;
      return;
    }

    prevHpRef.current = currentHp;

    // Délais de 260ms avant que le tampon résiduel (barre orange/rouge) ne fonde
    const timer = setTimeout(() => {
      setBufferPercent(hpPercent);
    }, 260);

    return () => clearTimeout(timer);
  }, [currentHp, hpPercent]);

  return (
    <div className="w-full max-w-md mx-auto z-10">
      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300 mb-1 px-1">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isBoss ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className={isBoss ? 'text-rose-300' : 'text-slate-300'}>
            {isBoss ? 'PV du Boss' : 'Points de Vie'}
          </span>
        </span>
        <span className="tracking-tight">
          <strong className={isHit ? 'text-amber-300' : 'text-white'}>
            {formatOdysseyNumber(currentHp)}
          </strong>
          <span className="text-slate-500"> / </span>
          <span className="text-slate-400">{formatOdysseyNumber(maxHp)}</span>
        </span>
      </div>

      <div
        className={`relative w-full h-3.5 sm:h-4 rounded-full bg-slate-950/90 border ${
          isHit ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'border-white/20'
        } overflow-hidden shadow-inner p-0.5 transition-colors`}
      >
        {/* 1. Jauge résiduelle de blessure (Buffer Bar rouge/orange) */}
        <div
          style={{ width: `${bufferPercent}%` }}
          className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.6)] transition-all duration-500 ease-out"
        />

        {/* 2. Jauge principale de vie */}
        <div
          style={{ width: `${hpPercent}%` }}
          className={`relative h-full rounded-full transition-all duration-75 ${
            isBoss
              ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
              : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
          }`}
        />

        {/* 3. Flash blanc d'impact au coup */}
        {isHit && (
          <div className="absolute inset-0 bg-white/35 pointer-events-none rounded-full animate-out fade-out duration-150" />
        )}
      </div>
    </div>
  );
};
