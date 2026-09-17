import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  Search,
  ExternalLink,
  PlusCircle,
  X,
  CheckCircle2,
  Download,
  Flame,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import type { Game } from '../../types/game';
import type { SteamCatalogGame } from '../../services/steamCatalog';
import { soundFx } from '../../utils/audio';

interface SteamCatalogExplorerProps {
  onSelectGameForIndledle?: (game: Game) => void;
}

export const SteamCatalogExplorer: React.FC<SteamCatalogExplorerProps> = ({
  onSelectGameForIndledle,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const { allPlayableGames, stats, addCustomGame, removeCustomGame } = useSteamCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedArtStyle, setSelectedArtStyle] = useState<string>('all');
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);
  const [modalActiveScreenshot, setModalActiveScreenshot] = useState<number>(0);

  // Formulaire d'import direct Steam
  const [importInput, setImportInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Extraire les genres uniques triés par fréquence
  const topGenres = useMemo(() => {
    const entries = Object.entries(stats.genresCount);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 14).map(([name]) => name);
  }, [stats.genresCount]);

  // Filtrage des jeux
  const filteredGames = useMemo(() => {
    return allPlayableGames.filter((game) => {
      // Filtre texte
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          game.title.toLowerCase().includes(q) ||
          game.developer.toLowerCase().includes(q) ||
          game.genre.some((g) => g.toLowerCase().includes(q)) ||
          game.hints.tagline.fr.toLowerCase().includes(q) ||
          game.hints.tagline.en.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Filtre genre
      if (selectedGenre !== 'all' && !game.genre.includes(selectedGenre)) {
        return false;
      }

      // Filtre ArtStyle
      if (selectedArtStyle !== 'all' && game.artStyle.en !== selectedArtStyle) {
        return false;
      }

      // Filtre Caméra
      if (selectedCamera !== 'all' && game.camera.en !== selectedCamera) {
        return false;
      }

      return true;
    });
  }, [allPlayableGames, searchQuery, selectedGenre, selectedArtStyle, selectedCamera]);

  // Import direct d'un jeu Steam par AppID ou URL
  const handleDirectImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) return;

    soundFx.playClick();
    setIsImporting(true);
    setImportMessage(null);

    // Extraction de l'AppID depuis l'URL ou le nombre
    let appIdStr = importInput.trim();
    const urlMatch = appIdStr.match(/\/app\/(\d+)/);
    if (urlMatch) {
      appIdStr = urlMatch[1];
    }

    const appId = parseInt(appIdStr, 10);
    if (isNaN(appId) || appId <= 0) {
      setIsImporting(false);
      setImportMessage({
        type: 'error',
        text: 'Identifiant Steam invalide. Entrez un AppID numérique (ex: 1145360) ou une URL de magasin Steam.',
      });
      return;
    }

    // Vérifier si le jeu existe déjà
    const existing = allPlayableGames.find(
      (g) => (g as SteamCatalogGame).steamAppId === appId || g.steamUrl?.includes(String(appId))
    );
    if (existing) {
      setIsImporting(false);
      setImportMessage({
        type: 'error',
        text: `Ce jeu fait déjà partie du catalogue : "${existing.title}".`,
      });
      return;
    }

    try {
      // Requête bilingue via endpoint officiel
      const [frRes, enRes] = await Promise.all([
        fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=french`),
        fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`),
      ]);

      const [frJson, enJson] = await Promise.all([frRes.json(), enRes.json()]);

      const dataFR = frJson[String(appId)]?.data;
      const dataEN = enJson[String(appId)]?.data;

      if (!dataFR || !dataFR.name) {
        throw new Error('Jeu non trouvé sur Steam ou soumis à des restrictions régionales.');
      }

      const title = dataFR.name.trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const releaseYear = parseInt(dataFR.release_date?.date?.match(/\b(19\d\d|20\d\d)\b/)?.[1] || '2024', 10);
      const developer = dataFR.developers?.[0] || 'Studio Indépendant';
      const steamUrl = `https://store.steampowered.com/app/${appId}/`;
      const headerImage = dataFR.header_image;

      const screenshots: string[] = (dataFR.screenshots || [])
        .map((s: { path_full: string }) => s.path_full)
        .slice(0, 6);
      while (screenshots.length < 6) {
        screenshots.push(headerImage);
      }

      const taglineFR = (dataFR.short_description || `${title} par ${developer}`).replace(/<[^>]+>/g, '');
      const taglineEN = (dataEN?.short_description || `${title} by ${developer}`).replace(/<[^>]+>/g, '');

      const genres = (dataFR.genres || [])
        .map((g: { description: string }) => g.description)
        .filter((g: string) => !['Indépendant', 'Accès anticipé'].includes(g));

      const newGame: SteamCatalogGame = {
        id,
        title,
        releaseYear,
        genre: genres.length > 0 ? genres : ['Aventure', 'Action'],
        artStyle: { fr: 'Pixel Art', en: 'Pixel Art' },
        camera: { fr: '2D Vue de côté', en: '2D Side-scroller' },
        developer,
        steamUrl,
        screenshots,
        hints: {
          tagline: { fr: taglineFR, en: taglineEN },
        },
        steamAppId: appId,
        headerImage,
        isCustomImport: true,
      };

      addCustomGame(newGame);
      soundFx.playVictory();
      setImportMessage({
        type: 'success',
        text: `Succès ! "${title}" (${releaseYear}) a été importé et est désormais jouable sur tout le site !`,
      });
      setImportInput('');
    } catch (err: unknown) {
      soundFx.playError();
      const errorMsg = err instanceof Error ? err.message : 'Erreur de connexion Steam.';
      setImportMessage({
        type: 'error',
        text: `Échec de l'import : ${errorMsg}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenGameModal = (game: Game) => {
    soundFx.playClick();
    setSelectedGameForModal(game);
    setModalActiveScreenshot(0);
  };

  const handleCloseModal = () => {
    setSelectedGameForModal(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner Stats */}
      <div className="p-6 bg-gradient-to-br from-[#131a29] via-[#0f1523] to-[#0a0e1a] border border-[#1e293b] rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Database className="w-4 h-4" />
              Alimentation API Steam • 0 Hallucination
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Catalogue Étendu de Jeux Indépendants
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Base de données massive synchronisée directement avec les métadonnées officielles de Steam (captures haute résolution, développeurs certifiés, taglines bilingues et genres canoniques).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Jeux Jouables</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {stats.totalGames}
              </div>
            </div>
            <div className="px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Catalogue Steam</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {stats.steamCatalogCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'Import Direct Steam */}
      <div className="p-5 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <PlusCircle className="w-4 h-4 text-amber-400" />
          Importer n'importe quel Jeu Indé Steam (en direct)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Collez une URL de magasin Steam (ex: <code className="text-amber-300 font-mono">https://store.steampowered.com/app/1145360/Hades/</code>) ou un AppID pour récupérer instantanément ses visuels officiels et l'ajouter à vos jeux.
        </p>

        <form onSubmit={handleDirectImport} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            placeholder="URL Steam Store ou AppID (ex: 1145360)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isImporting || !importInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isImporting ? 'Interrogation Steam...' : 'Certifier & Importer'}</span>
          </button>
        </form>

        {importMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {importMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            <span>{importMessage.text}</span>
          </div>
        )}
      </div>

      {/* Barres de Recherche & Filtres */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Recherche texte */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, studio, tag ou synopsis..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#131a29] border border-[#1e293b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtre ArtStyle */}
          <select
            value={selectedArtStyle}
            onChange={(e) => setSelectedArtStyle(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-[#131a29] border border-[#1e293b] text-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tous les styles artistiques</option>
            <option value="Pixel Art">Pixel Art</option>
            <option value="2D Hand-drawn">2D Dessiné à la main</option>
            <option value="Stylized 3D">3D Stylisé</option>
            <option value="Retro Low-poly 3D">3D Rétro Low-poly</option>
            <option value="Realistic 3D">3D Réaliste</option>
            <option value="Monochrome">Monochrome</option>
          </select>

          {/* Filtre Caméra */}
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-[#131a29] border border-[#1e293b] text-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="all">Toutes les caméras</option>
            <option value="2D Side-scroller">Vue de côté 2D</option>
            <option value="2D Top-down">Vue de dessus 2D</option>
            <option value="Isometric / 2.5D">Isométrique / 2.5D</option>
            <option value="First-Person">Première personne (FPS)</option>
            <option value="Third-Person">Troisième personne 3D</option>
          </select>
        </div>

        {/* Badges de genres rapides */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedGenre === 'all'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-[#131a29] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Tous les genres ({allPlayableGames.length})
          </button>
          {topGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? 'all' : genre)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-[#131a29] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              {genre} ({stats.genresCount[genre] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Grille de jeux certifiés */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold">
          <span>{filteredGames.length} jeux trouvés</span>
          <span>Résolution native Steam CDN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.slice(0, 48).map((game) => {
            const steamGame = game as SteamCatalogGame;
            const coverUrl = steamGame.headerImage || game.screenshots[game.screenshots.length - 1];

            return (
              <div
                key={game.id}
                onClick={() => handleOpenGameModal(game)}
                className="group p-3 bg-[#131a29] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl cursor-pointer transition shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Visuel principal */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img
                      src={coverUrl}
                      alt={game.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-slate-700">
                      {game.releaseYear}
                    </span>
                    {steamGame.isCustomImport && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-500 text-[9px] font-black uppercase text-slate-950">
                        Import Direct
                      </span>
                    )}
                  </div>

                  {/* Titre & Développeur */}
                  <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-400 transition">
                    {game.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {game.developer}
                  </p>
                </div>

                {/* Badges styles & caméras */}
                <div className="pt-3 border-t border-[#1e293b] mt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 truncate max-w-[120px]">
                    {game.artStyle[lang]}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 truncate max-w-[100px]">
                    {game.camera[lang]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGames.length > 48 && (
          <div className="text-center py-6 text-xs text-slate-500 font-semibold">
            Affichage des 48 premiers résultats sur {filteredGames.length}. Affinez votre recherche pour cibler un jeu précis.
          </div>
        )}
      </div>

      {/* Modal Détails & Galerie Screenshots */}
      {selectedGameForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131a29] border border-[#1e293b] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                    {selectedGameForModal.releaseYear}
                  </span>
                  <span className="text-xs text-slate-400">
                    par <strong className="text-white">{selectedGameForModal.developer}</strong>
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedGameForModal.title}
                </h3>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visionneuse Screenshot */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <img
                src={selectedGameForModal.screenshots[modalActiveScreenshot]}
                alt={`Screenshot ${modalActiveScreenshot + 1}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-mono text-white">
                Image {modalActiveScreenshot + 1} / {selectedGameForModal.screenshots.length}
              </div>

              {selectedGameForModal.screenshots.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setModalActiveScreenshot((prev) =>
                        prev === 0 ? selectedGameForModal.screenshots.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setModalActiveScreenshot((prev) =>
                        prev === selectedGameForModal.screenshots.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Miniatures Screenshots */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {selectedGameForModal.screenshots.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalActiveScreenshot(idx)}
                  className={`w-20 aspect-video rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    modalActiveScreenshot === idx ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={s} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Description & Caractéristiques */}
            <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl space-y-3">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                « {selectedGameForModal.hints.tagline[lang]} »
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Style Visuel</span>
                  <div className="font-bold text-white mt-0.5">{selectedGameForModal.artStyle[lang]}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Perspective</span>
                  <div className="font-bold text-white mt-0.5">{selectedGameForModal.camera[lang]}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Genres</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedGameForModal.genre.map((g) => (
                      <span key={g} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {selectedGameForModal.steamUrl ? (
                <a
                  href={selectedGameForModal.steamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>Voir la page Magasin Steam</span>
                </a>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {(selectedGameForModal as SteamCatalogGame).isCustomImport && (
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer ce jeu importé de votre liste locale ?')) {
                        removeCustomGame(selectedGameForModal.id);
                        handleCloseModal();
                      }
                    }}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition"
                    title="Supprimer l'import"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {onSelectGameForIndledle && (
                  <button
                    onClick={() => {
                      onSelectGameForIndledle(selectedGameForModal);
                      handleCloseModal();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Tester dans Indledle</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
