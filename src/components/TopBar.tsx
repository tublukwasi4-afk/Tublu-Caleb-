import React from 'react';
import { Pill, Plus, Bell, Volume2 } from 'lucide-react';

interface TopBarProps {
  currentTab: 'schedule' | 'medications' | 'history' | 'settings';
  onSelectTab: (tab: 'schedule' | 'medications' | 'history' | 'settings') => void;
  onOpenAddMedication: () => void;
  onTestAlarm: () => void;
  soundEnabled: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddMedication,
  onTestAlarm,
  soundEnabled,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
            <Pill className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-slate-900">
            DoseMate
          </span>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onSelectTab('schedule')}
            className={`transition-colors relative py-1 ${
              currentTab === 'schedule'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Schedule
            {currentTab === 'schedule' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('medications')}
            className={`transition-colors relative py-1 ${
              currentTab === 'medications'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Medications
            {currentTab === 'medications' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors relative py-1 ${
              currentTab === 'history'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adherence & Logs
            {currentTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`transition-colors relative py-1 ${
              currentTab === 'settings'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reminders & Sound
            {currentTab === 'settings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTestAlarm}
            title="Test reminder alarm sound & alert"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span className="hidden sm:inline">Test Alarm</span>
          </button>

          <button
            onClick={onOpenAddMedication}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>

      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-2">
        <button
          onClick={() => onSelectTab('schedule')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'schedule' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => onSelectTab('medications')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'medications' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Medications
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'history' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Logs
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'settings' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Alarms
        </button>
      </div>
    </header>
  );
};
