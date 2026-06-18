'use client';
import { useEffect, useState } from 'react';
import { getSchedule, getTeams, createEvent, updateEvent, deleteEvent } from '@/lib/api';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { Plus, Pencil, Trash2, X, Check, Bell } from 'lucide-react';

type Event = {
  id: string; title: string; type: 'training' | 'match';
  startsAt: string; endsAt?: string; location?: string;
  opponent?: string; isCancelled: boolean;
  team: { id: string; name: string; category: string };
};
type Team = { id: string; name: string; category: string };

const emptyForm = { teamId: '', type: 'training', title: '', startsAt: '', endsAt: '', location: '', opponent: '' };

export default function RasporedAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getSchedule(), getTeams()])
      .then(([e, t]) => { setEvents(e); setTeams(t); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = events.filter(e => teamFilter === 'all' || e.team.id === teamFilter);

  function openCreate() {
    setForm({ ...emptyForm, teamId: teams[0]?.id || '' });
    setEditing(null);
    setModal('create');
  }
  function openEdit(e: Event) {
    setForm({
      teamId: e.team.id, type: e.type, title: e.title,
      startsAt: e.startsAt.slice(0, 16),
      endsAt: e.endsAt?.slice(0, 16) || '',
      location: e.location || '', opponent: e.opponent || '',
    });
    setEditing(e);
    setModal('edit');
  }

  async function save() {
    setSaving(true);
    try {
      const data = {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        opponent: form.type === 'match' ? form.opponent : undefined,
      };
      if (modal === 'create') await createEvent(data);
      else if (editing) await updateEvent(editing.id, data);
      setModal(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleCancel(e: Event) {
    await updateEvent(e.id, { isCancelled: !e.isCancelled });
    load();
  }

  async function remove(id: string) {
    await deleteEvent(id);
    load();
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Raspored</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filtered.length} termina</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Novi termin
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTeamFilter('all')} className={clsx('px-4 py-2 rounded-lg text-sm font-semibold border transition-colors', teamFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600')}>Sve ekipe</button>
        {teams.map(t => (
          <button key={t.id} onClick={() => setTeamFilter(t.id)} className={clsx('px-4 py-2 rounded-lg text-sm font-semibold border transition-colors', teamFilter === t.id ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600')}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Datum</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Naziv</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ekipa</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lokacija</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tip</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(e => (
              <tr key={e.id} className={clsx('hover:bg-gray-50 transition-colors', e.isCancelled && 'opacity-50')}>
                <td className="px-4 py-3">
                  <div className="font-bold text-dark">{format(new Date(e.startsAt), 'd. MMM', { locale: sr })}</div>
                  <div className="text-xs text-gray-400">{format(new Date(e.startsAt), 'HH:mm')}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-dark max-w-[180px] truncate">{e.title}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.team.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{e.location || '—'}</td>
                <td className="px-4 py-3">
                  <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full',
                    e.type === 'match' ? 'bg-red-50 text-primary' : 'bg-amber-50 text-amber-700'
                  )}>
                    {e.type === 'match' ? '🏆 Utakmica' : '🏃 Trening'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleCancel(e)}
                    className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors',
                      e.isCancelled
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    )}
                  >
                    {e.isCancelled ? 'Otkazano' : 'Aktivno'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => remove(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">Nema termina.</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-lg">{modal === 'create' ? 'Novi termin' : 'Uredi termin'}</h3>
              <button onClick={() => setModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Ekipa *</label>
                  <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Tip *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="training">Trening</option>
                    <option value="match">Utakmica</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Naziv *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={form.type === 'match' ? 'npr. Pioniri — RK Budućnost' : 'npr. Trening — Pioniri'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Početak *</label>
                  <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Kraj</label>
                  <input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Lokacija</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="SC Morača, Sala 2"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              {form.type === 'match' && (
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Protivnik</label>
                  <input value={form.opponent} onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
                    placeholder="RK Budućnost"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              )}
              {modal === 'create' && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                  <Bell size={13} /> Roditelji ekipe automatski dobijaju push notifikaciju.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600">Odustani</button>
              <button onClick={save} disabled={saving || !form.title || !form.startsAt || !form.teamId}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 flex items-center gap-2">
                {saving ? 'Snimanje...' : <><Check size={14} /> Snimi</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
