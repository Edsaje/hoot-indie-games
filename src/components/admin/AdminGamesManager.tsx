import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  ExternalLink,
  Sparkles,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCw,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import {
  fetchAdminGameOverrides,
  saveAdminGame,
  toggleAdminGameVisibility,
  deleteAdminGame,
  restoreAdminGame,
  ADMIN_STEAM_ID,
  type AdminGameOverridesPayload,
} from '../../services/adminService';
import { steamCatalogService } from '../../services/steamCatalog';
import { soundFx } from '../../utils/audio';

interface AdminGamesManagerProps {
  currentSteamId?: string;
  onNotice?: (type: 'success' | 'error', message: string) => void;
  initialPrefillGame?: Partial<Game> | null;
  onPrefillConsumed?: () => void;
  onGameSaved?: (gameId?: string) => void;
}

interface EnrichedAdminGame extends Game {
  isCustomAdmin: boolean;
  isModified: boolean;
  isHidden: boolean;
}

const ITEMS_PER_PAGE = 12;

export const AdminGamesManager: React.FC<AdminGamesManagerProps> = ({
  currentSteamId = ADMIN_STEAM_ID,
  onNotice,
  initialPrefillGame,
  onPrefillConsumed,
  onGameSaved,
}) => {
  const [overrides, setOverrides] = useState<AdminGameOverridesPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'base' | 'custom' | 'modified' | 'hidden'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modale d'édition / création
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Confirmations
  const [confirmDelete, setConfirmDelete] = useState<EnrichedAdminGame | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<EnrichedAdminGame | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formId, setFormId] = useState('');
  const [formDeveloper, setFormDeveloper] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState<number>(2024);
  const [formGenres, setFormGenres] = useState<string>('');
  const [formArtStyleFr, setFormArtStyleFr] = useState('2D Pixel Art');
  const [formArtStyleEn, setFormArtStyleEn] = useState('2D Pixel Art');
  const [formCameraFr, setFormCameraFr] = useState('Vue de côté 2D');
  const [formCameraEn, setFormCameraEn] = useState('2D Side View');
  const [formSteamUrl, setFormSteamUrl] = useState('');
  const [formItchUrl, setFormItchUrl] = useState('');
  const [formIsFree, setFormIsFree] = useState(false);
  const [formHeaderImage, setFormHeaderImage] = useState('');
  const [formScreenshots, setFormScreenshots] = useState('');
  const [formTaglineFr, setFormTaglineFr] = useState('');
  const [formTaglineEn, setFormTaglineEn] = useState('');
  const [formComposer, setFormComposer] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminGameOverrides(currentSteamId);
      setOverrides(data);
      steamCatalogService.setServerOverrides(data);
    } catch (err: any) {
      console.error('Erreur chargement surcharges catalogue:', err);
      if (onNotice) onNotice('error', 'Impossible de récupérer les surcharges serveur du catalogue.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSteamId, onNotice]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pré-remplissage automatique depuis une suggestion communautaire
  useEffect(() => {
    if (initialPrefillGame) {
      soundFx.playClick();
      setIsCreatingNew(true);
      setEditingGame(initialPrefillGame);
      setFormTitle(initialPrefillGame.title || '');
      setFormId(initialPrefillGame.id || '');
      setFormDeveloper(initialPrefillGame.developer || '');
      setFormReleaseYear(initialPrefillGame.releaseYear || new Date().getFullYear());
      setFormGenres(Array.isArray(initialPrefillGame.genre) ? initialPrefillGame.genre.join(', ') : '');
      setFormArtStyleFr(initialPrefillGame.artStyle?.fr || '2D Pixel Art');
      setFormArtStyleEn(initialPrefillGame.artStyle?.en || '2D Pixel Art');
      setFormCameraFr(initialPrefillGame.camera?.fr || 'Vue de côté 2D');
      setFormCameraEn(initialPrefillGame.camera?.en || '2D Side View');
      setFormSteamUrl(initialPrefillGame.steamUrl || '');
      setFormItchUrl(initialPrefillGame.itchUrl || '');
      setFormIsFree(!!initialPrefillGame.isFree);
      setFormHeaderImage(initialPrefillGame.headerImage || '');
      setFormScreenshots((initialPrefillGame.screenshots || []).join('\n'));
      setFormTaglineFr(initialPrefillGame.hints?.tagline?.fr || '');
      setFormTaglineEn(initialPrefillGame.hints?.tagline?.en || '');
      setFormComposer(initialPrefillGame.hints?.composer || '');

      onPrefillConsumed?.();
    }
  }, [initialPrefillGame, onPrefillConsumed]);

  // Fusion complète du catalogue : INDIE_GAMES + customAdminGames + modifications + masqués
  const enrichedGamesList = useMemo<EnrichedAdminGame[]>(() => {
    const hiddenSet = new Set(overrides?.hiddenGameIds || []);
    const modifiedMap = overrides?.modifiedGames || {};
    const customList = overrides?.customAdminGames || [];

    const map = new Map<string, EnrichedAdminGame>();

    // 1. Jeux certifiés de base
    for (const baseGame of INDIE_GAMES) {
      const isModified = !!modifiedMap[baseGame.id];
      const isHidden = hiddenSet.has(baseGame.id);
      const mod = modifiedMap[baseGame.id];

      const merged: EnrichedAdminGame = {
        ...baseGame,
        ...(mod || {}),
        hints: {
          ...baseGame.hints,
          ...(mod?.hints || {}),
          tagline: {
            ...baseGame.hints.tagline,
            ...(mod?.hints?.tagline || {}),
          },
        },
        artStyle: {
          ...baseGame.artStyle,
          ...(mod?.artStyle || {}),
        },
        camera: {
          ...baseGame.camera,
          ...(mod?.camera || {}),
        },
        isCustomAdmin: false,
        isModified,
        isHidden,
      };

      map.set(baseGame.id, merged);
    }

    // 2. Jeux personnalisés ajoutés par l'admin
    for (const customGame of customList) {
      const isHidden = hiddenSet.has(customGame.id);
      map.set(customGame.id, {
        ...customGame,
        isCustomAdmin: true,
        isModified: false,
        isHidden,
      });
    }

    return Array.from(map.values());
  }, [overrides]);

  // Filtrage et recherche
  const filteredGames = useMemo(() => {
    let list = enrichedGamesList;

    // Filtre d'état
    if (statusFilter === 'base') {
      list = list.filter((g) => !g.isCustomAdmin && !g.isHidden);
    } else if (statusFilter === 'custom') {
      list = list.filter((g) => g.isCustomAdmin);
    } else if (statusFilter === 'modified') {
      list = list.filter((g) => g.isModified);
    } else if (statusFilter === 'hidden') {
      list = list.filter((g) => g.isHidden);
    }

    // Filtre textuel
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.developer.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        g.genre.some((gen) => gen.toLowerCase().includes(q))
    );
  }, [enrichedGamesList, statusFilter, searchQuery]);

  // Réinitialisation de page si le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE));
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  // Métriques
  const stats = useMemo(() => {
    const total = enrichedGamesList.length;
    const customCount = enrichedGamesList.filter((g) => g.isCustomAdmin).length;
    const modifiedCount = enrichedGamesList.filter((g) => g.isModified).length;
    const hiddenCount = enrichedGamesList.filter((g) => g.isHidden).length;
    const visibleCount = total - hiddenCount;
    return { total, customCount, modifiedCount, hiddenCount, visibleCount };
  }, [enrichedGamesList]);

  // Bascule de visibilité
  const handleToggleVisibility = async (game: EnrichedAdminGame) => {
    soundFx.playClick();
    const newHidden = !game.isHidden;
    try {
      const res = await toggleAdminGameVisibility(game.id, newHidden, currentSteamId);
      if (res.success) {
        if (onNotice) onNotice('success', res.message);
        loadData();
      } else {
        if (onNotice) onNotice('error', res.message || 'Erreur lors de la modification');
      }
    } catch {
      if (onNotice) onNotice('error', 'Erreur réseau lors de la bascule de visibilité');
    }
  };

  // Ouverture du formulaire d'édition
  const openEditModal = (game: EnrichedAdminGame) => {
    soundFx.playClick();
    setIsCreatingNew(false);
    setEditingGame(game);
    setFormTitle(game.title);
    setFormId(game.id);
    setFormDeveloper(game.developer);
    setFormReleaseYear(game.releaseYear);
    setFormGenres(game.genre.join(', '));
    setFormArtStyleFr(game.artStyle?.fr || '2D Pixel Art');
    setFormArtStyleEn(game.artStyle?.en || '2D Pixel Art');
    setFormCameraFr(game.camera?.fr || 'Vue de côté 2D');
    setFormCameraEn(game.camera?.en || '2D Side View');
    setFormSteamUrl(game.steamUrl || '');
    setFormItchUrl(game.itchUrl || '');
    setFormIsFree(!!game.isFree);
    setFormHeaderImage(game.headerImage || '');
    setFormScreenshots((game.screenshots || []).join('\n'));
    setFormTaglineFr(game.hints?.tagline?.fr || '');
    setFormTaglineEn(game.hints?.tagline?.en || '');
    setFormComposer(game.hints?.composer || '');
  };

  // Ouverture du formulaire de création
  const openCreateModal = () => {
    soundFx.playClick();
    setIsCreatingNew(true);
    setEditingGame({});
    setFormTitle('');
    setFormId('');
    setFormDeveloper('');
    setFormReleaseYear(new Date().getFullYear());
    setFormGenres('Aventure, Indépendant');
    setFormArtStyleFr('2D Pixel Art');
    setFormArtStyleEn('2D Pixel Art');
    setFormCameraFr('Vue de côté 2D');
    setFormCameraEn('2D Side View');
    setFormSteamUrl('');
    setFormItchUrl('');
    setFormIsFree(false);
    setFormHeaderImage('');
    setFormScreenshots('');
    setFormTaglineFr('Une aventure indépendante poétique et marquante.');
    setFormTaglineEn('A poetic and memorable indie adventure.');
    setFormComposer('');
  };

  // Sauvegarde du jeu
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      if (onNotice) onNotice('error', 'Le titre du jeu est obligatoire.');
      return;
    }

    soundFx.playClick();
    setIsSaving(true);

    const genresArray = formGenres
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const screenshotsArray = formScreenshots
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const gamePayload: Partial<Game> & { isCustomAdmin?: boolean } = {
      id: formId.trim() || undefined,
      title: formTitle.trim(),
      developer: formDeveloper.trim() || 'Studio Indé',
      releaseYear: Number(formReleaseYear) || 2024,
      genre: genresArray.length > 0 ? genresArray : ['Indépendant'],
      artStyle: {
        fr: formArtStyleFr.trim() || '2D Pixel Art',
        en: formArtStyleEn.trim() || '2D Pixel Art',
      },
      camera: {
        fr: formCameraFr.trim() || 'Vue de côté 2D',
        en: formCameraEn.trim() || '2D Side View',
      },
      steamUrl: formSteamUrl.trim() || undefined,
      itchUrl: formItchUrl.trim() || undefined,
      isFree: formIsFree,
      headerImage: formHeaderImage.trim() || undefined,
      screenshots: screenshotsArray,
      hints: {
        tagline: {
          fr: formTaglineFr.trim() || 'Un chef-d’œuvre indépendant captivant.',
          en: formTaglineEn.trim() || 'A captivating indie masterpiece.',
        },
        composer: formComposer.trim() || undefined,
      },
      isCustomAdmin: isCreatingNew || (editingGame as EnrichedAdminGame)?.isCustomAdmin,
    };

    try {
      const res = await saveAdminGame(gamePayload, currentSteamId);
      if (res.success) {
        soundFx.playVictory();
        if (onNotice) onNotice('success', res.message || 'Jeu enregistré avec succès !');
        setEditingGame(null);
        if (onGameSaved) onGameSaved(res.game?.id || formId);
        loadData();
      } else {
        if (onNotice) onNotice('error', res.message || 'Erreur lors de la sauvegarde');
      }
    } catch {
      if (onNotice) onNotice('error', 'Erreur réseau lors de la communication serveur');
    } finally {
      setIsSaving(false);
    }
  };

  // Suppression
  const handleDeleteGame = async () => {
    if (!confirmDelete) return;
    soundFx.playClick();
    try {
      const res = await deleteAdminGame(confirmDelete.id, currentSteamId);
      if (res.success) {
        if (onNotice) onNotice('success', res.message);
        setConfirmDelete(null);
        loadData();
      } else {
        if (onNotice) onNotice('error', res.message || 'Échec de la suppression');
      }
    } catch {
      if (onNotice) onNotice('error', 'Erreur réseau lors de la suppression');
    }
  };

  // Restauration
  const handleRestoreGame = async () => {
    if (!confirmRestore) return;
    soundFx.playClick();
    try {
      const res = await restoreAdminGame(confirmRestore.id, currentSteamId);
      if (res.success) {
        if (onNotice) onNotice('success', res.message);
        setConfirmRestore(null);
        loadData();
      } else {
        if (onNotice) onNotice('error', res.message || 'Échec de la restauration');
      }
    } catch {
      if (onNotice) onNotice('error', 'Erreur réseau lors de la restauration');
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre d'en-tête & métriques */}
      <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Gestionnaire Souverain des Pépites Indés</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez instantanément les fiches de jeux, masquez des titres ou ajoutez de nouvelles pépites sans redéploiement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                loadData();
              }}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Recharger le catalogue"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Actualiser</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Pépite</span>
            </button>
          </div>
        </div>

        {/* Compteurs / Métriques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-white/5 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Jeux</span>
            <span className="text-lg font-black text-white font-mono">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Publics / Actifs</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{stats.visibleCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider">Modifiés</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{stats.modifiedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">Ajouts Admin</span>
            <span className="text-lg font-black text-amber-400 font-mono">{stats.customCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-rose-400 text-[10px] uppercase font-bold tracking-wider">Masqués</span>
            <span className="text-lg font-black text-rose-400 font-mono">{stats.hiddenCount}</span>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres de statut */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, studio, genre..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c1220] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pilules de statut */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {[
            { id: 'all', label: `Tous (${stats.total})` },
            { id: 'base', label: `Base (${stats.total - stats.customCount})` },
            { id: 'custom', label: `Admin (${stats.customCount})` },
            { id: 'modified', label: `Modifiés (${stats.modifiedCount})` },
            { id: 'hidden', label: `Masqués (${stats.hiddenCount})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                soundFx.playClick();
                setStatusFilter(pill.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille / Liste des Jeux */}
      {paginatedGames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c1220] border border-white/5 space-y-3">
          <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Aucun jeu ne correspond à vos critères de recherche.</p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginatedGames.map((game) => {
            const thumbnail = game.headerImage || game.screenshots?.[0] || '/logo.png';
            return (
              <div
                key={game.id}
                className={`p-3.5 rounded-2xl bg-[#0c1220] border flex flex-col justify-between transition-all space-y-3 ${
                  game.isHidden
                    ? 'border-rose-500/30 bg-rose-950/10 opacity-75'
                    : game.isModified
                    ? 'border-cyan-500/30 hover:border-cyan-500/50'
                    : game.isCustomAdmin
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* En-tête de carte */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <img
                      src={thumbnail}
                      alt={game.title}
                      className="w-16 h-12 object-cover rounded-lg border border-white/10 shrink-0 bg-slate-900"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-white text-sm truncate" title={game.title}>
                          {game.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">({game.releaseYear})</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5" title={game.developer}>
                        {game.developer}
                      </p>

                      {/* Badges de statut */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {game.isHidden && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" />
                            <span>Masqué</span>
                          </span>
                        )}
                        {game.isCustomAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Ajout Admin</span>
                          </span>
                        )}
                        {game.isModified && !game.isCustomAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Modifié</span>
                          </span>
                        )}
                        {!game.isCustomAdmin && !game.isModified && !game.isHidden && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Certifié Hoot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Genres & Style */}
                  <div className="flex flex-wrap gap-1">
                    {game.genre.slice(0, 3).map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-300 font-medium"
                      >
                        {g}
                      </span>
                    ))}
                    {game.genre.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-500">
                        +{game.genre.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions sur le jeu */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {game.steamUrl && (
                      <a
                        href={game.steamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                        title="Ouvrir sur Steam"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Masquer / Afficher */}
                    <button
                      onClick={() => handleToggleVisibility(game)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        game.isHidden
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title={game.isHidden ? 'Rendre visible sur le site public' : 'Masquer du site public'}
                    >
                      {game.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Restaurer (si modifié ou masqué) */}
                    {(game.isModified || game.isHidden) && !game.isCustomAdmin && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setConfirmRestore(game);
                        }}
                        className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                        title="Restaurer aux valeurs canoniques d'origine"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Éditer */}
                    <button
                      onClick={() => openEditModal(game)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Éditer</span>
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setConfirmDelete(game);
                      }}
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
                      title={game.isCustomAdmin ? 'Supprimer définitivement' : 'Retirer du catalogue (masquer)'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 rounded-2xl bg-[#0c1220] border border-white/5 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">
            Page <strong className="text-white">{currentPage}</strong> sur{' '}
            <strong className="text-white">{totalPages}</strong> ({filteredGames.length} jeux)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION / CRÉATION DE JEU */}
      <AnimatePresence>
        {editingGame !== null && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingGame(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0c1220] border-2 border-amber-500/40 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Entête */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#080d17]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/35 text-amber-400 flex items-center justify-center">
                    {isCreatingNew ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {isCreatingNew ? 'Ajouter une Nouvelle Pépite' : `Modifier la Pépite : ${formTitle}`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isCreatingNew
                        ? 'Créez une nouvelle fiche enregistrée dans le catalogue souverain'
                        : 'Les modifications surchargent les valeurs par défaut en temps réel'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingGame(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulaire défilable */}
              <form onSubmit={handleSaveForm} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {editingGame?.steamAppId && isCreatingNew && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Fiche pré-remplie depuis la suggestion de la communauté (AppID Steam : <strong>{editingGame.steamAppId}</strong>). Ajustez les informations puis cliquez sur <strong>Enregistrer la Pépite</strong> pour l'intégrer au catalogue public.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Titre */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Titre du Jeu *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Hollow Knight"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  {/* Identifiant Slug */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Identifiant (Slug unique)</label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="Ex: hollow-knight (auto si vide)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  {/* Studio */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Studio / Développeur</label>
                    <input
                      type="text"
                      value={formDeveloper}
                      onChange={(e) => setFormDeveloper(e.target.value)}
                      placeholder="Ex: Team Cherry"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  {/* Année de sortie */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Année de Sortie</label>
                    <input
                      type="number"
                      min="1980"
                      max="2035"
                      value={formReleaseYear}
                      onChange={(e) => setFormReleaseYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                </div>

                {/* Genres */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Genres (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={formGenres}
                    onChange={(e) => setFormGenres(e.target.value)}
                    placeholder="Ex: Metroidvania, Action, Plateforme 2D"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Style Visuel */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Style Visuel (FR)</label>
                    <input
                      type="text"
                      value={formArtStyleFr}
                      onChange={(e) => setFormArtStyleFr(e.target.value)}
                      placeholder="Ex: 2D Dessiné main"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  {/* Perspective Caméra */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Perspective Caméra (FR)</label>
                    <input
                      type="text"
                      value={formCameraFr}
                      onChange={(e) => setFormCameraFr(e.target.value)}
                      placeholder="Ex: Vue de côté 2D"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Steam Store URL */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Lien Steam Store</label>
                    <input
                      type="url"
                      value={formSteamUrl}
                      onChange={(e) => setFormSteamUrl(e.target.value)}
                      placeholder="https://store.steampowered.com/app/..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                    />
                  </div>

                  {/* Itch.io URL */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Lien Itch.io (optionnel)</label>
                    <input
                      type="url"
                      value={formItchUrl}
                      onChange={(e) => setFormItchUrl(e.target.value)}
                      placeholder="https://creator.itch.io/game"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Gratuit Checkbox */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <input
                    type="checkbox"
                    id="formIsFreeCheckbox"
                    checked={formIsFree}
                    onChange={(e) => setFormIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="formIsFreeCheckbox" className="font-medium text-slate-300 cursor-pointer">
                    Jeu 100% Gratuit / En accès libre (0,00 €)
                  </label>
                </div>

                {/* Taglines FR & EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Accroche / Tagline (Français)</label>
                    <textarea
                      rows={2}
                      value={formTaglineFr}
                      onChange={(e) => setFormTaglineFr(e.target.value)}
                      placeholder="Une brève citation ou pitch de jeu..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Accroche / Tagline (Anglais)</label>
                    <textarea
                      rows={2}
                      value={formTaglineEn}
                      onChange={(e) => setFormTaglineEn(e.target.value)}
                      placeholder="Short pitch or quote in English..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                </div>

                {/* Image d'en-tête / Jaquette */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">URL Jaquette / Image d'En-tête</label>
                  <input
                    type="url"
                    value={formHeaderImage}
                    onChange={(e) => setFormHeaderImage(e.target.value)}
                    placeholder="https://cdn.akamai.steamstatic.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>

                {/* Captures d'écran */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">URLs Captures d'écran (1 par ligne)</label>
                  <textarea
                    rows={3}
                    value={formScreenshots}
                    onChange={(e) => setFormScreenshots(e.target.value)}
                    placeholder="https://...\nhttps://..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>

                {/* Compositeur */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Compositeur OST (optionnel)</label>
                  <input
                    type="text"
                    value={formComposer}
                    onChange={(e) => setFormComposer(e.target.value)}
                    placeholder="Ex: Christopher Larkin"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingGame(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la Pépite'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DE SUPPRESSION */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-[#0c1220] border-2 border-red-500/40 shadow-2xl z-10 space-y-4 text-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">
                  Supprimer « {confirmDelete.title} » ?
                </h4>
                <p className="text-slate-400">
                  {confirmDelete.isCustomAdmin
                    ? 'Ce jeu personnalisé sera définitivement supprimé des serveurs de Hoot Indie Games.'
                    : 'Ce jeu sera masqué du catalogue public et ne sera plus proposé aux joueurs.'}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteGame}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/30"
                >
                  Confirmer la suppression
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DE RESTAURATION */}
      <AnimatePresence>
        {confirmRestore && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmRestore(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-[#0c1220] border-2 border-cyan-500/40 shadow-2xl z-10 space-y-4 text-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">
                  Restaurer « {confirmRestore.title} » ?
                </h4>
                <p className="text-slate-400">
                  Toutes les surcharges manuelles de ce jeu seront annulées et ses valeurs canoniques certifiées d'origine seront rétablies.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmRestore(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRestoreGame}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30"
                >
                  Confirmer la restauration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
