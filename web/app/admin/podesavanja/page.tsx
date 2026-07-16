'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

const FIELDS = [
  { key: 'contact_email', label: 'Email', placeholder: 'info@zrklavice.me' },
  { key: 'contact_phone', label: 'Telefon', placeholder: '+382 ...' },
  { key: 'contact_location', label: 'Naziv lokacije', placeholder: 'SC Morača' },
  { key: 'contact_address', label: 'Adresa', placeholder: 'Ulica Moskovska bb, Podgorica' },
  { key: 'contact_training', label: 'Termini treninga', placeholder: 'Utorak, četvrtak i petak...' },
];

// Tajni ključevi — javni API ih nikad ne vraća, čita ih samo backend
const SECRET_FIELDS = [
  { key: 'secret_resend_api_key', label: 'Resend API ključ (za email obavještenja o prijavama)', placeholder: 're_...' },
  { key: 'secret_notify_email', label: 'Email na koji stižu prijave', placeholder: 'pedjab@me.com' },
  { key: 'secret_notify_from', label: 'Šalje sa adrese (tek kad se domen verifikuje u Resendu)', placeholder: 'ŽRK Lavice <prijave@zrklavice.me>' },
];

export default function AdminPodesavanjaPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [userForm, setUserForm] = useState({ email: '', fullName: '', password: '', role: 'admin' });
  const [userMsg, setUserMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/settings/all', getToken());
      setForm(data || {});
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true); setError(''); setMsg('');
    try {
      await adminRequest('/api/settings', getToken(), { method: 'PUT', body: JSON.stringify(form) });
      setMsg('Sačuvano.');
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateUser() {
    setUserMsg('');
    if (!userForm.email || !userForm.fullName || userForm.password.length < 8) {
      setUserMsg('Popunite sva polja (lozinka najmanje 8 znakova)'); return;
    }
    try {
      const u = await adminRequest('/api/auth/users', getToken(), { method: 'POST', body: JSON.stringify(userForm) });
      setUserMsg(`✓ Nalog kreiran: ${u.email} (${u.role === 'admin' ? 'administrator' : 'trener'})`);
      setUserForm({ email: '', fullName: '', password: '', role: 'admin' });
    } catch (e: any) {
      setUserMsg('Greška: ' + (e?.message || ''));
    }
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600 w-full";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-6">Podešavanja</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6">
        <h2 className="text-white font-bold mb-4">Kontakt informacije</h2>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
          <div className="flex flex-col gap-4">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">{f.label}</label>
                <input value={form[f.key] || ''} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={inputClass} style={inputStyle} />
              </div>
            ))}
            <h2 className="text-white font-bold mt-4">Email obavještenja</h2>
            {SECRET_FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">{f.label}</label>
                <input value={form[f.key] || ''} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={inputClass} style={inputStyle} />
              </div>
            ))}
            {error && <p style={{ color: 'var(--primary)' }} className="text-sm">{error}</p>}
            {msg && <p style={{ color: '#22c55e' }} className="text-sm">{msg}</p>}
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: 'var(--primary)' }}
              className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 mt-2 w-fit">
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mt-6">
        <h2 className="text-white font-bold mb-4">Novi nalog za panel</h2>
        <div className="flex flex-col gap-4">
          <input value={userForm.email} placeholder="Email" type="email"
            onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} className={inputClass} style={inputStyle} />
          <input value={userForm.fullName} placeholder="Ime i prezime"
            onChange={e => setUserForm(p => ({ ...p, fullName: e.target.value }))} className={inputClass} style={inputStyle} />
          <input value={userForm.password} placeholder="Lozinka (najmanje 8 znakova)" type="text"
            onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} className={inputClass} style={inputStyle} />
          <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
            className={inputClass} style={inputStyle}>
            <option value="admin">Administrator (pun pristup)</option>
            <option value="coach">Trener (svoja ekipa: prisustvo, objave, razvoj)</option>
          </select>
          {userMsg && <p className="text-sm" style={{ color: userMsg.startsWith('✓') ? '#22c55e' : 'var(--primary)' }}>{userMsg}</p>}
          <button onClick={handleCreateUser}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 w-fit">
            Kreiraj nalog
          </button>
        </div>
      </div>
    </div>
  );
}
