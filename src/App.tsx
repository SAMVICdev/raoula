import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { Header, NavTab } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { CalculatorView } from './components/CalculatorView';
import { AdviceView } from './components/AdviceView';
import { HistoryView } from './components/HistoryView';
import { PrivacySettingsView } from './components/PrivacySettingsView';
import { DailyLogModal } from './components/DailyLogModal';
import { AddCycleModal } from './components/AddCycleModal';
import { UpdateLastPeriodModal } from './components/UpdateLastPeriodModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OnboardingView } from './components/OnboardingView';
import { TutorialView } from './components/TutorialView';
import { usePWAInstall } from './hooks/usePWAInstall';
import { LockScreen } from './components/LockScreen';
import { InsightsView } from './components/InsightsView';
import { GamesView } from './components/GamesView';
import { Cycle, DailyLog, UserSettings, CalculatedCycleStatus, CycleStatistics } from './types';
import { maybeNotifyOnOpen } from './services/reminders';
import { isPinEnabled, isSessionUnlocked, markSessionUnlocked, verifyPin } from './utils/pin';
import { applyTheme, startAutoThemeWatcher } from './utils/theme';
import { fadeScreen } from './utils/animation';
import { 
  getAllCycles, 
  getAllDailyLogs, 
  getSettings, 
  saveCycle, 
  deleteCycle, 
  saveDailyLog, 
  deleteDailyLog, 
  saveSettings,
  initializeDatabaseWithStarterIfNeeded 
} from './services/db';
import { 
  formatDate, 
  getCycleStatus, 
  calculateCycleStatistics,
  addDaysToDate 
} from './utils/cycleCalculations';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    defaultCycleLength: 28,
    defaultPeriodDuration: 5,
    lutealPhaseLength: 14,
    useAutoAverage: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [selectedDateForLog, setSelectedDateForLog] = useState<string>(formatDate(new Date()));
  const [isAddCycleOpen, setIsAddCycleOpen] = useState(false);
  const [isUpdateLastPeriodOpen, setIsUpdateLastPeriodOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Installation automatique : fenêtre proposée au premier chargement si possible,
  // sauf si l’utilisatrice l’a déjà fermée (souvenir local).
  const { isInstallable } = usePWAInstall();
  useEffect(() => {
    if (isLoading || !isInstallable) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem('raoula_install_dismissed') === '1';
    } catch {
      // ignore
    }
    if (dismissed) return;
    const t = window.setTimeout(() => setIsInstallModalOpen(true), 1800);
    return () => window.clearTimeout(t);
  }, [isLoading, isInstallable]);

  const closeInstallModal = () => {
    setIsInstallModalOpen(false);
    try {
      localStorage.setItem('raoula_install_dismissed', '1');
    } catch {
      // ignore
    }
  };

  // Verrouillage PIN (mode discret) : vérifié après chargement des données
  const [isUnlocked, setIsUnlocked] = useState(isSessionUnlocked());

  // Réaffichage du tutoriel à la demande (Réglages → « Revoir le tutoriel »)
  const [tutorialReplay, setTutorialReplay] = useState(false);

  // Load all records from local storage
  const loadData = useCallback(async () => {
    try {
      await initializeDatabaseWithStarterIfNeeded();
      const [storedCycles, storedLogs, storedSettings] = await Promise.all([
        getAllCycles(),
        getAllDailyLogs(),
        getSettings(),
      ]);
      setCycles(storedCycles);
      setDailyLogs(storedLogs);
      setSettings(storedSettings);
    } catch (err) {
      console.error('Erreur chargement local:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Thème : applique la préférence (auto par défaut) et suit les bascules soir/nuit
  useEffect(() => {
    applyTheme(settings.themeMode || 'auto');
  }, [settings.themeMode]);

  useEffect(() => {
    const stop = startAutoThemeWatcher(() => settings.themeMode || 'auto');
    return stop;
  }, [settings.themeMode]);

  const handleTutorialComplete = async (newSettings: UserSettings) => {
    await saveSettings(newSettings);
    await loadData();
    setTutorialReplay(false);
  };

  const handleOnboardingComplete = async (payload: {
    settings: UserSettings;
    firstCycle: Cycle;
  }) => {
    await saveSettings(payload.settings);
    await saveCycle(payload.firstCycle);
    await loadData();
  };

  // Derived current cycle status & statistics
  const todayStr = formatDate(new Date());
  const cycleStatus: CalculatedCycleStatus = getCycleStatus(cycles, settings, todayStr);
  const cycleStats: CycleStatistics = calculateCycleStatistics(
    cycles,
    settings.defaultCycleLength,
    settings.defaultPeriodDuration
  );
  const todayLog = dailyLogs.find((l) => l.date === todayStr) || null;
  const currentModalLog = dailyLogs.find((l) => l.date === selectedDateForLog) || null;

  useEffect(() => {
    if (isLoading) return;
    void maybeNotifyOnOpen({ settings, status: cycleStatus, todayLog });
  }, [isLoading, settings.reminderConsent, cycleStatus.isLate, cycleStatus.daysUntilNextPeriod, todayLog]);

  // Handlers for Cycles
  const handleSaveCycle = async (newCycle: Cycle) => {
    await saveCycle(newCycle);
    const updated = await getAllCycles();
    setCycles(updated);
  };

  // Mise à jour du cycle en cours (ressaisie de la date des dernières règles)
  const handleUpdateLastPeriod = async (updatedCycle: Cycle) => {
    await saveCycle(updatedCycle);
    const updated = await getAllCycles();
    setCycles(updated);
  };

  const handleDeleteCycle = async (id: string) => {
    await deleteCycle(id);
    const updated = await getAllCycles();
    setCycles(updated);
  };

  const handleStartPeriodToday = async () => {
    const today = formatDate(new Date());
    const newCycle: Cycle = {
      id: 'cycle-' + Date.now(),
      startDate: today,
      endDate: addDaysToDate(today, (settings.defaultPeriodDuration || 5) - 1),
      periodDays: settings.defaultPeriodDuration || 5,
      notes: 'Début des règles noté depuis le tableau de bord',
      createdAt: new Date().toISOString(),
    };
    await saveCycle(newCycle);

    // Also mark flow as medium in today's daily log
    const existing = dailyLogs.find((l) => l.date === today);
    const updatedLog: DailyLog = {
      ...(existing || {
        date: today,
        symptoms: [],
        moods: [],
        updatedAt: new Date().toISOString(),
      }),
      flow: 'medium',
    };
    await saveDailyLog(updatedLog);

    await loadData();
  };

  // Handlers for Daily Logs
  const handleSaveDailyLog = async (log: DailyLog) => {
    await saveDailyLog(log);
    const updated = await getAllDailyLogs();
    setDailyLogs(updated);
  };

  const handleDeleteDailyLog = async (date: string) => {
    await deleteDailyLog(date);
    const updated = await getAllDailyLogs();
    setDailyLogs(updated);
  };

  // Handler for Settings
  const handleUpdateSettings = async (newSettings: UserSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleOpenQuickLogToday = () => {
    setSelectedDateForLog(formatDate(new Date()));
    setIsDailyLogOpen(true);
  };

  const handleSelectDateToLog = (dateStr: string) => {
    setSelectedDateForLog(dateStr);
    setIsDailyLogOpen(true);
  };

  const needsOnboarding = !isLoading && !settings.onboardingCompleted && cycles.length === 0;

  // Tutoriel : avant l'onboarding au premier lancement, ou sur demande depuis Réglages
  const needsTutorial = !isLoading && !settings.tutorialCompleted && needsOnboarding;
  const showTutorial = needsTutorial || tutorialReplay;

  // Écran de verrouillage : avant toute donnée sensible, si un PIN est activé
  if (!isLoading && !isUnlocked && isPinEnabled() && !needsOnboarding) {
    return (
      <LockScreen
        verifyPin={verifyPin}
        onUnlock={() => {
          markSessionUnlocked();
          setIsUnlocked(true);
        }}
      />
    );
  }

  if (showTutorial) {
    return (
      <TutorialView
        defaultSettings={settings}
        onComplete={handleTutorialComplete}
      />
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingView
        defaultSettings={settings}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-xs font-medium text-stone-500">
            Chargement de Raoula_js...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 pb-20 md:pb-12">
      {/* 1. Header (Adhering strictly to Top Bar Contract) */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenQuickLog={handleOpenQuickLogToday}
        onOpenAddCycle={() => setIsAddCycleOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* 2. Main Content Canvas — transition douce entre onglets */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-8">
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentTab}
          variants={fadeScreen}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
        {currentTab === 'dashboard' && (
          <DashboardView
            userName={settings.userName}
            status={cycleStatus}
            todayLog={todayLog}
            onOpenQuickLog={handleOpenQuickLogToday}
            onOpenAddCycle={() => setIsAddCycleOpen(true)}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onStartPeriodToday={handleStartPeriodToday}
            onOpenUpdateLastPeriod={() => setIsUpdateLastPeriodOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            cycles={cycles}
            dailyLogs={dailyLogs}
            settings={settings}
            onSelectDateToLog={handleSelectDateToLog}
          />
        )}

        {currentTab === 'calculator' && (
          <CalculatorView
            settings={settings}
            onSaveCalculatedCycle={handleSaveCycle}
          />
        )}

        {currentTab === 'advice' && (
          <AdviceView
            status={cycleStatus}
          />
        )}

        {currentTab === 'history' && (
          <div className="space-y-6">
            <HistoryView
              cycles={cycles}
              stats={cycleStats}
              dailyLogs={dailyLogs}
              onOpenAddCycle={() => setIsAddCycleOpen(true)}
              onDeleteCycle={handleDeleteCycle}
            />
            {/* Simulateur & prévisions : replié pour ne pas surcharger l'écran */}
            <details className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer text-sm font-bold text-stone-900 hover:bg-stone-50 transition-colors select-none">
                Simulateur &amp; prévisions sur 6 mois ▾
              </summary>
              <div className="px-5 pb-5">
                <CalculatorView
                  settings={settings}
                  onSaveCalculatedCycle={handleSaveCycle}
                />
              </div>
            </details>
          </div>
        )}

        {currentTab === 'privacy' && (
          <PrivacySettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataReset={loadData}
            onDataReload={loadData}
            onReplayTutorial={() => setTutorialReplay(true)}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsView
            cycles={cycles}
            dailyLogs={dailyLogs}
            stats={cycleStats}
            settings={settings}
          />
        )}

        {currentTab === 'games' && <GamesView />}
        </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Footer signed by SAMUEL SAMVICdev */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white/70 py-6 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-semibold text-stone-800">Raoula_js</span>
            <span aria-hidden="true">·</span>
            <span>Créé avec soin par <strong className="text-stone-800 font-semibold">SAMUEL · SAMVICdev</strong></span>
            <span aria-hidden="true">·</span>
            <span>
              Plus d'infos :{' '}
              <a
                href="tel:+22897906711"
                className="font-medium text-rose-700 hover:text-rose-900 underline underline-offset-2 decoration-rose-300"
              >
                +228 97 90 67 11
              </a>
              {' · '}
              <a
                href="https://wa.me/22897906711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2 decoration-emerald-300"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span>100% privé sur votre appareil</span>
            <span aria-hidden="true">·</span>
            <span>Respect total de la vie privée</span>
          </div>
        </div>
      </footer>

      {/* 4. Touch Navigation for Mobile Viewports */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* 5. Modals */}
      <DailyLogModal
        isOpen={isDailyLogOpen}
        onClose={() => setIsDailyLogOpen(false)}
        dateStr={selectedDateForLog}
        existingLog={currentModalLog}
        onSave={handleSaveDailyLog}
        onDelete={handleDeleteDailyLog}
      />

      <AddCycleModal
        isOpen={isAddCycleOpen}
        onClose={() => setIsAddCycleOpen(false)}
        onSaveCycle={handleSaveCycle}
        defaultPeriodDays={settings.defaultPeriodDuration || 5}
      />

      <UpdateLastPeriodModal
        isOpen={isUpdateLastPeriodOpen}
        onClose={() => setIsUpdateLastPeriodOpen(false)}
        lastCycle={cycleStatus.lastCycle || null}
        defaultPeriodDays={settings.defaultPeriodDuration || 5}
        onUpdateCycle={handleUpdateLastPeriod}
      />

      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={closeInstallModal}
      />
    </div>
  );
}
