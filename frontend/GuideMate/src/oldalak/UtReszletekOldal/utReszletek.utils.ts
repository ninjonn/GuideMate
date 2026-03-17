export const parseMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatDuration = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} óra ${minutes} perc`;
  if (hours > 0) return `${hours} óra`;
  return `${minutes} perc`;
};

export const parseDateOnly = (dateStr: string) => {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export const calcDayCount = (start: string, end: string): number => {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  if (!startDate || !endDate) return 0;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

export const addDays = (start: string, days: number) => {
  const d = parseDateOnly(start);
  if (!d) return start;
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateOnly(d);
};

export const clampDay = (day: number, max: number) => {
  if (max <= 0) return 1;
  return Math.min(Math.max(day, 1), max);
};
