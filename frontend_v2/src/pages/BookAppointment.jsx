import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const BookAppointment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const preSelectedDoctor = searchParams.get('doctor') || '';
    const preSelectedSpec = searchParams.get('spec') || '';

    const [formData, setFormData] = useState({
        doctor: preSelectedDoctor,
        specialization: preSelectedSpec,
        date: '',
        time: '',
        reason: ''
    });

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (preSelectedDoctor) {
            setFormData(prev => ({ ...prev, doctor: preSelectedDoctor }));
        }
        if (preSelectedSpec) {
            setFormData(prev => ({ ...prev, specialization: preSelectedSpec }));
        }
    }, [preSelectedDoctor, preSelectedSpec]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Mock API call
        setTimeout(() => {
            navigate('/');
        }, 2000);
    };

    if (submitted) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="glass" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                    <h2 style={{ marginBottom: '16px' }}>Appointment Confirmed!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                        Your appointment with <strong>{formData.doctor || 'your doctor'}</strong> has been scheduled successfully.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">Book Appointment</h1>
                    <p className="section-subtitle">Schedule a consultation</p>
                </div>
            </header>

            <div className="glass" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label>Specialization</label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'white'
                                }}
                            >
                                <option value="">Select Specialization</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="General Medicine">General Medicine</option>
                                <option value="Pediatrics">Pediatrics</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Select Doctor</label>
                            <select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'white'
                                }}
                            >
                                <option value="">Select Doctor</option>
                                <option value="Dr. Sarah Smith">Dr. Sarah Smith</option>
                                <option value="Dr. John Doe">Dr. John Doe</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                onChange={handleChange}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Time</label>
                            <select
                                name="time"
                                required
                                onChange={handleChange}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'white'
                                }}
                            >
                                <option value="">Select Time</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reason for Visit</label>
                        <textarea
                            name="reason"
                            rows="4"
                            placeholder="Describe your symptoms..."
                            onChange={handleChange}
                            style={{
                                padding: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontFamily: 'inherit',
                                resize: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Confirm Booking</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
