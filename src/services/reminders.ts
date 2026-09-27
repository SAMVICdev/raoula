import { CalculatedCycleStatus, DailyLog, UserSettings } from '../types';
import { formatDate } from '../utils/cycleCalculations';
import { playAlarmSound } from './alarm';

const STORAGE_KEY = 'raoula_js_last_reminder';

/**
 * Rappels navigateur (PWA) : uniquement si l’utilisatrice a consenti.
 * Le web ne garantit pas un réveil en arrière-plan ; on notifie à l’ouverture de l’app :
 * - 3 jours avant les règles prévues (prévenir)
 * - la veille / le jour même (rappel)
 * - en cas de retard
 * - si le journal du jour n’est pas rempli
 */
export async function requestReminderPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  return Notification.requestPermission();
}

function alreadySentToday(kind: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { date: string; kind: string };
    return parsed.date === formatDate(new Date()) && parsed.kind === kind;
  } catch {
    return false;
  }
}

function markSent(kind: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: formatDate(new Date()), kind })
  );
}

export async function maybeNotifyOnOpen(params: {
  settings: UserSettings;
  status: CalculatedCycleStatus;
  todayLog: DailyLog | null;
}): Promise<void> {
  const { settings, status, todayLog } = params;
  if (!settings.reminderConsent) return;
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (!status.hasData) return;

  let kind = '';
  let title = 'Raoula_js';
  let body = '';

  if (status.isLate) {
    kind = 'late';
    body = `Retard estimé de ${status.daysLate} jour(s). Tu peux noter tes règles ou consulter le guide.`;
  } else if (status.daysUntilNextPeriod === 3) {
    kind = 'period-3d';
    body = 'Tes règles sont estimées dans 3 jours. Pense à te préparer (protections, planning).';
  } else if (status.daysUntilNextPeriod >= 0 && status.daysUntilNextPeriod <= 2) {
    kind = 'period-soon';
    body =
      status.daysUntilNextPeriod === 0
        ? 'Les règles sont prévues aujourd’hui. Note-les si elles commencent.'
        : `Règles estimées dans ${status.daysUntilNextPeriod} jour(s).`;
  } else if (!todayLog) {
    kind = 'daily-log';
    body = 'Un instant pour noter flux, humeur ou symptômes d’aujourd’hui.';
  }

  if (!kind || alreadySentToday(kind)) return;

  try {
    new Notification(title, { body, tag: `raoula-${kind}` });
    markSent(kind);
    // Sonnerie d'alarme (si activée dans Réglages) : attire l'attention,
    // notamment quand l'app est ouverte en arrière-plan.
    if (settings.alarmSound !== false && kind !== 'daily-log') {
      playAlarmSound();
    }
  } catch (err) {
    console.error('Notification locale impossible:', err);
  }
}
