import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/apiService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
    AUTH_START: 'AUTH_START',
    AUTH_SUCCESS: 'AUTH_SUCCESS',
    AUTH_FAILURE: 'AUTH_FAILURE',
    LOGOUT: 'LOGOUT',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.AUTH_START:
            return {
                ...state,
                isLoading: true,
            };

        case AUTH_ACTIONS.AUTH_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
            };

        case AUTH_ACTIONS.AUTH_FAILURE:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                token: null,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
            };

        case AUTH_ACTIONS.UPDATE_PROFILE:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };

        default:
            return state;
    }
};

// Context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                try {
                    dispatch({ type: AUTH_ACTIONS.AUTH_START });

                    // Try to parse stored user data first
                    const parsedUser = JSON.parse(userData);

                    // Verify token by getting user profile
                    const response = await authAPI.getProfile();

                    dispatch({
                        type: AUTH_ACTIONS.AUTH_SUCCESS,
                        payload: {
                            user: response.data.user,
                            token: token,
                        },
                    });
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Token is invalid, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE });
                }
            } else {
                // No token or user data, set as not loading
                dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE });
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.AUTH_START });

            const response = await authAPI.login(credentials);

            console.log('Login response:', response);
            console.log('Token from response:', response.data.data.token);

            // Store token and user data
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            // Verify token was stored
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
            console.log('User stored in localStorage:', localStorage.getItem('user'));

            dispatch({
                type: AUTH_ACTIONS.AUTH_SUCCESS,
                payload: response.data,
            });

            toast.success('Login successful!');
            return response;
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE });
            throw error;
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.AUTH_START });

            const response = await authAPI.register(userData);

            // Store token and user data
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            dispatch({
                type: AUTH_ACTIONS.AUTH_SUCCESS,
                payload: response.data,
            });

            toast.success('Registration successful!');
            return response;
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE });
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.success('Logged out successfully!');
    };

    // Update profile function
    const updateProfile = async (userData) => {
        try {
            const response = await authAPI.updateProfile(userData);

            // Update local storage
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            dispatch({
                type: AUTH_ACTIONS.UPDATE_PROFILE,
                payload: response.data.user,
            });

            toast.success('Profile updated successfully!');
            return response;
        } catch (error) {
            throw error;
        }
    };

    // Change password function
    const changePassword = async (passwordData) => {
        try {
            const response = await authAPI.changePassword(passwordData);
            toast.success('Password changed successfully!');
            return response;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
