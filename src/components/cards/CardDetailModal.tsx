import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Check,
  Layers,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeftRight,
  Share2,
  Copy,
  Users,
  MessageSquare,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { CardItem, CardOwnership } from '../../types/cards';
import { RARITY_CONFIG, DISENCHANT_VALUES } from '../../types/cards';
import { disenchantCard } from '../../services/cardCollectionService';
import { soundFx } from '../../utils/audio';
import { useTranslation } from 'react-i18next';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { useFriends } from '../../context/useFriends';
import { useChat } from '../../context/useChat';

interface CardDetailModalProps {
  card: CardItem | null;
  ownership?: CardOwnership;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCatalog?: (gameId: string) => void;
  incomingTrade?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  ownership,
  isOpen,
  onClose,
  onNavigateToCatalog,
  incomingTrade = false,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';

  // 3D orientation, Pan & Zoom state (de 0.75x à 2.5x)
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isFullscreenZoom, setIsFullscreenZoom] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trade Modal State
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);
  const [tradeHolo, setTradeHolo] = useState<boolean>(false);
  const [tradeCopied, setTradeCopied] = useState<boolean>(false);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const pinchStartRef = useRef<{ dist: number; initialScale: number } | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialPanX: number; initialPanY: number } | null>(null);

  const { friends, myFriendCode } = useFriends();
  const { openChat, sendMessage } = useChat();

  // Bloquer le défilement du catalogue et de la page en arrière-plan
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Réinitialiser les états lors du changement de carte
  useEffect(() => {
    if (card) {
      setScale(1);
      setPan({ x: 0, y: 0 });
      setMousePos({ x: 0, y: 0 });
      setIsInteracting(false);
      setIsTradeOpen(false);
      setTradeCopied(false);
      setTradeHolo(false);
      setIsFullscreenZoom(false);
      dragStartRef.current = null;
    }
  }, [card]);

  // Fermer le mode plein écran à la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenZoom) {
        e.stopPropagation();
        setIsFullscreenZoom(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenZoom]);

  // Clamping intelligent pour empêcher la carte d'être perdue hors du viewport
  const updatePanWithClamping = (currentScale: number, newPanX: number, newPanY: number) => {
    if (currentScale <= 1.05) {
      setPan({ x: 0, y: 0 });
      return;
    }
    const maxPanX = Math.round(180 * (currentScale - 1));
    const maxPanY = Math.round(220 * (currentScale - 1));
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, newPanX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newPanY)),
    });
  };

  // Attacher les écouteurs natifs wheel et touchmove non-passifs pour empêcher le scroll du catalogue
  useEffect(() => {
    const el = cardContainerRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((prev) => {
        const next = Math.min(2.5, Math.max(0.75, Number((prev + delta).toFixed(2))));
        if (next <= 1.05) setPan({ x: 0, y: 0 });
        return next;
      });
    };

    const onTouchMoveNative = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheelNative, { passive: false });
    el.addEventListener('touchmove', onTouchMoveNative, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheelNative);
      el.removeEventListener('touchmove', onTouchMoveNative);
    };
  }, [card]);

  if (!isOpen || !card) return null;

  const normalCount = ownership?.count || 0;
  const holoCount = ownership?.countHolo || 0;
  const totalCount = normalCount + holoCount;
  const isOwned = totalCount > 0;
  const canDisenchantStandard = totalCount > 1 && normalCount > 0;
  const canDisenchantHolo = totalCount > 1 && holoCount > 0;

  const rarityMeta = (card.rarity && RARITY_CONFIG[card.rarity]) || RARITY_CONFIG.common;
  const rarityName = lang === 'en' ? rarityMeta?.nameEn || 'Common' : rarityMeta?.nameFr || 'Commune';
  const values = (card.rarity && DISENCHANT_VALUES[card.rarity]) || DISENCHANT_VALUES.common;

  // Gestion du tilt et du glisser / pan à la souris (PC)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });

    // Déplacement de la carte si la souris est maintenue enfoncée et zoom > 1
    if (dragStartRef.current && scale > 1.05) {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;
      updatePanWithClamping(scale, dragStartRef.current.initialPanX + dx, dragStartRef.current.initialPanY + dy);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handleMouseUp = () => {
    setIsInteracting(false);
    dragStartRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
    dragStartRef.current = null;
    setMousePos({ x: 0, y: 0 });
  };

  // Zoom à la molette sur PC
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setScale((prev) => {
      const next = Math.min(2.5, Math.max(0.75, Number((prev + delta).toFixed(2))));
      if (next <= 1.05) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Gestion tactile sur mobile (Touch & Drag maintenu + Pinch to Zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartRef.current = { dist, initialScale: scale };
      dragStartRef.current = null;
    } else if (e.touches.length === 1 && cardContainerRef.current) {
      const rect = cardContainerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.max(-1, Math.min(1, ((touch.clientX - rect.left) / rect.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((touch.clientY - rect.top) / rect.height - 0.5) * 2));
      setMousePos({ x: x * 0.55, y: y * 0.55 });
      dragStartRef.current = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    if (e.touches.length === 2 && pinchStartRef.current) {
      // Zoom à 2 doigts (Pinch)
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / pinchStartRef.current.dist;
      const nextScale = Math.min(2.5, Math.max(0.75, Number((pinchStartRef.current.initialScale * ratio).toFixed(2))));
      setScale(nextScale);
      if (nextScale <= 1.05) setPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && cardContainerRef.current) {
      const rect = cardContainerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.max(-1, Math.min(1, ((touch.clientX - rect.left) / rect.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((touch.clientY - rect.top) / rect.height - 0.5) * 2));
      setMousePos({ x: x * 0.55, y: y * 0.55 });

      // Glisser au doigt pour déplacer la carte zoomée
      if (dragStartRef.current && scale > 1.05) {
        const dx = touch.clientX - dragStartRef.current.clientX;
        const dy = touch.clientY - dragStartRef.current.clientY;
        updatePanWithClamping(scale, dragStartRef.current.initialPanX + dx, dragStartRef.current.initialPanY + dy);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      setIsInteracting(false);
      pinchStartRef.current = null;
      dragStartRef.current = null;
      setMousePos({ x: 0, y: 0 });
    } else if (e.touches.length === 1) {
      pinchStartRef.current = null;
    }
  };

  const handleDisenchant = (isHolo: boolean) => {
    soundFx.playClick();
    const res = disenchantCard(card.id, isHolo);
    if (res.success) {
      soundFx.playChime();
      setFeedback({
        type: 'success',
        text: `✨ +${res.feathersGained} Plumes d'or récoltées pour le recyclage de cet exemplaire !`,
      });
      setTimeout(() => setFeedback(null), 3500);
    } else {
      soundFx.playError();
      setFeedback({
        type: 'error',
        text: res.error || 'Erreur lors du recyclage.',
      });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // URL et Partage d'Échange
  const tradeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#cards?trade=${card.id}${tradeHolo ? '&holo=1' : ''}`
    : '';

  const canShareNative = typeof navigator !== 'undefined' && Boolean(navigator.share);

  const handleCopyTradeLink = () => {
    soundFx.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tradeUrl).then(() => {
        setTradeCopied(true);
        setTimeout(() => setTradeCopied(false), 2500);
      });
    }
  };

  const handleNativeShare = async () => {
    if (!canShareNative) return;
    soundFx.playClick();
    try {
      await navigator.share({
        title: `Échange de carte Hoot : ${card.title}`,
        text: `Je te propose d'échanger la carte #${String(card.cardNumber).padStart(3, '0')} ${card.title}${tradeHolo ? ' ✨ Holographique' : ''} sur Hoot Indie Games !`,
        url: tradeUrl,
      });
    } catch {
      // Ignoré
    }
  };

  const handleSendTradeToFriend = (friend: { username: string; friendCode: string }) => {
    soundFx.playClick();
    const tradeMsg = `Salut @${friend.username} ! Je te propose d'échanger ma carte #${String(card.cardNumber).padStart(3, '0')} ${card.title}${tradeHolo ? ' ✨ Holographique' : ''} sur Hoot : ${tradeUrl}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tradeMsg).then(() => {
        setFeedback({
          type: 'success',
          text: `Message d'échange pour ${friend.username} copié dans le presse-papier !`,
        });
        setTimeout(() => setFeedback(null), 3000);
      });
    }
  };

  const handlePostTradeToChat = async () => {
    soundFx.playSuccess();
    try {
      const msg = `[Échange de Carte] 🃏 Je propose la carte #${String(card.cardNumber).padStart(3, '0')} ${card.title}${tradeHolo ? ' ✨ Holographique' : ''} à l'échange ! Voir ici : ${tradeUrl}`;
      await sendMessage(msg);
    } catch {
      // Ignoré
    }
    onClose();
    openChat(lang === 'fr' ? 'fr' : 'global');
  };

  const quote = card.tagline[lang] || card.tagline.fr || card.tagline.en;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] overflow-y-auto flex flex-col p-2.5 sm:p-4">
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
          className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto bg-[#041610] rounded-none sm:rounded-3xl border-2 border-[#78350f] shadow-2xl shadow-black/90 z-10 text-slate-100 p-4 sm:p-7 m-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <SylvestreIvyFrame density="delicate" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-30"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner si proposition d'échange reçue */}
          {incomingTrade && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-xs text-amber-200 flex items-center gap-2.5">
              <ArrowLeftRight className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
              <span>
                <strong>Proposition d'échange :</strong> Un ami vous propose cette carte ! Vous en possédez actuellement{' '}
                <strong>{totalCount}</strong> exemplaire{totalCount > 1 ? 's' : ''}.
              </span>
            </div>
          )}

          {/* Card Presentation & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* 3D Interactive Card Showcase avec Touch & Drag + Zoom */}
            <div className="flex flex-col items-center select-none">
              <div
                ref={cardContainerRef}
                className="relative flex justify-center items-start perspective-[1200px] cursor-grab active:cursor-grabbing touch-none py-2 px-1 w-full overflow-visible"
                style={{
                  touchAction: 'none',
                  minHeight: `${Math.round(380 * Math.min(scale, 1.8))}px`,
                  transition: 'min-height 0.25s ease-out',
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <div
                  style={{
                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale}) rotateY(${mousePos.x * 22}deg) rotateX(${-mousePos.y * 22}deg)`,
                    transformOrigin: 'top center',
                    transition: isInteracting ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                  }}
                  className={`relative w-60 sm:w-68 aspect-[5/7] rounded-none border-3 ${rarityMeta.borderClass} ${
                    holoCount > 0 ? 'ring-2 ring-cyan-300/50 shadow-cyan-500/30' : rarityMeta.glowClass
                  } shadow-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-b ${
                    rarityMeta.bgGradient
                  }`}
                >
                  {/* Filet ornemental intérieur type carte physique */}
                  <div className="absolute inset-1.5 border border-white/15 pointer-events-none z-10" />

                  {/* Effet Holo foil de reflet arc-en-ciel */}
                  {holoCount > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-60 z-10 transition-opacity"
                      style={{
                        background: `linear-gradient(${
                          135 + mousePos.x * 90
                        }deg, rgba(255,0,128,0.25) 0%, rgba(0,255,255,0.3) 25%, rgba(255,255,0,0.25) 50%, rgba(0,255,128,0.3) 75%, rgba(128,0,255,0.25) 100%)`,
                      }}
                    />
                  )}

                  {/* Top: Card Number & Rarity */}
                  <div className="relative z-20 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-300">
                      #{String(card.cardNumber).padStart(3, '0')}
                    </span>
                    <div className="flex items-center gap-1">
                      {holoCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-none text-[9px] font-black bg-cyan-400/25 text-cyan-200 border border-cyan-400/50">
                          ✨ HOLO
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-none font-bold uppercase text-[9px] border ${rarityMeta.badgeClass}`}>
                        {rarityName}
                      </span>
                    </div>
                  </div>

                  {/* Artwork Capsule (rectangulaire avec encadrement net) */}
                  <div className="relative z-20 my-2 rounded-none overflow-hidden aspect-[16/9] border border-white/25 bg-black/60 shadow-inner">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>

                  {/* Bottom title & year */}
                  <div className="relative z-20">
                    <h3 className="text-sm font-black text-white">{card.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                      <span>{card.developer}</span>
                      <span className="font-mono text-amber-400 font-bold">{card.releaseYear}</span>
                    </div>
                  </div>

                  {/* Copies counter */}
                  <div className="relative z-20 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>x{totalCount} exemplaire{totalCount > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Barre de Contrôles Zoom & Reset HUD */}
              <div className="flex items-center justify-center gap-1.5 mt-3 p-1 rounded-full bg-[#02140f] border border-[#78350f]/60 shadow-lg text-xs z-30">
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Dézoomer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setPan({ x: 0, y: 0 });
                    setMousePos({ x: 0, y: 0 });
                  }}
                  className="px-2 py-0.5 rounded-full hover:bg-slate-800 text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                  title="Réinitialiser le zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))))}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Zoomer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3.5 bg-slate-700/60 mx-0.5" />
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setPan({ x: 0, y: 0 });
                    setMousePos({ x: 0, y: 0 });
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Réinitialiser la vue et l'orientation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3.5 bg-slate-700/60 mx-0.5" />
                <button
                  type="button"
                  onClick={() => setIsFullscreenZoom(true)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition cursor-pointer"
                  title="Plein écran (Loupe centrée sans bordure)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-center flex items-center justify-center gap-1.5 flex-wrap">
                <span>{scale > 1.05 ? 'Glisser pour déplacer' : 'Glisser pour incliner'}</span>
                <span>•</span>
                <span>Molette / 2 doigts pour zoomer</span>
              </div>
            </div>

            {/* Right Information & Action Panel */}
            <div className="flex flex-col justify-between space-y-4">
              {isTradeOpen ? (
                /* Sous-panneau d'échange avec un ami */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#78350f]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">Échanger avec un ami</h3>
                        <p className="text-[11px] text-amber-300/80">Proposez cette carte à votre réseau</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTradeOpen(false)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                    >
                      ← Retour
                    </button>
                  </div>

                  {/* Choix de l'édition si les deux sont possédées */}
                  {normalCount > 0 && holoCount > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#02130e] border border-[#78350f]/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Version à proposer :
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTradeHolo(false)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            !tradeHolo
                              ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
                              : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          <span>Standard</span>
                          <span className="font-mono text-[10px] opacity-80">(x{normalCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTradeHolo(true)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            tradeHolo
                              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
                              : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Holo</span>
                          <span className="font-mono text-[10px] opacity-80">(x{holoCount})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notice si 1 seul exemplaire possédé */}
                  {totalCount === 1 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <span>
                        Vous possédez un <strong>exemplaire unique</strong> de cette carte. Vous pouvez l'échanger librement avec un ami !
                      </span>
                    </div>
                  )}

                  {/* Lien direct & Partage */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                      Lien direct d'échange de la carte
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={tradeUrl}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#010c08] border border-[#78350f]/60 text-xs font-mono text-slate-300 focus:outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyTradeLink}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                        title="Copier le lien"
                      >
                        {tradeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{tradeCopied ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>

                    {canShareNative && (
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Partager via WhatsApp, Discord...</span>
                      </button>
                    )}
                  </div>

                  {/* Amis du Sanctuaire */}
                  <div className="pt-2 border-t border-[#78350f]/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Amis du Sanctuaire ({friends.length})</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Code: {myFriendCode}</span>
                    </div>

                    {friends.length > 0 ? (
                      <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                        {friends.map((f) => (
                          <div
                            key={f.friendCode}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#02130e] border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate mr-2">
                              <span className="font-bold text-white truncate">{f.username}</span>
                              <span className="text-[10px] font-mono text-slate-500">{f.friendCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSendTradeToFriend(f)}
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] border border-amber-500/30 shrink-0 transition cursor-pointer"
                            >
                              Proposer
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic bg-[#02130e] p-2 rounded-xl border border-slate-800">
                        Aucun ami pour le moment. Partagez votre code ami <strong>{myFriendCode}</strong> !
                      </p>
                    )}
                  </div>

                  {/* Actions d'échange : Le Perchoir & Fermer */}
                  <div className="pt-2 border-t border-[#78350f]/40 space-y-2">
                    <button
                      type="button"
                      onClick={handlePostTradeToChat}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Publier l'offre sur Le Perchoir (Tchat Public)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTradeOpen(false)}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      Revenir aux détails
                    </button>
                  </div>
                </div>
              ) : (
                /* Panneau normal de détails et gestion de la carte */
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${rarityMeta.badgeClass}`}>
                      {rarityName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Carte #{card.cardNumber} sur 185
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                    {card.title}
                  </h2>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {card.developer} • {card.releaseYear}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {card.genres.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-semibold border border-slate-700/60"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Quote / Tagline */}
                  {quote && (
                    <p className="text-xs text-slate-300 italic mt-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed">
                      « {quote} »
                    </p>
                  )}

                  {/* Inventory breakdown */}
                  <div className="mt-3 p-3 rounded-xl bg-[#02130e] border border-[#78350f]/60 text-xs space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-amber-400/80">
                      Dans votre classeur
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Exemplaires standards :</span>
                      <span className="font-mono font-bold text-white">{normalCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Exemplaires Holographiques :</span>
                      </span>
                      <span className="font-mono font-bold text-cyan-300">{holoCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback toast */}
              {feedback && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-400/50 text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Actions principales (Échange avec un ami, Recyclage, Lien catalogue) */}
              {!isTradeOpen && (
                <div className="pt-2 border-t border-[#78350f]/40 space-y-2">
                  {/* Bouton Échanger avec un ami (accessible même avec 1 seul exemplaire !) */}
                  {isOwned && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsTradeOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-black" />
                      <span>Échanger avec un ami {totalCount === 1 ? '(Exemplaire unique)' : ''}</span>
                    </button>
                  )}

                  {/* Disenchant actions (autorisé uniquement si > 1 exemplaire total pour préserver l'unique) */}
                  {totalCount > 1 ? (
                    <>
                      <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        <span>Recyclage des doubles en Plumes d'Or 🪶</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {canDisenchantStandard && (
                          <button
                            type="button"
                            onClick={() => handleDisenchant(false)}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Recycler 1 standard</span>
                            <span className="font-mono text-amber-200">+{values.normal} 🪶</span>
                          </button>
                        )}

                        {canDisenchantHolo && (
                          <button
                            type="button"
                            onClick={() => handleDisenchant(true)}
                            className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-400/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Recycler 1 Holo</span>
                            <span className="font-mono text-cyan-200">+{values.holo} 🪶</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : isOwned ? (
                    <p className="text-[11px] text-slate-400 italic">
                      Exemplaire unique protégé du recyclage. Vous pouvez toutefois l'échanger avec un ami !
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Cette carte n'a pas encore été trouvée dans vos boosters.
                    </p>
                  )}

                  {/* Direct Link to Catalog */}
                  {onNavigateToCatalog && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onClose();
                        onNavigateToCatalog(card.gameId);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                    >
                      <span>Voir la fiche du jeu dans le Catalogue</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================= */}
      {/* MODE PLEIN ÉCRAN / LOUPE CENTRÉE (GARANTI SANS DÉBORDEMENT) */}
      {/* ========================================================= */}
      {isFullscreenZoom && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setIsFullscreenZoom(false)}
        >
          {/* Header plein écran */}
          <div
            className="w-full max-w-xl flex items-center justify-between z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm">
                #{String(card.cardNumber).padStart(3, '0')}
              </span>
              <h2 className="text-white font-black text-sm sm:text-base line-clamp-1">
                {card.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenZoom(false)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold border border-white/10 cursor-pointer"
              title="Quitter le plein écran"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Réduire</span>
            </button>
          </div>

          {/* Corps de la carte plein écran centré */}
          <div
            className="relative flex items-center justify-center w-full max-w-xl flex-1 my-2 overflow-hidden perspective-[1200px] cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${Math.max(1, scale)}) rotateY(${mousePos.x * 24}deg) rotateX(${-mousePos.y * 24}deg)`,
                transformOrigin: 'center center',
                transition: isInteracting ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transformStyle: 'preserve-3d',
              }}
              className={`relative max-h-[72dvh] max-w-[85vw] aspect-[5/7] h-[520px] rounded-none border-3 ${rarityMeta.borderClass} ${
                holoCount > 0 ? 'ring-2 ring-cyan-300/50 shadow-cyan-500/30' : rarityMeta.glowClass
              } shadow-2xl p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-b ${
                rarityMeta.bgGradient
              }`}
            >
              <div className="absolute inset-1.5 border border-white/15 pointer-events-none z-10" />

              {/* Effet Holo foil */}
              {holoCount > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-60 z-10"
                  style={{
                    background: `linear-gradient(${
                      135 + mousePos.x * 90
                    }deg, rgba(255,0,128,0.25) 0%, rgba(0,255,255,0.3) 25%, rgba(255,255,0,0.25) 50%, rgba(0,255,128,0.3) 75%, rgba(128,0,255,0.25) 100%)`,
                  }}
                />
              )}

              {/* Top: Card Number & Rarity */}
              <div className="relative z-20 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300">
                  #{String(card.cardNumber).padStart(3, '0')}
                </span>
                <div className="flex items-center gap-1">
                  {holoCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-cyan-400/25 text-cyan-200 border border-cyan-400/50">
                      ✨ HOLO
                    </span>
                  )}
                  <span className={`px-2 py-0.5 font-bold uppercase text-[9px] border ${rarityMeta.badgeClass}`}>
                    {rarityName}
                  </span>
                </div>
              </div>

              {/* Artwork Capsule */}
              <div className="relative z-20 my-2 rounded-none overflow-hidden aspect-[16/9] border border-white/25 bg-black/60 shadow-inner flex-1">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              </div>

              {/* Bottom title & year */}
              <div className="relative z-20">
                <h3 className="text-base font-black text-white">{card.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                  <span>{card.developer}</span>
                  <span className="font-mono text-amber-400 font-bold">{card.releaseYear}</span>
                </div>
              </div>

              {/* Copies counter */}
              <div className="relative z-20 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>x{totalCount} exemplaire{totalCount > 1 ? 's' : ''}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Barre de Contrôles Zoom Plein Écran */}
          <div
            className="flex flex-col items-center gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-[#02140f]/90 border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs">
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Dézoomer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  setPan({ x: 0, y: 0 });
                  setMousePos({ x: 0, y: 0 });
                }}
                className="px-3 py-1 rounded-full hover:bg-slate-800 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                title="Réinitialiser le zoom"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))))}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Zoomer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-slate-700/60 mx-1" />
              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  setPan({ x: 0, y: 0 });
                  setMousePos({ x: 0, y: 0 });
                }}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Réinitialiser la vue"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Glissez pour déplacer • Molette ou pincement pour zoomer • Échap pour fermer
            </p>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
