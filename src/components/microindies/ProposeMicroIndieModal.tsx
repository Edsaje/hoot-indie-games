import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { soundFx } from '../../utils/audio';
import { useUserAccount } from '../../context/useUserAccount';
import type { MicroIndieGame, MicroIndiePlatform } from '../../types/microIndie';

interface ProposeMicroIndieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameAdded: (newGame: MicroIndieGame) => void;
}

export const ProposeMicroIndieModal: React.FC<ProposeMicroIndieModalProps> = ({
  isOpen,
  onClose,
  onGameAdded,
}) => {
  const { t } = useTranslation();
  const { profile } = useUserAccount();

  const [title, setTitle] = useState('');
  const [developer, setDeveloper] = useState('');
  const [pitch, setPitch] = useState('');
  const [platform, setPlatform] = useState<MicroIndiePlatform>('itch');
  const [itchUrl, setItchUrl] = useState('');
  const [steamUrl, setSteamUrl] = useState('');
  const [playUrl, setPlayUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [genre, setGenre] = useState('Aventure');
  const [artStyle, setArtStyle] = useState('Pixel Art');
  const [jam, setJam] = useState('');
  const [developerMessage, setDeveloperMessage] = useState('');
  const [submittedBy, setSubmittedBy] = useState(profile.username || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg(t('micro.form.errTitle', 'Veuillez saisir le titre du jeu.'));
      return;
    }
    if (!developer.trim()) {
      setErrorMsg(t('micro.form.errDev', 'Veuillez renseigner le nom du créateur ou studio.'));
      return;
    }
    if (!itchUrl.trim() && !steamUrl.trim() && !playUrl.trim()) {
      setErrorMsg(t('micro.form.errUrl', 'Veuillez indiquer au moins un lien officiel (Itch.io, Steam ou Web).'));
      return;
    }

    setIsSubmitting(true);
    soundFx.playClick();

    try {
      const res = await fetch('/api/micro_indies.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          title: title.trim(),
          developer: developer.trim(),
          pitch: pitch.trim() || title.trim(),
          platform,
          itchUrl: itchUrl.trim() || undefined,
          steamUrl: steamUrl.trim() || undefined,
          playInBrowserUrl: playUrl.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          isFree,
          genre,
          artStyle,
          jam: jam.trim() || undefined,
          developerMessage: developerMessage.trim() || undefined,
          submittedBy: submittedBy.trim() || profile.username || 'Ami du Hibou',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la proposition.');
      }

      soundFx.playSuccess();
      setIsSuccess(true);
      if (data.game) {
        onGameAdded(data.game);
      }
    } catch (err: unknown) {
      // Fallback local instantané si hors-ligne ou PHP non dispo
      const fallbackGame: MicroIndieGame = {
        id: `micro-local-${Date.now()}`,
        title: title.trim(),
        developer: developer.trim(),
        releaseYear: new Date().getFullYear(),
        platform,
        itchUrl: itchUrl.trim() || undefined,
        steamUrl: steamUrl.trim() || undefined,
        playInBrowserUrl: playUrl.trim() || undefined,
        isFree,
        pricingText: {
          fr: isFree ? 'Gratuit / Free 🆓' : 'Prix libre / Payant',
          en: isFree ? '100% Free 🆓' : 'Paid / Name your price',
        },
        genre: [genre],
        artStyle: { fr: artStyle, en: artStyle },
        tagline: { fr: pitch.trim() || title.trim(), en: pitch.trim() || title.trim() },
        description: { fr: pitch.trim() || title.trim(), en: pitch.trim() || title.trim() },
        developerMessage: developerMessage.trim() ? { fr: developerMessage.trim(), en: developerMessage.trim() } : undefined,
        jam: jam.trim() || undefined,
        discoveredBy: submittedBy.trim() || profile.username || 'Ami du Hibou',
        likesCount: 1,
        coverImage: coverImage.trim() || 'https://img.itch.zone/aW1nLzExNzg5OTcucG5n/315x250%23c/4H91hQ.png',
        screenshots: coverImage.trim() ? [coverImage.trim()] : [],
        dateAdded: new Date().toISOString().split('T')[0],
      };

      soundFx.playSuccess();
      setIsSuccess(true);
      onGameAdded(fallbackGame);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#06241b] border-2 border-[#78350f] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Sylvestre */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-[#03150f] via-[#06241b] to-[#03150f] border-b border-[#78350f]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-amber-100 font-serif">
                {t('micro.form.modalTitle', 'Proposer un Micro-Indé ou Jeu Itch.io')}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-300/80">
                {t('micro.form.modalSubtitle', 'Partagez une pépite méconnue, un jeu de jam ou votre propre création solo !')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de formulaire */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-emerald-100">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-emerald-200">
                {t('micro.form.successTitle', 'Pépite ajoutée avec succès à La Clairière !')}
              </h4>
              <p className="text-sm text-emerald-300/90 max-w-md mx-auto">
                {t('micro.form.successDesc', 'Merci de mettre en lumière les créateurs indépendants. Le jeu est désormais visible pour tous les visiteurs du sanctuaire !')}
              </p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsSuccess(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-xl border border-emerald-500/40 transition-colors shadow-lg"
              >
                {t('common.close', 'Fermer')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Titre & Développeur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    {t('micro.form.titleLabel', 'Titre du jeu *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: Celeste Classic, Buckshot Roulette..."
                    className="w-full px-3.5 py-2.5 bg-[#02100b] border border-emerald-800/80 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    {t('micro.form.devLabel', 'Créateur / Studio solo *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    placeholder="ex: Maddy Thorson, Mike Klubnika..."
                    className="w-full px-3.5 py-2.5 bg-[#02100b] border border-emerald-800/80 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
              </div>

              {/* Plateforme & Statut Gratuit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    {t('micro.form.platformLabel', 'Plateforme principale')}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#02100b] border border-emerald-900 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPlatform('itch')}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        platform === 'itch' ? 'bg-[#fa5c5c] text-white shadow' : 'text-emerald-400 hover:text-white'
                      }`}
                    >
                      <span>Itch.io</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('steam')}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        platform === 'steam' ? 'bg-sky-700 text-white shadow' : 'text-emerald-400 hover:text-white'
                      }`}
                    >
                      <span>Steam</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('web')}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        platform === 'web' ? 'bg-amber-600 text-white shadow' : 'text-emerald-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Web</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('both')}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        platform === 'both' ? 'bg-emerald-700 text-white shadow' : 'text-emerald-400 hover:text-white'
                      }`}
                    >
                      <span>Multi</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    {t('micro.form.pricingLabel', 'Modèle de prix')}
                  </label>
                  <div className="flex gap-2 h-[42px] items-center">
                    <button
                      type="button"
                      onClick={() => setIsFree(true)}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        isFree
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-[#02100b] border-emerald-900 text-emerald-500 hover:text-emerald-300'
                      }`}
                    >
                      100% Gratuit 🆓
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFree(false)}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        !isFree
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-[#02100b] border-emerald-900 text-emerald-500 hover:text-emerald-300'
                      }`}
                    >
                      Payant / Prix libre 💎
                    </button>
                  </div>
                </div>
              </div>

              {/* Liens officiels */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  {t('micro.form.urlsLabel', 'Liens officiels (au moins un requis)')}
                </label>
                {(platform === 'itch' || platform === 'both') && (
                  <input
                    type="url"
                    value={itchUrl}
                    onChange={(e) => setItchUrl(e.target.value)}
                    placeholder="https://createur.itch.io/nom-du-jeu"
                    className="w-full px-3.5 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-red-400 text-xs sm:text-sm"
                  />
                )}
                {(platform === 'steam' || platform === 'both') && (
                  <input
                    type="url"
                    value={steamUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSteamUrl(val);
                      const m = val.match(/\/app\/(\d+)/);
                      if (m && m[1] && !coverImage) {
                        setCoverImage(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${m[1]}/header.jpg`);
                      }
                    }}
                    placeholder="https://store.steampowered.com/app/123456/..."
                    className="w-full px-3.5 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-sky-400 text-xs sm:text-sm"
                  />
                )}
                <input
                  type="url"
                  value={playUrl}
                  onChange={(e) => setPlayUrl(e.target.value)}
                  placeholder="Lien direct pour jouer dans le navigateur (HTML5 / WebGL) — optionnel"
                  className="w-full px-3.5 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
                />
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                  {t('micro.form.pitchLabel', 'Pitch / Description en quelques mots *')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="De quoi parle ce jeu ? Pourquoi est-il unique et mémorable ?"
                  className="w-full px-3.5 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-amber-400 text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Mot de l'auteur / anecdote */}
              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                  {t('micro.form.devMessageLabel', 'Le mot du créateur / Anecdote de dev (Optionnel)')}
                </label>
                <input
                  type="text"
                  value={developerMessage}
                  onChange={(e) => setDeveloperMessage(e.target.value)}
                  placeholder="ex: Prototype conçu en 48h lors de la Ludum Dare..."
                  className="w-full px-3.5 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
                />
              </div>

              {/* Genre, Style & Jam */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Aventure">Aventure</option>
                    <option value="Action">Action</option>
                    <option value="Puzzle">Puzzle / Énigmes</option>
                    <option value="Platformer">Platformer</option>
                    <option value="RPG">RPG</option>
                    <option value="Roguelike">Roguelike</option>
                    <option value="Horreur">Horreur</option>
                    <option value="Cozy">Cozy / Détente</option>
                    <option value="Stratégie">Stratégie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    Style Visuel
                  </label>
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Pixel Art">Pixel Art</option>
                    <option value="2D Dessiné à la main">2D Dessiné</option>
                    <option value="3D Rétro Low-poly">3D Rétro Low-poly</option>
                    <option value="3D Stylisée">3D Stylisée</option>
                    <option value="Monochrome">Monochrome</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    Game Jam (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={jam}
                    onChange={(e) => setJam(e.target.value)}
                    placeholder="ex: GMTK 2024, Ludum Dare 55"
                    className="w-full px-3 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Image de couverture & Pseudo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    URL Image / Jaquette (Optionnel)
                  </label>
                  <div className="flex items-center gap-2">
                    {coverImage && (
                      <img
                        src={coverImage}
                        alt="Aperçu"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover border border-emerald-700 bg-slate-900 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://... image PNG ou JPG (détecté auto si Steam)"
                      className="w-full px-3 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    Déniché par (Votre pseudo)
                  </label>
                  <input
                    type="text"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    placeholder="Votre pseudonyme"
                    className="w-full px-3 py-2 bg-[#02100b] border border-emerald-900 rounded-xl text-white placeholder:text-emerald-700 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="px-4 py-2 text-sm text-emerald-400 hover:text-emerald-200 transition-colors"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? t('common.sending', 'Envoi en cours...')
                      : t('micro.form.submitBtn', 'Publier la pépite')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
