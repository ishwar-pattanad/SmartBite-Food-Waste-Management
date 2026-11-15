import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartbite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  getDemoAccounts: async () => {
    const response = await api.get('/api/auth/demo-accounts');
    return response.data;
  },
};

// Inventory Services
export const inventoryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/inventory/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/inventory/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/inventory/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },
};

// Waste Recording Services
export const wasteAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/waste/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/waste/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/waste/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/waste/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/waste/${id}`);
    return response.data;
  },
};

// Analytics Services
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/api/analytics/dashboard-stats');
    return response.data;
  },
  getDailyTrends: async (days = 7) => {
    const response = await api.get(`/api/analytics/daily-trends?days=${days}`);
    return response.data;
  },
  getByCategory: async () => {
    const response = await api.get('/api/analytics/by-category');
    return response.data;
  },
  getByMealType: async () => {
    const response = await api.get('/api/analytics/by-meal-type');
    return response.data;
  },
  getTopWasted: async (limit = 6) => {
    const response = await api.get(`/api/analytics/top-wasted-items?limit=${limit}`);
    return response.data;
  },
  getWasteReasons: async () => {
    const response = await api.get('/api/analytics/waste-reasons');
    return response.data;
  },
  getRecentActivities: async (limit = 5) => {
    const response = await api.get(`/api/analytics/recent-activities?limit=${limit}`);
    return response.data;
  },
};

// Surplus Food Management Services
export const surplusAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/surplus/', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/surplus/', data);
    return response.data;
  },
  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/api/surplus/${id}/status`, statusData);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/surplus/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/surplus/${id}`);
    return response.data;
  },
};

// Suggestions Services
export const suggestionsAPI = {
  getAll: async () => {
    const response = await api.get('/api/suggestions/');
    return response.data;
  },
};

// Reports Services
export const reportsAPI = {
  getSummary: async (params = {}) => {
    const response = await api.get('/api/reports/summary', { params });
    return response.data;
  },
  getExportUrl: (period = 'weekly', mealType = '', startDate = '', endDate = '') => {
    const params = new URLSearchParams({ period });
    if (mealType && mealType !== 'All') params.append('meal_type', mealType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return `${API_BASE_URL}/api/reports/export-csv?${params.toString()}`;
  },
};

// Health Check
export const healthAPI = {
  checkHealth: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default api;
