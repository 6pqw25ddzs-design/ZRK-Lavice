'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Standing = {
  id: string; league: string; teamName: string;
  played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; points: number; isOwnTeam: boolean;
};

const EMPTY = { league: '', teamName: '', played: '', wins: '', draws: '', losses: '', goalsFor: '', goalsAgainst: '', points: '', isOwnTeam: false };

export default function AdminTabelaPage() {
  const [rows, setRows] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(EMPTY);

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/standings', getToken());
      setRows(data);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() { setForm(EMPTY); setEditing(null); setError(''); }

  async function handleSave() {
    if (!form.league || !form.teamName) { setError('Liga i ekipa su obavezni'); return; }
    setSaving(true); setError('');
    const num = (v: any) => v === '' ? 0 : Number(v);
    const body = {
      league: form.league, teamName: form.teamName, isOwnTeam: form.isOwnTeam,
      played: num(form.played), wins: num(form.wins), draws: num(form.draws), losses: num(form.losses),
      goalsFor: num(form.goalsFor), goalsAgainst: num(form.goalsAgainst), points: num(form.points),
    };
    try {
      if (editing) {
        await adminRequest(`/api/standings/${editing}`, getToken(), { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await adminRequest('/api/standings', getToken(), { method: 'POST', body: JSON.stringify(body) });
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
    if (!confirm('Obrisati ovaj red?')) return;
    try {
      await adminRequest(`/api/standings/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  function startEdit(r: Standing) {
    setEditing(r.id);
    setForm({
      league: r.league, teamName: r.teamName, isOwnTeam: r.isOwnTeam,
      played: String(r.played), wins: String(r.wins), draws: String(r.draws), losses: String(r.losses),
      goalsFor: String(r.goalsFor), goalsAgainst: String(r.goalsAgainst), points: String(r.points),
    });
  }

  const ic = "px-3 py-2 rounded-lg outline-none focus:border-red-600";
  const is = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const numField = (key: string, label: string) => (
    <input type="number" placeholder={label} value={form[key]}
      onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))} className={ic} style={is} />
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Tabela</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi red' : 'Novi red'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Liga * (npr. Prva liga CG)" value={form.league}
            onChange={e => setForm((f: any) => ({ ...f, league: e.target.value }))} className={ic} style={is} />
          <input placeholder="Ekipa *" value={form.teamName}
            onChange={e => setForm((f: any) => ({ ...f, teamName: e.target.value }))} className={ic} style={is} />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mt-3">
          {numField('played', 'Od')}
          {numField('wins', 'P')}
          {numField('draws', 'N')}
          {numField('losses', 'I')}
          {numField('goalsFor', 'Dato')}
          {numField('goalsAgainst', 'Primlj.')}
          {numField('points', 'Bod')}
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <input type="checkbox" checked={form.isOwnTeam}
            onChange={e => setForm((f: any) => ({ ...f, isOwnTeam: e.target.checked }))} />
          Ovo je naša ekipa (istakni crveno)
        </label>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj red'}
          </button>
          {editing && <button onClick={resetForm} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            className="px-6 py-2 rounded-lg hover:text-white transition-colors">Otkaži</button>}
        </div>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-2">
          {rows.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema redova.</p>}
          {rows.map(r => (
            <div key={r.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-white font-semibold">{r.teamName} {r.isOwnTeam && <span style={{ color: 'var(--primary)' }}>★</span>}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs">{r.league} · {r.played} od · {r.points} bod</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(r)} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">Uredi</button>
                <button onClick={() => handleDelete(r.id)}
                  className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700 transition-colors">Briši</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
