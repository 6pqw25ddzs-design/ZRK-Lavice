'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTeams, getSchedule, getRegistrations, getNews } from '@/lib/api';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import {
  Users, Calendar, ClipboardList, Newspaper,
  ArrowRight, TrendingUp, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';

type Stat = { label: string; value: string | number; sub: string; color: string; href: string; icon: React.ReactNode };

export default function AdminDashboard() {
  const [teams, setTeams] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [regs, setRegs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTeams(), getSchedule(), getRegistrations(), getNews()])
      .then(([t, e, r, n]) => { setTeams(t); setEvents(e); setRegs(r); setNews(n); })
      .finally(() => setLoading(false));
  }, []);

  const totalPlayers = teams.reduce((s: number, t: any) => s + (t._count?.players || 0), 0);
  const upcomingEvents = events.filter((e: any) => new Date(e.startsAt) > new Date()).slice(0, 5);
  const pendingRegs = regs.filter((r: any) => r.status === 'pending');

  const stats: Stat[] = [
    { label: 'Ukupno igračica', value: totalPlayers, sub: `u ${teams.length} ekipe`, color: 'text-primary', href: '/admin/igiracice', icon: <Users size={22} className="text-primary" /> },
    { label: 'Predstojeći termini', value: upcomingEvents.length, sub: 'u narednih 30 dana', color: 'text-blue-600', href: '/admin/raspored', icon: <Calendar size={22} className="text-blue-600" /> },
    { label: 'Čekaju odobrenje', value: pendingRegs.length, sub: 'novih registracija', color: 'text-amber-600', href: '/admin/registracije', icon: <ClipboardList size={22} className="text-amber-600" /> },
    { label: 'Objavljene vijesti', value: news.length, sub: 'ove sezone', color: 'text-emerald-600', href: '/admin/vijesti', icon: <Newspaper size={22} className="text-emerald-600" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">{format(new Date(), "EEEE, d. MMMM yyyy.", { locale: sr })}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/notifikacije" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
            <span>🔔</span> Pošalji obavještenje
          </Link>
          <Link href="/admin/igiracice?new=1" className="flex items-center gap-2 bg-dark text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
            + Nova igračica
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              {s.icon}
              <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <div className={clsx('text-3xl font-extrabold mb-1', s.color)}>{s.value}</div>
            <div className="text-xs font-semibold text-dark">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Raspored */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark">Predstojeći termini</h2>
            <Link href="/admin/raspored" className="text-primary text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Svi <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && <p className="text-gray-400 text-sm">Nema predstojecih termina.</p>}
            {upcomingEvents.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="text-center min-w-[40px]">
                  <div className="font-extrabold text-lg text-dark leading-none">{format(new Date(e.startsAt), 'd')}</div>
                  <div className="text-xs text-gray-400 uppercase">{format(new Date(e.startsAt), 'MMM', { locale: sr })}</div>
                </div>
                <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', e.type === 'match' ? 'bg-primary' : 'bg-gold')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-dark truncate">{e.title}</div>
                  <div className="text-xs text-gray-400">{format(new Date(e.startsAt), 'HH:mm')} · {e.location || '—'}</div>
                </div>
                <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full',
                  e.type === 'match' ? 'bg-red-50 text-primary' : 'bg-amber-50 text-amber-700'
                )}>
                  {e.type === 'match' ? 'Utakmica' : 'Trening'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registracije */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark">Registracije</h2>
            <Link href="/admin/registracije" className="text-primary text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Sve <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {regs.length === 0 && <p className="text-gray-400 text-sm">Nema registracija.</p>}
            {regs.slice(0, 5).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                  {r.childName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-dark truncate">{r.childName}</div>
                  <div className="text-xs text-gray-400">{r.birthYear}. god. · {r.parentPhone}</div>
                </div>
                <span className={clsx('flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
                  r.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}>
                  {r.status === 'pending' && <AlertCircle size={11} />}
                  {r.status === 'approved' && <CheckCircle2 size={11} />}
                  {r.status === 'pending' ? 'Na čekanju' : r.status === 'approved' ? 'Odobreno' : 'Odbijeno'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekipe */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark">Ekipe</h2>
            <Link href="/admin/igiracice" className="text-primary text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Upravljaj <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {teams.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <div className="font-semibold text-sm text-dark">{t.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{t.category.replace('_', ' ')} · {t.season}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-xl text-primary">{t._count?.players || 0}</div>
                  <div className="text-xs text-gray-400">igračica</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brze akcije */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-dark mb-5">Brze akcije</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/raspored?new=1', icon: '📅', label: 'Dodaj trening' },
              { href: '/admin/raspored?type=match', icon: '🏆', label: 'Zakaži utakmicu' },
              { href: '/admin/vijesti?new=1', icon: '📰', label: 'Nova vijest' },
              { href: '/admin/notifikacije', icon: '🔔', label: 'Obavijesti roditelje' },
              { href: '/admin/igiracice?new=1', icon: '👤', label: 'Dodaj igračicu' },
              { href: '/admin/registracije', icon: '✅', label: 'Obradi registracije' },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-2.5 p-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
              >
                <span>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
