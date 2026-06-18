// api.js - Centralized fetch wrapper that attaches JWT and handles base URL

const API_BASE_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('smartpay_token');
}

function setToken(token) {
  localStorage.setItem('smartpay_token', token);
}

function clearSession() {
  localStorage.removeItem('smartpay_token');
  localStorage.removeItem('smartpay_user');
}

function getCurrentUser() {
  const user = localStorage.getItem('smartpay_user');
  return user ? JSON.parse(user) : null;
}

// Generic request function used by every page
async function apiRequest(endpoint, method = 'GET', body = null, authRequired = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (authRequired) {
    const token = getToken();
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (response.status === 401) {
      clearSession();
      window.location.href = 'login.html';
      return;
    }

    return { status: response.status, data };
  } catch (err) {
    console.error('API request failed:', err);
    return { status: 500, data: { success: false, message: 'Network error. Please check your connection.' } };
  }
}

// Guard for pages that require login
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

// Simple toast notification (used across pages)
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-smartpay');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-smartpay alert alert-${type === 'success' ? 'success' : 'danger'} shadow`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}