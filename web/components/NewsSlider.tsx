'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Article = { id: string; title: string; slug: string; coverUrl?: string; publishedAt: string; tags?: string[] };

export default function NewsSlider({ articles }: { articles: Article[] }) {
  const [i, setI] = useState(0);
  const n = articles.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI(p => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="relative h-[300px] md:h-[420px]">
        {articles.map((a, idx) => (
          <Link key={a.id} href={`/vijesti/${a.slug}`}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? 'auto' : 'none' }}>
            {/* background */}
            {a.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverUrl} alt={a.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #3a0e16 60%, var(--primary) 140%)' }} />
            )}
            {/* overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
            {/* content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              {a.tags && a.tags.length > 0 && (
                <span style={{ backgroundColor: 'var(--primary)' }} className="inline-block text-white text-xs font-bold px-3 py-1 rounded mb-3 uppercase tracking-wide">
                  {a.tags[0]}
                </span>
              )}
              <h3 className="text-white font-black text-2xl md:text-4xl leading-tight max-w-3xl">{a.title}</h3>
              <div style={{ color: 'rgba(255,255,255,0.7)' }} className="text-sm mt-3">
                {new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* dots */}
      {n > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2 z-10">
          {articles.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Vijest ${idx + 1}`}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{ backgroundColor: idx === i ? 'var(--primary)' : 'rgba(255,255,255,0.4)', width: idx === i ? 22 : 10 }} />
          ))}
        </div>
      )}
    </div>
  );
}
