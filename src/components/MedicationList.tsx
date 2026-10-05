import React, { useState, useMemo } from 'react';
import { Medication } from '../types/medication';
import { MedicationVisual } from './MedicationVisual';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Pause, 
  Play, 
  AlertCircle, 
  Clock, 
  PackagePlus, 
  Check, 
  Utensils, 
  FileText,
  UserCheck
} from 'lucide-react';

interface MedicationListProps {
  medications: Medication[];
  onOpenAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onToggleActive: (id: string) => void;
  onDeleteMedication: (id: string) => void;
  onRestock: (id: string, amount: number) => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  onOpenAddMedication,
  onEditMedication,
  onToggleActive,
  onDeleteMedication,
  onRestock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'low_stock' | 'paused'>('all');
  const [restockModalMed, setRestockModalMed] = useState<Medication | null>(null);
  const [restockQty, setRestockQty] = useState(30);

  const filteredMeds = useMemo(() => {
    return medications.filter(med => {
      // Search matching
      const matchesSearch = 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.genericName && med.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        med.strength.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'active') return med.active;
      if (filterMode === 'paused') return !med.active;
      if (filterMode === 'low_stock') return med.currentStock <= med.refillThreshold;

      return true;
    });
  }, [medications, searchQuery, filterMode]);

  const lowStockCount = useMemo(() => {
    return medications.filter(m => m.active && m.currentStock <= m.refillThreshold).length;
  }, [medications]);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header with Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            My Medications
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {medications.length} active prescriptions & supplements tracked
          </p>
        </div>

        <button
          onClick={onOpenAddMedication}
          className="h-11 px-5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {lowStockCount} {lowStockCount === 1 ? 'medication needs' : 'medications need'} a refill soon
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Supply has dropped below your scheduled safety threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterMode('low_stock')}
            className="text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            View Low Stock
          </button>
        </div>
      )}

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, generic, or strength..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({medications.length})
          </button>
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'active'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({medications.filter(m => m.active).length})
          </button>
          <button
            onClick={() => setFilterMode('low_stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'low_stock'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Low Refill ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterMode('paused')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'paused'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Paused ({medications.filter(m => !m.active).length})
          </button>
        </div>
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeds.map(med => {
          const isLowStock = med.currentStock <= med.refillThreshold;

          return (
            <div
              key={med.id}
              className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                !med.active
                  ? 'opacity-60 border-dashed border-slate-300'
                  : isLowStock
                  ? 'border-amber-300 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow'
              }`}
            >
              <div>
                {/* Top Row: Visual + Title + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <MedicationVisual form={med.form} color={med.color} size="md" />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {med.name}
                      </h3>
                      <p className="text-xs font-semibold text-teal-700">
                        {med.strength} · <span className="capitalize">{med.form}</span>
                      </p>
                      {med.genericName && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {med.genericName}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleActive(med.id)}
                    title={med.active ? 'Pause reminders' : 'Resume reminders'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      med.active
                        ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                        : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {med.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Scheduled Times */}
                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Scheduled:
                  </span>
                  {med.times.map(time => (
                    <span
                      key={time}
                      className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      {time}
                    </span>
                  ))}
                </div>

                {/* Food & Instruction */}
                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{formatFoodInstruction(med.foodTiming)}</span>
                  </div>
                  {med.instructions && (
                    <p className="text-slate-500 text-[11px] line-clamp-2 pl-5">
                      {med.instructions}
                    </p>
                  )}
                  {med.prescriber && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-5 pt-0.5">
                      <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{med.prescriber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Stock Tracker & Actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
                {/* Stock Level Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      Supply Inventory
                    </span>
                    <span className={`font-mono font-semibold tabular-nums ${isLowStock ? 'text-amber-700' : 'text-slate-700'}`}>
                      {med.currentStock} {med.unit}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLowStock ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (med.currentStock / (med.refillThreshold * 3)) * 100))}%`,
                      }}
                    />
                  </div>

                  {isLowStock && (
                    <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Refill needed soon
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      setRestockModalMed(med);
                      setRestockQty(30);
                    }}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditMedication(med)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit medication"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMedication(med.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMeds.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <p className="text-base font-bold text-slate-800">No medications found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or filter mode.</p>
        </div>
      )}

      {/* Restock Quick Modal */}
      {restockModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Restock {restockModalMed.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current stock: <strong className="font-mono text-slate-700">{restockModalMed.currentStock} {restockModalMed.unit}</strong>. How many units are you adding?
            </p>

            <div className="flex items-center gap-2">
              {[15, 30, 60, 90].map(qty => (
                <button
                  key={qty}
                  onClick={() => setRestockQty(qty)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    restockQty === qty
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500">Custom Amount</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRestockModalMed(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRestock(restockModalMed.id, restockQty);
                  setRestockModalMed(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Confirm Restock (+{restockQty})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
