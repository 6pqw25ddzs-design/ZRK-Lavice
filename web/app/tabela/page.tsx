import PageHero from '@/components/site/PageHero';
import { getPrvaLigaTabela, getRrlTabela, type TabelaRed } from '@/lib/tabele';

export const revalidate = 300;
export const metadata = {
  title: 'Tabela | ŽRK Lavice-UDG',
  description: 'Tabele Prve ženske lige Crne Gore i Regionalne rukometne lige (WRHL).',
};

function Tabela({ title, source, rows }: { title: string; source: string; rows: TabelaRed[] | null }) {
  const card = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' } as const;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <h2 className="display text-2xl text-white">{title}</h2>
        <span style={{ color: 'var(--lav-grey-400)' }} className="text-xs">{source}</span>
      </div>
      {!rows ? (
        <p style={{ color: 'var(--lav-grey-400)' }} className="text-sm">Tabela trenutno nije dostupna — pokušaj kasnije.</p>
      ) : (
        <div style={card} className="rounded-xl overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 430 }}>
            <thead>
              <tr style={{ color: 'var(--lav-grey-400)', borderBottom: '1px solid var(--border)' }}
                className="text-[11px] uppercase tracking-wider">
                <th className="text-left py-2.5 pl-4 pr-2 w-8">#</th>
                <th className="text-left py-2.5 pr-2">Klub</th>
                <th className="text-center py-2.5 px-1.5">U</th>
                <th className="text-center py-2.5 px-1.5">P</th>
                <th className="text-center py-2.5 px-1.5">N</th>
                <th className="text-center py-2.5 px-1.5">I</th>
                <th className="text-center py-2.5 px-1.5">Gol-raz.</th>
                <th className="text-center py-2.5 px-3 font-black">Bod</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.rank + r.name}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: r.nasa ? 'rgba(196,18,48,0.14)' : undefined,
                    borderLeft: r.nasa ? '3px solid var(--lav-red)' : '3px solid transparent',
                  }}>
                  <td className="py-2.5 pl-4 pr-2 nums" style={{ color: 'var(--lav-grey-400)' }}>{r.rank}.</td>
                  <td className={`py-2.5 pr-2 ${r.nasa ? 'font-black text-white' : 'font-medium text-white/90'}`}>
                    {r.name}
                  </td>
                  <td className="text-center py-2.5 px-1.5 nums text-white/80">{r.played}</td>
                  <td className="text-center py-2.5 px-1.5 nums text-white/80">{r.won}</td>
                  <td className="text-center py-2.5 px-1.5 nums text-white/80">{r.drawn}</td>
                  <td className="text-center py-2.5 px-1.5 nums text-white/80">{r.lost}</td>
                  <td className="text-center py-2.5 px-1.5 nums" style={{ color: 'var(--lav-grey-400)' }}>
                    {r.gf}:{r.ga}
                  </td>
                  <td className="text-center py-2.5 px-3 nums font-black" style={{ color: 'var(--lav-gold)' }}>
                    {r.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function TabelaPage() {
  const [prva, rrl] = await Promise.all([getPrvaLigaTabela(), getRrlTabela()]);

  return (
    <div>
      <PageHero eyebrow="Takmičenje" title="Tabela"
        sub="Pozicije Lavica u oba takmičenja — Prvoj ženskoj ligi Crne Gore i Regionalnoj rukometnoj ligi." />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-16 grid lg:grid-cols-2 gap-10 items-start">
        <Tabela title="Prva ženska liga Crne Gore" source="Izvor: RSCG" rows={prva} />
        <Tabela title="Regionalna liga (WRHL) · Grupa B" source="Izvor: rr-liga.com" rows={rrl} />
      </div>
    </div>
  );
}
