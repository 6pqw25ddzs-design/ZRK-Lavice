'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string };
type Announcement = {
  id: string; teamId: string; teamName: string; title: string; body: string;
  requiresAck: boolean; author: string; createdAt: string; readCount: number;
};

export default function AdminObjavePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ teamId: '', title: '', body: '', requiresAck: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const [tms, anns] = await Promise.all([
        adminRequest('/api/teams', getToken()),
        adminRequest('/api/announcements', getToken()),
      ]);
      setTeams(tms); setItems(anns);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    }
  }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.teamId || !form.title || !form.body) { setError('Popunite ekipu, naslov i tekst'); return; }
    setSaving(true); setError('');
    try {
      await adminRequest('/api/announcements', getToken(), { method: 'POST', body: JSON.stringify(form) });
      setForm({ teamId: '', title: '', body: '', requiresAck: false });
      await load();
    } catch (e: any) {
      setError('Greška pri objavi: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovu objavu?')) return;
    try {
      await adminRequest(`/api/announcements/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Objave ekipama</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">Nova objava</h2>
        <div className="flex flex-col gap-3">
          <select value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })}
            style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
            <option value="">— Ekipa —</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Naslov (npr. Promjena termina treninga)" style={inputStyle} className="px-4 py-2 rounded-lg outline-none" />
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Tekst objave — roditelji je vide u aplikaciji" rows={4} style={inputStyle} className="px-4 py-2 rounded-lg outline-none" />
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={form.requiresAck} onChange={e => setForm({ ...form, requiresAck: e.target.checked })} />
            Traži potvrdu čitanja („Pročitala/o sam")
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={handleSave} disabled={saving}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 rounded-lg text-white font-bold disabled:opacity-50 self-start">
            {saving ? 'Objavljujem...' : 'Objavi'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {items.map(a => (
          <div key={a.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{a.title}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">
                  {a.teamName} · {a.author} · {new Date(a.createdAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {a.requiresAck && <> · <span style={{ color: 'var(--primary)' }}>{a.readCount} potvrdilo čitanje</span></>}
                </div>
              </div>
              <button onClick={() => handleDelete(a.id)}
                className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700 transition-colors shrink-0">
                Briši
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2 whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
        {items.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema objava.</p>}
      </div>
    </div>
  );
}
