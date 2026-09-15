'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/#o-klubu', label: 'Klub', mega: true },
  { href: '/ekipe', label: 'Ekipe' },
  { href: '/rezultati', label: 'Utakmice' },
  { href: '/raspored', label: 'Raspored' },
  { href: '/vijesti', label: 'Vijesti' },
  { href: '/podrzi-nas', label: 'Podrži klub' },
  { href: '/kontakt', label: 'Kontakt' },
];

const MEGA = [
  { href: '/o-nama', label: 'O nama' },
  { href: '/#osnivaci', label: 'Osnivači' },
  { href: '/#treneri', label: 'Stručni tim' },
  { href: '/#programi', label: 'Programi' },
  { href: '/dokumenti', label: 'Dokumenti' },
  { href: '/galerija', label: 'Galerija' },
  { href: '/sponzori', label: 'Sponzori' },
  { href: '/clanstvo', label: 'Članstvo' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(11,10,12,0.92)' : 'rgba(11,10,12,0.55)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(212,172,13,0.15)' : '1px solid transparent',
      }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="ŽRK Lavice-UDG" width={40} height={40} className="object-contain" />
          <span className="display text-2xl text-white tracking-wide">ŽRK LAVICE-UDG</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" onMouseLeave={() => setMega(false)}>
          {NAV.map(l => (
            <span key={l.label} className="relative" onMouseEnter={() => setMega(!!l.mega)}>
              <Link href={l.href}
                className="text-[13.5px] font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap py-6">
                {l.label}
              </Link>
              {l.mega && mega && (
                <div className="absolute left-0 top-full pt-2 w-56"
                  onMouseEnter={() => setMega(true)}>
                  <div className="rounded-xl p-2 flex flex-col"
                    style={{ backgroundColor: '#131114', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    {MEGA.map(m => (
                      <Link key={m.label} href={m.href} onClick={() => setMega(false)}
                        className="px-4 py-2.5 rounded-lg text-sm text-white/75 hover:text-white hover:bg-white/5 transition-colors">
                        {m.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </span>
          ))}
          <Link href="/#upis" style={{ backgroundColor: 'var(--lav-red)' }}
            className="px-5 py-2.5 rounded-full text-white text-[13.5px] font-bold hover:brightness-110 transition-all whitespace-nowrap">
            Upiši dijete
          </Link>
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
        <div className="lg:hidden fixed inset-0 top-[72px] z-40 flex flex-col px-6 pt-6 pb-10 overflow-y-auto"
          style={{ backgroundColor: 'rgba(11,10,12,0.98)' }}>
          {[...NAV.filter(n => !n.mega), ...MEGA].map(l => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="display text-3xl text-white/85 hover:text-white py-3 border-b border-white/5">
              {l.label}
            </Link>
          ))}
          <Link href="/#upis" onClick={() => setOpen(false)} style={{ backgroundColor: 'var(--lav-red)' }}
            className="mt-8 py-4 rounded-full text-white text-center font-bold text-lg">Upiši dijete</Link>
          <p className="mt-6 text-sm" style={{ color: 'var(--lav-grey-400)' }}>info@zrklavice.me · +382 67 909 090</p>
        </div>
      )}
    </header>
  );
}
