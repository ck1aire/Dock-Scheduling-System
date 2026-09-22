import { useState } from 'react';
import type { Reservation } from '../types';
import { berths } from '../data/berths';
import { dateLabel, occupiedDays } from '../utils/dates';
import { isVesselCompatible } from '../utils/validation';
import Modal from './Modal';
import Icon from './Icon';

export default function ReservationDetails({
  reservation: r,
  onClose,
  onEdit,
  onDelete,
}: {
  reservation: Reservation;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const berth = berths.find((b) => b.id === r.berthId)!;
  const fits =
    r.type === 'event' || isVesselCompatible(r.vesselLengthFt ?? 0, berth);
  return (
    <Modal
      title="Reservation details"
      subtitle="Harborview Marine Research Center"
      onClose={onClose}
    >
      <div className="modal-body">
        <span className={`badge ${r.type}`}>
          <Icon name={r.type === 'event' ? 'event' : 'ship'} size={14} />
          {r.type === 'event' ? 'Event' : 'Vessel'}
        </span>
        <h3 className="reservation-name">{r.name}</h3>
        <p className="muted">
          {occupiedDays(r.startDate, r.endDate)} occupied{' '}
          {occupiedDays(r.startDate, r.endDate) === 1 ? 'day' : 'days'} · Start
          and end dates included
        </p>
        <dl className="detail-grid">
          <div>
            <dt>Berth</dt>
            <dd>{berth.name}</dd>
          </div>
          <div>
            <dt>Berth maximum length</dt>
            <dd>{berth.maxLengthFt} ft</dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{dateLabel(r.startDate)}</dd>
          </div>
          <div>
            <dt>End date</dt>
            <dd>{dateLabel(r.endDate)}</dd>
          </div>
          {r.type === 'vessel' && (
            <div>
              <dt>Vessel length</dt>
              <dd>{r.vesselLengthFt} ft</dd>
            </div>
          )}
        </dl>
        <div className={`notice ${fits ? 'success' : 'error'}`}>
          <Icon name={fits ? 'check' : 'alert'} />
          <div>
            <strong>
              {r.type === 'event'
                ? 'Entire berth reserved'
                : fits
                  ? 'Vessel fits this berth'
                  : 'Vessel exceeds berth capacity'}
            </strong>
            <p>
              {r.type === 'event'
                ? 'Length validation does not apply to events. Overlap protection is active.'
                : `${r.vesselLengthFt} ft vessel / ${berth.maxLengthFt} ft maximum. Overlap protection is active.`}
            </p>
          </div>
        </div>
        <div className="notes-section">
          <h4>Notes</h4>
          <p>{r.notes || 'No notes added.'}</p>
        </div>
        {confirmDelete && (
          <div className="notice error" role="alert">
            <Icon name="alert" />
            <div>
              <strong>Delete “{r.name}”?</strong>
              <p>
                This frees the berth for these dates. This action cannot be
                undone.
              </p>
            </div>
          </div>
        )}
      </div>
      <footer className="modal-footer">
        {confirmDelete ? (
          <>
            <button className="button" onClick={() => setConfirmDelete(false)}>
              Keep reservation
            </button>
            <button className="button danger" onClick={onDelete}>
              Confirm delete
            </button>
          </>
        ) : (
          <>
            <button
              className="text-button danger-text"
              onClick={() => setConfirmDelete(true)}
            >
              Delete reservation
            </button>
            <button className="button primary" onClick={onEdit}>
              Edit reservation
            </button>
          </>
        )}
      </footer>
    </Modal>
  );
}
