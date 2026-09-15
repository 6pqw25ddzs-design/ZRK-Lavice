import Link from 'next/link';
import { getNews } from '@/lib/api';
import PageHero from '@/components/site/PageHero';

export const metadata = { title: 'Vijesti | ŽRK Lavice-UDG', description: 'Novosti iz kluba — utakmice, turniri i priče naših Lavica.' };
export const revalidate = 60;

const datum = (d: string) => new Date(d).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' });

export default async function VijestiPage() {
  const articles = await getNews(21).catch(() => []);
  const [featured, ...rest] = articles as any[];

  return (
    <div>
      <PageHero eyebrow="Iz kluba" title="Vijesti" sub="Utakmice, turniri i priče naših Lavica." />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-14">
        {!featured ? (
          <p style={{ color: 'var(--lav-grey-400)' }}>Nema objavljenih vijesti.</p>
        ) : (
          <>
            {/* Velika vijest */}
            <Link href={`/vijesti/${featured.slug}`} className="group block mb-10 rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {featured.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.coverUrl} alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--lav-maroon-2), var(--lav-black))' }} />
                )}
                {/* overlay naslov — samo desktop */}
                <div className="absolute inset-0 hidden md:flex items-end"
                  style={{ background: 'linear-gradient(to top, rgba(8,7,9,0.95) 0%, rgba(8,7,9,0.3) 55%, transparent)' }}>
                  <div className="p-7 md:p-10 max-w-3xl">
                    <div className="eyebrow mb-3" style={{ color: 'var(--lav-gold)' }}>{datum(featured.publishedAt)}</div>
                    <h2 className="display text-white leading-[0.95]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3.4rem)' }}>{featured.title}</h2>
                  </div>
                </div>
              </div>
              {/* naslov ispod fotografije — mobilni */}
              <div className="p-5 md:hidden">
                <div className="eyebrow mb-2" style={{ color: 'var(--lav-gold)' }}>{datum(featured.publishedAt)}</div>
                <h2 className="display text-white text-3xl leading-[1.02]">{featured.title}</h2>
              </div>
            </Link>

            {/* Mreža */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((a: any) => (
                <Link key={a.id} href={`/vijesti/${a.slug}`}
                  className="rounded-xl overflow-hidden group block"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: 'var(--lav-maroon)' }}>
                    {a.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.coverUrl} alt={a.title} loading="lazy" decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">🦁</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="eyebrow !text-[11px] mb-2">{datum(a.publishedAt)}</div>
                    <h3 className="display text-white text-2xl leading-[1.05] group-hover:underline decoration-1 underline-offset-4">{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
