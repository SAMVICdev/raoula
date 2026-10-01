import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, AlertTriangle } from 'lucide-react';
import { Cycle } from '../types';
import { formatDate, addDaysToDate, diffDays } from '../utils/cycleCalculations';

interface UpdateLastPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Cycle en cours (le plus récent) — sera mis à jour avec la nouvelle date */
  lastCycle: Cycle | null;
  defaultPeriodDays: number;
  onUpdateCycle: (cycle: Cycle) => Promise<void>;
}

/**
 * Ressaisie de la date des dernières règles : met à jour le cycle en cours
 * (ou en crée un nouveau si aucun n'existe). Simple : une date, une durée.
 */
export const UpdateLastPeriodModal: React.FC<UpdateLastPeriodModalProps> = ({
  isOpen,
  onClose,
  lastCycle,
  defaultPeriodDays,
  onUpdateCycle,
}) => {
  const [startDate, setStartDate] = useState<string>(
    lastCycle?.startDate || formatDate(new Date())
  );
  const [periodDays, setPeriodDays] = useState<number>(
    lastCycle?.periodDays || defaultPeriodDays
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialise à chaque ouverture pour refléter le cycle courant
  useEffect(() => {
    if (isOpen) {
      setStartDate(lastCycle?.startDate || formatDate(new Date()));
      setPeriodDays(lastCycle?.periodDays || defaultPeriodDays);
      setError(null);
    }
  }, [isOpen, lastCycle, defaultPeriodDays]);

  if (!isOpen) return null;

  const todayStr = formatDate(new Date());
  const daysDiff = startDate ? diffDays(startDate, todayStr) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    if (daysDiff < 0) {
      setError('La date ne peut pas être dans le futur.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const updatedCycle: Cycle = {
        // Met à jour le cycle existant si présent, sinon crée-en un
        id: lastCycle?.id || 'cycle-' + Date.now(),
        startDate,
        endDate: addDaysToDate(startDate, periodDays - 1),
        periodDays,
        notes: lastCycle?.notes,
        createdAt: lastCycle?.createdAt || new Date().toISOString(),
      };
      await onUpdateCycle(updatedCycle);
      onClose();
    } catch {
      setError("Impossible d'enregistrer pour le moment. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-stone-900">
              Date de tes dernières règles
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <p className="text-xs text-stone-600 leading-relaxed">
            Corrige la date si tu t'es trompée, ou saisis la vraie date du premier
            jour de tes dernières règles. Tout le reste (prévisions, fertilité,
            calendrier) se recalcule automatiquement.
          </p>

          <div>
            <label className="block font-medium text-stone-700 mb-1 text-xs">
              Premier jour des dernières règles
            </label>
            <input
              type="date"
              required
              max={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-base focus:outline-rose-500 bg-white"
            />
            {startDate && daysDiff >= 0 && (
              <span className="text-[11px] text-stone-400 mt-1 block">
                Il y a {daysDiff} jour{daysDiff !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1 text-xs">
              Durée des saignements (en jours)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={2}
                max={12}
                required
                value={periodDays}
                onChange={(e) => setPeriodDays(parseInt(e.target.value, 10) || 5)}
                className="w-24 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
              <span className="text-xs text-stone-500">
                Généralement entre 3 et 7 jours
              </span>
            </div>
          </div>

          {daysDiff > 45 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Cette date date de plus de 45 jours : les prévisions seront moins
                précises. Si tes règles ont recommencé entre-temps, utilise
                plutôt « Mes règles débutent aujourd'hui ».
              </span>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Mettre à jour'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
