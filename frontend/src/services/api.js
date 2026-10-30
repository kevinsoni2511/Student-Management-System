/**
 * Centralized API Service for communicating with Laravel 12 Backend
 * Base URL defaults to http://127.0.0.1:8000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const tokenStorage = {
  get: () => localStorage.getItem('sms_auth_token'),
  set: (token) => localStorage.setItem('sms_auth_token', token),
  remove: () => localStorage.removeItem('sms_auth_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('sms_auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('sms_auth_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('sms_auth_user')
};

/**
 * Universal fetch wrapper with auto Authorization header and error handling
 */
export async function request(endpoint, options = {}) {
  const token = tokenStorage.get();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status} Error`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      const networkErr = new Error('Cannot connect to Laravel backend at ' + API_BASE_URL + '. Ensure `php artisan serve` is running.');
      networkErr.isNetworkError = true;
      throw networkErr;
    }
    throw err;
  }
}

// ----------------- Authentication Endpoints -----------------
export const authApi = {
  login: (credentials) => request('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me', { method: 'GET' })
};

// ----------------- Dashboard Endpoints -----------------
export const dashboardApi = {
  getStats: () => request('/dashboard/statistics', { method: 'GET' }),
  getRecentStudents: () => request('/dashboard/recent-students', { method: 'GET' }),
  getAttendanceSummary: () => request('/dashboard/attendance-summary', { method: 'GET' })
};

// ----------------- Student Endpoints -----------------
export const studentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/students?${query.toString()}`, { method: 'GET' });
  },
  getById: (id) => request(`/students/${id}`, { method: 'GET' }),
  create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/students/${id}`, { method: 'DELETE' })
};

// ----------------- Course Endpoints -----------------
export const coursesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/courses?${query.toString()}`, { method: 'GET' });
  },
  getById: (id) => request(`/courses/${id}`, { method: 'GET' }),
  create: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/courses/${id}`, { method: 'DELETE' })
};

// ----------------- Attendance Endpoints -----------------
export const attendanceApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/attendance?${query.toString()}`, { method: 'GET' });
  },
  save: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/summary?${query}`, { method: 'GET' });
  }
};
