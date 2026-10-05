import React, { useRef } from 'react';
import { Medication } from '../types/medication';
import { X, Printer, Pill, Heart, AlertCircle } from 'lucide-react';

interface PrintableScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
}

export const PrintableScheduleModal: React.FC<PrintableScheduleModalProps> = ({
  isOpen,
  onClose,
  medications,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const activeMeds = medications.filter(m => m.active);

  const formatFoodInstruction = (timing: string) => {
    switch (timing) {
      case 'with_food': return 'With food / meal';
      case 'before_meal': return '30 min before eating';
      case 'after_meal': return '30 min after eating';
      case 'empty_stomach': return 'Empty stomach';
      default: return 'Anytime with water';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Controls (Not printed) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-bold text-slate-800">
              Printable Medical Schedule & Passport
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div ref={printRef} className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center text-white">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
                  Daily Medication Regimen
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Generated from DoseMate on {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-900">Patient Copy / Caregiver Record</p>
              <p>Keep this card in your wallet or on your refrigerator</p>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3">Medication & Strength</th>
                  <th className="py-2.5 px-3">Form</th>
                  <th className="py-2.5 px-3">Daily Times</th>
                  <th className="py-2.5 px-3">Meal / Food Instructions</th>
                  <th className="py-2.5 px-3">Prescriber / Special Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeMeds.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-teal-800 font-medium">{med.strength}</p>
                      {med.genericName && (
                        <p className="text-[10px] text-slate-400">Generic: {med.genericName}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-600">
                      {med.form}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {med.times.join(', ')}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {formatFoodInstruction(med.foodTiming)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <p>{med.instructions || 'As prescribed'}</p>
                      {med.prescriber && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Dr: {med.prescriber}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Emergency & Doctor Notes footer */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="font-bold text-slate-800 mb-1">Emergency & Caregiver Contact</p>
              <p className="text-slate-500">Name: ________________________________</p>
              <p className="text-slate-500 mt-1">Phone: _______________________________</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="font-bold text-slate-800 mb-1">Allergies / Special Warnings</p>
              <p className="text-slate-500">No known drug allergies reported. Report adverse side-effects to your healthcare provider immediately.</p>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center pt-2">
            This schedule is for informational support and does not replace medical advice from your licensed physician.
          </p>
        </div>
      </div>
    </div>
  );
};
