'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminRequest } from '@/lib/auth';

type Dash = {
  counts: { activePlayers: number; parentUsers: number; pendingRegs: number };
  fees: { charged: number; paid: number; unpaidSum: number };
  expiringDocs: { player: string; type: string; expiresAt: string; expired: boolean }[];
  attendance: { team: string; pct: number | null; records: number }[];
  lastAnnouncement: { title: string; team: string; readCount: number; requiresAck: boolean; createdAt: string } | null;
  finance: { income: number; expense: number; balance: number };
  upcoming: { title: string; type: string; startsAt: string; team: string; location?: string }[];
};

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [d, setD] = useState<Dash | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('admin_user');
    if (u) setUser(JSON.parse(u));
    adminRequest('/api/dashboard', localStorage.getItem('admin_token') || '')
      .then(setD)
      .catch((e: any) => setError(e?.message || 'Greška pri učitavanju'));
  }, []);

  const card = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' };
  const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
  const mjesec = MONTHS[new Date().getMonth()];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Dobrodošli{user ? `, ${user.fullName.split(' ')[0]}` : ''}!</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">Stanje kluba na jednom mjestu.</p>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!d && !error && <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p>}

      {d && (
        <div className="flex flex-col gap-6">
          {/* Brojke */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: 'Aktivnih igračica', v: d.counts.activePlayers, href: '/admin/igraci' },
              { l: 'Roditeljskih naloga', v: d.counts.parentUsers, href: '/admin/igraci' },
              { l: 'Prijava na čekanju', v: d.counts.pendingRegs, href: '/admin/prijave', warn: d.counts.pendingRegs > 0 },
              { l: `Saldo (${mjesec})`, v: `${d.finance.balance.toFixed(0)}€`, href: '/admin/finansije', warn: d.finance.balance < 0 },
            ].map((x: any) => (
              <Link key={x.l} href={x.href} style={card} className="rounded-xl p-4 hover:border-red-700 transition-colors block">
                <div className="text-2xl font-black" style={{ color: x.warn ? '#dc2626' : 'var(--primary)' }}>{x.v}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{x.l}</div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Članarine */}
            <Link href="/admin/clanarine" style={card} className="rounded-xl p-5 block hover:border-red-700 transition-colors">
              <h2 className="text-white font-bold mb-3">💶 Članarine — {mjesec}</h2>
              {d.fees.charged === 0 ? (
                <p style={{ color: '#d4ac0d' }} className="text-sm">Zaduženja za {mjesec} još nisu generisana →</p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.round((d.fees.paid / d.fees.charged) * 100)}%`, backgroundColor: '#16a34a' }} />
                    </div>
                    <span className="text-white text-sm font-bold">{d.fees.paid}/{d.fees.charged}</span>
                  </div>
                  {d.fees.unpaidSum > 0 && (
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-2">Nenaplaćeno: <span className="text-red-500 font-bold">{d.fees.unpaidSum.toFixed(2)}€</span></p>
                  )}
                </>
              )}
            </Link>

            {/* Posljednja objava */}
            <Link href="/admin/objave" style={card} className="rounded-xl p-5 block hover:border-red-700 transition-colors">
              <h2 className="text-white font-bold mb-3">📣 Posljednja objava</h2>
              {d.lastAnnouncement ? (
                <>
                  <div className="text-white text-sm font-semibold">{d.lastAnnouncement.title}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                    {d.lastAnnouncement.team} · {new Date(d.lastAnnouncement.createdAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}
                    {d.lastAnnouncement.requiresAck && <> · <span style={{ color: d.lastAnnouncement.readCount === 0 ? '#dc2626' : '#16a34a' }}>{d.lastAnnouncement.readCount} potvrdilo čitanje</span></>}
                  </div>
                </>
              ) : <p style={{ color: 'var(--text-muted)' }} className="text-sm">Još nema objava.</p>}
            </Link>

            {/* Dokumenti koji ističu */}
            <Link href="/admin/dosijei" style={card} className="rounded-xl p-5 block hover:border-red-700 transition-colors">
              <h2 className="text-white font-bold mb-3">📄 Dokumenti — ističu u 30 dana</h2>
              {d.expiringDocs.length === 0 ? (
                <p style={{ color: '#16a34a' }} className="text-sm">Sve uredno — ništa ne ističe. ✓</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {d.expiringDocs.map((doc, i) => (
                    <div key={i} className="flex justify-between text-sm gap-3">
                      <span className="text-white">{doc.expired ? '🔴' : '🟡'} {doc.player} — {doc.type}</span>
                      <span style={{ color: 'var(--text-muted)' }} className="shrink-0">
                        {new Date(doc.expiresAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Link>

            {/* Prisustvo */}
            <Link href="/admin/prisustvo" style={card} className="rounded-xl p-5 block hover:border-red-700 transition-colors">
              <h2 className="text-white font-bold mb-3">✅ Prisustvo — posljednjih 30 dana</h2>
              <div className="flex flex-col gap-2">
                {d.attendance.map(a => (
                  <div key={a.team} className="flex items-center gap-3">
                    <span style={{ color: 'var(--text-muted)' }} className="text-sm w-28 shrink-0">{a.team}</span>
                    {a.pct === null ? (
                      <span style={{ color: 'var(--text-muted)' }} className="text-xs">nema evidencije</span>
                    ) : (
                      <>
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.pct >= 75 ? '#16a34a' : a.pct >= 50 ? '#d4ac0d' : '#dc2626' }} />
                        </div>
                        <span className="text-white text-sm font-bold w-11 text-right">{a.pct}%</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Link>
          </div>

          {/* Naredni termini */}
          <div style={card} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">📅 Narednih 5 termina</h2>
            <div className="flex flex-col gap-1.5">
              {d.upcoming.map((e, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <span className="text-white">{e.type === 'match' ? '🏆' : '🏃‍♀️'} {e.title} <span style={{ color: 'var(--text-muted)' }}>· {e.team}{e.location ? ` · ${e.location}` : ''}</span></span>
                  <span style={{ color: 'var(--text-muted)' }} className="shrink-0">
                    {new Date(e.startsAt).toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {d.upcoming.length === 0 && <p style={{ color: 'var(--text-muted)' }} className="text-sm">Nema zakazanih termina.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
