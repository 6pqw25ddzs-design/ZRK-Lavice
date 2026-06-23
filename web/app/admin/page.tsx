'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const sections = [
  { href: '/admin/vijesti', label: 'Vijesti', icon: '📰', desc: 'Dodaj i uredi objave' },
  { href: '/admin/raspored', label: 'Raspored', icon: '📅', desc: 'Upravljaj utakmicama i treninzima' },
  { href: '/admin/rezultati', label: 'Rezultati', icon: '🏆', desc: 'Unesi rezultate utakmica' },
  { href: '/admin/igraci', label: 'Igrači', icon: '👥', desc: 'Upravljaj igračima i ekipama' },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('admin_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dobrodošli{user ? `, ${user.fullName.split(' ')[0]}` : ''}!</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">Upravljajte sadržajem ŽRK Lavice</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.href} href={s.href}
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            className="rounded-xl p-6 hover:border-red-700 transition-colors">
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="text-white font-bold text-lg">{s.label}</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
