'use client';
import { useState } from 'react';
import PlayerCard from './PlayerCard';

const ORDER = ['prva_liga', 'pioniri', 'mini'];

export default function TeamGrid({ teams, players }: { teams: any[]; players: any[] }) {
  const sorted = [...teams].sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const first = sorted.find(t => players.some(p => p.teamId === t.id)) || sorted[0];
  const [sel, setSel] = useState(first?.id);
  const team = sorted.find(t => t.id === sel);
  const tp = players.filter(p => p.teamId === sel);

  return (
    <div>
      <div className="flex gap-7 mb-10 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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

      {team?.category === 'prva_liga' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/tim/ekipa-2026.jpg" alt={`${team.name} — zajednička fotografija 2026/27`}
          loading="lazy" decoding="async"
          className="w-full max-w-3xl rounded-xl mb-10 block" style={{ border: '1px solid var(--border)' }} />
      )}

      {tp.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {tp.map(p => <PlayerCard key={p.id} p={p} />)}
        </div>
      ) : (
        <p style={{ color: 'var(--lav-grey-400)' }}>Spisak igračica za ovu ekipu biće uskoro objavljen.</p>
      )}
    </div>
  );
}
