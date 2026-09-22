import type { CSSProperties } from 'react';
import type { Reservation } from '../types';
import { berths } from '../data/berths';
import { dateLabel, daysInMonth, today } from '../utils/dates';
import Icon from './Icon';

interface Props {
  month: string;
  reservations: Reservation[];
  onSelect: (reservation: Reservation) => void;
  onCreate: (berthId: string, date: string) => void;
}

export default function ScheduleGrid({
  month,
  reservations,
  onSelect,
  onCreate,
}: Props) {
  const days = daysInMonth(month);
  const currentDay = today();
  const style = { '--days': days.length } as CSSProperties;
  const isWeekend = (date: string) =>
    [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

  return (
    <div
      className="calendar-scroll"
      role="region"
      aria-label={`${dateLabel(month, { month: 'long', year: 'numeric', day: undefined })} berth schedule. Scroll horizontally to see all dates.`}
      tabIndex={0}
    >
      <div className="calendar" style={style}>
        <div className="calendar-heading">
          <div className="berth-heading">
            <span>BERTH</span>
            <span>Maximum vessel length</span>
          </div>
          <div className="day-headings">
            {days.map((date) => (
              <div
                key={date}
                className={`day-heading ${isWeekend(date) ? 'weekend' : ''} ${date === currentDay ? 'is-today' : ''}`}
                aria-label={dateLabel(date)}
                aria-current={date === currentDay ? 'date' : undefined}
              >
                <span>
                  {dateLabel(date, {
                    weekday: 'short',
                    month: undefined,
                    year: undefined,
                    day: undefined,
                  }).slice(0, 1)}
                </span>
                <strong>{Number(date.slice(-2))}</strong>
              </div>
            ))}
          </div>
        </div>
        {berths.map((berth, index) => {
          const bookings = reservations.filter((r) => r.berthId === berth.id);
          return (
            <div className="berth-row" key={berth.id}>
              <div className="berth-label">
                <span className="berth-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{berth.name}</h3>
                  <p>
                    {berth.maxLengthFt} ft <span>max length</span>
                  </p>
                </div>
              </div>
              <div className="berth-days">
                {days.map((date) => {
                  const occupied = bookings.some(
                    (r) => r.startDate <= date && r.endDate >= date,
                  );
                  return (
                    <div
                      key={date}
                      className={`day-cell ${isWeekend(date) ? 'weekend' : ''} ${date === currentDay ? 'is-today' : ''}`}
                    >
                      {!occupied && (
                        <button
                          className="empty-cell"
                          onClick={() => onCreate(berth.id, date)}
                          aria-label={`New reservation at ${berth.name} on ${dateLabel(date)}`}
                        >
                          <span>+</span>
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="reservation-layer">
                  {bookings.map((reservation) => {
                    const start =
                      reservation.startDate < days[0]
                        ? 1
                        : Number(reservation.startDate.slice(-2));
                    const end =
                      reservation.endDate > days[days.length - 1]
                        ? days.length
                        : Number(reservation.endDate.slice(-2));
                    const continuesBefore = reservation.startDate < days[0];
                    const continuesAfter =
                      reservation.endDate > days[days.length - 1];
                    const label = `${reservation.type === 'event' ? 'Event' : 'Vessel'}: ${reservation.name}, ${dateLabel(reservation.startDate)} to ${dateLabel(reservation.endDate)}, ${berth.name}`;
                    return (
                      <button
                        key={reservation.id}
                        className={`reservation-bar ${reservation.type} ${end - start < 3 ? 'compact-bar' : ''} ${continuesBefore ? 'continues-before' : ''} ${continuesAfter ? 'continues-after' : ''}`}
                        style={{ gridColumn: `${start} / ${end + 1}` }}
                        onClick={() => onSelect(reservation)}
                        title={label}
                        aria-label={label}
                      >
                        <span className="bar-title">
                          <Icon
                            name={
                              reservation.type === 'event' ? 'event' : 'ship'
                            }
                            size={15}
                          />
                          <span>{reservation.name}</span>
                        </span>
                        <span className="bar-meta">
                          {reservation.type === 'event'
                            ? 'Event · Berth reserved'
                            : `Vessel · ${reservation.vesselLengthFt} ft`}
                          {continuesBefore || continuesAfter
                            ? ' · Continues'
                            : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
