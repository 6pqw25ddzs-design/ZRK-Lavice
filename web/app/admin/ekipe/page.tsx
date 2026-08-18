'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string; category: string; description?: string; _count?: { players: number } };

const CAT_LABEL: Record<string, string> = { mini: 'Mini rukomet', pioniri: 'Pionirke', prva_liga: 'Seniorska kategorija' };

export default function AdminEkipePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const t = await adminRequest('/api/teams', getToken());
      setTeams(t);
      setNames(Object.fromEntries(t.map((x: Team) => [x.id, x.name])));
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, []);

  async function save(id: string) {
    setMsg(''); setError('');
    try {
      await adminRequest(`/api/teams/${id}`, getToken(), {
        method: 'PATCH', body: JSON.stringify({ name: names[id] }),
      });
      setMsg('✓ Sačuvano — novi naziv je odmah na sajtu i u aplikaciji');
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-2">Ekipe</h1>
      <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-6">
        Naziv ekipe se prikazuje svuda (sajt, aplikacija, profili). Kategorija je fiksna — određuje logiku (npr. golovi za seniorsku).
      </p>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      {msg && <p className="text-green-500 mb-3 text-sm">{msg}</p>}

      <div className="flex flex-col gap-3">
        {teams.map(t => (
          <div key={t.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            className="rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <input value={names[t.id] ?? ''} onChange={e => setNames(n => ({ ...n, [t.id]: e.target.value }))}
                className="px-4 py-2 rounded-lg outline-none focus:border-red-600 w-full" style={inputStyle} />
              <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1.5 pl-1">
                {CAT_LABEL[t.category] || t.category} · {t._count?.players ?? 0} igračica
              </div>
            </div>
            <button onClick={() => save(t.id)} disabled={names[t.id] === t.name}
              style={{ backgroundColor: 'var(--primary)' }}
              className="px-5 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-40">
              Sačuvaj
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
