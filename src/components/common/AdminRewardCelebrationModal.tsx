import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Check, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getCardById, createFallbackCard } from '../../data/cardsData';
import { RARITY_CONFIG } from '../../types/cards';
import { acknowledgeAdminReward, type AdminRewardNotification } from '../../services/userCloudSyncService';

export const AdminRewardCelebrationModal: React.FC = () => {
  const [pendingRewards, setPendingRewards] = useState<AdminRewardNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const handleRewardReceived = (e: Event) => {
      const customEvent = e as CustomEvent<AdminRewardNotification[]>;
      if (Array.isArray(customEvent.detail) && customEvent.detail.length > 0) {
        setPendingRewards(customEvent.detail);
        setCurrentIndex(0);
        soundFx.playVictory();
      }
    };

    window.addEventListener('hoot_admin_reward_received', handleRewardReceived);
    return () => {
      window.removeEventListener('hoot_admin_reward_received', handleRewardReceived);
    };
  }, []);

  if (pendingRewards.length === 0 || currentIndex >= pendingRewards.length) {
    return null;
  }

  const currentReward = pendingRewards[currentIndex];
  const card = currentReward.cardId
    ? getCardById(currentReward.cardId) || createFallbackCard(currentReward.cardId)
    : null;
  const cardRarityCfg = card ? RARITY_CONFIG[card.rarity] : null;

  const handleClaim = async () => {
    soundFx.playClick();
    if (currentReward.id) {
      acknowledgeAdminReward(currentReward.id).catch(() => {});
    }

    if (currentIndex + 1 < pendingRewards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPendingRewards([]);
      setCurrentIndex(0);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#162035] via-[#0d1424] to-[#070b14] border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 p-6 md:p-8 text-white z-10 overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-amber-400/25 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Crown Badge */}
          <div className="relative flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3 ring-4 ring-amber-400/30"
            >
              <Crown className="w-9 h-9" />
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Décret Royal du Grand-Duc Hibouxe
            </span>
            <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
              Récompense Souveraine !
            </h2>
            {currentReward.reason && (
              <p className="text-xs text-slate-300 mt-2 italic bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/5">
                « {currentReward.reason} »
              </p>
            )}
          </div>

          {/* Reward Payload Container */}
          <div className="space-y-4 my-6">
            {/* 1. Feathers Reward */}
            {currentReward.feathers > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-inner"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-md">
                  🪶
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Plumes d'Or Créditées
                  </div>
                  <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5">
                    +{currentReward.feathers.toLocaleString()}
                    <span className="text-xs text-amber-400/80 font-normal">Plumes</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Card Reward */}
            {card && cardRarityCfg && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-2xl bg-black/40 border ${cardRarityCfg.borderClass} flex items-center gap-4 relative overflow-hidden`}
              >
                {/* Holo foil animated overlay */}
                {currentReward.isHolo && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-pink-500/20 pointer-events-none animate-pulse" />
                )}

                <div className="w-14 h-18 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative shadow-md">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {currentReward.isHolo && (
                    <div className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded bg-yellow-400 text-slate-950 font-black uppercase">
                      Holo
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${cardRarityCfg.badgeClass}`}
                    >
                      {cardRarityCfg.nameFr}
                    </span>
                    {currentReward.isHolo && (
                      <span className="text-[9px] font-black text-yellow-300 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Holographique
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{card.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{card.developer}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress / Step indicator if multiple */}
          {pendingRewards.length > 1 && (
            <div className="text-center text-[11px] text-slate-400 font-mono mb-4">
              Cadeau {currentIndex + 1} sur {pendingRewards.length}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleClaim}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer"
          >
            {currentIndex + 1 < pendingRewards.length ? (
              <>
                <span>Cadeau Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Merci Hibouxe ! 👑</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
