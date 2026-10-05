import React, { useState } from 'react';
import { Medication, DoseLog } from '../types/medication';
import { MedicationVisual } from './MedicationVisual';
import { Bell, Check, Clock, X, AlertCircle, Utensils, Droplets } from 'lucide-react';

interface ActiveReminderModalProps {
  medication: Medication;
  scheduledTime: string;
  onTakeDose: (medicationId: string, scheduledTime: string) => void;
  onSnoozeDose: (medicationId: string, scheduledTime: string, minutes: number) => void;
  onSkipDose: (medicationId: string, scheduledTime: string, reason: string) => void;
  onDismiss: () => void;
  snoozeMinutes?: number;
}

export const ActiveReminderModal: React.FC<ActiveReminderModalProps> = ({
  medication,
  scheduledTime,
  onTakeDose,
  onSnoozeDose,
  onSkipDose,
  onDismiss,
  snoozeMinutes = 10,
}) => {
  const [showSkipReasons, setShowSkipReasons] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const skipReasons = [
    'Already took it earlier',
    'Felt nauseous / unwell',
    'Doctor advised to pause',
    'Ran out of supply',
    'Traveling without dose',
  ];

  const formatFoodInstruction = (timing: string) => {
    switch (timing) {
      case 'with_food':
        return 'Take with food or a meal';
      case 'before_meal':
        return 'Take 30 minutes before eating';
      case 'after_meal':
        return 'Take 30 minutes after eating';
      case 'empty_stomach':
        return 'Take on an empty stomach with water';
      default:
        return 'Take with a glass of water';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-100 transition-transform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-teal-100">
                Automated Dose Alarm
              </p>
              <h2 id="reminder-title" className="text-lg font-bold font-display leading-tight">
                Time for your medicine
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <MedicationVisual form={medication.form} color={medication.color} size="lg" />
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 truncate">
                {medication.name}
              </h3>
              <p className="text-sm font-medium text-teal-700">
                {medication.strength} · <span className="capitalize">{medication.form}</span>
              </p>
              {medication.genericName && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Generic: {medication.genericName}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {scheduledTime}
              </span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{formatFoodInstruction(medication.foodTiming)}</span>
            </div>
            {medication.instructions && (
              <p className="text-slate-600 pl-6 leading-relaxed">
                {medication.instructions}
              </p>
            )}
            {medication.currentStock <= medication.refillThreshold && (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium pl-6 pt-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Low stock: Only {medication.currentStock} {medication.unit} left</span>
              </div>
            )}
          </div>

          {/* Skip Reasons Drawer */}
          {showSkipReasons && (
            <div className="mt-4 p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <p className="text-xs font-semibold text-rose-800 mb-2">
                Why are you skipping this dose?
              </p>
              <div className="space-y-1.5">
                {skipReasons.map(reason => (
                  <button
                    key={reason}
                    onClick={() => {
                      onSkipDose(medication.id, scheduledTime, reason);
                      setShowSkipReasons(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-rose-100 hover:text-rose-900 border border-rose-200/60 rounded-md transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => onTakeDose(medication.id, scheduledTime)}
              className="w-full sm:flex-1 h-12 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Take Dose Now</span>
            </button>

            <button
              onClick={() => onSnoozeDose(medication.id, scheduledTime, snoozeMinutes)}
              className="w-full sm:w-auto px-4 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze {snoozeMinutes}m</span>
            </button>

            <button
              onClick={() => setShowSkipReasons(!showSkipReasons)}
              className="w-full sm:w-auto px-3.5 h-12 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 font-medium text-xs flex items-center justify-center transition-colors whitespace-nowrap"
            >
              Skip
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Dose will be recorded and inventory updated automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
