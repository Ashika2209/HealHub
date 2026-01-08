import React, { useState, useEffect } from 'react';
import { doctorApi } from '../services/api';
import PatientRecords from './PatientRecords';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await doctorApi.getAppointments();
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments", error);
            // Mock data
            setAppointments([
                { id: 1, patient_name: "John Doe", date: "2026-01-10", time: "10:00 AM", status: "Pending", patient_id: 101 },
                { id: 2, patient_name: "Jane Smith", date: "2026-01-10", time: "11:30 AM", status: "Approved", patient_id: 102 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await doctorApi.updateAppointment(id, newStatus);
            fetchAppointments();
        } catch (error) {
            console.error("Error updating appointment", error);
            // Update local state for UI demonstration if backend is not ready
            setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        }
    };

    if (loading) return <div className="loading">Loading Appointments...</div>;

    return (
        <div className="appointment-page">
            <div className="appointment-list-container">
                <h2>Appointment List</h2>
                <table className="appointment-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(app => (
                            <tr key={app.id}>
                                <td className="patient-link" onClick={() => setSelectedPatientId(app.patient_id)}>
                                    {app.patient_name}
                                </td>
                                <td>{app.date}</td>
                                <td>{app.time}</td>
                                <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                                <td>
                                    <div className="action-btns">
                                        <button onClick={() => handleUpdateStatus(app.id, 'Approved')} className="approve-btn">Approve</button>
                                        <button onClick={() => handleUpdateStatus(app.id, 'Completed')} className="complete-btn">Complete</button>
                                        <button onClick={() => handleUpdateStatus(app.id, 'Cancelled')} className="cancel-btn">Cancel</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedPatientId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setSelectedPatientId(null)}>×</button>
                        <PatientRecords patientId={selectedPatientId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
