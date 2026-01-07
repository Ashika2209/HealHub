import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { FileText, User, Pill, Activity } from 'lucide-react';
import '../styles/dashboard.css';

const MedicalRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await patientAPI.getMedicalRecords();
            setRecords(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load medical records. Please try again.');
            setLoading(false);
            console.error(err);
        }
    };

    if (loading) return <div className="page-container center-content">Loading medical records...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">Medical Records</h1>
                    <p className="section-subtitle">Your medical history and prescriptions</p>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            {records.length === 0 && !loading ? (
                <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                    <FileText size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                    <h3>No records found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Your medical history will appear here.</p>
                </div>
            ) : (
                <div className="profile-grid">
                    {records.map((record, index) => (
                        <div key={record.id || index} className="update-item glass" style={{ display: 'block', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'var(--bg-app)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', border: '1px solid var(--border-subtle)',
                                    color: 'var(--primary)', flexShrink: 0
                                }}>
                                    <Activity size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                            {record.condition || record.disease}
                                        </h3>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{record.date}</span>
                                    </div>

                                    <div className="form-grid-2" style={{ marginTop: '16px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <User size={18} style={{ color: 'var(--text-secondary)', marginTop: '4px' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Doctor</p>
                                                <p style={{ color: 'var(--text-main)' }}>{record.doctor_name || `Dr. ${record.doctor?.user?.last_name || 'Unknown'}`}</p>
                                            </div>
                                        </div>

                                        {record.treatment && (
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <Pill size={18} style={{ color: 'var(--text-secondary)', marginTop: '4px' }} />
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Treatment</p>
                                                    <p style={{ color: 'var(--text-main)' }}>{record.treatment || record.prescription}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {record.description && (
                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{record.description}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;
