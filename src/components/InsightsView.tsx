import React from 'react';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Calendar,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Cycle, CycleStatistics, DailyLog, UserSettings } from '../types';
import {
  formatDate,
  parseDate,
  formatFrenchDate,
  diffDays
} from '../utils/cycleCalculations';

interface InsightsViewProps {
  cycles: Cycle[];
  dailyLogs: DailyLog[];
  stats: CycleStatistics;
  settings: UserSettings;
}

/**
 * Analyses : graphique des durées de cycle + courbe de température basale
 * avec détection du décalage thermique (confirmation d'ovulation).
 */
export const InsightsView: React.FC<InsightsViewProps> = ({
  cycles,
  dailyLogs,
  stats,
  settings,
}) => {
  // ── Données cycles (chronologique) ──
  const sorted = [...cycles].sort(
    (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
  );

  const cycleLengths = sorted.map((c, idx) => {
    if (idx === 0) return { start: c.startDate, length: null as number | null, period: c.periodDays || 5 };
    const len = diffDays(sorted[idx - 1].startDate, c.startDate);
    return { start: c.startDate, length: len >= 15 && len <= 60 ? len : null, period: c.periodDays || 5 };
  });

  const avg = stats.averageCycleLength || settings.defaultCycleLength || 28;

  // ── Données température (60 derniers jours avec mesure) ──
  const tempLogs = dailyLogs
    .filter((l) => typeof l.temperature === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-60);

  const temps = tempLogs.map((l) => ({ date: l.date, temp: l.temperature as number }));

  // Détection du décalage thermique : une hausse ≥ 0,2 °C maintenue 3 jours
  // par rapport à la moyenne des 6 jours précédents = ovulation probable.
  const thermalShiftIndex = (() => {
    if (temps.length < 9) return -1;
    for (let i = 6; i <= temps.length - 3; i++) {
      const before = temps.slice(i - 6, i).map((t) => t.temp);
      const after = temps.slice(i, i + 3).map((t) => t.temp);
      const avgBefore = before.reduce((s, v) => s + v, 0) / before.length;
      const avgAfter = after.reduce((s, v) => s + v, 0) / after.length;
      if (avgAfter - avgBefore >= 0.2) return i;
    }
    return -1;
  })();
  const shiftDate = thermalShiftIndex >= 0 ? temps[thermalShiftIndex].date : null;

  // ── Irrégularités à signaler ──
  const warnings: string[] = [];
  if (stats.totalCycles >= 2) {
    if (stats.varianceDays > 9) {
      warnings.push(
        `Écart important entre tes cycles (${stats.shortestCycle} à ${stats.longestCycle} jours). Un bilan hormonal peut être utile si cela dure plusieurs mois.`
      );
    }
    if (stats.averageCycleLength < 21) {
      warnings.push('Cycles très courts (< 21 jours) : parles-en à un professionnel de santé.');
    }
    if (stats.averageCycleLength > 35) {
      warnings.push('Cycles longs (> 35 jours) : cela peut être normal pour toi, mais un avis médical aide à écarter un SOPK.');
    }
    const longPeriods = sorted.filter((c) => (c.periodDays || 5) > 8);
    if (longPeriods.length > 0) {
      warnings.push(
        `${longPeriods.length} cycle(s) avec des règles de plus de 8 jours. Un avis médical est recommandé.`
      );
    }
  }

  const irregularCount = cycleLengths.filter((c) => c.length !== null && Math.abs(c.length - avg) > 7).length;

  // ── Rendu SVG : graphique cycles ──
  const chartW = 640;
  const chartH = 180;
  const pad = 28;
  const minLen = 15;
  const maxLen = 50;
  const yFor = (len: number) => chartH - pad - ((len - minLen) / (maxLen - minLen)) * (chartH - 2 * pad);
  const xFor = (i: number) =>
    cycleLengths.length > 1 ? pad + (i / (cycleLengths.length - 1)) * (chartW - 2 * pad) : chartW / 2;

  const polylinePoints = cycleLengths
    .map((c, i) => (c.length !== null ? `${xFor(i)},${yFor(c.length)}` : null))
    .filter(Boolean)
    .join(' ');

  // ── Rendu SVG : courbe température ──
  const tW = 640;
  const tH = 200;
  const tPad = 28;
  const tempValues = temps.map((t) => t.temp);
  const tMin = Math.min(...tempValues) - 0.15;
  const tMax = Math.max(...tempValues) + 0.15;
  const tyFor = (t: number) => tH - tPad - ((t - tMin) / (tMax - tMin)) * (tH - 2 * tPad);
  const txFor = (i: number) => (temps.length > 1 ? tPad + (i / (temps.length - 1)) * (tW - 2 * tPad) : tW / 2);
  const tempLine = temps.map((t, i) => `${txFor(i)},${tyFor(t.temp)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Analyses & tendances</h2>
        </div>
        <p className="text-xs text-stone-500">
          Comprendre tes cycles sur la durée : régularité, température et signaux à connaître.
        </p>
      </div>

      {/* Alertes / signaux */}
      {warnings.length > 0 && (
        <div className="space-y-2.5">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{w} Ce n’est pas un diagnostic — seule une consultation médicale permet un avis fiable.</p>
            </div>
          ))}
        </div>
      )}

      {!warnings.length && stats.totalCycles >= 2 && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">Aucun signal inhabituel dans tes données. Continue ton suivi habituel.</p>
        </div>
      )}

      {/* Graphique des durées de cycle */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <LineChart className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-stone-900">Durée de tes cycles, mois par mois</h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          La ligne pointillée indique ta moyenne ({avg} jours). Les points hors de la zone claire sont les cycles les plus éloignés de cette moyenne.
        </p>

        {cycleLengths.length < 2 ? (
          <div className="text-center py-8 text-xs text-stone-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            Enregistre au moins 2 cycles pour voir la tendance apparaître.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full min-w-[480px]" role="img" aria-label="Courbe des durées de cycle">
              {/* Zone de régularité ±3 jours autour de la moyenne */}
              <rect
                x={pad}
                y={yFor(avg + 3)}
                width={chartW - 2 * pad}
                height={yFor(avg - 3) - yFor(avg + 3)}
                className="fill-rose-50"
              />
              {/* Ligne de moyenne */}
              <line
                x1={pad}
                x2={chartW - pad}
                y1={yFor(avg)}
                y2={yFor(avg)}
                className="stroke-rose-300"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x={pad + 2} y={yFor(avg) - 6} className="fill-rose-400" fontSize="10">
                Moyenne {avg} j
              </text>
              {/* Courbe */}
              {polylinePoints && (
                <polyline points={polylinePoints} className="stroke-rose-500" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
              )}
              {/* Points */}
              {cycleLengths.map((c, i) =>
                c.length !== null ? (
                  <g key={i}>
                    <circle cx={xFor(i)} cy={yFor(c.length)} r="4.5" className="fill-rose-600" />
                    <text x={xFor(i)} y={yFor(c.length) - 9} textAnchor="middle" fontSize="9" className="fill-stone-500">
                      {c.length}j
                    </text>
                  </g>
                ) : null
              )}
              {/* Dates sous l'axe */}
              {cycleLengths.map((c, i) =>
                i % 2 === 0 ? (
                  <text key={`x${i}`} x={xFor(i)} y={chartH - 8} textAnchor="middle" fontSize="9" className="fill-stone-400">
                    {formatFrenchDate(c.start, false)}
                  </text>
                ) : null
              )}
            </svg>
          </div>
        )}

        {stats.totalCycles >= 2 && (
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-stone-500 border-t border-stone-100 pt-3">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-stone-400" />
              {irregularCount === 0
                ? 'Tous tes cycles sont dans une fourchette régulière (±7 jours).'
                : `${irregularCount} cycle(s) s’écarte(nt) de plus de 7 jours de ta moyenne.`}
            </span>
          </div>
        )}
      </div>

      {/* Courbe de température */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Thermometer className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Courbe de température basale</h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          Mesurée au réveil avant tout effort. La courbe se remplit automatiquement quand tu notes ta température dans le journal.
        </p>

        {temps.length < 3 ? (
          <div className="text-center py-8 text-xs text-stone-400">
            <Thermometer className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p>
              Seulement {temps.length} mesure(s) enregistrée(s). Note ta température au réveil dans le
              journal (Options avancées) pendant quelques jours pour voir ta courbe.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${tW} ${tH}`} className="w-full min-w-[480px]" role="img" aria-label="Courbe de température basale">
                {/* Quadrillage */}
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                  <line
                    key={f}
                    x1={tPad}
                    x2={tW - tPad}
                    y1={tPad + f * (tH - 2 * tPad)}
                    y2={tPad + f * (tH - 2 * tPad)}
                    className="fill-none stroke-stone-100"
                    strokeWidth="1"
                  />
                ))}
                {/* Ligne de température */}
                <polyline points={tempLine} className="stroke-amber-500" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                {/* Points */}
                {temps.map((t, i) => (
                  <circle key={t.date} cx={txFor(i)} cy={tyFor(t.temp)} r="3.5" className="fill-amber-600" />
                ))}
                {/* Marqueur du décalage thermique */}
                {shiftDate && (
                  <g>
                    <line
                      x1={txFor(thermalShiftIndex)}
                      x2={txFor(thermalShiftIndex)}
                      y1={tPad}
                      y2={tH - tPad}
                      className="stroke-indigo-400"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                    <text x={txFor(thermalShiftIndex) + 5} y={tPad + 12} fontSize="10" className="fill-indigo-600 font-bold">
                      Décalage (ovulation confirmée)
                    </text>
                  </g>
                )}
                {/* Dates sous l'axe */}
                {temps.map((t, i) =>
                  i % Math.ceil(temps.length / 6) === 0 ? (
                    <text key={`tx${i}`} x={txFor(i)} y={tH - 8} textAnchor="middle" fontSize="9" className="fill-stone-400">
                      {formatFrenchDate(t.date, false)}
                    </text>
                  ) : null
                )}
              </svg>
            </div>

            {shiftDate ? (
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Une hausse durable de ta température a été détectée à partir du{' '}
                  <strong>{formatFrenchDate(shiftDate)}</strong> : c’est le signe que l’ovulation a probablement eu
                  lieu juste avant. La température reste haute jusqu’aux règles suivantes.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600">
                Pas encore de décalage thermique clair sur cette période. Continue tes mesures chaque matin au
                réveil — la hausse apparaît après l’ovulation.
              </div>
            )}
          </>
        )}
      </div>

      {/* Symptômes récurrents par fréquence */}
      <SymptomFrequencyCard dailyLogs={dailyLogs} />
    </div>
  );
};

/** Top des symptômes les plus fréquents, sur tout l'historique */
const SymptomFrequencyCard: React.FC<{ dailyLogs: DailyLog[] }> = ({ dailyLogs }) => {
  const counts = new Map<string, number>();
  for (const log of dailyLogs) {
    for (const s of log.symptoms || []) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = top[0]?.[1] || 1;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-rose-600" />
        <h3 className="text-sm font-bold text-stone-900">Tes symptômes les plus fréquents</h3>
      </div>

      {top.length === 0 ? (
        <p className="text-xs text-stone-400 py-4 text-center">
          Note tes ressentis dans le journal pour découvrir tes tendances ici.
        </p>
      ) : (
        <div className="space-y-2.5">
          {top.map(([symptom, count]) => (
            <div key={symptom} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-stone-700 capitalize">{symptom.replace('_', ' ')}</span>
                <span className="text-stone-400">{count} fois</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-stone-400 pt-1">
            Basé sur {dailyLogs.length} journée(s) notée(s). Ces tendances restent sur ton appareil.
          </p>
        </div>
      )}
    </div>
  );
};
