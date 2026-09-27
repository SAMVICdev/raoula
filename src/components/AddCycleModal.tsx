import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { Cycle } from '../types';
import { formatDate, addDaysToDate, diffDays } from '../utils/cycleCalculations';

interface AddCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCycle: (cycle: Cycle) => Promise<void>;
  defaultPeriodDays: number;
}

export const AddCycleModal: React.FC<AddCycleModalProps> = ({
  isOpen,
  onClose,
  onSaveCycle,
  defaultPeriodDays = 5,
}) => {
  const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
  const [periodDays, setPeriodDays] = useState<number>(defaultPeriodDays);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    setIsSubmitting(true);
    try {
      const endDate = addDaysToDate(startDate, periodDays - 1);
      const newCycle: Cycle = {
        id: 'cycle-' + Date.now(),
        startDate,
        endDate,
        periodDays,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      await onSaveCycle(newCycle);
      onClose();
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
              Enregistrer un cycle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block font-medium text-stone-700 mb-1 text-xs">
              Premier jour des règles (début du cycle)
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
            />
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

          <div>
            <label className="block font-medium text-stone-700 mb-1 text-xs">
              Notes (optionnel)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex : Début en douceur, cycle régulier..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-rose-500 resize-none bg-white"
            />
          </div>

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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
