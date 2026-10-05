import { Medication, DoseLog, ReminderSettings, DailyDoseItem } from '../types/medication';

const MEDS_STORAGE_KEY = 'dosemate_medications_v2';
const LOGS_STORAGE_KEY = 'dosemate_dose_logs_v2';
const SETTINGS_STORAGE_KEY = 'dosemate_settings_v2';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Metformin',
    genericName: 'Glucophage',
    strength: '500 mg',
    form: 'tablet',
    color: '#0d9488', // teal-600
    times: ['08:00', '19:30'],
    instructions: 'Take with food to minimize stomach upset. Do not crush.',
    foodTiming: 'with_food',
    frequency: 'twice_daily',
    currentStock: 48,
    unit: 'tablets',
    refillThreshold: 14,
    refillReminderEnabled: true,
    active: true,
    prescriber: 'Dr. Sarah Mitchell (Internal Medicine)',
    notes: 'Prescribed for blood sugar regulation.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    genericName: 'Prinivil',
    strength: '10 mg',
    form: 'tablet',
    color: '#0284c7', // sky-600
    times: ['08:30'],
    instructions: 'Take in the morning with a full glass of water. Monitor blood pressure.',
    foodTiming: 'anytime',
    frequency: 'daily',
    currentStock: 22,
    unit: 'tablets',
    refillThreshold: 7,
    refillReminderEnabled: true,
    active: true,
    prescriber: 'Dr. Sarah Mitchell',
    notes: 'Blood pressure maintenance. Check BP weekly.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-3',
    name: 'Vitamin D3 & K2',
    strength: '2000 IU / 75 mcg',
    form: 'capsule',
    color: '#d97706', // amber-600
    times: ['09:00'],
    instructions: 'Best absorbed with dietary fats during breakfast.',
    foodTiming: 'with_food',
    frequency: 'daily',
    currentStock: 65,
    unit: 'capsules',
    refillThreshold: 15,
    refillReminderEnabled: true,
    active: true,
    notes: 'Immune & bone support.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-4',
    name: 'Omega-3 EPA/DHA',
    strength: '1200 mg',
    form: 'capsule',
    color: '#059669', // emerald-600
    times: ['13:00'],
    instructions: 'Take with lunch. High potency molecularly distilled.',
    foodTiming: 'with_food',
    frequency: 'daily',
    currentStock: 12, // triggers low refill alert!
    unit: 'softgels',
    refillThreshold: 14,
    refillReminderEnabled: true,
    active: true,
    notes: 'Cardiovascular & joint support. Low stock warning active.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-5',
    name: 'Melatonin Gentle Release',
    strength: '3 mg',
    form: 'tablet',
    color: '#6366f1', // indigo-500
    times: ['22:00'],
    instructions: 'Take 30 minutes before intended bedtime. Keep lights dim.',
    foodTiming: 'before_meal',
    frequency: 'daily',
    currentStock: 28,
    unit: 'tablets',
    refillThreshold: 7,
    refillReminderEnabled: true,
    active: true,
    notes: 'Circadian rhythm rest support.',
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_SETTINGS: ReminderSettings = {
  soundEnabled: true,
  soundType: 'gentle_chime',
  soundVolume: 0.8,
  browserNotificationsEnabled: true,
  voiceAnnouncementEnabled: true,
  autoSnoozeMinutes: 10,
};

export function loadMedications(): Medication[] {
  if (typeof window === 'undefined') return INITIAL_MEDICATIONS;
  try {
    const data = localStorage.getItem(MEDS_STORAGE_KEY);
    if (!data) {
      saveMedications(INITIAL_MEDICATIONS);
      return INITIAL_MEDICATIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load medications from storage', err);
    return INITIAL_MEDICATIONS;
  }
}

export function saveMedications(meds: Medication[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(meds));
  } catch (err) {
    console.error('Failed to save medications', err);
  }
}

export function loadDoseLogs(): DoseLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!data) return seedSampleLogs();
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load dose logs', err);
    return [];
  }
}

export function saveDoseLogs(logs: DoseLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save dose logs', err);
  }
}

export function loadSettings(): ReminderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ReminderSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

// Generate realistic logs for yesterday and previous days to show adherence streaks
function seedSampleLogs(): DoseLog[] {
  const logs: DoseLog[] = [];
  const today = new Date();
  
  // Seed past 5 days
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    INITIAL_MEDICATIONS.forEach(med => {
      med.times.forEach(time => {
        logs.push({
          id: `log-${dateStr}-${med.id}-${time}`,
          medicationId: med.id,
          scheduledDate: dateStr,
          scheduledTime: time,
          status: 'taken',
          takenAt: `${dateStr}T${time}:22.000Z`,
          updatedAt: `${dateStr}T${time}:22.000Z`,
        });
      });
    });
  }

  saveDoseLogs(logs);
  return logs;
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getTimeSlot(timeStr: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const [hour] = timeStr.split(':').map(Number);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function computeDailyDoses(
  targetDate: string,
  medications: Medication[],
  logs: DoseLog[]
): DailyDoseItem[] {
  const activeMeds = medications.filter(m => m.active);
  const now = new Date();
  const currentFormattedDate = getTodayDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const items: DailyDoseItem[] = [];

  activeMeds.forEach(med => {
    // Check day of week filter if specified
    if (med.frequency === 'specific_days' && med.daysOfWeek && med.daysOfWeek.length > 0) {
      const [year, month, day] = targetDate.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      if (!med.daysOfWeek.includes(dayOfWeek)) {
        return;
      }
    }

    med.times.forEach(time => {
      const [hour, min] = time.split(':').map(Number);
      const scheduledMinutes = hour * 60 + min;

      // Find existing log for this med, date, and time
      const log = logs.find(
        l => l.medicationId === med.id && l.scheduledDate === targetDate && l.scheduledTime === time
      );

      const isToday = targetDate === currentFormattedDate;
      const minutesDiff = scheduledMinutes - currentMinutes;

      // If scheduled time has passed and not logged/snoozed
      const isPastDue = isToday ? minutesDiff < 0 && (!log || log.status === 'pending') : targetDate < currentFormattedDate && (!log || log.status === 'pending');
      const isUpcoming = isToday && minutesDiff >= 0 && minutesDiff <= 60 && (!log || log.status === 'pending');

      items.push({
        medication: med,
        scheduledTime: time,
        timeSlot: getTimeSlot(time),
        log,
        isPastDue,
        isUpcoming,
        minutesDifference: minutesDiff,
      });
    });
  });

  // Sort chronologically
  return items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export function calculateAdherenceStats(logs: DoseLog[], medications: Medication[], daysCount: number = 7) {
  const today = new Date();
  let totalScheduled = 0;
  let totalTaken = 0;
  let totalSkipped = 0;

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dailyItems = computeDailyDoses(dateStr, medications, logs);
    totalScheduled += dailyItems.length;

    dailyItems.forEach(item => {
      if (item.log?.status === 'taken') totalTaken++;
      if (item.log?.status === 'skipped') totalSkipped++;
    });
  }

  const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

  // Compute streak: consecutive days where 100% of doses were taken
  let streak = 0;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const items = computeDailyDoses(dateStr, medications, logs);
    if (items.length === 0) continue;
    const allTaken = items.every(it => it.log?.status === 'taken');
    if (allTaken) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalScheduled,
    totalTaken,
    totalSkipped,
    adherenceRate,
    streak,
  };
}
