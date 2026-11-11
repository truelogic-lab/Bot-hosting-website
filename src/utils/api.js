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
  me: () => request('/api/auth/me'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  getDashboard: () => request('/api/dashboard/overview'),

  getBalance: () => request('/api/tokens/balance'),
  getTodayUsage: () => request('/api/tokens/usage/today'),
  getTokenSummary: () => request('/api/tokens/summary'),

  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/transactions${qs ? '?' + qs : ''}`);
  },

  getBots: () => request('/api/bots'),
  deployBot: (name, phone) => request('/api/bots', { method: 'POST', body: JSON.stringify({ name, phone }) }),
  updateBotStatus: (id, status) => request(`/api/bots/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteBot: (id) => request(`/api/bots/${id}`, { method: 'DELETE' }),

  stkPush: (phone, amountKes) => request('/api/payments/stkpush', { method: 'POST', body: JSON.stringify({ phone, amountKes }) }),
  getBundles: () => request('/api/bundles'),

  getPanels: () => request('/api/panels'),
  revealPanelPassword: (id) => request(`/api/panels/${id}/reveal`),

  getNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/api/notifications/mark-all-read', { method: 'PATCH' }),
};

export { API_URL };
