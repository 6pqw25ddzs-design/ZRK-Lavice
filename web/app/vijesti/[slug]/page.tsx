import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsBySlug } from '@/lib/api';

export const revalidate = 0;

export default async function VijestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug).catch(() => null);

  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/vijesti" style={{ color: 'var(--primary)' }} className="text-sm font-medium hover:underline">← Sve vijesti</Link>

      <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-6 mb-2">
        {new Date(article.publishedAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">{article.title}</h1>

      {article.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.coverUrl} alt={article.title} className="w-full rounded-xl mb-8" />
      )}

      {article.body && (
        /<[a-z][\s\S]*>/i.test(article.body) ? (
          // HTML sadržaj iz editora (backend ga sanitizuje pri upisu)
          <div
            style={{ color: 'var(--text-muted)' }}
            className="news-body leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        ) : (
          // Stare vijesti pisane kao čist tekst
          <div style={{ color: 'var(--text-muted)' }} className="leading-relaxed whitespace-pre-wrap text-lg">
            {article.body}
          </div>
        )
      )}

      {article.tags?.length > 0 && (
        <div className="flex gap-2 mt-8 flex-wrap">
          {article.tags.map((t: string) => (
            <span key={t} style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }} className="text-xs px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
