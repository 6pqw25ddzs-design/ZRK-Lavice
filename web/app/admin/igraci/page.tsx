'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string; category: string; };
type Player = { id: string; firstName: string; lastName: string; jerseyNumber?: number; position?: string; birthDate: string; team: { name: string; category: string; }; };

const POSITIONS = ['Golman', 'Lijevo krilo', 'Desno krilo', 'Lijevo bek', 'Desno bek', 'Centar', 'Pivot'];

export default function AdminIgraciPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    teamId: '', firstName: '', lastName: '', birthDate: '', jerseyNumber: '', position: '',
  });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const tms = await adminRequest('/api/teams', getToken());
      setTeams(tms);
    } catch {
      setError('Greška pri učitavanju ekipa');
    }
    try {
      const pls = await adminRequest('/api/players', getToken());
      setPlayers(pls);
    } catch (e: any) {
      setError('Greška pri učitavanju igrača: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ teamId: '', firstName: '', lastName: '', birthDate: '', jerseyNumber: '', position: '' });
    setEditing(null);
    setError('');
  }

  async function handleSave() {
    if (!form.teamId || !form.firstName || !form.lastName || !form.birthDate) {
      setError('Popunite obavezna polja'); return;
    }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = {
        teamId: form.teamId,
        firstName: form.firstName,
        lastName: form.lastName,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : form.birthDate,
      };
      if (form.jerseyNumber) body.jerseyNumber = Number(form.jerseyNumber);
      if (form.position) body.position = form.position;

      if (editing) {
        await adminRequest(`/api/players/${editing}`, getToken(), { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await adminRequest('/api/players', getToken(), { method: 'POST', body: JSON.stringify(body) });
      }
      resetForm();
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovog igrača?')) return;
    try {
      await adminRequest(`/api/players/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch {
      setError('Greška pri brisanju');
    }
  }

  function startEdit(p: Player) {
    setEditing(p.id);
    setForm({
      teamId: '',
      firstName: p.firstName,
      lastName: p.lastName,
      birthDate: p.birthDate?.slice(0, 10) || '',
      jerseyNumber: p.jerseyNumber?.toString() || '',
      position: p.position || '',
    });
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Igrači</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi igrača' : 'Novi igrač'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle}>
            <option value="">Odaberi ekipu *</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
          </select>
          <input placeholder="Ime *" value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input placeholder="Prezime *" value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Datum rođenja *</label>
            <input type="date" value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              className={`${inputClass} w-full`} style={inputStyle} />
          </div>
          <input type="number" min="1" max="99" placeholder="Broj dresa" value={form.jerseyNumber}
            onChange={e => setForm(f => ({ ...f, jerseyNumber: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle}>
            <option value="">Pozicija (opciono)</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Dodaj igrača'}
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
          {players.map(p => (
            <div key={p.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                  {p.jerseyNumber ?? '?'}
                </div>
                <div>
                  <div className="text-white font-semibold">{p.firstName} {p.lastName}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-xs">
                    {p.position || '—'} · {p.team.name} · {new Date(p.birthDate).getFullYear()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)}
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Uredi
                </button>
                <button onClick={() => handleDelete(p.id)}
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
