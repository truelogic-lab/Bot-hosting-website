const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('warrenxmd_auth_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth
  me: () => request('/api/auth/me'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, planId) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, planId }) }),

  // Dashboard
  getDashboard: () => request('/api/dashboard/overview'),

  // Tokens
  getBalance: () => request('/api/tokens/balance'),
  getTodayUsage: () => request('/api/tokens/usage/today'),
  getTokenSummary: () => request('/api/tokens/summary'),
  getBundles: () => request('/api/bundles'),

  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/transactions${qs ? '?' + qs : ''}`);
  },

  // Bots
  getBots: () => request('/api/bots'),
  deployBot: (name, phone) => request('/api/bots', { method: 'POST', body: JSON.stringify({ name, phone }) }),
  updateBotStatus: (id, status) => request(`/api/bots/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteBot: (id) => request(`/api/bots/${id}`, { method: 'DELETE' }),

  // Payments
  stkPush: (phone, amountKes) => request('/api/payments/stkpush', { method: 'POST', body: JSON.stringify({ phone, amountKes }) }),

  // Panels
  getPanels: () => request('/api/panels'),
  revealPanelPassword: (id) => request(`/api/panels/${id}/reveal`),

  // Notifications
  getNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/api/notifications/mark-all-read', { method: 'PATCH' }),
};

export { API_URL };
