import React from 'react';
import {
  Volume2,
  Volume1,
  VolumeX,
  Sparkles,
  Music,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useAudioSettings, soundFx } from '../../../utils/audio';

export const ProfileAudioTab: React.FC = () => {
  const {
    soundEnabled,
    masterVolume,
    sfxVolume,
    musicVolume,
    toggleSound,
    setSoundEnabled,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    resetVolumes,
    playTestSfx,
    playOwlHoot,
    playSlash,
    playChime,
  } = useAudioSettings();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Carte Principale : Volume Global & Sourdine */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-[#06241b] via-[#041d16] to-[#010805] border border-emerald-500/40 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                soundEnabled && masterVolume > 0
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800/60 border-2 border-slate-700 text-slate-500'
              }`}
            >
              {soundEnabled && masterVolume > 0 ? (
                masterVolume > 0.4 ? (
                  <Volume2 className="w-6 h-6" />
                ) : (
                  <Volume1 className="w-6 h-6" />
                )
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white tracking-wide">
                  Volume Général du Sanctuaire
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    soundEnabled && masterVolume > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {soundEnabled && masterVolume > 0 ? 'ACTIF' : 'SOURDINE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Contrôle tous les synthétiseurs Web Audio, extraits de blind-test et bruitages.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = toggleSound();
              if (next) playChime();
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border cursor-pointer touch-manipulation self-start sm:self-auto ${
              soundEnabled
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            aria-label={soundEnabled ? 'Mettre le son en sourdine' : 'Réactiver le son'}
          >
            {soundEnabled ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Couper le son</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Activer le son</span>
              </>
            )}
          </button>
        </div>

        {/* Curseur Volume Général */}
        <div className="pt-2 border-t border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <label htmlFor="master-volume-input" className="text-slate-200">
              Niveau sonore principal
            </label>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {soundEnabled ? `${Math.round(masterVolume * 100)}%` : '0% (Coupé)'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <input
              id="master-volume-input"
              type="range"
              min="0"
              max="100"
              step="1"
              value={soundEnabled ? Math.round(masterVolume * 100) : 0}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                if (!soundEnabled && val > 0) {
                  setSoundEnabled(true);
                }
                setMasterVolume(val);
              }}
              aria-label="Volume principal du site"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={soundEnabled ? Math.round(masterVolume * 100) : 0}
              aria-valuetext={`${soundEnabled ? Math.round(masterVolume * 100) : 0}%`}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Curseurs Détaillés par Canal (SFX vs Musique) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Canal Effets Sonores (SFX) */}
        <div className="p-4 bg-[#101c2b] border border-[#1e293b] rounded-2xl space-y-3 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Bruitages & Effets (SFX)</div>
                <div className="text-[10px] text-slate-400">Clics, taillades, récolte & victoires</div>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <label htmlFor="sfx-volume-input" className="sr-only">
              Volume des effets sonores
            </label>
            <input
              id="sfx-volume-input"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(sfxVolume * 100)}
              onChange={(e) => {
                setSfxVolume(Number(e.target.value) / 100);
              }}
              aria-label="Volume des effets sonores"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sfxVolume * 100)}
              aria-valuetext={`${Math.round(sfxVolume * 100)}%`}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Boutons d'échantillon sonore */}
          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tester :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => playTestSfx()}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition border border-slate-700 cursor-pointer touch-manipulation"
                title="Tester le son de succès (Ding)"
              >
                🔔 Ding
              </button>
              <button
                type="button"
                onClick={() => playSlash()}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition border border-slate-700 cursor-pointer touch-manipulation"
                title="Tester le son de frappe tranchante"
              >
                ⚔️ Slash
              </button>
              <button
                type="button"
                onClick={() => playOwlHoot()}
                className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-semibold transition border border-amber-500/30 cursor-pointer touch-manipulation"
                title="Tester le hoot du hibou"
              >
                🦉 Hoot
              </button>
            </div>
          </div>
        </div>

        {/* Canal Musique / Blind-Test */}
        <div className="p-4 bg-[#101c2b] border border-[#1e293b] rounded-2xl space-y-3 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Musique & Blind-Test</div>
                <div className="text-[10px] text-slate-400">Extraits MP3 et mélodies rétro</div>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <label htmlFor="music-volume-input" className="sr-only">
              Volume de la musique
            </label>
            <input
              id="music-volume-input"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(musicVolume * 100)}
              onChange={(e) => {
                setMusicVolume(Number(e.target.value) / 100);
              }}
              aria-label="Volume de la musique et du blind-test"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(musicVolume * 100)}
              aria-valuetext={`${Math.round(musicVolume * 100)}%`}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />
          </div>

          {/* Boutons d'échantillon musique */}
          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tester :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => playChime()}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition border border-slate-700 cursor-pointer touch-manipulation"
                title="Tester la cloche harmonique"
              >
                🎵 Chime
              </button>
              <button
                type="button"
                onClick={() => soundFx.playKonamiJingle()}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-semibold transition border border-cyan-500/30 cursor-pointer touch-manipulation"
                title="Tester la fanfare 8-bit rétro"
              >
                🕹️ 8-bit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer d'information et réinitialisation */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-[11px]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Préférences audio mémorisées dans le navigateur.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            resetVolumes();
            playTestSfx();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer touch-manipulation shrink-0"
          title="Rétablir les volumes par défaut (Master 80%, SFX 80%, Musique 70%)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Réinitialiser par défaut</span>
        </button>
      </div>
    </div>
  );
};
