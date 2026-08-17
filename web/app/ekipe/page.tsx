import Link from 'next/link';
import { getTeams, getPlayers } from '@/lib/api';

export default async function EkipePage() {
  const [teams, players] = await Promise.all([
    getTeams().catch(() => []),
    getPlayers().catch(() => []),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Ekipe</h1>
      {teams.map((team: any) => {
        const teamPlayers = players.filter((p: any) => p.teamId === team.id);
        return (
          <div key={team.id} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-8 rounded-full" />
              <h2 className="text-xl font-black text-white">{team.name}</h2>
              {team.category && <span style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }} className="text-xs border px-2 py-1 rounded-full">{team.category}</span>}
            </div>
            {teamPlayers.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {teamPlayers.map((p: any) => (
                  <Link key={p.id} href={`/igrac/${p.id}`} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden text-center block hover:border-red-800 transition-colors group">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`}
                        className="w-full aspect-[4/5] object-cover object-top transition-transform group-hover:scale-[1.03]" />
                    ) : (
                      <div className="w-full aspect-[4/5] flex items-center justify-center" style={{ backgroundColor: 'var(--border)' }}>
                        <span style={{ backgroundColor: 'var(--primary)' }} className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl">
                          {p.jerseyNumber || (p.firstName?.charAt(0) ?? '?')}
                        </span>
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-white text-sm font-bold leading-tight">{p.firstName} {p.lastName}</div>
                      <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                        {[p.position, p.birthDate ? new Date(p.birthDate).getFullYear() : null].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
