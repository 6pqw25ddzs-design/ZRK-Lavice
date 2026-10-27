'use client';
import { useEffect, useState } from 'react';

type Player = { id: string; firstName: string; lastName: string; birthDate: string | null; teamId: string };
type Team = { id: string; name: string };

const MJESECI = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];

function daysUntilBirthday(birthDate: string, today: Date) {
  const b = new Date(birthDate);
  const next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) next.setFullYear(next.getFullYear() + 1);
  const diff = Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
  return { days: diff, turns: next.getFullYear() - b.getFullYear(), date: next, day: b.getDate(), month: b.getMonth() };
}

export default function RodjendaniPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('https://api.zrklavice.me/api/players').then(r => r.json()),
      fetch('https://api.zrklavice.me/api/teams').then(r => r.json()),
    ]).then(([ps, ts]) => { setPlayers(ps); setTeams(ts); })
      .catch(() => setError('Greška pri učitavanju'));
  }, []);

  const today = new Date();
  const teamName = (id: string) => teams.find(t => t.id === id)?.name || '';
  const rows = players
    .filter(p => p.birthDate)
    .map(p => ({ p, b: daysUntilBirthday(p.birthDate!, today) }))
    .sort((a, bb) => a.b.days - bb.b.days || a.p.lastName.localeCompare(bb.p.lastName, 'sr'));

  const danas = rows.filter(r => r.b.days === 0);
  const sedmica = rows.filter(r => r.b.days > 0 && r.b.days <= 7);
  const ostale = rows.filter(r => r.b.days > 7);

  const Card = ({ r, accent }: { r: typeof rows[number]; accent?: string }) => (
    <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${accent || 'var(--border)'}` }}
      className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
      <div>
        <span className="text-white font-medium">{r.p.lastName} {r.p.firstName}</span>
        <span style={{ color: 'var(--text-muted)' }} className="text-xs ml-2">{teamName(r.p.teamId)}</span>
      </div>
      <div className="text-right">
        <div className="text-sm text-white">{r.b.day}. {MJESECI[r.b.month]} · puni {r.b.turns} g.</div>
        <div style={{ color: accent || 'var(--text-muted)' }} className="text-xs font-semibold">
          {r.b.days === 0 ? '🎂 DANAS!' : r.b.days === 1 ? 'sjutra' : `za ${r.b.days} dana`}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Rođendani 🎂</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {danas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--gold)' }}>Danas slave</h2>
          <div className="flex flex-col gap-2">{danas.map(r => <Card key={r.p.id} r={r} accent="var(--gold)" />)}</div>
        </div>
      )}

      {sedmica.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">U narednih 7 dana</h2>
          <div className="flex flex-col gap-2">{sedmica.map(r => <Card key={r.p.id} r={r} accent="#16a34a" />)}</div>
        </div>
      )}

      <h2 className="text-lg font-bold text-white mb-3">Sve naredne ({ostale.length})</h2>
      <div className="flex flex-col gap-2 mb-6">{ostale.map(r => <Card key={r.p.id} r={r} />)}</div>
      {rows.length === 0 && !error && <p style={{ color: 'var(--text-muted)' }}>Učitavam…</p>}
    </div>
  );
}
