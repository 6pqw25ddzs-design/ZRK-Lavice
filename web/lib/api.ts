const API_URL = 'https://zrk-lavice-api.onrender.com';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    next: { revalidate: 60 },
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
