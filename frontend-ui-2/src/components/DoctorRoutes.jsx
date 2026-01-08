import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const DoctorRoutes = () => {
    const token = localStorage.getItem('doctor_token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            // Optional: You could show a toast notification here
            // alert("Please login as a doctor to access this page.");
        }
    }, [token]);

    // If there's no token, redirect to login
    if (!token) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', marginTop: '100px' }}>
                <h2>Access Denied</h2>
                <p>You need to be logged in as a doctor to view this page.</p>
                <p>Please go back to the Dashboard and click "Doctor Login (Demo)".</p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#0f766e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Go to Dashboard
                </button>
            </div>
        );
        // Alternatively, uncomment below to auto-redirect
        // return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default DoctorRoutes;
