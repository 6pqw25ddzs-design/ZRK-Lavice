'use client';
import { useState, useEffect } from 'react';
import { getTeams, sendNotification } from '@/lib/api';
import { Bell, CheckCircle2, Send } from 'lucide-react';
import { clsx } from 'clsx';

type Team = { id: string; name: string; category: string };

const TEMPLATES = [
  { label: 'Promjena termina', title: 'Izmjena rasporeda', body: 'Trening je pomjeren. Provjerite raspored u aplikaciji.' },
  { label: 'Otkazivanje', title: 'Termin je otkazan', body: 'Današnji trening je otkazan. Sljedeći trening je po planu.' },
  { label: 'Utakmica sutra', title: 'Utakmica sutra!', body: 'Podsjetnik: sutra imamo utakmicu. Budite na vrijame!' },
  { label: 'Poziv roditeljima', title: 'Roditeljski sastanak', body: 'Pozivamo vas na roditeljski sastanak u srijedu u 18:00h u SC Morača.' },
];

export default function NotifikacijePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { getTeams().then(setTeams); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await sendNotification({ title, body, teamId: teamId || undefined });
      setSent(true);
      setTitle(''); setBody(''); setTeamId('');
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Pošalji obavještenje</h1>
        <p className="text-gray-400 text-sm mt-0.5">Push notifikacija stiže roditeljima za manje od 5 sekundi.</p>
      </div>

      {/* Templates */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Brzi šabloni</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => { setTitle(t.title); setBody(t.body); }}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-red-50 transition-colors">
              <div className="text-sm font-semibold text-dark">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">{t.title}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Primatelji</label>
          <select value={teamId} onChange={e => setTeamId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
            <option value="">🌐 Svi roditelji (sve ekipe)</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {teamId ? `Notifikacija ide samo roditeljima odabrane ekipe.` : `Notifikacija ide svim roditeljima svih ekipa.`}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Naslov *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={64}
            placeholder="npr. Izmjena rasporeda"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/64</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Poruka *</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={4} maxLength={256}
            placeholder="Upiši tekst obavještenja..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
          <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/256</p>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Bell size={11} /> Pregled notifikacije</p>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-xs">🦁</div>
                <span className="text-white text-xs font-semibold">ZRK Lavice</span>
              </div>
              <p className="text-white text-sm font-semibold">{title || 'Naslov...'}</p>
              <p className="text-gray-300 text-xs mt-0.5">{body || 'Tekst poruke...'}</p>
            </div>
          </div>
        )}

        <button type="submit" disabled={sending || !title || !body}
          className={clsx(
            'w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors',
            sent ? 'bg-emerald-600 text-white' : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-40'
          )}>
          {sent ? <><CheckCircle2 size={16} /> Poslano!</> : sending ? 'Slanje...' : <><Send size={16} /> Pošalji obavještenje</>}
        </button>
      </form>
    </div>
  );
}
