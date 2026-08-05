'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const LINKS = [
  { href: '#o-klubu', label: 'O klubu' },
  { href: '#programi', label: 'Programi' },
  { href: '#ekipe', label: 'Ekipe' },
  { href: '#raspored', label: 'Raspored' },
  { href: '#vijesti', label: 'Vijesti' },
  { href: '#osnivaci', label: 'Osnivači' },
  { href: '#treneri', label: 'Treneri' },
  { href: '/podrzi-nas', label: 'Podrži klub' },
  { href: '#kontakt', label: 'Kontakt' },
];

export default function PremiumHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(26,26,26,0.92)' : 'rgba(26,26,26,0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(212,172,13,0.18)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-[72px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="ŽRK Lavice Podgorica" width={40} height={40} className="object-contain" />
          <span className="font-black text-lg tracking-tight text-white">
            ŽRK <span style={{ color: '#C41230' }}>Lavice</span>-UDG
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#upis" style={{ backgroundColor: '#C41230' }}
            className="px-5 py-2.5 rounded-full text-white text-sm font-bold hover:brightness-110 transition-all">
            Upiši dijete
          </a>
        </nav>

        <button className="lg:hidden text-white p-1" onClick={() => setOpen(!open)} aria-label="Meni">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <><line x1="19" y1="7" x2="7" y2="19" /><line x1="7" y1="7" x2="19" y2="19" /></>
              : <><line x1="4" y1="8" x2="22" y2="8" /><line x1="4" y1="13" x2="22" y2="13" /><line x1="4" y1="18" x2="22" y2="18" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden px-5 pb-5 flex flex-col gap-1" style={{ backgroundColor: 'rgba(26,26,26,0.97)' }}>
          {LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="py-3 text-white/80 hover:text-white font-medium border-b border-white/5">
              {l.label}
            </a>
          ))}
          <a href="#upis" onClick={() => setOpen(false)} style={{ backgroundColor: '#C41230' }}
            className="mt-3 py-3 rounded-full text-white text-center font-bold">
            Upiši dijete
          </a>
        </div>
      )}
    </header>
  );
}
