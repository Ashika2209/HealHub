import React, { useEffect, useState } from 'react';
import { hospitalAPI } from '../services/api';
import './BranchSelector.css';

const BranchSelector = ({ onBranchSelect }) => {
    const [hospitals, setHospitals] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    useEffect(() => {
        // Check if branch is already selected
        const storedBranch = localStorage.getItem('selected_hospital');
        if (storedBranch) {
            setSelectedBranch(JSON.parse(storedBranch));
        } else {
            setIsOpen(true); // Open modal if no branch selected
        }

        // Fetch hospitals
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const response = await hospitalAPI.getHospitals();
            if (response.success) {
                // Handle pagination (results) or flat list
                const data = response.data.results || response.data;
                setHospitals(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch hospitals", error);
            // Fallback for debugging
            setHospitals([]);
        }
    };

    const handleSelect = (hospital) => {
        localStorage.setItem('selected_hospital', JSON.stringify(hospital));
        setSelectedBranch(hospital);
        setIsOpen(false);
        if (onBranchSelect) onBranchSelect(hospital);
        window.location.reload(); // Simple way to refresh context for Chatbot
    };

    // Allow re-selecting
    const openSelector = () => setIsOpen(true);

    if (isOpen) {
        return (
            <div className="branch-modal-overlay">
                <div className="branch-modal">
                    <h2>Select Your Hospital Branch</h2>
                    <p>Please choose the branch nearest to you to find doctors.</p>
                    <div className="branch-list">
                        {hospitals.map(h => (
                            <button key={h.id} className="branch-btn" onClick={() => handleSelect(h)}>
                                <h3>{h.name}</h3>
                                <span>{h.city}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="current-branch-display" onClick={openSelector}>
            📍 {selectedBranch ? selectedBranch.name : "Select Branch"}
        </div>
    );
};

export default BranchSelector;
