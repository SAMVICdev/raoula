import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  Heart,
  Thermometer,
  Sparkles,
  Smile,
  Droplet,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyLog, FlowIntensity, CervicalMucusType, IntimacyType } from '../types';
import { formatFrenchDate } from '../utils/cycleCalculations';
import { hapticLight, hapticSuccess } from '../utils/animation';
import { ConfettiBurst } from './ConfettiBurst';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  existingLog: DailyLog | null;
  onSave: (log: DailyLog) => Promise<void>;
  onDelete: (date: string) => Promise<void>;
}

const FLOW_OPTIONS: { id: FlowIntensity; label: string; desc: string }[] = [
  { id: 'none', label: 'Aucun', desc: 'Pas de saignement' },
  { id: 'spotting', label: 'Spotting', desc: 'Légères pertes rosées/marrons' },
  { id: 'light', label: 'Léger', desc: 'Flux discret' },
  { id: 'medium', label: 'Moyen', desc: 'Flux régulier' },
  { id: 'heavy', label: 'Abondant', desc: 'Flux intense' },
];

const SYMPTOM_OPTIONS = [
  { id: 'crampes', label: 'Crampes' },
  { id: 'maux_de_tete', label: 'Maux de tête' },
  { id: 'ballonnements', label: 'Ballonnements' },
  { id: 'seins_sensibles', label: 'Seins sensibles' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'acne', label: 'Acné' },
  { id: 'douleur_ovulatoire', label: 'Tiraillement ovaire' },
  { id: 'douleur_lombaire', label: 'Bas du dos' },
  { id: 'sommeil_perturbe', label: 'Sommeil perturbé' },
  { id: 'nausees', label: 'Nausées' },
];

const MOOD_OPTIONS = [
  { id: 'calme', label: 'Calme', emoji: '😌' },
  { id: 'joyeuse', label: 'Joyeuse', emoji: '😊' },
  { id: 'energique', label: 'Dynamique', emoji: '⚡' },
  { id: 'sensible', label: 'Sensible', emoji: '🥺' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
  { id: 'anxieuse', label: 'Anxieuse', emoji: '😰' },
  { id: 'fatiguee', label: 'Épuisée', emoji: '😴' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
];

const MUCUS_OPTIONS: { id: CervicalMucusType; label: string; fertilityNote: string }[] = [
  { id: 'dry', label: 'Sèche', fertilityNote: 'Fertilité très basse' },
  { id: 'sticky', label: 'Collante', fertilityNote: 'Fertilité basse' },
  { id: 'creamy', label: 'Crémeuse', fertilityNote: 'Fertilité modérée' },
  { id: 'egg_white', label: "Blanc d'œuf", fertilityNote: 'Fertilité maximale' },
];

const INTIMACY_OPTIONS: { id: IntimacyType; label: string }[] = [
  { id: 'none', label: 'Aucun' },
  { id: 'protected', label: 'Protégé' },
  { id: 'unprotected', label: 'Non protégé' },
];

/**
 * Journal du jour en 2 niveaux :
 * - Niveau 1 (toujours visible) : flux + humeur + symptômes — 3 taps et c'est fait.
 * - Niveau 2 (replié) : température, glaire, intimité, pilule, notes — pour les utilisatrices expertes.
 */
export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  existingLog,
  onSave,
  onDelete,
}) => {
  const [flow, setFlow] = useState<FlowIntensity>('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [mucus, setMucus] = useState<CervicalMucusType | undefined>(undefined);
  const [temperature, setTemperature] = useState<string>('');
  const [intimacy, setIntimacy] = useState<IntimacyType>('none');
  const [contraceptiveTaken, setContraceptiveTaken] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow || 'none');
      setSymptoms(existingLog.symptoms || []);
      setMoods(existingLog.moods || []);
      setMucus(existingLog.cervicalMucus);
      setTemperature(existingLog.temperature ? existingLog.temperature.toString() : '');
      setIntimacy(existingLog.intimacy || 'none');
      setContraceptiveTaken(existingLog.contraceptiveTaken || false);
      setNotes(existingLog.notes || '');
      // Ouvrir la section avancée si un de ses champs est déjà rempli.
      const hasAdvancedData =
        existingLog.cervicalMucus ||
        existingLog.temperature ||
        (existingLog.intimacy && existingLog.intimacy !== 'none') ||
        existingLog.contraceptiveTaken ||
        existingLog.notes;
      setShowAdvanced(Boolean(hasAdvancedData));
    } else {
      setFlow('none');
      setSymptoms([]);
      setMoods([]);
      setMucus(undefined);
      setTemperature('');
      setIntimacy('none');
      setContraceptiveTaken(false);
      setNotes('');
      setShowAdvanced(false);
    }
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    hapticLight();
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleMood = (id: string) => {
    hapticLight();
    setMoods((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedTemp = temperature ? parseFloat(temperature.replace(',', '.')) : undefined;
      const logData: DailyLog = {
        date: dateStr,
        flow,
        symptoms,
        moods,
        cervicalMucus: mucus,
        temperature: isNaN(parsedTemp as number) ? undefined : parsedTemp,
        intimacy,
        contraceptiveTaken,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      await onSave(logData);
      setConfetti((c) => c + 1); // célébration visuelle + vibration de succès
      hapticSuccess();
      setTimeout(onClose, 650); // laisse le temps aux confettis d'apparaître
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer les données enregistrées pour ce jour ?')) {
      setIsSaving(true);
      try {
        await onDelete(dateStr);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/40 backdrop-blur-xs"
        onClick={onClose}
      >
      <motion.div
        key="panel"
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.3 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-stone-200 overflow-hidden"
      >
        {/* En-tête : date + état du journal */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-rose-50/50">
          <div>
            <span className="text-xs uppercase tracking-wider text-rose-700 font-semibold">
              Ma journée
            </span>
            <h2 className="text-lg font-bold text-stone-900 capitalize">
              {formatFrenchDate(dateStr)}
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

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1 text-sm">
          {/* ── NIVEAU 1 : L'ESSENTIEL ── */}            {/* Flux */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-stone-800 mb-2">
              <Droplet className="w-4 h-4 text-rose-600" />
              <span>Flux aujourd'hui</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {FLOW_OPTIONS.map((opt) => (
                <motion.button
                  type="button"
                  key={opt.id}
                  whileTap={{ scale: 0.92 }}
                  animate={flow === opt.id ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => { hapticLight(); setFlow(opt.id); }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    flow === opt.id
                      ? 'border-rose-500 bg-rose-50/80 text-rose-950 font-medium ring-2 ring-rose-200'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                  }`}
                >
                  <div className="font-medium text-xs">{opt.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Humeur (emojis, gros boutons) */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-stone-800 mb-2">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>Comment te sens-tu ?</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((m) => {
                const selected = moods.includes(m.id);
                return (
                  <motion.button
                    type="button"
                    key={m.id}
                    whileTap={{ scale: 0.9 }}
                    animate={selected ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{ duration: 0.28 }}
                    onClick={() => toggleMood(m.id)}
                    className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selected
                        ? 'border-amber-400 bg-amber-50 text-amber-900 font-medium ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <motion.div
                      className="text-xl leading-none"
                      animate={selected ? { scale: [1, 1.35, 1.15], rotate: [0, -8, 0] } : { scale: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      {m.emoji}
                    </motion.div>
                    <div className="text-[10px] mt-1">{m.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Symptômes */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-stone-800 mb-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Ressenti physique</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_OPTIONS.map((s) => {
                const selected = symptoms.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selected
                        ? 'border-rose-400 bg-rose-100 text-rose-900 font-medium'
                        : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── NIVEAU 2 : OPTIONS AVANCÉES (replié) ── */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer bg-white"
            >
              <span>Options avancées · température, glaire, notes…</span>
              {showAdvanced ? (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-4 pt-1 space-y-5 bg-stone-50/50 border-t border-stone-100">
                {/* Glaire cervicale */}
                <div>
                  <label className="flex items-center gap-2 font-semibold text-stone-700 mb-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Glaire cervicale</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MUCUS_OPTIONS.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMucus(mucus === m.id ? undefined : m.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          mucus === m.id
                            ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-200'
                            : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-xs">{m.label}</span>
                          <span className="text-[10px] font-medium text-indigo-700 text-right">
                            {m.fertilityNote}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Température */}
                <div>
                  <label className="flex items-center gap-1.5 font-medium text-stone-700 mb-1.5 text-xs">
                    <Thermometer className="w-3.5 h-3.5 text-stone-500" />
                    <span>Température basale (°C)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex : 36.6"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
                  />
                </div>

                {/* Intimité */}
                <div>
                  <label className="font-medium text-stone-700 mb-1.5 text-xs block">
                    Intimité / Rapport
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {INTIMACY_OPTIONS.map((i) => (
                      <button
                        type="button"
                        key={i.id}
                        onClick={() => setIntimacy(i.id)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs cursor-pointer transition-colors ${
                          intimacy === i.id
                            ? 'border-rose-400 bg-rose-50 text-rose-900 font-medium'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50 bg-white'
                        }`}
                      >
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pilule */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="contraceptive"
                    checked={contraceptiveTaken}
                    onChange={(e) => setContraceptiveTaken(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300"
                  />
                  <label htmlFor="contraceptive" className="text-xs text-stone-700 cursor-pointer">
                    Contraception prise aujourd'hui (pilule, etc.)
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-medium text-stone-700 mb-1 text-xs block">
                    Note personnelle (privée, sur cet appareil)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Sensations, événements..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-rose-500 resize-none bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confettis de célébration après enregistrement */}
          <ConfettiBurst trigger={confetti} />

          {/* Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
            {existingLog ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer ce jour</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <motion.button
                type="submit"
                disabled={isSaving}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
