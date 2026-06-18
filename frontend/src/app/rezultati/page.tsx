'use client';
import { useEffect, useState } from 'react';
import { getResults } from '@/lib/api';

interface Result { id: string; homeScore: number; awayScore: number; notes?: string; event: { title: string; startsAt: string; team: { name: string; } } }

export default function RezultatiPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    getResults().then(r => setResults(Array.isArray(r) ? r : r.data ?? [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Rezultati <span className="text-[#C41230]">Utakmica</span></h1>
        <p className="text-gray-400 mb-10">Pregled svih odigranih utakmica</p>

        <div className="space-y-4">
          {results.map(r => (
            <div key={r.id} className="bg-[#2A2A2A] rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{r.event?.title}</p>
                <p className="text-gray-400 text-sm">{r.event?.team?.name} · {new Date(r.event?.startsAt).toLocaleDateString('sr-ME')}</p>
              </div>
              <div className="text-3xl font-bold">
                <span className="text-[#C41230]">{r.homeScore}</span>
                <span className="text-gray-400 mx-2">:</span>
                <span>{r.awayScore}</span>
              </div>
            </div>
          ))}
          {results.length === 0 && <p className="text-gray-400">Nema rezultata za prikaz.</p>}
        </div>
      </div>
    </div>
  );
}
