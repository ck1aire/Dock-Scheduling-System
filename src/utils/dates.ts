// Calendar dates stay as YYYY-MM-DD strings. UTC is used only for calendar math.
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateLabel(
  value: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export function monthStart(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

export function shiftMonth(value: string, amount: number): string {
  const date = new Date(`${monthStart(value)}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 10);
}

export function daysInMonth(value: string): string[] {
  const next = new Date(`${monthStart(value)}T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(0);
  return Array.from(
    { length: next.getUTCDate() },
    (_, i) => `${value.slice(0, 7)}-${String(i + 1).padStart(2, '0')}`,
  );
}

export function occupiedDays(start: string, end: string): number {
  return (
    Math.round(
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
        86400000,
    ) + 1
  );
}
