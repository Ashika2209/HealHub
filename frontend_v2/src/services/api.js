import axios from 'axios';

// Base URL for Backend
// Assuming the backend is running on the default Django port 8000
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (assuming key is 'access_token')
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // OPTIONAL: Add token refresh logic here if backend supports it
            // For now, we will just redirect to login if unauthorized
            // window.location.href = '/login'; 
        }

        return Promise.reject(error);
    }
);

export const patientAPI = {
    // Get Patient Dashboard/Profile
    getProfile: () => api.get('/patients/profile/'),

    // Update Patient Profile
    updateProfile: (data) => api.put('/patients/profile/', data),

    // Get Appointments
    getAppointments: () => api.get('/patients/appointments/'),

    // Get Medical Records
    getMedicalRecords: () => api.get('/patients/records/'),

    // Login (if needed for initial testing, though usually handled by auth flow)
    login: (credentials) => api.post('/accounts/login/', credentials),
};

export default api;
