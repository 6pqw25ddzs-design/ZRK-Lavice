import { getStandings } from '@/lib/api';

export const revalidate = 0;

export default async function TabelaPage() {
  const rows = await getStandings().catch(() => []);

  // group by league (already sorted by API: league asc, points desc)
  const groups: Record<string, any[]> = {};
  for (const r of rows) {
    (groups[r.league] ||= []).push(r);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Tabela</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-10">Trenutni plasman na ligaškim tabelama.</p>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Tabela još nije objavljena.</p>
      ) : (
        Object.entries(groups).map(([league, items]) => (
          <div key={league} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-6 rounded-full" />
              <h2 className="text-lg font-black text-white">{league}</h2>
            </div>
            <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }} className="text-left">
                    <th className="px-3 py-3 w-8">#</th>
                    <th className="px-3 py-3">Ekipa</th>
                    <th className="px-2 py-3 text-center" title="Odigrano">Od</th>
                    <th className="px-2 py-3 text-center" title="Pobjede">P</th>
                    <th className="px-2 py-3 text-center" title="Neriješeno">N</th>
                    <th className="px-2 py-3 text-center" title="Porazi">I</th>
                    <th className="px-2 py-3 text-center hidden sm:table-cell" title="Golovi">Gol</th>
                    <th className="px-2 py-3 text-center font-bold" title="Bodovi">Bod</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r: any, i: number) => (
                    <tr key={r.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: r.isOwnTeam ? 'rgba(196,18,48,0.12)' : 'transparent',
                      }}>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td className="px-3 py-3 font-semibold" style={{ color: r.isOwnTeam ? 'var(--primary)' : 'white' }}>{r.teamName}</td>
                      <td className="px-2 py-3 text-center text-white">{r.played}</td>
                      <td className="px-2 py-3 text-center text-white">{r.wins}</td>
                      <td className="px-2 py-3 text-center text-white">{r.draws}</td>
                      <td className="px-2 py-3 text-center text-white">{r.losses}</td>
                      <td className="px-2 py-3 text-center hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{r.goalsFor}:{r.goalsAgainst}</td>
                      <td className="px-2 py-3 text-center font-black" style={{ color: 'var(--gold)' }}>{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
