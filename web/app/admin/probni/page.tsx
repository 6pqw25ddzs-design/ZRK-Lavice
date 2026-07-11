'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Reg = { id: string; childName: string; birthYear: number; parentName: string; parentPhone: string; status: string };
type Slot = {
  id: string; startsAt: string; category: string | null; capacity: number;
  location: string | null; notes: string | null; isActive: boolean; registrations: Reg[];
};

const CATEGORIES = ['Mini rukomet', 'Pionirska selekcija', 'Prva liga', 'Sve kategorije'];

export default function AdminProbniPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState({ startsAt: '', category: '', capacity: '10', location: '' });
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try { setSlots(await adminRequest('/api/trial-slots/all', getToken())); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, []);

  async function addSlot() {
    if (!form.startsAt) { setError('Unesite datum i vrijeme'); return; }
    try {
      await adminRequest('/api/trial-slots', getToken(), {
        method: 'POST',
        body: JSON.stringify({
          startsAt: new Date(form.startsAt).toISOString(),
          category: form.category || undefined,
          capacity: Number(form.capacity) || 10,
          location: form.location || undefined,
        }),
      });
      setForm({ startsAt: '', category: '', capacity: '10', location: '' });
      setError('');
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function toggleSlot(slot: Slot) {
    try {
      await adminRequest(`/api/trial-slots/${slot.id}`, getToken(), {
        method: 'PATCH', body: JSON.stringify({ isActive: !slot.isActive }),
      });
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Probni treninzi</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5 mb-8">
        <h2 className="text-white font-bold mb-3">Novi termin</h2>
        <div className="flex flex-wrap gap-3">
          <input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
            <option value="">— Kategorija —</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Mjesta" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm w-20 outline-none" />
          <input placeholder="Dvorana / lokacija" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm flex-1 min-w-40 outline-none" />
          <button onClick={addSlot} style={{ backgroundColor: 'var(--primary)' }}
            className="px-5 py-2 rounded-lg text-white text-sm font-bold">Dodaj</button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {slots.map(s => (
          <div key={s.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', opacity: s.isActive ? 1 : 0.55 }}
            className="rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-white font-semibold">
                  {new Date(s.startsAt).toLocaleDateString('sr-Latn-ME', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {s.category || 'Sve kategorije'} · {s.registrations.length}/{s.capacity} prijavljeno{s.location ? ` · ${s.location}` : ''}
                </div>
              </div>
              <button onClick={() => toggleSlot(s)}
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                className="px-3 py-1 rounded-lg text-xs hover:text-white">
                {s.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
              </button>
            </div>
            {s.registrations.length > 0 && (
              <ul className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                {s.registrations.map(r => (
                  <li key={r.id} className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
                    {r.childName} ({r.birthYear}) — {r.parentName}, {r.parentPhone}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {slots.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema termina. Dodaj prvi — prijave sa sajta će moći da biraju termin.</p>}
      </div>
    </div>
  );
}
