import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Sparkles, Droplet } from 'lucide-react';
import { parseDate, diffDays, formatFrenchDate } from '../utils/cycleCalculations';

interface LiveCountdownProps {
  targetDateStr: string; // YYYY-MM-DD
  ovulationDateStr: string; // YYYY-MM-DD
  isLate: boolean;
  daysLate: number;
}

interface TimeRemaining {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalSeconds: number;
}

export const LiveCountdown: React.FC<LiveCountdownProps> = ({
  targetDateStr,
  ovulationDateStr,
  isLate,
  daysLate,
}) => {
  const [countdownMode, setCountdownMode] = useState<'period' | 'ovulation'>('period');

  const selectedTargetDate = countdownMode === 'period' ? targetDateStr : ovulationDateStr;

  const calculateTime = (): TimeRemaining => {
    if (!selectedTargetDate) {
      return { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, totalSeconds: 0 };
    }

    const target = parseDate(selectedTargetDate);
    // Set target time to 08:00 morning
    target.setHours(8, 0, 0, 0);

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);

    const weeks = Math.floor(absDiffSec / (7 * 24 * 3600));
    const remDaysSec = absDiffSec % (7 * 24 * 3600);
    const days = Math.floor(remDaysSec / (24 * 3600));
    const remHoursSec = remDaysSec % (24 * 3600);
    const hours = Math.floor(remHoursSec / 3600);
    const remMinSec = remHoursSec % 3600;
    const minutes = Math.floor(remMinSec / 60);
    const seconds = remMinSec % 60;

    return {
      weeks,
      days,
      hours,
      minutes,
      seconds,
      isPast,
      totalSeconds: absDiffSec,
    };
  };

  const [time, setTime] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    setTime(calculateTime());
    const interval = setInterval(() => {
      setTime(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTargetDate]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
      {/* Switcher & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              Décompte précis en temps réel
            </h3>
            <p className="text-[11px] text-stone-500">
              Mise à jour en continu à la seconde près
            </p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setCountdownMode('period')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              countdownMode === 'period'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
            <span>Prochaines règles</span>
          </button>
          <button
            onClick={() => setCountdownMode('ovulation')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              countdownMode === 'ovulation'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ovulation</span>
          </button>
        </div>
      </div>

      {/* Countdown Grid (Semaines, Jours, Heures, Minutes, Secondes) */}
      <div className="space-y-3">
        {time.isPast && countdownMode === 'period' ? (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Retard en cours :</strong> vos règles étaient prévues le {formatFrenchDate(targetDateStr)}. Le compteur ci-dessous mesure la durée exacte du retard.
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center">
          {/* Semaines */}
          <div className="bg-stone-50/80 p-2 sm:p-3 rounded-xl border border-stone-100">
            <div className="text-xl sm:text-3xl font-black text-stone-900 tabular-nums">
              {String(time.weeks).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 mt-1">
              Semaines
            </div>
          </div>

          {/* Jours */}
          <div className="bg-stone-50/80 p-2 sm:p-3 rounded-xl border border-stone-100">
            <div className="text-xl sm:text-3xl font-black text-stone-900 tabular-nums">
              {String(time.days).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 mt-1">
              Jours
            </div>
          </div>

          {/* Heures */}
          <div className="bg-stone-50/80 p-2 sm:p-3 rounded-xl border border-stone-100">
            <div className="text-xl sm:text-3xl font-black text-stone-900 tabular-nums">
              {String(time.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 mt-1">
              Heures
            </div>
          </div>

          {/* Minutes */}
          <div className="bg-stone-50/80 p-2 sm:p-3 rounded-xl border border-stone-100">
            <div className="text-xl sm:text-3xl font-black text-rose-600 tabular-nums">
              {String(time.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 mt-1">
              Minutes
            </div>
          </div>

          {/* Secondes */}
          <div className="bg-stone-50/80 p-2 sm:p-3 rounded-xl border border-stone-100">
            <div className="text-xl sm:text-3xl font-black text-rose-600 tabular-nums animate-pulse">
              {String(time.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 mt-1">
              Secondes
            </div>
          </div>
        </div>

        {/* Explanatory summary text */}
        <div className="text-center pt-1 text-xs text-stone-500">
          {time.isPast ? (
            <span>
              Temps écoulé depuis la date estimée :{' '}
              <strong className="text-stone-800">
                {time.weeks > 0 ? `${time.weeks} sem ` : ''}
                {time.days} j {time.hours} h {time.minutes} m {time.seconds} s
              </strong>
            </span>
          ) : (
            <span>
              Échéance estimée le{' '}
              <strong className="text-stone-800">
                {formatFrenchDate(selectedTargetDate)} vers 08:00
              </strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
