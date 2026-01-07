import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="layout-root">
            <aside className="sidebar glass">
                <div className="logo-container">
                    <div className="logo-icon">H</div>
                    <span className="logo-text">Heal<span className="text-highlight">Hub</span></span>
                </div>

                <nav className="nav-menu">
                    <Link to="/" className={`nav-item ${isActive('/')}`}>
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </Link>
                    <Link to="/doctors" className={`nav-item ${isActive('/doctors')}`}>
                        <span className="nav-icon">👨‍⚕️</span>
                        Doctors
                    </Link>
                    <Link to="/book" className={`nav-item ${isActive('/book')}`}>
                        <span className="nav-icon">📅</span>
                        Book Appointment
                    </Link>
                </nav>

                <div className="user-profile">
                    <div className="avatar">JD</div>
                    <div className="user-info">
                        <span className="user-name">John Doe</span>
                        <span className="user-role">Patient</span>
                    </div>
                    <Link to="/login" className="logout-btn" title="Logout">
                        ⏻
                    </Link>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
