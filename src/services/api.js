import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Cases ─────────────────────────────────────────────────────
export const casesAPI = {
  list: (params) => api.get('/cases', { params }),
  get: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
  search: (q) => api.get('/cases/search', { params: { q } }),
  qrLookup: (caseNumber) => api.get(`/cases/qr/${caseNumber}`),
};

// ── Hearings ──────────────────────────────────────────────────
export const hearingsAPI = {
  list: (params) => api.get('/hearings', { params }),
  create: (data) => api.post('/hearings', data),
  update: (id, data) => api.put(`/hearings/${id}`, data),
  delete: (id) => api.delete(`/hearings/${id}`),
  calendar: () => api.get('/hearings/calendar'),
};

// ── Documents ─────────────────────────────────────────────────
export const documentsAPI = {
  list: (params) => api.get('/documents', { params }),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  verify: (id) => api.put(`/documents/${id}/verify`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────
export const tasksAPI = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ── Notes ─────────────────────────────────────────────────────
export const notesAPI = {
  list: (params) => api.get('/notes', { params }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// ── Notifications ─────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
  sendEmail: (data) => api.post('/notifications/send-email', data),
};

// ── Messages ──────────────────────────────────────────────────
export const messagesAPI = {
  contacts: () => api.get('/messages/contacts'),
  conversation: (contactId) => api.get(`/messages/${contactId}`),
  send: (data) => api.post('/messages', data),
};

// ── Courtrooms ────────────────────────────────────────────────
export const courtroomsAPI = {
  list: (params) => api.get('/courtrooms', { params }),
  update: (id, data) => api.put(`/courtrooms/${id}`, data),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  casesTrend: () => api.get('/analytics/cases-trend'),
  casesByType: () => api.get('/analytics/cases-by-type'),
  dailyHearings: () => api.get('/analytics/daily-hearings'),
  advocatePerformance: () => api.get('/analytics/advocate-performance'),
  pendency: () => api.get('/analytics/pendency'),
};

// ── Advocates (list users with role=advocate) ─────────────────
export const advocatesAPI = {
  list: () => api.get('/cases', { params: { role: 'advocate' } }),
};

export default api;
