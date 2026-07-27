import { getSchedule } from '@/lib/api';

export default async function RasporedPage() {
  const events = await getSchedule().catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Raspored</h1>
      {events.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Nema predstojećih utakmica.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((e: any) => {
            const d = new Date(e.startsAt);
            return (
              <div key={e.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5 flex gap-5 items-center">
                <div className="text-center min-w-[56px]">
                  <div className="text-3xl font-black text-white">{Number(d.toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric' }).replace(/\D/g, ''))}</div>
                  <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase">{d.toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', month: 'short' })}</div>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold">{e.title || `${e.homeTeam} vs ${e.awayTeam}`}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
                    {d.toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                    {e.location && ` · ${e.location}`}
                  </div>
                </div>
                <div style={{ backgroundColor: e.type === 'match' ? 'var(--primary)' : 'var(--gold)' }}
                  className="text-white text-xs font-bold px-3 py-1 rounded-full">
                  {e.type === 'match' ? 'Utakmica' : 'Trening'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
