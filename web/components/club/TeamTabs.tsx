'use client';
import { useState } from 'react';
import Link from 'next/link';
import PlayerCard from './PlayerCard';

const ORDER = ['prva_liga', 'pioniri', 'mini'];

export default function TeamTabs({ teams, players }: { teams: any[]; players: any[] }) {
  const sorted = [...teams].sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const first = sorted.find(t => players.some(p => p.teamId === t.id)) || sorted[0];
  const [sel, setSel] = useState(first?.id);
  const tp = players.filter(p => p.teamId === sel).slice(0, 6);

  return (
    <div>
      <div className="flex gap-7 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {sorted.map(t => (
          <button key={t.id} onClick={() => setSel(t.id)}
            className="pb-3 text-[15px] font-bold whitespace-nowrap transition-colors"
            style={{
              color: sel === t.id ? '#fff' : 'var(--lav-grey-400)',
              borderBottom: sel === t.id ? '2px solid var(--lav-red)' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tp.map(p => <PlayerCard key={p.id} p={p} />)}
        <Link href="/ekipe"
          className="rounded-xl flex flex-col items-center justify-center gap-3 group transition-colors hover:bg-white/5"
          style={{ border: '1px dashed rgba(255,255,255,0.2)', aspectRatio: '3/4' }}>
          <span className="display text-3xl" style={{ color: 'var(--lav-gold)' }}>→</span>
          <span className="text-white font-bold text-sm">Cijela ekipa</span>
        </Link>
      </div>
    </div>
  );
}
