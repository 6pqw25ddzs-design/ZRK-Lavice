import Link from 'next/link';
import { getResults, getTeams } from '@/lib/api';
import PageHero from '@/components/site/PageHero';

export const metadata = { title: 'Rezultati i strijelci | ŽRK Lavice-UDG', description: 'Rezultati utakmica, bilans sezone i lista strijelaca.' };


export const revalidate = 0;

const API = 'https://api.zrklavice.me';

export default async function RezultatiPage() {
  const [results, teams] = await Promise.all([
    getResults().catch(() => []),
    getTeams().catch(() => []),
  ]);

  // Statistika takmičarskih ekipa (Prvi tim + Pionirke)
  const firstTeam = (teams as any[]).find(t => t.category === 'prva_liga');
  const pionirke = (teams as any[]).find(t => t.category === 'pioniri');
  const [stats, statsPio] = await Promise.all([
    firstTeam
      ? fetch(`${API}/api/stats?teamId=${firstTeam.id}`, { next: { revalidate: 60 } })
          .then(r => (r.ok ? r.json() : null)).catch(() => null)
      : null,
    pionirke
      ? fetch(`${API}/api/stats?teamId=${pionirke.id}`, { next: { revalidate: 60 } })
          .then(r => (r.ok ? r.json() : null)).catch(() => null)
      : null,
  ]);

  const isRRL = (r: any) => (r.event?.notes || '').startsWith('WRHL');
  const resultsPrvi = (results as any[]).filter(r => r.event?.team?.category === 'prva_liga' && !isRRL(r));
  const resultsRRL = (results as any[]).filter(r => r.event?.team?.category === 'prva_liga' && isRRL(r));
  const rrlRecord = resultsRRL.reduce(
    (a, r) => ({
      p: a.p + 1,
      w: a.w + (r.homeScore > r.awayScore ? 1 : 0),
      d: a.d + (r.homeScore === r.awayScore ? 1 : 0),
      l: a.l + (r.homeScore < r.awayScore ? 1 : 0),
      gf: a.gf + r.homeScore, ga: a.ga + r.awayScore,
    }),
    { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 },
  );
  const resultsPio = (results as any[]).filter(r => r.event?.team?.category === 'pioniri');
  const resultsOstalo = (results as any[]).filter(r => !['prva_liga', 'pioniri'].includes(r.event?.team?.category));

  const card = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' } as const;

  const MatchCard = ({ r }: { r: any }) => (
    <Link key={r.id} href={`/utakmica/${r.id}`} style={card}
      className="rounded-xl p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
      <div>
        <div className="text-white font-semibold">{r.event?.title}</div>
        <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
          {r.event?.startsAt && new Date(r.event.startsAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })}
          {r.event?.team?.name && ` · ${r.event.team.name}`}
        </div>
        {r.notes && <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{r.notes}</div>}
        {r.event?.notes && <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{r.event.notes}</div>}
      </div>
      <div className="display nums text-4xl shrink-0" style={{ color: 'var(--lav-gold)' }}>
        {r.homeScore} : {r.awayScore}
      </div>
    </Link>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-5 mt-2">
      <span className="w-8 h-[3px]" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />
      <h2 className="text-2xl font-black text-white uppercase tracking-wide">{children}</h2>
    </div>
  );

  return (
    <div>
      <PageHero eyebrow="Sezona 2026/27" title="Rezultati i strijelci" sub="Bilans sezone, utakmice i lista strijelaca — direktno iz zapisnika." />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-14">

      <SectionTitle>Prvi tim</SectionTitle>

      {/* Bilans sezone */}
      {stats && stats.record.played > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
            {[
              { l: 'Utakmica', v: stats.record.played },
              { l: 'Pobjede', v: stats.record.wins, c: '#16a34a' },
              { l: 'Nerešene', v: stats.record.draws, c: 'var(--gold)' },
              { l: 'Porazi', v: stats.record.losses, c: '#dc2626' },
              { l: 'Dati golovi', v: stats.record.goalsFor },
              { l: 'Gol razlika', v: (stats.record.diff > 0 ? '+' : '') + stats.record.diff },
            ].map((x: any) => (
              <div key={x.l} style={card} className="rounded-xl p-3 text-center">
                <div className="display nums text-4xl" style={{ color: x.c || 'var(--lav-gold)' }}>{x.v}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{x.l}</div>
              </div>
            ))}
          </div>

          {/* Lista strijelaca */}
          {stats.scorers.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-black text-white mb-4">🥇 Lista strijelaca — {stats.team.name}</h2>
              <div style={card} className="rounded-xl overflow-hidden">
                {stats.scorers.map((s: any, i: number) => (
                  <div key={s.playerId}
                    className="relative flex items-center gap-4 px-4 py-3 overflow-hidden"
                    style={{ borderBottom: i < stats.scorers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span aria-hidden className="display absolute right-16 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none" style={{ fontSize: '72px', color: 'rgba(212,172,13,0.07)' }}>{s.jerseyNumber ?? ''}</span>
                    <span className="display w-6 text-center text-lg" style={{ color: i < 3 ? 'var(--lav-gold)' : 'var(--text-muted)' }}>{i + 1}</span>
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover object-top" />
                    ) : (
                      <span style={{ backgroundColor: 'var(--primary)' }} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black">{s.jerseyNumber ?? '?'}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">{s.firstName} {s.lastName}</div>
                      <div style={{ color: 'var(--text-muted)' }} className="text-xs">{s.matches} utakmica · prosjek {s.avg}</div>
                    </div>
                    <div className="display nums text-3xl shrink-0 relative" style={{ color: 'var(--lav-gold)' }}>{s.goals}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {resultsPrvi.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Još nema unesenih rezultata.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {resultsPrvi.map((r: any) => <MatchCard key={r.id} r={r} />)}
        </div>
      )}

      {/* REGIONALNA LIGA (WRHL) — Stars-Lavice-UDG */}
      {resultsRRL.length > 0 && (
        <div className="mt-16">
          <SectionTitle>Regionalna liga — Stars-Lavice-UDG</SectionTitle>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
            {[
              { l: 'Utakmica', v: rrlRecord.p },
              { l: 'Pobjede', v: rrlRecord.w, c: '#16a34a' },
              { l: 'Nerešene', v: rrlRecord.d, c: 'var(--gold)' },
              { l: 'Porazi', v: rrlRecord.l, c: '#dc2626' },
              { l: 'Dati golovi', v: rrlRecord.gf },
              { l: 'Gol razlika', v: (rrlRecord.gf - rrlRecord.ga > 0 ? '+' : '') + (rrlRecord.gf - rrlRecord.ga) },
            ].map((x: any) => (
              <div key={x.l} style={card} className="rounded-xl p-3 text-center">
                <div className="display nums text-4xl" style={{ color: x.c || 'var(--lav-gold)' }}>{x.v}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{x.l}</div>
              </div>
            ))}
          </div>
          {stats?.scorersRRL?.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-black text-white mb-4">🥇 Lista strijelaca — Regionalna liga</h2>
              <div style={card} className="rounded-xl overflow-hidden">
                {stats.scorersRRL.map((s: any, i: number) => (
                  <div key={s.playerId}
                    className="relative flex items-center gap-4 px-4 py-3 overflow-hidden"
                    style={{ borderBottom: i < stats.scorersRRL.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span className="display w-6 text-center text-lg" style={{ color: i < 3 ? 'var(--lav-gold)' : 'var(--text-muted)' }}>{i + 1}</span>
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover object-top" />
                    ) : (
                      <span style={{ backgroundColor: 'var(--primary)' }} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black">{s.jerseyNumber ?? '?'}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">{s.firstName} {s.lastName}</div>
                      <div style={{ color: 'var(--text-muted)' }} className="text-xs">{s.matches} utakmica · prosjek {s.avg}</div>
                    </div>
                    <div className="display nums text-3xl shrink-0 relative" style={{ color: 'var(--lav-gold)' }}>{s.goals}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {resultsRRL.map((r: any) => <MatchCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* PIONIRKE */}
      {(resultsPio.length > 0 || (statsPio && statsPio.record.played > 0)) && (
        <div className="mt-16">
          <SectionTitle>Pionirke</SectionTitle>

          {statsPio && statsPio.record.played > 0 && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
                {[
                  { l: 'Utakmica', v: statsPio.record.played },
                  { l: 'Pobjede', v: statsPio.record.wins, c: '#16a34a' },
                  { l: 'Nerešene', v: statsPio.record.draws, c: 'var(--gold)' },
                  { l: 'Porazi', v: statsPio.record.losses, c: '#dc2626' },
                  { l: 'Dati golovi', v: statsPio.record.goalsFor },
                  { l: 'Gol razlika', v: (statsPio.record.diff > 0 ? '+' : '') + statsPio.record.diff },
                ].map((x: any) => (
                  <div key={x.l} style={card} className="rounded-xl p-3 text-center">
                    <div className="display nums text-4xl" style={{ color: x.c || 'var(--lav-gold)' }}>{x.v}</div>
                    <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{x.l}</div>
                  </div>
                ))}
              </div>

              {statsPio.scorers.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-xl font-black text-white mb-4">🥇 Lista strijelaca — {statsPio.team.name}</h2>
                  <div style={card} className="rounded-xl overflow-hidden">
                    {statsPio.scorers.map((s: any, i: number) => (
                      <div key={s.playerId}
                        className="relative flex items-center gap-4 px-4 py-3 overflow-hidden"
                        style={{ borderBottom: i < statsPio.scorers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span aria-hidden className="display absolute right-16 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none" style={{ fontSize: '72px', color: 'rgba(212,172,13,0.07)' }}>{s.jerseyNumber ?? ''}</span>
                        <span className="display w-6 text-center text-lg" style={{ color: i < 3 ? 'var(--lav-gold)' : 'var(--text-muted)' }}>{i + 1}</span>
                        {s.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover object-top" />
                        ) : (
                          <span style={{ backgroundColor: 'var(--primary)' }} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black">{s.jerseyNumber ?? '?'}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm">{s.firstName} {s.lastName}</div>
                          <div style={{ color: 'var(--text-muted)' }} className="text-xs">{s.matches} utakmica · prosjek {s.avg}</div>
                        </div>
                        <div className="display nums text-3xl shrink-0 relative" style={{ color: 'var(--lav-gold)' }}>{s.goals}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-3">
            {resultsPio.map((r: any) => <MatchCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Ostale kategorije */}
      {resultsOstalo.length > 0 && (
        <div className="mt-16">
          <SectionTitle>Ostale utakmice</SectionTitle>
          <div className="flex flex-col gap-3">
            {resultsOstalo.map((r: any) => <MatchCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}