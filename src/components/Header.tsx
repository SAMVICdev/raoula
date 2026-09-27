import React from 'react';
import { PlusCircle, Calendar as CalendarIcon, ShieldCheck, HeartPulse, Smartphone, TrendingUp } from 'lucide-react';

export type NavTab = 'dashboard' | 'calendar' | 'calculator' | 'advice' | 'history' | 'privacy' | 'insights';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickLog: () => void;
  onOpenAddCycle: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickLog,
  onOpenAddCycle,
  onOpenInstallModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Wordmark display face */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-rose-500 rounded"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-rose-700 transition-colors">
              Raoula_js
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean typography) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-rose-900 bg-rose-50 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => onSelectTab('calendar')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'calendar'
                ? 'text-rose-900 bg-rose-50 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Calendrier
          </button>
          <button
            onClick={() => onSelectTab('advice')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'advice'
                ? 'text-rose-900 bg-rose-50 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            <span>Conseils</span>
          </button>
          <button
            onClick={() => onSelectTab('insights')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'insights'
                ? 'text-rose-900 bg-rose-50 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Analyses</span>
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'history'
                ? 'text-rose-900 bg-rose-50 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Historique
          </button>
          <button
            onClick={() => onSelectTab('privacy')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'privacy'
                ? 'text-rose-900 bg-rose-50 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Réglages</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInstallModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer whitespace-nowrap"
            title="Installer sur mobile comme une application native"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-600" />
            <span>Installer l'app</span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-lg shadow-sm shadow-rose-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Noter</span>
          </button>
        </div>
      </div>
    </header>
  );
};

