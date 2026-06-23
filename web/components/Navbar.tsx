'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Početna' },
  { href: '/raspored', label: 'Raspored' },
  { href: '/ekipe', label: 'Ekipe' },
  { href: '/vijesti', label: 'Vijesti' },
  { href: '/o-nama', label: 'O nama' },
  { href: '/podrzi-nas', label: 'Podržite nas' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="ŽRK Lavice" width={40} height={40} className="object-contain" />
          <span style={{ color: 'var(--primary)' }} className="text-2xl font-black">ŽRK</span>
          <span className="text-white font-bold text-xl">Lavice</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-medium transition-colors ${pathname === l.href ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
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
        <div style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }} className="md:hidden px-4 pb-4 flex flex-col gap-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-sm font-medium py-2 transition-colors ${pathname === l.href ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
