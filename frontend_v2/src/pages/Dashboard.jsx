import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import Chatbot from '../components/chatbot/ChatBot';
import { Calendar, FileText, User, Activity, Clock, ChevronRight } from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile and appointments in parallel
                const [profileRes, appointmentsRes] = await Promise.all([
                    patientAPI.getProfile(),
                    patientAPI.getAppointments()
                ]);

                setProfile(profileRes.data);
                // Filter for upcoming appointments (naive check or backend filter)
                // For now, just taking the first few
                setAppointments(appointmentsRes.data.slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const quickLinks = [
        { title: 'My Profile', icon: <User size={24} />, path: '/profile', color: 'bg-blue-500' },
        { title: 'Appointments', icon: <Calendar size={24} />, path: '/my-appointments', color: 'bg-purple-500' },
        { title: 'Medical Records', icon: <FileText size={24} />, path: '/medical-records', color: 'bg-green-500' }
    ];

    if (loading) return <div className="page-container center-content">Loading your dashboard...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">Overview</h1>
                    <p className="section-subtitle">
                        Welcome back, {profile?.user?.first_name || 'Patient'}. Here's your health summary.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/book-appointment')}>
                    Book Appointment
                </button>
            </header>

            {/* Quick Links Section */}
            <div className="quick-links-grid">
                {quickLinks.map((link, index) => (
                    <div
                        key={index}
                        className="quick-link-card"
                        onClick={() => navigate(link.path)}
                    >
                        <div className={`quick-link-icon-container ${link.color}`}>
                            {link.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-main)', margin: 0 }}>{link.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View Details</p>
                        </div>
                        <ChevronRight className="ml-auto text-gray-300" />
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <section className="appointments-section glass">
                    <div className="section-header">
                        <h2>Upcoming Appointments</h2>
                        <button className="btn btn-ghost" onClick={() => navigate('/my-appointments')}>View All</button>
                    </div>

                    {appointments.length > 0 ? (
                        <div className="appointments-list">
                            {appointments.map(apt => (
                                <div key={apt.id} className="appointment-item">
                                    <div className="apt-info">
                                        <h4>{apt.doctor_name || `Dr. ${apt.doctor?.user?.last_name}`}</h4>
                                        <p>{apt.doctor?.specialization || 'Consultation'}</p>
                                    </div>
                                    <div className="apt-time">
                                        <span className="date-badge"><Calendar size={12} className="mr-1" /> {apt.appointment_date}</span>
                                        <span className="time-badge"><Clock size={12} className="mr-1" /> {apt.appointment_time}</span>
                                    </div>
                                    <div className={`status-badge status-${apt.status.toLowerCase()}`}>
                                        {apt.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No upcoming appointments.</p>
                        </div>
                    )}
                </section>

                <section className="updates-section glass">
                    <div className="section-header">
                        <h2>Health Stats</h2>
                    </div>
                    <div className="form-grid-2 p-6" style={{ paddingTop: 0 }}>
                        <div className="bg-blue-50 p-4 rounded-xl text-center" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                            <h3 className="text-2xl font-bold text-blue-500">{appointments.length}</h3>
                            <p className="text-sm text-gray-400">Appointments</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                            <h3 className="text-2xl font-bold text-green-500">Active</h3>
                            <p className="text-sm text-gray-400">Status</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="update-item">
                            <span className="update-icon">🔔</span>
                            <div>
                                <p className="update-text">Remember to update your profile</p>
                                <span className="update-time">Just now</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Chatbot />
        </div>
    );
};

export default Dashboard;
