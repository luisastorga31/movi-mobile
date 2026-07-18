import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://movi-backend-production-870e.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Agregar token a cada request automáticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const tripService = {
  request: (data) => api.post('/trips', data),
  getAvailable: () => api.get('/trips/available'),
  accept: (id) => api.put(`/trips/${id}/accept`),
  updateStatus: (id, status) => api.put(`/trips/${id}/status`, { status }),
  myTrips: () => api.get('/trips/my-trips'),
};

export const driverService = {
  registerProfile: (data) => api.post('/drivers/profile', data),
  getProfile: () => api.get('/drivers/profile'),
  getAvailable: () => api.get('/drivers/available'),
};

export default api;