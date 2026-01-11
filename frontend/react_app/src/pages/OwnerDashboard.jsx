import React, { useState, useEffect } from 'react';
import OwnerLayout from './OwnerLayout';
import { ownerAPI } from '../services/api';
import './OwnerDashboard.css';

export default function OwnerDashboard({ onLogout }) {
    const [stats, setStats] = useState({
        total_doctors: 0,
        patients_treated: 0,
        total_appointments_today: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await ownerAPI.getDashboardStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch owner stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <OwnerLayout active="dashboard" onLogout={onLogout}>
            <div className="owner-dashboard-root">
                <header className="owner-page-header">
                    <h1 className="owner-welcome">Welcome Back, Owner</h1>
                    <p className="owner-subtitle">Here's what's happening in your hospital today.</p>
                </header>

                <div className="owner-stats-grid">
                    <div className="owner-stats-card">
                        <div className="owner-stats-icon">👨‍⚕️</div>
                        <div className="owner-stats-info">
                            <span className="owner-stats-value">{loading ? '...' : stats.total_doctors}</span>
                            <span className="owner-stats-label">Total Doctors</span>
                        </div>
                    </div>
                    <div className="owner-stats-card">
                        <div className="owner-stats-icon">😷</div>
                        <div className="owner-stats-info">
                            <span className="owner-stats-value">{loading ? '...' : stats.patients_treated}</span>
                            <span className="owner-stats-label">Patients Treated</span>
                        </div>
                    </div>
                    <div className="owner-stats-card">
                        <div className="owner-stats-icon">📅</div>
                        <div className="owner-stats-info">
                            <span className="owner-stats-value">{loading ? '...' : stats.total_appointments_today}</span>
                            <span className="owner-stats-label">Appointments Today</span>
                        </div>
                    </div>

                </div>

                <div className="owner-promo-banner">
                    <div className="owner-promo-content">
                        <h2>Invest in the Future of Healthcare</h2>
                        <p>
                            Love what you see? This comprehensive hospital management system increases efficiency by 40%
                            and patient satisfaction by 60%. Own the full source code today.
                        </p>
                        <button className="owner-promo-btn">Buy This Website Now</button>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
