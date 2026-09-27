import React, { useState, useCallback } from 'react';
import { Lock, Delete, ShieldCheck, HeartPulse } from 'lucide-react';

interface LockScreenProps {
  /** Vérifie le code saisi côté parent (hashé). Renvoie true si correct. */
  onUnlock: () => void;
  verifyPin: (pin: string) => boolean;
}

/**
 * Écran de verrouillage par code PIN à 4 chiffres.
 * Tout est local : le PIN est haché et stocké sur l'appareil, jamais envoyé ailleurs.
 */
export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, verifyPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback(
    (d: string) => {
      setError(false);
      setPin((prev) => {
        const next = (prev + d).slice(0, 4);
        if (next.length === 4) {
          // Vérification après un court délai pour laisser l'affichage se terminer
          setTimeout(() => {
            if (verifyPin(next)) {
              onUnlock();
            } else {
              setError(true);
              setPin('');
            }
          }, 150);
        }
        return next;
      });
    },
    [onUnlock, verifyPin]
  );

  const handleDelete = useCallback(() => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Saisie au clavier physique également
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) handleDigit(e.key);
      else if (e.key === 'Backspace') handleDelete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDigit, handleDelete]);

  return (
    <div className="min-h-screen bg-rose-50/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
          <span className="text-xl font-bold tracking-tight text-stone-900">Raoula_js</span>
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-rose-600 mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-stone-900">Espace protégé</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Saisis ton code à 4 chiffres pour ouvrir ton carnet.
        </p>

        {/* Points du PIN */}
        <div className="flex items-center justify-center gap-3 mb-2" aria-label="Code saisi">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                error
                  ? 'border-red-400 bg-red-300'
                  : pin.length > i
                  ? 'bg-rose-600 border-rose-600'
                  : 'border-stone-300 bg-white'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs mb-5 h-4 ${error ? 'text-red-600' : 'text-transparent'}`}>
          Code incorrect, réessaie.
        </p>

        {/* Clavier */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="h-14 rounded-xl bg-white border border-stone-200 text-lg font-semibold text-stone-800 hover:bg-rose-50 active:bg-rose-100 active:scale-[0.97] transition-all cursor-pointer shadow-xs"
            >
              {d}
            </button>
          ))}
          <span />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-white border border-stone-200 text-lg font-semibold text-stone-800 hover:bg-rose-50 active:bg-rose-100 active:scale-[0.97] transition-all cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 active:scale-[0.97] transition-all cursor-pointer shadow-xs"
            aria-label="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-8 text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Code stocké uniquement sur cet appareil
        </p>
        <p className="mt-2 text-[11px] text-stone-400 flex items-center justify-center gap-1.5 flex-wrap">
          <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          <span>SAMUEL · SAMVICdev · </span>
          <a
            href="https://wa.me/22897906711"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
          >
            WhatsApp +228 97 90 67 11
          </a>
        </p>
      </div>
    </div>
  );
};
