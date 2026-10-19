import React, { useState } from 'react';
import { PlusCircle, Download, CheckCircle2, X, ArrowRight, Sparkles } from 'lucide-react';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { soundFx } from '../../utils/audio';
import { inferEnrichedGenres } from '../../utils/gameInference';
import type { SteamCatalogGame } from '../../services/steamCatalog';

interface SteamSuggestionBannerProps {
  className?: string;
  title?: string;
  description?: string;
}

export const SteamSuggestionBanner: React.FC<SteamSuggestionBannerProps> = ({
  className = '',
  title = "Suggérer une Pépite Indé pour le Catalogue Canonique",
  description = "Vous connaissez un chef-d'œuvre indépendant injustement méconnu disponible sur Steam ? Suggérez-le ! Chaque jeu proposé est examiné et certifié avec ses données officielles Steam avant d'être intégré au sanctuaire.",
}) => {
  const { allPlayableGames } = useSteamCatalog();
  const [importInput, setImportInput] = useState('');
  const [userComment, setUserComment] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isItchUrl = /itch\.io/i.test(importInput);

  const handleRedirectToMicroIndies = () => {
    soundFx.playClick();
    const urlToPrefill = importInput.trim();
    try {
      sessionStorage.setItem('hoot_prefill_itch_url', urlToPrefill);
    } catch {
      // Ignorer
    }
    setImportInput('');
    setImportMessage(null);

    // Déclencher l'événement d'ouverture et basculer sur l'onglet Micro-Indés
    window.dispatchEvent(
      new CustomEvent('hoot_open_micro_propose', { detail: { itchUrl: urlToPrefill } })
    );
    window.location.hash = '#micro-propose';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) return;

    if (isItchUrl) {
      handleRedirectToMicroIndies();
      return;
    }

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
      // Résolution souveraine via notre proxy backend PHP (sans restriction CORS)
      let dataFR: any = null;
      let dataEN: any = null;

      try {
        const lookupRes = await fetch(`/api/suggest_game.php?action=lookup&appId=${appId}`);
        if (lookupRes.ok) {
          const lookupJson = await lookupRes.json();
          if (lookupJson.status === 'success' && lookupJson.dataFR) {
            dataFR = lookupJson.dataFR;
            dataEN = lookupJson.dataEN || lookupJson.dataFR;
          } else if (lookupJson.message) {
            throw new Error(lookupJson.message);
          }
        } else if (lookupRes.status === 404 || lookupRes.status === 400 || lookupRes.status === 429) {
          const errJson = await lookupRes.json().catch(() => null);
          throw new Error(errJson?.message || 'Jeu non trouvé sur Steam ou soumis à des restrictions régionales.');
        }
      } catch (proxyErr: unknown) {
        if (
          proxyErr instanceof Error &&
          !proxyErr.message.includes('fetch') &&
          !proxyErr.message.includes('NetworkError') &&
          !proxyErr.message.includes('Failed to')
        ) {
          throw proxyErr;
        }
      }

      // Fallback résilient via proxy CORS si indisponibilité du backend local
      if (!dataFR) {
        try {
          const corsUrlFR = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=french`)}`;
          const corsUrlEN = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`)}`;
          const [frRes, enRes] = await Promise.all([fetch(corsUrlFR), fetch(corsUrlEN)]);
          const [frJson, enJson] = await Promise.all([frRes.json(), enRes.json()]);
          dataFR = frJson?.[String(appId)]?.data;
          dataEN = enJson?.[String(appId)]?.data || dataFR;
        } catch {
          // Si le fallback CORS échoue également
        }
      }

      if (!dataFR || !dataFR.name) {
        throw new Error('Jeu non trouvé sur Steam ou impossible de contacter les serveurs de Valve.');
      }

      const title = dataFR.name.trim();
      const releaseYear = parseInt(dataFR.release_date?.date?.match(/\b(19\d\d|20\d\d)\b/)?.[1] || '2024', 10);
      const developer = dataFR.developers?.[0] || 'Studio Indépendant';

      const fullDesc = `${title} ${dataFR.short_description || ''} ${dataEN?.short_description || ''} ${dataFR.detailed_description || ''}`;
      const rawGenres = (dataFR.genres || []).map((g: { description: string }) => g.description);
      const enrichedGenres = inferEnrichedGenres(rawGenres, fullDesc);

      // Transmission au backend pour modération administrative
      try {
        const backendRes = await fetch('/api/suggest_game.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId,
            title,
            developer,
            releaseYear,
            genres: enrichedGenres,
            comment: userComment.trim(),
          }),
        });

        if (backendRes.status === 409) {
          const resJson = await backendRes.json();
          soundFx.playVictory();
          setImportMessage({
            type: 'success',
            text: resJson.message || `Ce jeu (« ${title} ») a déjà été proposé et est en cours d'examen par les veilleurs !`,
          });
          setImportInput('');
          setUserComment('');
          return;
        }

        if (backendRes.status === 429) {
          const resJson = await backendRes.json();
          soundFx.playError();
          setImportMessage({
            type: 'error',
            text: resJson.message || 'Limite de suggestions atteinte pour le moment. Veuillez patienter quelques minutes.',
          });
          return;
        }

        if (backendRes.ok) {
          const resJson = await backendRes.json();
          soundFx.playVictory();
          setImportMessage({
            type: 'success',
            text: resJson.message || `Merci ! Votre suggestion pour « ${title} » a été transmise aux veilleurs du Nichoir.`,
          });
          setImportInput('');
          setUserComment('');
          return;
        }
      } catch {
        // En cas d'indisponibilité de l'API locale ou PHP hors-ligne
      }

      soundFx.playVictory();
      setImportMessage({
        type: 'success',
        text: `Proposition enregistrée ! « ${title} » (${releaseYear}) a bien été transmise aux veilleurs pour examen.`,
      });
      setImportInput('');
      setUserComment('');
    } catch (err: unknown) {
      soundFx.playError();
      const errorMsg = err instanceof Error ? err.message : 'Erreur de connexion Steam.';
      setImportMessage({
        type: 'error',
        text: `Échec de l'analyse : ${errorMsg}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={`group relative p-6 bg-gradient-to-br from-[#0d3f30]/80 via-[#07281e] to-[#03150f] border-2 border-amber-500/50 rounded-3xl shadow-xl overflow-visible ${className}`}>
      <SylvestreIvyFrame density="delicate" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-amber-400" />
            {title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        <span className="self-start px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
          🦉 Examen des Veilleurs
        </span>
      </div>

      <form onSubmit={handleDirectImport} className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            placeholder="URL de la page Steam Store ou AppID (ex: 1145360)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isImporting || !importInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isImporting ? 'Examen Steam...' : 'Proposer cette pépite'}</span>
          </button>
        </div>

        <input
          type="text"
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          placeholder="Pourquoi cette pépite mérite d'être mise en avant ? (direction artistique, musique, gameplay innovant... - facultatif)"
          maxLength={300}
          className="w-full px-4 py-2 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500/50"
        />
      </form>

      {isItchUrl && (
        <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#200e19]/90 to-amber-950/70 border-2 border-rose-500/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-rose-200 flex items-center gap-2">
                <span>C'est un jeu Itch.io !</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#fa5c5c] text-white">itch.io</span>
              </div>
              <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                Ce formulaire certifie les jeux Steam. Les pépites Itch.io, prototypes et créations solo ont leur sanctuaire dédié : <strong className="text-amber-300 font-semibold">La Clairière des Micro-Indés</strong> !
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRedirectToMicroIndies}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            <span>Proposer dans Micro-Indés</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {importMessage && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            importMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
          }`}
        >
          {importMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <X className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{importMessage.text}</span>
        </div>
      )}
    </div>
  );
};
