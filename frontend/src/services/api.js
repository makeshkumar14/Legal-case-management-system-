export const API_BASE = 'http://localhost:5000/api';
export const AUTH_CHANGE_EVENT = 'legalcms:auth-changed';
export const DATA_SYNC_EVENT = 'legalcms:data-sync';

function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function emitDataSync(scope) {
  window.dispatchEvent(new CustomEvent(DATA_SYNC_EVENT, { detail: { scope } }));
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { ...options.headers };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearStoredAuth();
    }

    const error = new Error(data?.error || 'Request failed');
    error.status = res.status;
    throw error;
  }

  return data;
}

function parseFilename(headerValue) {
  if (!headerValue) return null;
  const match = headerValue.match(/filename="?([^"]+)"?/i);
  return match?.[1] || null;
}

async function requestBlob(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearStoredAuth();
    }

    let message = 'Request failed';
    try {
      const errorBody = await res.json();
      message = errorBody?.error || message;
    } catch {
      // Ignore JSON parsing failures for binary endpoints.
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return {
    blob: await res.blob(),
    filename: parseFilename(res.headers.get('content-disposition')),
    contentType: res.headers.get('content-type'),
  };
}

const withQuery = (endpoint, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

export const buildApiUrl = (endpoint) => `${API_BASE}${endpoint}`;

// Citizen auth
export const citizenRegister = (name, aadhaarNumber, phone) =>
  request('/auth/citizen/register', {
    method: 'POST',
    body: JSON.stringify({ name, aadhaarNumber, phone }),
  });

export const citizenSendOtp = (aadhaarNumber) =>
  request('/auth/citizen/send-otp', {
    method: 'POST',
    body: JSON.stringify({ aadhaarNumber }),
  });

export const citizenVerifyOtp = (aadhaarNumber, otp) =>
  request('/auth/citizen/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ aadhaarNumber, otp }),
  });

// Advocate auth
export const advocateRegister = (data) =>
  request('/auth/advocate/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const advocateLogin = (barCouncilId, password) =>
  request('/auth/advocate/login', {
    method: 'POST',
    body: JSON.stringify({ barCouncilId, password }),
  });

// Court auth
export const adminLogin = (adminId, password) =>
  request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ adminId, password }),
  });

// Profile
export const getProfile = () => request('/auth/profile');
export const updateProfile = (data) =>
  request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

// Cases
export const casesAPI = {
  list: async (params = {}) => ({ data: await request(withQuery('/cases', params)) }),
  get: async (id) => ({ data: await request(`/cases/${id}`) }),
  reportLinks: async (id) => ({ data: await request(`/cases/${id}/report-links`) }),
  exportCsv: async (id) => requestBlob(`/cases/${id}/export.csv`),
  exportPdf: async (id) => requestBlob(`/cases/${id}/report.pdf`),
  create: async (payload) => {
    const data = await request('/cases', { method: 'POST', body: JSON.stringify(payload) });
    emitDataSync('cases');
    return { data };
  },
  update: async (id, payload) => {
    const data = await request(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    emitDataSync('cases');
    return { data };
  },
  remove: async (id) => {
    const data = await request(`/cases/${id}`, { method: 'DELETE' });
    emitDataSync('cases');
    return { data };
  },
  search: async (query) => ({ data: await request(withQuery('/cases/search', { q: query })) }),
  qrLookup: async (caseNumber) => ({ data: await request(`/cases/qr/${encodeURIComponent(caseNumber)}`) }),
  sharedQrLookup: async (token) => ({ data: await request(`/cases/shared/report/${encodeURIComponent(token)}/details`) }),
};

// Tasks
export const tasksAPI = {
  list: async (params = {}) => ({ data: await request(withQuery('/tasks', params)) }),
  create: async (payload) => {
    const data = await request('/tasks', { method: 'POST', body: JSON.stringify(payload) });
    emitDataSync('tasks');
    return { data };
  },
  update: async (id, payload) => {
    const data = await request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    emitDataSync('tasks');
    return { data };
  },
  remove: async (id) => {
    const data = await request(`/tasks/${id}`, { method: 'DELETE' });
    emitDataSync('tasks');
    return { data };
  },
};

// Documents
export const documentsAPI = {
  list: async (params = {}) => ({ data: await request(withQuery('/documents', params)) }),
  upload: async (payload) => {
    const data = await request('/documents', { method: 'POST', body: payload });
    emitDataSync('documents');
    return { data };
  },
  update: async (id, payload) => {
    const data = await request(`/documents/${id}`, { method: 'PUT', body: payload });
    emitDataSync('documents');
    return { data };
  },
  verify: async (id) => {
    const data = await request(`/documents/${id}/verify`, { method: 'PUT' });
    emitDataSync('documents');
    return { data };
  },
  file: async (id, params = {}) => requestBlob(withQuery(`/documents/${id}/file`, params)),
  remove: async (id) => {
    const data = await request(`/documents/${id}`, { method: 'DELETE' });
    emitDataSync('documents');
    return { data };
  },
};

// Hearings
export const hearingsAPI = {
  list: async (params = {}) => ({ data: await request(withQuery('/hearings', params)) }),
  calendar: async () => ({ data: await request('/hearings/calendar') }),
  create: async (payload) => {
    const data = await request('/hearings', { method: 'POST', body: JSON.stringify(payload) });
    emitDataSync('hearings');
    return { data };
  },
  update: async (id, payload) => {
    const data = await request(`/hearings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    emitDataSync('hearings');
    return { data };
  },
  remove: async (id) => {
    const data = await request(`/hearings/${id}`, { method: 'DELETE' });
    emitDataSync('hearings');
    return { data };
  },
};

// Notifications
export const notificationsAPI = {
  list: async () => ({ data: await request('/notifications') }),
  markRead: async (id) => {
    const data = await request(`/notifications/${id}/read`, { method: 'PUT' });
    emitDataSync('notifications');
    return { data };
  },
  remove: async (id) => {
    const data = await request(`/notifications/${id}`, { method: 'DELETE' });
    emitDataSync('notifications');
    return { data };
  },
  markAllRead: async (items = []) => {
    await Promise.all(
      items
        .filter((item) => item.databaseId && !item.read)
        .map((item) => request(`/notifications/${item.databaseId}/read`, { method: 'PUT' }))
    );
    emitDataSync('notifications');
  },
};

// Notes
export const notesAPI = {
  list: async (params = {}) => ({ data: await request(withQuery('/notes', params)) }),
  create: async (payload) => {
    const data = await request('/notes', { method: 'POST', body: JSON.stringify(payload) });
    emitDataSync('notes');
    return { data };
  },
  update: async (id, payload) => {
    const data = await request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    emitDataSync('notes');
    return { data };
  },
  remove: async (id) => {
    const data = await request(`/notes/${id}`, { method: 'DELETE' });
    emitDataSync('notes');
    return { data };
  },
};

// Messages
export const messagesAPI = {
  contacts: async () => ({ data: await request('/messages/contacts') }),
  conversation: async (contactId) => ({ data: await request(`/messages/${contactId}`) }),
  send: async (receiverId, content) => {
    const data = await request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
    emitDataSync('messages');
    return { data };
  },
};

// Analytics
export const analyticsAPI = {
  dashboard: async () => ({ data: await request('/analytics/dashboard') }),
  casesTrend: async () => ({ data: await request('/analytics/cases-trend') }),
  casesByType: async () => ({ data: await request('/analytics/cases-by-type') }),
  dailyHearings: async () => ({ data: await request('/analytics/daily-hearings') }),
  advocatePerformance: async () => ({ data: await request('/analytics/advocate-performance') }),
  allAdvocates: async () => ({ data: await request('/analytics/all-advocates') }),
};

// Court rooms
export const courtroomsAPI = {
  list: async (params = {}) => ({ data: await request(withQuery('/courtrooms', params)) }),
  availability: async (params = {}) => ({ data: await request(withQuery('/courtrooms/availability', params)) }),
  update: async (id, payload) => {
    const data = await request(`/courtrooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    emitDataSync('courtrooms');
    return { data };
  },
};
