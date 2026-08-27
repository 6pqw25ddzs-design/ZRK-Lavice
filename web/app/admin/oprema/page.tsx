'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Player = { id: string; firstName: string; lastName: string; team: { name: string } };
type Item = {
  id: string; playerId?: string; itemType: string; label?: string; size?: string;
  issuedAt: string; returnedAt?: string; note?: string;
  player?: { firstName: string; lastName: string; jerseyNumber?: number };
};

const TYPES = ['Dres (komplet)', 'Trening majica', 'Trenerka', 'Torba', 'Lopta', 'Štitnici', 'Ostalo'];

export default function AdminOpremaPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ playerId: '', itemType: TYPES[0], label: '', size: '', note: '' });
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const [p, it] = await Promise.all([
        adminRequest('/api/players', getToken()),
        adminRequest('/api/equipment', getToken()),
      ]);
      setPlayers([...p].sort((a: Player, b: Player) => a.lastName.localeCompare(b.lastName)));
      setItems(it);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try {
      await adminRequest('/api/equipment', getToken(), {
        method: 'POST',
        body: JSON.stringify({ ...form, playerId: form.playerId || undefined, label: form.label || undefined, size: form.size || undefined, note: form.note || undefined }),
      });
      setForm(f => ({ ...f, label: '', size: '', note: '' }));
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function toggleReturn(it: Item) {
    try {
      await adminRequest(`/api/equipment/${it.id}`, getToken(), {
        method: 'PATCH', body: JSON.stringify({ returned: !it.returnedAt }),
      });
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function del(id: string) {
    if (!confirm('Obrisati stavku iz evidencije?')) return;
    try { await adminRequest(`/api/equipment/${id}`, getToken(), { method: 'DELETE' }); await load(); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const shown = filter ? items.filter(i => i.playerId === filter) : items;
  const active = shown.filter(i => !i.returnedAt);
  const returned = shown.filter(i => i.returnedAt);
  const naziv = (it: Item) => it.player ? `${it.player.lastName} ${it.player.firstName}` : 'Klupska oprema';

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Oprema <span style={{ color: 'var(--text-muted)' }} className="text-base font-normal">· {items.filter(i => !i.returnedAt).length} zaduženo</span></h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5 mb-6">
        <h2 className="text-white font-bold mb-3">Novo zaduženje</h2>
        <div className="flex flex-wrap gap-3">
          <select value={form.playerId} onChange={e => setForm(f => ({ ...f, playerId: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
            <option value="">Klupska oprema (bez igračice)</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName} · {p.team.name}</option>)}
          </select>
          <select value={form.itemType} onChange={e => setForm(f => ({ ...f, itemType: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input placeholder="Oznaka (npr. dres br. 8)" value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm w-44 outline-none" />
          <input placeholder="Veličina" value={form.size}
            onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm w-24 outline-none" />
          <input placeholder="Napomena (opciono)" value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm flex-1 min-w-40 outline-none" />
          <button onClick={add} style={{ backgroundColor: 'var(--primary)' }}
            className="px-5 py-2 rounded-lg text-white text-sm font-bold">Zaduži</button>
        </div>
      </div>

      <select value={filter} onChange={e => setFilter(e.target.value)} style={inputStyle}
        className="px-3 py-2 rounded-lg text-sm outline-none mb-5">
        <option value="">— Sve igračice —</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>)}
      </select>

      <h2 className="text-white font-bold mb-2">Zaduženo</h2>
      <div className="flex flex-col gap-2 mb-8">
        {active.map(it => (
          <div key={it.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="text-white text-sm font-semibold">{naziv(it)}</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-sm"> — {it.itemType}{it.label ? ` · ${it.label}` : ''}{it.size ? ` · vel. ${it.size}` : ''}</span>
              <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">
                zaduženo {new Date(it.issuedAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}{it.note ? ` · ${it.note}` : ''}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleReturn(it)} className="px-3 py-1 rounded-lg text-sm text-white" style={{ backgroundColor: '#166534' }}>Razduži</button>
              <button onClick={() => del(it.id)} className="text-xs text-red-500 hover:text-red-400 px-2">obriši</button>
            </div>
          </div>
        ))}
        {active.length === 0 && <p style={{ color: 'var(--text-muted)' }} className="text-sm">Nema aktivnih zaduženja.</p>}
      </div>

      {returned.length > 0 && (
        <>
          <h2 className="text-white font-bold mb-2">Vraćeno</h2>
          <div className="flex flex-col gap-2">
            {returned.map(it => (
              <div key={it.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', opacity: 0.6 }}
                className="rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {naziv(it)} — {it.itemType}{it.label ? ` · ${it.label}` : ''} · vraćeno {new Date(it.returnedAt!).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}
                </div>
                <button onClick={() => toggleReturn(it)} className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>vrati u zaduženo</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
