'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Member = { id: string; fullName: string; email: string; phone?: string; message?: string; status: string; createdAt: string };
const LABEL: Record<string, string> = { pending: 'Na čekanju', approved: 'Član', rejected: 'Odbijeno' };

export default function AdminClanoviPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');

  function getToken() { return localStorage.getItem('admin_token') || ''; }
  async function load() {
    try { setMembers(await adminRequest('/api/members', getToken())); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    try { await adminRequest(`/api/members/${id}`, getToken(), { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  async function del(id: string, name: string) {
    if (!confirm(`Obrisati pristupnicu (${name})?`)) return;
    try { await adminRequest(`/api/members/${id}`, getToken(), { method: 'DELETE' }); await load(); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  function exportCsv() {
    const rows = [['Ime i prezime', 'Email', 'Telefon', 'Status', 'Poruka', 'Datum'],
      ...members.map(m => [m.fullName, m.email, m.phone || '', LABEL[m.status] || m.status, m.message || '',
        new Date(m.createdAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `clanovi-kluba-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  const aktivnih = members.filter(m => m.status === 'approved').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white">Članovi kluba <span style={{ color: 'var(--text-muted)' }} className="text-base font-normal">· {aktivnih} aktivnih</span></h1>
        {members.length > 0 && (
          <button onClick={exportCsv} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            className="px-4 py-2 rounded-lg text-sm hover:text-white transition-colors">⬇️ Izvezi za Excel</button>
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex flex-col gap-3">
        {members.map(m => (
          <div key={m.id} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-white font-semibold">{m.fullName}
                  <span className="text-xs px-2 py-0.5 rounded-full ml-2"
                    style={{ backgroundColor: m.status === 'approved' ? '#166534' : m.status === 'rejected' ? '#7f1d1d' : 'var(--border)', color: 'white' }}>
                    {LABEL[m.status]}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{m.email}{m.phone ? ` · ${m.phone}` : ''}</div>
                {m.message && <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1 italic">„{m.message}"</p>}
                <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{new Date(m.createdAt).toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                {m.status !== 'approved' && <button onClick={() => setStatus(m.id, 'approved')} className="px-3 py-1 rounded-lg text-sm text-white" style={{ backgroundColor: '#166534' }}>Primi u članstvo</button>}
                {m.status !== 'rejected' && <button onClick={() => setStatus(m.id, 'rejected')} className="px-3 py-1 rounded-lg text-sm bg-red-900 text-white hover:bg-red-700">Odbij</button>}
                {m.status === 'rejected' && <button onClick={() => del(m.id, m.fullName)} style={{ border: '1px solid #7f1d1d', color: '#f87171' }} className="px-3 py-1 rounded-lg text-sm">Briši</button>}
              </div>
            </div>
          </div>
        ))}
        {members.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Još nema pristupnica — podijeli zrklavice.me/clanstvo.</p>}
      </div>
    </div>
  );
}
