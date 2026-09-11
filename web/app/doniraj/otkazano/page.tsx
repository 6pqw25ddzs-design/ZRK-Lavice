import Link from 'next/link';

export const metadata = { title: 'Plaćanje otkazano — ŽRK Lavice-UDG' };

export default function OtkazanoPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-black text-white mb-4">Plaćanje je otkazano</h1>
      <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed mb-8">
        Ništa nije naplaćeno. Ako je došlo do greške, pokušaj ponovo ili nam piši na info@zrklavice.me.
      </p>
      <Link href="/doniraj" style={{ backgroundColor: 'var(--primary)' }}
        className="inline-block px-8 py-3 rounded-full text-white font-bold">Pokušaj ponovo</Link>
    </div>
  );
}
