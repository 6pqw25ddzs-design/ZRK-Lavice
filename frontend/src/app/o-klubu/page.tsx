export const dynamic = 'force-dynamic';

export default function OKlubuPage() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">O <span className="text-[#C41230]">Klubu</span></h1>
        <p className="text-gray-400 mb-12">Historija i misija ZRK Lavice</p>

        <div className="space-y-12">
          <div className="bg-[#2A2A2A] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[#D4AC0D] mb-4">Naša Priča</h2>
            <p className="text-gray-300 leading-relaxed">
              ZRK Lavice je ženski rukometni klub osnovan 2026. godine od strane evropskih šampionki i osvajačica jedine olimpijske medalje za Crnu Goru.
              Klub je osnovan sa ciljem razvoja ženskog rukometa u Crnoj Gori i pružanja kvalitetnog
              sportskog obrazovanja mladim igračicama iz Podgorice i okoline.
            </p>
          </div>

          <div className="bg-[#2A2A2A] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[#D4AC0D] mb-4">Misija i Vizija</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Naša misija je razvoj šampionki budućnosti — ne samo na terenu, već i kao osoba.
              Odgajamo sportski karakter, timski duh i pobjednički mentalitet.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Vizija kluba je postati vodeći ženski rukometni klub u Crnoj Gori i regionu,
              sa igračicama koje dostižu nacionalni i međunarodni nivo takmičenja.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏆', title: 'Osnovan', value: '2026.' },
              { icon: '👧', title: 'Igračice', value: '47+' },
              { icon: '🏅', title: 'Ekipe', value: '3' },
            ].map(item => (
              <div key={item.title} className="bg-[#2A2A2A] rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className="text-3xl font-bold text-[#C41230] mb-1">{item.value}</p>
                <p className="text-gray-400">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
