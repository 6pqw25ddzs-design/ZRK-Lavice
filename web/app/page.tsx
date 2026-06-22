import Link from 'next/link';
import { getNews, getResults } from '@/lib/api';

export default async function HomePage() {
  const [news, results] = await Promise.all([
    getNews(3).catch(() => []),
    getResults().catch(() => []),
  ]);

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A1A1A 100%)', position: 'relative', overflow: 'hidden' }} className="py-24 px-4">
          {/* Handball court markings — CSS 3D perspective */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '58%',
          overflow: 'hidden', pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', right: '-5%', top: '-20%', bottom: '-20%', left: 0,
            perspective: '700px',
            perspectiveOrigin: '40% 60%',
          }}>
            <svg
              aria-hidden="true"
              viewBox="0 0 400 400"
              style={{
                width: '100%', height: '100%',
                opacity: 0.13,
                transform: 'rotateX(52deg) rotateY(8deg)',
                transformOrigin: '50% 50%',
              }}
            >
              {/* Top-down right half court. x=0 centre, x=400 goal. y=0 top, y=400 bottom. 1m=20px */}

              {/* Sidelines (top and bottom) */}
              <line x1="0" y1="0" x2="400" y2="0" stroke="white" strokeWidth="2.5"/>
              <line x1="0" y1="400" x2="400" y2="400" stroke="white" strokeWidth="2.5"/>
              {/* Goal line */}
              <line x1="400" y1="0" x2="400" y2="400" stroke="white" strokeWidth="2.5"/>
              {/* Centre line */}
              <line x1="0" y1="0" x2="0" y2="400" stroke="white" strokeWidth="2.5"/>

              {/* 6m D-arc — centre (400,200) r=120 */}
              <path d="M 400 80 A 120 120 0 0 0 400 320" fill="none" stroke="white" strokeWidth="2.5"/>

              {/* 9m dashed D-arc — centre (400,200) r=180 */}
              <path d="M 400 20 A 180 180 0 0 0 400 380" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="12 8"/>

              {/* Centre circle right half — centre (0,200) r=60 */}
              <path d="M 0 140 A 60 60 0 0 1 0 260" fill="none" stroke="white" strokeWidth="2"/>

              {/* 7m spot */}
              <circle cx="260" cy="200" r="5" fill="white"/>

              {/* 4m goalkeeper line */}
              <line x1="320" y1="170" x2="320" y2="230" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'var(--gold)' }} className="text-sm font-bold tracking-widest uppercase mb-4">Podgorica, Crna Gora</p>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Razvijamo<br />
            <span style={{ color: 'var(--primary)' }}>šampionke</span><br />
            budućnosti
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-xl mb-8 max-w-xl">
            Ženski rukometni klub koji njeguje talenat, timski duh i pobjednički mentalitet.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/ekipe"
              style={{ backgroundColor: 'var(--primary)' }}
              className="px-8 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
              Naše ekipe
            </Link>
            <Link href="/raspored"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              className="px-8 py-3 border rounded-lg hover:text-white transition-colors">
              Raspored
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '47', label: 'Igračica' },
            { value: '3', label: 'Ekipe' },
            { value: '7', label: 'Trenera' },
            { value: '2026', label: 'Osnovano' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div style={{ color: 'var(--primary)' }} className="text-4xl font-black">{s.value}</div>
              <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rezultati */}
      {results.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-white mb-6">Posljednji rezultati</h2>
            <div className="grid gap-3">
              {results.slice(0, 3).map((r: any) => (
                <div key={r.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{r.homeTeam} vs {r.awayTeam}</div>
                    <div style={{ color: 'var(--text-muted)' }} className="text-sm">{new Date(r.playedAt).toLocaleDateString('sr-Latn-ME')}</div>
                  </div>
                  <div style={{ color: 'var(--primary)' }} className="text-2xl font-black">{r.homeScore}:{r.awayScore}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vijesti */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Vijesti</h2>
            <Link href="/vijesti" style={{ color: 'var(--primary)' }} className="text-sm font-medium hover:underline">Sve vijesti →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news.map((a: any) => (
              <div key={a.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 hover:border-red-800 transition-colors">
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mb-2">{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME')}</div>
                <h3 className="text-white font-bold text-lg leading-snug">{a.title}</h3>
                {a.body && <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2 line-clamp-2">{a.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
