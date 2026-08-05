'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  // Coming-soon teaser + premium homepage imaju svoj footer
  if (pathname === '/' || pathname === '/pocetna') return null;

  return (
    <footer style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }} className="global-footer py-6 text-center text-sm">
      <span style={{ color: 'var(--text-muted)' }}>© 2026 ŽRK Lavice-UDG · Podgorica, Crna Gora</span>
      <span style={{ color: 'var(--text-muted)' }} className="mx-2">·</span>
      <a href="/privatnost" style={{ color: 'var(--text-muted)' }} className="hover:underline">Politika privatnosti</a>
    </footer>
  );
}
