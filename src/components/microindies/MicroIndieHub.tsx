import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Heart, 
  ExternalLink, 
  Globe, 
  Search, 
  Trophy, 
  Gamepad2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { soundFx } from '../../utils/audio';
import { INITIAL_MICRO_INDIES } from '../../data/microIndies';
import { ProposeMicroIndieModal } from './ProposeMicroIndieModal';
import type { MicroIndieGame } from '../../types/microIndie';

type FilterType = 'all' | 'itch' | 'steam' | 'web' | 'free' | 'jam';

export const MicroIndieHub: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

  const [games, setGames] = useState<MicroIndieGame[]>(INITIAL_MICRO_INDIES);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('hoot_liked_micro_indies');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Charger les propositions communautaires depuis l'API PHP
  useEffect(() => {
    fetch('/api/micro_indies.php?action=list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.microIndies) && data.microIndies.length > 0) {
          setGames((prev) => {
            const map = new Map<string, MicroIndieGame>();
            // Ajouter d'abord les jeux initiaux
            prev.forEach((g) => map.set(g.id, g));
            // Ajouter les jeux communautaires approuvés
            data.microIndies.forEach((g: MicroIndieGame) => map.set(g.id, g));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {
        // Mode hors-ligne : conserve INITIAL_MICRO_INDIES
      });
  }, []);

  const handleLike = async (gameId: string) => {
    if (likedIds.has(gameId)) return;
    soundFx.playClick();

    const nextLiked = new Set(likedIds).add(gameId);
    setLikedIds(nextLiked);
    try {
      localStorage.setItem('hoot_liked_micro_indies', JSON.stringify(Array.from(nextLiked)));
    } catch {
      // Ignorer
    }

    // Incrémenter localement
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, likesCount: (g.likesCount || 0) + 1 } : g))
    );

    // Synchroniser avec l'API
    try {
      await fetch('/api/micro_indies.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', id: gameId }),
      });
    } catch {
      // Ignorer
    }
  };

  const handleGameAdded = (newGame: MicroIndieGame) => {
    setGames((prev) => [newGame, ...prev]);
  };

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Filtre catégorie
      if (filter === 'itch' && game.platform !== 'itch' && game.platform !== 'both') return false;
      if (filter === 'steam' && game.platform !== 'steam' && game.platform !== 'both') return false;
      if (filter === 'web' && !game.playInBrowserUrl && game.platform !== 'web') return false;
      if (filter === 'free' && !game.isFree) return false;
      if (filter === 'jam' && !game.jam) return false;

      // Recherche texte
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = game.title.toLowerCase().includes(q);
        const devMatch = game.developer.toLowerCase().includes(q);
        const genreMatch = game.genre.some((g) => g.toLowerCase().includes(q));
        const jamMatch = Boolean(game.jam && game.jam.toLowerCase().includes(q));
        const pitchMatch =
          (game.tagline[currentLang] || game.tagline.fr || game.tagline.en || '').toLowerCase().includes(q);

        return titleMatch || devMatch || genreMatch || jamMatch || pitchMatch;
      }

      return true;
    });
  }, [games, filter, searchQuery, currentLang]);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] pb-24 text-emerald-100">
      {/* Hero Sylvestre */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#06241b] via-[#041a13] to-[#02100b] border-2 border-[#78350f] p-6 sm:p-10 mb-8 shadow-2xl">
        {/* Éléments botaniques d'arrière-plan */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('micro.badge', 'Scène Indé Émergente & Game Jams')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-amber-100 tracking-wide">
              {t('micro.title', 'La Clairière des Micro-Indés & Pépites Itch.io')}
            </h1>
            <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed">
              {t(
                'micro.subtitle',
                'Le sanctuaire dédié aux créateurs solos, prototypes de game jams et pépites indépendantes méconnues. Découvrez, jouez en direct et soutenez les développeurs de l’ombre !'
              )}
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsModalOpen(true);
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-2xl shadow-xl shadow-amber-900/40 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>{t('micro.proposeBtn', 'Proposer un Micro-Indé')}</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres rapides */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Filtres par pilules */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              filter === 'all'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                : 'bg-[#06241b] border-emerald-900 text-emerald-400 hover:text-emerald-200'
            }`}
          >
            {t('micro.filters.all', 'Toutes les pépites')} ({games.length})
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('itch');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
              filter === 'itch'
                ? 'bg-[#fa5c5c]/25 border-[#fa5c5c] text-rose-200 shadow-md'
                : 'bg-[#06241b] border-emerald-900 text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#fa5c5c]" />
            <span>Itch.io</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('steam');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
              filter === 'steam'
                ? 'bg-sky-600/25 border-sky-400 text-sky-200 shadow-md'
                : 'bg-[#06241b] border-emerald-900 text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Steam</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('web');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
              filter === 'web'
                ? 'bg-emerald-600/25 border-emerald-400 text-emerald-200 shadow-md'
                : 'bg-[#06241b] border-emerald-900 text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('micro.filters.web', 'Jouable en direct 🌐')}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('free');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
              filter === 'free'
                ? 'bg-teal-600/25 border-teal-400 text-teal-200 shadow-md'
                : 'bg-[#06241b] border-emerald-900 text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <span>{t('micro.filters.free', '100% Gratuits 🆓')}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('jam');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
              filter === 'jam'
                ? 'bg-purple-600/25 border-purple-400 text-purple-200 shadow-md'
                : 'bg-[#06241b] border-emerald-900 text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('micro.filters.jam', 'Game Jams 🏆')}</span>
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('micro.searchPlaceholder', 'Rechercher un créateur, un jeu...')}
            className="w-full pl-10 pr-4 py-2 bg-[#06241b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Grille des cartes Micro-Indés */}
      {filteredGames.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#06241b]/60 border border-emerald-900/60 p-8 space-y-3">
          <Gamepad2 className="w-12 h-12 mx-auto text-emerald-600" />
          <h3 className="text-lg font-bold text-emerald-200">
            {t('micro.noGamesTitle', 'Aucun micro-indé ne correspond à ces critères')}
          </h3>
          <p className="text-sm text-emerald-400/80 max-w-md mx-auto">
            {t(
              'micro.noGamesDesc',
              'Soyez le premier à proposer une pépite méconnue ou réinitialisez les filtres !'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const isLiked = likedIds.has(game.id);
            const pitch = game.tagline[currentLang] || game.tagline.fr || game.tagline.en || '';
            const description =
              game.description[currentLang] || game.description.fr || game.description.en || pitch;
            const devMessage =
              game.developerMessage &&
              (game.developerMessage[currentLang] ||
                game.developerMessage.fr ||
                game.developerMessage.en);

            return (
              <div
                key={game.id}
                className="deferred-card group flex flex-col bg-gradient-to-b from-[#06241b] to-[#03150f] border-2 border-[#78350f]/60 hover:border-[#78350f] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image de couverture */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03150f] via-transparent to-black/30" />

                  {/* Badges de statut en haut */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                    {game.platform === 'itch' && (
                      <span className="px-2 py-0.5 rounded-md bg-[#fa5c5c] text-white text-[10px] font-bold shadow">
                        Itch.io
                      </span>
                    )}
                    {game.platform === 'steam' && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-700 text-white text-[10px] font-bold shadow">
                        Steam
                      </span>
                    )}
                    {game.platform === 'both' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-bold shadow">
                        Itch + Steam
                      </span>
                    )}
                    {game.isFree ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-[10px] font-bold backdrop-blur-sm">
                        Gratuit 🆓
                      </span>
                    ) : (
                      game.pricingText && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-bold backdrop-blur-sm">
                          {(game.pricingText && (game.pricingText[currentLang] || game.pricingText.fr)) || ''}
                        </span>
                      )
                    )}
                  </div>

                  {/* Game Jam tag */}
                  {game.jam && (
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-200 text-[10px] font-medium backdrop-blur-sm">
                        <Trophy className="w-3 h-3 text-purple-400" />
                        <span>{game.jam}</span>
                      </span>
                    </div>
                  )}

                  {/* Bouton Like / Coeur */}
                  <button
                    onClick={() => handleLike(game.id)}
                    className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 ${
                      isLiked
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-black/50 text-white/80 hover:text-rose-400 hover:bg-black/70'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-bold">{game.likesCount || 1}</span>
                  </button>
                </div>

                {/* Contenu textuel */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-amber-100 font-serif group-hover:text-amber-300 transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-xs text-emerald-400/90 font-medium">
                          {game.developer} · {game.releaseYear}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-emerald-200/80 line-clamp-2 leading-relaxed">
                      {description}
                    </p>

                    {/* Mot de l'auteur / anecdote */}
                    {devMessage && (
                      <div className="p-2.5 rounded-xl bg-[#02100b]/80 border border-emerald-900/60 text-emerald-300/90 text-xs italic">
                        « {devMessage} »
                      </div>
                    )}
                  </div>

                  {/* Pied de carte : badges et boutons d'action */}
                  <div className="space-y-3 pt-2 border-t border-emerald-900/50">
                    <div className="flex items-center justify-between text-[11px] text-emerald-500">
                      <div className="flex items-center gap-2">
                        <span>{game.artStyle[currentLang] || game.artStyle.fr}</span>
                        <span>•</span>
                        <span>{game.genre.join(', ')}</span>
                      </div>
                      {game.discoveredBy && (
                        <span className="text-emerald-400/80 font-medium">
                          🌱 {game.discoveredBy}
                        </span>
                      )}
                    </div>

                    {/* Liens d'action */}
                    <div className="flex flex-wrap gap-2">
                      {game.playInBrowserUrl && (
                        <a
                          href={game.playInBrowserUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundFx.playClick()}
                          className="flex-1 min-w-[120px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{t('micro.playOnline', 'Jouer en direct 🌐')}</span>
                        </a>
                      )}

                      {game.itchUrl && (
                        <a
                          href={game.itchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundFx.playClick()}
                          className="flex-1 min-w-[110px] py-2 px-3 bg-[#fa5c5c]/20 hover:bg-[#fa5c5c] text-rose-200 hover:text-white border border-[#fa5c5c]/40 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Itch.io</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {game.steamUrl && (
                        <a
                          href={game.steamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundFx.playClick()}
                          className="flex-1 min-w-[110px] py-2 px-3 bg-sky-950/60 hover:bg-sky-800 text-sky-200 hover:text-white border border-sky-600/40 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Steam</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale de soumission de jeu */}
      <ProposeMicroIndieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGameAdded={handleGameAdded}
      />
    </div>
  );
};
