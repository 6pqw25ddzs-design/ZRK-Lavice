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

  function exportExcel() {
    // sortirano po godištu (najstarije prvo), pa po prezimenu
    const rows = [...tp].sort((a, b) =>
      String(a.birthDate || '9999').localeCompare(String(b.birthDate || '9999')) ||
      String(a.lastName).localeCompare(String(b.lastName), 'sr'));
    const isMini = team?.category === 'mini';
    const data = [
      ['R.br.', 'Prezime i ime', 'Godište', ...(isMini ? ['Grupa'] : [])],
      ...rows.map((p, i) => [
        String(i + 1), `${p.lastName} ${p.firstName}`, String(p.birthDate || '').slice(0, 4),
        ...(isMini ? [p.position || ''] : []),
      ]),
    ];
    const csv = data.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(team?.name || 'ekipa').toLowerCase().replace(/\s+/g, '-')}-spisak.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  }

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
        {tp.length > 0 && (
          <button onClick={exportExcel}
            className="pb-3 text-[13px] whitespace-nowrap ml-auto transition-colors hover:text-white"
            style={{ color: 'var(--lav-grey-400)' }}>
            ⬇️ Izvezi u Excel
          </button>
        )}
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
