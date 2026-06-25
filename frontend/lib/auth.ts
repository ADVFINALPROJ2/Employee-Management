import { apiClient } from './api';

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const authApi = {
  async login(email: string, password: string) {
    return apiClient.post('/auth/login', { email, password });
  },

  async logout() {
    const token = typeof window !== 'undefined' ? getToken() : null;
    return apiClient.post('/auth/logout', {}, token || undefined);
  },

  async forgotPassword(email: string) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async refresh() {
    const token = typeof window !== 'undefined' ? getToken() : null;
    return apiClient.post('/auth/refresh', {}, token || undefined);
  },
};