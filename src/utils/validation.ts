import type { Berth, Reservation } from '../types';
import { dateLabel, isValidDate } from './dates';

export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA <= endB && startB <= endA;
}

export function findConflicts(
  candidate: Reservation,
  reservations: Reservation[],
): Reservation[] {
  return reservations.filter(
    (existing) =>
      existing.id !== candidate.id &&
      existing.berthId === candidate.berthId &&
      datesOverlap(
        candidate.startDate,
        candidate.endDate,
        existing.startDate,
        existing.endDate,
      ),
  );
}

export function isVesselCompatible(length: number, berth: Berth): boolean {
  return Number.isFinite(length) && length > 0 && length <= berth.maxLengthFt;
}

export type ValidationErrors = Partial<
  Record<
    | 'name'
    | 'vesselLengthFt'
    | 'startDate'
    | 'endDate'
    | 'berthId'
    | 'conflict',
    string
  >
>;

export function validateReservation(
  reservation: Reservation,
  reservations: Reservation[],
  berths: Berth[],
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!reservation.name.trim()) errors.name = 'Enter a reservation name.';
  if (!isValidDate(reservation.startDate))
    errors.startDate = 'Enter a valid start date.';
  if (!isValidDate(reservation.endDate))
    errors.endDate = 'Enter a valid end date.';
  if (
    !errors.startDate &&
    !errors.endDate &&
    reservation.endDate < reservation.startDate
  )
    errors.endDate = 'End date must be on or after the start date.';
  const berth = berths.find((item) => item.id === reservation.berthId);
  if (!berth) errors.berthId = 'Select a berth.';
  if (reservation.type === 'vessel') {
    const length = reservation.vesselLengthFt;
    if (length === undefined || !Number.isFinite(length) || length <= 0)
      errors.vesselLengthFt = 'Enter a vessel length greater than zero.';
    else if (berth && !isVesselCompatible(length, berth))
      errors.berthId = `Vessel too long: ${length} ft exceeds ${berth.name}’s ${berth.maxLengthFt} ft maximum.`;
  }
  if (berth && !errors.startDate && !errors.endDate) {
    const conflicts = findConflicts(reservation, reservations);
    if (conflicts.length)
      errors.conflict = `This berth is occupied by ${conflicts.map((item) => `${item.name} (${dateLabel(item.startDate)} – ${dateLabel(item.endDate)})`).join('; ')}. Choose another berth or change the dates.`;
  }
  return errors;
}
