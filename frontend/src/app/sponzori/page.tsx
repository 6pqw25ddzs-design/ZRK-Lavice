'use client';
import { useEffect, useState } from 'react';
import { getSponsors } from '@/lib/api';

interface Sponsor { id: string; name: string; logoUrl?: string; websiteUrl?: string; tier: string; }

export default function SponzoriPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    getSponsors().then(r => setSponsors(Array.isArray(r) ? r : r.data ?? [])).catch(() => {});
  }, []);

  const tiers = ['platinum', 'gold', 'silver', 'bronze'];
  const tierLabels: Record<string, string> = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Naši <span className="text-[#C41230]">Sponzori</span></h1>
        <p className="text-gray-400 mb-10">Zahvaljujemo se svim partnerima koji podržavaju ZRK Lavice</p>

        {tiers.map(tier => {
          const list = sponsors.filter(s => s.tier === tier);
          if (!list.length) return null;
          return (
            <div key={tier} className="mb-12">
              <h2 className="text-xl font-bold text-[#D4AC0D] mb-6">{tierLabels[tier]} Sponzori</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {list.map(s => (
                  <a key={s.id} href={s.websiteUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                    className="bg-[#2A2A2A] rounded-xl p-6 flex items-center justify-center hover:bg-[#333] transition-colors">
                    {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="max-h-16 object-contain" /> : <span className="font-bold text-center">{s.name}</span>}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
        {sponsors.length === 0 && <p className="text-gray-400">Nema sponzora za prikaz.</p>}
      </div>
    </div>
  );
}
