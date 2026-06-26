const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return data;
}

function getAuthToken() {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('token');
  return token || undefined;
}

export const apiClient = {
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const t = token ?? getAuthToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'GET', headers });
    return parseResponse(response);
  },

  async post(endpoint: string, body: Record<string, unknown> = {}, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const t = token ?? getAuthToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async patch(endpoint: string, body: Record<string, unknown> = {}, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const t = token ?? getAuthToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async delete(endpoint: string, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const t = token ?? getAuthToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return parseResponse(response);
  },
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  ping: () => apiClient.get(''),
  health: () => apiClient.get('/health'),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setUser = (user: { id: string; fullName: string; email: string; role: string }) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser: () => { id: string; fullName: string; email: string; role: string } | null = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout', {}),

  refresh: () =>
    apiClient.post('/auth/refresh', {}),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),
};

// ─── Employee ─────────────────────────────────────────────────────────────────

export interface EmployeeFilterQuery {
  search?: string;
  department_id?: string;
  status?: string;
  role?: string;
  employee_id?: string;
}

export const employeeApi = {
  getDepartments: () => apiClient.get('/employee/departments'),

  getAll: (query = '') => apiClient.get(`/employee${query}`),

  getOne: (id: string) => apiClient.get(`/employee/${id}`),

  create: (data: Record<string, unknown>) => apiClient.post('/employee/create', data),

  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/employee/${id}`, data),

  remove: (id: string) => apiClient.delete(`/employee/${id}`),
};

// ─── Users (Admin) ────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => apiClient.get('/users'),

  getOne: (id: string) => apiClient.get(`/users/${id}`),

  create: (data: Record<string, unknown>) => apiClient.post('/users', data),

  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/users/${id}`, data),

  remove: (id: string) => apiClient.delete(`/users/${id}`),
};

// ─── Leave ────────────────────────────────────────────────────────────────────

export const leaveApi = {
  create: (data: Record<string, unknown>) => apiClient.post('/leave', data),

  getBalance: () => apiClient.get('/leave/balance'),

  getHistory: () => apiClient.get('/leave/history'),
};

// ─── Grievance ────────────────────────────────────────────────────────────────

export const grievanceApi = {
  create: (data: Record<string, unknown>) => apiClient.post('/grievance', data),

  getAll: () => apiClient.get('/grievance'),

  updateStatus: (id: string, data: Record<string, unknown>) => apiClient.patch(`/grievance/${id}`, data),
};
