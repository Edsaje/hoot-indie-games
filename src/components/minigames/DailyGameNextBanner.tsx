import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Layers,
  Sparkles,
  FileSearch,
  History,
  Sliders,
  MessageSquareQuote,
  Music,
  ArrowRight,
  Trophy,
  LayoutGrid,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getChallengeStatusForDate, getTodayDateString } from '../../utils/streakManager';
import type { MiniGameSubTab } from './MiniGamesNav';

export interface DailyGameNextBannerProps {
  currentGame: MiniGameSubTab;
  currentDate: string;
  onNavigateGame?: (nextGame: MiniGameSubTab) => void;
}

interface DailyGameMeta {
  id: MiniGameSubTab;
  dailyKey: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review' | 'blindtest';
  titleKey: string;
  defaultTitle: string;
  subtitleKey: string;
  defaultSubtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBorder: string;
}

export const ORDERED_DAILY_GAMES: DailyGameMeta[] = [
  {
    id: 'screenle',
    dailyKey: 'screenle',
    titleKey: 'minigamesHub.screenle.title',
    defaultTitle: 'Capture (Screenle)',
    subtitleKey: 'minigamesHub.screenle.subtitle',
    defaultSubtitle: 'Déduction visuelle progressive',
    icon: Camera,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    badgeBorder: 'border-cyan-500/40',
  },
  {
    id: 'indledle',
    dailyKey: 'indledle',
    titleKey: 'minigamesHub.indledle.title',
    defaultTitle: 'Classique (Indledle)',
    subtitleKey: 'minigamesHub.indledle.subtitle',
    defaultSubtitle: 'Wordle indé complet',
    icon: Layers,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    badgeBorder: 'border-amber-500/40',
  },
  {
    id: 'linkle',
    dailyKey: 'linkle',
    titleKey: 'minigamesHub.linkle.title',
    defaultTitle: 'Connexions (Linkle)',
    subtitleKey: 'minigamesHub.linkle.subtitle',
    defaultSubtitle: '16 Connexions thématiques',
    icon: Sparkles,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    badgeBorder: 'border-purple-500/40',
  },
  {
    id: 'profille',
    dailyKey: 'profille',
    titleKey: 'minigamesHub.profille.title',
    defaultTitle: 'Profil (Profille)',
    subtitleKey: 'minigamesHub.profille.subtitle',
    defaultSubtitle: 'Fiche d’identité secrète',
    icon: FileSearch,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
  },
  {
    id: 'chrono',
    dailyKey: 'chrono',
    titleKey: 'minigamesHub.chrono.title',
    defaultTitle: 'Chrono',
    subtitleKey: 'minigamesHub.chrono.subtitle',
    defaultSubtitle: 'Frise chronologique indé',
    icon: History,
    accentColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    badgeBorder: 'border-yellow-500/40',
  },
  {
    id: 'pixel',
    dailyKey: 'pixel',
    titleKey: 'minigamesHub.pixel.title',
    defaultTitle: 'Pixel',
    subtitleKey: 'minigamesHub.pixel.subtitle',
    defaultSubtitle: 'Dé-pixellisation & ombre',
    icon: Sliders,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    badgeBorder: 'border-cyan-500/40',
  },
  {
    id: 'review',
    dailyKey: 'review',
    titleKey: 'minigamesHub.review.title',
    defaultTitle: 'Critique Steam',
    subtitleKey: 'minigamesHub.review.subtitle',
    defaultSubtitle: 'Critique de joueur caviardée',
    icon: MessageSquareQuote,
    accentColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    badgeBorder: 'border-sky-500/40',
  },
  {
    id: 'blindtest',
    dailyKey: 'blindtest',
    titleKey: 'minigamesHub.blindtest.title',
    defaultTitle: 'Blind Test OST',
    subtitleKey: 'minigamesHub.blindtest.subtitle',
    defaultSubtitle: 'Reconnaissance musicale Heardle',
    icon: Music,
    accentColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    badgeBorder: 'border-pink-500/40',
  },
];

export const DailyGameNextBanner: React.FC<DailyGameNextBannerProps> = ({
  currentGame,
  currentDate,
  onNavigateGame,
}) => {
  const { t } = useTranslation();
  const statuses = useMemo(() => getChallengeStatusForDate(currentDate), [currentDate]);
  const todayStr = getTodayDateString();
  const isToday = currentDate === todayStr;

  // Calcul du nombre de jeux gagnés et terminés
  const wonCount = useMemo(() => {
    return Object.values(statuses).filter((s) => s === 'won').length;
  }, [statuses]);

  const playedCount = useMemo(() => {
    return Object.values(statuses).filter((s) => s !== 'unplayed').length;
  }, [statuses]);

  // Déterminer le prochain jeu non joué en boucle cyclique
  const { nextGame, allCompleted } = useMemo(() => {
    const currentIndex = ORDERED_DAILY_GAMES.findIndex((g) => g.id === currentGame);
    const total = ORDERED_DAILY_GAMES.length;

    // 1. Chercher d'abord un jeu non joué
    for (let i = 1; i < total; i++) {
      const candidateIndex = (currentIndex + i) % total;
      const candidate = ORDERED_DAILY_GAMES[candidateIndex];
      if (statuses[candidate.dailyKey] === 'unplayed') {
        return { nextGame: candidate, allCompleted: false };
      }
    }

    // 2. Si tous sont joués
    const isAllDone = playedCount === total;
    if (isAllDone) {
      return { nextGame: null, allCompleted: true };
    }

    // Fallback : proposer le suivant séquentiel
    const nextIdx = (currentIndex + 1) % total;
    return { nextGame: ORDERED_DAILY_GAMES[nextIdx], allCompleted: false };
  }, [currentGame, statuses, playedCount]);

  const handleNavigate = (targetGameId: MiniGameSubTab) => {
    soundFx.playClick();
    if (onNavigateGame) {
      onNavigateGame(targetGameId);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#${targetGameId}`;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const NextIcon = nextGame?.icon;

  return (
    <div className="w-full mt-5 pt-4 border-t border-[#1e293b]/80">
      {/* Barre récapitulative des 8 pastilles quotidiennes */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#03150f] border border-[#78350f]/60 shadow-lg mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>{t('minigamesHub.dailyProgressTitle', 'Progression des Défis du Jour')}</span>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                ({wonCount}/8 {t('minigamesHub.solved', 'Résolus')})
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {isToday
                ? t('minigamesHub.dailyProgressSub', 'Enchaînez les 8 épreuves pour illuminer votre série !')
                : t('minigamesHub.archiveProgressSub', 'Archive du {{date}}', { date: currentDate })}
            </div>
          </div>
        </div>

        {/* Les 8 pastilles de progression interactive */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {ORDERED_DAILY_GAMES.map((game) => {
            const status = statuses[game.dailyKey];
            const isCurrent = game.id === currentGame;
            const Icon = game.icon;

            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleNavigate(game.id)}
                className={`relative p-1.5 rounded-lg border transition-all cursor-pointer group ${
                  isCurrent
                    ? 'ring-2 ring-amber-400 bg-amber-500/20 border-amber-400 scale-105'
                    : status === 'won'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                    : status === 'lost'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`${t(game.titleKey, game.defaultTitle)} : ${
                  status === 'won'
                    ? t('minigamesHub.solved', 'Résolu')
                    : status === 'lost'
                    ? t('minigamesHub.failed', 'Échoué')
                    : t('minigamesHub.toPlay', 'À jouer')
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {status === 'won' && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appel à l'action pour le prochain jeu ou célébration du Grand Chelem */}
      {allCompleted ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-2 border-amber-500/40 text-center shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{t('minigamesHub.grandSlamTitle', 'Grand Chelem du Jour Accompli !')}</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {wonCount === 8
              ? t('minigamesHub.grandSlamPerfect', 'Score parfait de 8/8 ! Vous êtes un véritable érudit de la scène indépendante.')
              : t('minigamesHub.grandSlamCompleted', 'Vous avez complété l’ensemble des 8 défis du jour. À demain pour de nouvelles énigmes !')}
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleNavigate('hub')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('minigamesHub.hubTitle', 'Hub des Mini-Jeux')}</span>
            </button>
          </div>
        </div>
      ) : nextGame && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#093a2b]/90 border-2 border-amber-500/40 shadow-xl">
          <div className="flex items-center gap-3 text-left">
            <div className={`p-2.5 rounded-xl border ${nextGame.accentColor} shrink-0`}>
              {NextIcon && <NextIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                {t('minigamesHub.nextChallengeLabel', 'Défi Suivant Recommandé')}
              </div>
              <div className="text-sm font-black text-white">
                {t(nextGame.titleKey, nextGame.defaultTitle)}
              </div>
              <div className="text-xs text-slate-300">
                {t(nextGame.subtitleKey, nextGame.defaultSubtitle)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleNavigate('hub')}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[#06241b] hover:bg-[#03150f] border border-[#78350f] text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              title={t('minigamesHub.viewAllInHub', 'Voir tous les mini-jeux')}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('minigamesHub.hubTitle', 'Hub')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate(nextGame.id)}
              className="flex-2 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('minigamesHub.playNext', 'Jouer au Défi Suivant')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
