import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  HeartPulse,
  NotebookPen,
  CalendarDays,
  LineChart,
  BellRing,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { UserSettings } from '../types';
import { hapticLight } from '../utils/animation';

interface TutorialViewProps {
  defaultSettings: UserSettings;
  onComplete: (settings: UserSettings) => Promise<void>;
}

interface TutorialSlide {
  icon: React.ReactNode;
  title: string;
  text: string;
  points: string[];
}

const SLIDES: TutorialSlide[] = [
  {
    icon: <HeartPulse className="w-7 h-7" />,
    title: 'Bienvenue sur Raoula_js',
    text: 'Ton carnet de cycle confidentiel : calcul, fenêtre fertile et rappels, en toute simplicité.',
    points: [
      '100 % privé : tout reste sur ton appareil',
      'Rien à configurer — une seule question pour démarrer',
      'Fonctionne hors-ligne, installable comme une appli',
    ],
  },
  {
    icon: <NotebookPen className="w-7 h-7" />,
    title: 'Note ta journée en quelques taps',
    text: 'Chaque jour, le journal te demande ton flux, ton humeur et tes symptômes. L’essentiel d’abord : le reste est replié.',
    points: [
      'Flux, humeur (emojis) et symptômes en 3 taps',
      'Options avancées : température, glaire, pilule, notes',
      'Une confettis de célébration quand tu valides 😉',
    ],
  },
  {
    icon: <CalendarDays className="w-7 h-7" />,
    title: 'Ton cycle, visible d’un coup d’œil',
    text: 'La roue du cycle et le calendrier montrent tes règles, ta fenêtre fertile et ton ovulation.',
    points: [
      'Compteurs en temps réel sur l’accueil',
      'Prévisions des prochaines règles et fertilité estimée',
      'Analyses : courbes, température et alertes santé',
    ],
  },
  {
    icon: <BellRing className="w-7 h-7" />,
    title: 'Rappels & discrétion',
    text: 'Reçois un rappel avant tes règles, et protège l’app avec un code si tu veux.',
    points: [
      'Notifications J-3, J-1, retard et journal (activables)',
      'Mode discret : code PIN à 4 chiffres, stocké localement',
      'Sauvegarde : export/import JSON à tout moment',
    ],
  },
];

/**
 * Tutoriel au premier lancement : 4 écrans courts, skippables.
 * Ne crée aucune donnée : marque seulement tutorialCompleted.
 */
export const TutorialView: React.FC<TutorialViewProps> = ({
  defaultSettings,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const finish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onComplete({
        ...defaultSettings,
        tutorialCompleted: true,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    hapticLight();
    if (isLast) {
      void finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        {/* Indicateurs de progression */}
        <div className="flex items-center gap-1.5 mb-6" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-rose-500' : 'w-1.5 bg-stone-200'
              }`}
            />
          ))}
          <span className="ml-auto text-[11px] font-medium text-stone-400">
            {step + 1} / {SLIDES.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              {slide.icon}
            </div>

            <h1 className="text-xl font-bold text-stone-900 mb-2">
              {slide.title}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              {slide.text}
            </p>

            <ul className="space-y-2 mb-6">
              {slide.points.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-stone-700"
                >
                  <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void finish()}
            disabled={isSubmitting}
            className="text-sm font-medium text-stone-500 hover:text-stone-700 px-3 py-2.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-60"
          >
            Passer
          </button>
          <button
            type="button"
            onClick={next}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {isLast ? (
              <>
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Enregistrement…' : 'Commencer'}
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <Lock className="w-3 h-3" />
          SAMUEL · SAMVICdev · 100 % privé sur l’appareil
        </p>
      </div>
    </div>
  );
};
