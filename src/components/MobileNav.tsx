import React from 'react';
import { Home, Calendar, History, Settings, HeartPulse, TrendingUp, Gamepad2 } from 'lucide-react';
import { NavTab } from './Header';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Accueil', icon: Home },
    { id: 'calendar' as NavTab, label: 'Calendrier', icon: Calendar },
    { id: 'advice' as NavTab, label: 'Conseils', icon: HeartPulse },
    { id: 'history' as NavTab, label: 'Suivi', icon: History },
    { id: 'insights' as NavTab, label: 'Analyses', icon: TrendingUp },
    { id: 'games' as NavTab, label: 'Jeux', icon: Gamepad2 },
    { id: 'privacy' as NavTab, label: 'Réglages', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 safe-bottom">
      <div className="grid grid-cols-7 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 cursor-pointer transition-colors ${
                isActive ? 'text-rose-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
