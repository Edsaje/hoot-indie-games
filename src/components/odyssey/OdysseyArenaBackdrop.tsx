import React from 'react';

interface OdysseyArenaBackdropProps {
  biomeId: string;
  isBoss: boolean;
}

export const OdysseyArenaBackdrop: React.FC<OdysseyArenaBackdropProps> = ({
  biomeId,
  isBoss,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* -------------------------------------------------------------
          1. LA CLAIRIÈRE DES PREMIERS PAS (Forêt ancienne, rayons solaires & spores)
          ------------------------------------------------------------- */}
      {biomeId === 'biome_1_clearing' && (
        <div className="absolute inset-0">
          {/* Rayons volumétriques de lumière solaire (God Rays) */}
          <div
            className="absolute -top-20 -left-10 w-[140%] h-[150%] origin-top-left animate-god-rays opacity-25"
            style={{
              background:
                'repeating-linear-gradient(65deg, rgba(251,191,36,0.35) 0px, rgba(251,191,36,0.35) 25px, transparent 25px, transparent 65px)',
              maskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
            }}
          />

          {/* Arbres lointains en silhouette SVG */}
          <svg
            className="absolute bottom-0 left-0 w-full h-44 text-[#01140d]/70 fill-current"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
          >
            {/* Troncs et canopées d'arrière-plan */}
            <path d="M 0 300 L 0 180 Q 60 160 120 190 Q 200 130 280 180 Q 380 140 450 195 Q 560 130 650 185 Q 750 145 840 190 Q 930 150 1000 180 L 1000 300 Z" opacity="0.6" />
            <path d="M 0 300 L 0 210 Q 90 190 180 230 Q 300 180 400 220 Q 520 185 640 225 Q 780 190 890 230 Q 950 200 1000 220 L 1000 300 Z" opacity="0.9" />
            {/* Fougères et monticules au sol */}
            <path d="M 0 300 Q 250 260 500 285 Q 750 260 1000 300 Z" fill="#021a11" />
          </svg>

          {/* Spores / Lucioles flottantes organiques */}
          <div className="absolute inset-0">
            {[
              { left: '15%', top: '28%', delay: '0s', dur: '4.5s', size: 'w-1.5 h-1.5', color: 'bg-emerald-300' },
              { left: '32%', top: '65%', delay: '1.2s', dur: '6s', size: 'w-2 h-2', color: 'bg-amber-300' },
              { left: '55%', top: '22%', delay: '2.5s', dur: '5s', size: 'w-1.5 h-1.5', color: 'bg-emerald-400' },
              { left: '72%', top: '48%', delay: '0.8s', dur: '4.2s', size: 'w-2 h-2', color: 'bg-lime-300' },
              { left: '88%', top: '35%', delay: '3.1s', dur: '5.5s', size: 'w-1.5 h-1.5', color: 'bg-amber-200' },
              { left: '44%', top: '78%', delay: '1.8s', dur: '4.8s', size: 'w-1 h-1', color: 'bg-emerald-300' },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`absolute rounded-full ${p.size} ${p.color} blur-[0.5px] animate-pulse`}
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.dur,
                  boxShadow: '0 0 10px rgba(52,211,153,0.8)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          2. LA CANOPÉE DES PIXELS (Synthwave rétro, grille 3D & pluie de bits)
          ------------------------------------------------------------- */}
      {biomeId === 'biome_2_pixel_canopy' && (
        <div className="absolute inset-0">
          {/* Grille de sol 3D en perspective */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[180%] h-48 opacity-25"
            style={{
              perspective: '300px',
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(6,182,212,0.4) 100%), repeating-linear-gradient(90deg, rgba(6,182,212,0.3) 0px, rgba(6,182,212,0.3) 2px, transparent 2px, transparent 36px), repeating-linear-gradient(0deg, rgba(6,182,212,0.3) 0px, rgba(6,182,212,0.3) 2px, transparent 2px, transparent 24px)',
              transform: 'rotateX(62deg)',
              transformOrigin: 'bottom center',
              maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
            }}
          />

          {/* Arbres Pixel Art étagés en fond */}
          <svg
            className="absolute bottom-6 left-0 w-full h-36 text-cyan-950/70 fill-current"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
          >
            {/* Silhouettes de pins pixel art */}
            <path d="M 40 200 L 40 140 L 20 140 L 20 110 L 0 110 L 50 40 L 100 110 L 80 110 L 80 140 L 60 140 L 60 200 Z" opacity="0.6" />
            <path d="M 220 200 L 220 130 L 195 130 L 195 95 L 170 95 L 230 25 L 290 95 L 265 95 L 265 130 L 240 130 L 240 200 Z" opacity="0.75" />
            <path d="M 580 200 L 580 135 L 555 135 L 555 100 L 530 100 L 590 30 L 650 100 L 625 100 L 625 135 L 600 135 L 600 200 Z" opacity="0.7" />
            <path d="M 740 200 L 740 145 L 720 145 L 720 115 L 700 115 L 750 50 L 800 115 L 780 115 L 780 145 L 760 145 L 760 200 Z" opacity="0.5" />
          </svg>

          {/* Particules carrées pixelisées qui tombent doucement */}
          <div className="absolute inset-0">
            {[
              { left: '12%', delay: '0s', dur: '3.5s', bg: 'bg-cyan-400' },
              { left: '26%', delay: '1.4s', dur: '4.2s', bg: 'bg-amber-400' },
              { left: '42%', delay: '0.6s', dur: '3.1s', bg: 'bg-cyan-300' },
              { left: '60%', delay: '2.1s', dur: '4.8s', bg: 'bg-teal-300' },
              { left: '78%', delay: '1.1s', dur: '3.8s', bg: 'bg-cyan-400' },
              { left: '91%', delay: '2.8s', dur: '4.4s', bg: 'bg-amber-300' },
            ].map((pix, idx) => (
              <div
                key={idx}
                className={`absolute top-0 w-1.5 h-1.5 ${pix.bg} shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse`}
                style={{
                  left: pix.left,
                  animation: `pixelGlitchFall ${pix.dur} linear infinite`,
                  animationDelay: pix.delay,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          3. LES GROTTES DE SILICE (Stalactites, cristaux luminescents & eau)
          ------------------------------------------------------------- */}
      {biomeId === 'biome_3_crystal_caves' && (
        <div className="absolute inset-0">
          {/* Stalactites rocheuses suspendues au plafond */}
          <svg
            className="absolute top-0 left-0 w-full h-24 text-purple-950/80 fill-current"
            viewBox="0 0 800 120"
            preserveAspectRatio="none"
          >
            <path d="M 0 0 L 0 50 L 30 110 L 60 40 L 95 90 L 130 30 L 170 120 L 210 40 L 260 85 L 300 20 L 350 100 L 400 35 L 450 75 L 500 25 L 550 115 L 600 45 L 660 95 L 720 30 L 760 80 L 800 20 L 800 0 Z" />
          </svg>

          {/* Cristaux géants bioluminescents sur les parois latérales */}
          <div className="absolute bottom-4 left-3 w-16 h-28 opacity-75">
            <div className="w-5 h-20 bg-gradient-to-t from-purple-800 to-cyan-300 rotate-[-18deg] rounded-t-sm shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse" />
            <div className="w-4 h-14 bg-gradient-to-t from-purple-900 to-purple-300 rotate-[8deg] -mt-10 ml-5 rounded-t-sm shadow-[0_0_12px_rgba(147,51,234,0.7)]" />
          </div>

          <div className="absolute bottom-4 right-3 w-16 h-28 opacity-75 flex justify-end">
            <div className="w-5 h-24 bg-gradient-to-t from-purple-800 to-purple-300 rotate-[15deg] rounded-t-sm shadow-[0_0_18px_rgba(168,85,247,0.8)] animate-pulse" />
            <div className="w-4 h-16 bg-gradient-to-t from-purple-950 to-cyan-400 rotate-[-12deg] -mt-10 mr-4 rounded-t-sm shadow-[0_0_12px_rgba(6,182,212,0.7)]" />
          </div>

          {/* Miroir d'eau souterraine avec réfraction lumineuse au sol */}
          <div
            className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-t from-purple-900/40 via-cyan-950/20 to-transparent"
            style={{
              maskImage: 'linear-gradient(to top, black, transparent)',
              WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
            }}
          >
            <div className="w-full h-0.5 bg-cyan-400/30 blur-[1px] absolute top-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          4. LE SOMMET CÉLESTE (Pics enneigés, aurore boréale & neige)
          ------------------------------------------------------------- */}
      {biomeId === 'biome_4_celestial_summit' && (
        <div className="absolute inset-0">
          {/* Aurore Boréale ondulante dans le ciel */}
          <div
            className="absolute top-0 -left-20 w-[140%] h-40 animate-aurora-wave"
            style={{
              background:
                'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(168,85,247,0.35) 45%, rgba(56,189,248,0.2) 80%, transparent 100%)',
              filter: 'blur(16px)',
              maskImage: 'radial-gradient(ellipse at top center, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at top center, black 40%, transparent 80%)',
            }}
          />

          {/* Pics rocheux polygonaux en silhouette */}
          <svg
            className="absolute bottom-0 left-0 w-full h-44 text-slate-950/80 fill-current"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
          >
            {/* Montagnes d'arrière-plan */}
            <polygon points="0,300 0,190 140,80 260,200 420,50 580,210 750,90 890,200 1000,120 1000,300" opacity="0.5" />
            {/* Cimes enneigées au premier plan */}
            <polygon points="0,300 0,230 180,120 340,240 500,100 660,230 820,110 1000,220 1000,300" opacity="0.85" />
            <polygon points="170,120 180,120 200,140 185,145 170,135" fill="#e0f2fe" opacity="0.6" />
            <polygon points="490,100 500,100 520,120 505,125 490,115" fill="#e0f2fe" opacity="0.7" />
            <polygon points="810,110 820,110 840,130 825,135 810,125" fill="#e0f2fe" opacity="0.6" />
          </svg>

          {/* Flocons de neige cristallins qui voltigent */}
          <div className="absolute inset-0">
            {[
              { left: '18%', top: '20%', size: 'w-1.5 h-1.5', delay: '0s', dur: '4s' },
              { left: '35%', top: '55%', size: 'w-1 h-1', delay: '1.2s', dur: '5s' },
              { left: '52%', top: '30%', size: 'w-2 h-2', delay: '2s', dur: '3.8s' },
              { left: '68%', top: '70%', size: 'w-1.5 h-1.5', delay: '0.7s', dur: '4.6s' },
              { left: '84%', top: '40%', size: 'w-1 h-1', delay: '2.5s', dur: '5.2s' },
            ].map((f, i) => (
              <div
                key={i}
                className={`absolute rounded-full ${f.size} bg-sky-200/80 shadow-[0_0_8px_rgba(224,242,254,0.9)] animate-pulse`}
                style={{
                  left: f.left,
                  top: f.top,
                  animationDelay: f.delay,
                  animationDuration: f.dur,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. LE GOUFFRE DES ENFERS (Magma, roches basaltiques & braises)
          ------------------------------------------------------------- */}
      {biomeId === 'biome_5_infernal_abyss' && (
        <div className="absolute inset-0">
          {/* Lueurs ardentes de magma au sol */}
          <div
            className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-rose-600/40 via-amber-600/20 to-transparent animate-pulse"
            style={{ animationDuration: '3s' }}
          />

          {/* Piliers volcaniques et arches basaltiques en silhouette */}
          <svg
            className="absolute bottom-0 left-0 w-full h-40 text-[#120202]/90 fill-current"
            viewBox="0 0 800 250"
            preserveAspectRatio="none"
          >
            <path d="M 0 250 L 0 90 L 40 110 L 80 80 L 120 220 L 220 220 L 270 120 L 320 140 L 360 110 L 410 230 L 520 230 L 570 90 L 620 120 L 660 70 L 710 220 L 800 130 L 800 250 Z" />
          </svg>

          {/* Braises et étincelles incandescentes montantes */}
          <div className="absolute inset-0">
            {[
              { left: '15%', delay: '0s', dur: '2.8s', bg: 'bg-amber-400', size: 'w-1.5 h-1.5' },
              { left: '28%', delay: '1.1s', dur: '3.4s', bg: 'bg-rose-500', size: 'w-2 h-2' },
              { left: '48%', delay: '0.4s', dur: '2.5s', bg: 'bg-orange-400', size: 'w-1.5 h-1.5' },
              { left: '68%', delay: '1.7s', dur: '3.2s', bg: 'bg-amber-300', size: 'w-1 h-1' },
              { left: '85%', delay: '0.8s', dur: '2.9s', bg: 'bg-rose-400', size: 'w-2 h-2' },
            ].map((emb, idx) => (
              <div
                key={idx}
                className={`absolute bottom-0 rounded-full ${emb.size} ${emb.bg} shadow-[0_0_10px_rgba(244,63,94,0.9)]`}
                style={{
                  left: emb.left,
                  animation: `emberAscent ${emb.dur} ease-out infinite`,
                  animationDelay: emb.delay,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          6. LE SANCTUAIRE DU NÉANT (Nébuleuse cosmique, anneaux stellaires)
          ------------------------------------------------------------- */}
      {biomeId === 'biome_6_cosmic_void' && (
        <div className="absolute inset-0">
          {/* Cœur nébulaire tourbillonnant */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-40 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(147,51,234,0.3) 50%, transparent 80%)',
            }}
          />

          {/* Anneau orbital stellaire 1 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-dashed border-amber-400/25 animate-cosmic-ring"
            style={{
              transform: 'translate(-50%, -50%) rotateX(65deg)',
            }}
          >
            <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
          </div>

          {/* Anneau orbital stellaire 2 inversé */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-dotted border-purple-400/20 animate-cosmic-ring-reverse"
            style={{
              transform: 'translate(-50%, -50%) rotateY(55deg) rotateX(30deg)',
            }}
          >
            <div className="absolute top-1/2 -left-1.5 w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
          </div>

          {/* Étoiles scintillantes */}
          <div className="absolute inset-0">
            {[
              { left: '12%', top: '22%', dur: '2.5s' },
              { left: '28%', top: '75%', dur: '3.8s' },
              { left: '46%', top: '15%', dur: '2.1s' },
              { left: '74%', top: '35%', dur: '3.2s' },
              { left: '88%', top: '68%', dur: '2.9s' },
            ].map((st, idx) => (
              <div
                key={idx}
                className="absolute w-1 h-1 rounded-full bg-amber-200 animate-ping"
                style={{
                  left: st.left,
                  top: st.top,
                  animationDuration: st.dur,
                  boxShadow: '0 0 6px rgba(251,191,36,0.9)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          AURA SPÉCIALE BOSS DE ROUTE (Si Route 5)
          ------------------------------------------------------------- */}
      {isBoss && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Vignette pulsante de tension */}
          <div
            className="absolute inset-0 shadow-[inset_0_0_60px_rgba(225,29,72,0.45)] animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          {/* Poussières d'énergie dorée sur les bords */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />
        </div>
      )}
    </div>
  );
};
