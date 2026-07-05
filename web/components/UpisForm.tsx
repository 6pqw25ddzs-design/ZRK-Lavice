'use client';
import { useState } from 'react';
import { submitRegistration } from '@/lib/api';

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 - i);

export default function UpisForm() {
  const [form, setForm] = useState({ childName: '', birthYear: '', parentName: '', parentPhone: '', parentEmail: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    const missing = [];
    if (!form.childName) missing.push('ime djeteta');
    if (!form.birthYear) missing.push('godište');
    if (!form.parentName) missing.push('ime roditelja');
    if (!form.parentPhone) missing.push('telefon');
    if (!form.parentEmail) missing.push('email');
    if (missing.length) { setError('Nedostaje: ' + missing.join(', ')); return; }

    setSaving(true); setError('');
    try {
      await submitRegistration({
        childName: form.childName,
        birthYear: Number(form.birthYear),
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        parentEmail: form.parentEmail,
      });
      setDone(true);
    } catch {
      setError('Greška pri slanju. Provjerite podatke i pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🦁</div>
        <h3 className="text-2xl font-black mb-2" style={{ color: '#1A1A1A' }}>Hvala na prijavi!</h3>
        <p style={{ color: '#5b5b5b' }} className="leading-relaxed">
          Vaša prijava je primljena. Kontaktiraćemo vas uskoro sa detaljima o probnom treningu i terminima.
        </p>
      </div>
    );
  }

  const input = 'w-full px-4 py-3 rounded-xl outline-none transition-colors text-[15px]';
  const inputStyle = { backgroundColor: '#FFFFFF', border: '1px solid #E3E3E3', color: '#1A1A1A' } as const;
  const label = 'text-xs font-semibold uppercase tracking-wide block mb-1.5';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} style={{ color: '#8a8a8a' }}>Ime i prezime djeteta *</label>
          <input value={form.childName} onChange={e => setForm(f => ({ ...f, childName: e.target.value }))} className={input} style={inputStyle} placeholder="npr. Ana Nikolić" />
        </div>
        <div>
          <label className={label} style={{ color: '#8a8a8a' }}>Godište djeteta *</label>
          <select value={form.birthYear} onChange={e => setForm(f => ({ ...f, birthYear: e.target.value }))} className={input} style={inputStyle}>
            <option value="">Odaberi godinu</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} style={{ color: '#8a8a8a' }}>Ime i prezime roditelja *</label>
          <input value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} className={input} style={inputStyle} placeholder="npr. Marko Nikolić" />
        </div>
        <div>
          <label className={label} style={{ color: '#8a8a8a' }}>Telefon *</label>
          <input value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} className={input} style={inputStyle} placeholder="+382 ..." />
        </div>
      </div>
      <div>
        <label className={label} style={{ color: '#8a8a8a' }}>Email *</label>
        <input type="email" value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))} className={input} style={inputStyle} placeholder="email@primjer.com" />
      </div>

      {error && <p className="text-sm font-medium" style={{ color: '#C41230' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={saving}
        style={{ backgroundColor: '#C41230' }}
        className="px-8 py-4 text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all mt-1 shadow-lg shadow-red-900/20">
        {saving ? 'Slanje...' : 'Pošalji prijavu'}
      </button>
      <p className="text-xs text-center" style={{ color: '#a0a0a0' }}>Prvi trening je besplatan i bez obaveza.</p>
    </div>
  );
}
