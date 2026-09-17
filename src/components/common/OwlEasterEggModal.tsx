import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Gamepad2 } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { OwlLogo } from './OwlLogo';

interface OwlEasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArcade?: () => void;
}

export const OwlEasterEggModal: React.FC<OwlEasterEggModalProps> = ({
  isOpen,
  onClose,
  onOpenArcade,
}) => {
  const { t, i18n } = useTranslation();
  const { unlockAchievement } = useAchievements();
  const isFr = i18n.language.startsWith('fr');

  useEffect(() => {
    if (isOpen) {
      unlockAchievement('secret_owl');
    }
  }, [isOpen, unlockAchievement]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-[#131a29] border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-200 text-center overflow-hidden">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Clean Owl Logo in Modal */}
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center p-2 rounded-2xl bg-[#0b0f19] border border-amber-500/30">
          <OwlLogo size="lg" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/15 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {isFr ? 'Secret Dévoilé' : 'Secret Discovered'}
        </div>

        <h3 className="text-xl font-black text-white mb-2 tracking-wide">
          {t('easterEgg.title')}
        </h3>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {t('easterEgg.message')}
        </p>

        <div className="bg-[#0b0f19] border border-[#1e293b] p-3.5 rounded-xl mb-6 text-xs text-slate-300 text-left leading-relaxed">
          <span className="font-bold text-amber-400 block mb-1">
            {isFr ? 'Le saviez-vous ?' : 'Did you know?'}
          </span>
          {isFr
            ? "8 mini-jeux d'arcade rétro conçus par Quentin Beaud sont intégrés directement dans le site à 60 FPS constants, sans quitter la page !"
            : "8 retro arcade mini-games built by Quentin Beaud are playable directly inside the browser at solid 60 FPS!"}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
              onOpenArcade?.();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            {isFr ? "Entrer dans l'Arcade" : 'Open Arcade'}
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
