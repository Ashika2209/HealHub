import React, { useState, useEffect } from 'react';
import OwnerLayout from './OwnerLayout';
import { ownerAPI } from '../services/api';
import './OwnerDoctors.css';

export default function OwnerDoctors({ onLogout }) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await ownerAPI.getDoctorPerformance();
                if (response.success) {
                    setDoctors(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch doctor performance:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <OwnerLayout active="doctors" onLogout={onLogout}>
            <div className="owner-doctors-root">
                <header className="owner-page-header">
                    <h1 className="owner-welcome">Doctors</h1>
                    <p className="owner-subtitle">Here's what's happening in your hospital today.</p>
                </header>

                <section className="owner-doctors-section">
                    <h2 className="section-title">Medical Staff Performance</h2>

                    {loading ? (
                        <div className="loading-state">Loading medical staff data...</div>
                    ) : (
                        <div className="owner-doctors-grid">
                            {doctors.map((doctor) => (
                                <div key={doctor.id} className="doctor-perf-card">
                                    <div className="doctor-perf-header">
                                        <div className="doctor-perf-avatar">👨‍⚕️</div>
                                        <div className="doctor-perf-info">
                                            <h3 className="doctor-perf-name">{doctor.name}</h3>
                                            <span className="doctor-perf-spec">{doctor.specialization}</span>
                                        </div>
                                    </div>

                                    <div className="doctor-perf-stats">
                                        <div className="perf-stat-item">
                                            <span className="perf-stat-label">Working Hours</span>
                                            <span className="perf-stat-value">{doctor.working_hours}</span>
                                        </div>
                                        <div className="perf-stat-item">
                                            <span className="perf-stat-label">Patients</span>
                                            <span className="perf-stat-value count">{doctor.patient_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </OwnerLayout>
    );
}
