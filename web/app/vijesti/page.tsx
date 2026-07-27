import Link from 'next/link';
import { getNews } from '@/lib/api';

export const revalidate = 0;

export default async function VijestiPage() {
  const articles = await getNews(20).catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Vijesti</h1>
      {articles.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Nema objavljenih vijesti.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {articles.map((a: any) => (
            <Link key={a.id} href={`/vijesti/${a.slug}`}
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-6 block hover:border-red-800 transition-colors">
              <div style={{ color: 'var(--text-muted)' }} className="text-xs mb-2">{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <h2 className="text-white font-black text-xl mb-3">{a.title}</h2>
              {a.body && <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed line-clamp-3">{a.body}</p>}
              {a.tags?.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {a.tags.map((t: string) => (
                    <span key={t} style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }} className="text-xs px-2 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
