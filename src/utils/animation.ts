/**
 * Socle d'animations partagé — motion (Framer Motion).
 * Durées courtes et courbes douces : l'app doit se sentir vive, pas tape-à-l'œil.
 */
import type { Variants } from 'motion/react';

/** Apparition en cascade : chaque enfant monte et apparaît avec un léger délai. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Fondu simple pour les transitions d'onglets. */
export const fadeScreen: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

/** Rebond élastique pour les boutons sélectionnés. */
export const tapScale = { scale: 0.94 };

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 26 },
  },
};

/** Vibration légère de confirmation (complète la sonnerie d'alarme). */
export function hapticLight(): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate(12);
  } catch {
    // ignore
  }
}

/** Vibration de succès (validation du journal). */
export function hapticSuccess(): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate([15, 60, 25]);
  } catch {
    // ignore
  }
}
