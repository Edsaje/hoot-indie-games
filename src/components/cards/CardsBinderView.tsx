import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Package,
  Layers,
  Search,
  Gift,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { ALL_CARDS, buildCardsFromGames, setDynamicCardsPool } from '../../data/cardsData';
import type { CardItem, CardRarity, BoosterOpenResult, UserCardCollection } from '../../types/cards';
import { BOOSTER_COST } from '../../types/cards';
import {
  getCardCollection,
  canClaimDailyBooster,
  claimDailyBooster,
  buyBoosterWithFeathers,
  getCollectionStats,
} from '../../services/cardCollectionService';
import { formatFeathers, isLocalAdminProfile } from '../../utils/featherEconomy';
import { useAchievements } from '../../context/useAchievements';
import { useUserAccount } from '../../context/useUserAccount';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { CardView } from './CardView';
import { CardDetailModal } from './CardDetailModal';
import { BoosterOpeningModal } from './BoosterOpeningModal';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface CardsBinderViewProps {
  onNavigateToCatalog?: (gameId: string) => void;
  onOpenShop?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const CardsBinderView: React.FC<CardsBinderViewProps> = ({
  onNavigateToCatalog,
  onOpenShop,
  onModalStateChange,
}) => {
  const { feathersCount } = useAchievements();
  const { isAdmin, isCreator } = useUserAccount();
  const isSuperAdmin = Boolean(isAdmin || isCreator || isLocalAdminProfile());
  const { curatedGems } = useSteamCatalog();

  const allCards = useMemo(() => {
    if (curatedGems && curatedGems.length > 0) {
      return buildCardsFromGames(curatedGems);
    }
    return ALL_CARDS;
  }, [curatedGems]);

  useEffect(() => {
    setDynamicCardsPool(allCards);
  }, [allCards]);

  const [collection, setCollection] = useState<UserCardCollection>(() => getCardCollection());
  const [isDailyAvailable, setIsDailyAvailable] = useState<boolean>(() => canClaimDailyBooster(undefined, isSuperAdmin));

  // Modals state
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [boosterResult, setBoosterResult] = useState<BoosterOpenResult | null>(null);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Signaler l'ouverture d'une modale au parent pour masquer le bouton flottant de chat
  useEffect(() => {
    onModalStateChange?.(isOpeningModalOpen || Boolean(selectedCard));
  }, [isOpeningModalOpen, selectedCard, onModalStateChange]);

  useEffect(() => {
    return () => {
      onModalStateChange?.(false);
    };
  }, [onModalStateChange]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all' | 'holo'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'missing' | 'duplicates'>('all');
  const [sortBy, setSortBy] = useState<'number' | 'rarity' | 'duplicates'>('number');

  // Sync collection when storage updates
  useEffect(() => {
    const handleCollectionUpdate = (e: any) => {
      if (e.detail) {
        setCollection(e.detail);
      } else {
        setCollection(getCardCollection());
      }
      setIsDailyAvailable(canClaimDailyBooster(undefined, isSuperAdmin));
    };

    window.addEventListener('hoot_cards_updated', handleCollectionUpdate);
    window.addEventListener('hoot_daily_booster_claimed', handleCollectionUpdate);
    return () => {
      window.removeEventListener('hoot_cards_updated', handleCollectionUpdate);
      window.removeEventListener('hoot_daily_booster_claimed', handleCollectionUpdate);
    };
  }, [isSuperAdmin]);

  // Détecter les propositions d'échanges directes via URL (#cards?trade=... ou #trade=...)
  useEffect(() => {
    const checkTradeHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      const match = hash.match(/[?&]trade=([a-zA-Z0-9_-]+)/) || hash.match(/#trade=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const cardId = match[1];
        const found = allCards.find((c) => c.id === cardId);
        if (found) {
          setSelectedCard(found);
        }
      }
    };

    checkTradeHash();
    window.addEventListener('hashchange', checkTradeHash);
    return () => {
      window.removeEventListener('hashchange', checkTradeHash);
    };
  }, [allCards]);

  const stats = useMemo(() => getCollectionStats(collection, allCards), [collection, allCards]);

  // Handle Daily Pack opening
  const handleClaimDailyPack = () => {
    try {
      soundFx.playClick();
      const res = claimDailyBooster(undefined, isSuperAdmin, allCards);
      if (res && res.cards && res.cards.length > 0) {
        setBoosterResult(res);
        setIsOpeningModalOpen(true);
        if (!isSuperAdmin) {
          setIsDailyAvailable(false);
        }
        setCollection(getCardCollection());
      } else {
        soundFx.playError();
        setErrorMessage("Le booster gratuit du jour a déjà été réclamé. Revenez demain à minuit !");
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch (err) {
      console.error("[Cards] Erreur ouverture booster quotidien:", err);
      soundFx.playError();
      setErrorMessage("Une erreur est survenue lors de l'ouverture du booster.");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Handle Buy Pack with 150 Feathers (Gratuit pour Super Admin)
  const handleBuyPack = () => {
    try {
      soundFx.playClick();
      if (!isSuperAdmin && feathersCount < BOOSTER_COST) {
        soundFx.playError();
        setErrorMessage(`Il vous manque ${BOOSTER_COST - feathersCount} plumes d'or pour acheter un booster.`);
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }

      const res = buyBoosterWithFeathers(isSuperAdmin ? Infinity : feathersCount, allCards);
      if ('error' in res) {
        soundFx.playError();
        setErrorMessage(res.error);
        setTimeout(() => setErrorMessage(null), 4000);
      } else if (res && res.cards && res.cards.length > 0) {
        setBoosterResult(res);
        setIsOpeningModalOpen(true);
        setCollection(getCardCollection());
      }
    } catch (err) {
      console.error("[Cards] Erreur achat booster:", err);
      soundFx.playError();
      setErrorMessage("Une erreur est survenue lors de la transaction du booster.");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Filtered and Sorted Cards
  const filteredCards = useMemo(() => {
    let result = [...allCards];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.developer.toLowerCase().includes(q) ||
          c.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Rarity filter
    if (rarityFilter === 'holo') {
      result = result.filter((c) => (collection[c.id]?.countHolo || 0) > 0);
    } else if (rarityFilter !== 'all') {
      result = result.filter((c) => c.rarity === rarityFilter);
    }

    // Ownership filter
    if (ownershipFilter === 'owned') {
      result = result.filter(
        (c) => (collection[c.id]?.count || 0) + (collection[c.id]?.countHolo || 0) > 0
      );
    } else if (ownershipFilter === 'missing') {
      result = result.filter(
        (c) => (collection[c.id]?.count || 0) + (collection[c.id]?.countHolo || 0) === 0
      );
    } else if (ownershipFilter === 'duplicates') {
      result = result.filter(
        (c) => (collection[c.id]?.count || 0) + (collection[c.id]?.countHolo || 0) > 1
      );
    }

    // Sorting
    if (sortBy === 'number') {
      result.sort((a, b) => a.cardNumber - b.cardNumber);
    } else if (sortBy === 'rarity') {
      const rarityRank: Record<CardRarity, number> = {
        legendary: 4,
        epic: 3,
        rare: 2,
        common: 1,
      };
      result.sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity]);
    } else if (sortBy === 'duplicates') {
      result.sort((a, b) => {
        const countA = (collection[a.id]?.count || 0) + (collection[a.id]?.countHolo || 0);
        const countB = (collection[b.id]?.count || 0) + (collection[b.id]?.countHolo || 0);
        return countB - countA;
      });
    }

    return result;
  }, [searchQuery, rarityFilter, ownershipFilter, sortBy, collection]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 pb-28 min-h-screen text-slate-100">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-5 sm:p-8 shadow-2xl mb-8 text-center">
        <SylvestreIvyFrame density="medium" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2.5">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Collection Officielle • 185 Cartes</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            L'Album des Pépites Indés
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Collectionnez les 185 chefs-d'œuvre du sanctuaire, découvrez des versions holographiques
            rares et recyclez vos doubles en Plumes d'Or 🪶 !
          </p>

          {/* Action Boxes : Booster Quotidien & Acheter Booster */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6 text-left">
            {/* Box 1: Booster Quotidien Gratuit */}
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${
                isDailyAvailable || isSuperAdmin
                  ? 'bg-gradient-to-br from-[#0a4835] to-[#042419] border-emerald-400/80 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#02140f] border-[#78350f]/60 opacity-85'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 shrink-0 ${
                    isDailyAvailable || isSuperAdmin
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                    Cadeau du Jour
                  </div>
                  <h3 className="text-sm font-black text-white">Booster Quotidien (5 Cartes)</h3>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {isDailyAvailable || isSuperAdmin
                      ? 'Disponible ! Paquet gratuit offert aujourd’hui.'
                      : 'Déjà récupéré aujourd’hui. Prochain demain à minuit.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimDailyPack}
                disabled={!isDailyAvailable && !isSuperAdmin}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shrink-0 transition cursor-pointer shadow-md shadow-emerald-900/40 active:scale-95"
              >
                {isDailyAvailable || isSuperAdmin ? 'Ouvrir' : 'Reçu ✓'}
              </button>
            </div>

            {/* Box 2: Acheter un booster pour 150 Plumes */}
            <div className="p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-br from-[#0c3829] to-[#041a12] flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 text-2xl shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                    Boutique du Sanctuaire
                  </div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Nouveau Booster</span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 rounded">
                      {isSuperAdmin ? 'Gratuit 👑' : `${BOOSTER_COST} 🪶`}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    5 cartes dont 1 Rare ou supérieure garantie.
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleBuyPack}
                  disabled={!isSuperAdmin && feathersCount < BOOSTER_COST}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shrink-0 transition cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5 active:scale-95"
                >
                  <Package className="w-4 h-4" />
                  <span>Acheter ({isSuperAdmin ? 'Gratuit 👑' : `${BOOSTER_COST} 🪶`})</span>
                </button>
                {(isSuperAdmin || feathersCount === Infinity) && (
                  <span className="text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1 mt-0.5" title="Compte Administrateur Officiel">
                    👑 Plumes Infinies (∞)
                  </span>
                )}
                {feathersCount < BOOSTER_COST && onOpenShop && (
                  <button
                    type="button"
                    onClick={onOpenShop}
                    className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Visiter la Boutique</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message Toast */}
          {errorMessage && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-bold animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Collection Progress Bar */}
          <div className="mt-6 pt-5 border-t border-[#78350f]/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300">
                Progression de l'Album :{' '}
                <strong className="text-amber-300 font-mono">
                  {stats.totalUnique} / {allCards.length}
                </strong>{' '}
                ({stats.completionPercent}%)
              </span>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-cyan-300 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{stats.totalHolo} Holo</span>
                </span>
                <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{stats.totalDuplicates} double{stats.totalDuplicates > 1 ? 's' : ''}</span>
                </span>
                <span className="text-amber-300 font-mono font-bold flex items-center gap-1">
                  <span>{formatFeathers(feathersCount)} 🪶</span>
                </span>
              </div>
            </div>

            <div className="w-full h-3 bg-[#02110c] rounded-full overflow-hidden border border-[#78350f]/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm shadow-amber-400/50"
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>

            {/* Rarity breakdown pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Communes : {stats.byRarity.common.owned}/{stats.byRarity.common.total}</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Rares : {stats.byRarity.rare.owned}/{stats.byRarity.rare.total}</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Épiques : {stats.byRarity.epic.owned}/{stats.byRarity.epic.total}</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Légendaires : {stats.byRarity.legendary.owned}/{stats.byRarity.legendary.total}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-2xl bg-[#06241b] border-2 border-[#78350f] shadow-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une carte, un studio, un genre..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#020e0a] border border-[#78350f]/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Rarity Tabs */}
          <div className="flex items-center gap-1 bg-[#020e0a] p-1 rounded-xl border border-[#78350f]/60 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'common', label: 'Communes' },
              { id: 'rare', label: 'Rares' },
              { id: 'epic', label: 'Épiques' },
              { id: 'legendary', label: 'Légendaires' },
              { id: 'holo', label: '✨ Holo' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setRarityFilter(tab.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  rarityFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ownership Filter */}
          <div className="flex items-center gap-1 bg-[#020e0a] p-1 rounded-xl border border-[#78350f]/60">
            {[
              { id: 'all', label: 'Tout' },
              { id: 'owned', label: 'Possédées' },
              { id: 'missing', label: 'Manquantes' },
              { id: 'duplicates', label: 'Doubles' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundFx.playClick();
                  setOwnershipFilter(f.id as any);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  ownershipFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-[#020e0a] border border-[#78350f]/60 text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="number">Trier par N° d'album</option>
            <option value="rarity">Trier par Rareté</option>
            <option value="duplicates">Trier par Doubles</option>
          </select>
        </div>
      </div>

      {/* Cards Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <span>
          Affichage de <strong className="text-white">{filteredCards.length}</strong> carte
          {filteredCards.length > 1 ? 's' : ''}
        </span>
        <span className="text-[11px] text-slate-500">
          Cliquez sur une carte pour l'examiner en 3D ou recycler ses doubles.
        </span>
      </div>

      {/* Cards Binder Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
        {filteredCards.map((card) => {
          if (!card || !card.id) return null;
          const ownership = collection ? collection[card.id] : undefined;
          return (
            <CardView
              key={card.id}
              card={card}
              ownership={ownership}
              onInspect={(c) => setSelectedCard(c)}
              size="md"
            />
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
          <Layers className="w-12 h-12 text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-slate-300">Aucune carte trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Aucune carte ne correspond aux filtres ou à la recherche sélectionnés.
          </p>
        </div>
      )}

      {/* Card Inspection Modal */}
      {selectedCard && (
        <ErrorBoundary
          isModal
          fallbackTitle="Erreur d'affichage de la carte"
          fallbackMessage="Impossible d'afficher cette carte pour le moment."
          onReset={() => setSelectedCard(null)}
        >
          <CardDetailModal
            card={selectedCard}
            ownership={collection ? collection[selectedCard.id] : undefined}
            isOpen={Boolean(selectedCard)}
            onClose={() => {
              setSelectedCard(null);
              if (typeof window !== 'undefined' && window.location.hash.includes('trade=')) {
                window.location.hash = '#cards';
              }
            }}
            onNavigateToCatalog={onNavigateToCatalog}
            incomingTrade={typeof window !== 'undefined' && window.location.hash.includes(`trade=${selectedCard.id}`)}
          />
        </ErrorBoundary>
      )}

      {/* Booster Opening Animation Modal */}
      {isOpeningModalOpen && boosterResult && (
        <ErrorBoundary
          isModal
          fallbackTitle="Erreur lors de l'ouverture du booster"
          fallbackMessage="Un contretemps est survenu pendant l'ouverture. Pas d'inquiétude, vos cartes et votre progression sont en sécurité !"
          onReset={() => {
            setIsOpeningModalOpen(false);
            setBoosterResult(null);
          }}
        >
          <BoosterOpeningModal
            isOpen={isOpeningModalOpen}
            result={boosterResult}
            onClose={() => {
              setIsOpeningModalOpen(false);
              setBoosterResult(null);
            }}
            onOpenAnother={handleBuyPack}
            canOpenAnother={isSuperAdmin || feathersCount >= BOOSTER_COST}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
