import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import '../styles/dashboard.css';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await patientAPI.getAppointments();
            setAppointments(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load appointments. Please try again.');
            setLoading(false);
            console.error(err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return <CheckCircle size={16} className="text-green-500" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            case 'in_progress': return <PlayCircle size={16} className="text-blue-500" />;
            default: return <AlertCircle size={16} className="text-yellow-500" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'status-confirmed';
            case 'cancelled': return 'status-cancelled';
            case 'in_progress': return 'status-pending'; // Using pending style for in-progress as generic
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="page-container center-content">Loading appointments...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">My Appointments</h1>
                    <p className="section-subtitle">View and manage your scheduled visits</p>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            {appointments.length === 0 && !loading ? (
                <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                    <Calendar size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                    <h3>No appointments found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't scheduled any appointments yet.</p>
                </div>
            ) : (
                <div className="stats-grid">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="stat-card" style={{ display: 'block' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="stat-icon icon-blue" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                        Dr
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>
                                            {apt.doctor_name || `Dr. ${apt.doctor?.user?.last_name || 'Unknown'}`}
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            {apt.doctor?.specialization || 'Specialist'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`status-badge ${getStatusClass(apt.status)}`}>
                                    {apt.status}
                                </span>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <Calendar size={16} className="text-blue-500" />
                                    <span>{apt.appointment_date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <Clock size={16} className="text-green-500" />
                                    <span>{apt.appointment_time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
