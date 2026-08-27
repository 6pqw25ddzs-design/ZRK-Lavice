'use client';
import { useState } from 'react';

const API = 'https://zrk-lavice-api.onrender.com';

export default function ClanstvoPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const res = await fetch(`${API}/api/members`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: form.phone || undefined, message: form.message || undefined }),
      });
      if (!res.ok) throw new Error('Provjerite unesene podatke i pokušajte ponovo.');
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = { backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'white' };
  const inputCls = 'px-4 py-3 rounded-lg outline-none focus:border-red-600 w-full';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p style={{ color: 'var(--gold)' }} className="text-sm font-bold tracking-widest uppercase mb-4">Budite dio čopora</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
          Postanite član<br /><span style={{ color: 'var(--primary)' }}>ŽRK Lavice-UDG</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="text-lg leading-relaxed max-w-xl mx-auto">
          Članstvo je otvoreno za sve koji žele da podrže razvoj ženskog rukometa u Crnoj Gori —
          roditelje, navijače, bivše sportiste i prijatelje kluba.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-12">
        {[
          { i: '🎫', t: 'Članska kartica', d: 'Status člana kluba i mjesto u našoj zajednici.' },
          { i: '📣', t: 'Prvi saznajete', d: 'Pozivi na utakmice, događaje i druženja.' },
          { i: '🦁', t: 'Podrška Lavicama', d: 'Članarina ide direktno u razvoj djevojčica.' },
        ].map(x => (
          <div key={x.t} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">{x.i}</div>
            <div className="text-white font-bold text-sm mb-1">{x.t}</div>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">{x.d}</p>
          </div>
        ))}
      </div>

      {sent ? (
        <div style={{ backgroundColor: 'var(--card)', border: '1px solid #16a34a' }} className="rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">🦁</div>
          <h2 className="text-white font-black text-2xl mb-2">Pristupnica primljena!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Hvala vam. Javićemo vam se uskoro sa detaljima o članstvu.</p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-2xl p-8 flex flex-col gap-4">
          <h2 className="text-white font-black text-xl">Pristupnica</h2>
          <input required minLength={3} placeholder="Ime i prezime *" value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className={inputCls} style={inputStyle} />
          <input required type="email" placeholder="Email *" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} style={inputStyle} />
          <input placeholder="Telefon (opciono)" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} style={inputStyle} />
          <textarea placeholder="Poruka (opciono — npr. kako želite da pomognete klubu)" rows={3} value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={inputCls} style={inputStyle} />
          {error && <p style={{ color: 'var(--primary)' }} className="text-sm">{error}</p>}
          <button type="submit" disabled={busy} style={{ backgroundColor: 'var(--primary)' }}
            className="px-8 py-3.5 rounded-full text-white font-bold hover:opacity-90 disabled:opacity-50">
            {busy ? 'Šaljem...' : 'Pošalji pristupnicu'}
          </button>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs text-center">
            Podatke koristimo isključivo za evidenciju članstva i kontakt. <a href="/privatnost" className="underline">Politika privatnosti</a>
          </p>
        </form>
      )}
    </div>
  );
}
