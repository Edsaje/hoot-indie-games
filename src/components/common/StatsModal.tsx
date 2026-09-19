import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Award, Flame, BarChart3, RotateCcw, Share2, Check } from 'lucide-react';
import { useGameStats } from '../../context/useGameStats';
import { soundFx } from '../../utils/audio';

import { type DailyGameMode, defaultOverallStats } from '../../context/GameStatsContext';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: DailyGameMode;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, initialTab = 'screenle' }) => {
  const { t } = useTranslation();
  const { stats, resetStats } = useGameStats();
  const [activeTab, setActiveTab] = useState<DailyGameMode>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentModeStats = stats[activeTab] || defaultOverallStats[activeTab];
  const winRate = currentModeStats.played > 0
    ? Math.round((currentModeStats.won / currentModeStats.played) * 100)
    : 0;

  const maxFreq = Math.max(1, ...Object.values(currentModeStats.guessDistribution));

  const handleShare = () => {
    soundFx.playClick();
    const text = `🦉 Hoot Indie Games Stats [${activeTab.toUpperCase()}]\n🏆 Victoires: ${winRate}%\n🔥 Série: ${currentModeStats.currentStreak} (Max: ${currentModeStats.maxStreak})\n🎮 https://hootindiegames.com`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser vos statistiques locales ?')) {
      resetStats();
      soundFx.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-[#f59e0b]" />
          <h2 className="text-xl font-bold text-white tracking-wide">
            {t('nav.stats')}
          </h2>
        </div>

        {/* Tabs for each mode */}
        <div className="grid grid-cols-7 gap-1 bg-[#0b0f19] p-1 rounded-xl border border-[#1e293b] mb-6">
          {(['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`py-1.5 text-[9px] sm:text-[11px] font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#1e293b] text-[#f59e0b] shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'pixel' ? 'Pixel' : tab === 'review' ? 'Review' : t('nav.' + tab)}
            </button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          <div className="bg-[#0b0f19] border border-[#1e293b] p-2.5 rounded-xl">
            <div className="text-2xl font-black text-white">{currentModeStats.played}</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">{t('common.played')}</div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1e293b] p-2.5 rounded-xl">
            <div className="text-2xl font-black text-[#10b981]">{winRate}%</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">{t('common.winRate')}</div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1e293b] p-2.5 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#f59e0b]">
              <Flame className="w-4 h-4 text-[#f59e0b]" />
              {currentModeStats.currentStreak}
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">{t('common.streak')}</div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1e293b] p-2.5 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#8b5cf6]">
              <Award className="w-4 h-4 text-[#8b5cf6]" />
              {currentModeStats.maxStreak}
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">{t('common.maxStreak')}</div>
          </div>
        </div>

        {/* Guess Distribution Chart */}
        <div className="mb-6">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
            Distribution des victoires
          </h3>
          <div className="space-y-1.5">
            {Object.entries(currentModeStats.guessDistribution).map(([guessNum, count]) => {
              const pct = maxFreq > 0 ? (count / maxFreq) * 100 : 0;
              return (
                <div key={guessNum} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-mono font-bold text-slate-400 text-right">{guessNum}</span>
                  <div className="flex-1 bg-[#0b0f19] rounded h-5 p-0.5 overflow-hidden border border-[#1e293b]">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-[#f59e0b] h-full rounded text-right pr-2 text-[10px] font-bold text-slate-950 flex items-center justify-end transition-all duration-500 min-w-[1.5rem]"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t('common.copied')}
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                {t('common.share')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
