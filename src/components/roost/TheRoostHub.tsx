import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Feather,
  ExternalLink,
  Globe,
  Sparkles,
  Gamepad2,
  Code2,
  Tv,
  CheckCircle,
} from 'lucide-react';
import { GithubIcon, YoutubeIcon } from '../common/SocialIcons';
import { OwlLogo } from '../common/OwlLogo';
import { ROOST_PROJECTS } from '../../data/roostProjects';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import type { ArcadeGameId } from '../arcade/ArcadeModal';

type CategoryFilter = 'all' | 'game' | 'lore' | 'prototype';

interface TheRoostHubProps {
  onOpenArcade?: (gameId?: ArcadeGameId) => void;
}

export const TheRoostHub: React.FC<TheRoostHubProps> = ({ onOpenArcade }) => {
  const { t, i18n } = useTranslation();
  const { unlockAchievement } = useAchievements();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const [filter, setFilter] = useState<CategoryFilter>('all');

  React.useEffect(() => {
    unlockAchievement('roost_explorer');
  }, [unlockAchievement]);

  const filteredProjects = ROOST_PROJECTS.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-[#131a29] border border-[#1e293b] p-8 sm:p-12 mb-10 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Feather className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Portfolio & Projets Indés' : 'Portfolio & Indie Projects'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t('roost.title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            {t('roost.subtitle')}
          </p>

          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="https://quentinbeaud.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
            >
              <Globe className="w-4 h-4" />
              Portfolio Quentin Beaud
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://www.youtube.com/@Hibouxe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-slate-200 font-bold text-xs hover:border-red-500/50 hover:text-red-400 transition"
            >
              <YoutubeIcon className="w-4 h-4 text-red-500" />
              YouTube @Hibouxe
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://github.com/Edsaje"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-slate-200 font-bold text-xs hover:border-amber-500/50 hover:text-white transition"
            >
              <GithubIcon className="w-4 h-4 text-amber-400" />
              GitHub @Edsaje
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Creator Profile Spotlight */}
      <div className="bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 sm:p-8 mb-10 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-950/90 flex items-center justify-center p-3">
            <OwlLogo size="lg" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow">
            Auteur & Dev
          </span>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
            <h2 className="text-xl font-black text-white">Quentin Beaud (Hibouxe / Edsaje)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-400 font-bold border border-slate-700">
              Fullstack & Game Dev
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {t('roost.creatorBio')}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Compétences clés :</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-slate-800 font-medium">React & TypeScript</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-slate-800 font-medium">Canvas 2D / Web Audio</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-slate-800 font-medium">Java / C# Architecture</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-slate-800 font-medium">Analyse Narrative & Game Design</span>
          </div>
        </div>
      </div>

      {/* Playable Arcade Banner */}
      <div className="bg-[#131a29] border border-amber-500/40 hover:border-amber-500/60 rounded-2xl p-6 sm:p-7 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl transition">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3.5 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              8 Mini-Jeux Jouables Immédiatement
            </div>
            <h3 className="text-xl font-black text-white">
              La Salle d'Arcade d'Hibouxe
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Snake, Pong, Casse-Briques, Flappy Hibou, Invaders, Forest Run, Tetris et Mine Storm Vectrex 1982 : jouez directement dans le navigateur à 60 FPS constants sans quitter le site.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenArcade?.('snake');
          }}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4" />
          Ouvrir la Salle d'Arcade
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-[#131a29] p-1.5 rounded-2xl border border-[#1e293b] max-w-xl mx-auto">
        {(
          [
            { id: 'all', label: t('roost.allFilter'), icon: Sparkles },
            { id: 'game', label: t('roost.gameFilter'), icon: Gamepad2 },
            { id: 'lore', label: t('roost.loreFilter'), icon: Tv },
            { id: 'prototype', label: t('roost.prototypeFilter'), icon: Code2 },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                setFilter(item.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                active
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-[#131a29] border border-[#1e293b] rounded-2xl overflow-hidden hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-amber-500/5"
          >
            {/* Visual Header */}
            <div className="aspect-video relative overflow-hidden bg-slate-950">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131a29] via-transparent to-transparent opacity-80" />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0b0f19]/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                {project.category}
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-slate-200 border border-white/10">
                {project.releaseYear}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition mb-1">
                  {project.title}
                </h3>
                <p className="text-xs font-semibold text-[#f59e0b] mb-3">
                  {project.tagline[lang]}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {project.description[lang]}
                </p>

                {/* Highlights */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="space-y-1.5 mb-5 bg-[#0b0f19] p-3.5 rounded-xl border border-[#1e293b]">
                    <div className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-2">
                      {t('roost.highlights')}
                    </div>
                    {project.highlights.map((hl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{hl[lang]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags & Action Links */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-slate-800 text-slate-300 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {['arcade-secrete', 'vectrex-mine-storm', 'la-foret-du-hibou', 'hibou-clicker'].includes(project.id) ? (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          if (project.id === 'vectrex-mine-storm') onOpenArcade?.('vectrex');
                          else if (project.id === 'la-foret-du-hibou') onOpenArcade?.('run');
                          else if (project.id === 'hibou-clicker') onOpenArcade?.('flappy');
                          else onOpenArcade?.('snake');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        Jouer en direct
                      </button>
                    ) : project.links.demoUrl ? (
                      <a
                        href={project.links.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        {t('roost.viewDemo')}
                      </a>
                    ) : null}
                    {project.links.videoUrl && (
                      <a
                        href={project.links.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md shadow-red-600/20"
                      >
                        <YoutubeIcon className="w-3.5 h-3.5" />
                        {t('roost.watchVideo')}
                      </a>
                    )}
                  </div>

                  {project.links.githubUrl && (
                    <a
                      href={project.links.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={t('roost.viewCode')}
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
