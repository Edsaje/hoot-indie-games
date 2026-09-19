import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Layers,
  Sparkles,
  FileSearch,
  History,
  Sliders,
  MessageSquareQuote,
  Zap,
  Swords,
  Flame,
  CheckCircle2,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { useGameStats } from '../../context/useGameStats';
import { getChallengeStatusForDate, getTodayDateString } from '../../utils/streakManager';

export type MiniGameId =
  | 'screenle'
  | 'indledle'
  | 'linkle'
  | 'profille'
  | 'chrono'
  | 'pixel'
  | 'review'
  | 'timeattack'
  | 'versus';

interface MiniGamesHubProps {
  onSelectGame: (gameId: MiniGameId) => void;
  currentDate: string;
}

export const MiniGamesHub: React.FC<MiniGamesHubProps> = ({
  onSelectGame,
  currentDate,
}) => {
  const { i18n } = useTranslation();
  const { stats } = useGameStats();
  const isFr = i18n.language.startsWith('fr');

  const todayStr = getTodayDateString();
  const dailyStatuses = getChallengeStatusForDate(currentDate);

  const gamesList: {
    id: MiniGameId;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeText?: string;
    badgeColor?: string;
    isDaily: boolean;
    dailyKey?: 'screenle' | 'indledle' | 'linkle' | 'profille' | 'chrono' | 'pixel' | 'review';
  }[] = [
    {
      id: 'screenle',
      title: isFr ? 'Capture' : 'Framed',
      subtitle: isFr ? 'Déduction visuelle progressive' : 'Progressive visual deduction',
      description: isFr
        ? "Identifiez le jeu indé du jour à travers 6 captures d'écran et zooms progressifs."
        : 'Identify the daily indie game using 6 progressive screenshots and zooms.',
      icon: Camera,
      accentColor: 'from-blue-600/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400',
      isDaily: true,
      dailyKey: 'screenle',
    },
    {
      id: 'indledle',
      title: 'Classic',
      subtitle: isFr ? 'Wordle indé complet' : 'Complete Indie Wordle',
      description: isFr
        ? "Déduisez le jeu secret en comparant l'année, le studio, les genres, l'angle de caméra et l'art."
        : 'Deduce the secret game comparing year, studio, genres, camera perspective, and art style.',
      icon: Layers,
      accentColor: 'from-amber-600/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      isDaily: true,
      dailyKey: 'indledle',
    },
    {
      id: 'linkle',
      title: isFr ? 'Connexions' : 'Connections',
      subtitle: isFr ? '16 Connexions thématiques' : '16 Thematic Connections',
      description: isFr
        ? 'Regroupez 16 jeux indés par 4 groupes secrets partageant un point commun astucieux.'
        : 'Group 16 indie games into 4 secret categories sharing a clever common thread.',
      icon: Sparkles,
      accentColor: 'from-purple-600/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      isDaily: true,
      dailyKey: 'linkle',
    },
    {
      id: 'profille',
      title: isFr ? 'Profil' : 'Profile',
      subtitle: isFr ? "Fiche d'identité secrète" : 'Secret Game ID Card',
      description: isFr
        ? "Le titre et les captures sont révélés : retrouvez l'année de sortie, le studio et le style de jeu !"
        : 'The title and screenshots are revealed: identify the release year, developer studio, and game style!',
      icon: FileSearch,
      accentColor: 'from-emerald-600/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      isDaily: true,
      dailyKey: 'profille',
    },
    {
      id: 'chrono',
      title: isFr ? 'Chrono' : 'Timeline',
      subtitle: isFr ? 'Frise chronologique indé' : 'Indie Chronological Timeline',
      description: isFr
        ? "Replacez 4 jeux indés mystères à leur date exacte sur la frise chronologique sans épuiser vos 3 cœurs !"
        : 'Slot 4 mystery indie games into their exact release date order on the timeline without losing your 3 hearts!',
      icon: History,
      accentColor: 'from-amber-600/20 to-yellow-500/20 border-yellow-500/30 text-yellow-400',
      badgeText: isFr ? 'Nouveau !' : 'New!',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isDaily: true,
      dailyKey: 'chrono',
    },
    {
      id: 'pixel',
      title: 'Pixel & Silhouette',
      subtitle: isFr ? 'Dé-pixellisation & ombre' : 'De-pixelation & shadow',
      description: isFr
        ? 'Identifiez la pépite indé en 5 essais grâce à la mosaïque progressive et aux indices débloqués !'
        : 'Identify the indie gem in 5 guesses through progressive mosaic resolution and unlocked clues!',
      icon: Sliders,
      accentColor: 'from-cyan-600/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
      badgeText: isFr ? 'Nouveau !' : 'New!',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isDaily: true,
      dailyKey: 'pixel',
    },
    {
      id: 'review',
      title: isFr ? 'Critique Steam' : 'Steam Review',
      subtitle: isFr ? 'Critique de joueur caviardée' : 'Redacted user review',
      description: isFr
        ? "Retrouvez le jeu mystère à partir d'un authentique avis de joueur Steam dont les mots-clés sont caviardés !"
        : 'Identify the mystery game from an authentic Steam user review with redacted spoiler terms!',
      icon: MessageSquareQuote,
      accentColor: 'from-sky-600/20 to-blue-500/20 border-sky-500/30 text-sky-400',
      badgeText: isFr ? 'Nouveau !' : 'New!',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      isDaily: true,
      dailyKey: 'review',
    },
    {
      id: 'timeattack',
      title: 'Time Attack',
      subtitle: isFr ? 'Sprint chrono 60 secondes' : '60-Second Timed Sprint',
      description: isFr
        ? 'Enchaînez un maximum de déductions indés avant la fin du temps pour battre votre record.'
        : 'Chain as many indie deductions as possible before the clock hits zero to set your high score.',
      icon: Zap,
      accentColor: 'from-yellow-600/20 to-amber-500/20 border-yellow-500/30 text-yellow-400',
      badgeText: 'Sprint',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      isDaily: false,
    },
    {
      id: 'versus',
      title: isFr ? 'Duel 1v1' : '1v1 Duel',
      subtitle: isFr ? 'Arène multijoueur en temps réel' : 'Real-Time Multiplayer Arena',
      description: isFr
        ? 'Défiez vos amis ou des joueurs en ligne dans des duels de culture indé en direct.'
        : 'Challenge friends or online rivals in real-time indie culture duels.',
      icon: Swords,
      accentColor: 'from-rose-600/20 to-red-500/20 border-rose-500/30 text-rose-400',
      badgeText: 'Live 1v1',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      isDaily: false,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Hub Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFr ? 'Hub des Mini-Jeux Indés' : 'Indie Mini-Games Hub'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
          {isFr ? 'La Salle des Défis Indépendants' : 'The Indie Challenge Arena'}
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto mt-2 leading-relaxed">
          {isFr
            ? '7 disciplines pour tester votre culture des jeux vidéo indépendants. Résolvez les énigmes quotidiennes pour faire grandir vos séries ou lancez des parties rapides !'
            : '7 distinct disciplines to test your indie game mastery. Solve daily puzzles to nurture your streaks or jump into rapid-fire sprints!'}
        </p>
      </div>

      {/* Grid of 6 Mini-Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gamesList.map((game) => {
          const Icon = game.icon;
          const isDaily = game.isDaily;
          const status = game.dailyKey ? dailyStatuses[game.dailyKey] : null;
          const modeStats = game.dailyKey ? stats[game.dailyKey] : null;

          return (
            <div
              key={game.id}
              onClick={() => {
                soundFx.playClick();
                onSelectGame(game.id);
              }}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#131a29] hover:bg-[#182236] border border-[#1e293b] hover:border-amber-500/50 p-5 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <div>
                {/* Top Row: Icon + Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${game.accentColor} border shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {game.badgeText && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          game.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {game.badgeText}
                      </span>
                    )}

                    {isDaily && status && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          status === 'won'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : status === 'lost'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {status === 'won' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{isFr ? 'Résolu' : 'Solved'}</span>
                          </>
                        ) : status === 'lost' ? (
                          <span>{isFr ? 'Échoué' : 'Failed'}</span>
                        ) : (
                          <span>{isFr ? 'À jouer' : 'To play'}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Game Title & Subtitle */}
                <h3 className="text-xl font-black text-white tracking-wide group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>{game.title}</span>
                </h3>
                <div className="text-xs font-semibold text-amber-400/90 mb-2">
                  {game.subtitle}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {game.description}
                </p>
              </div>

              {/* Bottom Footer: Streak / Stats & Play button */}
              <div className="pt-3 border-t border-[#1e293b]/70 flex items-center justify-between gap-2 mt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  {isDaily && modeStats && (
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>
                        {modeStats.currentStreak} {isFr ? 'j' : 'd'}
                      </span>
                    </span>
                  )}
                  {isDaily && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      • {currentDate === todayStr ? (isFr ? 'Aujourd’hui' : 'Today') : currentDate}
                    </span>
                  )}
                  {!isDaily && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isFr ? 'Parties illimitées' : 'Unlimited games'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-black text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{isFr ? 'Jouer' : 'Play'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
