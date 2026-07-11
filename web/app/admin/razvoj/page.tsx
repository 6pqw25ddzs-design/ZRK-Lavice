'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Player = { id: string; firstName: string; lastName: string; position?: string; teamId: string; team: { name: string } };
type Team = { id: string; name: string };
type Criterion = { id: string; domain: string; name: string };
type Goal = { id: string; title: string; description: string | null; status: 'active' | 'done' | 'paused'; dueDate: string | null };
type Evaluation = {
  id: string; period: string; comment: string | null; createdAt: string;
  coach: { fullName: string };
  scores: { score: number; criterion: { name: string; domain: string } }[];
};
type TimelineEvent = { kind: string; title: string; at: string };

const DOMAIN_LABELS: Record<string, string> = {
  technical: 'Tehnika', tactical: 'Taktika', physical: 'Fizička priprema', mental: 'Mentalitet', goalkeeper: 'Golmanski rad',
};
const DOMAIN_ORDER = ['technical', 'tactical', 'physical', 'mental', 'goalkeeper'];

export default function AdminRazvojPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [playerId, setPlayerId] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState('');

  const [showEval, setShowEval] = useState(false);
  const [evalForm, setEvalForm] = useState<{ period: string; comment: string; scores: Record<string, number> }>({ period: '', comment: '', scores: {} });
  const [goalForm, setGoalForm] = useState({ title: '', description: '' });
  const [promoteTo, setPromoteTo] = useState('');
  const [saving, setSaving] = useState(false);

  function getToken() { return localStorage.getItem('admin_token') || ''; }
  const player = players.find(p => p.id === playerId);
  const isGoalkeeper = player?.position === 'Golman';

  useEffect(() => {
    Promise.all([
      adminRequest('/api/players', getToken()),
      adminRequest('/api/teams', getToken()),
      adminRequest('/api/development/criteria', getToken()),
    ]).then(([p, t, c]) => { setPlayers(p); setTeams(t); setCriteria(c); })
      .catch((e: any) => setError('Greška pri učitavanju: ' + (e?.message || '')));
  }, []);

  async function load(id: string) {
    try {
      const [evs, gls, tl] = await Promise.all([
        adminRequest(`/api/development/evaluations?playerId=${id}`, getToken()),
        adminRequest(`/api/development/goals?playerId=${id}`, getToken()),
        adminRequest(`/api/development/timeline/${id}`, getToken()),
      ]);
      setEvaluations(evs); setGoals(gls); setTimeline(tl); setError('');
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => {
    if (playerId) { load(playerId); setShowEval(false); setEvalForm({ period: '', comment: '', scores: {} }); setPromoteTo(''); }
  }, [playerId]);

  const visibleCriteria = criteria.filter(c => c.domain !== 'goalkeeper' || isGoalkeeper);

  async function saveEvaluation() {
    const scores = Object.entries(evalForm.scores).map(([criterionId, score]) => ({ criterionId, score }));
    if (!evalForm.period || scores.length === 0) { setError('Unesite period i bar jednu ocjenu'); return; }
    setSaving(true);
    try {
      await adminRequest('/api/development/evaluations', getToken(), {
        method: 'POST', body: JSON.stringify({ playerId, period: evalForm.period, comment: evalForm.comment || undefined, scores }),
      });
      setShowEval(false); setEvalForm({ period: '', comment: '', scores: {} });
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
    finally { setSaving(false); }
  }

  async function addGoal() {
    if (!goalForm.title) { setError('Unesite naslov cilja'); return; }
    try {
      await adminRequest('/api/development/goals', getToken(), {
        method: 'POST', body: JSON.stringify({ playerId, ...goalForm }),
      });
      setGoalForm({ title: '', description: '' });
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function setGoalStatus(id: string, status: string) {
    try {
      await adminRequest(`/api/development/goals/${id}`, getToken(), { method: 'PATCH', body: JSON.stringify({ status }) });
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function setInjury(status: string) {
    try {
      await adminRequest('/api/development/injuries', getToken(), {
        method: 'POST', body: JSON.stringify({ playerId, status }),
      });
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function promote() {
    if (!promoteTo) return;
    if (!confirm('Prebaciti igračicu u novu ekipu? Prelazak se trajno upisuje u istoriju razvoja.')) return;
    try {
      await adminRequest('/api/development/promote', getToken(), {
        method: 'POST', body: JSON.stringify({ playerId, toTeamId: promoteTo }),
      });
      const p = await adminRequest('/api/players', getToken());
      setPlayers(p); setPromoteTo('');
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const cardStyle = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Razvoj igračica</h1>

      <select value={playerId} onChange={e => setPlayerId(e.target.value)} style={inputStyle} className="px-4 py-2 rounded-lg outline-none mb-6">
        <option value="">— Izaberi igračicu —</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName} · {p.team.name}</option>)}
      </select>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {player && (
        <div className="flex flex-col gap-6">

          <div style={cardStyle} className="rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
              <h2 className="text-white font-bold">📋 Evaluacije</h2>
              <button onClick={() => setShowEval(!showEval)} style={{ backgroundColor: 'var(--primary)' }}
                className="px-4 py-1.5 rounded-lg text-white text-sm font-bold">
                {showEval ? 'Zatvori' : 'Nova evaluacija'}
              </button>
            </div>

            {showEval && (
              <div className="mt-4 flex flex-col gap-4">
                <input placeholder="Period (npr. Novembar 2026)" value={evalForm.period}
                  onChange={e => setEvalForm({ ...evalForm, period: e.target.value })}
                  style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none max-w-xs" />
                {DOMAIN_ORDER.filter(d => visibleCriteria.some(c => c.domain === d)).map(domain => (
                  <div key={domain}>
                    <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--primary)' }}>{DOMAIN_LABELS[domain]}</h3>
                    {visibleCriteria.filter(c => c.domain === domain).map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-3 py-1">
                        <span className="text-sm text-white">{c.name}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setEvalForm({ ...evalForm, scores: { ...evalForm.scores, [c.id]: n } })}
                              style={evalForm.scores[c.id] === n
                                ? { backgroundColor: 'var(--primary)', color: 'white' }
                                : { border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                              className="w-8 h-8 rounded-lg text-sm font-bold">
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <textarea placeholder="Komentar trenera — roditelj ga vidi, piši jezikom ohrabrenja" rows={3}
                  value={evalForm.comment} onChange={e => setEvalForm({ ...evalForm, comment: e.target.value })}
                  style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
                <button onClick={saveEvaluation} disabled={saving} style={{ backgroundColor: 'var(--primary)' }}
                  className="px-5 py-2 rounded-lg text-white text-sm font-bold self-start disabled:opacity-50">
                  {saving ? 'Čuvam...' : 'Sačuvaj evaluaciju'}
                </button>
              </div>
            )}

            {!showEval && (
              <div className="mt-3 flex flex-col gap-3">
                {evaluations.map(ev => {
                  const byDomain: Record<string, number[]> = {};
                  ev.scores.forEach(s => { (byDomain[s.criterion.domain] ||= []).push(s.score); });
                  return (
                    <div key={ev.id} className="py-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="text-white text-sm font-semibold">{ev.period}
                        <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}> · {ev.coach.fullName} · {new Date(ev.createdAt).toLocaleDateString('sr-Latn-ME')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {DOMAIN_ORDER.filter(d => byDomain[d]).map(d => {
                          const avg = byDomain[d].reduce((a, b) => a + b, 0) / byDomain[d].length;
                          return <span key={d} className="text-xs px-2 py-0.5 rounded-full" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            {DOMAIN_LABELS[d]}: <span className="text-white font-bold">{avg.toFixed(1)}</span>
                          </span>;
                        })}
                      </div>
                      {ev.comment && <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>{ev.comment}</p>}
                    </div>
                  );
                })}
                {evaluations.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Još nema evaluacija.</p>}
              </div>
            )}
          </div>

          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">🎯 Razvojni ciljevi <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(najviše 3 aktivna)</span></h2>
            <div className="flex flex-col gap-2 mb-4">
              {goals.map(g => (
                <div key={g.id} className="flex items-center justify-between gap-3 py-1.5 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm text-white">
                    {g.status === 'done' ? '✅' : g.status === 'paused' ? '⏸️' : '🎯'} {g.title}
                    {g.description && <span style={{ color: 'var(--text-muted)' }}> — {g.description}</span>}
                  </span>
                  {g.status === 'active' && (
                    <span className="flex gap-2">
                      <button onClick={() => setGoalStatus(g.id, 'done')} className="text-xs text-green-500 hover:text-green-400">Ostvaren</button>
                      <button onClick={() => setGoalStatus(g.id, 'paused')} className="text-xs" style={{ color: 'var(--text-muted)' }}>Pauziraj</button>
                    </span>
                  )}
                  {g.status === 'paused' && <button onClick={() => setGoalStatus(g.id, 'active')} className="text-xs text-green-500">Aktiviraj</button>}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <input placeholder="Cilj (npr. Šut iz skoka sa 9m)" value={goalForm.title}
                onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                style={inputStyle} className="px-3 py-1.5 rounded-lg text-sm outline-none flex-1 min-w-48" />
              <button onClick={addGoal} style={{ backgroundColor: 'var(--primary)' }}
                className="px-4 py-1.5 rounded-lg text-white text-sm font-bold">Dodaj cilj</button>
            </div>
          </div>

          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">🩹 Status spremnosti</h2>
            <div className="flex gap-2 flex-wrap">
              {([['ready', 'Spremna', '#16a34a'], ['caution', 'Trening uz oprez', '#d4ac0d'], ['out', 'Van terena', '#dc2626']] as const).map(([s, label, color]) => (
                <button key={s} onClick={() => setInjury(s)}
                  style={{ border: `1px solid ${color}`, color }}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80">
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Povreda i povratak se automatski upisuju u vremensku osu. Trener vidi samo status, ne medicinsku dokumentaciju.</p>
          </div>

          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">🦁 Prelazak u drugu ekipu</h2>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{player.team.name} →</span>
              <select value={promoteTo} onChange={e => setPromoteTo(e.target.value)} style={inputStyle} className="px-3 py-1.5 rounded-lg text-sm outline-none">
                <option value="">— Nova ekipa —</option>
                {teams.filter(t => t.id !== player.teamId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={promote} disabled={!promoteTo} style={{ backgroundColor: 'var(--primary)' }}
                className="px-4 py-1.5 rounded-lg text-white text-sm font-bold disabled:opacity-40">Prebaci</button>
            </div>
          </div>

          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">🕐 Vremenska osa</h2>
            <div className="flex flex-col">
              {timeline.map((ev, i) => (
                <div key={i} className="flex gap-3 py-1.5 text-sm" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="shrink-0 w-24" style={{ color: 'var(--text-muted)' }}>
                    {new Date(ev.at).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-white">{ev.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
