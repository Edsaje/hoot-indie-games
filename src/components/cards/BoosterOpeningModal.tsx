import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Package, Eye, CheckCircle2, ChevronRight, Scissors, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BoosterOpenResult } from '../../types/cards';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { CardView } from './CardView';

interface BoosterOpeningModalProps {
  isOpen: boolean;
  result: BoosterOpenResult | null;
  onClose: () => void;
  onOpenAnother?: () => void;
  canOpenAnother?: boolean;
}

export const BoosterOpeningModal: React.FC<BoosterOpeningModalProps> = ({
  isOpen,
  result,
  onClose,
  onOpenAnother,
  canOpenAnother = false,
}) => {
  const [openedStep, setOpenedStep] = useState<'sealed' | 'opening' | 'revealing'>('sealed');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const tearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTearSequence = () => {
    try {
      soundFx.playBoosterTear();
    } catch {
      // Ignore audio errors
    }
    setOpenedStep('opening');

    // Explosion de paillettes / confettis dorés au moment précis de la déchirure
    try {
      confetti({
        particleCount: 65,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#f59e0b', '#fbbf24', '#34d399', '#10b981', '#fef08a', '#ffffff'],
        shapes: ['square'],
        scalar: 0.95,
        disableForReducedMotion: false,
      });
    } catch {
      // Ignore
    }

    // Après l'animation physique de déchirure, révéler les cartes
    if (tearTimeoutRef.current) clearTimeout(tearTimeoutRef.current);
    tearTimeoutRef.current = setTimeout(() => {
      try {
        soundFx.playChime();
      } catch {
        // Ignore
      }
      setOpenedStep('revealing');
    }, 1250);
  };

  const handleStartTear = () => {
    if (openedStep !== 'sealed') return;
    startTearSequence();
  };

  // Initialisation à l'état scellé dès l'ouverture du booster (ouverture manuelle par le joueur)
  useEffect(() => {
    if (isOpen && result) {
      setOpenedStep('sealed');
      setRevealedIndices([]);
    }
    return () => {
      if (tearTimeoutRef.current) clearTimeout(tearTimeoutRef.current);
    };
  }, [isOpen, result]);

  useEffect(() => {
    return () => {
      if (tearTimeoutRef.current) clearTimeout(tearTimeoutRef.current);
    };
  }, []);

  if (!isOpen || !result) return null;

  const handleFlipCard = (index: number) => {
    if (revealedIndices.includes(index) || !result?.cards?.[index]) return;

    const cardResult = result.cards[index];
    const isSpecial =
      cardResult?.card?.rarity === 'legendary' ||
      cardResult?.card?.rarity === 'epic' ||
      cardResult?.isHolo;

    try {
      if (isSpecial) {
        soundFx.playVictory();
      } else {
        soundFx.playClick();
      }
    } catch {
      // Audio errors should never crash React
    }

    setRevealedIndices((prev) => [...prev, index]);
  };

  const handleRevealAll = () => {
    try {
      soundFx.playVictory();
    } catch {
      // Audio errors should never crash React
    }
    if (result?.cards) {
      setRevealedIndices(result.cards.map((_, i) => i));
    }
  };

  const cardsCount = result?.cards?.length || 0;
  const allRevealed = cardsCount > 0 && revealedIndices.length >= cardsCount;
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allRevealed && footerRef.current) {
      try {
        footerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch {
        // Ignore scroll errors
      }
    }
  }, [allRevealed]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] overflow-y-auto flex flex-col p-2.5 sm:p-4">
        {/* Backdrop sombre */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (allRevealed) {
              soundFx.playClick();
              onClose();
            }
          }}
          className="fixed inset-0 bg-black/92 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] bg-[#03150f] rounded-none sm:rounded-2xl border-2 border-[#78350f] shadow-2xl shadow-black/95 flex flex-col overflow-hidden z-10 text-slate-100 p-3.5 sm:p-6 m-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <SylvestreIvyFrame density="medium" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-30"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ========================================================= */}
          {/* ETAPE 1 : Le paquet scellé avec son véritable skin foil   */}
          {/* ========================================================= */}
          {openedStep === 'sealed' && (
            <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center select-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {result.isFreeDaily ? 'Booster Quotidien Offert !' : 'Booster du Sanctuaire'}
                </span>
              </div>

              {/* Skin de Booster Métallisé / Foil Pack Authentique */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartTear}
                className="relative w-64 sm:w-72 aspect-[5/7.8] rounded-none cursor-pointer my-3 shadow-2xl shadow-black/90 group flex flex-col justify-between overflow-hidden border-2 border-amber-400/90"
                style={{
                  background: 'linear-gradient(135deg, #0e5a42 0%, #063124 35%, #021811 70%, #010d09 100%)',
                }}
              >
                {/* Reflet métallisé balayant le sachet */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-700 z-20"
                  style={{
                    background:
                      'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.3) 38%, rgba(251,191,36,0.35) 48%, transparent 65%)',
                    backgroundSize: '250% 250%',
                  }}
                />

                {/* --- 1. Sceau crénelé supérieur (Foil Crimp Top) --- */}
                <div className="relative z-10 w-full h-7 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 border-b-2 border-amber-500/80 flex items-center justify-between px-2 overflow-hidden shadow-inner">
                  {/* Dentelure en dents de scie supérieure */}
                  <svg className="absolute top-0 left-0 w-full h-2 text-[#03150f] fill-current" viewBox="0 0 120 6" preserveAspectRatio="none">
                    <path d="M0,0 L3,6 L6,0 L9,6 L12,0 L15,6 L18,0 L21,6 L24,0 L27,6 L30,0 L33,6 L36,0 L39,6 L42,0 L45,6 L48,0 L51,6 L54,0 L57,6 L60,0 L63,6 L66,0 L69,6 L72,0 L75,6 L78,0 L81,6 L84,0 L87,6 L90,0 L93,6 L96,0 L99,6 L102,0 L105,6 L108,0 L111,6 L114,0 L117,6 L120,0 Z" />
                  </svg>
                  <span className="text-[8px] font-black tracking-widest uppercase text-slate-950 font-mono mx-auto mt-1">
                    ★ SCELLÉ DU SANCTUAIRE ★
                  </span>
                </div>

                {/* --- 2. Ligne de déchirure prédécoupée (Tear Strip) --- */}
                <div className="relative z-10 px-3 py-1 flex items-center justify-between border-y border-dashed border-amber-300/70 bg-amber-500/15 group-hover:bg-amber-400/25 transition-colors">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-amber-300 uppercase tracking-widest">
                    <Scissors className="w-3.5 h-3.5 text-amber-400 animate-pulse rotate-90" />
                    <span>Déchirer ici</span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-300/80 uppercase">5 Cartes</span>
                </div>

                {/* --- 3. Corps du sachet avec blason doré --- */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300 drop-shadow">
                    Hoot Indie Games
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    Édition Pépites
                  </h3>

                  {/* Blason Hibou Doré Scellé */}
                  <div className="w-20 h-20 my-3 rounded-none bg-gradient-to-br from-amber-400/30 to-emerald-950/80 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-400/20 group-hover:scale-110 group-hover:rotate-1 transition-transform">
                    🦉
                  </div>

                  <div className="text-xs font-black uppercase text-amber-300 font-mono tracking-wider">
                    5 Cartes Certifiées
                  </div>
                  <div className="text-[10px] text-emerald-200/90 font-semibold mt-0.5">
                    Rare ou supérieure garantie • 5% Holo
                  </div>
                </div>

                {/* --- 4. Sceau crénelé inférieur (Foil Crimp Bottom) --- */}
                <div className="relative z-10 w-full h-7 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 border-t-2 border-amber-500/80 flex items-center justify-between px-2 overflow-hidden shadow-inner">
                  <span className="text-[8px] font-mono text-slate-950 font-bold mx-auto">
                    SÉRIE N°1 • COLLECTION 185
                  </span>
                  {/* Dentelure en dents de scie inférieure */}
                  <svg className="absolute bottom-0 left-0 w-full h-2 text-[#03150f] fill-current" viewBox="0 0 120 6" preserveAspectRatio="none">
                    <path d="M0,6 L3,0 L6,6 L9,0 L12,6 L15,0 L18,6 L21,0 L24,6 L27,0 L30,6 L33,0 L36,6 L39,0 L42,6 L45,0 L48,6 L51,0 L54,6 L57,0 L60,6 L63,0 L66,6 L69,0 L72,6 L75,0 L78,6 L81,0 L84,6 L87,0 L90,6 L93,0 L96,6 L99,0 L102,6 L105,0 L108,6 L111,0 L114,6 L117,0 L120,6 Z" />
                  </svg>
                </div>
              </motion.div>

              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
                <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>Cliquez sur le paquet pour déchirer le sachet et découvrir vos cartes !</span>
              </p>

              <button
                type="button"
                onClick={handleStartTear}
                className="mt-3 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>Déchirer le Booster</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* ETAPE 2 : Déchirure physique du paquet (Tear Animation)   */}
          {/* ========================================================= */}
          {openedStep === 'opening' && (
            <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 text-center overflow-hidden">
              <div className="relative w-64 sm:w-72 aspect-[5/7.8]">
                {/* 1. La bande supérieure qui se déchire et s'envole vers le haut droit */}
                <motion.div
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: [0, 50, 160, 300],
                    y: [0, -25, -60, -110],
                    rotate: [0, 16, 38, 70],
                    opacity: [1, 1, 0.8, 0],
                    scale: [1, 1.05, 0.9, 0.7],
                  }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  className="absolute top-0 left-0 w-full h-[26%] z-30 overflow-hidden border-2 border-amber-400 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 shadow-2xl"
                  style={{
                    clipPath:
                      'polygon(0% 0%, 100% 0%, 100% 70%, 92% 92%, 80% 68%, 70% 90%, 60% 70%, 50% 94%, 40% 72%, 30% 90%, 20% 68%, 10% 90%, 0% 72%)',
                  }}
                >
                  <div className="p-2 text-center text-[8px] font-black text-slate-950 font-mono uppercase tracking-widest mt-1">
                    ★ HOOT SCELLÉ ★
                  </div>
                </motion.div>

                {/* 2. Les cartes qui sortent du sachet avec un faisceau de lumière dorée */}
                <motion.div
                  initial={{ y: 35, scale: 0.8, opacity: 0 }}
                  animate={{
                    y: [35, -15, -45],
                    scale: [0.8, 0.98, 1.05],
                    opacity: [0, 0.9, 1],
                  }}
                  transition={{ duration: 0.85, delay: 0.12, ease: 'easeOut' }}
                  className="absolute inset-x-4 top-8 aspect-[5/7] rounded-none border-2 border-amber-300 bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-500 shadow-2xl shadow-amber-400/80 z-20 flex flex-col items-center justify-center text-slate-950 font-black"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/40 to-white/70 animate-pulse pointer-events-none" />
                  <span className="text-3xl">✨🦉✨</span>
                  <span className="text-xs uppercase font-mono tracking-widest font-black mt-2">
                    5 Pépites Libérées !
                  </span>
                </motion.div>

                {/* 3. La partie inférieure du sachet déchiré qui glisse vers le bas */}
                <motion.div
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    y: [0, 15, 45, 95],
                    opacity: [1, 1, 0.6, 0],
                    scale: [1, 1, 0.95, 0.85],
                  }}
                  transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 w-full h-[80%] z-25 overflow-hidden border-2 border-amber-400/90 shadow-2xl p-4 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(135deg, #0e5a42 0%, #063124 40%, #021811 80%, #010d09 100%)',
                    clipPath:
                      'polygon(0% 28%, 10% 10%, 20% 32%, 30% 10%, 40% 28%, 50% 6%, 60% 30%, 70% 10%, 80% 32%, 90% 8%, 100% 25%, 100% 100%, 0% 100%)',
                  }}
                >
                  <div className="text-center pb-2">
                    <div className="w-12 h-12 mx-auto rounded-none bg-amber-400/20 border border-amber-300 flex items-center justify-center text-2xl mb-1">
                      🦉
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-300">HOOT INDIE GAMES</div>
                  </div>
                </motion.div>
              </div>

              <h3 className="text-lg font-black text-amber-300 mt-6 animate-pulse tracking-wide">
                ⚡ Déchirure du sachet en cours...
              </h3>
            </div>
          )}

          {/* ========================================================= */}
          {/* ETAPE 3 : Révélation des 5 cartes (format rectangulaire)   */}
          {/* ========================================================= */}
          {openedStep === 'revealing' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 sm:mb-4 shrink-0 pr-10 sm:pr-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-none bg-amber-400 text-slate-950">
                      {result.isFreeDaily ? 'Booster Quotidien' : 'Booster Acheté'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {revealedIndices.length} / 5 cartes révélées
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    {allRevealed ? '🎉 Tirage Terminé !' : 'Cliquez sur chaque carte pour la révéler'}
                  </h3>
                </div>

                {!allRevealed && (
                  <button
                    type="button"
                    onClick={handleRevealAll}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tout révéler</span>
                  </button>
                )}
              </div>

              {/* Grid des 5 cartes rectangulaires */}
              <div className="flex-1 overflow-y-auto overscroll-contain pr-1 py-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
                  {result.cards.map((res, index) => {
                    if (!res || !res.card) return null;
                    const isRevealed = revealedIndices.includes(index);

                    return (
                      <motion.div
                        key={res.card.id + index}
                        initial={{ scale: 0.75, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.09, duration: 0.35 }}
                        onClick={() => handleFlipCard(index)}
                        className={`cursor-pointer flex flex-col items-center group ${
                          index === 4 ? 'col-span-2 sm:col-span-1' : ''
                        }`}
                      >
                        <motion.div
                          animate={isRevealed ? { scale: [0.92, 1.06, 1] } : { scale: 1 }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <CardView
                            card={res.card}
                            isFlipped={isRevealed}
                            showBack={!isRevealed}
                            ownership={{
                              count: res.isHolo ? 0 : 1,
                              countHolo: res.isHolo ? 1 : 0,
                            }}
                            size="sm"
                          />
                        </motion.div>

                        {/* Badges sous la carte révélée */}
                        <div className="h-6 mt-1.5 flex items-center gap-1">
                          {isRevealed ? (
                            <>
                              {res.isNew && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-none bg-emerald-500 text-slate-950 animate-bounce">
                                  Nouveau !
                                </span>
                              )}
                              {res.isHolo && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-none bg-cyan-400 text-slate-950">
                                  ✨ Holo
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold font-mono">
                              Carte #{index + 1}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Actions finales lorsque tout est révélé */}
              {allRevealed && (
                <div
                  ref={footerRef}
                  className="shrink-0 mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-[#78350f]/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-300">
                      Ces 5 cartes ont été ajoutées à votre classeur !
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {onOpenAnother && canOpenAnother && (
                      <button
                        type="button"
                        onClick={onOpenAnother}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
                      >
                        <Package className="w-4 h-4" />
                        <span>Ouvrir un autre (150 🪶)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <span>Voir mon classeur</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
