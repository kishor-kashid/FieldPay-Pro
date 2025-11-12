import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateLanguage: (language) => api.patch('/auth/language', { language }),
};

// Payroll APIs
export const payrollAPI = {
  analyze: (date) => api.post('/payroll/analyze', { date }),
  process: (date, reprocess = false) => api.post('/payroll/process', { date, reprocess }),
  getRecords: (params) => api.get('/payroll/records', { params }),
  getRecord: (id) => api.get(`/payroll/records/${id}`),
  approveRecord: (id, notes) => api.put(`/payroll/records/${id}/approve`, { admin_notes: notes }),
  deleteRecord: (id) => api.delete(`/payroll/records/${id}`),
  exportCSV: (params) => api.get('/payroll/export', { params, responseType: 'blob' }),
  getSummary: (params) => api.get('/payroll/summary', { params }),
  getExecutions: (params) => api.get('/payroll/executions', { params }),
  getExecution: (id) => api.get(`/payroll/executions/${id}`),
  getExecutionStats: () => api.get('/payroll/executions/stats'),
};

// User APIs
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.patch(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteReadNotifications: () => api.delete('/notifications/read'),
};

// Upload APIs
export const uploadAPI = {
  uploadServiceAutopilot: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/service-autopilot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadPaychex: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/paychex', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

