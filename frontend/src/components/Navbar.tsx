'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const links = [
  { href: '/o-klubu', label: 'O Klubu' },
  { href: '/ekipe', label: 'Ekipe' },
  { href: '/raspored', label: 'Raspored' },
  { href: '/rezultati', label: 'Rezultati' },
  { href: '/vijesti', label: 'Vijesti' },
  { href: '/sponzori', label: 'Sponzori' },
  { href: '/kontakt', label: 'Kontakt' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xl">🦁</div>
            <span className="text-white font-bold text-lg">
              ZRK <span className="text-gold">Lavice</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  pathname === l.href ? 'text-white' : 'text-gray-400 hover:text-white'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/registracija"
              className="hidden md:block bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Registruj dijete
            </Link>
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-dark border-t border-gray-800 px-4 pb-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-3 text-sm text-gray-300 hover:text-white border-b border-gray-800"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/registracija"
            className="mt-4 block w-full text-center bg-primary text-white py-2.5 rounded-lg text-sm font-semibold"
            onClick={() => setOpen(false)}
          >
            Registruj dijete
          </Link>
        </div>
      )}
    </nav>
  );
}
