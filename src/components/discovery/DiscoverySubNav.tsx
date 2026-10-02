import React from 'react';
import { Compass, Database, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { soundFx } from '../../utils/audio';

interface DiscoverySubNavProps {
  currentTab: 'gems' | 'catalog' | 'microindies';
  onSelectTab: (tab: 'gems' | 'catalog' | 'microindies') => void;
}

export const DiscoverySubNav: React.FC<DiscoverySubNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { t } = useTranslation();
  const { stats } = useSteamCatalog();
  const catalogCount = stats.steamCatalogCount > 0 ? stats.steamCatalogCount : 405;

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-center p-1.5 rounded-2xl bg-[#06241b] border border-[#78350f] mb-6 shadow-xl">
      <button
        onClick={() => {
          soundFx.playClick();
          onSelectTab('gems');
        }}
        className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'gems'
            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Compass className="w-3.5 h-3.5 shrink-0" />
        <span>{t('nav.gems', 'Pépites')}</span>
      </button>

      <button
        onClick={() => {
          soundFx.playClick();
          onSelectTab('catalog');
        }}
        className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'catalog'
            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Database className="w-3.5 h-3.5 shrink-0" />
        <span>{t('nav.catalog', 'Catalogue')}</span>
        <span
          className={`text-[9px] font-mono px-1 py-0.2 rounded font-black ${
            currentTab === 'catalog'
              ? 'bg-slate-950/20 text-slate-950'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {catalogCount}
        </span>
      </button>

      <button
        onClick={() => {
          soundFx.playClick();
          onSelectTab('microindies');
        }}
        className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'microindies'
            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>{t('nav.microindies', 'Micro-Indés')}</span>
        <span
          className={`text-[9px] font-mono px-1 py-0.2 rounded font-black ${
            currentTab === 'microindies'
              ? 'bg-slate-950/20 text-slate-950'
              : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          Itch
        </span>
      </button>
    </div>
  );
};
