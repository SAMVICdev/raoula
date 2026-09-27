/**
 * Thème : clair, sombre, ou automatique (sombre entre 20h et 7h).
 * La préférence vit dans UserSettings (IndexedDB) et s'applique via la
 * classe `dark` sur <html> + la balise meta theme-color.
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_COLOR_LIGHT = '#fff1f2'; // rose très pâle (cohérent avec manifest)
const THEME_COLOR_DARK = '#0c0a09'; // stone-950

/** Détermine si le thème sombre doit être actif selon le mode choisi. */
export function shouldBeDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  // Mode auto : sombre de 20h à 7h
  const hour = new Date().getHours();
  return hour >= 20 || hour < 7;
}

/** Applique (ou retire) la classe .dark et ajuste la barre système. */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const dark = shouldBeDark(mode);
  document.documentElement.classList.toggle('dark', dark);

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = dark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
}

/**
 * Démarre le watcher du mode auto : vérifie toutes les 5 minutes
 * si le créneau soir/nuit bascule. Renvoie une fonction d'arrêt.
 */
export function startAutoThemeWatcher(getMode: () => ThemeMode): () => void {
  const tick = () => applyTheme(getMode());
  const interval = window.setInterval(tick, 5 * 60 * 1000);
  // Bascule aussi quand l'onglet redevient visible
  const onVisible = () => {
    if (document.visibilityState === 'visible') tick();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
