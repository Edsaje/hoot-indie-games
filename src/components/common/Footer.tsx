import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Globe, Terminal, Coffee, Sparkles } from 'lucide-react';
import { GithubIcon, YoutubeIcon, PaypalIcon, KofiIcon } from './SocialIcons';
import { OwlLogo } from './OwlLogo';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

import type { NavTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
  onEasterEggTrigger: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onEasterEggTrigger }) => {
  const { t } = useTranslation();
  const [clickCount, setClickCount] = useState(0);

  const handleFooterOwlClick = () => {
    soundFx.playClick();
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      setClickCount(0);
      onEasterEggTrigger();
    }
  };

  return (
    <footer className="w-full bg-[#010604]/90 border-t border-[#0d543e]/50 mt-16 py-12 text-slate-400 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Support & Community Encart */}
        <div className="relative overflow-visible bg-gradient-to-br from-[#072a20] via-[#05261c] to-[#021711] border-2 border-[#78350f] rounded-3xl p-6 sm:p-8 mb-12 shadow-2xl">
          <SylvestreIvyFrame density="delicate" />
          
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <span>🌿</span>
                  {t('footer.supportBadge', '100% Indépendant & Sans Pub Intrusive')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  {t('footer.supportTag', 'Soutenir le Projet')}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('footer.supportTitle', 'Soutenir le Sanctuaire & Hoot Indie Games')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {t('footer.supportDesc', 'Hoot est une création artisanale, gratuite et sans abonnement dédiée aux passionnés du jeu vidéo indépendant. Vos contributions financent directement l\'hébergement, le nom de domaine et le développement continu de nouveaux mini-jeux et outils.')}
              </p>

              <div className="mt-3.5 pt-3 border-t border-[#0d543e]/50 text-xs text-emerald-200/90 flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold text-amber-200">
                  {t('footer.partnerNotePrefix', 'Développeurs & Studios Indés :')}
                </span>
                <span>
                  {t('footer.partnerNote', 'Envie d\'une mise en avant (Pépite, concours de clés Steam, partenariat bienveillant) ?')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTab('roost');
                  }}
                  className="text-emerald-300 hover:text-emerald-100 underline font-semibold transition ml-1 cursor-pointer"
                >
                  {t('footer.partnerLink', 'Échanger sur Le Perchoir')} →
                </button>
              </div>
            </div>

            {/* Donation Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="https://ko-fi.com/hibouxe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#ff5e5b] hover:bg-[#fa4946] text-white font-bold text-sm shadow-lg shadow-rose-950/40 hover:scale-[1.02] active:scale-[0.98] transition border border-rose-400/30"
                title="Offrir un café sur Ko-fi"
              >
                <KofiIcon className="w-5 h-5 fill-current" />
                <span>{t('footer.kofiCta', 'Offrir un café sur Ko-fi')}</span>
              </a>

              <a
                href="https://paypal.me/Hibouxe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-sm shadow-lg shadow-blue-950/40 hover:scale-[1.02] active:scale-[0.98] transition border border-sky-400/30"
                title="Faire un don via PayPal"
              >
                <PaypalIcon className="w-5 h-5 fill-current" />
                <span>{t('footer.paypalCta', 'Faire un don via PayPal')}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Details */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                onClick={handleFooterOwlClick}
                className="cursor-pointer select-none hover:scale-110 transition-transform"
                title="Tapotez 3 fois..."
              >
                <OwlLogo size="sm" />
              </div>
              <span className="font-black text-white text-lg tracking-wider">
                HOOT <span className="text-[#f59e0b]">INDIE</span> GAMES
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-4">
              {t('app.tagline')}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://quentinbeaud.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-amber-400 transition"
                title="Portfolio Quentin Beaud"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Edsaje"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-white transition"
                title="GitHub Edsaje"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@Hibouxe"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-red-400 transition"
                title="YouTube Hibouxe"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://ko-fi.com/hibouxe"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition"
                title="Ko-fi Hibouxe"
              >
                <KofiIcon className="w-4 h-4" />
              </a>
              <a
                href="https://paypal.me/Hibouxe"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition"
                title="PayPal Hibouxe"
              >
                <PaypalIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Mini-Jeux */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest mb-3">
              {t('nav.games')} (10)
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('minigames')}
                  className="hover:text-amber-400 text-amber-300 font-bold transition flex items-center gap-1"
                >
                  <span>✦ Hub {t('nav.games')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('screenle')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  1. {t('nav.screenle')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('indledle')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  2. {t('nav.indledle')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('linkle')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  3. {t('nav.linkle')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('profille')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  4. {t('nav.profille')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('chrono')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  5. {t('nav.chrono')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('pixel')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  6. {t('nav.pixel')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('review')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  7. {t('nav.review')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('blindtest')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  8. {t('nav.blindtest')}
                </button>
              </li>
              <li className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => onSelectTab('timeattack')}
                  className="hover:text-amber-400 text-slate-300 transition flex items-center gap-1"
                >
                  <span>9. {t('nav.timeattack')}</span>
                  <span className="text-[9px] font-bold uppercase px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                    ⚡
                  </span>
                </button>
                <button
                  onClick={() => onSelectTab('versus')}
                  className="hover:text-amber-400 text-slate-300 transition flex items-center gap-1"
                >
                  <span>10. {t('nav.versus')}</span>
                  <span className="text-[9px] font-bold uppercase px-1 py-0.2 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                    ⚔️
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Espaces */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest mb-3">
              Espaces & Outils
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('toolbox')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  {t('nav.toolbox')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('roost')}
                  className="hover:text-amber-400 text-slate-300 transition"
                >
                  {t('nav.roost')}
                </button>
              </li>
              <li className="pt-2 text-xs text-slate-400 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>React 18+ • TypeScript • Vite</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} Hoot Indie Games — Développé par Quentin Beaud (Hibouxe / Edsaje).
          </div>
          <div className="flex items-center gap-1">
            <span>Fait pour les passionnés du jeu vidéo indépendant</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 inline fill-amber-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
