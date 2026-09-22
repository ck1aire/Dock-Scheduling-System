import type { Reservation } from '../types';
import { berths } from '../data/berths';
import { seedReservations } from '../data/seed';
import { validateReservation } from './validation';

export const STORAGE_KEY = 'harbor-scheduler:v1';
export interface StorageResult {
  reservations: Reservation[];
  warning?: string;
}

function isReservation(value: unknown): value is Reservation {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    (r.type === 'vessel' || r.type === 'event') &&
    typeof r.name === 'string' &&
    typeof r.berthId === 'string' &&
    typeof r.startDate === 'string' &&
    typeof r.endDate === 'string' &&
    (r.notes === undefined || typeof r.notes === 'string') &&
    (r.vesselLengthFt === undefined || typeof r.vesselLengthFt === 'number')
  );
}

export function loadReservations(): StorageResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null)
      return { reservations: structuredClone(seedReservations) };
    const data: unknown = JSON.parse(raw);
    if (
      !Array.isArray(data) ||
      !data.every(isReservation) ||
      new Set(data.map((r) => r.id)).size !== data.length ||
      data.some(
        (r) => Object.keys(validateReservation(r, data, berths)).length > 0,
      )
    )
      throw new Error('Invalid saved data');
    return { reservations: data };
  } catch {
    return {
      reservations: structuredClone(seedReservations),
      warning:
        'Saved data could not be loaded. Showing demo data in memory; your saved data has not been overwritten. Reset Demo Data to restore storage, or make a change to save this schedule.',
    };
  }
}

export function saveReservations(
  reservations: Reservation[],
): string | undefined {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    return undefined;
  } catch {
    return 'Changes are visible for this session but could not be saved to this browser. They may be lost on refresh.';
  }
}
