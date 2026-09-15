import Link from 'next/link';
import MatchCountdown from './MatchCountdown';
import { TEAM_META } from '@/lib/teamColors';

/*
 * Crveno-zlatna arena — hero sa tri stanja koja se sama smjenjuju:
 *  - matchday: na dan utakmice Prvog tima (do 2h poslije početka)
 *  - postmatch: 48h poslije posljednjeg rezultata
 *  - manifest: svaki drugi dan
 */

type HeroData = {
  state: 'matchday' | 'postmatch' | 'manifest';
  match?: { title: string; opponent?: string; location?: string; startsAt: string; notes?: string; home: boolean };
  form?: string[]; // npr. ['W','L','L']
  topScorer?: { name: string; goals: number } | null;
  lastResult?: {
    id: string; homeScore: number; awayScore: number; title: string; notes?: string;
    mvp?: { id: string; name: string; goals: number; photoUrl?: string | null; jerseyNumber?: number | null } | null;
  };
  clubStats: { igracica: number; generacije: number };
  nextByTeam: { category: string; label: string; when: string; title: string }[];
};

const Signature = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3.5 mb-6">
    <span className="w-11 h-[3px]" style={{ background: 'linear-gradient(90deg, #C41230, #D4AC0D)' }} />
    <span className="text-[12px] font-bold uppercase" style={{ color: '#D4AC0D', letterSpacing: '0.32em' }}>{text}</span>
  </div>
);

const GenStrip = ({ items }: { items: HeroData['nextByTeam'] }) => (
  <div className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.09)' }}>
    <div className="max-w-6xl mx-auto grid sm:grid-cols-3">
      {items.map((n, i) => {
        const m = TEAM_META[n.category] || { color: '#8a8a8a' };
        return (
          <Link key={n.category} href="/raspored"
            className="flex items-center gap-3.5 px-5 py-4 hover:bg-white/5 transition-colors"
            style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.09)' : 'none' }}>
            <span className="w-1 h-9 rounded-full shrink-0" style={{ backgroundColor: (m as any).color }} />
            <div className="min-w-0">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.45)' }}>{n.when}</div>
              <div className="text-white font-bold text-sm truncate">{n.title}</div>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
);

export default function ArenaHero({ data }: { data: HeroData }) {
  const bg = { background: 'radial-gradient(120% 130% at 78% -10%, #4a0f1d 0%, #26090f 45%, #141414 100%)' };

  /* ---------- MATCHDAY ---------- */
  if (data.state === 'matchday' && data.match) {
    const m = data.match;
    const [homeName, awayName] = m.home
      ? ['ŽRK Lavice', m.opponent || 'Protivnik']
      : [m.opponent || 'Protivnik', 'ŽRK Lavice'];
    const kickoff = new Date(m.startsAt);
    return (
      <section className="relative overflow-hidden" style={bg}>
        <div aria-hidden className="absolute -right-8 top-0 font-black select-none pointer-events-none leading-none"
          style={{ fontSize: 'clamp(280px, 38vw, 560px)', color: 'transparent', WebkitTextStroke: '2px rgba(212,172,13,0.14)' }}>VS</div>
        <div className="relative max-w-6xl mx-auto px-5 pt-36 pb-20 min-h-[78vh] flex flex-col justify-center">
          <Signature text={`Matchday · ${kickoff.toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', weekday: 'long', hour: '2-digit', minute: '2-digit' })}${m.notes ? ` · ${m.notes}` : ''}`} />
          <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
            <h1 className="font-black uppercase leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)' }}>
              <span className="block" style={{ color: m.home ? '#C41230' : 'rgba(255,255,255,0.85)' }}>{homeName}</span>
              <span className="block text-2xl my-2 font-black" style={{ color: '#D4AC0D' }}>—</span>
              <span className="block" style={{ color: m.home ? 'rgba(255,255,255,0.85)' : '#C41230', textShadow: !m.home ? '0 2px 40px rgba(196,18,48,0.35)' : 'none' }}>{awayName}</span>
            </h1>
            <div className="lg:ml-auto"><MatchCountdown target={m.startsAt} /></div>
          </div>
          <div className="mt-12 flex items-center gap-4 flex-wrap text-sm">
            {m.location && <span style={{ color: 'rgba(255,255,255,0.55)' }}>📍 {m.location}</span>}
            {data.form && data.form.length > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>Forma</span>
                {data.form.map((f, i) => (
                  <span key={i} className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
                    style={{ backgroundColor: f === 'W' ? '#16a34a' : f === 'D' ? '#D4AC0D' : '#dc2626' }}>
                    {f === 'W' ? 'P' : f === 'D' ? 'N' : 'I'}
                  </span>
                ))}
              </span>
            )}
            {data.topScorer && (
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                Najbolji strijelac: <span className="font-bold" style={{ color: '#D4AC0D' }}>{data.topScorer.name} {data.topScorer.goals}</span>
              </span>
            )}
            <Link href="/rezultati" className="font-bold hover:underline" style={{ color: '#D4AC0D' }}>Statistika sezone →</Link>
          </div>
        </div>
        <GenStrip items={data.nextByTeam} />
      </section>
    );
  }

  /* ---------- POSLIJE MEČA ---------- */
  if (data.state === 'postmatch' && data.lastResult) {
    const r = data.lastResult;
    const win = r.homeScore > r.awayScore;
    const draw = r.homeScore === r.awayScore;
    return (
      <section className="relative overflow-hidden" style={bg}>
        <div className="relative max-w-6xl mx-auto px-5 pt-36 pb-20 min-h-[78vh] flex flex-col lg:flex-row lg:items-center gap-12">
          <div className="flex-1">
            <Signature text={`Kraj${r.notes ? ` · ${r.notes.split('·')[0].trim()}` : ''} · ${r.title}`} />
            <div className="flex items-baseline gap-4 md:gap-6">
              <span className="font-black leading-none tracking-tighter text-white" style={{ fontSize: 'clamp(6rem, 15vw, 13rem)' }}>{r.homeScore}</span>
              <span className="font-black" style={{ color: '#C41230', fontSize: 'clamp(3rem, 7vw, 6rem)' }}>:</span>
              <span className="font-black leading-none tracking-tighter" style={{ color: '#D4AC0D', fontSize: 'clamp(6rem, 15vw, 13rem)' }}>{r.awayScore}</span>
            </div>
            <div className="mt-5 text-lg font-bold" style={{ color: win ? '#16a34a' : draw ? '#D4AC0D' : 'rgba(255,255,255,0.7)' }}>
              {win ? 'POBJEDA LAVICA 🦁' : draw ? 'NERIJEŠENO' : 'Idemo dalje — glave gore.'}
            </div>
            <Link href={`/utakmica/${r.id}`} className="inline-block mt-4 font-bold hover:underline" style={{ color: '#D4AC0D' }}>
              Strijelci i sastav →
            </Link>
          </div>

          {r.mvp && (
            <Link href={`/igrac/${r.mvp.id}`} className="block w-full max-w-[360px] rounded-3xl p-7 relative overflow-hidden hover:scale-[1.015] transition-transform"
              style={{ background: 'linear-gradient(160deg, #2a0c14, #1c1c1c)', border: '1px solid rgba(212,172,13,0.3)' }}>
              {r.mvp.jerseyNumber != null && (
                <div aria-hidden className="absolute -right-4 -top-8 font-black leading-none select-none"
                  style={{ fontSize: '220px', color: 'transparent', WebkitTextStroke: '2px rgba(212,172,13,0.15)' }}>{r.mvp.jerseyNumber}</div>
              )}
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] mb-4" style={{ color: '#D4AC0D' }}>Najefikasnija</div>
              {r.mvp.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.mvp.photoUrl} alt={r.mvp.name} className="w-36 aspect-[4/5] rounded-2xl object-cover object-top mb-4 relative" />
              ) : (
                <div className="w-36 aspect-[4/5] rounded-2xl mb-4 relative" style={{ background: 'linear-gradient(180deg,#3a3a3a,#262626)' }} />
              )}
              <div className="font-black text-white uppercase leading-[0.95] text-3xl relative">
                {r.mvp.name.split(' ')[0]}<br />
                <span style={{ color: '#C41230' }}>{r.mvp.name.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className="flex gap-6 mt-4 relative">
                <div>
                  <div className="text-2xl font-black" style={{ color: '#D4AC0D' }}>{r.mvp.goals}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>golova</div>
                </div>
              </div>
            </Link>
          )}
        </div>
        <GenStrip items={data.nextByTeam} />
      </section>
    );
  }

  /* ---------- MANIFEST (običan dan) ---------- */
  return (
    <section className="relative overflow-hidden" style={bg}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.16]" style={{ objectPosition: 'center 18%' }} />
      <div aria-hidden className="absolute left-0 right-0 pointer-events-none" style={{ top: '48%', height: '130px', background: 'linear-gradient(90deg, transparent, rgba(212,172,13,0.09) 30%, rgba(196,18,48,0.10) 70%, transparent)', transform: 'skewY(-3deg)' }} />
      <div className="relative max-w-6xl mx-auto px-5 pt-36 pb-20 min-h-[82vh] flex flex-col justify-center">
        <Signature text="Podgorica, Crna Gora" />
        <h1 className="font-black uppercase leading-[0.88]" style={{ fontSize: 'clamp(3.4rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}>
          <span className="block" style={{ color: 'rgba(255,255,255,0.9)' }}>Stvaramo</span>
          <span className="block" style={{ color: 'transparent', WebkitTextStroke: '2.5px rgba(255,255,255,0.5)' }}>nove</span>
          <span className="block" style={{ background: 'linear-gradient(90deg, #C41230 30%, #D4AC0D)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Lavice.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl max-w-lg font-light" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Razvojni rukometni klub za djevojčice koji vode evropske šampionke i osvajačice jedine olimpijske medalje za Crnu Goru.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a href="#upis" style={{ backgroundColor: '#C41230' }}
            className="px-8 py-4 rounded-full text-white font-bold hover:brightness-110 transition-all shadow-xl shadow-red-900/40">Upiši dijete</a>
          <Link href="/ekipe" style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff' }}
            className="px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">Pogledaj ekipe</Link>
        </div>
        <div className="mt-14 flex gap-12 md:gap-16 flex-wrap">
          {[
            { v: `${data.clubStats.igracica}+`, l: 'djevojčica', gold: false },
            { v: String(data.clubStats.generacije), l: 'generacije', gold: false },
            { v: '2', l: 'lige', gold: true },
          ].map(s => (
            <div key={s.l}>
              <div className="text-4xl md:text-5xl font-black" style={{ color: s.gold ? '#D4AC0D' : '#fff' }}>{s.v}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <GenStrip items={data.nextByTeam} />
    </section>
  );
}
