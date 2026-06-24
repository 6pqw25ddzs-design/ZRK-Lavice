'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Document = { id: string; title: string; category: string; fileUrl: string; isPublic: boolean; createdAt: string; };

export default function AdminDokumentiPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', category: '', fileUrl: '', isPublic: true });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/documents', getToken());
      setDocs(data);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.title || !form.category || !form.fileUrl) { setError('Sva polja su obavezna'); return; }
    setSaving(true); setError('');
    try {
      await adminRequest('/api/documents', getToken(), { method: 'POST', body: JSON.stringify(form) });
      setForm({ title: '', category: '', fileUrl: '', isPublic: true });
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovaj dokument?')) return;
    try {
      await adminRequest(`/api/documents/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dokumenti</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">Novi dokument</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Naziv *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input placeholder="Kategorija * (npr. Obrasci, Pravilnici)" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input placeholder="Link na fajl (https://...)" value={form.fileUrl}
            onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle} />
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <input type="checkbox" checked={form.isPublic}
            onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
          Vidljivo javno na sajtu
        </label>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <button onClick={handleSave} disabled={saving}
          style={{ backgroundColor: 'var(--primary)' }}
          className="mt-4 px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
          {saving ? 'Čuvanje...' : 'Dodaj dokument'}
        </button>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-3">
          Link na fajl: postavi PDF/dokument negdje (Google Drive — podijeli javno, ili sajt) i zalijepi direktan link.
        </p>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {docs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema dokumenata.</p>}
          {docs.map(d => (
            <div key={d.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-white font-semibold">{d.title}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                  {d.category}{!d.isPublic && ' · (skriveno)'}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Otvori
                </a>
                <button onClick={() => handleDelete(d.id)}
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
