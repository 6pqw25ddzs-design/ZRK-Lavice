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
        {/* Handball court — perspective, right half only */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 400"
          preserveAspectRatio="xMaxYMid meet"
          style={{
            position: 'absolute', right: 0, top: '50%',
            transform: 'translateY(-50%)',
            width: '56%', height: '88%',
            opacity: 0.10, pointerEvents: 'none',
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/*
            Perspective projection of right half of handball court (20m×20m).
            Camera: looking from front-bottom at ~55°.
            svgX(u,v) = (100+90v) + u*(420-160v)   u=0 centre, u=1 goal
            svgY(v)   = 360 - 290v                  v=0 near, v=1 far
            => BL(100,360) BR(520,360) TR(450,70) TL(190,70)
          */}

          {/* Sidelines */}
          <line x1="100" y1="360" x2="520" y2="360" stroke="white" strokeWidth="2.5"/>
          <line x1="190" y1="70"  x2="450" y2="70"  stroke="white" strokeWidth="2.5"/>
          {/* Centre line */}
          <line x1="100" y1="360" x2="190" y2="70"  stroke="white" strokeWidth="2.5"/>
          {/* Goal line */}
          <line x1="520" y1="360" x2="450" y2="70"  stroke="white" strokeWidth="2.5"/>

          {/* Centre circle — right semicircle, projected */}
          <path d="M 158 172 Q 247 215 132 259" fill="none" stroke="white" strokeWidth="2"/>

          {/* 6m goal area D */}
          <path d="M 511 324 Q 398 316 385 237 L 381 192 Q 386 115 459 106"
            fill="none" stroke="white" strokeWidth="2.5"/>

          {/* 9m free-throw dashed D */}
          <path d="M 458 360 Q 333 326 332 237 L 332 192 Q 342 105 412 70"
            fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="10 7"/>

          {/* Goal box */}
          <line x1="490" y1="237" x2="504" y2="233" stroke="white" strokeWidth="3"/>
          <line x1="480" y1="192" x2="493" y2="188" stroke="white" strokeWidth="3"/>
          <line x1="504" y1="233" x2="493" y2="188" stroke="white" strokeWidth="3"/>

          {/* 7m spot */}
          <circle cx="366" cy="215" r="4" fill="white"/>

          {/* 4m keeper line */}
          <line x1="420" y1="237" x2="414" y2="192" stroke="white" strokeWidth="2"/>
        </svg>
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
