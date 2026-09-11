import Link from 'next/link';

export const metadata = { title: 'Hvala — ŽRK Lavice-UDG' };

export default function HvalaPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🦁</div>
      <h1 className="text-4xl font-black text-white mb-4">Hvala od srca!</h1>
      <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed mb-8">
        Uplata je uspješno izvršena. Potvrda stiže na tvoj email.
        Svaki euro ide direktno u razvoj naših rukometašica.
      </p>
      <Link href="/" style={{ backgroundColor: 'var(--primary)' }}
        className="inline-block px-8 py-3 rounded-full text-white font-bold">Nazad na sajt</Link>
    </div>
  );
}
