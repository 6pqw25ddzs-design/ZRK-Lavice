'use client';
import { useState } from 'react';
import { TEAM_META, teamMeta } from '@/lib/teamColors';

const TYPE_FILTERS = [
  { val: 'all', label: 'Sve' },
  { val: 'training', label: 'Treninzi' },
  { val: 'match', label: 'Utakmice' },
];

export default function ScheduleList({ events, light = false }: { events: any[]; light?: boolean }) {
  const [team, setTeam] = useState('all');
  const [type, setType] = useState('all');

  const filtered = events.filter(e =>
    (team === 'all' || e.team?.category === team) && (type === 'all' || e.type === type));

  const text = light ? '#1A1A1A' : '#FFFFFF';
  const muted = light ? '#8a8a8a' : 'var(--text-muted)';
  const cardBg = light ? '#FFFFFF' : 'var(--card)';
  const cardBorder = light ? '#EEEEEE' : 'var(--border)';
  const chipBg = light ? '#F3F3F3' : 'rgba(255,255,255,0.06)';

  return (
    <div>
      {/* Filteri po ekipi — svaka u svojoj boji */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => setTeam('all')}
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={team === 'all' ? { backgroundColor: text, color: light ? '#fff' : '#1A1A1A' } : { backgroundColor: chipBg, color: muted }}>
          Sve ekipe
        </button>
        {Object.entries(TEAM_META).map(([cat, m]) => (
          <button key={cat} onClick={() => setTeam(team === cat ? 'all' : cat)}
            className="px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2"
            style={team === cat ? { backgroundColor: m.color, color: '#fff' } : { backgroundColor: chipBg, color: muted }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team === cat ? '#fff' : m.color }} />
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {TYPE_FILTERS.map(f => (
          <button key={f.val} onClick={() => setType(f.val)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
            style={type === f.val ? { backgroundColor: light ? '#1A1A1A' : '#fff', color: light ? '#fff' : '#1A1A1A' } : { backgroundColor: chipBg, color: muted }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div>
        {filtered.map((e: any, i: number) => {
          const d = new Date(e.startsAt);
          const m = teamMeta(e.team?.category);
          const isMatch = e.type === 'match';
          return (
            <div key={e.id} className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center w-12 shrink-0">
                <div className="text-2xl font-black leading-none" style={{ color: text }}>
                  {Number(d.toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric' }).replace(/\D/g, ''))}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: muted }}>
                  {d.toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', month: 'short' }).replace('.', '')}
                </div>
                <span className="w-2.5 h-2.5 rounded-full mt-2" style={{ backgroundColor: m.color }} />
                {i < filtered.length - 1 && <span className="flex-1 w-px my-1" style={{ backgroundColor: light ? '#E5E5E5' : 'var(--border)' }} />}
              </div>
              <div className="flex-1 mb-4 rounded-2xl overflow-hidden flex"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, boxShadow: light ? '0 6px 18px rgba(0,0,0,0.04)' : 'none' }}>
                <span className="w-1 shrink-0" style={{ backgroundColor: m.color }} />
                <div className="p-4 md:p-5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black" style={{ color: text }}>
                      {d.toLocaleTimeString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                        style={isMatch ? { backgroundColor: m.color, color: '#fff' } : { backgroundColor: m.soft, color: m.color }}>
                        {isMatch ? 'Utakmica' : 'Trening'}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold mt-1.5" style={{ color: text }}>{e.title}</div>
                  <div className="text-xs mt-1.5 flex items-center gap-2 flex-wrap" style={{ color: muted }}>
                    {e.location && <span>📍 {e.location}</span>}
                    {e.team?.name && (
                      <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: m.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                        {e.team.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: muted }}>Nema termina za izabrani filter.</p>}
      </div>
    </div>
  );
}
