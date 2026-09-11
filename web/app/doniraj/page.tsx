'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PRESETS = [5, 10, 20, 50];

function DonirajForm() {
  const params = useSearchParams();
  const [amount, setAmount] = useState<number | ''>(10);
  const [purpose, setPurpose] = useState<'donacija' | 'clanarina'>('donacija');
  const card = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' } as const;
  const input = { backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'white' } as const;

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p style={{ color: 'var(--gold)' }} className="text-sm font-bold tracking-widest uppercase mb-3">Sigurno plaćanje karticom</p>
        <h1 className="text-4xl font-black text-white mb-4">Doniraj online</h1>
        <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed">
          Uplata ide direktno na račun kluba preko Monri WebPay sistema (CKB banka).
          Podaci o kartici se unose isključivo na zaštićenoj stranici banke.
        </p>
      </div>

      {params.get('greska') && (
        <p className="text-red-500 text-center mb-6">Nešto nije u redu sa unosom — provjeri iznos, ime i email.</p>
      )}

      <form method="POST" action="/api/monri/start" style={card} className="rounded-2xl p-7 flex flex-col gap-5">
        {/* Svrha */}
        <div className="grid grid-cols-2 gap-2">
          {([['donacija', 'Donacija'], ['clanarina', 'Članarina']] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setPurpose(v)}
              className="py-2.5 rounded-xl font-bold text-sm transition-colors"
              style={purpose === v
                ? { backgroundColor: 'var(--primary)', color: 'white' }
                : { border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              {l}
            </button>
          ))}
        </div>
        <input type="hidden" name="purpose" value={purpose} />

        {/* Iznos */}
        <div>
          <label style={{ color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider font-bold">Iznos (€)</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {PRESETS.map(v => (
              <button key={v} type="button" onClick={() => setAmount(v)}
                className="py-2.5 rounded-xl font-black transition-colors"
                style={amount === v
                  ? { backgroundColor: 'var(--gold)', color: '#1A1A1A' }
                  : { border: '1px solid var(--border)', color: 'white' }}>
                {v}€
              </button>
            ))}
          </div>
          <input type="number" name="amount" min={1} max={10000} step="0.01" required
            value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Drugi iznos"
            style={input} className="w-full mt-2 px-4 py-3 rounded-xl outline-none" />
        </div>

        <input name="name" required placeholder="Ime i prezime" style={input} className="px-4 py-3 rounded-xl outline-none" />
        <input name="email" type="email" required placeholder="Email (za potvrdu uplate)" style={input} className="px-4 py-3 rounded-xl outline-none" />

        <button type="submit" style={{ backgroundColor: 'var(--primary)' }}
          className="py-3.5 rounded-full text-white font-black text-lg hover:brightness-110 transition-all">
          Nastavi na plaćanje →
        </button>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs text-center leading-relaxed">
          Klikom prihvataš <a href="/uslovi" className="underline">uslove korišćenja i politiku refundacije</a>.<br />
          ŽRK Lavice-UDG · Trg Božane Vučinić 34, Podgorica · info@zrklavice.me
        </p>
      </form>
    </div>
  );
}

export default function DonirajPage() {
  return <Suspense><DonirajForm /></Suspense>;
}
