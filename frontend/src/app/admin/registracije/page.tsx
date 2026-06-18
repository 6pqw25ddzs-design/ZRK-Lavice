'use client';
import { useEffect, useState } from 'react';
import { getRegistrations, updateRegistration } from '@/lib/api';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { CheckCircle2, XCircle, Clock, Phone, Mail } from 'lucide-react';

type Reg = {
  id: string; childName: string; birthYear: number;
  parentName: string; parentPhone: string; parentEmail: string;
  status: 'pending' | 'approved' | 'rejected'; notes?: string;
  createdAt: string;
};

const STATUS = {
  pending: { label: 'Na čekanju', icon: Clock, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Odobreno', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Odbijeno', icon: XCircle, cls: 'bg-red-50 text-red-600 border-red-200' },
};

function guessTeam(year: number) {
  if (year >= 2014) return 'Mini rukomet';
  if (year >= 2012) return 'Pionirska liga';
  return 'Prva liga';
}

export default function RegistracijePage() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => getRegistrations().then(setRegs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = regs.filter(r => filter === 'all' || r.status === filter);

  async function setStatus(id: string, status: string) {
    setUpdating(id);
    await updateRegistration(id, { status });
    await load();
    setUpdating(null);
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const counts = { all: regs.length, pending: regs.filter(r => r.status === 'pending').length, approved: regs.filter(r => r.status === 'approved').length, rejected: regs.filter(r => r.status === 'rejected').length };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Registracije</h1>
        <p className="text-gray-400 text-sm mt-0.5">{counts.pending} čeka odobrenje</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { val: 'all', label: `Sve (${counts.all})` },
          { val: 'pending', label: `Na čekanju (${counts.pending})` },
          { val: 'approved', label: `Odobrene (${counts.approved})` },
          { val: 'rejected', label: `Odbijene (${counts.rejected})` },
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-semibold border transition-colors',
              filter === f.val ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">Nema registracija.</div>}
        {filtered.map(r => {
          const S = STATUS[r.status];
          const Icon = S.icon;
          return (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                {r.childName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-dark">{r.childName}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.birthYear}. god.</span>
                  <span className="text-xs bg-red-50 text-primary px-2 py-0.5 rounded-full font-semibold">{guessTeam(r.birthYear)}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1 font-medium">{r.parentName}</div>
                <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><Phone size={11} /> {r.parentPhone}</span>
                  <span className="flex items-center gap-1"><Mail size={11} /> {r.parentEmail}</span>
                  <span>Prijavljeno: {format(new Date(r.createdAt), 'd. MMM yyyy.', { locale: sr })}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={clsx('flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border', S.cls)}>
                  <Icon size={12} /> {S.label}
                </span>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatus(r.id, 'approved')}
                      disabled={updating === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Odobri
                    </button>
                    <button
                      onClick={() => setStatus(r.id, 'rejected')}
                      disabled={updating === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <XCircle size={12} /> Odbij
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
