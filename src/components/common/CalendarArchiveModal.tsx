import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight, X, Sparkles, Flame, Lock, Zap } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import {
  getTodayDateString,
  getYesterdayDateString,
  isDateFuture,
  isDatePastExpired,
  getChallengeStatusForDate,
} from '../../utils/streakManager';

interface CalendarArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export const CalendarArchiveModal: React.FC<CalendarArchiveModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(todayStr);

  const [todayYear, todayMonth] = todayStr.split('-').map(Number); // 1-indexed month
  const [yesterdayYear, yesterdayMonth] = yesterdayStr.split('-').map(Number); // 1-indexed month

  // State for browsing months (viewMonth is 0-indexed)
  const [viewYear, setViewYear] = useState(() => parseInt(currentDate.split('-')[0], 10));
  const [viewMonth, setViewMonth] = useState(() => parseInt(currentDate.split('-')[1], 10) - 1);

  if (!isOpen) return null;

  // Month boundary checks
  const isCurrentOrFutureMonth =
    viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth - 1);

  const isPastMonthLocked =
    viewYear < yesterdayYear || (viewYear === yesterdayYear && viewMonth < yesterdayMonth - 1);

  const prevMonth = () => {
    if (isPastMonthLocked) return;
    soundFx.playClick();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (isCurrentOrFutureMonth) return;
    soundFx.playClick();
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthNames = {
    fr: [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };

  const dayNames = {
    fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startDay = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push({ dateStr: '', dayNum: 0, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-archive-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#0e1422] border border-[#1e293b] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 id="calendar-archive-title" className="text-lg font-black text-white flex items-center gap-2">
                {currentLang === 'fr' ? 'Calendrier & Séries' : 'Calendar & Streaks'}
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'fr'
                  ? 'Faites le jeu du jour ou celui de la veille pour préserver votre flamme de série.'
                  : "Play today's puzzle or catch up on yesterday's to preserve your streak flame."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={prevMonth}
            disabled={isPastMonthLocked}
            title={isPastMonthLocked ? (currentLang === 'fr' ? 'Mois antérieurs expirés' : 'Past months expired') : undefined}
            className={`p-2 rounded-xl border transition ${
              isPastMonthLocked
                ? 'opacity-30 cursor-not-allowed bg-[#131a29]/40 border-slate-800 text-slate-600'
                : 'bg-[#131a29] border-[#1e293b] text-slate-300 hover:text-white hover:border-amber-500/40 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-white text-sm tracking-wide">
            {monthNames[currentLang][viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentOrFutureMonth}
            title={isCurrentOrFutureMonth ? (currentLang === 'fr' ? 'Mois futurs inaccessibles' : 'Future months locked') : undefined}
            className={`p-2 rounded-xl border transition ${
              isCurrentOrFutureMonth
                ? 'opacity-30 cursor-not-allowed bg-[#131a29]/40 border-slate-800 text-slate-600'
                : 'bg-[#131a29] border-[#1e293b] text-slate-300 hover:text-white hover:border-amber-500/40 cursor-pointer'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-2">
          {dayNames[currentLang].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return <div key={`empty-${idx}`} className="h-14 rounded-lg bg-transparent" />;
            }

            // Case 1: Future date (locked)
            if (isDateFuture(item.dateStr, todayStr)) {
              return (
                <div
                  key={item.dateStr}
                  title={currentLang === 'fr' ? 'Jour futur verrouillé' : 'Future day locked'}
                  className="h-14 p-1.5 rounded-xl border border-slate-800/40 bg-[#0c121e]/50 text-slate-600 flex flex-col items-center justify-between text-xs opacity-40 select-none cursor-not-allowed"
                >
                  <div className="w-full flex items-center justify-between px-1">
                    <span className="text-[11px] font-mono text-slate-600">{item.dayNum}</span>
                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                  </div>
                  <div className="flex items-center justify-center pb-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                      {currentLang === 'fr' ? 'Verrouillé' : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            }

            // Case 2: Expired past date (> 1 day ago) (locked)
            if (isDatePastExpired(item.dateStr, todayStr)) {
              const pastStatus = getChallengeStatusForDate(item.dateStr);
              return (
                <div
                  key={item.dateStr}
                  title={
                    currentLang === 'fr'
                      ? `Défi du ${item.dateStr} expiré (seuls aujourd'hui et hier sont jouables pour préserver sa flamme)`
                      : `Challenge from ${item.dateStr} expired (only today and yesterday are playable to preserve streaks)`
                  }
                  className="h-14 p-1 rounded-xl border border-slate-800/30 bg-[#090d16]/60 text-slate-600 flex flex-col items-center justify-between text-xs select-none cursor-not-allowed opacity-45"
                >
                  <div className="w-full flex items-center justify-between px-1">
                    <span className="text-[11px] font-mono text-slate-500">{item.dayNum}</span>
                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                  </div>
                  <div className="flex items-center gap-1 pb-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pastStatus.screenle === 'won'
                          ? 'bg-emerald-600/70'
                          : pastStatus.screenle === 'lost'
                          ? 'bg-rose-600/70'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pastStatus.indledle === 'won'
                          ? 'bg-emerald-600/70'
                          : pastStatus.indledle === 'lost'
                          ? 'bg-rose-600/70'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pastStatus.linkle === 'won'
                          ? 'bg-emerald-600/70'
                          : pastStatus.linkle === 'lost'
                          ? 'bg-rose-600/70'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pastStatus.profille === 'won'
                          ? 'bg-emerald-600/70'
                          : pastStatus.profille === 'lost'
                          ? 'bg-rose-600/70'
                          : 'bg-slate-800'
                      }`}
                    />
                  </div>
                </div>
              );
            }

            // Case 3: Playable date (Today or Yesterday!)
            const status = getChallengeStatusForDate(item.dateStr);
            const isSelected = item.dateStr === currentDate;
            const isToday = item.dateStr === todayStr;
            const isYesterday = item.dateStr === yesterdayStr;
            const wonAll =
              status.screenle === 'won' &&
              status.indledle === 'won' &&
              status.linkle === 'won' &&
              status.profille === 'won';
            const hasUnplayed =
              status.screenle === 'unplayed' ||
              status.indledle === 'unplayed' ||
              status.linkle === 'unplayed' ||
              status.profille === 'unplayed';

            return (
              <button
                key={item.dateStr}
                onClick={() => {
                  soundFx.playClick();
                  onSelectDate(item.dateStr);
                  onClose();
                }}
                className={`h-14 p-1 rounded-xl border flex flex-col items-center justify-between text-xs transition relative cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/20 text-white font-black ring-2 ring-amber-500 shadow-md shadow-amber-500/20'
                    : isToday
                    ? 'border-amber-500/60 bg-[#131a29] text-amber-300 font-bold hover:border-amber-400'
                    : isYesterday && hasUnplayed
                    ? 'border-amber-400/50 bg-[#182030] text-amber-200 font-bold hover:border-amber-400 ring-1 ring-amber-500/30 animate-pulse'
                    : 'border-[#1e293b] bg-[#131a29]/80 text-slate-200 hover:border-amber-500/40 hover:bg-[#1e293b]/60'
                }`}
              >
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold">{item.dayNum}</span>
                  {wonAll ? (
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ) : isYesterday && hasUnplayed ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black" title="Rattrapage série">
                      J-1
                    </span>
                  ) : isToday ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black">
                      {currentLang === 'fr' ? 'Auj.' : 'Now'}
                    </span>
                  ) : null}
                </div>

                {/* Status dots for 4 daily games */}
                <div className="flex items-center gap-1">
                  <span
                    title="Screenle"
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.screenle === 'won'
                        ? 'bg-emerald-400'
                        : status.screenle === 'lost'
                        ? 'bg-rose-500'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span
                    title="Indledle"
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.indledle === 'won'
                        ? 'bg-emerald-400'
                        : status.indledle === 'lost'
                        ? 'bg-rose-500'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span
                    title="Linkle"
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.linkle === 'won'
                        ? 'bg-emerald-400'
                        : status.linkle === 'lost'
                        ? 'bg-rose-500'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span
                    title="Profille"
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.profille === 'won'
                        ? 'bg-emerald-400'
                        : status.profille === 'lost'
                        ? 'bg-rose-500'
                        : 'bg-slate-700'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend and Action Shortcuts */}
        <div className="mt-4 pt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {currentLang === 'fr' ? 'Gagné' : 'Won'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {currentLang === 'fr' ? 'Échoué' : 'Lost'}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Lock className="w-2.5 h-2.5" />
              {currentLang === 'fr' ? 'Verrouillé (passé > 1j ou futur)' : 'Locked'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onSelectDate(yesterdayStr);
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition cursor-pointer"
              title="Jouer le défi d'hier"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{currentLang === 'fr' ? 'Veille (J-1)' : 'Yesterday'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onSelectDate(todayStr);
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition cursor-pointer shadow-sm shadow-amber-500/20"
              title="Revenir au jour courant"
            >
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>{t('common.today')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
