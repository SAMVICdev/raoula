/**
 * Sonnerie d'alarme : son synthétisé via Web Audio API (aucun fichier externe,
 * fonctionne hors-ligne) + vibration du téléphone si supportée.
 *
 * Mélodie douce en 3 notes, répétée 3 fois — assez audible pour alerter,
 * assez discrète pour rester bienveillante.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    // Reprend le contexte si le navigateur l'a suspendu (politique autoplay)
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Joue une note (fréquence Hz, début en s, durée en s). */
function playNote(ctx: AudioContext, freq: number, start: number, duration: number, gainValue = 0.18): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  // Enveloppe : attaque rapide, maintien, fondu de sortie
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

/** Fait vibrer le téléphone (si supporté et si l'utilisatrice n'a pas coupé). */
function vibrate(pattern: number[]): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}

/**
 * Sonne l'alarme : 3 répétitions d'une arpège doux (do-mi-sol-do aigu),
 * séparées d'une pause, plus vibrations en fond.
 * Renvoie true si le son a pu être joué.
 */
export function playAlarmSound(repeats = 3): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  // Arpège : C5 (523 Hz), E5 (659), G5 (784), C6 (1047)
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const noteDur = 0.22;
  const phraseDur = notes.length * noteDur + 0.35; // phrase + pause

  for (let r = 0; r < repeats; r++) {
    const offset = r * phraseDur;
    notes.forEach((freq, i) => {
      playNote(ctx, freq, offset + i * noteDur, noteDur + 0.1);
    });
  }

  // Vibrations synchronisées avec les répétitions
  const vibPattern: number[] = [];
  for (let r = 0; r < repeats; r++) {
    vibPattern.push(180, 140, 180, phraseDur * 1000 - 640);
  }
  vibrate(vibPattern);

  return true;
}

/** Petit bip de confirmation (test / succès), une seule note montante. */
export function playConfirmationBeep(): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;
  playNote(ctx, 880, 0, 0.15, 0.15);
  playNote(ctx, 1174.66, 0.12, 0.2, 0.15); // ré aigu
  return true;
}
