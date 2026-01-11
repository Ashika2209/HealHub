import React, { useState, useEffect } from 'react';
import OwnerLayout from './OwnerLayout';
import { ownerAPI } from '../services/api';
import './OwnerAnalytics.css';

export default function OwnerAnalytics({ onLogout }) {
    const [analytics, setAnalytics] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [analyticsRes, upcomingRes] = await Promise.all([
                    ownerAPI.getHospitalAnalytics(),
                    ownerAPI.getUpcomingAppointments()
                ]);

                if (analyticsRes.success) setAnalytics(analyticsRes.data);
                if (upcomingRes.success) setUpcoming(upcomingRes.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <OwnerLayout active="analytics" onLogout={onLogout}>
            <div className="owner-analytics-root">
                <header className="owner-page-header">
                    <h1 className="owner-welcome">Analytics</h1>
                    <p className="owner-subtitle">Here's what's happening in your hospital today.</p>
                </header>

                <section className="analytics-section">
                    <h2 className="section-title">Hospital Analytics</h2>

                    {loading ? (
                        <div className="loading-state">Gathering analytics data...</div>
                    ) : (
                        <>
                            <div className="analytics-stats-grid">
                                <div className="analytics-mini-card">
                                    <span className="mini-card-label">Avg. Consultation Time</span>
                                    <span className="mini-card-value">{analytics?.avg_consultation_time}</span>
                                </div>
                                <div className="analytics-mini-card">
                                    <span className="mini-card-label">Bed Occupancy Rate</span>
                                    <span className="mini-card-value">{analytics?.bed_occupancy?.rate}</span>
                                    <span className="mini-card-sub">{analytics?.bed_occupancy?.occupied} occupied / {analytics?.bed_occupancy?.total} Total</span>
                                </div>
                                <div className="analytics-mini-card">
                                    <span className="mini-card-label">Patient Satisfaction</span>
                                    <span className="mini-card-value">{analytics?.patient_satisfaction}</span>
                                    <span className="mini-card-sub">Based on feedback</span>
                                </div>
                                <div className="analytics-mini-card">
                                    <span className="mini-card-label">Staff Utilization</span>
                                    <span className="mini-card-value">{analytics?.staff_utilization}</span>
                                    <span className="mini-card-sub">Active doctors</span>
                                </div>

                            </div>

                            <div className="charts-row">
                                <div className="chart-container">
                                    <h3 className="chart-title">Patient Visits by Specialization</h3>
                                    <div className="bar-chart-vertical">
                                        {analytics?.patient_type_breakdown?.map((item, idx) => {
                                            const maxTotal = Math.max(...(analytics?.patient_type_breakdown?.map(i => i.total) || [1]));
                                            const inpatientWidth = (item.inpatients / maxTotal) * 100;
                                            const outpatientWidth = (item.outpatients / maxTotal) * 100;

                                            return (
                                                <div key={idx} className="bar-row">
                                                    <span className="bar-label">{item.specialization}</span>
                                                    <div className="bar-wrapper" style={{ display: 'flex', gap: '0' }}>
                                                        <div
                                                            className="bar-fill"
                                                            style={{
                                                                width: `${inpatientWidth}%`,
                                                                background: '#7c3aed',
                                                                borderRadius: '4px 0 0 4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                minHeight: '32px'
                                                            }}
                                                        >
                                                            {item.inpatients > 0 && item.inpatients}
                                                        </div>
                                                        <div
                                                            className="bar-fill"
                                                            style={{
                                                                width: `${outpatientWidth}%`,
                                                                background: '#c4b5fd',
                                                                borderRadius: '0 4px 4px 0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#1f2937',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                minHeight: '32px'
                                                            }}
                                                        >
                                                            {item.outpatients > 0 && item.outpatients}
                                                        </div>
                                                    </div>
                                                    <span className="bar-value" style={{ minWidth: '40px' }}>{item.total}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '16px', height: '16px', background: '#7c3aed', borderRadius: '3px' }}></div>
                                            <span>Inpatients</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '16px', height: '16px', background: '#c4b5fd', borderRadius: '3px' }}></div>
                                            <span>Outpatients</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3 className="chart-title">Appointment Trends (Monthly)</h3>
                                    <div className="bar-chart-vertical">
                                        {analytics?.appointment_trends?.map((item, idx) => (
                                            <div key={idx} className="bar-row">
                                                <span className="bar-label">{item.month}</span>
                                                <div className="bar-wrapper">
                                                    <div
                                                        className="bar-fill"
                                                        style={{ width: `${(item.count / Math.max(...(analytics?.appointment_trends?.map(i => i.count) || [1]))) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="bar-value">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                            </div>

                            <div className="charts-row" style={{ marginTop: '24px' }}>
                                {/* Department Distribution Donut Chart */}
                                <div className="chart-container" style={{ flex: '0 0 48%' }}>
                                    <h3 className="chart-title">Staff Distribution by Department</h3>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                                        {analytics?.department_distribution && analytics.department_distribution.length > 0 ? (
                                            <div style={{ position: 'relative', width: '250px', height: '250px' }}>
                                                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                                    {(() => {
                                                        const total = analytics.department_distribution.reduce((sum, d) => sum + d.count, 0);
                                                        let currentAngle = 0;
                                                        const colors = ['#7c3aed', '#a78bfa', '#c4b5fd', '#60a5fa', '#34d399', '#fbbf24'];

                                                        return analytics.department_distribution.map((dept, idx) => {
                                                            const percentage = (dept.count / total) * 100;
                                                            const angle = (percentage / 100) * 360;
                                                            const startAngle = currentAngle;
                                                            const endAngle = currentAngle + angle;

                                                            const startRad = (startAngle * Math.PI) / 180;
                                                            const endRad = (endAngle * Math.PI) / 180;

                                                            const x1 = 50 + 40 * Math.cos(startRad);
                                                            const y1 = 50 + 40 * Math.sin(startRad);
                                                            const x2 = 50 + 40 * Math.cos(endRad);
                                                            const y2 = 50 + 40 * Math.sin(endRad);

                                                            const largeArc = angle > 180 ? 1 : 0;

                                                            const pathData = [
                                                                `M 50 50`,
                                                                `L ${x1} ${y1}`,
                                                                `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                                                                `Z`
                                                            ].join(' ');

                                                            currentAngle = endAngle;

                                                            return (
                                                                <path
                                                                    key={idx}
                                                                    d={pathData}
                                                                    fill={colors[idx % colors.length]}
                                                                    stroke="white"
                                                                    strokeWidth="0.5"
                                                                />
                                                            );
                                                        });
                                                    })()}
                                                    <circle cx="50" cy="50" r="20" fill="white" />
                                                </svg>
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                        {analytics.department_distribution.reduce((sum, d) => sum + d.count, 0)}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>No data available</div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                                        {analytics?.department_distribution?.map((dept, idx) => {
                                            const colors = ['#7c3aed', '#a78bfa', '#c4b5fd', '#60a5fa', '#34d399', '#fbbf24'];
                                            const total = analytics.department_distribution.reduce((sum, d) => sum + d.count, 0);
                                            const percentage = total > 0 ? ((dept.count / total) * 100).toFixed(1) : "0";

                                            return (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                    <div style={{ width: '12px', height: '12px', background: colors[idx % colors.length], borderRadius: '2px' }}></div>
                                                    <span>{dept.department} - {dept.count} ({percentage}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Salary/Rating Heatmap */}
                                <div className="chart-container" style={{ flex: '0 0 48%' }}>
                                    <h3 className="chart-title">Staff by Salary Range & Performance</h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Salary</th>
                                                    {[1, 2, 3, 4, 5].map(rating => (
                                                        <th key={rating} style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>
                                                            {'⭐'.repeat(rating)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics?.salary_rating_heatmap?.map((row, idx) => {
                                                    const maxCount = Math.max(...Object.values(row.ratings));

                                                    return (
                                                        <tr key={idx}>
                                                            <td style={{ padding: '8px', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
                                                                {row.salary_range}
                                                            </td>
                                                            {[1, 2, 3, 4, 5].map(rating => {
                                                                const count = row.ratings[rating] || 0;
                                                                const intensity = maxCount > 0 ? (count / maxCount) : 0;
                                                                const bgColor = `rgba(124, 58, 237, ${0.1 + intensity * 0.7})`;

                                                                return (
                                                                    <td
                                                                        key={rating}
                                                                        style={{
                                                                            padding: '12px',
                                                                            textAlign: 'center',
                                                                            background: bgColor,
                                                                            borderBottom: '1px solid #e5e7eb',
                                                                            fontWeight: count > 0 ? '600' : '400',
                                                                            color: intensity > 0.5 ? 'white' : '#1f2937'
                                                                        }}
                                                                    >
                                                                        {count > 0 ? count : '-'}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
                                        Darker shades indicate higher employee counts
                                    </div>
                                </div>
                            </div>

                            <div className="upcoming-section" style={{ marginTop: '24px' }}>
                                <h3 className="chart-title">Upcoming Appointments</h3>
                                <div className="appointments-table-wrapper">
                                    <table className="appointments-table">
                                        <thead>
                                            <tr>
                                                <th>Doctor Name</th>
                                                <th>Specialization</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {upcoming.map((appt) => (
                                                <tr key={appt.id}>
                                                    <td>{appt.doctor_name}</td>
                                                    <td>{appt.specialization}</td>
                                                    <td>{appt.date}</td>
                                                    <td>
                                                        <span className={`status-pill ${appt.status.toLowerCase()}`}>
                                                            {appt.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {upcoming.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="empty-table">No upcoming appointments found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </OwnerLayout>
    );
}
