export interface Berth {
  id: string;
  name: string;
  maxLengthFt: number;
}

export interface Reservation {
  id: string;
  type: 'vessel' | 'event';
  name: string;
  berthId: string;
  startDate: string;
  endDate: string;
  vesselLengthFt?: number;
  notes?: string;
}
