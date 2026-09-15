import Link from 'next/link';

const API = 'https://api.zrklavice.me';

export const revalidate = 120;

async function getData() {
  const [schedule, results] = await Promise.all([
    fetch(`${API}/api/schedule`, { next: { revalidate: 120 } }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API}/api/results`, { next: { revalidate: 120 } }).then(r => r.ok ? r.json() : []).catch(() => []),
  ]);
  return { schedule: Array.isArray(schedule) ? schedule : [], results: Array.isArray(results) ? results : [] };
}

export default async function LiveTicker() {
  const { schedule, results } = await getData();
  const now = Date.now();

  const nextMatch = schedule.find((e: any) => e.type === 'match' && new Date(e.startsAt).getTime() > now - 2 * 3600_000);
  const lastResult = results[0];
  const nextTraining = schedule.find((e: any) => e.type === 'training' && new Date(e.startsAt).getTime() > now);

  const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(d).toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', ...opts });

  const segments: { href: string; label: string; value: string }[] = [];
  if (nextMatch) {
    segments.push({
      href: '/raspored', label: 'Sljedeća utakmica',
      value: `${nextMatch.title} · ${fmt(nextMatch.startsAt, { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}${nextMatch.location ? ` · ${nextMatch.location}` : ''}`,
    });
  }
  if (lastResult) {
    const w = lastResult.homeScore > lastResult.awayScore, d = lastResult.homeScore === lastResult.awayScore;
    segments.push({
      href: `/utakmica/${lastResult.id}`, label: w ? 'Pobjeda' : d ? 'Neriješeno' : 'Posljednji rezultat',
      value: `Lavice ${lastResult.homeScore}:${lastResult.awayScore} ${lastResult.event?.title}`,
    });
  }
  if (nextTraining) {
    segments.push({
      href: '/raspored', label: 'Sljedeći trening',
      value: `${nextTraining.team?.name || ''} · ${fmt(nextTraining.startsAt, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}${nextTraining.location ? ` · ${nextTraining.location}` : ''}`,
    });
  }
  if (segments.length === 0) return null;

  return (
    <div className="h-[44px] overflow-x-auto whitespace-nowrap flex items-center"
      style={{ backgroundColor: '#0E0C0F', borderBottom: '1px solid rgba(255,255,255,0.06)', scrollSnapType: 'x mandatory' }}>
      <div className="flex items-center gap-0 px-6 lg:px-12 max-w-[1320px] mx-auto w-full">
        {segments.map((s, i) => (
          <span key={i} className="flex items-center" style={{ scrollSnapAlign: 'start' }}>
            {i > 0 && <span className="mx-5 w-1 h-1 rounded-full inline-block" style={{ backgroundColor: 'var(--lav-gold)' }} />}
            <Link href={s.href} className="text-[12.5px] hover:opacity-80 transition-opacity">
              <span className="font-bold uppercase tracking-[0.14em] mr-2" style={{ color: 'var(--lav-gold)' }}>{s.label}:</span>
              <span className="text-white/80 font-medium">{s.value}</span>
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
