import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  ExternalLink,
  Edit3,
  Check,
  RotateCw,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import {
  approveAdminMicroIndie,
  deleteAdminMicroIndie,
  updateAdminMicroIndie,
  type AdminMicroIndieEntry,
  type AdminOverviewPayload,
} from '../../../services/adminService';
import { soundFx } from '../../../utils/audio';

interface AdminMicroIndiesTabProps {
  microIndies?: AdminOverviewPayload['microIndies'];
  currentSteamId: string;
  onRefresh: () => Promise<void>;
  onNotice: (type: 'success' | 'error', message: string) => void;
}

export const AdminMicroIndiesTab: React.FC<AdminMicroIndiesTabProps> = ({
  microIndies,
  currentSteamId,
  onRefresh,
  onNotice,
}) => {
  const [microIndieFilter, setMicroIndieFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [validatingMicroIndieId, setValidatingMicroIndieId] = useState<string | null>(null);
  const [confirmDeleteMicroIndie, setConfirmDeleteMicroIndie] = useState<string | null>(null);

  // Modale d'édition micro-indé
  const [editingMicroIndie, setEditingMicroIndie] = useState<AdminMicroIndieEntry | null>(null);
  const [editMicroTitle, setEditMicroTitle] = useState<string>('');
  const [editMicroDev, setEditMicroDev] = useState<string>('');
  const [editMicroCover, setEditMicroCover] = useState<string>('');
  const [editMicroSteamUrl, setEditMicroSteamUrl] = useState<string>('');
  const [editMicroItchUrl, setEditMicroItchUrl] = useState<string>('');
  const [editMicroPlayUrl, setEditMicroPlayUrl] = useState<string>('');
  const [editMicroPitch, setEditMicroPitch] = useState<string>('');
  const [editMicroDiscoveredBy, setEditMicroDiscoveredBy] = useState<string>('');
  const [editMicroPrice, setEditMicroPrice] = useState<string>('');
  const [isSavingMicroIndie, setIsSavingMicroIndie] = useState<boolean>(false);

  const handleApproveMicroIndie = async (item: AdminMicroIndieEntry) => {
    soundFx.playClick();
    setValidatingMicroIndieId(item.id);
    try {
      const res = await approveAdminMicroIndie(item.id, currentSteamId);
      if (res.success) {
        onNotice('success', `Le micro-indé « ${item.title} » a été validé et publié avec succès !`);
        await onRefresh();
      } else {
        onNotice('error', res.message || "Échec de l'approbation du micro-indé.");
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la validation du micro-indé.');
    } finally {
      setValidatingMicroIndieId(null);
    }
  };

  const handleDeleteMicroIndie = async (id: string) => {
    soundFx.playClick();
    try {
      const res = await deleteAdminMicroIndie(id, currentSteamId);
      if (res.success) {
        onNotice('success', 'Proposition micro-indé supprimée.');
        setConfirmDeleteMicroIndie(null);
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Échec de la suppression.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la suppression.');
    }
  };

  const handleOpenEditMicroIndie = (m: AdminMicroIndieEntry) => {
    soundFx.playClick();
    setEditingMicroIndie(m);
    setEditMicroTitle(m.title || '');
    setEditMicroDev(m.developer || '');
    setEditMicroCover(m.coverImage || '');
    setEditMicroSteamUrl(m.steamUrl || '');
    setEditMicroItchUrl(m.itchUrl || '');
    setEditMicroPlayUrl(m.playInBrowserUrl || '');
    setEditMicroPitch(m.pitch || m.tagline?.fr || m.tagline?.en || m.description?.fr || '');
    setEditMicroDiscoveredBy(m.discoveredBy || '');
    setEditMicroPrice(m.pricingText?.fr || m.pricingText?.en || (m.isFree ? 'Gratuit 🆓' : ''));
  };

  const handleAutoDetectSteamCover = () => {
    soundFx.playClick();
    const url = editMicroSteamUrl.trim();
    const match = url.match(/\/app\/(\d+)/);
    if (match && match[1]) {
      const steamCover = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${match[1]}/header.jpg`;
      setEditMicroCover(steamCover);
      fetch(`/api/micro_indies.php?action=get_steam_info&appId=${match[1]}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success) {
            if (data.priceFormatted) setEditMicroPrice(data.priceFormatted);
            if (!editMicroTitle.trim() && data.name) setEditMicroTitle(data.name);
          }
        })
        .catch(() => {});
      onNotice('success', `Jaquette et données Steam officielles détectées pour l'AppID ${match[1]} !`);
    } else {
      onNotice('error', 'Aucun AppID Steam valide trouvé dans le lien.');
    }
  };

  const handleSaveMicroIndie = async () => {
    if (!editingMicroIndie) return;
    soundFx.playClick();
    setIsSavingMicroIndie(true);
    try {
      const res = await updateAdminMicroIndie(
        editingMicroIndie.id,
        {
          title: editMicroTitle.trim() || editingMicroIndie.title,
          developer: editMicroDev.trim() || editingMicroIndie.developer,
          coverImage: editMicroCover.trim(),
          steamUrl: editMicroSteamUrl.trim() || undefined,
          itchUrl: editMicroItchUrl.trim() || undefined,
          playInBrowserUrl: editMicroPlayUrl.trim() || undefined,
          pitch: editMicroPitch.trim() || undefined,
          discoveredBy: editMicroDiscoveredBy.trim() || undefined,
          pricingText: editMicroPrice.trim()
            ? { fr: editMicroPrice.trim(), en: editMicroPrice.trim() }
            : undefined,
        },
        currentSteamId
      );
      if (res.success) {
        onNotice('success', 'Fiche du micro-indé mise à jour.');
        setEditingMicroIndie(null);
        await onRefresh();
      } else {
        onNotice('error', res.message || 'Échec de la modification.');
      }
    } catch {
      onNotice('error', 'Erreur réseau lors de la mise à jour.');
    } finally {
      setIsSavingMicroIndie(false);
    }
  };

  const list = (microIndies?.list || []).filter((item) => {
    if (microIndieFilter === 'pending') return !item.approved;
    if (microIndieFilter === 'approved') return !!item.approved;
    return true;
  });

  return (
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
              {microIndies?.pending || 0}
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
              {microIndies?.approved || 0}
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
            <span>Tous ({microIndies?.total || 0})</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((m) => {
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
      )}

      {/* Sous-Modale Modification d'un micro-indé */}
      <AnimatePresence>
        {editingMicroIndie && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMicroIndie(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-[#0c1220] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4 text-white z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Modifier le Micro-Indé</h3>
                    <p className="text-xs text-amber-300/80 font-mono">{editingMicroIndie.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingMicroIndie(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Prévisualisation Jaquette & Input */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Image de Couverture / Jaquette
                  </label>
                  <div className="flex items-center gap-3">
                    {editMicroCover ? (
                      <img
                        src={editMicroCover}
                        alt="Aperçu"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover border border-white/15 bg-slate-900 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = '0.3';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-900 border border-white/15 flex items-center justify-center text-slate-400 shrink-0 text-[10px]">
                        Pas d'image
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={editMicroCover}
                        onChange={(e) => setEditMicroCover(e.target.value)}
                        placeholder="https://... URL de l'image (JPG, PNG, GIF)"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                      />
                      {editMicroSteamUrl && (
                        <button
                          type="button"
                          onClick={handleAutoDetectSteamCover}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-bold text-[11px] transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Récupérer l'image Steam officielle</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Titre & Développeur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Titre du jeu</label>
                    <input
                      type="text"
                      value={editMicroTitle}
                      onChange={(e) => setEditMicroTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Créateur / Développeur</label>
                    <input
                      type="text"
                      value={editMicroDev}
                      onChange={(e) => setEditMicroDev(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Liens : Steam, Itch, Web */}
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Lien Steam</label>
                    <input
                      type="url"
                      value={editMicroSteamUrl}
                      onChange={(e) => setEditMicroSteamUrl(e.target.value)}
                      placeholder="https://store.steampowered.com/app/..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Lien Itch.io</label>
                    <input
                      type="url"
                      value={editMicroItchUrl}
                      onChange={(e) => setEditMicroItchUrl(e.target.value)}
                      placeholder="https://createur.itch.io/nom-du-jeu"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Lien direct navigateur (HTML5/WebGL)</label>
                    <input
                      type="url"
                      value={editMicroPlayUrl}
                      onChange={(e) => setEditMicroPlayUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Pitch & Déniché par */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pitch / Description</label>
                  <textarea
                    rows={2}
                    value={editMicroPitch}
                    onChange={(e) => setEditMicroPitch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Déniché par</label>
                  <input
                    type="text"
                    value={editMicroDiscoveredBy}
                    onChange={(e) => setEditMicroDiscoveredBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Prix réel / Modèle de tarification</label>
                  <input
                    type="text"
                    value={editMicroPrice}
                    onChange={(e) => setEditMicroPrice(e.target.value)}
                    placeholder="Ex: 1,99 €, 4,99 $, Gratuit 🆓..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-amber-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMicroIndie(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isSavingMicroIndie}
                  onClick={handleSaveMicroIndie}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingMicroIndie ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
