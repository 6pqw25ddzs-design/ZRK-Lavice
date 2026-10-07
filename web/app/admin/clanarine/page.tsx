'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string };
type Fee = { id: string; amountEur: number; status: 'unpaid' | 'paid' | 'waived'; paidAt: string | null };
type Row = { playerId: string; firstName: string; lastName: string; fee: Fee | null };

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

export default function AdminClanarinePage() {
  const now = new Date();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<Row[]>([]);
  const [amount, setAmount] = useState('20');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  useEffect(() => {
    adminRequest('/api/teams', getToken()).then((t: Team[]) => {
      setTeams(t);
      if (t.length > 0) setTeamId(prev => prev || t[0].id);
    }).catch(() => setError('Greška pri učitavanju ekipa'));
  }, []);

  async function load() {
    if (!teamId) { setRows([]); return; }
    try {
      setRows(await adminRequest(`/api/fees?teamId=${teamId}&year=${year}&month=${month}`, getToken()));
      setError('');
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, [teamId, year, month]);

  async function generate() {
    if (!amount || isNaN(Number(amount))) { setError('Unesite iznos'); return; }
    setBusy(true);
    try {
      await adminRequest('/api/fees/generate', getToken(), {
        method: 'POST', body: JSON.stringify({ teamId, year, month, amountEur: Number(amount) }),
      });
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
    finally { setBusy(false); }
  }

  async function setStatus(feeId: string, status: string) {
    try {
      await adminRequest(`/api/fees/${feeId}`, getToken(), { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  function exportExcel() {
    const sorted = [...rows].sort((a, b) => {
      const rank = (r: Row) => r.fee?.status === 'unpaid' ? 0 : r.fee ? 1 : 2;
      return rank(a) - rank(b) || a.lastName.localeCompare(b.lastName, 'sr');
    });
    const statusLabel = (r: Row) => !r.fee ? 'Nije zadužena' : r.fee.status === 'paid' ? 'Plaćeno' : r.fee.status === 'waived' ? 'Oslobođena' : 'Neplaćeno';
    let nUnpaid = 0, nPaid = 0;
    const data = [
      ['R.br.', 'Prezime i ime', 'Iznos (EUR)', 'Status'],
      ...sorted.map(r => {
        const st = statusLabel(r);
        const n = st === 'Neplaćeno' ? ++nUnpaid : st === 'Plaćeno' ? ++nPaid : '';
        return [String(n), `${r.lastName} ${r.firstName}`, r.fee ? String(r.fee.amountEur) : '', st];
      }),
      [],
      ['', 'Plaćeno ' + paid + '/' + charged, 'naplaćeno ' + totalPaid + '€', ''],
    ];
    const csv = data.map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const team = teams.find(t => t.id === teamId)?.name || 'ekipa';
    a.download = `clanarine-${team.toLowerCase().replace(/\s+/g, '-')}-${year}-${String(month).padStart(2, '0')}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const paid = rows.filter(r => r.fee?.status === 'paid').length;
  const charged = rows.filter(r => r.fee).length;
  const totalPaid = rows.filter(r => r.fee?.status === 'paid').reduce((s, r) => s + (r.fee?.amountEur || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white">Članarine</h1>
        {teamId && rows.length > 0 && (
          <button onClick={exportExcel} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            className="px-4 py-2 rounded-lg text-sm hover:text-white transition-colors">
            ⬇️ Izvezi u Excel
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={teamId} onChange={e => setTeamId(e.target.value)} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
          <option value="">— Ekipa —</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
          {[year - 1, year, year + 1].filter((v, i, a) => a.indexOf(v) === i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!teamId && <p style={{ color: 'var(--text-muted)' }}>Izaberi ekipu da vidiš igračice i zaduženja za izabrani mjesec.</p>}
      {teamId && rows.length === 0 && !error && (
        <p style={{ color: 'var(--text-muted)' }}>U ovoj ekipi nema aktivnih igračica — dodaj ih u sekciji Igrači, pa se vrati ovdje da ih zadužiš.</p>
      )}

      {teamId && rows.length > 0 && (
        <>
          {charged < rows.length && (
            <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
              <span className="text-white text-sm">Zaduži sve za {MONTHS[month - 1].toLowerCase()} {year}:</span>
              <input value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} className="px-3 py-1.5 rounded-lg text-sm w-20 outline-none" />
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">EUR</span>
              <button onClick={generate} disabled={busy} style={{ backgroundColor: 'var(--primary)' }}
                className="px-4 py-1.5 rounded-lg text-white text-sm font-bold disabled:opacity-50">
                {busy ? 'Generišem...' : 'Generiši zaduženja'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { l: 'Platilo', v: `${paid}/${charged}`, c: '#16a34a' },
              { l: 'Naplaćeno', v: `${totalPaid}€`, c: 'var(--gold)' },
              { l: 'Nedostaje', v: `${rows.filter(r => r.fee?.status === 'unpaid').reduce((s2, r) => s2 + (r.fee?.amountEur || 0), 0)}€`, c: '#dc2626' },
            ].map(x => (
              <div key={x.l} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
                <div className="text-2xl font-black" style={{ color: x.c }}>{x.v}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{x.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {(() => {
              const sorted = [...rows].sort((a, b) => {
                const rank = (r: Row) => r.fee?.status === 'unpaid' ? 0 : r.fee ? 1 : 2;
                return rank(a) - rank(b) || a.lastName.localeCompare(b.lastName, 'sr');
              });
              let nU = 0, nP = 0;
              return sorted.map(r => ({ r, n: r.fee?.status === 'unpaid' ? ++nU : r.fee?.status === 'paid' ? ++nP : 0 }));
            })().map(({ r, n }) => (
              <div key={r.playerId} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${r.fee?.status === 'paid' ? '#16a34a' : r.fee?.status === 'waived' ? '#d4ac0d' : r.fee ? '#dc2626' : 'var(--border)'}` }}
                className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-white font-medium">
                  {n > 0 && <span style={{ color: 'var(--text-muted)' }} className="inline-block w-7 text-sm tabular-nums">{n}.</span>}
                  {r.lastName} {r.firstName}
                </span>
                {r.fee ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.fee.amountEur}€</span>
                    {(['paid', 'unpaid', 'waived'] as const).map(s => (
                      <button key={s} onClick={() => setStatus(r.fee!.id, s)}
                        style={r.fee!.status === s
                          ? { backgroundColor: s === 'paid' ? '#16a34a' : s === 'waived' ? '#d4ac0d' : '#dc2626', color: 'white' }
                          : { border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold">
                        {s === 'paid' ? 'Plaćeno' : s === 'waived' ? 'Oslobođena' : 'Neplaćeno'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>nije zadužena</span>
                )}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Plaćeno {paid}/{charged} zaduženih · ukupno naplaćeno <span className="text-white font-bold">{totalPaid}€</span>
          </p>
        </>
      )}
    </div>
  );
}
