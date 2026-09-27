/**
 * Mode PIN : hachage léger du code côté navigateur (djb2).
 * Tout reste local — le code n'est jamais envoyé sur Internet.
 * Objectif : intimité visuelle (éviter que quelqu'un ouvre l'app), pas du chiffrement fort.
 */

const PIN_KEY = 'raoula_js_pin_hash';
const SESSION_KEY = 'raoula_js_unlocked_at';

/** Hache une chaîne en hexadécimal (djb2 renforcé). */
export function hashPin(pin: string): string {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < pin.length; i++) {
    const c = pin.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) >>> 0;
    h2 = ((h2 << 7) + h2 + c * 31) >>> 0;
  }
  return (h1.toString(16) + '-' + h2.toString(16));
}

export function isPinEnabled(): boolean {
  try {
    return Boolean(localStorage.getItem(PIN_KEY));
  } catch {
    return false;
  }
}

export function savePin(pin: string): void {
  localStorage.setItem(PIN_KEY, hashPin(pin));
}

export function clearPin(): void {
  localStorage.removeItem(PIN_KEY);
}

export function verifyPin(pin: string): boolean {
  try {
    return localStorage.getItem(PIN_KEY) === hashPin(pin);
  } catch {
    return false;
  }
}

/** Verrou au démarrage : une ouverture par session d'onglet suffit. */
export function isSessionUnlocked(): boolean {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return false;
  }
}

export function markSessionUnlocked(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}
