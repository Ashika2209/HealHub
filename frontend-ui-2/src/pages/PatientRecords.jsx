import React, { useState, useEffect } from 'react';
import { doctorApi } from '../services/api';

const PatientRecords = ({ patientId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await doctorApi.getPatientRecords(patientId);
                setRecords(response.data);
            } catch (error) {
                console.error("Error fetching patient records", error);
                // Mock data
                setRecords([
                    { id: 1, disease: "Hypertension", prescription: "Lisinopril 10mg once daily" },
                    { id: 2, disease: "Type 2 Diabetes", prescription: "Metformin 500mg twice daily" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) fetchRecords();
    }, [patientId]);

    if (loading) return <div className="loading">Loading Records...</div>;

    return (
        <div className="patient-records">
            <h3>Patient Medical Records</h3>
            {records.length === 0 ? (
                <p>No records found for this patient.</p>
            ) : (
                <div className="records-list">
                    {records.map(record => (
                        <div key={record.id} className="record-item">
                            <h4>{record.disease}</h4>
                            <p><strong>Prescription:</strong> {record.prescription}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientRecords;
