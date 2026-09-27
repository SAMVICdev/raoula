import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Droplet, 
  Sparkles, 
  Star, 
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Cycle, DailyLog, UserSettings } from '../types';
import { 
  formatDate, 
  parseDate, 
  formatFrenchDate, 
  getDayClassification,
  diffDays
} from '../utils/cycleCalculations';

interface CalendarViewProps {
  cycles: Cycle[];
  dailyLogs: DailyLog[];
  settings: UserSettings;
  onSelectDateToLog: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  cycles,
  dailyLogs,
  settings,
  onSelectDateToLog,
}) => {
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDate(today));

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(formatDate(today));
  };

  // Build Calendar Matrix (Weeks Monday to Sunday)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // In French calendar, Monday is 0, Sunday is 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday is 6

  const totalDaysInMonth = lastDayOfMonth.getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: {
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const d = new Date(year, month - 1, dayNum);
    calendarDays.push({
      dateStr: formatDate(d),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: formatDate(d) === formatDate(today),
    });
  }

  // Days in current month
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum);
    const dateStr = formatDate(d);
    calendarDays.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === formatDate(today),
    });
  }

  // Leading days from next month to complete row of 7
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const d = new Date(year, month + 1, dayNum);
    calendarDays.push({
      dateStr: formatDate(d),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: formatDate(d) === formatDate(today),
    });
  }

  // Selected date info
  const selectedClassification = getDayClassification(selectedDateStr, cycles, settings);
  const selectedDayLog = dailyLogs.find((l) => l.date === selectedDateStr);

  const monthName = currentMonthDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const weekHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-6">
      {/* Calendar Header with Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-stone-900 capitalize">
              {monthName}
            </h2>
            <button
              onClick={handleTodayMonth}
              className="px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            >
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pb-4 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Règles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-200 border border-dashed border-rose-400 inline-block" />
            <span>Règles prévues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-200 inline-block" />
            <span>Fenêtre fertile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span>Ovulation estimée</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700 inline-block" />
            <span>Symptômes notés</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day of Week Headers */}
          {weekHeaders.map((dayName) => (
            <div
              key={dayName}
              className="text-center text-xs font-semibold text-stone-400 py-1"
            >
              {dayName}
            </div>
          ))}

          {/* Day Cells */}
          {calendarDays.map((cell) => {
            const classification = getDayClassification(cell.dateStr, cycles, settings);
            const hasLog = dailyLogs.some((l) => l.date === cell.dateStr);
            const isSelected = cell.dateStr === selectedDateStr;

            // Compute background and styling based on state
            let cellBg = 'bg-transparent text-stone-800 hover:bg-stone-100/70';
            let indicator = null;

            if (classification.isPeriod) {
              cellBg = 'bg-rose-500 text-white font-semibold hover:bg-rose-600';
            } else if (classification.isPredictedPeriod) {
              cellBg = 'bg-rose-100 text-rose-900 border border-dashed border-rose-300 hover:bg-rose-200';
            } else if (classification.isOvulation) {
              cellBg = 'bg-amber-100 text-amber-950 font-semibold ring-2 ring-amber-400 hover:bg-amber-200';
              indicator = <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />;
            } else if (classification.isFertile) {
              cellBg = 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100';
            }

            if (!cell.isCurrentMonth) {
              cellBg += ' opacity-35';
            }

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative h-14 sm:h-20 rounded-xl p-1 sm:p-2 text-left flex flex-col justify-between transition-all cursor-pointer ${cellBg} ${
                  isSelected ? 'ring-2 ring-stone-900 shadow-sm' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs sm:text-sm font-semibold tabular-nums ${cell.isToday ? 'underline underline-offset-4 decoration-2 decoration-rose-600' : ''}`}>
                    {cell.dayNumber}
                  </span>
                  {indicator}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  {/* Phase Mini Label on larger screens */}
                  <span className="hidden sm:inline-block text-[10px] truncate max-w-[50px] opacity-80">
                    {classification.isPeriod ? 'Règles' : classification.isOvulation ? 'Ovul.' : classification.isFertile ? 'Fertile' : ''}
                  </span>

                  {/* Dot for logged symptoms */}
                  {hasLog && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 ml-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Panel */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Détails de la date sélectionnée
            </span>
            <h3 className="text-lg font-bold text-stone-900 capitalize">
              {formatFrenchDate(selectedDateStr)}
            </h3>
          </div>
          <button
            onClick={() => onSelectDateToLog(selectedDateStr)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{selectedDayLog ? 'Modifier le journal' : 'Noter pour ce jour'}</span>
          </button>
        </div>

        {/* Phase analysis for selected day */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-medium block mb-1">Classification du cycle</span>
            <div className="font-semibold text-stone-800 text-sm">
              {selectedClassification.isPeriod ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <Droplet className="w-4 h-4" /> Règles enregistrées
                </span>
              ) : selectedClassification.isPredictedPeriod ? (
                <span className="text-rose-500">Règles prévues</span>
              ) : selectedClassification.isOvulation ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" /> Pic d’ovulation
                </span>
              ) : selectedClassification.isFertile ? (
                <span className="text-indigo-600 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Fenêtre de fertilité
                </span>
              ) : (
                <span>Phase lutéale ou folliculaire</span>
              )}
            </div>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-medium block mb-1">Chances de conception</span>
            <div className="font-semibold text-stone-800 text-sm capitalize">
              {selectedClassification.isOvulation
                ? 'Maximale (Jour idéal)'
                : selectedClassification.isFertile
                ? 'Élevée'
                : 'Très basse'}
            </div>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-medium block mb-1">Journal personnel</span>
            <div className="font-semibold text-stone-800 text-sm">
              {selectedDayLog ? (
                <span className="text-emerald-700">Entrée présente</span>
              ) : (
                <span className="text-stone-400">Aucune note</span>
              )}
            </div>
          </div>
        </div>

        {/* If day has notes or symptoms, render them */}
        {selectedDayLog && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50/40 border border-rose-100 text-xs space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {selectedDayLog.flow && selectedDayLog.flow !== 'none' && (
                <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                  Flux : {selectedDayLog.flow}
                </span>
              )}
              {selectedDayLog.temperature && (
                <span className="px-2.5 py-1 rounded-md bg-white border border-stone-200 text-stone-800 font-medium">
                  Température : {selectedDayLog.temperature} °C
                </span>
              )}
              {selectedDayLog.cervicalMucus && (
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 font-medium">
                  Glaire : {selectedDayLog.cervicalMucus}
                </span>
              )}
            </div>

            {selectedDayLog.symptoms && selectedDayLog.symptoms.length > 0 && (
              <p className="text-stone-700">
                <strong className="text-stone-900">Symptômes :</strong>{' '}
                {selectedDayLog.symptoms.join(', ')}
              </p>
            )}

            {selectedDayLog.notes && (
              <p className="text-stone-600 italic">
                « {selectedDayLog.notes} »
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
