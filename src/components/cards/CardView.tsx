import React from 'react';
import type { CardItem, CardOwnership } from '../../types/cards';
import { RARITY_CONFIG } from '../../types/cards';
import { Sparkles, Lock, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CardViewProps {
  card: CardItem;
  ownership?: CardOwnership;
  isFlipped?: boolean; // pour l'animation d'ouverture de booster
  showBack?: boolean;
  onInspect?: (card: CardItem) => void;
  size?: 'sm' | 'md' | 'lg';
  isHighlighted?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  ownership,
  isFlipped = true,
  showBack = false,
  onInspect,
  size = 'md',
  isHighlighted = false,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';

  if (!card) return null;

  const normalCount = ownership?.count || 0;
  const holoCount = ownership?.countHolo || 0;
  const totalCount = normalCount + holoCount;
  const isOwned = totalCount > 0;
  const hasHolo = holoCount > 0;

  const rarityMeta = (card.rarity && RARITY_CONFIG[card.rarity]) || RARITY_CONFIG.common;
  const rarityName = lang === 'en' ? rarityMeta?.nameEn || 'Common' : rarityMeta?.nameFr || 'Commune';

  // Dos de la carte du Sanctuaire
  if (showBack || !isFlipped) {
    return (
      <div
        className={`relative aspect-[5/7] rounded-none border-2 border-[#78350f] bg-gradient-to-br from-[#06241b] via-[#02140e] to-[#010a07] shadow-xl overflow-hidden flex flex-col items-center justify-center p-3 select-none transition-transform ${
          size === 'sm' ? 'w-36 sm:w-40' : size === 'lg' ? 'w-64 sm:w-72' : 'w-48 sm:w-52'
        }`}
      >
        <div className="absolute inset-1.5 border border-amber-500/30 pointer-events-none" />
        <div className="w-12 h-12 rounded-none bg-amber-500/15 border-2 border-amber-400/60 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 mb-2">
          🦉
        </div>
        <div className="text-[10px] uppercase font-black tracking-widest text-amber-300 text-center">
          Hoot Sanctuaire
        </div>
        <div className="text-[9px] font-mono text-emerald-400/80 mt-0.5">Indie Card</div>
      </div>
    );
  }

  // Silhouette / Carte mystère non possédée
  if (!isOwned) {
    return (
      <div
        onClick={() => onInspect && onInspect(card)}
        className={`group relative aspect-[5/7] rounded-none border-2 border-[#1e293b]/80 bg-[#070d18]/90 hover:border-[#334155] shadow-lg flex flex-col justify-between p-3 select-none cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
          size === 'sm' ? 'w-36 sm:w-40' : size === 'lg' ? 'w-64 sm:w-72' : 'w-48 sm:w-52'
        }`}
      >
        <div className="absolute inset-1 border border-slate-700/20 pointer-events-none" />
        {/* Header mystère */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>#{String(card.cardNumber).padStart(3, '0')}</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-none border border-slate-700 bg-slate-800/80 text-slate-400">
            {rarityName}
          </span>
        </div>

        {/* Cœur mystère : silhouette sombre */}
        <div className="my-auto flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 rounded-none bg-slate-800/50 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-2 group-hover:scale-105 transition-transform">
            <Lock className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-xs font-bold text-slate-400 line-clamp-1 group-hover:text-slate-300">
            {card.title}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">{card.releaseYear}</div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-800/60">
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
            Non obtenue
          </span>
        </div>
      </div>
    );
  }

  // Carte possédée pleine et illustrée (format authentique rectangulaire)
  return (
    <div
      onClick={() => onInspect && onInspect(card)}
      className={`group relative aspect-[5/7] rounded-none border-2 ${rarityMeta.borderClass} ${
        hasHolo ? 'ring-2 ring-cyan-300/40 shadow-cyan-500/20' : rarityMeta.glowClass
      } shadow-xl flex flex-col justify-between p-2.5 sm:p-3 select-none cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden bg-gradient-to-b ${
        rarityMeta.bgGradient
      } ${isHighlighted ? 'scale-105 ring-4 ring-amber-400' : ''} ${
        size === 'sm' ? 'w-36 sm:w-40' : size === 'lg' ? 'w-64 sm:w-72' : 'w-48 sm:w-52'
      }`}
    >
      {/* Filet ornemental intérieur type carte physique */}
      <div className="absolute inset-1 border border-white/10 pointer-events-none z-10" />

      {/* Effet Holographique / Reflet Arc-en-Ciel pour cartes Foil */}
      {hasHolo && (
        <div
          className="absolute inset-0 pointer-events-none opacity-45 group-hover:opacity-75 transition-opacity duration-300 z-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,0,128,0.2) 0%, rgba(0,255,255,0.25) 25%, rgba(255,255,0,0.2) 50%, rgba(0,255,128,0.25) 75%, rgba(128,0,255,0.2) 100%)',
            backgroundSize: '200% 200%',
          }}
        />
      )}

      {/* En-tête : Numéro, Rareté & Badge d'exemplaires */}
      <div className="relative z-20 flex items-center justify-between gap-1 text-[10px]">
        <span className="font-mono font-bold text-slate-300">
          #{String(card.cardNumber).padStart(3, '0')}
        </span>

        <div className="flex items-center gap-1">
          {hasHolo && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-none text-[9px] font-black bg-cyan-400/25 text-cyan-200 border border-cyan-400/50 shadow-sm shadow-cyan-400/30"
              title="Carte Holographique Brillante"
            >
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              <span>HOLO</span>
            </span>
          )}

          <span
            className={`px-1.5 py-0.2 rounded-none font-bold uppercase text-[9px] border ${rarityMeta.badgeClass}`}
          >
            {rarityName}
          </span>
        </div>
      </div>

      {/* Illustration centrale / Artwork Capsule du jeu (rectangulaire avec encadrement net) */}
      <div className="relative z-20 my-1 rounded-none overflow-hidden aspect-[16/9] border border-white/20 bg-black/50 shadow-inner group-hover:border-amber-400/60 transition-colors">
        <img
          src={card.imageUrl}
          alt={card.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg';
          }}
        />
        {/* Subtle bottom gradient on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Titre & Métadonnées */}
      <div className="relative z-20 mt-1">
        <h4 className="text-xs font-black text-white line-clamp-1 tracking-tight group-hover:text-amber-300 transition-colors">
          {card.title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-slate-300/80 mt-0.5">
          <span className="truncate max-w-[110px]">{card.developer}</span>
          <span className="font-mono font-semibold text-amber-400/90">{card.releaseYear}</span>
        </div>
      </div>

      {/* Footer : Badge de possession / Doubles */}
      <div className="relative z-20 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 font-mono font-bold text-slate-200">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>x{totalCount}</span>
        </div>

        {totalCount > 1 ? (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-none bg-amber-500/20 text-amber-300 border border-amber-500/40">
            +{totalCount - 1} double{totalCount > 2 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[9px] text-emerald-400 font-semibold">Unique</span>
        )}
      </div>
    </div>
  );
};
