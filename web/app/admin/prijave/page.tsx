'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Registration = {
  id: string; childName: string; birthYear: number;
  parentName: string; parentPhone: string; parentEmail: string;
  status: string; notes?: string; createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Na čekanju', approved: 'Prihvaćeno', rejected: 'Odbijeno',
};

export default function AdminPrijavePage() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const data = await adminRequest('/api/registrations', getToken());
      setRegs(data);
    } catch (e: any) {
      setError('Greška pri učitavanju: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, childName: string) {
    if (!confirm(`Trajno obrisati prijavu za "${childName}"?`)) return;
    try {
      await adminRequest(`/api/registrations/${id}`, getToken(), { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError('Greška pri brisanju: ' + (e?.message || ''));
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      await adminRequest(`/api/registrations/${id}`, getToken(), { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (e: any) {
      setError('Greška pri izmjeni: ' + (e?.message || ''));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Prijave za upis</h1>
      {error && <p style={{ color: 'var(--primary)' }} className="text-sm mb-4">{error}</p>}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Učitavanje...</p> : (
        <div className="flex flex-col gap-3">
          {regs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema prijava.</p>}
          {regs.map(r => (
            <div key={r.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              className="rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-white font-semibold">{r.childName} <span style={{ color: 'var(--text-muted)' }} className="font-normal">({r.birthYear})</span></div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
                    Roditelj: {r.parentName} · {r.parentPhone} · {r.parentEmail}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                    {new Date(r.createdAt).toLocaleString('sr-Latn-ME')}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: r.status === 'approved' ? '#166534' : r.status === 'rejected' ? '#7f1d1d' : 'var(--border)', color: 'white' }}>
                  {STATUS_LABEL[r.status] || r.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setStatus(r.id, 'approved')}
                  className="px-3 py-1 rounded-lg text-sm text-white" style={{ backgroundColor: '#166534' }}>
                  Prihvati
                </button>
                <button onClick={() => setStatus(r.id, 'pending')}
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  className="px-3 py-1 rounded-lg text-sm hover:text-white transition-colors">
                  Na čekanje
                </button>
                <button onClick={() => setStatus(r.id, 'rejected')}
                  className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700 transition-colors">
                  Odbij
                </button>
                {r.status === 'rejected' && (
                  <button onClick={() => handleDelete(r.id, r.childName)}
                    style={{ border: '1px solid #7f1d1d', color: '#f87171' }}
                    className="px-3 py-1 rounded-lg text-sm hover:bg-red-950 transition-colors ml-auto">
                    Briši trajno
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
