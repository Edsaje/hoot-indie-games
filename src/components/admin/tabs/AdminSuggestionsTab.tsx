import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  RotateCw,
  Check,
  Edit3,
  Trash2,
} from 'lucide-react';
import type { AdminCommunitySuggestion, AdminOverviewPayload } from '../../../services/adminService';
import { detectNonIndieStatus } from '../../../utils/gameInference';
import { soundFx } from '../../../utils/audio';

interface AdminSuggestionsTabProps {
  suggestions?: AdminOverviewPayload['suggestions'];
  validatingSuggestionId: string | null;
  onQuickApprove: (s: AdminCommunitySuggestion) => Promise<void>;
  onEditAndApprove: (s: AdminCommunitySuggestion) => void;
  onDelete: (id: string) => Promise<void>;
}

export const AdminSuggestionsTab: React.FC<AdminSuggestionsTabProps> = ({
  suggestions,
  validatingSuggestionId,
  onQuickApprove,
  onEditAndApprove,
  onDelete,
}) => {
  const [confirmDeleteSuggestion, setConfirmDeleteSuggestion] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setConfirmDeleteSuggestion(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Pépites Indés Suggérées par les Visiteurs
        </h3>
        <span className="text-xs text-amber-400 font-bold">
          {suggestions?.total || 0} suggestions en attente
        </span>
      </div>

      {!suggestions?.list || suggestions.list.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0c1220] border border-white/5 text-center space-y-2">
          <Lightbulb className="w-8 h-8 text-amber-400/50 mx-auto" />
          <p className="text-sm font-bold text-white">Aucune suggestion pour le moment</p>
          <p className="text-xs text-slate-400">
            Les jeux indés suggérés par la communauté via la boîte à outils apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.list.map((s) => {
            const nonIndieCheck = detectNonIndieStatus({
              title: s.title,
              developer: s.developer,
              genres: s.genres,
              comment: s.comment,
            });

            return (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border space-y-3 transition flex flex-col justify-between ${
                  nonIndieCheck.isLikelyNonIndie
                    ? 'bg-[#160c11] border-rose-500/40 hover:border-rose-400'
                    : 'bg-[#0c1220] border-white/5 hover:border-amber-500/30'
                }`}
              >
                <div className="space-y-1.5">
                  {nonIndieCheck.isLikelyNonIndie && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-black text-rose-200 uppercase tracking-wide text-[10px]">
                          ⚠️ Production AAA / Majeure Détectée
                        </div>
                        <div className="text-[11px] text-rose-300 font-semibold mt-0.5">
                          {nonIndieCheck.reason}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.title}</h4>
                      <p className="text-xs text-slate-400">
                        Studio : <strong className="text-slate-300">{s.developer}</strong> ({s.releaseYear})
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                      AppID {s.appId}
                    </span>
                  </div>

                  {s.comment && (
                    <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5 italic">
                      « {s.comment} »
                    </p>
                  )}

                  {s.genres && s.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {s.genres.map((g, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-white/5 gap-2 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Proposé le {new Date(s.submittedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <a
                      href={s.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
                      title="Consulter la fiche Steam officielle"
                    >
                      <span>Steam</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      disabled={validatingSuggestionId === s.id}
                      onClick={() => onQuickApprove(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] transition shadow shadow-emerald-950/40 cursor-pointer active:scale-95"
                      title="Valider immédiatement et ajouter la pépite au catalogue souverain"
                    >
                      {validatingSuggestionId === s.id ? (
                        <RotateCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>{validatingSuggestionId === s.id ? 'Validation...' : 'Valider (1-clic)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={validatingSuggestionId === s.id}
                      onClick={() => onEditAndApprove(s)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] transition cursor-pointer active:scale-95"
                      title="Ajuster les informations dans l'éditeur de catalogue avant d'enregistrer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Éditer</span>
                    </button>

                    {confirmDeleteSuggestion === s.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirmDeleteSuggestion(null)}
                          className="px-2 py-1 rounded bg-white/10 text-slate-300 text-[10px]"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setConfirmDeleteSuggestion(s.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Rejeter / Supprimer la suggestion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
