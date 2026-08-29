import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const API = 'https://zrk-lavice-api.onrender.com';

export default async function UtakmicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await fetch(`${API}/api/stats/match/${id}`, { next: { revalidate: 60 } })
    .then(r => (r.ok ? r.json() : null)).catch(() => null);

  if (!m) notFound();

  const win = m.homeScore > m.awayScore;
  const draw = m.homeScore === m.awayScore;
  const outcome = win ? 'Pobjeda' : draw ? 'Nerešeno' : 'Poraz';
  const outcomeColor = win ? '#16a34a' : draw ? 'var(--gold)' : '#dc2626';
  const card = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' } as const;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/rezultati" style={{ color: 'var(--primary)' }} className="text-sm font-medium hover:underline">← Svi rezultati</Link>

      {/* Zaglavlje utakmice */}
      <div style={{ ...card, borderTop: `3px solid ${outcomeColor}` }} className="rounded-2xl p-8 mt-6 mb-8 text-center">
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: outcomeColor }}>{outcome}</div>
        <h1 className="text-xl md:text-2xl font-black text-white leading-tight">{m.event?.title}</h1>
        <div className="text-5xl md:text-6xl font-black my-5 text-white">
          {m.homeScore}<span style={{ color: 'var(--primary)' }}> : </span>{m.awayScore}
        </div>
        <div style={{ color: 'var(--text-muted)' }} className="text-sm">
          {m.event?.startsAt && new Date(m.event.startsAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })}
          {m.event?.location ? ` · ${m.event.location}` : ''}
          {m.event?.team?.name ? ` · ${m.event.team.name}` : ''}
        </div>
        {m.notes && <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-3">{m.notes}</p>}
      </div>

      {/* Strijelci */}
      {m.scorersPublic && m.scorers?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-black text-white mb-4">⚽ Strijelci</h2>
          <div style={card} className="rounded-xl overflow-hidden">
            {m.scorers.map((s: any, i: number) => (
              <Link key={s.playerId} href={`/igrac/${s.playerId}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                style={{ borderBottom: i < m.scorers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt="" className="w-11 h-11 rounded-full object-cover object-top" />
                ) : (
                  <span style={{ backgroundColor: 'var(--primary)' }} className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black">{s.jerseyNumber ?? '?'}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{s.firstName} {s.lastName}</div>
                  {s.jerseyNumber != null && <div style={{ color: 'var(--text-muted)' }} className="text-xs">#{s.jerseyNumber}</div>}
                </div>
                <div className="text-2xl font-black shrink-0" style={{ color: 'var(--primary)' }}>
                  {s.goals}<span style={{ color: 'var(--text-muted)' }} className="text-xs font-normal ml-1">{s.goals === 1 ? 'gol' : s.goals < 5 ? 'gola' : 'golova'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ostatak sastava iz zapisnika */}
      {m.scorersPublic && m.roster?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-white mb-4">Nastupile i</h2>
          <div className="flex flex-wrap gap-2">
            {m.roster.map((p: any) => (
              <Link key={p.playerId} href={`/igrac/${p.playerId}`}
                style={card} className="flex items-center gap-2 rounded-full pl-1 pr-4 py-1 hover:bg-white/5 transition-colors">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover object-top" />
                ) : (
                  <span style={{ backgroundColor: 'var(--primary)' }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black">{p.jerseyNumber ?? '?'}</span>
                )}
                <span className="text-white text-sm font-medium">{p.firstName} {p.lastName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!m.scorersPublic && (
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Pojedinačna statistika se javno objavljuje samo za seniorsku ekipu.
        </p>
      )}
    </div>
  );
}
