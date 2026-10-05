import React, { useState, useMemo } from 'react';
import { Medication, DoseLog, DailyDoseItem } from '../types/medication';
import { MedicationVisual } from './MedicationVisual';
import { 
  Check, 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Utensils, 
  Sun, 
  Sunset, 
  Moon, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';

interface TodayScheduleProps {
  medications: Medication[];
  logs: DoseLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onTakeDose: (medicationId: string, scheduledTime: string) => void;
  onUndoDose: (medicationId: string, scheduledTime: string) => void;
  onSnoozeDose: (medicationId: string, scheduledTime: string, minutes: number) => void;
  onSkipDose: (medicationId: string, scheduledTime: string, reason: string) => void;
  onOpenAddMedication: () => void;
  streakCount: number;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  medications,
  logs,
  selectedDate,
  onSelectDate,
  onTakeDose,
  onUndoDose,
  onSnoozeDose,
  onSkipDose,
  onOpenAddMedication,
  streakCount,
}) => {
  const [activeSlotFilter, setActiveSlotFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');
  const [skippingDoseId, setSkippingDoseId] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const isToday = selectedDate === todayStr;

  // Generate 7 days centered around selected date
  const dateNavItems = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({ iso, dayName, dayNum, isToday: iso === todayStr });
    }
    return list;
  }, [todayStr]);

  // Compute scheduled items for selected date
  const dailyItems = useMemo(() => {
    const activeMeds = medications.filter(m => m.active);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const items: DailyDoseItem[] = [];

    activeMeds.forEach(med => {
      // Filter specific days
      if (med.frequency === 'specific_days' && med.daysOfWeek && med.daysOfWeek.length > 0) {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const dayOfWeek = new Date(y, m - 1, d).getDay();
        if (!med.daysOfWeek.includes(dayOfWeek)) return;
      }

      med.times.forEach(time => {
        const [h, min] = time.split(':').map(Number);
        const scheduledMinutes = h * 60 + min;

        const log = logs.find(
          l => l.medicationId === med.id && l.scheduledDate === selectedDate && l.scheduledTime === time
        );

        let timeSlot: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
        if (h >= 5 && h < 12) timeSlot = 'morning';
        else if (h >= 12 && h < 17) timeSlot = 'afternoon';
        else if (h >= 17 && h < 21) timeSlot = 'evening';
        else timeSlot = 'night';

        const minutesDiff = scheduledMinutes - currentMinutes;
        const isPastDue = isToday ? minutesDiff < 0 && (!log || log.status === 'pending') : selectedDate < todayStr && (!log || log.status === 'pending');
        const isUpcoming = isToday && minutesDiff >= 0 && minutesDiff <= 60 && (!log || log.status === 'pending');

        items.push({
          medication: med,
          scheduledTime: time,
          timeSlot,
          log,
          isPastDue,
          isUpcoming,
          minutesDifference: minutesDiff,
        });
      });
    });

    return items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [medications, logs, selectedDate, isToday, todayStr]);

  // Stats calculation
  const totalCount = dailyItems.length;
  const takenCount = dailyItems.filter(i => i.log?.status === 'taken').length;
  const skippedCount = dailyItems.filter(i => i.log?.status === 'skipped').length;
  const pendingCount = totalCount - takenCount - skippedCount;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  // Next upcoming dose
  const nextDose = useMemo(() => {
    if (!isToday) return null;
    return dailyItems.find(i => (!i.log || i.log.status === 'pending') && i.minutesDifference >= 0);
  }, [dailyItems, isToday]);

  const filteredItems = useMemo(() => {
    if (activeSlotFilter === 'all') return dailyItems;
    return dailyItems.filter(i => i.timeSlot === activeSlotFilter);
  }, [dailyItems, activeSlotFilter]);

  const formatFoodInstruction = (timing: string) => {
    switch (timing) {
      case 'with_food': return 'With food';
      case 'before_meal': return 'Before meal';
      case 'after_meal': return 'After meal';
      case 'empty_stomach': return 'Empty stomach';
      default: return 'Anytime';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Date Navigation & Calendar Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold font-display text-slate-900">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h2>
            {isToday && (
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="text-xs font-mono text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {!isToday && (
              <button
                onClick={() => onSelectDate(todayStr)}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Jump to Today
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Carousel Buttons */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {dateNavItems.map(item => {
            const isSelected = item.iso === selectedDate;
            return (
              <button
                key={item.iso}
                onClick={() => onSelectDate(item.iso)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-semibold scale-[1.02]'
                    : item.isToday
                    ? 'bg-teal-50/80 text-teal-900 border border-teal-200 hover:bg-teal-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider font-medium opacity-80">
                  {item.dayName}
                </span>
                <span className="text-base sm:text-lg font-bold font-mono mt-0.5">
                  {item.dayNum}
                </span>
                {item.isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Next Dose Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adherence Gauge */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Today's Completion</span>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {takenCount} of {totalCount} doses
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-teal-700 font-bold">{progressPercent}% Adherence</span>
              {pendingCount > 0 ? (
                <span className="text-amber-700">{pendingCount} remaining</span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All complete!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Adherence Streak
            </p>
            <p className="text-2xl font-bold font-display text-slate-900">
              {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep it up for optimal health outcomes
            </p>
          </div>
        </div>

        {/* Next Scheduled Alarm */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Next Up Today
            </p>
            {nextDose ? (
              <>
                <p className="text-base font-bold text-slate-900 truncate">
                  {nextDose.medication.name}
                </p>
                <p className="text-xs text-teal-700 font-medium">
                  {nextDose.scheduledTime} · in {nextDose.minutesDifference} min
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-800">
                  No pending doses
                </p>
                <p className="text-xs text-slate-400">
                  All scheduled meds recorded
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs by Time Slot */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveSlotFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSlotFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Doses ({dailyItems.length})
          </button>
          <button
            onClick={() => setActiveSlotFilter('morning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSlotFilter === 'morning'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Morning
          </button>
          <button
            onClick={() => setActiveSlotFilter('afternoon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSlotFilter === 'afternoon'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-orange-500" />
            Afternoon
          </button>
          <button
            onClick={() => setActiveSlotFilter('evening')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSlotFilter === 'evening'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-indigo-500" />
            Evening
          </button>
          <button
            onClick={() => setActiveSlotFilter('night')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSlotFilter === 'night'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-violet-500" />
            Bedtime
          </button>
        </div>

        <span className="hidden sm:block text-xs text-slate-500">
          Auto-reminds at exact dose time
        </span>
      </div>

      {/* Doses Feed */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No medications scheduled</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              There are no medicines configured for this specific time or day.
            </p>
          </div>
          <button
            onClick={onOpenAddMedication}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 shadow-sm shadow-teal-600/20"
          >
            + Add New Medication
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map(item => {
            const isTaken = item.log?.status === 'taken';
            const isSkipped = item.log?.status === 'skipped';
            const isPending = !isTaken && !isSkipped;
            const uniqueKey = `${item.medication.id}-${item.scheduledTime}`;

            return (
              <div
                key={uniqueKey}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                  isTaken
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : item.isPastDue
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Pill visual + Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <MedicationVisual
                      form={item.medication.form}
                      color={item.medication.color}
                      size="md"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {item.medication.name}
                        </h4>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.medication.strength}
                        </span>
                        {item.isPastDue && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Due earlier
                          </span>
                        )}
                      </div>

                      {/* Instructions and food timing */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          {formatFoodInstruction(item.medication.foodTiming)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {item.medication.currentStock} {item.medication.unit} left
                        </span>
                        {item.medication.instructions && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-600 truncate max-w-xs">
                              {item.medication.instructions}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scheduled time & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.scheduledTime}</span>
                      </div>
                    </div>

                    {isTaken ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Taken</span>
                          {item.log?.takenAt && (
                            <span className="text-[11px] font-mono text-emerald-800 ml-1">
                              {new Date(item.log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onUndoDose(item.medication.id, item.scheduledTime)}
                          title="Undo dose log"
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isSkipped ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
                          <XCircle className="w-4 h-4 text-slate-500" />
                          <span>Skipped {item.log?.skippedReason ? `(${item.log.skippedReason})` : ''}</span>
                        </div>
                        <button
                          onClick={() => onUndoDose(item.medication.id, item.scheduledTime)}
                          title="Undo skip"
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTakeDose(item.medication.id, item.scheduledTime)}
                          className="h-10 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Mark Taken</span>
                        </button>

                        <button
                          onClick={() => onSnoozeDose(item.medication.id, item.scheduledTime, 10)}
                          className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors"
                          title="Snooze 10 minutes"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">10m</span>
                        </button>

                        <button
                          onClick={() => setSkippingDoseId(skippingDoseId === uniqueKey ? null : uniqueKey)}
                          className="h-10 px-3 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 text-xs font-medium rounded-xl transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Skip Drawer */}
                {skippingDoseId === uniqueKey && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap animate-in fade-in duration-150">
                    <span className="text-xs font-semibold text-slate-700">Reason:</span>
                    {['Took earlier', 'Felt unwell', 'Doctor paused', 'Out of stock'].map(reason => (
                      <button
                        key={reason}
                        onClick={() => {
                          onSkipDose(item.medication.id, item.scheduledTime, reason);
                          setSkippingDoseId(null);
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-rose-100 hover:text-rose-800 text-slate-700 rounded-md transition-colors"
                      >
                        {reason}
                      </button>
                    ))}
                    <button
                      onClick={() => setSkippingDoseId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
