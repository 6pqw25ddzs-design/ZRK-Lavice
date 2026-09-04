import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlayer, getResults } from '@/lib/api';

export const revalidate = 0;

export default async function IgracPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, results] = await Promise.all([
    getPlayer(id).catch(() => null),
    getResults().catch(() => []),
  ]);

  if (!p) notFound();

  const trainings = (p.attendance || []).filter((a: any) => a.event?.type === 'training').length;
  const matches = p.matchesPlayed ?? (p.attendance || []).filter((a: any) => a.event?.type === 'match').length;
  const isFirstTeam = p.team?.category === 'prva_liga';
  const goals = p.goals ?? 0;
  const avg = matches > 0 ? Math.round((goals / matches) * 10) / 10 : 0;

  // Učinak po utakmicama (javno samo za Prvi tim): golovi iz zapisnika po meču
  const perMatch = isFirstTeam
    ? (results as any[])
        .filter(r => r.event?.team?.category === 'prva_liga')
        .map(r => ({
          id: r.id,
          title: r.event?.title,
          date: r.event?.startsAt,
          score: `${r.homeScore}:${r.awayScore}`,
          win: r.homeScore > r.awayScore,
          draw: r.homeScore === r.awayScore,
          goals: Number((r.scorers || {})[p.id]) || 0,
          played: !!(r.scorers || {})[p.id] || (p.attendance || []).some((a: any) => a.eventId === r.eventId && a.status === 'present'),
        }))
        .filter(m => m.played)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const stats = [
    isFirstTeam
      ? { label: 'Golova', value: goals }
      : { label: 'Treninga', value: trainings },
    { label: 'Utakmica', value: matches },
    ...(isFirstTeam ? [{ label: 'Prosjek po meču', value: avg }] : []),
    { label: 'Godište', value: p.birthDate ? new Date(p.birthDate).getFullYear() : '—' },
  ];

  return (
    <div>
      {/* HERO — stil velikih klupskih sajtova */}
      <div className="relative overflow-hidden" style={{ background: 'radial-gradient(120% 120% at 80% 0%, #4a0f1d 0%, #2a0c14 40%, #141414 100%)' }}>
        {/* ogromni broj dresa u pozadini */}
        {p.jerseyNumber != null && (
          <div aria-hidden className="absolute right-0 top-1/2 -translate-y-1/2 font-black select-none pointer-events-none leading-none"
            style={{
              fontSize: 'clamp(260px, 42vw, 560px)',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(212,172,13,0.22)',
            }}>
            {p.jerseyNumber}
          </div>
        )}
        {/* suptilna tekstura svjetla */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 45% at 30% 100%, rgba(196,18,48,0.22), transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-5 pt-8 relative">
          <Link href="/ekipe" className="text-sm font-medium hover:underline" style={{ color: 'rgba(255,255,255,0.55)' }}>← Sve ekipe</Link>

          <div className="flex flex-col sm:flex-row sm:items-end gap-8 mt-10">
            {/* Fotografija */}
            {p.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`}
                className="w-56 sm:w-64 md:w-72 aspect-[4/5] rounded-t-3xl object-cover object-top shrink-0"
                style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }} />
            ) : (
              <div className="w-56 sm:w-64 aspect-[4/5] rounded-t-3xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ backgroundColor: '#C41230' }} className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-3xl">
                  {p.jerseyNumber ?? (p.firstName?.charAt(0) ?? '?')}
                </span>
              </div>
            )}

            {/* Ime i info */}
            <div className="pb-10">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {p.jerseyNumber != null && (
                  <span className="text-5xl font-black leading-none" style={{ color: '#D4AC0D' }}>{p.jerseyNumber}</span>
                )}
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white" style={{ backgroundColor: '#C41230' }}>
                  {p.position || 'Igračica'}
                </span>
                {isFirstTeam && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{ color: '#D4AC0D', border: '1px solid rgba(212,172,13,0.4)' }}>Prvi tim</span>
                )}
              </div>
              <h1 className="font-black text-white uppercase leading-[0.88] tracking-tight" style={{ fontSize: 'clamp(2.6rem, 7vw, 5.2rem)' }}>
                <span className="block" style={{ color: 'rgba(255,255,255,0.82)' }}>{p.firstName}</span>
                <span className="block" style={{ color: '#C41230', textShadow: '0 2px 30px rgba(196,18,48,0.35)' }}>{p.lastName}</span>
              </h1>
              {!isFirstTeam && p.team?.name && (
                <div className="mt-4 text-lg font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.team.name}</div>
              )}
            </div>
          </div>
        </div>
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, #D4AC0D 30%, #C41230 70%, transparent)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">
        {/* STATISTIKA — traka */}
        <div className={`grid grid-cols-2 ${stats.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-6 text-center relative overflow-hidden"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />
              <div className="text-5xl font-black tracking-tight" style={{ color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[11px] mt-2.5 uppercase tracking-[0.18em] font-bold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* UČINAK PO UTAKMICAMA — samo Prvi tim */}
        {perMatch.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-[3px]" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />
              <h2 className="text-xl font-black text-white uppercase tracking-wide">Učinak po utakmicama</h2>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              {perMatch.map((m, i) => (
                <Link key={m.id} href={`/utakmica/${m.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                  style={{ borderBottom: i < perMatch.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span className="w-1.5 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: m.win ? '#16a34a' : m.draw ? '#D4AC0D' : '#C41230' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{m.title}</div>
                    <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">
                      {m.date && new Date(m.date).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })} · {m.score}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black" style={{ color: m.goals > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{m.goals}</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs ml-1">{m.goals === 1 ? 'gol' : m.goals > 1 && m.goals < 5 ? 'gola' : 'golova'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
