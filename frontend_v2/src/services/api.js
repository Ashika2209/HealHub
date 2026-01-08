import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

export const getUserRole = () => {
    return localStorage.getItem('userRole');
};

export const saveAuthData = (data) => {
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role) localStorage.setItem('userRole', data.user.role);
    }
};

export const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
};

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/api/accounts/token/refresh/`, {
                        refresh: refreshToken
                    });
                    if (response.status === 200) {
                        localStorage.setItem('access_token', response.data.access);
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Token refresh failed", refreshError);
                clearAuthData();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Helper for standardized API calls
const apiRequest = async (method, url, data = null, config = {}) => {
    try {
        const requestConfig = { method, url, ...config };
        if (method.toLowerCase() === 'get' && data) {
            requestConfig.params = data;
        } else {
            requestConfig.data = data;
        }

        const response = await api(requestConfig);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || error.response?.data?.error || error.message
        };
    }
};

export const authAPI = {
    login: (email, password, role) => apiRequest('post', '/api/accounts/login/', { email, password, role }),
    logout: () => {
        const refresh = localStorage.getItem('refresh_token');
        clearAuthData(); // Clear local first
        return apiRequest('post', '/api/accounts/logout/', { refresh });
    },
};

export const adminAPI = {
    getDashboardStats: () => apiRequest('get', '/api/accounts/admin/dashboard/stats/'),
    getDoctorsList: () => apiRequest('get', '/api/doctors/'),
    getPatientsList: () => apiRequest('get', '/api/patients/'),
    getAppointments: () => apiRequest('get', '/api/appointments/'),
    deleteDoctor: (id) => apiRequest('delete', `/api/doctors/${id}/`),
    deletePatient: (id) => apiRequest('delete', `/api/patients/${id}/`),
    deleteAppointment: (id) => apiRequest('delete', `/api/appointments/${id}/`),
    cancelAppointment: (id, reason) => apiRequest('post', `/api/appointments/${id}/cancel/`, { reason }),
};

export const doctorAPI = {
    getDoctors: () => apiRequest('get', '/api/doctors/'),
    getPatients: () => apiRequest('get', '/api/doctor/patients/'),
};

export const appointmentAPI = {
    getDepartments: () => apiRequest('get', '/api/appointments/departments/'),
    getDoctorsByDepartment: (dept) => apiRequest('get', `/api/doctors/?department=${dept}`),
    getAvailableSlots: (params) => apiRequest('get', '/api/appointments/slots/', params),
    create: (data) => apiRequest('post', '/api/appointments/create/', data),
};

export const patientAPI = {
    getProfile: () => apiRequest('get', '/api/patients/profile/'),
    updateProfile: (data) => apiRequest('put', '/api/patients/profile/', data),
    getAppointments: () => apiRequest('get', '/api/patients/appointments/'),
    getMedicalRecords: () => apiRequest('get', '/api/patients/records/'),
};

export default api;
