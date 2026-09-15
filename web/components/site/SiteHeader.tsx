'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  { href: '/treneri', label: 'Stručni tim' },
  { href: '/#programi', label: 'Programi' },
  { href: '/dokumenti', label: 'Dokumenti' },
  { href: '/galerija', label: 'Galerija' },
  { href: '/sponzori', label: 'Sponzori' },
  { href: '/clanstvo', label: 'Članstvo' },
];

// Grupisan mobilni meni
const MOBILE_GROUPS: { title: string; items: { href: string; label: string }[] }[] = [
  { title: 'Takmičenje', items: [
    { href: '/ekipe', label: 'Ekipe' }, { href: '/rezultati', label: 'Utakmice' },
    { href: '/raspored', label: 'Raspored' }, { href: '/vijesti', label: 'Vijesti' },
  ]},
  { title: 'Klub', items: [
    { href: '/o-nama', label: 'O nama' }, { href: '/#osnivaci', label: 'Osnivači' },
    { href: '/treneri', label: 'Stručni tim' }, { href: '/#programi', label: 'Programi' },
    { href: '/galerija', label: 'Galerija' }, { href: '/dokumenti', label: 'Dokumenti' },
    { href: '/sponzori', label: 'Sponzori' },
  ]},
  { title: 'Podrška i kontakt', items: [
    { href: '/podrzi-nas', label: 'Podrži klub' }, { href: '/clanstvo', label: 'Članstvo' },
    { href: '/kontakt', label: 'Kontakt' },
  ]},
];

function MobileMenu({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const els = panelRef.current.querySelectorAll<HTMLElement>('a, button');
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <div id="mobilni-meni" role="dialog" aria-modal="true" aria-label="Navigacija"
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: 'rgba(11,10,12,0.98)' }}>
      <div ref={panelRef} className="flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between px-6 h-[64px] shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="display text-xl text-white">ŽRK LAVICE-UDG</span>
          <button onClick={onClose} aria-label="Zatvori meni" className="text-white p-2 -mr-2">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="px-6 pt-5">
          <Link href="/#upis" onClick={onClose}
            className="block py-3.5 rounded-full text-white text-center font-bold text-base"
            style={{ backgroundColor: 'var(--lav-red)' }}>
            Upiši dijete
          </Link>
        </div>

        <nav className="flex-1 px-6 py-6 flex flex-col gap-7">
          {MOBILE_GROUPS.map(g => (
            <div key={g.title}>
              <div className="eyebrow mb-2.5" style={{ color: 'var(--lav-gold)' }}>{g.title}</div>
              <div className="flex flex-col">
                {g.items.map(l => (
                  <Link key={l.label} href={l.href} onClick={onClose}
                    className="display text-2xl text-white/85 hover:text-white py-2">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm pb-8" style={{ color: 'var(--lav-grey-400)' }}>info@zrklavice.me · +382 67 909 090</p>
        </nav>
      </div>
    </div>,
    document.body
  );
}

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
        backgroundColor: scrolled ? 'rgba(11,10,12,0.95)' : 'rgba(11,10,12,0.55)',
        borderBottom: scrolled ? '1px solid rgba(212,172,13,0.15)' : '1px solid transparent',
      }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="ŽRK Lavice-UDG" width={40} height={40} className="object-contain" />
          <span className="display text-2xl text-white tracking-wide">ŽRK LAVICE-UDG</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" onMouseLeave={() => setMega(false)} aria-label="Glavna navigacija">
          {NAV.map(l => (
            <span key={l.label} className="relative" onMouseEnter={() => setMega(!!l.mega)}>
              <Link href={l.href}
                className="text-[13.5px] font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap py-6">
                {l.label}
              </Link>
              {l.mega && mega && (
                <div className="absolute left-0 top-full pt-2 w-56" onMouseEnter={() => setMega(true)}>
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

        <button className="lg:hidden text-white p-2 -mr-2" onClick={() => setOpen(true)}
          aria-label="Otvori meni" aria-expanded={open} aria-controls="mobilni-meni">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="8" x2="22" y2="8" /><line x1="4" y1="13" x2="22" y2="13" /><line x1="4" y1="18" x2="22" y2="18" />
          </svg>
        </button>
      </div>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
}
