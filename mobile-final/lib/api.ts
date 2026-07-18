const API_URL = 'https://zrk-lavice-api.onrender.com';

let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const d = await res.json();
      if (typeof d.error === 'string') {
        msg = d.error;
      } else if (d.error && typeof d.error === 'object') {
        // zod flatten(): { formErrors: [], fieldErrors: { email: [...], ... } }
        const FIELD_LABELS: Record<string, string> = {
          email: 'Email', password: 'Lozinka', fullName: 'Ime i prezime', code: 'Pozivni kod', phone: 'Telefon',
        };
        const parts: string[] = [...(d.error.formErrors || [])];
        for (const [field, errs] of Object.entries(d.error.fieldErrors || {})) {
          if (Array.isArray(errs) && errs.length) parts.push(`${FIELD_LABELS[field] || field} nije ispravno unesen`);
        }
        msg = parts.join(' · ') || d.message || msg;
      } else {
        msg = d.message || msg;
      }
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
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
export const getTreneri = () => request('/api/treneri');
export const getPublicDocuments = () => request('/api/documents/public');
export const submitRegistration = (data: { childName: string; birthYear: number; parentName: string; parentPhone: string; parentEmail: string }) =>
  request('/api/registrations', { method: 'POST', body: JSON.stringify(data) });

export const getInbox = () => request('/api/messages/inbox');

export const sendMessage = (data: { recipientId?: string; teamId?: string; body: string; isGroup?: boolean }) =>
  request('/api/messages', { method: 'POST', body: JSON.stringify(data) });

export const getPlayerProfile = (id: string) => request(`/api/players/${id}`);

export const login = (email: string, password: string) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// ===== Prijavljeni korisnik (roditelj) =====
export const api = {
  login,
  activate: (data: { code: string; email: string; password: string; fullName: string; phone?: string }) =>
    request('/api/auth/activate', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/me'),
  myChildren: () => request('/api/me/children'),
  savePushToken: (token: string, platform: string) =>
    request('/api/me/push-token', { method: 'POST', body: JSON.stringify({ token, platform }) }),
  setAvailability: (eventId: string, playerId: string, status: 'yes' | 'no' | 'maybe', reason?: string) =>
    request('/api/me/availability', { method: 'POST', body: JSON.stringify({ eventId, playerId, status, reason }) }),
  myAnnouncements: () => request('/api/me/announcements'),
  markAnnouncementRead: (id: string) =>
    request(`/api/me/announcements/${id}/read`, { method: 'POST' }),
  dossier: (playerId: string) => request(`/api/me/dossier/${playerId}`),
  development: (playerId: string) => request(`/api/me/development/${playerId}`),
  scheduleForTeam: (teamId: string) =>
    request(`/api/schedule?teamId=${teamId}&from=${new Date().toISOString()}`),
};
