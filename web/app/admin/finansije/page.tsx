'use client';
import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/auth';

type Entry = {
  id: string; kind: 'income' | 'expense'; category: string; amountEur: number;
  date: string; description?: string; receiptUrl?: string; createdBy: string;
};
type Summary = { income: number; expense: number; feesIncome: number; feesCount: number; totalIncome: number; balance: number };
type MonthSum = { month: number; income: number; expense: number };

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
const CATS: Record<string, string[]> = {
  income: ['Donacija', 'Sponzorstvo', 'Kotizacija', 'Ostali prihod'],
  expense: ['Dvorana', 'Oprema', 'Putovanja', 'Sudije i kotizacije', 'Administrativno', 'Ostali rashod'],
};

export default function AdminFinansijePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sum, setSum] = useState<Summary | null>(null);
  const [yearly, setYearly] = useState<MonthSum[]>([]);
  const [form, setForm] = useState({ kind: 'expense', category: 'Dvorana', amountEur: '', date: '', description: '', receiptUrl: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function getToken() { return localStorage.getItem('admin_token') || ''; }

  async function load() {
    try {
      const [d, y] = await Promise.all([
        adminRequest(`/api/finance?year=${year}&month=${month}`, getToken()),
        adminRequest(`/api/finance/summary?year=${year}`, getToken()),
      ]);
      setEntries(d.entries); setSum(d.summary); setYearly(y); setError('');
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }
  useEffect(() => { load(); }, [year, month]);

  async function save() {
    if (!form.amountEur || !form.date) { setError('Unesite iznos i datum'); return; }
    setSaving(true); setError('');
    try {
      await adminRequest('/api/finance', getToken(), {
        method: 'POST',
        body: JSON.stringify({ ...form, amountEur: Number(form.amountEur), date: new Date(form.date).toISOString() }),
      });
      setForm(f => ({ ...f, amountEur: '', description: '', receiptUrl: '' }));
      await load();
    } catch (e: any) { setError('Greška: ' + (e?.message || '')); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm('Obrisati stavku?')) return;
    try { await adminRequest(`/api/finance/${id}`, getToken(), { method: 'DELETE' }); await load(); }
    catch (e: any) { setError('Greška: ' + (e?.message || '')); }
  }

  function exportCsv() {
    const rows = [
      ['Datum', 'Tip', 'Kategorija', 'Iznos (EUR)', 'Opis', 'Račun (link)', 'Unio'],
      ...(sum && sum.feesIncome > 0 ? [[`${MONTHS[month - 1]} ${year}`, 'Prihod', 'Članarine (naplaćeno)', String(sum.feesIncome), `${sum.feesCount} uplata`, '', 'automatski']] : []),
      ...entries.map(e => [
        new Date(e.date).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' }),
        e.kind === 'income' ? 'Prihod' : 'Rashod', e.category, String(e.amountEur),
        e.description || '', e.receiptUrl || '', e.createdBy,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finansije-${year}-${String(month).padStart(2, '0')}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  }

  const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'white' };
  const cardStyle = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' };
  const maxBar = Math.max(1, ...yearly.flatMap(m => [m.income, m.expense]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white">Finansije</h1>
        <button onClick={exportCsv} style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          className="px-4 py-2 rounded-lg text-sm hover:text-white transition-colors">
          ⬇️ Izvezi za knjigovođu ({MONTHS[month - 1].toLowerCase()})
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={inputStyle} className="px-4 py-2 rounded-lg outline-none">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {sum && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { l: 'Prihodi ukupno', v: sum.totalIncome, c: '#16a34a' },
            { l: `— od toga članarine (${sum.feesCount})`, v: sum.feesIncome, c: '#16a34a' },
            { l: 'Rashodi', v: sum.expense, c: '#dc2626' },
            { l: 'Saldo mjeseca', v: sum.balance, c: sum.balance >= 0 ? '#16a34a' : '#dc2626' },
            { l: '💰 Stanje računa (ukupno)', v: sum.totalBalance ?? 0, c: 'var(--gold)' },
          ].map(x => (
            <div key={x.l} style={cardStyle} className="rounded-xl p-4">
              <div className="text-2xl font-black" style={{ color: x.c }}>{x.v.toFixed(2)}€</div>
              <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{x.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Godišnji mini-grafikon */}
      <div style={cardStyle} className="rounded-xl p-4 mb-8">
        <div style={{ color: 'var(--text-muted)' }} className="text-xs mb-3 uppercase tracking-wide">Kretanje kroz {year}. (zeleno prihodi · crveno rashodi)</div>
        <div className="flex items-end gap-2 h-24">
          {yearly.map(m => (
            <div key={m.month} className="flex-1 flex items-end gap-0.5" title={`${MONTHS[m.month - 1]}: +${m.income}€ / -${m.expense}€`}>
              <div className="flex-1 rounded-t" style={{ height: `${(m.income / maxBar) * 100}%`, backgroundColor: '#16a34a', minHeight: m.income > 0 ? 3 : 0 }} />
              <div className="flex-1 rounded-t" style={{ height: `${(m.expense / maxBar) * 100}%`, backgroundColor: '#dc2626', minHeight: m.expense > 0 ? 3 : 0 }} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          {MONTHS.map((m, i) => (
            <div key={m} className="flex-1 text-center text-[10px]" style={{ color: i + 1 === month ? 'var(--primary)' : 'var(--text-muted)' }}>{m.slice(0, 3)}</div>
          ))}
        </div>
      </div>

      {/* Nova stavka */}
      <div style={cardStyle} className="rounded-xl p-5 mb-8">
        <h2 className="text-white font-bold mb-4">Nova stavka</h2>
        <div className="flex flex-wrap gap-3">
          <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value, category: CATS[e.target.value][0] }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
            <option value="expense">Rashod</option>
            <option value="income">Prihod</option>
          </select>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none">
            {CATS[form.kind].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" min="0" step="0.01" placeholder="Iznos €" value={form.amountEur}
            onChange={e => setForm(f => ({ ...f, amountEur: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm w-28 outline-none" />
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm outline-none" />
          <input placeholder="Opis (npr. Hotel Ženeva Lux — Kragujevac)" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm flex-1 min-w-48 outline-none" />
          <input placeholder="Link na račun/sliku (opciono)" value={form.receiptUrl}
            onChange={e => setForm(f => ({ ...f, receiptUrl: e.target.value }))}
            style={inputStyle} className="px-3 py-2 rounded-lg text-sm flex-1 min-w-40 outline-none" />
          <button onClick={save} disabled={saving} style={{ backgroundColor: 'var(--primary)' }}
            className="px-5 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-50">
            {saving ? 'Čuvam...' : 'Dodaj'}
          </button>
        </div>
      </div>

      {/* Stavke mjeseca */}
      <div className="flex flex-col gap-2">
        {sum && sum.feesIncome > 0 && (
          <div style={{ ...cardStyle, borderLeft: '3px solid #16a34a' }} className="rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <span className="text-white text-sm font-semibold">Članarine (naplaćeno u mjesecu)</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs ml-2">automatski · {sum.feesCount} uplata · vidi sekciju Članarine</span>
            </div>
            <span className="font-black" style={{ color: '#16a34a' }}>+{sum.feesIncome.toFixed(2)}€</span>
          </div>
        )}
        {entries.map(e => (
          <div key={e.id} style={{ ...cardStyle, borderLeft: `3px solid ${e.kind === 'income' ? '#16a34a' : '#dc2626'}` }}
            className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <span className="text-white text-sm font-semibold">{e.category}</span>
              {e.description && <span style={{ color: 'var(--text-muted)' }} className="text-sm"> — {e.description}</span>}
              <div style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">
                {new Date(e.date).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })} · {e.createdBy}
                {e.receiptUrl && <> · <a href={e.receiptUrl} target="_blank" style={{ color: 'var(--primary)' }}>račun</a></>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-black" style={{ color: e.kind === 'income' ? '#16a34a' : '#dc2626' }}>
                {e.kind === 'income' ? '+' : '−'}{e.amountEur.toFixed(2)}€
              </span>
              <button onClick={() => del(e.id)} className="text-xs text-red-500 hover:text-red-400">obriši</button>
            </div>
          </div>
        ))}
        {entries.length === 0 && (!sum || sum.feesIncome === 0) && (
          <p style={{ color: 'var(--text-muted)' }}>Nema stavki za {MONTHS[month - 1].toLowerCase()} {year}.</p>
        )}
      </div>
    </div>
  );
}
