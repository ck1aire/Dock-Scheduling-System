import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadReservations,
  saveReservations,
  STORAGE_KEY,
} from '../src/utils/storage';
import { seedReservations } from '../src/data/seed';

describe('localStorage persistence', () => {
  let data: Map<string, string>;
  beforeEach(() => {
    data = new Map();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => data.set(key, value),
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('loads demo data only when no saved state exists', () => {
    expect(loadReservations().reservations).toEqual(seedReservations);
    expect(saveReservations([])).toBeUndefined();
    expect(loadReservations().reservations).toEqual([]);
  });
  it('round-trips edits', () => {
    const changed = [{ ...seedReservations[0], notes: 'Updated note' }];
    saveReservations(changed);
    expect(loadReservations().reservations).toEqual(changed);
  });
  it.each([
    '{broken',
    '{}',
    '[null]',
    JSON.stringify([{ ...seedReservations[0], berthId: 'unknown' }]),
    JSON.stringify([seedReservations[0], seedReservations[0]]),
  ])('recovers from invalid saved data without overwriting it', (raw) => {
    data.set(STORAGE_KEY, raw);
    expect(loadReservations().warning).toBeTruthy();
    expect(loadReservations().reservations).toEqual(seedReservations);
    expect(data.get(STORAGE_KEY)).toBe(raw);
  });
  it('rejects stored overlaps and oversized vessels', () => {
    data.set(
      STORAGE_KEY,
      JSON.stringify([
        seedReservations[0],
        { ...seedReservations[0], id: 'duplicate-dates' },
      ]),
    );
    expect(loadReservations().warning).toBeTruthy();
    data.set(
      STORAGE_KEY,
      JSON.stringify([{ ...seedReservations[0], vesselLengthFt: 500 }]),
    );
    expect(loadReservations().warning).toBeTruthy();
  });
  it('reports unavailable storage without throwing', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new Error('Storage disabled');
      },
    });
    expect(loadReservations().warning).toBeTruthy();
    expect(saveReservations(seedReservations)).toContain('could not be saved');
  });
});
