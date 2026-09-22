import { useState, type FormEvent } from 'react';
import type { Reservation } from '../types';
import { berths } from '../data/berths';
import {
  isVesselCompatible,
  validateReservation,
  type ValidationErrors,
} from '../utils/validation';
import Modal from './Modal';
import Icon from './Icon';

interface Props {
  initial: Reservation;
  editing: boolean;
  reservations: Reservation[];
  onSave: (reservation: Reservation) => void;
  onClose: () => void;
}

export default function ReservationForm({
  initial,
  editing,
  reservations,
  onSave,
  onClose,
}: Props) {
  const [draft, setDraft] = useState(initial);
  const [length, setLength] = useState(
    initial.vesselLengthFt?.toString() ?? '',
  );
  const [submitted, setSubmitted] = useState(false);
  const candidate: Reservation = {
    ...draft,
    name: draft.name.trim(),
    notes: draft.notes?.trim() || undefined,
    vesselLengthFt:
      draft.type === 'vessel' && length.trim() !== ''
        ? Number(length)
        : undefined,
  };
  const errors = validateReservation(candidate, reservations, berths);
  const hasErrors = Object.keys(errors).length > 0;
  const selectedBerth = berths.find((b) => b.id === draft.berthId);
  const validLength = Number.isFinite(Number(length)) && Number(length) > 0;
  const showError = (field: keyof ValidationErrors) =>
    (submitted ||
      field === 'conflict' ||
      (field === 'berthId' && !!draft.berthId)) &&
    errors[field];
  const fieldError = (field: keyof ValidationErrors) =>
    showError(field) ? (
      <span className="field-error" id={`${field}-error`}>
        {errors[field]}
      </span>
    ) : null;
  const update = <K extends keyof Reservation>(key: K, value: Reservation[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) {
      const field = Object.keys(errors)[0];
      document
        .getElementById(field === 'conflict' ? 'berthId' : field)
        ?.focus();
      return;
    }
    onSave(candidate);
  }

  return (
    <Modal
      title={editing ? 'Edit reservation' : 'New reservation'}
      subtitle="Reserve a berth for a vessel or a shoreside event."
      onClose={onClose}
    >
      <form noValidate onSubmit={submit}>
        <div className="modal-body form-body">
          <fieldset className="type-fieldset">
            <legend>Reservation type</legend>
            <div className="type-options">
              {(['vessel', 'event'] as const).map((type) => (
                <label
                  key={type}
                  className={`type-option ${draft.type === type ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={draft.type === type}
                    onChange={() => update('type', type)}
                  />
                  <Icon name={type === 'vessel' ? 'ship' : 'event'} />
                  <span>{type === 'vessel' ? 'Vessel' : 'Event'}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="name">
              {draft.type === 'vessel' ? 'Vessel name' : 'Event name'}{' '}
              <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              autoFocus
              required
              maxLength={120}
              placeholder={
                draft.type === 'vessel'
                  ? 'e.g. R/V High Drift'
                  : 'e.g. Community sail day'
              }
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              aria-invalid={!!showError('name')}
              aria-describedby={showError('name') ? 'name-error' : undefined}
            />
            {fieldError('name')}
          </div>
          {draft.type === 'vessel' && (
            <div className="field">
              <label htmlFor="vesselLengthFt">
                Vessel length (ft) <span aria-hidden="true">*</span>
              </label>
              <input
                id="vesselLengthFt"
                type="number"
                min="0.01"
                step="any"
                required
                inputMode="decimal"
                placeholder="Length overall in feet"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                aria-invalid={!!showError('vesselLengthFt')}
                aria-describedby={
                  showError('vesselLengthFt')
                    ? 'vesselLengthFt-error'
                    : undefined
                }
              />
              {fieldError('vesselLengthFt')}
            </div>
          )}
          <div className="form-row">
            <div className="field">
              <label htmlFor="startDate">
                Start date <span aria-hidden="true">*</span>
              </label>
              <input
                id="startDate"
                type="date"
                required
                min="0001-01-01"
                max="9999-12-31"
                value={draft.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                aria-invalid={!!showError('startDate')}
                aria-describedby={
                  showError('startDate') ? 'startDate-error' : 'date-help'
                }
              />
              {fieldError('startDate')}
            </div>
            <div className="field">
              <label htmlFor="endDate">
                End date <span aria-hidden="true">*</span>
              </label>
              <input
                id="endDate"
                type="date"
                required
                min={draft.startDate || '0001-01-01'}
                max="9999-12-31"
                value={draft.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                aria-invalid={!!showError('endDate')}
                aria-describedby={
                  showError('endDate') ? 'endDate-error' : 'date-help'
                }
              />
              {fieldError('endDate')}
            </div>
          </div>
          <p className="field-help" id="date-help">
            Both dates are occupied. A one-day visit uses the same start and end
            date.
          </p>
          <div className="field">
            <label htmlFor="berthId">
              Berth <span aria-hidden="true">*</span>
            </label>
            <select
              id="berthId"
              required
              value={draft.berthId}
              onChange={(e) => update('berthId', e.target.value)}
              aria-invalid={!!showError('berthId')}
              aria-describedby={
                showError('berthId') ? 'berthId-error' : 'berth-help'
              }
            >
              <option value="">Select a berth</option>
              {berths.map((berth) => {
                const tooLong =
                  draft.type === 'vessel' &&
                  validLength &&
                  !isVesselCompatible(Number(length), berth);
                return (
                  <option key={berth.id} value={berth.id} disabled={tooLong}>
                    {berth.name} · {berth.maxLengthFt} ft
                    {tooLong
                      ? ' — Vessel too long'
                      : draft.type === 'vessel' && validLength
                        ? ' — Fits vessel'
                        : ''}
                  </option>
                );
              })}
            </select>
            {fieldError('berthId')}
            <span className="field-help" id="berth-help">
              {draft.type === 'event'
                ? 'Events occupy the entire berth and are checked for overlapping bookings.'
                : validLength
                  ? `${berths.filter((b) => isVesselCompatible(Number(length), b)).length} of ${berths.length} berths fit this vessel. Capacity is shown in feet.`
                  : 'Enter a vessel length to see compatible berths.'}
            </span>
          </div>
          {selectedBerth &&
            draft.type === 'vessel' &&
            validLength &&
            !errors.berthId && (
              <div className="fit-inline">
                <Icon name="check" size={16} />
                Vessel fits: {length} ft / {selectedBerth.maxLengthFt} ft
                maximum
              </div>
            )}
          {errors.conflict && (
            <div className="notice error" role="alert" id="conflict-error">
              <Icon name="alert" />
              <div>
                <strong>Scheduling conflict</strong>
                <p>{errors.conflict}</p>
              </div>
            </div>
          )}
          <div className="field">
            <label htmlFor="notes">
              Notes <span className="optional">Optional</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={2000}
              placeholder="Arrival information or operational notes…"
              value={draft.notes ?? ''}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
          {submitted && hasErrors && (
            <p className="field-error" role="alert">
              Reservation not saved. Please correct the highlighted fields.
            </p>
          )}
        </div>
        <footer className="modal-footer">
          <button className="button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            {editing ? 'Save changes' : 'Create reservation'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
