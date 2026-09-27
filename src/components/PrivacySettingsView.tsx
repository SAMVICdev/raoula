import React, { useState, useRef } from 'react';import {
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  Lock, 
  AlertTriangle,
  RefreshCw,
  FolderHeart,
  UserCheck,
  Sun,
  Moon,
  Sunset,
  BellRing,
  Play,
  Phone,
  MessageCircle,
  GraduationCap
} from 'lucide-react';
import { UserSettings, ExportPayload } from '../types';
import { 
  exportAllData, 
  importData, 
  clearAllLocalData 
} from '../services/db';
import { requestReminderPermission } from '../services/reminders';
import {
  isPinEnabled,
  savePin,
  clearPin,
  verifyPin,
} from '../utils/pin';
import { ThemeMode } from '../types';
import { playAlarmSound, playConfirmationBeep } from '../services/alarm';

interface PrivacySettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => Promise<void>;
  onDataReset: () => Promise<void>;
  onDataReload: () => Promise<void>;
  onReplayTutorial?: () => void;
}

export const PrivacySettingsView: React.FC<PrivacySettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
  onDataReload,
  onReplayTutorial,
}) => {
  const [userName, setUserName] = useState(settings.userName || '');
  const [cycleLength, setCycleLength] = useState(settings.defaultCycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState(settings.defaultPeriodDuration || 5);
  const [lutealPhase, setLutealPhase] = useState(settings.lutealPhaseLength || 14);
  const [useAutoAverage, setUseAutoAverage] = useState(settings.useAutoAverage ?? true);
  const [reminderConsent, setReminderConsent] = useState(settings.reminderConsent ?? false);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Mode PIN (verrouillage discret de l'app)
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled());
  const [pinSetupMode, setPinSetupMode] = useState<'off' | 'enter' | 'confirm' | 'disable'>('off');
  const [pinFirst, setPinFirst] = useState('');
  const [pinInput, setPinInput] = useState('');

  // Sonnerie d'alarme des rappels
  const alarmOn = settings.alarmSound !== false;

  const handleToggleAlarm = async () => {
    const next = !alarmOn;
    await onUpdateSettings({
      ...settings,
      userName: userName.trim() || undefined,
      defaultCycleLength: cycleLength,
      defaultPeriodDuration: periodDuration,
      lutealPhaseLength: lutealPhase,
      useAutoAverage,
      reminderConsent,
      alarmSound: next,
      themeMode,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    if (next) {
      // Confirme l'activation par un petit bip (retour tactile immédiat)
      playConfirmationBeep();
    }
  };

  const handleTestAlarm = () => {
    const played = playAlarmSound(2);
    setStatusMessage(
      played
        ? 'Alarme testée : c’est cette sonnerie qui accompagnera tes rappels.'
        : 'Son impossible : interagis d’abord avec l’écran (clic ou touche), puis réessaie.'
    );
  };

  // Thème : clair / sombre / auto (appliqué immédiatement à la sélection)
  const themeMode: ThemeMode = settings.themeMode || 'auto';
  const themeOptions: { id: ThemeMode; label: string; desc: string }[] = [
    { id: 'light', label: 'Clair', desc: 'Toujours clair' },
    { id: 'dark', label: 'Sombre', desc: 'Toujours sombre' },
    { id: 'auto', label: 'Automatique', desc: 'Sombre de 20h à 7h' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updated: UserSettings = {
        ...settings,
        userName: userName.trim() || undefined,
        defaultCycleLength: cycleLength,
        defaultPeriodDuration: periodDuration,
        lutealPhaseLength: lutealPhase,
        useAutoAverage,
        reminderConsent,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      await onUpdateSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `raoula_mon_carnet_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage('Votre carnet personnel a été téléchargé avec succès.');
    } catch {
      setStatusMessage("Erreur lors de l'exportation des données.");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed: ExportPayload = JSON.parse(text);
      const res = await importData(parsed);
      await onDataReload();
      setStatusMessage(
        `Restauration terminée : ${res.cyclesCount} cycle(s) et ${res.logsCount} journée(s) récupérés avec succès.`
      );
    } catch (err: any) {
      alert("Erreur lors de la lecture du fichier : " + (err.message || 'Fichier non reconnu'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Mode PIN ──
  const resetPinSetup = () => {
    setPinSetupMode('off');
    setPinFirst('');
    setPinInput('');
  };

  const handlePinInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPinInput(digits);

    if (digits.length === 4) {
      if (pinSetupMode === 'enter') {
        setPinFirst(digits);
        setPinInput('');
        setPinSetupMode('confirm');
      } else if (pinSetupMode === 'confirm') {
        if (digits === pinFirst) {
          savePin(digits);
          setPinEnabled(true);
          setStatusMessage('Code PIN activé : l’app demandera ce code à chaque ouverture.');
          resetPinSetup();
        } else {
          setStatusMessage('Les deux codes ne correspondent pas. Recommence.');
          setPinFirst('');
          setPinInput('');
          setPinSetupMode('enter');
        }
      } else if (pinSetupMode === 'disable') {
        // Vérifie via le hash avant de désactiver
        if (verifyPin(digits)) {
          clearPin();
          setPinEnabled(false);
          setStatusMessage('Code PIN désactivé.');
        } else {
          setStatusMessage('Code incorrect. Le PIN reste actif.');
        }
        setPinInput('');
        setPinSetupMode('off');
      }
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    onUpdateSettings({
      ...settings,
      userName: userName.trim() || undefined,
      defaultCycleLength: cycleLength,
      defaultPeriodDuration: periodDuration,
      lutealPhaseLength: lutealPhase,
      useAutoAverage,
      reminderConsent,
      themeMode: mode,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleClearAll = async () => {
    const confirm1 = window.confirm(
      'ATTENTION : Souhaitez-vous vraiment effacer l’ensemble de vos cycles et ressentis enregistrés sur cet appareil ?'
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      'Cette action supprimera définitivement votre carnet local. Êtes-vous certaine ?'
    );
    if (!confirm2) return;

    await clearAllLocalData();
    await onDataReset();
    setStatusMessage('Toutes les données de votre carnet ont été effacées de cet appareil.');
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Hero */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                Espace Privé & Respect Total de l'Intimité
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% sur cet appareil
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              <strong>Raoula_js</strong> a été conçue pour préserver entièrement votre intimité. Vos dates de règles, symptômes, humeurs et températures restent <strong>exclusivement stockées sur votre téléphone ou ordinateur</strong>, sans jamais être transmises sur Internet.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Le carnet (cycles, notes, symptômes) reste local. Gemini n’est appelé que si tu demandes un conseil, avec la phase du cycle seulement.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aucune inscription, aucun mot de passe, aucun pistage publicitaire.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fonctionne partout, même sans connexion Internet.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-stone-900 text-white text-xs flex items-center justify-between shadow-sm">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs underline cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Card: Apparence (thème) */}
      <div className="bg-white dark:bg-stone-900 dark:border-stone-800 p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Apparence</h3>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
          Choisis l'ambiance de l'application. En mode automatique, le thème sombre s'active tout seul le soir (20h – 7h) pour reposer tes yeux.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const selected = themeMode === opt.id;
            const Icon = opt.id === 'light' ? Sun : opt.id === 'dark' ? Moon : Sunset;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleThemeChange(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selected
                    ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 dark:border-rose-700 ring-2 ring-rose-200 dark:ring-rose-900'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${selected ? 'text-rose-600' : 'text-stone-400'}`} />
                  <span className={`text-xs font-semibold ${selected ? 'text-rose-950 dark:text-rose-200' : 'text-stone-800 dark:text-stone-200'}`}>
                    {opt.label}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card: Revoir le tutoriel */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <h3 className="text-base font-bold text-stone-900">Découvrir l’application</h3>
        </div>
        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          Un oubli ou une nouvelle fonctionnalité ? Reprends le tutoriel de présentation (4 écrans courts) pour revoir l’essentiel : journal, calendrier, rappels et mode discret.
        </p>
        <button
          onClick={() => onReplayTutorial?.()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Revoir le tutoriel</span>
        </button>
      </div>

      {/* Card: Mode discret (verrouillage PIN) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-rose-600" />
          <h3 className="text-base font-bold text-stone-900">Mode discret · Code PIN</h3>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              pinEnabled
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : 'text-stone-500 bg-stone-50 border-stone-200'
            }`}
          >
            {pinEnabled ? 'Activé' : 'Désactivé'}
          </span>
        </div>
        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          Ajoute un code à 4 chiffres qui sera demandé à chaque ouverture de l’app. Idéal si tu prêtes ton téléphone. Le code est stocké uniquement sur cet appareil.
        </p>

        {pinSetupMode === 'off' && !pinEnabled && (
          <button
            onClick={() => setPinSetupMode('enter')}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
          >
            Activer le code PIN
          </button>
        )}

        {pinSetupMode === 'off' && pinEnabled && (
          <button
            onClick={() => setPinSetupMode('disable')}
            className="px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            Désactiver le code PIN
          </button>
        )}

        {(pinSetupMode === 'enter' || pinSetupMode === 'confirm' || pinSetupMode === 'disable') && (
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              {pinSetupMode === 'enter' && 'Choisis ton code à 4 chiffres'}
              {pinSetupMode === 'confirm' && 'Confirme ton code'}
              {pinSetupMode === 'disable' && 'Saisis ton code actuel pour désactiver'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pinInput}
              onChange={(e) => handlePinInput(e.target.value)}
              placeholder="••••"
              className="w-32 px-3 py-2 border border-stone-200 rounded-lg text-lg tracking-[0.4em] text-center focus:outline-rose-500 bg-white"
            />
            <button
              onClick={resetPinSetup}
              className="ml-3 text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Grid: Preferences & Data Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Card: Cycle Calculation Settings */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <h3 className="text-base font-bold text-stone-900">
              Paramètres physiologiques
            </h3>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Prénom (affichage local uniquement)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Durée moyenne par défaut du cycle (jours)
              </label>
              <input
                type="number"
                min={20}
                max={45}
                required
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value, 10) || 28)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Standard : 28 jours (peut varier de 24 à 38 jours)
              </span>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Durée habituelle des règles (jours)
              </label>
              <input
                type="number"
                min={2}
                max={12}
                required
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Phase lutéale (jours post-ovulation)
              </label>
              <input
                type="number"
                min={10}
                max={16}
                required
                value={lutealPhase}
                onChange={(e) => setLutealPhase(parseInt(e.target.value, 10) || 14)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-rose-500 bg-white"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Moyenne physiologique : 14 jours
              </span>
            </div>

            <div className="pt-2 flex items-start gap-2">
              <input
                type="checkbox"
                id="autoAverage"
                checked={useAutoAverage}
                onChange={(e) => setUseAutoAverage(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 mt-0.5"
              />
              <label htmlFor="autoAverage" className="text-stone-700 cursor-pointer">
                <strong>Calcul automatique de la moyenne :</strong> ajuster les prévisions à mesure que vos cycles réels sont enregistrés.
              </label>
            </div>

            <div className="pt-2 flex items-start gap-2">
              <input
                type="checkbox"
                id="reminders"
                checked={reminderConsent}
                onChange={async (e) => {
                  const next = e.target.checked;
                  if (next) {
                    const perm = await requestReminderPermission();
                    if (perm !== 'granted') {
                      setReminderConsent(false);
                      setStatusMessage(
                        perm === 'unsupported'
                          ? 'Les notifications ne sont pas disponibles dans ce navigateur.'
                          : 'Autorise les notifications dans le navigateur pour activer les rappels.'
                      );
                      return;
                    }
                  }
                  setReminderConsent(next);
                  await onUpdateSettings({
                    ...settings,
                    userName: userName.trim() || undefined,
                    defaultCycleLength: cycleLength,
                    defaultPeriodDuration: periodDuration,
                    lutealPhaseLength: lutealPhase,
                    useAutoAverage,
                    reminderConsent: next,
                    onboardingCompleted: true,
                    updatedAt: new Date().toISOString(),
                  });
                }}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 mt-0.5"
              />
              <label htmlFor="reminders" className="text-stone-700 cursor-pointer">
                <strong>Rappels sur cet appareil :</strong> une notification à l’ouverture de l’app (règles proches, retard, ou journal du jour). Rien n’est envoyé sur Internet.
              </label>
            </div>

            {/* Sonnerie d'alarme des rappels */}
            <div className="pt-2 mt-2 border-t border-stone-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <label
                    htmlFor="alarmSound"
                    className="text-stone-700 cursor-pointer text-sm font-medium flex items-center gap-1.5"
                  >
                    <BellRing className="w-4 h-4 text-rose-600" />
                    <span>Sonnerie des rappels</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    Une courte mélodie (et une vibration sur téléphone) accompagne les notifications de rappel.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="alarmSound"
                  checked={alarmOn}
                  onChange={handleToggleAlarm}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 mt-1 shrink-0"
                />
              </div>
              <button
                type="button"
                onClick={handleTestAlarm}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Tester l'alarme</span>
              </button>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{savedSuccess ? 'Enregistré !' : 'Mettre à jour mes réglages'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card: Sauvegarde & Restauration */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FolderHeart className="w-4 h-4 text-stone-600" />
              <h3 className="text-base font-bold text-stone-900">
                Sauvegarde & Changement d'appareil
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Pour conserver vos données en cas de changement de smartphone ou d'ordinateur, exportez votre carnet sous forme de fichier de sauvegarde à tout moment.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all text-left text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-stone-900">
                      Exporter mon carnet
                    </div>
                    <div className="text-stone-400 text-[11px]">
                      Télécharge vos cycles et vos notes
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all text-left text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-stone-900">
                      Restaurer un carnet
                    </div>
                    <div className="text-stone-400 text-[11px]">
                      Importer un fichier de sauvegarde précédent
                    </div>
                  </div>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone: Purge */}
          <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Réinitialisation
              </span>
              <span className="text-[11px] text-stone-500 block">
                Supprime le carnet de cet appareil
              </span>
            </div>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              Effacer tout
            </button>
          </div>
        </div>
      </div>

      {/* Politiques : confidentialité & conditions, lisibles dans l'app */}
      <details className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <summary className="cursor-pointer select-none">
          <span className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Politique de confidentialité &amp; conditions d'utilisation
          </span>
          <span className="block text-[11px] text-stone-400 mt-0.5">
            L'essentiel de tes droits et de nos engagements, en langage simple.
          </span>
        </summary>

        <div className="mt-4 space-y-5 text-xs text-stone-600 leading-relaxed">
          <section>
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">Politique de confidentialité</h4>
            <ul className="space-y-1.5">
              <li>• <strong>Tes données t'appartiennent</strong> : cycles, symptômes, humeurs, notes et réglages sont stockés uniquement dans ton navigateur, sur ton appareil. Aucun serveur.</li>
              <li>• <strong>Aucun compte, aucun pistage</strong> : pas d'inscription, pas de cookie publicitaire, pas de mesure d'audience.</li>
              <li>• <strong>Code PIN</strong> : haché localement, ne quitte jamais l'appareil.</li>
              <li>• <strong>Notifications</strong> : gérées par ton navigateur, rien ne transite sur Internet.</li>
              <li>• <strong>IA opt-in</strong> : « Me conseiller » n'envoie que la phase du cycle à Gemini — jamais le contenu de ton journal. Sans clé API, aucun appel n'a lieu.</li>
              <li>• <strong>Suppression définitive</strong> : « Effacer tout » vide la base locale sans copie cachée. Exporte avant si tu veux garder une trace.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">Conditions d'utilisation</h4>
            <ul className="space-y-1.5">
              <li>• <strong>Ce n'est pas un dispositif médical</strong> : l'app ne diagnostique pas et ne remplace pas un professionnel de santé. Les prévisions sont des estimations fondées sur des moyennes.</li>
              <li>• <strong>Ne pas utiliser comme contraception</strong> : les méthodes calendaires seules ne sont pas fiables pour éviter une grossesse.</li>
              <li>• <strong>Consulter sans attendre si</strong> : retard &gt; 10 jours avec test négatif, règles &gt; 8 jours ou très abondantes, douleur invalidante, saignements inhabituels répétés.</li>
              <li>• <strong>Tes sauvegardes sont ta responsabilité</strong> : sans export préalable, les données perdues (changement d'appareil, réinitialisation) sont irrécupérables — c'est le prix de la confidentialité totale.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">Support &amp; contact</h4>
            <p>
              SAMVICdev accompagne les utilisatrices : questions, restauration de sauvegarde, suggestions, bugs.
              Le support ne peut pas consulter tes données (elles sont sur ton appareil) ni donner d'avis médical.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <a
                href="tel:+22897906711"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+228 97 90 67 11</span>
              </a>
              <a
                href="https://wa.me/22897906711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </section>

          <p className="text-[11px] text-stone-400 italic border-t border-stone-100 pt-3">
            En utilisant Raoula_js, tu acceptes ces conditions. Version 1.0 · SAMUEL · SAMVICdev.
          </p>
        </div>
      </details>

      {/* Creator Signature Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-sm">
            SS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-stone-900 text-sm">
                Conçu & développé par SAMUEL · SAMVICdev
              </h4>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                Créateur
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              <strong>Raoula_js</strong> a été imaginée pour offrir à chaque femme et jeune fille une application fluide, discrète et respectueuse, garantissant que vos données intimes restent strictement vôtres.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <a
                href="tel:+22897906711"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+228 97 90 67 11</span>
              </a>
              <a
                href="https://wa.me/22897906711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
