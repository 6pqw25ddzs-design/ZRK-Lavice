import Link from 'next/link';
import { ArrowRight, Calendar, Users, Trophy, MapPin } from 'lucide-react';

const stats = [
  { num: '47', label: 'Aktivnih igračica' },
  { num: '3', label: 'Ekipe' },
  { num: '5', label: 'Trenera' },
  { num: '2022', label: 'Godina osnivanja' },
];

const teams = [
  {
    name: 'Mini Rukomet',
    age: 'Do 12 godina',
    emoji: '⭐',
    color: 'bg-red-50',
    href: '/ekipe/mini',
    players: ['Ana Nikolić', 'Maja Jovanović', 'Tamara Vukić', 'Jelena Petrović', 'Sara Đurović'],
  },
  {
    name: 'Pionirska liga',
    age: 'Gen. 2012/13',
    emoji: '🏅',
    color: 'bg-amber-50',
    href: '/ekipe/pioniri',
    players: ['Katarina Bošković', 'Sara Radonjić', 'Nikolina Petrović', 'Mila Vuković', 'Jovana Lazović'],
  },
  {
    name: 'Prva liga',
    age: 'Gen. 2010/11',
    emoji: '🏆',
    color: 'bg-red-50',
    href: '/ekipe/prva-liga',
    players: ['Milica Vuković', 'Jovana Đurović', 'Aleksandra Lazović', 'Bojana Nikolić', 'Tanja Marković'],
  },
];

const news = [
  { title: 'Lavice savladale Budućnost u prvenstvenoj utakmici', tag: 'Utakmica', date: '12. jun 2026.', bg: 'from-dark to-red-950' },
  { title: 'Ljetnji kamp za mlade rukometašice — prijave otvorene', tag: 'Kamp', date: '5. jun 2026.', bg: 'from-slate-900 to-emerald-950' },
  { title: 'Novi sponzor pojačava Lavice za narednu sezonu', tag: 'Novost', date: '28. maj 2026.', bg: 'from-dark to-amber-950' },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-dark min-h-[92vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="animate-fade-up">
            <span className="inline-block mb-6 text-xs font-bold tracking-widest text-gold border border-gold/30 bg-gold/10 px-4 py-1.5 rounded-full uppercase">
              📍 Podgorica, Crna Gora
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Razvijamo<br />
              <span className="text-primary">šampionke</span><br />
              budućnosti
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
              ZRK Lavice je ženski rukometni klub osnovan od strane olimpijskih medaljaša.
              Odgajamo sportski karakter, timski duh i pobjedničku mentalnost.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/registracija" className="btn-primary flex items-center gap-2">
                Registruj dijete <ArrowRight size={16} />
              </Link>
              <Link href="/o-klubu" className="btn-outline">
                Saznaj više
              </Link>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in">
            {stats.map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-7 text-center">
                <div className="font-display text-5xl font-extrabold text-primary mb-2">{s.num}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EKIPE ─── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="red-accent" />
        <h2 className="section-title">Naše ekipe</h2>
        <p className="text-gray-500 mb-12">Svaka igračica pronalazi svoju grupu prema godištu</p>

        <div className="grid md:grid-cols-3 gap-6">
          {teams.map(t => (
            <Link key={t.name} href={t.href} className="card p-0 overflow-hidden group">
              <div className={`${t.color} p-6 flex items-center gap-4`}>
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">{t.emoji}</div>
                <div>
                  <h3 className="font-bold text-dark text-lg">{t.name}</h3>
                  <p className="text-gray-500 text-sm">{t.age}</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {t.players.slice(0, 3).map((p, i) => (
                  <div key={p} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {p.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-dark">{p}</span>
                    </div>
                    <span className="text-primary font-bold text-sm">#{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                Vidi ekipu <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── PREDNOSTI ─── */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Users className="text-primary" size={36} />, title: 'Stručni treneri', desc: 'Olimpijski medaljaši i iskusni treneri s UEFA/EHF licencama' },
            { icon: <Calendar className="text-primary" size={36} />, title: 'Strukturisani program', desc: '3 treninga sedmično + utakmice u organizovanim ligama' },
            { icon: <Trophy className="text-primary" size={36} />, title: 'Razvoj karaktera', desc: 'Sport kao škola života — disciplina, timski rad, pobjednički duh' },
          ].map(f => (
            <div key={f.title} className="card p-8">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="font-bold text-xl text-dark mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── VIJESTI ─── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="red-accent" />
            <h2 className="section-title">Posljednje vijesti</h2>
          </div>
          <Link href="/vijesti" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Sve vijesti <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {news.map(n => (
            <div key={n.title} className="card overflow-hidden cursor-pointer group">
              <div className={`h-44 bg-gradient-to-br ${n.bg} flex items-end p-5`}>
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded">{n.tag}</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-dark text-base leading-snug mb-3 group-hover:text-primary transition-colors">{n.title}</h4>
                <p className="text-gray-400 text-xs">{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA REGISTRACIJA ─── */}
      <section className="bg-primary py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl font-extrabold text-white mb-4">
            Tvoja kći je naša sljedeća šampionka
          </h2>
          <p className="text-red-200 mb-8 text-lg">
            Prijavi dijete danas. Prijem je otvoren za sve uzraste od 7 do 12 godina.
          </p>
          <Link
            href="/registracija"
            className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-base inline-flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            Registruj dijete <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ─── LOKACIJA ─── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 rounded-2xl p-8">
          <MapPin className="text-primary flex-shrink-0" size={40} />
          <div>
            <h3 className="font-bold text-xl text-dark mb-1">Treniramo u SC Morača</h3>
            <p className="text-gray-500">Ulica Moskovska bb, Podgorica · Treninzi utorkom, četvrtkom i petkom</p>
          </div>
          <Link
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto btn-primary flex-shrink-0"
          >
            Otvori mapu
          </Link>
        </div>
      </section>
    </>
  );
}
