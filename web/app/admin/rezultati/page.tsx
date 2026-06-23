'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Event = { id: string; title: string; startsAt: string; opponent?: string; team: { name: string; }; result?: { id: string; homeScore: number; awayScore: number; }; };
type Result = { id: string; homeScore: number; awayScore: number; event: { title: string; startsAt: string; team: { name: string; }; }; };

export default function AdminRezultatiPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [matches, setMatches] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ eventId: '', homeScore: '', awayScore: '', notes: '' });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const [res, evts] = await Promise.all([
        adminRequest('/api/results', getToken()),
        adminRequest('/api/schedule?type=match', getToken()),
      ]);
      setResults(res);
      setMatches(evts.filter((e: Event) => !e.result));
    } catch {
      setError('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.eventId || form.homeScore === '' || form.awayScore === '') {
      setError('Popunite sva polja'); return;
    }
    setSaving(true); setError('');
    try {
      await adminRequest('/api/results', getToken(), {
        method: 'POST',
        body: JSON.stringify({
          eventId: form.eventId,
          homeScore: Number(form.homeScore),
          awayScore: Number(form.awayScore),
          notes: form.notes,
        }),
      });
      setForm({ eventId: '', homeScore: '', awayScore: '', notes: '' });
      await load();
    } catch {
      setError('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Rezultati</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">Unesi rezultat</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle}>
            <option value="">Odaberi utakmicu *</option>
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} – {new Date(m.startsAt).toLocaleDateString('sr-Latn-ME')} ({m.team.name})
              </option>
            ))}
          </select>
          <input type="number" min="0" placeholder="Naš rezultat *" value={form.homeScore}
            onChange={e => setForm(f => ({ ...f, homeScore: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input type="number" min="0" placeholder="Protivnički rezultat *" value={form.awayScore}
            onChange={e => setForm(f => ({ ...f, awayScore: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input placeholder="Napomena (opciono)" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle} />
        </div>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <button onClick={handleSave} disabled={saving}
          style={{ backgroundColor: 'var(--primary)' }}
          className="mt-4 px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
          {saving ? 'Čuvanje...' : 'Sačuvaj rezultat'}
        </button>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {results.map(r => (
            <div key={r.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{r.event.title}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                  {new Date(r.event.startsAt).toLocaleDateString('sr-Latn-ME')} · {r.event.team.name}
                </div>
              </div>
              <div className="text-xl font-black" style={{ color: 'var(--gold)' }}>
                {r.homeScore} : {r.awayScore}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
