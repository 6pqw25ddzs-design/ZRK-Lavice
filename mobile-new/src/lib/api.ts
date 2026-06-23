import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://zrk-lavice-api.onrender.com';

async function request(path: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const getSchedule = (teamId?: string) =>
  request(`/api/schedule?from=${new Date().toISOString()}${teamId ? `&teamId=${teamId}` : ''}`);

export const getTeams = () => request('/api/teams');

export const getPlayers = (teamId?: string) =>
  request(`/api/players${teamId ? `?teamId=${teamId}` : ''}`);

export const getNews = (limit = 10) => request(`/api/news?limit=${limit}`);

export const getResults = (teamId?: string) =>
  request(`/api/results${teamId ? `?teamId=${teamId}` : ''}`);

export const getInbox = () => request('/api/messages/inbox');

export const sendMessage = (data: { recipientId?: string; teamId?: string; body: string; isGroup?: boolean }) =>
  request('/api/messages', { method: 'POST', body: JSON.stringify(data) });

export const getPlayerProfile = (id: string) => request(`/api/players/${id}`);

export const login = (email: string, password: string) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
