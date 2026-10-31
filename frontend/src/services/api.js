/**
 * Centralized API Service for communicating with Laravel 12 Backend
 * Reverse-proxied via Vite on /api -> http://127.0.0.1:8000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
      const networkErr = new Error('Cannot connect to Laravel backend. Ensure `php artisan serve` is running on port 8000.');
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
  getStats: () => request('/dashboard/statistics', { method: 'GET' })
};

// ----------------- Academic Structure Endpoints -----------------
export const academicsApi = {
  getSessions: () => request('/academic/sessions', { method: 'GET' }),
  getClasses: () => request('/academic/classes', { method: 'GET' }),
  createClass: (data) => request('/academic/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id, data) => request(`/academic/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id) => request(`/academic/classes/${id}`, { method: 'DELETE' }),
  getSections: (classId) => {
    const q = classId ? `?class_id=${classId}` : '';
    return request(`/academic/sections${q}`, { method: 'GET' });
  },
  createSection: (data) => request('/academic/sections', { method: 'POST', body: JSON.stringify(data) }),
  getSubjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/academic/subjects?${query}`, { method: 'GET' });
  },
  createSubject: (data) => request('/academic/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id, data) => request(`/academic/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id) => request(`/academic/subjects/${id}`, { method: 'DELETE' })
};

// ----------------- Student Lifecycle Endpoints -----------------
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
  delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  getFormOptions: () => request('/students/form-options', { method: 'GET' })
};

// ----------------- Teachers / Faculty Endpoints -----------------
export const teachersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/teachers?${query}`, { method: 'GET' });
  },
  getById: (id) => request(`/teachers/${id}`, { method: 'GET' }),
  create: (data) => request('/teachers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/teachers/${id}`, { method: 'DELETE' })
};

// ----------------- Daily Attendance Endpoints -----------------
export const attendanceApi = {
  getStudentSheet: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/student-sheet?${query}`, { method: 'GET' });
  },
  bulkSaveStudent: (data) => request('/attendance/student-bulk', { method: 'POST', body: JSON.stringify(data) }),
  getStudentSummary: () => request('/attendance/student-summary', { method: 'GET' })
};

// ----------------- Fee Management & Receipt Endpoints -----------------
export const feesApi = {
  getStructures: () => request('/fees/structures', { method: 'GET' }),
  createStructure: (data) => request('/fees/structures', { method: 'POST', body: JSON.stringify(data) }),
  getStudentFees: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/fees/student-fees?${query}`, { method: 'GET' });
  },
  collectPayment: (data) => request('/fees/collect', { method: 'POST', body: JSON.stringify(data) }),
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/fees/payments?${query}`, { method: 'GET' });
  },
  getReceipt: (receiptNo) => request(`/fees/receipt/${receiptNo}`, { method: 'GET' })
};

// ----------------- Examination Endpoints -----------------
export const examsApi = {
  getAll: () => request('/exams', { method: 'GET' }),
  create: (data) => request('/exams', { method: 'POST', body: JSON.stringify(data) }),
  getMarksSheet: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exams/marks-sheet?${query}`, { method: 'GET' });
  },
  saveMarks: (data) => request('/exams/save-marks', { method: 'POST', body: JSON.stringify(data) }),
  getReportCard: (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exams/report-card/${studentId}?${query}`, { method: 'GET' });
  }
};

// ----------------- Announcements Endpoints -----------------
export const announcementsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/announcements?${query}`, { method: 'GET' });
  },
  create: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/announcements/${id}`, { method: 'DELETE' })
};
