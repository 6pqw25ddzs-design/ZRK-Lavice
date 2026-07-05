const API_URL = 'https://zrk-lavice-api.onrender.com';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
export const getNewsBySlug = (slug: string) => request(`/api/news/${slug}`);

export const getResults = (teamId?: string) =>
  request(`/api/results${teamId ? `?teamId=${teamId}` : ''}`);

export const getGallery = () => request('/api/gallery');
export const getSponsors = () => request('/api/sponsors');
export const getStandings = () => request('/api/standings');
export const getSettings = () => request('/api/settings');
export const getPublicDocuments = () => request('/api/documents/public');
export const submitRegistration = (data: { childName: string; birthYear: number; parentName: string; parentPhone: string; parentEmail: string }) =>
  request('/api/registrations', { method: 'POST', body: JSON.stringify(data) });

export const getInbox = () => request('/api/messages/inbox');

export const sendMessage = (data: { recipientId?: string; teamId?: string; body: string; isGroup?: boolean }) =>
  request('/api/messages', { method: 'POST', body: JSON.stringify(data) });

export const getPlayerProfile = (id: string) => request(`/api/players/${id}`);

export const login = (email: string, password: string) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
