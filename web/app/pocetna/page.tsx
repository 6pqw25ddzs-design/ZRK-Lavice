import Image from 'next/image';
import PremiumHeader from '@/components/PremiumHeader';
import UpisForm from '@/components/UpisForm';
import Link from 'next/link';
import { getSponsors, getSettings, getTeams, getPlayers, getSchedule, getNews, getTreneri } from '@/lib/api';

export const revalidate = 60;
export const metadata = {
  title: 'ŽRK Lavice Podgorica — Stvaramo nove lavice',
  description: 'Razvojni ženski rukometni klub za djevojčice u Podgorici, osnovan od strane evropskih šampionki i olimpijskih medaljistkinja.',
};

const BASE = 'https://zrklavice.me/osnivaci';

const OSNIVACI = [
  { ime: 'Milena Raičević', uloga: 'Osnivačica i predsjednica', foto: `${BASE}/milena.JPG`,
    bio: 'Jedna od najvećih rukometašica u istoriji Crne Gore i jedna od najprepoznatljivijih ličnosti našeg sporta.',
    ref: 'Srebro OI London 2012 · Zlato EP 2012 · 2× Liga šampiona' },
  { ime: 'Radmila Petrović', uloga: 'Osnivačica i direktorica', foto: `${BASE}/radmila.JPG`,
    bio: 'Generacija koja je ispisala najljepše stranice crnogorskog rukometa, sa iskustvom sa najvećih takmičenja.',
    ref: 'Srebro OI London 2012 · Zlato EP 2012 · Liga šampiona' },
  { ime: 'Anđela Bulatović', uloga: 'Osnivačica i trenerica', foto: `${BASE}/andjela.JPG`,
    bio: 'Istinska legenda crnogorskog rukometa, osvajačica najprestižnijih evropskih trofeja.',
    ref: 'Srebro OI London 2012 · Zlato EP 2012 · Liga šampiona' },
  { ime: 'Sonja Barjaktarović', uloga: 'Osnivačica i trenerica', foto: `${BASE}/sonja.jpg`,
    bio: 'Jedna od najuspješnijih golmanki u istoriji crnogorskog rukometa i sinonim za pobjednički karakter.',
    ref: 'Srebro OI London 2012 · Zlato EP 2012 · Liga šampiona' },
  { ime: 'Igor Marković', uloga: 'Osnivač i trener', foto: `${BASE}/igor.jpg`,
    bio: 'Nekadašnji reprezentativac Crne Gore, sa bogatim iskustvom sa evropskih i svjetskih prvenstava.',
    ref: 'Reprezentativac Crne Gore · EP i SP učesnik' },
];

const VRIJEDNOSTI = [
  { naslov: 'Snaga', tekst: 'Gradimo fizičku i mentalnu snagu kroz posvećen, stručno vođen rad.', ikona: 'M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z' },
  { naslov: 'Karakter', tekst: 'Sport kao škola života — disciplina, upornost i poštovanje prema sebi i drugima.', ikona: 'M12 2a5 5 0 015 5c0 2-1 3.5-2.5 4.5L14 21h-4l-.5-9.5C8 10.5 7 9 7 7a5 5 0 015-5z' },
  { naslov: 'Tim', tekst: 'Djevojčice odrastaju u zajednici koja podržava, ohrabruje i slavi zajedno.', ikona: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H2v-2a4 4 0 013-3.87m6-1a4 4 0 100-8 4 4 0 000 8z' },
  { naslov: 'Poštovanje', tekst: 'Fer-plej, poštovanje protivnika, saigračica i pravila — na terenu i van njega.', ikona: 'M12 21C7 17 3 13.5 3 9a4 4 0 017-2.6A4 4 0 0121 9c0 4.5-4 8-9 12z' },
];

const PROGRAMI = [
  { naslov: 'Mini rukomet', uzrast: 'Do 9 godina', cilj: 'Prvi susret sa rukometom kroz igru, pokret i zabavu.', treninzi: '3 treninga sedmično' },
  { naslov: 'Pionirska selekcija', uzrast: '10–13 godina', cilj: 'Usvajanje tehnike i osnova takmičarskog rukometa.', treninzi: '4 treninga sedmično' },
  { naslov: 'Razvojna takmičarska ekipa', uzrast: '14+ godina', cilj: 'Takmičenja u organizovanim ligama i ozbiljan sportski razvoj.', treninzi: '5 treninga sedmično' },
  { naslov: 'Lavice kampovi', uzrast: 'Svi uzrasti', cilj: 'Ljetnji i praznični kampovi — rukomet, druženje i nova prijateljstva.', treninzi: 'Sezonski' },
];

const RODITELJI = [
  { t: 'Sigurno okruženje', d: 'Bezbjednost djece nam je apsolutni prioritet — od dvorane do svakog treninga.' },
  { t: 'Stručan rad', d: 'Treneri sa vrhunskim igračkim iskustvom i licencama za rad sa mladima.' },
  { t: 'Otvorena komunikacija', d: 'Redovno vas obavještavamo o napretku, terminima i aktivnostima kluba.' },
  { t: 'Jasni termini', d: 'Treninzi po utvrđenom rasporedu, prilagođeni školskim obavezama.' },
  { t: 'Transparentna članarina', d: 'Bez skrivenih troškova — sve informacije dobijate unaprijed.' },
  { t: 'Probni trening', d: 'Prvi trening je besplatan — dođite, upoznajte klub i trenere bez obaveza.' },
];

function GoldLine() {
  return <div className="h-[3px] w-14 rounded-full" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />;
}

export default async function PocetnaPage() {
  const [sponsors, settings, teams, players, schedule, news, treneri] = await Promise.all([
    getSponsors().catch(() => []),
    getSettings().catch(() => ({} as Record<string, string>)),
    getTeams().catch(() => []),
    getPlayers().catch(() => []),
    getSchedule().catch(() => []),
    getNews(4).catch(() => []),
    getTreneri().catch(() => []),
  ]);
  const upcoming = (Array.isArray(schedule) ? schedule : []).slice(0, 5);

  // Statistika iz baze (2026 = godina osnivanja, fiksno)
  const brojIgracica = Array.isArray(players) ? players.length : 0;
  const brojEkipa = Array.isArray(teams) ? teams.length : 0;
  const brojTrenera = (Array.isArray(treneri) && treneri.length > 0)
    ? treneri.length
    : (Array.isArray(teams)
        ? new Set(teams.flatMap((t: any) => (t.coaches || []).map((c: any) => c.userId || c.id))).size
        : 0);
  const email = settings.contact_email || 'info@zrklavice.me';
  const phone = settings.contact_phone || '+382 67 000 000';
  const address = settings.contact_address || 'SC Morača, Podgorica, Crna Gora';

  return (
    <div id="top" style={{ backgroundColor: '#FFFFFF' }}>
      <PremiumHeader />

      {/* HERO — emocionalni centar (full-width fotografija) */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#141414' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.jpg"
          alt="ŽRK Lavice — slavlje nakon gola"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 18%' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(13,13,13,0.97) 0%, rgba(18,18,18,0.62) 42%, rgba(26,26,26,0.30) 75%, rgba(26,26,26,0.45) 100%)',
        }} />
        <div className="relative max-w-6xl mx-auto px-5 min-h-[86vh] flex items-end">
          <div className="pb-32 md:pb-36 pt-40 max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-6 h-px" style={{ backgroundColor: '#D4AC0D' }} />
              <span className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AC0D' }}>Podgorica, Crna Gora</span>
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-black text-white leading-[0.92] tracking-tight">
              Stvaramo<br />nove <span style={{ color: '#E8546F' }}>lavice.</span>
            </h1>
            <p className="mt-7 text-xl md:text-2xl leading-snug max-w-lg font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Razvojni rukometni klub za djevojčice koji vode evropske šampionke i olimpijske medaljistkinje.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#upis" style={{ backgroundColor: '#C41230' }}
                className="px-8 py-4 rounded-full text-white font-bold hover:brightness-110 transition-all shadow-xl shadow-red-900/40">
                Upiši dijete
              </a>
              <a href="#upis" style={{ border: '1.5px solid rgba(255,255,255,0.55)', color: '#fff' }}
                className="px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">
                Probni trening
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIKA — lebdeće premium kartice */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 -mt-16 md:-mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: String(brojIgracica || '—'), label: 'Igračica', ikona: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H2v-2a4 4 0 013-3.87m6-1a4 4 0 100-8 4 4 0 000 8z' },
            { num: String(brojEkipa || '—'), label: 'Ekipe', ikona: 'M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z' },
            { num: String(brojTrenera || '—'), label: 'Trenera', ikona: 'M8 21l4-7 4 7M12 3a5 5 0 015 5c0 3-2.2 5.4-5 6-2.8-.6-5-3-5-6a5 5 0 015-5z' },
            { num: '2026', label: 'Osnovano', ikona: 'M5 21V4h11l-1.5 3.5L16 11H7' },
          ].map(st => (
            <div key={st.label} className="rounded-2xl bg-white px-6 py-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              style={{ boxShadow: '0 18px 44px rgba(0,0,0,0.10)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(196,18,48,0.08)' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#C41230" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={st.ikona} />
                </svg>
              </div>
              <div className="text-3xl font-black" style={{ color: '#1A1A1A' }}>{st.num}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: '#8a8a8a' }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* O KLUBU + VRIJEDNOSTI */}
      <section id="o-klubu" className="py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-2xl">
            <GoldLine />
            <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>
              Više od kluba — zajednica koja gradi šampionke
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>
              ŽRK Lavice je razvojni ženski rukometni klub nastao iz ljubavi prema rukometu i uvjerenja da nove generacije
              djevojčica zaslužuju kvalitetno, zdravo i podsticajno okruženje. Kroz sport gradimo ne samo igračke sposobnosti,
              već i vrijednosti koje djevojčice nose kroz cijeli život.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VRIJEDNOSTI.map(v => (
              <div key={v.naslov} className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 bg-white"
                style={{ border: '1px solid #EDEDED' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: '#FBEEF0', border: '1px solid #F5DADF' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C41230" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={v.ikona} />
                  </svg>
                </div>
                <h3 className="text-lg font-black mb-2 tracking-tight" style={{ color: '#1A1A1A' }}>{v.naslov}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6a6a6a' }}>{v.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMI */}
      <section id="programi" className="py-20 md:py-28" style={{ backgroundColor: '#F2F2F2' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-2xl">
            <GoldLine />
            <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Programi kluba</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>
              Svaka djevojčica pronalazi svoje mjesto — od prvih koraka sa loptom do takmičarskog rukometa.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROGRAMI.map(p => (
              <div key={p.naslov} className="group relative rounded-2xl bg-white p-7 flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #EDEDED', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span aria-hidden className="absolute top-0 left-7 right-7 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#B8940B' }}>{p.uzrast}</span>
                <h3 className="text-xl font-black mb-3 leading-tight" style={{ color: '#1A1A1A' }}>{p.naslov}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#6a6a6a' }}>{p.cilj}</p>
                <div className="mt-auto pt-5" style={{ borderTop: '1px solid #F0F0F0' }}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" /></svg>
                    <span className="text-xs font-semibold" style={{ color: '#8a8a8a' }}>{p.treninzi}</span>
                  </div>
                  <a href="#upis" className="text-sm font-bold inline-flex items-center gap-1 group/link" style={{ color: '#C41230' }}>
                    Prijavi se za probni trening
                    <span className="transition-transform group-hover/link:translate-x-0.5">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE / TRANSITION */}
      <section style={{ backgroundColor: '#FFFFFF' }} className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="text-5xl leading-none mb-4" style={{ color: '#D4AC0D', fontFamily: 'Georgia, serif' }}>“</div>
          <p className="text-2xl md:text-3xl font-black leading-snug tracking-tight" style={{ color: '#1A1A1A' }}>
            Ne stvaramo samo rukometašice — stvaramo <span style={{ color: '#C41230' }}>snažne, samouvjerene djevojke</span> koje znaju svoju vrijednost.
          </p>
          <div className="mt-6 mx-auto h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />
        </div>
      </section>

      {/* EKIPE */}
      {teams.length > 0 && (
        <section id="ekipe" className="py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="max-w-2xl">
              <GoldLine />
              <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Naše ekipe</h2>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>
                Svaka igračica pronalazi svoju generaciju i svoje mjesto u timu.
              </p>
            </div>

            <div className="mt-14 flex flex-col gap-10">
              {teams.map((team: any) => {
                const tp = (players as any[]).filter(p => p.teamId === team.id);
                if (tp.length === 0) return null;
                return (
                  <div key={team.id}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-1 h-6 rounded-full" style={{ backgroundColor: '#C41230' }} />
                      <h3 className="text-xl font-black" style={{ color: '#1A1A1A' }}>{team.name}</h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F2F2F2', color: '#8a8a8a' }}>{tp.length} igračica</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {tp.map((p: any) => (
                        <Link key={p.id} href={`/igrac/${p.id}`}
                          className="rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5"
                          style={{ backgroundColor: '#F7F7F7', border: '1px solid #ECECEC' }}>
                          {p.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} className="w-14 h-14 rounded-full mx-auto mb-2.5 object-cover" style={{ border: '2px solid #C41230' }} />
                          ) : (
                            <div className="w-14 h-14 rounded-full mx-auto mb-2.5 flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg, #C41230, #9F0F28)' }}>
                              {p.jerseyNumber ?? (p.firstName?.charAt(0) ?? '?')}
                            </div>
                          )}
                          <div className="text-sm font-bold leading-tight" style={{ color: '#1A1A1A' }}>{p.firstName} {p.lastName}</div>
                          {p.position && <div className="text-xs mt-0.5" style={{ color: '#9a9a9a' }}>{p.position}</div>}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* RASPORED */}
      {upcoming.length > 0 && (
        <section id="raspored" className="py-20 md:py-28" style={{ backgroundColor: '#F2F2F2' }}>
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-2xl">
              <GoldLine />
              <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Raspored treninga i utakmica</h2>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>Naredni termini kluba.</p>
            </div>
            <div className="mt-12">
              {upcoming.map((e: any, i: number) => {
                const d = new Date(e.startsAt);
                const isMatch = e.type === 'match';
                const accent = isMatch ? '#C41230' : '#D4AC0D';
                return (
                  <div key={e.id} className="flex gap-4 md:gap-6">
                    {/* Timeline kolona */}
                    <div className="flex flex-col items-center w-12 shrink-0">
                      <div className="text-2xl font-black leading-none" style={{ color: '#1A1A1A' }}>{d.getDate()}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#a0a0a0' }}>
                        {d.toLocaleDateString('sr-Latn-ME', { month: 'short' }).replace('.', '')}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full mt-2" style={{ backgroundColor: accent }} />
                      {i < upcoming.length - 1 && <span className="flex-1 w-px my-1" style={{ backgroundColor: '#E5E5E5' }} />}
                    </div>
                    {/* Kartica */}
                    <div className="flex-1 mb-4 rounded-2xl bg-white overflow-hidden flex" style={{ border: '1px solid #EEEEEE', boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
                      <span className="w-1 shrink-0" style={{ backgroundColor: accent }} />
                      <div className="p-4 md:p-5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-black" style={{ color: '#1A1A1A' }}>
                            {d.toLocaleTimeString('sr-Latn-ME', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: isMatch ? 'rgba(196,18,48,0.09)' : 'rgba(212,172,13,0.13)', color: isMatch ? '#C41230' : '#A8860B' }}>
                            {isMatch ? 'Utakmica' : 'Trening'}
                          </span>
                        </div>
                        <div className="font-bold mt-1.5" style={{ color: '#1A1A1A' }}>{e.title}</div>
                        <div className="text-sm mt-1" style={{ color: '#9a9a9a' }}>
                          {e.location}{e.location && e.team?.name ? ' · ' : ''}{e.team?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* VIJESTI */}
      {news.length > 0 && (
        <section id="vijesti" className="py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-12">
              <div className="max-w-2xl">
                <GoldLine />
                <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Vijesti</h2>
              </div>
              <Link href="/vijesti" className="text-sm font-bold shrink-0" style={{ color: '#C41230' }}>Sve vijesti →</Link>
            </div>
            {(() => {
              const [featured, ...rest] = news as any[];
              return (
                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
                  {/* Featured — hero vijest */}
                  <Link href={`/vijesti/${featured.slug}`}
                    className="relative rounded-3xl overflow-hidden group flex items-end min-h-[380px] md:min-h-[460px]"
                    style={{ backgroundColor: '#1A1A1A' }}>
                    {featured.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.coverUrl} alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2a0d14, #1A1A1A)' }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.35) 55%, transparent 100%)' }} />
                    <div className="relative p-7 md:p-9">
                      <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-white px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: '#C41230' }}>NAJNOVIJE</span>
                      <h3 className="text-2xl md:text-[2rem] font-black text-white leading-tight">{featured.title}</h3>
                      <div className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {new Date(featured.publishedAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>

                  {/* Editorial redovi */}
                  <div className="flex flex-col">
                    {rest.map((a: any, i: number) => (
                      <Link key={a.id} href={`/vijesti/${a.slug}`}
                        className="flex items-center gap-5 py-5 group"
                        style={{ borderBottom: i < rest.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                        <div className="flex-1 min-w-0">
                          {a.tags?.[0] && <div className="text-[10.5px] font-bold tracking-widest mb-1.5" style={{ color: '#C41230' }}>{String(a.tags[0]).toUpperCase()}</div>}
                          <h3 className="font-black leading-snug group-hover:underline" style={{ color: '#1A1A1A' }}>{a.title}</h3>
                          <div className="text-xs mt-2" style={{ color: '#9a9a9a' }}>{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'long' })}</div>
                        </div>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: '#F2F2F2' }}>
                          {a.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.coverUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🦁</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* OSNIVAČI */}
      <section id="osnivaci" className="py-20 md:py-28" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-6 h-px" style={{ backgroundColor: '#D4AC0D' }} />
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AC0D' }}>Champions legacy</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
              Klub koji vode one koje su<br className="hidden md:block" /> već <span style={{ color: '#C41230' }}>pokazale put.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Evropske šampionke i olimpijske medaljistkinje crnogorskog rukometa danas svoje znanje, iskustvo i vrijednosti prenose na najmlađe.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OSNIVACI.map(o => (
              <div key={o.ime} className="rounded-2xl overflow-hidden group"
                style={{ backgroundColor: '#222222', border: '1px solid #2e2e2e' }}>
                <div className="relative h-72 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.foto} alt={o.ime} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.9) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-black text-white leading-tight">{o.ime}</h3>
                    <p className="text-sm font-semibold" style={{ color: '#D4AC0D' }}>{o.uloga}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.72)' }}>{o.bio}</p>
                  <div className="flex items-start gap-2 pt-4" style={{ borderTop: '1px solid #2e2e2e' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AC0D" strokeWidth="1.8" className="mt-0.5 shrink-0"><circle cx="12" cy="8" r="5" /><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" /></svg>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.ref}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRUČNI TIM — treneri po kategorijama */}
      {treneri.length > 0 && (
        <section id="treneri" className="py-20 md:py-28" style={{ backgroundColor: '#F2F2F2' }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="max-w-2xl">
              <GoldLine />
              <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Stručni tim</h2>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>
                Treneri koji svakodnevno rade sa našim igračicama — po kategorijama.
              </p>
            </div>

            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(treneri as any[]).map(t => (
                <div key={t.id} className="rounded-2xl bg-white p-7 flex flex-col transition-transform hover:-translate-y-1"
                  style={{ border: '1px solid #E7E7E7', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-4 mb-4">
                    {t.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photoUrl} alt={t.fullName} className="w-16 h-16 rounded-full object-cover shrink-0" style={{ border: '2px solid #C41230' }} />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0"
                        style={{ background: 'linear-gradient(135deg, #C41230, #9F0F28)' }}>
                        {t.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-black leading-tight" style={{ color: '#1A1A1A' }}>{t.fullName}</h3>
                      <div className="text-sm font-semibold mt-0.5" style={{ color: '#C41230' }}>{t.role}</div>
                      {t.category && (
                        <span className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-full mt-1.5"
                          style={{ backgroundColor: 'rgba(212,172,13,0.13)', color: '#A8860B' }}>
                          {t.category}
                        </span>
                      )}
                    </div>
                  </div>
                  {t.bio && <p className="text-sm leading-relaxed" style={{ color: '#6a6a6a' }}>{t.bio}</p>}
                  {t.licenseNo && (
                    <div className="mt-auto pt-4 text-xs" style={{ color: '#9a9a9a' }}>
                      Licenca: {t.licenseNo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ZA RODITELJE */}
      <section id="roditelji" className="py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
          <div className="lg:sticky lg:top-28">
            <GoldLine />
            <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Za roditelje</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>
              Kada upišete dijete u ŽRK Lavice, postajete dio zajednice koja brine. Evo šta možete očekivati.
            </p>
            <a href="#upis" style={{ backgroundColor: '#C41230' }}
              className="inline-block mt-8 px-8 py-4 rounded-full text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-red-900/20">
              Zakaži probni trening
            </a>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {RODITELJI.map(r => (
              <div key={r.t} className="rounded-2xl p-6" style={{ backgroundColor: '#F7F7F7', border: '1px solid #ECECEC' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AC0D' }} />
                  <h3 className="font-black" style={{ color: '#1A1A1A' }}>{r.t}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#6a6a6a' }}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERI */}
      {sponsors.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#F2F2F2' }}>
          <div className="max-w-6xl mx-auto px-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8" style={{ color: '#8a8a8a' }}>Partneri i sponzori</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {sponsors.map((s: any) => (
                s.logoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img key={s.id} src={s.logoUrl} alt={s.name} className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  : <span key={s.id} className="font-black text-lg" style={{ color: '#1A1A1A' }}>{s.name}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UPIS / KONTAKT */}
      <section id="upis" className="py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1fr_0.85fr] gap-12 items-start">
          <div>
            <GoldLine />
            <h2 className="mt-5 text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>Upiši dijete</h2>
            <p className="mt-5 text-lg leading-relaxed mb-8" style={{ color: '#5b5b5b' }}>
              Popunite formu i naš tim će vas kontaktirati sa detaljima o probnom treningu i terminima. Prijem je otvoren za sve uzraste.
            </p>
            <div className="rounded-3xl p-7 md:p-9" style={{ backgroundColor: '#FBFBFB', border: '1px solid #ECECEC', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
              <UpisForm />
            </div>
          </div>

          <div id="kontakt" className="rounded-3xl p-8 h-full" style={{ background: 'linear-gradient(160deg, #1A1A1A, #211015)', border: '1px solid #2a2a2a' }}>
            <h3 className="text-xl font-black text-white mb-6">Kontakt</h3>
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AC0D' }}>Lokacija</div>
                <div className="text-white/85">{address}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AC0D' }}>Email</div>
                <a href={`mailto:${email}`} className="text-white/85 hover:text-white transition-colors">{email}</a>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AC0D' }}>Telefon</div>
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="text-white/85 hover:text-white transition-colors">{phone}</a>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AC0D' }}>Instagram</div>
                <a href="https://instagram.com/zrklavice" target="_blank" rel="noopener noreferrer" className="text-white/85 hover:text-white transition-colors">@zrklavice</a>
              </div>
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid #2a2a2a' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Za sva pitanja o upisu, treninzima i saradnji — javite nam se. Radujemo se novim lavicama! 🦁
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ZAVRŠNI CTA */}
      <section className="relative overflow-hidden" style={{ background: 'radial-gradient(120% 120% at 50% 0%, #9F0F28 0%, #C41230 40%, #1A1A1A 100%)' }}>
        <div aria-hidden className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px', opacity: 0.6,
        }} />
        <div className="relative max-w-3xl mx-auto px-5 py-24 md:py-28 text-center">
          <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#F5D67A' }}>Pridruži se</span>
          <h2 className="mt-5 text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Prvi trening može biti<br />početak velike priče.
          </h2>
          <p className="mt-6 text-lg md:text-xl font-light max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Dovedite svoju djevojčicu na besplatan probni trening. Bez obaveza — samo lopta, osmijeh i prvi korak.
          </p>
          <a href="#upis"
            className="inline-block mt-9 px-10 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: '#FFFFFF', color: '#C41230', boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}>
            Prijavi dijete
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#141414' }} className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10 pb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/logo.png" alt="ŽRK Lavice Podgorica" width={44} height={44} className="object-contain" />
                <span className="font-black text-lg text-white">ŽRK <span style={{ color: '#C41230' }}>Lavice</span></span>
              </div>
              <p className="text-2xl font-black text-white leading-tight max-w-xs">Stvaramo nove <span style={{ color: '#C41230' }}>lavice.</span></p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AC0D' }}>Brzi linkovi</div>
              <div className="flex flex-col gap-2.5">
                {[['#o-klubu', 'O klubu'], ['#programi', 'Programi'], ['#osnivaci', 'Osnivači'], ['#roditelji', 'Za roditelje'], ['#upis', 'Upis']].map(([h, l]) => (
                  <a key={h} href={h} className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AC0D' }}>Kontakt</div>
              <div className="flex flex-col gap-2.5 text-sm text-white/60">
                <span>{address}</span>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">{phone}</a>
                <a href="https://instagram.com/zrklavice" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@zrklavice</a>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid #262626' }}>
            <span className="text-sm text-white/40">© 2026 ŽRK Lavice Podgorica</span>
            <span className="text-xs text-white/30">Podgorica, Crna Gora</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
