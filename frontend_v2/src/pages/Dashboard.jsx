import React from 'react';
import '../styles/dashboard.css';
import Chatbot from '../components/chatbot/ChatBot';

const Dashboard = () => {
    const stats = [
        { title: 'Upcoming Appointments', value: '2', icon: '🗓️', color: 'blue' },
        { title: 'Prescriptions', value: '5', icon: '💊', color: 'purple' },
        { title: 'Test Results', value: '3', icon: '📝', color: 'green' }
    ];

    const appointments = [
        { id: 1, doctor: 'Dr. Sarah Smith', type: 'Cardiology', date: 'Oct 24, 2023', time: '10:00 AM', status: 'Confirmed' },
        { id: 2, doctor: 'Dr. John Doe', type: 'General Checkup', date: 'Oct 28, 2023', time: '2:30 PM', status: 'Pending' }
    ];

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">Overview</h1>
                    <p className="section-subtitle">Welcome back, John. Here's your health summary.</p>
                </div>
                <button className="btn btn-primary">Book Appointment</button>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card glass">
                        <div className={`stat-icon icon-${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{stat.value}</h3>
                            <p>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <section className="appointments-section glass">
                    <div className="section-header">
                        <h2>Upcoming Appointments</h2>
                        <button className="btn btn-ghost">View All</button>
                    </div>

                    <div className="appointments-list">
                        {appointments.map(apt => (
                            <div key={apt.id} className="appointment-item">
                                <div className="apt-info">
                                    <h4>{apt.doctor}</h4>
                                    <p>{apt.type}</p>
                                </div>
                                <div className="apt-time">
                                    <span className="date-badge">{apt.date}</span>
                                    <span className="time-badge">{apt.time}</span>
                                </div>
                                <div className={`status-badge status-${apt.status.toLowerCase()}`}>
                                    {apt.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="updates-section glass">
                    <div className="section-header">
                        <h2>Recent Updates</h2>
                    </div>
                    <div className="updates-list">
                        <div className="update-item">
                            <span className="update-icon">🔔</span>
                            <div>
                                <p className="update-text">Your lab results are ready</p>
                                <span className="update-time">2 hours ago</span>
                            </div>
                        </div>
                        <div className="update-item">
                            <span className="update-icon">✅</span>
                            <div>
                                <p className="update-text">Appointment confirmed</p>
                                <span className="update-time">Yesterday</span>
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
