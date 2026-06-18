'use client';
import { useEffect, useState } from 'react';
import { getTeams, getPlayers } from '@/lib/api';

interface Team { id: string; name: string; category: string; coachName?: string; }
interface Player { id: string; firstName: string; lastName: string; position?: string; jerseyNumber?: number; photoUrl?: string; teamId: string; }

export default function EkipePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getTeams().then(r => { const d = Array.isArray(r) ? r : r.data ?? []; setTeams(d); if (d.length) setSelected(d[0].id); }).catch(() => {});
    getPlayers().then(r => setPlayers(Array.isArray(r) ? r : r.data ?? [])).catch(() => {});
  }, []);

  const teamPlayers = players.filter(p => p.teamId === selected);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Naše <span className="text-[#C41230]">Ekipe</span></h1>
        <p className="text-gray-400 mb-10">ZRK Lavice ima tri takmičarske ekipe</p>

        <div className="flex gap-4 mb-10 flex-wrap">
          {teams.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${selected === t.id ? 'bg-[#C41230] text-white' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'}`}>
              {t.name}
            </button>
          ))}
        </div>

        {teams.filter(t => t.id === selected).map(t => (
          <div key={t.id} className="mb-8">
            <h2 className="text-2xl font-bold mb-1">{t.name}</h2>
            <p className="text-[#D4AC0D] mb-6">{t.category}</p>
          </div>
        ))}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teamPlayers.map(p => (
            <div key={p.id} className="bg-[#2A2A2A] rounded-xl p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#C41230] flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                {p.jerseyNumber ?? '?'}
              </div>
              <p className="font-semibold">{p.firstName} {p.lastName}</p>
              <p className="text-gray-400 text-sm">{p.position ?? 'Igračica'}</p>
            </div>
          ))}
          {teamPlayers.length === 0 && <p className="text-gray-400 col-span-5">Nema igračica za ovu ekipu.</p>}
        </div>
      </div>
    </div>
  );
}
