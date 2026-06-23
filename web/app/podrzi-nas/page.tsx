export default function PodržiNasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <p style={{ color: 'var(--gold)' }} className="text-sm font-bold tracking-widest uppercase mb-4">Budite dio priče</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
          Podržite<br />
          <span style={{ color: 'var(--primary)' }}>ŽRK Lavice</span>
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
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-2xl p-8 mb-8">
        <h2 className="text-white font-black text-2xl mb-6">Podaci za uplatu</h2>

        <div className="flex flex-col gap-4">
          {[
            { label: 'Naziv primaoca', value: 'ŽRK Lavice' },
            { label: 'IBAN', value: 'Uskoro dostupno' },
            { label: 'BIC / SWIFT', value: 'Uskoro dostupno' },
            { label: 'Banka', value: 'Uskoro dostupno' },
            { label: 'Svrha uplate', value: 'Donacija — ŽRK Lavice' },
          ].map(r => (
            <div key={r.label} style={{ borderBottom: '1px solid var(--border)' }} className="flex justify-between items-center pb-4 last:border-0 last:pb-0">
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">{r.label}</span>
              <span className={`font-semibold ${r.value === 'Uskoro dostupno' ? 'text-gray-600 italic text-sm' : 'text-white'}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Napomena */}
      <div style={{ border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)' }} className="rounded-xl p-5">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
          Sve donacije se koriste isključivo za potrebe kluba i razvoj igračica.
          Za više informacija ili sponzorstvo možete nas kontaktirati na{' '}
          <a href="mailto:info@zrklavice.me" style={{ color: 'var(--primary)' }} className="hover:underline">
            info@zrklavice.me
          </a>.
        </p>
      </div>
    </div>
  );
}
