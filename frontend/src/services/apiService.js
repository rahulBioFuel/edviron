import api from './api';

// Auth API calls
export const authAPI = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        return response;
    },

    changePassword: async (passwordData) => {
        const response = await api.put('/auth/change-password', passwordData);
        return response;
    }
};

// Payment API calls
export const paymentAPI = {
    createPayment: async (paymentData) => {
        const response = await api.post('/payment/create-payment', paymentData);
        return response;
    },

    verifyPayment: async (verificationData) => {
        const response = await api.post('/payment/verify-payment', verificationData);
        return response;
    },

    getPaymentDetails: async (orderId) => {
        const response = await api.get(`/payment/details/${orderId}`);
        return response;
    }
};

// Transaction API calls
export const transactionAPI = {
    getAllTransactions: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/transactions?${queryString}`);
        return response;
    },

    getTransactionsBySchool: async (schoolId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/transactions/school/${schoolId}?${queryString}`);
        return response;
    },

    checkTransactionStatus: async (customOrderId) => {
        const response = await api.get(`/transactions/status/${customOrderId}`);
        return response;
    },

    getTransactionStats: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/transactions/stats?${queryString}`);
        return response;
    }
};

// Health check
export const healthAPI = {
    check: async () => {
        const response = await api.get('/health');
        return response;
    }
};
