import { getSettings } from '@/lib/api';

export const revalidate = 60;
export const metadata = {
  title: 'Podrži klub — ŽRK Lavice-UDG',
  description: 'Donacije i sponzorski pool ŽRK Lavice-UDG — podržite razvoj mladih rukometašica u Podgorici.',
};

const POOL = [
  {
    nivo: 'Zlatni sponzor', boja: '#D4AC0D',
    stavke: ['Logo na dresovima i sajtu', 'Generalni sponzor u aplikaciji i na sajtu', 'Reklama u dvorani na utakmicama', 'Objave na klupskim mrežama'],
  },
  {
    nivo: 'Srebrni sponzor', boja: '#9ca3af',
    stavke: ['Logo na sajtu i u aplikaciji', 'Reklama u dvorani', 'Pominjanje u klupskim objavama'],
  },
  {
    nivo: 'Bronzani sponzor / donator', boja: '#b45309',
    stavke: ['Logo na sajtu', 'Zahvalnica kluba', 'Poziv na klupske događaje'],
  },
];

export default async function PodrziNasPage() {
  const settings: Record<string, string> = await getSettings().catch(() => ({}));
  const uplata = [
    { label: 'Naziv primaoca', value: settings.donation_recipient || 'ŽRK Lavice-UDG' },
    { label: 'Žiro račun / IBAN', value: settings.donation_iban || 'Uskoro dostupno' },
    { label: 'Banka', value: settings.donation_bank || 'Uskoro dostupno' },
    { label: 'Svrha uplate', value: 'Donacija — ŽRK Lavice-UDG' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <p style={{ color: 'var(--gold)' }} className="text-sm font-bold tracking-widest uppercase mb-4">Budite dio priče</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
          Podržite<br />
          <span style={{ color: 'var(--primary)' }}>ŽRK Lavice-UDG</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="text-lg leading-relaxed max-w-xl mx-auto">
          Svaka uplata direktno pomaže razvoju mladih rukometašica u Podgorici —
          od opreme i dvorana do putnih troškova na takmičenjima.
        </p>
      </div>

      {/* Zašto podržati */}
      <div className="grid md:grid-cols-3 gap-4 mb-16">
        {[
          { icon: '🏐', title: 'Oprema', desc: 'Lopte, dresovi, štitnici i ostala oprema za treninge i utakmice.' },
          { icon: '🚌', title: 'Takmičenja', desc: 'Prevoz i smještaj za djevojčice koje nastupaju širom Crne Gore.' },
          { icon: '🏟️', title: 'Dvorane', desc: 'Iznajmljivanje prostora za treninge i razvoj kluba.' },
        ].map(s => (
          <div key={s.title} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="text-white font-bold mb-2">{s.title}</div>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Uplata */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-2xl p-8 mb-16">
        <h2 className="text-white font-black text-2xl mb-6">Direktna donacija</h2>
        <div className="flex flex-col gap-4">
          {uplata.map(r => (
            <div key={r.label} style={{ borderBottom: '1px solid var(--border)' }} className="flex justify-between items-center gap-4 pb-4 last:border-0 last:pb-0 flex-wrap">
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">{r.label}</span>
              <span className={`font-semibold ${r.value === 'Uskoro dostupno' ? 'text-gray-600 italic text-sm' : 'text-white'}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sponzorski pool */}
      <div className="mb-8">
        <h2 className="text-white font-black text-2xl mb-2 text-center">Pridružite se sponzorskom poolu</h2>
        <p style={{ color: 'var(--text-muted)' }} className="text-center mb-8 max-w-xl mx-auto">
          Za kompanije koje žele dugoročno partnerstvo sa klubom — uz vidljivost na dresovima, sajtu, aplikaciji i utakmicama.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {POOL.map(p => (
            <div key={p.nivo} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderTop: `3px solid ${p.boja}` }}
              className="rounded-xl p-6">
              <div className="font-black text-lg mb-4" style={{ color: p.boja }}>{p.nivo}</div>
              <ul className="flex flex-col gap-2">
                {p.stavke.map(s => (
                  <li key={s} style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed flex gap-2">
                    <span style={{ color: 'var(--primary)' }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="mailto:info@zrklavice.me?subject=Sponzorstvo%20%C5%BDRK%20Lavice-UDG"
            style={{ backgroundColor: 'var(--primary)' }}
            className="inline-block px-8 py-3 rounded-full text-white font-bold hover:opacity-90 transition-opacity">
            Postanite sponzor →
          </a>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-3">info@zrklavice.me · odgovaramo u roku od 24h</p>
        </div>
      </div>

      {/* Napomena */}
      <div style={{ border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)' }} className="rounded-xl p-5">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
          Sve donacije se koriste isključivo za potrebe kluba i razvoj igračica.
        </p>
      </div>
    </div>
  );
}
