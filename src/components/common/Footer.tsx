import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Globe, Terminal } from 'lucide-react';
import { GithubIcon, YoutubeIcon } from './SocialIcons';
import { soundFx } from '../../utils/audio';

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
    <footer className="w-full bg-[#080b13] border-t border-[#1e293b] mt-16 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Lore */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span
                onClick={handleFooterOwlClick}
                className="text-2xl cursor-pointer select-none hover:scale-110 transition-transform inline-block"
                title="Tapotez 3 fois..."
              >
                🦉
              </span>
              <span className="font-black text-white text-lg tracking-wider">
                HOOT <span className="text-[#f59e0b]">INDIE</span> GAMES
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
              La plateforme web bilingue consacrée à l'exploration, la déduction et la célébration des jeux vidéo indépendants. Conçue avec passion pour tous les curieux des mondes singuliers.
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
            </div>
          </div>

          {/* Col 2: Mini-Jeux */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest mb-3">
              {t('nav.games')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('screenle')}
                  className="hover:text-amber-400 transition"
                >
                  Mode 1 : Screenle
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('indledle')}
                  className="hover:text-amber-400 transition"
                >
                  Mode 2 : Indledle
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('linkle')}
                  className="hover:text-amber-400 transition"
                >
                  Mode 3 : Linkle (Connections)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('versus')}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <span>Mode 4 : Versus 1v1</span>
                  <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                    Live
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Espaces */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest mb-3">
              Espaces & Données
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('toolbox')}
                  className="hover:text-amber-400 transition"
                >
                  {t('nav.toolbox')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('roost')}
                  className="hover:text-amber-400 transition"
                >
                  {t('nav.roost')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('toolbox')}
                  className="hover:text-emerald-400 transition flex items-center gap-1.5 text-emerald-400/90"
                >
                  <span>🛡️ Observatoire Sans Cookie</span>
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>React 18+ • Vite • TS Strict</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Hoot Indie Games — Signé Quentin Beaud (Hibouxe / Edsaje).
          </div>
          <div className="flex items-center gap-1">
            <span>Fait avec minutie et amour pour le jeu vidéo indépendant</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 inline fill-amber-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
