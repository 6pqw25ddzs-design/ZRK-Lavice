const API_URL = 'https://zrk-lavice-api.onrender.com';

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Pogrešan email ili lozinka');
  return res.json();
}

export async function adminRequest(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    // Istekao/nevažeći token — vrati na prijavu (403 = nema dozvolu, NE odjavljujemo)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    throw new Error('Sesija je istekla — prijavite se ponovo');
  }
  if (res.status === 403) {
    let msg = 'Nemate dozvolu za ovu radnju';
    try { const d = await res.json(); msg = d.error || msg; } catch {}
    throw new Error(msg);
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.detail || d.message || JSON.stringify(d); } catch {}
    throw new Error(msg);
  }
  // 204 No Content (npr. DELETE) ili prazno tijelo — nema JSON-a za parsiranje
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
