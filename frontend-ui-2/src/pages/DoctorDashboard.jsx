import React, { useState, useEffect } from 'react';
import { doctorApi } from '../services/api';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [profileRes, appointmentsRes] = await Promise.all([
                    doctorApi.getProfile(),
                    doctorApi.getAppointments()
                ]);
                setProfile(profileRes.data);
                setAppointmentCount(appointmentsRes.data.length);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                // Mock data for development if API fails
                setProfile({ name: "Dr. Smith", specialization: "Cardiologist" });
                setAppointmentCount(5);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="doctor-dashboard">
            <header className="dashboard-header">
                <h1>Welcome, {profile?.name}</h1>
                <p className="specialization">{profile?.specialization}</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card highlight">
                    <div className="card-icon">📅</div>
                    <div className="card-info">
                        <h3>Total Appointments</h3>
                        <p className="stat-number">{appointmentCount}</p>
                    </div>
                </div>
            </div>

            <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <a href="/doctor/appointments" className="primary-btn">Manage Appointments</a>
                </div>
            </section>
        </div>
    );
};

export default DoctorDashboard;
