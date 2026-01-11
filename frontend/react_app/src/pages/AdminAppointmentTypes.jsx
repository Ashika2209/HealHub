import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { appointmentAPI } from '../services/api';
import './AdminDashboard.css'; // Reusing some base styles

export default function AdminAppointmentTypes({ setAdminLoggedIn }) {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const fetchTypes = async () => {
        try {
            setLoading(true);
            const response = await appointmentAPI.getAppointmentTypes();
            setTypes(response || []);
        } catch (err) {
            setError('Failed to fetch appointment types');
            console.error(err);
        } finally {
            setLoading(setLoading(false));
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleOpenModal = (type = null) => {
        if (type) {
            setEditingType(type);
            setFormData({ name: type.name, description: type.description || '' });
        } else {
            setEditingType(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingType(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingType) {
                await appointmentAPI.updateAppointmentType(editingType.id, formData);
            } else {
                await appointmentAPI.createAppointmentType(formData);
            }
            fetchTypes();
            handleCloseModal();
        } catch (err) {
            alert('Error saving appointment type: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this appointment type?')) return;
        try {
            await appointmentAPI.deleteAppointmentType(id);
            fetchTypes();
        } catch (err) {
            alert('Error deleting: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <AdminLayout active="appointment-types" setAdminLoggedIn={setAdminLoggedIn}>
            <div className="admin-page-container" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0 }}>Manage Appointment Types</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{ padding: '10px 20px', background: '#228be6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Add New Type
                    </button>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div style={{ color: 'red' }}>{error}</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                <th style={{ padding: '16px' }}>Name</th>
                                <th style={{ padding: '16px' }}>Description</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.map(type => (
                                <tr key={type.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{type.name}</td>
                                    <td style={{ padding: '16px', color: '#666' }}>{type.description || 'No description'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => handleOpenModal(type)}
                                            style={{ marginRight: '8px', padding: '6px 12px', background: '#fab005', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type.id)}
                                            style={{ padding: '6px 12px', background: '#fa5252', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {types.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No appointment types found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                            <h2>{editingType ? 'Edit' : 'Add'} Appointment Type</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                                    <input
                                        type="text"
                                        required
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Consultation"
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px' }}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Optional description"
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        style={{ padding: '10px 20px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ padding: '10px 20px', background: '#228be6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {editingType ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
