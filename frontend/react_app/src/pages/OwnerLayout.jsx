import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authAPI, clearAuthData } from '../services/api';
import './OwnerLayout.css';
import healthcareLogo from '../assets/healthcare-logo.svg';

export default function OwnerLayout({ children, active, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthData();
            if (onLogout) onLogout();
            navigate('/login');
        }
    };

    return (
        <div className="owner-layout">
            <aside className="owner-sidebar">
                <div className="owner-sidebar-brand">
                    <div className="owner-logo">
                        <img src={healthcareLogo} alt="Logo" />
                    </div>
                    <div className="owner-brand-info">
                        <span className="owner-brand-name">HealHub</span>
                        <span className="owner-brand-role">Owner</span>
                    </div>
                </div>

                <nav className="owner-nav">
                    <NavLink to="/owner" className={`owner-nav-item ${active === 'dashboard' ? 'active' : ''}`} end>
                        <span className="owner-nav-icon">📊</span>
                        Dashboard
                    </NavLink>
                    <NavLink to="/owner/doctors" className={`owner-nav-item ${active === 'doctors' ? 'active' : ''}`}>
                        <span className="owner-nav-icon">👥</span>
                        Doctors
                    </NavLink>
                    <NavLink to="/owner/analytics" className={`owner-nav-item ${active === 'analytics' ? 'active' : ''}`}>
                        <span className="owner-nav-icon">📈</span>
                        Analytics
                    </NavLink>
                </nav>

                <div className="owner-sidebar-footer">
                    <button className="owner-logout-btn" onClick={handleLogout}>
                        <span className="owner-nav-icon">🚪</span>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="owner-main-content">
                {children}
            </main>
        </div>
    );
}
