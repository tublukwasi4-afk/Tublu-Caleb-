import React, { useState, useEffect } from 'react';
import { Medication, MedicationForm, FoodTiming, FrequencyType } from '../types/medication';
import { X, Plus, Trash2, Clock, Check, Utensils, Pill } from 'lucide-react';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: Partial<Medication>) => void;
  initialMedication?: Medication | null;
}

const COLOR_PALETTE = [
  { label: 'Teal', value: '#0d9488' },
  { label: 'Sky Blue', value: '#0284c7' },
  { label: 'Amber Gold', value: '#d97706' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Rose Pink', value: '#e11d48' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Slate Gray', value: '#475569' },
];

const MED_FORMS: { label: string; value: MedicationForm }[] = [
  { label: 'Tablet', value: 'tablet' },
  { label: 'Capsule', value: 'capsule' },
  { label: 'Liquid', value: 'liquid' },
  { label: 'Drops', value: 'drops' },
  { label: 'Inhaler', value: 'inhaler' },
  { label: 'Injection', value: 'injection' },
  { label: 'Patch', value: 'patch' },
  { label: 'Spray', value: 'spray' },
];

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMedication,
}) => {
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [color, setColor] = useState('#0d9488');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [foodTiming, setFoodTiming] = useState<FoodTiming>('with_food');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [instructions, setInstructions] = useState('');
  const [currentStock, setCurrentStock] = useState<number>(30);
  const [unit, setUnit] = useState('tablets');
  const [refillThreshold, setRefillThreshold] = useState<number>(7);
  const [prescriber, setPrescriber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name);
      setGenericName(initialMedication.genericName || '');
      setStrength(initialMedication.strength);
      setForm(initialMedication.form);
      setColor(initialMedication.color || '#0d9488');
      setFrequency(initialMedication.frequency);
      setTimes(initialMedication.times.length > 0 ? initialMedication.times : ['08:00']);
      setFoodTiming(initialMedication.foodTiming);
      setDaysOfWeek(initialMedication.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setInstructions(initialMedication.instructions || '');
      setCurrentStock(initialMedication.currentStock);
      setUnit(initialMedication.unit || 'tablets');
      setRefillThreshold(initialMedication.refillThreshold || 7);
      setPrescriber(initialMedication.prescriber || '');
    } else {
      // Defaults for new med
      setName('');
      setGenericName('');
      setStrength('');
      setForm('tablet');
      setColor('#0d9488');
      setFrequency('daily');
      setTimes(['08:00']);
      setFoodTiming('with_food');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setInstructions('');
      setCurrentStock(30);
      setUnit('tablets');
      setRefillThreshold(7);
      setPrescriber('');
    }
    setErrorMsg('');
  }, [initialMedication, isOpen]);

  if (!isOpen) return null;

  const handleAddTime = (timeVal: string = '12:00') => {
    if (!times.includes(timeVal)) {
      setTimes([...times, timeVal].sort());
    }
  };

  const handleRemoveTime = (index: number) => {
    if (times.length <= 1) return; // Keep at least one time
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated.sort());
  };

  const toggleDayOfWeek = (dayVal: number) => {
    if (daysOfWeek.includes(dayVal)) {
      if (daysOfWeek.length <= 1) return; // keep at least one
      setDaysOfWeek(daysOfWeek.filter(d => d !== dayVal));
    } else {
      setDaysOfWeek([...daysOfWeek, dayVal].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a medication name.');
      return;
    }
    if (!strength.trim()) {
      setErrorMsg('Please specify dosage strength (e.g. 500mg, 10ml).');
      return;
    }
    if (times.length === 0) {
      setErrorMsg('Please configure at least one daily reminder time.');
      return;
    }

    onSave({
      ...(initialMedication ? { id: initialMedication.id } : {}),
      name: name.trim(),
      genericName: genericName.trim() || undefined,
      strength: strength.trim(),
      form,
      color,
      frequency,
      times,
      foodTiming,
      daysOfWeek: frequency === 'specific_days' ? daysOfWeek : undefined,
      instructions: instructions.trim(),
      currentStock: Number(currentStock) || 0,
      unit,
      refillThreshold: Number(refillThreshold) || 7,
      refillReminderEnabled: true,
      active: true,
      prescriber: prescriber.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                {initialMedication ? 'Edit Medication' : 'Add New Medication'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure reminder alarms and supply tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Name & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin, Lisinopril"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Strength / Dosage *
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 500 mg, 10 ml, 2 puffs"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Generic Name & Prescriber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Generic or Brand Alias (Optional)
              </label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Glucophage, Prinivil"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Prescribing Doctor / Clinic
              </label>
              <input
                type="text"
                value={prescriber}
                onChange={(e) => setPrescriber(e.target.value)}
                placeholder="e.g. Dr. Sarah Mitchell"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Form & Color Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Dosage Form
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicationForm)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 capitalize"
              >
                {MED_FORMS.map(f => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Visual Color Accent
              </label>
              <div className="flex items-center gap-2 flex-wrap py-1">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Frequency & Days */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Frequency Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Daily', value: 'daily' },
                { label: 'Twice a day', value: 'twice_daily' },
                { label: 'Three times', value: 'three_times_daily' },
                { label: 'Specific days', value: 'specific_days' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const fVal = opt.value as FrequencyType;
                    setFrequency(fVal);
                    if (fVal === 'daily' && times.length === 0) setTimes(['08:00']);
                    if (fVal === 'twice_daily') setTimes(['08:00', '20:00']);
                    if (fVal === 'three_times_daily') setTimes(['08:00', '14:00', '20:00']);
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-colors ${
                    frequency === opt.value
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Days of week selector if specific_days */}
            {frequency === 'specific_days' && (
              <div className="flex items-center gap-1.5 pt-2">
                {DAYS_OF_WEEK.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(d.value)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      daysOfWeek.includes(d.value)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daily Reminder Times */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Reminder Alarm Times ({times.length})
              </label>
              <div className="flex items-center gap-1">
                {['08:00', '13:00', '19:30', '22:00'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddTime(preset)}
                    className="text-[11px] font-mono font-medium text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-2 py-0.5 rounded"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {times.map((time, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none flex-1"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meal / Food Instructions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Meal & Absorption Guidance
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'With Food / Meal', value: 'with_food' },
                { label: 'Before Meals (30m)', value: 'before_meal' },
                { label: 'After Meals', value: 'after_meal' },
                { label: 'Empty Stomach', value: 'empty_stomach' },
                { label: 'Anytime / With Water', value: 'anytime' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFoodTiming(opt.value as FoodTiming)}
                  className={`py-2 px-2.5 text-left text-xs font-medium rounded-xl border transition-colors ${
                    foodTiming === opt.value
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Tracking */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Refill & Inventory Automation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Unit Type
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="tablets, pills, ml"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Refill Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={refillThreshold}
                  onChange={(e) => setRefillThreshold(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Doctor Instructions or Special Notes
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Do not crush, drink with full glass of water, avoid grapefruit..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-xl shadow-sm shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{initialMedication ? 'Save Changes' : 'Create Medication'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
