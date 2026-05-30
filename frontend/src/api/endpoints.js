import api from './axios';

/** Auth — POST /api/auth/* */
export const authApi = {
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  forgotPassword: (phone) => api.post('/auth/forgot-password', { phone }),
  verifyResetOtp: (phone, otp) => api.post('/auth/verify-reset-otp', { phone, otp }),
  resetPassword: (phone, password) => api.post('/auth/reset-password', { phone, password }),
};

/** User — GET|PUT /api/user/:id */
export const userApi = {
  getById: (id) => api.get(`/user/${id}`),
  update: (id, payload) => api.put(`/user/${id}`, payload),
};

/** Blood requests — /api/request/* */
export const requestApi = {
  create: (payload) => api.post('/request/create', payload),
  nearby: () => api.get('/request/nearby'),
  mine: () => api.get('/request/mine'),
  active: () => api.get('/request/active'),
  accept: (id) => api.put(`/request/accept/${id}`),
  cancel: (id) => api.put(`/request/cancel/${id}`),
  complete: (id) => api.put(`/request/complete/${id}`),
};

/** Notifications — /api/notifications/:userId */
export const notificationApi = {
  list: (userId) => api.get(`/notifications/${userId}`),
  markRead: (userId) => api.put(`/notifications/${userId}/read`),
};

/** Admin — /api/admin/* */
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  requests: () => api.get('/admin/requests'),
};

/** Health check */
export const healthApi = {
  check: () => api.get('/health'),
};
