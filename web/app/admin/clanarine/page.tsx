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
    adminRequest('/api/teams', getToken()).then(setTeams).catch(() => setError('Greška pri učitavanju ekipa'));
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

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const paid = rows.filter(r => r.fee?.status === 'paid').length;
  const charged = rows.filter(r => r.fee).length;
  const totalPaid = rows.filter(r => r.fee?.status === 'paid').reduce((s, r) => s + (r.fee?.amountEur || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Članarine</h1>

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

          <div className="flex flex-col gap-2 mb-4">
            {rows.map(r => (
              <div key={r.playerId} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-white font-medium">{r.lastName} {r.firstName}</span>
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
