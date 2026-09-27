import React from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Compass
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isIOSSafari, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Application mobile
              </span>
              <h2 className="text-base font-bold text-stone-900">
                Installer Raoula_js sur mobile
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-stone-600">
          <div className="flex items-center gap-3 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100">
            <img
              src="/pwa-192x192.png"
              alt="Raoula_js Icon"
              className="w-12 h-12 rounded-2xl shadow-sm border border-rose-200 shrink-0"
            />
            <div>
              <div className="font-bold text-stone-900 text-sm">Raoula_js</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Expérience native sur écran d'accueil, fluide et plein écran.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Démarrage instantané</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Hors-ligne</span>
            </div>
          </div>

          {/* Mode 1: Already Installed */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-bold text-sm">Application déjà installée !</div>
              <p className="text-[11px] text-emerald-700">
                Raoula_js est déjà présente sur votre écran d'accueil.
              </p>
            </div>
          ) : isInstallable ? (
            /* Mode 2: Android / Chrome / Edge 1-click install */
            <div className="space-y-3">
              <p className="leading-relaxed">
                Appuyez sur le bouton ci-dessous pour ajouter l'application sur votre écran d'accueil avec son icône dédiée :
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Installer maintenant (Gratuit)</span>
              </button>
            </div>
          ) : isIOS && !isIOSSafari ? (
            /* Mode 3bis: iOS mais PAS Safari (Chrome/Firefox/Edge sur iPhone) — installation impossible ici */
            <div className="space-y-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Ouvre l'app dans Safari pour l'installer</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Tu utilises un autre navigateur sur iPhone : Apple autorise uniquement <strong>Safari</strong> à installer des applications.
              </p>
              <ol className="space-y-2 text-[11px] text-stone-700 list-decimal list-inside leading-relaxed">
                <li>Copie l'adresse de cette page (ou envoie-toi le lien par message).</li>
                <li>Ouvre <strong>Safari</strong> (la boussole 🧭) et colle l'adresse.</li>
                <li>Reviens ici : le bouton d'installation t'attendra.</li>
              </ol>
              <div className="text-[10px] text-stone-500 italic pt-1">
                Une fois dans Safari, appuie sur Partager → « Sur l'écran d'accueil ».
              </div>
            </div>
          ) : isIOS ? (
            /* Mode 3: iPhone / iPad (iOS Safari) instructions */
            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Share className="w-4 h-4 text-rose-600" />
                <span>Installation sur iPhone / iPad (Safari) :</span>
              </div>
              <ol className="space-y-2 text-[11px] text-stone-700 list-decimal list-inside leading-relaxed">
                <li>
                  Appuyez sur le bouton <strong>Partager</strong> en bas de Safari (l'icône carrée avec une flèche vers le haut <Share className="w-3 h-3 inline text-rose-600" />).
                </li>
                <li>
                  Faites défiler le menu et appuyez sur <strong>« Sur l'écran d'accueil »</strong> (<PlusSquare className="w-3 h-3 inline text-stone-700" />).
                </li>
                <li>
                  Appuyez sur <strong>« Ajouter »</strong> en haut à droite.
                </li>
              </ol>
            </div>
          ) : (
            /* Mode 4: Desktop browser or Android fallback */
            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-[11px]">
              <div className="font-bold text-stone-900 text-xs">
                Installation sur votre appareil :
              </div>
              <p>
                Ouvrez le menu de votre navigateur (les 3 points verticaux en haut à droite) et choisissez :
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-stone-200 font-semibold text-stone-800 text-center">
                « Installer l'application » ou « Ajouter à l'écran d'accueil »
              </div>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
