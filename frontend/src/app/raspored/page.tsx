'use client';
import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';

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

const CATEGORY_LABELS: Record<string, string> = {
  mini: 'Mini rukomet',
  pioniri: 'Pionirska liga',
  prva_liga: 'Prva liga',
};

// Placeholder data
const placeholderEvents: Event[] = [
  { id: '1', title: 'Trening — Mini rukomet', type: 'training', startsAt: '2026-06-20T17:00:00', endsAt: '2026-06-20T18:30:00', location: 'SC Morača, Sala 2', isCancelled: false, team: { name: 'Mini rukomet', category: 'mini' } },
  { id: '2', title: 'Pioniri — RK Budućnost', type: 'match', startsAt: '2026-06-22T11:00:00', location: 'Hala Sportova', opponent: 'RK Budućnost', isCancelled: false, team: { name: 'Pionirska liga', category: 'pioniri' } },
  { id: '3', title: 'Trening — Prva liga', type: 'training', startsAt: '2026-06-23T18:30:00', endsAt: '2026-06-23T20:00:00', location: 'SC Morača, Sala 1', isCancelled: false, team: { name: 'Prva liga', category: 'prva_liga' } },
  { id: '4', title: 'Trening — Pioniri', type: 'training', startsAt: '2026-06-24T16:00:00', endsAt: '2026-06-24T17:30:00', location: 'SC Morača, Sala 2', isCancelled: false, team: { name: 'Pionirska liga', category: 'pioniri' } },
  { id: '5', title: 'Prva liga — RK Jedinstvo', type: 'match', startsAt: '2026-06-28T19:00:00', location: 'SC Morača, Sala 1', opponent: 'RK Jedinstvo', isCancelled: false, team: { name: 'Prva liga', category: 'prva_liga' } },
];

export default function RasporedPage() {
  const [month, setMonth] = useState(new Date());
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filters = [
    { val: 'all', label: 'Sve ekipe' },
    { val: 'mini', label: 'Mini' },
    { val: 'pioniri', label: 'Pioniri' },
    { val: 'prva_liga', label: 'Prva liga' },
  ];

  const filtered = placeholderEvents.filter(e => {
    if (filter !== 'all' && e.team.category !== filter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="red-accent" />
      <h1 className="section-title mb-2">Raspored</h1>
      <p className="text-gray-500 mb-10">Treninzi i utakmice po kategorijama</p>

      <div className="flex flex-wrap gap-3 mb-8 items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth(m => subMonths(m, 1))} className="p-2 rounded-lg border hover:bg-gray-50">
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-dark min-w-[140px] text-center">
            {format(month, 'LLLL yyyy', { locale: sr })}
          </h2>
          <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-2 rounded-lg border hover:bg-gray-50">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.val}
              onClick={() => setFilter(f.val)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors',
                filter === f.val ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary'
              )}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setTypeFilter(t => t === 'match' ? 'all' : 'match')}
            className={clsx('px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors',
              typeFilter === 'match' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'
            )}
          >
            🏆 Samo utakmice
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">Nema događaja za odabrani filter.</div>
        )}
        {filtered.map(event => (
          <div
            key={event.id}
            className={clsx(
              'flex items-center gap-5 p-5 rounded-xl border transition-shadow hover:shadow-sm',
              event.type === 'match' ? 'bg-red-50 border-primary/20' : 'bg-white border-gray-200',
              event.isCancelled && 'opacity-50'
            )}
          >
            <div className="text-center min-w-[52px]">
              <div className="font-display text-3xl font-extrabold text-dark leading-none">
                {format(new Date(event.startsAt), 'd')}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                {format(new Date(event.startsAt), 'LLL', { locale: sr })}
              </div>
            </div>

            <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', event.type === 'match' ? 'bg-primary' : 'bg-gold')} />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-dark">{event.title}</h3>
                {event.isCancelled && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded font-bold">OTKAZANO</span>}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {format(new Date(event.startsAt), 'HH:mm')}
                  {event.endsAt && `–${format(new Date(event.endsAt), 'HH:mm')}`}
                </span>
                {event.location && <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>}
              </div>
            </div>

            <span className={clsx(
              'text-xs font-bold px-3 py-1 rounded-full',
              event.type === 'match' ? 'bg-primary/10 text-primary' : 'bg-gold/10 text-yellow-700'
            )}>
              {event.type === 'match' ? 'Utakmica' : 'Trening'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
