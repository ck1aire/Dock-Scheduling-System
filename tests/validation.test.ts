import { describe, expect, it } from 'vitest';
import {
  datesOverlap,
  findConflicts,
  isVesselCompatible,
  validateReservation,
} from '../src/utils/validation';
import {
  daysInMonth,
  isValidDate,
  occupiedDays,
  shiftMonth,
} from '../src/utils/dates';
import { berths } from '../src/data/berths';
import { seedReservations } from '../src/data/seed';
import type { Reservation } from '../src/types';

const existing: Reservation = {
  id: 'existing',
  type: 'vessel',
  name: 'Research vessel',
  berthId: 'north-face',
  startDate: '2026-09-10',
  endDate: '2026-09-15',
  vesselLengthFt: 72,
};
const booking = (overrides: Partial<Reservation> = {}): Reservation => ({
  ...existing,
  id: 'new',
  ...overrides,
});

describe('inclusive overlap and conflicts', () => {
  it.each([
    ['2026-09-01', '2026-09-09', false],
    ['2026-09-01', '2026-09-10', true],
    ['2026-09-15', '2026-09-20', true],
    ['2026-09-16', '2026-09-20', false],
    ['2026-09-11', '2026-09-11', true],
    ['2026-09-01', '2026-09-30', true],
    ['2026-09-10', '2026-09-15', true],
  ])('handles %s through %s', (start, end, expected) => {
    expect(datesOverlap(start, end, existing.startDate, existing.endDate)).toBe(
      expected,
    );
  });
  it('allows overlapping dates on different berths', () => {
    expect(
      findConflicts(booking({ berthId: 'north-west' }), [existing]),
    ).toEqual([]);
  });
  it('includes events in conflicts', () => {
    expect(
      findConflicts(booking({ type: 'event', vesselLengthFt: undefined }), [
        existing,
      ]),
    ).toEqual([existing]);
    expect(
      findConflicts(booking(), [{ ...existing, type: 'event' }]),
    ).toHaveLength(1);
  });
  it('excludes itself on edit but detects a second reservation', () => {
    expect(findConflicts(existing, [existing])).toEqual([]);
    expect(findConflicts(existing, [existing, booking()])).toHaveLength(1);
  });
  it('detects an overlap crossing a year boundary', () => {
    expect(
      datesOverlap('2026-12-28', '2027-01-04', '2027-01-01', '2027-01-10'),
    ).toBe(true);
  });
});

describe('vessel fit and validation', () => {
  const berth = berths.find((b) => b.id === 'north-face')!;
  it('allows exact fits and rejects oversized or invalid lengths', () => {
    expect(isVesselCompatible(75, berth)).toBe(true);
    for (const length of [75.1, 0, -1, NaN, Infinity])
      expect(isVesselCompatible(length, berth)).toBe(false);
  });
  it('rejects invalid dates, reversed dates, missing names, berths and lengths', () => {
    expect(
      validateReservation(
        booking({
          name: ' ',
          berthId: '',
          startDate: '2026-02-30',
          vesselLengthFt: undefined,
        }),
        [],
        berths,
      ),
    ).toHaveProperty('name');
    expect(
      validateReservation(booking({ berthId: '' }), [], berths),
    ).toHaveProperty('berthId');
    expect(
      validateReservation(booking({ startDate: '2026-02-30' }), [], berths),
    ).toHaveProperty('startDate');
    expect(
      validateReservation(booking({ endDate: '2026-09-09' }), [], berths),
    ).toHaveProperty('endDate');
    expect(
      validateReservation(booking({ vesselLengthFt: undefined }), [], berths),
    ).toHaveProperty('vesselLengthFt');
    expect(
      validateReservation(booking({ vesselLengthFt: 76 }), [], berths).berthId,
    ).toContain('Vessel too long');
  });
  it('allows a single-day event without vessel length', () => {
    expect(
      validateReservation(
        booking({
          type: 'event',
          vesselLengthFt: undefined,
          endDate: '2026-09-10',
        }),
        [],
        berths,
      ),
    ).toEqual({});
  });
  it('names the conflicting reservation and dates', () => {
    const errors = validateReservation(booking(), [existing], berths);
    expect(errors.conflict).toContain('Research vessel');
    expect(errors.conflict).toContain('Sep 10, 2026');
    expect(errors.conflict).toContain('Sep 15, 2026');
  });
  it('has valid, nonoverlapping seed reservations', () => {
    for (const r of seedReservations)
      expect(validateReservation(r, seedReservations, berths)).toEqual({});
  });
});

describe('calendar date handling', () => {
  it('handles leap years and year changes', () => {
    expect(daysInMonth('2028-02-01')).toHaveLength(29);
    expect(daysInMonth('2026-02-01')).toHaveLength(28);
    expect(daysInMonth('9999-12-01')).toHaveLength(31);
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01');
    expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01');
    expect(isValidDate('2026-02-29')).toBe(false);
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('0000-01-01')).toBe(false);
  });
  it('counts occupied dates across daylight-saving boundaries', () => {
    expect(occupiedDays('2026-03-07', '2026-03-09')).toBe(3);
    expect(occupiedDays('2026-11-01', '2026-11-01')).toBe(1);
  });
});
