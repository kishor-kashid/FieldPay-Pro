/**
 * API Service
 * Clean Scapes P4P System - Mobile App
 * 
 * Axios configuration with authentication header injection and error handling.
 */

import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Set auth token for API requests
 * This should be called after login to set the token
 */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

/**
 * Request interceptor to add auth token
 * Note: Token should be set via setAuthToken() after login
 */
api.interceptors.request.use(
  async (config) => {
    // Token should already be set via setAuthToken()
    // But we can also try to get it from AsyncStorage as fallback
    if (!config.headers.Authorization) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get token from storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      const networkError = {
        ...error,
        message: 'Network error. Please check your internet connection and try again.',
        type: 'network',
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle authentication errors (401)
    if (status === 401) {
      // Token expired or invalid
      // Clear token and redirect to login (handled by navigation)
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@user_profile');
      } catch (storageError) {
        console.error('Failed to clear storage:', storageError);
      }
      const authError = {
        ...error,
        message: data?.error || 'Authentication failed. Please log in again.',
        type: 'authentication',
      };
      return Promise.reject(authError);
    }

    // Handle authorization errors (403)
    if (status === 403) {
      const authError = {
        ...error,
        message: data?.error || 'You do not have permission to perform this action.',
        type: 'authorization',
      };
      return Promise.reject(authError);
    }

    // Handle validation errors (400)
    if (status === 400) {
      const validationError = {
        ...error,
        message: data?.error || 'Invalid request. Please check your input.',
        type: 'validation',
        details: data?.details || data?.errors,
      };
      return Promise.reject(validationError);
    }

    // Handle server errors (500+)
    if (status >= 500) {
      const serverError = {
        ...error,
        message: data?.error || 'Server error. Please try again later.',
        type: 'server',
      };
      return Promise.reject(serverError);
    }

    // Handle other errors
    const genericError = {
      ...error,
      message: data?.error || error.message || 'An error occurred. Please try again.',
      type: 'generic',
    };
    return Promise.reject(genericError);
  }
);

// Authentication APIs
export const authAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateLanguage: (language) => api.patch('/auth/language', { preferred_language: language }),
  verify: () => api.get('/auth/verify'),
};

// Payroll APIs
// Note: Crew members can only access their own records via /payroll/records
// The backend automatically filters by employee_id for crew_member role
export const payrollAPI = {
  // Get payroll records (for crew members, returns only their own records)
  getRecords: (params) => api.get('/payroll/records', { params }),
  // Get single payroll record by ID
  getRecord: (id) => api.get(`/payroll/records/${id}`),
  // Convenience method to get yesterday's record
  getYesterdayRecord: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split('T')[0];
    return api.get('/payroll/records', { params: { date } });
  },
  // Get last 30 days of records
  getHistory: (limit = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);
    return api.get('/payroll/records', {
      params: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
    });
  },
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;

