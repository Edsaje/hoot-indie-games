import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight, X, Sparkles, Flame } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CalendarArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
}

type DayStatus = 'won' | 'lost' | 'unplayed';

interface DateChallengeStatus {
  screenle: DayStatus;
  indledle: DayStatus;
  linkle: DayStatus;
}

const getChallengeStatusForDate = (dateStr: string): DateChallengeStatus => {
  const getStatus = (key: string): DayStatus => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return 'unplayed';
      const parsed = JSON.parse(saved);
      if (parsed.isWon) return 'won';
      if (parsed.isCompleted) return 'lost';
      return 'unplayed';
    } catch {
      return 'unplayed';
    }
  };

  return {
    screenle: getStatus(`screenle_state_${dateStr}`),
    indledle: getStatus(`indledle_state_${dateStr}`),
    linkle: getStatus(`linkle_state_${dateStr}`),
  };
};

export const CalendarArchiveModal: React.FC<CalendarArchiveModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  // State for browsing months
  const [viewYear, setViewYear] = useState(() => parseInt(currentDate.split('-')[0], 10));
  const [viewMonth, setViewMonth] = useState(() => parseInt(currentDate.split('-')[1], 10) - 1); // 0-indexed

  if (!isOpen) return null;

  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const prevMonth = () => {
    soundFx.playClick();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
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
  // Adjust so Monday is 0, Sunday is 6
  const startDay = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Padding days for start
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
                {currentLang === 'fr' ? 'Archives Quotidiennes' : 'Daily Archives'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'fr'
                  ? 'Rejouez les défis des jours précédents à tout moment.'
                  : 'Replay past daily puzzles whenever you wish.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-white hover:border-amber-500/40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-white text-sm tracking-wide">
            {monthNames[currentLang][viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-white hover:border-amber-500/40 transition"
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

            const status = getChallengeStatusForDate(item.dateStr);
            const isSelected = item.dateStr === currentDate;
            const isToday = item.dateStr === todayStr;
            const wonAll = status.screenle === 'won' && status.indledle === 'won' && status.linkle === 'won';

            return (
              <button
                key={item.dateStr}
                onClick={() => {
                  soundFx.playClick();
                  onSelectDate(item.dateStr);
                  onClose();
                }}
                className={`h-14 p-1 rounded-xl border flex flex-col items-center justify-between text-xs transition relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/20 text-white font-black ring-1 ring-amber-500'
                    : isToday
                    ? 'border-amber-500/50 bg-[#131a29] text-amber-300 font-bold'
                    : 'border-[#1e293b] bg-[#131a29]/60 text-slate-300 hover:border-slate-600 hover:bg-[#1e293b]/50'
                }`}
              >
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[11px]">{item.dayNum}</span>
                  {wonAll && <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>

                {/* Status dots for 3 daily games */}
                <div className="flex items-center gap-1">
                  {/* Screenle dot */}
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
                  {/* Indledle dot */}
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
                  {/* Linkle dot */}
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
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {currentLang === 'fr' ? 'Gagné' : 'Won'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {currentLang === 'fr' ? 'Échoué' : 'Lost'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              {currentLang === 'fr' ? 'Non joué' : 'Unplayed'}
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onSelectDate(todayStr);
              onClose();
            }}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('common.today')}
          </button>
        </div>
      </div>
    </div>
  );
};
