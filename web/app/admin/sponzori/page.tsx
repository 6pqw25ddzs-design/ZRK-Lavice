'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Sponsor = { id: string; name: string; level: string; logoUrl?: string; websiteUrl?: string; sortOrder: number; };

const LEVELS = [
  { value: 'gold', label: 'Zlatni' },
  { value: 'silver', label: 'Srebrni' },
  { value: 'bronze', label: 'Bronzani' },
];

export default function AdminSponzoriPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', level: 'gold', logoUrl: '', websiteUrl: '', sortOrder: '' });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/sponsors', getToken());
      setSponsors(data);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ name: '', level: 'gold', logoUrl: '', websiteUrl: '', sortOrder: '' });
    setEditing(null);
    setError('');
  }

  async function handleSave() {
    if (!form.name || !form.level) { setError('Naziv i nivo su obavezni'); return; }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = { name: form.name, level: form.level };
      if (form.logoUrl) body.logoUrl = form.logoUrl;
      if (form.websiteUrl) body.websiteUrl = form.websiteUrl;
      if (form.sortOrder) body.sortOrder = Number(form.sortOrder);

      if (editing) {
        await adminRequest(`/api/sponsors/${editing}`, getToken(), { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await adminRequest('/api/sponsors', getToken(), { method: 'POST', body: JSON.stringify(body) });
      }
      resetForm();
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovog sponzora?')) return;
    try {
      await adminRequest(`/api/sponsors/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  function startEdit(s: Sponsor) {
    setEditing(s.id);
    setForm({
      name: s.name, level: s.level,
      logoUrl: s.logoUrl || '', websiteUrl: s.websiteUrl || '',
      sortOrder: s.sortOrder?.toString() || '',
    });
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const levelLabel = (v: string) => LEVELS.find(l => l.value === v)?.label || v;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Sponzori</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi sponzora' : 'Novi sponzor'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Naziv *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
            className={inputClass} style={inputStyle}>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <input placeholder="Logo URL (https://...)" value={form.logoUrl}
            onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle} />
          <input placeholder="Website (https://...)" value={form.websiteUrl}
            onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input type="number" placeholder="Redoslijed (0 = prvi)" value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
            className={inputClass} style={inputStyle} />
        </div>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Dodaj sponzora'}
          </button>
          {editing && (
            <button onClick={resetForm}
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              className="px-6 py-2 rounded-lg hover:text-white transition-colors">
              Otkaži
            </button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-3">
          Logo URL: postavi sliku negdje (npr. Imgur ili sajt sponzora) i zalijepi direktan link na .png/.jpg.
        </p>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {sponsors.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema sponzora.</p>}
          {sponsors.map(s => (
            <div key={s.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.logoUrl
                  ? <img src={s.logoUrl} alt={s.name} className="w-12 h-12 object-contain rounded bg-white/5" />
                  : <div style={{ backgroundColor: 'var(--border)' }} className="w-12 h-12 rounded flex items-center justify-center text-white font-bold">{s.name.charAt(0)}</div>}
                <div>
                  <div className="text-white font-semibold">{s.name}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-xs">{levelLabel(s.level)}{s.websiteUrl ? ` · ${s.websiteUrl}` : ''}</div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(s)}
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Uredi
                </button>
                <button onClick={() => handleDelete(s.id)}
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
