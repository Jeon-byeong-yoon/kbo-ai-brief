/** 'YYYY-MM-DD' */
export type DateString = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function formatDate(d: Date): DateString {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayString(): DateString {
  return formatDate(new Date());
}

export function addDays(date: DateString, delta: number): DateString {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return formatDate(d);
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** '2026.09.16 (수)' */
export function formatDateLabel(date: DateString): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return `${date.replace(/-/g, '.')} (${WEEKDAYS[d.getDay()]})`;
}
