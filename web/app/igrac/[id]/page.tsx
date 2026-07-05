import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlayer } from '@/lib/api';

export const revalidate = 0;

export default async function IgracPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPlayer(id).catch(() => null);

  if (!p) notFound();

  const trainings = (p.attendance || []).filter((a: any) => a.event?.type === 'training').length;
  const matches = (p.attendance || []).filter((a: any) => a.event?.type === 'match').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/ekipe" style={{ color: 'var(--primary)' }} className="text-sm font-medium hover:underline">← Sve ekipe</Link>

      <div className="flex items-center gap-5 mt-6 mb-8">
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} className="w-24 h-24 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--primary)' }} />
        ) : (
          <div style={{ backgroundColor: 'var(--primary)' }} className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0">
            {p.jerseyNumber ?? (p.firstName?.charAt(0) ?? '?')}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-white leading-tight">{p.firstName} {p.lastName}</h1>
          <div style={{ color: 'var(--text-muted)' }} className="mt-1">
            {p.position || 'Igračica'}{p.team?.name ? ` · ${p.team.name}` : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Broj dresa', value: p.jerseyNumber ?? '—' },
          { label: 'Godište', value: p.birthDate ? new Date(p.birthDate).getFullYear() : '—' },
          { label: 'Treninga', value: trainings },
          { label: 'Utakmica', value: matches },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4 text-center">
            <div style={{ color: 'var(--primary)' }} className="text-2xl font-black">{s.value}</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
