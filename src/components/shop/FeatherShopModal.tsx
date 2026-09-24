import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ShoppingBag,
  Zap,
  Check,
  Shield,
  Crown,
  Lock,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { useAchievements } from '../../context/useAchievements';
import { useUserAccount } from '../../context/useUserAccount';
import {
  SHOP_TITLES,
  SHOP_FRAMES,
  EXPRESS_RENAME_COST,
  DAILY_GAME_FEATHER_REWARD,
  DAILY_GRAND_SLAM_BONUS,
  formatFeathers,
} from '../../utils/featherEconomy';
import { INDIE_AVATARS } from '../../data/avatars';
import type { IndieAvatarId } from '../../types/user';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

interface FeatherShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
}

export const FeatherShopModal: React.FC<FeatherShopModalProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
}) => {
  const { feathersCount, spendFeathers } = useAchievements();
  const {
    profile,
    isAdmin,
    renameCooldown,
    bypassRenameCooldown,
    setActiveTitle,
    setActiveFrame,
    setAvatar,
    unlockShopItem,
  } = useUserAccount();

  const [activeTab, setActiveTab] = useState<'all' | 'avatars' | 'titles' | 'frames' | 'services'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const unlockedAvatars = profile.unlockedAvatars || [];
  const unlockedTitles = profile.unlockedTitles || [];
  const unlockedFrames = profile.unlockedFrames || ['frame_wood'];
  const activeFrameId = profile.activeFrame || 'frame_wood';

  const shopAvatars = INDIE_AVATARS.filter((a) => typeof a.shopPrice === 'number' && a.shopPrice > 0);
  const currentAvatarDef = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleBuyExpressRename = () => {
    soundFx.playClick();
    if (feathersCount < EXPRESS_RENAME_COST) {
      soundFx.playError();
      showFeedback('error', `Il vous manque ${EXPRESS_RENAME_COST - feathersCount} plumes d’or pour le renommage express.`);
      return;
    }

    const res = bypassRenameCooldown((cost) => spendFeathers(cost, 'Achat Renommage Express'));
    if (res.success) {
      soundFx.playVictory();
      showFeedback('success', '⚡ Renommage express débloqué ! Vous pouvez modifier votre pseudonyme immédiatement.');
    } else {
      soundFx.playError();
      showFeedback('error', res.error || 'Erreur lors du déblocage.');
    }
  };

  const handleUnlockAvatar = (avatarId: IndieAvatarId, cost: number, name: string) => {
    soundFx.playClick();
    if (feathersCount < cost) {
      soundFx.playError();
      showFeedback('error', `Il vous manque ${cost - feathersCount} plumes pour débloquer ${name}.`);
      return;
    }

    const res = unlockShopItem('avatar', avatarId, cost, (c) => spendFeathers(c, `Achat Avatar ${name}`));
    if (res.success) {
      soundFx.playVictory();
      showFeedback('success', `🎉 Félicitations ! L'avatar ${name} a été débloqué et équipé.`);
    } else {
      soundFx.playError();
      showFeedback('error', res.error || 'Erreur lors de l’achat.');
    }
  };

  const handleEquipAvatar = (avatarId: IndieAvatarId, name: string) => {
    soundFx.playClick();
    setAvatar(avatarId);
    showFeedback('success', `Avatar ${name} équipé avec succès !`);
  };

  const handleUnlockTitle = (titleId: string, cost: number, name: string) => {
    soundFx.playClick();
    if (feathersCount < cost) {
      soundFx.playError();
      showFeedback('error', `Il vous manque ${cost - feathersCount} plumes pour obtenir le titre « ${name} ».`);
      return;
    }

    const res = unlockShopItem('title', titleId, cost, (c) => spendFeathers(c, `Achat Titre ${name}`));
    if (res.success) {
      soundFx.playVictory();
      showFeedback('success', `👑 Titre honorifique « ${name} » débloqué et arboré sur votre profil !`);
    } else {
      soundFx.playError();
      showFeedback('error', res.error || 'Erreur lors de l’achat.');
    }
  };

  const handleEquipTitle = (name: string) => {
    soundFx.playClick();
    setActiveTitle(name);
    showFeedback('success', `Titre « ${name} » arboré sur votre profil !`);
  };

  const handleUnlockFrame = (frameId: string, cost: number, name: string) => {
    soundFx.playClick();
    if (feathersCount < cost) {
      soundFx.playError();
      showFeedback('error', `Il vous manque ${cost - feathersCount} plumes pour acquérir le cadre ${name}.`);
      return;
    }

    const res = unlockShopItem('frame', frameId, cost, (c) => spendFeathers(c, `Achat Cadre ${name}`));
    if (res.success) {
      soundFx.playVictory();
      showFeedback('success', `✨ Cadre cosmétique ${name} débloqué et appliqué à votre avatar !`);
    } else {
      soundFx.playError();
      showFeedback('error', res.error || 'Erreur lors de l’achat.');
    }
  };

  const handleEquipFrame = (frameId: string, name: string) => {
    soundFx.playClick();
    setActiveFrame(frameId);
    showFeedback('success', `Cadre ${name} équipé avec succès !`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop sombre */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#041610] rounded-3xl border-2 border-[#78350f] shadow-2xl shadow-black/90 overflow-hidden z-10 text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ornements Sylvestres Végétaux */}
          <SylvestreIvyFrame />

          {/* En-tête féerique de la boutique */}
          <div className="relative px-5 sm:px-8 pt-6 pb-5 bg-gradient-to-b from-[#082b20] to-[#041610] border-b border-[#78350f]/60">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
                  <ShoppingBag className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                      Sanctuaire Hoot
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                      Boutique Officielle
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                    <span>La Boutique du Sanctuaire</span>
                    <Sparkles className="w-5 h-5 text-amber-400 hidden sm:inline" />
                  </h2>
                </div>
              </div>

              {/* Solde de Plumes d'Or du Joueur */}
              <div className="flex items-center gap-2 sm:gap-3 bg-[#03150f] border-2 border-amber-400/60 rounded-2xl px-3.5 py-2 shadow-lg shadow-amber-500/10 shrink-0">
                <div className="text-right">
                  <div className="text-[9px] uppercase font-bold text-amber-400/80">Solde Disponible</div>
                  <div className="text-lg sm:text-xl font-black text-amber-300 font-mono flex items-center justify-end gap-1.5 leading-none mt-0.5">
                    <span>{formatFeathers(feathersCount)}</span>
                    <span className="text-base sm:text-lg">🪶</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1"
                  title="Fermer la boutique"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bannière de notification / Feedback */}
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-400/50 text-rose-200'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </motion.div>
            )}

            {/* Filtres par Onglets de la Boutique */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tout le Catalogue', icon: ShoppingBag },
                { id: 'avatars', label: 'Compagnons d’Élite', icon: Crown },
                { id: 'titles', label: 'Titres de Profil', icon: Shield },
                { id: 'frames', label: 'Cadres Cosmétiques', icon: Sparkles },
                { id: 'services', label: 'Renommage Express', icon: Zap },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab(tab.id as any);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-[#03150f] text-slate-300 hover:text-white border border-[#78350f]/60 hover:border-amber-500/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corps de la Boutique (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Section 1 : Service de Renommage Express */}
            {(activeTab === 'all' || activeTab === 'services') && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#06291e] to-[#03150f] border-2 border-amber-500/50 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                      <Zap className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">Renommage Express</h3>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {EXPRESS_RENAME_COST} 🪶
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        Contournez immédiatement le délai de carence des 14 jours pour changer de pseudonyme sans attendre.
                      </p>
                      <div className="mt-2 text-[11px] font-semibold flex items-center gap-2">
                        {renameCooldown.canChange || isAdmin ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Votre pseudonyme peut être modifié librement dans votre profil.
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Délai actif : encore {renameCooldown.daysRemaining} jour(s) d'attente (jusqu'au {renameCooldown.nextChangeDate}).
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
                    {renameCooldown.canChange || isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onClose();
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <span>Aller dans le profil</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBuyExpressRename}
                        disabled={feathersCount < EXPRESS_RENAME_COST}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>Débloquer pour {EXPRESS_RENAME_COST} 🪶</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 2 : Compagnons d'Élite Déblocables */}
            {(activeTab === 'all' || activeTab === 'avatars') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span>Compagnons & Avatars d’Élite</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Avatars exclusifs à arborer fièrement sur votre profil, dans les classements et lors des duels 1v1.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {shopAvatars.map((av) => {
                    const isUnlocked = unlockedAvatars.includes(av.id) || isAdmin;
                    const isEquipped = profile.avatarId === av.id;
                    const cost = av.shopPrice || 400;

                    return (
                      <div
                        key={av.id}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition ${
                          isEquipped
                            ? 'bg-[#062e22] border-amber-400 shadow-md shadow-amber-500/20'
                            : isUnlocked
                            ? 'bg-[#031a13] border-[#78350f]/80 hover:border-amber-500/40'
                            : 'bg-[#02110c] border-[#78350f]/40 opacity-90'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${av.bgGradient} flex items-center justify-center text-2xl border-2 ${
                                isEquipped ? 'border-amber-300 ring-2 ring-amber-400/50' : 'border-white/20'
                              } shadow-lg shrink-0`}
                            >
                              {av.emoji}
                            </div>
                            <div className="text-right">
                              {isEquipped ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                                  ✓ Équipé
                                </span>
                              ) : isUnlocked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  Débloqué
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full">
                                  {cost} 🪶
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2.5">
                            <h4 className="text-sm font-black text-white">{av.name}</h4>
                            <div className="text-[10px] font-semibold text-emerald-400">{av.game}</div>
                            <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                              « {av.quote} »
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#78350f]/40">
                          {isEquipped ? (
                            <button
                              disabled
                              className="w-full py-1.5 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs cursor-default"
                            >
                              Avatar Actuel
                            </button>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => handleEquipAvatar(av.id, av.name)}
                              className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                            >
                              Équiper
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnlockAvatar(av.id, cost, av.name)}
                              disabled={feathersCount < cost}
                              className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Débloquer ({cost} 🪶)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3 : Titres Honorifiques */}
            {(activeTab === 'all' || activeTab === 'titles') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Titres Honorifiques de Profil</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Remplacent l'appellation par défaut sur votre profil, le classement général et vos cartes de duels.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {SHOP_TITLES.map((titleItem) => {
                    const isUnlocked = unlockedTitles.includes(titleItem.id) || isAdmin;
                    const isEquipped = profile.title === titleItem.name;

                    return (
                      <div
                        key={titleItem.id}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition ${
                          isEquipped
                            ? 'bg-[#062e22] border-amber-400 shadow-md shadow-amber-500/20'
                            : isUnlocked
                            ? 'bg-[#031a13] border-[#78350f]/80'
                            : 'bg-[#02110c] border-[#78350f]/40 opacity-90'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xl">{titleItem.icon}</span>
                            {isEquipped ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                                ✓ Actif
                              </span>
                            ) : isUnlocked ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Acquis
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full">
                                {titleItem.cost} 🪶
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-white mt-2">« {titleItem.name} »</h4>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                            {titleItem.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#78350f]/40">
                          {isEquipped ? (
                            <button
                              disabled
                              className="w-full py-1.5 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs cursor-default"
                            >
                              Titre Actuel
                            </button>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => handleEquipTitle(titleItem.name)}
                              className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                            >
                              Arborer ce Titre
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnlockTitle(titleItem.id, titleItem.cost, titleItem.name)}
                              disabled={feathersCount < titleItem.cost}
                              className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Débloquer ({titleItem.cost} 🪶)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4 : Cadres Cosmétiques d'Avatar */}
            {(activeTab === 'all' || activeTab === 'frames') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Cadres Cosmétiques d’Avatar</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Entoure votre avatar d'un halo visuel unique visible par toute la communauté.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {SHOP_FRAMES.map((frame) => {
                    const isUnlocked = unlockedFrames.includes(frame.id) || frame.cost === 0 || isAdmin;
                    const isEquipped = activeFrameId === frame.id;

                    return (
                      <div
                        key={frame.id}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition ${
                          isEquipped
                            ? 'bg-[#062e22] border-amber-400 shadow-md shadow-amber-500/20'
                            : isUnlocked
                            ? 'bg-[#031a13] border-[#78350f]/80'
                            : 'bg-[#02110c] border-[#78350f]/40 opacity-90'
                        }`}
                      >
                        <div>
                          {/* Prévisualisation en direct avec l'avatar du joueur */}
                          <div className="flex items-center justify-center py-3 bg-[#010906] rounded-xl border border-[#78350f]/30">
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentAvatarDef.bgGradient} flex items-center justify-center text-2xl ${frame.borderClass} ${frame.glowClass}`}
                            >
                              {currentAvatarDef.emoji}
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between">
                            <h4 className="text-xs font-black text-white">{frame.name}</h4>
                            {isEquipped ? (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                                ✓ Actif
                              </span>
                            ) : isUnlocked ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Acquis
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full">
                                {frame.cost} 🪶
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                            {frame.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#78350f]/40">
                          {isEquipped ? (
                            <button
                              disabled
                              className="w-full py-1.5 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs cursor-default"
                            >
                              Cadre Actif
                            </button>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => handleEquipFrame(frame.id, frame.name)}
                              className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                            >
                              Appliquer ce Cadre
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnlockFrame(frame.id, frame.cost, frame.name)}
                              disabled={feathersCount < frame.cost}
                              className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Débloquer ({frame.cost} 🪶)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 5 : Guide du Farm Journalier des Plumes */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#02130e] border-2 border-[#78350f]/60 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs text-slate-300">
                  <h4 className="font-bold text-white text-sm">Comment récolter plus de Plumes d’Or ?</h4>
                  <ul className="mt-1.5 space-y-1 list-disc list-inside text-slate-300">
                    <li>
                      <span className="font-bold text-amber-300">+{DAILY_GAME_FEATHER_REWARD} Plumes</span> pour chaque premier défi quotidien résolu (8 défis = jusqu’à 80 plumes par jour !).
                    </li>
                    <li>
                      <span className="font-bold text-amber-300">+{DAILY_GRAND_SLAM_BONUS} Plumes</span> bonus de <strong className="text-white">Grand Chelem</strong> si vous remportez les 8 défis le même jour.
                    </li>
                    <li>
                      <span className="font-bold text-amber-300">+5 à +50 Plumes</span> pour chaque succès débloqué dans le sanctuaire.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
