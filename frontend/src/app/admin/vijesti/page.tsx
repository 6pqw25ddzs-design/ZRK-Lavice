'use client';
import { useEffect, useState } from 'react';
import { getNews, createArticle, updateArticle, deleteArticle } from '@/lib/api';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';

type Article = {
  id: string; title: string; slug: string; coverUrl?: string;
  publishedAt?: string; isPublished: boolean; tags: string[];
};

const emptyForm = { title: '', slug: '', body: '', coverUrl: '', tags: '', isPublished: false };

export default function VijestiAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Article & { body?: string } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getNews({ limit: 50 }).then(setArticles).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setModal('create');
  }
  function openEdit(a: Article) {
    setForm({ title: a.title, slug: a.slug, body: '', coverUrl: a.coverUrl || '', tags: a.tags.join(', '), isPublished: a.isPublished });
    setEditing(a);
    setModal('edit');
  }

  async function save() {
    setSaving(true);
    try {
      const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (modal === 'create') await createArticle(data);
      else if (editing) await updateArticle(editing.id, data);
      setModal(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(a: Article) {
    await updateArticle(a.id, { isPublished: !a.isPublished });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Obrisati vijest?')) return;
    await deleteArticle(id);
    load();
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Vijesti</h1>
          <p className="text-gray-400 text-sm mt-0.5">{articles.length} objavljenih</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Nova vijest
        </button>
      </div>

      <div className="space-y-3">
        {articles.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-dark to-red-950 flex-shrink-0 flex items-center justify-center text-white text-lg">📰</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-dark truncate">{a.title}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-400">{a.publishedAt ? format(new Date(a.publishedAt), 'd. MMM yyyy.', { locale: sr }) : 'Draft'}</span>
                {a.tags.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => togglePublish(a)} className={clsx('flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
                a.isPublished ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-500 bg-gray-50 border-gray-200'
              )}>
                {a.isPublished ? <><Eye size={12} /> Objavljeno</> : <><EyeOff size={12} /> Draft</>}
              </button>
              <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded transition-colors"><Pencil size={14} /></button>
              <button onClick={() => remove(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">Nema vijesti.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="font-bold text-lg">{modal === 'create' ? 'Nova vijest' : 'Uredi vijest'}</h3>
              <button onClick={() => setModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Naslov *</label>
                <input value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: modal === 'create' ? slugify(e.target.value) : f.slug }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Slug (URL) *</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Tekst *</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  rows={6}
                  placeholder="Upiši sadržaj vijesti..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Tagovi (odvojeni zarezom)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="utakmica, trening, vijest"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm font-semibold text-dark">Odmah objavi</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 flex-shrink-0">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600">Odustani</button>
              <button onClick={save} disabled={saving || !form.title || !form.slug || !form.body}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 flex items-center gap-2">
                {saving ? 'Snimanje...' : <><Check size={14} /> Snimi</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
