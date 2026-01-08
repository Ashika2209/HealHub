import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust to your backend URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the doctor token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('doctor_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const doctorApi = {
    getProfile: () => api.get('/doctors/profile/'),
    getAppointments: () => api.get('/doctors/appointments/'),
    updateAppointment: (id, status) => api.patch(`/doctors/appointments/${id}/`, { status }),
    getPatientRecords: (patientId) => api.get(`/doctors/patient/${patientId}/records/`),
};

export default api;
