import React, { useState } from 'react';
import { ReminderSettings, Medication, DoseLog } from '../types/medication';
import { 
  playTestSound, 
  speakMedicineReminder, 
  SoundType 
} from '../utils/audioChimes';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus 
} from '../utils/notifications';
import { 
  Bell, 
  Volume2, 
  Mic, 
  Clock, 
  Sparkles, 
  Play, 
  Check, 
  AlertCircle, 
  Save, 
  Download, 
  Upload, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface ReminderSettingsProps {
  settings: ReminderSettings;
  onUpdateSettings: (newSettings: ReminderSettings) => void;
  onTestInstantAlarm: () => void;
  medications: Medication[];
  logs: DoseLog[];
  onImportData: (meds: Medication[], logs: DoseLog[]) => void;
  onResetData: () => void;
}

const SOUND_OPTIONS: { id: SoundType; name: string; description: string }[] = [
  { 
    id: 'gentle_chime', 
    name: 'Gentle Hospital Chime', 
    description: 'Warm 3-note harmonic chime designed for calm medical environments' 
  },
  { 
    id: 'crystal_bell', 
    name: 'Crystal Bell', 
    description: 'Bright, crystalline tone with clear acoustic decay' 
  },
  { 
    id: 'marimba', 
    name: 'Acoustic Marimba', 
    description: 'Pleasant warm wooden mallet sequence' 
  },
  { 
    id: 'zen_bowl', 
    name: 'Zen Singing Bowl', 
    description: 'Deep resonant 432Hz meditative bell for stress-free mindfulness' 
  },
];

export const ReminderSettingsModal: React.FC<ReminderSettingsProps> = ({
  settings,
  onUpdateSettings,
  onTestInstantAlarm,
  medications,
  logs,
  onImportData,
  onResetData,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string>(getNotificationPermissionStatus());
  const [savedNotice, setSavedNotice] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSoundSelect = (type: SoundType) => {
    const updated = { ...settings, soundType: type };
    onUpdateSettings(updated);
    playTestSound(type, settings.soundVolume);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, soundVolume: vol };
    onUpdateSettings(updated);
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
    if (perm === 'granted') {
      onUpdateSettings({ ...settings, browserNotificationsEnabled: true });
    }
  };

  const handleTestVoice = () => {
    const sampleMed = medications[0] || { name: 'Metformin', strength: '500mg' };
    speakMedicineReminder(sampleMed.name, sampleMed.strength, 'Please take with a glass of water.');
  };

  const handleExportBackup = () => {
    const backup = {
      version: 2,
      exportDate: new Date().toISOString(),
      medications,
      logs,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dosemate-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.medications)) {
          onImportData(parsed.medications, parsed.logs || []);
          if (parsed.settings) onUpdateSettings(parsed.settings);
          setImportError('');
          setSavedNotice(true);
          setTimeout(() => setSavedNotice(false), 3000);
        } else {
          setImportError('Invalid backup file structure.');
        }
      } catch (err) {
        setImportError('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Reminder Automation & Sound
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure alarms, chime tones, browser alerts, and speech accessibility
          </p>
        </div>

        <button
          onClick={onTestInstantAlarm}
          className="h-11 px-5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 transition-all self-start sm:self-auto"
        >
          <Bell className="w-4 h-4" />
          <span>Trigger Live Test Alarm</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings successfully updated & synced.</span>
        </div>
      )}

      {/* Sound Chimes Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 rounded-xl text-teal-700">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Audible Alarm Chimes
              </h3>
              <p className="text-xs text-slate-500">
                Synthesized harmonic chimes that ring automatically at scheduled dose times
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {/* Chime selector grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {SOUND_OPTIONS.map(opt => {
            const isSelected = settings.soundType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSoundSelect(opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {opt.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {opt.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTestSound(opt.id, settings.soundVolume);
                  }}
                  className="p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-100/60 rounded-lg transition-colors shrink-0"
                  title="Preview chime"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Volume Slider */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span>Volume Level</span>
          </div>
          <div className="flex items-center gap-3 w-48">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <span className="font-mono text-xs text-slate-600 w-8 tabular-nums">
              {Math.round(settings.soundVolume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Voice Assistant & Speech Announcement Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Spoken Medicine Announcements
              </h3>
              <p className="text-xs text-slate-500">
                Speaks medicine name, dosage, and food instructions when alarms ring
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.voiceAnnouncementEnabled}
              onChange={(e) => onUpdateSettings({ ...settings, voiceAnnouncementEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Preview the voice synth audio prompt for accessibility
          </p>
          <button
            onClick={handleTestVoice}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Voice Announcement</span>
          </button>
        </div>
      </div>

      {/* Browser System Push Notifications */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 rounded-xl text-teal-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Browser System Notifications
              </h3>
              <p className="text-xs text-slate-500">
                Pushes native OS desktop and mobile alerts even when looking at other tabs
              </p>
            </div>
          </div>

          <div className="text-right">
            {notificationStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Granted
              </span>
            ) : notificationStatus === 'denied' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" /> Blocked in Browser
              </span>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Allow Notifications
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Snooze Duration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Default Snooze Duration
            </h3>
            <p className="text-xs text-slate-500">
              Interval before ringing again if you snooze an active reminder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[5, 10, 15, 30].map(mins => (
            <button
              key={mins}
              onClick={() => onUpdateSettings({ ...settings, autoSnoozeMinutes: mins })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                settings.autoSnoozeMinutes === mins
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mins} mins
            </button>
          ))}
        </div>
      </div>

      {/* Backup, Restore & Data Reset */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Data Safety & Backup
          </h3>
          <p className="text-xs text-slate-500">
            Your medications and logs are stored privately in your browser storage
          </p>
        </div>

        {importError && (
          <p className="text-xs text-rose-600 font-semibold">{importError}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetData}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Sample Regimen</span>
          </button>
        </div>
      </div>

    </div>
  );
};
