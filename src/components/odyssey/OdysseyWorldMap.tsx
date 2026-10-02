import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Sparkles,
  Compass,
  ArrowRight,
  Layers,
  Menu,
} from 'lucide-react';
import type { OdysseySaveState, OdysseyBiomeId, OdysseyRoute } from '../../types/odyssey';
import { ODYSSEY_BIOMES, ODYSSEY_ROUTES } from '../../data/odysseyData';
import {
  formatOdysseyNumber,
  switchBiome,
  switchRoute,
  unlockBiome,
  getCurrentBiome,
  getCurrentRoute,
} from '../../services/odysseyEngineService';
import { getRouteMastery } from '../../data/odysseyRouteDex';
import { soundFx } from '../../utils/audio';
import { OdysseyRouteBurgerMenu } from './OdysseyRouteBurgerMenu';

interface OdysseyWorldMapProps {
  state: OdysseySaveState;
  onStateChange: (newState: OdysseySaveState) => void;
}

// Coordonnées (X, Y) normalisées pour les 5 routes du sentier SVG (sur un canevas 600x340)
const ROUTE_NODE_COORDS = [
  { x: 80, y: 260, label: 'Avant-poste' },
  { x: 190, y: 195, label: 'Sentier Sylvestre' },
  { x: 310, y: 235, label: 'Carrefour des Anciens' },
  { x: 425, y: 155, label: 'Antichambre' },
  { x: 525, y: 85, label: 'Sanctuaire du Boss' },
];

// Tracé SVG doux reliant les 5 jalons
const TRAIL_PATH_D = 'M 80 260 C 130 220, 140 195, 190 195 C 245 195, 260 235, 310 235 C 365 235, 380 160, 425 155 C 465 150, 485 95, 525 85';

export const OdysseyWorldMap: React.FC<OdysseyWorldMapProps> = ({
  state,
  onStateChange,
}) => {
  const [viewMode, setViewMode] = useState<'trail' | 'atlas'>('trail');
  const [inspectedBiomeId, setInspectedBiomeId] = useState<OdysseyBiomeId>(state.currentBiomeId);
  const [hoveredRoute, setHoveredRoute] = useState<OdysseyRoute | null>(null);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  const inspectedBiome = getCurrentBiome(inspectedBiomeId);
  const routesForInspected = ODYSSEY_ROUTES.filter((r) => r.biomeId === inspectedBiomeId);
  const maxRouteUnlocked = state.highestRouteUnlocked[inspectedBiomeId] || 1;

  const handleSelectRoute = (routeNumber: number) => {
    if (routeNumber > maxRouteUnlocked) {
      soundFx.playError();
      return;
    }
    soundFx.playClick();
    let next = state;
    if (state.currentBiomeId !== inspectedBiomeId) {
      next = switchBiome(next, inspectedBiomeId);
    }
    next = switchRoute(next, routeNumber);
    onStateChange(next);
  };

  const handleUnlockBiome = (biomeId: OdysseyBiomeId) => {
    const { success, nextState } = unlockBiome(state, biomeId);
    if (success) {
      soundFx.playVictory();
      setInspectedBiomeId(biomeId);
      onStateChange(nextState);
    } else {
      soundFx.playError();
    }
  };

  // Décors SVG procéduraux thématiques selon le biome
  const renderBiomeSvgScenery = (biomeId: OdysseyBiomeId) => {
    switch (biomeId) {
      case 'biome_1_clearing':
        return (
          <g opacity="0.6">
            {/* Collines d'arrière-plan */}
            <path d="M 0 340 L 0 220 Q 150 140 320 220 T 600 200 L 600 340 Z" fill="#042318" />
            <path d="M 0 340 L 0 260 Q 200 180 400 270 T 600 240 L 600 340 Z" fill="#063826" />
            {/* Arbres stylisés */}
            <polygon points="50,220 35,260 65,260" fill="#0b5e40" />
            <polygon points="120,180 105,225 135,225" fill="#0f7652" />
            <polygon points="250,210 238,245 262,245" fill="#0b5e40" />
            <polygon points="360,170 345,215 375,215" fill="#0f7652" />
            <polygon points="460,130 445,175 475,175" fill="#0b5e40" />
            {/* Rayons solaires dorés */}
            <line x1="550" y1="0" x2="300" y2="340" stroke="#fef08a" strokeWidth="1" opacity="0.12" />
            <line x1="580" y1="0" x2="420" y2="340" stroke="#fef08a" strokeWidth="1.5" opacity="0.1" />
          </g>
        );
      case 'biome_2_pixel_canopy':
        return (
          <g opacity="0.55">
            {/* Grille cyberextrudée */}
            <path d="M 0 240 L 600 240 M 0 280 L 600 280 M 0 320 L 600 320" stroke="#06b6d4" strokeWidth="0.8" opacity="0.2" />
            <line x1="100" y1="200" x2="50" y2="340" stroke="#06b6d4" strokeWidth="0.8" opacity="0.2" />
            <line x1="250" y1="200" x2="220" y2="340" stroke="#06b6d4" strokeWidth="0.8" opacity="0.2" />
            <line x1="400" y1="200" x2="390" y2="340" stroke="#06b6d4" strokeWidth="0.8" opacity="0.2" />
            <line x1="520" y1="200" x2="550" y2="340" stroke="#06b6d4" strokeWidth="0.8" opacity="0.2" />
            {/* Blocs de pixels flottants */}
            <rect x="70" y="160" width="14" height="14" fill="#06b6d4" opacity="0.4" />
            <rect x="230" y="140" width="18" height="18" fill="#3b82f6" opacity="0.35" />
            <rect x="360" y="110" width="12" height="12" fill="#10b981" opacity="0.4" />
            <rect x="470" y="80" width="16" height="16" fill="#06b6d4" opacity="0.5" />
          </g>
        );
      case 'biome_3_crystal_caves':
        return (
          <g opacity="0.6">
            {/* Caverne souterraine et stalactites */}
            <path d="M 0 0 L 600 0 L 600 60 Q 450 110 300 50 T 0 70 Z" fill="#200d35" />
            <polygon points="120,0 110,65 130,0" fill="#7e22ce" opacity="0.6" />
            <polygon points="340,0 330,85 350,0" fill="#a855f7" opacity="0.5" />
            <polygon points="460,0 452,55 468,0" fill="#7e22ce" opacity="0.6" />
            {/* Cristaux au sol */}
            <polygon points="70,290 80,240 90,290" fill="#c084fc" opacity="0.7" />
            <polygon points="260,270 272,210 284,270" fill="#e879f9" opacity="0.6" />
            <polygon points="410,210 420,160 430,210" fill="#c084fc" opacity="0.7" />
            <polygon points="510,130 522,70 534,130" fill="#f0abfc" opacity="0.8" />
          </g>
        );
      case 'biome_4_celestial_summit':
        return (
          <g opacity="0.65">
            {/* Cimes acérées & neige */}
            <polygon points="0,340 100,160 220,340" fill="#0c2340" />
            <polygon points="100,160 80,195 120,195" fill="#bae6fd" />
            <polygon points="180,340 320,120 460,340" fill="#082f49" />
            <polygon points="320,120 295,160 345,160" fill="#e0f2fe" />
            <polygon points="400,340 520,70 600,340" fill="#0c2340" />
            <polygon points="520,70 498,105 542,105" fill="#f0f9ff" />
            {/* Aurore boréale ondulante */}
            <path d="M 0 60 Q 150 110 300 40 T 600 70" fill="none" stroke="#38bdf8" strokeWidth="12" opacity="0.2" filter="blur(4px)" />
            <path d="M 0 50 Q 180 20 360 80 T 600 40" fill="none" stroke="#818cf8" strokeWidth="8" opacity="0.25" filter="blur(3px)" />
          </g>
        );
      case 'biome_5_infernal_abyss':
        return (
          <g opacity="0.65">
            {/* Crêtes volcaniques & lave */}
            <polygon points="0,340 80,180 200,340" fill="#2d0a0a" />
            <polygon points="160,340 300,140 440,340" fill="#3f0e0e" />
            <polygon points="380,340 510,90 600,340" fill="#2d0a0a" />
            {/* Rivière magmatique */}
            <path d="M 0 310 Q 150 280 300 320 T 600 290" fill="none" stroke="#f43f5e" strokeWidth="8" opacity="0.6" filter="blur(2px)" />
            <path d="M 0 310 Q 150 280 300 320 T 600 290" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8" />
          </g>
        );
      case 'biome_6_cosmic_void':
        return (
          <g opacity="0.7">
            {/* Nébuleuse et anneaux orbitaux */}
            <ellipse cx="300" cy="170" rx="260" ry="80" fill="none" stroke="#c084fc" strokeWidth="2" opacity="0.2" transform="rotate(-15 300 170)" />
            <ellipse cx="300" cy="170" rx="180" ry="50" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.25" transform="rotate(-15 300 170)" />
            {/* Étoiles lointaines */}
            <circle cx="80" cy="70" r="1.5" fill="#ffffff" opacity="0.7" />
            <circle cx="210" cy="40" r="2" fill="#fef08a" opacity="0.8" />
            <circle cx="390" cy="60" r="1.5" fill="#ffffff" opacity="0.6" />
            <circle cx="480" cy="30" r="2.5" fill="#a855f7" opacity="0.7" />
            <circle cx="560" cy="110" r="1.5" fill="#38bdf8" opacity="0.8" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#041a12]/95 border-2 border-[#78350f] rounded-3xl p-3 sm:p-4 md:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden select-none">
      {/* 1. Barre d'outils cartographique supérieure : Sélecteur des 6 Royaumes & Menu Burger */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                Carte du Monde
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Monde {inspectedBiome.index}/6
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white line-clamp-1">{inspectedBiome.name}</h3>
          </div>
        </div>

        {/* Boutons d'affichage : Menu Burger des Routes & Sentier/Atlas */}
        <div className="flex items-center gap-2">
          {/* Bouton Menu Burger Principal */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsBurgerOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Menu complet pour changer de route et de biome"
          >
            <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Routes</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-950/20 font-black">
              R{state.currentRouteNumber}
            </span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('trail');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'trail'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Sentier</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('atlas');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'atlas'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Atlas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mini-ruban sélecteur rapide des 6 Biomes */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 scrollbar-thin">
        {ODYSSEY_BIOMES.map((b) => {
          const isUnlocked = b.index <= state.highestBiomeUnlocked;
          const isInspected = b.id === inspectedBiomeId;
          const isCurrentActive = b.id === state.currentBiomeId;

          return (
            <button
              key={b.id}
              onClick={() => {
                soundFx.playClick();
                setInspectedBiomeId(b.id);
                if (viewMode === 'atlas') setViewMode('trail');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                isInspected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                  : isUnlocked
                  ? 'bg-slate-900/90 text-slate-300 hover:text-white border-white/10 hover:bg-slate-800'
                  : 'bg-slate-950/60 text-slate-600 border-white/5 opacity-70'
              }`}
            >
              {isUnlocked ? (
                <span className="text-[10px]">{b.index}.</span>
              ) : (
                <Lock className="w-2.5 h-2.5 text-slate-500" />
              )}
              <span>{b.name.replace(/^(La |Le |Les )/, '')}</span>
              {isCurrentActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Vue 1 : Le Sentier Cartographique SVG Réel (Routes 1 à 5 agrandi) */}
      {viewMode === 'trail' && (
        <div className="relative w-full aspect-[600/350] min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] max-h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-[#02100a] shadow-inner mb-3">
          {/* Fond cartographique SVG interactif */}
          <svg
            viewBox="0 0 600 350"
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Filtre de lueur dorée pour la balise active */}
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Lueur pour le sentier */}
              <linearGradient id="trail-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Décors du paysage */}
            {renderBiomeSvgScenery(inspectedBiomeId)}

            {/* Lignes topographiques décoratives */}
            <path
              d="M 20 280 Q 200 240 400 300 T 580 260"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
              opacity="0.08"
            />
            <path
              d="M 40 220 Q 250 160 420 200 T 560 170"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
              opacity="0.06"
            />

            {/* Le Sentier de Terre / Route de Marche SVG */}
            {/* Ligne d'ombre de fond */}
            <path
              d={TRAIL_PATH_D}
              fill="none"
              stroke="#010805"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Tracé principal */}
            <path
              d={TRAIL_PATH_D}
              fill="none"
              stroke="url(#trail-gradient)"
              strokeWidth="3.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="animate-pulse"
              opacity="0.85"
            />

            {/* Les 5 Jalons Cartographiques de Route */}
            {routesForInspected.map((route, idx) => {
              const coords = ROUTE_NODE_COORDS[idx] || { x: 100, y: 100, label: route.name };
              const rNum = route.routeNumber;
              const isBoss = route.isBossRoute;
              const isUnlocked = rNum <= maxRouteUnlocked;
              const isCurrent =
                state.currentBiomeId === inspectedBiomeId && state.currentRouteNumber === rNum;
              const isHovered = hoveredRoute?.id === route.id;
              const kills = (state.routeKills && state.routeKills[route.id]) || 0;
              const mastery = getRouteMastery(route.id, state.capturedGames);

              // Rayon adaptatif centré (s'agrandit en douceur au survol SANS déplacement de coordonnées)
              const baseRadius = isBoss ? 17 : 14;
              const radius = isHovered ? baseRadius + 3 : baseRadius;

              return (
                <g
                  key={route.id}
                  className="cursor-pointer select-none group"
                  onClick={() => handleSelectRoute(rNum)}
                  onMouseEnter={() => setHoveredRoute(route)}
                  onMouseLeave={() => setHoveredRoute(null)}
                >
                  {/* Halo de pulsation radar fluide pour la route active (deux ondes concentriques centrées) */}
                  {isCurrent && (
                    <>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={baseRadius}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      >
                        <animate
                          attributeName="r"
                          values={`${baseRadius};${baseRadius + 14}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={baseRadius}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                      >
                        <animate
                          attributeName="r"
                          values={`${baseRadius};${baseRadius + 14}`}
                          begin="1s"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0"
                          begin="1s"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {/* Disque extérieur du jalon */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={radius}
                    fill={
                      isCurrent
                        ? '#f59e0b'
                        : isUnlocked
                        ? isHovered
                          ? '#0d4a36'
                          : '#062e22'
                        : '#0a100d'
                    }
                    stroke={
                      isHovered
                        ? '#fef08a'
                        : isCurrent
                        ? '#fef08a'
                        : isUnlocked
                        ? isBoss
                          ? '#f43f5e'
                          : '#10b981'
                        : '#334155'
                    }
                    strokeWidth={isHovered ? 3.5 : isCurrent ? 3 : 2}
                    filter={isCurrent || isHovered ? 'url(#glow-gold)' : undefined}
                    className="transition-all duration-150"
                  />

                  {/* Numéro ou icône centrale */}
                  {isBoss ? (
                    <text
                      x={coords.x}
                      y={coords.y + 4}
                      textAnchor="middle"
                      fontSize={isHovered ? '11' : '10'}
                      fill={isCurrent ? '#020617' : '#f43f5e'}
                      fontWeight="900"
                      className="transition-all duration-150"
                    >
                      👑
                    </text>
                  ) : (
                    <text
                      x={coords.x}
                      y={coords.y + 3.5}
                      textAnchor="middle"
                      fontSize={isHovered ? '11' : '10'}
                      fontFamily="monospace"
                      fontWeight="900"
                      fill={isCurrent ? '#020617' : isUnlocked ? '#ffffff' : '#64748b'}
                      className="transition-all duration-150"
                    >
                      {rNum}
                    </text>
                  )}

                  {/* Badge Étoile d'or de Maîtrise 100% */}
                  {mastery.isMastered && (
                    <text
                      x={coords.x + 11}
                      y={coords.y - 8}
                      fontSize="9"
                      fill="#eab308"
                      fontWeight="bold"
                    >
                      ★
                    </text>
                  )}

                  {/* Cadenas si verrouillé */}
                  {!isUnlocked && (
                    <text
                      x={coords.x}
                      y={coords.y + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#94a3b8"
                    >
                      🔒
                    </text>
                  )}

                  {/* Étiquette cartographique sous le jalon */}
                  <rect
                    x={coords.x - 30}
                    y={coords.y + (isBoss ? 19 : 16)}
                    width="60"
                    height="14"
                    rx="4"
                    fill={isHovered ? '#0f172a' : '#020617'}
                    stroke={isHovered ? '#f59e0b' : 'transparent'}
                    strokeWidth="0.8"
                    opacity="0.9"
                    className="transition-all duration-150"
                  />
                  <text
                    x={coords.x}
                    y={coords.y + (isBoss ? 29 : 26)}
                    textAnchor="middle"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={isHovered ? '#fef08a' : isCurrent ? '#fbbf24' : isUnlocked ? '#cbd5e1' : '#64748b'}
                    className="transition-all duration-150"
                  >
                    {isUnlocked ? (isBoss ? 'BOSS R5' : `R${rNum} (${kills})`) : 'VERROUILLÉ'}
                  </text>

                  {/* Balise animée de présence "VOUS ÊTES ICI" avec Mascotte Hoot (flottement doux centré) */}
                  {isCurrent && (
                    <g transform={`translate(${coords.x}, ${coords.y - 28})`}>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values={`${coords.x} ${coords.y - 32}; ${coords.x} ${coords.y - 25}; ${coords.x} ${coords.y - 32}`}
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                      {/* Bulle d'indication */}
                      <rect
                        x="-36"
                        y="-16"
                        width="72"
                        height="16"
                        rx="8"
                        fill="#f59e0b"
                        stroke="#fef08a"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-5"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="900"
                        fill="#020617"
                        fontFamily="monospace"
                      >
                        🦉 VOUS ÊTES ICI
                      </text>
                      {/* Petite flèche pointant vers le bas */}
                      <polygon points="-4,0 4,0 0,4" fill="#f59e0b" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Rose des Vents décorative dans le coin inférieur gauche */}
            <g transform="translate(42, 42)" opacity="0.45">
              <circle cx="0" cy="0" r="18" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
              <polygon points="0,-16 3,-3 16,0 3,3 0,16 -3,3 -16,0 -3,-3" fill="#f59e0b" />
              <text x="0" y="-19" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fef08a">N</text>
              <text x="19" y="2" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fef08a">E</text>
              <text x="0" y="25" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fef08a">S</text>
              <text x="-20" y="2" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fef08a">O</text>
            </g>
          </svg>

          {/* Info-bulle / Cartouche flottant au survol d'une route */}
          {hoveredRoute && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/90 border border-amber-500/50 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between text-xs z-20 pointer-events-none animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold font-mono">
                  R{hoveredRoute.routeNumber}
                </div>
                <div>
                  <div className="font-black text-white">{hoveredRoute.name}</div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    Niveau conseillé : Lvl {hoveredRoute.monsterLevel} • PV de base : {formatOdysseyNumber(hoveredRoute.baseHp)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {hoveredRoute.isBossRoute ? '⚠️ Boss Chronométré 30s' : `Accès : ${hoveredRoute.requiredKillsToAdvance} vaincus`}
                </span>
              </div>
            </div>
          )}

          {/* Barre de synthèse & action de route active sous la carte */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-black/40 border border-white/10 mt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-mono font-bold text-xs shrink-0">
                R{state.currentRouteNumber}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate">
                  {getCurrentRoute(state.currentBiomeId, state.currentRouteNumber).name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span>{getCurrentBiome(state.currentBiomeId).name}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">
                    {(state.routeKills && state.routeKills[getCurrentRoute(state.currentBiomeId, state.currentRouteNumber).id]) || 0} vaincus
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setIsBurgerOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto active:scale-95 shadow-sm"
            >
              <Menu className="w-3.5 h-3.5 text-amber-400" />
              <span>Changer de route</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Vue 2 : Atlas des 6 Mondes (Aperçu macroscopique & Déverrouillage) */}
      {viewMode === 'atlas' && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 py-1">
          {ODYSSEY_BIOMES.map((biome) => {
            const isUnlocked = biome.index <= state.highestBiomeUnlocked;
            const isCurrent = state.currentBiomeId === biome.id;
            const isNextToUnlock = biome.index === state.highestBiomeUnlocked + 1;
            const canUnlock = isNextToUnlock && state.starSap >= biome.unlockRequirement.starSapCost;
            const maxRoute = state.highestRouteUnlocked[biome.id] || 1;

            return (
              <div
                key={biome.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
                    : isUnlocked
                    ? 'bg-[#06241b] border-white/10 hover:border-amber-500/40'
                    : 'bg-slate-950/70 border-white/5 opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                      Monde {biome.index}/6
                    </span>
                    {isCurrent ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950">
                        Actif
                      </span>
                    ) : isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white mb-0.5">{biome.name}</h4>
                  <p className="text-[11px] text-amber-200/80 italic mb-2 line-clamp-1">{biome.tagline}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {isUnlocked ? `Routes : ${maxRoute}/5` : `${formatOdysseyNumber(biome.unlockRequirement.starSapCost)} Sève`}
                  </span>

                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setInspectedBiomeId(biome.id);
                        setViewMode('trail');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Sentier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : isNextToUnlock ? (
                    <button
                      disabled={!canUnlock}
                      onClick={() => handleUnlockBiome(biome.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                        canUnlock
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <span>Débloquer</span>
                      <Sparkles className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500">Scellé</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modale / Tiroir burger des routes & biomes */}
      <OdysseyRouteBurgerMenu
        isOpen={isBurgerOpen}
        onClose={() => setIsBurgerOpen(false)}
        state={state}
        onStateChange={onStateChange}
      />
    </div>
  );
};
