import { getSponsors } from '@/lib/api';

export const revalidate = 0;

const LEVELS = [
  { value: 'gold', label: 'Generalni sponzori' },
  { value: 'silver', label: 'Sponzori' },
  { value: 'bronze', label: 'Partneri' },
];

export default async function SponzoriPage() {
  const sponsors = await getSponsors().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Sponzori i partneri</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-10">
        Hvala svima koji podržavaju razvoj ženskog rukometa u ŽRK Lavice.
      </p>

      {sponsors.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Uskoro objavljujemo naše sponzore.</p>
      ) : (
        LEVELS.map(level => {
          const group = sponsors.filter((s: any) => s.level === level.value);
          if (group.length === 0) return null;
          return (
            <div key={level.value} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-7 rounded-full" />
                <h2 className="text-xl font-black text-white">{level.label}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {group.map((s: any) => {
                  const card = (
                    <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                      className="rounded-xl p-6 flex flex-col items-center justify-center gap-3 h-32 hover:border-red-800 transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {s.logoUrl
                        ? <img src={s.logoUrl} alt={s.name} className="max-h-14 max-w-full object-contain" />
                        : <span className="text-white font-bold text-center">{s.name}</span>}
                    </div>
                  );
                  return s.websiteUrl ? (
                    <a key={s.id} href={s.websiteUrl} target="_blank" rel="noopener noreferrer">{card}</a>
                  ) : (
                    <div key={s.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
