import React, { useState, useEffect } from 'react';
import { X, Dice5, Compass, ExternalLink, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Game } from '../../types/game';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { ItchIcon } from '../common/ItchIcon';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { getLocalizedText, getTranslatedGenre } from '../../utils/localization';
import { getAppIdFromSteamUrl } from '../../utils/steamUrl';
import { getSteamStoreData } from '../../data/steamStoreData';
import { soundFx } from '../../utils/audio';

interface RandomGemModalProps {
  game: Game | null;
  onClose: () => void;
  onPickAnother: () => void;
  onLocateInCatalog?: (game: Game) => void;
}

const formatReviewCount = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
};

export const RandomGemModal: React.FC<RandomGemModalProps> = ({
  game,
  onClose,
  onPickAnother,
  onLocateInCatalog,
}) => {
  const { t, i18n } = useTranslation();
  const { isGameOwned } = useUserAccount();
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  // Reset screenshot index when game changes
  useEffect(() => {
    setScreenshotIndex(0);
  }, [game?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  const appId = getAppIdFromSteamUrl(game.steamUrl) || (game as any).steamAppId;
  const store = (appId ? getSteamStoreData(appId) : undefined) || (game as any).steamStoreData;

  const currentScreenshot =
    (game.screenshots && game.screenshots[screenshotIndex]) ||
    (game.screenshots && game.screenshots[0]) ||
    (game as any).headerImage ||
    '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="group relative bg-[#072a20] border-2 border-[#78350f] rounded-3xl w-full max-w-2xl overflow-visible shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <SylvestreIvyFrame density="delicate" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b4332] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Dice5 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {t('catalog.randomPickHeading', 'Tirage Aléatoire')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {t('catalog.sanctuaryGemBadge', 'Pépite du Sanctuaire')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {game.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label={t('common.close', 'Fermer')}
            title={t('common.close', 'Fermer')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screenshot Hero */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-lg group">
          {currentScreenshot ? (
            <img
              src={currentScreenshot}
              alt={game.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              {game.title}
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-mono text-xs font-bold border border-amber-500/30 shadow">
              {game.releaseYear}
            </span>
            {isGameOwned(game.steamUrl) && (
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 backdrop-blur-md text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1 shadow">
                <SteamIcon className="w-3 h-3 text-cyan-400" />
                <span>{t('catalog.ownedBadge', 'Possédé')}</span>
              </span>
            )}
          </div>

          {/* Mini Screenshot Carousel Switcher */}
          {game.screenshots && game.screenshots.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {game.screenshots.slice(0, 6).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setScreenshotIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    screenshotIndex === idx
                      ? 'bg-amber-400 w-5'
                      : 'bg-white/40 hover:bg-white/70 w-2.5'
                  }`}
                  title={`Image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-amber-300 font-semibold">
              {t('catalog.studioLabel', 'Studio')} : <span className="text-white font-bold">{game.developer}</span>
              <span className="text-slate-400 mx-2">•</span>
              <span>{getLocalizedText(game.camera, i18n.language)}</span>
              <span className="text-slate-400 mx-2">•</span>
              <span>{getLocalizedText(game.artStyle, i18n.language)}</span>
            </div>

            {/* Steam Store Score if available */}
            {store && store.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/40 text-sky-300 text-xs font-bold font-mono">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{store.positivePercent}% {t('catalog.positivePercentSuffix', 'positifs')}</span>
                </span>
                <span className="text-xs text-slate-400">
                  ({formatReviewCount(store.totalReviews)} {t('catalog.reviewsUnit', 'avis')})
                </span>
              </div>
            )}
          </div>

          {/* Tagline */}
          {game.hints?.tagline && (
            <p className="text-sm text-slate-200 italic bg-[#041710] p-3.5 rounded-xl border border-[#1b4332] leading-relaxed">
              « {getLocalizedText(game.hints.tagline, i18n.language)} »
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {game.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg bg-[#0b1b14] text-emerald-200 text-xs font-medium border border-[#1b4332]"
              >
                {getTranslatedGenre(g, i18n.language)}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-3 border-t border-[#1b4332] flex flex-wrap items-center gap-2.5 justify-between">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            {game.steamUrl && (
              <a
                href={game.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-95"
              >
                <SteamIcon className="w-4 h-4 text-slate-950" />
                <span>{t('catalog.viewOnSteam', 'Découvrir sur Steam')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {game.itchUrl && (
              <a
                href={game.itchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#fa5c5c]/20 hover:bg-[#fa5c5c]/30 text-[#fa5c5c] border border-[#fa5c5c]/40 text-xs font-bold transition active:scale-95"
              >
                <ItchIcon className="w-4 h-4 text-[#fa5c5c]" />
                <span>Itch.io</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onPickAnother();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1b14] hover:bg-emerald-950 text-amber-400 border border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              title={t('catalog.pickAnotherTooltip', 'Relancer un tirage aléatoire')}
            >
              <Dice5 className="w-4 h-4" />
              <span>{t('catalog.anotherGemBtn', 'Autre pépite 🎲')}</span>
            </button>

            {onLocateInCatalog && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onLocateInCatalog(game);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
                title={t('catalog.locateInCatalogTooltip', 'Voir la carte dans le catalogue complet')}
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>{t('catalog.inCatalogBtn', 'Dans le catalogue')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
