import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL: BASE });

// attach token from localStorage on every request
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('zrk_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

// ── Auth ──────────────────────────────────────────────────
export const authLogin = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password }).then(r => r.data);

// ── Teams ─────────────────────────────────────────────────
export const getTeams = () => api.get('/api/teams').then(r => r.data);
export const getTeam = (id: string) => api.get(`/api/teams/${id}`).then(r => r.data);

// ── Players ───────────────────────────────────────────────
export const getPlayers = (teamId?: string) =>
  api.get('/api/players', { params: teamId ? { teamId } : {} }).then(r => r.data);
export const createPlayer = (data: Record<string, unknown>) =>
  api.post('/api/players', data).then(r => r.data);
export const updatePlayer = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/players/${id}`, data).then(r => r.data);
export const deletePlayer = (id: string) =>
  api.delete(`/api/players/${id}`);

// ── Schedule ──────────────────────────────────────────────
export const getSchedule = (params?: Record<string, string>) =>
  api.get('/api/schedule', { params }).then(r => r.data);
export const createEvent = (data: Record<string, unknown>) =>
  api.post('/api/schedule', data).then(r => r.data);
export const updateEvent = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/schedule/${id}`, data).then(r => r.data);
export const deleteEvent = (id: string) =>
  api.delete(`/api/schedule/${id}`);

// ── Results ───────────────────────────────────────────────
export const getResults = () => api.get('/api/results').then(r => r.data);
export const createResult = (data: Record<string, unknown>) =>
  api.post('/api/results', data).then(r => r.data);

// ── News ──────────────────────────────────────────────────
export const getNews = (params?: Record<string, unknown>) =>
  api.get('/api/news', { params }).then(r => r.data);
export const createArticle = (data: Record<string, unknown>) =>
  api.post('/api/news', data).then(r => r.data);
export const updateArticle = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/news/${id}`, data).then(r => r.data);
export const deleteArticle = (id: string) =>
  api.delete(`/api/news/${id}`);

// ── Registrations ─────────────────────────────────────────
export const getRegistrations = () => api.get('/api/registrations').then(r => r.data);
export const updateRegistration = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/registrations/${id}`, data).then(r => r.data);

// ── Notifications ─────────────────────────────────────────
export const sendNotification = (data: { title: string; body: string; teamId?: string }) =>
  api.post('/api/notifications/send', data).then(r => r.data);

// ── Sponsors ──────────────────────────────────────────────
export const getSponsors = () => api.get('/api/sponsors').then(r => r.data);
