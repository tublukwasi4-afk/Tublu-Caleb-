import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Medication, DoseLog, ReminderSettings } from './types/medication';
import { 
  loadMedications, 
  saveMedications, 
  loadDoseLogs, 
  saveDoseLogs, 
  loadSettings, 
  saveSettings, 
  getTodayDateString, 
  calculateAdherenceStats,
  INITIAL_MEDICATIONS
} from './utils/storage';
import { playMedicationReminderSound, speakMedicineReminder } from './utils/audioChimes';
import { sendMedicationNotification } from './utils/notifications';
import { TopBar } from './components/TopBar';
import { TodaySchedule } from './components/TodaySchedule';
import { MedicationList } from './components/MedicationList';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { MedicationModal } from './components/MedicationModal';
import { ActiveReminderModal } from './components/ActiveReminderModal';
import { PrintableScheduleModal } from './components/PrintableScheduleModal';

export default function App() {
  const [medications, setMedications] = useState<Medication[]>(() => loadMedications());
  const [logs, setLogs] = useState<DoseLog[]>(() => loadDoseLogs());
  const [settings, setSettings] = useState<ReminderSettings>(() => loadSettings());
  const [currentTab, setCurrentTab] = useState<'schedule' | 'medications' | 'history' | 'settings'>('schedule');
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());

  // Modal States
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Active Reminder Alarm State
  const [activeAlarmDose, setActiveAlarmDose] = useState<{
    medication: Medication;
    scheduledTime: string;
  } | null>(null);

  // Keep track of triggered alarms so we don't repeat the exact same alarm in the same minute
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // Sync to localStorage
  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  useEffect(() => {
    saveDoseLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Automated Alarm Scheduler Tick (Checks every 5 seconds)
  useEffect(() => {
    const checkScheduledAlarms = () => {
      const now = new Date();
      const todayStr = getTodayDateString();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;
      const nowTs = now.getTime();

      medications.filter(m => m.active).forEach(med => {
        // Check days of week if applicable
        if (med.frequency === 'specific_days' && med.daysOfWeek && med.daysOfWeek.length > 0) {
          if (!med.daysOfWeek.includes(now.getDay())) return;
        }

        med.times.forEach(time => {
          const alarmKey = `${todayStr}_${med.id}_${time}_${currentTimeStr}`;
          
          // Check if already taken or skipped for today
          const existingLog = logs.find(
            l => l.medicationId === med.id && l.scheduledDate === todayStr && l.scheduledTime === time
          );

          if (existingLog && (existingLog.status === 'taken' || existingLog.status === 'skipped')) {
            return;
          }

          // Check if snoozed
          if (existingLog && existingLog.status === 'snoozed' && existingLog.snoozeUntil) {
            const snoozeTime = new Date(existingLog.snoozeUntil).getTime();
            if (nowTs >= snoozeTime) {
              const snoozeAlarmKey = `snooze_${todayStr}_${med.id}_${time}_${Math.floor(nowTs / 60000)}`;
              if (!triggeredAlarmsRef.current.has(snoozeAlarmKey)) {
                triggeredAlarmsRef.current.add(snoozeAlarmKey);
                triggerAlarm(med, time);
              }
            }
            return;
          }

          // Exact time match
          if (time === currentTimeStr) {
            if (!triggeredAlarmsRef.current.has(alarmKey)) {
              triggeredAlarmsRef.current.add(alarmKey);
              triggerAlarm(med, time);
            }
          }
        });
      });
    };

    const triggerAlarm = (med: Medication, scheduledTime: string) => {
      setActiveAlarmDose({ medication: med, scheduledTime });

      // Play audio chime
      if (settings.soundEnabled) {
        playMedicationReminderSound(settings.soundType, settings.soundVolume);
      }

      // Voice announcement
      if (settings.voiceAnnouncementEnabled) {
        speakMedicineReminder(
          med.name,
          med.strength,
          med.foodTiming === 'with_food' ? 'Take with food.' : undefined
        );
      }

      // Browser push notification
      sendMedicationNotification(
        `Time to take ${med.name} (${med.strength})`,
        `Scheduled for ${scheduledTime}. ${med.instructions || 'Tap to mark taken'}`
      );
    };

    // Run check immediately and then every 5 seconds
    checkScheduledAlarms();
    const interval = setInterval(checkScheduledAlarms, 5000);
    return () => clearInterval(interval);
  }, [medications, logs, settings]);

  // Adherence and streak calculations
  const { streak } = useMemo(() => {
    return calculateAdherenceStats(logs, medications, 7);
  }, [logs, medications]);

  // Dose Actions
  const handleTakeDose = useCallback((medicationId: string, scheduledTime: string) => {
    const today = selectedDate || getTodayDateString();
    const nowIso = new Date().toISOString();

    setLogs(prev => {
      const filtered = prev.filter(
        l => !(l.medicationId === medicationId && l.scheduledDate === today && l.scheduledTime === scheduledTime)
      );
      return [
        ...filtered,
        {
          id: `log-${today}-${medicationId}-${scheduledTime}`,
          medicationId,
          scheduledDate: today,
          scheduledTime,
          status: 'taken',
          takenAt: nowIso,
          updatedAt: nowIso,
        },
      ];
    });

    // Decrement inventory stock
    setMedications(prev =>
      prev.map(m => {
        if (m.id === medicationId) {
          return {
            ...m,
            currentStock: Math.max(0, m.currentStock - 1),
          };
        }
        return m;
      })
    );

    // Subtle affirmative sound
    playMedicationReminderSound('crystal_bell', 0.4);

    if (activeAlarmDose?.medication.id === medicationId) {
      setActiveAlarmDose(null);
    }
  }, [selectedDate, activeAlarmDose]);

  const handleUndoDose = useCallback((medicationId: string, scheduledTime: string) => {
    const targetDate = selectedDate || getTodayDateString();

    const existingLog = logs.find(
      l => l.medicationId === medicationId && l.scheduledDate === targetDate && l.scheduledTime === scheduledTime
    );

    if (existingLog && existingLog.status === 'taken') {
      // Restore stock by 1
      setMedications(prev =>
        prev.map(m => (m.id === medicationId ? { ...m, currentStock: m.currentStock + 1 } : m))
      );
    }

    setLogs(prev =>
      prev.filter(
        l => !(l.medicationId === medicationId && l.scheduledDate === targetDate && l.scheduledTime === scheduledTime)
      )
    );
  }, [selectedDate, logs]);

  const handleSnoozeDose = useCallback((medicationId: string, scheduledTime: string, minutes: number) => {
    const today = selectedDate || getTodayDateString();
    const snoozeUntilIso = new Date(Date.now() + minutes * 60000).toISOString();
    const nowIso = new Date().toISOString();

    setLogs(prev => {
      const filtered = prev.filter(
        l => !(l.medicationId === medicationId && l.scheduledDate === today && l.scheduledTime === scheduledTime)
      );
      return [
        ...filtered,
        {
          id: `log-${today}-${medicationId}-${scheduledTime}`,
          medicationId,
          scheduledDate: today,
          scheduledTime,
          status: 'snoozed',
          snoozeUntil: snoozeUntilIso,
          updatedAt: nowIso,
        },
      ];
    });

    if (activeAlarmDose?.medication.id === medicationId) {
      setActiveAlarmDose(null);
    }
  }, [selectedDate, activeAlarmDose]);

  const handleSkipDose = useCallback((medicationId: string, scheduledTime: string, reason: string) => {
    const today = selectedDate || getTodayDateString();
    const nowIso = new Date().toISOString();

    setLogs(prev => {
      const filtered = prev.filter(
        l => !(l.medicationId === medicationId && l.scheduledDate === today && l.scheduledTime === scheduledTime)
      );
      return [
        ...filtered,
        {
          id: `log-${today}-${medicationId}-${scheduledTime}`,
          medicationId,
          scheduledDate: today,
          scheduledTime,
          status: 'skipped',
          skippedReason: reason,
          updatedAt: nowIso,
        },
      ];
    });

    if (activeAlarmDose?.medication.id === medicationId) {
      setActiveAlarmDose(null);
    }
  }, [selectedDate, activeAlarmDose]);

  // Medication CRUD
  const handleSaveMedication = (data: Partial<Medication>) => {
    if (data.id) {
      // Update
      setMedications(prev =>
        prev.map(m => (m.id === data.id ? ({ ...m, ...data } as Medication) : m))
      );
    } else {
      // Create new
      const newMed: Medication = {
        id: `med-${Date.now()}`,
        name: data.name || '',
        genericName: data.genericName,
        strength: data.strength || '',
        form: data.form || 'tablet',
        color: data.color || '#0d9488',
        times: data.times || ['08:00'],
        instructions: data.instructions || '',
        foodTiming: data.foodTiming || 'with_food',
        frequency: data.frequency || 'daily',
        daysOfWeek: data.daysOfWeek,
        currentStock: data.currentStock ?? 30,
        unit: data.unit || 'tablets',
        refillThreshold: data.refillThreshold ?? 7,
        refillReminderEnabled: true,
        active: true,
        prescriber: data.prescriber,
        createdAt: new Date().toISOString(),
      };
      setMedications(prev => [newMed, ...prev]);
    }
    setIsMedModalOpen(false);
    setEditingMedication(null);
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm('Are you sure you want to remove this medication from your schedule?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
      setLogs(prev => prev.filter(l => l.medicationId !== id));
    }
  };

  const handleToggleActiveMedication = (id: string) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const handleRestock = (id: string, amount: number) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, currentStock: m.currentStock + amount } : m))
    );
  };

  // Immediate Test Alarm Trigger
  const handleTestInstantAlarm = () => {
    const medToTest = medications[0] || INITIAL_MEDICATIONS[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setActiveAlarmDose({
      medication: medToTest,
      scheduledTime: timeStr,
    });

    if (settings.soundEnabled) {
      playMedicationReminderSound(settings.soundType, settings.soundVolume);
    }
    if (settings.voiceAnnouncementEnabled) {
      speakMedicineReminder(medToTest.name, medToTest.strength, 'Please take with water.');
    }
    sendMedicationNotification(
      `Reminder: ${medToTest.name} (${medToTest.strength})`,
      `Scheduled right now. Tap to confirm you have taken your dose.`
    );
  };

  const handleImportData = (newMeds: Medication[], newLogs: DoseLog[]) => {
    setMedications(newMeds);
    setLogs(newLogs);
  };

  const handleResetData = () => {
    if (window.confirm('Reset medications and logs to the standard sample regimen?')) {
      localStorage.clear();
      setMedications(INITIAL_MEDICATIONS);
      saveMedications(INITIAL_MEDICATIONS);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Strict 3-Zone Top Bar */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddMedication={() => {
          setEditingMedication(null);
          setIsMedModalOpen(true);
        }}
        onTestAlarm={handleTestInstantAlarm}
        soundEnabled={settings.soundEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'schedule' && (
          <TodaySchedule
            medications={medications}
            logs={logs}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onTakeDose={handleTakeDose}
            onUndoDose={handleUndoDose}
            onSnoozeDose={handleSnoozeDose}
            onSkipDose={handleSkipDose}
            onOpenAddMedication={() => {
              setEditingMedication(null);
              setIsMedModalOpen(true);
            }}
            streakCount={streak}
          />
        )}

        {currentTab === 'medications' && (
          <MedicationList
            medications={medications}
            onOpenAddMedication={() => {
              setEditingMedication(null);
              setIsMedModalOpen(true);
            }}
            onEditMedication={(med) => {
              setEditingMedication(med);
              setIsMedModalOpen(true);
            }}
            onToggleActive={handleToggleActiveMedication}
            onDeleteMedication={handleDeleteMedication}
            onRestock={handleRestock}
          />
        )}

        {currentTab === 'history' && (
          <HistoryAnalytics
            medications={medications}
            logs={logs}
            onUndoDose={handleUndoDose}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            streakCount={streak}
          />
        )}

        {currentTab === 'settings' && (
          <ReminderSettingsModal
            settings={settings}
            onUpdateSettings={setSettings}
            onTestInstantAlarm={handleTestInstantAlarm}
            medications={medications}
            logs={logs}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Active Automated Reminder Alarm Modal */}
      {activeAlarmDose && (
        <ActiveReminderModal
          medication={activeAlarmDose.medication}
          scheduledTime={activeAlarmDose.scheduledTime}
          onTakeDose={handleTakeDose}
          onSnoozeDose={handleSnoozeDose}
          onSkipDose={handleSkipDose}
          onDismiss={() => setActiveAlarmDose(null)}
          snoozeMinutes={settings.autoSnoozeMinutes}
        />
      )}

      {/* Add / Edit Medication Modal */}
      <MedicationModal
        isOpen={isMedModalOpen}
        onClose={() => {
          setIsMedModalOpen(false);
          setEditingMedication(null);
        }}
        onSave={handleSaveMedication}
        initialMedication={editingMedication}
      />

      {/* Printable Schedule Modal */}
      <PrintableScheduleModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        medications={medications}
      />

    </div>
  );
}
