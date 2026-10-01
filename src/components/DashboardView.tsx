import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Activity, 
  Droplet, 
  Clock, 
  HeartPulse, 
  AlertCircle,
  Moon as MoonIcon,
  CalendarCog
} from 'lucide-react';
import { motion } from 'motion/react';
import { CalculatedCycleStatus, DailyLog } from '../types';
import { formatFrenchDate, formatFrenchFullDate, formatDate, diffDays } from '../utils/cycleCalculations';
import { staggerContainer, fadeUpItem, popIn } from '../utils/animation';
import { LiveCountdown } from './LiveCountdown';

interface DashboardViewProps {
  userName?: string;
  status: CalculatedCycleStatus;
  todayLog: DailyLog | null;
  onOpenQuickLog: () => void;
  onOpenAddCycle: () => void;
  onNavigateToTab: (tab: 'calendar' | 'calculator' | 'advice' | 'history' | 'privacy') => void;
  onStartPeriodToday: () => void;
  onOpenUpdateLastPeriod: () => void;
  onOpenInstallModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  status,
  todayLog,
  onOpenQuickLog,
  onOpenAddCycle,
  onNavigateToTab,
  onStartPeriodToday,
  onOpenUpdateLastPeriod,
  onOpenInstallModal,
}) => {
  const todayStr = formatDate(new Date());

  // Visual phase theme color helper
  const getPhaseStyles = (phase: string) => {
    switch (phase) {
      case 'menstruation':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-900',
          subtext: 'text-rose-700',
          accent: 'text-rose-600',
          ring: 'stroke-rose-500',
        };
      case 'fertile':
      case 'ovulation':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-950',
          subtext: 'text-indigo-700',
          accent: 'text-indigo-600',
          ring: 'stroke-indigo-500',
        };
      case 'late':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-950',
          subtext: 'text-amber-700',
          accent: 'text-amber-600',
          ring: 'stroke-amber-500',
        };
      default:
        return {
          bg: 'bg-stone-50',
          border: 'border-stone-200',
          text: 'text-stone-900',
          subtext: 'text-stone-600',
          accent: 'text-rose-600',
          ring: 'stroke-rose-400',
        };
    }
  };

  const currentStyles = getPhaseStyles(status.currentPhase);

  // SVG circular wheel calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (status.progressPercent / 100) * circumference;

  // Ovulation countdown calculation
  const daysToOvulation = status.ovulationDate ? diffDays(todayStr, status.ovulationDate) : 0;

  // Icône de phase : petite lune qui grandit avec le cycle (folliculaire → pleine à l'ovulation)
  const phaseIcon = (() => {
    const p = status.progressPercent;
    if (status.currentPhase === 'menstruation') return <Droplet className="w-4 h-4" />;
    if (status.currentPhase === 'ovulation') return <MoonIcon className="w-4 h-4 fill-current" />;
    if (status.currentPhase === 'fertile') return <Sparkles className="w-4 h-4" />;
    if (p < 50) return <MoonIcon className="w-3 h-3" />;
    return <MoonIcon className="w-4 h-4" />;
  })();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Top Welcome & Creator Lockup */}
      <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-rose-600 uppercase">
              Aujourd'hui
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-[11px] font-medium text-stone-500">
              Créé par <strong className="text-stone-700 font-semibold">SAMUEL · SAMVICdev</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 capitalize mt-0.5">
            {userName ? `Bonjour ${userName}` : formatFrenchFullDate(todayStr)}
          </h1>
          {userName && (
            <p className="text-xs text-stone-500 capitalize mt-0.5">{formatFrenchFullDate(todayStr)}</p>
          )}
        </div>

        <motion.button
          onClick={onStartPeriodToday}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-sm shadow-rose-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Droplet className="w-4 h-4" />
          <span>Mes règles débutent aujourd'hui</span>
        </motion.button>
      </motion.div>

      {/* Retard Alert Banner with Direct Link to Advice */}
      {status.isLate && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">
                Retard de règles : {status.daysLate} jour{status.daysLate > 1 ? 's' : ''} au compteur
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                Stress, fatigue ou test de grossesse : découvrez les recommandations bienveillantes.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('advice')}
            className="px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-semibold text-xs rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Lire les conseils & solutions →
          </button>
        </div>
      )}

      {/* Correction de la date des dernières règles */}
      <motion.div variants={fadeUpItem} className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <CalendarCog className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Date des dernières règles
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Trompée de date, ou envie de la corriger ? Tout se recalcule automatiquement.
            </p>
          </div>
        </div>
        <motion.button
          onClick={onOpenUpdateLastPeriod}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <CalendarCog className="w-3.5 h-3.5" />
          <span>Modifier</span>
        </motion.button>
      </motion.div>

      {/* Mobile-First 4-Key Live Counters */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Counter 1: Jour du cycle */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block uppercase tracking-wider">
            Jour du cycle
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
              J{status.currentCycleDay}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              /{status.expectedCycleLength}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 block truncate mt-0.5">
            {status.phaseLabel}
          </span>
        </div>

        {/* Counter 2: Compte à rebours règles */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block uppercase tracking-wider">
            Prochaines règles
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            {status.isLate ? (
              <span className="text-xl sm:text-2xl font-black text-amber-600 tabular-nums">
                +{status.daysLate}j retard
              </span>
            ) : status.daysUntilNextPeriod === 0 ? (
              <span className="text-xl sm:text-2xl font-black text-rose-600">
                Aujourd'hui
              </span>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
                  {status.daysUntilNextPeriod}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  jour{status.daysUntilNextPeriod > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-stone-500 block truncate mt-0.5">
            Le {formatFrenchDate(status.nextPeriodDate, false)}
          </span>
        </div>

        {/* Counter 3: Compte à rebours ovulation */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block uppercase tracking-wider">
            Ovulation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            {daysToOvulation === 0 ? (
              <span className="text-xl sm:text-2xl font-black text-amber-600">
                Aujourd'hui !
              </span>
            ) : daysToOvulation > 0 ? (
              <>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 tabular-nums">
                  {daysToOvulation}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  jour{daysToOvulation > 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-stone-600">
                Passée
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 block truncate mt-0.5">
            Le {formatFrenchDate(status.ovulationDate, false)}
          </span>
        </div>

        {/* Counter 4: Fertilité */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block uppercase tracking-wider">
            Fertilité
          </span>
          <div className="text-lg sm:text-2xl font-black text-stone-900 capitalize mt-1 truncate">
            {status.fertilityLevel}
          </div>
          <span className="text-[10px] text-stone-500 block truncate mt-0.5">
            Chances de conception
          </span>
        </div>
      </motion.div>

      {/* LIVE COUNTDOWN TICKER: Semaines, Jours, Heures, Minutes, Secondes */}
      <motion.div variants={fadeUpItem}>
        <LiveCountdown
          targetDateStr={status.nextPeriodDate}
          ovulationDateStr={status.ovulationDate}
          isLate={status.isLate}
          daysLate={status.daysLate}
        />
      </motion.div>

      {/* Main Cycle Wheel & Status Hero Grid */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Visual Circular Cycle Gauge */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                Phase en cours
              </span>
              <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                {status.phaseLabel}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500">Cycle moyen</span>
              <div className="text-sm font-bold text-stone-800 tabular-nums">
                {status.expectedCycleLength} jours
              </div>
            </div>
          </div>

          {/* Center Graphic: Cycle Wheel */}
          <div className="relative py-4 flex flex-col items-center justify-center">
            <svg className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90" viewBox="0 0 200 200">
              {/* Background track circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-stone-100"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress active circle — se dessine à l'entrée (effet « remplissage ») */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                className={currentStyles.ring}
                strokeWidth="12"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Cycle Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                Jour du cycle
              </span>
              <div className="text-4xl sm:text-5xl font-black text-stone-900 tabular-nums my-0.5">
                {status.currentCycleDay}
              </div>
              <span className="text-xs text-stone-500">
                sur {status.expectedCycleLength} jours
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 20 }}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md"
              >
                {phaseIcon}
                <span>{status.progressPercent}% du cycle</span>
              </motion.div>
            </div>
          </div>

          {/* Bottom phase text summary */}
          <div className={`p-3.5 sm:p-4 rounded-xl border ${currentStyles.bg} ${currentStyles.border} mt-2`}>
            <p className={`text-xs sm:text-sm ${currentStyles.text} leading-relaxed`}>
              {status.phaseDescription}
            </p>
          </div>
        </div>

        {/* Right Column: Key Predictive Milestones */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {/* Card: Prochaines règles */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                Calendrier des règles
              </span>
              <Droplet className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-stone-900">
              {formatFrenchDate(status.nextPeriodDate)}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Durée prévue des saignements : {status.expectedPeriodDuration} jours.
            </p>
          </div>

          {/* Card: Fertilité & Ovulation */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                Fertilité & Ovulation
              </span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xs text-stone-600 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Jour d’ovulation estimé :</span>
                <span className="font-semibold text-stone-900">{formatFrenchDate(status.ovulationDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Fenêtre la plus fertile :</span>
                <span className="font-semibold text-indigo-900">
                  {formatFrenchDate(status.fertileWindowStart, false)} au {formatFrenchDate(status.fertileWindowEnd, false)}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Test de grossesse conseillé */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                Test de grossesse
              </span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Date conseillée pour un test urinaire fiable : dès le{' '}
              <span className="font-bold text-stone-900">{formatFrenchDate(status.pregnancyTestDate)}</span>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Row 2: Today's Daily Log quick inspection + Action */}
      <motion.div variants={fadeUpItem} className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Journal du jour · Ressentis & bien-être
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Notez vos symptômes, flux et humeur pour mieux comprendre vos cycles
            </p>
          </div>
          <button
            onClick={onOpenQuickLog}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{todayLog ? 'Modifier ma journée' : 'Ajouter mes symptômes'}</span>
          </button>
        </div>

        {/* Today's logged details summary */}
        {todayLog ? (
          <div className="pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-medium block mb-1">Flux menstruel</span>
              <span className="font-semibold text-stone-800 capitalize">
                {todayLog.flow === 'none' ? 'Aucun' : todayLog.flow}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-medium block mb-1">Glaire cervicale</span>
              <span className="font-semibold text-stone-800 capitalize">
                {todayLog.cervicalMucus ? todayLog.cervicalMucus.replace('_', ' ') : 'Non notée'}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-medium block mb-1">Température</span>
              <span className="font-semibold text-stone-800">
                {todayLog.temperature ? `${todayLog.temperature} °C` : 'Non mesurée'}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-medium block mb-1">Symptômes</span>
              <span className="font-semibold text-stone-800">
                {todayLog.symptoms && todayLog.symptoms.length > 0
                  ? `${todayLog.symptoms.length} noté(s)`
                  : 'Aucun'}
              </span>
            </div>

            {todayLog.notes && (
              <div className="col-span-2 lg:col-span-4 bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-stone-700 italic">
                « {todayLog.notes} »
              </div>
            )}
          </div>
        ) : (
          <div className="pt-4 text-center py-4">
            <p className="text-xs text-stone-500 mb-2.5">
              Rien n'a encore été consigné pour aujourd'hui.
            </p>
            <button
              onClick={onOpenQuickLog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compléter mon journal du jour</span>
            </button>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
};
