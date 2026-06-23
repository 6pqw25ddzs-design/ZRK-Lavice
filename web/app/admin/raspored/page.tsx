'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string; category: string; };
type Event = { id: string; title: string; type: string; startsAt: string; location?: string; opponent?: string; team: { name: string; category: string; }; };

export default function AdminRasporedPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    teamId: '', type: 'match', title: '', startsAt: '', location: '', opponent: '',
  });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const [evts, tms] = await Promise.all([
        adminRequest('/api/schedule', getToken()),
        adminRequest('/api/teams', getToken()),
      ]);
      setEvents(evts);
      setTeams(tms);
    } catch {
      setError('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ teamId: '', type: 'match', title: '', startsAt: '', location: '', opponent: '' });
    setEditing(null);
  }

  async function handleSave() {
    if (!form.teamId || !form.title || !form.startsAt) { setError('Popunite obavezna polja'); return; }
    setSaving(true); setError('');
    try {
      const body = { ...form, startsAt: new Date(form.startsAt).toISOString() };
      if (editing) {
        await adminRequest(`/api/schedule/${editing}`, getToken(), { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await adminRequest('/api/schedule', getToken(), { method: 'POST', body: JSON.stringify(body) });
      }
      resetForm();
      await load();
    } catch {
      setError('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovaj događaj?')) return;
    try {
      await adminRequest(`/api/schedule/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch {
      setError('Greška pri brisanju');
    }
  }

  function startEdit(e: Event) {
    setEditing(e.id);
    setForm({
      teamId: '',
      type: e.type,
      title: e.title,
      startsAt: new Date(e.startsAt).toISOString().slice(0, 16),
      location: e.location || '',
      opponent: e.opponent || '',
    });
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Raspored</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi događaj' : 'Novi događaj'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
            className={inputClass} style={inputStyle}>
            <option value="">Odaberi ekipu *</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
          </select>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className={inputClass} style={inputStyle}>
            <option value="match">Utakmica</option>
            <option value="training">Trening</option>
          </select>
          <input placeholder="Naslov *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle} />
          <input type="datetime-local" value={form.startsAt}
            onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input placeholder="Lokacija" value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className={inputClass} style={inputStyle} />
          {form.type === 'match' && (
            <input placeholder="Protivnik" value={form.opponent}
              onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
              className={`${inputClass} col-span-2`} style={inputStyle} />
          )}
        </div>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Dodaj događaj'}
          </button>
          {editing && (
            <button onClick={resetForm}
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              className="px-6 py-2 rounded-lg hover:text-white transition-colors">
              Otkaži
            </button>
          )}
        </div>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {events.map(e => (
            <div key={e.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: e.type === 'match' ? 'var(--primary)' : '#1d4ed8', color: 'white' }}>
                    {e.type === 'match' ? 'Utakmica' : 'Trening'}
                  </span>
                  <span className="text-white font-semibold">{e.title}</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                  {new Date(e.startsAt).toLocaleString('sr-Latn-ME')}
                  {e.location && ` · ${e.location}`}
                  {e.opponent && ` · vs ${e.opponent}`}
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs">{e.team.name}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(e)}
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Uredi
                </button>
                <button onClick={() => handleDelete(e.id)}
                  className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700 transition-colors">
                  Briši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
