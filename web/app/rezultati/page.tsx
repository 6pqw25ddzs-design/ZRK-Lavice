import { getResults, getTeams } from '@/lib/api';

export const revalidate = 0;

const API = 'https://zrk-lavice-api.onrender.com';

export default async function RezultatiPage() {
  const [results, teams] = await Promise.all([
    getResults().catch(() => []),
    getTeams().catch(() => []),
  ]);

  // Statistika seniorske ekipe (javna samo za prvu ligu)
  const firstTeam = (teams as any[]).find(t => t.category === 'prva_liga');
  const stats = firstTeam
    ? await fetch(`${API}/api/stats?teamId=${firstTeam.id}`, { next: { revalidate: 60 } })
        .then(r => (r.ok ? r.json() : null)).catch(() => null)
    : null;

  const card = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' } as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Rezultati</h1>

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
                <div className="text-2xl font-black" style={{ color: x.c || 'white' }}>{x.v}</div>
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
                    className="flex items-center gap-4 px-4 py-3"
                    style={{ borderBottom: i < stats.scorers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span className="w-6 text-center font-black" style={{ color: i < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>{i + 1}</span>
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
                    <div className="text-2xl font-black shrink-0" style={{ color: 'var(--primary)' }}>{s.goals}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {results.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Još nema unesenih rezultata.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((r: any) => (
            <div key={r.id} style={card}
              className="rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-white font-semibold">{r.event?.title}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
                  {r.event?.startsAt && new Date(r.event.startsAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })}
                  {r.event?.team?.name && ` · ${r.event.team.name}`}
                </div>
                {r.notes && <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{r.notes}</div>}
              </div>
              <div className="text-3xl font-black shrink-0" style={{ color: 'var(--gold)' }}>
                {r.homeScore} : {r.awayScore}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
