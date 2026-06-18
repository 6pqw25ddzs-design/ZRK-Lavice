'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, Calendar, Trophy, Newspaper,
  Bell, ClipboardList, LogOut, ChevronRight, HandshakeIcon,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/igiracice', label: 'Igračice', icon: Users },
  { href: '/admin/raspored', label: 'Raspored', icon: Calendar },
  { href: '/admin/registracije', label: 'Registracije', icon: ClipboardList },
  { href: '/admin/vijesti', label: 'Vijesti', icon: Newspaper },
  { href: '/admin/notifikacije', label: 'Obavještenja', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, init, logout } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!pathname.startsWith('/admin/login') && !token) {
      router.push('/admin/login');
    }
  }, [token, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-dark flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-lg">🦁</div>
            <div>
              <div className="text-white font-bold text-sm">ZRK Lavice</div>
              <div className="text-gray-500 text-xs">Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors border-l-2',
                  active
                    ? 'bg-primary/15 text-white border-primary'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <div className="text-white text-xs font-semibold truncate">{user.fullName}</div>
            <div className="text-gray-500 text-xs capitalize">{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs px-3 py-2 w-full rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} /> Odjavi se
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-dark transition-colors">zrklavice.me</Link>
          <ChevronRight size={14} />
          <span className="text-dark font-medium">
            {navItems.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label || 'Admin'}
          </span>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
