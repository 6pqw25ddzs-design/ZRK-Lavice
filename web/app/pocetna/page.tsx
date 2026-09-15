import Image from 'next/image';
import UpisForm from '@/components/UpisForm';
import Link from 'next/link';
import ScheduleList from '@/components/ScheduleList';
import CountUp from '@/components/site/CountUp';
import TeamTabs from '@/components/club/TeamTabs';
import ArenaHero from '@/components/ArenaHero';
import { getSponsors, getSettings, getTeams, getPlayers, getSchedule, getNews, getTreneri, getResults } from '@/lib/api';

export const revalidate = 60;
export const metadata = {
  title: 'ŽRK Lavice-UDG Podgorica — Stvaramo nove lavice',
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
  { naslov: 'Mini rukomet', kratko: 'DO 9', uzrast: 'Do 9 godina', cilj: 'Prvi susret sa rukometom kroz igru, pokret i zabavu.', treninzi: '3 treninga sedmično' },
  { naslov: 'Pionirska selekcija', kratko: '10–13', uzrast: '10–13 godina', cilj: 'Usvajanje tehnike i osnova takmičarskog rukometa.', treninzi: '4 treninga sedmično' },
  { naslov: 'Razvojna takmičarska ekipa', kratko: '14+', uzrast: '14+ godina', cilj: 'Takmičenja u organizovanim ligama i ozbiljan sportski razvoj.', treninzi: '5 treninga sedmično' },
  { naslov: 'Lavice kampovi', kratko: 'SVI', uzrast: 'Svi uzrasti', cilj: 'Ljetnji i praznični kampovi — rukomet, druženje i nova prijateljstva.', treninzi: 'Sezonski' },
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
  const [sponsors, settings, teams, players, schedule, news, treneri, results] = await Promise.all([
    getSponsors().catch(() => []),
    getSettings().catch(() => ({} as Record<string, string>)),
    getTeams().catch(() => []),
    getPlayers().catch(() => []),
    getSchedule().catch(() => []),
    getNews(4).catch(() => []),
    getTreneri().catch(() => []),
    getResults().catch(() => []),
  ]);
  const upcoming = (Array.isArray(schedule) ? schedule : []).slice(0, 5);
  const lastResults = (Array.isArray(results) ? results : []).slice(0, 3);

  // Statistika iz baze (2026 = godina osnivanja, fiksno)
  const brojIgracica = Array.isArray(players) ? players.length : 0;
  const brojEkipa = Array.isArray(teams) ? teams.length : 0;
  const brojTrenera = (Array.isArray(treneri) && treneri.length > 0)
    ? treneri.length
    : (Array.isArray(teams)
        ? new Set(teams.flatMap((t: any) => (t.coaches || []).map((c: any) => c.userId || c.id))).size
        : 0);
  // --- ArenaHero: tri stanja (matchday / postmatch / manifest) ---
  const API = 'https://zrk-lavice-api.onrender.com';
  const firstTeam = (teams as any[]).find(t => t.category === 'prva_liga');
  const stats = firstTeam
    ? await fetch(`${API}/api/stats?teamId=${firstTeam.id}`, { next: { revalidate: 120 } })
        .then(r => (r.ok ? r.json() : null)).catch(() => null)
    : null;

  const now = Date.now();
  const dayPG = (d: string | Date) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Podgorica' });
  const today = dayPG(new Date());

  const ftMatches = (Array.isArray(schedule) ? schedule : [])
    .filter((e: any) => e.type === 'match' && e.team?.category === 'prva_liga');
  const matchdayEvent = ftMatches.find((e: any) =>
    dayPG(e.startsAt) === today && now < new Date(e.startsAt).getTime() + 2 * 3600_000);

  const ftResults = (Array.isArray(results) ? results : [])
    .filter((r: any) => r.event?.team?.category === 'prva_liga');
  const freshResult = ftResults.find((r: any) =>
    now - new Date(r.event?.startsAt).getTime() < 48 * 3600_000 && now > new Date(r.event?.startsAt).getTime());

  let mvp: any = null;
  if (freshResult?.scorers && typeof freshResult.scorers === 'object') {
    const [pid, g] = Object.entries(freshResult.scorers as Record<string, number>)
      .sort((a: any, b: any) => b[1] - a[1])[0] || [];
    const pl = (players as any[]).find(p => p.id === pid);
    if (pl && g) mvp = { id: pid, name: `${pl.firstName} ${pl.lastName}`.trim(), goals: Number(g), photoUrl: pl.photoUrl, jerseyNumber: pl.jerseyNumber };
  }

  const form = ftResults.slice(0, 5).reverse().map((r: any) =>
    r.homeScore > r.awayScore ? 'W' : r.homeScore === r.awayScore ? 'D' : 'L');
  const topS = stats?.scorers?.[0];

  const nextByTeam = ['prva_liga', 'pioniri', 'mini'].map(cat => {
    const ev = (Array.isArray(schedule) ? schedule : []).find((e: any) => e.team?.category === cat);
    if (!ev) return null;
    return {
      category: cat,
      label: ev.team?.name || '',
      when: new Date(ev.startsAt).toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }),
      title: ev.title,
    };
  }).filter(Boolean) as any[];

  const heroData = {
    state: (matchdayEvent ? 'matchday' : freshResult ? 'postmatch' : 'manifest') as any,
    match: matchdayEvent ? {
      title: matchdayEvent.title, opponent: matchdayEvent.opponent, location: matchdayEvent.location,
      startsAt: matchdayEvent.startsAt, notes: matchdayEvent.notes,
      home: !(matchdayEvent.title || '').trim().toLowerCase().startsWith((matchdayEvent.opponent || '\u0000').trim().toLowerCase()),
    } : undefined,
    form, topScorer: topS ? { name: `${topS.firstName} ${topS.lastName}`, goals: topS.goals } : null,
    lastResult: freshResult ? {
      id: freshResult.id, homeScore: freshResult.homeScore, awayScore: freshResult.awayScore,
      title: freshResult.event?.title || '', notes: freshResult.notes, mvp,
    } : undefined,
    clubStats: { igracica: brojIgracica, generacije: brojEkipa },
    nextByTeam,
  };

  const email = settings.contact_email || 'info@zrklavice.me';
  const phone = settings.contact_phone || '+382 67 000 000';
  const address = settings.contact_address || 'SC Morača, Podgorica, Crna Gora';

  return (
    <div id="top" style={{ backgroundColor: 'var(--lav-cream)' }}>

      <ArenaHero data={heroData} />

      {/* BROJEVI KLUBA */}
      <section className="py-16" style={{ backgroundColor: 'var(--lav-black)' }}>
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="gold-line mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { v: brojIgracica, l: 'Igračica' },
              { v: brojEkipa, l: 'Ekipe' },
              { v: brojTrenera, l: 'Trenera' },
              { v: 2026, l: 'Osnovano' },
            ].map(st => (
              <div key={st.l}>
                <CountUp value={st.v} className="display nums" style={{ fontSize: 'clamp(3.2rem, 6vw, 5.5rem)', color: 'var(--lav-gold)', lineHeight: 1 }} />
                <div className="eyebrow mt-3">{st.l}</div>
              </div>
            ))}
          </div>
          <div className="gold-line mt-12" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </section>

      {/* OSNIVAČI */}
      <section id="osnivaci" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-maroon)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-6 h-px" style={{ backgroundColor: '#D4AC0D' }} />
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AC0D' }}>Champions legacy</span>
            </div>
            <h2 className="display text-white leading-[0.95]" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)' }}>
              Klub koji vode one koje su<br className="hidden md:block" /> već <span style={{ color: '#C41230' }}>pokazale put.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Evropske šampionke i olimpijske medaljistkinje crnogorskog rukometa danas svoje znanje, iskustvo i vrijednosti prenose na najmlađe.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-5">
            {OSNIVACI.slice(0, 2).map(o => (
              <div key={o.ime} className="rounded-xl overflow-hidden group" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.foto} alt={o.ime} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,11,16,0.94) 0%, rgba(28,11,16,0.25) 50%, transparent)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="display text-white text-3xl leading-none">{o.ime}</h3>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--lav-gold)' }}>{o.uloga}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>{o.bio}</p>
                  <p className="text-xs mt-4 pt-4" style={{ color: 'var(--lav-gold)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>{o.ref}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid sm:grid-cols-3 gap-5">
            {OSNIVACI.slice(2).map(o => (
              <div key={o.ime} className="rounded-xl overflow-hidden group" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.foto} alt={o.ime} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,11,16,0.94) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="display text-white text-2xl leading-none">{o.ime}</h3>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--lav-gold)' }}>{o.uloga}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O KLUBU + VRIJEDNOSTI */}
      <section id="o-klubu" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-cream)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-2xl">
            <GoldLine />
            <h2 className="mt-5 display text-4xl md:text-6xl"  style={{ color: '#1A1A1A' }}>
              Više od kluba — zajednica koja gradi šampionke
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: '#5b5b5b' }}>
              ŽRK Lavice je razvojni ženski rukometni klub nastao iz ljubavi prema rukometu i uvjerenja da nove generacije
              djevojčica zaslužuju kvalitetno, zdravo i podsticajno okruženje. Kroz sport gradimo ne samo igračke sposobnosti,
              već i vrijednosti koje djevojčice nose kroz cijeli život.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-x-14 gap-y-10 max-w-4xl">
            {VRIJEDNOSTI.map((v, i) => (
              <div key={v.naslov} className="flex gap-5">
                <span className="display shrink-0" style={{ fontSize: '54px', lineHeight: 0.9, color: 'var(--lav-red)' }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1.5" style={{ color: '#1A1A1A' }}>{v.naslov}</h3>
                  <p className="text-[15px] leading-relaxed" style={{ color: '#5b5b5b' }}>{v.tekst}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="mt-16 max-w-3xl pl-6" style={{ borderLeft: '3px solid var(--lav-gold)' }}>
            <p className="text-xl md:text-2xl font-bold leading-snug" style={{ color: '#1A1A1A' }}>
              „Ne stvaramo samo rukometašice — stvaramo <span style={{ color: 'var(--lav-red)' }}>snažne, samouvjerene djevojke</span> koje znaju svoju vrijednost."
            </p>
          </blockquote>
        </div>
      </section>

      {/* PROGRAMI */}
      <section id="programi" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-black)' }}>
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="eyebrow mb-3" style={{ color: 'var(--lav-gold)' }}>Od prvih koraka do takmičenja</div>
          <h2 className="display text-white" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Programi kluba</h2>
          <div className="mt-12 flex flex-col gap-4">
            {PROGRAMI.map(p => (
              <div key={p.naslov} className="rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10 group hover:bg-white/[0.04] transition-colors"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <span className="display nums shrink-0 md:w-[210px]" style={{ color: 'var(--lav-gold)', fontSize: 'clamp(2.6rem, 5vw, 4.2rem)', lineHeight: 0.9 }}>{p.kratko}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-xl">{p.naslov}</h3>
                  <p className="mt-1.5 text-[15px]" style={{ color: 'var(--lav-grey-400)' }}>{p.cilj} · {p.treninzi}</p>
                </div>
                <a href="#upis" className="font-bold text-sm whitespace-nowrap shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--lav-red)' }}>
                  Prijavi se na probni trening →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EKIPE */}
      {teams.length > 0 && (
        <section id="ekipe" className="py-20 md:py-28 relative overflow-hidden" style={{ backgroundColor: 'var(--lav-maroon)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tim/ekipa-2026.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.35]" />
          <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(28,11,16,0.93), rgba(28,11,16,0.97))' }} />
          <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
            <div className="eyebrow mb-3" style={{ color: 'var(--lav-gold)' }}>Tri generacije, jedan klub</div>
            <h2 className="display text-white mb-12" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Naše ekipe</h2>
            <TeamTabs teams={teams} players={players} />
          </div>
        </section>
      )}

      {/* UTAKMICE I STRIJELCI */}
      {lastResults.length > 0 && (
        <section id="utakmice" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-black)' }}>
          <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
              <div>
                <div className="eyebrow mb-3" style={{ color: 'var(--lav-gold)' }}>Prvi tim · sezona 2026/27</div>
                <h2 className="display text-white" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Utakmice i strijelci</h2>
              </div>
              <Link href="/rezultati" className="font-bold text-sm hover:underline" style={{ color: 'var(--lav-red)' }}>Svi rezultati →</Link>
            </div>
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12">
              <div className="flex flex-col">
                {lastResults.map((r: any, i: number) => {
                  const win = r.homeScore > r.awayScore;
                  const draw = r.homeScore === r.awayScore;
                  return (
                    <Link key={r.id} href={`/utakmica/${r.id}`}
                      className="flex items-center gap-5 py-6 group hover:bg-white/[0.03] transition-colors px-2 -mx-2 rounded-lg"
                      style={{ borderBottom: i < lastResults.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                      <span className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: win ? '#2ebd6b' : draw ? 'var(--lav-gold)' : 'var(--lav-red)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold leading-tight">{r.event?.title}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--lav-grey-400)' }}>
                          {r.event?.startsAt && new Date(r.event.startsAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long' })}
                          {r.event?.team?.name ? ` · ${r.event.team.name}` : ''}
                        </div>
                      </div>
                      <span className="display nums text-4xl shrink-0" style={{ color: 'var(--lav-gold)' }}>{r.homeScore} : {r.awayScore}</span>
                    </Link>
                  );
                })}
              </div>
              {stats?.scorers?.length > 0 && (
                <div>
                  <div className="eyebrow mb-5">Lista strijelaca</div>
                  <div className="flex flex-col">
                    {stats.scorers.slice(0, 5).map((sc: any, i: number) => (
                      <Link key={sc.playerId} href={`/igrac/${sc.playerId}`}
                        className="relative flex items-center gap-4 py-4 overflow-hidden group hover:bg-white/[0.03] px-2 -mx-2 rounded-lg transition-colors"
                        style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                        <span aria-hidden className="display absolute -right-1 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none"
                          style={{ fontSize: '84px', color: 'rgba(212,172,13,0.07)' }}>{sc.jerseyNumber ?? ''}</span>
                        <span className="display text-xl w-7 text-center" style={{ color: i < 3 ? 'var(--lav-gold)' : 'var(--lav-grey-400)' }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-[15px]">{sc.firstName} {sc.lastName}</div>
                          <div className="text-xs" style={{ color: 'var(--lav-grey-400)' }}>{sc.matches} utakmica</div>
                        </div>
                        <span className="display nums text-3xl" style={{ color: 'var(--lav-gold)' }}>{sc.goals}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RASPORED */}
      {upcoming.length > 0 && (
        <section id="raspored" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-maroon)' }}>
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="eyebrow mb-3" style={{ color: 'var(--lav-gold)' }}>Naredni termini</div>
            <h2 className="display text-white mb-12" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Raspored</h2>
            <ScheduleList events={upcoming} />
          </div>
        </section>
      )}

      {/* VIJESTI */}
      {news.length > 0 && (
        <section id="vijesti" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-black)' }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-12">
              <div className="max-w-2xl">
                <GoldLine />
                <h2 className="mt-5 display text-white"  style={{ color: '#FFFFFF' }}>Vijesti</h2>
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
                        {new Date(featured.publishedAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>

                  {/* Editorial redovi */}
                  <div className="flex flex-col">
                    {rest.map((a: any, i: number) => (
                      <Link key={a.id} href={`/vijesti/${a.slug}`}
                        className="flex items-center gap-5 py-5 group"
                        style={{ borderBottom: i < rest.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                        <div className="flex-1 min-w-0">
                          {a.tags?.[0] && <div className="text-[10.5px] font-bold tracking-widest mb-1.5" style={{ color: '#C41230' }}>{String(a.tags[0]).toUpperCase()}</div>}
                          <h3 className="font-black leading-snug group-hover:underline" style={{ color: '#FFFFFF' }}>{a.title}</h3>
                          <div className="text-xs mt-2" style={{ color: 'var(--lav-grey-400)' }}>{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long' })}</div>
                        </div>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: 'var(--lav-grey-100)' }}>
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

      {/* ZA RODITELJE */}
      <section id="roditelji" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-cream)' }}>
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
          <div className="lg:sticky lg:top-28">
            <GoldLine />
            <h2 className="mt-5 display text-4xl md:text-6xl"  style={{ color: '#1A1A1A' }}>Za roditelje</h2>
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
              <div key={r.t} className="pl-5 py-1" style={{ borderLeft: '2px solid var(--lav-gold)' }}>
                <h3 className="font-bold mb-1.5" style={{ color: '#1A1A1A' }}>{r.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6a6a6a' }}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PODRŽI KLUB */}
      <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #141414 0%, #3a0e16 100%)' }}>
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#D4AC0D' }}>Budite dio priče</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Podržite Lavice</h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Donacijom ili ulaskom u sponzorski pool direktno pomažete razvoj mladih rukometašica.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/podrzi-nas" style={{ backgroundColor: '#C41230' }}
              className="px-8 py-3.5 rounded-full text-white font-bold hover:brightness-110 transition-all">
              Doniraj klubu
            </Link>
            <Link href="/podrzi-nas" style={{ border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff' }}
              className="px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all">
              Sponzorski pool
            </Link>
            <Link href="/clanstvo" style={{ border: '1.5px solid #D4AC0D', color: '#D4AC0D' }}
              className="px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all">
              Postani član kluba
            </Link>
          </div>
        </div>
      </section>

      {/* PARTNERI */}
      {sponsors.length > 0 && (
        <section className="py-16" style={{ backgroundColor: 'var(--lav-black)' }}>
          <div className="max-w-6xl mx-auto px-5 text-center">
            {/* Zlatni = generalni sponzor: izdvojen, krupan prikaz */}
            {sponsors.filter((s: any) => s.level === 'gold').length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8" style={{ color: 'var(--gold, #A8860B)' }}>Generalni sponzor</p>
                <div className="flex flex-wrap items-center justify-center gap-14">
                  {sponsors.filter((s: any) => s.level === 'gold').map((s: any) => (
                    <a key={s.id} href={s.websiteUrl || '#'} target="_blank" rel="noopener noreferrer"
                      className="inline-flex flex-col items-center gap-4 group">
                      {s.logoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={s.logoUrl} alt={s.name} className="h-24 md:h-28 object-contain bg-white rounded-2xl p-4 transition-transform group-hover:scale-105" />
                        : null}
                      <span className="font-black text-xl md:text-2xl" style={{ color: '#FFFFFF' }}>{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Ostali partneri */}
            {sponsors.filter((s: any) => s.level !== 'gold').length > 0 && (
              <div className="mt-12">
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8" style={{ color: '#8a8a8a' }}>Partneri i sponzori</p>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {sponsors.filter((s: any) => s.level !== 'gold').map((s: any) => (
                    s.logoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img key={s.id} src={s.logoUrl} alt={s.name} className="h-12 object-contain bg-white rounded-xl p-2 opacity-70 hover:opacity-100 transition-opacity" />
                      : <span key={s.id} className="font-black text-lg" style={{ color: '#FFFFFF' }}>{s.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* UPIS / KONTAKT */}
      <section id="upis" className="py-20 md:py-28" style={{ backgroundColor: 'var(--lav-maroon)' }}>
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1fr_0.85fr] gap-12 items-start">
          <div>
            <GoldLine />
            <h2 className="mt-5 display text-4xl md:text-6xl"  style={{ color: '#FFFFFF' }}>Upiši dijete</h2>
            <p className="mt-5 text-lg leading-relaxed mb-8" style={{ color: 'var(--lav-grey-400)' }}>
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

    </div>
  );
}
