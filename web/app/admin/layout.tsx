'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/vijesti', label: 'Vijesti', icon: '📰' },
  { href: '/admin/raspored', label: 'Raspored', icon: '📅' },
  { href: '/admin/rezultati', label: 'Rezultati', icon: '🏆' },
  { href: '/admin/tabela', label: 'Tabela', icon: '📊' },
  { href: '/admin/igraci', label: 'Igrači', icon: '👥' },
  { href: '/admin/sponzori', label: 'Sponzori', icon: '🤝' },
  { href: '/admin/prijave', label: 'Prijave', icon: '📝' },
  { href: '/admin/dokumenti', label: 'Dokumenti', icon: '📄' },
  { href: '/admin/galerija', label: 'Galerija', icon: '🖼️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('admin_token');
    const u = localStorage.getItem('admin_user');
    if (!token || !u) {
      router.push('/admin/login');
      return;
    }
    setUser(JSON.parse(u));
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!user) return null;

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }} className="w-56 flex flex-col">
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div style={{ color: 'var(--primary)' }} className="font-black text-lg">ŽRK Lavice</div>
          <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">Admin panel</div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: pathname === item.href ? 'var(--primary)' : 'transparent',
                color: pathname === item.href ? 'white' : 'var(--text-muted)',
              }}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div style={{ color: 'var(--text-muted)' }} className="text-xs px-3 mb-2">{user.fullName}</div>
          <button onClick={logout}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-900"
            style={{ color: 'var(--text-muted)' }}>
            🚪 Odjavi se
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
