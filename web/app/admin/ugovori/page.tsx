'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Contract = {
  id: string; title: string; party?: string; kind: string;
  signedAt?: string; expiresAt: string; amountEur?: number; fileUrl?: string; note?: string;
};

const KINDS = ['Sponzorstvo', 'Registracija saveza', 'Dvorana', 'Osiguranje', 'Usluge', 'Ostalo'];

export default function AdminUgovoriPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [form, setForm] = useState({ title: '', party: '', kind: KINDS[0], signedAt: '', expiresAt: '', amountEur: '', fileUrl: '', note: '' });
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }
  async function load() {
    try { setContracts(await adminRequest('/api/contracts', getToken())); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.title || !form.expiresAt) { setError('Unesite naziv i datum isteka'); return; }
    setError('');
    try {
      await adminRequest('/api/contracts', getToken(), {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          signedAt: form.signedAt ? new Date(form.signedAt).toISOString() : undefined,
          expiresAt: new Date(form.expiresAt).toISOString(),
          amountEur: form.amountEur || undefined,
          party: form.party || undefined, fileUrl: form.fileUrl || undefined, note: form.note || undefined,
        }),
      });
      setForm({ title: '', party: '', kind: KINDS[0], signedAt: '', expiresAt: '', amountEur: '', fileUrl: '', note: '' });
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function del(id: string, title: string) {
    if (!confirm(`Obrisati ugovor "${title}"?`)) return;
    try { await adminRequest(`/api/contracts/${id}`, getToken(), { method: 'DELETE' }); await load(); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const now = Date.now();
  function status(c: Contract) {
    const left = Math.floor((new Date(c.expiresAt).getTime() - now) / 86400000);
    if (left < 0) return { txt: 'ISTEKAO', color: '#dc2626', left };
    if (left <= 60) return { txt: `ističe za ${left} dana`, color: '#d4ac0d', left };
    return { txt: `važi još ${left} dana`, color: '#16a34a', left };
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Ugovori</h1>
      <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-6">
        Automatski podsjetnik mejlom stiže na 60, 30 i 7 dana prije isteka.
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5 mb-8">
        <h2 className="text-white font-bold mb-3">Novi ugovor</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Naziv * (npr. Generalno sponzorstvo UDG)" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          <input placeholder="Druga strana (npr. UDG)" value={form.party}
            onChange={e => setForm(f => ({ ...f, party: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
            {KINDS.map(k => <option key={k}>{k}</option>)}
          </select>
          <input type="number" placeholder="Vrijednost € (opciono)" value={form.amountEur}
            onChange={e => setForm(f => ({ ...f, amountEur: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          <label className="text-xs flex flex-col gap-1" style={{ color: 'var(--text-muted)' }}>Potpisan
            <input type="date" value={form.signedAt} onChange={e => setForm(f => ({ ...f, signedAt: e.target.value }))}
              style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          </label>
          <label className="text-xs flex flex-col gap-1" style={{ color: 'var(--text-muted)' }}>Ističe *
            <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          </label>
          <input placeholder="Link na skeniran ugovor (opciono)" value={form.fileUrl}
            onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none sm:col-span-2" />
          <input placeholder="Napomena (opciono)" value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none sm:col-span-2" />
        </div>
        <button onClick={add} style={{ backgroundColor: 'var(--primary)' }}
          className="mt-4 px-5 py-2 rounded-lg text-white text-sm font-bold">Sačuvaj ugovor</button>
      </div>

      <div className="flex flex-col gap-2">
        {contracts.map(c => {
          const st = status(c);
          return (
            <div key={c.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${st.color}` }}
              className="rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-white font-semibold">{c.title}
                  <span style={{ color: 'var(--text-muted)' }} className="font-normal text-sm">{c.party ? ` · ${c.party}` : ''} · {c.kind}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: st.color, fontWeight: 700 }}>{st.txt}</span>
                  {' '}· do {new Date(c.expiresAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}
                  {c.amountEur ? ` · ${c.amountEur}€` : ''}
                  {c.fileUrl && <> · <a href={c.fileUrl} target="_blank" style={{ color: 'var(--primary)' }}>dokument</a></>}
                  {c.note ? ` · ${c.note}` : ''}
                </div>
              </div>
              <button onClick={() => del(c.id, c.title)} className="text-xs text-red-500 hover:text-red-400 shrink-0">obriši</button>
            </div>
          );
        })}
        {contracts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema unesenih ugovora — počni sa UDG sponzorskim ugovorom.</p>}
      </div>
    </div>
  );
}
