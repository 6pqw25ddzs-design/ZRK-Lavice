'use client';
import { usePathname } from 'next/navigation';

// Traka se ne prikazuje na početnoj (sportski blok ispod heroa nosi iste informacije)
export default function TickerGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/pocetna' || pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
