/**
 * cards.ts
 * Types et constantes pour le système de Cartes à collectionner & Boosters du Sanctuaire.
 */

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CardItem {
  id: string; // Identifiant du jeu (ex: 'hollow-knight')
  gameId: string;
  title: string;
  cardNumber: number; // Numéro dans l'album (1 à 185)
  rarity: CardRarity;
  releaseYear: number;
  developer: string;
  genres: string[];
  imageUrl: string;
  tagline: {
    fr: string;
    en: string;
    es?: string;
    de?: string;
    ja?: string;
    'pt-BR'?: string;
  };
}

export interface CardOwnership {
  count: number; // Exemplaires standards possédés
  countHolo: number; // Exemplaires holographiques / brillants possédés
  firstObtainedAt?: string;
}

export type UserCardCollection = Record<string, CardOwnership>;

export interface BoosterCardResult {
  card: CardItem;
  isHolo: boolean;
  isNew: boolean;
}

export interface BoosterOpenResult {
  cards: BoosterCardResult[];
  openedAt: string;
  isFreeDaily: boolean;
}

// Barème officiel de désenchantement (prix doublé si holographique)
export const DISENCHANT_VALUES: Record<CardRarity, { normal: number; holo: number }> = {
  common: { normal: 15, holo: 30 },
  rare: { normal: 40, holo: 80 },
  epic: { normal: 100, holo: 200 },
  legendary: { normal: 250, holo: 500 },
};

export const BOOSTER_COST = 150;
export const CARDS_PER_BOOSTER = 5;
export const HOLO_PROBABILITY = 0.05; // 5% de chance par carte d'être brillante / holographique

// Rareté metadata visuelle
export const RARITY_CONFIG: Record<
  CardRarity,
  {
    nameFr: string;
    nameEn: string;
    color: string;
    borderClass: string;
    badgeClass: string;
    glowClass: string;
    textColor: string;
    bgGradient: string;
    accentHex: string;
  }
> = {
  common: {
    nameFr: 'Commune',
    nameEn: 'Common',
    color: 'slate',
    borderClass: 'border-slate-500/50',
    badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600',
    glowClass: 'shadow-slate-500/10',
    textColor: 'text-slate-300',
    bgGradient: 'from-slate-800/80 via-slate-900 to-[#020b08]',
    accentHex: '#94a3b8',
  },
  rare: {
    nameFr: 'Rare',
    nameEn: 'Rare',
    color: 'blue',
    borderClass: 'border-sky-500/70',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/50',
    glowClass: 'shadow-sky-500/25',
    textColor: 'text-sky-300',
    bgGradient: 'from-sky-950/90 via-slate-900 to-[#020b08]',
    accentHex: '#38bdf8',
  },
  epic: {
    nameFr: 'Épique',
    nameEn: 'Epic',
    color: 'purple',
    borderClass: 'border-purple-500/80',
    badgeClass: 'bg-purple-500/25 text-purple-300 border-purple-400/60',
    glowClass: 'shadow-purple-500/30',
    textColor: 'text-purple-300',
    bgGradient: 'from-purple-950/90 via-slate-900 to-[#020b08]',
    accentHex: '#c084fc',
  },
  legendary: {
    nameFr: 'Légendaire',
    nameEn: 'Legendary',
    color: 'amber',
    borderClass: 'border-amber-400 ring-2 ring-amber-300/40',
    badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-400/60 animate-pulse',
    glowClass: 'shadow-amber-500/40',
    textColor: 'text-amber-300',
    bgGradient: 'from-amber-950/90 via-[#1c1204] to-[#020b08]',
    accentHex: '#fbbf24',
  },
};
