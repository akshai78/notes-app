const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function startOfDay(date = new Date()): number {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

export function startOfWeek(date = new Date()): number {
  const next = new Date(date);
  const day = next.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  return startOfDay(next) - mondayOffset * 86_400_000;
}

export function startOfMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

export function matchesFilter(timestamp: number, filter: 'today' | 'week' | 'month' | 'all'): boolean {
  if (filter === 'all') return true;
  if (filter === 'today') return timestamp >= startOfDay();
  if (filter === 'week') return timestamp >= startOfWeek();
  return timestamp >= startOfMonth();
}

export function formatCardDate(timestamp: number): string {
  const date = new Date(timestamp);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function formatTimeDay(timestamp: number): string {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}, ${WEEKDAYS[date.getDay()]}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortMonth(date: Date): string {
  return MONTHS[date.getMonth()].slice(0, 3);
}

export function sameDay(a: number, b: number): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function toDateKey(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return toDateKey(Date.now());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return startOfDay();
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return startOfDay(new Date(year, month - 1, day));
}

export function noteCalendarDay(note: { datedAt?: number; createdAt: number; updatedAt: number }): number {
  return startOfDay(new Date(note.datedAt ?? note.createdAt ?? note.updatedAt));
}

export function formatDayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
