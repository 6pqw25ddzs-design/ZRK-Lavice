'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavLink = { href: string; label: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

const nav: NavItem[] = [
  { href: '/', label: 'Početna' },
  {
    label: 'Takmičenje',
    children: [
      { href: '/raspored', label: 'Raspored' },
      { href: '/rezultati', label: 'Rezultati' },
      { href: '/tabela', label: 'Tabela' },
    ],
  },
  { href: '/ekipe', label: 'Ekipe' },
  { href: '/vijesti', label: 'Vijesti' },
  { href: '/galerija', label: 'Galerija' },
  {
    label: 'Klub',
    children: [
      { href: '/o-nama', label: 'O nama' },
      { href: '/dokumenti', label: 'Dokumenti' },
      { href: '/sponzori', label: 'Sponzori' },
      { href: '/kontakt', label: 'Kontakt' },
    ],
  },
  { href: '/registracija', label: 'Upis' },
  { href: '/podrzi-nas', label: 'Podržite nas' },
];

function isGroup(item: NavItem): item is { label: string; children: NavLink[] } {
  return 'children' in item;
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkCls = (href: string) =>
    `text-sm font-medium transition-colors ${pathname === href ? 'text-red-600' : 'text-gray-400 hover:text-white'}`;

  return (
    <nav style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="ŽRK Lavice" width={40} height={40} className="object-contain" />
          <span style={{ color: 'var(--primary)' }} className="text-2xl font-black">ŽRK</span>
          <span className="text-white font-bold text-xl">Lavice</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {nav.map(item =>
            isGroup(item) ? (
              <div key={item.label} className="relative group">
                <button className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors flex items-center gap-1">
                  {item.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3.5L5 6.5L8 3.5"/></svg>
                </button>
                <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
                  <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-lg py-2 min-w-[160px] shadow-xl">
                    {item.children.map(c => (
                      <Link key={c.href} href={c.href}
                        className={`block px-4 py-2 text-sm transition-colors ${pathname === c.href ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className={linkCls(item.href)}>{item.label}</Link>
            )
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }} className="md:hidden px-4 pb-4 flex flex-col gap-1">
          {nav.map(item =>
            isGroup(item) ? (
              <div key={item.label} className="py-1">
                <div style={{ color: 'var(--text-muted)' }} className="text-xs font-bold uppercase tracking-widest pt-3 pb-1">{item.label}</div>
                {item.children.map(c => (
                  <Link key={c.href} href={c.href} onClick={() => setOpen(false)}
                    className={`block py-2 pl-3 text-sm transition-colors ${pathname === c.href ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>
                    {c.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors ${pathname === item.href ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
