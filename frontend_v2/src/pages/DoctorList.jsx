import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css'; // Reuse dashboard styles for cards

const DoctorList = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    const doctors = [
        { id: 1, name: 'Dr. Sarah Smith', specialization: 'Cardiology', experience: '15 years', rating: 4.9, image: '👩‍⚕️' },
        { id: 2, name: 'Dr. John Doe', specialization: 'General Medicine', experience: '8 years', rating: 4.7, image: '👨‍⚕️' },
        { id: 3, name: 'Dr. Emily Johnson', specialization: 'Pediatrics', experience: '12 years', rating: 4.8, image: '👩‍⚕️' },
        { id: 4, name: 'Dr. Michael Chen', specialization: 'Neurology', experience: '20 years', rating: 5.0, image: '👨‍⚕️' },
        { id: 5, name: 'Dr. Lisa Wong', specialization: 'Dermatology', experience: '6 years', rating: 4.6, image: '👩‍⚕️' },
        { id: 6, name: 'Dr. David Wilson', specialization: 'Cardiology', experience: '10 years', rating: 4.8, image: '👨‍⚕️' }
    ];

    const specializations = ['All', 'Cardiology', 'General Medicine', 'Pediatrics', 'Neurology', 'Dermatology'];

    const filteredDoctors = filter === 'All'
        ? doctors
        : doctors.filter(doc => doc.specialization === filter);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">Find a Doctor</h1>
                    <p className="section-subtitle">Book appointments with top specialists</p>
                </div>
            </header>

            <div className="filter-bar glass" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
                {specializations.map(spec => (
                    <button
                        key={spec}
                        className={`btn ${filter === spec ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter(spec)}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            <div className="doctors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="doctor-card glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {doctor.image}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{doctor.name}</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: '500' }}>{doctor.specialization}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>⭐ {doctor.rating}</span>
                                    <span>•</span>
                                    <span>{doctor.experience}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: 'auto' }}
                            onClick={() => navigate(`/book?doctor=${doctor.name}&spec=${doctor.specialization}`)}
                        >
                            Book Appointment
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorList;
