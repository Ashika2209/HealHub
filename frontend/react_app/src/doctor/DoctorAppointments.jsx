import React, { useMemo, useState } from 'react';
import './DoctorAppointments.css';
// Removed ScheduleAppointmentModal import
import { formatTimeTo12Hour } from '../utils/time.js';
import { useDoctorData } from './DoctorDataContext.jsx';

const statusColors = {
  scheduled: 'status-scheduled',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  'no-show': 'status-noshow',
  no_show: 'status-noshow',
  confirmed: 'status-scheduled',
  rescheduled: 'status-rescheduled',
};

const normalizeTypeDisplay = (type) => {
  if (!type) return 'consultation';
  const lower = type.toLowerCase();
  const validTypes = ['consultation', 'follow-up', 'emergency', 'procedure', 'therapy'];
  if (validTypes.includes(lower)) return lower;
  // If it's a UUID or long random string, default to consultation
  if (type.length > 20 || /^[0-9a-f-]+$/i.test(type)) return 'consultation';
  return type;
};

const getTypeClass = (typeCode) => {
  const normalized = normalizeTypeDisplay(typeCode).replace(/[^a-z0-9]+/g, '-');
  switch (normalized) {
    case 'follow-up':
      return 'type-follow';
    case 'procedure':
      return 'type-proc';
    case 'emergency':
      return 'type-emergency';
    default:
      return 'type-consult';
  }
};

const deriveIsoDate = (appointment) => {
  if (!appointment) return null;
  if (appointment.dateIso) return appointment.dateIso;
  if (appointment.date_iso) return appointment.date_iso;
  if (appointment.dateISO) return appointment.dateISO;

  const raw = appointment.dateDisplay || appointment.date_display || appointment.date;
  if (!raw || typeof raw !== 'string') return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return isoMatch[0];
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, part1, part2, year] = slashMatch;
    const first = part1.padStart(2, '0');
    const second = part2.padStart(2, '0');
    const dayFirst = new Date(`${year}-${second}-${first}T00:00:00`);
    const monthFirst = new Date(`${year}-${first}-${second}T00:00:00`);
    const isDayFirstValid = !Number.isNaN(dayFirst.getTime());
    const isMonthFirstValid = !Number.isNaN(monthFirst.getTime());
    if (isDayFirstValid && (Number.parseInt(first, 10) > 12 || !isMonthFirstValid)) {
      return dayFirst.toISOString().slice(0, 10);
    }
    if (isMonthFirstValid && !isDayFirstValid) {
      return monthFirst.toISOString().slice(0, 10);
    }
    if (isDayFirstValid) {
      return dayFirst.toISOString().slice(0, 10);
    }
    if (isMonthFirstValid) {
      return monthFirst.toISOString().slice(0, 10);
    }
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
};

export default function DoctorAppointments() {
  const {
    appointments,
    appointmentsLoading,
    appointmentFilters,
    setAppointmentFilters,
    appointmentSummary,
    updateAppointmentStatus,
    refreshAppointments,
    refreshDashboard,
    errors,
    doctorInfo,
  } = useDoctorData();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [pendingActionId, setPendingActionId] = useState(null);

  const period = appointmentFilters.period || 'all';
  const statusFilter = appointmentFilters.status || 'all';
  const typeFilter = appointmentFilters.type || 'all';
  const searchTerm = search.trim().toLowerCase();

  const searchedAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    return appointments.filter((appt) => {
      const name = appt.patient.name?.toLowerCase() || '';
      const email = appt.patient.email?.toLowerCase() || '';
      const phone = appt.patient.phone?.toLowerCase() || '';
      return name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm);
    });
  }, [appointments, searchTerm]);

  const bucketData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const buckets = {
      all: searchedAppointments,
      today: [],
      week: [],
      upcoming: [],
    };

    searchedAppointments.forEach((appointment) => {
      const iso = deriveIsoDate(appointment);
      if (!iso) {
        return;
      }

      const apptDate = new Date(`${iso}T00:00:00`);
      if (Number.isNaN(apptDate.getTime())) {
        return;
      }

      if (iso === todayIso) {
        buckets.today.push(appointment);
      }

      if (apptDate >= startOfWeek && apptDate <= endOfWeek) {
        buckets.week.push(appointment);
      }

      if (apptDate.getTime() > today.getTime()) {
        buckets.upcoming.push(appointment);
      }
    });

    return {
      buckets,
      counts: {
        all: buckets.all.length,
        today: buckets.today.length,
        week: buckets.week.length,
        upcoming: buckets.upcoming.length,
      },
    };
  }, [searchedAppointments]);

  const tabCounts = bucketData.counts;
  const displayedAppointments = bucketData.buckets[period] || bucketData.buckets.all;
  const counts = tabCounts || {
    all: bucketData.buckets.all.length,
    today: bucketData.buckets.today.length,
    week: bucketData.buckets.week.length,
    upcoming: bucketData.buckets.upcoming.length,
  };

  const openScheduleModal = () => setShowScheduleModal(true);
  const closeScheduleModal = () => setShowScheduleModal(false);

  const openCancelModal = (appointment) => {
    setCancelTarget(appointment);
    setCancelReason('');
    setReasonError('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelTarget(null);
    setCancelReason('');
    setReasonError('');
  };

  const applyStatusChange = async (appointment, status, notes = '') => {
    if (!appointment?.id) return;
    setPendingActionId(appointment.id);
    const result = await updateAppointmentStatus(appointment.id, status, notes);
    if (result.success) {
      refreshAppointments();
      refreshDashboard();
    }
    setPendingActionId(null);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setReasonError('Please provide a reason for cancelling this appointment.');
      return;
    }
    await applyStatusChange(cancelTarget, 'cancelled', cancelReason.trim());
    closeCancelModal();
  };

  return (
    <>
      <div className="doc-app-main">
        <div className="doc-app-header-row">
          <div>
            <div className="doc-app-header-title">Appointments</div>
            <div className="doc-app-header-desc">
              Manage your appointments and update treatment statuses.
            </div>
          </div>
        </div>
        {errors?.appointments && (
          <div className="doc-app-error-banner">{errors.appointments}</div>
        )}
        <div className="doc-app-filters-row">
          <span className="doc-app-filters-label">Filters:</span>
          <input
            className="doc-app-search"
            placeholder="Search by patient name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="doc-app-select"
            value={statusFilter}
            onChange={(event) =>
              setAppointmentFilters((prev) => ({ ...prev, status: event.target.value }))
            }
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>
          <select
            className="doc-app-select"
            value={typeFilter}
            onChange={(event) =>
              setAppointmentFilters((prev) => ({ ...prev, type: event.target.value }))
            }
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="procedure">Procedure</option>
          </select>
        </div>
        <div className="doc-app-card">
          <div className="doc-app-tab-bar">
            <button
              className={period === 'all' ? 'active' : ''}
              type="button"
              onClick={() => setAppointmentFilters((prev) => ({ ...prev, period: 'all' }))}
            >
              All ({counts.all})
            </button>
            <button
              className={period === 'today' ? 'active' : ''}
              type="button"
              onClick={() => setAppointmentFilters((prev) => ({ ...prev, period: 'today' }))}
            >
              Today ({counts.today})
            </button>
            <button
              className={period === 'week' ? 'active' : ''}
              type="button"
              onClick={() => setAppointmentFilters((prev) => ({ ...prev, period: 'week' }))}
            >
              Week ({counts.week})
            </button>
            <button
              className={period === 'upcoming' ? 'active' : ''}
              type="button"
              onClick={() => setAppointmentFilters((prev) => ({ ...prev, period: 'upcoming' }))}
            >
              Upcoming ({counts.upcoming})
            </button>
          </div>
          <div className="doc-app-table-wrap">
            {appointmentsLoading ? (
              <div className="doc-app-loading">Loading appointments…</div>
            ) : displayedAppointments.length ? (
              <table className="doc-app-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.map((appointment) => {
                    const typeClass = getTypeClass(appointment.type);
                    const statusClass = statusColors[appointment.status] || 'status-scheduled';
                    return (
                      <tr key={appointment.id || appointment.dateIso}>
                        <td>
                          <div>{appointment.dateDisplay || appointment.dateIso}</div>
                          <div className="doc-app-time">
                            @ {appointment.timeDisplay || formatTimeTo12Hour(appointment.time)}
                          </div>
                        </td>
                        <td>
                          <span className="doc-app-patient-icon">👤</span>{' '}
                          {appointment.patient.name}
                        </td>
                        <td>
                          <span className={`doc-app-type-pill ${typeClass}`}>
                            {normalizeTypeDisplay(appointment.type).charAt(0).toUpperCase() + normalizeTypeDisplay(appointment.type).slice(1)}
                          </span>
                        </td>
                        <td>{appointment.department || doctorInfo?.department || '—'}</td>
                        <td>
                          <span className={`doc-app-status-pill ${statusClass}`}>
                            {appointment.statusLabel || appointment.status}
                          </span>
                        </td>
                        <td>
                          {['scheduled', 'confirmed'].includes(appointment.status) && (
                            <div className="doc-app-actions">
                              <button
                                className="doc-app-action-btn action-approve"
                                type="button"
                                style={{ background: '#228be6' }}
                                onClick={() => applyStatusChange(appointment, 'in_progress')}
                                disabled={pendingActionId === appointment.id}
                              >
                                Start Treatment
                              </button>
                              {appointment.canCancel !== false && (
                                <button
                                  className="doc-app-action-btn action-cancel"
                                  type="button"
                                  onClick={() => openCancelModal(appointment)}
                                  disabled={pendingActionId === appointment.id}
                                >
                                  &#10005; Cancel
                                </button>
                              )}
                            </div>
                          )}
                          {appointment.status === 'in_progress' && (
                            <div className="doc-app-actions">
                              <button
                                className="doc-app-action-btn action-complete"
                                type="button"
                                style={{ background: '#40c057' }}
                                onClick={() => applyStatusChange(appointment, 'completed')}
                                disabled={pendingActionId === appointment.id}
                              >
                                Complete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="doc-app-empty">
                <p>No appointments match your current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {showCancelModal && (
        <div className="doc-app-modal-overlay">
          <div className="doc-app-modal">
            <div className="doc-app-modal-header">
              <span className="doc-app-modal-icon">&#9888;</span>
              <span className="doc-app-modal-title">Cancel Appointment</span>
              <button className="doc-app-modal-close" type="button" onClick={closeCancelModal}>
                &times;
              </button>
            </div>
            <div className="doc-app-modal-sub">This action cannot be undone.</div>
            <div className="doc-app-modal-info">
              <div>
                <b>Patient:</b> {cancelTarget?.patient?.name || 'Unknown Patient'}
              </div>
              <div>
                <b>Appointment:</b>{' '}
                {cancelTarget
                  ? `${cancelTarget.dateDisplay || cancelTarget.dateIso} ${cancelTarget.timeDisplay || formatTimeTo12Hour(cancelTarget.time)}`
                  : '—'}
              </div>
              <div>
                <b>ID:</b> #{cancelTarget?.id || '—'}
              </div>
            </div>
            <div className="doc-app-modal-label">
              Reason for cancellation <span style={{ color: 'red' }}>*</span>
            </div>
            <textarea
              className="doc-app-modal-textarea"
              placeholder="Please provide a reason for cancelling this appointment..."
              value={cancelReason}
              onChange={(event) => {
                setCancelReason(event.target.value);
                setReasonError('');
              }}
              maxLength={500}
              rows={3}
            />
            <div className="doc-app-modal-charcount">{cancelReason.length}/500 characters</div>
            {reasonError && <div className="doc-app-modal-error">{reasonError}</div>}
            <div className="doc-app-modal-actions">
              <button className="doc-app-modal-keep" type="button" onClick={closeCancelModal}>
                Keep Appointment
              </button>
              <button
                className="doc-app-modal-cancel"
                type="button"
                onClick={confirmCancel}
                disabled={pendingActionId === cancelTarget?.id}
              >
                {pendingActionId === cancelTarget?.id ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
