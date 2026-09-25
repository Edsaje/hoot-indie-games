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
  Loader2,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import {
  fetchAdminGameOverrides,
  saveAdminGame,
  toggleAdminGameVisibility,
  toggleAdminGameGemStatus,
  deleteAdminGame,
  restoreAdminGame,
  ADMIN_STEAM_ID,
  type AdminGameOverridesPayload,
} from '../../services/adminService';
import { steamCatalogService } from '../../services/steamCatalog';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { soundFx } from '../../utils/audio';
import {
  inferCanonicalArtStyle,
  inferCanonicalCamera,
  inferEnrichedGenres,
  extractComposerFromText,
} from '../../utils/gameInference';
import type { CardRarity } from '../../types/cards';
import {
  computeGameRarity,
  extractSteamAppId,
  STEAM_RARITY_THRESHOLDS,
} from '../../data/cardsData';
import { getSteamStoreData, registerSteamStoreData } from '../../data/steamStoreData';

interface AdminGamesManagerProps {
  currentSteamId?: string;
  onNotice?: (type: 'success' | 'error', message: string) => void;
  initialPrefillGame?: Partial<Game> | null;
  onPrefillConsumed?: () => void;
  onGameSaved?: (gameId?: string) => void;
}

interface EnrichedAdminGame extends Game {
  isCustomAdmin: boolean;
  isCatalogBase?: boolean;
  isModified: boolean;
  isHidden: boolean;
  isGem: boolean;
}

const ITEMS_PER_PAGE = 12;

export const AdminGamesManager: React.FC<AdminGamesManagerProps> = ({
  currentSteamId = ADMIN_STEAM_ID,
  onNotice,
  initialPrefillGame,
  onPrefillConsumed,
  onGameSaved,
}) => {
  const { steamCatalog } = useSteamCatalog();
  const [overrides, setOverrides] = useState<AdminGameOverridesPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'gems' | 'catalog_only' | 'steam' | 'base' | 'custom' | 'modified' | 'hidden'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modale d'édition / création
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Détection & Remplissage automatique Steam
  const [steamLookupQuery, setSteamLookupQuery] = useState('');
  const [isFetchingSteam, setIsFetchingSteam] = useState(false);

  // Confirmations
  const [confirmDelete, setConfirmDelete] = useState<EnrichedAdminGame | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<EnrichedAdminGame | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formId, setFormId] = useState('');
  const [formDeveloper, setFormDeveloper] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState<number>(2024);
  const [formGenres, setFormGenres] = useState<string>('');
  const [formArtStyleFr, setFormArtStyleFr] = useState('Pixel Art');
  const [formArtStyleEn, setFormArtStyleEn] = useState('Pixel Art');
  const [formCameraFr, setFormCameraFr] = useState('Vue de côté 2D');
  const [formCameraEn, setFormCameraEn] = useState('2D Side-scroller');
  const [formSteamUrl, setFormSteamUrl] = useState('');
  const [formItchUrl, setFormItchUrl] = useState('');
  const [formIsFree, setFormIsFree] = useState(false);
  const [formIsGem, setFormIsGem] = useState(true);
  const [formHeaderImage, setFormHeaderImage] = useState('');
  const [formScreenshots, setFormScreenshots] = useState('');
  const [formTaglineFr, setFormTaglineFr] = useState('');
  const [formTaglineEn, setFormTaglineEn] = useState('');
  const [formComposer, setFormComposer] = useState('');
  const [formCardRarity, setFormCardRarity] = useState<'auto' | CardRarity>('auto');
  const [steamReviewsInfo, setSteamReviewsInfo] = useState<{
    totalReviews: number;
    positivePercent: number;
    desc?: string;
  } | null>(null);

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

  useEffect(() => {
    if (!steamCatalog || steamCatalog.length === 0) {
      steamCatalogService.loadCatalog();
    }
  }, [steamCatalog]);

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
      setFormArtStyleFr(initialPrefillGame.artStyle?.fr || 'Pixel Art');
      setFormArtStyleEn(initialPrefillGame.artStyle?.en || 'Pixel Art');
      setFormCameraFr(initialPrefillGame.camera?.fr || 'Vue de côté 2D');
      setFormCameraEn(initialPrefillGame.camera?.en || '2D Side-scroller');
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

  // Fusion complète du catalogue : INDIE_GAMES + catalogue Steam étendu + customAdminGames + modifications + masqués + pépites
  const enrichedGamesList = useMemo<EnrichedAdminGame[]>(() => {
    const hiddenSet = new Set(overrides?.hiddenGameIds || []);
    const modifiedMap = overrides?.modifiedGames || {};
    const customList = overrides?.customAdminGames || [];
    const excludedGemSet = new Set(overrides?.excludedFromGems || ['kernel-hearts']);
    const promotedGemSet = new Set(overrides?.promotedToGems || []);

    const map = new Map<string, EnrichedAdminGame>();
    const seenAppIds = new Set<string>();
    const seenTitles = new Set<string>();

    const extractAppId = (url?: string): string | null => {
      if (!url) return null;
      const m = url.match(/\/app\/(\d+)/);
      return m ? m[1] : null;
    };

    const normalizeTitle = (t: string): string => {
      return t
        .toLowerCase()
        .replace(/[:\-–—'’!?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // 1. Jeux certifiés de base (INDIE_GAMES)
    for (const baseGame of INDIE_GAMES) {
      const isModified = !!modifiedMap[baseGame.id];
      const isHidden = hiddenSet.has(baseGame.id);
      const isGem = !excludedGemSet.has(baseGame.id);
      const mod = modifiedMap[baseGame.id];

      const merged: EnrichedAdminGame = {
        ...baseGame,
        ...(mod || {}),
        genre: Array.isArray(mod?.genre) ? mod.genre : (Array.isArray(baseGame.genre) ? baseGame.genre : []),
        hints: {
          ...baseGame.hints,
          ...(mod?.hints || {}),
          tagline: {
            ...baseGame.hints?.tagline,
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
        isCatalogBase: false,
        isModified,
        isHidden,
        isGem,
      };

      map.set(baseGame.id, merged);
      const appId = extractAppId(baseGame.steamUrl) || baseGame.steamAppId?.toString();
      if (appId) seenAppIds.add(appId);
      const normTitle = normalizeTitle(baseGame.title);
      if (normTitle) seenTitles.add(normTitle);
    }

    // 2. Jeux du catalogue étendu Steam
    const extendedCatalog = steamCatalog && steamCatalog.length > 0 ? steamCatalog : steamCatalogService.getRawCatalog();
    for (const catGame of extendedCatalog) {
      const appId = extractAppId(catGame.steamUrl) || catGame.steamAppId?.toString();
      const normTitle = normalizeTitle(catGame.title);

      if (map.has(catGame.id)) continue;
      if (appId && seenAppIds.has(appId)) continue;
      if (normTitle && seenTitles.has(normTitle)) continue;

      const isModified = !!modifiedMap[catGame.id];
      const isHidden = hiddenSet.has(catGame.id);
      const isGem = (promotedGemSet.has(catGame.id) || (catGame as any).isGem === true) && !excludedGemSet.has(catGame.id);
      const mod = modifiedMap[catGame.id];

      const merged: EnrichedAdminGame = {
        ...catGame,
        ...(mod || {}),
        genre: Array.isArray(mod?.genre) ? mod.genre : (Array.isArray(catGame.genre) ? catGame.genre : []),
        hints: {
          ...catGame.hints,
          ...(mod?.hints || {}),
          tagline: {
            ...catGame.hints?.tagline,
            ...(mod?.hints?.tagline || {}),
          },
        },
        artStyle: {
          ...catGame.artStyle,
          ...(mod?.artStyle || {}),
        },
        camera: {
          ...catGame.camera,
          ...(mod?.camera || {}),
        },
        isCustomAdmin: false,
        isCatalogBase: true,
        isModified,
        isHidden,
        isGem,
      };

      map.set(catGame.id, merged);
      if (appId) seenAppIds.add(appId);
      if (normTitle) seenTitles.add(normTitle);
    }

    // 3. Jeux personnalisés ajoutés par l'admin
    for (const customGame of customList) {
      const isHidden = hiddenSet.has(customGame.id);
      const isGem = promotedGemSet.has(customGame.id) || (customGame as any).isGem === true;
      map.set(customGame.id, {
        ...customGame,
        genre: Array.isArray(customGame.genre) ? customGame.genre : [],
        isCustomAdmin: true,
        isCatalogBase: false,
        isModified: false,
        isHidden,
        isGem,
      });
    }

    return Array.from(map.values());
  }, [overrides, steamCatalog]);

  // Filtrage et recherche
  const filteredGames = useMemo(() => {
    let list = enrichedGamesList;

    // Filtre d'état
    if (statusFilter === 'gems') {
      list = list.filter((g) => g.isGem && !g.isHidden);
    } else if (statusFilter === 'catalog_only') {
      list = list.filter((g) => !g.isGem && !g.isHidden);
    } else if (statusFilter === 'steam') {
      list = list.filter((g) => g.isCatalogBase && !g.isHidden);
    } else if (statusFilter === 'base') {
      list = list.filter((g) => !g.isCustomAdmin && !g.isCatalogBase && !g.isHidden);
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
        (Array.isArray(g.genre) && g.genre.some((gen) => gen.toLowerCase().includes(q)))
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
    const gemCount = enrichedGamesList.filter((g) => g.isGem && !g.isHidden).length;
    const catalogOnlyCount = enrichedGamesList.filter((g) => !g.isGem && !g.isHidden).length;
    const baseCount = enrichedGamesList.filter((g) => !g.isCustomAdmin && !g.isCatalogBase && !g.isHidden).length;
    const steamCount = enrichedGamesList.filter((g) => g.isCatalogBase && !g.isHidden).length;
    const customCount = enrichedGamesList.filter((g) => g.isCustomAdmin).length;
    const modifiedCount = enrichedGamesList.filter((g) => g.isModified).length;
    const hiddenCount = enrichedGamesList.filter((g) => g.isHidden).length;
    const visibleCount = total - hiddenCount;
    return {
      total,
      gemCount,
      catalogOnlyCount,
      baseCount,
      steamCount,
      customCount,
      modifiedCount,
      hiddenCount,
      visibleCount,
    };
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

  // Bascule du statut Pépite (mis en avant dans Pépites vs Catalogue seul)
  const handleToggleGem = async (game: EnrichedAdminGame) => {
    soundFx.playClick();
    const nextIsGem = !game.isGem;
    try {
      const res = await toggleAdminGameGemStatus(game.id, nextIsGem, currentSteamId);
      if (res.success) {
        if (onNotice) {
          onNotice(
            'success',
            nextIsGem
              ? `Le jeu "${game.title}" apparaît désormais dans les Pépites !`
              : `Le jeu "${game.title}" a été retiré des Pépites (il reste disponible dans le catalogue).`
          );
        }
        loadData();
      } else {
        if (onNotice) onNotice('error', res.message || 'Erreur lors du changement de statut Pépite');
      }
    } catch {
      if (onNotice) onNotice('error', 'Erreur réseau lors du changement de statut Pépite');
    }
  };

  // Ouverture du formulaire d'édition
  const openEditModal = (game: EnrichedAdminGame) => {
    soundFx.playClick();
    setIsCreatingNew(false);
    setEditingGame(game);
    setSteamLookupQuery(game.steamAppId ? String(game.steamAppId) : game.steamUrl || '');
    setFormTitle(game.title);
    setFormId(game.id);
    setFormDeveloper(game.developer);
    setFormReleaseYear(game.releaseYear);
    setFormGenres(Array.isArray(game.genre) ? game.genre.join(', ') : '');
    setFormArtStyleFr(game.artStyle?.fr || 'Pixel Art');
    setFormArtStyleEn(game.artStyle?.en || 'Pixel Art');
    setFormCameraFr(game.camera?.fr || 'Vue de côté 2D');
    setFormCameraEn(game.camera?.en || '2D Side-scroller');
    setFormSteamUrl(game.steamUrl || '');
    setFormItchUrl(game.itchUrl || '');
    setFormIsFree(!!game.isFree);
    setFormIsGem(game.isGem);
    setFormHeaderImage(game.headerImage || '');
    setFormScreenshots((game.screenshots || []).join('\n'));
    setFormTaglineFr(game.hints?.tagline?.fr || '');
    setFormTaglineEn(game.hints?.tagline?.en || '');
    setFormComposer(game.hints?.composer || '');

    const appId = extractSteamAppId(game);
    const store = appId ? getSteamStoreData(appId) : null;
    if (store && store.totalReviews > 0) {
      setSteamReviewsInfo({
        totalReviews: store.totalReviews,
        positivePercent: store.positivePercent,
        desc: store.reviewScoreDesc?.fr,
      });
    } else {
      setSteamReviewsInfo(null);
    }
    setFormCardRarity(game.cardRarity || 'auto');
  };

  // Ouverture du formulaire de création
  const openCreateModal = () => {
    soundFx.playClick();
    setIsCreatingNew(true);
    setEditingGame({});
    setSteamLookupQuery('');
    setFormTitle('');
    setFormId('');
    setFormDeveloper('');
    setFormReleaseYear(new Date().getFullYear());
    setFormGenres('Action, Aventure');
    setFormArtStyleFr('Pixel Art');
    setFormArtStyleEn('Pixel Art');
    setFormCameraFr('Vue de côté 2D');
    setFormCameraEn('2D Side-scroller');
    setFormSteamUrl('');
    setFormItchUrl('');
    setFormIsFree(false);
    setFormIsGem(true);
    setFormHeaderImage('');
    setFormScreenshots('');
    setFormTaglineFr('');
    setFormTaglineEn('');
    setFormComposer('');
    setFormCardRarity('auto');
    setSteamReviewsInfo(null);
  };

  // Détection & Remplissage automatique depuis Steam (API)
  const handleAutoFetchSteam = async () => {
    const raw = steamLookupQuery.trim();
    if (!raw) return;
    const match = raw.match(/\b\d{4,9}\b/);
    const appId = match ? match[0] : '';
    if (!appId) {
      if (onNotice) onNotice('error', "Aucun AppID Steam numérique valide trouvé dans votre saisie.");
      return;
    }

    soundFx.playClick();
    setIsFetchingSteam(true);
    try {
      let dataFR: any = null;
      let dataEN: any = null;

      let fetchedReviews: any = null;
      try {
        const lookupRes = await fetch(`/api/suggest_game.php?action=lookup&appId=${appId}`);
        if (lookupRes.ok) {
          const lookupJson = await lookupRes.json();
          if (lookupJson.status === 'success' && lookupJson.dataFR) {
            dataFR = lookupJson.dataFR;
            dataEN = lookupJson.dataEN || lookupJson.dataFR;
            if (lookupJson.reviews) {
              fetchedReviews = lookupJson.reviews;
            }
          }
        }
      } catch (err) {
        console.warn('Erreur lookup proxy local:', err);
      }

      if (!dataFR) {
        // Fallback CORS
        const corsUrlFR = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=french`)}`;
        const corsUrlEN = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`)}`;
        const [frRes, enRes] = await Promise.all([fetch(corsUrlFR), fetch(corsUrlEN)]);
        const [frJson, enJson] = await Promise.all([frRes.json(), enRes.json()]);
        dataFR = frJson?.[appId]?.data;
        dataEN = enJson?.[appId]?.data || dataFR;
      }

      if (!dataFR || !dataFR.name) {
        throw new Error("Impossible de récupérer les métadonnées de ce jeu sur Steam.");
      }

      const title = dataFR.name.trim();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `game-${appId}`;
      const developer = dataFR.developers?.[0] || dataFR.publishers?.[0] || 'Studio Indépendant';
      const releaseYear = parseInt(
        dataFR.release_date?.date?.match(/\b(19\d\d|20\d\d)\b/)?.[1] || String(new Date().getFullYear()),
        10
      );
      const headerImage = dataFR.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
      const screenshots: string[] = (dataFR.screenshots || [])
        .map((sc: { path_full: string }) => sc.path_full)
        .slice(0, 6);
      while (screenshots.length < 6) {
        screenshots.push(headerImage);
      }

      const taglineFr = (dataFR.short_description || `${title} par ${developer}`).replace(/<[^>]+>/g, '').trim();
      const taglineEn = (dataEN?.short_description || `${title} by ${developer}`).replace(/<[^>]+>/g, '').trim();
      const fullDesc = `${title} ${developer} ${taglineFr} ${taglineEn} ${dataFR.detailed_description || ''} ${dataEN?.detailed_description || ''}`;

      const rawGenres = (dataFR.genres || []).map((g: { description: string }) => g.description);
      const rawCategories = (dataFR.categories || []).map((c: { description: string }) => c.description);
      const enrichedGenres = inferEnrichedGenres([...rawGenres, ...rawCategories], fullDesc);
      const artStyle = inferCanonicalArtStyle(fullDesc, enrichedGenres);
      const camera = inferCanonicalCamera(fullDesc, enrichedGenres);
      const extractedComposer = extractComposerFromText(fullDesc);

      setFormTitle(title);
      setFormId(slug);
      setFormDeveloper(developer);
      setFormReleaseYear(releaseYear);
      setFormSteamUrl(`https://store.steampowered.com/app/${appId}/`);
      setFormHeaderImage(headerImage);
      setFormScreenshots(screenshots.join('\n'));
      setFormTaglineFr(taglineFr);
      setFormTaglineEn(taglineEn);
      setFormGenres(enrichedGenres.join(', '));
      setFormArtStyleFr(artStyle.fr);
      setFormArtStyleEn(artStyle.en);
      setFormCameraFr(camera.fr);
      setFormCameraEn(camera.en);
      if (extractedComposer) {
        setFormComposer(extractedComposer);
      }

      if (fetchedReviews) {
        registerSteamStoreData({
          appId: parseInt(appId, 10),
          isFree: !!dataFR.is_free,
          currency: 'EUR',
          initialPriceCents: 0,
          finalPriceCents: 0,
          discountPercent: 0,
          formattedFinalPrice: '',
          totalReviews: fetchedReviews.totalReviews,
          totalPositive: fetchedReviews.totalPositive,
          positivePercent: fetchedReviews.positivePercent,
          reviewScoreDesc: fetchedReviews.reviewScoreDesc,
        });
        setSteamReviewsInfo(fetchedReviews);
      }
      setFormCardRarity('auto');

      soundFx.playVictory();
      if (onNotice) onNotice('success', `✨ Fiche Steam auto-remplie avec succès pour « ${title} » !`);
    } catch (err: any) {
      soundFx.playError();
      if (onNotice) onNotice('error', err.message || "Erreur lors de la récupération Steam.");
    } finally {
      setIsFetchingSteam(false);
    }
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
      .filter((g) => g.length > 0 && g.toLowerCase() !== 'indépendant' && g.toLowerCase() !== 'indie');

    const screenshotsArray = formScreenshots
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanAppId = extractSteamAppId({ steamAppId: (editingGame as Game)?.steamAppId, steamUrl: formSteamUrl });
    const finalRarity: CardRarity =
      formCardRarity !== 'auto'
        ? formCardRarity
        : computeGameRarity(formId.trim(), {
            id: formId.trim(),
            steamAppId: cleanAppId || undefined,
            steamUrl: formSteamUrl.trim() || undefined,
          });

    const gamePayload: Partial<Game> & { isCustomAdmin?: boolean; isGem?: boolean } = {
      id: formId.trim() || undefined,
      title: formTitle.trim(),
      developer: formDeveloper.trim() || 'Studio Indé',
      releaseYear: Number(formReleaseYear) || new Date().getFullYear(),
      genre: genresArray.length > 0 ? genresArray : ['Action', 'Aventure'],
      artStyle: {
        fr: formArtStyleFr.trim() || 'Pixel Art',
        en: formArtStyleEn.trim() || 'Pixel Art',
      },
      camera: {
        fr: formCameraFr.trim() || 'Vue de côté 2D',
        en: formCameraEn.trim() || '2D Side-scroller',
      },
      steamUrl: formSteamUrl.trim() || undefined,
      steamAppId: cleanAppId || undefined,
      itchUrl: formItchUrl.trim() || undefined,
      isFree: formIsFree,
      isGem: formIsGem,
      headerImage: formHeaderImage.trim() || undefined,
      screenshots: screenshotsArray,
      hints: {
        tagline: {
          fr: formTaglineFr.trim() || 'Un chef-d’œuvre indépendant captivant.',
          en: formTaglineEn.trim() || 'A captivating indie masterpiece.',
        },
        composer: formComposer.trim() || undefined,
      },
      cardRarity: finalRarity,
      addedAt: (editingGame as Game)?.addedAt || new Date().toISOString().split('T')[0],
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 border-t border-white/5 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Jeux</span>
            <span className="text-lg font-black text-white font-mono">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col">
            <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Pépites</span>
            </span>
            <span className="text-lg font-black text-amber-400 font-mono">{stats.gemCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Catalogue Seul</span>
            <span className="text-lg font-black text-slate-300 font-mono">{stats.catalogOnlyCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex flex-col">
            <span className="text-blue-400 text-[10px] uppercase font-bold tracking-wider">Catalogue Steam</span>
            <span className="text-lg font-black text-blue-400 font-mono">{stats.steamCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider">Modifiés</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{stats.modifiedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-indigo-400 text-[10px] uppercase font-bold tracking-wider">Ajouts Admin</span>
            <span className="text-lg font-black text-indigo-400 font-mono">{stats.customCount}</span>
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
            { id: 'gems', label: `✨ Pépites (${stats.gemCount})` },
            { id: 'catalog_only', label: `📦 Catalogue (${stats.catalogOnlyCount})` },
            { id: 'steam', label: `♨️ Steam (${stats.steamCount})` },
            { id: 'base', label: `🦉 Base Hoot (${stats.baseCount})` },
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
                    : game.isCatalogBase
                    ? 'border-blue-500/20 hover:border-blue-500/40'
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
                        {game.isHidden ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" />
                            <span>Masqué</span>
                          </span>
                        ) : game.isGem ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>Pépite</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1">
                            <span>Catalogue</span>
                          </span>
                        )}

                        {game.isCustomAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <span>Ajout Admin</span>
                          </span>
                        )}
                        {game.isCatalogBase && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                            <span>Catalogue Steam</span>
                          </span>
                        )}
                        {game.isModified && !game.isCustomAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Modifié</span>
                          </span>
                        )}
                        {!game.isCustomAdmin && !game.isCatalogBase && !game.isModified && !game.isHidden && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Certifié Hoot
                          </span>
                        )}

                        {/* Rareté de la Carte Sylvestre */}
                        {(() => {
                          const r = computeGameRarity(game.id, game);
                          const config: Record<CardRarity, { label: string; bg: string }> = {
                            legendary: { label: '🟡 Légendaire', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
                            epic: { label: '🟣 Épique', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
                            rare: { label: '🔵 Rare', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
                            common: { label: '⚪ Commune', bg: 'bg-slate-700/40 text-slate-300 border-white/10' },
                          };
                          const m = config[r] || { label: r, bg: 'bg-slate-800 text-slate-400 border-white/10' };
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${m.bg}`}>
                              {m.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Genres & Style */}
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(game.genre) ? game.genre : []).slice(0, 3).map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-300 font-medium"
                      >
                        {g}
                      </span>
                    ))}
                    {Array.isArray(game.genre) && game.genre.length > 3 && (
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

                    {/* Basculer Pépite / Catalogue */}
                    <button
                      onClick={() => handleToggleGem(game)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                        game.isGem
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                      }`}
                      title={
                        game.isGem
                          ? 'Présent dans les Pépites (cliquer pour retirer des Pépites sans supprimer du catalogue)'
                          : 'Réservé au catalogue (cliquer pour promouvoir en Pépite)'
                      }
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${game.isGem ? 'text-amber-400 fill-amber-400/40' : 'text-slate-500'}`} />
                      <span className="text-[10px] hidden sm:inline">{game.isGem ? 'Pépite' : 'Catalogue'}</span>
                    </button>

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
                {/* Remplissage automatique depuis Steam */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-amber-950/20 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-blue-300 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Remplissage automatique depuis Steam</span>
                    </div>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Détection IA des tags, style visuel et caméra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={steamLookupQuery}
                      onChange={(e) => setSteamLookupQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAutoFetchSteam();
                        }
                      }}
                      placeholder="Collez une URL Steam (store.steampowered.com/app/...) ou un AppID"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      type="button"
                      disabled={isFetchingSteam || !steamLookupQuery.trim()}
                      onClick={handleAutoFetchSteam}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {isFetchingSteam ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyse Steam...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyser & Remplir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

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
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { fr: 'Pixel Art', en: 'Pixel Art' },
                        { fr: '2D Dessiné à la main', en: '2D Hand-drawn' },
                        { fr: '3D Stylisée', en: 'Stylized 3D' },
                        { fr: '3D Réaliste', en: 'Realistic 3D' },
                        { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' },
                        { fr: 'Monochrome / Minimaliste', en: 'Monochrome' },
                      ].map((preset) => (
                        <button
                          key={preset.fr}
                          type="button"
                          onClick={() => {
                            setFormArtStyleFr(preset.fr);
                            setFormArtStyleEn(preset.en);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                            formArtStyleFr === preset.fr
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {preset.fr}
                        </button>
                      ))}
                    </div>
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
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { fr: 'Vue de côté 2D', en: '2D Side-scroller' },
                        { fr: 'Vue du dessus 2D', en: '2D Top-down' },
                        { fr: 'Isométrique / 2.5D', en: 'Isometric / 2.5D' },
                        { fr: 'Troisième personne', en: 'Third-Person' },
                        { fr: 'Première personne', en: 'First-Person' },
                      ].map((preset) => (
                        <button
                          key={preset.fr}
                          type="button"
                          onClick={() => {
                            setFormCameraFr(preset.fr);
                            setFormCameraEn(preset.en);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                            formCameraFr === preset.fr
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {preset.fr}
                        </button>
                      ))}
                    </div>
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

                {/* Options d'affichage : Pépites & Gratuit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pépite Checkbox */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <label htmlFor="formIsGemCheckbox" className="font-bold text-xs text-amber-200 cursor-pointer block">
                          Afficher dans les Pépites
                        </label>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Mis en avant dans l'Explorateur de Pépites (sinon catalogue seul)
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="formIsGemCheckbox"
                      checked={formIsGem}
                      onChange={(e) => setFormIsGem(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer shrink-0"
                    />
                  </div>

                  {/* Gratuit Checkbox */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <label htmlFor="formIsFreeCheckbox" className="font-bold text-xs text-slate-200 cursor-pointer block">
                        Jeu 100% Gratuit
                      </label>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Accès libre sans achat (0,00 €)
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="formIsFreeCheckbox"
                      checked={formIsFree}
                      onChange={(e) => setFormIsFree(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer shrink-0"
                    />
                  </div>
                </div>

                {/* Rareté de la Carte Sylvestre (Classeur & Boosters) */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/20 via-amber-950/10 to-transparent border border-white/10 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎴</span>
                      <div>
                        <label className="font-bold text-xs text-slate-200 block">
                          Rareté de la Carte Sylvestre (Classeur & Boosters)
                        </label>
                        <p className="text-[10px] text-slate-400">
                          Automatisée selon les évaluations Steam officielles ou assignation personnalisée.
                        </p>
                      </div>
                    </div>

                    {/* Badge Rareté Calculée / Active */}
                    {(() => {
                      const tempAppId = extractSteamAppId({ steamAppId: (editingGame as Game)?.steamAppId, steamUrl: formSteamUrl });
                      const activeRarity =
                        formCardRarity !== 'auto'
                          ? formCardRarity
                          : computeGameRarity(formId.trim(), {
                              id: formId.trim(),
                              steamAppId: tempAppId || undefined,
                              steamUrl: formSteamUrl.trim() || undefined,
                            });
                      const rarityMeta: Record<CardRarity, { label: string; bg: string; icon: string }> = {
                        legendary: { label: 'Légendaire', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🟡' },
                        epic: { label: 'Épique', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '🟣' },
                        rare: { label: 'Rare', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: '🔵' },
                        common: { label: 'Commune', bg: 'bg-slate-700/40 text-slate-300 border-white/10', icon: '⚪' },
                      };
                      const m = rarityMeta[activeRarity];
                      return (
                        <div className="flex items-center gap-2">
                          {steamReviewsInfo && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Steam : {steamReviewsInfo.totalReviews.toLocaleString()} avis ({steamReviewsInfo.positivePercent}%+)
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${m.bg}`}>
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                            {formCardRarity === 'auto' && (
                              <span className="text-[9px] opacity-70 font-normal">(Auto)</span>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Sélecteur de rareté */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                    {[
                      { key: 'auto', label: '⚡ Auto (Steam)', desc: 'Calcul dynamique' },
                      { key: 'common', label: '⚪ Commune', desc: `< ${Math.round(STEAM_RARITY_THRESHOLDS.RARE_MIN_REVIEWS / 1000)}k avis` },
                      { key: 'rare', label: '🔵 Rare', desc: `≥ ${Math.round(STEAM_RARITY_THRESHOLDS.RARE_MIN_REVIEWS / 1000)}k avis` },
                      { key: 'epic', label: '🟣 Épique', desc: `≥ ${Math.round(STEAM_RARITY_THRESHOLDS.EPIC_MIN_REVIEWS / 1000)}k avis` },
                      { key: 'legendary', label: '🟡 Légendaire', desc: `≥ ${Math.round(STEAM_RARITY_THRESHOLDS.LEGENDARY_MIN_REVIEWS / 1000)}k avis` },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setFormCardRarity(opt.key as any)}
                        className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                          formCardRarity === opt.key
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
                            : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        <span className="text-[11px] font-bold block">{opt.label}</span>
                        <span className="text-[9px] text-slate-400 block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
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
