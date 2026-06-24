'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type GalleryImage = { id: string; title?: string; imageUrl: string; sortOrder: number; };

export default function AdminGalerijaPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', imageUrl: '', sortOrder: '' });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/gallery', getToken());
      setImages(data);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.imageUrl) { setError('Link na sliku je obavezan'); return; }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = { imageUrl: form.imageUrl };
      if (form.title) body.title = form.title;
      if (form.sortOrder) body.sortOrder = Number(form.sortOrder);
      await adminRequest('/api/gallery', getToken(), { method: 'POST', body: JSON.stringify(body) });
      setForm({ title: '', imageUrl: '', sortOrder: '' });
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovu sliku?')) return;
    try {
      await adminRequest(`/api/gallery/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Galerija</h1>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">Nova slika</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Link na sliku (https://...) *" value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle} />
          <input placeholder="Naslov (opciono)" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input type="number" placeholder="Redoslijed (0 = prvi)" value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
            className={inputClass} style={inputStyle} />
        </div>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <button onClick={handleSave} disabled={saving}
          style={{ backgroundColor: 'var(--primary)' }}
          className="mt-4 px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
          {saving ? 'Čuvanje...' : 'Dodaj sliku'}
        </button>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-3">
          Link na sliku: postavi fotografiju (Google Drive javno, Imgur, ili sajt) i zalijepi direktan link na .jpg/.png.
        </p>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema slika.</p>}
          {images.map(img => (
            <div key={img.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.title || ''} className="w-full aspect-square object-cover" />
              <div className="p-2 flex items-center justify-between gap-2">
                <span className="text-white text-xs truncate">{img.title || '—'}</span>
                <button onClick={() => handleDelete(img.id)}
                  className="px-2 py-1 rounded text-xs bg-red-900 text-white hover:bg-red-700 transition-colors shrink-0">
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
