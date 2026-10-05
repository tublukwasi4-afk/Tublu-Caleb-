import React, { useState, useMemo } from 'react';
import { Medication, DoseLog } from '../types/medication';
import { calculateAdherenceStats } from '../utils/storage';
import { downloadMedicationCalendar } from '../utils/calendarExport';
import { downloadAdherenceCSV } from '../utils/csvExport';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Download, 
  Printer, 
  Flame, 
  TrendingUp, 
  Filter, 
  Clock, 
  FileText,
  RotateCcw,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface HistoryAnalyticsProps {
  medications: Medication[];
  logs: DoseLog[];
  onUndoDose: (medicationId: string, scheduledTime: string) => void;
  onOpenPrintModal: () => void;
  streakCount: number;
}

export const HistoryAnalytics: React.FC<HistoryAnalyticsProps> = ({
  medications,
  logs,
  onUndoDose,
  onOpenPrintModal,
  streakCount,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'taken' | 'skipped'>('all');
  const [selectedMedFilter, setSelectedMedFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const stats = useMemo(() => {
    return calculateAdherenceStats(logs, medications, 7);
  }, [logs, medications]);

  const stats30 = useMemo(() => {
    return calculateAdherenceStats(logs, medications, 30);
  }, [logs, medications]);

  // Sort logs in reverse chronological order
  const filteredLogs = useMemo(() => {
    return logs
      .filter(l => {
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        if (selectedMedFilter !== 'all' && l.medicationId !== selectedMedFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const dateTimeA = `${a.scheduledDate} ${a.scheduledTime}`;
        const dateTimeB = `${b.scheduledDate} ${b.scheduledTime}`;
        return dateTimeB.localeCompare(dateTimeA);
      });
  }, [logs, statusFilter, selectedMedFilter]);

  const getMedication = (medId: string) => {
    return medications.find(m => m.id === medId);
  };

  const handleDownloadCalendar = () => {
    downloadMedicationCalendar(medications);
  };

  const handleExportCSV = (exportAll: boolean = false) => {
    const logsToExport = exportAll ? logs : filteredLogs;
    if (logsToExport.length === 0) {
      setExportNotice('No logs available to export.');
      setTimeout(() => setExportNotice(null), 3500);
      return;
    }
    const filenamePrefix = exportAll ? 'all-adherence-logs' : 'filtered-adherence-logs';
    downloadAdherenceCSV(logsToExport, medications, filenamePrefix);
    setExportNotice(`Exported ${logsToExport.length} adherence logs to CSV for your healthcare provider.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Export CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Adherence & Dose History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit trail of taken doses, missed schedules, and healthcare reports
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleExportCSV(false)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
            title="Download CSV table of adherence logs to share with doctor"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Summary</span>
          </button>

          <button
            onClick={handleDownloadCalendar}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-teal-600/20 whitespace-nowrap"
            title="Download .ics file with automated daily recurring alarms for Google/Apple Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sync to Calendar (.ics)</span>
          </button>
        </div>
      </div>

      {/* CSV Export Confirmation Toast / Alert */}
      {exportNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-teal-700 hover:text-teal-900 text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 7-Day Adherence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>7-Day Adherence</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900 tabular-nums">
              {stats.adherenceRate}%
            </span>
            <span className="text-xs font-medium text-teal-700">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.totalTaken} of {stats.totalScheduled} scheduled doses taken
          </p>
        </div>

        {/* 30-Day Adherence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>30-Day Adherence</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900 tabular-nums">
              {stats30.adherenceRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats30.totalTaken} taken · {stats30.totalSkipped} skipped
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Consecutive Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900 tabular-nums">
              {streakCount}
            </span>
            <span className="text-xs text-slate-500">Days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Daily perfect adherence records
          </p>
        </div>

        {/* Total Tracked Logs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Recorded Entries</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900 tabular-nums">
              {logs.length}
            </span>
            <span className="text-xs text-slate-500">Doses</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Lifetime automated log history
          </p>
        </div>
      </div>

      {/* Log Feed Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-display text-slate-900">
              Dose Compliance Log
            </h3>
            <span className="text-xs text-slate-500">
              ({filteredLogs.length} entries)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Medicine */}
            <select
              value={selectedMedFilter}
              onChange={(e) => setSelectedMedFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="all">All Medicines</option>
              {medications.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('taken')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === 'taken' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                Taken
              </button>
              <button
                onClick={() => setStatusFilter('skipped')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === 'skipped' ? 'bg-white text-rose-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                Skipped
              </button>
            </div>

            {/* Quick CSV Export from table */}
            <button
              onClick={() => handleExportCSV(false)}
              className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap ml-1"
              title="Download CSV for these filtered entries"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV ({filteredLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Logs Table / List */}
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No compliance logs match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(log => {
              const med = getMedication(log.medicationId);
              const isTaken = log.status === 'taken';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isTaken ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isTaken ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {med ? med.name : 'Unknown Medication'}
                        </span>
                        {med && (
                          <span className="text-xs text-slate-500 font-medium">
                            {med.strength}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="font-mono text-slate-700">
                          {log.scheduledDate} · {log.scheduledTime}
                        </span>
                        {isTaken && log.takenAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              Logged at {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                        {!isTaken && log.skippedReason && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-700 font-medium">
                              Reason: {log.skippedReason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUndoDose(log.medicationId, log.scheduledTime)}
                      title="Undo or reset dose log"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Undo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
