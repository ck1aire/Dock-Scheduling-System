import type { Berth } from '../types';

// Verified against the synthetic workbook's 2019 sheet, cells A9–A14.
export const berths: Berth[] = [
  { id: 'north-west', name: 'North Pier West', maxLengthFt: 410 },
  { id: 'north-face', name: 'North Pier Face', maxLengthFt: 75 },
  { id: 'north-east', name: 'North Pier East', maxLengthFt: 240 },
  { id: 'inner-channel', name: 'Inner Channel', maxLengthFt: 55 },
  { id: 'south-west', name: 'South Float West', maxLengthFt: 90 },
  { id: 'south-east', name: 'South Float East', maxLengthFt: 90 },
];
