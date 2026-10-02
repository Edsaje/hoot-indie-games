import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeftRight,
  Sparkles,
  Check,
  X,
  Clock,
  Layers,
  Search,
  AlertCircle,
  RefreshCw,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useTrades } from '../../context/useTrades';
import { useFriends } from '../../context/useFriends';
import { useUserAccount } from '../../context/useUserAccount';
import { getCardCollection } from '../../services/cardCollectionService';
import { getDynamicCardsPool } from '../../data/cardsData';
import { CARD_RARITY_METADATA } from '../../types/cards';
import type { CardItem, CardRarity } from '../../types/cards';
import type { FriendPlayer } from '../../types/friends';
import type { CardTradeOffer, FriendBinderData } from '../../types/trades';
import { soundFx } from '../../utils/audio';

const RARITIES: CardRarity[] = ['common', 'rare', 'epic', 'legendary'];

export const TradeModal: React.FC = () => {
  const {
    isTradeModalOpen,
    closeTradeModal,
    incomingTrades,
    outgoingTrades,
    tradeHistory,
    pendingIncomingCount,
    createTrade,
    respondTrade,
    fetchFriendBinder,
    refreshTrades,
    selectedTradeTargetFriend,
    prefilledOfferedCard,
    prefilledRequestedCard,
    tradeModalInitialTab,
  } = useTrades();

  const { friends, myFriendCode } = useFriends();
  const { profile } = useUserAccount();

  const [activeTab, setActiveTab] = useState<'create' | 'incoming' | 'outgoing' | 'history'>('create');

  // État du formulaire de création
  const [targetFriend, setTargetFriend] = useState<FriendPlayer | null>(null);
  const [selectedOfferedCard, setSelectedOfferedCard] = useState<CardItem | null>(null);
  const [offeredIsHolo, setOfferedIsHolo] = useState<boolean>(false);
  const [onlyDuplicates, setOnlyDuplicates] = useState<boolean>(true);

  // Carte demandée
  const [requestedMode, setRequestedMode] = useState<'specific' | 'any'>('specific');
  const [selectedRequestedCard, setSelectedRequestedCard] = useState<CardItem | null>(null);
  const [requestedIsHolo, setRequestedIsHolo] = useState<boolean>(false);
  const [tradeNote, setTradeNote] = useState<string>('');

  // Recherche & filtres
  const [offeredSearch, setOfferedSearch] = useState<string>('');
  const [requestedSearch, setRequestedSearch] = useState<string>('');
  const [requestedRarityFilter, setRequestedRarityFilter] = useState<string>('all');

  // Sélecteur de contre-carte pour offre "au choix"
  const [counterTradeTarget, setCounterTradeTarget] = useState<CardTradeOffer | null>(null);
  const [counterCard, setCounterCard] = useState<CardItem | null>(null);
  const [counterIsHolo, setCounterIsHolo] = useState<boolean>(false);

  // Données du classeur de l'ami sélectionné
  const [friendBinder, setFriendBinder] = useState<FriendBinderData | null>(null);
  const [isLoadingFriendBinder, setIsLoadingFriendBinder] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Synchronisation avec les props initiales
  useEffect(() => {
    if (isTradeModalOpen) {
      setActiveTab(tradeModalInitialTab || 'create');
      if (selectedTradeTargetFriend) {
        setTargetFriend(selectedTradeTargetFriend);
      }
      if (prefilledOfferedCard) {
        setSelectedOfferedCard(prefilledOfferedCard);
      }
      if (prefilledRequestedCard) {
        setSelectedRequestedCard(prefilledRequestedCard);
        setRequestedMode('specific');
      }
      setActionError(null);
      setActionSuccess(null);
    }
  }, [
    isTradeModalOpen,
    tradeModalInitialTab,
    selectedTradeTargetFriend,
    prefilledOfferedCard,
    prefilledRequestedCard,
  ]);

  // Chargement du classeur de l'ami lors de sa sélection
  useEffect(() => {
    if (targetFriend && targetFriend.friendCode) {
      setIsLoadingFriendBinder(true);
      fetchFriendBinder(targetFriend.friendCode)
        .then((data) => {
          setFriendBinder(data);
        })
        .finally(() => {
          setIsLoadingFriendBinder(false);
        });
    } else {
      setFriendBinder(null);
    }
  }, [targetFriend, fetchFriendBinder]);

  // Compagnons mutuels filtrés
  const mutualFriends = useMemo(() => {
    return friends.filter((f) => f.isMutual !== false);
  }, [friends]);

  // Collection locale du joueur
  const localCollection = useMemo(() => {
    return getCardCollection();
  }, [isTradeModalOpen, actionSuccess]);

  const cardsPool = useMemo(() => {
    return getDynamicCardsPool();
  }, []);

  // Cartes disponibles pour l'offre du joueur
  const availableOfferedCards = useMemo(() => {
    return cardsPool.filter((card) => {
      const entry = localCollection[card.id];
      if (!entry) return false;
      const total = (entry.count || 0) + (entry.countHolo || 0);
      if (total <= 0) return false;

      if (onlyDuplicates && total <= 1) return false;

      if (offeredSearch.trim()) {
        const q = offeredSearch.toLowerCase();
        return (
          card.title.toLowerCase().includes(q) ||
          card.developer.toLowerCase().includes(q) ||
          String(card.cardNumber).includes(q)
        );
      }
      return true;
    });
  }, [cardsPool, localCollection, onlyDuplicates, offeredSearch]);

  // Cartes disponibles pour la demande
  const availableRequestedCards = useMemo(() => {
    return cardsPool.filter((card) => {
      if (requestedRarityFilter !== 'all' && card.rarity !== requestedRarityFilter) {
        return false;
      }
      if (requestedSearch.trim()) {
        const q = requestedSearch.toLowerCase();
        return (
          card.title.toLowerCase().includes(q) ||
          card.developer.toLowerCase().includes(q) ||
          String(card.cardNumber).includes(q)
        );
      }
      return true;
    });
  }, [cardsPool, requestedRarityFilter, requestedSearch]);

  if (!isTradeModalOpen) return null;

  // Soumission de la proposition d'échange
  const handleCreateTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFriend) {
      setActionError('Veuillez sélectionner un compagnon mutuel.');
      soundFx.playError();
      return;
    }
    if (!selectedOfferedCard) {
      setActionError('Veuillez sélectionner la carte que vous souhaitez offrir.');
      soundFx.playError();
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const res = await createTrade({
      fromFriendCode: myFriendCode,
      fromUsername: profile.username || 'Explorateur',
      fromAvatarId: profile.avatarId || 'owl',
      toFriendCode: targetFriend.friendCode,
      toUsername: targetFriend.username,
      toAvatarId: targetFriend.avatarId,

      offeredCardId: selectedOfferedCard.id,
      offeredCardIsHolo: offeredIsHolo,
      offeredCardTitle: selectedOfferedCard.title,
      offeredCardRarity: selectedOfferedCard.rarity,
      offeredCardImageUrl: selectedOfferedCard.imageUrl,
      offeredCardNumber: selectedOfferedCard.cardNumber,

      requestedCardId: requestedMode === 'specific' && selectedRequestedCard ? selectedRequestedCard.id : 'any',
      requestedCardIsHolo: requestedMode === 'specific' ? requestedIsHolo : false,
      requestedCardTitle: requestedMode === 'specific' && selectedRequestedCard ? selectedRequestedCard.title : 'Au choix du compagnon',
      requestedCardRarity: requestedMode === 'specific' && selectedRequestedCard ? selectedRequestedCard.rarity : undefined,
      requestedCardImageUrl: requestedMode === 'specific' && selectedRequestedCard ? selectedRequestedCard.imageUrl : undefined,
      requestedCardNumber: requestedMode === 'specific' && selectedRequestedCard ? selectedRequestedCard.cardNumber : undefined,

      note: tradeNote.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setActionSuccess(`Offre d'échange envoyée à ${targetFriend.username} !`);
      setSelectedOfferedCard(null);
      setSelectedRequestedCard(null);
      setTradeNote('');
      setTimeout(() => {
        setActiveTab('outgoing');
        setActionSuccess(null);
      }, 1500);
    } else {
      soundFx.playError();
      setActionError(res.error || 'Impossible d\'envoyer l\'offre d\'échange.');
    }
  };

  // Répondre à une offre (Accepter)
  const handleAcceptTrade = async (trade: CardTradeOffer) => {
    // Si la demande est "au choix", ouvrir la sous-modale de sélection de la contre-carte
    if (trade.requestedCardId === 'any' || !trade.requestedCardId) {
      setCounterTradeTarget(trade);
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    const res = await respondTrade({
      tradeId: trade.id,
      response: 'accept',
    });
    setIsSubmitting(false);

    if (res.success) {
      soundFx.playSuccess();
      setActionSuccess(res.message || 'Échange accepté et conclu avec succès !');
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      soundFx.playError();
      setActionError(res.error || 'Erreur lors de l\'acceptation.');
    }
  };

  // Soumission de l'acceptation avec contre-carte sélectionnée
  const handleConfirmCounterAccept = async () => {
    if (!counterTradeTarget || !counterCard) return;

    setIsSubmitting(true);
    setActionError(null);
    const res = await respondTrade({
      tradeId: counterTradeTarget.id,
      response: 'accept',
      counterCardId: counterCard.id,
      counterCardIsHolo: counterIsHolo,
      counterCardTitle: counterCard.title,
      counterCardRarity: counterCard.rarity,
      counterCardImageUrl: counterCard.imageUrl,
      counterCardNumber: counterCard.cardNumber,
    });
    setIsSubmitting(false);

    if (res.success) {
      soundFx.playSuccess();
      setCounterTradeTarget(null);
      setCounterCard(null);
      setActionSuccess(res.message || 'Échange accepté avec succès !');
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      soundFx.playError();
      setActionError(res.error || 'Erreur lors de l\'acceptation.');
    }
  };

  // Refuser
  const handleDeclineTrade = async (tradeId: string) => {
    setIsSubmitting(true);
    await respondTrade({ tradeId, response: 'decline' });
    setIsSubmitting(false);
  };

  // Annuler
  const handleCancelTrade = async (tradeId: string) => {
    setIsSubmitting(true);
    await respondTrade({ tradeId, response: 'cancel' });
    setIsSubmitting(false);
  };

  if (!isTradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#03150f] sm:border-2 border-0 border-amber-500/50 sm:rounded-2xl rounded-none w-full h-full sm:h-auto max-w-4xl max-h-[100dvh] sm:max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* En-tête */}
        <div className="px-4 py-3 bg-[#06241b] border-b border-[#059669]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Centre d'Échanges de Cartes</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Bilatéral Sécurisé
                </span>
              </h2>
              <p className="text-[10px] text-emerald-300/80">
                Échangez vos pépites en double avec vos compagnons mutuels certifiés.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshTrades()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition cursor-pointer"
              title="Actualiser les offres"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={closeTradeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre d'onglets */}
        <div className="flex flex-wrap items-center px-4 bg-[#041912] border-b border-emerald-500/20 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('create');
            }}
            className={`py-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Proposer un échange</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('incoming');
            }}
            className={`py-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'incoming'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Offres reçues</span>
            {pendingIncomingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-600 text-white animate-pulse">
                {pendingIncomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('outgoing');
            }}
            className={`py-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'outgoing'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Offres envoyées</span>
            {outgoingTrades.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-slate-300">
                {outgoingTrades.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('history');
            }}
            className={`py-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historique ({tradeHistory.length})</span>
          </button>
        </div>

        {/* Bannières d'alerte / succès */}
        {actionError && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button type="button" onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}
        {actionSuccess && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Corps défilable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ======================================================== */}
          {/* ONGLET 1 : PROPOSER UN ÉCHANGE                            */}
          {/* ======================================================== */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateTradeSubmit} className="space-y-4">
              {/* Étape 1 : Choisir le compagnon */}
              <div className="p-3 rounded-xl bg-[#061e16] border border-[#174d39]">
                <label className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Sélectionner un Compagnon Mutuel</span>
                </label>

                {mutualFriends.length === 0 ? (
                  <div className="p-3 rounded-lg bg-black/40 text-center text-xs text-slate-400">
                    Vous n'avez aucun compagnon mutuel pour le moment. Ajoutez des amis dans le Cercle des Compagnons pour échanger !
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {mutualFriends.map((f) => {
                      const isSelected = targetFriend?.friendCode === f.friendCode;
                      return (
                        <button
                          key={f.friendCode}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setTargetFriend(f);
                          }}
                          className={`p-2 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                              : 'bg-[#03130d] border-slate-800 hover:border-emerald-500/50 text-slate-300'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-emerald-900 border border-emerald-500/40 flex items-center justify-center text-xs shrink-0">
                            🦉
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate">{f.username}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{f.friendCode}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Étape 2 & 3 : Carte Offerte vs Carte Demandée */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GAUCHE : CARTE OFFERTE */}
                <div className="p-3 rounded-xl bg-[#061e16] border border-[#174d39] flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Votre Carte Offerte</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOnlyDuplicates(!onlyDuplicates)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        onlyDuplicates
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {onlyDuplicates ? 'Mes doubles (x2+)' : 'Tous mes exemplaires'}
                    </button>
                  </div>

                  {/* Recherche */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={offeredSearch}
                      onChange={(e) => setOfferedSearch(e.target.value)}
                      placeholder="Filtrer mes cartes..."
                      className="w-full pl-8 pr-3 py-1 rounded-lg bg-black/60 border border-emerald-500/30 text-xs text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Aperçu carte choisie */}
                  {selectedOfferedCard ? (
                    <div className="p-2.5 rounded-xl bg-[#02130d] border border-amber-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={selectedOfferedCard.imageUrl}
                          alt=""
                          className="w-12 h-14 object-cover rounded border border-white/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${CARD_RARITY_METADATA[selectedOfferedCard.rarity].badgeClass}`}>
                            {CARD_RARITY_METADATA[selectedOfferedCard.rarity].nameFr}
                          </span>
                          <div className="text-xs font-bold text-white truncate mt-0.5">
                            {selectedOfferedCard.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            #{String(selectedOfferedCard.cardNumber).padStart(3, '0')}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedOfferedCard(null)}
                          className="text-[10px] text-slate-400 hover:text-rose-400"
                        >
                          Changer
                        </button>
                        {/* Toggle Holo si possédé */}
                        {(localCollection[selectedOfferedCard.id]?.countHolo || 0) > 0 && (
                          <button
                            type="button"
                            onClick={() => setOfferedIsHolo(!offeredIsHolo)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition cursor-pointer ${
                              offeredIsHolo
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-cyan-300" />
                            <span>Holo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Liste de sélection */
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {availableOfferedCards.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic p-3 text-center">
                          Aucune carte correspondante disponible.
                        </p>
                      ) : (
                        availableOfferedCards.map((c) => {
                          const entry = localCollection[c.id];
                          const normal = entry?.count || 0;
                          const holo = entry?.countHolo || 0;
                          const meta = CARD_RARITY_METADATA[c.rarity];
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedOfferedCard(c);
                                setOfferedIsHolo(normal === 0 && holo > 0);
                              }}
                              className="w-full p-1.5 rounded-lg bg-[#02130d] border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={c.imageUrl} alt="" className="w-7 h-8 object-cover rounded shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{c.title}</div>
                                  <span className={`text-[8px] font-bold uppercase px-1 rounded ${meta.badgeClass}`}>
                                    {meta.nameFr}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 text-right shrink-0">
                                {normal > 0 && <span>x{normal}</span>}
                                {holo > 0 && <span className="ml-1 text-cyan-300">x{holo}✨</span>}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* DROITE : CARTE DEMANDÉE */}
                <div className="p-3 rounded-xl bg-[#061e16] border border-[#174d39] flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>3. Carte Demandée</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRequestedMode('specific')}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          requestedMode === 'specific'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Précise
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestedMode('any');
                          setSelectedRequestedCard(null);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          requestedMode === 'any'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Au choix
                      </button>
                    </div>
                  </div>

                  {requestedMode === 'any' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl bg-[#02130d] border border-dashed border-emerald-500/40 text-center">
                      <Sparkles className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
                      <div className="text-xs font-bold text-white mb-1">Carte au choix du compagnon</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                        Votre ami pourra choisir parmi ses propres doubles la carte qu'il souhaite vous offrir en retour !
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Filtres & Recherche */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={requestedSearch}
                            onChange={(e) => setRequestedSearch(e.target.value)}
                            placeholder="Rechercher une carte..."
                            className="w-full pl-8 pr-2 py-1 rounded-lg bg-black/60 border border-emerald-500/30 text-xs text-white placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>
                        <select
                          value={requestedRarityFilter}
                          onChange={(e) => setRequestedRarityFilter(e.target.value)}
                          className="px-2 py-1 rounded-lg bg-black/60 border border-emerald-500/30 text-xs text-white focus:outline-none"
                        >
                          <option value="all">Toutes</option>
                          {RARITIES.map((r) => (
                            <option key={r} value={r}>{CARD_RARITY_METADATA[r].nameFr}</option>
                          ))}
                        </select>
                      </div>

                      {/* Aperçu carte demandée */}
                      {selectedRequestedCard ? (
                        <div className="p-2.5 rounded-xl bg-[#02130d] border border-amber-500/40 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={selectedRequestedCard.imageUrl}
                              alt=""
                              className="w-12 h-14 object-cover rounded border border-white/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${CARD_RARITY_METADATA[selectedRequestedCard.rarity].badgeClass}`}>
                                {CARD_RARITY_METADATA[selectedRequestedCard.rarity].nameFr}
                              </span>
                              <div className="text-xs font-bold text-white truncate mt-0.5">
                                {selectedRequestedCard.title}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                #{String(selectedRequestedCard.cardNumber).padStart(3, '0')}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedRequestedCard(null)}
                              className="text-[10px] text-slate-400 hover:text-rose-400"
                            >
                              Changer
                            </button>
                            <button
                              type="button"
                              onClick={() => setRequestedIsHolo(!requestedIsHolo)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition cursor-pointer ${
                                requestedIsHolo
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-cyan-300" />
                              <span>Holo</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Liste des cartes du catalogue */
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {isLoadingFriendBinder && (
                            <div className="p-1.5 rounded bg-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                              <span>Inspection du classeur du compagnon...</span>
                            </div>
                          )}

                          {/* Indication des doubles de l'ami si disponibles */}
                          {friendBinder && Object.keys(friendBinder.duplicates).length > 0 && (
                            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200">
                              ⭐ Ce compagnon possède des doubles déclarés dans son classeur !
                            </div>
                          )}

                          {availableRequestedCards.slice(0, 50).map((c) => {
                            const isFriendDuplicate = Boolean(friendBinder?.duplicates[c.id]);
                            const meta = CARD_RARITY_METADATA[c.rarity];
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  soundFx.playClick();
                                  setSelectedRequestedCard(c);
                                }}
                                className={`w-full p-1.5 rounded-lg border flex items-center justify-between text-left transition cursor-pointer ${
                                  isFriendDuplicate
                                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                                    : 'bg-[#02130d] border-slate-800 hover:border-emerald-500/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={c.imageUrl} alt="" className="w-7 h-8 object-cover rounded shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                      <span>{c.title}</span>
                                      {isFriendDuplicate && (
                                        <span className="text-[9px] text-amber-300 font-bold" title="L'ami possède ce double">⭐</span>
                                      )}
                                    </div>
                                    <span className={`text-[8px] font-bold uppercase px-1 rounded ${meta.badgeClass}`}>
                                      {meta.nameFr}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] text-emerald-400 group-hover:underline shrink-0">
                                  Choisir →
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Étape 4 : Note optionnelle & validation */}
              <div className="p-3 rounded-xl bg-[#061e16] border border-[#174d39] space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Message ou note d'accompagnement (optionnel) :</span>
                </label>
                <input
                  type="text"
                  value={tradeNote}
                  onChange={(e) => setTradeNote(e.target.value)}
                  placeholder="Ex: Salut ! Je cherche à compléter mon deck roguelike 🦉"
                  maxLength={160}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-emerald-500/40 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !targetFriend || !selectedOfferedCard}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer l\'Offre d\'Échange'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* ONGLET 2 : OFFRES REÇUES                                  */}
          {/* ======================================================== */}
          {activeTab === 'incoming' && (
            <div className="space-y-3">
              {incomingTrades.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Aucune proposition d'échange reçue pour l'instant
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Lorsque vos compagnons vous proposent des cartes, elles apparaîtront directement ici pour validation.
                  </p>
                </div>
              ) : (
                incomingTrades.map((trade) => {
                  const hasRequested = trade.requestedCardId === 'any'
                    ? true
                    : Boolean(localCollection[trade.requestedCardId] && ((localCollection[trade.requestedCardId]?.count || 0) > 0 || (localCollection[trade.requestedCardId]?.countHolo || 0) > 0));

                  const offeredMeta = CARD_RARITY_METADATA[trade.offeredCardRarity] || CARD_RARITY_METADATA.common;
                  const requestedMeta = trade.requestedCardRarity ? CARD_RARITY_METADATA[trade.requestedCardRarity as CardRarity] : null;

                  return (
                    <div
                      key={trade.id}
                      className="p-3.5 rounded-2xl bg-[#061e16] border border-[#174d39] space-y-3 shadow-md"
                    >
                      {/* En-tête de l'offre */}
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-xs">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span>🦉 Proposition de {trade.fromUsername}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({trade.fromFriendCode})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(trade.createdAt * 1000).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Face à Face des Cartes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        {/* Carte Offerte (Vous recevez) */}
                        <div className="p-2.5 rounded-xl bg-[#02130d] border border-emerald-500/40 flex items-center gap-3">
                          <img
                            src={trade.offeredCardImageUrl}
                            alt=""
                            className="w-12 h-14 object-cover rounded border border-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase text-emerald-400">
                              Vous recevez :
                            </span>
                            <div className="text-xs font-bold text-white truncate">
                              {trade.offeredCardTitle}
                              {trade.offeredCardIsHolo && <span className="text-cyan-300 ml-1">✨ Holo</span>}
                            </div>
                            <span className={`text-[8px] font-bold uppercase px-1 rounded ${offeredMeta.badgeClass}`}>
                              {offeredMeta.nameFr}
                            </span>
                          </div>
                        </div>

                        {/* Carte Demandée (Vous donnez) */}
                        <div className="p-2.5 rounded-xl bg-[#02130d] border border-amber-500/40 flex items-center gap-3">
                          {trade.requestedCardImageUrl ? (
                            <img
                              src={trade.requestedCardImageUrl}
                              alt=""
                              className="w-12 h-14 object-cover rounded border border-white/20 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase text-amber-400">
                              En échange de :
                            </span>
                            <div className="text-xs font-bold text-white truncate">
                              {trade.requestedCardTitle}
                              {trade.requestedCardIsHolo && <span className="text-cyan-300 ml-1">✨ Holo</span>}
                            </div>
                            {requestedMeta && (
                              <span className={`text-[8px] font-bold uppercase px-1 rounded ${requestedMeta.badgeClass}`}>
                                {requestedMeta.nameFr}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      {trade.note && (
                        <div className="p-2 rounded-lg bg-black/40 text-[11px] text-slate-300 italic">
                          "{trade.note}"
                        </div>
                      )}

                      {/* Boutons d'action */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-500/20">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleDeclineTrade(trade.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                        >
                          Refuser
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting || !hasRequested}
                          onClick={() => handleAcceptTrade(trade)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {trade.requestedCardId === 'any' ? 'Choisir la carte & Accepter' : 'Accepter l\'Échange'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 3 : OFFRES ENVOYÉES                                */}
          {/* ======================================================== */}
          {activeTab === 'outgoing' && (
            <div className="space-y-3">
              {outgoingTrades.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-200 mb-1">
                    Aucune offre d'échange en cours
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Proposez un échange à l'un de vos compagnons depuis le premier onglet !
                  </p>
                </div>
              ) : (
                outgoingTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="p-3.5 rounded-2xl bg-[#061e16] border border-[#174d39] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={trade.offeredCardImageUrl} alt="" className="w-10 h-12 object-cover rounded shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">
                          Offert : {trade.offeredCardTitle} ➔ Demandé : {trade.requestedCardTitle}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          Envoyé à : <strong>{trade.toUsername}</strong> ({trade.toFriendCode})
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleCancelTrade(trade.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      Annuler
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 4 : HISTORIQUE                                    */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {tradeHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucun historique d'échange archivé pour le moment.
                </div>
              ) : (
                tradeHistory.map((trade) => {
                  const isAccepted = trade.status === 'accepted';
                  const isDeclined = trade.status === 'declined';
                  const isCanceled = trade.status === 'canceled';

                  return (
                    <div
                      key={trade.id}
                      className="p-2.5 rounded-xl bg-[#02130d] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">
                          {trade.offeredCardTitle} ⇄ {trade.requestedCardTitle}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Avec {trade.fromFriendCode === myFriendCode ? trade.toUsername : trade.fromUsername} • {new Date((trade.updatedAt || trade.createdAt) * 1000).toLocaleDateString()}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isAccepted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isDeclined
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isCanceled
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {isAccepted ? 'Accepté ✓' : isDeclined ? 'Refusé' : isCanceled ? 'Annulé' : 'Expiré'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal de sélection de contre-carte si offre "au choix" */}
        {counterTradeTarget && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
            <div className="bg-[#03150f] border-2 border-emerald-500/50 rounded-2xl p-4 max-w-md w-full space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Choisir la carte à donner en échange</span>
                </div>
                <button type="button" onClick={() => setCounterTradeTarget(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <p className="text-xs text-slate-300">
                {counterTradeTarget.fromUsername} vous propose <strong>{counterTradeTarget.offeredCardTitle}</strong>. Choisissez la carte que vous lui cédez :
              </p>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {availableOfferedCards.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setCounterCard(c);
                    }}
                    className={`w-full p-1.5 rounded-lg border flex items-center justify-between text-left transition cursor-pointer ${
                      counterCard?.id === c.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-white'
                        : 'bg-[#02130d] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={c.imageUrl} alt="" className="w-6 h-7 object-cover rounded shrink-0" />
                      <span className="text-xs font-bold truncate">{c.title}</span>
                    </div>
                    {counterCard?.id === c.id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Option Holo si le joueur possède un exemplaire brillant */}
              {counterCard && (localCollection[counterCard.id]?.countHolo || 0) > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#02130d] border border-cyan-500/30">
                  <span className="text-xs text-slate-300">Donner la version brillante :</span>
                  <button
                    type="button"
                    onClick={() => setCounterIsHolo(!counterIsHolo)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                      counterIsHolo
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Holographique</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => setCounterTradeTarget(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!counterCard || isSubmitting}
                  onClick={handleConfirmCounterAccept}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs disabled:opacity-40"
                >
                  Confirmer & Échanger
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeModal;
