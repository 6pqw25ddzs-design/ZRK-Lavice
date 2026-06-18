'use client';
import { useEffect, useState } from 'react';
import { getPlayers, getTeams, createPlayer, updatePlayer, deletePlayer } from '@/lib/api';
import { clsx } from 'clsx';
import { Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';

type Player = {
  id: string; firstName: string; lastName: string; birthDate: string;
  jerseyNumber?: number; position?: string; isActive: boolean;
  team: { id: string; name: string; category: string };
};
type Team = { id: string; name: string; category: string };

const POSITIONS = ['Golman', 'Lijevo krilo', 'Desno krilo', 'Lijevi bek', 'Desni bek', 'Centar', 'Pivot'];
const CATEGORY_LABELS: Record<string, string> = { mini: 'Mini', pioniri: 'Pioniri', prva_liga: 'Prva liga' };

const emptyForm = { firstName: '', lastName: '', birthDate: '', jerseyNumber: '', position: '', teamId: '' };

export default function IgiracicePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    Promise.all([getPlayers(), getTeams()])
      .then(([p, t]) => { setPlayers(p); setTeams(t); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = players.filter(p => {
    if (teamFilter !== 'all' && p.team.id !== teamFilter) return false;
    const q = search.toLowerCase();
    return !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
  });

  function openCreate() {
    setForm({ ...emptyForm, teamId: teams[0]?.id || '' });
    setEditing(null);
    setModal('create');
  }

  function openEdit(p: Player) {
    setForm({
      firstName: p.firstName, lastName: p.lastName,
      birthDate: p.birthDate.split('T')[0],
      jerseyNumber: String(p.jerseyNumber || ''),
      position: p.position || '',
      teamId: p.team.id,
    });
    setEditing(p);
    setModal('edit');
  }

  async function save() {
    setSaving(true);
    try {
      const data = {
        firstName: form.firstName, lastName: form.lastName,
        birthDate: new Date(form.birthDate).toISOString(),
        jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber) : undefined,
        position: form.position || undefined,
        teamId: form.teamId,
      };
      if (modal === 'create') await createPlayer(data);
      else if (editing) await updatePlayer(editing.id, data);
      setModal(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    await deletePlayer(id);
    setDeleteId(null);
    load();
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Igračice</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filtered.length} igračica</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Nova igračica
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pretraži..."
            className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary w-52"
          />
        </div>
        <button onClick={() => setTeamFilter('all')} className={clsx('px-4 py-2 rounded-lg text-sm font-semibold border transition-colors', teamFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600')}>Sve ekipe</button>
        {teams.map(t => (
          <button key={t.id} onClick={() => setTeamFilter(t.id)} className={clsx('px-4 py-2 rounded-lg text-sm font-semibold border transition-colors', teamFilter === t.id ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600')}>
            {CATEGORY_LABELS[t.category] || t.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Igračica</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pozicija</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ekipa</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Godište</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-bold text-primary">#{p.jerseyNumber || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <span className="font-semibold text-dark">{p.firstName} {p.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.position || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-1 bg-red-50 text-primary rounded-full">
                    {CATEGORY_LABELS[p.team.category] || p.team.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.birthDate).getFullYear()}.</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">Nema igračica za odabrani filter.</div>
        )}
      </div>

      {/* Modal — Create / Edit */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg text-dark">{modal === 'create' ? 'Nova igračica' : 'Uredi igračicu'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-dark"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Ime *</label>
                  <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Prezime *</label>
                  <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Datum rođenja *</label>
                <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Broj dresa</label>
                  <input type="number" value={form.jerseyNumber} onChange={e => setForm(f => ({ ...f, jerseyNumber: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" min={1} max={99} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Pozicija</label>
                  <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="">—</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Ekipa *</label>
                <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Odustani</button>
              <button onClick={save} disabled={saving || !form.firstName || !form.lastName || !form.birthDate || !form.teamId}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 flex items-center gap-2">
                {saving ? 'Snimanje...' : <><Check size={14} /> Snimi</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-lg text-dark mb-2">Deaktivirati igračicu?</h3>
            <p className="text-gray-400 text-sm mb-6">Igračica će biti sklonjena sa aktivnog rostera. Možete je ponovo aktivirati.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600">Odustani</button>
              <button onClick={() => confirmDelete(deleteId)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Deaktiviraj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
