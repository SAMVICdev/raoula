import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Droplet, 
  Calendar, 
  Save, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Cycle, UserSettings } from '../types';
import { 
  formatDate, 
  predictFutureCycles, 
  formatFrenchDate, 
  addDaysToDate 
} from '../utils/cycleCalculations';

interface CalculatorViewProps {
  settings: UserSettings;
  onSaveCalculatedCycle: (cycle: Cycle) => Promise<void>;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  settings,
  onSaveCalculatedCycle,
}) => {
  const todayStr = formatDate(new Date());

  // Input states
  const [calcStartDate, setCalcStartDate] = useState<string>(todayStr);
  const [calcCycleLength, setCalcCycleLength] = useState<number>(settings.defaultCycleLength || 28);
  const [calcPeriodDays, setCalcPeriodDays] = useState<number>(settings.defaultPeriodDuration || 5);
  const [calcLutealPhase, setCalcLutealPhase] = useState<number>(settings.lutealPhaseLength || 14);

  const [hasSaved, setHasSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Compute calculated metrics
  const ovulationOffset = Math.max(7, calcCycleLength - calcLutealPhase);
  const calculatedOvulationDate = addDaysToDate(calcStartDate, ovulationOffset);
  const calculatedFertileStart = addDaysToDate(calculatedOvulationDate, -5);
  const calculatedFertileEnd = addDaysToDate(calculatedOvulationDate, 1);
  const calculatedNextPeriodDate = addDaysToDate(calcStartDate, calcCycleLength);
  const calculatedTestDate = addDaysToDate(calculatedNextPeriodDate, 1);

  // 6 months predictions table
  const futurePredictions = predictFutureCycles(
    calcStartDate,
    calcCycleLength,
    calcPeriodDays,
    calcLutealPhase,
    6
  );

  const handleSaveToIndexedDB = async () => {
    setIsSaving(true);
    try {
      const newCycle: Cycle = {
        id: 'cycle-' + Date.now(),
        startDate: calcStartDate,
        endDate: addDaysToDate(calcStartDate, calcPeriodDays - 1),
        periodDays: calcPeriodDays,
        cycleLength: calcCycleLength,
        notes: `Cycle simulé et enregistré via le calculateur (${calcCycleLength} jours)`,
        createdAt: new Date().toISOString(),
      };
      await onSaveCalculatedCycle(newCycle);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            Calculateur de Cycle & Fertilité
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Entrez la date de début de vos dernières règles et la durée moyenne de votre cycle pour calculer votre date d’ovulation, votre période la plus fertile et vos prochaines règles.
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider text-rose-700">
          Paramètres du calcul
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Start Date */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Premier jour des dernières règles
            </label>
            <input
              type="date"
              value={calcStartDate}
              onChange={(e) => {
                setCalcStartDate(e.target.value);
                setHasSaved(false);
              }}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
            />
          </div>

          {/* Cycle length */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Durée habituelle du cycle
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={20}
                max={45}
                value={calcCycleLength}
                onChange={(e) => {
                  setCalcCycleLength(parseInt(e.target.value, 10) || 28);
                  setHasSaved(false);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
              <span className="text-stone-500">jours</span>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">Norme : 26 à 32 jours</span>
          </div>

          {/* Period length */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Durée moyenne des règles
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={2}
                max={10}
                value={calcPeriodDays}
                onChange={(e) => {
                  setCalcPeriodDays(parseInt(e.target.value, 10) || 5);
                  setHasSaved(false);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
              <span className="text-stone-500">jours</span>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">Généralement 4 à 6 jours</span>
          </div>

          {/* Luteal Phase */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Phase lutéale (post-ovulation)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={16}
                value={calcLutealPhase}
                onChange={(e) => {
                  setCalcLutealPhase(parseInt(e.target.value, 10) || 14);
                  setHasSaved(false);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
              <span className="text-stone-500">jours</span>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">Standard médical : 14 jours</span>
          </div>
        </div>

        {/* Action: Enregistrer dans le carnet */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            Vous pouvez ajouter ce cycle directement dans votre carnet privé.
          </div>
          <button
            onClick={handleSaveToIndexedDB}
            disabled={isSaving || hasSaved}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-emerald-600 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
          >
            {hasSaved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Cycle enregistré dans votre carnet !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer ce cycle dans mon carnet'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Ovulation */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 mb-2 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Date d’ovulation</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900">
            {formatFrenchDate(calculatedOvulationDate)}
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Jour où l’ovule est expulsé de l’ovaire. C'est le pic biologique absolu de fertilité du cycle.
          </p>
        </div>

        {/* Card 2: Fertile Window */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 mb-2 font-semibold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Fenêtre de fertilité</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900">
            {formatFrenchDate(calculatedFertileStart, false)} - {formatFrenchDate(calculatedFertileEnd, false)}
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Comprend les 5 jours précédant l’ovulation (durée de vie des spermatozoïdes) et le jour suivant l’ovulation.
          </p>
        </div>

        {/* Card 3: Next Period */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 mb-2 font-semibold text-xs uppercase tracking-wider">
            <Droplet className="w-4 h-4" />
            <span>Prochaines règles</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900">
            {formatFrenchDate(calculatedNextPeriodDate)}
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Test de grossesse urinaire recommandé à partir du{' '}
            <span className="font-semibold text-stone-800">{formatFrenchDate(calculatedTestDate)}</span>.
          </p>
        </div>
      </div>

      {/* Multi-cycle forecast table (6 months) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Prévisions sur les 6 prochains cycles
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Estimation calendrier basée sur un cycle régulier de {calcCycleLength} jours
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Cycle</th>
                <th className="py-3 px-3">Début des règles</th>
                <th className="py-3 px-3">Fin des règles</th>
                <th className="py-3 px-3">Période fertile</th>
                <th className="py-3 px-3">Ovulation estimée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {futurePredictions.map((pred) => (
                <tr key={pred.cycleNumber} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-stone-800">
                    Cycle #{pred.cycleNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-rose-700">
                    {formatFrenchDate(pred.periodStartDate)}
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {formatFrenchDate(pred.periodEndDate)}
                  </td>
                  <td className="py-3 px-3 text-indigo-700 font-medium">
                    {formatFrenchDate(pred.fertileWindowStart, false)} au {formatFrenchDate(pred.fertileWindowEnd, false)}
                  </td>
                  <td className="py-3 px-3 text-stone-900 font-semibold">
                    {formatFrenchDate(pred.ovulationDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-2.5 text-xs text-stone-600">
          <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p>
            <strong>Note informative :</strong> Ces calculs reposent sur des moyennes physiologiques reconnues. Les cycles féminins naturels peuvent varier sous l'effet du stress, du sommeil, des voyages ou des variations hormonales. Pour la contraception ou la conception, combinez ces prévisions avec l'observation de votre glaire cervicale et de votre température.
          </p>
        </div>
      </div>
    </div>
  );
};
