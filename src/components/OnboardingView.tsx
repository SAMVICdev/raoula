import React, { useState } from 'react';
import { HeartPulse, Check } from 'lucide-react';
import { Cycle, UserSettings } from '../types';
import { addDaysToDate, formatDate } from '../utils/cycleCalculations';

interface OnboardingViewProps {
  defaultSettings: UserSettings;
  onComplete: (payload: { settings: UserSettings; firstCycle: Cycle }) => Promise<void>;
}

/**
 * Premier lancement : aucune donnée d’exemple n’est inventée.
 * L’utilisatrice saisit son dernier début de règles pour caler les prévisions.
 */
export const OnboardingView: React.FC<OnboardingViewProps> = ({
  defaultSettings,
  onComplete,
}) => {
  const [userName, setUserName] = useState('');
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      // Valeurs par défaut saines : l’app affine toute seule avec les cycles réels.
      const cycleLength = defaultSettings.defaultCycleLength || 28;
      const periodDays = defaultSettings.defaultPeriodDuration || 5;
      const settings: UserSettings = {
        ...defaultSettings,
        userName: userName.trim() || undefined,
        defaultCycleLength: cycleLength,
        defaultPeriodDuration: periodDays,
        onboardingCompleted: true,
        updatedAt: now,
        createdAt: defaultSettings.createdAt || now,
      };
      const firstCycle: Cycle = {
        id: 'cycle-' + Date.now(),
        startDate,
        endDate: addDaysToDate(startDate, periodDays - 1),
        periodDays,
        notes: 'Premier cycle enregistré à l’accueil',
        createdAt: now,
      };
      await onComplete({ settings, firstCycle });
    } catch {
      setError('Impossible d’enregistrer pour le moment. Réessaie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
              Raoula_js
            </p>
            <h1 className="text-xl font-bold text-stone-900">Bienvenue</h1>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed mb-5">
          Une seule question pour démarrer — tout le reste se calcule automatiquement. Tes données restent sur cet appareil.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Premier jour de tes dernières règles
            </label>
            <input
              type="date"
              required
              max={formatDate(new Date())}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-rose-500 text-base"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Tu ne sais pas exactement ? Choisis le jour le plus proche, tu pourras corriger à tout moment.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Ton prénom (optionnel)
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ex. Raoula"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-rose-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Enregistrement…' : 'C’est parti'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-stone-400 text-center">
          SAMUEL · SAMVICdev · 100 % privé sur l’appareil
        </p>
      </div>
    </div>
  );
};
