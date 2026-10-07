import React from 'react';
import { Gamepad2, ExternalLink, Edit3, RotateCw, Check, Trash2 } from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export interface MicroIndiesTabProps {
  setMicroIndieFilter: any;
  microIndieFilter: any;
  data: any;
  handleOpenEditMicroIndie: any;
  validatingMicroIndieId: any;
  handleApproveMicroIndie: any;
  confirmDeleteMicroIndie: any;
  handleDeleteMicroIndie: any;
  setConfirmDeleteMicroIndie: any;
}

export const MicroIndiesTab: React.FC<MicroIndiesTabProps> = ({
  setMicroIndieFilter,
  microIndieFilter,
  data,
  handleOpenEditMicroIndie,
  validatingMicroIndieId,
  handleApproveMicroIndie,
  confirmDeleteMicroIndie,
  handleDeleteMicroIndie,
  setConfirmDeleteMicroIndie
}) => {
  return (
    <>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1220] p-4 rounded-2xl border border-white/5">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-amber-400" />
                          <span>Validation & Modération des Micro-Indés</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Consultez, testez et validez en 1-clic les jeux indés soumis par les créateurs ou la communauté.
                        </p>
                      </div>

                      {/* Filtres d'état */}
                      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setMicroIndieFilter('pending');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            microIndieFilter === 'pending'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>En attente</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              microIndieFilter === 'pending'
                                ? 'bg-black/20 text-slate-900 font-bold'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {data.microIndies?.pending || 0}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setMicroIndieFilter('approved');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            microIndieFilter === 'approved'
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>Publiés</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              microIndieFilter === 'approved'
                                ? 'bg-black/20 text-slate-900 font-bold'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {data.microIndies?.approved || 0}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setMicroIndieFilter('all');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            microIndieFilter === 'all'
                              ? 'bg-white/20 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>Tous ({data.microIndies?.total || 0})</span>
                        </button>
                      </div>
                    </div>

                    {/* Liste des micro-indés filtrés */}
                    {(() => {
                      const list = (data.microIndies?.list || []).filter((item: any) => {
                        if (microIndieFilter === 'pending') return !item.approved;
                        if (microIndieFilter === 'approved') return !!item.approved;
                        return true;
                      });

                      if (list.length === 0) {
                        return (
                          <div className="p-12 rounded-2xl bg-[#0c1220] border border-white/5 text-center space-y-2">
                            <Gamepad2 className="w-8 h-8 text-amber-400/50 mx-auto" />
                            <p className="text-sm font-bold text-white">
                              {microIndieFilter === 'pending'
                                ? 'Aucun micro-indé en attente de validation'
                                : 'Aucun jeu dans cette catégorie'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {microIndieFilter === 'pending'
                                ? 'Toutes les propositions communautaires ont été traitées !'
                                : 'Les jeux ajoutés apparaîtront ici.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {list.map((m: any) => {
                            const isPending = !m.approved;
                            const platformLabel = m.platform || m.sourceType || 'itch';
                            const pitchText = m.pitch || m.tagline?.fr || m.tagline?.en || m.description?.fr || m.description?.en || '';
                            const dateStr = m.submittedAt || m.dateAdded;
                            const playUrl = m.playInBrowserUrl || m.itchUrl || m.steamUrl || m.gameplayUrl;
                            return (
                              <div
                                key={m.id}
                                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition ${
                                  isPending
                                    ? 'bg-[#181308] border-amber-500/40 hover:border-amber-400'
                                    : 'bg-[#0c1220] border-white/5 hover:border-emerald-500/30'
                                }`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      {m.coverImage ? (
                                        <img
                                          src={m.coverImage}
                                          alt={m.title}
                                          referrerPolicy="no-referrer"
                                          className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-900"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-950 to-amber-950 border border-amber-500/30 flex items-center justify-center shrink-0">
                                          <Gamepad2 className="w-6 h-6 text-amber-400" />
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-bold text-white text-base leading-tight">
                                          {m.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          Par <strong className="text-slate-200">{m.developer}</strong>
                                          {m.releaseYear ? ` (${m.releaseYear})` : ''}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                                            {platformLabel}
                                          </span>
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                            {m.pricingText?.fr || m.pricingText?.en || (m.isFree ? 'Gratuit 🆓' : 'Payant')}
                                          </span>
                                          {m.discoveredBy && (
                                            <span className="text-[10px] text-amber-300/80">
                                              Déniché par : <strong>{m.discoveredBy}</strong>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Badge statut */}
                                    <span
                                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                                        isPending
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      }`}
                                    >
                                      {isPending ? '⏳ En attente' : '✅ En ligne'}
                                    </span>
                                  </div>

                                  {/* Pitch / description */}
                                  {pitchText && (
                                    <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5 italic leading-relaxed">
                                      « {pitchText} »
                                    </p>
                                  )}

                                  {dateStr && (
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      Soumis le {new Date(dateStr).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/5 gap-2">
                                  <div className="flex items-center gap-1.5">
                                    {playUrl && (
                                      <a
                                        href={playUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                                        title="Ouvrir la page officielle du jeu"
                                      >
                                        <span>Tester le jeu</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditMicroIndie(m)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                                      title="Modifier les informations ou corriger l'image de couverture"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Éditer</span>
                                    </button>

                                    {isPending ? (
                                      <button
                                        type="button"
                                        disabled={validatingMicroIndieId === m.id}
                                        onClick={() => handleApproveMicroIndie(m)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50 active:scale-95"
                                        title="Approuver et rendre visible ce micro-indé sur le site"
                                      >
                                        {validatingMicroIndieId === m.id ? (
                                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Check className="w-3.5 h-3.5" />
                                        )}
                                        <span>Valider & Publier</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        Validé
                                      </span>
                                    )}

                                    {confirmDeleteMicroIndie === m.id ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMicroIndie(m.id)}
                                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                                        >
                                          Confirmer
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteMicroIndie(null)}
                                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer"
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteMicroIndie(m.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                        title="Supprimer ce jeu micro-indé"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                
    </>
  );
};
