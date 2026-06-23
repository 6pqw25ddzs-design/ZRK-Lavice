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
                  <div key={p.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4 text-center">
                    <div style={{ backgroundColor: 'var(--border)' }} className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                      {p.jerseyNumber || (p.firstName?.charAt(0) ?? '?')}
                    </div>
                    <div className="text-white text-sm font-semibold leading-tight">{p.firstName} {p.lastName}</div>
                    {p.position && <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{p.position}</div>}
                    {p.birthDate && <div style={{ color: 'var(--text-muted)' }} className="text-xs">{new Date(p.birthDate).getFullYear()}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
