import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doctorAPI, appointmentAPI, adminAPI } from '../services/api.js';
import { formatTimeTo12Hour } from '../utils/time.js';
import './ScheduleAppointmentModal.css';

const getTodayISODate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function ScheduleAppointmentModal({ isOpen, onClose, onSuccess, userRole = 'patient' }) {
    const [formData, setFormData] = useState({
        patient: '',
        department: '',
        doctor: '',
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'consultation',
        reason: '',
    });
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            // Load Departments
            const deptParams = {}; // Add params if needed
            const deptRes = await appointmentAPI.getDepartments();
            if (deptRes.success) setDepartments(deptRes.data);

            // Load Patients if Admin
            if (userRole === 'admin') {
                const patRes = await adminAPI.getPatientsList();
                if (patRes.success) setPatients(patRes.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDepartmentChange = async (e) => {
        const dept = e.target.value;
        setFormData(prev => ({ ...prev, department: dept, doctor: '', appointment_time: '' }));
        if (dept) {
            const docRes = await appointmentAPI.getDoctorsByDepartment(dept);
            if (docRes.success) setDoctors(docRes.data);
        } else {
            setDoctors([]);
        }
    };

    const handleDoctorDateChange = async (doctorId, date) => {
        if (doctorId && date) {
            const res = await appointmentAPI.getAvailableSlots({ doctor_id: doctorId, date });
            if (res.success) setAvailableSlots(res.data);
            else setAvailableSlots([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'doctor' || name === 'appointment_date') {
                handleDoctorDateChange(
                    name === 'doctor' ? value : prev.doctor,
                    name === 'appointment_date' ? value : prev.appointment_date
                );
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                department: formData.department,
                doctor_id: formData.doctor,
                appointment_date: formData.appointment_date,
                preferred_time: formData.appointment_time,
                appointment_type: formData.appointment_type,
                reason: formData.reason,
            };

            if (userRole === 'admin') {
                payload.patient_id = formData.patient;
            }

            const res = await appointmentAPI.create(payload);
            if (res.success) {
                setSuccess('Appointment scheduled successfully!');
                setTimeout(() => {
                    if (onSuccess) onSuccess(res.data);
                    onClose();
                }, 1500);
            } else {
                setError(res.error || 'Failed to schedule appointment');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Schedule Appointment</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {!success && (
                        <form onSubmit={handleSubmit}>
                            {userRole === 'admin' && (
                                <div className="form-group">
                                    <label>Select Patient</label>
                                    <select
                                        name="patient"
                                        className="form-select"
                                        value={formData.patient}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose a patient...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name || p.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    name="department"
                                    className="form-select"
                                    value={formData.department}
                                    onChange={handleDepartmentChange}
                                    required
                                >
                                    <option value="">Choose Department...</option>
                                    {departments.map((d, i) => (
                                        <option key={i} value={d.id || d.name}>{d.name || d.specialization}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Doctor</label>
                                <select
                                    name="doctor"
                                    className="form-select"
                                    value={formData.doctor}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.department}
                                >
                                    <option value="">Choose Doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="appointment_date"
                                    className="form-input"
                                    min={getTodayISODate()}
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Time Slot</label>
                                <select
                                    name="appointment_time"
                                    className="form-select"
                                    value={formData.appointment_time}
                                    onChange={handleChange}
                                    required
                                    disabled={!availableSlots.length}
                                >
                                    <option value="">Select Time...</option>
                                    {availableSlots.map((slot, i) => (
                                        <option key={i} value={slot.value || slot}>{formatTimeTo12Hour(slot.value || slot)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    name="reason"
                                    className="form-textarea"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    placeholder="Briefly describe the reason for visit..."
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Scheduling...' : 'Confirm Appointment'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
