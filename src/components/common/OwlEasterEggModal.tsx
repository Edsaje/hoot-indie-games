import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, ExternalLink, Gamepad2 } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface OwlEasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwlEasterEggModal: React.FC<OwlEasterEggModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#192338] to-[#131a29] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl text-slate-200 text-center overflow-hidden">
        {/* Amber glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Owl Icon in Modal */}
        <div className="w-20 h-20 mx-auto mb-4 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
          <div className="text-5xl select-none">🦉</div>
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Secret Dévoilé
        </div>

        <h3 className="text-xl font-black text-white mb-2 tracking-wide">
          {t('easterEgg.title')}
        </h3>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {t('easterEgg.message')}
        </p>

        <div className="bg-[#0b0f19]/80 border border-[#1e293b] p-3 rounded-xl mb-6 text-xs text-slate-400 text-left">
          <span className="font-bold text-amber-400 block mb-1">🦉 Note de Lore :</span>
          Les hiboux scrutent la nuit pour dénicher les joyaux indépendants les plus singuliers. Saviez-vous que Quentin Beaud (Hibouxe) a dissimulé une salle d'arcade secrète de 7 jeux sur son portfolio ?
        </div>

        <div className="flex gap-3 justify-center">
          <a
            href="https://quentinbeaud.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            <Gamepad2 className="w-4 h-4" />
            Visiter l'Arcade
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition"
          >
            Retour au Perchoir
          </button>
        </div>
      </div>
    </div>
  );
};
