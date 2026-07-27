import { getResults } from '@/lib/api';

export const revalidate = 0;

export default async function RezultatiPage() {
  const results = await getResults().catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Rezultati</h1>
      {results.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Još nema unesenih rezultata.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((r: any) => (
            <div key={r.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
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
