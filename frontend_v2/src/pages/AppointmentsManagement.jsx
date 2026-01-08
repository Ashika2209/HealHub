import React, { useMemo, useState, useEffect } from 'react';
import DeleteAppointmentModal from './DeleteAppointmentModal';
import './AppointmentsManagement.css';
import AdminLayout from '../components/AdminLayout';
import { useAdminData } from './AdminDataContext';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.jsx';
import { formatTimeTo12Hour } from '../utils/time.js';

function AppointmentsManagement({ setAdminLoggedIn }) {
    const { appointments, addAppointment, cancelAppointment } = useAdminData();

    const [showModal, setShowModal] = useState(false);
    const [localAppointments, setLocalAppointments] = useState([]);

    useEffect(() => {
        setLocalAppointments(appointments);
    }, [appointments]);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [tab, setTab] = useState('All');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const statusOptions = useMemo(
        () => Array.from(new Set(localAppointments.map((a) => a.status))).filter(Boolean),
        [localAppointments]
    );
    const typeOptions = useMemo(
        () => Array.from(new Set(localAppointments.map((a) => a.type))).filter(Boolean),
        [localAppointments]
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredAll = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        const statusTerm = statusFilter?.toLowerCase();
        const typeTerm = typeFilter?.toLowerCase();

        return localAppointments.filter((a) => {
            const patientName = (a.patient || '').toLowerCase();
            const doctorName = (a.doctor || '').toLowerCase();
            const matchesSearch =
                !searchTerm ||
                patientName.includes(searchTerm) ||
                doctorName.includes(searchTerm);

            const normalizedStatus = (a.status || '').toLowerCase();
            const normalizedType = (a.type || '').toLowerCase();

            const matchesStatus = statusFilter === 'All' || normalizedStatus === statusTerm;
            const matchesType = typeFilter === 'All' || normalizedType === typeTerm;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [localAppointments, search, statusFilter, typeFilter]);

    const filtered = filteredAll; // Simplified for now, tab filtering logic omitted for brevity but can be added if needed

    const statusClass = status => {
        const normalizedStatus = status?.toLowerCase();
        switch (normalizedStatus) {
            case 'scheduled': return 'status scheduled';
            case 'completed': return 'status completed';
            case 'cancelled': return 'status cancelled';
            case 'no-show': return 'status noshow';
            default: return 'status';
        }
    };

    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (reason) => {
        if (selectedAppointment) {
            try {
                const result = await cancelAppointment(selectedAppointment.id, reason);
                if (result.success) {
                    setLocalAppointments(prev =>
                        prev.map(appt =>
                            appt.id === selectedAppointment.id
                                ? { ...appt, status: 'cancelled', cancellationReason: reason }
                                : appt
                        )
                    );
                } else {
                    console.error('Failed to cancel:', result.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
            setDeleteModalOpen(false);
            setSelectedAppointment(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setSelectedAppointment(null);
    };

    return (
        <AdminLayout active="appointments" setAdminLoggedIn={setAdminLoggedIn}>
            <DeleteAppointmentModal
                appointment={selectedAppointment}
                open={deleteModalOpen}
                onCancel={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
            />
            <div className="appointments-mgmt-container">
                <div className="appointments-mgmt-header">
                    <div>
                        <h1>Appointment Management</h1>
                        <p>Monitor and manage all appointments across the system</p>
                    </div>
                    <button className="schedule-btn" onClick={() => setShowModal(true)}>+ Schedule Appointment</button>
                </div>

                {showModal && (
                    <ScheduleAppointmentModal
                        isOpen={showModal}
                        userRole="admin"
                        onClose={() => setShowModal(false)}
                        onSuccess={(appointment) => {
                            if (appointment) {
                                const patientName = appointment.patient_name || appointment.patient || 'Unknown Patient';
                                addAppointment({
                                    id: appointment.id ?? Date.now(),
                                    patient: patientName,
                                    patientInitials: 'UP',
                                    doctor: appointment.doctor_name || appointment.doctor || 'Unknown Doctor',
                                    date: appointment.appointment_date || 'N/A',
                                    time: formatTimeTo12Hour(appointment.preferred_time) || '—',
                                    type: appointment.appointment_type || 'Consultation',
                                    status: 'Scheduled',
                                });
                            }
                            setShowModal(false);
                        }}
                    />
                )}

                <div className="appointments-mgmt-card">
                    <div className="appointments-mgmt-filters">
                        <input
                            className="search-input"
                            placeholder="Search by patient or doctor name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="appointments-mgmt-table-wrapper">
                        <table className="appointments-mgmt-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((a, i) => (
                                    <tr key={a.id}>
                                        <td>
                                            <span className="patient-avatar">{a.patientInitials || 'P'}</span>
                                            {a.patient}
                                        </td>
                                        <td>{a.doctor}</td>
                                        <td>
                                            <span className="date-icon">📅</span>
                                            {a.date}<br /><span className="appt-time">{a.time}</span>
                                        </td>
                                        <td><span className={`appt-type`}>{a.type}</span></td>
                                        <td>
                                            <span className={statusClass(a.status)}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td>
                                            {a.status?.toLowerCase() === 'scheduled' ? (
                                                <button className="cancel-btn" onClick={() => handleCancelClick(a)}>❌ Cancel</button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AppointmentsManagement;
