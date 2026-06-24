'use client';
import { useState } from 'react';
import { submitRegistration } from '@/lib/api';

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 - i); // 2020..2010

export default function RegistracijaPage() {
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
    } catch (e: any) {
      setError('Greška pri slanju. Provjerite podatke i pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "px-4 py-3 rounded-lg outline-none focus:border-red-600 w-full";
  const inputStyle = { backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'white' };

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-white mb-3">Hvala na prijavi!</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Vaša prijava je primljena. Kontaktiraćemo vas uskoro sa detaljima o upisu i terminima treninga.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Upis djeteta</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-8">
        Popunite formu i naš tim će vas kontaktirati. Prijem je otvoren za sve uzraste.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Ime i prezime djeteta *</label>
          <input value={form.childName} onChange={e => setForm(f => ({ ...f, childName: e.target.value }))}
            className={inputClass} style={inputStyle} placeholder="npr. Ana Nikolić" />
        </div>
        <div>
          <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Godište *</label>
          <select value={form.birthYear} onChange={e => setForm(f => ({ ...f, birthYear: e.target.value }))}
            className={inputClass} style={inputStyle}>
            <option value="">Odaberi godinu rođenja</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Ime i prezime roditelja *</label>
          <input value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))}
            className={inputClass} style={inputStyle} placeholder="npr. Marko Nikolić" />
        </div>
        <div>
          <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Telefon *</label>
          <input value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))}
            className={inputClass} style={inputStyle} placeholder="+382 ..." />
        </div>
        <div>
          <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Email *</label>
          <input type="email" value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))}
            className={inputClass} style={inputStyle} placeholder="email@primjer.com" />
        </div>

        {error && <p style={{ color: 'var(--primary)' }} className="text-sm">{error}</p>}

        <button onClick={handleSubmit} disabled={saving}
          style={{ backgroundColor: 'var(--primary)' }}
          className="px-8 py-3 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 mt-2">
          {saving ? 'Slanje...' : 'Pošalji prijavu'}
        </button>
      </div>
    </div>
  );
}
