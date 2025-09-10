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
    },

    // Handle webhook (for testing purposes)
    handleWebhook: async (webhookData) => {
        const response = await api.post('/payment/webhook', webhookData);
        return response;
    }
};

// Transaction API calls
export const transactionAPI = {
    getAllTransactions: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/transactions?${queryString}` : '/transactions';
        const response = await api.get(url);
        return response;
    },

    getTransactionsBySchool: async (schoolId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/transactions/school/${schoolId}?${queryString}` : `/transactions/school/${schoolId}`;
        const response = await api.get(url);
        return response;
    },

    checkTransactionStatus: async (customOrderId) => {
        const response = await api.get(`/transactions/status/${customOrderId}`);
        return response;
    },

    getTransactionStats: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/transactions/stats?${queryString}` : '/transactions/stats';
        const response = await api.get(url);
        return response;
    }
};

// School Management API calls (additional functionality)
export const schoolAPI = {
    // Get school-specific transaction statistics
    getSchoolStats: async (schoolId, params = {}) => {
        const statsParams = { ...params, school_id: schoolId };
        return await transactionAPI.getTransactionStats(statsParams);
    },

    // Get recent transactions for a school
    getRecentTransactions: async (schoolId, limit = 10) => {
        return await transactionAPI.getTransactionsBySchool(schoolId, {
            limit,
            sort: 'payment_time',
            order: 'desc'
        });
    },

    // Get school transaction summary
    getTransactionSummary: async (schoolId, dateFrom, dateTo) => {
        const params = { school_id: schoolId };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        return await transactionAPI.getTransactionStats(params);
    }
};

// Search and Filter API calls
export const searchAPI = {
    // Search transactions globally
    searchTransactions: async (searchTerm, filters = {}) => {
        const params = { search: searchTerm, ...filters };
        return await transactionAPI.getAllTransactions(params);
    },

    // Filter transactions by status
    getTransactionsByStatus: async (status, params = {}) => {
        const filterParams = { status, ...params };
        return await transactionAPI.getAllTransactions(filterParams);
    },

    // Filter transactions by date range
    getTransactionsByDateRange: async (dateFrom, dateTo, params = {}) => {
        const dateParams = { date_from: dateFrom, date_to: dateTo, ...params };
        return await transactionAPI.getAllTransactions(dateParams);
    },

    // Filter transactions by payment mode
    getTransactionsByPaymentMode: async (paymentMode, params = {}) => {
        const modeParams = { payment_mode: paymentMode, ...params };
        return await transactionAPI.getAllTransactions(modeParams);
    }
};

// Analytics API calls
export const analyticsAPI = {
    // Get dashboard analytics
    getDashboardAnalytics: async (schoolId = null, dateFrom = null, dateTo = null) => {
        const params = {};
        if (schoolId) params.school_id = schoolId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const [stats, recentTransactions] = await Promise.all([
            transactionAPI.getTransactionStats(params),
            transactionAPI.getAllTransactions({
                ...params,
                limit: 5,
                sort: 'payment_time',
                order: 'desc'
            })
        ]);

        return {
            stats: stats.data.data,
            recentTransactions: recentTransactions.data.data.transactions || []
        };
    },

    // Get success rate analytics
    getSuccessRateAnalytics: async (schoolId = null, period = '7d') => {
        const dateTo = new Date();
        const dateFrom = new Date();

        switch (period) {
            case '7d':
                dateFrom.setDate(dateTo.getDate() - 7);
                break;
            case '30d':
                dateFrom.setDate(dateTo.getDate() - 30);
                break;
            case '90d':
                dateFrom.setDate(dateTo.getDate() - 90);
                break;
            default:
                dateFrom.setDate(dateTo.getDate() - 7);
        }

        const params = {
            date_from: dateFrom.toISOString().split('T')[0],
            date_to: dateTo.toISOString().split('T')[0]
        };

        if (schoolId) params.school_id = schoolId;

        return await transactionAPI.getTransactionStats(params);
    },

    // Get payment method analytics
    getPaymentMethodStats: async (schoolId = null, dateFrom = null, dateTo = null) => {
        const params = {};
        if (schoolId) params.school_id = schoolId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        return await transactionAPI.getAllTransactions({
            ...params,
            limit: 1000, // Get large dataset for analysis
        });
    }
};

// Utility API calls
export const utilityAPI = {
    // Health check
    healthCheck: async () => {
        const response = await api.get('/health');
        return response;
    },

    // Get server info
    getServerInfo: async () => {
        const response = await api.get('/');
        return response;
    },

    // Bulk operations
    bulkTransactionUpdate: async (transactionIds, updateData) => {
        // Note: This would need to be implemented in the backend
        const response = await api.put('/transactions/bulk-update', {
            transaction_ids: transactionIds,
            update_data: updateData
        });
        return response;
    },

    // Export transactions
    exportTransactions: async (format = 'csv', filters = {}) => {
        const params = { format, ...filters };
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/transactions/export?${queryString}`, {
            responseType: 'blob'
        });
        return response;
    }
};

// Payment Status Constants
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Payment Methods Constants
export const PAYMENT_METHODS = {
    CREDIT_CARD: 'card',
    DEBIT_CARD: 'card',
    NET_BANKING: 'netbanking',
    UPI: 'upi',
    WALLET: 'wallet',
    EMI: 'emi'
};

// Helper functions for API calls
export const apiHelpers = {
    // Build query parameters
    buildQueryParams: (params) => {
        const filtered = Object.entries(params)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        return new URLSearchParams(filtered).toString();
    },

    // Format date for API
    formatDateForAPI: (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return date.toISOString().split('T')[0];
    },

    // Handle API errors consistently
    handleAPIError: (error) => {
        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                message: error.response.data?.message || 'Server error',
                status: error.response.status,
                errors: error.response.data?.errors || []
            };
        } else if (error.request) {
            // Request made but no response
            return {
                success: false,
                message: 'Network error - please check your connection',
                status: 0
            };
        } else {
            // Something else happened
            return {
                success: false,
                message: error.message || 'An unexpected error occurred',
                status: 0
            };
        }
    },

    // Retry API call with exponential backoff
    retryAPICall: async (apiCall, maxRetries = 3, baseDelay = 1000) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                if (attempt === maxRetries) throw error;

                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};

// Legacy health API for backward compatibility
export const healthAPI = {
    check: utilityAPI.healthCheck
};
