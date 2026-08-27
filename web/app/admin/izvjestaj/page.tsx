'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
const CATS_KIND: Record<string, string> = { income: 'Prihod', expense: 'Rashod' };

export default function AdminIzvjestajPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  useEffect(() => {
    adminRequest(`/api/reports/monthly?year=${year}&month=${month}`, getToken())
      .then(setD).catch((e: any) => setError(e?.message || 'Greška'));
  }, [year, month]);

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      {/* Kontrole — ne štampaju se */}
      <div className="no-print flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white">Mjesečni izvještaj</h1>
        <div className="flex gap-3">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
            {[year - 1, year, year + 1].filter((v, i, a) => a.indexOf(v) === i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => window.print()} style={{ backgroundColor: 'var(--primary)' }}
            className="px-5 py-2 rounded-lg text-white font-bold">
            🖨️ Sačuvaj PDF
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 no-print mb-4">{error}</p>}

      {/* Izvještaj — bijela A4 podloga, spremna za štampu */}
      {d && (
        <div className="report-sheet mx-auto" style={{ maxWidth: 800 }}>
          <div className="flex items-center justify-between border-b-4 pb-4 mb-6" style={{ borderColor: '#C41230' }}>
            <div>
              <div className="text-2xl font-black" style={{ color: '#1A1A1A' }}>ŽRK Lavice-UDG</div>
              <div className="text-sm" style={{ color: '#6E6862' }}>Mjesečni izvještaj uprave</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black" style={{ color: '#C41230' }}>{MONTHS[d.period.month - 1]} {d.period.year}.</div>
              <div className="text-xs" style={{ color: '#6E6862' }}>generisano {new Date().toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}</div>
            </div>
          </div>

          {/* Klub u brojkama */}
          <h2 className="rpt-h">1. Klub u brojkama</h2>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[
              ['Aktivnih igračica', d.club.activePlayers],
              ['Roditeljskih naloga', d.club.parentUsers],
              ['Članova kluba', d.club.clubMembers],
              ['Novih prijava', d.club.newRegs],
              ['Novih pristupnica', d.club.newMembers],
            ].map(([l, v]) => (
              <div key={String(l)} className="rounded-lg border p-3 text-center" style={{ borderColor: '#E8E4DE' }}>
                <div className="text-xl font-black" style={{ color: '#C41230' }}>{v as number}</div>
                <div className="text-[11px]" style={{ color: '#6E6862' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Finansije */}
          <h2 className="rpt-h">2. Finansije</h2>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              ['Ukupni prihodi', d.finance.totalIncome, '#16a34a'],
              ['Ukupni rashodi', d.finance.expense, '#dc2626'],
              ['Saldo', d.finance.balance, d.finance.balance >= 0 ? '#16a34a' : '#dc2626'],
            ].map(([l, v, c]) => (
              <div key={String(l)} className="rounded-lg border p-3 text-center" style={{ borderColor: '#E8E4DE' }}>
                <div className="text-xl font-black" style={{ color: c as string }}>{(v as number).toFixed(2)}€</div>
                <div className="text-[11px]" style={{ color: '#6E6862' }}>{l}</div>
              </div>
            ))}
          </div>
          <table className="rpt-table">
            <thead><tr><th>Datum</th><th>Tip</th><th>Kategorija</th><th>Opis</th><th className="text-right">Iznos</th></tr></thead>
            <tbody>
              {d.finance.feesIncome > 0 && (
                <tr><td>—</td><td>Prihod</td><td>Članarine</td><td>{d.finance.feesCount} naplaćenih uplata</td>
                  <td className="text-right" style={{ color: '#16a34a' }}>+{d.finance.feesIncome.toFixed(2)}€</td></tr>
              )}
              {d.finance.entries.map((e: any) => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}</td>
                  <td>{CATS_KIND[e.kind]}</td><td>{e.category}</td><td>{e.description || ''}</td>
                  <td className="text-right" style={{ color: e.kind === 'income' ? '#16a34a' : '#dc2626' }}>
                    {e.kind === 'income' ? '+' : '−'}{e.amountEur.toFixed(2)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Članarine po ekipi */}
          <h2 className="rpt-h">3. Naplata članarina</h2>
          <table className="rpt-table">
            <thead><tr><th>Ekipa</th><th>Zaduženo</th><th>Plaćeno</th><th className="text-right">Nenaplaćeno</th></tr></thead>
            <tbody>
              {d.fees.map((f: any) => (
                <tr key={f.team}>
                  <td>{f.team}</td><td>{f.charged}</td><td>{f.paid}</td>
                  <td className="text-right" style={{ color: f.unpaidSum > 0 ? '#dc2626' : '#16a34a' }}>{f.unpaidSum.toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Prisustvo */}
          <h2 className="rpt-h">4. Prisustvo na treninzima</h2>
          <table className="rpt-table">
            <thead><tr><th>Ekipa</th><th className="text-right">Dolaznost</th></tr></thead>
            <tbody>
              {d.attendance.map((a: any) => (
                <tr key={a.team}><td>{a.team}</td>
                  <td className="text-right font-bold">{a.pct === null ? 'bez evidencije' : `${a.pct}%`}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Utakmice */}
          <h2 className="rpt-h">5. Utakmice</h2>
          {d.matches.length === 0 ? (
            <p className="text-sm mb-6" style={{ color: '#6E6862' }}>Nije odigrana nijedna utakmica ovog mjeseca.</p>
          ) : (
            <table className="rpt-table">
              <thead><tr><th>Datum</th><th>Ekipa</th><th>Protivnik</th><th>Rezultat</th><th>Ishod</th></tr></thead>
              <tbody>
                {d.matches.map((m: any, i: number) => (
                  <tr key={i}>
                    <td>{new Date(m.date).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}</td>
                    <td>{m.team}</td><td>{m.opponent}</td><td className="font-bold">{m.score}</td>
                    <td style={{ color: m.outcome === 'P' ? '#16a34a' : m.outcome === 'N' ? '#A8860B' : '#dc2626' }}>
                      {m.outcome === 'P' ? 'Pobjeda' : m.outcome === 'N' ? 'Nerešeno' : 'Poraz'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="text-xs pt-4 border-t mt-6" style={{ color: '#6E6862', borderColor: '#E8E4DE' }}>
            ŽRK Lavice-UDG · Podgorica · zrklavice.me · Izvještaj generisan automatski iz klupske evidencije.
          </div>
        </div>
      )}
    </div>
  );
}
