import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.zrklavice.me';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getSchedule = (teamId?: string) =>
  api.get('/api/schedule', { params: { teamId, from: new Date().toISOString() } }).then(r => r.data);

export const getTeams = () => api.get('/api/teams').then(r => r.data);

export const getNews = (limit = 10) => api.get('/api/news', { params: { limit } }).then(r => r.data);

export const getResults = (teamId?: string) =>
  api.get('/api/results', { params: { teamId } }).then(r => r.data);

export const getInbox = () => api.get('/api/messages/inbox').then(r => r.data);

export const sendMessage = (data: { recipientId?: string; teamId?: string; body: string; isGroup?: boolean }) =>
  api.post('/api/messages', data).then(r => r.data);

export const getPlayerProfile = (id: string) => api.get(`/api/players/${id}`).then(r => r.data);

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password }).then(r => r.data);
