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
  MessageSquare,
  Mail,
  Copy,
  Check,
  Send,
  Handshake,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GithubIcon, YoutubeIcon, KofiIcon, PaypalIcon } from '../common/SocialIcons';
import { OwlLogo } from '../common/OwlLogo';
import { ROOST_PROJECTS } from '../../data/roostProjects';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { useChat } from '../../context/useChat';
import { getLocalizedText } from '../../utils/localization';
import type { ArcadeGameId } from '../arcade/ArcadeModal';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

type CategoryFilter = 'all' | 'game' | 'lore' | 'prototype';

interface TheRoostHubProps {
  onOpenArcade?: (gameId?: ArcadeGameId) => void;
  onNavigateMiniGames?: () => void;
}

export const TheRoostHub: React.FC<TheRoostHubProps> = ({ onOpenArcade, onNavigateMiniGames }) => {
  const { t, i18n } = useTranslation();
  const { unlockAchievement } = useAchievements();
  const { openChat } = useChat();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const contactEmail = 'contact@quentinbeaud.com';
  const emailSubject = encodeURIComponent('[Partenariat Hoot] Proposition de jeu indépendant');

  const contactTemplateText = `Objet : [Partenariat Hoot] Proposition du jeu : [Nom du Jeu]

Bonjour Quentin,

Je suis [Votre Nom / Votre Studio], créateur du jeu indépendant [Nom du jeu].
Le jeu est disponible / arrive prochainement sur Steam : [Lien de la page Steam / Démo / Itch.io]

Présentation rapide :
- Titre : [Nom du jeu]
- Studio / Développeur : [Nom du studio ou créateur solo]
- Date de sortie (ou fenêtre de lancement) : [ex: 15 Novembre 2026]
- Genre & Ambiance : [ex: Metroidvania poétique, Rogue-lite tactique, Enquête narrative...]
- Pitch en 2 lignes : [Ce qui rend votre jeu unique, son univers, sa patte graphique...]

Type de partenariat / collaboration envisagée :
[ ] Mise en avant "Pépite Vedette" dans le sanctuaire Hoot
[ ] Concours de clés Steam pour la communauté (nous pouvons offrir 5 à 10 clés)
[ ] Essai vidéo / Présentation sur la chaîne YouTube @Hibouxe
[ ] Intégration d'un avatar compagnon exclusif dans le profil joueur
[ ] Autre idée créative / Proposition libre

Liens utiles :
- Bande-annonce / Trailer : [Lien YouTube]
- Dossier de presse / Presskit : [Lien]
- Réseaux sociaux / Discord : [Lien]

Merci pour ton temps et pour ce sanctuaire dédié au jeu indépendant !
Bien amicalement,
[Votre Signature]`;

  const emailBody = encodeURIComponent(contactTemplateText);

  const handleCopyTemplate = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(contactTemplateText);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  React.useEffect(() => {
    unlockAchievement('roost_explorer');
  }, [unlockAchievement]);

  const filteredProjects = ROOST_PROJECTS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'game') return p.category === 'game';
    if (filter === 'lore') return p.category === 'lore';
    if (filter === 'prototype') return p.category === 'prototype' || p.category === 'tool';
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Header - Nocturnal Woodland Roost Ambiance */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-8 sm:p-12 mb-10 shadow-2xl">
        <SylvestreIvyFrame density="medium" />
        {/* Soft emerald forest glow in background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-950/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>🌿</span>
              {t('roost.woodlandRoost')}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Feather className="w-3.5 h-3.5" />
              {t('roost.portfolioProjects')}
            </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06241b] border border-[#0d543e] text-emerald-100/90 font-bold text-xs hover:border-red-500/50 hover:text-red-400 transition"
            >
              <YoutubeIcon className="w-4 h-4 text-red-500" />
              YouTube @Hibouxe
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://github.com/Edsaje"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06241b] border border-[#0d543e] text-emerald-100/90 font-bold text-xs hover:border-amber-500/50 hover:text-white transition"
            >
              <GithubIcon className="w-4 h-4 text-amber-400" />
              GitHub @Edsaje
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://ko-fi.com/hibouxe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff5e5b]/15 border border-[#ff5e5b]/40 text-rose-200 hover:text-white hover:bg-[#ff5e5b] font-bold text-xs transition"
              title="Offrir un café sur Ko-fi"
            >
              <KofiIcon className="w-4 h-4 fill-current" />
              Ko-fi
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://paypal.me/Hibouxe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0070ba]/15 border border-[#0070ba]/40 text-sky-200 hover:text-white hover:bg-[#0070ba] font-bold text-xs transition"
              title="Faire un don via PayPal"
            >
              <PaypalIcon className="w-4 h-4 fill-current" />
              PayPal
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                openChat('global');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-amber-200" />
              <span>Rejoindre Le Perchoir (Tchat & Idées)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Creator Profile Spotlight */}
      <div className="relative overflow-visible bg-gradient-to-r from-[#072a20] via-[#05261c] to-[#031711] border-2 border-[#78350f] rounded-3xl p-6 sm:p-8 mb-10 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <SylvestreIvyFrame density="delicate" />
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-[#031711] flex items-center justify-center p-3">
            <OwlLogo size="lg" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
            {t('roost.authorDev')}
          </span>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
            <h2 className="text-xl font-black text-white">Quentin Beaud (Hibouxe / Edsaje)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#021711] text-emerald-300 font-bold border border-emerald-800/60">
              🌲 Fullstack & Game Dev
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {t('roost.creatorBio')}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">{t('roost.keySkills')}</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#031711] border border-[#0d543e]/70 text-emerald-300 font-medium">React & TypeScript</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#031711] border border-[#0d543e]/70 text-emerald-300 font-medium">Canvas 2D & Web Audio</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#031711] border border-[#0d543e]/70 text-emerald-300 font-medium">Java / C# Architecture</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#031711] border border-[#0d543e]/70 text-emerald-300 font-medium">🌿 Game Design Poétique & Organique</span>
          </div>
        </div>
      </div>

      {/* Playable Arcade Banner */}
      <div className="relative overflow-visible bg-gradient-to-r from-[#072a20] via-[#05261c] to-[#031711] border-2 border-[#78350f] hover:border-[#b45309] rounded-2xl p-6 sm:p-7 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl transition">
        <SylvestreIvyFrame density="delicate" />
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3.5 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('roost.arcadeBannerBadge')}
            </div>
            <h3 className="text-xl font-black text-white">
              {t('roost.arcadeBannerTitle')}
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {t('roost.arcadeBannerDesc')}
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
          {t('roost.openArcade')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-[#06241b]/90 p-1.5 rounded-2xl border-2 border-[#78350f] max-w-xl mx-auto shadow-lg">
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
                  : 'text-emerald-100/80 hover:text-white hover:bg-[#093a2b]'
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
            className="relative overflow-visible bg-[#06241b]/90 border-2 border-[#78350f] rounded-2xl hover:border-[#b45309] transition duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-amber-950/20"
          >
            <SylvestreIvyFrame density="delicate" />
            {/* Visual Header */}
            <div className="aspect-video relative overflow-hidden bg-slate-950 rounded-t-2xl">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06241b] via-transparent to-transparent opacity-80" />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#031711]/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
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
                  {getLocalizedText(project.tagline, i18n.language)}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {getLocalizedText(project.description, i18n.language)}
                </p>

                {/* Highlights */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="space-y-1.5 mb-5 bg-[#031711] p-3.5 rounded-xl border border-[#0d543e]/60">
                    <div className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-2">
                      {t('roost.highlights')}
                    </div>
                    {project.highlights.map((hl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{getLocalizedText(hl, i18n.language)}</span>
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
                      className="px-2.5 py-1 rounded-lg bg-[#031711] border border-[#0d543e]/50 text-emerald-200/80 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#0d543e]/60 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {project.id === 'arcade-secrete' ? (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onOpenArcade?.('snake');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        {t('roost.playDirect', 'Jouer direct')}
                      </button>
                    ) : project.id === 'minigames-hub' ? (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          if (onNavigateMiniGames) {
                            onNavigateMiniGames();
                          } else {
                            window.location.hash = '#minigames';
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('roost.playDirect', 'Jouer direct')}
                      </button>
                    ) : project.id === 'youtube-hibouxe' ? (
                      <a
                        href={project.links.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md shadow-red-600/20"
                      >
                        <YoutubeIcon className="w-3.5 h-3.5" />
                        {t('roost.viewYoutube', 'Voir la Chaîne')}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : project.id === 'dragon-quest-torneko-fr' ? (
                      <a
                        href={project.links.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t('roost.steamGuide', 'Guide Steam Officiel')}
                      </a>
                    ) : project.id === 'naheulbeuk-tactical' ? (
                      <a
                        href={project.links.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        {t('roost.viewGit', 'Projet GitHub')}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : project.links.demoUrl ? (
                      <a
                        href={project.links.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {t('roost.viewPortfolio', 'Visiter le Portfolio')}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : null}
                  </div>

                  {project.links.githubUrl && project.id !== 'naheulbeuk-tactical' && (
                    <a
                      href={project.links.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={t('roost.viewCode', 'Code source GitHub')}
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

      {/* ============================================================== */}
      {/* ESPACE STUDIOS INDÉS & PARTENARIATS                            */}
      {/* ============================================================== */}
      <div className="relative overflow-visible bg-gradient-to-br from-[#072a20] via-[#05261c] to-[#021711] border-2 border-[#78350f] rounded-3xl p-6 sm:p-10 mb-12 shadow-2xl mt-14">
        <SylvestreIvyFrame density="delicate" />

        {/* Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>🌱</span>
              Espace Studios & Développeurs
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Handshake className="w-3.5 h-3.5 text-amber-400" />
              Partenariats & Mises en Avant
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Vous créez un jeu indépendant ? Faisons rayonner votre projet !
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-4xl">
            Hoot Indie Games est un sanctuaire artisanal conçu pour célébrer la poésie, l'originalité et la créativité de la scène indépendante. Que vous prépariez une sortie sur Steam, le lancement d'une démo ou une campagne Kickstarter, nous serions ravis de mettre votre création à l'honneur auprès de milliers de joueurs passionnés.
          </p>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-[#031711]/80 border border-[#0d543e]/70 space-y-1.5">
              <div className="text-xl">🌟</div>
              <h4 className="font-bold text-white text-sm">Pépite Vedette sur Hoot</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mise en avant sur l'Explorateur de Pépites, badge « Coup de Cœur » et fiche certifiée avec accès direct vers votre page Steam.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#031711]/80 border border-[#0d543e]/70 space-y-1.5">
              <div className="text-xl">🎁</div>
              <h4 className="font-bold text-white text-sm">Concours de Clés Steam</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Offrez 5 à 10 clés à la communauté lors d'un événement sur Le Perchoir ou d'un tournoi de score sur nos mini-jeux.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#031711]/80 border border-[#0d543e]/70 space-y-1.5">
              <div className="text-xl">🦉</div>
              <h4 className="font-bold text-white text-sm">Synergie YouTube @Hibouxe</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Possibilité d'essai vidéo dédié, inclusion dans un format découverte ou présentation sur la chaîne YouTube d'Hibouxe.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsTemplateExpanded(!isTemplateExpanded);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isTemplateExpanded ? 'Masquer le modèle de contact' : '📋 Voir le modèle de contact (Email / Pitch)'}</span>
              {isTemplateExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <a
              href={`mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06241b] border border-[#0d543e] text-emerald-200 hover:text-white hover:bg-emerald-900/40 font-bold text-xs transition"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Écrire directement par e-mail</span>
            </a>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                openChat('feedback');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06241b] border border-[#0d543e] text-emerald-200 hover:text-white hover:bg-emerald-900/40 font-bold text-xs transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Discuter sur Le Perchoir (Tchat)</span>
            </button>

            <a
              href="#catalog"
              onClick={() => soundFx.playClick()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06241b] border border-[#0d543e] text-emerald-200 hover:text-white hover:bg-emerald-900/40 font-bold text-xs transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Suggérer votre jeu sur Steam</span>
            </a>
          </div>

          {/* Collapsible Template Drawer */}
          {isTemplateExpanded && (
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#02130e] border border-amber-500/30 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#0d543e]/60">
                <div>
                  <h4 className="font-black text-white text-sm flex items-center gap-2">
                    <span>✉️</span>
                    Modèle de Message Prêt à l'Emploi
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Copiez ce modèle pré-rempli pour nous présenter votre jeu en quelques minutes.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer active:scale-95 ${
                      copiedTemplate
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {copiedTemplate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTemplate ? 'Copié dans le presse-papier !' : 'Copier le modèle'}</span>
                  </button>

                  <a
                    href={`mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#06241b] border border-emerald-600/40 hover:bg-emerald-900/40 text-emerald-200 text-xs font-bold transition"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Envoyer</span>
                  </a>
                </div>
              </div>

              {/* Template Content Box */}
              <pre className="p-4 rounded-xl bg-[#010a07] border border-[#0d543e]/40 text-xs text-emerald-100/90 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
                {contactTemplateText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
