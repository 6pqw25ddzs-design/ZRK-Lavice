'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { getSchedule } from '@/lib/api';
import { useEffect } from 'react';

type Event = {
  id: string;
  title: string;
  type: 'training' | 'match';
  startsAt: string;
  endsAt?: string;
  location?: string;
  opponent?: string;
  isCancelled: boolean;
  team: { name: string; category: string };
};

export default function RasporedPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    getSchedule().then((r: unknown) => {
      const data = Array.isArray(r) ? r : (r as { data?: Event[] }).data ?? [];
      setEvents(data);
    }).catch(() => {});
  }, []);

  const filters = [
    { val: 'all', label: 'Sve ekipe' },
    { val: 'mini', label: 'Mini' },
    { val: 'pioniri', label: 'Pioniri' },
    { val: 'prva_liga', label: 'Prva liga' },
  ];

  const filtered = events.filter(e => {
    if (filter !== 'all' && e.team?.category !== filter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return { day: d.getDate(), month: d.toLocaleString('sr-ME', { month: 'short' }), time: d.toLocaleTimeString('sr-ME', { hour: '2-digit', minute: '2-digit' }) };
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Raspored <span className="text-[#C41230]">Aktivnosti</span></h1>
        <p className="text-gray-400 mb-10">Treninzi i utakmice po kategorijama</p>

        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === f.val ? 'bg-[#C41230] text-white' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'}`}>
              {f.label}
            </button>
          ))}
          <button onClick={() => setTypeFilter(t => t === 'match' ? 'all' : 'match')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${typeFilter === 'match' ? 'bg-[#C41230] text-white' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'}`}>
            🏆 Samo utakmice
          </button>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">Nema zakazanih događaja.</div>
          )}
          {filtered.map(event => {
            const { day, month, time } = formatDate(event.startsAt);
            return (
              <div key={event.id}
                className={`flex items-center gap-5 p-5 rounded-xl border transition-all ${event.type === 'match' ? 'bg-[#C41230]/10 border-[#C41230]/30' : 'bg-[#2A2A2A] border-[#333]'} ${event.isCancelled ? 'opacity-50' : ''}`}>
                <div className="text-center min-w-[52px]">
                  <div className="text-3xl font-bold leading-none">{day}</div>
                  <div className="text-xs text-gray-400 uppercase">{month}</div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${event.type === 'match' ? 'bg-[#C41230]' : 'bg-[#D4AC0D]'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{event.title}</h3>
                    {event.isCancelled && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded font-bold">OTKAZANO</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>🕐 {time}</span>
                    {event.location && <span>📍 {event.location}</span>}
                    {event.opponent && <span>vs {event.opponent}</span>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${event.type === 'match' ? 'bg-[#C41230]/20 text-[#C41230]' : 'bg-[#D4AC0D]/20 text-[#D4AC0D]'}`}>
                  {event.type === 'match' ? 'Utakmica' : 'Trening'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
