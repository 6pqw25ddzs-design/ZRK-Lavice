import PageHero from '@/components/site/PageHero';
import { getTreneri } from '@/lib/api';

export const revalidate = 300;
export const metadata = { title: 'Stručni tim | ŽRK Lavice-UDG', description: 'Treneri koji svakodnevno rade sa našim igračicama.' };

export default async function TreneriPage() {
  const treneri = await getTreneri().catch(() => []);

  return (
    <div>
      <PageHero eyebrow="Klub" title="Stručni tim" sub="Treneri koji svakodnevno rade sa našim igračicama — po kategorijama." />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(treneri as any[]).map(t => (
            <div key={t.id} className="rounded-xl p-7 flex flex-col"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4 mb-4">
                {t.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photoUrl} alt={t.fullName} className="w-16 h-16 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--lav-red)' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white display text-2xl shrink-0" style={{ backgroundColor: 'var(--lav-red)' }}>
                    {t.fullName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-white leading-tight">{t.fullName}</h3>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--lav-red)' }}>{t.role}</div>
                  {t.category && (
                    <span className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-full mt-1.5"
                      style={{ backgroundColor: 'rgba(212,172,13,0.13)', color: 'var(--lav-gold)' }}>{t.category}</span>
                  )}
                </div>
              </div>
              {t.bio && <p className="text-sm leading-relaxed" style={{ color: 'var(--lav-grey-400)' }}>{t.bio}</p>}
              {t.licenseNo && <div className="mt-auto pt-4 text-xs" style={{ color: 'var(--lav-grey-400)' }}>Licenca: {t.licenseNo}</div>}
            </div>
          ))}
          {treneri.length === 0 && <p style={{ color: 'var(--lav-grey-400)' }}>Podaci o trenerima uskoro.</p>}
        </div>
      </div>
    </div>
  );
}
