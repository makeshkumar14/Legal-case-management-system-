const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ═══════════════════════════════════════════════════
//  CITIZEN (Aadhaar + OTP)
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
//  ADVOCATE (Bar Council ID + Password)
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
//  COURT ADMIN (Admin ID + Password)
// ═══════════════════════════════════════════════════
export const adminLogin = (adminId, password) =>
  request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ adminId, password }),
  });

// ═══════════════════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════════════════
export const getProfile = () => request('/auth/profile');
export const updateProfile = (data) =>
  request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
