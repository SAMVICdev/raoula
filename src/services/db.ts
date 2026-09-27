import { Cycle, DailyLog, UserSettings, ExportPayload } from '../types';

const DB_NAME = 'raoula_js_db';
const DB_VERSION = 1;

const STORES = {
  CYCLES: 'cycles',
  DAILY_LOGS: 'daily_logs',
  SETTINGS: 'settings',
};

const DEFAULT_SETTINGS: UserSettings = {
  userName: '',
  defaultCycleLength: 28,
  defaultPeriodDuration: 5,
  lutealPhaseLength: 14,
  useAutoAverage: true,
  reminderConsent: false,
  alarmSound: true,
  themeMode: 'auto',
  onboardingCompleted: false,
  tutorialCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Open or upgrade the IndexedDB instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB n'est pas supporté par ce navigateur."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Cycles store
      if (!db.objectStoreNames.contains(STORES.CYCLES)) {
        const cycleStore = db.createObjectStore(STORES.CYCLES, { keyPath: 'id' });
        cycleStore.createIndex('startDate', 'startDate', { unique: false });
      }

      // Daily Logs store
      if (!db.objectStoreNames.contains(STORES.DAILY_LOGS)) {
        db.createObjectStore(STORES.DAILY_LOGS, { keyPath: 'date' });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Helper to run a transaction
 */
async function getStore(
  storeName: string,
  mode: IDBTransactionMode = 'readonly'
): Promise<{ store: IDBObjectStore; tx: IDBTransaction }> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  return { store, tx };
}

/* =========================================================================
   CYCLES OPERATIONS
   ========================================================================= */

export async function getAllCycles(): Promise<Cycle[]> {
  const { store } = await getStore(STORES.CYCLES, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const cycles: Cycle[] = request.result || [];
      // Sort chronologically descending (most recent first)
      cycles.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      resolve(cycles);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveCycle(cycle: Cycle): Promise<void> {
  const { store, tx } = await getStore(STORES.CYCLES, 'readwrite');
  return new Promise((resolve, reject) => {
    store.put(cycle);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCycle(id: string): Promise<void> {
  const { store, tx } = await getStore(STORES.CYCLES, 'readwrite');
  return new Promise((resolve, reject) => {
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* =========================================================================
   DAILY LOGS OPERATIONS
   ========================================================================= */

export async function getAllDailyLogs(): Promise<DailyLog[]> {
  const { store } = await getStore(STORES.DAILY_LOGS, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const { store } = await getStore(STORES.DAILY_LOGS, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(date);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  const { store, tx } = await getStore(STORES.DAILY_LOGS, 'readwrite');
  return new Promise((resolve, reject) => {
    store.put(log);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDailyLog(date: string): Promise<void> {
  const { store, tx } = await getStore(STORES.DAILY_LOGS, 'readwrite');
  return new Promise((resolve, reject) => {
    store.delete(date);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* =========================================================================
   SETTINGS OPERATIONS
   ========================================================================= */

export async function getSettings(): Promise<UserSettings> {
  const { store } = await getStore(STORES.SETTINGS, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get('user_preferences');
    request.onsuccess = () => {
      if (request.result && request.result.value) {
        resolve({ ...DEFAULT_SETTINGS, ...request.result.value });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const { store, tx } = await getStore(STORES.SETTINGS, 'readwrite');
  return new Promise((resolve, reject) => {
    store.put({ key: 'user_preferences', value: settings });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* =========================================================================
   DATABASE BACKUP, RESTORE & PURGE
   ========================================================================= */

export async function exportAllData(): Promise<ExportPayload> {
  const [cycles, dailyLogs, settings] = await Promise.all([
    getAllCycles(),
    getAllDailyLogs(),
    getSettings(),
  ]);

  return {
    version: 1,
    appName: 'Raoula_js',
    exportedAt: new Date().toISOString(),
    settings,
    cycles,
    dailyLogs,
  };
}

export async function importData(payload: ExportPayload): Promise<{ cyclesCount: number; logsCount: number }> {
  if (!payload || !payload.appName || !Array.isArray(payload.cycles)) {
    throw new Error("Fichier de sauvegarde invalide ou non reconnu.");
  }

  const db = await openDB();

  // Write cycles
  const txCycles = db.transaction(STORES.CYCLES, 'readwrite');
  const cycleStore = txCycles.objectStore(STORES.CYCLES);
  for (const c of payload.cycles) {
    cycleStore.put(c);
  }
  await new Promise((res, rej) => {
    txCycles.oncomplete = () => res(true);
    txCycles.onerror = () => rej(txCycles.error);
  });

  // Write daily logs
  if (Array.isArray(payload.dailyLogs)) {
    const txLogs = db.transaction(STORES.DAILY_LOGS, 'readwrite');
    const logStore = txLogs.objectStore(STORES.DAILY_LOGS);
    for (const log of payload.dailyLogs) {
      logStore.put(log);
    }
    await new Promise((res, rej) => {
      txLogs.oncomplete = () => res(true);
      txLogs.onerror = () => rej(txLogs.error);
    });
  }

  // Write settings
  if (payload.settings) {
    await saveSettings(payload.settings);
  }

  return {
    cyclesCount: payload.cycles.length,
    logsCount: payload.dailyLogs ? payload.dailyLogs.length : 0,
  };
}

export async function clearAllLocalData(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORES.CYCLES, STORES.DAILY_LOGS, STORES.SETTINGS], 'readwrite');
  tx.objectStore(STORES.CYCLES).clear();
  tx.objectStore(STORES.DAILY_LOGS).clear();
  tx.objectStore(STORES.SETTINGS).clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Ouvre IndexedDB. Plus de cycles d’exemple : le premier lancement passe par l’accueil.
 */
export async function initializeDatabaseWithStarterIfNeeded(): Promise<boolean> {
  await openDB();
  return false;
}
