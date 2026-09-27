import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  BarChart2, 
  AlertCircle, 
  FileText, 
  Download, 
  Printer, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { Cycle, CycleStatistics, DailyLog } from '../types';
import { formatFrenchDate, diffDays } from '../utils/cycleCalculations';

interface HistoryViewProps {
  cycles: Cycle[];
  stats: CycleStatistics;
  dailyLogs: DailyLog[];
  onOpenAddCycle: () => void;
  onDeleteCycle: (id: string) => Promise<void>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  cycles,
  stats,
  dailyLogs,
  onOpenAddCycle,
  onDeleteCycle,
}) => {
  const [showMedicalSummary, setShowMedicalSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: string, date: string) => {
    if (window.confirm(`Supprimer le cycle ayant débuté le ${formatFrenchDate(date)} ?`)) {
      await onDeleteCycle(id);
    }
  };

  const filteredCycles = cycles.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const dateFormatted = formatFrenchDate(c.startDate).toLowerCase();
    const notesMatch = c.notes?.toLowerCase().includes(term);
    return dateFormatted.includes(term) || notesMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Historique & Suivi des Cycles
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Journal complet de vos cycles menstruels passés et statistiques
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowMedicalSummary(!showMedicalSummary)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-stone-600" />
            <span>{showMedicalSummary ? 'Masquer le bilan' : 'Bilan médical'}</span>
          </button>
          <button
            onClick={onOpenAddCycle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau cycle</span>
          </button>
        </div>
      </div>

      {/* Medical Summary Printable Card */}
      {showMedicalSummary && (
        <div className="bg-rose-50/70 p-5 sm:p-6 rounded-2xl border border-rose-200 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Fiche récapitulative de consultation
              </span>
              <h3 className="text-base font-bold text-stone-900">
                Synthèse pour votre médecin, sage-femme ou gynécologue
              </h3>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer la synthèse</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-rose-100">
              <span className="text-stone-400 block mb-0.5">Cycles répertoriés</span>
              <span className="text-lg font-bold text-stone-900">{stats.totalCycles} cycles</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-rose-100">
              <span className="text-stone-400 block mb-0.5">Durée moyenne cycle</span>
              <span className="text-lg font-bold text-rose-700">{stats.averageCycleLength} jours</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-rose-100">
              <span className="text-stone-400 block mb-0.5">Durée moyenne règles</span>
              <span className="text-lg font-bold text-stone-900">{stats.averagePeriodDuration} jours</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-rose-100">
              <span className="text-stone-400 block mb-0.5">Variation min - max</span>
              <span className="text-lg font-bold text-stone-900">
                {stats.shortestCycle}j à {stats.longestCycle}j
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 leading-relaxed italic">
            Ce document résume fidèlement les cycles enregistrés dans Raoula_js. Il peut aider votre praticien à évaluer la régularité ovulatoire, poser un diagnostic (ex. SOPK, dysménorrhée) ou adapter une contraception.
          </p>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-medium block mb-1">
            Cycles enregistrés
          </span>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.totalCycles}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Historique personnel
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-medium block mb-1">
            Durée moyenne du cycle
          </span>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            {stats.averageCycleLength} jours
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Intervalle moyen
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-medium block mb-1">
            Durée moyenne des règles
          </span>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.averagePeriodDuration} jours
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Période de saignement
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-medium block mb-1">
            Régularité globale
          </span>
          <div className="text-sm sm:text-base font-bold text-stone-900 mt-0.5 truncate">
            {stats.regularityDescription}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Écart max : {stats.varianceDays} jour{stats.varianceDays > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Cycle Length Visual Bars */}
      {cycles.length > 1 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-stone-500" />
            <h3 className="text-sm font-bold text-stone-900">
              Comparaison visuelle des durées de cycle
            </h3>
          </div>

          <div className="space-y-3">
            {cycles.map((c, idx) => {
              let len = c.cycleLength;
              if (!len && idx > 0) {
                len = diffDays(cycles[idx].startDate, cycles[idx - 1].startDate);
              }
              const displayLen = len || stats.averageCycleLength;
              const maxScale = Math.max(38, stats.longestCycle + 5);
              const barPercent = Math.min(100, Math.round((displayLen / maxScale) * 100));

              return (
                <div key={c.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1 text-stone-600">
                    <span className="font-semibold text-stone-800">
                      Début : {formatFrenchDate(c.startDate)}
                    </span>
                    <span className="font-bold tabular-nums text-stone-900">
                      {len ? `${len} jours` : 'Cycle en cours'}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden flex">
                    {/* Period portion */}
                    <div
                      style={{ width: `${Math.min(barPercent, ((c.periodDays || 5) / maxScale) * 100)}%` }}
                      className="bg-rose-500 h-full"
                      title={`Règles : ${c.periodDays || 5} jours`}
                    />
                    {/* Rest of cycle */}
                    <div
                      style={{
                        width: `${Math.max(
                          0,
                          barPercent - Math.min(barPercent, ((c.periodDays || 5) / maxScale) * 100)
                        )}%`,
                      }}
                      className="bg-rose-200 h-full"
                      title={`Cycle total : ${displayLen} jours`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Saignement (règles)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
              <span>Reste du cycle</span>
            </div>
          </div>
        </div>
      )}

      {/* Cycles Timeline List */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-stone-900">
            Historique chronologique
          </h3>
          {cycles.length > 3 && (
            <input
              type="text"
              placeholder="Rechercher par date ou mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs w-full sm:w-64 focus:outline-rose-500 bg-stone-50"
            />
          )}
        </div>

        {cycles.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p>Aucun cycle enregistré pour l'instant.</p>
            <button
              onClick={onOpenAddCycle}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            >
              Ajouter votre premier cycle
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredCycles.map((c, index) => {
              const isLatest = index === 0;

              // Find any symptoms recorded during this cycle
              const nextCycleStart = cycles[index - 1]?.startDate;
              const relatedLogs = dailyLogs.filter((l) => {
                if (nextCycleStart) {
                  return l.date >= c.startDate && l.date < nextCycleStart;
                }
                return l.date >= c.startDate;
              });

              const allSymptoms = Array.from(
                new Set(relatedLogs.flatMap((l) => l.symptoms || []))
              );

              return (
                <div
                  key={c.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm capitalize">
                          {formatFrenchDate(c.startDate)}
                        </span>
                        {isLatest && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            Cycle en cours
                          </span>
                        )}
                      </div>

                      <div className="text-stone-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>Règles : {c.periodDays || 5} jours</span>
                        <span>·</span>
                        {c.cycleLength ? (
                          <span className="font-semibold text-stone-800">
                            Durée totale : {c.cycleLength} jours
                          </span>
                        ) : (
                          <span>En cours</span>
                        )}
                        {c.endDate && (
                          <>
                            <span>·</span>
                            <span>Fin des saignements : {formatFrenchDate(c.endDate, false)}</span>
                          </>
                        )}
                      </div>

                      {/* Symptoms tags logged during cycle */}
                      {allSymptoms.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {allSymptoms.map((symp) => (
                            <span
                              key={symp}
                              className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px]"
                            >
                              {symp.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      {c.notes && (
                        <p className="text-stone-600 italic mt-2 bg-stone-50 px-2.5 py-1 rounded">
                          « {c.notes} »
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(c.id, c.startDate)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                    title="Supprimer ce cycle"
                    aria-label="Supprimer ce cycle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
