export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'injection' 
  | 'drops' 
  | 'inhaler' 
  | 'patch' 
  | 'spray';

export type FoodTiming = 
  | 'before_meal' 
  | 'with_food' 
  | 'after_meal' 
  | 'empty_stomach' 
  | 'anytime';

export type FrequencyType = 
  | 'daily' 
  | 'twice_daily' 
  | 'three_times_daily' 
  | 'specific_days' 
  | 'as_needed';

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string; // e.g. "500 mg", "10 ml", "2 puffs"
  form: MedicationForm;
  color: string; // hex or tailwind-friendly color code e.g. '#0ea5e9'
  times: string[]; // HH:mm format e.g. ['08:00', '20:00']
  instructions: string;
  foodTiming: FoodTiming;
  frequency: FrequencyType;
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  currentStock: number;
  unit: string; // "pills", "ml", "doses", "tablets"
  refillThreshold: number;
  refillReminderEnabled: boolean;
  active: boolean;
  notes?: string;
  prescriber?: string;
  createdAt: string;
}

export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'snoozed';

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: DoseStatus;
  takenAt?: string; // ISO string
  skippedReason?: string;
  snoozeUntil?: string; // ISO string
  updatedAt: string;
}

export interface ReminderSettings {
  soundEnabled: boolean;
  soundType: 'gentle_chime' | 'crystal_bell' | 'marimba' | 'zen_bowl';
  soundVolume: number; // 0 to 1
  browserNotificationsEnabled: boolean;
  voiceAnnouncementEnabled: boolean;
  autoSnoozeMinutes: number;
  lastAlarmCheckTimestamp?: number;
}

export interface DailyDoseItem {
  medication: Medication;
  scheduledTime: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  log?: DoseLog;
  isPastDue: boolean;
  isUpcoming: boolean;
  minutesDifference: number;
}
