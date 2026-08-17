'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Team = { id: string; name: string; category: string; };
type Player = { id: string; firstName: string; lastName: string; jerseyNumber?: number; position?: string; birthDate: string; teamId: string; team: { name: string; category: string; }; };

const POSITIONS = ['Golman', 'Lijevo krilo', 'Desno krilo', 'Lijevi bek', 'Desni bek', 'Srednji bek', 'Pivot'];

export default function AdminIgraciPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    teamId: '', firstName: '', lastName: '', birthDate: '', jerseyNumber: '', position: '', photoUrl: '',
  });
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({});
  const [linkingPhotos, setLinkingPhotos] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');

  // "Lana Bajčeta" -> "lana-bajceta" (đ->dj, skidanje kvačica)
  function slugifyName(s: string) {
    return s.toLowerCase()
      .replace(/đ/g, 'dj').replace(/ž/g, 'z').replace(/ć/g, 'c').replace(/č/g, 'c').replace(/š/g, 's')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Za svaku igračicu provjeri postoji li /tim/<ime-prezime>.jpg i upiši ga kao fotografiju
  async function linkPhotos() {
    setLinkingPhotos(true); setLinkMsg(''); setError('');
    let linked = 0, missing = 0;
    for (const p of players) {
      const slug = slugifyName(`${p.firstName} ${p.lastName}`);
      const url = `https://zrklavice.me/tim/${slug}.jpg`;
      try {
        const head = await fetch(url, { method: 'HEAD' });
        if (!head.ok) { missing++; continue; }
        await adminRequest(`/api/players/${p.id}`, getToken(), {
          method: 'PATCH', body: JSON.stringify({ photoUrl: url }),
        });
        linked++;
      } catch { missing++; }
    }
    setLinkMsg(`✓ Povezano ${linked} fotografija · bez slike: ${missing}`);
    setLinkingPhotos(false);
    await load();
  }

  async function handleInvite(playerId: string) {
    try {
      const inv = await adminRequest('/api/invites', getToken(), {
        method: 'POST', body: JSON.stringify({ playerId }),
      });
      setInviteCodes(prev => ({ ...prev, [playerId]: inv.code }));
      try { await navigator.clipboard.writeText(inv.code); } catch {}
    } catch (e: any) {
      setError('Greška pri generisanju koda: ' + (e?.message || ''));
    }
  }

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const tms = await adminRequest('/api/teams', getToken());
      setTeams(tms);
    } catch {
      setError('Greška pri učitavanju ekipa');
    }
    try {
      const pls = await adminRequest('/api/players', getToken());
      setPlayers(pls);
    } catch (e: any) {
      setError('Greška pri učitavanju igrača: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ teamId: '', firstName: '', lastName: '', birthDate: '', jerseyNumber: '', position: '', photoUrl: '' });
    setEditing(null);
    setError('');
  }

  async function handleSave() {
    if (!form.teamId || !form.firstName || !form.lastName || !form.birthDate) {
      setError('Popunite obavezna polja'); return;
    }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = {
        teamId: form.teamId,
        firstName: form.firstName,
        lastName: form.lastName,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : form.birthDate,
      };
      if (form.jerseyNumber) body.jerseyNumber = Number(form.jerseyNumber);
      if (form.position) body.position = form.position;
      if (form.photoUrl.trim()) body.photoUrl = form.photoUrl.trim();

      if (editing) {
        await adminRequest(`/api/players/${editing}`, getToken(), { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await adminRequest('/api/players', getToken(), { method: 'POST', body: JSON.stringify(body) });
      }
      resetForm();
      await load();
    } catch (e: any) {
      setError('Greška pri čuvanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovog igrača?')) return;
    try {
      await adminRequest(`/api/players/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  function startEdit(p: Player) {
    setEditing(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setForm({
      teamId: p.teamId || '',
      firstName: p.firstName,
      lastName: p.lastName,
      birthDate: p.birthDate?.slice(0, 10) || '',
      jerseyNumber: p.jerseyNumber?.toString() || '',
      position: p.position || '',
      photoUrl: (p as any).photoUrl || '',
    });
  }

  const inputClass = "px-4 py-2 rounded-lg outline-none focus:border-red-600";
  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white">Igrači</h1>
        <div className="flex items-center gap-3">
          {linkMsg && <span className="text-sm text-green-500">{linkMsg}</span>}
          <button onClick={linkPhotos} disabled={linkingPhotos}
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            className="px-4 py-2 rounded-lg text-sm hover:text-white transition-colors disabled:opacity-50"
            title="Za svaku igračicu traži zrklavice.me/tim/ime-prezime.jpg i upisuje je kao fotografiju">
            {linkingPhotos ? 'Povezujem...' : '📸 Poveži fotografije'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 mb-8">
        <h2 className="text-white font-bold mb-4">{editing ? 'Uredi igrača' : 'Novi igrač'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle}>
            <option value="">Odaberi ekipu *</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
          </select>
          <input placeholder="Ime *" value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <input placeholder="Prezime *" value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="text-xs block mb-1">Datum rođenja *</label>
            <input type="date" value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              className={`${inputClass} w-full`} style={inputStyle} />
          </div>
          <input type="number" min="1" max="99" placeholder="Broj dresa" value={form.jerseyNumber}
            onChange={e => setForm(f => ({ ...f, jerseyNumber: e.target.value }))}
            className={inputClass} style={inputStyle} />
          <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle}>
            <option value="">Pozicija (opciono)</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input placeholder="Link na sliku igračice (https://...) — opciono" value={form.photoUrl}
            onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
            className={`${inputClass} col-span-2`} style={inputStyle} />
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-2">
          Slika igračice: postavi je (postimages.org) i zalijepi direktan link na .jpg/.png. Bez slike, prikazuje se broj dresa.
        </p>
        {error && <p style={{ color: 'var(--primary)' }} className="text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Dodaj igrača'}
          </button>
          {editing && (
            <button onClick={resetForm}
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              className="px-6 py-2 rounded-lg hover:text-white transition-colors">
              Otkaži
            </button>
          )}
        </div>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {players.map(p => (
            <div key={p.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                  {p.jerseyNumber ?? '?'}
                </div>
                <div>
                  <div className="text-white font-semibold">{p.firstName} {p.lastName}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-xs">
                    {p.position || '—'} · {p.team.name} · {new Date(p.birthDate).getFullYear()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                {inviteCodes[p.id] ? (
                  <span style={{ color: 'var(--primary)', border: '1px dashed var(--primary)' }}
                    className="px-3 py-1 rounded-lg text-sm font-mono font-bold" title="Kopirano u clipboard">
                    {inviteCodes[p.id]}
                  </span>
                ) : (
                  <button onClick={() => handleInvite(p.id)}
                    style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                    className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors"
                    title="Pozivni kod kojim roditelj aktivira nalog i vezuje se za dijete">
                    Kod za roditelja
                  </button>
                )}
                <button onClick={() => startEdit(p)}
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Uredi
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700 transition-colors">
                  Briši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
