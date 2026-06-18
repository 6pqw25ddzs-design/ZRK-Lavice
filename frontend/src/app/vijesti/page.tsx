'use client';
import { useEffect, useState } from 'react';
import { getNews } from '@/lib/api';

interface Article { id: string; title: string; slug: string; coverUrl?: string; publishedAt: string; tags: string[]; }

export default function VijestiPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    getNews().then(r => setArticles(Array.isArray(r) ? r : r.data ?? [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Vijesti <span className="text-[#C41230]">Kluba</span></h1>
        <p className="text-gray-400 mb-10">Najnovije informacije iz ZRK Lavice</p>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map(a => (
            <div key={a.id} className="bg-[#2A2A2A] rounded-xl overflow-hidden hover:bg-[#333] transition-colors">
              {a.coverUrl && <img src={a.coverUrl} alt={a.title} className="w-full h-48 object-cover" />}
              {!a.coverUrl && <div className="w-full h-48 bg-[#C41230]/20 flex items-center justify-center text-[#C41230] text-4xl">⚽</div>}
              <div className="p-5">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {a.tags.map(tag => <span key={tag} className="text-xs bg-[#C41230]/20 text-[#C41230] px-2 py-1 rounded">{tag}</span>)}
                </div>
                <h2 className="text-xl font-bold mb-2">{a.title}</h2>
                <p className="text-gray-400 text-sm">{new Date(a.publishedAt).toLocaleDateString('sr-ME')}</p>
              </div>
            </div>
          ))}
          {articles.length === 0 && <p className="text-gray-400">Nema objavljenih vijesti.</p>}
        </div>
      </div>
    </div>
  );
}
