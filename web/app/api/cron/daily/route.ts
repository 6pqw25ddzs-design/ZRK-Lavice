import { NextRequest, NextResponse } from 'next/server';

// Vercel cron (08:00 po našem) → prijava na backend → pokretanje dnevnih podsjetnika.
// Vercel automatski šalje "Authorization: Bearer <CRON_SECRET>" kad je env postavljen.
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const API = 'https://zrk-lavice-api.onrender.com';
  try {
    const login = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.LAVICE_API_EMAIL, password: process.env.LAVICE_API_PASSWORD }),
    });
    if (!login.ok) return NextResponse.json({ error: 'backend login failed' }, { status: 502 });
    const { token } = await login.json();

    const run = await fetch(`${API}/api/cron/daily`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await run.json();
    return NextResponse.json(result, { status: run.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
