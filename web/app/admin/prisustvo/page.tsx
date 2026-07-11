'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string; category: string };
type Event = { id: string; type: string; title: string; startsAt: string; isCancelled: boolean };
type Row = { id: string; firstName: string; lastName: string; jerseyNumber?: number; status: 'present' | 'absent' | 'excused' | null };

const STATUSES: { value: Row['status']; label: string; color: string }[] = [
  { value: 'present', label: 'Prisutna', color: '#16a34a' },
  { value: 'excused', label: 'Opravdano', color: '#d4ac0d' },
  { value: 'absent', label: 'Odsutna', color: '#dc2626' },
];

export default function AdminPrisustvoPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  useEffect(() => {
    adminRequest('/api/teams', getToken()).then(setTeams).catch(() => setError('Greška pri učitavanju ekipa'));
  }, []);

  useEffect(() => {
    if (!teamId) { setEvents([]); setEventId(''); return; }
    adminRequest(`/api/schedule?teamId=${teamId}&all=1`, getToken())
      .then((evs: Event[]) => {
        const sorted = [...evs].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
        setEvents(sorted.slice(0, 30));
      })
      .catch(() => setError('Greška pri učitavanju termina'));
  }, [teamId]);

  useEffect(() => {
    if (!eventId) { setRows([]); return; }
    adminRequest(`/api/attendance?eventId=${eventId}`, getToken())
      .then(setRows)
      .catch((e: any) => setError('Greška pri učitavanju prisustva: ' + (e?.message || '')));
  }, [eventId]);

  function setStatus(playerId: string, status: Row['status']) {
    setSaved(false);
    setRows(rows.map(r => r.id === playerId ? { ...r, status: r.status === status ? null : status } : r));
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false);
    try {
      await adminRequest('/api/attendance', getToken(), {
        method: 'PUT',
        body: JSON.stringify({ eventId, records: rows.map(r => ({ playerId: r.id, status: r.status })) }),
      });
      setSaved(true);
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  const selectStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const marked = rows.filter(r => r.status !== null).length;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Prisustvo</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={teamId} onChange={e => setTeamId(e.target.value)} style={selectStyle} className="px-4 py-2 rounded-lg outline-none">
          <option value="">— Izaberi ekipu —</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={selectStyle} className="px-4 py-2 rounded-lg outline-none" disabled={!teamId}>
          <option value="">— Izaberi termin —</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>
              {new Date(ev.startsAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'short' })} · {ev.type === 'match' ? '🏆' : '🏃‍♀️'} {ev.title}{ev.isCancelled ? ' (otkazan)' : ''}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {rows.length > 0 && (
        <>
          <div className="flex flex-col gap-2 mb-6">
            {rows.map(r => (
              <div key={r.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                    {r.jerseyNumber ?? '?'}
                  </div>
                  <span className="text-white font-medium">{r.firstName} {r.lastName}</span>
                </div>
                <div className="flex gap-1.5">
                  {STATUSES.map(s => (
                    <button key={s.value} onClick={() => setStatus(r.id, s.value)}
                      style={r.status === s.value
                        ? { backgroundColor: s.color, color: 'white', border: `1px solid ${s.color}` }
                        : { border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors">
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: 'var(--primary)' }}
              className="px-6 py-2 rounded-lg text-white font-bold disabled:opacity-50">
              {saving ? 'Čuvam...' : 'Sačuvaj prisustvo'}
            </button>
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">
              {marked}/{rows.length} označeno {saved && <span className="text-green-500 font-semibold">· Sačuvano ✓</span>}
            </span>
          </div>
        </>
      )}
      {eventId && rows.length === 0 && !error && (
        <p style={{ color: 'var(--text-muted)' }}>Nema aktivnih igračica u ovoj ekipi.</p>
      )}
    </div>
  );
}
