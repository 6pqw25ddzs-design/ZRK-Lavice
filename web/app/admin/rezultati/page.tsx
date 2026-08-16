'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Event = { id: string; teamId: string; title: string; startsAt: string; opponent?: string; team: { name: string; }; result?: { id: string; homeScore: number; awayScore: number; }; };
type RosterPlayer = { id: string; firstName: string; lastName: string; jerseyNumber?: number };
type Result = { id: string; homeScore: number; awayScore: number; event: { title: string; startsAt: string; team: { name: string; }; }; };

export default function AdminRezultatiPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [matches, setMatches] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ eventId: '', homeScore: '', awayScore: '', notes: '' });
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [goals, setGoals] = useState<Record<string, string>>({});

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  // Kad se izabere utakmica, učitaj igračice te ekipe za unos golova
  useEffect(() => {
    const ev = matches.find(m => m.id === form.eventId);
    setGoals({});
    if (!ev?.teamId) { setRoster([]); return; }
    adminRequest(`/api/players?teamId=${ev.teamId}`, getToken())
      .then((ps: RosterPlayer[]) => setRoster([...ps].sort((a, b) => a.lastName.localeCompare(b.lastName))))
      .catch(() => setRoster([]));
  }, [form.eventId, matches]);

  async function load() {
    try {
      const evts = await adminRequest('/api/schedule?type=match', getToken());
      setMatches(evts.filter((e: Event) => !e.result));
    } catch {
      setError('Greška pri učitavanju utakmica');
    }
    try {
      const res = await adminRequest('/api/results', getToken());
      setResults(res);
    } catch (e: any) {
      setError('Greška pri učitavanju rezultata: ' + (e?.message || ''));
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
          scorers: Object.fromEntries(
            Object.entries(goals).map(([id, g]) => [id, Number(g)]).filter(([, g]) => Number(g) > 0)
          ),
        }),
      });
      setForm({ eventId: '', homeScore: '', awayScore: '', notes: '' });
      setGoals({});
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovaj rezultat?')) return;
    try {
      await adminRequest(`/api/results/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
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

        {roster.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white font-semibold text-sm mb-2">Golovi po igračici (opciono)</h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {roster.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <span style={{ color: 'var(--text-muted)' }} className="text-sm">
                    {p.jerseyNumber != null ? `${p.jerseyNumber} · ` : ''}{p.lastName} {p.firstName}
                  </span>
                  <input type="number" min="0" placeholder="0" value={goals[p.id] || ''}
                    onChange={e => setGoals(g => ({ ...g, [p.id]: e.target.value }))}
                    className="px-2 py-1 rounded-md outline-none w-16 text-center"
                    style={inputStyle} />
                </div>
              ))}
            </div>
          </div>
        )}
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
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-xl font-black" style={{ color: 'var(--gold)' }}>
                  {r.homeScore} : {r.awayScore}
                </div>
                <button onClick={() => handleDelete(r.id)}
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
