import { Medication, DoseLog } from '../types/medication';

function escapeCSVValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const stringVal = String(val);
  // If the value contains quotes, commas, or newlines, escape quotes by doubling them
  return `"${stringVal.replace(/"/g, '""')}"`;
}

export function generateAdherenceCSV(logs: DoseLog[], medications: Medication[]): string {
  const medMap = new Map<string, Medication>();
  medications.forEach(m => medMap.set(m.id, m));

  const headers = [
    'Date',
    'Scheduled Time',
    'Medication Name',
    'Generic Name',
    'Strength / Dosage',
    'Form',
    'Adherence Status',
    'Time Taken',
    'Skip Reason',
    'Meal / Food Guidance',
    'Prescribing Doctor',
    'Instructions & Notes',
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeCSVValue).join(','));

  // Sort chronologically reverse
  const sorted = [...logs].sort((a, b) => {
    const dateTimeA = `${a.scheduledDate} ${a.scheduledTime}`;
    const dateTimeB = `${b.scheduledDate} ${b.scheduledTime}`;
    return dateTimeB.localeCompare(dateTimeA);
  });

  sorted.forEach(log => {
    const med = medMap.get(log.medicationId);
    const medName = med ? med.name : 'Unknown Medication';
    const genericName = med?.genericName || '';
    const strength = med?.strength || '';
    const form = med?.form || '';
    const status = log.status.charAt(0).toUpperCase() + log.status.slice(1);
    const takenTime = log.takenAt ? new Date(log.takenAt).toLocaleString() : '';
    const skipReason = log.skippedReason || '';
    const foodTiming = med ? med.foodTiming.replace('_', ' ') : '';
    const prescriber = med?.prescriber || '';
    const instructions = med?.instructions || '';

    const row = [
      escapeCSVValue(log.scheduledDate),
      escapeCSVValue(log.scheduledTime),
      escapeCSVValue(medName),
      escapeCSVValue(genericName),
      escapeCSVValue(strength),
      escapeCSVValue(form),
      escapeCSVValue(status),
      escapeCSVValue(takenTime),
      escapeCSVValue(skipReason),
      escapeCSVValue(foodTiming),
      escapeCSVValue(prescriber),
      escapeCSVValue(instructions),
    ];

    rows.push(row.join(','));
  });

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel renders special characters properly
  return '\uFEFF' + rows.join('\r\n');
}

export function downloadAdherenceCSV(logs: DoseLog[], medications: Medication[], filenamePrefix: string = 'adherence-report'): void {
  const csvContent = generateAdherenceCSV(logs, medications);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `dosemate-${filenamePrefix}-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
