import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request interceptor - Token from localStorage:', token);
        console.log('API Request interceptor - Request URL:', config.url);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request interceptor - Authorization header set:', config.headers.Authorization);
        } else {
            console.log('API Request interceptor - No token found in localStorage');
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || 'An error occurred';

        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
            return Promise.reject(error);
        }

        // Handle other errors
        if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (error.response?.status >= 400) {
            toast.error(message);
        } else if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout. Please try again.');
        } else if (!error.response) {
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;
