import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { authAPI, saveAuthData } from '../services/api.js';

const roles = [
    {
        label: 'Patient',
        icon: '👤',
        description: 'Patient Portal - View your medical information and appointments',
        note: 'New Patient? Contact your healthcare provider or visit the front desk to get registered by an administrator.'
    },
    {
        label: 'Doctor',
        icon: '🩺',
        description: 'Medical Professional - Manage patient care and schedules',
        note: 'Doctor Access: Your account is managed by the system administrator. Contact IT support if you need assistance.'
    },
    {
        label: 'Admin',
        icon: '⚙️',
        description: 'Administrator - Manage doctors, patients, and system settings',
        note: null
    },
];

export default function Login({ onLogin }) {
    const [selectedRole, setSelectedRole] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const selectedRoleLabel = roles[selectedRole].label.toLowerCase();

        try {
            const response = await authAPI.login(email, password, selectedRoleLabel);

            if (response.success) {
                saveAuthData(response.data);

                const normalizedRole = response.data?.user?.role?.toLowerCase() || selectedRoleLabel;
                localStorage.setItem('userRole', normalizedRole);
                localStorage.setItem('userEmail', email);

                // Notify parent if prop provided (optional compatibility)
                if (onLogin) onLogin(roles[selectedRole].label);

                // Navigate based on role
                if (normalizedRole === 'admin') {
                    navigate('/admin');
                } else if (normalizedRole === 'doctor') {
                    navigate('/doctor');
                } else {
                    // Default to home/dashboard for patients
                    navigate('/');
                }
            } else {
                setError(response.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    const currentRole = roles[selectedRole];

    return (
        <div className="unified-login-root">
            <div className="unified-login-card">
                {/* Logo & Branding */}
                <div className="unified-logo-section">
                    <div className="unified-logo-icon">
                        <span style={{ fontSize: '2rem' }}>🏥</span>
                    </div>
                    <h1 className="unified-brand">HealthCare Pro</h1>
                    <p className="unified-tagline">Smart Appointment & Patient Management System</p>
                </div>

                {/* Role Selection */}
                <div className="unified-section-title">Select Your Role</div>
                <div className="unified-role-tabs">
                    {roles.map((role, idx) => (
                        <button
                            key={role.label}
                            type="button"
                            className={`unified-role-tab ${idx === selectedRole ? 'active' : ''}`}
                            onClick={() => setSelectedRole(idx)}
                        >
                            <span className="unified-role-icon">{role.icon}</span>
                            <span className="unified-role-label">{role.label}</span>
                        </button>
                    ))}
                </div>

                <p className="unified-role-desc">{currentRole.description}</p>

                {/* Login Form */}
                <form className="unified-form" onSubmit={handleSubmit}>
                    <div className="unified-form-group">
                        <label className="unified-label">
                            <span className="unified-input-icon">✉️</span>
                            Email Address
                        </label>
                        <input
                            className="unified-input"
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="unified-form-group">
                        <label className="unified-label">
                            <span className="unified-input-icon">🔒</span>
                            Password
                        </label>
                        <input
                            className="unified-input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="unified-error">{error}</div>}

                    <button className="unified-submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : `Sign In as ${currentRole.label}`}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="unified-forgot">
                    <a href="#">Forgot your password?</a>
                </div>

                {currentRole.note && (
                    <div className={`unified-note ${currentRole.label === 'Doctor' ? 'doctor-note' : 'patient-note'}`}>
                        <strong>{currentRole.label === 'Doctor' ? 'Doctor Access:' : 'New Patient?'}</strong>{' '}
                        {currentRole.label === 'Doctor'
                            ? 'Your account is managed by the system administrator. Contact IT support if you need assistance.'
                            : 'Contact your healthcare provider or visit the front desk to get registered by an administrator.'}
                    </div>
                )}
            </div>
        </div>
    );
}
