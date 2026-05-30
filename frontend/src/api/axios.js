import axios from 'axios';
import { AUTH_LOGOUT_EVENT } from '../utils/authEvents';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/me');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));

      const publicPaths = ['/', '/login', '/register', '/register-patient', '/forgot-password'];
      if (!isAuthRequest && !publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getApiError = (error, fallback = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
