import { Medication } from '../types/medication';

function pad(num: number): string {
  return num < 10 ? '0' + num : '' + num;
}

function formatICSDate(date: Date): string {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

export function generateICSMedicationCalendar(medications: Medication[]): string {
  const activeMeds = medications.filter(m => m.active);
  const now = new Date();
  const dtStamp = formatICSDate(now);

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DoseMate//Automated Medicine Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:DoseMate Medicine Reminders',
    'X-WR-TIMEZONE:UTC',
  ];

  activeMeds.forEach(med => {
    med.times.forEach((timeStr, idx) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Start today at specified time
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + 15 * 60000); // 15 min duration

      const uid = `dosemate-${med.id}-${timeStr.replace(':', '')}-${idx}@dosemate.app`;
      const summary = `💊 Take ${med.name} (${med.strength})`;
      const description = `Medicine: ${med.name}\\nDosage: ${med.strength} (${med.form})\\nInstructions: ${med.instructions || 'Take as prescribed'}\\nTiming: ${med.foodTiming.replace('_', ' ')}\\nAuto-synced from DoseMate`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        'RRULE:FREQ=DAILY',
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Time to take your medication',
        'TRIGGER:-PT0M', // Trigger at exact time
        'END:VALARM',
        'END:VEVENT'
      );
    });
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

export function downloadMedicationCalendar(medications: Medication[]): void {
  const icsData = generateICSMedicationCalendar(medications);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'dosemate-daily-schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
