'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/ekipe', label: 'Ekipe' },
  { href: '/rezultati', label: 'Rezultati' },
  { href: '/raspored', label: 'Raspored' },
  { href: '/vijesti', label: 'Vijesti' },
  { href: '/podrzi-nas', label: 'Podrži klub' },
  { href: '/clanstvo', label: 'Članstvo' },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer style={{ backgroundColor: '#0E0C0F' }}>
      <div className="gold-line" />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image src="/logo.png" alt="" width={40} height={40} className="object-contain" />
            <span className="display text-xl text-white">ŽRK LAVICE-UDG</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--lav-grey-400)' }}>
            Stvaramo nove Lavice. Razvojni ženski rukometni klub za djevojčice, Podgorica.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-4">Navigacija</div>
          <div className="flex flex-col gap-2.5">
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-4">Kontakt</div>
          <div className="flex flex-col gap-2.5 text-sm" style={{ color: 'var(--lav-grey-400)' }}>
            <span>Trg Božane Vučinić 34, Podgorica</span>
            <a href="mailto:info@zrklavice.me" className="hover:text-white transition-colors">info@zrklavice.me</a>
            <a href="tel:+38267909090" className="hover:text-white transition-colors">+382 67 909 090</a>
          </div>
        </div>
        <div>
          <div className="eyebrow mb-4">Pratite nas</div>
          <a href="https://www.instagram.com/zrklavice" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" /></svg>
            Instagram
          </a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-5 flex flex-wrap items-center justify-between gap-3 text-xs" style={{ color: 'var(--lav-grey-400)' }}>
          <span>© 2026 ŽRK Lavice-UDG · Podgorica, Crna Gora</span>
          <span className="flex gap-4">
            <Link href="/privatnost" className="hover:text-white transition-colors">Politika privatnosti</Link>
            <Link href="/uslovi" className="hover:text-white transition-colors">Uslovi plaćanja</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
