'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Article = { id: string; title: string; body?: string; coverUrl?: string; publishedAt: string; };

export default function AdminVijestiPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', coverUrl: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function getToken() {
    return localStorage.getItem('admin_token') || '';
  }

  async function load() {
    try {
      const data = await adminRequest('/api/news?limit=50', getToken());
      setArticles(data);
    } catch (e) {
      setError('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { title: form.title, body: form.body };
      if (form.coverUrl.trim()) payload.coverUrl = form.coverUrl.trim();
      if (editing) {
        await adminRequest(`/api/news/${editing}`, getToken(), {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        const baseSlug = form.title
          .toLowerCase()
          .replace(/[čć]/g, 'c').replace(/[šđ]/g, 's').replace(/ž/g, 'z')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const slug = `${baseSlug}-${Date.now().toString(36)}`;
        await adminRequest('/api/news', getToken(), {
          method: 'POST',
          body: JSON.stringify({ ...payload, slug, isPublished: true }),
        });
      }
      setForm({ title: '', body: '', coverUrl: '' });
      setEditing(null);
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovu vijest?')) return;
    try {
      await adminRequest(`/api/news/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch {
      setError('Greška pri brisanju');
    }
  }

  function startEdit(a: Article) {
    setEditing(a.id);
    setForm({ title: a.title, body: a.body || '', coverUrl: a.coverUrl || '' });
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Vijesti</h1>

      {/* Forma */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi vijest' : 'Nova vijest'}</h2>
        <div className="flex flex-col gap-3">
          <input
            placeholder="Naslov"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
            className="px-4 py-2 rounded-lg outline-none focus:border-red-600"
          />
          <textarea
            placeholder="Tekst vijesti..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={5}
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
            className="px-4 py-2 rounded-lg outline-none focus:border-red-600 resize-none"
          />
          <input
            placeholder="Link na sliku (https://...) — opciono"
            value={form.coverUrl}
            onChange={e => setForm(f => ({ ...f, coverUrl: e.target.value }))}
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
            className="px-4 py-2 rounded-lg outline-none focus:border-red-600"
          />
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">
            Slika za vijest: postavi je (postimages.org, Imgur ili sajt) i zalijepi direktan link na .jpg/.png. Bez slike, prikazuje se podrazumijevani izgled.
          </p>
          {error && <p style={{ color: 'var(--primary)' }} className="text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: 'var(--primary)' }}
              className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
              {saving ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Objavi vijest'}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ title: '', body: '', coverUrl: '' }); }}
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                className="px-6 py-2 rounded-lg hover:text-white transition-colors">
                Otkaži
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map(a => (
            <div key={a.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-white font-semibold">{a.title}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME')}</div>
                {a.body && <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2 line-clamp-2">{a.body}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(a)}
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Uredi
                </button>
                <button onClick={() => handleDelete(a.id)}
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
