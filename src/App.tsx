import { useState } from 'react';
import type { Reservation } from './types';
import { berths } from './data/berths';
import { DEMO_MONTH, seedReservations } from './data/seed';
import {
  dateLabel,
  daysInMonth,
  monthStart,
  shiftMonth,
  today,
} from './utils/dates';
import { datesOverlap, validateReservation } from './utils/validation';
import { loadReservations, saveReservations } from './utils/storage';
import Icon from './components/Icon';
import ScheduleGrid from './components/ScheduleGrid';
import ReservationList from './components/ReservationList';
import ReservationDetails from './components/ReservationDetails';
import ReservationForm from './components/ReservationForm';
import Modal from './components/Modal';

type DialogState =
  | { kind: 'details'; reservation: Reservation }
  | { kind: 'form'; reservation: Reservation; editing: boolean }
  | { kind: 'reset' }
  | null;

export default function App() {
  const [loaded] = useState(loadReservations);
  const [reservations, setReservations] = useState(loaded.reservations);
  const [warning, setWarning] = useState(loaded.warning);
  const [view, setView] = useState<'schedule' | 'reservations'>('schedule');
  const [month, setMonth] = useState(DEMO_MONTH);
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [message, setMessage] = useState('');
  const days = daysInMonth(month);
  const inMonth = reservations.filter((r) =>
    datesOverlap(r.startDate, r.endDate, days[0], days[days.length - 1]),
  );
  const nameMatches = (r: Reservation) =>
    r.name.toLowerCase().includes(query.trim().toLowerCase());
  const visible = (view === 'schedule' ? inMonth : reservations).filter(
    nameMatches,
  );
  const monthLabel = dateLabel(month, {
    month: 'long',
    year: 'numeric',
    day: undefined,
  });

  function persist(next: Reservation[], notice: string) {
    setReservations(next);
    setWarning(saveReservations(next));
    setMessage(notice);
    setDialog(null);
  }

  function create(
    berthId = '',
    date = monthStart(today()) === month ? today() : month,
  ) {
    setDialog({
      kind: 'form',
      editing: false,
      reservation: {
        id: crypto.randomUUID(),
        type: 'vessel',
        name: '',
        berthId,
        startDate: date,
        endDate: date,
      },
    });
  }

  function save(reservation: Reservation) {
    // Recheck against the complete schedule, independent of view/search filters.
    if (
      Object.keys(validateReservation(reservation, reservations, berths)).length
    )
      return;
    const exists = reservations.some((r) => r.id === reservation.id);
    persist(
      exists
        ? reservations.map((r) => (r.id === reservation.id ? reservation : r))
        : [...reservations, reservation],
      `${reservation.name} ${exists ? 'updated' : 'created'}.`,
    );
    setMonth(monthStart(reservation.startDate));
    setQuery('');
  }

  const select = (reservation: Reservation) =>
    setDialog({ kind: 'details', reservation });

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to schedule
      </a>
      <header className="app-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('schedule');
          }}
          aria-label="Harbor Scheduler, schedule"
        >
          <span className="brand-mark">
            <Icon name="anchor" size={23} />
          </span>
          <span>
            Harbor <strong>Scheduler</strong>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            className={view === 'schedule' ? 'active' : ''}
            aria-current={view === 'schedule' ? 'page' : undefined}
            onClick={() => setView('schedule')}
          >
            <Icon name="calendar" />
            Schedule
          </button>
          <button
            className={view === 'reservations' ? 'active' : ''}
            aria-current={view === 'reservations' ? 'page' : undefined}
            onClick={() => setView('reservations')}
          >
            <Icon name="list" />
            Reservations
          </button>
        </nav>
        <button className="button primary new-button" onClick={() => create()}>
          <Icon name="plus" />
          New Reservation
        </button>
      </header>
      <main id="main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">HARBORVIEW MARINE RESEARCH CENTER</p>
            <h1>{view === 'schedule' ? 'Berth schedule' : 'Reservations'}</h1>
            <p className="page-description">
              {view === 'schedule'
                ? 'A clear view of what’s alongside, and what’s coming next.'
                : 'Vessel visits and berth events, all in one place.'}
            </p>
          </div>
          <span className="prototype-label">
            <span />
            Local demo
          </span>
        </div>
        {warning && (
          <div className="notice error storage-warning" role="alert">
            <Icon name="alert" />
            <p>{warning}</p>
          </div>
        )}
        <div className="status-message" role="status" aria-live="polite">
          {message && (
            <>
              <Icon name="check" size={15} />
              {message}
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setMessage('')}
              >
                <Icon name="close" size={14} />
              </button>
            </>
          )}
        </div>
        <section
          className="schedule-card"
          aria-label={
            view === 'schedule' ? 'Monthly berth schedule' : 'All reservations'
          }
        >
          <div className="schedule-toolbar">
            <div className="month-controls">
              {view === 'schedule' ? (
                <>
                  <h2>{monthLabel}</h2>
                  <div className="month-arrows">
                    <button
                      className="icon-button"
                      aria-label="Previous month"
                      disabled={month <= '0001-01-01'}
                      onClick={() => setMonth(shiftMonth(month, -1))}
                    >
                      <Icon name="left" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Next month"
                      disabled={month >= '9999-12-01'}
                      onClick={() => setMonth(shiftMonth(month, 1))}
                    >
                      <Icon name="right" />
                    </button>
                  </div>
                  <button
                    className="button today-button"
                    onClick={() => setMonth(monthStart(today()))}
                  >
                    Today
                  </button>
                </>
              ) : (
                <>
                  <h2>All reservations</h2>
                  <span className="count-pill">{reservations.length}</span>
                </>
              )}
            </div>
            <div className="search-field">
              <Icon name="search" size={17} />
              <input
                type="search"
                aria-label="Search reservation names"
                placeholder="Search reservations…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                >
                  <Icon name="close" size={15} />
                </button>
              )}
            </div>
          </div>
          <div className="schedule-context">
            <div className="legend">
              <span>
                <i className="vessel-key" /> <Icon name="ship" size={14} />
                Vessel
              </span>
              <span>
                <i className="event-key" />
                <Icon name="event" size={14} />
                Event
              </span>
            </div>
            <span>
              {view === 'schedule'
                ? `${berths.length} berths · ${visible.length} reservation${visible.length === 1 ? '' : 's'}${query ? ' matching' : ' this month'}`
                : `${visible.length} reservation${visible.length === 1 ? '' : 's'} · All dates`}
            </span>
          </div>
          {view === 'schedule' ? (
            <>
              {visible.length === 0 && (
                <div className="calendar-empty" role="status">
                  {query
                    ? 'No reservations match your search. Clear the search to see the full schedule.'
                    : 'No reservations this month. Select an empty day to reserve a berth.'}
                </div>
              )}
              <ScheduleGrid
                month={month}
                reservations={visible}
                onSelect={select}
                onCreate={create}
              />
              <div className="calendar-footer">
                <span>
                  <Icon name="calendar" size={15} />
                  Dates are inclusive · Click a reservation for details
                </span>
                <span>
                  Select an empty day to book a berth{' '}
                  <Icon name="plus" size={14} />
                </span>
              </div>
            </>
          ) : (
            <ReservationList reservations={visible} onSelect={select} />
          )}
        </section>
        <div className="below-calendar">
          <p>
            <Icon name="check" size={16} />
            Every booking is checked for berth fit and overlapping dates.
          </p>
          <span>All lengths in feet</span>
        </div>
      </main>
      <footer className="app-footer">
        <div>
          <span className="footer-brand">Harbor Scheduler</span>
          <span className="footer-divider">/</span>
          <span>Synthetic demo · Saved in this browser only</span>
        </div>
        <button
          className="text-button"
          onClick={() => setDialog({ kind: 'reset' })}
        >
          <Icon name="reset" size={14} />
          Reset Demo Data
        </button>
      </footer>
      {dialog?.kind === 'details' && (
        <ReservationDetails
          key={`details-${dialog.reservation.id}`}
          reservation={dialog.reservation}
          onClose={() => setDialog(null)}
          onEdit={() =>
            setDialog({
              kind: 'form',
              reservation: dialog.reservation,
              editing: true,
            })
          }
          onDelete={() =>
            persist(
              reservations.filter((r) => r.id !== dialog.reservation.id),
              `${dialog.reservation.name} deleted.`,
            )
          }
        />
      )}
      {dialog?.kind === 'form' && (
        <ReservationForm
          key={`form-${dialog.reservation.id}`}
          initial={dialog.reservation}
          editing={dialog.editing}
          reservations={reservations}
          onClose={() => setDialog(null)}
          onSave={save}
        />
      )}
      {dialog?.kind === 'reset' && (
        <Modal
          title="Reset demo data?"
          subtitle="Restore the original September 2026 schedule."
          small
          onClose={() => setDialog(null)}
        >
          <div className="modal-body">
            <p>
              This replaces all reservations in this browser with the 12
              original demo bookings. Your changes will be removed.
            </p>
          </div>
          <footer className="modal-footer">
            <button className="button" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button
              className="button danger"
              onClick={() => {
                persist(
                  structuredClone(seedReservations),
                  'Demo data restored.',
                );
                setMonth(DEMO_MONTH);
                setQuery('');
              }}
            >
              Reset demo data
            </button>
          </footer>
        </Modal>
      )}
    </>
  );
}
