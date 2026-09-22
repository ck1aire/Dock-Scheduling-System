import type { Reservation } from '../types';
import { berths } from '../data/berths';
import { dateLabel } from '../utils/dates';
import Icon from './Icon';

export default function ReservationList({
  reservations,
  onSelect,
}: {
  reservations: Reservation[];
  onSelect: (r: Reservation) => void;
}) {
  if (!reservations.length)
    return (
      <div className="empty-state">
        <Icon name="search" size={28} />
        <h3>No reservations found</h3>
        <p>Try another name or create a new reservation.</p>
      </div>
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Reservation</th>
            <th scope="col">Berth</th>
            <th scope="col">Occupied dates</th>
            <th scope="col">Length / capacity</th>
            <th scope="col">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...reservations]
            .sort(
              (a, b) =>
                a.startDate.localeCompare(b.startDate) ||
                a.name.localeCompare(b.name),
            )
            .map((r) => {
              const berth = berths.find((b) => b.id === r.berthId)!;
              return (
                <tr key={r.id}>
                  <td>
                    <button
                      className="table-reservation"
                      onClick={() => onSelect(r)}
                    >
                      <span className={`type-icon ${r.type}`}>
                        <Icon name={r.type === 'event' ? 'event' : 'ship'} />
                      </span>
                      <span>
                        <strong>{r.name}</strong>
                        <small>{r.type === 'event' ? 'Event' : 'Vessel'}</small>
                      </span>
                    </button>
                  </td>
                  <td>{berth.name}</td>
                  <td>
                    {dateLabel(r.startDate)}
                    <span className="date-separator"> — </span>
                    {dateLabel(r.endDate)}
                  </td>
                  <td>
                    {r.type === 'vessel'
                      ? `${r.vesselLengthFt} / ${berth.maxLengthFt} ft`
                      : 'Length not applicable'}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => onSelect(r)}
                      aria-label={`View ${r.name}`}
                    >
                      <Icon name="arrow" />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
