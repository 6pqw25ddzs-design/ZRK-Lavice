'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Trener = {
  id: string; fullName: string; role: string; category?: string;
  bio?: string; licenseNo?: string; photoUrl?: string; sortOrder: number;
};

const EMPTY = { fullName: '', role: '', category: '', bio: '', licenseNo: '', photoUrl: '', sortOrder: '' };

const KATEGORIJE = ['Mini rukomet', 'Pionirska selekcija', 'Prva liga', 'Sve kategorije'];

export default function AdminTreneriPage() {
  const [rows, setRows] = useState<Trener[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(EMPTY);

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/treneri', getToken());
      setRows(data);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() { setForm(EMPTY); setEditing(null); setError(''); }

  async function handleSave() {
    if (!form.fullName || !form.role) { setError('Ime i uloga su obavezni'); return; }
    setSaving(true); setError('');
    const body: Record<string, unknown> = { fullName: form.fullName, role: form.role };
    if (form.category) body.category = form.category;
    if (form.bio) body.bio = form.bio;
    if (form.licenseNo) body.licenseNo = form.licenseNo;
    if (form.photoUrl.trim()) body.photoUrl = form.photoUrl.trim();
    if (form.sortOrder !== '') body.sortOrder = Number(form.sortOrder);
    try {
      if (editing) {
        await adminRequest(`/api/treneri/${editing}`, getToken(), { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await adminRequest('/api/treneri', getToken(), { method: 'POST', body: JSON.stringify(body) });
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
    if (!confirm('Obrisati ovog trenera?')) return;
    try {
      await adminRequest(`/api/treneri/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  function startEdit(t: Trener) {
    setEditing(t.id);
    setForm({
      fullName: t.fullName, role: t.role, category: t.category || '',
      bio: t.bio || '', licenseNo: t.licenseNo || '', photoUrl: t.photoUrl || '',
      sortOrder: t.sortOrder?.toString() ?? '',
    });
  }

  const ic = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const is = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Treneri</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi trenera' : 'Novi trener'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Ime i prezime *" value={form.fullName}
            onChange={e => setForm((f: any) => ({ ...f, fullName: e.target.value }))} className={ic} style={is} />
          <input placeholder="Uloga * (npr. Glavni trener)" value={form.role}
            onChange={e => setForm((f: any) => ({ ...f, role: e.target.value }))} className={ic} style={is} />
          <select value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}
            className={ic} style={is}>
            <option value="">Kategorija (opciono)</option>
            {KATEGORIJE.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <input placeholder="Licenca (npr. EHF Master Coach)" value={form.licenseNo}
            onChange={e => setForm((f: any) => ({ ...f, licenseNo: e.target.value }))} className={ic} style={is} />
          <textarea placeholder="Biografija trenera..." value={form.bio} rows={4}
            onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))}
            className={`${ic} col-span-2 resize-none`} style={is} />
          <input placeholder="Link na sliku (https://...) — opciono" value={form.photoUrl}
            onChange={e => setForm((f: any) => ({ ...f, photoUrl: e.target.value }))} className={ic} style={is} />
          <input type="number" placeholder="Redoslijed (0 = prvi)" value={form.sortOrder}
            onChange={e => setForm((f: any) => ({ ...f, sortOrder: e.target.value }))} className={ic} style={is} />
        </div>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Dodaj trenera'}
          </button>
          {editing && (
            <button onClick={resetForm} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              className="px-6 py-2 rounded-lg hover:text-white transition-colors">Otkaži</button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-3">
          Slika: postavi je (postimages.org) i zalijepi direktan link na .jpg/.png.
        </p>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {rows.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema trenera.</p>}
          {rows.map(t => (
            <div key={t.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {t.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photoUrl} alt={t.fullName} className="w-12 h-12 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--primary)' }} />
                ) : (
                  <div style={{ backgroundColor: 'var(--border)' }} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {t.fullName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-white font-semibold">{t.fullName}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-xs truncate">
                    {t.role}{t.category ? ` · ${t.category}` : ''}{t.licenseNo ? ` · ${t.licenseNo}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(t)} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">Uredi</button>
                <button onClick={() => handleDelete(t.id)}
                  className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700 transition-colors">Briši</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
