'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Player = { id: string; firstName: string; lastName: string; team: { name: string } };
type DocType = { id: string; name: string; isRequired: boolean; validMonths: number | null };
type Doc = { id: string; typeId: string; issuedAt: string; expiresAt: string | null; fileUrl: string | null; note: string | null };
type Consent = { id: string; type: 'media' | 'data' | 'travel'; signedAt: string; revokedAt: string | null; signedBy?: { fullName: string } };
type Dossier = {
  player: { id: string; firstName: string; lastName: string };
  types: DocType[]; documents: Doc[]; consents: Consent[];
  medical: { notes: string | null; coachNote: string | null } | null;
  contacts: { id: string; name: string; phone: string; relation: string | null }[];
};

const CONSENT_LABELS: Record<string, string> = {
  media: 'Media (fotografije/objave)',
  data: 'Obrada podataka',
  travel: 'Putovanja',
};

export default function AdminDosijeiPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState('');
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState('');
  const [newDoc, setNewDoc] = useState({ typeId: '', issuedAt: '', fileUrl: '' });

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  useEffect(() => {
    adminRequest('/api/players', getToken()).then(setPlayers).catch(() => setError('Greška pri učitavanju igračica'));
  }, []);

  async function load(id: string) {
    try {
      setDossier(await adminRequest(`/api/dossier/players/${id}`, getToken()));
      setError('');
    } catch (e: any) {
      setError('Greška: ' + (e?.message || ''));
    }
  }
  useEffect(() => { if (playerId) load(playerId); else setDossier(null); }, [playerId]);

  async function addDocument() {
    if (!newDoc.typeId || !newDoc.issuedAt) { setError('Izaberite tip i datum izdavanja'); return; }
    try {
      await adminRequest('/api/dossier/documents', getToken(), {
        method: 'POST',
        body: JSON.stringify({ playerId, typeId: newDoc.typeId, issuedAt: new Date(newDoc.issuedAt).toISOString(), fileUrl: newDoc.fileUrl || undefined }),
      });
      setNewDoc({ typeId: '', issuedAt: '', fileUrl: '' });
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Obrisati dokument?')) return;
    try { await adminRequest(`/api/dossier/documents/${id}`, getToken(), { method: 'DELETE' }); await load(playerId); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function signConsent(type: string) {
    try {
      await adminRequest('/api/dossier/consents', getToken(), { method: 'POST', body: JSON.stringify({ playerId, type }) });
      await load(playerId);
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  async function revokeConsent(id: string) {
    if (!confirm('Povući saglasnost? Igračica će biti uklonjena sa javnih fotografija/rostera kad se brava aktivira.')) return;
    try { await adminRequest(`/api/dossier/consents/${id}/revoke`, getToken(), { method: 'PATCH' }); await load(playerId); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const cardStyle = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' };
  const now = new Date();

  const docsForType = (typeId: string) => (dossier?.documents || []).filter(d => d.typeId === typeId);
  const activeConsent = (type: string) => (dossier?.consents || []).find(c => c.type === type && !c.revokedAt);

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dosijei igračica</h1>

      <select value={playerId} onChange={e => setPlayerId(e.target.value)} style={inputStyle} className="px-4 py-2 rounded-lg outline-none mb-6">
        <option value="">— Izaberi igračicu —</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName} · {p.team.name}</option>)}
      </select>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {dossier && (
        <div className="flex flex-col gap-6">
          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">📄 Dokumenti</h2>
            <div className="flex flex-col gap-2 mb-4">
              {dossier.types.map(t => {
                const docs = docsForType(t.id);
                const latest = docs[0];
                const expired = latest?.expiresAt && new Date(latest.expiresAt) < now;
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-1.5 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-white text-sm">
                      {latest ? (expired ? '🔴' : '🟢') : t.isRequired ? '🟡' : '⚪'} {t.name}
                      {t.isRequired && !latest && <span className="text-xs" style={{ color: 'var(--text-muted)' }}> · obavezan, nije predat</span>}
                    </span>
                    {latest && (
                      <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        izdat {new Date(latest.issuedAt).toLocaleDateString('sr-Latn-ME')}
                        {latest.expiresAt && <> · {expired ? 'ISTEKAO' : 'važi do'} {new Date(latest.expiresAt).toLocaleDateString('sr-Latn-ME')}</>}
                        {latest.fileUrl && <a href={latest.fileUrl} target="_blank" style={{ color: 'var(--primary)' }}>fajl</a>}
                        <button onClick={() => deleteDocument(latest.id)} className="text-red-500 hover:text-red-400">obriši</button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select value={newDoc.typeId} onChange={e => setNewDoc({ ...newDoc, typeId: e.target.value })} style={inputStyle} className="px-3 py-1.5 rounded-lg text-sm outline-none">
                <option value="">— Tip —</option>
                {dossier.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="date" value={newDoc.issuedAt} onChange={e => setNewDoc({ ...newDoc, issuedAt: e.target.value })} style={inputStyle} className="px-3 py-1.5 rounded-lg text-sm outline-none" />
              <input placeholder="Link na fajl (opciono)" value={newDoc.fileUrl} onChange={e => setNewDoc({ ...newDoc, fileUrl: e.target.value })} style={inputStyle} className="px-3 py-1.5 rounded-lg text-sm outline-none flex-1 min-w-40" />
              <button onClick={addDocument} style={{ backgroundColor: 'var(--primary)' }} className="px-4 py-1.5 rounded-lg text-white text-sm font-bold">Dodaj</button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Rok važenja se računa automatski iz tipa dokumenta (npr. ljekarski 6 mjeseci).</p>
          </div>

          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">✍️ Saglasnosti</h2>
            <div className="flex flex-col gap-2">
              {(['media', 'data', 'travel'] as const).map(type => {
                const c = activeConsent(type);
                return (
                  <div key={type} className="flex items-center justify-between gap-3 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-white text-sm">{c ? '🟢' : '⚪'} {CONSENT_LABELS[type]}</span>
                    {c ? (
                      <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        potpisana {new Date(c.signedAt).toLocaleDateString('sr-Latn-ME')}
                        <button onClick={() => revokeConsent(c.id)} className="text-red-500 hover:text-red-400">povuci</button>
                      </span>
                    ) : (
                      <button onClick={() => signConsent(type)} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                        className="px-3 py-1 rounded-lg text-xs hover:text-white">Evidentiraj (papirna)</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle} className="rounded-xl p-5">
            <h2 className="text-white font-bold mb-3">🏥 Medicina i hitni kontakti</h2>
            {dossier.medical?.coachNote && <p className="text-sm text-white mb-1">Napomena za trenera: {dossier.medical.coachNote}</p>}
            {dossier.medical?.notes && <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Napomene: {dossier.medical.notes}</p>}
            {!dossier.medical && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Roditelj još nije unio medicinske podatke (unosi ih kroz aplikaciju).</p>}
            {dossier.contacts.length > 0 && (
              <ul className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                {dossier.contacts.map(c => <li key={c.id}>☎️ {c.name} ({c.relation || 'kontakt'}) — {c.phone}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
