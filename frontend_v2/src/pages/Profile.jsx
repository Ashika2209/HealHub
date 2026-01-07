import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, Heart, Shield, Edit2, Save, X } from 'lucide-react';
import '../styles/dashboard.css'; // Reusing dashboard styles for glass effect

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        user: { first_name: '', last_name: '', email: '' },
        phone_number: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        city: '',
        state: '',
        allergies: '',
        current_medications: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await patientAPI.getProfile();
            setProfile(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile. Please try again.');
            setLoading(false);
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await patientAPI.updateProfile(profile);
            setIsEditing(false);
            // Optional: Show success message/toast
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        }
    };

    if (loading) return <div className="page-container center-content">Loading profile...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="section-title">My Profile</h1>
                    <p className="section-subtitle">Manage your personal and medical information</p>
                </div>
                {!isEditing ? (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        <Edit2 size={18} style={{ marginRight: '8px' }} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={() => { setIsEditing(false); fetchProfile(); }}>
                            <X size={18} style={{ marginRight: '8px' }} /> Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <Save size={18} style={{ marginRight: '8px' }} /> Save Changes
                        </button>
                    </div>
                )}
            </header>

            {error && <div className="error-message">{error}</div>}

            <div className="profile-grid">
                {/* Personal Info Card */}
                <section className="glass p-6">
                    <h3 className="card-title flex items-center gap-2 mb-4 text-blue-500 font-semibold text-lg">
                        <User className="text-blue-500" /> Personal Information
                    </h3>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={`${profile.user?.first_name} ${profile.user?.last_name}`}
                                disabled
                                className="input-field disabled"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={profile.user?.email}
                                disabled
                                className="input-field disabled"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={profile.phone_number || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`input-field pl-10 ${!isEditing ? 'disabled' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={profile.date_of_birth || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`input-field pl-10 ${!isEditing ? 'disabled' : ''}`}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Medical Info Card */}
                <section className="glass p-6 mt-6">
                    <h3 className="card-title flex items-center gap-2 mb-4 text-red-500 font-semibold text-lg">
                        <Heart className="text-red-500" /> Medical Information
                    </h3>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Blood Group</label>
                            <select
                                name="blood_group"
                                value={profile.blood_group || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing ? 'disabled' : ''}`}
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                name="gender"
                                value={profile.gender || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing ? 'disabled' : ''}`}
                            >
                                <option value="">Select Gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Allergies</label>
                            <textarea
                                name="allergies"
                                value={profile.allergies || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                rows="2"
                                className={`input-field ${!isEditing ? 'disabled' : ''}`}
                                placeholder="List any known allergies..."
                            />
                        </div>
                    </div>
                </section>

                {/* Address Card */}
                <section className="glass p-6 mt-6">
                    <h3 className="card-title flex items-center gap-2 mb-4 text-green-500 font-semibold text-lg">
                        <MapPin className="text-green-500" /> Address Details
                    </h3>
                    <div className="profile-grid">
                        <div className="form-group">
                            <label>Street Address</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing ? 'disabled' : ''}`}
                            />
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`input-field ${!isEditing ? 'disabled' : ''}`}
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={profile.state || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`input-field ${!isEditing ? 'disabled' : ''}`}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;
